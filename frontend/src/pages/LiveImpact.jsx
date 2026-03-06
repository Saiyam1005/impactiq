import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiActivity, FiTrendingUp, FiPlayCircle, FiPauseCircle, FiClock } from 'react-icons/fi';
import { LuSwords, LuRadio } from 'react-icons/lu';
import wcData from '../data/wc_final_2024_balls.json';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// Generate over buttons 1 to 20
const overButtons = Array.from({ length: 20 }, (_, i) => i + 1);

export default function LiveImpact() {
    const [inning, setInning] = useState('IND');
    // ballIndex refers to index in the 120 balls array (0 to 119)
    const [ballIndex, setBallIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Auto-advance timeline ball by ball every 2.5 seconds giving it a live feel
    useEffect(() => {
        if (!isPlaying) return;
        const timer = setInterval(() => {
            setBallIndex(prev => {
                if (prev < 119) return prev + 1;

                if (inning === 'IND') {
                    setInning('RSA');
                    return 0; // Start over for RSA
                }

                setIsPlaying(false);
                return prev; // End of match
            });
        }, 2500); // 2.5s per ball
        return () => clearInterval(timer);
    }, [isPlaying, inning]);

    const handleOverClick = (inn, overNum) => {
        // user clicked Over 10 for example (1-based), so ball index is (10 - 1) * 6 = 54
        // Start exactly here
        setIsPlaying(true);
        setInning(inn);
        setBallIndex((overNum - 1) * 6);
    };

    const activeTeamData = wcData[inning];
    const target = inning === 'RSA' ? wcData['IND'].balls[119].totalScore + 1 : null;
    const currentBall = activeTeamData.balls[ballIndex] || activeTeamData.balls[0];

    // We calculate RR, RRR
    const oversBowled = currentBall.over + (currentBall.ball / 6);
    const crr = oversBowled > 0 ? (currentBall.totalScore / oversBowled).toFixed(1) : '0.0';

    let rrr = '-';
    let reqRuns = '-';
    if (inning === 'RSA') {
        reqRuns = target - currentBall.totalScore;
        const ballsLeft = 120 - (ballIndex + 1);
        if (ballsLeft > 0 && reqRuns > 0) {
            rrr = ((reqRuns / ballsLeft) * 6).toFixed(1);
        } else if (reqRuns <= 0) {
            rrr = 'Won';
        }
    }

    // Determine runs in current over 
    const currentOverStartIdx = currentBall.over * 6;
    let runsInOver = 0;
    for (let i = currentOverStartIdx; i <= ballIndex; i++) {
        runsInOver += activeTeamData.balls[i].runs;
    }

    // FOW relevant up to this ball
    const fows = [];
    for (let i = 0; i <= ballIndex; i++) {
        if (activeTeamData.balls[i].isWicket) {
            fows.push(activeTeamData.balls[i]);
        }
    }

    // Event text
    const eventText = currentBall.isWicket
        ? `OUT! ${currentBall.playerOut} dismissed by ${currentBall.bowler}`
        : currentBall.runs === 6
            ? "SIX! Massive hit into the stands!"
            : currentBall.runs === 4
                ? "FOUR! Beautiful shot!"
                : currentBall.runs === 0
                    ? "Dot ball. Good pressure from the bowler."
                    : `${currentBall.runs} run${currentBall.runs > 1 ? 's' : ''} taken.`;

    // Identify Turning Point
    let isTurningPoint = false;
    let turningPointText = '';

    if (inning === 'RSA') {
        const last12Balls = activeTeamData.balls.slice(Math.max(0, ballIndex - 12), ballIndex + 1);
        const wicketsInLast2Overs = last12Balls.filter(b => b.isWicket).length;
        const runsInLast2Overs = last12Balls.reduce((sum, b) => sum + b.runs, 0);

        if (wicketsInLast2Overs >= 2) {
            isTurningPoint = true;
            turningPointText = `${wicketsInLast2Overs} wickets fell quickly—India wrests control!`;
        } else if (runsInLast2Overs >= 28) {
            isTurningPoint = true;
            turningPointText = `${runsInLast2Overs} runs in last 12 balls—South Africa dominating the chase!`;
        }

        if (currentBall.isWicket && currentBall.playerOut?.includes('Klaasen')) {
            isTurningPoint = true;
            turningPointText = "KLAASEN DISMISSED! Massive momentum shift to India!";
        }
    } else {
        const last12Balls = activeTeamData.balls.slice(Math.max(0, ballIndex - 12), ballIndex + 1);
        const runsInLast2Overs = last12Balls.reduce((sum, b) => sum + b.runs, 0);
        if (runsInLast2Overs >= 30) {
            isTurningPoint = true;
            turningPointText = "Huge onslaught! India accelerating towards a massive total.";
        }
        if (currentBall.isWicket && currentBall.playerOut?.includes('Rohit')) {
            isTurningPoint = true;
            turningPointText = "Key wicket! South Africa strikes early.";
        }
    }

    // Identify current batters
    const fowsTillNow = activeTeamData.balls.slice(0, ballIndex + 1).filter(b => b.isWicket).map(b => b.playerOut);
    const battersData = inning === 'IND'
        ? ["Rohit Sharma", "Virat Kohli", "Rishabh Pant", "Suryakumar Yadav", "Axar Patel", "Shivam Dube", "Hardik Pandya"]
        : ["Reeza Hendricks", "Quinton de Kock", "Aiden Markram", "Tristan Stubbs", "Heinrich Klaasen", "David Miller", "Marco Jansen"];

    // Simplistic current batter logic: Top 2 names not in FOW
    const currentBatters = battersData.filter(name => !fowsTillNow.some(fow => fow && fow.includes(name.split(' ')[0]))).slice(0, 2);
    const striker = currentBatters[0] || "Unknown";
    const nonStriker = currentBatters[1] || "Unknown";

    // Dynamic IM approximation for display
    const currentIM = Math.min(100, Math.max(0, (currentBall.totalScore / (oversBowled || 1)) * 5 + (fows.length * -2)));

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 relative">
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-cyan/5 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>

                    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                        <LuRadio className="text-red text-2xl animate-pulse" />
                        <h1 className="font-display text-4xl text-text-primary">T20 WC Final 2024 Live</h1>
                        <span className="ml-auto px-3 py-1 bg-red/10 text-red text-xs font-bold rounded-full border border-red/20 uppercase tracking-widest hidden sm:block">
                            Ball-by-Ball Live
                        </span>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <motion.div variants={fadeUp} className="lg:col-span-2 bg-gradient-to-br from-[#111E33] to-bg-card border border-border-subtle rounded-2xl p-6 lg:p-8 shadow-xl shadow-cyan/5">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-text-muted text-xs uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                                        <LuSwords /> {inning === 'IND' ? 'India Innings' : 'South Africa Innings'}
                                    </p>
                                    <h2 className="font-display text-7xl text-text-primary tabular-nums tracking-tight">
                                        {currentBall.totalScore} <span className="text-4xl text-text-secondary">/ {currentBall.totalWickets}</span>
                                    </h2>
                                    <p className="text-cyan font-medium mt-2 text-xl">Overs: {currentBall.label} <span className="text-sm text-text-secondary ml-1">/ 20.0</span></p>
                                </div>
                                <div className="text-right">
                                    {inning === 'IND' ? (
                                        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">1st Innings</p>
                                    ) : (
                                        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">To Win: {reqRuns}</p>
                                    )}
                                    <p className="font-display text-4xl text-text-primary">
                                        {inning === 'IND' ? '-' : reqRuns}
                                    </p>
                                </div>
                            </div>

                            <div className={`bg-bg-primary/50 text-center py-4 rounded-xl border border-border-subtle mb-6 transition-all duration-300 ${currentBall.isWicket ? 'shadow-lg shadow-red/10 border-red/30' : currentBall.runs === 6 ? 'shadow-lg shadow-amber/10 border-amber/30' : ''}`}>
                                <span className={`text-lg font-medium ${currentBall.isWicket ? 'text-red' : currentBall.runs === 6 ? 'text-amber' : currentBall.runs === 4 ? 'text-cyan' : 'text-text-primary'}`}>
                                    {currentBall.label} — {eventText}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                <div className="bg-bg-primary/50 rounded-xl p-4 border border-border-subtle">
                                    <p className="text-text-muted text-[10px] uppercase mb-1 font-semibold">Current Run Rate</p>
                                    <p className="font-display text-xl text-text-primary">{crr}</p>
                                </div>
                                <div className="bg-bg-primary/50 flex-1 rounded-xl p-4 border border-border-subtle">
                                    <p className="text-text-muted text-[10px] uppercase mb-1 font-semibold">Required Rate</p>
                                    <p className="font-display text-xl text-text-primary">{rrr}</p>
                                </div>
                                <div className="bg-bg-primary/50 flex-1 rounded-xl p-4 border border-border-subtle">
                                    <p className="text-text-muted text-[10px] uppercase mb-1 font-semibold">Runs in Over</p>
                                    <p className="font-display text-xl text-text-primary">{runsInOver}</p>
                                </div>
                                <div className="bg-bg-primary/50 flex-1 rounded-xl p-4 border border-border-subtle">
                                    <p className="text-text-muted text-[10px] uppercase mb-1 font-semibold">Momentum</p>
                                    <div className="flex items-center gap-2">
                                        <FiTrendingUp className={currentBall.isWicket ? "text-red" : currentBall.runs >= 4 ? "text-cyan" : "text-amber"} />
                                        <span className="font-bold text-sm text-text-primary">
                                            {currentBall.isWicket ? 'Bowling' : currentBall.runs >= 4 ? 'Batting' : 'Steady'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border-subtle pt-4 min-h-[80px]">
                                <p className="text-text-muted text-xs font-medium mb-3">Fall of Wickets so far:</p>
                                <div className="flex flex-wrap gap-2">
                                    {fows.length === 0 ? <span className="text-text-secondary text-sm">None</span> : null}
                                    {fows.map((f, i) => (
                                        <span key={i} className="px-2 py-1 bg-red/10 border border-red/20 text-red text-xs rounded-md">
                                            {f.totalScore}-{i + 1} ({f.playerOut})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex flex-col gap-6">
                            <motion.div variants={fadeUp} className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-cyan/5">
                                <h3 className="font-display text-lg text-text-primary mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
                                    <span className="flex items-center gap-2"><FiZap className="text-gold" /> Live Scoreboard</span>
                                </h3>

                                <div className="mb-4">
                                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Batting</p>
                                    <div className="flex items-center justify-between bg-bg-primary p-3 rounded-lg border border-cyan/30 shadow-[0_0_10px_rgba(0,229,255,0.1)] mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🏏</span>
                                            <span className="font-display text-text-primary">{striker} <span className="text-cyan">*</span></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-bg-primary p-3 rounded-lg border border-border-subtle">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg opacity-50">🏃</span>
                                            <span className="font-display text-text-secondary">{nonStriker}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Bowling</p>
                                    <div className="flex items-center justify-between bg-bg-primary p-3 rounded-lg border border-red/30 shadow-[0_0_10px_rgba(247,100,90,0.1)]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">⚾</span>
                                            <span className="font-display text-text-primary">{currentBall.bowler || (inning === 'IND' ? 'Rabada' : 'Bumrah')} *</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <AnimatePresence mode="popLayout">
                                {isTurningPoint ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className="bg-gradient-to-br from-[#2D1A1A] to-bg-card border border-red/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(247,100,90,0.2)] flex flex-col items-center text-center relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red to-transparent animate-pulse" />
                                        <FiActivity className="text-red text-4xl mb-3 animate-bounce" />
                                        <h3 className="font-display text-xl text-text-primary mb-2">MATCH TURNING POINT!</h3>
                                        <p className="text-red font-medium text-sm leading-relaxed">{turningPointText}</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-cyan/5 flex flex-col items-center justify-center text-center"
                                    >
                                        <h3 className="font-display text-xl text-text-primary mb-2 flex items-center justify-center gap-2 w-full">
                                            <FiZap className="text-gold text-lg" /> Team Impact Tracker
                                        </h3>
                                        <p className="text-text-muted text-xs mb-8">Real-time overall impact shift based on match state</p>

                                        <div className="relative w-40 h-40 mb-6 flex-shrink-0">
                                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                                <circle
                                                    cx="50" cy="50" r="45" fill="none"
                                                    stroke={currentIM > 50 ? "#00E5FF" : "#F7645A"}
                                                    strokeWidth="10"
                                                    strokeDasharray="282.7"
                                                    strokeDashoffset={282.7 - (282.7 * currentIM) / 100}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="font-display text-4xl text-text-primary">{Math.round(currentIM)}</span>
                                                <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">Impact Pt</span>
                                            </div>
                                        </div>

                                        <div className="w-full bg-bg-primary rounded-xl p-4 border border-border-subtle">
                                            <p className="text-text-secondary text-sm">
                                                {inning === 'IND' ? 'India building the total' : 'South Africa chasing the target'}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Timeline Controls */}
                    <motion.div variants={fadeUp} className="bg-bg-card border border-border-subtle rounded-2xl p-6 relative">
                        <h3 className="font-display text-lg text-text-primary mb-5 flex items-start sm:items-center flex-col sm:flex-row gap-4 sm:justify-between">
                            <span className="flex items-center gap-2"><FiClock className="text-cyan" /> Match Timeline (Jump to Over)</span>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="flex items-center gap-2 text-sm bg-bg-primary px-4 py-2 rounded-xl hover:border-cyan border border-border-subtle transition-all font-semibold"
                            >
                                {isPlaying ? <><FiPauseCircle className="text-red" /> Pause Live</> : <><FiPlayCircle className="text-green" /> Resume Live</>}
                            </button>
                        </h3>

                        <div className="space-y-6">
                            {['IND', 'RSA'].map(inn => (
                                <div key={inn}>
                                    <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-3">{inn === 'IND' ? '1st Innings (IND)' : '2nd Innings (RSA)'}</p>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                        {overButtons.map(overNum => {
                                            const isActive = inning === inn && (ballIndex / 6) >= (overNum - 1);
                                            // The active over means we are inside it
                                            const isCurrent = inning === inn && Math.floor(ballIndex / 6) === (overNum - 1);
                                            return (
                                                <button
                                                    key={overNum}
                                                    onClick={() => handleOverClick(inn, overNum)}
                                                    className={`
                                                        px-3.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
                                                        ${isCurrent ? 'bg-cyan text-bg-primary border-cyan shadow-lg shadow-cyan/20 scale-105' :
                                                            isActive ? 'bg-cyan/10 text-cyan border-cyan/30' :
                                                                'bg-bg-primary text-text-secondary border-border-subtle hover:border-cyan/50 hover:bg-bg-card'}
                                                    `}
                                                >
                                                    Ovr {overNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Ball ticks visualization */}
                        <div className="mt-4 border-t border-border-subtle pt-4">
                            <p className="text-[10px] uppercase font-bold text-text-muted mb-2 tracking-widest">Completed Balls (Current Over)</p>
                            <div className="flex gap-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${i <= (ballIndex % 6) ? 'bg-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]' : 'bg-bg-primary border border-border-subtle'}`}
                                    />
                                ))}
                            </div>
                        </div>

                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}
