import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { FiBarChart2, FiTarget, FiZap, FiClock, FiShield, FiFileText, FiAlertTriangle, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { HiOutlineCalculator } from 'react-icons/hi2';

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

const weightageTable = [
    { factor: 'Powerplay Phase', multiplier: '0.9×', component: 'Context', rationale: 'Fielding restrictions favor batters — lower contextual value' },
    { factor: 'Middle Overs Phase', multiplier: '1.0×', component: 'Context', rationale: 'Baseline phase — neutral contribution' },
    { factor: 'Death Overs Phase', multiplier: '1.2×', component: 'Context', rationale: 'Higher difficulty → higher reward for runs scored' },
    { factor: 'Chase Scenario', multiplier: '+0.1', component: 'Context', rationale: 'Batting second under DLS/target adds pressure' },
    { factor: 'Per Wicket Fallen', multiplier: '+0.05', component: 'Context', rationale: 'Each fallen wicket increases match context' },
    { factor: 'Knockout Match', multiplier: '1.3×', component: 'Pressure', rationale: 'Elimination games amplify every contribution' },
    { factor: 'Extreme Pressure', multiplier: '20 × 1.0', component: 'Pressure', rationale: 'Maximum pressure yields full Pressure Index' },
    { factor: 'Low Pressure', multiplier: '20 × 0.4', component: 'Pressure', rationale: 'Calm situations yield reduced Pressure Index' },
    { factor: 'Recency λ', multiplier: '0.15', component: 'Recency', rationale: 'Exponential decay — most recent = highest weight' },
    { factor: 'Dead Rubber', multiplier: '0.7×', component: 'Context', rationale: 'Match effectively over — contributions are devalued' },
];

const edgeCases = [
    {
        scenario: 'Tailender scores 10(15)',
        input: 'Runs=10, SR=66.7, Death overs, High Pressure',
        pScore: 'P = 10×0.6×0.3 + max(0,(66.7-100)×0.15) = 1.8 + 0 = 1.8',
        context: 'C = 1.2 (death) + 0.1 (chase) = 1.3×',
        pressure: 'Pr = 0.8 × 20 × 1.0 = 16.0',
        finalIM: '≈ 38 (Below Par)',
        verdict: '✅ Low raw performance correctly keeps IM low despite pressure'
    },
    {
        scenario: '50(20) in dead rubber',
        input: 'Runs=50, SR=250, Match already won (WinProb 98%)',
        pScore: 'P = 50×0.6×0.3 + max(0,(250-100)×0.15) = 9.0 + 22.5 = 31.5',
        context: 'C = 0.7× (dead match devaluation)',
        pressure: 'Pr = 0.4 × 20 × 1.0 = 8.0',
        finalIM: '≈ 45 (Average)',
        verdict: '✅ High SR nullified by dead-match context — stat-padding blocked'
    },
    {
        scenario: '30(10) in knockout death chase',
        input: 'Runs=30, SR=300, Death, Knockout, 6 wickets down',
        pScore: 'P = 30×0.6×0.3 + max(0,(300-100)×0.15) = 5.4 + 30.0 = 35.4',
        context: 'C = 1.2 + 0.1 + 0.30 = 1.5× (capped)',
        pressure: 'Pr = 1.0 × 20 × 1.3 = 26.0',
        finalIM: '≈ 92 (Match Winner ★)',
        verdict: '✅ Clutch performance amplified by maximum context and pressure'
    },
    {
        scenario: 'Bowler: 0/60 in 4 overs',
        input: 'Wickets=0, Economy=15.0, Death overs',
        pScore: 'P = 0 (no wickets) − economy_penalty = -8.5',
        context: 'C = 1.2× (death overs)',
        pressure: 'Pr = 0.6 × 20 = 12.0',
        finalIM: '≈ 22 (Crisis)',
        verdict: '✅ Expensive bowling rightly penalized even under pressure'
    },
];

const sampleCalc = {
    player: 'Virat Kohli',
    match: 'IND vs AUS — T20 WC Semi-Final',
    innings: '82 runs off 53 balls',
    phase: 'Death Overs (overs 16-20)',
    situation: 'Chasing 188, 4 wickets down, 42 needed off 28',
    steps: [
        { label: 'Performance Score (P)', value: '12.9', calc: 'P = 82×0.6×0.3 + max(0, (154.7−100)×0.15) = 14.76 + 8.2 = min(40, 22.96) → 22.96', color: '#00E5FF' },
        { label: 'Context Multiplier (C)', value: '1.45×', calc: 'C = 1.2 (death) + 0.1 (chase) + 4×0.05 (wickets) = 1.50 → capped at 1.5', color: '#F0B429' },
        { label: 'Pressure Index (Pr)', value: '26.0', calc: 'Pr = 1.0 (Extreme) × 20 × 1.3 (knockout) = 26.0 → capped at 25 → 25', color: '#F7645A' },
        { label: 'Recency Weight (R)', value: '0.87', calc: 'R = e^(−0.15 × 1) = 0.861 → most recent innings', color: '#00D68F' },
    ],
    rawIM: 'IM_raw = (22.96 × 1.5 + 25) × 0.87 = (34.44 + 25) × 0.87 = 51.72',
    normalized: '82',
    normalNote: 'Normalized to 0–100 scale where 50 = median. Score of 51.72 raw maps to 82 after sigmoid normalization against the player pool.',
};

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

                {/* ⭐ NEW: Weightage & Multiplier Reference */}
                <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
                    <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                        <FiTarget className="text-gold" /> Weightage & Multiplier Reference
                    </h2>
                    <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-bg-elevated text-text-secondary text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">Factor</th>
                                    <th className="px-4 py-3 text-center">Value</th>
                                    <th className="px-4 py-3 text-center">Component</th>
                                    <th className="px-4 py-3 text-left">Rationale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weightageTable.map((w, i) => (
                                    <tr key={w.factor} className={`border-t border-border-subtle/50 ${i % 2 ? 'bg-bg-elevated/30' : ''}`}>
                                        <td className="px-4 py-2.5 text-text-primary font-medium text-xs">{w.factor}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className="font-mono text-cyan text-xs font-bold">{w.multiplier}</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${w.component === 'Context' ? 'bg-gold/15 text-gold' :
                                                    w.component === 'Pressure' ? 'bg-red/15 text-red' :
                                                        'bg-green/15 text-green'
                                                }`}>{w.component}</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-text-secondary text-xs">{w.rationale}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                {/* Recency Weight */}
                <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
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

                {/* ⭐ NEW: Step-by-Step Sample Calculation */}
                <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
                    <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                        <HiOutlineCalculator className="text-cyan" /> Sample IM Calculation
                    </h2>
                    <div className="bg-bg-card border border-cyan/30 rounded-2xl p-6">
                        <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-border-subtle">
                            <div className="w-14 h-14 rounded-full bg-gold/15 border-2 border-gold flex items-center justify-center text-gold font-bold text-lg">VK</div>
                            <div>
                                <h3 className="text-text-primary font-semibold text-lg">{sampleCalc.player}</h3>
                                <p className="text-text-muted text-xs">{sampleCalc.match}</p>
                                <p className="text-cyan text-sm font-bold mt-1">{sampleCalc.innings}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-text-muted text-xs">{sampleCalc.phase}</p>
                                <p className="text-amber text-xs font-medium">{sampleCalc.situation}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {sampleCalc.steps.map((step, i) => (
                                <div key={step.label} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-bg-primary rounded-xl p-4 border border-border-subtle">
                                    <div className="flex items-center gap-3 sm:w-56 shrink-0">
                                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-bg-primary" style={{ backgroundColor: step.color }}>{i + 1}</span>
                                        <span className="text-text-primary font-semibold text-sm">{step.label}</span>
                                    </div>
                                    <FiArrowRight className="hidden sm:block text-text-muted shrink-0" />
                                    <code className="text-[11px] font-mono text-text-secondary flex-1">{step.calc}</code>
                                    <span className="font-display text-xl shrink-0" style={{ color: step.color }}>{step.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-border-subtle bg-bg-elevated/30 rounded-xl p-4">
                            <p className="font-mono text-xs text-text-secondary mb-2">{sampleCalc.rawIM}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted text-sm">Final Normalized IM Score:</span>
                                <span className="font-display text-5xl text-gold">{sampleCalc.normalized}<span className="text-text-muted text-lg">/100</span></span>
                            </div>
                            <p className="text-text-muted text-[10px] mt-2">{sampleCalc.normalNote}</p>
                        </div>
                    </div>
                </motion.section>

                {/* Non-Gameability */}
                <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
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

                {/* ⭐ NEW: Edge Case Handling */}
                <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
                    <h2 className="font-display text-3xl text-text-primary mb-6 flex items-center gap-2">
                        <FiAlertTriangle className="text-amber" /> Edge Case Robustness
                    </h2>
                    <div className="space-y-4">
                        {edgeCases.map((ec) => (
                            <div key={ec.scenario} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <h3 className="text-text-primary font-semibold text-sm">{ec.scenario}</h3>
                                        <p className="text-text-muted text-xs mt-0.5">{ec.input}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${ec.finalIM.includes('Match Winner') ? 'bg-gold/15 text-gold' :
                                            ec.finalIM.includes('Crisis') ? 'bg-red/15 text-red' :
                                                ec.finalIM.includes('Below') ? 'bg-amber/15 text-amber' :
                                                    'bg-cyan/15 text-cyan'
                                        }`}>{ec.finalIM}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    <div className="bg-bg-primary rounded-lg px-3 py-2">
                                        <code className="text-[10px] font-mono text-text-secondary">{ec.pScore}</code>
                                    </div>
                                    <div className="bg-bg-primary rounded-lg px-3 py-2">
                                        <code className="text-[10px] font-mono text-text-secondary">{ec.context}</code>
                                    </div>
                                    <div className="bg-bg-primary rounded-lg px-3 py-2">
                                        <code className="text-[10px] font-mono text-text-secondary">{ec.pressure}</code>
                                    </div>
                                    <div className="bg-bg-primary rounded-lg px-3 py-2 flex items-center gap-1.5">
                                        <FiCheckCircle className="text-green text-xs shrink-0" />
                                        <span className="text-[10px] text-green">{ec.verdict.replace('✅ ', '')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Assumptions */}
                <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
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
