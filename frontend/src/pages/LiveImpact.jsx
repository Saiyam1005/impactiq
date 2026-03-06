import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiActivity, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { LuFlaskConical, LuRadio } from 'react-icons/lu';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const bowlerNames = { bumrah: 'Bumrah', siraj: 'Siraj', jadeja: 'Jadeja' };
const bowlerOrder = ['bumrah', 'siraj', 'jadeja'];

// AUS batting roster (remaining batsmen after the 6th wicket)
const ausBattingRoster = [
    { name: 'Cameron Green', short: 'Green' },
    { name: 'Pat Cummins', short: 'Cummins' },
    { name: 'Mitchell Starc', short: 'Starc' },
    { name: 'Adam Zampa', short: 'Zampa' },
    { name: 'Josh Hazlewood', short: 'Hazlewood' },
];

function getInitialMatchState() {
    return {
        indScore: 187,
        indWickets: 4,
        ausScore: 0,
        ausWickets: 0,
        ballsLeft: 120, // starts at 120
        target: 188,
        strikerKey: 'bat1',
        nonStrikerKey: 'bat2',
        currentBowler: 'siraj',
        nextBatIdx: 0, 
        bat1: { name: 'David Warner', short: 'Warner', runs: 0, balls: 0, im: 50, out: false },
        bat2: { name: 'Travis Head', short: 'Head', runs: 0, balls: 0, im: 50, out: false },
        dismissed: [],
        bumrah: { runs: 0, balls: 0, wickets: 0, im: 50 },
        siraj: { runs: 0, balls: 0, wickets: 0, im: 50 },
        jadeja: { runs: 0, balls: 0, wickets: 0, im: 50 },
        kohli: { runs: 72, balls: 48, im: 85.4 },
        log: "The chase begins! Warner on strike, Siraj with the new ball.",
        momentumHistory: [{ ball: '0.0', momentum: 0, event: 'start', desc: 'Innings starts. 188 to win.' }],
        turningPoint: null
    };
}

