import React from 'react';
import { Shield, Sparkles, Activity, Lock, Users, AlertTriangle, Swords, ArrowRight, Zap } from 'lucide-react';
import { sounds } from '../audio/soundEffects';

export default function HomePage({ setActivePage, onStartSim }) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Hero Section */}
      <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#131B2E] via-[#0D1322] to-[#0B0F19] border border-cyan-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Hackathon-Winning Dispatch Architecture
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tight leading-tight">
            SATHI – Intelligent Emergency Dispatcher
          </h1>

          <p className="text-slate-300 text-base font-sans font-medium leading-relaxed">
            “Always There When It Matters.” A real-time, causal municipal emergency fleet manager featuring <span className="text-cyan-400 font-bold">Last Vehicle Protection</span>, <span className="text-emerald-400 font-bold">Dual-Slot Capacity Optimization</span>, and <span className="text-amber-400 font-bold">Traffic-Aware Dynamic Re-routing</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => {
                onStartSim();
                setActivePage('sim');
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition"
            >
              <Activity className="w-4 h-4" /> Start SATHI Simulation
            </button>

            <button
              onClick={() => setActivePage('battle')}
              className="px-6 py-3 rounded-2xl bg-[#0B0F19] border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:border-cyan-500/50 transition"
            >
              <Swords className="w-4 h-4 text-cyan-400" /> Launch Strategy Battle
            </button>
          </div>
        </div>
      </div>

      {/* 4 Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        {/* Pillar 1: Last Vehicle Protection */}
        <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              Last Vehicle Protection Rule
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Strictly prevents removing the last idle ambulance from a quadrant for low-priority calls.
            </p>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold mt-4">Zero Outage Guarantee</span>
        </div>

        {/* Pillar 2: Dual Slot Capacity */}
        <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              Dual Slot Ambulance Capacity
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              P3 incidents lock exclusive vehicles; P1 & P2 incidents dynamically share capacity up to 2 patients.
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold mt-4">[ 🟥 🟩 ] Capacity Optimization</span>
        </div>

        {/* Pillar 3: Traffic Congestion Rerouting */}
        <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              Traffic Congestion Rerouting
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Monitors red traffic zones (50% speed penalty) and dynamically calculates traffic-adjusted travel routes.
            </p>
          </div>
          <span className="text-[10px] text-red-400 font-bold mt-4">Dynamic Speed Matrix</span>
        </div>

        {/* Pillar 4: Automated Rebalancing */}
        <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              Automated Rebalancing
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Automatically dispatches idle ambulances from surplus quadrants to reinforce weak quadrants.
            </p>
          </div>
          <span className="text-[10px] text-purple-400 font-bold mt-4">Proactive Fleet Dispatch</span>
        </div>

      </div>
    </div>
  );
}
