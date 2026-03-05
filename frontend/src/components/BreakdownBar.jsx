import { useState, useEffect } from 'react';

export default function BreakdownBar({ label, value, maxValue, color, subtext }) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setWidth((value / maxValue) * 100);
        }, 100);
        return () => clearTimeout(timer);
    }, [value, maxValue]);

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-text-secondary font-medium">{label}</span>
                <span className="text-sm font-bold text-text-primary">
                    {value} <span className="text-text-muted font-normal">/ {maxValue}</span>
                </span>
            </div>
            <div className="h-2.5 bg-bg-primary rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${width}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 12px ${color}40`,
                    }}
                />
            </div>
            {subtext && (
                <p className="text-[11px] text-text-muted mt-1">{subtext}</p>
            )}
        </div>
    );
}
