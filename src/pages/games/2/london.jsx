import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CircleDot, Square, Triangle, Star, Award, RefreshCw, Play, ArrowRight, CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// --- CONFIGURATION & CONSTANTS ---

const PROBLEMS = {
  '14-15': [ // 20 problems with 3-5 optimal moves
    { disks: 3, initialState: [[3, 2, 1], [], []], goalState: [[3], [2], [1]], minMoves: 3, pegCapacities: [3, 3, 3] },
    { disks: 3, initialState: [[3, 2], [1], []], goalState: [[], [3, 2], [1]], minMoves: 3, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 3], [2], [1]], goalState: [[4], [3, 2], [1]], minMoves: 3, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3, 2, 1], [], []], goalState: [[], [3, 1], [2]], minMoves: 4, pegCapacities: [3, 3, 3] },
    { disks: 3, initialState: [[3, 1], [2], []], goalState: [[3, 2], [], [1]], minMoves: 4, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 3, 2], [1], []], goalState: [[4, 3], [1], [2]], minMoves: 4, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[2, 1], [3], []], goalState: [[], [3, 2, 1], []], minMoves: 4, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 1], [3], [2]], goalState: [[4], [3, 2, 1], []], minMoves: 5, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3, 2], [], [1]], goalState: [[1], [3], [2]], minMoves: 5, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 3, 2], [1], []], goalState: [[4, 3], [2, 1], []], minMoves: 5, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3], [2], [1]], goalState: [[], [3, 2, 1], []], minMoves: 5, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 2, 1], [3], []], goalState: [[4], [3, 2, 1], []], minMoves: 5, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3, 2, 1], [], []], goalState: [[2, 1], [3], []], minMoves: 3, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4,3,2,1], [], []], goalState: [[4,3,1], [2], []], minMoves: 3, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3,2], [1], []], goalState: [[3],[2],[1]], minMoves: 4, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4,3,2], [1], []], goalState: [[4,2,1],[3],[]], minMoves: 5, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3,2,1], [], []], goalState: [[3,2],[1],[]], minMoves: 3, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4,3], [2,1], []], goalState: [[4,3,2],[],[1]], minMoves: 4, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3,2,1], [], []], goalState: [[],[3,2],[1]], minMoves: 5, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4,3,2,1], [], []], goalState: [[4],[3,2,1],[]], minMoves: 5, pegCapacities: [4, 4, 4] },
  ],
  '16-18': [ // 20 problems with 4-7 optimal moves
    { disks: 3, initialState: [[3, 2, 1], [], []], goalState: [[], [3, 1], [2]], minMoves: 4, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 3, 2], [1], []], goalState: [[4, 3], [1], [2]], minMoves: 4, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3, 1], [2], []], goalState: [[], [3, 2, 1], []], minMoves: 5, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 1], [3], [2]], goalState: [[4], [3, 2, 1], []], minMoves: 5, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3, 2], [], [1]], goalState: [[1], [3], [2]], minMoves: 5, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 3], [2, 1], []], goalState: [[], [], [4, 3, 2, 1]], minMoves: 6, pegCapacities: [4, 4, 4] },
    { disks: 5, initialState: [[5, 4, 3, 2], [1], []], goalState: [[5, 4, 3], [2, 1], []], minMoves: 6, pegCapacities: [5, 5, 5] },
    { disks: 3, initialState: [[3, 2, 1], [], []], goalState: [[], [], [3, 2, 1]], minMoves: 7, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 3, 2, 1], [], []], goalState: [[], [4, 3, 2, 1], []], minMoves: 7, pegCapacities: [4, 4, 4] },
    { disks: 5, initialState: [[5, 4, 3, 2, 1], [], []], goalState: [[5, 4, 3, 2], [], [1]], minMoves: 4, pegCapacities: [5, 5, 5] },
    { disks: 4, initialState: [[4, 3], [2], [1]], goalState: [[4], [], [3, 2, 1]], minMoves: 6, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[3], [2, 1], []], goalState: [[], [], [3, 2, 1]], minMoves: 6, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 3, 2, 1], [], []], goalState: [[4, 3], [2, 1], []], minMoves: 4, pegCapacities: [4, 4, 4] },
    { disks: 5, initialState: [[5, 4, 3], [2], [1]], goalState: [[5, 4], [3, 2], [1]], minMoves: 5, pegCapacities: [5, 5, 5] },
    { disks: 3, initialState: [[3, 2, 1], [], []], goalState: [[1], [3, 2], []], minMoves: 6, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 3, 2], [], [1]], goalState: [[4, 3, 2, 1], [], []], minMoves: 7, pegCapacities: [4, 4, 4] },
    { disks: 5, initialState: [[5, 4, 3, 2], [], [1]], goalState: [[5, 4, 3, 2, 1], [], []], minMoves: 4, pegCapacities: [5, 5, 5] },
    { disks: 4, initialState: [[4, 3], [2], [1]], goalState: [[], [4, 3, 2, 1], []], minMoves: 7, pegCapacities: [4, 4, 4] },
    { disks: 3, initialState: [[], [3, 2, 1], []], goalState: [[3, 2, 1], [], []], minMoves: 7, pegCapacities: [3, 3, 3] },
    { disks: 4, initialState: [[4, 2, 1], [3], []], goalState: [[], [4, 3, 2, 1], []], minMoves: 6, pegCapacities: [4, 4, 4] },
  ],
};

