import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiActivity, FiTrendingUp, FiPlayCircle, FiPauseCircle } from 'react-icons/fi';
import { LuSwords, LuRadio } from 'react-icons/lu';
import wcData from '../data/wc_final_2024.json';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const timelinePhases = [
    { label: '0-2', idx: 0 }, { label: '2-4', idx: 1 }, { label: '4-6', idx: 2 },
    { label: '6-8', idx: 3 }, { label: '8-10', idx: 4 }, { label: '10-12', idx: 5 },
    { label: '12-14', idx: 6 }, { label: '14-16', idx: 7 }, { label: '16-18', idx: 8 },
    { label: '18-20', idx: 9 }
];

export default function LiveImpact() {
    const [inning, setInning] = useState('IND');
    const [phaseIdx, setPhaseIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Auto-advance timeline
    useEffect(() => {
        if (!isPlaying) return;
        const timer = setInterval(() => {
            setPhaseIdx(prev => {
                if (prev < 9) return prev + 1;
                if (inning === 'IND') {
                    setInning('RSA');
                    return 0;
                }
                setIsPlaying(false);
                return 9;
            });
        }, 6000);
        return () => clearInterval(timer);
    }, [isPlaying, inning]);

    const handleTimelineClick = (inn, idx) => {
        setIsPlaying(false);
        setInning(inn);
        setPhaseIdx(idx);
    };

    const activeTeamData = wcData[inning];
    const opponent = inning === 'IND' ? 'RSA' : 'IND';
    const currentPhase = activeTeamData.runsAtPhase[phaseIdx];
    const prevScore = phaseIdx > 0 ? activeTeamData.runsAtPhase[phaseIdx - 1].score : 0;
    const runsInPhase = currentPhase.score - prevScore;
    const crr = (currentPhase.score / currentPhase.over).toFixed(1);

    // Simulate RRR and Target
    const target = wcData['IND'].totalScore + 1;
    const reqRuns = inning === 'RSA' ? target - currentPhase.score : null;
    const ballsLeft = inning === 'RSA' ? 120 - (currentPhase.over * 6) : null;
    const rrr = inning === 'RSA' && ballsLeft > 0 ? ((reqRuns / ballsLeft) * 6).toFixed(1) : '-';

    // FOW relevant up to this phase
    const fows = activeTeamData.fow.filter(f => parseFloat(f.over) <= currentPhase.over);

    // Dynamic players simulation at this phase
    const displayPlayers = activeTeamData.batters.map((b, i) => {
        let im = Math.min(100, (b.runs * 1.2) + (b.sr * 0.2));
        if (inning === 'IND' && currentPhase.over < 10) im *= 0.7; // Fake progression
        if (inning === 'RSA' && currentPhase.over < 15 && b.name === 'Klaasen') im = 20;

        return {
            name: b.name,
            contribution: `${Math.round(b.runs * (currentPhase.over / 20))} runs (${Math.round(b.balls * (currentPhase.over / 20))}b)`,
            projectedIM: Math.round(im).toFixed(1),
            status: fows.find(f => f.player.includes(b.name)) ? 'Out' : 'Batting',
            statusColor: fows.find(f => f.player.includes(b.name)) ? '#F7645A' : '#00E5FF'
        };
    }).slice(0, 4);

    const opponentBowlers = wcData[opponent].bowlers.map(b => {
        const oversAtPhase = Math.min(b.o, Math.max(0, currentPhase.over / 5));
        const runsAtPhase = Math.round(b.r * (oversAtPhase / (b.o || 1)));
        const wAtPhase = Math.round(b.w * (oversAtPhase / (b.o || 1)));
        const im = 50 + (wAtPhase * 15) - (runsAtPhase * 0.5);
        return {
            name: b.name,
            contribution: `${oversAtPhase.toFixed(1)} Overs, ${wAtPhase} W, ${runsAtPhase} R`,
            projectedIM: Math.min(100, Math.max(0, im)).toFixed(1),
            status: 'Bowling',
            statusColor: '#F0B429'
        };
    }).slice(0, 3);

    const livePlayers = [...displayPlayers, ...opponentBowlers].sort((a, b) => b.projectedIM - a.projectedIM);

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 relative">
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-cyan/5 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>

                    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                        <LuRadio className="text-red text-2xl animate-pulse" />
                        <h1 className="font-display text-4xl text-text-primary">T20 WC Final 2024 Replay</h1>
                        <span className="ml-auto px-3 py-1 bg-red/10 text-red text-xs font-bold rounded-full border border-red/20 uppercase tracking-widest">
                            Live Simulated
                        </span>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <motion.div variants={fadeUp} className="lg:col-span-2 bg-gradient-to-br from-[#111E33] to-bg-card border border-border-subtle rounded-2xl p-6 lg:p-8 shadow-xl shadow-cyan/5">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-text-muted text-xs uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                                        <LuSwords /> {inning === 'IND' ? 'India Innings' : 'South Africa Innings'}
                                    </p>
                                    <h2 className="font-display text-6xl text-text-primary tabular-nums tracking-tight">
                                        {currentPhase.score} <span className="text-3xl text-text-secondary">/ {currentPhase.wickets}</span>
                                    </h2>
                                    <p className="text-cyan font-medium mt-2">Overs: {currentPhase.over}.0 / 20.0</p>
                                </div>
                                <div className="text-right">
                                    {inning === 'IND' ? (
                                        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">Target</p>
                                    ) : (
                                        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">To Win: {reqRuns}</p>
                                    )}
                                    <p className="font-display text-3xl text-text-primary">
                                        {inning === 'IND' ? '-' : reqRuns}
                                    </p>
                                </div>
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
                                    <p className="text-text-muted text-[10px] uppercase mb-1 font-semibold">Runs in Phase</p>
                                    <p className="font-display text-xl text-text-primary">+{runsInPhase}</p>
                                </div>
                                <div className="bg-bg-primary/50 flex-1 rounded-xl p-4 border border-border-subtle">
                                    <p className="text-text-muted text-[10px] uppercase mb-1 font-semibold">Momentum</p>
                                    <div className="flex items-center gap-2">
                                        <FiTrendingUp className={runsInPhase > 15 ? "text-cyan" : "text-amber"} />
                                        <span className="font-bold text-sm text-text-primary">{runsInPhase > 15 ? 'Aggressive' : 'Steady'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border-subtle pt-4">
                                <p className="text-text-muted text-xs font-medium mb-3">Fall of Wickets so far:</p>
                                <div className="flex flex-wrap gap-2">
                                    {fows.length === 0 ? <span className="text-text-secondary text-sm">None</span> : null}
                                    {fows.map((f, i) => (
                                        <span key={i} className="px-2 py-1 bg-red/10 border border-red/20 text-red text-xs rounded-md">
                                            {f.score}-{i + 1} ({f.player})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-cyan/5">
                            <h3 className="font-display text-xl text-text-primary mb-4 flex items-center gap-2">
                                <FiZap className="text-gold text-lg" /> Live Impact Metrics
                            </h3>
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {livePlayers.map((player) => (
                                        <motion.div
                                            key={player.name}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-bg-primary p-3 rounded-xl border border-border-subtle flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold px-2 rounded-full" style={{ backgroundColor: player.statusColor + '20', color: player.statusColor }}>
                                                        {player.status}
                                                    </span>
                                                    <span className="font-medium text-text-primary text-sm">{player.name}</span>
                                                </div>
                                                <p className="text-text-muted text-xs">{player.contribution}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-text-muted text-[10px] uppercase font-bold mb-0.5">Est. IM</p>
                                                <span className="font-display text-lg" style={{ color: player.projectedIM >= 80 ? '#00E5FF' : player.projectedIM >= 60 ? '#F0B429' : '#8899BB' }}>
                                                    {player.projectedIM}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Timeline Controls */}
                    <motion.div variants={fadeUp} className="bg-bg-card border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <h3 className="font-display text-lg text-text-primary mb-5 flex items-center justify-between">
                            <span className="flex items-center gap-2"><FiClock className="text-cyan" /> Match Timeline</span>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="flex items-center gap-2 text-sm bg-bg-primary px-3 py-1.5 rounded-lg hover:border-cyan border border-border-subtle transition-all"
                            >
                                {isPlaying ? <><FiPauseCircle className="text-red" /> Pause</> : <><FiPlayCircle className="text-green" /> Auto-Play</>}
                            </button>
                        </h3>

                        <div className="space-y-6">
                            {['IND', 'RSA'].map(inn => (
                                <div key={inn}>
                                    <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-3">{inn === 'IND' ? 'India Innings' : 'South Africa Innings'}</p>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {timelinePhases.map(({ label, idx }) => {
                                            const isActive = inning === inn && phaseIdx >= idx;
                                            const isCurrent = inning === inn && phaseIdx === idx;
                                            return (
                                                <button
                                                    key={label}
                                                    onClick={() => handleTimelineClick(inn, idx)}
                                                    className={`
                                                        px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border
                                                        ${isCurrent ? 'bg-cyan text-bg-primary border-cyan shadow-lg shadow-cyan/20 scale-105' :
                                                            isActive ? 'bg-cyan/10 text-cyan border-cyan/30' :
                                                                'bg-bg-primary text-text-secondary border-border-subtle hover:border-cyan/50'}
                                                    `}
                                                >
                                                    Over {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}
