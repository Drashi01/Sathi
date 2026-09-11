import React from 'react';
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward } from 'lucide-react';

export default function ControlBar({
  currentStep,
  totalSteps,
  isPlaying,
  togglePlay,
  setStep,
  speed,
  setSpeed,
  resetSim
}) {
  return (
    <div className="bg-[#0D1322] border-t border-slate-800 px-6 py-3 sticky bottom-0 z-40 shadow-2xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetSim}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setStep(Math.max(0, currentStep - 1))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>

          <button
            onClick={() => setStep(Math.min(totalSteps - 1, currentStep + 1))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 max-w-xl flex items-center gap-3">
          <span className="text-xs text-slate-400 w-12 text-right">
            t={currentStep}m
          </span>

          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => setStep(Number(e.target.value))}
            className="flex-1 accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <span className="text-xs text-slate-400 w-12">
            {totalSteps}m
          </span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-xl border border-slate-800 text-xs">
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
