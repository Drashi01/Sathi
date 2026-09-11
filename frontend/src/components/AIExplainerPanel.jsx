import React from 'react';
import { Cpu, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

export default function AIExplainerPanel({ decisions }) {
  if (!decisions || decisions.length === 0) {
    return (
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-center items-center text-center min-h-[220px]">
        <Cpu className="w-8 h-8 text-cyan-500/40 mb-2 animate-pulse" />
        <p className="text-xs text-slate-400 font-mono">
          Awaiting real-time incident dispatches...
        </p>
      </div>
    );
  }

  // Show recent 5 decisions
  const recentDecisions = decisions.slice(-5).reverse();

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 font-mono uppercase">
            AI Decision Explainer Panel
          </h2>
        </div>
        <span className="text-xs text-cyan-400 font-mono flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" /> Explainable AI
        </span>
      </div>

      {/* Decision Feed */}
      <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
        {recentDecisions.map((d, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800/90 text-xs flex flex-col gap-2 hover:border-cyan-500/40 transition"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    d.priority === 3
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : d.priority === 2
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  INCIDENT {d.incident_id} (P{d.priority})
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono font-bold text-cyan-300">
                  {d.vehicle_name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Score: <span className="text-cyan-400 font-bold">{d.score}</span>
              </span>
            </div>

            {/* Structured Explanation Text */}
            <p className="text-slate-300 font-sans leading-relaxed text-[11px] whitespace-pre-line bg-[#080B12] p-2.5 rounded-lg border border-slate-800/60 font-mono">
              {d.explanation}
            </p>

            {/* Score Breakdown Bar */}
            {d.score_breakdown && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span>Dist: {d.score_breakdown.distance_cost || d.score_breakdown.distance}</span>
                <span>Coverage Penalty: {d.score_breakdown.coverage_penalty}</span>
                <span>Cap Bonus: -{d.score_breakdown.capacity_bonus}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
