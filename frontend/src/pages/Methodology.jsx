import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { FiBarChart2, FiTarget, FiZap, FiClock, FiShield, FiFileText } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

const recencyData = [
    { label: 'Inn 1', weight: 0.22 }, { label: 'Inn 2', weight: 0.26 },
    { label: 'Inn 3', weight: 0.30 }, { label: 'Inn 4', weight: 0.35 },
    { label: 'Inn 5', weight: 0.41 }, { label: 'Inn 6', weight: 0.47 },
    { label: 'Inn 7', weight: 0.55 }, { label: 'Inn 8', weight: 0.64 },
    { label: 'Inn 9', weight: 0.75 }, { label: 'Inn 10', weight: 0.87 },
];

const pillars = [
    {
        Icon: FiBarChart2, title: 'Performance Score', color: '#00E5FF', max: '0–40',
        inputs: ['Runs scored', 'Strike rate vs format avg', 'Wickets taken (bowlers)', 'Economy rate (bowlers)'],
        formula: 'P = runs × 0.6 × 0.3 + max(0, (SR − 100) × 0.15)',
    },
    {
        Icon: FiTarget, title: 'Context Multiplier', color: '#F0B429', max: '0.7× to 1.5×',
        inputs: ['Match phase (PP/Middle/Death)', 'Chase scenario & RRR', 'Wickets fallen', 'Match importance'],
        formula: 'C = phase_base + chase_bonus + wicket_pressure',
    },
    {
        Icon: FiZap, title: 'Pressure Index', color: '#F7645A', max: '0–25',
        inputs: ['Pressure level (Low→Extreme)', 'Knockout multiplier (1.3×)', 'Opposition ranking', 'Tournament stage'],
        formula: 'Pr = pressure × 20 × knockout_mult',
    },
];

const scenarios = [
    { title: 'Stat Padding Nullified', desc: 'Runs scored when a match is effectively dead (win probability > 95% or < 5%) receive minimal context multiplier (0.7×), reducing their IM contribution by 53%.' },
    { title: 'Milestone Ignorance', desc: 'The 50th run is worth exactly the same as the 49th run. We do not reward arbitrary numerical milestones — only match impact matters.' },
    { title: 'Format Adjustment', desc: 'A T20 50 at SR 180 during a chase > Test 100 at SR 40 on a flat pitch. Context and pressure matter more than raw numbers.' },
];

const assumptions = [
    { variable: 'Pitch Deterioration', limit: 'Linear past Day 3', impact: 'Increases value of late-innings runs/wickets' },
    { variable: 'Player Fatigue', limit: 'Ignored within single T20', impact: 'Neutral. Assumes peak physical capacity' },
    { variable: 'DLS Interruption', limit: 'Recalibrated par score', impact: 'Context multipliers dynamically adjust post-rain' },
    { variable: 'Fielding Impact', limit: 'Excluded (no reliable data)', impact: 'Catches/run-outs not factored — data limitation' },
    { variable: 'Toss Advantage', limit: '5% context modifier', impact: 'Slight context boost for batting-second in chases' },
    { variable: 'Home Advantage', limit: '3% pressure reduction', impact: 'Playing at home reduces effective pressure index' },
];

