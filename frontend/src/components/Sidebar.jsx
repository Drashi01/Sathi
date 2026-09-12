import React from 'react';
import { Home, Activity, BarChart3, Swords, Sliders, Bot, Shield, Sparkles, Flame, Siren, Zap, Truck, BookOpen } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, scenario, setScenario }) {
  const scenarios = [
    { id: 'medical', label: 'EMS Medical', icon: Truck, color: 'text-cyan-400' },
    { id: 'fire', label: 'Fire & Rescue', icon: Flame, color: 'text-amber-400' },
    { id: 'police', label: 'Police Tactical', icon: Siren, color: 'text-red-400' },
    { id: 'unified', label: 'Unified Command', icon: Zap, color: 'text-purple-400' },
  ];

  const navItems = [
    { id: 'home', label: 'Home Overview', icon: Home },
    { id: 'manual', label: 'Project Manual', icon: BookOpen },
    { id: 'sim', label: 'Live Dispatch Grid', icon: Activity },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
    { id: 'battle', label: 'Strategy Battle', icon: Swords },
    { id: 'whatif', label: 'What-If Lab', icon: Sliders },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <aside className="w-64 bg-[#0D1322] border-r border-slate-800 flex flex-col justify-between p-4 sticky top-0 h-screen z-50 overflow-y-auto">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent font-mono">
                SATHI
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v4.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              “Always There When It Matters”
            </p>
          </div>
        </div>

        {/* 🚨 Emergency Scenario Selector */}
        <div className="mb-6 space-y-1 bg-[#0B0F19] p-2 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 uppercase tracking-wider block mb-1">
            EMERGENCY SCENARIO:
          </span>
          {scenarios.map(sc => {
            const Icon = sc.icon;
            const isSelected = scenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setScenario(sc.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${sc.color}`} />
                  <span>{sc.label}</span>
                </div>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
              </button>
            );
          })}
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 uppercase tracking-wider block mb-1">
            PAGES & VIEWS:
          </span>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800/80 text-[11px] font-mono mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400">Dispatch Suite:</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> v4.0 SUITE
          </span>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Multi-Agency Command
        </div>
      </div>
    </aside>
  );
}
