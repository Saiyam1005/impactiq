# ImpactIQ — Cricket Intelligence Platform

![Dashboard Screenshot](./assets/dashboard.png)

## Overview
ImpactIQ is a modern, data-driven Cricket Intelligence Platform designed to look beyond traditional statistics like averages and strike rates. It introduces a proprietary **Impact Metric (IM)** that evaluates a player's true performance under pressure, in clutch moments, and in match-defining situations. 

## Key Features
- **Impact Metric Calculation:** A sophisticated algorithm that weighs performance based on match context (e.g., chases, pressure levels, phase of play).
- **Player Leaderboards:** Rank players based on their overall impact score rather than conventional stats.
- **Head-to-Head Comparisons:** Compare two players side-by-side to determine who has a higher impact in crucial situations.
- **Interactive Dashboard:** A visually appealing and dynamic React frontend to explore the data.
- **RESTful API Backend:** A fast and robust FastAPI backend serving cricket data and impact calculations.

## Tech Stack
### Frontend
- **Framework:** React (v18)
- **Tooling:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Data Visualization:** Recharts, D3.js
- **Routing:** React Router DOM

### Backend
- **Framework:** FastAPI
- **Data Processing:** Pandas, NumPy
- **Server:** Uvicorn
- **Validation:** Pydantic

## Local Development Setup

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (recommended).
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python -m uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`. You can test the endpoints via the Swagger UI at `http://localhost:8000/docs`.

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend application will be running at `http://localhost:5173/impactiq/`. Open this URL in your browser to access the ImpactIQ dashboard.

## Methodology
The Impact Metric is calculated considering multiple factors:
- **Base Stats:** Runs scored, balls faced, wickets taken, economy rate.
- **Context Multipliers:** Adjustments for the phase of the game (powerplay, middle overs, death).
- **Pressure Level:** Extracted from historical match data indicating the match situation.
- **Match Importance:** Higher weightage for finals, knockouts, and crucial league matches.
- **Chase Factor:** Additional impact points for successful run chases.

---
*Built for the Nirma Hackathon.*
