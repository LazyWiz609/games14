import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../../../context/AuthContext.jsx";
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
// Scenarios Data
const scenarios = [
  {
    id: 1,
    topic: 'Party Attendance',
    text: 'You get invited to a big party on Saturday, but you have a huge test on Monday you need to study for.',
    options: [
      { id: 'A', text: 'Go to the party and study later.' },
      { id: 'B', text: 'Stay home and focus on studying.' },
    ],
    peerText: 'All your friends are texting you, saying you have to come and that you can just study on Sunday.'
  },
  {
    id: 2,
    topic: 'Academic Choices',
    text: 'It\'s time to pick your classes for next year. There\'s a class you\'re really interested in, but none of your friends are taking it.',
    options: [
      { id: 'A', text: 'Take the class you\'re interested in.' },
      { id: 'B', text: 'Take an easier class with your friends.' },
    ],
    peerText: 'Your friends think you should take the easier class with them so you can all have fun together.'
  },
  {
    id: 3,
    topic: 'Rule-Following',
    text: 'You and your friends are at the movies and consider sneaking into a second movie without paying.',
    options: [
      { id: 'A', text: 'Tell them it\'s a bad idea and go home.' },
      { id: 'B', text: 'Go along with it to not ruin the fun.' },
    ],
    peerText: 'Your friends are all for it, saying "everyone does it" and that you won\'t get caught.'
  },
  {
    id: 4,
    topic: 'Friendship Conflicts',
    text: 'Two of your best friends had a big argument and are now asking you to take a side.',
    options: [
      { id: 'A', text: 'Try to help them talk it out without taking a side.' },
      { id: 'B', text: 'Side with the friend you think is more in the right.' },
    ],
    peerText: 'The friend you feel is more right is pressuring you to back them up and stop talking to the other friend.'
  },
  {
    id: 5,
    topic: 'Social Events',
    text: 'A new student invites you to their birthday lunch. You don\'t know them well, and your friends are planning to sit at your usual table.',
    options: [
      { id: 'A', text: 'Join the new student for their birthday.' },
      { id: 'B', text: 'Stick with your friends at your usual table.' },
    ],
    peerText: 'Your friends think you should stay with them, saying it would be awkward to go sit with someone new.'
  },
  {
    id: 6,
    topic: 'Academic Integrity',
    text: 'A friend asks if they can copy your homework because they didn\'t have time to do it.',
    options: [
      { id: 'A', text: 'Politely refuse and offer to help them understand it.' },
      { id: 'B', text: 'Let them copy your answers.' },
    ],
    peerText: 'Your friend says, "Please, I\'m desperate! A real friend would help me out here."'
  },
  {
    id: 7,
    topic: 'Trying New Things',
    text: 'There are tryouts for the school play. You\'ve always been curious about acting, but you\'re nervous.',
    options: [
      { id: 'A', text: 'Go to the tryouts and give it a shot.' },
      { id: 'B', text: 'Decide it\'s too scary and skip it.' },
    ],
    peerText: 'You mention it to a friend and they laugh, saying, "You, in a play? That\'s not really your thing, is it?"'
  },
  {
    id: 8,
    topic: 'Interpersonal Boundaries',
    text: 'A friend is telling a secret about another person that you feel is not their story to share.',
    options: [
      { id: 'A', text: 'Change the subject or say you\'re not comfortable gossiping.' },
      { id: 'B', text: 'Listen to the story.' },
    ],
    peerText: 'Your friend says, "Oh come on, I have to tell you what happened. It\'s so juicy!"'
  }
];

const getScoreAndPattern = (choiceChanges) => {
  if (choiceChanges <= 1) return { score: 5, pattern: "Aware but independent", quality: "Maintains good reasoning", confidence: "High in both conditions" };
  if (choiceChanges === 2) return { score: 4, pattern: "Mostly independent", quality: "Minor reasoning decline", confidence: "Slight drop with peers" };
  if (choiceChanges <= 4) return { score: 3, pattern: "Balanced approach", quality: "Some reasoning affected", confidence: "Moderate confidence loss" };
  if (choiceChanges <= 6) return { score: 2, pattern: "Overly concerned with peers", quality: "Reasoning clearly affected", confidence: "Large confidence drop" };
  return { score: 1, pattern: "Dominated by peer opinion", quality: "Poor reasoning under pressure", confidence: "Very low with peers" };
};

