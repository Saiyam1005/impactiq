import { motion } from 'framer-motion';
import { FiTrendingUp, FiTarget, FiBarChart2, FiCalendar, FiMapPin } from 'react-icons/fi';
import { HiOutlineBolt } from 'react-icons/hi2';
import { LuSwords } from 'react-icons/lu';
import { predictionsData } from '../data/staticData';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };

function WinProbBar({ prob1, prob2, team1, team2 }) {
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-cyan font-bold">{team1} {prob1}%</span>
                <span className="text-amber font-bold">{prob2}% {team2}</span>
            </div>
            <div className="h-3 bg-bg-primary rounded-full overflow-hidden flex">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prob1}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-cyan to-cyan/70 rounded-l-full"
                />
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prob2}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-amber/70 to-amber rounded-r-full"
                />
            </div>
        </div>
    );
}

function H2HRing({ wins1, wins2, total, team1, team2 }) {
    const pct1 = total > 0 ? (wins1 / total) * 100 : 50;
    const dashOffset = 282.7 - (282.7 * pct1) / 100;
    return (
        <div className="relative w-28 h-28 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,170,0,0.2)" strokeWidth="8" />
                <circle
                    cx="50" cy="50" r="45" fill="none" stroke="#00E5FF"
                    strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={dashOffset}
                    strokeLinecap="round" className="transition-all duration-1000"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-text-primary font-display text-lg">{wins1}-{wins2}</span>
                <span className="text-[8px] text-text-muted uppercase font-bold tracking-widest">H2H</span>
            </div>
        </div>
    );
}

