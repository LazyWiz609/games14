import { useMemo, useState, useEffect, useRef, useCallback } from "react";
    import { Link, useNavigate } from "react-router-dom";
    
    import { useAuth } from "../../../context/AuthContext.jsx";
    import { LogOut, CircleDot, Square, Triangle, Star } from "lucide-react";
import city from '../../../assets/city.png';
import carImg from '../../../assets/car1.png';

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

export default function Driving() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Driving game state
  // Step-based tuning
  const STEP_UNITS = 100; // one "step" equals 100 virtual distance units
  // Global scale to delay checkpoints and extend track; increase to make events appear later
  const DISTANCE_SCALE = 2.5;
  // Base distances (pre-scale)
  // Push speed limit much later (~50 steps beyond 5000)
  const SPEED_LIMIT_DELAY_STEPS = 50; 
  const BASE_SPEED_LIMIT_DISTANCE = 5000 + (200 + SPEED_LIMIT_DELAY_STEPS) * STEP_UNITS;
  // Place traffic light at ~99.5% of the speed limit distance (appears just before speed limit)
  const BASE_TRAFFIC_LIGHT_DISTANCE = Math.max(2000, Math.floor((BASE_SPEED_LIMIT_DISTANCE - 6500) * 0.25));
  const BASE_PEDESTRIAN_DISTANCE = Math.max(BASE_TRAFFIC_LIGHT_DISTANCE + 2000, BASE_SPEED_LIMIT_DISTANCE - 102 * STEP_UNITS);
  const END_OFFSET_STEPS = 30; // end decision appears 30 steps after speed limit
  const BASE_END_DECISION_DISTANCE = (BASE_SPEED_LIMIT_DISTANCE - 100) + END_OFFSET_STEPS * STEP_UNITS;

  // Apply scale
  const TRAFFIC_LIGHT_DISTANCE = BASE_TRAFFIC_LIGHT_DISTANCE * DISTANCE_SCALE;
  const SPEED_LIMIT_DISTANCE = BASE_SPEED_LIMIT_DISTANCE * DISTANCE_SCALE;
  const PEDESTRIAN_DISTANCE = BASE_PEDESTRIAN_DISTANCE * DISTANCE_SCALE;
  const END_DECISION_DISTANCE = BASE_END_DECISION_DISTANCE * DISTANCE_SCALE;
  const trackLength = END_DECISION_DISTANCE + 200 * DISTANCE_SCALE; // allow a bit of driving after decision
  const speedPerSecond = 4500; // units per second while driving (slightly increased)
  const [distance, setDistance] = useState(0); // 0..trackLength
  const distanceRef = useRef(0);
  const [driveHeld, setDriveHeld] = useState(false); // true while Space/ArrowUp is held
  const isMoving = driveHeld && distance < trackLength; // derived
  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState({ 
    title: '', 
    options: ["Option A", "Option B"],
    selected: null
  });
  const [obstacleIndex, setObstacleIndex] = useState(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef(0);
  
  // Define obstacle checkpoints along the road (absolute distances) first
  const checkpoints = useMemo(() => (
    [
      { title: 'Traffic Light', options: ["Stop", "Go"], distance: TRAFFIC_LIGHT_DISTANCE },
      { title: 'Pedestrian Crossing', options: ["Yield", "Proceed"], distance: PEDESTRIAN_DISTANCE },
      { title: 'Speed Limit Ahead', options: ["Slow Down", "Maintain Speed"], distance: SPEED_LIMIT_DISTANCE },
      { title: 'End of Road', options: ["Take Shortcut", "Go Straight"], distance: END_DECISION_DISTANCE },
    ]
  ), [TRAFFIC_LIGHT_DISTANCE, PEDESTRIAN_DISTANCE, SPEED_LIMIT_DISTANCE, END_DECISION_DISTANCE]);

  // Track game state
  const [gameState, setGameState] = useState({
    firstPlay: true,
    showOthersChoices: false,
    showTryAgain: false,
    showResults: false,
    playCount: 0,
    choices: []
  });
  // Track user's choices
  const [userChoices, setUserChoices] = useState([]);
  
  // Handle completing the game
  const handleGameComplete = useCallback(() => {
    setGameState(prev => {
      const newPlayCount = prev.playCount + 1;
      
      if (newPlayCount === 1) {
        // First playthrough - show others' choices and ask to try again
        return {
          ...prev,
          showOthersChoices: true,
          showTryAgain: true,
          playCount: newPlayCount,
          firstPlay: true
        };
      } else {
        // Second playthrough or declined to play again - show results
        return {
          ...prev,
          showResults: true,
          playCount: newPlayCount,
          firstPlay: false
        };
      }
    });
  }, []);
  
  // Handle choice selection
  const handleChoice = useCallback((choice) => {
    const currentCheckpoint = checkpoints[obstacleIndex];
    const newChoices = [...userChoices, {
      checkpoint: currentCheckpoint.title,
      choice: choice
    }];
    
    setUserChoices(newChoices);
    setModal(prev => ({ ...prev, selected: choice }));
    
    // Close modal after a short delay
    setTimeout(() => {
      setShowModal(false);
      setObstacleIndex(i => {
        const newIndex = Math.min(i + 1, checkpoints.length);
        
        // If this was the last checkpoint, show completion
        if (newIndex === checkpoints.length) {
          setTimeout(handleGameComplete, 1000);
        }
        
        return newIndex;
      });
      lastTsRef.current = 0;
    }, 500);
  }, [obstacleIndex, userChoices, checkpoints, handleGameComplete]);
  
  // Handle try again
  const handleTryAgain = useCallback((playAgain) => {
    if (playAgain) {
      // Reset for second playthrough
      setUserChoices([]);
      setObstacleIndex(0);
      setDistance(0);
      distanceRef.current = 0;
      setGameState(prev => ({
        ...prev,
        showOthersChoices: false,
        showTryAgain: false,
        firstPlay: false,
        showResults: false
      }));
    } else {
      // Show results without playing again
      setGameState(prev => ({
        ...prev,
        showOthersChoices: false,
        showTryAgain: false,
        showResults: true,
        firstPlay: false
      }));
    }
  }, []);

  const obstacleTitles = [
    'Traffic Light',
    'Speed Limit Ahead',
    'Pedestrian Crossing',
    'End of Road',
  ];
  const obstacleOptions = checkpoints.map(c => c.options);

  // Keep ref in sync with state
  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  // Movement loop (forward only while key held)
  useEffect(() => {
    if (!driveHeld || showModal) return;

    let animationId;
    let lastTime = performance.now();
    const baseSpeed = 3; // Increased base speed for faster movement

    const moveCar = (currentTime) => {
      if (!driveHeld || showModal || distanceRef.current >= trackLength) {
        cancelAnimationFrame(animationId);
        return;
      }

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const distanceToMove = baseSpeed * deltaTime;
      distanceRef.current = Math.min(distanceRef.current + distanceToMove, trackLength);

      // Update state less frequently, or use a direct DOM manipulation for background if performance is still an issue.
      // For now, let's update the state, but ensure the background position reads from distanceRef.current
      setDistance(distanceRef.current); 
      
      animationId = requestAnimationFrame(moveCar);
    };

    animationId = requestAnimationFrame(moveCar);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [driveHeld, showModal, trackLength]);

  // Trigger modals at checkpoints in order
  useEffect(() => {
    if (obstacleIndex >= checkpoints.length) return;
    const nextCp = checkpoints[obstacleIndex];
    if (distance >= nextCp.distance && !showModal) {
      setShowModal(true);
      setModal({ 
        title: nextCp.title, 
        options: nextCp.options,
        selected: null
      });
    }
  }, [distance, obstacleIndex, checkpoints, showModal]);

  const chooseOption = useCallback((option) => {
    // Record the choice
    const currentCheckpoint = checkpoints[obstacleIndex];
    const newChoices = [...userChoices, {
      checkpoint: currentCheckpoint.title,
      choice: option
    }];
    setUserChoices(newChoices);
    
    // Update modal to show selected option
    setModal(prev => ({ ...prev, selected: option }));
    
    // Close modal after a short delay
    setTimeout(() => {
      setShowModal(false);
      setObstacleIndex(i => Math.min(i + 1, checkpoints.length));
      lastTsRef.current = 0;
      
      // Check if this was the last checkpoint
      if (obstacleIndex === checkpoints.length - 1) {
        // Wait a moment before showing completion
        setTimeout(() => {
          handleGameComplete();
        }, 1000);
      }
    }, 500);
  }, [obstacleIndex, checkpoints, userChoices]);

  // Track key states
  const keys = useRef({
    ArrowUp: false,
    Space: false,
    KeyW: false
  });

  // Keyboard control: hold Space, ArrowUp, or W to drive
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (!keys.current[e.code]) {
          keys.current[e.code] = true;
          if (!showModal && distanceRef.current < trackLength) {
            setDriveHeld(true);
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        keys.current[e.code] = false;
        
        // Only stop if no movement keys are still pressed
        if (!Object.values(keys.current).some(v => v)) {
          setDriveHeld(false);
        }
      }
    };

    const handleBlur = () => {
      // Reset all keys if window loses focus
      Object.keys(keys.current).forEach(key => {
        keys.current[key] = false;
      });
      setDriveHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [showModal, trackLength]);
  const { emoji, bg } = useMemo(() => {
    const seed = user?.id ?? Math.random();
    return {
      emoji: pickFromArray(EMOJIS, seed),
      bg: pickFromArray(COLORS, seed + "bg"),
    };
  }, [user]);

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
      <main className="flex-1 grid place-items-center p-6 relative z-10">
        {/* Game Viewport */}
        <div
          className="relative w-full max-w-3xl overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-black"
          style={{ height: 'min(80vh, 56.25vw)' }}
        >
          {/* Zoomed city background scrolling vertically */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${city})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% auto',
              backgroundPosition: `center ${((1 - (distance / trackLength)) * 100).toFixed(3)}%`,
              // rely on RAF for smoothness at constant speed
              filter: 'saturate(1.05) contrast(1.05)',
              willChange: 'background-position'
            }}
          />
          {/* Center road car sprite (forward only) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-10 z-10 pointer-events-none">
            <img src={carImg} alt="car" className="w-24 drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)] select-none" />
          </div>

          {/* Objective label (identify current obstacle) */}
          {obstacleIndex < checkpoints.length && (
            <div className="absolute top-3 inset-x-0 z-10 flex justify-center">
              <span className="bg-black/45 text-white text-xs px-3 py-1 rounded-full">
                Next: {checkpoints[obstacleIndex].title}
              </span>
            </div>
          )}

          {/* Progress bar with checkpoints (identify positions) */}
          <div className="absolute right-2 top-6 bottom-6 w-2 bg-white/10 rounded-full overflow-hidden z-10">
            <div
              className="absolute left-0 w-full bg-white/60"
              style={{ bottom: 0, height: `${Math.min(100, (distance / trackLength) * 100)}%` }}
            />
            {checkpoints.map((cp, i) => (
              <div key={i} className="absolute left-1/2 -translate-x-1/2 w-3 h-1.5 bg-indigo-300 rounded-sm"
                title={cp.title}
                style={{ bottom: `${(cp.distance / trackLength) * 100}%` }}
              />
            ))}
          </div>
          {/* Start hint */}
          {!isMoving && !showModal && distance < trackLength && (
            <div className="absolute inset-x-0 bottom-5 text-center text-white/90">
              <p className="inline-block bg-black/40 px-4 py-2 rounded-full text-sm">Hold Space or ↑ Arrow to drive forward</p>
            </div>
          )}

          {/* Obstacle modal */}
          {showModal && (
            <div className="absolute inset-0 grid place-items-center bg-black/50 z-20">
              <div className="bg-white rounded-xl p-6 w-80 max-w-[90%] text-gray-900 shadow-xl">
                <h3 className="font-bold text-lg mb-3 text-center">{modal.title}</h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => chooseOption(modal.options[0])}
                    className={`px-4 py-2 rounded-md transition ${
                      modal.selected === modal.options[0] 
                        ? 'bg-green-600 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {modal.options[0]}
                    {modal.selected === modal.options[0] && ' ✓'}
                  </button>
                  <button 
                    onClick={() => chooseOption(modal.options[1])}
                    className={`px-4 py-2 rounded-md transition ${
                      modal.selected === modal.options[1] 
                        ? 'bg-green-600 text-white' 
                        : 'bg-slate-700 text-white hover:bg-slate-800'
                    }`}
                  >
                    {modal.options[1]}
                    {modal.selected === modal.options[1] && ' ✓'}
                  </button>
                </div>
              </div>
            </div>
          )}

          
          {/* Game Complete - First Playthrough */}
          {distance >= trackLength && gameState.firstPlay && !showModal && (
            <div className="absolute inset-0 grid place-items-center bg-black/70 text-white p-4 z-50">
              <div className="text-center max-w-md">
                <p className="text-2xl font-bold mb-4">Congratulations! 🎉</p>
                <p className="text-xl mb-6">You've cleared the track!</p>
                <p className="text-lg mb-8">Here's what others chose...</p>
                
                <div className="bg-gray-800 p-4 rounded-lg mb-8 text-left">
                  <div className="text-yellow-400 mb-2">Alex's choices:</div>
                  <ul className="text-sm text-gray-300 space-y-1 mb-4">
                    <li>• Traffic Light: Stop</li>
                    <li>• Pedestrian Crossing: Yield</li>
                    <li>• Speed Limit: Slow Down</li>
                    <li>• End of Road: Take Shortcut</li>
                  </ul>
                  
                  <div className="text-center my-4 p-4 bg-black/30 rounded">
                    <div className="text-gray-400 text-sm">[Video placeholder showing Alex's gameplay]</div>
                  </div>
                </div>
                
                <p className="text-lg mb-6">Would you like to try again with this new knowledge?</p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleTryAgain(true)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                  >
                    Yes, Let's Play Again
                  </button>
                  <button
                    onClick={() => handleTryAgain(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    No, Show My Results
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Game Complete - Second Playthrough or Declined to Play Again */}
          {gameState.showResults && (
            <div className="absolute inset-0 grid place-items-center bg-black/70 text-white p-4 z-50">
              <div className="text-center max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Thanks for Playing! 🏁</h2>
                <h3 className="text-xl font-semibold mb-4">Your Choices:</h3>
                
                <div className="bg-gray-800 p-6 rounded-lg mb-8 text-left">
                  {userChoices.length > 0 ? (
                    <ul className="space-y-3">
                      {userChoices.map((choice, index) => (
                        <li key={index} className="border-b border-gray-700 pb-2">
                          <div className="font-medium">{choice.checkpoint}:</div>
                          <div className="text-green-400">{choice.choice}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No choices were recorded.</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link
                    to="/"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors text-center"
                  >
                    Return to Main Menu
                  </Link>
                  
                  <button
                    onClick={() => {
                      // Reset everything for a fresh start
                      setObstacleIndex(0);
                      setDistance(0);
                      distanceRef.current = 0;
                      setUserChoices([]);
                      setGameState({
                        firstPlay: true,
                        showOthersChoices: false,
                        showTryAgain: false,
                        showResults: false,
                        playCount: 0,
                        choices: []
                      });
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Play Again from Start
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
