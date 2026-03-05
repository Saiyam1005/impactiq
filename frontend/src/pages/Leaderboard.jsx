import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import IMBadge from '../components/IMBadge';
import { getLeaderboard } from '../data/staticData';
import { getScoreColor, getIMLabel } from '../utils/imCalculator';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* ─── Podium Card ─── */
function PodiumCard({ player, rank }) {
    const navigate = useNavigate();
    const colors = {
        1: { border: '#F0B429', glow: 'rgba(240,180,41,0.25)', bg: 'linear-gradient(135deg, rgba(240,180,41,0.12), transparent)', label: '🏆' },
        2: { border: '#C0C0C0', glow: 'rgba(192,192,192,0.15)', bg: 'linear-gradient(135deg, rgba(192,192,192,0.08), transparent)', label: '🥈' },
        3: { border: '#CD7F32', glow: 'rgba(205,127,50,0.15)', bg: 'linear-gradient(135deg, rgba(205,127,50,0.08), transparent)', label: '🥉' },
    };
    const c = colors[rank];
    const scoreColor = getScoreColor(player.im_score);
    const isFirst = rank === 1;

    return (
        <motion.div
            whileHover={{ scale: 1.04, y: -4 }}
            transition={{ duration: 0.25 }}
            onClick={() => navigate(`/players/${player.id}`)}
            className={`relative bg-bg-card rounded-2xl cursor-pointer text-center transition-all flex flex-col items-center ${isFirst ? 'py-8 px-6 lg:-mt-6' : 'py-6 px-5'
                }`}
            style={{
                border: `2px solid ${c.border}`,
                boxShadow: `0 0 35px ${c.glow}`,
                background: c.bg,
            }}
        >
            {/* Rank badge */}
            <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                style={{ backgroundColor: c.border, color: '#060B18' }}
            >
                #{rank}
            </div>

            {/* Avatar */}
            <div
                className={`rounded-full flex items-center justify-center font-bold border-[3px] mb-3 ${isFirst ? 'w-24 h-24 text-3xl' : 'w-18 h-18 text-2xl'
                    }`}
                style={{
                    width: isFirst ? 96 : 72,
                    height: isFirst ? 96 : 72,
                    borderColor: c.border,
                    color: scoreColor,
                    background: `${scoreColor}12`,
                    boxShadow: `0 0 25px ${c.glow}`,
                }}
            >
                {player.photo_placeholder}
            </div>

            <h3 className={`text-text-primary font-semibold ${isFirst ? 'text-lg' : 'text-base'}`}>
                {player.name}
            </h3>
            <p className="text-text-muted text-xs mt-0.5">
                {player.flag} {player.country} · {player.role === 'BAT' ? 'Batter' : player.role === 'BOWL' ? 'Bowler' : player.role}
            </p>

            {/* Score */}
            <div
                className={`font-display mt-3 ${isFirst ? 'text-5xl' : 'text-4xl'}`}
                style={{ color: scoreColor }}
            >
                {player.im_score}
            </div>

            {/* Mini sparkline */}
            <div className="w-24 h-10 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(player.im_trend || []).slice(-5).map((v, i) => ({ v, i }))}>
                        <Line type="monotone" dataKey="v" stroke={scoreColor} strokeWidth={1.5} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Trophy for #1 */}
            {isFirst && (
                <div className="mt-2 text-2xl">{c.label}</div>
            )}
        </motion.div>
    );
}