function PredictionCard({ pred, index }) {
    const isFav1 = pred.team1_win_prob > pred.team2_win_prob;
    return (
        <motion.div
            variants={fadeUp}
            className="bg-gradient-to-br from-[#111E33] to-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-xl shadow-cyan/5 hover:border-cyan/30 transition-all duration-300"
        >
            {/* Header */}
            <div className="bg-bg-primary/50 px-6 py-3 border-b border-border-subtle flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Upcoming Match #{pred.match_num}</span>
                <span className="flex items-center gap-2 text-xs text-text-muted">
                    <FiCalendar className="text-cyan" /> {pred.date}
                </span>
            </div>

            <div className="p-6">
                {/* Teams */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                        <h3 className={`font-display text-3xl ${isFav1 ? 'text-cyan' : 'text-text-primary'}`}>{pred.team1_short}</h3>
                        <p className="text-text-muted text-[10px] mt-1 uppercase">{pred.team1}</p>
                        <div className="mt-2 flex items-center justify-center gap-1">
                            <FiTrendingUp className={pred.team1_form > 50 ? 'text-green text-xs' : 'text-red text-xs'} />
                            <span className="text-xs text-text-secondary">Form: {pred.team1_form}%</span>
                        </div>
                    </div>

                    <div className="mx-4">
                        <H2HRing
                            wins1={pred.h2h_team1_wins}
                            wins2={pred.h2h_team2_wins}
                            total={pred.h2h_total}
                            team1={pred.team1_short}
                            team2={pred.team2_short}
                        />
                    </div>

                    <div className="text-center flex-1">
                        <h3 className={`font-display text-3xl ${!isFav1 ? 'text-cyan' : 'text-text-primary'}`}>{pred.team2_short}</h3>
                        <p className="text-text-muted text-[10px] mt-1 uppercase">{pred.team2}</p>
                        <div className="mt-2 flex items-center justify-center gap-1">
                            <FiTrendingUp className={pred.team2_form > 50 ? 'text-green text-xs' : 'text-red text-xs'} />
                            <span className="text-xs text-text-secondary">Form: {pred.team2_form}%</span>
                        </div>
                    </div>
                </div>

                {/* Win Probability */}
                <div className="mb-5">
                    <WinProbBar
                        prob1={pred.team1_win_prob}
                        prob2={pred.team2_win_prob}
                        team1={pred.team1_short}
                        team2={pred.team2_short}
                    />
                </div>

                {/* Predicted Winner */}
                <div className="bg-bg-primary rounded-xl p-4 border border-cyan/20 mb-5 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Predicted Winner</p>
                    <p className="font-display text-2xl text-cyan">{pred.predicted_winner_short}</p>
                    <p className="text-xs text-text-secondary mt-1">{pred.predicted_winner}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-bg-primary/50 rounded-xl p-3 border border-border-subtle text-center">
                        <FiBarChart2 className="text-cyan mx-auto mb-1" />
                        <p className="text-[10px] text-text-muted uppercase mb-1">Avg Score</p>
                        <p className="font-display text-text-primary">{pred.team1_avg_score}</p>
                        <p className="text-[9px] text-text-muted">{pred.team1_short}</p>
                    </div>
                    <div className="bg-bg-primary/50 rounded-xl p-3 border border-border-subtle text-center">
                        <FiBarChart2 className="text-amber mx-auto mb-1" />
                        <p className="text-[10px] text-text-muted uppercase mb-1">Avg Score</p>
                        <p className="font-display text-text-primary">{pred.team2_avg_score}</p>
                        <p className="text-[9px] text-text-muted">{pred.team2_short}</p>
                    </div>
                </div>

                {/* Key Players */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 font-bold">{pred.team1_short} Key Players</p>
                        {pred.key_players_team1?.slice(0, 2).map((p, i) => (
                            <div key={i} className="flex items-center justify-between bg-bg-primary/30 px-3 py-1.5 rounded-lg mb-1 border border-border-subtle">
                                <span className="text-xs text-text-primary truncate">{p.name}</span>
                                <span className="text-xs text-cyan font-bold ml-2">{p.form}</span>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 font-bold">{pred.team2_short} Key Players</p>
                        {pred.key_players_team2?.slice(0, 2).map((p, i) => (
                            <div key={i} className="flex items-center justify-between bg-bg-primary/30 px-3 py-1.5 rounded-lg mb-1 border border-border-subtle">
                                <span className="text-xs text-text-primary truncate">{p.name}</span>
                                <span className="text-xs text-amber font-bold ml-2">{p.form}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Venue */}
                <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
                    <FiMapPin className="text-text-secondary" />
                    <span>{pred.venue}</span>
                </div>

                {/* AI Insight */}
                <div className="bg-bg-primary rounded-xl p-4 border border-gold/20">
                    <div className="flex items-center gap-2 mb-2">
                        <HiOutlineBolt className="text-gold" />
                        <span className="text-[10px] text-gold uppercase font-bold tracking-widest">AI Insight</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">{pred.insight}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default function Predictions() {
    return (
        <div className="min-h-screen pt-20 pb-20 px-4 relative">
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div initial="hidden" animate="show" variants={stagger}>
                    {/* Header */}
                    <motion.div variants={fadeUp} className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1 h-8 bg-gold rounded-full" />
                            <FiTarget className="text-gold text-2xl" />
                            <h1 className="font-display text-4xl text-text-primary">Upcoming Match Predictions</h1>
                        </div>
                        <p className="text-text-secondary text-sm ml-5">
                            AI-powered predictions based on {1169} historical IPL matches, team form, head-to-head records & player impact scores
                        </p>
                    </motion.div>

                    {/* Model Info */}
                    <motion.div variants={fadeUp} className="bg-bg-card border border-border-subtle rounded-2xl p-5 mb-8 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-cyan rounded-full" />
                            <span className="text-text-muted text-xs">Team Win Rate (40%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-gold rounded-full" />
                            <span className="text-text-muted text-xs">Head-to-Head (30%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green rounded-full" />
                            <span className="text-text-muted text-xs">Batting Strength (30%)</span>
                        </div>
                        <div className="ml-auto text-text-muted text-xs">
                            Trained on {1169} matches · Seasons 2008–2025
                        </div>
                    </motion.div>

                    {/* Prediction Cards */}
                    <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {predictionsData.map((pred, i) => (
                            <PredictionCard key={pred.match_num} pred={pred} index={i} />
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
