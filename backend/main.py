"""
ImpactIQ — FastAPI Backend
Cricket Intelligence Platform API
"""
import json
import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from calculator import calculate_im_from_inputs
from models import IMCalculationRequest

app = FastAPI(title="ImpactIQ API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

with open(os.path.join(DATA_DIR, "players.json"), "r", encoding="utf-8") as f:
    PLAYERS = json.load(f)

with open(os.path.join(DATA_DIR, "innings.json"), "r", encoding="utf-8") as f:
    INNINGS = json.load(f)

with open(os.path.join(DATA_DIR, "matches.json"), "r", encoding="utf-8") as f:
    MATCHES = json.load(f)

with open(os.path.join(DATA_DIR, "predictions.json"), "r", encoding="utf-8") as f:
    PREDICTIONS = json.load(f)

MATCHES_MAP = {m["match_id"]: m for m in MATCHES}

# Index for quick lookup
PLAYERS_MAP = {p["id"]: p for p in PLAYERS}
INNINGS_MAP = {}
for inn in INNINGS:
    pid = inn["player_id"]
    if pid not in INNINGS_MAP:
        INNINGS_MAP[pid] = []
    INNINGS_MAP[pid].append(inn)

# Sort each player's innings by innings_num descending
for pid in INNINGS_MAP:
    INNINGS_MAP[pid].sort(key=lambda x: x["innings_num"], reverse=True)


@app.get("/")
def root():
    return {"message": "ImpactIQ API v1.0", "status": "online"}


@app.get("/api/players")
def get_players():
    """Get all players summary."""
    return PLAYERS


@app.get("/api/players/{player_id}")
def get_player(player_id: str):
    """Get full player detail including innings."""
    player = PLAYERS_MAP.get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    result = {**player, "innings": INNINGS_MAP.get(player_id, [])}
    return result


@app.get("/api/players/{player_id}/innings")
def get_player_innings(player_id: str):
    """Get last 10 innings for a player."""
    if player_id not in PLAYERS_MAP:
        raise HTTPException(status_code=404, detail="Player not found")
    return INNINGS_MAP.get(player_id, [])


@app.get("/api/leaderboard")
def get_leaderboard(
    role: Optional[str] = Query(None, description="Filter by role: BAT, BOWL, ALL"),
    country: Optional[str] = Query(None, description="Filter by country")
):
    """Get players sorted by IM score."""
    result = PLAYERS[:]
    if role and role != "ALL":
        result = [p for p in result if p["role"] == role]
    if country:
        result = [p for p in result if p["country"].lower() == country.lower()]
    result.sort(key=lambda x: x["im_score"], reverse=True)
    return result


@app.get("/api/compare/{player1_id}/{player2_id}")
def compare_players(player1_id: str, player2_id: str):
    """Compare two players."""
    p1 = PLAYERS_MAP.get(player1_id)
    p2 = PLAYERS_MAP.get(player2_id)
    if not p1:
        raise HTTPException(status_code=404, detail=f"Player {player1_id} not found")
    if not p2:
        raise HTTPException(status_code=404, detail=f"Player {player2_id} not found")
    return {
        "player1": {**p1, "innings": INNINGS_MAP.get(player1_id, [])},
        "player2": {**p2, "innings": INNINGS_MAP.get(player2_id, [])},
    }


@app.post("/api/calculate-im")
def calculate_im(req: IMCalculationRequest):
    """Calculate IM score from raw inputs."""
    result = calculate_im_from_inputs(
        runs=req.runs,
        balls=req.balls,
        wickets=req.wickets,
        economy=req.economy,
        phase=req.phase,
        pressure_level=req.pressure_level,
        match_importance=req.match_importance,
        is_chase=req.is_chase,
        role=req.role,
    )
    return result


# ── Match endpoints ──────────────────────────────────────────────────

@app.get("/api/matches")
def get_matches(
    season: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Get past matches with optional filters."""
    result = MATCHES[:]
    if season:
        result = [m for m in result if m["season"] == season]
    if team:
        t = team.upper()
        result = [m for m in result if t in (m["team1_short"], m["team2_short"])]
    total = len(result)
    return {"total": total, "matches": result[offset:offset + limit]}


@app.get("/api/matches/{match_id}")
def get_match(match_id: str):
    """Get full match detail with scorecard, impact, turning points."""
    m = MATCHES_MAP.get(match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")
    return m


@app.get("/api/seasons")
def get_seasons():
    """Get all available seasons."""
    seasons = sorted(set(m["season"] for m in MATCHES), reverse=True)
    return seasons


@app.get("/api/predictions")
def get_predictions():
    """Get 3 upcoming match predictions."""
    return PREDICTIONS
