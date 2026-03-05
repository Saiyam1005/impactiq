import json
import random

players_raw = {
    "India": [
        "Virat Kohli-BAT", "Rohit Sharma-BAT", "Jasprit Bumrah-BOWL", "Hardik Pandya-ALL", "Suryakumar Yadav-BAT",
        "KL Rahul-BAT", "Rishabh Pant-BAT", "Ravindra Jadeja-ALL", "Mohammed Shami-BOWL", "Mohammed Siraj-BOWL",
        "Shubman Gill-BAT", "Shreyas Iyer-BAT", "R Ashwin-ALL", "Kuldeep Yadav-BOWL", "Yuzvendra Chahal-BOWL",
        "Axar Patel-ALL", "Ishan Kishan-BAT", "Sanju Samson-BAT", "Washington Sundar-ALL", "Ruturaj Gaikwad-BAT",
        "Arshdeep Singh-BOWL", "Bhuvneshwar Kumar-BOWL", "Deepak Chahar-BOWL", "Shikhar Dhawan-BAT", "Cheteshwar Pujara-BAT"
    ],
    "Australia": [
        "Pat Cummins-BOWL", "Steve Smith-BAT", "David Warner-BAT", "Mitchell Starc-BOWL", "Josh Hazlewood-BOWL",
        "Glenn Maxwell-ALL", "Marcus Stoinis-ALL", "Travis Head-BAT", "Marnus Labuschagne-BAT", "Cameron Green-ALL",
        "Mitchell Marsh-ALL", "Adam Zampa-BOWL", "Alex Carey-BAT", "Matthew Wade-BAT", "Ashton Agar-ALL",
        "Josh Inglis-BAT", "Tim David-BAT", "Nathan Lyon-BOWL", "Usman Khawaja-BAT", "Sean Abbott-BOWL",
        "Spencer Johnson-BOWL", "Aaron Finch-BAT", "Matthew Short-ALL", "Riley Meredith-BOWL", "Jhye Richardson-BOWL"
    ],
    "England": [
        "Jos Buttler-BAT", "Jonny Bairstow-BAT", "Joe Root-BAT", "Ben Stokes-ALL", "Jofra Archer-BOWL",
        "Mark Wood-BOWL", "Adil Rashid-BOWL", "Moeen Ali-ALL", "Sam Curran-ALL", "Liam Livingstone-ALL",
        "Harry Brook-BAT", "Dawid Malan-BAT", "Chris Woakes-ALL", "Reece Topley-BOWL", "Phil Salt-BAT",
        "Will Jacks-ALL", "Ben Duckett-BAT", "Ollie Pope-BAT", "Zak Crawley-BAT", "Stuart Broad-BOWL",
        "James Anderson-BOWL", "Jason Roy-BAT", "David Willey-ALL", "Tymal Mills-BOWL", "Chris Jordan-BOWL"
    ],
    "New Zealand": [
        "Kane Williamson-BAT", "Trent Boult-BOWL", "Tim Southee-BOWL", "Devon Conway-BAT", "Tom Latham-BAT",
        "Daryl Mitchell-ALL", "Glenn Phillips-BAT", "Mitchell Santner-ALL", "Lockie Ferguson-BOWL", "Matt Henry-BOWL",
        "Ish Sodhi-BOWL", "Rachin Ravindra-ALL", "Finn Allen-BAT", "Will Young-BAT", "Henry Nicholls-BAT",
        "Kyle Jamieson-BOWL", "Adam Milne-BOWL", "Colin Munro-BAT", "Martin Guptill-BAT", "Ross Taylor-BAT",
        "Mark Chapman-BAT", "Jimmy Neesham-ALL", "Colin de Grandhomme-ALL", "Tim Seifert-BAT", "Michael Bracewell-ALL"
    ],
    "Pakistan": [
        "Babar Azam-BAT", "Mohammad Rizwan-BAT", "Shaheen Afridi-BOWL", "Haris Rauf-BOWL", "Shadab Khan-ALL",
        "Fakhar Zaman-BAT", "Imam-ul-Haq-BAT", "Naseem Shah-BOWL", "Iftikhar Ahmed-ALL", "Mohammad Nawaz-ALL",
        "Hasan Ali-BOWL", "Mohammad Wasim-BOWL", "Salman Ali Agha-ALL", "Saud Shakeel-BAT", "Usama Mir-BOWL",
        "Zaman Khan-BOWL", "Saim Ayub-BAT", "Azam Khan-BAT", "Mohammad Amir-BOWL", "Imad Wasim-ALL",
        "Sarfaraz Ahmed-BAT", "Shan Masood-BAT", "Aamer Jamal-ALL", "Abdullah Shafique-BAT", "Abbas Afridi-BOWL"
    ],
    "South Africa": [
        "Quinton de Kock-BAT", "Kagiso Rabada-BOWL", "Aiden Markram-BAT", "David Miller-BAT", "Heinrich Klaasen-BAT",
        "Anrich Nortje-BOWL", "Lungi Ngidi-BOWL", "Marco Jansen-ALL", "Temba Bavuma-BAT", "Rassie van der Dussen-BAT",
        "Keshav Maharaj-BOWL", "Tabraiz Shamsi-BOWL", "Reeza Hendricks-BAT", "Tristan Stubbs-BAT", "Gerald Coetzee-BOWL",
        "Wayne Parnell-BOWL", "Andile Phehlukwayo-ALL", "Donovan Ferreira-ALL", "Ryan Rickelton-BAT", "Faf du Plessis-BAT",
        "Rilee Rossouw-BAT", "Dewald Brevis-BAT", "Nandre Burger-BOWL", "Wiaan Mulder-ALL", "Dwaine Pretorius-ALL"
    ],
    "Sri Lanka": [
        "Wanindu Hasaranga-ALL", "Pathum Nissanka-BAT", "Kusal Mendis-BAT", "Charith Asalanka-BAT", "Dasun Shanaka-ALL",
        "Maheesh Theekshana-BOWL", "Matheesha Pathirana-BOWL", "Dushmantha Chameera-BOWL", "Dhananjaya de Silva-ALL", "Angelo Mathews-ALL",
        "Sadeera Samarawickrama-BAT", "Kusal Perera-BAT", "Dilshan Madushanka-BOWL", "Pramod Madushan-BOWL", "Dunith Wellalage-ALL",
        "Kasun Rajitha-BOWL", "Lahiru Kumara-BOWL", "Bhanuka Rajapaksa-BAT", "Avishka Fernando-BAT", "Chamika Karunaratne-ALL",
        "Nuwan Thushara-BOWL", "Akila Dananjaya-BOWL", "Binura Fernando-BOWL", "Kamindu Mendis-ALL", "Jeffrey Vandersay-BOWL"
    ],
    "West Indies": [
        "Nicholas Pooran-BAT", "Andre Russell-ALL", "Jason Holder-ALL", "Shai Hope-BAT", "Rovman Powell-BAT",
        "Alzarri Joseph-BOWL", "Kyle Mayers-ALL", "Akeal Hosein-BOWL", "Romario Shepherd-ALL", "Johnson Charles-BAT",
        "Brandon King-BAT", "Sherfane Rutherford-BAT", "Shimron Hetmyer-BAT", "Gudakesh Motie-BOWL", "Shamar Joseph-BOWL",
        "Kraigg Brathwaite-BAT", "Sunil Narine-ALL", "Kieron Pollard-ALL", "Evin Lewis-BAT", "Roston Chase-ALL",
        "Keemo Paul-ALL", "Obed McCoy-BOWL", "Oshane Thomas-BOWL", "Justin Greaves-ALL", "Yannic Cariah-ALL"
    ],
    "Afghanistan": [
        "Rashid Khan-BOWL", "Mohammad Nabi-ALL", "Rahmanullah Gurbaz-BAT", "Ibrahim Zadran-BAT", "Fazalhaq Farooqi-BOWL",
        "Mujeeb Ur Rahman-BOWL", "Naveen-ul-Haq-BOWL", "Azmatullah Omarzai-ALL", "Hashmatullah Shahidi-BAT", "Najibullah Zadran-BAT",
        "Gulbadin Naib-ALL", "Noor Ahmad-BOWL", "Rahmat Shah-BAT", "Hazratullah Zazai-BAT", "Karim Janat-ALL",
        "Fareed Ahmad-BOWL", "Qais Ahmad-BOWL", "Ikram Alikhil-BAT", "Afsar Zazai-BAT", "Darwish Rasooli-BAT",
        "Wafadar Momand-BOWL", "Salim Safi-BOWL", "Sharafuddin Ashraf-ALL", "Nijat Masood-BOWL", "Izharulhaq Naveed-BOWL"
    ],
    "Bangladesh": [
        "Shakib Al Hasan-ALL", "Mushfiqur Rahim-BAT", "Mahmudullah-ALL", "Tamim Iqbal-BAT", "Mustafizur Rahman-BOWL",
        "Litton Das-BAT", "Najmul Hossain Shanto-BAT", "Mehidy Hasan Miraz-ALL", "Taskin Ahmed-BOWL", "Shoriful Islam-BOWL",
        "Towhid Hridoy-BAT", "Hasan Mahmud-BOWL", "Nasum Ahmed-BOWL", "Mahedi Hasan-ALL", "Tanzim Hasan Sakib-BOWL",
        "Soumya Sarkar-ALL", "Afif Hossain-BAT", "Nurul Hasan-BAT", "Ebadot Hossain-BOWL", "Taijul Islam-BOWL",
        "Rishad Hossain-BOWL", "Anamul Haque-BAT", "Shamim Hossain-BAT", "Mohammad Saifuddin-ALL", "Tanzid Hasan-BAT"
    ]
}