function getSeededRandom(seed) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function simulateBall(prev, cycleId, ballIndex) {
    if (prev.ausScore >= prev.target || prev.ausWickets >= 10 || prev.ballsLeft <= 0) return prev;

    const oversBowled = Math.floor((120 - prev.ballsLeft) / 6);
    let curBowler = 'siraj';
    if (oversBowled % 5 === 0) curBowler = 'siraj';
    else if (oversBowled % 5 === 1) curBowler = 'bumrah';
    else if (oversBowled % 5 === 2) curBowler = 'jadeja';
    else if (oversBowled % 5 === 3) curBowler = 'siraj';
    else if (oversBowled % 5 === 4) curBowler = 'bumrah';

    const rWicket = getSeededRandom(cycleId * 1000 + ballIndex + 1);
    const rRuns = getSeededRandom(cycleId * 1000 + ballIndex + 2);
    
    let reqRate = (prev.target - prev.ausScore) / (prev.ballsLeft / 6);
    let aggressive = reqRate > 10 || prev.ballsLeft < 30;
    
    let isWicket = false;
    let runs = 0;
    
    if (rWicket < (aggressive ? 0.08 : 0.045)) isWicket = true;
    
    if (!isWicket) {
        if (aggressive) {
             if (rRuns < 0.2) runs = 0;
             else if (rRuns < 0.5) runs = 1;
             else if (rRuns < 0.6) runs = 2;
             else if (rRuns < 0.8) runs = 4;
             else runs = 6;
        } else {
             if (rRuns < 0.45) runs = 0;
             else if (rRuns < 0.80) runs = 1;
             else if (rRuns < 0.90) runs = 2;
             else if (rRuns < 0.97) runs = 4;
             else runs = 6;
        }
    }

    const newAusScore = prev.ausScore + runs;
    const newAusWickets = prev.ausWickets + (isWicket ? 1 : 0);
    const newBallsLeft = prev.ballsLeft - 1;

    const sKey = prev.strikerKey;
    const nsKey = prev.nonStrikerKey;
    const curBowlerName = bowlerNames[curBowler];
    const strikerName = prev[sKey].short;

    const overNum = Math.floor((120 - prev.ballsLeft) / 6);
    const ballNum = 6 - (newBallsLeft % 6 === 0 ? 0 : newBallsLeft % 6);
    const ballLabel = `${overNum}.${ballNum === 0 ? 6 : ballNum}`;
    let logMsg = `${ballLabel} ${curBowlerName} to ${strikerName}: `;

    if (isWicket) logMsg += `OUT! Clean bowled by ${curBowlerName}! Brilliant delivery!`;
    else if (runs === 4) logMsg += "FOUR! Driven beautifully through the covers.";
    else if (runs === 6) logMsg += "SIX! Massive hit into the stands!";
    else if (runs === 0) logMsg += `Dot ball. Tight from ${curBowlerName}.`;
    else logMsg += `${runs} run${runs > 1 ? 's' : ''} taken.`;

    const newStrikerData = { ...prev[sKey], balls: prev[sKey].balls + 1 };
    if (!isWicket) newStrikerData.runs += runs;
    if (isWicket) {
        newStrikerData.im = Math.max(0, newStrikerData.im - 8);
    } else {
        newStrikerData.im = Math.min(100, Math.max(0, newStrikerData.im + (runs === 6 ? 2.5 : runs === 4 ? 1.2 : runs === 1 ? -0.2 : -0.8)));
    }

    const newBowlerData = { ...prev[curBowler], balls: prev[curBowler].balls + 1 };
    newBowlerData.runs += runs;
    if (isWicket) {
        newBowlerData.wickets += 1;
        newBowlerData.im = Math.min(100, newBowlerData.im + 6.5);
    } else {
        newBowlerData.im = Math.max(0, newBowlerData.im - (runs >= 4 ? 1.8 : runs === 0 ? 0.5 : -0.2));
    }

    let nextStrikerKey = sKey;
    let nextNonStrikerKey = nsKey;
    let newDismissed = [...prev.dismissed];
    let nextBatIdx = prev.nextBatIdx;
    let newBatEntry = null;

    if (isWicket) {
        newDismissed.push({
            ...prev[sKey],
            bowler: curBowlerName,
        });

        if (nextBatIdx < ausBattingRoster.length) {
            const newBat = ausBattingRoster[nextBatIdx];
            logMsg += ` ${newBat.name} walks in.`;
            newBatEntry = { name: newBat.name, short: newBat.short, runs: 0, balls: 0, im: 50, out: false };
            nextBatIdx++;
        } else {
            logMsg += ` All out!`;
        }
    } else if (runs % 2 !== 0) {
        nextStrikerKey = nsKey;
        nextNonStrikerKey = sKey;
    }

    let nextBowler = curBowler;
    if (newBallsLeft % 6 === 0 && newBallsLeft > 0) {
        if (!isWicket) {
            const tempKey = nextStrikerKey;
            nextStrikerKey = nextNonStrikerKey;
            nextNonStrikerKey = tempKey;
        }
        const oversBowledNext = Math.floor((120 - newBallsLeft) / 6);
        if (oversBowledNext % 5 === 0) nextBowler = 'siraj';
        else if (oversBowledNext % 5 === 1) nextBowler = 'bumrah';
        else if (oversBowledNext % 5 === 2) nextBowler = 'jadeja';
        else if (oversBowledNext % 5 === 3) nextBowler = 'siraj';
        else if (oversBowledNext % 5 === 4) nextBowler = 'bumrah';
        logMsg += ` End of over. ${bowlerNames[nextBowler]} to bowl next.`;
    }

    if (newAusScore >= prev.target) {
        logMsg = `MATCH OVER! Australia wins by ${10 - newAusWickets} wickets!`;
    } else if (newAusWickets >= 10 || newBallsLeft <= 0) {
        logMsg = `MATCH OVER! India wins by ${prev.target - newAusScore} runs!`;
    }

    const reqRunsNow = prev.target - newAusScore;
    const rrrNow = newBallsLeft > 0 ? (reqRunsNow / newBallsLeft) * 6 : 99;
    let momentumDelta = 0;
    if (isWicket) momentumDelta = -15;
    else if (runs === 6) momentumDelta = 12;
    else if (runs === 4) momentumDelta = 7;
    else if (runs === 0) momentumDelta = -3;
    else momentumDelta = 1;

    if (rrrNow > 12) momentumDelta -= 3;
    else if (rrrNow < 7) momentumDelta += 2;

    const eventType = isWicket ? 'wicket' : runs >= 4 ? 'boundary' : runs === 0 ? 'dot' : 'single';
    const shortDesc = isWicket
        ? `${curBowlerName} gets ${strikerName}! Momentum swings to IND.`
        : runs === 6 ? `SIX by ${strikerName}!`
            : runs === 4 ? `FOUR! ${strikerName} finds the gap.`
                : runs === 0 ? `Dot ball. ${curBowlerName} building pressure.`
                    : `${runs} taken. Steady scoring.`;

    const lastMomentum = prev.momentumHistory.length > 0 ? prev.momentumHistory[prev.momentumHistory.length - 1].momentum : 0;
    const newMomentum = Math.max(-50, Math.min(50, lastMomentum + momentumDelta));
    const newEntry = { ball: ballLabel, momentum: newMomentum, event: eventType, desc: shortDesc };
    
    let newTurningPoint = prev.turningPoint;
    if (Math.abs(newMomentum - lastMomentum) >= 12 || (lastMomentum >= 0 && newMomentum < -5) || (lastMomentum <= 0 && newMomentum > 5)) {
        newTurningPoint = { ball: ballLabel, desc: shortDesc, delta: momentumDelta };
    }

    const newMomentumHistory = [...prev.momentumHistory.slice(-15), newEntry];

    const updates = {
        ...prev,
        ausScore: newAusScore,
        ausWickets: newAusWickets,
        ballsLeft: newBallsLeft,
        currentBowler: nextBowler,
        dismissed: newDismissed,
        nextBatIdx,
        [curBowler]: newBowlerData,
        log: logMsg,
        momentumHistory: newMomentumHistory,
        turningPoint: newTurningPoint
    };

    if (isWicket && newBatEntry) {
        updates[sKey] = newBatEntry;
        updates.strikerKey = sKey;
        updates.nonStrikerKey = nsKey;
    } else if (isWicket) {
        updates[sKey] = { ...newStrikerData, out: true };
        updates.strikerKey = sKey;
        updates.nonStrikerKey = nsKey;
    } else {
        updates[sKey] = newStrikerData;
        updates.strikerKey = nextStrikerKey;
        updates.nonStrikerKey = nextNonStrikerKey;
    }

    return updates;
}

