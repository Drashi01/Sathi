import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchBattleMode } from '../utils/api';
import LiveGrid from '../components/LiveGrid';
import ControlBar from '../components/ControlBar';

export default function BattlePage({ seed }) {
  const [battleData, setBattleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);

  useEffect(() => {
    setLoading(true);
    fetchBattleMode(seed)
      .then(data => {
        setBattleData(data);
        setCurrentStep(0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [seed]);

  useEffect(() => {
    let timer;
    if (isPlaying && battleData) {
      const maxS = Math.min(battleData.sathi.snapshots.length, battleData.greedy.snapshots.length);
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= maxS - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, battleData]);

  if (loading || !battleData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-mono text-center">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-cyan-400 text-sm font-bold">Initializing Strategy Battle Simulation...</p>
        <span className="text-xs text-slate-500 mt-1">Comparing Greedy Baseline vs. SATHI Engine concurrently</span>
      </div>
    );
  }

  const sathiSnap = battleData.sathi.snapshots[currentStep] || battleData.sathi.snapshots[0];
  const greedySnap = battleData.greedy.snapshots[currentStep] || battleData.greedy.snapshots[0];
  const totalSteps = Math.min(battleData.sathi.snapshots.length, battleData.greedy.snapshots.length);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Swords className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-lg font-bold font-mono text-slate-100">
              ⚔️ STRATEGY BATTLE MODE (SPLIT SCREEN SIMULATION)
            </h2>
            <p className="text-xs text-slate-400">
              Simultaneous execution: Greedy Baseline (Left) vs. SATHI Coverage & Capacity Engine (Right)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold">
          <Trophy className="w-4 h-4 text-cyan-400" />
          P3 Accelerated by +{battleData.improvement.p3_response_time_reduction_pct}%
        </div>
      </div>

      {/* Split Screen Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Greedy Algorithm */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#131B2E] border border-amber-900/40">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-mono font-bold text-sm text-amber-400">
              LEFT: GREEDY BASELINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Distance Only
            </span>
          </div>

          <LiveGrid snapshot={greedySnap} currentStep={currentStep} />

          <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center pt-1">
            <div className="p-2 bg-[#0B0F19] rounded-lg">
              <span className="text-[10px] text-slate-400">Weighted Response</span>
              <p className="font-bold text-slate-200">{battleData.greedy.metrics.priority_weighted_response_time}m</p>
            </div>
            <div className="p-2 bg-[#0B0F19] rounded-lg">
              <span className="text-[10px] text-slate-400">Outage Duration</span>
              <p className="font-bold text-amber-400">{battleData.greedy.metrics.coverage_outage_minutes}m</p>
            </div>
            <div className="p-2 bg-[#0B0F19] rounded-lg">
              <span className="text-[10px] text-slate-400">P3 Response</span>
              <p className="font-bold text-red-400">{battleData.greedy.metrics.avg_p3_response_time}m</p>
            </div>
          </div>
        </div>

        {/* RIGHT: SATHI Engine */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#131B2E] border border-cyan-500/50 shadow-neon-cyan relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-mono font-bold text-sm text-cyan-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> RIGHT: SATHI ENGINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Coverage + Capacity AI
            </span>
          </div>

          <LiveGrid snapshot={sathiSnap} currentStep={currentStep} />

          <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center pt-1">
            <div className="p-2 bg-[#0B0F19] rounded-lg border border-cyan-500/20">
              <span className="text-[10px] text-slate-400">Weighted Response</span>
              <p className="font-bold text-cyan-300">{battleData.sathi.metrics.priority_weighted_response_time}m</p>
            </div>
            <div className="p-2 bg-[#0B0F19] rounded-lg border border-emerald-500/20">
              <span className="text-[10px] text-slate-400">Outage Duration</span>
              <p className="font-bold text-emerald-400">{battleData.sathi.metrics.coverage_outage_minutes}m</p>
            </div>
            <div className="p-2 bg-[#0B0F19] rounded-lg border border-cyan-500/20">
              <span className="text-[10px] text-slate-400">P3 Response</span>
              <p className="font-bold text-cyan-300">{battleData.sathi.metrics.avg_p3_response_time}m</p>
            </div>
          </div>
        </div>

      </div>

      {/* Battle Control Bar */}
      <ControlBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        togglePlay={() => setIsPlaying(!isPlaying)}
        setStep={setCurrentStep}
        speed={speed}
        setSpeed={setSpeed}
        resetSim={() => {
          setIsPlaying(false);
          setCurrentStep(0);
        }}
      />
    </div>
  );
}
