import { motion } from 'framer-motion';

const pressureColors = {
    Extreme: '#F7645A',
    'Very High': '#F7645A',
    High: '#FFAA00',
    Medium: '#F0B429',
    Low: '#00D68F',
};

function IMChip({ score }) {
    let label, bg, color;
    if (score >= 70) { label = 'HIGH'; bg = 'rgba(0,214,143,0.15)'; color = '#00D68F'; }
    else if (score >= 50) { label = 'AVG'; bg = 'rgba(255,170,0,0.15)'; color = '#FFAA00'; }
    else { label = 'LOW'; bg = 'rgba(247,100,90,0.15)'; color = '#F7645A'; }
    return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: bg, color }}>
            {label}
        </span>
    );
}

export default function InningsTable({ innings = [], role = 'BAT' }) {
    const isBowler = role === 'BOWL';

    return (
        <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
            <div className="p-5 pb-0">
                <h3 className="text-text-primary font-semibold text-base flex items-center gap-2">
                    {isBowler ? 'Bowling Form' : 'Batting Form'}
                </h3>
                <p className="text-text-muted text-xs mt-0.5">Last {innings.length} innings</p>
            </div>
            <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm whitespace-nowrap">
                    <thead>
                        <tr className="bg-bg-elevated text-text-secondary text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left sticky left-0 bg-bg-elevated z-10">Match</th>
                            <th className="px-4 py-3 text-left">Format</th>
                            {isBowler ? (
                                <>
                                    <th className="px-4 py-3 text-right">Overs</th>
                                    <th className="px-4 py-3 text-right">Runs</th>
                                    <th className="px-4 py-3 text-right">Wickets</th>
                                    <th className="px-4 py-3 text-right">Econ</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-4 py-3 text-right">Runs</th>
                                    <th className="px-4 py-3 text-right">Balls</th>
                                </>
                            )}
                            <th className="px-4 py-3 text-left">Phase</th>
                            <th className="px-4 py-3 text-left">Pressure</th>
                            <th className="px-4 py-3 text-center">IM</th>
                            <th className="px-4 py-3 text-center">Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {innings.map((inn, idx) => (
                            <motion.tr
                                key={idx} // Using idx instead of innings_num to avoid duplicate key issues if same innings_num appears
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`border-t border-border-subtle/50 hover:border-l-2 hover:border-l-cyan hover:bg-bg-elevated/50 transition-all ${idx % 2 === 0 ? 'bg-bg-card' : 'bg-[#111E33]'
                                    }`}
                            >
                                <td className="px-4 py-3 text-text-primary font-medium sticky left-0 z-10" style={{ background: 'inherit' }}>
                                    {inn.match}
                                </td>
                                <td className="px-4 py-3 text-text-secondary">{inn.format}</td>

                                {isBowler ? (
                                    <>
                                        <td className="px-4 py-3 text-right text-text-secondary">{inn.overs}</td>
                                        <td className="px-4 py-3 text-right text-text-primary font-medium">{inn.runs}</td>
                                        <td className="px-4 py-3 text-right text-amber font-bold">{inn.wickets}</td>
                                        <td className="px-4 py-3 text-right text-text-secondary">{inn.economy?.toFixed(1) || '-'}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 text-right text-text-primary font-bold">{inn.runs}</td>
                                        <td className="px-4 py-3 text-right text-text-secondary">{inn.balls}</td>
                                    </>
                                )}

                                <td className="px-4 py-3 text-text-secondary text-xs">{inn.phase}</td>
                                <td className="px-4 py-3">
                                    <span style={{ color: pressureColors[inn.pressure_label] || '#8899BB' }} className="font-medium text-xs">
                                        {inn.pressure_label}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex flex-col items-center gap-0.5" title={`Performance (${inn.performance_score}) + Context (${inn.context_score}) + Pressure (${inn.pressure_score})`}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-lg text-text-primary">{inn.im_score}</span>
                                            <IMChip score={inn.im_score} />
                                        </div>
                                        <div className="text-[10px] text-text-muted mt-1 flex gap-1 whitespace-nowrap">
                                            <span title="Performance Score" className="text-[#00E5FF]">P:{inn.performance_score}</span> +
                                            <span title="Context Score" className="text-[#F0B429]">C:{inn.context_score}</span> +
                                            <span title="Pressure Index" className="text-[#F7645A]">Pr:{inn.pressure_score}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center text-lg">
                                    {inn.delta > 0 ? (
                                        <span className="text-green">▲</span>
                                    ) : inn.delta < 0 ? (
                                        <span className="text-red">▼</span>
                                    ) : (
                                        <span className="text-text-muted">-</span>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
