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
  const TRAFFIC_LIGHT_DISTANCE = 800 + 5 * STEP_UNITS; // 5 steps later
  // Push speed limit much later (~50 steps beyond 5000 => ~10000)
  const SPEED_LIMIT_DELAY_STEPS = 50; 
  const SPEED_LIMIT_DISTANCE = 5000 + SPEED_LIMIT_DELAY_STEPS * STEP_UNITS; // ~8200
  // Pedestrian appears 15 steps before speed limit, but never earlier than traffic light + 200
  const PEDESTRIAN_DISTANCE = Math.max(TRAFFIC_LIGHT_DISTANCE + 200, SPEED_LIMIT_DISTANCE - 15 * STEP_UNITS);
  const END_OFFSET_STEPS = 30; // end decision appears 30 steps after speed limit
  const END_DECISION_DISTANCE = SPEED_LIMIT_DISTANCE + END_OFFSET_STEPS * STEP_UNITS;
  const trackLength = END_DECISION_DISTANCE + 200; // allow a bit of driving after decision to reach true end
  const speedPerSecond = 320; // units per second while driving
  const [distance, setDistance] = useState(0); // 0..trackLength
  const [driveHeld, setDriveHeld] = useState(false); // true while Space/ArrowUp is held
  const isMoving = driveHeld && distance < trackLength; // derived
  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState({ title: '', options: ["Option A", "Option B"] });
  const [obstacleIndex, setObstacleIndex] = useState(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef(0);

  // Define obstacle checkpoints along the road (absolute distances)
  const checkpoints = useMemo(() => (
    [
      { title: 'Traffic Light', options: ["Stop", "Go"], distance: TRAFFIC_LIGHT_DISTANCE },
      { title: 'Pedestrian Crossing', options: ["Yield", "Proceed"], distance: PEDESTRIAN_DISTANCE },
      { title: 'Speed Limit Ahead', options: ["Slow Down", "Maintain Speed"], distance: SPEED_LIMIT_DISTANCE },
      // Final decision appears 20 steps after speed limit; player then drives to the very end
      { title: 'End of Road', options: ["Take Shortcut", "Go Straight"], distance: END_DECISION_DISTANCE },
    ]
  ), [TRAFFIC_LIGHT_DISTANCE, PEDESTRIAN_DISTANCE, SPEED_LIMIT_DISTANCE, END_DECISION_DISTANCE]);
  const obstacleTitles = [
    'Traffic Light',
    'Speed Limit Ahead',
    'Pedestrian Crossing',
    'End of Road',
  ];
  const obstacleOptions = checkpoints.map(c => c.options);

  // Movement loop (forward only while key held)
  useEffect(() => {
    function tick(ts) {
      if (!driveHeld || showModal || distance >= trackLength) return;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      setDistance(prev => Math.min(trackLength, prev + speedPerSecond * dt));
      rafRef.current = requestAnimationFrame(tick);
    }
    if (driveHeld && !showModal && distance < trackLength) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [driveHeld, showModal, distance, trackLength]);

  // Trigger modals at checkpoints in order
  useEffect(() => {
    if (obstacleIndex >= checkpoints.length) return;
    const nextCp = checkpoints[obstacleIndex];
    if (distance >= nextCp.distance && !showModal) {
      setShowModal(true);
      setModal({ title: nextCp.title, options: nextCp.options });
    }
  }, [distance, obstacleIndex, checkpoints, showModal]);

  const chooseOption = useCallback(() => {
    setShowModal(false);
    setObstacleIndex(i => Math.min(i + 1, checkpoints.length));
    lastTsRef.current = 0;
    // resume only when user holds the key again
  }, [checkpoints.length]);

  // Keyboard control: hold Space or ArrowUp to drive
  useEffect(() => {
    const onDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!showModal && distance < trackLength) setDriveHeld(true);
      }
    };
    const onUp = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        setDriveHeld(false);
        lastTsRef.current = 0;
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [showModal, distance, trackLength]);
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
              backgroundPosition: `center ${Math.round((1 - (distance / trackLength)) * 100)}%`,
              transition: 'background-position 80ms linear',
              filter: 'saturate(1.05) contrast(1.05)'
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
                  <button onClick={chooseOption} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">{modal.options[0]}</button>
                  <button onClick={chooseOption} className="px-4 py-2 rounded-md bg-slate-700 text-white hover:bg-slate-800 transition">{modal.options[1]}</button>
                </div>
              </div>
            </div>
          )}

          {/* Finished overlay */}
          {distance >= trackLength && !showModal && (
            <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
              <div className="text-center">
                <p className="text-xl font-semibold">Drive complete</p>
                <p className="text-white/80 mt-1">Thanks for playing</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}