const DISK_COLORS = ['bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400'];

const SCORE_INTERPRETATION = {
    5: "Excellent planning", 4: "Good planning", 3: "Average planning", 2: "Poor planning", 1: "Very poor planning"
};

const ItemTypes = { DISK: 'disk' };

// --- HELPER & UI COMPONENTS ---

function FloatingIcon({ Icon, size, top, left, delay }) {
  return <Icon size={size} className="absolute text-[#5549c8] animate-float opacity-30" style={{ top, left, animationDelay: `${delay}s` }} fill="#5549c8" strokeWidth={0} />;
}

const DraggableDisk = ({ diskSize, sourcePegIndex, isDraggable }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.DISK,
    item: { diskSize, sourcePegIndex },
    canDrag: isDraggable,
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [diskSize, sourcePegIndex, isDraggable]);

  const widthPercentage = 40 + (diskSize) * 10;
  const color = DISK_COLORS[diskSize % DISK_COLORS.length];
  
  return (
    <div
      ref={drag}
      className={`h-6 md:h-8 rounded-full shadow-md flex items-center justify-center font-bold text-white text-sm transition-all duration-300 ${color} ${isDraggable ? 'cursor-grab' : 'cursor-default'}`}
      style={{ width: `${widthPercentage}%`, opacity: isDragging ? 0.5 : 1 }}
    >
      {diskSize}
    </div>
  );
};

const Peg = ({ pegIndex, disks, capacity, moveDisk, isGoalPeg = false, currentProblem }) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.DISK,
    canDrop: (item) => {
        if (isGoalPeg) return false;
        const destPeg = disks;
        if (destPeg.length >= capacity) return false;
        const topDiskOnDest = destPeg.length > 0 ? destPeg[destPeg.length - 1] : null;
        if (topDiskOnDest !== null && item.diskSize > topDiskOnDest) return false;
        return true;
    },
    drop: (item) => {
        if (item.sourcePegIndex !== pegIndex) {
            moveDisk(item.sourcePegIndex, pegIndex);
        }
    },
    collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
    }),
  }), [pegIndex, disks, capacity, moveDisk, isGoalPeg]);

  const height = (capacity * 2.5) || 7.5; // in rem
  let bgClass = 'bg-black/20';
  if (canDrop && isOver) bgClass = 'bg-green-500/50 scale-105';
  else if (isOver && !canDrop) bgClass = 'bg-red-500/50 scale-105';
  else if (!isGoalPeg) bgClass = 'bg-black/20 hover:bg-white/20';

  return (
    <div ref={drop} className={`relative flex flex-col-reverse items-center justify-start rounded-md p-2 transition-all duration-300 ${bgClass}`} style={{ minHeight: `${height}rem`, width: '150px' }}>
      <div className="absolute bottom-0 w-full h-2 bg-gray-700/50 rounded-b-md"></div>
      <div className="absolute bottom-2 w-2 bg-gray-700/50 rounded-t-md" style={{ height: `${height - 0.5}rem`}}></div>
      <div className="relative z-10 w-full h-full flex flex-col-reverse items-center gap-1.5 pb-2">
        {disks.map((diskNumber, index) => <DraggableDisk key={diskNumber} diskSize={diskNumber} sourcePegIndex={pegIndex} isDraggable={!isGoalPeg && index === disks.length - 1} />)}
      </div>
    </div>
  );
};

