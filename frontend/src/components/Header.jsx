import React from 'react';
import { Shield, Play, Pause, Volume2, VolumeX, Sparkles, Camera } from 'lucide-react';
import { sounds } from '../audio/soundEffects';

export default function Header({
  strategy,
  setStrategy,
  isPlaying,
  togglePlay,
  resetSim,
  audioEnabled,
  setAudioEnabled,
  cinematicMode,
  setCinematicMode,
  activeTab,
  setActiveTab
}) {
  return (
    <header className="bg-[#0D1322] border-b border-slate-800 px-6 py-4 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent font-mono">
                SATHI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v3.0 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Intelligent Emergency Dispatcher • <span className="text-cyan-300 italic">“Always There When It Matters”</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-[#0B0F19] p-1 rounded-xl border border-slate-800 text-xs font-medium font-mono">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'manual' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Manual
          </button>
          <button
            onClick={() => setActiveTab('sim')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'sim' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Live Grid
          </button>
          <button
            onClick={() => setActiveTab('battle')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'battle' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Strategy Battle
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'whatif' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            What-If Lab
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Cinematic Mode Toggle */}
          <button
            onClick={() => setCinematicMode(!cinematicMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              cinematicMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-neon-cyan animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Cinematic Mode {cinematicMode ? 'ON' : 'OFF'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              sounds.enabled = next;
              if (next) sounds.playDispatchChime();
            }}
            className={`p-2 rounded-lg border text-slate-300 transition ${
              audioEnabled ? 'bg-cyan-950/40 border-cyan-700 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Audio Siren & SFX"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Start / Pause Button */}
          <button
            onClick={() => {
              if (isPlaying) {
                togglePlay();
              } else {
                togglePlay();
                if (audioEnabled) sounds.playSiren();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" /> Pause Simulation
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Start Simulation
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
