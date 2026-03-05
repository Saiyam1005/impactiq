import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getScoreColor } from '../utils/imCalculator';

const zones = [
    { min: 0, max: 20, color: '#F7645A', label: 'Crisis' },
    { min: 20, max: 40, color: '#FF6B35', label: 'Below Par' },
    { min: 40, max: 60, color: '#FFAA00', label: 'Average' },
    { min: 60, max: 80, color: '#00D68F', label: 'Impact' },
    { min: 80, max: 100, color: '#F0B429', label: 'Match Winner' },
];

export default function GaugeMeter({ score = 0, size = 280 }) {
    const svgRef = useRef(null);
    const needleRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const w = size;
        const h = size * 0.65;
        const cx = w / 2;
        const cy = h - 20;
        const r = size * 0.38;
        const thickness = size * 0.06;

        const g = svg.append('g');

        // Draw zone arcs
        const arcGen = d3.arc();
        zones.forEach(zone => {
            const startAngle = -Math.PI / 2 + (zone.min / 100) * Math.PI;
            const endAngle = -Math.PI / 2 + (zone.max / 100) * Math.PI;
            g.append('path')
                .attr('d', arcGen({
                    innerRadius: r - thickness,
                    outerRadius: r,
                    startAngle,
                    endAngle,
                }))
                .attr('transform', `translate(${cx}, ${cy})`)
                .attr('fill', zone.color)
                .attr('opacity', 0.85);
        });

        // Tick marks
        for (let i = 0; i <= 100; i += 10) {
            const angle = -Math.PI / 2 + (i / 100) * Math.PI;
            const x1 = cx + Math.cos(angle) * (r + 4);
            const y1 = cy + Math.sin(angle) * (r + 4);
            const x2 = cx + Math.cos(angle) * (r + 12);
            const y2 = cy + Math.sin(angle) * (r + 12);
            g.append('line')
                .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
                .attr('stroke', '#4A5E7A').attr('stroke-width', 1.5);
        }

        // Needle
        const needleG = g.append('g')
            .attr('transform', `translate(${cx}, ${cy})`);

        // Needle glow filter
        const defs = svg.append('defs');
        const filter = defs.append('filter').attr('id', 'needle-glow');
        filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
        const merge = filter.append('feMerge');
        merge.append('feMergeNode').attr('in', 'blur');
        merge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Needle path
        const needlePath = needleG.append('line')
            .attr('x1', 0).attr('y1', 0)
            .attr('x2', 0).attr('y2', -(r - thickness - 8))
            .attr('stroke', getScoreColor(score))
            .attr('stroke-width', 3)
            .attr('stroke-linecap', 'round')
            .attr('filter', 'url(#needle-glow)');

        // Needle center dot
        needleG.append('circle')
            .attr('r', 6)
            .attr('fill', '#F0F4FF')
            .attr('stroke', getScoreColor(score))
            .attr('stroke-width', 2);

        // Needle tip glow
        const tipGlow = needleG.append('circle')
            .attr('cy', -(r - thickness - 8))
            .attr('r', 4)
            .attr('fill', getScoreColor(score))
            .attr('opacity', 0.8);

        // Animate needle
        const startAngle = -90;
        const endAngle = -90 + (score / 100) * 180;
        const duration = 1500;
        const startTime = performance.now();

        function animateNeedle(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            const currentAngle = startAngle + (endAngle - startAngle) * eased;
            needleG.attr('transform', `translate(${cx}, ${cy}) rotate(${currentAngle})`);
            if (t < 1) requestAnimationFrame(animateNeedle);
        }
        requestAnimationFrame(animateNeedle);

        needleRef.current = needleG;
    }, [score, size]);

    const zoneColor = getScoreColor(score);
    const zoneName = zones.find(z => score >= z.min && score < z.max)?.label || 'Match Winner';

    return (
        <div className="flex flex-col items-center">
            <svg ref={svgRef} width={size} height={size * 0.65} />
            <div className="text-center -mt-2">
                <span className="font-display text-5xl" style={{ color: zoneColor }}>
                    {score}
                </span>
                <span className="text-text-muted text-lg ml-1">/100</span>
            </div>
            <div className="text-xs font-semibold tracking-widest mt-1" style={{ color: zoneColor }}>
                {zoneName.toUpperCase()} ZONE
            </div>
            <div className="flex gap-3 mt-3">
                {zones.map(z => (
                    <div key={z.label} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                        <span className="text-[10px] text-text-muted">{z.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
