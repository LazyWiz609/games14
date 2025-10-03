import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { getApiBase } from '../../../../lib/apiBase.js';
import { CircleDot, Square, Triangle, Star, Award, RefreshCw, Play, ArrowRight, CheckCircle, BrainCircuit, Edit3 } from 'lucide-react';

// --- CONFIGURATION & CONSTANTS ---

const SCENARIOS = {
  '14-15': [ // Immediate planning (school projects, weekend activities)
    "You have a big history project due next Friday. You also have a math test on Wednesday and soccer practice on Tuesday and Thursday. How would you plan your week to get everything done without rushing at the last minute?",
    "Your parents have agreed to let you host a small party for your friends on Saturday. You need to invite people, plan some activities, get snacks, and clean up afterwards. What are the steps you would take to organize a successful party?",
    "You want to save up $50 to buy a new video game. Your weekly allowance is $10, but you usually spend about $5 on snacks. Create a simple plan to save enough money for the game within a reasonable time."
  ],
  '16-18': [ // Future-oriented planning (college prep, career goals, long-term projects)
    "You're in your final year of high school and want to apply to three universities. Each application has different deadlines, essay requirements, and needs letters of recommendation. Outline a step-by-step plan from now until January to ensure all applications are strong and submitted on time.",
    "You're interested in a career in graphic design, but you don't have much experience. Create a long-term plan for the next two years to build a strong portfolio, learn necessary skills, and gain experience that would make you a good candidate for college programs or entry-level jobs.",
    "You and two friends want to plan a week-long road trip for the summer after graduation. You need to decide on a destination, create a budget for gas, food, and lodging, plan an itinerary, and figure out transportation. What are the key steps you would take to plan this trip?"
  ]
};

const SCORE_INTERPRETATION = {
    5: "Excellent Planning Quality", 4: "Good Planning Quality", 3: "Average Planning Quality",
    2: "Poor Planning Quality", 1: "Very Poor Planning Quality"
};

// --- SCORING ALGORITHM ---

// Heuristic-based scoring to approximate the document's criteria
const calculateScore = (responseText, ageGroup) => {
    const text = responseText.toLowerCase().trim();
    if (text.length < 15) return 1;

    // 1. Count steps (looks for lists, keywords)
    const stepSeparators = text.match(/(\d+\.|-|\*|•|first|second|third|fourth|fifth|then|next|finally|after that|step \d)/g);
    const numSteps = stepSeparators ? new Set(stepSeparators).size : text.split('.').length - 1;

    // 2. Check for keywords related to quality
    let realismScore = 0;
    if (ageGroup === '14-15') {
        if (/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|after school|in the morning)\b/.test(text)) realismScore++;
        if (/\b(ask|budget|list|invite|plan|schedule|save)\b/.test(text)) realismScore++;
        if (numSteps >= 3) return 5;
        if (numSteps >= 2 && realismScore > 0) return 4;
        if (numSteps >= 1) return 3;
        return 2;
    } else { // 16-18
        if (/\b(research|apply|portfolio|deadline|resume|internship|network)\b/.test(text)) realismScore++;
        if (/\b(budget|save money|itinerary|book|long-term|career|skills)\b/.test(text)) realismScore++;
        if (numSteps >= 5 && realismScore > 0) return 5;
        if (numSteps >= 3 && realismScore > 0) return 4;
        if (numSteps >= 2) return 3;
        if (numSteps >= 1) return 2;
        return 1;
    }
};


// --- HELPER & UI COMPONENTS ---

function FloatingIcon({ Icon, size, top, left, delay }) {
  return <Icon size={size} className="absolute text-[#5549c8] animate-float opacity-30" style={{ top, left, animationDelay: `${delay}s` }} fill="#5549c8" strokeWidth={0} />;
}

// --- MAIN GAME COMPONENT ---

