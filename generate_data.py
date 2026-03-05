import json
import random

# Read existing data
with open('backend/data/players.json', 'r', encoding='utf-8') as f:
    existing_players = json.load(f)

with open('backend/data/innings.json', 'r', encoding='utf-8') as f:
    existing_innings = json.load(f)

countries = [
    ("India", "🇮🇳"), ("Australia", "🇦🇺"), ("England", "🏴"), 
    ("New Zealand", "🇳🇿"), ("South Africa", "🇿🇦"), ("Pakistan", "🇵🇰"), 
    ("Sri Lanka", "🇱🇰"), ("West Indies", "🏝️"), ("Afghanistan", "🇦🇫"),
    ("Bangladesh", "🇧🇩")
]

first_names = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Gregory", "Frank", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Jose", "Adam", "Nathan", "Henry", "Douglas", "Zachary", "Peter", "Kyle", "Walter", "Ethan", "Jeremy", "Harold", "Keith", "Christian", "Roger", "Noah", "Gerald", "Carl", "Terry", "Sean", "Austin", "Arthur", "Lawrence", "Jesse", "Dylan", "Bryan", "Joe", "Jordan", "Billy", "Bruce", "Albert", "Willie", "Gabriel", "Logan", "Alan", "Juan", "Wayne", "Roy", "Ralph", "Randy", "Eugene", "Vincent", "Russell", "Elijah", "Louis", "Bobby", "Philip", "Johnny"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez"]

badges_list = ["MATCH WINNER", "CHASE MASTER", "PRESSURE PROOF", "IN FORM", "DEATH SPECIALIST", "CLUTCH BOWLER", "SPIN WIZARD", "CONSISTENT", "FORM DIP", "CRISIS", "POWER HITTER", "ANCHOR", "NEW BALL MENACE"]

players = list(existing_players)
innings = list(existing_innings)
existing_ids = set([p['id'] for p in players])

def generate_player(id_num):
    fname = random.choice(first_names)
    lname = random.choice(last_names)
    pid = f"{fname.lower()}-{lname.lower()}-{id_num}"
    name = f"{fname} {lname}"
    country, flag = random.choice(countries)
    role = random.choice(["BAT", "BOWL", "ALL"])
    
    matches = random.randint(10, 150)
    
    if role in ["BAT", "ALL"]:
        avg = round(random.uniform(15.0, 55.0), 1)
        sr = round(random.uniform(110.0, 160.0), 1)
        hs = f"{random.randint(40, 130)}{random.choice(['*', ''])}"
    else:
        avg = round(random.uniform(10.0, 35.0), 1)
        sr = round(random.uniform(12.0, 24.0), 1)
        hs = f"economy: {round(random.uniform(5.5, 9.5), 1)}"
        
    photo_placeholder = f"{fname[0]}{lname[0]}"
    im_score = random.randint(35, 85)
    
    # Generate 10 trend values ending exactly on im_score
    im_trend = []
    base_val = random.randint(40, 80)
    for _ in range(10):
        base_val += random.randint(-5, 5)
        base_val = max(30, min(95, base_val))
        im_trend.append(base_val)
    im_trend[-1] = im_score 
    
    num_badges = random.randint(0, 3)
    badges = random.sample(badges_list, num_badges)
    
    return {
        "id": pid,
        "name": name,
        "country": country,
        "flag": flag,
        "role": role,
        "matches": matches,
        "avg": avg,
        "sr": sr,
        "hs": hs,
        "photo_placeholder": photo_placeholder,
        "im_score": im_score,
        "im_trend": im_trend,
        "badges": badges
    }

def generate_innings_for_player(player):
    player_innings = []
    formats = ["T20I", "ODI", "Test"]
    phases = ["Powerplay", "Middle", "Death", "Middle-Death", "Chase-Death", "All phases"]
    pressure_levels = [
        ("Low", 0.4, 0.6), ("Medium", 0.6, 0.75), 
        ("High", 0.75, 0.85), ("Very High", 0.85, 0.95), 
        ("Extreme", 0.95, 1.0)
    ]
    
    for i in range(1, 11):
        opp = random.choice(countries)[0]
        while opp == player['country']:
            opp = random.choice(countries)[0]
            
        p_label, p_min, p_max = random.choice(pressure_levels)
        p_val = round(random.uniform(p_min, p_max), 2)
        
        inn = {
            "player_id": player['id'],
            "innings_num": 11 - i,
            "match": f"vs {opp[:3].upper()}",
            "format": "T20I",
            "runs": random.randint(0, 100) if player['role'] != 'BOWL' else random.randint(0, 20),
            "balls": random.randint(1, 60),
            "phase": random.choice(phases),
            "context_multiplier": round(random.uniform(0.8, 1.5), 2),
            "pressure_label": p_label,
            "pressure_value": p_val,
            "performance_score": random.randint(10, 40),
            "context_score": random.randint(10, 30),
            "pressure_score": random.randint(10, 25),
            "im_score": random.randint(35, 85),
            "delta": random.choice([-2, -1, 0, 1, 2])
        }
        
        if player['role'] in ['BOWL', 'ALL']:
            inn['wickets'] = random.randint(0, 5)
            inn['economy'] = round(random.uniform(4.5, 10.5), 1)
            
        player_innings.append(inn)
    return player_innings

print("Generating players...")
needed = 500 - len(players)
for i in range(needed):
    p = generate_player(i)
    players.append(p)
    innings.extend(generate_innings_for_player(p))

print(f"Total players: {len(players)}")
print(f"Total innings: {len(innings)}")

with open('backend/data/players.json', 'w', encoding='utf-8') as f:
    json.dump(players, f, indent=2)

with open('backend/data/innings.json', 'w', encoding='utf-8') as f:
    json.dump(innings, f, indent=2)

print("Writing frontend staticData.js...")

with open('frontend/src/data/staticData.js', 'w', encoding='utf-8') as f:
    f.write('// Static data embedded for GitHub Pages (no backend needed)\\n')
    f.write('export const playersData = ')
    json.dump(players, f, separators=(',', ':'))
    f.write(';\\n\\n')
    
    f.write('export const inningsData = ')
    json.dump(innings, f, separators=(',', ':'))
    f.write(';\\n\\n')
    
    f.write('''// Helper: get players sorted by IM score (leaderboard)
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
''')

print("Done!")
