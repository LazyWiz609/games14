import { useMemo, useState } from "react";
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

const questions = [
  // Inhibition
  { id: 1, domain: 'Inhibition', text: "I act without thinking." },
  { id: 2, domain: 'Inhibition', text: "I have trouble waiting my turn in conversations or games." },
  { id: 3, domain: 'Inhibition', text: "I interrupt others when they are speaking." },
  { id: 4, domain: 'Inhibition', text: "I say things I regret later." },
  { id: 5, domain: 'Inhibition', text: "I find it hard to resist temptations." },
  { id: 6, domain: 'Inhibition', text: "I start tasks before getting all the instructions." },
  { id: 7, domain: 'Inhibition', text: "I make impulsive decisions." },
  { id: 8, domain: 'Inhibition', text: "I have difficulty stopping an activity I enjoy, even when I should." },
  { id: 9, domain: 'Inhibition', text: "I rush through my assignments or chores." },
  { id: 10, domain: 'Inhibition', text: "I blurt out answers in class before being called on." },
  // Working Memory
  { id: 11, domain: 'Working Memory', text: "I forget instructions a few moments after hearing them." },
  { id: 12, domain: 'Working Memory', text: "I lose track of my belongings like my keys, phone, or homework." },
  { id: 13, domain: 'Working Memory', text: "I have trouble remembering what I just read." },
  { id: 14, domain: 'Working Memory', text: "I walk into a room and forget why I went there." },
  { id: 15, domain: 'Working Memory', text: "I find it hard to follow multi-step directions." },
  { id: 16, domain: 'Working Memory', text: "I lose my train of thought while speaking." },
  { id: 17, domain: 'Working Memory', text: "I need to have things repeated to me." },
  { id: 18, domain: 'Working Memory', text: "I forget important dates or appointments." },
  { id: 19, domain: 'Working Memory', text: "I struggle to remember names of people I just met." },
  { id: 20, domain: 'Working Memory', text: "I have difficulty doing math problems in my head." },
  // Flexibility
  { id: 21, domain: 'Flexibility', text: "I get upset by unexpected changes in plans." },
  { id: 22, domain: 'Flexibility', text: "I have trouble switching from one activity to another." },
  { id: 23, domain: 'Flexibility', text: "I get stuck on one way of doing things, even if it's not working." },
  { id: 24, domain: 'Flexibility', text: "I find it hard to see a problem from someone else's perspective." },
  { id: 25, domain: 'Flexibility', text: "I have trouble with new situations or unfamiliar places." },
  { id: 26, domain: 'Flexibility', text: "I get frustrated when rules change." },
  { id: 27, domain: 'Flexibility', text: "I have a hard time admitting when I'm wrong." },
  { id: 28, domain: 'Flexibility', text: "I resist trying new foods or activities." },
  { id: 29, domain: 'Flexibility', text: "I think in 'black and white' terms, finding it hard to see the gray areas." },
  { id: 30, domain: 'Flexibility', text: "I struggle to find a different solution when my first attempt fails." },
  // Emotional Control
  { id: 31, domain: 'Emotional Control', text: "Small problems or frustrations upset me more than they should." },
  { id: 32, domain: 'Emotional Control', text: "My emotional reactions feel very intense and overwhelming." },
  { id: 33, domain: 'Emotional Control', text: "I have a short temper or get angry easily." },
  { id: 34, domain: 'Emotional Control', text: "I overreact to situations." },
  { id: 35, domain: 'Emotional Control', text: "I find it hard to calm down once I'm upset." },
  { id: 36, domain: 'Emotional Control', text: "My mood can change quickly and unpredictably." },
  { id: 37, domain: 'Emotional Control', text: "I get easily embarrassed or discouraged." },
  { id: 38, domain: 'Emotional Control', text: "I cry over minor things." },
  { id: 39, domain: 'Emotional Control', text: "I find it difficult to handle criticism, even when it's constructive." },
  { id: 40, domain: 'Emotional Control', text: "I worry too much about what others think of me." },
  // Planning
  { id: 41, domain: 'Planning', text: "I have trouble planning ahead for projects or assignments." },
  { id: 42, domain: 'Planning', text: "My room, backpack, or locker is messy and disorganized." },
  { id: 43, domain: 'Planning', text: "I wait until the last minute to start my homework or study for tests." },
  { id: 44, domain: 'Planning', text: "I have a hard time estimating how long a task will take." },
  { id: 45, domain: 'Planning', text: "I forget to bring the things I need for school or activities." },
  { id: 46, domain: 'Planning', text: "I struggle to break down large projects into smaller steps." },
  { id: 47, domain: 'Planning', text: "I have trouble managing my time effectively." },
  { id: 48, domain: 'Planning', text: "I start projects but have a hard time finishing them." },
  { id: 49, domain: 'Planning', text: "I don't have a system for keeping track of my assignments and due dates." },
  { id: 50, domain: 'Planning', text: "I find it difficult to set and work towards long-term goals." },
];

