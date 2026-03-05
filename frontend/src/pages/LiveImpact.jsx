import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { calcPerformanceScore, calcContextMultiplier, calcPressureIndex } from '../utils/imCalculator';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const livePlayers = [
    { name: 'Virat Kohli', role: 'BAT', contribution: '72 runs (48b)', projectedIM: 78.2, status: 'Done', statusIcon: '✓', statusColor: '#00D68F' },
    { name: 'Rohit Sharma', role: 'BAT', contribution: '34 runs (22b)', projectedIM: 64.1, status: 'Done', statusIcon: '✓', statusColor: '#00D68F' },
    { name: 'Jasprit Bumrah', role: 'BOWL', contribution: '3/22 (3.3 ov)', projectedIM: 83.1, status: 'Bowling', statusIcon: '🔴', statusColor: '#F7645A' },
    { name: 'Hardik Pandya', role: 'AR', contribution: '28 runs, 1/18', projectedIM: 62.4, status: 'Done', statusIcon: '✓', statusColor: '#00D68F' },
];

export default function LiveImpact() {
    const [runsSlider, setRunsSlider] = useState(20);
    const [wicketsSlider, setWicketsSlider] = useState(0);
    const [isKnockout, setIsKnockout] = useState(true);

    const simulation = useMemo(() => {
        const bumrahPerf = calcPerformanceScore(0, 0, 'BOWL');
        const ctx = calcContextMultiplier('Death', true, runsSlider > 30 ? 4 : 6);
        const pressure = calcPressureIndex(wicketsSlider >= 2 ? 'Extreme' : 'Very High', isKnockout);

        const imDelta = (runsSlider < 15 ? 4.2 : runsSlider < 35 ? 2.1 : -1.8) + (wicketsSlider * 1.5);
        const pressureIdx = Math.min(100, 87 + (wicketsSlider * 3) - (runsSlider > 30 ? 8 : 0));

        return {
            bumrahDelta: imDelta > 0 ? `+${imDelta.toFixed(1)}` : imDelta.toFixed(1),
            bumrahColor: imDelta > 0 ? '#00D68F' : '#F7645A',
            pressureIndex: pressureIdx,
            recommendation: wicketsSlider >= 2
                ? "High-risk situation. Bumrah's death-overs expertise critical — bowl him in 18th and 20th."
                : runsSlider > 40
                    ? "Batting team in control. Spread bowling resources — save Bumrah for key moments."
                    : "Bumrah should bowl the death overs for maximum impact. Pressure scenario favors his skill set.",
        };
    }, [runsSlider, wicketsSlider, isKnockout]);

    const pressurePercent = Math.min(100, 87 + wicketsSlider * 3);

    return (
        <div className="min-h-screen pt-16">
            {/* Live Banner */}
            <div className="bg-amber/10 border-b border-amber/30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-amber rounded-full pulse-dot" />
                    <span className="text-amber font-bold text-sm tracking-wider">LIVE IMPACT MODE</span>
                    <span className="text-text-muted text-xs ml-auto">Auto-updating every ball</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Match + Player Table */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Match Card */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show"
                            className="bg-bg-card border border-border-subtle rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-red text-white text-[10px] font-bold px-2 py-0.5 rounded">LIVE</span>
                                <span className="text-text-primary font-semibold">IND vs AUS — Semi Final</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-cyan font-mono text-lg font-bold">IND: 187/4 <span className="text-text-muted text-xs font-normal">(20 overs)</span></p>
                                    <p className="text-text-secondary text-sm mt-1">AUS: 134/6 <span className="text-text-muted text-xs">(16.3 overs)</span></p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-amber font-semibold text-sm">Required: 54 from 21 balls</p>
                                    <p className="text-text-muted text-xs mt-1">RRR: 15.4 · CRR: 8.1</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center gap-2">
                                <span className="text-red font-bold text-xs">EXTREME</span>
                                <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber to-red rounded-full" style={{ width: '87%' }} />
                                </div>
                                <span className="text-text-muted text-xs">Match Pressure</span>
                            </div>
                        </motion.div>

                        {/* Live Player Table */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
                            className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-border-subtle">
                                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                                    📊 Live Player Impact
                                </h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-bg-elevated text-text-secondary text-xs uppercase tracking-wider">
                                        <th className="px-5 py-3 text-left">Player</th>
                                        <th className="px-5 py-3 text-left">Contribution</th>
                                        <th className="px-5 py-3 text-center">Projected IM</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {livePlayers.map((p, i) => (
                                        <tr key={p.name} className={`border-t border-border-subtle/50 ${i % 2 ? 'bg-bg-elevated/20' : ''}`}>
                                            <td className="px-5 py-3 text-text-primary font-medium">{p.name}</td>
                                            <td className="px-5 py-3 text-text-secondary">{p.contribution}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="font-display text-lg text-cyan">{p.projectedIM}*</span>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="text-xs font-semibold" style={{ color: p.statusColor }}>
                                                    {p.statusIcon} {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-5 py-2 text-text-muted text-[10px] border-t border-border-subtle">
                                * = projected score, updates each ball
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Pressure Meter + Simulator */}
                    <div className="space-y-6">
                        {/* Pressure-O-Meter */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
                            className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                        >
                            <h3 className="text-text-primary font-semibold text-sm mb-4">⚡ Pressure-O-Meter</h3>
                            <div className="flex flex-col items-center">
                                <div className="relative w-28 h-48 bg-bg-primary rounded-xl border border-border-subtle overflow-hidden">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-b-lg"
                                        style={{
                                            height: `${pressurePercent}%`,
                                            background: pressurePercent > 80
                                                ? 'linear-gradient(to top, #F7645A, #FF6B35)'
                                                : pressurePercent > 50
                                                    ? 'linear-gradient(to top, #FFAA00, #F0B429)'
                                                    : 'linear-gradient(to top, #00D68F, #00E5FF)',
                                        }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                        <span className="font-display text-4xl text-text-primary drop-shadow-lg">{pressurePercent}</span>
                                        <span className="text-text-primary text-[10px] font-bold tracking-wider drop-shadow">
                                            {pressurePercent > 85 ? 'EXTREME' : pressurePercent > 70 ? 'HIGH' : 'MEDIUM'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-text-muted text-xs mt-3 text-center uppercase tracking-wider">Match Pressure Index</p>
                                <div className="mt-3 text-[10px] text-text-muted space-y-0.5 w-full">
                                    <div className="flex justify-between"><span>RRR Differential</span><span className="text-red">+7.3</span></div>
                                    <div className="flex justify-between"><span>Wickets Remaining</span><span className="text-amber">4</span></div>
                                    <div className="flex justify-between"><span>Overs Left</span><span className="text-amber">3.3</span></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* What-If Simulator */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
                            className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                        >
                            <h3 className="text-text-primary font-semibold text-sm mb-4">🧪 Counterfactual Simulator</h3>

                            {/* Slider 1: Runs */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-text-secondary">Runs in next 3 overs</span>
                                    <span className="text-cyan font-bold">{runsSlider}</span>
                                </div>
                                <input
                                    type="range" min="0" max="60" value={runsSlider}
                                    onChange={e => setRunsSlider(Number(e.target.value))}
                                    className="w-full h-1.5 bg-bg-primary rounded-full appearance-none outline-none cursor-pointer accent-cyan"
                                />
                            </div>

                            {/* Slider 2: Wickets */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-text-secondary">Wickets in next 3 overs</span>
                                    <span className="text-amber font-bold">{wicketsSlider}</span>
                                </div>
                                <input
                                    type="range" min="0" max="3" step="1" value={wicketsSlider}
                                    onChange={e => setWicketsSlider(Number(e.target.value))}
                                    className="w-full h-1.5 bg-bg-primary rounded-full appearance-none outline-none cursor-pointer accent-amber"
                                />
                            </div>

                            {/* Toggle: Knockout */}
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-text-secondary text-xs">Match Importance:</span>
                                <div className="flex bg-bg-primary rounded-lg overflow-hidden border border-border-subtle">
                                    <button
                                        onClick={() => setIsKnockout(false)}
                                        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${!isKnockout ? 'bg-cyan text-bg-primary' : 'text-text-muted'
                                            }`}
                                    >Group</button>
                                    <button
                                        onClick={() => setIsKnockout(true)}
                                        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${isKnockout ? 'bg-cyan text-bg-primary' : 'text-text-muted'
                                            }`}
                                    >Knockout</button>
                                </div>
                            </div>

                            {/* Output */}
                            <div className="bg-bg-elevated border border-border-accent rounded-xl p-4">
                                <p className="text-text-muted text-xs mb-3">If these conditions play out:</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary text-xs">Bumrah's IM impact</span>
                                        <span className="font-display text-xl" style={{ color: simulation.bumrahColor }}>
                                            {simulation.bumrahDelta}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary text-xs">Match pressure index</span>
                                        <span className="font-display text-xl text-amber">{simulation.pressureIndex}</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border-subtle">
                                    <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Recommended Play</p>
                                    <p className="text-text-secondary text-xs leading-relaxed">{simulation.recommendation}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
