import React, { useState } from 'react';
import { Sliders, Play, ArrowRight, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { submitWhatIfAssign } from '../utils/api';

export default function WhatIfPanel({ incidents, vehicles, seed }) {
  const [selectedInc, setSelectedInc] = useState(incidents?.[0]?.id || 'INC-001');
  const [selectedVeh, setSelectedVeh] = useState(vehicles?.[0]?.id || 'V-01');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await submitWhatIfAssign(selectedInc, selectedVeh, seed);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto my-6">
      {/* Title */}
      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
        <Sliders className="w-6 h-6 text-cyan-400" />
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide">
            🔮 WHAT-IF SIMULATION LAB
          </h2>
          <p className="text-xs text-slate-400">
            Pause simulation, test an alternative vehicle assignment, and analyze instantaneous metric trade-offs.
          </p>
        </div>
      </div>

      {/* Control Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
            1. SELECT INCIDENT
          </label>
          <select
            value={selectedInc}
            onChange={(e) => setSelectedInc(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 font-mono focus:border-cyan-500 outline-none"
          >
            {incidents?.map(inc => (
              <option key={inc.id} value={inc.id}>
                {inc.id} (P{inc.priority}, Q{inc.quadrant})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
            2. SELECT OVERRIDE VEHICLE
          </label>
          <select
            value={selectedVeh}
            onChange={(e) => setSelectedVeh(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 font-mono focus:border-cyan-500 outline-none"
          >
            {vehicles?.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} (Q{v.current_quadrant}, {v.occupied_slots}/2 slots)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            Simulate Custom Assignment
          </button>
        </div>
      </div>

      {/* Results Comparison Card */}
      {result && (
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-cyan-400">
              SIMULATION OVERRIDE EVALUATION RESULTS
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {result.impact.recommendation}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Weighted Response Time Impact</span>
              <div className="mt-1 flex items-baseline gap-2 font-mono">
                <span className={`text-xl font-bold ${result.impact.weighted_response_time_delta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {result.impact.weighted_response_time_delta > 0 ? `+${result.impact.weighted_response_time_delta}` : result.impact.weighted_response_time_delta}m
                </span>
                <span className="text-xs text-slate-500">vs SATHI Default</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Quadrant Outage Duration Impact</span>
              <div className="mt-1 flex items-baseline gap-2 font-mono">
                <span className={`text-xl font-bold ${result.impact.coverage_outage_delta_minutes > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {result.impact.coverage_outage_delta_minutes > 0 ? `+${result.impact.coverage_outage_delta_minutes}` : result.impact.coverage_outage_delta_minutes}m
                </span>
                <span className="text-xs text-slate-500">outage shift</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
