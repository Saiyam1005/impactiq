"""
Process ALL IPL match CSVs to generate:
  - matches.json       → match-level scorecards with impact analysis
  - predictions.json   → 3 upcoming match predictions based on team/player form
"""
import os, glob, json, math, random
from collections import defaultdict
import pandas as pd
from calculator import (
    calculate_performance_score,
    calculate_context_multiplier,
    calculate_pressure_index,
)

CSV_DIR = os.path.join(os.path.dirname(__file__), "..", "ipl_male_csv2")
OUT_DIR = os.path.join(os.path.dirname(__file__), "data")

# ── IPL team short names ────────────────────────────────────────────
SHORT = {
    "Chennai Super Kings": "CSK",
    "Mumbai Indians": "MI",
    "Royal Challengers Bangalore": "RCB",
    "Royal Challengers Bengaluru": "RCB",
    "Kolkata Knight Riders": "KKR",
    "Sunrisers Hyderabad": "SRH",
    "Rajasthan Royals": "RR",
    "Delhi Capitals": "DC",
    "Delhi Daredevils": "DD",
    "Punjab Kings": "PBKS",
    "Kings XI Punjab": "KXIP",
    "Gujarat Titans": "GT",
    "Lucknow Super Giants": "LSG",
    "Rising Pune Supergiant": "RPS",
    "Rising Pune Supergiants": "RPS",
    "Gujarat Lions": "GL",
    "Pune Warriors": "PW",
    "Kochi Tuskers Kerala": "KTK",
    "Deccan Chargers": "DCH",
}

def short(team):
    return SHORT.get(team, team[:3].upper())


def parse_info(info_path):
    """Parse an _info.csv file into a dict of metadata."""
    meta = {"teams": [], "players": defaultdict(list)}
    with open(info_path, encoding="utf-8") as f:
        for line in f:
            parts = [p.strip().strip('"') for p in line.strip().split(",")]
            if len(parts) < 2:
                continue
            if parts[0] == "info":
                key = parts[1]
                if key == "team":
                    meta["teams"].append(parts[2])
                elif key == "player":
                    meta["players"][parts[2]].append(parts[3])
                elif key == "winner":
                    meta["winner"] = parts[2]
                elif key == "winner_runs":
                    meta["winner_runs"] = int(parts[2])
                elif key == "winner_wickets":
                    meta["winner_wickets"] = int(parts[2])
                elif key == "player_of_match":
                    meta["player_of_match"] = parts[2]
                elif key == "venue":
                    meta["venue"] = parts[2]
                elif key == "city":
                    meta["city"] = parts[2]
                elif key == "season":
                    meta["season"] = parts[2]
                elif key == "date":
                    meta["date"] = parts[2].replace("/", "-")
                elif key == "toss_winner":
                    meta["toss_winner"] = parts[2]
                elif key == "toss_decision":
                    meta["toss_decision"] = parts[2]
                elif key == "match_number":
                    meta["match_number"] = parts[2]
    return meta


def compute_batting_card(df, innings_num):
    """Return a list of batter scorecards for a given innings."""
    inn_df = df[df["innings"] == innings_num]
    if inn_df.empty:
        return []
    card = []
    grouped = inn_df.groupby("striker")
    order = inn_df.drop_duplicates(subset=["striker"])["striker"].tolist()

    for name in order:
        grp = inn_df[inn_df["striker"] == name]
        runs = int(grp["runs_off_bat"].sum())
        balls = len(grp)
        fours = int((grp["runs_off_bat"] == 4).sum())
        sixes = int((grp["runs_off_bat"] == 6).sum())
        sr = round(runs / balls * 100, 1) if balls else 0
        # dismissal
        dismissed = grp[grp["player_dismissed"].notna() & (grp["player_dismissed"] == name)]
        if not dismissed.empty:
            how_out = dismissed.iloc[0]["wicket_type"]
            bowler = dismissed.iloc[0]["bowler"]
            dismissal = f"{how_out} b {bowler}"
        else:
            dismissal = "not out"
        card.append({
            "name": name,
            "runs": runs,
            "balls": balls,
            "fours": fours,
            "sixes": sixes,
            "sr": sr,
            "dismissal": dismissal,
        })
    return card


