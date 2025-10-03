import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext.jsx";
import { LogOut, CircleDot, Square, Triangle, Star } from "lucide-react";
import balloon from '../../../assets/balloon.png';
import reward from '../../../assets/reward.png';
import gambling from '../../../assets/gambling.png';

const EMOJIS = [
  "😀", "😄", "😁", "😎", "🧐", "🤓", "🤠", "🦊", "🦁", "🐯", "🐶", "🐱", "🐨", "🐵", "🐸", "🦄", "🐙", "🐝", "🦋", "🍀", "🌸", "🌼", "🌞", "🌈", "⚽", "🏀", "🎮", "🎲"
];

const COLORS = [
  "#FDE68A", "#BBF7D0", "#BAE6FD", "#E9D5FF", "#FBCFE8", "#FFD6A5",
  "#B9FBC0", "#A0E7E5", "#E4C1F9", "#D6E2E9"
];

function pickFromArray(arr, seed) {
  const idx = Math.abs(hashCode(String(seed))) % arr.length;
  return arr[idx];
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/* Floating Icon Component */
// Modified: Added 'fill' prop to the Icon
function FloatingIcon({ Icon, size, top, left, delay }) {
  return (
    <Icon
      size={size}
      className="absolute text-[#5549c8] animate-float"
      style={{ top, left, animationDelay: `${delay}s` }}
      fill="#5549c8"
      strokeWidth={0}
    />
  );
}

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Generates the set of trials for the game
const generateTrials = () => {
  const trials = [];
  const lineHeights = [100, 140, 180, 220, 260];
  const deltas = [20, 30, 40];

  // Create 6 control trials
  for (let i = 0; i < 6; i++) {
    const correctHeight = lineHeights[i % lineHeights.length];
    const delta = deltas[i % deltas.length];
    const options = shuffleArray([correctHeight, correctHeight - delta, correctHeight + delta]);
    trials.push({
      id: i,
      type: 'control',
      standardLineHeight: correctHeight,
      comparisonLines: options,
      correctAnswerIndex: options.indexOf(correctHeight),
    });
  }

  // Create 12 conformity trials
  for (let i = 0; i < 12; i++) {
    const correctHeight = lineHeights[i % lineHeights.length];
    const delta = deltas[i % deltas.length];
    const options = shuffleArray([correctHeight, correctHeight - delta, correctHeight + delta]);
    const correctAnswerIndex = options.indexOf(correctHeight);
    let peerChoiceIndex;
    do {
      peerChoiceIndex = Math.floor(Math.random() * 3);
    } while (peerChoiceIndex === correctAnswerIndex);

    trials.push({
      id: i + 6,
      type: 'conformity',
      standardLineHeight: correctHeight,
      comparisonLines: options,
      correctAnswerIndex: correctAnswerIndex,
      peerChoiceIndex: peerChoiceIndex,
    });
  }

  return shuffleArray(trials);
};

const getScoreAndPattern = (conformityRate, ageGroup) => {
  if (ageGroup === '14-15') {
    if (conformityRate <= 15) return { score: 5, pattern: "Strong independence" };
    if (conformityRate <= 25) return { score: 4, pattern: "Good resistance" };
    if (conformityRate <= 40) return { score: 3, pattern: "Moderate conformity" };
    if (conformityRate <= 60) return { score: 2, pattern: "High conformity" };
    return { score: 1, pattern: "Extreme conformity" };
  }
  if (ageGroup === '16-18') {
    if (conformityRate <= 10) return { score: 5, pattern: "Strong independence" };
    if (conformityRate <= 20) return { score: 4, pattern: "Good resistance" };
    if (conformityRate <= 30) return { score: 3, pattern: "Moderate conformity" };
    if (conformityRate <= 45) return { score: 2, pattern: "High conformity" };
    return { score: 1, pattern: "Extreme conformity" };
  }
  return { score: 0, pattern: "N/A" };
};

export default function Line() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { emoji, bg } = useMemo(() => {
    const seed = user?.id ?? Math.random();
    return {
      emoji: pickFromArray(EMOJIS, seed),
      bg: pickFromArray(COLORS, seed + "bg"),
    };
  }, [user]);
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'finished'
  const [ageGroup, setAgeGroup] = useState(null);
  const [trials, setTrials] = useState([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [showPeerChoices, setShowPeerChoices] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    if (gameState === 'playing') {
      setTrials(generateTrials());
    }
  }, [gameState]);

  const handleAgeSelect = (age) => {
    setAgeGroup(age);
    setGameState('playing');
  };

  const calculateResults = useCallback((finalAnswers) => {
    const conformityTrialsData = trials.filter(t => t.type === 'conformity');
    let conformCount = 0;

    finalAnswers.forEach(answer => {
      const trial = trials.find(t => t.id === answer.trialId);
      if (trial && trial.type === 'conformity') {
        if (answer.selectedIndex !== trial.correctAnswerIndex && answer.selectedIndex === trial.peerChoiceIndex) {
          conformCount++;
        }
      }
    });

    const conformityRate = conformityTrialsData.length > 0 ? Math.round((conformCount / conformityTrialsData.length) * 100) : 0;
    const { score, pattern } = getScoreAndPattern(conformityRate, ageGroup);

    setResults({ conformityRate, score, pattern });
    setGameState('finished');

  }, [trials, ageGroup]);


  const handleAnswer = useCallback((selectedIndex) => {
    if (isResponding) return;

    const newAnswer = { trialId: trials[currentTrialIndex].id, selectedIndex };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentTrialIndex < trials.length - 1) {
      setCurrentTrialIndex(prev => prev + 1);
    } else {
      calculateResults(updatedAnswers);
    }
  }, [isResponding, currentTrialIndex, trials, answers, calculateResults]);

  useEffect(() => {
    if (gameState !== 'playing' || trials.length === 0) return;

    const currentTrial = trials[currentTrialIndex];
    if (currentTrial.type === 'conformity') {
      setIsResponding(true);
      setShowPeerChoices(true);
      const timer = setTimeout(() => {
        setShowPeerChoices(false);
        setIsResponding(false);
      }, 2000); // Show peer choices for 2 seconds
      return () => clearTimeout(timer);
    } else {
      setShowPeerChoices(false);
      setIsResponding(false);
    }
  }, [currentTrialIndex, trials, gameState]);

  const restartGame = () => {
    setGameState('start');
    setAgeGroup(null);
    setCurrentTrialIndex(0);
    setAnswers([]);
    setResults(null);
    setTrials([]);
  };
  const renderGameContent = () => {
    if (gameState === 'start') {
      return (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Line Judgment Task</h1>
          <p className="text-lg mb-8">This task measures how social pressure affects judgment. Please select your age group to begin.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleAgeSelect('14-15')} className="px-8 py-4 bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition-transform transform hover:scale-105">
              Ages 14-15
            </button>
            <button onClick={() => handleAgeSelect('16-18')} className="px-8 py-4 bg-purple-500 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-600 transition-transform transform hover:scale-105">
              Ages 16-18
            </button>
          </div>
        </div>
      );
    }

    if (gameState === 'finished' && results) {
      return (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Task Complete!</h1>
          <p className="text-lg mb-6">Here's your conformity & resistance score:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left bg-black/20 p-6 rounded-lg">
            <div className="p-4 rounded-lg bg-white/10">
              <h3 className="text-xl font-semibold text-blue-300">Conformity Rate</h3>
              <p className="text-5xl font-bold">{results.conformityRate}%</p>
              <p className="text-sm">You matched the incorrect group choice this often.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/10">
              <h3 className="text-xl font-semibold text-green-300">Resistance Score</h3>
              <p className="text-5xl font-bold">{results.score} / 5</p>
            </div>
            <div className="p-4 rounded-lg bg-white/10">
              <h3 className="text-xl font-semibold text-purple-300">Conformity Pattern</h3>
              <p className="text-3xl font-bold">{results.pattern}</p>
            </div>
          </div>
          <button onClick={restartGame} className="mt-8 px-8 py-4 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
            Play Again
          </button>
        </div>
      );
    }


    if (gameState === 'playing' && trials.length > 0) {
      const trial = trials[currentTrialIndex];
      return (
        <div>
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">Trial {currentTrialIndex + 1} of {trials.length}</h2>
            <p className="text-md">Which line on the right is the same length as the line on the left?</p>
          </div>
          <div className="flex flex-col md:flex-row justify-around items-center gap-8 p-4">
            {/* Standard Line */}
            <div className="flex flex-col items-center gap-2">
              <div style={{ height: `${trial.standardLineHeight}px` }} className="w-2 bg-white rounded-full"></div>
              <span className="font-bold">Standard</span>
            </div>

            {/* Comparison Lines */}
            <div className="flex justify-center items-end gap-12 md:gap-20 relative">
              {trial.comparisonLines.map((height, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isResponding}
                  className="relative flex flex-col items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPeerChoices && trial.peerChoiceIndex === index && (
                    <div className="absolute -top-8 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-md shadow-lg animate-pulse whitespace-nowrap">
                      This is what your friend chose
                    </div>
                  )}
                  <div
                    style={{ height: `${height}px` }}
                    className={`w-2 rounded-full group-hover:bg-white transition-colors ${showPeerChoices && trial.peerChoiceIndex === index ? 'bg-yellow-400' : 'bg-gray-400'
                      }`}
                  ></div>
                  <span className="font-bold text-xl px-4 py-2 bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">{String.fromCharCode(65 + index)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return <div className="text-center text-2xl">Loading...</div>;
  };
  return (
    <div className="relative min-h-screen flex flex-col bg-[#5b4ecc] overflow-hidden">
      {/* Floating Background Icons */}
      <div className="absolute inset-0 z-0 overflow-hidden"> {/* Corrected z-index here */}
        <FloatingIcon Icon={CircleDot} size={400} top="5%" left="0%" delay={0} />
        <FloatingIcon Icon={CircleDot} size={100} top="5%" left="65%" delay={0} />
        <FloatingIcon Icon={Square} size={500} top="20%" left="30%" delay={3} />
        <FloatingIcon Icon={Triangle} size={350} top="50%" left="80%" delay={6} />
        <FloatingIcon Icon={Star} size={450} top="75%" left="10%" delay={9} />
        <FloatingIcon Icon={Star} size={150} top="15%" left="80%" delay={9} />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center p-3 text-white relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="grid place-items-center w-12 h-12 rounded-full text-[22px]"
            style={{ backgroundColor: bg }}
          >
            {emoji}
          </div>
          <span className="font-semibold text-[16px]">Hi, {user?.name}!</span>
        </div>
        <Link to={'/games/3/'}

          className="flex items-center gap-2 px-6 py-4 bg-green-500 text-xl text-white rounded-md font-semibold hover:bg-green-600 transition"
        >

          Back to Game3
        </Link>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid place-items-center text-center p-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg text-white w-full max-w-6xl">
          {renderGameContent()}
        </div>
      </main>
    </div>
  );
}