const scoringMap = {
  'Inhibition': { 1: "Excellent control", 2: "Good control", 3: "Some problems", 4: "Frequent problems", 5: "Major problems" },
  'Working Memory': { 1: "Never forgets", 2: "Minor forgetting", 3: "Moderate forgetting", 4: "Often forgets", 5: "Forgets constantly" },
  'Flexibility': { 1: "Adapts easily", 2: "Some adaptation", 3: "Moderate difficulty", 4: "Often struggles", 5: "Very rigid" },
  'Emotional Control': { 1: "Stays calm", 2: "Usually calm", 3: "Sometimes upset", 4: "Gets upset easily", 5: "Emotional outbursts" },
  'Planning': { 1: "Very organized", 2: "Mostly organized", 3: "Basic organization", 4: "Poor organization", 5: "Very disorganized" },
};

// This function converts the average point score (1-4) to a final score (1-5)
const getDomainScore = (averagePoints) => {
  if (averagePoints <= 1.5) return 1;
  if (averagePoints <= 2.2) return 2;
  if (averagePoints <= 3.0) return 3;
  if (averagePoints <= 3.7) return 4;
  return 5;
};

export default function Executive() {
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
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);

  const handleAnswer = (questionId, domain, points) => {
      const nextAnswers = [...answers, { questionId, domain, points }];
      setAnswers(nextAnswers);

      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
      } else {
          calculateResults(nextAnswers);
          setGameState('finished');
      }
  };

  const calculateResults = (finalAnswers) => {
      const domainScores = {};
      const domainCounts = {};

      finalAnswers.forEach(answer => {
          domainScores[answer.domain] = (domainScores[answer.domain] || 0) + answer.points;
          domainCounts[answer.domain] = (domainCounts[answer.domain] || 0) + 1;
      });

      const finalResults = {};
      for (const domain in domainScores) {
          const average = domainScores[domain] / domainCounts[domain];
          const score = getDomainScore(average);
          const description = scoringMap[domain][score];
          finalResults[domain] = { score, description };
      }
      setResults(finalResults);
  };

  const restartGame = () => {
      setGameState('start');
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setResults(null);
  };
  
  const renderGameContent = () => {
      switch (gameState) {
          case 'start':
              return (
                  <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Executive Function Self-Report</h1>
                      <p className="text-lg mb-8">Answer 50 questions about your daily habits and challenges. Please respond honestly.</p>
                      <button onClick={() => setGameState('playing')} className="px-8 py-4 bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition-transform transform hover:scale-105">
                          Start Assessment
                      </button>
                  </div>
              );
          case 'finished':
              return (
                  <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Assessment Complete!</h1>
                      <p className="text-lg mb-6">Here are your results across five key areas of executive function:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center bg-black/20 p-6 rounded-lg">
                          {Object.entries(results).map(([domain, result]) => (
                              <div key={domain} className="p-4 rounded-lg bg-white/10 flex flex-col justify-between">
                                  <h3 className="text-xl font-semibold text-green-300">{domain}</h3>
                                  <p className="text-6xl font-bold my-4">{result.score}</p>
                                  <p className="text-lg font-bold">{result.description}</p>
                              </div>
                          ))}
                      </div>
                      <button onClick={restartGame} className="mt-8 px-8 py-4 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
                          Take Again
                      </button>
                  </div>
              );
          case 'playing':
              const currentQuestion = questions[currentQuestionIndex];
              const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
              return (
                  <div className="w-full">
                      <div className="mb-6 text-center">
                           <p className="text-sm font-semibold tracking-widest text-gray-300 uppercase">Question {currentQuestionIndex + 1} of {questions.length}</p>
                           <div className="w-full bg-black/20 rounded-full h-2.5 mt-2">
                              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                      </div>
                      <p className="text-2xl text-center mb-10 min-h-[6rem] flex items-center justify-center">{currentQuestion.text}</p>
                      <div className="flex justify-around items-center">
                          {[
                              { label: "Never", points: 1 },
                              { label: "Sometimes", points: 2 },
                              { label: "Often", points: 3 },
                              { label: "Very Often", points: 4 }
                          ].map(option => (
                              <button key={option.label} onClick={() => handleAnswer(currentQuestion.id, currentQuestion.domain, option.points)}
                                  className="flex items-center justify-center w-36 h-36 bg-white/10 text-white font-semibold text-lg rounded-full border-4 border-transparent hover:border-white hover:bg-white/20 transition-all transform hover:scale-110"
                              >
                                  {option.label}
                              </button>
                          ))}
                      </div>
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
