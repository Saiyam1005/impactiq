// Static data embedded for GitHub Pages (no backend needed)
export const playersData = [
    { id: "virat-kohli", name: "Virat Kohli", country: "India", flag: "🇮🇳", role: "BAT", matches: 112, avg: 52.4, sr: 138.2, hs: "122*", photo_placeholder: "VK", im_score: 78, im_trend: [58, 62, 71, 55, 80, 74, 68, 76, 72, 78], badges: ["MATCH WINNER", "CHASE MASTER", "PRESSURE PROOF", "IN FORM"] },
    { id: "jasprit-bumrah", name: "Jasprit Bumrah", country: "India", flag: "🇮🇳", role: "BOWL", matches: 78, avg: 18.2, sr: 16.4, hs: "economy: 6.2", photo_placeholder: "JB", im_score: 81, im_trend: [70, 75, 72, 80, 78, 82, 79, 83, 80, 81], badges: ["PRESSURE PROOF", "DEATH SPECIALIST", "CLUTCH BOWLER"] },
    { id: "jos-buttler", name: "Jos Buttler", country: "England", flag: "🏴", role: "BAT", matches: 98, avg: 48.6, sr: 142.8, hs: "101*", photo_placeholder: "JB", im_score: 74, im_trend: [65, 70, 68, 75, 72, 76, 71, 74, 73, 74], badges: ["CHASE MASTER", "DEATH SPECIALIST"] },
    { id: "rashid-khan", name: "Rashid Khan", country: "Afghanistan", flag: "🇦🇫", role: "BOWL", matches: 88, avg: 14.2, sr: 14.1, hs: "economy: 6.4", photo_placeholder: "RK", im_score: 69, im_trend: [60, 65, 70, 68, 72, 66, 71, 68, 70, 69], badges: ["PRESSURE PROOF", "SPIN WIZARD"] },
    { id: "rohit-sharma", name: "Rohit Sharma", country: "India", flag: "🇮🇳", role: "BAT", matches: 148, avg: 49.2, sr: 140.6, hs: "118", photo_placeholder: "RS", im_score: 64, im_trend: [72, 68, 65, 60, 58, 62, 64, 61, 63, 64], badges: ["CONSISTENT"] },
    { id: "kane-williamson", name: "Kane Williamson", country: "New Zealand", flag: "🇳🇿", role: "BAT", matches: 94, avg: 46.8, sr: 126.4, hs: "95", photo_placeholder: "KW", im_score: 61, im_trend: [58, 62, 60, 64, 61, 59, 63, 60, 62, 61], badges: ["CONSISTENT"] },
    { id: "david-warner", name: "David Warner", country: "Australia", flag: "🇦🇺", role: "BAT", matches: 102, avg: 34.2, sr: 142.2, hs: "100*", photo_placeholder: "DW", im_score: 48, im_trend: [65, 58, 52, 48, 45, 50, 46, 49, 47, 48], badges: ["FORM DIP"] },
    { id: "babar-azam", name: "Babar Azam", country: "Pakistan", flag: "🇵🇰", role: "BAT", matches: 108, avg: 44.6, sr: 128.8, hs: "110", photo_placeholder: "BA", im_score: 43, im_trend: [62, 55, 50, 46, 42, 45, 41, 44, 42, 43], badges: ["CRISIS"] },
];