function getGlobalMatchState() {
    const CYCLE_MS = 120 * 12000; // 24 minutes per full innings simulation
    const now = Date.now();
    const cycleId = Math.floor(now / CYCLE_MS);
    const msInCycle = now % CYCLE_MS;
    const currentBall = Math.floor(msInCycle / 12000); // 0 to 119
    const nextBallInMs = 12000 - (msInCycle % 12000);

    let state = getInitialMatchState();
    for (let i = 0; i < currentBall && i < 120; i++) {
        state = simulateBall(state, cycleId, i);
        if (state.ausScore >= state.target || state.ausWickets >= 10 || state.ballsLeft <= 0) break;
    }
    
    return { state, nextBallInMs, cycleId, currentBall };
}

export default function LiveImpact() {
    const [runsSlider, setRunsSlider] = useState(20);
    const [wicketsSlider, setWicketsSlider] = useState(0);
    const [isKnockout, setIsKnockout] = useState(true);

    const [matchState, setMatchState] = useState(getGlobalMatchState().state);

    useEffect(() => {
        let timeout;
        function scheduleNext() {
            const { state, nextBallInMs } = getGlobalMatchState();
            setMatchState(state);
            timeout = setTimeout(scheduleNext, nextBallInMs);
        }
        
        const initialDelay = getGlobalMatchState().nextBallInMs;
        timeout = setTimeout(scheduleNext, initialDelay);
        return () => clearTimeout(timeout);
    }, []);

    const momentumHistory = matchState.momentumHistory || [];
    const turningPoint = matchState.turningPoint;
    
    // Live Match Calculations
    const formatOvers = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;
    const ausOversPlayed = 120 - matchState.ballsLeft;
    const ausOversStr = formatOvers(ausOversPlayed);

    const reqRuns = matchState.target - matchState.ausScore;
    const isMatchOver = matchState.ballsLeft <= 0 || matchState.ausScore >= matchState.target || matchState.ausWickets >= 10;
    const rrr = isMatchOver || reqRuns <= 0 ? '-' : ((reqRuns / matchState.ballsLeft) * 6).toFixed(1);
    const crr = ((matchState.ausScore / (ausOversPlayed || 1)) * 6).toFixed(1);

    // Build live player table: current batsmen + dismissed + bowlers + Kohli
    const striker = matchState[matchState.strikerKey];
    const nonStriker = matchState[matchState.nonStrikerKey];

    const livePlayers = [
        // Current batsmen at crease
        {
            name: striker.name,
            contribution: `${striker.runs} runs (${striker.balls}b)`,
            projectedIM: striker.im.toFixed(1),
            status: 'Striker',
            statusIcon: '🏏',
            statusColor: '#00E5FF',
        },
        {
            name: nonStriker.name,
            contribution: `${nonStriker.runs} runs (${nonStriker.balls}b)`,
            projectedIM: nonStriker.im.toFixed(1),
            status: 'Non-Striker',
            statusIcon: '🧍',
            statusColor: '#00D68F',
        },
        // Dismissed batsmen
        ...matchState.dismissed.map(d => ({
            name: d.name,
            contribution: `${d.runs} runs (${d.balls}b)`,
            projectedIM: d.im.toFixed(1),
            status: `c ${d.bowler}`,
            statusIcon: '🔴',
            statusColor: '#F7645A',
        })),
        // Bowlers
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
        // Kohli (already batted)
        {
            name: 'Virat Kohli',
            contribution: `${matchState.kohli.runs} runs (${matchState.kohli.balls}b)`,
            projectedIM: matchState.kohli.im.toFixed(1),
            status: 'Done',
            statusIcon: '✓',
            statusColor: '#00D68F'
        },
    ];

    // Simulator calculations
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

    // Live Pressure Index
    const livePressureBase = 60 + (matchState.ausWickets * 4);
    const reqRateFactor = isMatchOver ? 0 : (parseFloat(rrr) - 8) * 3;
    const livePressurePercent = Math.min(100, Math.max(0, Math.floor(livePressureBase + (reqRateFactor || 0))));

    // Momentum chart dimensions
    const chartW = 480;
    const chartH = 100;
    const momPoints = momentumHistory.map((m, i) => {
        const x = (i / Math.max(1, momentumHistory.length - 1)) * chartW;
        const y = chartH / 2 - (m.momentum / 50) * (chartH / 2);
        return { x, y, ...m };
    });
    const pathD = momPoints.length > 1
        ? `M ${momPoints.map(p => `${p.x},${p.y}`).join(' L ')}`
        : '';

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
                    {/* Left: Match + Player Table + Turning Point */}
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

                        {/* ⭐ NEW: Match Turning Point Detector */}
                        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
                            className="bg-bg-card border border-border-subtle rounded-2xl p-5"
                        >
                            <h3 className="text-text-primary font-semibold flex items-center gap-2 mb-1">
                                <FiTrendingUp className="text-gold" /> Match Turning Point Detector
                            </h3>
                            <p className="text-text-muted text-xs mb-4">
                                Tracks momentum shifts ball-by-ball. Positive = AUS gaining control, Negative = IND in command.
                            </p>

                            {/* Momentum Graph */}
                            <div className="bg-bg-primary rounded-xl border border-border-subtle p-4 overflow-hidden">
                                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-24" preserveAspectRatio="none">
                                    {/* Zero line */}
                                    <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="#1E3A5F" strokeWidth="1" strokeDasharray="4 4" />
                                    {/* Zone labels */}
                                    <text x="4" y="12" fill="#00D68F" fontSize="8" fontWeight="600">AUS ↑</text>
                                    <text x="4" y={chartH - 4} fill="#F7645A" fontSize="8" fontWeight="600">IND ↑</text>

                                    {/* Momentum line */}
                                    {pathD && (
                                        <path d={pathD} fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinejoin="round" />
                                    )}

                                    {/* Event dots */}
                                    {momPoints.map((p, i) => (
                                        <circle
                                            key={i}
                                            cx={p.x} cy={p.y} r={p.event === 'wicket' ? 5 : p.event === 'boundary' ? 4 : 2}
                                            fill={p.event === 'wicket' ? '#F7645A' : p.event === 'boundary' ? '#00E5FF' : '#4A5E7A'}
                                            stroke={p.event === 'wicket' || p.event === 'boundary' ? '#0D1526' : 'none'}
                                            strokeWidth="1.5"
                                        />
                                    ))}
                                </svg>
                                <div className="flex justify-between text-[9px] text-text-muted mt-1">
                                    <span>{momentumHistory[0]?.ball || ''}</span>
                                    <div className="flex gap-3">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red" /> Wicket</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan" /> Boundary</span>
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-text-muted" /> Dot/Single</span>
                                    </div>
                                    <span>{momentumHistory[momentumHistory.length - 1]?.ball || ''}</span>
                                </div>
                            </div>

                            {/* Latest Turning Point */}
                            {turningPoint && (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={turningPoint.ball}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 bg-gold/10 border border-gold/30 rounded-xl p-3 flex items-start gap-3"
                                    >
                                        <FiZap className="text-gold mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-gold text-xs font-bold">Turning Point Detected — Ball {turningPoint.ball}</p>
                                            <p className="text-text-secondary text-xs mt-0.5">{turningPoint.desc}</p>
                                        </div>
                                        <span className={`text-xs font-bold ml-auto ${turningPoint.delta < 0 ? 'text-red' : 'text-green'}`}>
                                            {turningPoint.delta > 0 ? '+' : ''}{turningPoint.delta}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            )}
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