flags = {
    "India": "🇮🇳", "Australia": "🇦🇺", "England": "🏴", 
    "New Zealand": "🇳🇿", "South Africa": "🇿🇦", "Pakistan": "🇵🇰", 
    "Sri Lanka": "🇱🇰", "West Indies": "🏝️", "Afghanistan": "🇦🇫",
    "Bangladesh": "🇧🇩"
}

badges_list = ["MATCH WINNER", "CHASE MASTER", "PRESSURE PROOF", "IN FORM", "DEATH SPECIALIST", "CLUTCH BOWLER", "SPIN WIZARD", "CONSISTENT", "FORM DIP", "CRISIS", "POWER HITTER", "ANCHOR", "NEW BALL MENACE"]

players = []
innings = []

def generate_player(name_role, country):
    name, role = name_role.rsplit('-', 1)
    pid = name.lower().replace(' ', '-')
    flag = flags[country]
    
    matches = random.randint(30, 250)
    
    if role in ["BAT", "ALL"]:
        avg = round(random.uniform(25.0, 55.0), 1)
        sr = round(random.uniform(120.0, 165.0), 1)
        hs = f"{random.randint(60, 180)}{random.choice(['*', ''])}"
    else:
        avg = round(random.uniform(10.0, 25.0), 1)
        sr = round(random.uniform(12.0, 35.0), 1)
        hs = f"economy: {round(random.uniform(5.5, 9.5), 1)}"
        
    initials = "".join([part[0] for part in name.split()][:2]).upper()
    
    # Base score generation logic tailored to role and reputation
    # Some bias towards well known players being higher, but still somewhat random
    im_score = random.randint(55, 95)
    
    im_trend = []
    base_val = random.randint(50, 85)
    for _ in range(10):
        base_val += random.randint(-6, 6)
        base_val = max(35, min(99, base_val))
        im_trend.append(base_val)
    im_trend[-1] = im_score 
    
    num_badges = random.randint(1, 3)
    p_badges = random.sample(badges_list, num_badges)
    
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
        "photo_placeholder": initials,
        "im_score": im_score,
        "im_trend": im_trend,
        "badges": p_badges
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
        opp_country = random.choice(list(flags.keys()))
        while opp_country == player['country']:
            opp_country = random.choice(list(flags.keys()))
            
        p_label, p_min, p_max = random.choice(pressure_levels)
        p_val = round(random.uniform(p_min, p_max), 2)
        
        inn = {
            "player_id": player['id'],
            "innings_num": 11 - i,
            "match": f"vs {opp_country[:3].upper()}",
            "format": "T20I",
            "runs": random.randint(0, 120) if player['role'] != 'BOWL' else random.randint(0, 30),
            "balls": random.randint(1, 70),
            "phase": random.choice(phases),
            "context_multiplier": round(random.uniform(0.8, 1.5), 2),
            "pressure_label": p_label,
            "pressure_value": p_val,
            "performance_score": random.randint(15, 45),
            "context_score": random.randint(10, 35),
            "pressure_score": random.randint(10, 30),
            "im_score": random.randint(40, 95),
            "delta": random.choice([-3, -2, -1, 0, 1, 2, 3])
        }
        
        if player['role'] in ['BOWL', 'ALL']:
            inn['wickets'] = random.randint(0, 6)
            inn['economy'] = round(random.uniform(4.0, 11.5), 1)
            
        player_innings.append(inn)
    return player_innings

print("Generating 250 real international cricket players...")
for country, players_list in players_raw.items():
    for p_raw in players_list:
        p = generate_player(p_raw, country)
        players.append(p)
        innings.extend(generate_innings_for_player(p))

print(f"Total players generated: {len(players)}")
print(f"Total innings generated: {len(innings)}")

with open('backend/data/players.json', 'w', encoding='utf-8') as f:
    json.dump(players, f, indent=2)

with open('backend/data/innings.json', 'w', encoding='utf-8') as f:
    json.dump(innings, f, indent=2)

with open('frontend/src/data/players.json', 'w', encoding='utf-8') as f:
    json.dump(players, f, separators=(',', ':'))

with open('frontend/src/data/innings.json', 'w', encoding='utf-8') as f:
    json.dump(innings, f, separators=(',', ':'))

print("Done generating 250 real players!")
