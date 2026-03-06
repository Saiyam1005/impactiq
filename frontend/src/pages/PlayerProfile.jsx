import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getPlayerById, getPlayerInnings } from '../data/staticData';
import GaugeMeter from '../components/GaugeMeter';
import ImpactTrendChart from '../components/ImpactTrendChart';
import InningsTable from '../components/InningsTable';
import RadarChart from '../components/RadarChart';
import BreakdownBar from '../components/BreakdownBar';
import IMBadge from '../components/IMBadge';
import { useIMScore } from '../hooks/useIMScore';
import { getScoreColor } from '../utils/imCalculator';
import { FiTarget, FiActivity, FiCopy } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function PlayerProfile() {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [innings, setInnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const animatedScore = useIMScore(player?.im_score || 0);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get(`/api/players/${id}`),
            axios.get(`/api/players/${id}/innings`),
        ])
            .then(([pRes, iRes]) => {
                setPlayer(pRes.data);
                setInnings(iRes.data);
            })
            .catch(() => {
                const p = getPlayerById(id);
                const i = getPlayerInnings(id);
                if (p) { setPlayer(p); setInnings(i); }
                else toast.error('Player not found');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast('Link copied!', {
            style: { background: '#0D1526', color: '#F0F4FF', border: '1px solid #00E5FF', fontFamily: 'DM Sans' },
        });
    };

    // Clutch Score: % of innings scoring IM > 65 (high-pressure performance)
    const clutchData = useMemo(() => {
        if (!innings.length) return { score: 0, highImpact: 0, total: 0 };
        const highImpact = innings.filter(inn => (inn.im_score || inn.performance_score + inn.context_score + inn.pressure_score) > 55).length;
        return { score: Math.round((highImpact / innings.length) * 100), highImpact, total: innings.length };
    }, [innings]);

    // Consistency Meter: standard deviation of im_trend
    const consistencyData = useMemo(() => {
        const trend = player?.im_trend || [];
        if (trend.length < 2) return { stdDev: 0, label: 'N/A', color: '#4A5E7A', pct: 0 };
        const mean = trend.reduce((a, b) => a + b, 0) / trend.length;
        const variance = trend.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / trend.length;
        const std = Math.sqrt(variance);
        if (std < 5) return { stdDev: std.toFixed(1), label: 'Rock Solid', color: '#00D68F', pct: 15 };
        if (std < 10) return { stdDev: std.toFixed(1), label: 'Steady', color: '#00E5FF', pct: 35 };
        if (std < 15) return { stdDev: std.toFixed(1), label: 'Variable', color: '#FFAA00', pct: 60 };
        return { stdDev: std.toFixed(1), label: 'Volatile', color: '#F7645A', pct: 85 };
    }, [player]);

    if (loading) return (
        <div className="min-h-screen pt-20 px-4 max-w-7xl mx-auto">
            <div className="skeleton h-48 rounded-2xl mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="skeleton h-80 rounded-2xl" />
                <div className="skeleton h-80 rounded-2xl" />
            </div>
        </div>
    );

    if (!player) return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <div className="text-center">
                <p className="text-4xl mb-4">🏏</p>
                <p className="text-text-secondary">Player not found</p>
            </div>
        </div>
    );

    const latestInnings = innings[0] || {};
    const scoreColor = getScoreColor(player.im_score);

    // Radar data
    const playerRadar = player.id === 'virat-kohli'
        ? [84, 80, 88, 79, 76, 83]
        : player.id === 'jasprit-bumrah'
            ? [86, 85, 82, 80, 78, 84]
            : [Math.min(95, player.im_score + 10), player.im_score, Math.min(95, player.im_score + 5),
            Math.max(30, player.im_score - 5), Math.max(30, player.im_score - 2), player.im_score + 3];
    const leagueAvg = [51, 51, 51, 51, 51, 51];

    const tabs = ['overview', 'innings', 'breakdown', 'radar'];

    // Circular progress for clutch score
    const clutchRadius = 38;
    const clutchCircumference = 2 * Math.PI * clutchRadius;
    const clutchOffset = clutchCircumference - (clutchData.score / 100) * clutchCircumference;

    return (
        <div className="min-h-screen pt-16">
            {/* Player Banner */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-bg-card to-bg-elevated border-b border-border-subtle"
            >
                <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                        {/* Left: Player info */}
                        <div className="flex items-center gap-5 flex-1">
                            <div
                                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-bold border-3 shrink-0"
                                style={{
                                    borderColor: scoreColor,
                                    color: scoreColor,
                                    background: `${scoreColor}15`,
                                    boxShadow: `0 0 20px ${scoreColor}30`,
                                }}
                            >
                                {player.photo_placeholder}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="font-display text-3xl lg:text-4xl text-text-primary">{player.name}</h1>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan/20 text-cyan">{player.role}</span>
                                </div>
                                <p className="text-text-secondary text-sm">{player.flag} {player.country}</p>
                                <div className="flex gap-4 mt-3 text-sm">
                                    <span className="text-text-muted">Matches: <span className="text-text-primary font-semibold">{player.matches}</span></span>
                                    <span className="text-text-muted">Avg: <span className="text-text-primary font-semibold">{player.avg}</span></span>
                                    <span className="text-text-muted">SR: <span className="text-text-primary font-semibold">{player.sr}</span></span>
                                    <span className="text-text-muted">HS: <span className="text-text-primary font-semibold">{player.hs}</span></span>
                                </div>
                                <button
                                    onClick={copyLink}
                                    className="mt-3 text-xs text-text-muted hover:text-cyan transition-colors flex items-center gap-1"
                                >
                                    <FiCopy size={12} /> Share Profile
                                </button>
                            </div>
                        </div>

                        {/* Right: Gauge */}
                        <div className="shrink-0">
                            <GaugeMeter score={player.im_score} size={240} />
                            <p className="text-text-muted text-xs text-center mt-2">
                                Rolling Last 10 Innings · Last updated: {latestInnings.match || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Mobile Tabs */}
            <div className="lg:hidden sticky top-16 z-40 bg-bg-primary border-b border-border-subtle">
                <div className="flex">
                    {tabs.map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${tab === t ? 'text-cyan border-b-2 border-cyan' : 'text-text-muted'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - 2/3 */}
                    <div className={`lg:col-span-2 space-y-6 ${tab !== 'overview' && tab !== 'innings' ? 'hidden lg:block' : ''}`}>
                        {(tab === 'overview' || window.innerWidth >= 1024) && (
                            <motion.div variants={fadeUp} initial="hidden" animate="show">
                                <ImpactTrendChart
                                    data={player.im_trend}
                                    matches={innings.map(i => i.match).reverse()}
                                />
                            </motion.div>
                        )}
                        {(tab === 'innings' || tab === 'overview' || window.innerWidth >= 1024) && (
                            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
                                <InningsTable innings={innings} />
                            </motion.div>
                        )}
                    </div>

                    {/* Right column - 1/3 */}
                    <div className={`space-y-6 ${tab !== 'overview' && tab !== 'breakdown' && tab !== 'radar' ? 'hidden lg:block' : ''}`}>
                        {/* Breakdown */}
                        {(tab === 'overview' || tab === 'breakdown' || window.innerWidth >= 1024) && (
                            <motion.div
                                variants={fadeUp} initial="hidden" animate="show"
                                className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                            >
                                <h3 className="text-text-primary font-semibold text-base mb-4">IM Score Breakdown</h3>
                                <BreakdownBar
                                    label="Performance Score"
                                    value={latestInnings.performance_score || 0}
                                    maxValue={40}
                                    color="#00E5FF"
                                    subtext="Raw output adjusted for format and role"
                                />
                                <BreakdownBar
                                    label="Context Multiplier"
                                    value={latestInnings.context_score || 0}
                                    maxValue={35}
                                    color="#F0B429"
                                    subtext="Match situation, phase, chase pressure"
                                />
                                <BreakdownBar
                                    label="Pressure Index"
                                    value={latestInnings.pressure_score || 0}
                                    maxValue={25}
                                    color="#F7645A"
                                    subtext="Opposition strength, tournament stage"
                                />
                                <div className="mt-4 pt-4 border-t border-border-subtle">
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary text-sm font-medium">Total IM</span>
                                        <span className="font-display text-3xl" style={{ color: scoreColor }}>
                                            {player.im_score}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ⭐ NEW: Clutch Performance Score */}
                        {(tab === 'overview' || tab === 'breakdown' || window.innerWidth >= 1024) && (
                            <motion.div
                                variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
                                className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                            >
                                <h3 className="text-text-primary font-semibold text-base mb-4 flex items-center gap-2">
                                    <FiTarget className="text-gold" /> Clutch Performance Score
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="relative shrink-0">
                                        <svg width="96" height="96" viewBox="0 0 96 96">
                                            <circle cx="48" cy="48" r={clutchRadius} fill="none" stroke="#1C2D4A" strokeWidth="6" />
                                            <circle
                                                cx="48" cy="48" r={clutchRadius} fill="none"
                                                stroke={clutchData.score >= 60 ? '#F0B429' : clutchData.score >= 40 ? '#00E5FF' : '#F7645A'}
                                                strokeWidth="6" strokeLinecap="round"
                                                strokeDasharray={clutchCircumference}
                                                strokeDashoffset={clutchOffset}
                                                transform="rotate(-90 48 48)"
                                                className="transition-all duration-1000"
                                            />
                                            <text x="48" y="44" textAnchor="middle" className="font-display" fill="#F0F4FF" fontSize="22">{clutchData.score}%</text>
                                            <text x="48" y="58" textAnchor="middle" fill="#4A5E7A" fontSize="8" fontWeight="600">CLUTCH</text>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-xs leading-relaxed">
                                            <span className="text-text-primary font-bold">{clutchData.highImpact}</span> out of <span className="text-text-primary font-bold">{clutchData.total}</span> innings
                                            resulted in high-impact performances (IM &gt; 55).
                                        </p>
                                        <p className="text-text-muted text-[10px] mt-2">
                                            Measures how often this player delivers when the game demands it most.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ⭐ NEW: Consistency Meter */}
                        {(tab === 'overview' || tab === 'breakdown' || window.innerWidth >= 1024) && (
                            <motion.div
                                variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
                                className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                            >
                                <h3 className="text-text-primary font-semibold text-base mb-4 flex items-center gap-2">
                                    <FiActivity className="text-cyan" /> Consistency Meter
                                </h3>
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-text-muted text-xs">Standard Deviation (σ)</span>
                                        <span className="font-display text-lg" style={{ color: consistencyData.color }}>{consistencyData.stdDev}</span>
                                    </div>
                                    {/* Visual bar */}
                                    <div className="relative h-5 bg-bg-primary rounded-full border border-border-subtle overflow-hidden">
                                        <div className="absolute inset-0 flex">
                                            <div className="h-full bg-green/30 flex-[25]" />
                                            <div className="h-full bg-cyan/20 flex-[25]" />
                                            <div className="h-full bg-amber/20 flex-[25]" />
                                            <div className="h-full bg-red/20 flex-[25]" />
                                        </div>
                                        {/* Pointer */}
                                        <div
                                            className="absolute top-0 h-full w-1 rounded-full transition-all duration-700"
                                            style={{ left: `${consistencyData.pct}%`, backgroundColor: consistencyData.color, boxShadow: `0 0 8px ${consistencyData.color}` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-text-muted mt-1 px-1">
                                        <span>Rock Solid</span>
                                        <span>Steady</span>
                                        <span>Variable</span>
                                        <span>Volatile</span>
                                    </div>
                                </div>
                                <div className="bg-bg-primary rounded-lg p-3 border border-border-subtle">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: consistencyData.color }} />
                                        <span className="text-text-primary font-semibold text-sm">{consistencyData.label}</span>
                                    </div>
                                    <p className="text-text-muted text-[10px] mt-1">
                                        {consistencyData.label === 'Rock Solid' && 'This player delivers consistent performances with minimal variance across innings.'}
                                        {consistencyData.label === 'Steady' && 'Reliable performer with occasional fluctuations. Generally dependable.'}
                                        {consistencyData.label === 'Variable' && 'Performance varies significantly between innings. Can be brilliant or ordinary.'}
                                        {consistencyData.label === 'Volatile' && 'Highly unpredictable — capable of match-winning displays but also very poor outings.'}
                                        {consistencyData.label === 'N/A' && 'Insufficient data to determine consistency.'}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Radar */}
                        {(tab === 'overview' || tab === 'radar' || window.innerWidth >= 1024) && (
                            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.25 }}>
                                <RadarChart
                                    player1Data={playerRadar}
                                    player2Data={leagueAvg}
                                    player1Name={player.name}
                                    player2Name="League Avg"
                                />
                            </motion.div>
                        )}

                        {/* Badges */}
                        <motion.div
                            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}
                            className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                        >
                            <h3 className="text-text-primary font-semibold text-base mb-3">Badges</h3>
                            <div className="flex flex-wrap gap-2">
                                {player.badges?.map(b => (
                                    <IMBadge key={b} badge={b} size="md" />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

