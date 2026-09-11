import React, { useEffect, useState } from 'react';
import { Swords, Trophy, Zap, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { fetchComparison } from '../utils/api';

export default function StrategyComparisonPanel({ seed }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison(seed)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [seed]);

  if (loading || !data) {
    return (
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-mono text-xs">
        Running side-by-side strategy benchmarks (Greedy Baseline vs SATHI Engine)...
      </div>
    );
  }

  const { sathi, greedy, improvement } = data;

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto my-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Swords className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide">
              ⚔️ STRATEGY COMPARISON ENGINE
            </h2>
            <p className="text-xs text-slate-400">
              Side-by-side benchmark comparing Greedy Baseline vs SATHI Multi-Factor Engine across identical 100 incident scenarios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-neon-green">
          <Trophy className="w-4 h-4 text-emerald-400" />
          SATHI Wins by +{improvement.response_time_reduction_pct}% Efficiency
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Greedy Baseline Card */}
        <div className="p-5 rounded-xl bg-[#0B0F19] border border-amber-900/40 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-mono font-bold text-sm text-amber-400">
              GREEDY BASELINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Distance Only
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-[#080B12] p-2.5 rounded-lg">
              <span className="text-slate-400">Priority-Weighted Response Time:</span>
              <span className="font-bold text-slate-200">{greedy.metrics.priority_weighted_response_time} mins</span>
            </div>

            <div className="flex justify-between items-center bg-[#080B12] p-2.5 rounded-lg">
              <span className="text-slate-400">Coverage Outage Duration:</span>
              <span className="font-bold text-amber-400">{greedy.metrics.coverage_outage_minutes} mins</span>
            </div>

            <div className="flex justify-between items-center bg-[#080B12] p-2.5 rounded-lg">
              <span className="text-slate-400">Priority-3 Avg Response Time:</span>
              <span className="font-bold text-red-400">{greedy.metrics.avg_p3_response_time} mins</span>
            </div>
          </div>
        </div>

        {/* SATHI Engine Card */}
        <div className="p-5 rounded-xl bg-[#0B0F19] border border-cyan-500/60 shadow-neon-cyan flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 font-mono text-[9px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            WINNER
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-mono font-bold text-sm text-cyan-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> SATHI ENGINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Coverage + Capacity AI
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-[#080B12] p-2.5 rounded-lg border border-cyan-500/20">
              <span className="text-slate-400">Priority-Weighted Response Time:</span>
              <span className="font-bold text-cyan-300">{sathi.metrics.priority_weighted_response_time} mins</span>
            </div>

            <div className="flex justify-between items-center bg-[#080B12] p-2.5 rounded-lg border border-emerald-500/20">
              <span className="text-slate-400">Coverage Outage Duration:</span>
              <span className="font-bold text-emerald-400">{sathi.metrics.coverage_outage_minutes} mins</span>
            </div>

            <div className="flex justify-between items-center bg-[#080B12] p-2.5 rounded-lg border border-cyan-500/20">
              <span className="text-slate-400">Priority-3 Avg Response Time:</span>
              <span className="font-bold text-cyan-300">{sathi.metrics.avg_p3_response_time} mins</span>
            </div>
          </div>
        </div>

      </div>

      {/* Outperformance Summary Banner */}
      <div className="mt-6 p-4 rounded-xl bg-[#080B12] border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <ArrowUpRight className="w-4 h-4" />
          <span>Outage minutes reduced by <strong>{improvement.outage_minutes_saved} mins</strong></span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Zap className="w-4 h-4" />
          <span>P3 Critical response time accelerated by <strong>+{improvement.p3_response_time_reduction_pct}%</strong></span>
        </div>
      </div>
    </div>
  );
}
