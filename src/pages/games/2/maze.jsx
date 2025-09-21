import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CircleDot, Square, Triangle, Star, Award, RefreshCw, Play, ArrowRight, CheckCircle, BrainCircuit, Flag, Footprints } from 'lucide-react';

// --- CONFIGURATION & CONSTANTS ---

const MAZE_CONFIG = {
  '14-15': { // 10 mazes, moderate complexity
    count: 10,
    width: 13,
    height: 11,
  },
  '16-18': { // 10 mazes, higher complexity
    count: 10,
    width: 19,
    height: 15,
  }
};

const SCORE_INTERPRETATION = {
    5: "Excellent Navigation", 4: "Good Navigation", 3: "Average Navigation",
    2: "Poor Navigation", 1: "Very Poor Navigation"
};

// --- MAZE ALGORITHMS ---

// 1. Maze Generator (Recursive Backtracking)
const generateMaze = (width, height) => {
  const grid = Array(height).fill(null).map(() => Array(width).fill(null).map(() => ({
    n: true, s: true, e: true, w: true, visited: false
  })));

  const carvePassages = (cx, cy) => {
    grid[cy][cx].visited = true;
    const directions = [{x:0, y:-1, d:'n', o:'s'}, {x:0, y:1, d:'s', o:'n'}, {x:1, y:0, d:'e', o:'w'}, {x:-1, y:0, d:'w', o:'e'}];
    directions.sort(() => Math.random() - 0.5);

    for (const { x, y, d, o } of directions) {
      const nx = cx + x;
      const ny = cy + y;
      if (ny >= 0 && ny < height && nx >= 0 && nx < width && !grid[ny][nx].visited) {
        grid[cy][cx][d] = false;
        grid[ny][nx][o] = false;
        carvePassages(nx, ny);
      }
    }
  };

  carvePassages(0, 0);
  return grid;
};

// 2. Maze Solver (Breadth-First Search to find shortest path)
const solveMazeBFS = (grid, start, end) => {
  const queue = [[start]];
  const visited = new Set([`${start.y},${start.x}`]);
  const height = grid.length;
  const width = grid[0].length;

  while (queue.length > 0) {
    const path = queue.shift();
    const { x, y } = path[path.length - 1];

    if (x === end.x && y === end.y) return path;

    const neighbors = [];
    if (!grid[y][x].n && y > 0) neighbors.push({ x, y: y - 1 });
    if (!grid[y][x].s && y < height - 1) neighbors.push({ x, y: y + 1 });
    if (!grid[y][x].w && x > 0) neighbors.push({ x: x - 1, y });
    if (!grid[y][x].e && x < width - 1) neighbors.push({ x: x + 1, y });

    for (const neighbor of neighbors) {
      const key = `${neighbor.y},${neighbor.x}`;
      if (!visited.has(key)) {
        visited.add(key);
        const newPath = [...path, neighbor];
        queue.push(newPath);
      }
    }
  }
  return []; // Should not happen in a valid maze
};


// --- HELPER & UI COMPONENTS ---

function FloatingIcon({ Icon, size, top, left, delay }) {
  return <Icon size={size} className="absolute text-[#5549c8] animate-float opacity-30" style={{ top, left, animationDelay: `${delay}s` }} fill="#5549c8" strokeWidth={0} />;
}

const MazeCell = ({ data, isPlayer, isStart, isEnd }) => {
  const classes = ['relative w-6 h-6 md:w-8 md:h-8 transition-colors duration-200'];
  if (data.n) classes.push('border-t-2');
  if (data.s) classes.push('border-b-2');
  if (data.e) classes.push('border-r-2');
  if (data.w) classes.push('border-l-2');
  
  const borderColor = isPlayer ? 'border-cyan-300' : 'border-white/40';
  classes.push(borderColor);

  return (
    <div className={classes.join(' ')}>
      {isPlayer && <div className="absolute inset-0 flex items-center justify-center"><Footprints size={20} className="text-yellow-300 animate-pulse" /></div>}
      {isStart && <div className="absolute inset-0 flex items-center justify-center"><Play size={16} className="text-green-400" /></div>}
      {isEnd && <div className="absolute inset-0 flex items-center justify-center"><Flag size={16} className="text-red-400" /></div>}
    </div>
  );
};