def compute_bowling_card(df, innings_num):
    """Return a list of bowler scorecards for a given innings."""
    inn_df = df[df["innings"] == innings_num]
    if inn_df.empty:
        return []
    card = []
    order = inn_df.drop_duplicates(subset=["bowler"])["bowler"].tolist()

    for name in order:
        grp = inn_df[inn_df["bowler"] == name]
        balls_count = len(grp) - int(grp["wides"].notna().sum()) - int(grp["noballs"].notna().sum())
        overs = balls_count // 6
        rem = balls_count % 6
        overs_str = f"{overs}.{rem}" if rem else str(overs)
        runs_conc = int(grp["runs_off_bat"].sum()) + int(grp["extras"].sum())
        # wickets credited to this bowler
        wkt_df = grp[grp["wicket_type"].notna()]
        wkt_df = wkt_df[~wkt_df["wicket_type"].isin(["run out", "retired hurt", "obstructing the field"])]
        wickets = len(wkt_df)
        econ = round(runs_conc / (balls_count / 6), 1) if balls_count > 0 else 0
        dots = int((grp["runs_off_bat"] == 0).sum() & (grp["extras"].fillna(0).astype(int) == 0).sum()) if len(grp) else 0
        card.append({
            "name": name,
            "overs": overs_str,
            "runs": runs_conc,
            "wickets": wickets,
            "economy": econ,
            "dots": dots,
        })
    return card


def compute_innings_total(df, innings_num):
    inn_df = df[df["innings"] == innings_num]
    if inn_df.empty:
        return {"runs": 0, "wickets": 0, "overs": "0.0"}
    total_runs = int(inn_df["runs_off_bat"].sum()) + int(inn_df["extras"].sum())
    wickets_df = inn_df[inn_df["wicket_type"].notna()]
    wkts = len(wickets_df)
    balls = len(inn_df)
    o = balls // 6
    r = balls % 6
    overs_str = f"{o}.{r}" if r else str(o)
    return {"runs": total_runs, "wickets": wkts, "overs": overs_str}


def find_turning_points(df, innings_num, batting_team, total_1st=None):
    """Detect turning points: clusters of wickets, big overs, collapse."""
    inn_df = df[df["innings"] == innings_num].copy()
    if inn_df.empty:
        return []
    turning = []
    inn_df = inn_df.reset_index(drop=True)

    # Track over-by-over
    inn_df["over_num"] = inn_df["ball"].astype(float).astype(int)
    over_groups = inn_df.groupby("over_num")

    prev_score = 0
    prev_wkts = 0
    running_score = 0
    running_wkts = 0

    for ov, grp in over_groups:
        runs_in_over = int(grp["runs_off_bat"].sum()) + int(grp["extras"].sum())
        wkts_in_over = int(grp["wicket_type"].notna().sum())
        running_score += runs_in_over
        running_wkts += wkts_in_over

        # Big over (15+ runs)
        if runs_in_over >= 15:
            turning.append({
                "over": ov + 1,
                "type": "big_over",
                "title": f"Explosive Over {ov + 1}",
                "description": f"{runs_in_over} runs scored in over {ov + 1} — massive momentum for {short(batting_team)}!",
                "impact": min(95, 50 + runs_in_over * 2),
            })

        # Wicket cluster (2+ in an over)
        if wkts_in_over >= 2:
            dismissed = grp[grp["wicket_type"].notna()]["player_dismissed"].tolist()
            turning.append({
                "over": ov + 1,
                "type": "wicket_cluster",
                "title": f"Double Strike – Over {ov + 1}",
                "description": f"{wkts_in_over} wickets fell: {', '.join([str(d) for d in dismissed])}. Bowling team seizes control!",
                "impact": min(95, 50 + wkts_in_over * 15),
            })

        # Chase pressure: required rate spikes above 12
        if innings_num == 2 and total_1st is not None:
            balls_left = 120 - len(inn_df.loc[:grp.index[-1]])
            need = total_1st - running_score
            if balls_left > 0 and need > 0:
                rrr = need / balls_left * 6
                if rrr > 12:
                    turning.append({
                        "over": ov + 1,
                        "type": "pressure",
                        "title": f"Pressure Mounts – Over {ov + 1}",
                        "description": f"Required rate soars to {rrr:.1f}! {short(batting_team)} under immense pressure.",
                        "impact": min(95, int(rrr * 5)),
                    })

    # De-duplicate: keep only the top 3 by impact
    turning.sort(key=lambda x: x["impact"], reverse=True)
    return turning[:3]


