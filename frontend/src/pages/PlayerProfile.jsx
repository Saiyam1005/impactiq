import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import GaugeMeter from '../components/GaugeMeter';
import ImpactTrendChart from '../components/ImpactTrendChart';
import InningsTable from '../components/InningsTable';
import RadarChart from '../components/RadarChart';
import BreakdownBar from '../components/BreakdownBar';
import IMBadge from '../components/IMBadge';
import { useIMScore } from '../hooks/useIMScore';
import { getScoreColor } from '../utils/imCalculator';

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
            .catch(() => toast.error('Failed to load player data'))
            .finally(() => setLoading(false));
    }, [id]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast('🔗 Link copied!', {
            style: { background: '#0D1526', color: '#F0F4FF', border: '1px solid #00E5FF', fontFamily: 'DM Sans' },
        });
    };

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
                                    📋 Share Profile
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

                        {/* Radar */}
                        {(tab === 'overview' || tab === 'radar' || window.innerWidth >= 1024) && (
                            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
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
