import { useState, useEffect, useRef } from 'react';

export function useIMScore(targetScore, duration = 1500) {
    const [score, setScore] = useState(0);
    const animRef = useRef(null);

    useEffect(() => {
        if (targetScore === undefined || targetScore === null) return;
        const start = performance.now();
        const from = 0;

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setScore(Math.round(from + (targetScore - from) * eased));
            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        };

        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [targetScore, duration]);

    return score;
}

export function useCountUp(target, duration = 1500) {
    const [value, setValue] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;
        const start = performance.now();
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(parseFloat((target * eased).toFixed(1)));
            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        };
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [hasStarted, target, duration]);

    return { value, ref };
}