export default function Methodology() {
    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-12">
                    <p className="text-cyan text-xs tracking-[0.3em] uppercase font-semibold mb-3 flex items-center gap-2">
                        <FiFileText className="text-sm" /> Whitepaper
                    </p>
                    <h1 className="font-display text-5xl text-text-primary mb-4">Methodology & Science</h1>
                    <p className="text-text-secondary leading-relaxed">
                        The mathematics behind the Impact Metric (IM). We strip away the noise of traditional averages
                        to reveal true match-winning contributions.
                    </p>
                </motion.div>

                {/* Core Formula */}
                <motion.section variants={fadeUp} initial="hidden" animate="show" className="mb-16">
                    <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                        <span className="text-cyan">Σ</span> The Core Formula
                    </h2>
                    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 font-mono text-sm leading-loose">
                        <pre className="text-text-primary overflow-x-auto">
                            {`IM_raw = Σᵢ [ Pᵢ × Cᵢ × Prᵢ × Rᵢ ]
         normalized → 0 to 100 scale
         baseline 50 = median player`}
                        </pre>
                        <div className="mt-4 pt-4 border-t border-border-subtle text-text-secondary text-xs space-y-1">
                            <p><span className="text-cyan font-bold">Pᵢ</span> = Performance Score (0–40)</p>
                            <p><span className="text-gold font-bold">Cᵢ</span> = Context Multiplier (0.7× to 1.5×)</p>
                            <p><span className="text-red font-bold">Prᵢ</span> = Pressure Index (0–25)</p>
                            <p><span className="text-green font-bold">Rᵢ</span> = Recency Weight e<sup>−0.15 × age</sup></p>
                        </div>
                    </div>
                </motion.section>

                {/* Three Pillars */}
                <motion.section variants={stagger} initial="hidden" animate="show" className="mb-16">
                    <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                        <span className="text-gold"><FiZap className="inline" /></span> The Three Pillars
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {pillars.map(p => (
                            <motion.div
                                key={p.title}
                                variants={fadeUp}
                                className="bg-bg-card border border-border-subtle rounded-2xl p-5 hover:border-opacity-60 transition-all"
                                style={{ borderTopColor: p.color, borderTopWidth: '3px' }}
                            >
                                <p.Icon className="text-2xl" style={{ color: p.color }} />
                                <h3 className="font-semibold text-text-primary mt-2 text-sm">{p.title}</h3>
                                <p className="text-text-muted text-xs mb-3">Range: {p.max}</p>
                                <ul className="text-text-secondary text-xs space-y-1 mb-3">
                                    {p.inputs.map(i => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-text-muted mt-0.5">•</span>{i}
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-bg-primary rounded-lg px-3 py-2">
                                    <code className="text-[11px] font-mono text-text-secondary">{p.formula}</code>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Recency Weight */}
                <motion.section variants={fadeUp} initial="hidden" animate="show" className="mb-16">
                    <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                        <FiClock className="text-green" /> Recency Weighting
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                Historical data loses predictive power over time. Our model applies an exponential decay
                                function <code className="font-mono text-cyan bg-bg-card px-1.5 py-0.5 rounded text-xs">e^(-λt)</code> to
                                weight recent performances more heavily.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                Recent form heavily influences current valuation, ensuring the metric reflects
                                current capabilities rather than past glories.
                            </p>
                        </div>
                        <div className="bg-bg-card border border-border-subtle rounded-2xl p-4">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={recencyData}>
                                    <CartesianGrid stroke="#1C2D4A" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: '#4A5E7A', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fill: '#4A5E7A', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 1]} />
                                    <Tooltip
                                        contentStyle={{ background: '#131F35', border: '1px solid #1E3A5F', borderRadius: '8px', color: '#F0F4FF', fontSize: 12 }}
                                        formatter={(val) => [val.toFixed(2), 'Weight']}
                                    />
                                    <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                                        {recencyData.map((_, i) => {
                                            const t = i / (recencyData.length - 1);
                                            const r = Math.round(74 + t * (0 - 74));
                                            const g = Math.round(94 + t * (229 - 94));
                                            const b = Math.round(122 + t * (255 - 122));
                                            return <Cell key={i} fill={`rgb(${r},${g},${b})`} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex justify-between text-[10px] text-text-muted px-2">
                                <span>← Oldest</span><span>Latest →</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Non-Gameability */}
                <motion.section variants={stagger} initial="hidden" animate="show" className="mb-16">
                    <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                        <FiShield className="text-violet" /> Non-Gameability Guarantees
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scenarios.map(s => (
                            <motion.div key={s.title} variants={fadeUp}
                                className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                            >
                                <h3 className="text-text-primary font-semibold text-sm mb-2">{s.title}</h3>
                                <p className="text-text-secondary text-xs leading-relaxed">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Assumptions */}
                <motion.section variants={fadeUp} initial="hidden" animate="show">
                    <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                        <FiFileText className="text-amber" /> Design Assumptions
                    </h2>
                    <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-bg-elevated text-text-secondary text-xs uppercase tracking-wider">
                                    <th className="px-5 py-3 text-left">Variable</th>
                                    <th className="px-5 py-3 text-left">Assumption / Limit</th>
                                    <th className="px-5 py-3 text-left">Impact on Model</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assumptions.map((a, i) => (
                                    <tr key={a.variable} className={`border-t border-border-subtle/50 ${i % 2 ? 'bg-bg-elevated/30' : ''}`}>
                                        <td className="px-5 py-3 text-text-primary font-medium">{a.variable}</td>
                                        <td className="px-5 py-3 text-text-secondary">{a.limit}</td>
                                        <td className="px-5 py-3 text-text-secondary">{a.impact}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
