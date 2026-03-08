import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiMapPin } from 'react-icons/fi';
import { HiOutlineBolt } from 'react-icons/hi2';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MatchCard({ match, index = 0 }) {
    const navigate = useNavigate();

    const inn1 = match.innings1?.total || {};
    const inn2 = match.innings2?.total || {};
    const isWinner1 = match.winner === match.team1;
    const isWinner2 = match.winner === match.team2;
    const topImpact = match.top_impact_player;

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            onClick={() => navigate(`/matches/${match.match_id}`)}
            className="group bg-bg-card border border-border-subtle rounded-2xl p-5 hover:border-cyan/40 hover:shadow-lg hover:shadow-cyan/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan/[0.03] rounded-bl-full pointer-events-none" />

            {/* Date & Venue */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
                    {match.date} &middot; Match #{match.match_id?.slice(-4)}
                </span>
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <FiMapPin className="text-xs" /> {match.city || match.venue?.split(',')[0]}
                </span>
            </div>

            {/* Team Scores */}
            <div className="space-y-3 mb-4">
                <div className={`flex items-center justify-between ${isWinner1 ? 'text-text-primary' : 'text-text-secondary'}`}>
                    <div className="flex items-center gap-2">
                        <span className={`font-display text-lg ${isWinner1 ? 'text-cyan' : ''}`}>{match.team1_short}</span>
                    </div>
                    <span className="font-display text-xl tabular-nums">
                        {inn1.runs}/{inn1.wickets} <span className="text-xs text-text-muted">({inn1.overs})</span>
                    </span>
                </div>
                <div className={`flex items-center justify-between ${isWinner2 ? 'text-text-primary' : 'text-text-secondary'}`}>
                    <div className="flex items-center gap-2">
                        <span className={`font-display text-lg ${isWinner2 ? 'text-cyan' : ''}`}>{match.team2_short}</span>
                    </div>
                    <span className="font-display text-xl tabular-nums">
                        {inn2.runs}/{inn2.wickets} <span className="text-xs text-text-muted">({inn2.overs})</span>
                    </span>
                </div>
            </div>

            {/* Result */}
            <div className="text-xs text-cyan font-medium mb-3">{match.result}</div>

            {/* Impact Player Badge */}
            {topImpact && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                        <HiOutlineBolt className="text-gold" />
                        <span className="text-text-muted">Top Impact:</span>
                        <span className="text-text-primary font-medium">{topImpact.name}</span>
                        <span className="text-gold font-bold">{topImpact.im_score}</span>
                    </div>
                    <FiChevronRight className="text-text-muted group-hover:text-cyan transition-colors" />
                </div>
            )}
        </motion.div>
    );
}