const MazeGrid = ({ grid, playerPosition, startPos, endPos }) => (
  <div className="bg-black/20 p-2 md:p-4 rounded-lg shadow-inner">
    {grid.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <MazeCell
            key={`${y}-${x}`}
            data={cell}
            isPlayer={playerPosition.x === x && playerPosition.y === y}
            isStart={startPos.x === x && startPos.y === y}
            isEnd={endPos.x === x && endPos.y === y}
          />
        ))}
      </div>
    ))}
  </div>
);


// --- MAIN GAME COMPONENT ---

export default function MazeGame() {
  const [game, setGame] = useState({
    status: 'selection', // 'selection', 'instructions', 'playing', 'won_maze', 'finished'
    ageGroup: null,
    mazeIndex: 0,
    mazes: [], // Will store { grid, start, end, optimalPath }
    // Gameplay state
    playerPosition: { x: 0, y: 0 },
    userPathLength: 0,
    // Scoring
    totalUserMoves: 0,
    totalOptimalMoves: 0,
  });

  const currentMazeData = useMemo(() => game.mazes[game.mazeIndex] || null, [game.mazes, game.mazeIndex]);

  const setupMazes = useCallback((ageGroup) => {
    const config = MAZE_CONFIG[ageGroup];
    const generatedMazes = [];
    for (let i = 0; i < config.count; i++) {
      const grid = generateMaze(config.width, config.height);
      const start = { x: 0, y: 0 };
      const end = { x: config.width - 1, y: config.height - 1 };
      const optimalPath = solveMazeBFS(grid, start, end);
      generatedMazes.push({ grid, start, end, optimalPathLength: optimalPath.length - 1 });
    }
    setGame(g => ({ ...g, status: 'instructions', ageGroup, mazes: generatedMazes }));
  }, []);

  const startMaze = useCallback((mazeIndex) => {
    const mazeData = game.mazes[mazeIndex];
    setGame(g => ({
      ...g,
      status: 'playing',
      mazeIndex,
      playerPosition: { ...mazeData.start },
      userPathLength: 0,
    }));
  }, [game.mazes]);

  const handleWin = useCallback(() => {
    const isLastMaze = game.mazeIndex === game.mazes.length - 1;
    setGame(g => ({
        ...g,
        status: isLastMaze ? 'finished' : 'won_maze',
        totalUserMoves: g.totalUserMoves + g.userPathLength,
        totalOptimalMoves: g.totalOptimalMoves + (currentMazeData?.optimalPathLength || 0),
    }));
  }, [game.mazeIndex, game.mazes.length, game.totalUserMoves, game.userPathLength, game.totalOptimalMoves, currentMazeData]);

  useEffect(() => {
    if (game.status !== 'playing' || !currentMazeData) return;
    const { x, y } = game.playerPosition;
    const { end } = currentMazeData;
    if (x === end.x && y === end.y) {
      handleWin();
    }
  }, [game.playerPosition, game.status, currentMazeData, handleWin]);

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (game.status !== 'playing' || !currentMazeData) return;

        const { x, y } = game.playerPosition;
        const currentCell = currentMazeData.grid[y][x];
        let newPos = { x, y };

        if (e.key === 'ArrowUp' && !currentCell.n) newPos.y--;
        else if (e.key === 'ArrowDown' && !currentCell.s) newPos.y++;
        else if (e.key === 'ArrowLeft' && !currentCell.w) newPos.x--;
        else if (e.key === 'ArrowRight' && !currentCell.e) newPos.x++;
        else return;
        
        e.preventDefault();
        setGame(g => ({...g, playerPosition: newPos, userPathLength: g.userPathLength + 1}));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.status, game.playerPosition, currentMazeData]);

  const resetGame = useCallback(() => {
    setGame({
      status: 'selection', ageGroup: null, mazeIndex: 0, mazes: [],
      playerPosition: { x: 0, y: 0 }, userPathLength: 0,
      totalUserMoves: 0, totalOptimalMoves: 0,
    });
  }, []);

  const nextMaze = useCallback(() => startMaze(game.mazeIndex + 1), [game.mazeIndex, startMaze]);

  // --- RENDERABLE SCREENS ---
  const renderScreen = () => {
    switch (game.status) {
      case 'selection': return (
        <div className="screen-container">
          <BrainCircuit size={64} className="text-cyan-300" />
          <h1 className="title">Maze Navigation</h1>
          <p className="subtitle">Please select your age group to begin.</p>
          <div className="flex flex-col gap-4 mt-6">
            <button className="btn-primary" onClick={() => setupMazes('14-15')}>Ages 14-15</button>
            <button className="btn-primary" onClick={() => setupMazes('16-18')}>Ages 16-18</button>
          </div>
        </div>
      );
      case 'instructions': return (
        <div className="screen-container">
            <h1 className="title">Instructions</h1>
            <p className="subtitle text-left max-w-lg">
                Your goal is to navigate from the start (<Play size={16} className="inline-block text-green-400"/>) to the finish (<Flag size={16} className="inline-block text-red-400"/>) in each maze.
                <br/><br/>
                - Use your keyboard's <b>Arrow Keys</b> to move.
                <br/>
                - You can see the entire maze to plan your route.
                <br/><br/>
                Try to find the shortest path. Your efficiency will be scored.
            </p>
            <button onClick={() => startMaze(0)} className="btn-primary mt-8 animate-pulse"><Play className="mr-2" /> Start First Maze</button>
        </div>
      );
      case 'playing': return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-8 shadow-2xl text-white w-full max-w-fit mx-auto flex flex-col items-center gap-6">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-wider">Maze {game.mazeIndex + 1} of {game.mazes.length}</h1>
            <div className="font-semibold text-lg">Moves: <span className="text-2xl text-cyan-300">{game.userPathLength}</span></div>
          </div>
          {currentMazeData && <MazeGrid grid={currentMazeData.grid} playerPosition={game.playerPosition} startPos={currentMazeData.start} endPos={currentMazeData.end} />}
        </div>
      );
      case 'won_maze': return (
        <div className="screen-container">
            <CheckCircle size={80} className="text-green-400 drop-shadow-lg" />
            <h1 className="title">Maze Complete!</h1>
            <p className="subtitle">You solved it in {game.userPathLength} moves. Optimal was {currentMazeData?.optimalPathLength}.</p>
            <button onClick={nextMaze} className="btn-primary mt-6">Next Maze <ArrowRight/></button>
        </div>
      );
      case 'finished':
        const { score, interpretation, pathPercent } = (() => {
          const percentage = game.totalOptimalMoves > 0 ? (game.totalUserMoves / game.totalOptimalMoves) * 100 : 100;
          let finalScore = 1;
          if (game.ageGroup === '14-15') {
            if (percentage <= 120) finalScore = 5; else if (percentage <= 140) finalScore = 4;
            else if (percentage <= 170) finalScore = 3; else if (percentage <= 200) finalScore = 2;
          } else { // 16-18
            if (percentage <= 110) finalScore = 5; else if (percentage <= 125) finalScore = 4;
            else if (percentage <= 150) finalScore = 3; else if (percentage <= 180) finalScore = 2;
          }
          return { score: finalScore, interpretation: SCORE_INTERPRETATION[finalScore], pathPercent: percentage };
        })();
        return (
            <div className="screen-container">
                <Award size={80} className="text-yellow-300 drop-shadow-lg" />
                <h1 className="title">Activity Complete!</h1>
                <p className="subtitle">Here are your results.</p>
                <div className="mt-6 text-lg space-y-3 bg-black/20 p-6 rounded-lg text-left">
                    <p>Final Score: <span className="font-bold text-2xl text-green-300">{score} / 5</span></p>
                    <p>Interpretation: <span className="font-bold text-cyan-300">{interpretation}</span></p>
                    <hr className="border-white/20 my-3"/>
                    <p>Total Moves Taken: <span className="font-bold">{game.totalUserMoves}</span></p>
                    <p>Total Optimal Moves: <span className="font-bold">{game.totalOptimalMoves}</span></p>
                    <p>Path Efficiency: <span className="font-bold">{pathPercent.toFixed(1)}% of optimal</span></p>
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
        .screen-container { background-color: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 1rem; padding: 2rem; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); color: white; width: 100%; max-width: 48rem; margin: auto; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; }
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
