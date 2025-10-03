import { useMemo, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { LogOut, CircleDot, Square, Triangle, Star } from "lucide-react";

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

// Reflection Questions
const questions = [
  { id: 1, text: "Describe a recent time you had trouble with self-control." },
  { id: 2, text: "Give an example of when you forgot something important." },
  { id: 3, text: "Tell about a situation where you had to change plans unexpectedly. How did it go?" }
];
export default function Diary() {
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const [results, setResults] = useState(null);

  const handleTextChange = (e) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = e.target.value;
      setAnswers(newAnswers);
  };

  const handleNext = () => {
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
      } else {
          calculateResults();
          setGameState('finished');
      }
  };

  const calculateResults = () => {
      const finalResults = answers.map((answerText, index) => {
          const wordCount = answerText.trim() === '' ? 0 : answerText.trim().split(/\s+/).length;
          return {
              question: questions[index].text,
              answer: answerText,
              wordCount: wordCount
          };
      });
      setResults(finalResults);
  };

  const restartGame = () => {
      setGameState('start');
      setCurrentQuestionIndex(0);
      setAnswers(['', '', '']);
      setResults(null);
  };

  const renderGameContent = () => {
      switch (gameState) {
          case 'start':
              return (
                  <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Brief Executive Diary</h1>
                      <p className="text-lg mb-8">You will be asked 3 questions about recent experiences. Please reflect and answer them thoughtfully.</p>
                      <button onClick={() => setGameState('playing')} className="px-8 py-4 bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition-transform transform hover:scale-105">
                          Start Reflection
                      </button>
                  </div>
              );
          case 'finished':
              return (
                  <div className="text-center w-full">
                      <h1 className="text-4xl font-bold mb-4">Reflection Complete!</h1>
                      <p className="text-lg mb-6">Here are your reflections.</p>
                      <div className="space-y-4 text-left">
                          {results.map((result, index) => (
                              <div key={index} className="bg-black/20 p-4 rounded-lg">
                                  <p className="font-semibold text-gray-300">{result.question}</p>
                                  <p className="text-white my-2 italic">"{result.answer || 'No response provided.'}"</p>
                                  <div className="flex justify-end items-center mt-2 border-t border-white/20 pt-2">
                                      <p className="font-bold text-lg"><span className="text-purple-300">Word Count:</span> {result.wordCount}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                      <button onClick={restartGame} className="mt-8 px-8 py-4 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
                          Reflect Again
                      </button>
                  </div>
              );
          case 'playing':
              const currentQuestion = questions[currentQuestionIndex];
              const currentAnswer = answers[currentQuestionIndex];
              return (
                  <div className="w-full text-center">
                      <p className="text-sm font-semibold tracking-widest text-gray-300 uppercase mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>
                      <p className="text-2xl mb-6">{currentQuestion.text}</p>
                      <textarea
                          value={currentAnswer}
                          onChange={handleTextChange}
                          placeholder="Type your reflection here..."
                          className="w-full h-40 p-4 bg-black/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <div className="text-right text-sm text-gray-300 mt-1">{currentAnswer.length} characters</div>
                      <button onClick={handleNext} className="mt-6 px-8 py-4 bg-purple-500 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-600 transition-transform transform hover:scale-105">
                          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish & See Results'}
                      </button>
                  </div>
              );
      }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#5b4ecc] overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <FloatingIcon Icon={CircleDot} size={400} top="5%" left="0%" delay={0} />
        <FloatingIcon Icon={CircleDot} size={100} top="5%" left="65%" delay={0} />
        <FloatingIcon Icon={Square} size={500} top="20%" left="30%" delay={3} />
        <FloatingIcon Icon={Triangle} size={350} top="50%" left="80%" delay={6} />
        <FloatingIcon Icon={Star} size={450} top="75%" left="10%" delay={9} />
        <FloatingIcon Icon={Star} size={150} top="15%" left="80%" delay={9} />
      </div>

      <header className="flex justify-between items-center p-3 text-white relative z-10">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-12 h-12 rounded-full text-[22px]" style={{ backgroundColor: bg }}>
            {emoji}
          </div>
          <span className="font-semibold text-[16px]">Hi, {user?.name}!</span>
        </div>
        <Link to={'/games/4'}
          className="flex items-center gap-2 px-6 py-4 bg-green-500 text-xl text-white rounded-md font-semibold hover:bg-green-600 transition">
          Back to Game4
        </Link>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition">
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <main className="flex-1 grid place-items-center text-center p-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg text-white w-full max-w-4xl">
          {renderGameContent()}
        </div>
      </main>
    </div>
  );
}
