const fs = require('fs');

const content = fs.readFileSync('./src/pages/LiveImpact.jsx', 'utf8');

const startIdx = content.indexOf('export default function LiveImpact() {');
const endIdx = content.indexOf('    // Live Match Calculations');

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find start or end index.");
    process.exit(1);
}

const myCode = `function getInitialMatchState() {
    return {
        indScore: 187,
        indWickets: 4,
        ausScore: 0,
        ausWickets: 0,
        ballsLeft: 120, // starts at 120
        target: 188,
        strikerKey: 'bat1',
        nonStrikerKey: 'bat2',
        currentBowler: 'siraj',
        nextBatIdx: 0, 
        bat1: { name: 'David Warner', short: 'Warner', runs: 0, balls: 0, im: 50, out: false },
        bat2: { name: 'Travis Head', short: 'Head', runs: 0, balls: 0, im: 50, out: false },
        dismissed: [],
        bumrah: { runs: 0, balls: 0, wickets: 0, im: 50 },
        siraj: { runs: 0, balls: 0, wickets: 0, im: 50 },
        jadeja: { runs: 0, balls: 0, wickets: 0, im: 50 },
        kohli: { runs: 72, balls: 48, im: 85.4 },
        log: "The chase begins! Warner on strike, Siraj with the new ball.",
        momentumHistory: [{ ball: '0.0', momentum: 0, event: 'start', desc: 'Innings starts. 188 to win.' }],
        turningPoint: null
    };
}

function getSeededRandom(seed) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function simulateBall(prev, cycleId, ballIndex) {
    if (prev.ausScore >= prev.target || prev.ausWickets >= 10 || prev.ballsLeft <= 0) return prev;

    const oversBowled = Math.floor((120 - prev.ballsLeft) / 6);
    let curBowler = 'siraj';
    if (oversBowled % 5 === 0) curBowler = 'siraj';
    else if (oversBowled % 5 === 1) curBowler = 'bumrah';
    else if (oversBowled % 5 === 2) curBowler = 'jadeja';
    else if (oversBowled % 5 === 3) curBowler = 'siraj';
    else if (oversBowled % 5 === 4) curBowler = 'bumrah';

    const rWicket = getSeededRandom(cycleId * 1000 + ballIndex + 1);
    const rRuns = getSeededRandom(cycleId * 1000 + ballIndex + 2);
    
    let reqRate = (prev.target - prev.ausScore) / (prev.ballsLeft / 6);
    let aggressive = reqRate > 10 || prev.ballsLeft < 30;
    
    let isWicket = false;
    let runs = 0;
    
    if (rWicket < (aggressive ? 0.08 : 0.045)) isWicket = true;
    
    if (!isWicket) {
        if (aggressive) {
             if (rRuns < 0.2) runs = 0;
             else if (rRuns < 0.5) runs = 1;
             else if (rRuns < 0.6) runs = 2;
             else if (rRuns < 0.8) runs = 4;
             else runs = 6;
        } else {
             if (rRuns < 0.45) runs = 0;
             else if (rRuns < 0.80) runs = 1;
             else if (rRuns < 0.90) runs = 2;
             else if (rRuns < 0.97) runs = 4;
             else runs = 6;
        }
    }

    const newAusScore = prev.ausScore + runs;
    const newAusWickets = prev.ausWickets + (isWicket ? 1 : 0);
    const newBallsLeft = prev.ballsLeft - 1;

    const sKey = prev.strikerKey;
    const nsKey = prev.nonStrikerKey;
    const curBowlerName = bowlerNames[curBowler];
    const strikerName = prev[sKey].short;

    const overNum = Math.floor((120 - prev.ballsLeft) / 6);
    const ballNum = 6 - (newBallsLeft % 6 === 0 ? 0 : newBallsLeft % 6);
    const ballLabel = \`\${overNum}.\${ballNum === 0 ? 6 : ballNum}\`;
    let logMsg = \`\${ballLabel} \${curBowlerName} to \${strikerName}: \`;

    if (isWicket) logMsg += \`OUT! Clean bowled by \${curBowlerName}! Brilliant delivery!\`;
    else if (runs === 4) logMsg += "FOUR! Driven beautifully through the covers.";
    else if (runs === 6) logMsg += "SIX! Massive hit into the stands!";
    else if (runs === 0) logMsg += \`Dot ball. Tight from \${curBowlerName}.\`;
    else logMsg += \`\${runs} run\${runs > 1 ? 's' : ''} taken.\`;

    const newStrikerData = { ...prev[sKey], balls: prev[sKey].balls + 1 };
    if (!isWicket) newStrikerData.runs += runs;
    if (isWicket) {
        newStrikerData.im = Math.max(0, newStrikerData.im - 8);
    } else {
        newStrikerData.im = Math.min(100, Math.max(0, newStrikerData.im + (runs === 6 ? 2.5 : runs === 4 ? 1.2 : runs === 1 ? -0.2 : -0.8)));
    }

    const newBowlerData = { ...prev[curBowler], balls: prev[curBowler].balls + 1 };
    newBowlerData.runs += runs;
    if (isWicket) {
        newBowlerData.wickets += 1;
        newBowlerData.im = Math.min(100, newBowlerData.im + 6.5);
    } else {
        newBowlerData.im = Math.max(0, newBowlerData.im - (runs >= 4 ? 1.8 : runs === 0 ? 0.5 : -0.2));
    }

    let nextStrikerKey = sKey;
    let nextNonStrikerKey = nsKey;
    let newDismissed = [...prev.dismissed];
    let nextBatIdx = prev.nextBatIdx;
    let newBatEntry = null;

    if (isWicket) {
        newDismissed.push({
            ...prev[sKey],
            bowler: curBowlerName,
        });

        if (nextBatIdx < ausBattingRoster.length) {
            const newBat = ausBattingRoster[nextBatIdx];
            logMsg += \` \${newBat.name} walks in.\`;
            newBatEntry = { name: newBat.name, short: newBat.short, runs: 0, balls: 0, im: 50, out: false };
            nextBatIdx++;
        } else {
            logMsg += \` All out!\`;
        }
    } else if (runs % 2 !== 0) {
        nextStrikerKey = nsKey;
        nextNonStrikerKey = sKey;
    }

    let nextBowler = curBowler;
    if (newBallsLeft % 6 === 0 && newBallsLeft > 0) {
        if (!isWicket) {
            const tempKey = nextStrikerKey;
            nextStrikerKey = nextNonStrikerKey;
            nextNonStrikerKey = tempKey;
        }
        const oversBowledNext = Math.floor((120 - newBallsLeft) / 6);
        if (oversBowledNext % 5 === 0) nextBowler = 'siraj';
        else if (oversBowledNext % 5 === 1) nextBowler = 'bumrah';
        else if (oversBowledNext % 5 === 2) nextBowler = 'jadeja';
        else if (oversBowledNext % 5 === 3) nextBowler = 'siraj';
        else if (oversBowledNext % 5 === 4) nextBowler = 'bumrah';
        logMsg += \` End of over. \${bowlerNames[nextBowler]} to bowl next.\`;
    }

    if (newAusScore >= prev.target) {
        logMsg = \`MATCH OVER! Australia wins by \${10 - newAusWickets} wickets!\`;
    } else if (newAusWickets >= 10 || newBallsLeft <= 0) {
        logMsg = \`MATCH OVER! India wins by \${prev.target - newAusScore} runs!\`;
    }

    const reqRunsNow = prev.target - newAusScore;
    const rrrNow = newBallsLeft > 0 ? (reqRunsNow / newBallsLeft) * 6 : 99;
    let momentumDelta = 0;
    if (isWicket) momentumDelta = -15;
    else if (runs === 6) momentumDelta = 12;
    else if (runs === 4) momentumDelta = 7;
    else if (runs === 0) momentumDelta = -3;
    else momentumDelta = 1;

    if (rrrNow > 12) momentumDelta -= 3;
    else if (rrrNow < 7) momentumDelta += 2;

    const eventType = isWicket ? 'wicket' : runs >= 4 ? 'boundary' : runs === 0 ? 'dot' : 'single';
    const shortDesc = isWicket
        ? \`\${curBowlerName} gets \${strikerName}! Momentum swings to IND.\`
        : runs === 6 ? \`SIX by \${strikerName}!\`
            : runs === 4 ? \`FOUR! \${strikerName} finds the gap.\`
                : runs === 0 ? \`Dot ball. \${curBowlerName} building pressure.\`
                    : \`\${runs} taken. Steady scoring.\`;

    const lastMomentum = prev.momentumHistory.length > 0 ? prev.momentumHistory[prev.momentumHistory.length - 1].momentum : 0;
    const newMomentum = Math.max(-50, Math.min(50, lastMomentum + momentumDelta));
    const newEntry = { ball: ballLabel, momentum: newMomentum, event: eventType, desc: shortDesc };
    
    let newTurningPoint = prev.turningPoint;
    if (Math.abs(newMomentum - lastMomentum) >= 12 || (lastMomentum >= 0 && newMomentum < -5) || (lastMomentum <= 0 && newMomentum > 5)) {
        newTurningPoint = { ball: ballLabel, desc: shortDesc, delta: momentumDelta };
    }

    const newMomentumHistory = [...prev.momentumHistory.slice(-15), newEntry];

    const updates = {
        ...prev,
        ausScore: newAusScore,
        ausWickets: newAusWickets,
        ballsLeft: newBallsLeft,
        currentBowler: nextBowler,
        dismissed: newDismissed,
        nextBatIdx,
        [curBowler]: newBowlerData,
        log: logMsg,
        momentumHistory: newMomentumHistory,
        turningPoint: newTurningPoint
    };

    if (isWicket && newBatEntry) {
        updates[sKey] = newBatEntry;
        updates.strikerKey = sKey;
        updates.nonStrikerKey = nsKey;
    } else if (isWicket) {
        updates[sKey] = { ...newStrikerData, out: true };
        updates.strikerKey = sKey;
        updates.nonStrikerKey = nsKey;
    } else {
        updates[sKey] = newStrikerData;
        updates.strikerKey = nextStrikerKey;
        updates.nonStrikerKey = nextNonStrikerKey;
    }

    return updates;
}

function getGlobalMatchState() {
    const CYCLE_MS = 120 * 12000; // 24 minutes per full innings simulation
    const now = Date.now();
    const cycleId = Math.floor(now / CYCLE_MS);
    const msInCycle = now % CYCLE_MS;
    const currentBall = Math.floor(msInCycle / 12000); // 0 to 119
    const nextBallInMs = 12000 - (msInCycle % 12000);

    let state = getInitialMatchState();
    for (let i = 0; i < currentBall && i < 120; i++) {
        state = simulateBall(state, cycleId, i);
        if (state.ausScore >= state.target || state.ausWickets >= 10 || state.ballsLeft <= 0) break;
    }
    
    return { state, nextBallInMs, cycleId, currentBall };
}

export default function LiveImpact() {
    const [runsSlider, setRunsSlider] = useState(20);
    const [wicketsSlider, setWicketsSlider] = useState(0);
    const [isKnockout, setIsKnockout] = useState(true);

    const [matchState, setMatchState] = useState(getGlobalMatchState().state);

    useEffect(() => {
        let timeout;
        function scheduleNext() {
            const { state, nextBallInMs } = getGlobalMatchState();
            setMatchState(state);
            timeout = setTimeout(scheduleNext, nextBallInMs);
        }
        
        const initialDelay = getGlobalMatchState().nextBallInMs;
        timeout = setTimeout(scheduleNext, initialDelay);
        return () => clearTimeout(timeout);
    }, []);

    const momentumHistory = matchState.momentumHistory || [];
    const turningPoint = matchState.turningPoint;
    
`;

const newContent = content.slice(0, startIdx) + myCode + content.slice(endIdx);
fs.writeFileSync('./src/pages/LiveImpact.jsx', newContent);
console.log('Successfully refactored LiveImpact.jsx');
