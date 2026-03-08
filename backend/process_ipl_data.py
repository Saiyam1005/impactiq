"""
Script to process ball-by-ball IPL CSV data and generate
aggregated `players.json` and `innings.json` for the backend.
"""

import os
import glob
import pandas as pd
import json
from calculator import calculate_im_from_inputs

CSV_DIR = "../ipl_male_csv2"
PLAYERS_JSON_PATH = "data/players.json"
INNINGS_JSON_PATH = "data/innings.json"

def get_phase(ball):
    """Determine match phase based on over number."""
    over = int(float(ball))
    if over < 6:
        return "Powerplay"
    elif over < 15:
        return "Middle"
    else:
        return "Death"

def process_csv_files():
    print(f"Looking for CSV files in {CSV_DIR}...")
    csv_files = glob.glob(os.path.join(CSV_DIR, "*.csv"))
    # Filter out _info.csv files
    ball_files = [f for f in csv_files if not f.endswith("_info.csv")]
    
    # Process all matches
    ball_files = sorted(ball_files, reverse=True)
    
    print(f"Found {len(ball_files)} match files to process.")

    player_stats = {}
    all_innings = []
    
    for file_path in ball_files:
        try:
            df = pd.read_csv(file_path, low_memory=False)
            
            # Basic info about the match
            match_id = df['match_id'].iloc[0]
            start_date = df['start_date'].iloc[0]
            
            # Determine team names to construct 'vs TEAM' string
            teams = df['batting_team'].unique()
            
            # --- AGGREGATE BATTING STATS ---
            # Group by striker and innings to get runs per match
            batting_group = df.groupby(['striker', 'innings', 'batting_team']).agg(
                runs=('runs_off_bat', 'sum'),
                balls=('ball', 'count')
            ).reset_index()
            
            for _, row in batting_group.iterrows():
                player_name = row['striker']
                runs = int(row['runs'])
                balls = int(row['balls'])
                innings_num = int(row['innings'])
                team = row['batting_team']
                
                # Find opponent
                opponent = teams[0] if len(teams) > 1 and teams[1] == team else (teams[1] if len(teams) > 1 else team)
                opponent_short = opponent[:3].upper()
                
                # Find predominant phase
                player_balls = df[(df['striker'] == player_name) & (df['innings'] == innings_num)]
                if not player_balls.empty:
                    avg_over = player_balls['ball'].astype(float).astype(int).mean()
                    if pd.isna(avg_over): phase = "Middle"
                    elif avg_over < 6: phase = "Powerplay"
                    elif avg_over < 15: phase = "Middle"
                    else: phase = "Death"
                else:
                    phase = "Middle"
                
                if innings_num > 1:
                    phase = "Chase-" + phase
                    is_chase = True
                else:
                    is_chase = False

                # We roughly estimate pressure/context for now based on phase
                # In a real scenario we'd calculate RR, wickets etc.
                req_rr = 9.0 if is_chase else 0
                curr_rr = (runs/balls * 6) if balls > 0 else 0
                wickets_down = 3 
                pressure_level = "High" if is_chase and phase.endswith("Death") else "Medium"
                
                # Mock a role for the calculator
                role = "BAT"
                
                # We need wickets/economy for the calculator even for batters (will be 0)
                wickets = 0
                economy = 0.0
                
                # Calculate scores
                from calculator import calculate_performance_score, calculate_context_multiplier, calculate_pressure_index
                
                perf = calculate_performance_score(runs, balls, wickets, economy, role)
                context = calculate_context_multiplier(phase, req_rr, curr_rr, wickets_down, is_chase)
                pressure = calculate_pressure_index(pressure_level, 1.0, False)
                pressure_label = pressure_level
                pressure_val = round(pressure / 25.0, 2)
                
                im_score = int(min(100, (perf * context * pressure) / 5)) # rough scaling
                
                player_id = player_name.lower().replace(" ", "-")
                
                inning_data = {
                    "player_id": player_id,
                    "innings_num": 1, # will be reassigned later
                    "match": f"vs {opponent_short}",
                    "format": "T20",
                    "date": str(start_date),
                    "runs": runs,
                    "balls": balls,
                    "phase": phase,
                    "context_multiplier": context,
                    "pressure_label": pressure_label,
                    "pressure_value": pressure_val,
                    "performance_score": int(perf),
                    "context_score": int(context * 20),
                    "pressure_score": int(pressure * 20),
                    "im_score": im_score,
                    "wickets": 0,
                    "economy": 0.0,
                    "delta": 0,
                }
                
                all_innings.append(inning_data)
                
                # Initialize player aggregate
                if player_id not in player_stats:
                    player_stats[player_id] = {
                        "id": player_id,
                        "name": player_name,
                        "country": "India", # Defaulting
                        "flag": "🇮🇳",
                        "role": "BAT",
                        "matches": 0,
                        "total_runs": 0,
                        "total_balls": 0,
                        "hs_val": 0,
                        "photo_placeholder": "".join([p[0] for p in player_name.split() if p])[:2].upper(),
                        "im_scores": [],
                    }
                
                player_stats[player_id]["matches"] += 1
                player_stats[player_id]["total_runs"] += runs
                player_stats[player_id]["total_balls"] += balls
                if runs > player_stats[player_id]["hs_val"]:
                    player_stats[player_id]["hs_val"] = runs
                player_stats[player_id]["im_scores"].append(im_score)

            # --- AGGREGATE BOWLING STATS ---
            # Group by bowler and innings
            bowling_group = df.groupby(['bowler', 'innings', 'bowling_team']).agg(
                balls=('ball', 'count'),
                runs_conceded=('runs_off_bat', 'sum'),
                wides=('wides', lambda x: x.notna().sum()),
                noballs=('noballs', lambda x: x.notna().sum())
            ).reset_index()
            
            # Add wickets
            wickets_df = df.dropna(subset=['wicket_type'])
            # Exclude run outs for bowler's wicket count
            wickets_df = wickets_df[~wickets_df['wicket_type'].isin(['run out', 'retired hurt', 'obstructing the field'])]
            wicket_counts = wickets_df.groupby(['bowler', 'innings']).size().reset_index(name='wickets')
            
            bowling_stats = pd.merge(bowling_group, wicket_counts, on=['bowler', 'innings'], how='left').fillna(0)
            
            for _, row in bowling_stats.iterrows():
                player_name = row['bowler']
                balls = int(row['balls']) - int(row['wides']) - int(row['noballs']) # legit balls
                overs = balls / 6.0
                runs_conc = int(row['runs_conceded']) + int(row['wides']) + int(row['noballs']) # basic approx
                wickets = int(row['wickets'])
                team = row['bowling_team']
                
                if overs == 0: continue
                economy = round(runs_conc / overs, 1)
                
                opponent = teams[0] if len(teams) > 1 and teams[1] == team else (teams[1] if len(teams) > 1 else team)
                opponent_short = opponent[:3].upper()
                
                player_id = player_name.lower().replace(" ", "-")
                
                # Note: For brevity in this script, we are adding bowling as separate innings.
                # In a robust system, we would merge batting and bowling for the same match.
                
                if player_id not in player_stats:
                    player_stats[player_id] = {
                        "id": player_id,
                        "name": player_name,
                        "country": "India",
                        "flag": "🇮🇳",
                        "role": "BOWL",
                        "matches": 0,
                        "total_runs": 0,
                        "total_balls": 0,
                        "hs_val": 0,
                        "total_wkts": 0,
                        "total_overs": 0,
                        "photo_placeholder": "".join([p[0] for p in player_name.split() if p])[:2].upper(),
                        "im_scores": [],
                    }
                else:
                    player_stats[player_id]["role"] = "ALL" # Played as bat and bowl
                    
                if "total_wkts" not in player_stats[player_id]:
                    player_stats[player_id]["total_wkts"] = 0
                    player_stats[player_id]["total_overs"] = 0
                    
                player_stats[player_id]["matches"] += 1
                player_stats[player_id]["total_wkts"] += wickets
                player_stats[player_id]["total_overs"] += overs
                
                # Calculate bowl IM
                from calculator import calculate_performance_score, calculate_context_multiplier, calculate_pressure_index
                
                perf = calculate_performance_score(0, 0, wickets, economy, "BOWL")
                # context = simplified
                context = 1.0
                pressure = calculate_pressure_index("Medium", 1.0, False)
                pressure_label = "Medium"
                pressure_val = round(pressure / 25.0, 2)
                
                im_score = int(min(100, (perf * context * pressure) / 5)) 
                
                player_stats[player_id]["im_scores"].append(im_score)
                
                inning_data = {
                    "player_id": player_id,
                    "innings_num": 1, 
                    "match": f"vs {opponent_short}",
                    "format": "T20",
                    "date": str(start_date),
                    "runs": 0,
                    "balls": 0,
                    "phase": "All phases",
                    "context_multiplier": context,
                    "pressure_label": pressure_label,
                    "pressure_value": pressure_val,
                    "performance_score": int(perf),
                    "context_score": int(context * 20),
                    "pressure_score": int(pressure * 20),
                    "im_score": im_score,
                    "wickets": wickets,
                    "economy": economy,
                    "delta": 0,
                }
                
                all_innings.append(inning_data)
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    # --- FINALIZE PLAYERS DATA ---
    final_players = []
    
    # Sort innings by date descending
    all_innings.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    # Assign sequential innings numbers per player and calculate trend
    player_inning_counts = {}
    final_innings = []
    
    for i in range(len(all_innings)):
        # We need to reverse the order to assign 1, 2, 3 chronologically
        pass
        
    for p_id, stats in player_stats.items():
        # Only keep players with at least some data
        if stats["matches"] < 2:
            continue
            
        avg = round(stats["total_runs"] / max(1, stats["matches"] * 0.8), 1) # rough avg
        sr = round((stats["total_runs"] / max(1, stats["total_balls"])) * 100, 1)
        
        im_trend_full = stats["im_scores"][-10:] if len(stats["im_scores"]) > 0 else [50]
        # Pad if less than 10
        while len(im_trend_full) < 10:
            im_trend_full.insert(0, im_trend_full[0])
            
        final_im = int(sum(im_trend_full) / len(im_trend_full))
        
        hs_str = str(stats["hs_val"])
        if stats.get("role") == "BOWL":
            avg = round((stats["total_overs"] * 6) / max(1, stats["total_wkts"]), 1)
            sr = round((stats["total_overs"] * 6) / max(1, stats["total_wkts"]), 1)
            hs_str = f"economy: {round((stats.get('total_wkts', 1)*6) / max(1, stats.get('total_overs', 1)), 1)}" # rough
            
        # Add basic badges
        badges = []
        if final_im > 75: badges.append("MATCH WINNER")
        if sr > 140: badges.append("POWER HITTER")
        if avg > 35: badges.append("CONSISTENT")
        if not badges: badges = ["REGULAR"]
            
        player_format = {
            "id": stats["id"],
            "name": stats["name"],
            "country": stats["country"],
            "flag": stats["flag"],
            "role": stats["role"],
            "matches": stats["matches"],
            "avg": avg,
            "sr": sr,
            "hs": hs_str,
            "photo_placeholder": stats["photo_placeholder"],
            "im_score": final_im,
            "im_trend": im_trend_full,
            "badges": badges
        }
        final_players.append(player_format)
        
    # Process innings numbers
    # Group innings by player id
    player_inns_lists = {}
    for inv in all_innings:
        pid = inv["player_id"]
        if pid not in final_players_ids(final_players):
            continue
        if pid not in player_inns_lists:
            player_inns_lists[pid] = []
        player_inns_lists[pid].append(inv)
        
    for pid, inns in player_inns_lists.items():
        # list is sorted date descending. We want innings 10 to be most recent.
        inns = inns[:10] # keep last 10
        for idx, inn in enumerate(inns):
            inn["innings_num"] = len(inns) - idx # recent is highest num
            final_innings.append(inn)
            
    print(f"Generated data for {len(final_players)} players and {len(final_innings)} innings.")
    
    # Save to JSON
    with open(PLAYERS_JSON_PATH, 'w') as f:
        json.dump(final_players, f, indent=2)
        
    with open(INNINGS_JSON_PATH, 'w') as f:
        json.dump(final_innings, f, indent=2)
        
    print("Successfully writing to JSON files.")

def final_players_ids(players_list):
    return [p["id"] for p in players_list]

if __name__ == "__main__":
    process_csv_files()
