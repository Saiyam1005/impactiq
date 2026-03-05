export function calcPerformanceScore(runs, balls, role = "BAT") {
    if (role === "BAT") {
        const sr = balls > 0 ? (runs / balls) * 100 : 0;
        const base = runs * 0.6;
        const srBonus = Math.max(0, (sr - 100) * 0.15);
        return Math.min(40, base * 0.3 + srBonus);
    }
    return 0;
}

export function calcContextMultiplier(phase, isChase = false, wicketsFallen = 0) {
    const phaseMap = {
        "Powerplay": 0.9, "Middle": 1.0, "Death": 1.2,
        "Chase-Death": 1.4, "All phases": 1.1, "Middle-Death": 1.15
    };
    let base = phaseMap[phase] || 1.0;
    base += Math.min(0.3, wicketsFallen * 0.05);
    if (isChase) base += 0.1;
    return Math.min(1.5, Math.max(0.7, base));
}

export function calcPressureIndex(pressureLevel, isKnockout = false) {
    const map = { Low: 0.4, Medium: 0.6, High: 0.8, "Very High": 0.9, Extreme: 1.0 };
    const p = map[pressureLevel] || 0.5;
    return Math.min(25, p * 20 * (isKnockout ? 1.3 : 1.0));
}

export function calcRecencyWeight(position, total = 10, lambda = 0.15) {
    return Math.exp(-lambda * (total - position));
}

export function getIMLabel(score) {
    if (score >= 80) return { label: "MATCH WINNER ★", color: "#F0B429", bg: "rgba(240,180,41,0.15)" };
    if (score >= 70) return { label: "HIGH IMPACT", color: "#00D68F", bg: "rgba(0,214,143,0.15)" };
    if (score >= 50) return { label: "AVERAGE", color: "#FFAA00", bg: "rgba(255,170,0,0.15)" };
    return { label: "BELOW PAR", color: "#F7645A", bg: "rgba(247,100,90,0.15)" };
}

export function getScoreColor(score) {
    if (score >= 80) return "#F0B429";
    if (score >= 60) return "#00D68F";
    if (score >= 40) return "#FFAA00";
    return "#F7645A";
}
