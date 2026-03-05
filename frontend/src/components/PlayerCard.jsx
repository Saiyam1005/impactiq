import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getScoreColor, getIMLabel } from '../utils/imCalculator';

export default function PlayerCard({ player }) {
    const navigate = useNavigate();
    const scoreColor = getScoreColor(player.im_score);
    const imLabel = getIMLabel(player.im_score);
    const trend = (player.im_trend || []).slice(-5).map((v, i) => ({ v, i }));

    return (
        <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0,229,255,0.12)' }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(`/players/${player.id}`)}
            className="bg-bg-card border border-border-subtle rounded-2xl p-5 cursor-pointer hover:border-cyan/40 transition-all duration-200 min-w-[240px]"
        >
            <div className="flex items-center gap-3 mb-3">
                {/* Avatar */}
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 shrink-0"
                    style={{ borderColor: scoreColor, color: scoreColor, background: `${scoreColor}15` }}
                >
                    {player.photo_placeholder}
                </div>
                <div className="min-w-0">
                    <h3 className="text-text-primary font-semibold text-sm truncate">{player.name}</h3>
                    <p className="text-text-muted text-xs">{player.flag} {player.country} · {player.role}</p>
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="font-display text-3xl" style={{ color: scoreColor }}>
                        {player.im_score}
                    </div>
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: imLabel.bg, color: imLabel.color }}
                    >
                        {imLabel.label}
                    </span>
                </div>

                {/* Mini sparkline */}
                <div className="w-20 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend}>
                            <Line
                                type="monotone"
                                dataKey="v"
                                stroke={scoreColor}
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
