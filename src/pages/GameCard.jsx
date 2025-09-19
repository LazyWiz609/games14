import React from "react";
// If using React Router, uncomment this line:
// import { Link } from "react-router-dom";

// Fallback <a> if not using React Router
const Link = ({ to, children, ...props }) => (
  <a href={to} {...props}>
    {children}
  </a>
);

export default function GameCard({
  gameNumber,
  title,
  imageUrl,
  fromColor,
  toColor,
  link, // <-- new prop
}) {
  return (
    <div className="max-w-2xl w-full">
      <Link
        to={link} // <-- now customizable
        className="relative flex items-center justify-between rounded-3xl p-8 shadow-lg transition-transform transform hover:-translate-y-1 group"
        style={{
          backgroundImage: `linear-gradient(to right, ${fromColor}, ${toColor})`,
        }}
        aria-label={`Go to ${title}`}
      >
        {/* Left Aligned Content */}
        <div className="flex flex-col items-start text-left z-10">
          <div className="flex items-center gap-3">
            {/* Play Button */}
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent border-2 border-white text-white shadow-sm transition-all transform group-hover:bg-white group-hover:text-blue-500"
              aria-hidden
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </span>
            {/* Level text */}
            <p className="text-white/70 text-lg tracking-wider">
              Game {gameNumber}
            </p>
          </div>

          {/* Title */}
          <h3 className="mt-4 text-3xl font-bold text-white drop-shadow-md">
            {title}
          </h3>
        </div>

        {/* Right Image */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="pointer-events-none absolute top-5 -right-0 scale-120 drop-shadow-2xl"
          />
        </div>
      </Link>
    </div>
  );
}