def compute_player_impacts(df, innings_num, is_chase, total_1st=None):
    """Compute impact scores for every batter and bowler in an innings."""
    inn_df = df[df["innings"] == innings_num]
    if inn_df.empty:
        return []
    impacts = []

    # Batters
    for name, grp in inn_df.groupby("striker"):
        runs = int(grp["runs_off_bat"].sum())
        balls = len(grp)
        if balls == 0:
            continue
        avg_over = grp["ball"].astype(float).astype(int).mean()
        if avg_over < 6:
            phase = "Powerplay"
        elif avg_over < 15:
            phase = "Middle"
        else:
            phase = "Death"
        if is_chase:
            phase = "Chase-" + phase
        perf = calculate_performance_score(runs, balls, 0, 0, "BAT")
        ctx = calculate_context_multiplier(phase, is_chase=is_chase)
        wkts_fallen = int(inn_df.loc[:grp.index[-1], "wicket_type"].notna().sum())
        pressure_label = "High" if (is_chase and phase.endswith("Death")) else "Medium"
        pres = calculate_pressure_index(pressure_label, 1.0, False)
        im = min(100, int((perf * ctx * pres) / 5))
        impacts.append({
            "name": name, "role": "BAT", "im_score": im,
            "stat_line": f"{runs}({balls})",
        })

    # Bowlers
    for name, grp in inn_df.groupby("bowler"):
        balls_count = len(grp) - int(grp["wides"].notna().sum()) - int(grp["noballs"].notna().sum())
        if balls_count == 0:
            continue
        runs_conc = int(grp["runs_off_bat"].sum()) + int(grp["extras"].sum())
        econ = runs_conc / (balls_count / 6) if balls_count > 0 else 99
        wkt_df = grp[grp["wicket_type"].notna()]
        wkt_df = wkt_df[~wkt_df["wicket_type"].isin(["run out", "retired hurt", "obstructing the field"])]
        wickets = len(wkt_df)
        perf = calculate_performance_score(0, 0, wickets, econ, "BOWL")
        ctx = 1.1
        pres = calculate_pressure_index("Medium", 1.0, False)
        im = min(100, int((perf * ctx * pres) / 5))
        ov = balls_count // 6
        r = balls_count % 6
        ov_str = f"{ov}.{r}" if r else str(ov)
        impacts.append({
            "name": name, "role": "BOWL", "im_score": im,
            "stat_line": f"{wickets}/{runs_conc} ({ov_str})",
        })

    impacts.sort(key=lambda x: x["im_score"], reverse=True)
    return impacts