export default function Social() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { emoji, bg } = useMemo(() => {
    const seed = user?.id ?? Math.random();
    return {
      emoji: pickFromArray(EMOJIS, seed),
      bg: pickFromArray(COLORS, seed + "bg"),
    };
  }, [user]);

  const [gameState, setGameState] = useState('start'); // 'start', 'personal', 'interstitial', 'peer', 'finished'
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [personalAnswers, setPersonalAnswers] = useState([]);
  const [peerAnswers, setPeerAnswers] = useState([]);
  const [shuffledScenarios, setShuffledScenarios] = useState([]);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (gameState === 'personal') {
      setShuffledScenarios([...scenarios].sort(() => Math.random() - 0.5));
    }
  }, [gameState]);

  const handleAnswer = (scenarioId, choiceId) => {
    if (gameState === 'personal') {
      const nextAnswers = [...personalAnswers, { scenarioId, choiceId }];
      setPersonalAnswers(nextAnswers);
      if (currentScenarioIndex < scenarios.length - 1) {
        setCurrentScenarioIndex(prev => prev + 1);
      } else {
        setGameState('interstitial');
        setCurrentScenarioIndex(0);
      }
    } else if (gameState === 'peer') {
      const nextAnswers = [...peerAnswers, { scenarioId, choiceId }];
      setPeerAnswers(nextAnswers);
      if (currentScenarioIndex < scenarios.length - 1) {
        setCurrentScenarioIndex(prev => prev + 1);
      } else {
        calculateResults(personalAnswers, nextAnswers);
        setGameState('finished');
      }
    }
  };

  const calculateResults = (personal, peer) => {
    let choiceChanges = 0;
    personal.forEach(pAnswer => {
      const peerAnswer = peer.find(sAnswer => sAnswer.scenarioId === pAnswer.scenarioId);
      if (peerAnswer && pAnswer.choiceId !== peerAnswer.choiceId) {
        choiceChanges++;
      }
    });
    const scoreData = getScoreAndPattern(choiceChanges);
    setResults({ ...scoreData, choiceChanges });
  };

  const restartGame = () => {
    setGameState('start');
    setCurrentScenarioIndex(0);
    setPersonalAnswers([]);
    setPeerAnswers([]);
    setResults(null);
  };

  const renderGameContent = () => {
    switch (gameState) {
      case 'start':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Social Decision Scenarios</h1>
            <p className="text-lg mb-8">You will be presented with 8 scenarios. First, make your own choice. Then, you'll see the scenarios again with peer influence.</p>
            <button onClick={() => setGameState('personal')} className="px-8 py-4 bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition-transform transform hover:scale-105">
              Start Personal Choices
            </button>
          </div>
        );
      case 'interstitial':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Personal Choices Complete</h1>
            <p className="text-lg mb-8">Great job. Now, you will see the same scenarios again, but this time you'll know what your friends think.</p>
            <button onClick={() => setGameState('peer')} className="px-8 py-4 bg-purple-500 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-600 transition-transform transform hover:scale-105">
              Start Peer Pressure Round
            </button>
          </div>
        );
      case 'finished':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Task Complete!</h1>
            <p className="text-lg mb-6">Here's your social confidence score:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-black/20 p-6 rounded-lg">
              <div className="p-4 rounded-lg bg-white/10 md:col-span-2">
                <h3 className="text-xl font-semibold text-green-300">Overall Social Confidence Score</h3>
                <p className="text-6xl font-bold">{results.score} / 5</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10">
                <h3 className="text-lg font-semibold text-purple-300">Confidence Pattern</h3>
                <p className="text-xl font-bold">{results.confidence}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10">
                <h3 className="text-lg font-semibold text-blue-300">Peer Influence</h3>
                <p className="text-xl font-bold">You changed your choice in {results.choiceChanges} of 8 scenarios.</p>
              </div>
            </div>
            <button onClick={restartGame} className="mt-8 px-8 py-4 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
              Play Again
            </button>
          </div>
        );
      case 'personal':
      case 'peer':
        const scenarioSet = gameState === 'personal' ? scenarios : shuffledScenarios;
        const currentScenario = scenarioSet[currentScenarioIndex];

        if (!currentScenario) {
          return <div className="text-2xl text-center">Loading...</div>;
        }

        return (
          <div className="w-full">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">Scenario {currentScenarioIndex + 1} of {scenarios.length}</h2>
              <p className="text-lg font-semibold">{currentScenario.topic}</p>
            </div>
            {gameState === 'peer' && (
              <div className="bg-yellow-400/20 border-l-4 border-yellow-400 text-yellow-200 p-4 rounded-md mb-6 text-center shadow-lg">
                <p className="font-bold">Your friends think you should...</p>
                <p>{currentScenario.peerText}</p>
              </div>
            )}
            <p className="text-2xl text-center mb-8 min-h-[6rem] flex items-center justify-center">{currentScenario.text}</p>
            <div className="flex justify-around">
              {currentScenario.options.map(option => (
                <button key={option.id} onClick={() => handleAnswer(currentScenario.id, option.id)}
                  className="w-5/12 p-6 bg-white/10 text-white font-semibold rounded-lg shadow-lg hover:bg-white/20 transition-transform transform hover:scale-105"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        );
    }
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