import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import { MdSportsCricket } from 'react-icons/md';
import MatchCard from '../components/MatchCard';
import { matchesData } from '../data/staticData';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const TEAMS = ['All', 'CSK', 'MI', 'RCB', 'KKR', 'SRH', 'RR', 'DC', 'PBKS', 'GT', 'LSG'];

export default function Matches() {
    const [season, setSeason] = useState('All');
    const [team, setTeam] = useState('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const PER_PAGE = 24;

    const seasons = useMemo(() => {
        const s = [...new Set(matchesData.map(m => m.season))].sort((a, b) => b.localeCompare(a));
        return ['All', ...s];
    }, []);

    const filtered = useMemo(() => {
        let result = matchesData;
        if (season !== 'All') result = result.filter(m => m.season === season);
        if (team !== 'All') result = result.filter(m => m.team1_short === team || m.team2_short === team);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(m =>
                m.team1.toLowerCase().includes(q) ||
                m.team2.toLowerCase().includes(q) ||
                m.team1_short.toLowerCase().includes(q) ||
                m.team2_short.toLowerCase().includes(q) ||
                (m.player_of_match || '').toLowerCase().includes(q) ||
                (m.city || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [season, team, search]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="min-h-screen pt-20 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div initial="hidden" animate="show" variants={stagger}>
                    {/* Header */}
                    <motion.div variants={fadeUp} className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1 h-8 bg-cyan rounded-full" />
                            <MdSportsCricket className="text-cyan text-2xl" />
                            <h1 className="font-display text-4xl text-text-primary">Past Matches</h1>
                        </div>
                        <p className="text-text-secondary text-sm ml-5">
                            Browse {matchesData.length} IPL matches with full scorecards, impact analysis & turning points
                        </p>
                    </motion.div>

                    {/* Filters */}
                    <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
                        {/* Season */}
                        <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                            <select
                                value={season}
                                onChange={e => { setSeason(e.target.value); setPage(1); }}
                                className="bg-bg-card border border-border-subtle rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary appearance-none cursor-pointer focus:border-cyan focus:outline-none transition-all min-w-[130px]"
                            >
                                {seasons.map(s => <option key={s} value={s}>{s === 'All' ? 'All Seasons' : `IPL ${s}`}</option>)}
                            </select>
                        </div>

                        {/* Team */}
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                            <select
                                value={team}
                                onChange={e => { setTeam(e.target.value); setPage(1); }}
                                className="bg-bg-card border border-border-subtle rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary appearance-none cursor-pointer focus:border-cyan focus:outline-none transition-all min-w-[120px]"
                            >
                                {TEAMS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>)}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search team, player, city..."
                                className="w-full bg-bg-card border border-border-subtle rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center text-text-muted text-sm">
                            {filtered.length} matches
                        </div>
                    </motion.div>

                    {/* Match Grid */}
                    <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {paginated.map((m, i) => (
                            <MatchCard key={m.match_id} match={m} index={i} />
                        ))}
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-4 py-2 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-secondary hover:border-cyan/50 disabled:opacity-30 transition-all"
                            >
                                Prev
                            </button>
                            <span className="text-text-muted text-sm px-4">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="px-4 py-2 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-secondary hover:border-cyan/50 disabled:opacity-30 transition-all"
                            >
                                Next
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
