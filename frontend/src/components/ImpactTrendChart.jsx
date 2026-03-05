import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';

function CustomDot(props) {
    const { cx, cy, payload, peakValue } = props;
    if (payload.score === peakValue) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={8} fill="#F0B429" stroke="#F0B429" strokeWidth={2} opacity={0.3} />
                <circle cx={cx} cy={cy} r={5} fill="#F0B429" />
                <text x={cx} y={cy - 14} textAnchor="middle" fill="#F0B429" fontSize={11} fontWeight="bold">
                    Peak: {payload.score}
                </text>
            </g>
        );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#00E5FF" stroke="#060B18" strokeWidth={2} />;
}

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-bg-elevated border border-border-accent rounded-lg px-4 py-3 shadow-xl">
            <p className="text-text-primary font-semibold text-sm mb-1">{d.match}</p>
            <p className="text-cyan font-display text-2xl">{d.score}</p>
            {d.performance !== undefined && (
                <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between gap-6">
                        <span className="text-text-muted">Performance</span>
                        <span className="text-text-primary">{d.performance}/40</span>
                    </div>
                    <div className="flex justify-between gap-6">
                        <span className="text-text-muted">Context</span>
                        <span className="text-text-primary">{d.context}/35</span>
                    </div>
                    <div className="flex justify-between gap-6">
                        <span className="text-text-muted">Pressure</span>
                        <span className="text-text-primary">{d.pressure}/25</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ImpactTrendChart({ data = [], matches = [] }) {
    const chartData = data.map((score, i) => ({
        match: matches[i] || `Inn ${i + 1}`,
        score,
        performance: undefined,
        context: undefined,
        pressure: undefined,
    }));

    const peakValue = Math.max(...data);

    return (
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-5">
            <h3 className="text-text-primary font-semibold text-base mb-4">Impact Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1C2D4A" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="match"
                        tick={{ fill: '#4A5E7A', fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: '#1C2D4A' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#4A5E7A', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <ReferenceLine
                        y={50}
                        stroke="#4A5E7A"
                        strokeDasharray="6 4"
                        label={{ value: 'Baseline', fill: '#4A5E7A', fontSize: 10, position: 'left' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#00E5FF"
                        strokeWidth={2.5}
                        fill="url(#cyanGrad)"
                        dot={<CustomDot peakValue={peakValue} />}
                        activeDot={{ r: 6, fill: '#00E5FF', stroke: '#060B18', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
