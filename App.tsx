import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Overlay } from './components/Overlay';
import { GameState, GameStatus } from './types';
import { INITIAL_SPEED } from './constants';
import { Trophy, Zap, Keyboard } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.IDLE,
    score: 0,
    highScore: 0,
    speed: INITIAL_SPEED,
  });

  // Load high score on mount
  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) {
      setGameState(prev => ({ ...prev, highScore: parseInt(saved, 10) }));
    }
  }, []);

  const handleStart = () => {
    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      speed: INITIAL_SPEED
    }));
  };

  const handlePause = useCallback(() => {
    setGameState(prev => {
      if (prev.status === GameStatus.PLAYING) return { ...prev, status: GameStatus.PAUSED };
      if (prev.status === GameStatus.PAUSED) return { ...prev, status: GameStatus.PLAYING };
      return prev;
    });
  }, []);

  const handleRestart = () => {
    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      speed: INITIAL_SPEED
    }));
  };

  // Global Key listeners for Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        handlePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePause]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100 selection:bg-emerald-500/30">
      
      {/* HUD / Header */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-[140px] shadow-lg">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap size={12} className="text-emerald-400" /> Score
                </div>
                <div className="text-3xl font-mono font-bold text-white">{gameState.score}</div>
            </div>
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-[140px] shadow-lg">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Trophy size={12} className="text-yellow-400" /> Best
                </div>
                <div className="text-3xl font-mono font-bold text-slate-300">{gameState.highScore}</div>
            </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm">
            <Keyboard size={16} />
            <span>Space to Pause</span>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative rounded-xl overflow-hidden ring-1 ring-slate-800 shadow-2xl">
        <Overlay
          status={gameState.status}
          score={gameState.score}
          onStart={handleStart}
          onResume={handlePause}
          onRestart={handleRestart}
        />
        <GameCanvas gameState={gameState} setGameState={setGameState} />
      </div>

      <div className="mt-8 text-slate-500 text-sm font-medium">
         Classic Snake Mechanics • Speed Increases Every 50 Points
      </div>
    </div>
  );
};

export default App;
