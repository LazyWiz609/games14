import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { getApiBase } from '../../../lib/apiBase.js';

const TOTAL_TRIALS = 40;

// Deck configuration based on the standard Iowa Gambling Task principles
// Decks A & B are "bad decks": high immediate rewards but higher, more frequent losses over time.
// Decks C & D are "good decks": smaller immediate rewards but smaller, less frequent losses over time.
const decksConfig = {
  A: { name: 'Deck A', color: 'bg-red-600', hover: 'hover:bg-red-700', rewards: [100], losses: [-150, -200, -250, -300, -350], lossFrequency: 0.5 },
  B: { name: 'Deck B', color: 'bg-orange-600', hover: 'hover:bg-orange-700', rewards: [100], losses: [-1250], lossFrequency: 0.1 },
  C: { name: 'Deck C', color: 'bg-green-600', hover: 'hover:bg-green-700', rewards: [50], losses: [-25, -50, -75], lossFrequency: 0.5 },
  D: { name: 'Deck D', color: 'bg-blue-600', hover: 'hover:bg-blue-700', rewards: [50], losses: [-250], lossFrequency: 0.1 },
};

const Deck = ({ id, onSelect, disabled }) => {
  const config = decksConfig[id];
  return (
    <button
      onClick={() => onSelect(id)}
      disabled={disabled}
      className={`w-32 h-48 md:w-40 md:h-60 rounded-xl shadow-2xl text-white font-extrabold text-3xl flex items-center justify-center transition-transform transform hover:-translate-y-2 ${config.color} ${config.hover} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {config.name}
    </button>
  );
};

export default function GamblingGame() {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'feedback', 'end'
  const [currentTrial, setCurrentTrial] = useState(1);
  const [netScore, setNetScore] = useState(2000); // Starting score
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState({ gain: 0, loss: 0 });

  const handleDeckSelect = (deckId) => {
    const deck = decksConfig[deckId];
    const gain = deck.rewards[Math.floor(Math.random() * deck.rewards.length)];
    let loss = 0;
    if (Math.random() < deck.lossFrequency) {
      loss = deck.losses[Math.floor(Math.random() * deck.losses.length)];
    }

    const netChange = gain + loss;
    setNetScore(prev => prev + netChange);
    setLastResult({ gain, loss });
    setHistory(prev => [...prev, { trial: currentTrial, deck: deckId, gain, loss, netChange }]);
    setGameState('feedback');
  };

  const handleNext = () => {
    if (currentTrial >= TOTAL_TRIALS) {
      setGameState('end');
    } else {
      setCurrentTrial(prev => prev + 1);
      setGameState('playing');
    }
  };

  const handlePlayAgain = () => {
    setGameState('start');
    setCurrentTrial(1);
    setNetScore(2000);
    setHistory([]);
    setLastResult({ gain: 0, loss: 0 });
  };
  
  const finalResults = useMemo(() => {
    if (gameState !== 'end') return null;

    const deckChoices = { A: 0, B: 0, C: 0, D: 0 };
    history.forEach(h => deckChoices[h.deck]++);

    const goodDecks = ['C', 'D'];
    const badDecks = ['A', 'B'];

    const firstHalfGoodPicks = history.slice(0, 20).filter(h => goodDecks.includes(h.deck)).length;
    const secondHalfGoodPicks = history.slice(20, 40).filter(h => goodDecks.includes(h.deck)).length;

    // Learning slope: The change in preference for good decks over time.
    const learningSlope = secondHalfGoodPicks - firstHalfGoodPicks;

    const calculateScore = () => {
        let score = 3; // Average
        // Adjust score based on learning slope
        if (learningSlope > 6) score = 5; // Clearly learned and switched
        else if (learningSlope > 2) score = 4; // Shows learning
        else if (learningSlope < -4) score = 1; // Persisted with bad decks
        else if (learningSlope < 0) score = 2; // Failed to learn

        // Adjust based on final score
        if (netScore < 1500 && score > 2) score--; // Poor outcome despite some learning
        if (netScore > 2500 && score < 4) score++; // Good outcome might indicate good strategy
        
        return Math.max(1, Math.min(5, score));
    };

    const score = calculateScore();
    const scoreInterpretation = {
        1: "High Risk / Impulsive: Failed to learn from experience, persistently choosing disadvantageous decks despite losses.",
        2: "Below Average Learning: Showed limited ability to adapt strategy, resulting in a net loss.",
        3: "Average: Showed sporadic adaptation but did not consistently stick to the advantageous decks.",
        4: "Good Learning: Demonstrated a clear trend of switching to safer decks after experiencing early losses.",
        5: "Superior Learning: Quickly identified the optimal strategy, maximizing net gain by consistently choosing advantageous decks."
    };

    return {
        deckChoices,
        learningSlope,
        score,
        interpretation: scoreInterpretation[score]
    };
  }, [gameState, history, netScore]);

  // Save results when game ends
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
          gambling_score: finalResults.score,
        }),
      }).catch(() => {});
    } catch (_) {}
  }, [gameState, finalResults, user]);


  const renderContent = () => {
    switch(gameState) {
      case 'start':
        return (
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Iowa Gambling Task</h1>
                <p className="mt-4 text-white/85 max-w-xl mx-auto">
                    The goal is to win as much money as possible. You start with $2000.
                    You will make 40 selections from four card decks. Some decks are better than others.
                    Try to find the best decks and avoid the worst ones. Good luck.
                </p>
                <button onClick={() => setGameState('playing')} className="mt-8 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg">
                    Start Task
                </button>
            </div>
        );
      case 'playing':
        return (
            <div className="w-full">
                <div className="flex justify-between items-center text-xl font-bold mb-8 px-4">
                    <span>Trial: {currentTrial}/{TOTAL_TRIALS}</span>
                    <span className={netScore >= 2000 ? 'text-green-300' : 'text-red-300'}>Score: ${netScore}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    <Deck id="A" onSelect={handleDeckSelect} />
                    <Deck id="B" onSelect={handleDeckSelect} />
                    <Deck id="C" onSelect={handleDeckSelect} />
                    <Deck id="D" onSelect={handleDeckSelect} />
                </div>
            </div>
        );
      case 'feedback':
        const { gain, loss } = lastResult;
        const netChange = gain + loss;
        return (
            <div className="text-center">
                <h2 className="text-4xl font-bold">Results of your draw:</h2>
                <p className="text-5xl font-extrabold text-green-300 mt-6">You won ${gain}</p>
                {loss < 0 && <p className="text-5xl font-extrabold text-red-400 mt-2">You lost ${Math.abs(loss)}</p>}
                <div className="w-full h-1 bg-white/20 my-6"></div>
                <p className={`text-3xl font-bold ${netChange >= 0 ? 'text-white' : 'text-red-300'}`}>
                    Net change: {netChange >= 0 ? `+$${netChange}` : `-$${Math.abs(netChange)}`}
                </p>
                <button onClick={handleNext} className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg">
                    {currentTrial >= TOTAL_TRIALS ? 'Finish' : 'Continue'}
                </button>
            </div>
        );
    case 'end':
        return (
            <div className="text-center w-full">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">Task Complete!</h1>
                <div className="mt-6 bg-black/20 rounded-xl p-6 text-center">
                    <p className="text-lg text-white/80">Final Score</p>
                    <p className={`text-6xl font-extrabold my-2 ${netScore >= 2000 ? 'text-green-300' : 'text-red-300'}`}>${netScore}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
                    {Object.keys(finalResults.deckChoices).map(deckId => (
                        <div key={deckId} className="bg-black/20 p-4 rounded-lg">
                            <p className="text-lg font-bold">{decksConfig[deckId].name}</p>
                            <p className="text-3xl font-extrabold">{finalResults.deckChoices[deckId]}</p>
                            <p className="text-sm text-white/70">selections</p>
                        </div>
                    ))}
                </div>
                 <div className="mt-6 bg-black/20 rounded-xl p-6 text-center">
                    <p className="text-lg text-white/80">IGT Score (based on learning)</p>
                    <p className="text-6xl font-extrabold text-yellow-300 my-2">{finalResults.score} <span className="text-4xl">/ 5</span></p>
                    <p className="text-white/90 max-w-md mx-auto">{finalResults.interpretation}</p>
                </div>
                <button onClick={handlePlayAgain} className="mt-8 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg">
                    Play Again
                </button>
            </div>
        );
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#5b4ecc] text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-4xl text-center border border-white/15 min-h-[600px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}