# ── MAIN PROCESSING ─────────────────────────────────────────────────
def process_all_matches():
    info_files = sorted(glob.glob(os.path.join(CSV_DIR, "*_info.csv")))
    print(f"Found {len(info_files)} match info files.")

    matches = []
    team_form = defaultdict(list)       # team → list of (date, win/loss)
    team_recent_scores = defaultdict(list)
    player_form = defaultdict(list)     # player → list of IM scores

    for idx, info_path in enumerate(info_files):
        match_id = os.path.basename(info_path).replace("_info.csv", "")
        ball_path = info_path.replace("_info.csv", ".csv")
        if not os.path.exists(ball_path):
            continue

        try:
            meta = parse_info(info_path)
            df = pd.read_csv(ball_path, low_memory=False)

            if len(meta["teams"]) < 2:
                continue

            team1, team2 = meta["teams"][0], meta["teams"][1]
            total_1 = compute_innings_total(df, 1)
            total_2 = compute_innings_total(df, 2)

            bat_card_1 = compute_batting_card(df, 1)
            bat_card_2 = compute_batting_card(df, 2)
            bowl_card_1 = compute_bowling_card(df, 1)
            bowl_card_2 = compute_bowling_card(df, 2)

            tp_1 = find_turning_points(df, 1, team1)
            tp_2 = find_turning_points(df, 2, team2, total_1["runs"])

            impacts_1 = compute_player_impacts(df, 1, False)
            impacts_2 = compute_player_impacts(df, 2, True, total_1["runs"])

            all_impacts = impacts_1 + impacts_2
            all_impacts.sort(key=lambda x: x["im_score"], reverse=True)
            top_impact = all_impacts[0] if all_impacts else None

            all_tp = tp_1 + tp_2
            all_tp.sort(key=lambda x: x["impact"], reverse=True)
            main_turning = all_tp[0] if all_tp else None

            # Result string
            winner = meta.get("winner", "")
            if "winner_runs" in meta:
                result = f"{short(winner)} won by {meta['winner_runs']} runs"
            elif "winner_wickets" in meta:
                result = f"{short(winner)} won by {meta['winner_wickets']} wickets"
            else:
                result = "No result"

            match_obj = {
                "match_id": match_id,
                "season": meta.get("season", ""),
                "date": meta.get("date", ""),
                "venue": meta.get("venue", ""),
                "city": meta.get("city", ""),
                "team1": team1,
                "team1_short": short(team1),
                "team2": team2,
                "team2_short": short(team2),
                "toss_winner": meta.get("toss_winner", ""),
                "toss_decision": meta.get("toss_decision", ""),
                "winner": winner,
                "winner_short": short(winner) if winner else "",
                "result": result,
                "player_of_match": meta.get("player_of_match", ""),
                "innings1": {
                    "team": team1,
                    "total": total_1,
                    "batting": bat_card_1[:6],
                    "bowling": bowl_card_1[:6],
                },
                "innings2": {
                    "team": team2,
                    "total": total_2,
                    "batting": bat_card_2[:6],
                    "bowling": bowl_card_2[:6],
                },
                "turning_points": (tp_1 + tp_2)[:3],
                "top_impact_player": top_impact,
                "player_impacts": all_impacts[:8],
            }

            matches.append(match_obj)

            # Track form for predictions
            date = meta.get("date", "")
            team_form[team1].append({"date": date, "won": winner == team1})
            team_form[team2].append({"date": date, "won": winner == team2})
            team_recent_scores[team1].append(total_1["runs"] if total_1 else 0)
            team_recent_scores[team2].append(total_2["runs"] if total_2 else 0)

            for imp in impacts_1:
                player_form[imp["name"]].append({"im": imp["im_score"], "team": team1})
            for imp in impacts_2:
                player_form[imp["name"]].append({"im": imp["im_score"], "team": team2})

        except Exception as e:
            if idx < 5:
                print(f"Error processing {match_id}: {e}")
            continue

        if (idx + 1) % 100 == 0:
            print(f"  Processed {idx + 1}/{len(info_files)} matches…")

    # Sort matches by date descending
    matches.sort(key=lambda m: m["date"], reverse=True)
    print(f"Total matches processed: {len(matches)}")

    # ── Generate 3 Upcoming Match Predictions ───────────────────────
    predictions = generate_predictions(team_form, team_recent_scores, player_form, matches)

    # ── Save ────────────────────────────────────────────────────────
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "matches.json"), "w", encoding="utf-8") as f:
        json.dump(matches, f, indent=2)
    with open(os.path.join(OUT_DIR, "predictions.json"), "w", encoding="utf-8") as f:
        json.dump(predictions, f, indent=2)
    print("Saved matches.json and predictions.json")


# ── PREDICTION ENGINE ────────────────────────────────────────────────
IPL_TEAMS_2025 = [
    "Chennai Super Kings", "Mumbai Indians", "Royal Challengers Bangalore",
    "Kolkata Knight Riders", "Sunrisers Hyderabad", "Rajasthan Royals",
    "Delhi Capitals", "Punjab Kings", "Gujarat Titans", "Lucknow Super Giants",
]

IPL_VENUES = [
    "M Chinnaswamy Stadium, Bengaluru",
    "Wankhede Stadium, Mumbai",
    "MA Chidambaram Stadium, Chennai",
]

def team_win_rate(form_list, last_n=20):
    recent = form_list[-last_n:]
    if not recent:
        return 0.5
    wins = sum(1 for f in recent if f["won"])
    return wins / len(recent)


def team_avg_score(scores, last_n=20):
    recent = scores[-last_n:]
    return sum(recent) / len(recent) if recent else 150


def top_form_players(player_form_dict, team_name, n=3):
    """Get top n form players who recently played for this team."""
    scored = []
    for name, entries in player_form_dict.items():
        # Filter entries for this team (use last 30 entries)
        team_entries = [e for e in entries[-30:] if e["team"] == team_name]
        if len(team_entries) >= 2:
            avg = sum(e["im"] for e in team_entries[-5:]) / len(team_entries[-5:])
            scored.append({"name": name, "form": round(avg, 1)})
    scored.sort(key=lambda x: x["form"], reverse=True)
    return scored[:n]


