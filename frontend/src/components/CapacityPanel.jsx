import React from 'react';
import { Truck, Users, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CapacityPanel({ snapshot }) {
  if (!snapshot) return null;

  const vehicles = snapshot.vehicles;

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide uppercase">
            Patient Handling Intelligence (20 Fleet)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Slots: <span className="text-cyan-400 font-bold">2 Patients / Vehicle</span>
        </span>
      </div>

      {/* Grid of 20 Fleet Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 overflow-y-auto max-h-[480px] pr-1">
        {vehicles.map(v => {
          const isFull = v.occupied_slots >= v.capacity || v.patients.some(p => p.priority === 3);
          const isPartial = v.occupied_slots === 1;
          const isEmpty = v.occupied_slots === 0;

          const cardBorder = isFull
            ? 'border-red-900/60 bg-red-950/10'
            : isPartial
            ? 'border-amber-700/60 bg-amber-950/10'
            : 'border-slate-800 bg-[#0B0F19]';

          return (
            <div
              key={v.id}
              className={`p-2.5 rounded-xl border transition hover:border-cyan-500/50 flex flex-col justify-between ${cardBorder}`}
            >
              {/* Title & Quadrant */}
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-cyan-300">
                  {v.id}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Q{v.current_quadrant}
                </span>
              </div>

              {/* Slot Visualizer Icons */}
              <div className="my-1 flex items-center justify-center gap-1.5 bg-[#090D16] p-1.5 rounded-lg border border-slate-800/80">
                <div
                  className={`h-4 w-6 rounded flex items-center justify-center text-[9px] font-bold transition ${
                    v.occupied_slots >= 1
                      ? v.patients[0]?.priority === 3
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-500 text-slate-950'
                      : 'bg-blue-600/40 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {v.occupied_slots >= 1 ? `P${v.patients[0]?.priority}` : 'EMPTY'}
                </div>

                <div
                  className={`h-4 w-6 rounded flex items-center justify-center text-[9px] font-bold transition ${
                    v.occupied_slots >= 2
                      ? 'bg-amber-500 text-slate-950'
                      : v.patients.some(p => p.priority === 3)
                      ? 'bg-red-900/50 text-red-400 border border-red-800'
                      : 'bg-blue-600/40 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {v.occupied_slots >= 2
                    ? `P${v.patients[1]?.priority}`
                    : v.patients.some(p => p.priority === 3)
                    ? 'LOCK'
                    : 'EMPTY'}
                </div>
              </div>

              {/* Detailed Onboard Patients List */}
              {v.patients && v.patients.length > 0 ? (
                <div className="my-1 space-y-1 font-mono text-[9px]">
                  {v.patients.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#080B12] px-1.5 py-0.5 rounded border border-slate-800/60">
                      <span className={p.priority === 3 ? 'text-red-400 font-bold' : p.priority === 2 ? 'text-amber-400' : 'text-blue-400'}>
                        P{p.priority}
                      </span>
                      <span className="text-slate-400">{p.service_remaining.toFixed(1)}m</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="my-1 text-[9px] font-mono text-slate-500 text-center py-1">
                  Ready (0 Patients)
                </div>
              )}

              {/* Status Footer */}
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono border-t border-slate-800/60 pt-1">
                <span
                  className={`font-semibold ${
                    isFull
                      ? 'text-red-400'
                      : isPartial
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {isFull ? 'FULL' : isPartial ? 'PARTIAL' : 'AVAILABLE'}
                </span>
                <span className="text-slate-500 text-[9px]">
                  {v.total_dispatches} runs
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
