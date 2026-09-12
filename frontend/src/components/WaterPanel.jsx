import React from 'react';
import { Flame, Droplets, RefreshCw, ShieldCheck } from 'lucide-react';

export default function WaterPanel({ snapshot }) {
  if (!snapshot) return null;

  const vehicles = snapshot.vehicles.filter(v => v.agency === "fire" || snapshot.scenario === "fire");
  const hydrants = snapshot.hydrants || [];

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase">
            Fire Engine Water & Hydrant Monitor
          </h2>
        </div>
        <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
          <Droplets className="w-3.5 h-3.5" /> 4 Hydrant Stations
        </span>
      </div>

      {/* Hydrant Station Locations */}
      <div className="grid grid-cols-2 gap-2 mb-3 bg-[#0B0F19] p-2 rounded-xl border border-slate-800 text-[10px]">
        {hydrants.map(h => (
          <div key={h.id} className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-cyan-300">{h.id}:</span>
            <span>Q{h.quadrant} ({h.x}, {h.y})</span>
          </div>
        ))}
      </div>

      {/* Grid of 20 Fire Engine Water Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 overflow-y-auto max-h-[380px] pr-1">
        {vehicles.map(v => {
          const isLowWater = v.water_level < 20.0;
          const isRefilling = v.status === "refilling";

          return (
            <div
              key={v.id}
              className={`p-2.5 rounded-xl border transition flex flex-col justify-between ${
                isRefilling
                  ? 'bg-amber-950/30 border-amber-500 shadow-neon-red animate-pulse'
                  : isLowWater
                  ? 'bg-red-950/20 border-red-800'
                  : 'bg-[#0B0F19] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-amber-300">
                  {v.id}
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                  {v.vehicle_type.toUpperCase()}
                </span>
              </div>

              {/* Water Tank Progress Bar */}
              <div className="my-1.5 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" /> Water:
                  </span>
                  <span className={`font-bold ${isLowWater ? 'text-red-400' : 'text-cyan-400'}`}>
                    {v.water_level.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isLowWater ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${v.water_level}%` }}
                  />
                </div>
              </div>

              {/* Status Footer */}
              <div className="mt-1 flex items-center justify-between text-[10px] border-t border-slate-800/60 pt-1">
                <span className={`font-bold ${isRefilling ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isRefilling ? 'REFILLING' : v.status.toUpperCase()}
                </span>
                <span className="text-slate-500 text-[9px]">
                  Q{v.current_quadrant}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
