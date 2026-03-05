import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import PlayerCard from '../components/PlayerCard';
import { useCountUp } from '../hooks/useIMScore';
import { getLeaderboard } from '../data/staticData';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } } };

function StatCard({ label, target, suffix = '', icon }) {
    const { value, ref } = useCountUp(target, 1500);
    const display = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);
    return (
        <motion.div
            ref={ref}
            variants={fadeUp}
            whileHover={{ scale: 1.03, borderColor: 'rgba(0,229,255,0.3)' }}
            className="bg-bg-card border border-border-subtle rounded-2xl p-6 text-center hover:shadow-lg hover:shadow-cyan/5 transition-all duration-300"
        >
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">{label}</p>
            <p className="font-display text-4xl lg:text-5xl text-text-primary">
                {display.toLocaleString()}{suffix}
            </p>
        </motion.div>
    );
}

export default function Home() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        toast('📊 Scores updated after IND vs AUS · Nov 24', {
            style: { background: '#0D1526', color: '#F0F4FF', border: '1px solid #00E5FF', fontFamily: 'DM Sans' },
            duration: 4000,
        });
        axios.get('/api/leaderboard')
            .then(res => setPlayers(res.data))
            .catch(() => setPlayers(getLeaderboard()))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 dot-grid opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-b from-cyan/[0.03] via-transparent to-bg-primary" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan/[0.04] rounded-full blur-[120px]" />

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="relative z-10 text-center max-w-5xl mx-auto px-4"
                >
                    <motion.p variants={fadeUp} className="text-cyan text-xs sm:text-sm tracking-[0.35em] uppercase font-semibold mb-8">
                        ⚡ The Future of Cricket Analytics
                    </motion.p>

                    <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-7xl lg:text-[100px] leading-[0.92] mb-8">
                        <span className="text-text-primary block">WHO SHOWS UP</span>
                        <span className="text-cyan block mt-1">WHEN IT MATTERS?</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
                        ImpactIQ goes beyond averages and strike rates. Our proprietary Impact Metric reveals
                        who truly performs under pressure, in clutch moments, and in match-defining situations.
                    </motion.p>

                    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="group px-10 py-4 bg-cyan text-bg-primary font-bold rounded-xl hover:bg-cyan/90 transition-all shadow-lg shadow-cyan/25 text-sm relative overflow-hidden"
                        >
                            <span className="relative z-10">Explore Players →</span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                        </button>
                        <button
                            onClick={() => navigate('/methodology')}
                            className="px-10 py-4 border border-border-accent text-text-primary font-semibold rounded-xl hover:bg-bg-card hover:border-cyan/50 transition-all text-sm backdrop-blur-sm"
                        >
                            How It Works
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats */}
            <section className="max-w-6xl mx-auto px-4 pt-12 pb-4 relative z-20">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <StatCard label="Players Tracked" target={287} icon="👤" />
                    <StatCard label="Matches Analyzed" target={1240} icon="🏏" />
                    <StatCard label="Global Avg IM" target={51.3} icon="📊" />
                    <StatCard label="Predictive Accuracy" target={94} suffix="%" icon="🎯" />
                </motion.div>
            </section>

            {/* Top Impact Players */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-8 bg-cyan rounded-full" />
                        <h2 className="font-display text-3xl lg:text-4xl text-text-primary">Top Impact Players</h2>
                    </div>
                    <p className="text-text-secondary text-sm mb-8 ml-5">Players ranked by our proprietary Impact Metric</p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="skeleton h-44 rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {players.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.4 }}
                            >
                                <PlayerCard player={p} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-4 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-bg-card to-bg-elevated border border-border-subtle rounded-2xl p-8 lg:p-12 text-center"
                >
                    <h2 className="font-display text-3xl text-text-primary mb-3">Ready to Dive Deeper?</h2>
                    <p className="text-text-secondary mb-6 max-w-lg mx-auto">Compare players head-to-head, explore the methodology, or watch live impact scores in action.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button onClick={() => navigate('/compare')} className="px-6 py-3 bg-bg-card border border-border-accent rounded-xl text-text-primary text-sm font-medium hover:border-cyan/50 transition-all">
                            ⚔️ Compare Players
                        </button>
                        <button onClick={() => navigate('/live')} className="px-6 py-3 bg-bg-card border border-border-accent rounded-xl text-text-primary text-sm font-medium hover:border-cyan/50 transition-all">
                            🔴 Live Impact
                        </button>
                        <button onClick={() => navigate('/methodology')} className="px-6 py-3 bg-bg-card border border-border-accent rounded-xl text-text-primary text-sm font-medium hover:border-cyan/50 transition-all">
                            📐 Methodology
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