export const inningsData = [
    { player_id: "virat-kohli", innings_num: 10, match: "vs AUS", format: "T20I", runs: 72, balls: 48, phase: "Middle-Death", context_multiplier: 1.24, pressure_label: "High", pressure_value: 0.82, performance_score: 34, context_score: 24, pressure_score: 20, im_score: 78, delta: 1 },
    { player_id: "virat-kohli", innings_num: 9, match: "vs BAN", format: "T20I", runs: 45, balls: 38, phase: "Powerplay", context_multiplier: 1.10, pressure_label: "Low", pressure_value: 0.52, performance_score: 28, context_score: 26, pressure_score: 18, im_score: 72, delta: -1 },
    { player_id: "virat-kohli", innings_num: 8, match: "vs AFG", format: "T20I", runs: 89, balls: 52, phase: "Death", context_multiplier: 1.35, pressure_label: "Very High", pressure_value: 0.91, performance_score: 36, context_score: 22, pressure_score: 18, im_score: 76, delta: 1 },
    { player_id: "virat-kohli", innings_num: 7, match: "vs SL", format: "T20I", runs: 33, balls: 30, phase: "Middle", context_multiplier: 0.95, pressure_label: "Medium", pressure_value: 0.61, performance_score: 22, context_score: 28, pressure_score: 18, im_score: 68, delta: -1 },
    { player_id: "virat-kohli", innings_num: 6, match: "vs WI", format: "T20I", runs: 67, balls: 44, phase: "All phases", context_multiplier: 1.18, pressure_label: "High", pressure_value: 0.78, performance_score: 32, context_score: 24, pressure_score: 18, im_score: 74, delta: 1 },
    { player_id: "virat-kohli", innings_num: 5, match: "vs PAK", format: "T20I", runs: 82, balls: 53, phase: "Chase-Death", context_multiplier: 1.42, pressure_label: "Extreme", pressure_value: 0.98, performance_score: 36, context_score: 21, pressure_score: 23, im_score: 80, delta: 1 },
    { player_id: "virat-kohli", innings_num: 4, match: "vs NZ", format: "T20I", runs: 28, balls: 25, phase: "Powerplay", context_multiplier: 0.88, pressure_label: "Low", pressure_value: 0.44, performance_score: 18, context_score: 22, pressure_score: 15, im_score: 55, delta: -1 },
    { player_id: "virat-kohli", innings_num: 3, match: "vs ENG", format: "T20I", runs: 76, balls: 49, phase: "Middle-Death", context_multiplier: 1.28, pressure_label: "High", pressure_value: 0.80, performance_score: 33, context_score: 21, pressure_score: 17, im_score: 71, delta: 1 },
    { player_id: "virat-kohli", innings_num: 2, match: "vs SA", format: "T20I", runs: 55, balls: 42, phase: "Middle", context_multiplier: 1.05, pressure_label: "Medium", pressure_value: 0.64, performance_score: 26, context_score: 22, pressure_score: 14, im_score: 62, delta: 1 },
    { player_id: "virat-kohli", innings_num: 1, match: "vs AUS", format: "T20I", runs: 44, balls: 38, phase: "Powerplay", context_multiplier: 0.92, pressure_label: "Low", pressure_value: 0.50, performance_score: 24, context_score: 20, pressure_score: 14, im_score: 58, delta: 1 },
    { player_id: "jasprit-bumrah", innings_num: 10, match: "vs AUS", format: "T20I", runs: 0, balls: 0, phase: "Death", context_multiplier: 1.38, pressure_label: "Very High", pressure_value: 0.90, performance_score: 36, context_score: 26, pressure_score: 22, im_score: 81, delta: 1, wickets: 3, economy: 5.8 },
    { player_id: "jasprit-bumrah", innings_num: 9, match: "vs ENG", format: "T20I", runs: 0, balls: 0, phase: "Middle-Death", context_multiplier: 1.30, pressure_label: "High", pressure_value: 0.85, performance_score: 34, context_score: 24, pressure_score: 22, im_score: 80, delta: -1, wickets: 2, economy: 6.0 },
    { player_id: "jasprit-bumrah", innings_num: 8, match: "vs SA", format: "T20I", runs: 0, balls: 0, phase: "Death", context_multiplier: 1.40, pressure_label: "Extreme", pressure_value: 0.95, performance_score: 38, context_score: 24, pressure_score: 21, im_score: 83, delta: 1, wickets: 4, economy: 5.2 },
    { player_id: "jasprit-bumrah", innings_num: 7, match: "vs NZ", format: "T20I", runs: 0, balls: 0, phase: "Powerplay", context_multiplier: 1.05, pressure_label: "Medium", pressure_value: 0.62, performance_score: 30, context_score: 26, pressure_score: 23, im_score: 79, delta: -1, wickets: 2, economy: 6.8 },
    { player_id: "jasprit-bumrah", innings_num: 6, match: "vs PAK", format: "T20I", runs: 0, balls: 0, phase: "Death", context_multiplier: 1.42, pressure_label: "Extreme", pressure_value: 0.96, performance_score: 36, context_score: 24, pressure_score: 22, im_score: 82, delta: 1, wickets: 3, economy: 5.5 },
    { player_id: "jasprit-bumrah", innings_num: 5, match: "vs WI", format: "T20I", runs: 0, balls: 0, phase: "Middle", context_multiplier: 1.10, pressure_label: "High", pressure_value: 0.78, performance_score: 32, context_score: 24, pressure_score: 22, im_score: 78, delta: -1, wickets: 2, economy: 6.5 },
    { player_id: "jasprit-bumrah", innings_num: 4, match: "vs BAN", format: "T20I", runs: 0, balls: 0, phase: "Death", context_multiplier: 1.35, pressure_label: "Very High", pressure_value: 0.88, performance_score: 34, context_score: 26, pressure_score: 20, im_score: 80, delta: 1, wickets: 3, economy: 5.9 },
    { player_id: "jasprit-bumrah", innings_num: 3, match: "vs SL", format: "T20I", runs: 0, balls: 0, phase: "Powerplay", context_multiplier: 0.95, pressure_label: "Low", pressure_value: 0.48, performance_score: 28, context_score: 22, pressure_score: 22, im_score: 72, delta: -1, wickets: 1, economy: 7.2 },
    { player_id: "jasprit-bumrah", innings_num: 2, match: "vs AFG", format: "T20I", runs: 0, balls: 0, phase: "Middle-Death", context_multiplier: 1.25, pressure_label: "High", pressure_value: 0.80, performance_score: 32, context_score: 22, pressure_score: 21, im_score: 75, delta: 1, wickets: 2, economy: 6.1 },
    { player_id: "jasprit-bumrah", innings_num: 1, match: "vs AUS", format: "T20I", runs: 0, balls: 0, phase: "Death", context_multiplier: 1.30, pressure_label: "High", pressure_value: 0.76, performance_score: 30, context_score: 22, pressure_score: 18, im_score: 70, delta: 1, wickets: 2, economy: 6.4 },
    { player_id: "jos-buttler", innings_num: 10, match: "vs IND", format: "T20I", runs: 65, balls: 42, phase: "Middle-Death", context_multiplier: 1.20, pressure_label: "High", pressure_value: 0.80, performance_score: 32, context_score: 24, pressure_score: 18, im_score: 74, delta: 1 },
    { player_id: "jos-buttler", innings_num: 9, match: "vs AUS", format: "T20I", runs: 58, balls: 40, phase: "Powerplay", context_multiplier: 1.05, pressure_label: "Medium", pressure_value: 0.60, performance_score: 30, context_score: 24, pressure_score: 19, im_score: 73, delta: -1 },
    { player_id: "jos-buttler", innings_num: 8, match: "vs SA", format: "T20I", runs: 71, balls: 45, phase: "Chase-Death", context_multiplier: 1.32, pressure_label: "Very High", pressure_value: 0.88, performance_score: 34, context_score: 22, pressure_score: 18, im_score: 74, delta: 1 },
    { player_id: "rashid-khan", innings_num: 10, match: "vs PAK", format: "T20I", runs: 0, balls: 0, phase: "Middle", context_multiplier: 1.15, pressure_label: "High", pressure_value: 0.78, performance_score: 30, context_score: 22, pressure_score: 17, im_score: 69, delta: -1, wickets: 2, economy: 6.0 },
    { player_id: "rashid-khan", innings_num: 9, match: "vs IND", format: "T20I", runs: 0, balls: 0, phase: "Middle-Death", context_multiplier: 1.22, pressure_label: "Very High", pressure_value: 0.86, performance_score: 32, context_score: 22, pressure_score: 16, im_score: 70, delta: 1, wickets: 3, economy: 6.2 },
    { player_id: "rashid-khan", innings_num: 8, match: "vs ENG", format: "T20I", runs: 0, balls: 0, phase: "Middle", context_multiplier: 1.08, pressure_label: "Medium", pressure_value: 0.62, performance_score: 28, context_score: 24, pressure_score: 16, im_score: 68, delta: -1, wickets: 2, economy: 6.8 },
    { player_id: "rohit-sharma", innings_num: 10, match: "vs AUS", format: "T20I", runs: 48, balls: 35, phase: "Powerplay", context_multiplier: 1.05, pressure_label: "Medium", pressure_value: 0.58, performance_score: 26, context_score: 22, pressure_score: 16, im_score: 64, delta: 1 },
    { player_id: "rohit-sharma", innings_num: 9, match: "vs ENG", format: "T20I", runs: 42, balls: 32, phase: "Powerplay", context_multiplier: 1.00, pressure_label: "Medium", pressure_value: 0.55, performance_score: 24, context_score: 22, pressure_score: 17, im_score: 63, delta: -1 },
    { player_id: "rohit-sharma", innings_num: 8, match: "vs SA", format: "T20I", runs: 35, balls: 28, phase: "Middle", context_multiplier: 0.95, pressure_label: "Low", pressure_value: 0.45, performance_score: 22, context_score: 22, pressure_score: 17, im_score: 61, delta: -1 },
    { player_id: "kane-williamson", innings_num: 10, match: "vs AUS", format: "T20I", runs: 52, balls: 44, phase: "Middle", context_multiplier: 1.02, pressure_label: "Medium", pressure_value: 0.60, performance_score: 24, context_score: 22, pressure_score: 15, im_score: 61, delta: -1 },
    { player_id: "kane-williamson", innings_num: 9, match: "vs IND", format: "T20I", runs: 48, balls: 40, phase: "Middle", context_multiplier: 1.05, pressure_label: "High", pressure_value: 0.72, performance_score: 26, context_score: 22, pressure_score: 14, im_score: 62, delta: 1 },
    { player_id: "kane-williamson", innings_num: 8, match: "vs ENG", format: "T20I", runs: 38, balls: 34, phase: "Powerplay", context_multiplier: 0.92, pressure_label: "Low", pressure_value: 0.48, performance_score: 22, context_score: 22, pressure_score: 16, im_score: 60, delta: -1 },
    { player_id: "david-warner", innings_num: 10, match: "vs IND", format: "T20I", runs: 32, balls: 28, phase: "Powerplay", context_multiplier: 0.90, pressure_label: "Medium", pressure_value: 0.55, performance_score: 20, context_score: 16, pressure_score: 12, im_score: 48, delta: -1 },
    { player_id: "david-warner", innings_num: 9, match: "vs ENG", format: "T20I", runs: 28, balls: 22, phase: "Powerplay", context_multiplier: 0.88, pressure_label: "Low", pressure_value: 0.42, performance_score: 18, context_score: 17, pressure_score: 14, im_score: 49, delta: 1 },
    { player_id: "david-warner", innings_num: 8, match: "vs PAK", format: "T20I", runs: 22, balls: 20, phase: "Powerplay", context_multiplier: 0.85, pressure_label: "Low", pressure_value: 0.40, performance_score: 16, context_score: 16, pressure_score: 15, im_score: 47, delta: -1 },
    { player_id: "babar-azam", innings_num: 10, match: "vs ENG", format: "T20I", runs: 30, balls: 28, phase: "Middle", context_multiplier: 0.92, pressure_label: "High", pressure_value: 0.72, performance_score: 18, context_score: 14, pressure_score: 11, im_score: 43, delta: -1 },
    { player_id: "babar-azam", innings_num: 9, match: "vs IND", format: "T20I", runs: 25, balls: 24, phase: "Middle", context_multiplier: 0.95, pressure_label: "Very High", pressure_value: 0.88, performance_score: 16, context_score: 16, pressure_score: 12, im_score: 44, delta: 1 },
    { player_id: "babar-azam", innings_num: 8, match: "vs NZ", format: "T20I", runs: 35, balls: 30, phase: "Powerplay", context_multiplier: 0.88, pressure_label: "Medium", pressure_value: 0.58, performance_score: 20, context_score: 14, pressure_score: 10, im_score: 42, delta: -1 },
];

// Helper: get players sorted by IM score (leaderboard)
export function getLeaderboard() {
    return [...playersData].sort((a, b) => b.im_score - a.im_score);
}

// Helper: get player by ID
export function getPlayerById(id) {
    return playersData.find(p => p.id === id) || null;
}

// Helper: get innings for a player
export function getPlayerInnings(id) {
    return inningsData.filter(i => i.player_id === id);
}

// Helper: get compare data
export function getCompareData(id1, id2) {
    const p1 = getPlayerById(id1);
    const p2 = getPlayerById(id2);
    if (!p1 || !p2) return null;
    return {
        player1: { ...p1, innings: getPlayerInnings(id1) },
        player2: { ...p2, innings: getPlayerInnings(id2) },
    };
}
