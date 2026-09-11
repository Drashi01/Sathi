import React from 'react';
import { Compass, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export default function CoveragePanel({ snapshot, outageMinutes }) {
  if (!snapshot) return null;

  const quads = snapshot.quadrants;

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 font-mono uppercase">
            Quadrant Coverage Preserver
          </h2>
        </div>

        {/* Cumulative Outage Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-900 text-red-400 text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5" />
          Outages: {outageMinutes?.toFixed(1)} mins
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quads.map(q => {
          const isOutage = q.idle_vehicles === 0;

          return (
            <div
              key={q.id}
              className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                isOutage
                  ? 'bg-red-950/20 border-red-500/80 shadow-neon-red animate-pulse-red'
                  : 'bg-[#0B0F19] border-slate-800/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-200">
                  {q.name}
                </span>
                {isOutage ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wide">
                    <AlertTriangle className="w-3 h-3" /> OUTAGE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                    <ShieldCheck className="w-3 h-3" /> SECURE
                  </span>
                )}
              </div>

              {/* Idle Vehicles Indicator */}
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Idle Vehicles</span>
                <span
                  className={`font-mono text-lg font-black ${
                    isOutage ? 'text-red-400' : 'text-cyan-400'
                  }`}
                >
                  {q.idle_vehicles} / 5
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOutage ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  }`}
                  style={{ width: `${(q.idle_vehicles / 5) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
