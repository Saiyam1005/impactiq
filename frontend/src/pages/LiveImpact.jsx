import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiActivity, FiBarChart2 } from 'react-icons/fi';
import { LuFlaskConical, LuRadio } from 'react-icons/lu';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const bowlerNames = { bumrah: 'Bumrah', siraj: 'Siraj', jadeja: 'Jadeja' };
const bowlerOrder = ['bumrah', 'siraj', 'jadeja'];

export default function LiveImpact() {
    const [runsSlider, setRunsSlider] = useState(20);
    const [wicketsSlider, setWicketsSlider] = useState(0);
    const [isKnockout, setIsKnockout] = useState(true);

    const [matchState, setMatchState] = useState({
        indScore: 187,
        indWickets: 4,
        ausScore: 134,
        ausWickets: 6,
        ballsLeft: 21,
        target: 188,
        striker: 'Maxwell',
        currentBowler: 'bumrah',
        maxwell: { runs: 45, balls: 24, im: 88.5 },
        david: { runs: 12, balls: 8, im: 72.1 },
        bumrah: { runs: 22, balls: 18, wickets: 3, im: 94.2 },
        siraj: { runs: 31, balls: 18, wickets: 1, im: 68.7 },
        jadeja: { runs: 24, balls: 24, wickets: 2, im: 76.3 },
        kohli: { runs: 72, balls: 48, im: 85.4 },
        log: "Bumrah is at the top of his mark. 21 balls, 54 to win.",
    });

    useEffect(() => {
        if (matchState.ballsLeft <= 0 || matchState.ausScore >= matchState.target || matchState.ausWickets >= 10) return;

        const timer = setInterval(() => {
            setMatchState(prev => {
                if (prev.ballsLeft <= 0 || prev.ausScore >= prev.target || prev.ausWickets >= 10) return prev;

                const isWicket = Math.random() < 0.08;
                let runs = 0;
                if (!isWicket) {
                    const r = Math.random();
                    if (r < 0.35) runs = 1;
                    else if (r < 0.45) runs = 2;
                    else if (r < 0.60) runs = 4;
                    else if (r < 0.70) runs = 6;
                    else runs = 0;
                }

                const newAusScore = prev.ausScore + runs;
                const newAusWickets = prev.ausWickets + (isWicket ? 1 : 0);
                const newBallsLeft = prev.ballsLeft - 1;

                const strikerKey = prev.striker === 'Maxwell' ? 'maxwell' : 'david';
                const nonStrikerKey = prev.striker === 'Maxwell' ? 'david' : 'maxwell';
                const curBowler = prev.currentBowler;
                const curBowlerName = bowlerNames[curBowler];

                const overNum = 19 - Math.floor(newBallsLeft / 6);
                const ballNum = 6 - (newBallsLeft % 6 === 0 ? 0 : newBallsLeft % 6);
                let logMsg = `${Math.max(16, overNum)}.${ballNum === 0 ? 6 : ballNum} ${curBowlerName} to ${prev.striker}: `;

                if (isWicket) logMsg += `OUT! Clean bowled by ${curBowlerName}! Brilliant delivery!`;
                else if (runs === 4) logMsg += "FOUR! Driven beautifully through the covers.";
                else if (runs === 6) logMsg += "SIX! Massive hit into the stands!";
                else if (runs === 0) logMsg += `Dot ball. Tight from ${curBowlerName}.`;
                else logMsg += `${runs} run${runs > 1 ? 's' : ''} taken.`;

                // Update striker
                const newStrikerData = { ...prev[strikerKey], balls: prev[strikerKey].balls + 1 };
                if (!isWicket) newStrikerData.runs += runs;
                if (isWicket) {
                    newStrikerData.im = Math.max(0, newStrikerData.im - 8);
                } else {
                    newStrikerData.im += (runs === 6 ? 2.5 : runs === 4 ? 1.2 : runs === 1 ? 0 : -0.5);
                }

                // Update current bowler
                const newBowlerData = { ...prev[curBowler], balls: prev[curBowler].balls + 1 };
                newBowlerData.runs += runs;
                if (isWicket) {
                    newBowlerData.wickets += 1;
                    newBowlerData.im += 6.5;
                } else {
                    newBowlerData.im -= (runs >= 4 ? 1.8 : -0.2);
                }

                // Rotate strike
                let nextStriker = prev.striker;
                if (isWicket) {
                    newStrikerData.runs = 0;
                    newStrikerData.balls = 0;
                    newStrikerData.im = 50;
                    logMsg += ` New batter arrives.`;
                } else if (runs % 2 !== 0) {
                    nextStriker = nonStrikerKey === 'maxwell' ? 'Maxwell' : 'David';
                }

                // Rotate bowler at end of over
                let nextBowler = prev.currentBowler;
                if (newBallsLeft % 6 === 0 && newBallsLeft > 0) {
                    nextStriker = nextStriker === 'Maxwell' ? 'David' : 'Maxwell';
                    const currentIdx = bowlerOrder.indexOf(prev.currentBowler);
                    nextBowler = bowlerOrder[(currentIdx + 1) % bowlerOrder.length];
                    logMsg += ` End of over. ${bowlerNames[nextBowler]} to bowl next.`;
                }

                if (newAusScore >= prev.target) {
                    logMsg = `MATCH OVER! Australia wins by ${10 - newAusWickets} wickets!`;
                } else if (newAusWickets >= 10 || newBallsLeft <= 0) {
                    logMsg = `MATCH OVER! India wins by ${prev.target - newAusScore} runs!`;
                }

                return {
                    ...prev,
                    ausScore: newAusScore,
                    ausWickets: newAusWickets,
                    ballsLeft: newBallsLeft,
                    striker: nextStriker,
                    currentBowler: nextBowler,
                    [strikerKey]: newStrikerData,
                    [curBowler]: newBowlerData,
                    log: logMsg
                };
            });
        }, 12000);

        return () => clearInterval(timer);
    }, [matchState.ballsLeft, matchState.ausScore, matchState.ausWickets]);

    // Live Match Calculations
    const formatOvers = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;
    const ausOversPlayed = 120 - matchState.ballsLeft;
    const ausOversStr = formatOvers(ausOversPlayed);

    const reqRuns = matchState.target - matchState.ausScore;
    const isMatchOver = matchState.ballsLeft <= 0 || matchState.ausScore >= matchState.target || matchState.ausWickets >= 10;
    const rrr = isMatchOver || reqRuns <= 0 ? '-' : ((reqRuns / matchState.ballsLeft) * 6).toFixed(1);
    const crr = ((matchState.ausScore / (ausOversPlayed || 1)) * 6).toFixed(1);

    const livePlayers = [
        {
            name: 'Glenn Maxwell',
            contribution: `${matchState.maxwell.runs} runs (${matchState.maxwell.balls}b)`,
            projectedIM: matchState.maxwell.im.toFixed(1),
            status: matchState.striker === 'Maxwell' ? 'Striker' : 'Non-Striker',
            statusIcon: matchState.striker === 'Maxwell' ? '🏏' : '🧍',
            statusColor: matchState.striker === 'Maxwell' ? '#00E5FF' : '#00D68F'
        },
        {
            name: 'Tim David',
            contribution: `${matchState.david.runs} runs (${matchState.david.balls}b)`,
            projectedIM: matchState.david.im.toFixed(1),
            status: matchState.striker === 'David' ? 'Striker' : 'Non-Striker',
            statusIcon: matchState.striker === 'David' ? '🏏' : '🧍',
            statusColor: matchState.striker === 'David' ? '#00E5FF' : '#00D68F'
        },
        {
            name: 'Jasprit Bumrah',
            contribution: `${matchState.bumrah.wickets}/${matchState.bumrah.runs} (${formatOvers(matchState.bumrah.balls)} ov)`,
            projectedIM: matchState.bumrah.im.toFixed(1),
            status: isMatchOver ? 'Done' : matchState.currentBowler === 'bumrah' ? 'Bowling' : 'Resting',
            statusIcon: isMatchOver ? '✓' : matchState.currentBowler === 'bumrah' ? '🔴' : '⏸',
            statusColor: isMatchOver ? '#00D68F' : matchState.currentBowler === 'bumrah' ? '#F7645A' : '#4A5E7A'
        },
        {
            name: 'Mohammed Siraj',
            contribution: `${matchState.siraj.wickets}/${matchState.siraj.runs} (${formatOvers(matchState.siraj.balls)} ov)`,
            projectedIM: matchState.siraj.im.toFixed(1),
            status: isMatchOver ? 'Done' : matchState.currentBowler === 'siraj' ? 'Bowling' : 'Resting',
            statusIcon: isMatchOver ? '✓' : matchState.currentBowler === 'siraj' ? '🔴' : '⏸',
            statusColor: isMatchOver ? '#00D68F' : matchState.currentBowler === 'siraj' ? '#F7645A' : '#4A5E7A'
        },
        {
            name: 'Ravindra Jadeja',
            contribution: `${matchState.jadeja.wickets}/${matchState.jadeja.runs} (${formatOvers(matchState.jadeja.balls)} ov)`,
            projectedIM: matchState.jadeja.im.toFixed(1),
            status: isMatchOver ? 'Done' : matchState.currentBowler === 'jadeja' ? 'Bowling' : 'Resting',
            statusIcon: isMatchOver ? '✓' : matchState.currentBowler === 'jadeja' ? '🔴' : '⏸',
            statusColor: isMatchOver ? '#00D68F' : matchState.currentBowler === 'jadeja' ? '#F7645A' : '#4A5E7A'
        },
        {
            name: 'Virat Kohli',
            contribution: `${matchState.kohli.runs} runs (${matchState.kohli.balls}b)`,
            projectedIM: matchState.kohli.im.toFixed(1),
            status: 'Done',
            statusIcon: '✓',
            statusColor: '#00D68F'
        },
    ];

    // Simulator calculations (Right panel)
    const simulation = useMemo(() => {
        const imDelta = (runsSlider < 15 ? 4.2 : runsSlider < 35 ? 2.1 : -1.8) + (wicketsSlider * 1.5);
        const pressureIdx = Math.min(100, 87 + (wicketsSlider * 3) - (runsSlider > 30 ? 8 : 0));

        return {
            bumrahDelta: imDelta > 0 ? `+${imDelta.toFixed(1)}` : imDelta.toFixed(1),
            bumrahColor: imDelta > 0 ? '#00D68F' : '#F7645A',
            pressureIndex: pressureIdx,
            recommendation: wicketsSlider >= 2
                ? "High-risk situation. Rotate between Bumrah and Siraj for pace, and use Jadeja's spin to slow momentum."
                : runsSlider > 40
                    ? "Batting team in control. Bring Jadeja to vary the pace and save Bumrah for the final over."
                    : "Bumrah should bowl the death overs. Use Siraj in the 18th and Jadeja as the surprise option in the 19th.",
        };
    }, [runsSlider, wicketsSlider, isKnockout]);

    // Live Pressure Index (Connected to match state instead of slider)
    const livePressureBase = 60 + (matchState.ausWickets * 4);
    const reqRateFactor = isMatchOver ? 0 : (parseFloat(rrr) - 8) * 3;
    const livePressurePercent = Math.min(100, Math.max(0, Math.floor(livePressureBase + (reqRateFactor || 0))));

    return (
        <div className="min-h-screen pt-16">
            {/* Live Banner */}
            <div className="bg-amber/10 border-b border-amber/30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${isMatchOver ? 'bg-cyan' : 'bg-red pulse-dot'}`} />
                    <span className={`${isMatchOver ? 'text-cyan' : 'text-red'} font-bold text-sm tracking-wider`}>
                        {isMatchOver ? 'MATCH COMPLETED' : 'LIVE MATCH MODE'}
                    </span>
                    <span className="text-text-muted text-xs ml-auto">
                        {isMatchOver ? 'Final statistics' : `Bowling: ${bowlerNames[matchState.currentBowler]} · Auto-updating every ball`}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Match + Player Table */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Match Card */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show"
                            className="bg-bg-card border border-border-subtle rounded-2xl p-6 relative overflow-hidden"
                        >
                            {!isMatchOver && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red/5 blur-[50px] rounded-full" />
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                {!isMatchOver && (
                                    <span className="bg-red text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">LIVE</span>
                                )}
                                <span className="text-text-primary font-semibold">IND vs AUS — ICC T20 World Cup</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-text-primary opacity-80 font-mono text-lg font-bold">IND: 187/4 <span className="text-text-muted text-xs font-normal">(20 overs)</span></p>
                                    <p className="text-cyan text-2xl font-bold mt-1">AUS: {matchState.ausScore}/{matchState.ausWickets} <span className="text-text-muted text-sm font-normal">({ausOversStr} overs)</span></p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-amber font-semibold text-sm">
                                        {isMatchOver
                                            ? (matchState.ausScore >= matchState.target ? 'Australia won the match!' : 'India won the match!')
                                            : `Required: ${reqRuns} from ${matchState.ballsLeft} balls`}
                                    </p>
                                    <p className="text-text-muted text-xs mt-1">RRR: {rrr} · CRR: {crr}</p>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={matchState.log}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-bg-elevated/40 p-3 rounded-xl mt-6 border border-border-subtle flex items-start gap-3"
                                >
                                    <div className="mt-1">
                                        {isMatchOver ? '🏆' : (matchState.log.includes('OUT') ? '🔴' : matchState.log.includes('FOUR') || matchState.log.includes('SIX') ? '🔥' : '🏏')}
                                    </div>
                                    <span className={`text-sm tracking-wide leading-relaxed ${matchState.log.includes('OUT') ? 'text-red font-semibold' : matchState.log.includes('SIX') ? 'text-cyan font-semibold' : 'text-text-secondary'}`}>
                                        {matchState.log}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Live Player Table */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
                            className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-border-subtle">
                                <h3 className="text-text-primary font-semibold flex items-center gap-2">
                                    <FiBarChart2 className="text-cyan" /> Real-Time Impact Metric Updates
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-bg-elevated text-text-secondary text-xs uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left">Player</th>
                                            <th className="px-5 py-3 text-left">Match Stats</th>
                                            <th className="px-5 py-3 text-center">Live IM</th>
                                            <th className="px-5 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {livePlayers.map((p, i) => (
                                                <motion.tr
                                                    key={p.name}
                                                    layout
                                                    className={`border-t border-border-subtle/50 ${i % 2 ? 'bg-bg-elevated/20' : ''}`}
                                                >
                                                    <td className="px-5 py-3 text-text-primary font-medium">{p.name}</td>
                                                    <td className="px-5 py-3 text-text-secondary">{p.contribution}</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <motion.span
                                                            key={p.projectedIM}
                                                            initial={{ color: '#fff', scale: 1.2 }}
                                                            animate={{ color: '#00E5FF', scale: 1 }}
                                                            className="font-display text-lg inline-block"
                                                        >
                                                            {p.projectedIM}
                                                        </motion.span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className="text-xs font-semibold" style={{ color: p.statusColor }}>
                                                            {p.statusIcon} {p.status}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-5 py-2 text-text-muted text-[10px] border-t border-border-subtle bg-bg-card">
                                IM scores recalculate instantly based on boundaries hit, dots, and wickets fallen under pressure.
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Pressure Meter + Simulator */}
                    <div className="space-y-6">
                        {/* Live Pressure-O-Meter */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
                            className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                        >
                            <h3 className="text-text-primary font-semibold text-sm mb-4 flex items-center gap-2">
                                <FiZap className="text-amber" /> Live Match Pressure
                            </h3>
                            <div className="flex flex-col items-center">
                                <div className="relative w-28 h-48 bg-bg-primary rounded-xl border border-border-subtle overflow-hidden">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-b-lg"
                                        style={{
                                            height: `${livePressurePercent}%`,
                                            background: livePressurePercent > 80
                                                ? 'linear-gradient(to top, #F7645A, #FF6B35)'
                                                : livePressurePercent > 50
                                                    ? 'linear-gradient(to top, #FFAA00, #F0B429)'
                                                    : 'linear-gradient(to top, #00D68F, #00E5FF)',
                                        }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                        <span className="font-display text-4xl text-white drop-shadow-md">{livePressurePercent}</span>
                                        <span className="text-white border-white/20 text-[10px] font-bold tracking-wider drop-shadow border px-2 py-0.5 rounded bg-black/20 mt-1">
                                            {isMatchOver ? 'DONE' : (livePressurePercent > 85 ? 'EXTREME' : livePressurePercent > 70 ? 'HIGH' : 'MEDIUM')}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-text-muted text-xs mt-3 text-center uppercase tracking-wider">Calculated Context Index</p>
                                <div className="mt-3 text-[10px] text-text-muted space-y-1 w-full bg-bg-primary/50 p-3 rounded-lg border border-border-subtle">
                                    <div className="flex justify-between"><span>RRR Deficit</span><span className={rrr > 10 ? 'text-red' : 'text-amber'}>{isMatchOver ? '-' : rrr}</span></div>
                                    <div className="flex justify-between"><span>Wickets Lost</span><span className="text-amber">{matchState.ausWickets}</span></div>
                                    <div className="flex justify-between"><span>Balls Left</span><span className="text-cyan">{matchState.ballsLeft}</span></div>
                                    <div className="flex justify-between"><span>Current Bowler</span><span className="text-cyan">{bowlerNames[matchState.currentBowler]}</span></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* What-If Simulator */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
                            className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                        >
                            <h3 className="text-text-primary font-semibold text-sm mb-4 flex items-center gap-2">
                                <LuFlaskConical className="text-violet" /> Bowling Strategy Simulator
                            </h3>
                            <p className="text-xs text-text-muted mb-4 border-b border-border-subtle pb-3">Test hypothesis: How would the bowling attack's impact change?</p>

                            {/* Slider 1: Runs */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-text-secondary">Runs conceded</span>
                                    <span className="text-cyan font-bold">{runsSlider}</span>
                                </div>
                                <input
                                    type="range" min="0" max="40" value={runsSlider}
                                    onChange={e => setRunsSlider(Number(e.target.value))}
                                    className="w-full h-1.5 bg-bg-primary rounded-full appearance-none outline-none cursor-pointer accent-cyan"
                                />
                            </div>

                            {/* Slider 2: Wickets */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-text-secondary">Wickets taken</span>
                                    <span className="text-amber font-bold">{wicketsSlider}</span>
                                </div>
                                <input
                                    type="range" min="0" max="3" step="1" value={wicketsSlider}
                                    onChange={e => setWicketsSlider(Number(e.target.value))}
                                    className="w-full h-1.5 bg-bg-primary rounded-full appearance-none outline-none cursor-pointer accent-amber"
                                />
                            </div>

                            {/* Output */}
                            <div className="bg-bg-elevated border border-border-accent rounded-xl p-4">
                                <p className="text-text-muted text-xs mb-3">Predicted Outcome:</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-secondary text-xs">Bowling Attack IM Delta</span>
                                        <span className="font-display text-xl" style={{ color: simulation.bumrahColor }}>
                                            {simulation.bumrahDelta}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border-subtle">
                                    <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">AI Recommendation</p>
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
