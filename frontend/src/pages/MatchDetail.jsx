import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiCalendar, FiAward, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { HiOutlineBolt } from 'react-icons/hi2';
import { LuSwords } from 'react-icons/lu';
import axios from 'axios';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

function ScoreHeader({ innings, teamShort, isWinner }) {
    const t = innings?.total || {};
    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${isWinner ? 'bg-cyan/10 border border-cyan/30' : 'bg-bg-primary border border-border-subtle'}`}>
            <span className={`font-display text-2xl ${isWinner ? 'text-cyan' : 'text-text-primary'}`}>{teamShort}</span>
            <span className="font-display text-3xl text-text-primary tabular-nums">
                {t.runs || 0}/{t.wickets || 0}
                <span className="text-sm text-text-secondary ml-2">({t.overs || '0'})</span>
            </span>
        </div>
    );
}

function BattingCard({ batting, teamName }) {
    if (!batting?.length) return null;
    return (
        <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border-subtle bg-bg-primary/50">
                <h3 className="font-display text-sm text-text-primary uppercase tracking-widest">{teamName} — Batting</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-text-muted text-[10px] uppercase tracking-widest border-b border-border-subtle">
                            <th className="text-left px-5 py-2.5">Batter</th>
                            <th className="text-left px-3 py-2.5">Dismissal</th>
                            <th className="text-right px-3 py-2.5">R</th>
                            <th className="text-right px-3 py-2.5">B</th>
                            <th className="text-right px-3 py-2.5">4s</th>
                            <th className="text-right px-3 py-2.5">6s</th>
                            <th className="text-right px-5 py-2.5">SR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batting.map((b, i) => (
                            <tr key={i} className="border-b border-border-subtle/50 hover:bg-bg-primary/30 transition-colors">
                                <td className="px-5 py-2.5 font-medium text-text-primary">{b.name}</td>
                                <td className="px-3 py-2.5 text-text-muted text-xs max-w-[150px] truncate">{b.dismissal}</td>
                                <td className={`px-3 py-2.5 text-right font-display ${b.runs >= 50 ? 'text-gold font-bold' : b.runs >= 30 ? 'text-cyan' : 'text-text-primary'}`}>
                                    {b.runs}
                                </td>
                                <td className="px-3 py-2.5 text-right text-text-secondary">{b.balls}</td>
                                <td className="px-3 py-2.5 text-right text-text-secondary">{b.fours}</td>
                                <td className="px-3 py-2.5 text-right text-text-secondary">{b.sixes}</td>
                                <td className={`px-5 py-2.5 text-right ${b.sr > 150 ? 'text-cyan font-medium' : 'text-text-secondary'}`}>{b.sr}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BowlingCard({ bowling, teamName }) {
    if (!bowling?.length) return null;
    return (
        <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border-subtle bg-bg-primary/50">
                <h3 className="font-display text-sm text-text-primary uppercase tracking-widest">{teamName} — Bowling</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-text-muted text-[10px] uppercase tracking-widest border-b border-border-subtle">
                            <th className="text-left px-5 py-2.5">Bowler</th>
                            <th className="text-right px-3 py-2.5">O</th>
                            <th className="text-right px-3 py-2.5">R</th>
                            <th className="text-right px-3 py-2.5">W</th>
                            <th className="text-right px-5 py-2.5">Econ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bowling.map((b, i) => (
                            <tr key={i} className="border-b border-border-subtle/50 hover:bg-bg-primary/30 transition-colors">
                                <td className="px-5 py-2.5 font-medium text-text-primary">{b.name}</td>
                                <td className="px-3 py-2.5 text-right text-text-secondary">{b.overs}</td>
                                <td className="px-3 py-2.5 text-right text-text-secondary">{b.runs}</td>
                                <td className={`px-3 py-2.5 text-right font-display ${b.wickets >= 3 ? 'text-gold font-bold' : b.wickets >= 2 ? 'text-cyan' : 'text-text-primary'}`}>
                                    {b.wickets}
                                </td>
                                <td className={`px-5 py-2.5 text-right ${b.economy <= 6 ? 'text-green font-medium' : b.economy >= 10 ? 'text-red' : 'text-text-secondary'}`}>
                                    {b.economy}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ImpactBar({ player, rank }) {
    const color = player.im_score >= 70 ? 'bg-cyan' : player.im_score >= 40 ? 'bg-gold' : 'bg-text-secondary';
    return (
        <div className="flex items-center gap-3">
            <span className="text-text-muted text-xs w-5 text-right">#{rank}</span>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary font-medium">{player.name}</span>
                    <span className="text-xs text-text-muted">{player.stat_line} &middot; {player.role}</span>
                </div>
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${player.im_score}%` }}
                        transition={{ duration: 0.8, delay: rank * 0.08 }}
                        className={`h-full rounded-full ${color}`}
                    />
                </div>
            </div>
            <span className="font-display text-lg text-text-primary w-10 text-right">{player.im_score}</span>
        </div>
    );
}