function LondonGame() {
  const [game, setGame] = useState({
    status: 'selection', ageGroup: null, problemIndex: 0, pegs: [[], [], []],
    moves: 0, feedback: { message: '', type: '' },
    totalMoves: 0, totalOptimalMoves: 0, planningStartTime: 0, totalPlanningTime: 0,
  });

  const currentProblemSet = useMemo(() => game.ageGroup ? PROBLEMS[game.ageGroup] : [], [game.ageGroup]);
  const currentProblem = useMemo(() => currentProblemSet[game.problemIndex] || null, [currentProblemSet, game.problemIndex]);

  const showFeedback = useCallback((message, type) => {
    setGame(g => ({ ...g, feedback: { message, type } }));
    setTimeout(() => setGame(g => ({...g, feedback: { message: '', type: '' } })), 2000);
  }, []);
  
  const setupProblem = useCallback((ageGroup, problemIndex) => {
    const problemData = PROBLEMS[ageGroup][problemIndex];
    setGame(g => ({
      ...g, status: 'playing', ageGroup, problemIndex,
      pegs: JSON.parse(JSON.stringify(problemData.initialState)),
      moves: 0, planningStartTime: Date.now(),
    }));
  }, []);

  const moveDisk = useCallback((sourcePegIndex, destPegIndex) => {
    if (game.moves === 0 && game.planningStartTime > 0) {
      const planningTime = (Date.now() - game.planningStartTime) / 1000;
      setGame(g => ({...g, totalPlanningTime: g.totalPlanningTime + planningTime, planningStartTime: 0}));
    }

    setGame(g => {
        const newPegs = g.pegs.map(p => [...p]);
        const diskToMove = newPegs[sourcePegIndex].pop();
        newPegs[destPegIndex].push(diskToMove);
        return { ...g, pegs: newPegs, moves: g.moves + 1 };
    });
  }, [game.moves, game.planningStartTime]);

  useEffect(() => {
    if (game.status !== 'playing' || !currentProblem) return;
    const isWin = JSON.stringify(game.pegs) === JSON.stringify(currentProblem.goalState);
    if (isWin) {
      const problemData = currentProblemSet[game.problemIndex];
      const isLastProblem = game.problemIndex === currentProblemSet.length - 1;
      setGame(g => ({
          ...g, status: isLastProblem ? 'finished' : 'won_problem',
          totalMoves: g.totalMoves + g.moves,
          totalOptimalMoves: g.totalOptimalMoves + problemData.minMoves,
      }));
    }
  }, [game.pegs, game.status, currentProblem, game.problemIndex, game.moves, currentProblemSet]);

  const resetGame = useCallback(() => {
    setGame({
        status: 'selection', ageGroup: null, problemIndex: 0, pegs: [[], [], []],
        moves: 0, feedback: { message: '', type: '' },
        totalMoves: 0, totalOptimalMoves: 0, planningStartTime: 0, totalPlanningTime: 0
    });
  }, []);

  const nextProblem = useCallback(() => setupProblem(game.ageGroup, game.problemIndex + 1), [game.ageGroup, game.problemIndex, setupProblem]);

  // --- RENDERABLE SCREENS ---
  const renderScreen = () => {
    switch (game.status) {
      case 'selection': return (
        <div className="screen-container">
          <BrainCircuit size={64} className="text-cyan-300" />
          <h1 className="title">Tower of London</h1>
          <p className="subtitle">Please select your age group to begin.</p>
          <div className="flex flex-col gap-4 mt-6">
            <button className="btn-primary" onClick={() => setGame(g => ({...g, status: 'instructions', ageGroup: '14-15'}))}>Ages 14-15</button>
            <button className="btn-primary" onClick={() => setGame(g => ({...g, status: 'instructions', ageGroup: '16-18'}))}>Ages 16-18</button>
          </div>
        </div>
      );
      case 'instructions': return (
        <div className="screen-container">
            <h1 className="title">Instructions</h1>
            <p className="subtitle text-left max-w-lg">
                Your goal is to move the stack of disks to match the target configuration shown at the top of the screen.<br/><br/>
                - You can only move one disk at a time by dragging the top disk.<br/>
                - A larger disk cannot be placed on top of a smaller disk.<br/><br/>
                Try to solve each puzzle in the fewest moves possible. Your planning time before your first move is also measured.
            </p>
            <button onClick={() => setupProblem(game.ageGroup, 0)} className="btn-primary mt-8 animate-pulse"><Play className="mr-2" /> Start First Puzzle</button>
        </div>
      );
      case 'playing': return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-8 shadow-2xl text-white w-full max-w-6xl mx-auto flex flex-col items-center gap-6">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-wider">Problem {game.problemIndex + 1} of {currentProblemSet.length}</h1>
            <div className="font-semibold text-lg">Moves: <span className="text-2xl text-cyan-300">{game.moves}</span></div>
          </div>
          <div className="w-full flex flex-col items-center p-4 bg-black/20 rounded-xl">
            <h2 className="text-xl font-semibold mb-3">Goal Configuration</h2>
            <div className="flex justify-center items-end gap-4">
              {currentProblem.goalState.map((disks, i) => <Peg key={`goal-${i}`} pegIndex={i} disks={disks} capacity={currentProblem.pegCapacities[i]} isGoalPeg={true} />)}
            </div>
          </div>
          {game.feedback.message && (
            <div className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 ${game.feedback.type === 'error' ? 'bg-red-500/80' : 'bg-green-500/80'}`}>
              {game.feedback.type === 'error' ? <XCircle /> : <CheckCircle />}
              <span className="font-semibold">{game.feedback.message}</span>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-around items-end w-full gap-4 md:gap-8 pt-6">
            {game.pegs.map((disks, i) => <Peg key={`play-${i}`} pegIndex={i} disks={disks} capacity={currentProblem.pegCapacities[i]} moveDisk={moveDisk} />)}
          </div>
        </div>
      );
      case 'won_problem': return (
        <div className="screen-container">
            <CheckCircle size={80} className="text-green-400 drop-shadow-lg" />
            <h1 className="title">Problem Complete!</h1>
            <p className="subtitle">You solved it in {game.moves} moves.</p>
            <button onClick={nextProblem} className="btn-primary mt-6">Next Problem <ArrowRight/></button>
        </div>
      );
      case 'finished': 
        const { score, interpretation, extraMovesPercent } = (() => {
            const extraMoves = game.totalMoves - game.totalOptimalMoves;
            const percentage = game.totalOptimalMoves > 0 ? (extraMoves / game.totalOptimalMoves) * 100 : 0;
            let finalScore = 1;
            if (game.ageGroup === '14-15') {
                if (percentage <= 15) finalScore = 5; else if (percentage <= 30) finalScore = 4;
                else if (percentage <= 50) finalScore = 3; else if (percentage <= 75) finalScore = 2;
            } else {
                if (percentage <= 10) finalScore = 5; else if (percentage <= 25) finalScore = 4;
                else if (percentage <= 40) finalScore = 3; else if (percentage <= 60) finalScore = 2;
            }
            return { score: finalScore, interpretation: SCORE_INTERPRETATION[finalScore], extraMovesPercent: percentage };
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
                    <p>Total Moves Made: <span className="font-bold">{game.totalMoves}</span></p>
                    <p>Total Optimal Moves: <span className="font-bold">{game.totalOptimalMoves}</span></p>
                    <p>Efficiency (Extra Moves): <span className="font-bold">{extraMovesPercent.toFixed(1)}%</span></p>
                    <p>Avg. Planning Time: <span className="font-bold">{(game.totalPlanningTime / currentProblemSet.length).toFixed(2)}s</span></p>
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

// The main export should be the wrapper that provides the D&D context.
export default function LondonGameWrapper() {
  return (
    <DndProvider backend={HTML5Backend}>
      <LondonGame />
    </DndProvider>
  );
}

