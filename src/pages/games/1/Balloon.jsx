import React, { useState, useMemo } from 'react';

// SVG icon for the balloon
const BalloonIcon = ({ scale = 1, popped = false }) => (
  <svg
    width="128"
    height="128"
    viewBox="0 0 100 120"
    className="transition-transform duration-200 ease-in-out"
    style={{ transform: `scale(${scale})` }}
  >
    {popped ? (
      <>
        {/* Explosion effect */}
        <path d="M40 40 L20 20 M60 40 L80 20 M50 30 L50 10 M40 60 L20 80 M60 60 L80 80 M30 50 L10 50 M70 50 L90 50 M50 70 L50 90" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <path d="M45 45 L35 35 M55 45 L65 35 M45 55 L35 65 M55 55 L65 65" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      </>
    ) : (
      <>
        {/* Balloon Body */}
        <path
          d="M50 110 C 10 90, 10 40, 50 10 C 90 40, 90 90, 50 110 Z"
          fill="url(#balloonGradient)"
          stroke="#e11d48"
          strokeWidth="2"
        />
        {/* Balloon Shine */}
        <path
          d="M40 30 Q 50 40, 60 30 C 55 20, 45 20, 40 30 Z"
          fill="white"
          opacity="0.5"
        />
        {/* Balloon Knot */}
        <path d="M45 110 L 55 110 L 50 118 Z" fill="#be123c" />
        <defs>
          <radialGradient id="balloonGradient" cx="0.4" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </radialGradient>
        </defs>
      </>
    )}
  </svg>
);


