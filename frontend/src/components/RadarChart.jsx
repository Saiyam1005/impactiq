import {
    Radar, RadarChart as RechartsRadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip
} from 'recharts';

const defaultAxes = ['Performance', 'Pressure', 'Clutch', 'Consistency', 'Context', 'OppositionQuality'];

export default function RadarChart({
    player1Data = [51, 51, 51, 51, 51, 51],
    player2Data = [51, 51, 51, 51, 51, 51],
    player1Name = 'Player 1',
    player2Name = 'Player 2',
    axes = defaultAxes
}) {
    const chartData = axes.map((axis, i) => ({
        axis,
        [player1Name]: player1Data[i],
        [player2Name]: player2Data[i],
    }));

    return (
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-5">
            <h3 className="text-text-primary font-semibold text-base mb-2">Key Dimensions</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsRadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="#1C2D4A" />
                    <PolarAngleAxis
                        dataKey="axis"
                        tick={{ fill: '#8899BB', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#4A5E7A', fontSize: 10 }}
                        axisLine={false}
                    />
                    <Radar
                        name={player1Name}
                        dataKey={player1Name}
                        stroke="#00E5FF"
                        fill="#00E5FF"
                        fillOpacity={0.25}
                        strokeWidth={2}
                    />
                    <Radar
                        name={player2Name}
                        dataKey={player2Name}
                        stroke="#F0B429"
                        fill="#F0B429"
                        fillOpacity={0.2}
                        strokeWidth={2}
                        strokeDasharray="5 3"
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 12, color: '#8899BB' }}
                        iconType="circle"
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#131F35',
                            border: '1px solid #1E3A5F',
                            borderRadius: '8px',
                            color: '#F0F4FF',
                            fontSize: 12,
                        }}
                    />
                </RechartsRadarChart>
            </ResponsiveContainer>
        </div>
    );
}
