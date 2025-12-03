import React from 'react';
import { GameStatus } from '../types';
import { Play, RotateCcw, Pause } from 'lucide-react';

interface OverlayProps {
  status: GameStatus;
  score: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  status,
  score,
  onStart,
  onResume,
  onRestart,
}) => {
  if (status === GameStatus.PLAYING) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10 transition-all duration-300">
      <div className="text-center p-8 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {status === GameStatus.IDLE && (
          <>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 tracking-tight">
              NEON SNAKE
            </h1>
            <p className="text-slate-400 mb-8 font-medium">Use Arrow Keys or WASD to move</p>
            <button
              onClick={onStart}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 font-bold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Play className="w-5 h-5 fill-current" />
              START GAME
            </button>
          </>
        )}

        {status === GameStatus.PAUSED && (
          <>
            <h2 className="text-4xl font-bold text-white mb-6">PAUSED</h2>
            <button
              onClick={onResume}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 font-bold text-slate-900 transition-all duration-200 bg-white rounded-full hover:bg-slate-200 hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              RESUME
            </button>
          </>
        )}

        {status === GameStatus.GAME_OVER && (
          <>
            <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
            <p className="text-xl text-slate-300 mb-6">
              Final Score: <span className="text-emerald-400 font-mono font-bold">{score}</span>
            </p>
            <button
              onClick={onRestart}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 font-bold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            >
              <RotateCcw className="w-5 h-5" />
              TRY AGAIN
            </button>
          </>
        )}
      </div>
    </div>
  );
};
