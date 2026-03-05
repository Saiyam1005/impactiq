"""
ImpactIQ — Impact Metric (IM) Calculator
Calculates the composite Impact Metric for cricket players.
"""
import math


def calculate_performance_score(runs, balls, wickets=0, economy=0, role="BAT"):
    """Calculate raw performance score (0-40)."""
    if role == "BAT":
        sr = (runs / balls) * 100 if balls > 0 else 0
        base = runs * 0.6
        sr_bonus = max(0, (sr - 100) * 0.15)
        return min(40, base * 0.3 + sr_bonus)
    else:
        wicket_score = wickets * 8
        economy_bonus = max(0, (9 - economy) * 2)
        return min(40, wicket_score + economy_bonus)


def calculate_context_multiplier(phase, required_rr=None, current_rr=None,
                                  wickets_fallen=0, is_chase=False):
    """Calculate context multiplier (0.7x - 1.5x)."""
    phase_map = {
        "Powerplay": 0.9, "Middle": 1.0, "Death": 1.2,
        "Chase-Death": 1.4, "All phases": 1.1,
        "Middle-Death": 1.15
    }
    base = phase_map.get(phase, 1.0)
    if is_chase and required_rr and current_rr:
        rr_diff = required_rr - current_rr
        base += max(0, rr_diff * 0.05)
    wicket_pressure = min(0.3, wickets_fallen * 0.05)
    base += wicket_pressure
    return min(1.5, max(0.7, base))


def calculate_pressure_index(pressure_level, match_importance=1.0,
                              is_knockout=False):
    """Calculate pressure index (0-25)."""
    pressure_map = {
        "Low": 0.4, "Medium": 0.6, "High": 0.8,
        "Very High": 0.9, "Extreme": 1.0
    }
    p = pressure_map.get(pressure_level, 0.5)
    importance_multiplier = 1.3 if is_knockout else 1.0
    return min(25, p * 20 * importance_multiplier)


def calculate_recency_weight(innings_position, total_innings=10, lambda_val=0.15):
    """Calculate recency weight using exponential decay."""
    age = total_innings - innings_position
    return math.exp(-lambda_val * age)


def calculate_final_im(innings_list):
    """Calculate the final normalised IM score (0-100)."""
    if not innings_list:
        return 0

    raw_scores = []
    for i, innings in enumerate(innings_list):
        perf = innings["performance_score"]
        ctx = innings["context_score"] / 35
        pressure = innings["pressure_score"] / 25
        recency = calculate_recency_weight(i + 1, len(innings_list))
        raw = perf * ctx * pressure * recency * 100
        raw_scores.append(raw)

    total = sum(raw_scores)
    min_val, max_val = 20, 120
    normalized = ((total / len(raw_scores)) - min_val) / (max_val - min_val) * 100
    return max(0, min(100, round(normalized + 50, 1)))


def calculate_im_from_inputs(runs=0, balls=0, wickets=0, economy=0,
                              phase="Middle", pressure_level="Medium",
                              match_importance=1.0, is_chase=False,
                              role="BAT"):
    """All-in-one IM calculation from raw match inputs."""
    perf = calculate_performance_score(runs, balls, wickets, economy, role)
    ctx = calculate_context_multiplier(phase, is_chase=is_chase)
    pressure = calculate_pressure_index(pressure_level, match_importance)

    raw_im = perf * (ctx / 1.5) * (pressure / 25) * 100
    min_val, max_val = 20, 120
    normalized = ((raw_im) - min_val) / (max_val - min_val) * 100
    final = max(0, min(100, round(normalized + 50, 1)))

    return {
        "im_score": final,
        "performance_score": round(perf, 1),
        "context_multiplier": round(ctx, 2),
        "pressure_index": round(pressure, 1),
        "breakdown": {
            "performance": round(perf, 1),
            "context": round(ctx * 23.3, 1),
            "pressure": round(pressure, 1),
        }
    }
