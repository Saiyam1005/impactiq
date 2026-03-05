"""Pydantic models for ImpactIQ API request/response validation."""
from pydantic import BaseModel
from typing import List, Optional


class IMCalculationRequest(BaseModel):
    runs: int = 0
    balls: int = 0
    wickets: int = 0
    economy: float = 0
    phase: str = "Middle"
    pressure_level: str = "Medium"
    match_importance: float = 1.0
    is_chase: bool = False
    role: str = "BAT"


class IMBreakdown(BaseModel):
    performance: float
    context: float
    pressure: float


class IMCalculationResponse(BaseModel):
    im_score: float
    performance_score: float
    context_multiplier: float
    pressure_index: float
    breakdown: IMBreakdown


class InningsData(BaseModel):
    player_id: str
    innings_num: int
    match: str
    format: str
    runs: int
    balls: int
    phase: str
    context_multiplier: float
    pressure_label: str
    pressure_value: float
    performance_score: float
    context_score: float
    pressure_score: float
    im_score: float
    delta: int
    wickets: Optional[int] = None
    economy: Optional[float] = None


class PlayerSummary(BaseModel):
    id: str
    name: str
    country: str
    flag: str
    role: str
    matches: int
    avg: float
    sr: float
    hs: str
    photo_placeholder: str
    im_score: float
    im_trend: List[float]
    badges: List[str]


class PlayerDetail(PlayerSummary):
    innings: Optional[List[InningsData]] = None
