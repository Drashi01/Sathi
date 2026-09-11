import React from 'react';
import { BarChart3, Clock, AlertTriangle, ShieldCheck, Zap, TrafficCone, RefreshCw } from 'lucide-react';

export default function AnalyticsPage({ metrics }) {
  if (!metrics) {
    return (
      <div className="p-12 text-center font-mono text-slate-400">
        Run simulation to populate telemetry analytics...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-xl font-bold font-mono text-slate-100">
              📊 TELEMETRY ANALYTICS DASHBOARD
            </h2>
            <p className="text-xs text-slate-400">
              Real-time statistical evaluation across 100 incident dispatches and 20 fleet units.
            </p>
          </div>
        </div>

        <span className="text-xs text-cyan-400 font-mono bg-cyan-950 px-3 py-1.5 rounded-xl border border-cyan-800 font-bold">
          Engine Runtime: {metrics.runtime_ms} ms
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
          <span className="text-[10px] text-slate-400">Weighted Response</span>
          <p className="text-xl font-bold text-cyan-400 mt-1">{metrics.priority_weighted_response_time}m</p>
          <span className="text-[9px] text-emerald-400 font-sans">Priority-weighted</span>
        </div>

        <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
          <span className="text-[10px] text-slate-400">P3 Critical Avg</span>
          <p className="text-xl font-bold text-red-400 mt-1">{metrics.avg_p3_response_time}m</p>
          <span className="text-[9px] text-red-400 font-sans">Exclusive lock</span>
        </div>

        <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
          <span className="text-[10px] text-slate-400">Coverage Outages</span>
          <p className="text-xl font-bold text-amber-400 mt-1">{metrics.coverage_outage_minutes}m</p>
          <span className="text-[9px] text-amber-400 font-sans">Outage duration</span>
        </div>

        <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
          <span className="text-[10px] text-slate-400">Rebalance Moves</span>
          <p className="text-xl font-bold text-purple-400 mt-1">{metrics.rebalance_moves_count}</p>
          <span className="text-[9px] text-purple-400 font-sans">Quadrant transfers</span>
        </div>

        <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
          <span className="text-[10px] text-slate-400">Traffic Delays</span>
          <p className="text-xl font-bold text-red-400 mt-1">{metrics.traffic_delays_encountered}</p>
          <span className="text-[9px] text-red-400 font-sans">Slow zone events</span>
        </div>

        <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
          <span className="text-[10px] text-slate-400">Capacity Usage</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{metrics.capacity_utilization_percent}%</p>
          <span className="text-[9px] text-emerald-400 font-sans">Dual slot efficiency</span>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Priority Response Breakdown */}
        <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">
              Average Response Time by Priority
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1 text-red-400 font-bold">
                <span>Priority 3 (Critical Emergency)</span>
                <span>{metrics.avg_p3_response_time} mins</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (metrics.avg_p3_response_time / 80) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-amber-400 font-bold">
                <span>Priority 2 (Medium Urgency)</span>
                <span>{metrics.avg_p2_response_time} mins</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (metrics.avg_p2_response_time / 80) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-blue-400 font-bold">
                <span>Priority 1 (Low Urgency)</span>
                <span>{metrics.avg_p1_response_time} mins</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (metrics.avg_p1_response_time / 80) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Operational Health */}
        <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">
              Fleet Operational Health & Compliance
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Total Incidents Serviced:</span>
              <span className="font-bold text-slate-100">{metrics.assigned_incidents} / {metrics.total_incidents}</span>
            </div>

            <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Assignment Constraint Validity:</span>
              <span className="font-bold text-emerald-400">{metrics.assignment_validity_percent}% (0 Violations)</span>
            </div>

            <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Automated Rebalancing Executions:</span>
              <span className="font-bold text-purple-400">{metrics.rebalance_moves_count} Transfers</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
