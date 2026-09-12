import React from 'react';
import { Siren, Shield, AlertOctagon, UserCheck } from 'lucide-react';

export default function PolicePanel({ snapshot }) {
  if (!snapshot) return null;

  const vehicles = snapshot.vehicles.filter(v => v.agency === "police" || snapshot.scenario === "police");

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Siren className="w-5 h-5 text-red-400 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-100 uppercase">
            Police Tactical & SWAT Readiness Monitor
          </h2>
        </div>
        <span className="text-xs text-red-400 font-bold flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" /> Threat Level Protocol
        </span>
      </div>

      {/* Grid of 20 Police Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 overflow-y-auto max-h-[440px] pr-1">
        {vehicles.map(v => {
          const isSwat = v.unit_type === "swat";
          const isBusy = v.status === "busy" || v.status === "moving";

          return (
            <div
              key={v.id}
              className={`p-2.5 rounded-xl border transition flex flex-col justify-between ${
                isSwat
                  ? 'bg-red-950/20 border-red-500/60 shadow-neon-red'
                  : isBusy
                  ? 'bg-blue-950/20 border-blue-800'
                  : 'bg-[#0B0F19] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-cyan-300">
                  {v.id}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isSwat
                      ? 'bg-red-900 text-red-200 border border-red-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {v.unit_type.toUpperCase()}
                </span>
              </div>

              <div className="my-1.5 bg-[#080B12] p-1.5 rounded border border-slate-800/80 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Quad:</span>
                  <span className="font-bold text-cyan-400">Q{v.current_quadrant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-bold ${isBusy ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {v.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Status Footer */}
              <div className="mt-1 flex items-center justify-between text-[10px] border-t border-slate-800/60 pt-1">
                <span className="text-slate-400 text-[9px]">Runs: {v.total_dispatches}</span>
                <span className="text-cyan-400 font-bold text-[9px]">
                  {isSwat ? 'TACTICAL SWAT' : 'PATROL UNIT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
