import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuRadio } from 'react-icons/lu';
import { FiChevronRight, FiZap } from 'react-icons/fi';
import wcData from '../data/wc_final_2024_balls.json';

export default function LiveMatchCard() {
    const navigate = useNavigate();
    const [ballIdx, setBallIdx] = useState(0);
    const [inning, setInning] = useState('IND');

    useEffect(() => {
        const t = setInterval(() => {
            setBallIdx(prev => {
                if (prev < 119) return prev + 1;
                if (inning === 'IND') {
                    setInning('RSA');
                    return 0;
                }
                return prev;
            });
        }, 3000);
        return () => clearInterval(t);
    }, [inning]);

    const ball = wcData[inning].balls[ballIdx] || wcData[inning].balls[0];
    const oversBowled = ball.over + ball.ball / 6;
    const crr = oversBowled > 0 ? (ball.totalScore / oversBowled).toFixed(1) : '0.0';
    const target = inning === 'RSA' ? wcData['IND'].balls[119].totalScore + 1 : null;

    let reqRuns = null;
    let rrr = '-';
    if (inning === 'RSA') {
        reqRuns = target - ball.totalScore;
        const ballsLeft = 120 - (ballIdx + 1);
        if (ballsLeft > 0 && reqRuns > 0) rrr = ((reqRuns / ballsLeft) * 6).toFixed(1);
        else if (reqRuns <= 0) rrr = 'Won';
    }

    const eventText = ball.isWicket ? 'WICKET!' :
        ball.runs === 6 ? 'SIX!' :
        ball.runs === 4 ? 'FOUR!' :
        ball.runs === 0 ? 'Dot' :
        `${ball.runs} run${ball.runs > 1 ? 's' : ''}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/live')}
            className="group bg-gradient-to-br from-[#1A1525] to-bg-card border border-red/30 rounded-2xl p-5 cursor-pointer hover:border-red/50 hover:shadow-lg hover:shadow-red/10 transition-all duration-300 relative overflow-hidden"
        >
            {/* Pulsing live indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red rounded-full animate-pulse" />
                <span className="text-red text-[10px] font-bold uppercase tracking-widest">LIVE</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <LuRadio className="text-red text-lg" />
                <span className="font-display text-sm text-text-muted">T20 WC Final 2024</span>
            </div>

            {/* Score */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <span className={`font-display text-lg ${inning === 'IND' ? 'text-cyan' : 'text-text-secondary'}`}>IND</span>
                    <span className="text-text-primary font-display text-xl ml-2">
                        {inning === 'IND' ? ball.totalScore : wcData['IND'].balls[119].totalScore}/{inning === 'IND' ? ball.totalWickets : wcData['IND'].balls[119].totalWickets}
                    </span>
                </div>
                <span className="text-text-muted text-xs">vs</span>
                <div>
                    <span className={`font-display text-lg ${inning === 'RSA' ? 'text-cyan' : 'text-text-secondary'}`}>RSA</span>
                    <span className="text-text-primary font-display text-xl ml-2">
                        {inning === 'RSA' ? `${ball.totalScore}/${ball.totalWickets}` : '-'}
                    </span>
                </div>
            </div>

            {/* Ball event */}
            <div className={`text-center text-xs py-1.5 rounded-lg mb-3 ${
                ball.isWicket ? 'bg-red/10 text-red border border-red/20' :
                ball.runs >= 4 ? 'bg-cyan/10 text-cyan border border-cyan/20' :
                'bg-bg-primary/50 text-text-secondary border border-border-subtle'
            }`}>
                {ball.label} — {eventText}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-[10px] text-text-muted">
                <span>CRR: <span className="text-text-primary font-bold">{crr}</span></span>
                {inning === 'RSA' && <span>RRR: <span className="text-text-primary font-bold">{rrr}</span></span>}
                <span className="flex items-center gap-1 text-text-secondary group-hover:text-cyan transition-colors">
                    Watch Live <FiChevronRight />
                </span>
            </div>
        </motion.div>
    );
}