/* ─── Main Leaderboard ─── */
export default function Leaderboard() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/leaderboard')
            .then(res => setPlayers(res.data))
            .catch(() => setPlayers(getLeaderboard()))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let result = players;
        if (roleFilter !== 'ALL') {
            result = result.filter(p => p.role === roleFilter);
        }
        if (search) {
            result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        return result;
    }, [players, roleFilter, search]);

    const roles = [
        { key: 'ALL', label: 'All', icon: '📋' },
        { key: 'BAT', label: 'Batsmen', icon: '🏏' },
        { key: 'BOWL', label: 'Bowlers', icon: '🎳' },
    ];

    if (loading) return (
        <div className="min-h-screen pt-20 px-4 max-w-7xl mx-auto">
            <div className="skeleton h-12 w-64 rounded-xl mb-4" />
            <div className="skeleton h-6 w-96 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-52 rounded-2xl" />)}
            </div>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl mb-3" />)}
        </div>
    );

    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 className="font-display text-4xl lg:text-5xl text-text-primary mb-2">
                        Global Impact Leaderboard
                    </h1>
                    <p className="text-text-secondary text-sm mb-8">
                        Real-time player impact rankings across all formats and tournaments.
                    </p>
                </motion.div>

                {/* Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-bg-card border border-border-subtle rounded-2xl p-4 mb-10 flex flex-wrap items-center gap-3"
                >
                    <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </svg>
                        Filters
                    </span>
                    <div className="h-5 w-px bg-border-subtle" />

                    {/* Role toggles */}
                    <div className="flex bg-bg-primary rounded-xl border border-border-subtle overflow-hidden">
                        {roles.map(r => (
                            <button
                                key={r.key}
                                onClick={() => setRoleFilter(r.key)}
                                className={`px-4 py-2 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${roleFilter === r.key
                                    ? 'bg-cyan text-bg-primary shadow-md shadow-cyan/20'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                                    }`}
                            >
                                <span>{r.icon}</span> {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex-grow max-w-sm ml-auto">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="🔍 Search player..."
                            className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Podium — Top 3 */}
                {filtered.length >= 3 && !search && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 items-end"
                    >
                        <PodiumCard player={filtered[1]} rank={2} />
                        <PodiumCard player={filtered[0]} rank={1} />
                        <PodiumCard player={filtered[2]} rank={3} />
                    </motion.div>
                )}

                {/* Rankings Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden"
                >
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-bg-elevated text-text-secondary text-[11px] uppercase tracking-wider">
                                <th className="px-5 py-3.5 text-left w-20">Rank</th>
                                <th className="px-5 py-3.5 text-left">Player</th>
                                <th className="px-5 py-3.5 text-left hidden sm:table-cell">Role</th>
                                <th className="px-5 py-3.5 text-left">Impact Score</th>
                                <th className="px-5 py-3.5 text-center hidden md:table-cell">Trend</th>
                                <th className="px-5 py-3.5 text-left hidden lg:table-cell">Badges</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(search ? filtered : filtered.slice(3)).map((p, idx) => {
                                const rank = search ? idx + 1 : idx + 4;
                                const scoreColor = getScoreColor(p.im_score);
                                const trend = (p.im_trend || []).slice(-5);
                                const trendDelta = trend.length >= 2 ? trend[trend.length - 1] - trend[trend.length - 2] : 0;
                                const trendData = trend.map((v, i) => ({ v, i }));

                                return (
                                    <motion.tr
                                        key={p.id}
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        onClick={() => navigate(`/players/${p.id}`)}
                                        className="border-t border-border-subtle/40 cursor-pointer hover:bg-bg-elevated/50 hover:border-l-2 hover:border-l-cyan transition-all group"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="font-display text-xl text-text-muted">{rank}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 group-hover:scale-105 transition-transform"
                                                    style={{ borderColor: scoreColor, color: scoreColor, background: `${scoreColor}12` }}
                                                >
                                                    {p.photo_placeholder}
                                                </div>
                                                <div>
                                                    <span className="text-text-primary font-medium block">{p.name}</span>
                                                    <span className="text-text-muted text-xs">{p.flag} {p.country}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 hidden sm:table-cell">
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-bg-elevated text-text-secondary">
                                                {p.role === 'BAT' ? 'Batter' : p.role === 'BOWL' ? 'Bowler' : p.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-display text-xl min-w-[36px]" style={{ color: scoreColor }}>
                                                    {p.im_score}
                                                </span>
                                                <div className="flex-grow max-w-[140px] h-2 bg-bg-primary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${p.im_score}%`,
                                                            backgroundColor: scoreColor,
                                                            boxShadow: `0 0 8px ${scoreColor}40`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="w-16 h-8">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={trendData}>
                                                            <Line type="monotone" dataKey="v" stroke={scoreColor} strokeWidth={1.5} dot={false} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <span className={`text-xs font-bold ${trendDelta > 0 ? 'text-green' : trendDelta < 0 ? 'text-red' : 'text-text-muted'}`}>
                                                    {trendDelta > 0 ? `↗ +${trendDelta}` : trendDelta < 0 ? `↘ ${trendDelta}` : '→ 0'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            <div className="flex gap-1.5">
                                                {(p.badges || []).slice(0, 2).map(b => (
                                                    <IMBadge key={b} badge={b} size="sm" />
                                                ))}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-4xl mb-3">🏏</p>
                            <p className="text-text-secondary font-medium">No players found</p>
                            <p className="text-text-muted text-xs mt-1">Try adjusting your filters or search term</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
