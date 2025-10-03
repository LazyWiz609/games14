import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { LogOut, CircleDot, Square, Triangle, Star } from "lucide-react";
import race from '../../assets/race.png';
import social from '../../assets/social_decision.png';

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

export default function Game4() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { emoji, bg } = useMemo(() => {
    const seed = user?.id ?? Math.random();
    return {
      emoji: pickFromArray(EMOJIS, seed),
      bg: pickFromArray(COLORS, seed + "bg"),
    };
  }, [user]);

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
        <Link to={'/games'}
          className="flex items-center gap-2 px-6 py-4 bg-green-500 text-xl text-white rounded-md font-semibold hover:bg-green-600 transition">
          Back to Home
        </Link>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition">
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <main className="flex-1 grid place-items-center text-center p-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg text-white w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 items-stretch">
            <div className="p-4 h-full">
              <div className="h-full min-h-[28rem] rounded-2xl shadow-xl bg-white/10 p-6 flex flex-col items-center hover:scale-105 hover:bg-white/15 transition-all duration-300 border border-white/10 backdrop-blur-md">
                <div className="w-64 h-64 rounded-xl shadow-md flex items-center justify-center">
                  <img src={race} alt="Card Image" className="w-full h-full object-cover rounded-lg" />
                </div>
                <p className="text-white font-bold text-2xl mt-[16px]">Executive Function Self-Report Scale</p>
                <div className="mt-auto pt-6">
                  <Link to="/games/4/executive" className="w-16 h-16 rounded-full border-4 text-white hover:text-[#474747] border-white flex items-center justify-center shadow-md hover:bg-white hover:scale-105 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 transition-colors duration-300">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-4 h-full">
              <div className="h-full min-h-[28rem] rounded-2xl shadow-xl bg-white/10 p-6 flex flex-col items-center hover:scale-105 hover:bg-white/15 transition-all duration-300 border border-white/10 backdrop-blur-md">
                <div className="w-64 h-64 rounded-xl shadow-md flex items-center justify-center">
                  <img src={social} alt="Card Image" className="w-full h-full object-cover rounded-lg" />
                </div>
                <p className="text-white font-bold text-2xl mt-[16px]">Brief Executive Diary</p>
                <div className="mt-auto pt-6">
                  <Link to="/games/4/diary" className="w-16 h-16 rounded-full border-4 text-white hover:text-[#474747] border-white flex items-center justify-center shadow-md hover:bg-white hover:scale-105 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 transition-colors duration-300">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}