export default function PlanGame() {
  const [game, setGame] = useState({
    status: 'selection', ageGroup: null, scenarioIndex: 0,
    responses: [], // Stores { scenario, response, score }
  });
  const [currentResponse, setCurrentResponse] = useState("");

  const currentScenarios = useMemo(() => game.ageGroup ? SCENARIOS[game.ageGroup] : [], [game.ageGroup]);
  const currentScenario = useMemo(() => currentScenarios[game.scenarioIndex] || null, [currentScenarios, game.scenarioIndex]);

  const { user } = useAuth();
  // Save results to backend when finished
  useEffect(() => {
    if (game.status !== 'finished') return;
    try {
      const totalScore = game.responses.reduce((sum, res) => sum + (res.score || 0), 0);
      const avg = game.responses.length ? Math.round(totalScore / game.responses.length) : 0;

      const key = 'game2_session_id';
      let sessionId = localStorage.getItem(key);
      if (!sessionId) {
        sessionId = `g2_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem(key, sessionId);
      }
      fetch(`${getApiBase()}/save_game2.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          player_name: user?.name || 'Guest',
          roll_number: user?.rollNumber || '',
          timestamp: new Date().toISOString(),
          plan_score: avg,
        }),
      }).catch(() => {});
    } catch (_) {}
  }, [game.status, game.responses, user]);

  const setupGame = useCallback((ageGroup) => {
    setGame(g => ({ ...g, status: 'instructions', ageGroup }));
  }, []);

  const startGame = useCallback(() => {
    setGame(g => ({ ...g, status: 'playing', scenarioIndex: 0, responses: [] }));
    setCurrentResponse("");
  }, []);

  const handleSubmitResponse = useCallback(() => {
    if (currentResponse.trim().length < 10) {
        alert("Please provide a more detailed response.");
        return;
    }
    const score = calculateScore(currentResponse, game.ageGroup);
    const newResponses = [...game.responses, {
        scenario: currentScenario,
        response: currentResponse,
        score: score
    }];

    const isLastScenario = game.scenarioIndex === currentScenarios.length - 1;

    setGame(g => ({
        ...g,
        responses: newResponses,
        status: isLastScenario ? 'finished' : g.status,
        scenarioIndex: isLastScenario ? g.scenarioIndex : g.scenarioIndex + 1
    }));
    setCurrentResponse("");

  }, [currentResponse, game.ageGroup, game.responses, game.scenarioIndex, currentScenario, currentScenarios.length]);

  const resetGame = useCallback(() => {
    setGame({ status: 'selection', ageGroup: null, scenarioIndex: 0, responses: [] });
    setCurrentResponse("");
  }, []);

  // --- RENDERABLE SCREENS ---
  const renderScreen = () => {
    switch (game.status) {
      case 'selection': return (
        <div className="screen-container">
          <BrainCircuit size={64} className="text-cyan-300" />
          <h1 className="title">Life Planning Scenarios</h1>
          <p className="subtitle">Please select your age group to begin.</p>
          <div className="flex flex-col gap-4 mt-6">
            <button className="btn-primary" onClick={() => setupGame('14-15')}>Ages 14-15</button>
            <button className="btn-primary" onClick={() => setupGame('16-18')}>Ages 16-18</button>
          </div>
        </div>
      );
      case 'instructions': return (
        <div className="screen-container">
            <h1 className="title">Instructions</h1>
            <p className="subtitle text-left max-w-lg">
                You will be presented with several real-life scenarios.
                <br/><br/>
                - Read each situation carefully.
                <br/>
                - In the text box, write a clear, step-by-step plan to address the scenario.
                <br/><br/>
                Think about details, timing, and potential problems. Your planning quality will be scored.
            </p>
            <button onClick={startGame} className="btn-primary mt-8 animate-pulse"><Play className="mr-2" /> Start First Scenario</button>
        </div>
      );
      case 'playing': return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-8 shadow-2xl text-white w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
          <div className="w-full flex flex-col text-center">
            <h1 className="text-3xl font-bold tracking-wider">Scenario {game.scenarioIndex + 1} of {currentScenarios.length}</h1>
            <p className="mt-4 text-lg text-left bg-black/20 p-4 rounded-lg">{currentScenario}</p>
          </div>
          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Write your step-by-step plan here..."
            className="w-full h-48 p-3 bg-black/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
          <button onClick={handleSubmitResponse} className="btn-primary self-end">
            {game.scenarioIndex === currentScenarios.length - 1 ? 'Finish & See Results' : 'Submit & Next Scenario'} <ArrowRight className="ml-2"/>
          </button>
        </div>
      );
      case 'finished':
        return (
            <div className="screen-container">
                <Award size={80} className="text-yellow-300 drop-shadow-lg" />
                <h1 className="title">Activity Complete!</h1>
                <p className="subtitle">Here is what you entered for each scenario.</p>
                <div className="mt-6 text-lg space-y-4 bg-black/20 p-6 rounded-lg text-left w-full">
                  {game.responses.map((res, idx) => (
                    <div key={idx} className="bg-white/5 rounded-md p-4">
                      <p className="text-sm text-white/70 mb-2">Scenario {idx + 1}</p>
                      <p className="whitespace-pre-wrap leading-relaxed">{res.response}</p>
                    </div>
                  ))}
                </div>
                <button onClick={resetGame} className="btn-primary mt-8"><RefreshCw className="mr-2"/> Play Again</button>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#5b4ecc] overflow-hidden font-sans">
      <style>{`
        .title { font-size: 2.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .subtitle { font-size: 1.125rem; color: #e2e8f0; margin-top: 0.5rem; text-align: center; }
        .screen-container { background-color: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 1rem; padding: 2rem; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); color: white; width: 100%; max-width: 48rem; margin: auto; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; }
        .btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; background-color: #34d399; color: white; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn-primary:hover { background-color: #10b981; }
      `}</style>
      <div className="absolute inset-0 z-0">
        <FloatingIcon Icon={CircleDot} size={400} top="5%" left="0%" delay={0} />
        <FloatingIcon Icon={Square} size={500} top="20%" left="30%" delay={3} />
        <FloatingIcon Icon={Triangle} size={350} top="50%" left="80%" delay={6} />
        <FloatingIcon Icon={Star} size={450} top="75%" left="10%" delay={9} />
      </div>
      <main className="relative z-10 w-full">{renderScreen()}</main>
    </div>
  );
}