export default function BalloonGame() {
  const TOTAL_ROUNDS = 30;
  const MAX_PUMPS = 128;

  // Game state: 'start', 'playing', 'popped', 'cashed-out', 'end'
  const [gameState, setGameState] = useState('start');
  const [round, setRound] = useState(1);
  const [pumps, setPumps] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundEarnings, setRoundEarnings] = useState(0);

  // New comprehensive history for accurate scoring and data capture
  const [gameHistory, setGameHistory] = useState([]);

  // Randomized explosion point for each balloon
  const [explosionPoint, setExplosionPoint] = useState(() => Math.floor(Math.random() * MAX_PUMPS) + 1);

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handlePump = () => {
    if (pumps + 1 >= explosionPoint) {
      // Balloon pops!
      setGameState('popped');
      setRoundEarnings(0);
      setGameHistory(prev => [...prev, { pumps: pumps + 1, outcome: 'popped' }]);
      setPumps(pumps + 1); // Update pumps to show final popped size
    } else {
      // Successful pump
      setPumps(pumps + 1);
      setRoundEarnings(roundEarnings + 1);
    }
  };

  const handleCashOut = () => {
    setTotalScore(totalScore + roundEarnings);
    setGameState('cashed-out');
    setGameHistory(prev => [...prev, { pumps: pumps, outcome: 'cashed-out' }]);
  };

  const handleNextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setGameState('end');
    } else {
      setRound(round + 1);
      setPumps(0);
      setRoundEarnings(0);
      setExplosionPoint(Math.floor(Math.random() * MAX_PUMPS) + 1);
      setGameState('playing');
    }
  };

  const handlePlayAgain = () => {
    setGameState('start');
    setRound(1);
    setPumps(0);
    setTotalScore(0);
    setRoundEarnings(0);
    setGameHistory([]);
    setExplosionPoint(Math.floor(Math.random() * MAX_PUMPS) + 1);
  };

  // Memoize results calculation to avoid re-computing on every render
  const finalResults = useMemo(() => {
    if (gameState !== 'end' || gameHistory.length === 0) return null;

    // Basic stats
    const totalPops = gameHistory.filter(r => r.outcome === 'popped').length;
    const avgPumps = gameHistory.length > 0 ? (gameHistory.reduce((acc, curr) => acc + curr.pumps, 0) / gameHistory.length) : 0;

    // Adaptation stats
    let pumpsAfterWinTotal = 0;
    let winCount = 0;
    let pumpsAfterLossTotal = 0;
    let lossCount = 0;

    for (let i = 1; i < gameHistory.length; i++) {
      const prevRoundOutcome = gameHistory[i - 1].outcome;
      const currentPumps = gameHistory[i].pumps;
      if (prevRoundOutcome === 'cashed-out') {
        pumpsAfterWinTotal += currentPumps;
        winCount++;
      } else if (prevRoundOutcome === 'popped') {
        pumpsAfterLossTotal += currentPumps;
        lossCount++;
      }
    }

    const avgPumpsAfterWin = winCount > 0 ? (pumpsAfterWinTotal / winCount) : 0;
    const avgPumpsAfterLoss = lossCount > 0 ? (pumpsAfterLossTotal / lossCount) : 0;
    const adaptationIndex = (winCount > 0 && lossCount > 0) ? (avgPumpsAfterWin - avgPumpsAfterLoss) : 0;

    // Scoring (1-5)
    const calculateBartScore = () => {
      let score = 3; // Start with average

      // 1. Risk level assessment
      if (avgPumps > 30 && avgPumps < 65 && totalPops < 10) {
        score++; // Good risk/reward balance
      } else if (avgPumps < 20) {
        score--; // Too cautious
      } else if (totalPops > 15) {
        score--; // Too risky
      }

      // 2. Adaptation assessment
      if (adaptationIndex > 3) { // Pumps more after a win, less after a loss (good adaptation)
        score++;
      } else if (adaptationIndex < -3) { // Pumps more after a loss (maladaptive risk-seeking)
        score--;
      }

      return Math.max(1, Math.min(5, Math.round(score))); // Clamp score between 1 and 5
    };

    const bartScore = calculateBartScore();

    const scoreInterpretation = {
      1: "High Risk / Impulsive: Behavior indicates a tendency to take high risks without consistently adjusting strategy after losses.",
      2: "Below Average Control: Shows some impulsive tendencies and inconsistent adaptation to outcomes.",
      3: "Average: Demonstrates a moderate balance of risk and reward, with some learning from outcomes.",
      4: "Good Control: Effectively balances maximizing rewards and minimizing losses, adapting strategy well.",
      5: "Superior Control: Optimally balances risk and reward, consistently learning from feedback to maximize gains."
    };


    return {
      totalPops,
      avgPumps: avgPumps.toFixed(2),
      avgPumpsAfterWin: avgPumpsAfterWin.toFixed(2),
      avgPumpsAfterLoss: avgPumpsAfterLoss.toFixed(2),
      adaptationIndex: adaptationIndex.toFixed(2),
      bartScore,
      interpretation: scoreInterpretation[bartScore]
    };
  }, [gameState, gameHistory]);

  const balloonScale = 1 + (pumps / MAX_PUMPS) * 1.5;

  const renderContent = () => {
    switch (gameState) {
      case 'start':
        return (
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Balloon Analogue Risk Task (BART)</h1>
            <p className="mt-4 text-white/85 max-w-xl mx-auto">
              Welcome to the Balloon Game. The goal is to earn as many points as possible over 30 rounds.
              In each round, you can pump a balloon to increase its value. Each pump is worth 1 point.
              However, each pump also increases the risk of the balloon popping. If it pops, you lose all points for that round.
              You can "Cash Out" at any time to secure the points you've earned for the round.
            </p>
            <button
              onClick={handleStartGame}
              className="mt-8 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          </div>
        );

      case 'playing':
        return (
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-between items-center text-lg mb-6 font-semibold">
              <span>Round: {round}/{TOTAL_ROUNDS}</span>
              <span>Total Score: {totalScore}</span>
            </div>
            <div className="relative w-64 h-64 flex items-center justify-center my-8">
              <BalloonIcon scale={balloonScale} />
            </div>
            <p className="text-2xl font-bold mb-6">Current Round Points: {roundEarnings}</p>
            <div className="flex gap-4">
              <button
                onClick={handlePump}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg w-40"
              >
                Pump
              </button>
              <button
                onClick={handleCashOut}
                disabled={pumps === 0}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 w-40"
              >
                Cash Out
              </button>
            </div>
          </div>
        );

      case 'popped':
        return (
          <div className="text-center">
            <div className="relative w-64 h-64 flex items-center justify-center my-8">
              <BalloonIcon scale={balloonScale} popped={true} />
            </div>
            <h2 className="text-5xl font-extrabold text-red-400">POP!</h2>
            <p className="mt-4 text-xl text-white/90">You pushed your luck too far and lost this round's points.</p>
            <button
              onClick={handleNextRound}
              className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              {round === TOTAL_ROUNDS ? 'Finish' : 'Next Round'}
            </button>
          </div>
        );

      case 'cashed-out':
        return (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-green-300">Cashed Out!</h2>
            <p className="mt-4 text-xl text-white/90">You safely collected {roundEarnings} points.</p>
            <p className="mt-2 text-lg text-white/80">Your new total score is {totalScore}.</p>
            <button
              onClick={handleNextRound}
              className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              {round === TOTAL_ROUNDS ? 'Finish' : 'Next Round'}
            </button>
          </div>
        );

      case 'end':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Game Over!</h1>
            <p className="text-white/85 text-lg">Here is your performance summary.</p>

            <div className="mt-6 bg-black/20 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-lg text-white/80">Final Score</p>
                <p className="text-4xl font-bold text-green-300">{totalScore}</p>
              </div>
              <div>
                <p className="text-lg text-white/80">Balloons Popped</p>
                <p className="text-4xl font-bold text-red-400">{finalResults?.totalPops}</p>
              </div>
              <div>
                <p className="text-lg text-white/80">Avg. Pumps</p>
                <p className="text-4xl font-bold text-blue-300">{finalResults?.avgPumps}</p>
              </div>
              <div className="md:col-span-3 border-t border-white/20 my-2"></div>
              <div>
                <p className="text-lg text-white/80">Avg. Pumps After Win</p>
                <p className="text-4xl font-bold text-green-300">{finalResults?.avgPumpsAfterWin}</p>
              </div>
              <div>
                <p className="text-lg text-white/80">Avg. Pumps After Loss</p>
                <p className="text-4xl font-bold text-red-400">{finalResults?.avgPumpsAfterLoss}</p>
              </div>
              <div>
                <p className="text-lg text-white/80">Adaptation Index</p>
                <p className="text-4xl font-bold text-purple-300">{finalResults?.adaptationIndex}</p>
              </div>
            </div>

            <div className="mt-6 bg-black/20 rounded-xl p-6 text-center">
              <p className="text-lg text-white/80">BART Score</p>
              <p className="text-6xl font-extrabold text-yellow-300 my-2">{finalResults?.bartScore} <span className="text-4xl">/ 5</span></p>
              <p className="text-white/90 max-w-md mx-auto">{finalResults?.interpretation}</p>
            </div>

            <button
              onClick={handlePlayAgain}
              className="mt-8 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              Play Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#5b4ecc] text-white flex items-center justify-center p-4 font-sans">

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-3xl text-center border border-white/15">
        {renderContent()}
      </div>
    </div>
  );
}