export default function MatchDetail() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/matches/${matchId}`)
            .then(res => setMatch(res.data))
            .catch(() => setMatch(null))
            .finally(() => setLoading(false));
    }, [matchId]);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan/30 border-t-cyan rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-muted">Loading match details...</p>
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen pt-20 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="font-display text-3xl text-text-primary mb-4">Match Not Found</h2>
                    <button onClick={() => navigate('/matches')} className="px-6 py-3 bg-cyan text-bg-primary font-bold rounded-xl">
                        Back to Matches
                    </button>
                </div>
            </div>
        );
    }

    const isWinner1 = match.winner === match.team1;
    const isWinner2 = match.winner === match.team2;

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 relative">
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-cyan/5 to-transparent pointer-events-none" />
            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div initial="hidden" animate="show" variants={stagger}>
                    {/* Back button */}
                    <motion.button
                        variants={fadeUp}
                        onClick={() => navigate('/matches')}
                        className="flex items-center gap-2 text-text-secondary hover:text-cyan transition-colors mb-6 text-sm"
                    >
                        <FiArrowLeft /> Back to Matches
                    </motion.button>

                    {/* Match Header */}
                    <motion.div variants={fadeUp} className="bg-gradient-to-br from-[#111E33] to-bg-card border border-border-subtle rounded-2xl p-6 lg:p-8 mb-6 shadow-xl shadow-cyan/5">
                        <div className="flex flex-wrap items-center gap-4 text-text-muted text-xs mb-4">
                            <span className="flex items-center gap-1"><FiCalendar /> {match.date}</span>
                            <span className="flex items-center gap-1"><FiMapPin /> {match.venue}</span>
                            <span>Season {match.season}</span>
                            {match.player_of_match && (
                                <span className="flex items-center gap-1 text-gold">
                                    <FiAward /> POTM: {match.player_of_match}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 mb-4">
                            <ScoreHeader innings={match.innings1} teamShort={match.team1_short} isWinner={isWinner1} />
                            <ScoreHeader innings={match.innings2} teamShort={match.team2_short} isWinner={isWinner2} />
                        </div>

                        <p className="text-cyan font-display text-lg">{match.result}</p>
                        <p className="text-text-muted text-xs mt-1">
                            Toss: {match.toss_winner} chose to {match.toss_decision}
                        </p>
                    </motion.div>

                    {/* Turning Points */}
                    {match.turning_points?.length > 0 && (
                        <motion.div variants={fadeUp} className="mb-6">
                            <h2 className="font-display text-xl text-text-primary mb-4 flex items-center gap-2">
                                <FiActivity className="text-red" /> Match Turning Points
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {match.turning_points.map((tp, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.15 }}
                                        className="bg-gradient-to-br from-[#2D1A1A]/60 to-bg-card border border-red/30 rounded-2xl p-5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red to-transparent" />
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                                                tp.type === 'big_over' ? 'text-cyan border-cyan/30 bg-cyan/10' :
                                                tp.type === 'wicket_cluster' ? 'text-red border-red/30 bg-red/10' :
                                                'text-amber border-amber/30 bg-amber/10'
                                            }`}>
                                                {tp.type === 'big_over' ? '💥' : tp.type === 'wicket_cluster' ? '🎯' : '⚡'} Over {tp.over}
                                            </span>
                                            <span className="text-gold font-display text-sm">Impact: {tp.impact}</span>
                                        </div>
                                        <h4 className="font-display text-text-primary mb-1">{tp.title}</h4>
                                        <p className="text-text-secondary text-xs leading-relaxed">{tp.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Player Impact Rankings */}
                    {match.player_impacts?.length > 0 && (
                        <motion.div variants={fadeUp} className="bg-bg-card border border-border-subtle rounded-2xl p-6 mb-6">
                            <h2 className="font-display text-xl text-text-primary mb-5 flex items-center gap-2">
                                <HiOutlineBolt className="text-gold" /> Player Impact Rankings
                            </h2>
                            <div className="space-y-4">
                                {match.player_impacts.map((p, i) => (
                                    <ImpactBar key={i} player={p} rank={i + 1} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Scorecards */}
                    <motion.div variants={fadeUp} className="mb-6">
                        <h2 className="font-display text-xl text-text-primary mb-4 flex items-center gap-2">
                            <LuSwords className="text-cyan" /> Full Scorecard
                        </h2>
                        <div className="space-y-4">
                            {/* 1st Innings */}
                            <div className="space-y-3">
                                <h3 className="font-display text-text-muted text-sm uppercase tracking-widest">
                                    1st Innings — {match.team1_short} ({match.innings1?.total?.runs}/{match.innings1?.total?.wickets})
                                </h3>
                                <BattingCard batting={match.innings1?.batting} teamName={match.team1_short} />
                                <BowlingCard bowling={match.innings1?.bowling} teamName={match.team2_short} />
                            </div>

                            {/* 2nd Innings */}
                            <div className="space-y-3 mt-6">
                                <h3 className="font-display text-text-muted text-sm uppercase tracking-widest">
                                    2nd Innings — {match.team2_short} ({match.innings2?.total?.runs}/{match.innings2?.total?.wickets})
                                </h3>
                                <BattingCard batting={match.innings2?.batting} teamName={match.team2_short} />
                                <BowlingCard bowling={match.innings2?.bowling} teamName={match.team1_short} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
