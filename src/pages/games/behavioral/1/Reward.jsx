import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { getApiBase } from '../../../../lib/apiBase.js';

// Pre-defined set of 50 trials for consistency
const generateTrials = () => {
  const trials = [
    { now: 10, later: 25, delay: 7, unit: 'days' },   { now: 50, later: 55, delay: 1, unit: 'day' },
    { now: 20, later: 40, delay: 14, unit: 'days' },  { now: 80, later: 100, delay: 30, unit: 'days' },
    { now: 5, later: 15, delay: 3, unit: 'days' },    { now: 30, later: 35, delay: 2, unit: 'hours' },
    { now: 60, later: 90, delay: 21, unit: 'days' },  { now: 15, later: 20, delay: 1, unit: 'week' },
    { now: 45, later: 75, delay: 1, unit: 'month' },  { now: 70, later: 80, delay: 5, unit: 'days' },
    { now: 12, later: 30, delay: 10, unit: 'days' },  { now: 25, later: 30, delay: 3, unit: 'days' },
    { now: 90, later: 150, delay: 60, unit: 'days' }, { now: 3, later: 10, delay: 4, unit: 'days' },
    { now: 55, later: 60, delay: 6, unit: 'hours' },  { now: 18, later: 25, delay: 2, unit: 'weeks' },
    { now: 40, later: 50, delay: 8, unit: 'days' },   { now: 75, later: 110, delay: 25, unit: 'days' },
    { now: 8, later: 12, delay: 2, unit: 'days' },    { now: 65, later: 70, delay: 12, unit: 'hours' },
    { now: 22, later: 50, delay: 18, unit: 'days' },  { now: 35, later: 45, delay: 5, unit: 'days' },
    { now: 95, later: 125, delay: 45, unit: 'days' }, { now: 1, later: 5, delay: 1, unit: 'day' },
    { now: 48, later: 55, delay: 4, unit: 'days' },   { now: 14, later: 28, delay: 3, unit: 'weeks' },
    { now: 85, later: 95, delay: 9, unit: 'days' },   { now: 28, later: 38, delay: 6, unit: 'days' },
    { now: 6, later: 20, delay: 9, unit: 'days' },    { now: 52, later: 80, delay: 22, unit: 'days' },
    { now: 19, later: 22, delay: 2, unit: 'days' },   { now: 78, later: 90, delay: 15, unit: 'days' },
    { now: 4, later: 8, delay: 3, unit: 'days' },     { now: 33, later: 66, delay: 1, unit: 'month' },
    { now: 62, later: 75, delay: 11, unit: 'days' },  { now: 11, later: 15, delay: 4, unit: 'hours' },
    { now: 88, later: 110, delay: 28, unit: 'days' }, { now: 2, later: 7, delay: 2, unit: 'days' },
    { now: 58, later: 65, delay: 6, unit: 'days' },   { now: 24, later: 30, delay: 1, unit: 'week' },
    { now: 42, later: 60, delay: 16, unit: 'days' },  { now: 92, later: 100, delay: 10, unit: 'days' },
    { now: 7, later: 21, delay: 12, unit: 'days' },   { now: 38, later: 42, delay: 24, unit: 'hours' },
    { now: 72, later: 100, delay: 20, unit: 'days' }, { now: 16, later: 32, delay: 13, unit: 'days' },
    { now: 46, later: 50, delay: 3, unit: 'days' },   { now: 82, later: 120, delay: 35, unit: 'days' },
    { now: 26, later: 40, delay: 17, unit: 'days' },
  ];
  return trials;
};

const trials = generateTrials();
const TOTAL_TRIALS = trials.length;

