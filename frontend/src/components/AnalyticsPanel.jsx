import React from 'react';
import { BarChart3, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function AnalyticsPanel({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 font-mono uppercase">
            Live Performance Metrics
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Engine Execution: <span className="text-cyan-400 font-bold">{metrics.runtime_ms} ms</span>
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Metric 1: Priority Weighted Response Time */}
        <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium font-mono">
            Weighted Response Time
          </span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-cyan-400">
              {metrics.priority_weighted_response_time}
            </span>
            <span className="text-xs text-slate-400">mins</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3" /> Target &lt; 45m
          </div>
        </div>

        {/* Metric 2: Coverage Outage Minutes */}
        <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium font-mono">
            Coverage Outages
          </span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-amber-400">
              {metrics.coverage_outage_minutes}
            </span>
            <span className="text-xs text-slate-400">mins</span>
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Minimized
          </div>
        </div>

        {/* Metric 3: Priority-3 Response Time */}
        <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium font-mono">
            P3 Critical Avg Time
          </span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-red-400">
              {metrics.avg_p3_response_time}
            </span>
            <span className="text-xs text-slate-400">mins</span>
          </div>
          <div className="text-[10px] text-red-400 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3" /> Priority Lock
          </div>
        </div>

        {/* Metric 4: Capacity Utilization */}
        <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium font-mono">
            Capacity Utilization
          </span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-purple-400">
              {metrics.capacity_utilization_percent}%
            </span>
          </div>
          <div className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Dual Slot Sharing
          </div>
        </div>

        {/* Metric 5: Assignment Validity */}
        <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium font-mono">
            Assignment Validity
          </span>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-emerald-400">
              {metrics.assignment_validity_percent}%
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> 0 Constraint Violations
          </div>
        </div>
      </div>
    </div>
  );
}
