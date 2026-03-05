import playersRaw from './players.json?raw';
import inningsRaw from './innings.json?raw';

export const playersData = JSON.parse(playersRaw);
export const inningsData = JSON.parse(inningsRaw);

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