export default function RewardGame() {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'justification', 'end'
  const [currentTrial, setCurrentTrial] = useState(0);
  const [history, setHistory] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [justification, setJustification] = useState('');

  const handleStart = () => {
    setGameState('playing');
    setStartTime(Date.now());
  };

  const handleChoice = (choice) => {
    const reactionTime = Date.now() - startTime;
    const newHistory = [...history, { ...trials[currentTrial], choice, reactionTime }];
    setHistory(newHistory);

    if (currentTrial < TOTAL_TRIALS - 1) {
      setCurrentTrial(currentTrial + 1);
      setStartTime(Date.now());
    } else {
      setGameState('justification');
    }
  };

  const handleSubmitJustification = () => {
    if (justification.trim()) {
        setGameState('end');
    } else {
        // Simple validation feedback
        alert("Please provide a brief justification for your choices.");
    }
  };

  const handlePlayAgain = () => {
    setGameState('start');
    setCurrentTrial(0);
    setHistory([]);
    setJustification('');
  };

  const finalResults = useMemo(() => {
    if (gameState !== 'end') return null;

    const delayedChoices = history.filter(h => h.choice === 'later').length;
    const immediateChoices = TOTAL_TRIALS - delayedChoices;
    const proportionDelayed = (delayedChoices / TOTAL_TRIALS) * 100;
    const avgReactionTime = history.reduce((acc, curr) => acc + curr.reactionTime, 0) / TOTAL_TRIALS;

    const calculateScore = () => {
        if (proportionDelayed >= 80) return 5;
        if (proportionDelayed >= 60) return 4;
        if (proportionDelayed >= 40) return 3;
        if (proportionDelayed >= 20) return 2;
        return 1;
    };
    
    const score = calculateScore();
    const scoreInterpretation = {
        1: "High Impulsivity: Strong preference for immediate rewards, indicating a steep discounting of future value.",
        2: "Below Average Future Focus: Tendency to favor smaller, sooner rewards over larger, later ones.",
        3: "Average: A moderate balance between immediate gratification and future planning.",
        4: "Good Future Focus: Demonstrates a consistent preference for larger, delayed rewards, indicating patience.",
        5: "Superior Future Focus: Strong ability to delay gratification to maximize long-term rewards."
    };

    return {
        delayedChoices,
        immediateChoices,
        proportionDelayed: proportionDelayed.toFixed(1),
        avgReactionTime: (avgReactionTime / 1000).toFixed(2),
        score,
        interpretation: scoreInterpretation[score],
        justification
    };
  }, [gameState, history, justification]);

  // Save results to backend when game ends
  const { user } = useAuth();
  useEffect(() => {
    if (gameState !== 'end' || !finalResults) return;
    try {
      const key = 'game1_session_id';
      let sessionId = localStorage.getItem(key);
      if (!sessionId) {
        sessionId = `g1_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem(key, sessionId);
      }
      fetch(`${getApiBase()}/save_game1.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          player_name: user?.name || 'Guest',
          roll_number: user?.rollNumber || '',
          timestamp: new Date().toISOString(),
          reward_score: finalResults.score,
        }),
      }).catch(() => {});
    } catch (_) {}
  }, [gameState, finalResults, user]);


  const renderContent = () => {
    switch (gameState) {
      case 'start':
        return (
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Delay Discounting Task</h1>
            <p className="mt-4 text-white/85 max-w-xl mx-auto">
              You will be presented with 50 choices between receiving a smaller amount of tokens now or a larger amount later.
              There are no right or wrong answers. Please choose the option you genuinely prefer.
            </p>
            <button
              onClick={handleStart}
              className="mt-8 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              Start Task
            </button>
          </div>
        );

      case 'playing':
        const trial = trials[currentTrial];
        return (
          <div className="w-full">
            <div className="text-center mb-8">
                <p className="text-lg text-white/80">Trial {currentTrial + 1} of {TOTAL_TRIALS}</p>
                 <div className="w-full bg-black/20 rounded-full h-2.5 mt-2">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${((currentTrial + 1) / TOTAL_TRIALS) * 100}%` }}></div>
                </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Which would you rather have?</h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button
                onClick={() => handleChoice('now')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-6 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg w-full md:w-64 text-center"
              >
                <span className="text-3xl block font-extrabold">{trial.now} Tokens</span>
                <span className="text-xl">Now</span>
              </button>
              <button
                onClick={() => handleChoice('later')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold p-6 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg w-full md:w-64 text-center"
              >
                 <span className="text-3xl block font-extrabold">{trial.later} Tokens</span>
                 <span className="text-xl">in {trial.delay} {trial.unit}</span>
              </button>
            </div>
          </div>
        );
    
    case 'justification':
        return (
            <div className="w-full text-center">
                 <h2 className="text-2xl md:text-3xl font-bold mb-4">Final Step</h2>
                 <p className="text-white/85 mb-6">Briefly explain the reasoning behind your choices.</p>
                 <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="w-full max-w-lg mx-auto bg-black/20 rounded-lg p-4 text-white placeholder-white/50 border border-white/20 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    rows="4"
                    placeholder="e.g., I always chose the later option if the amount was double, or I preferred getting tokens immediately..."
                 ></textarea>
                 <button
                    onClick={handleSubmitJustification}
                    className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
                 >
                    View Results
                 </button>
            </div>
        );

    case 'end':
        return (
            <div className="text-center w-full">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">Task Complete!</h1>
                <p className="text-white/85 text-lg mb-6">Here is your performance summary.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left bg-black/20 p-6 rounded-lg">
                    <div className="bg-black/25 p-4 rounded-lg">
                        <p className="text-lg text-white/80">Choices</p>
                        <p className="text-2xl font-bold text-blue-300">Immediate: {finalResults.immediateChoices}</p>
                        <p className="text-2xl font-bold text-purple-300">Delayed: {finalResults.delayedChoices} ({finalResults.proportionDelayed}%)</p>
                    </div>
                     <div className="bg-black/25 p-4 rounded-lg">
                        <p className="text-lg text-white/80">Avg. Reaction Time</p>
                        <p className="text-3xl font-bold text-white">{finalResults.avgReactionTime}s</p>
                    </div>
                    <div className="md:col-span-2 bg-black/25 p-4 rounded-lg">
                        <p className="text-lg text-white/80">Your Reasoning</p>
                        <p className="text-white italic">"{finalResults.justification}"</p>
                    </div>
                </div>

                <div className="mt-6 bg-black/20 rounded-xl p-6 text-center">
                    <p className="text-lg text-white/80">Future Focus Score</p>
                    <p className="text-6xl font-extrabold text-yellow-300 my-2">{finalResults.score} <span className="text-4xl">/ 5</span></p>
                    <p className="text-white/90 max-w-md mx-auto">{finalResults.interpretation}</p>
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
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-3xl text-center border border-white/15 min-h-[550px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}