def generate_predictions(team_form, team_recent_scores, player_form, matches):
    """Generate 3 upcoming IPL match predictions."""
    # Find teams that played in the most recent season
    recent_matches = matches[:10]
    recent_teams = set()
    for m in recent_matches:
        recent_teams.add(m["team1"])
        recent_teams.add(m["team2"])

    active_teams = [t for t in IPL_TEAMS_2025 if t in recent_teams]
    if len(active_teams) < 4:
        active_teams = IPL_TEAMS_2025[:6]

    # Build head-to-head records
    h2h = defaultdict(lambda: {"wins": 0, "losses": 0})
    for m in matches:
        t1, t2, winner = m["team1"], m["team2"], m["winner"]
        key12 = f"{t1}_vs_{t2}"
        key21 = f"{t2}_vs_{t1}"
        if winner == t1:
            h2h[key12]["wins"] += 1
            h2h[key21]["losses"] += 1
        elif winner == t2:
            h2h[key21]["wins"] += 1
            h2h[key12]["losses"] += 1

    # Pick 3 diverse matchups (different teams each match)
    random.seed(42)
    random.shuffle(active_teams)
    selected = []
    if len(active_teams) >= 6:
        selected = [
            (active_teams[0], active_teams[1]),
            (active_teams[2], active_teams[3]),
            (active_teams[4], active_teams[5]),
        ]
    elif len(active_teams) >= 4:
        selected = [
            (active_teams[0], active_teams[1]),
            (active_teams[2], active_teams[3]),
            (active_teams[0], active_teams[3]),
        ]
    else:
        for i in range(len(active_teams)):
            for j in range(i + 1, len(active_teams)):
                selected.append((active_teams[i], active_teams[j]))
        selected = selected[:3]

    predictions = []

    for i, (t1, t2) in enumerate(selected):
        wr1 = team_win_rate(team_form.get(t1, []))
        wr2 = team_win_rate(team_form.get(t2, []))
        avg1 = team_avg_score(team_recent_scores.get(t1, []))
        avg2 = team_avg_score(team_recent_scores.get(t2, []))

        key12 = f"{t1}_vs_{t2}"
        key21 = f"{t2}_vs_{t1}"
        h2h_wins_1 = h2h[key12]["wins"]
        h2h_wins_2 = h2h[key21]["wins"]
        total_h2h = h2h_wins_1 + h2h_wins_2
        h2h_factor_1 = h2h_wins_1 / total_h2h if total_h2h > 0 else 0.5

        # Combined win probability
        raw_1 = wr1 * 0.4 + h2h_factor_1 * 0.3 + (avg1 / (avg1 + avg2)) * 0.3
        prob_1 = round(min(0.85, max(0.15, raw_1)) * 100, 1)
        prob_2 = round(100 - prob_1, 1)
        predicted_winner = t1 if prob_1 > prob_2 else t2

        # Key players
        t1_players = top_form_players(player_form, t1, 2)
        t2_players = top_form_players(player_form, t2, 2)

        venue = IPL_VENUES[i % len(IPL_VENUES)]

        predictions.append({
            "match_num": i + 1,
            "team1": t1,
            "team1_short": short(t1),
            "team2": t2,
            "team2_short": short(t2),
            "venue": venue,
            "date": f"2025-06-{15 + i * 2:02d}",
            "team1_win_prob": prob_1,
            "team2_win_prob": prob_2,
            "predicted_winner": predicted_winner,
            "predicted_winner_short": short(predicted_winner),
            "team1_form": round(wr1 * 100, 1),
            "team2_form": round(wr2 * 100, 1),
            "team1_avg_score": round(avg1, 1),
            "team2_avg_score": round(avg2, 1),
            "h2h_total": total_h2h,
            "h2h_team1_wins": h2h_wins_1,
            "h2h_team2_wins": h2h_wins_2,
            "key_players_team1": t1_players,
            "key_players_team2": t2_players,
            "insight": generate_insight(t1, t2, prob_1, prob_2, avg1, avg2, wr1, wr2),
        })

    return predictions


def generate_insight(t1, t2, p1, p2, avg1, avg2, wr1, wr2):
    s1, s2 = short(t1), short(t2)
    if abs(p1 - p2) < 10:
        return f"This is a closely matched contest. {s1} and {s2} have similar recent form, making this a 50-50 battle. Both teams' middle-order depth will be the deciding factor."
    fav = s1 if p1 > p2 else s2
    dog = s2 if p1 > p2 else s1
    fav_wr = wr1 if p1 > p2 else wr2
    return f"{fav} hold the edge with a {fav_wr*100:.0f}% recent win rate. Their batting average of {max(avg1,avg2):.0f} is imposing. {dog} need early wickets to have a chance in this clash."


if __name__ == "__main__":
    process_all_matches()
