const fs = require('fs');

function generateBalls(teamName, totalRuns, totalWickets, fows, oversData) {
    const balls = [];
    let currentScore = 0;
    let currentWickets = 0;

    // We have 120 balls total
    // Let's iterate through each ball 1 to 120
    for (let overIdx = 0; overIdx < 20; overIdx++) {
        for (let ballIdx = 1; ballIdx <= 6; ballIdx++) {
            const overBall = `${overIdx}.${ballIdx}`;

            // Check if this ball is a FOW
            const fow = fows.find(f => {
                // Approximate mapping: FOW "1.4" means overIdx 1, ballIdx 4
                // But some are like 19.6 -> overIdx 19, ballIdx 6.
                const [o, b] = f.over.split('.');
                return parseInt(o) === overIdx && parseInt(b) === ballIdx;
            });

            let isWicket = false;
            let playerOut = null;
            let bowler = 'Bowler';

            if (fow) {
                isWicket = true;
                playerOut = fow.player;
                bowler = fow.bowler;
                currentWickets++;
            }

            // Runs distribution
            // Let's divide remaining runs by remaining balls
            let runs = 0;
            if (!isWicket) {
                const remainingBalls = 120 - (overIdx * 6 + ballIdx);
                const remainingRuns = totalRuns - currentScore;

                // For last ball of the innings, just add all remaining runs (hacky but works)
                if (remainingBalls === 0) {
                    runs = remainingRuns;
                } else if (remainingRuns > 0) {
                    // Random run distribution
                    const rr = Math.random();
                    const reqRate = remainingRuns / remainingBalls;

                    if (reqRate > 1.5) { // Need > 1.5 runs per ball (9 rpo)
                        if (rr > 0.8) runs = 6;
                        else if (rr > 0.6) runs = 4;
                        else if (rr > 0.3) runs = 2;
                        else if (rr > 0.1) runs = 1;
                    } else if (reqRate > 1) { // 6 rpo
                        if (rr > 0.9) runs = 6;
                        else if (rr > 0.7) runs = 4;
                        else if (rr > 0.4) runs = 1;
                    } else {
                        if (rr > 0.95) runs = 4;
                        else if (rr > 0.5) runs = 1;
                    }

                    if (currentScore + runs > totalRuns) {
                        runs = totalRuns - currentScore;
                    }
                }
            }

            currentScore += runs;

            balls.push({
                over: overIdx,
                ball: ballIdx,
                label: `${overIdx}.${ballIdx === 6 ? 6 : ballIdx}`,
                runs,
                isWicket,
                playerOut,
                bowler,
                totalScore: currentScore,
                totalWickets: currentWickets
            });
        }
    }

    // Fix last ball score if it didn't perfectly hit the total
    const lastBallCount = balls[balls.length - 1];
    if (lastBallCount.totalScore < totalRuns) {
        lastBallCount.runs += (totalRuns - lastBallCount.totalScore);
        lastBallCount.totalScore = totalRuns;
    } else if (lastBallCount.totalScore > totalRuns) {
        // This shouldn't happen due to our bounds check, but just in case
        lastBallCount.totalScore = totalRuns;
    }

    return balls;
}

const indFows = [
    { over: "1.4", score: 23, player: "Rohit Sharma", bowler: "Maharaj" },
    { over: "1.6", score: 23, player: "Rishabh Pant", bowler: "Maharaj" },
    { over: "4.3", score: 34, player: "Suryakumar Yadav", bowler: "Rabada" },
    { over: "13.3", score: 106, player: "Axar Patel", bowler: "de Kock (run out)" },
    { over: "18.5", score: 163, player: "Virat Kohli", bowler: "Jansen" },
    { over: "19.4", score: 174, player: "Shivam Dube", bowler: "Nortje" },
    { over: "19.6", score: 176, player: "Ravindra Jadeja", bowler: "Nortje" }
];

const rsaFows = [
    { over: "1.3", score: 7, player: "Reeza Hendricks", bowler: "Bumrah" },
    { over: "2.3", score: 12, player: "Aiden Markram", bowler: "Arshdeep" },
    { over: "8.5", score: 70, player: "Tristan Stubbs", bowler: "Axar" },
    { over: "12.3", score: 106, player: "Quinton de Kock", bowler: "Arshdeep" },
    { over: "16.1", score: 151, player: "Heinrich Klaasen", bowler: "Hardik" },
    { over: "17.4", score: 156, player: "Marco Jansen", bowler: "Bumrah" },
    { over: "19.1", score: 161, player: "David Miller", bowler: "Hardik" },
    { over: "19.5", score: 168, player: "Kagiso Rabada", bowler: "Hardik" }
];

const data = {
    IND: {
        target: 176,
        balls: generateBalls('IND', 176, 7, indFows, [])
    },
    RSA: {
        target: 177,
        balls: generateBalls('RSA', 169, 8, rsaFows, [])
    }
};

fs.writeFileSync('./src/data/wc_final_2024_balls.json', JSON.stringify(data, null, 2));
console.log('Created wc_final_2024_balls.json');
