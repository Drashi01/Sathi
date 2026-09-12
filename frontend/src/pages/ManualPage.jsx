import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  Activity,
  Zap,
  Flame,
  Siren,
  Truck,
  Users,
  Lock,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Sliders,
  Swords,
  BrainCircuit,
  Compass,
  Layers,
  Cpu,
  RefreshCw,
  Plus,
  Radio,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function ManualPage({ setActivePage, setScenario, onStartSim }) {
  const [activeTab, setActiveTab] = useState('overview');

  // --- Interactive Scoring Calculator State ---
  const [calcDistance, setCalcDistance] = useState(25);
  const [calcPriority, setCalcPriority] = useState(3); // 1: P1, 2: P2, 3: P3
  const [calcQuadrantIdle, setCalcQuadrantIdle] = useState(1); // 0, 1, 2, 3+
  const [calcCapacityState, setCalcCapacityState] = useState('half'); // 'empty' | 'half' | 'full'

  // Calculate SATHI vs Greedy score
  const distWeight = 1.0;
  const distScore = calcDistance * distWeight;
  const priorityWeight = calcPriority === 3 ? 0 : calcPriority === 2 ? 10 : 20; // P3 gets prioritized (lower score is better)
  const coveragePenalty = calcQuadrantIdle <= 1 ? (calcQuadrantIdle === 0 ? 999 : 50) : 0;
  const capacityBonus = (calcCapacityState === 'half' && calcPriority < 3) ? 15 : 0;

  const sathiScore = Math.max(0, distScore + priorityWeight + coveragePenalty - capacityBonus);
  const greedyScore = distScore; // Greedy only looks at distance

  // --- Interactive Dual-Slot Bed Simulation State ---
  const [beds, setBeds] = useState([]); // array of { id, priority, label }

  const addPatient = (pLevel) => {
    if (pLevel === 3) {
      // P3 requires exclusive entire ambulance (2 slots)
      if (beds.length === 0) {
        setBeds([
          { id: Date.now(), priority: 3, label: 'P3 Critical (Locks Full Vehicle)' },
          { id: Date.now() + 1, priority: 3, label: 'P3 Exclusive Reservation' }
        ]);
      } else {
        alert("Cannot load P3 Critical patient: Ambulance is already partially occupied! P3 requires an empty vehicle for exclusive ICU care.");
      }
    } else {
      // P1 or P2 can share
      if (beds.length >= 2 || (beds.length > 0 && beds[0].priority === 3)) {
        alert("Ambulance at full capacity or locked exclusively by a P3 Critical patient.");
      } else {
        const label = pLevel === 1 ? 'P1 Non-Urgent' : 'P2 Moderate';
        setBeds([...beds, { id: Date.now(), priority: pLevel, label }]);
      }
    }
  };

  const resetBeds = () => setBeds([]);

  // --- Interactive Quadrant Outage Simulator State ---
  const [quadrantFleet, setQuadrantFleet] = useState({ Q1: 3, Q2: 2, Q3: 1, Q4: 2 });
  const [outageLog, setOutageLog] = useState("System Normal: All quadrants have active emergency coverage.");

  const dispatchFromQuad = (qKey, isCritical = false) => {
    setQuadrantFleet((prev) => {
      const current = prev[qKey];
      if (current <= 0) {
        setOutageLog(`⚠️ Outage Warning: ${qKey} has ZERO ambulances! Immediate mutual aid required.`);
        return prev;
      }
      if (current === 1 && !isCritical) {
        setOutageLog(`🛡️ SATHI Last-Vehicle Rule Blocked Dispatch: ${qKey} only has 1 ambulance left. Low-priority dispatch rejected to protect local critical emergencies!`);
        return prev;
      }
      const updated = current - 1;
      if (updated === 0) {
        setOutageLog(`🚨 High Alert: ${qKey} idle fleet reached 0! Coverage Outage timer initiated.`);
      } else if (updated === 1) {
        setOutageLog(`⚠️ Last Vehicle Alert: ${qKey} has only 1 ambulance remaining. Last Vehicle Protection enabled.`);
      } else {
        setOutageLog(`✅ Vehicle dispatched from ${qKey}. Remaining idle fleet: ${updated}`);
      }
      return { ...prev, [qKey]: updated };
    });
  };

  const resetFleet = () => {
    setQuadrantFleet({ Q1: 3, Q2: 2, Q3: 1, Q4: 2 });
    setOutageLog("System Normal: Fleet reset across all 4 quadrants.");
  };

  const navTabs = [
    { id: 'overview', label: '1. Project Overview', icon: BookOpen },
    { id: 'components', label: '2. Core Components', icon: Layers },
    { id: 'math', label: '3. Scoring Engine & Math', icon: BrainCircuit },
    { id: 'playgrounds', label: '4. Interactive Labs', icon: Sliders },
    { id: 'guide', label: '5. How to Use', icon: Compass },
    { id: 'faq', label: '6. Glossary & FAQ', icon: HelpCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 font-sans text-slate-100">
      {/* Hero Banner */}
      <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#131B2E] via-[#0D1322] to-[#0B0F19] border border-cyan-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Self-Explanatory User Manual & Architecture Guide
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white flex items-center gap-3">
              Understanding <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">SATHI</span>
            </h1>

            <p className="text-slate-300 text-sm font-normal leading-relaxed">
              New to SATHI? This interactive manual walks you through the entire emergency dispatch ecosystem, the mathematical algorithms, multi-agency fleet models, and interactive simulations before you launch a live run.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> ~4 min complete read
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Zero Prior Knowledge Required
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> Causal Multi-Agency Engine
              </span>
            </div>
          </div>

          {/* Quick Launch CTA Card */}
          <div className="bg-[#0B0F19]/90 border border-cyan-500/40 p-4 rounded-2xl flex flex-col gap-3 min-w-[240px] shadow-lg">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Ready to Dive In?
            </span>
            <button
              onClick={() => {
                onStartSim();
                setActivePage('sim');
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition shadow-md shadow-cyan-500/20"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Start Live Sim
            </button>
            <button
              onClick={() => setActivePage('battle')}
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:border-cyan-500/60 transition"
            >
              <Swords className="w-3.5 h-3.5 text-cyan-400" /> Strategy Battle
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center overflow-x-auto gap-2 p-1.5 bg-[#0D1322] border border-slate-800 rounded-2xl sticky top-20 z-30 shadow-lg backdrop-blur-md">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold font-mono text-cyan-300 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" /> What is SATHI?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">SATHI</strong> (<em>“Always There When It Matters”</em>) is an intelligent, real-time emergency fleet dispatcher designed for municipal emergency management. Unlike legacy dispatchers that make isolated, short-sighted decisions, SATHI looks at the whole city holistically to optimize vehicle routes, prevent geographic blindspots, and maximize dual-patient ambulance capacity.
            </p>

            {/* Why Legacy Dispatching Fails vs SATHI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4" /> The Problem: Legacy Greedy Dispatch
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Geographic Blindspots:</strong> Dispatches the closest vehicle even if it leaves an entire quadrant with 0 ambulances, causing lethal delays on subsequent emergencies.</li>
                  <li><strong>Single-Patient Inefficiency:</strong> Uses an entire ambulance for minor calls, wasting 50% of municipal transport capacity.</li>
                  <li><strong>Priority Blindness:</strong> Treats minor calls with the same geographic priority as life-threatening critical incidents.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
                  <CheckCircle2 className="w-4 h-4" /> The Solution: SATHI Intelligent Dispatch
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Last Vehicle Protection:</strong> Enforces an exponential penalty against draining the last idle ambulance from any quadrant for low-priority calls.</li>
                  <li><strong>Dual-Slot Capacity Optimization:</strong> Enables dynamic carpooling for P1 & P2 patients while reserving full exclusive lockdown for P3 Critical cases.</li>
                  <li><strong>Causal Multi-Factor Scoring:</strong> Operates strictly in real time with zero future knowledge, guaranteeing realistic municipal deployment.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#0D1322] border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> 1. 100x100 Grid Division
              </div>
              <p className="text-slate-400 font-sans text-xs">
                City map partitioned into 4 distinct quadrants (Q1 North-West, Q2 North-East, Q3 South-West, Q4 South-East) with real-time idle fleet monitors.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1322] border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4" /> 2. Dual-Slot Ambulance Beds
              </div>
              <p className="text-slate-400 font-sans text-xs">
                Every ambulance has 2 patient beds. P3 critical incidents lock both slots (2/2); P1/P2 incidents can share a vehicle dynamically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1322] border border-slate-800 space-y-2">
              <div className="text-purple-400 font-bold flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" /> 3. Explainable AI Decisions
              </div>
              <p className="text-slate-400 font-sans text-xs">
                Every dispatch decision generates human-readable reasoning explaining why a specific vehicle was selected over other candidates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPONENTS */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Component 1: Live Grid */}
            <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">1. Live 100x100 Simulation Grid</h3>
                  <span className="text-[11px] text-cyan-400 font-mono">Interactive City Map</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The visual canvas represents a 100x100 municipal region. It visualizes:
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li><span className="text-cyan-300 font-semibold">Ambulances & Emergency Units:</span> Displayed with live coordinates, status (Idle, En Route, Serving, Returning), and slot capacity pills.</li>
                <li><span className="text-red-400 font-semibold">Incident Beacons:</span> Pulsing markers color-coded by Priority (P3 Red Critical, P2 Amber Moderate, P1 Green Low).</li>
                <li><span className="text-purple-400 font-semibold">Hospitals & Stations:</span> Fixed medical facilities where patients are delivered.</li>
                <li><span className="text-yellow-400 font-semibold">Traffic Congestion Zones:</span> High-density red zones that penalize vehicle travel speeds by 50%.</li>
              </ul>
            </div>

            {/* Component 2: Multi-Agency Scenarios */}
            <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">2. Multi-Agency Emergency Modules</h3>
                  <span className="text-[11px] text-purple-400 font-mono">4 Specialized Services</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> EMS Medical</span>
                  <p className="text-slate-400 font-sans text-[10px] mt-1">Dual-slot patient transport & critical triage.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-amber-400 font-bold flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Fire & Rescue</span>
                  <p className="text-slate-400 font-sans text-[10px] mt-1">Water tanker management & hydrant refilling.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-red-400 font-bold flex items-center gap-1"><Siren className="w-3.5 h-3.5" /> Police Tactical</span>
                  <p className="text-slate-400 font-sans text-[10px] mt-1">Threat escalation & rapid suspect containment.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-purple-400 font-bold flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Unified Command</span>
                  <p className="text-slate-400 font-sans text-[10px] mt-1">Simultaneous multi-agency coordinated response.</p>
                </div>
              </div>
            </div>

            {/* Component 3: Dual-Slot Capacity */}
            <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">3. Dual-Slot Ambulance Capacity</h3>
                  <span className="text-[11px] text-emerald-400 font-mono">Dynamic Resource Multiplexing</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Each municipal ambulance houses 2 independent patient stretchers:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-red-400 font-mono font-bold">Priority 3 (Critical)</span>
                  <span className="text-slate-300 text-[11px]">Locks both slots (2/2). Zero patient sharing allowed.</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-mono font-bold">Priority 1 & 2 (Non-Critical)</span>
                  <span className="text-slate-300 text-[11px]">Can share an ambulance (1/2 + 1/2) for nearby incidents.</span>
                </div>
              </div>
            </div>

            {/* Component 4: AI Explainer Panel */}
            <div className="p-5 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center font-bold">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">4. Explainable AI Decision Engine</h3>
                  <span className="text-[11px] text-blue-400 font-mono">Auditable Natural Language Logs</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Emergency dispatchers must be explainable. Every time SATHI dispatches a vehicle, it publishes an instant audit log breaking down:
              </p>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Distance and estimated travel time in minutes.</li>
                <li>Quadrant fleet status and whether Last Vehicle Protection was invoked.</li>
                <li>Candidate comparison explaining why vehicle A was picked over vehicle B.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCORING ENGINE & MATH */}
      {activeTab === 'math' && (
        <div className="space-y-6">
          {/* Mathematical Formula Card */}
          <div className="p-6 rounded-2xl bg-[#131B2E] border border-cyan-500/30 space-y-4">
            <h2 className="text-lg font-bold font-mono text-cyan-300 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" /> SATHI Causal Scoring Equation
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              When an emergency incident occurs, SATHI evaluates all available candidate vehicles and assigns a <strong>Dispatch Penalty Score</strong>. The vehicle with the <strong>lowest score</strong> is selected:
            </p>

            <div className="p-4 rounded-xl bg-[#0B0F19] border border-cyan-500/40 text-center font-mono text-sm md:text-base text-cyan-300 tracking-wide shadow-inner">
              Score = (d(V, I) · w<sub>dist</sub>) + (w<sub>P</sub> · w<sub>priority</sub>) + (CoveragePenalty · w<sub>cov</sub>) − CapacityBonus
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">d(V, I) · w_dist</span>
                <p className="text-slate-400 text-[11px] font-sans">Euclidean distance adjusted for traffic congestion zones.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-red-400 font-bold block mb-1">w_P · w_priority</span>
                <p className="text-slate-400 text-[11px] font-sans">Priority multiplier ensuring critical P3 calls take urgency precedence.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">CoveragePenalty</span>
                <p className="text-slate-400 text-[11px] font-sans">+50 to +999 penalty if dispatching depletes quadrant idle fleet to 0.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">− CapacityBonus</span>
                <p className="text-slate-400 text-[11px] font-sans">Reward for efficiently pairing two P1/P2 patients into 1 vehicle.</p>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Widget */}
          <div className="p-6 rounded-2xl bg-[#0D1322] border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" /> Interactive Scoring Engine Simulator
                </h3>
                <p className="text-xs text-slate-400">Adjust the parameters below to see how SATHI computes the dispatch decision vs a Greedy baseline!</p>
              </div>
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800">
                Live Calculator
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4 text-xs font-mono">
                {/* Distance Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Incident Distance:</span>
                    <span className="text-cyan-400 font-bold">{calcDistance} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Priority Selector */}
                <div className="space-y-1.5">
                  <span className="text-slate-300 block">Incident Severity / Priority:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { level: 1, label: 'P1 Low', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40' },
                      { level: 2, label: 'P2 Moderate', color: 'border-amber-500 text-amber-400 bg-amber-950/40' },
                      { level: 3, label: 'P3 Critical', color: 'border-red-500 text-red-400 bg-red-950/40' },
                    ].map((p) => (
                      <button
                        key={p.level}
                        onClick={() => setCalcPriority(p.level)}
                        className={`py-2 rounded-xl border text-center transition font-bold ${
                          calcPriority === p.level ? p.color : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quadrant Idle Vehicles */}
                <div className="space-y-1.5">
                  <span className="text-slate-300 block">Ambulances Left in Home Quadrant:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((val) => (
                      <button
                        key={val}
                        onClick={() => setCalcQuadrantIdle(val)}
                        className={`py-2 rounded-xl border text-center transition font-bold ${
                          calcQuadrantIdle === val
                            ? val <= 1 ? 'border-amber-500 text-amber-300 bg-amber-950/50' : 'border-cyan-500 text-cyan-300 bg-cyan-950/50'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {val === 3 ? '3+ (Safe)' : `${val} ${val === 1 ? '(Last!)' : ''}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ambulance Capacity State */}
                <div className="space-y-1.5">
                  <span className="text-slate-300 block">Candidate Ambulance Current Occupancy:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'empty', label: '0/2 (Empty)' },
                      { id: 'half', label: '1/2 (Half Full)' },
                      { id: 'full', label: '2/2 (Full)' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setCalcCapacityState(st.id)}
                        className={`py-2 rounded-xl border text-center transition font-bold ${
                          calcCapacityState === st.id
                            ? 'border-cyan-500 text-cyan-300 bg-cyan-950/50'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-Time Score Comparison Output */}
              <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Calculated Scores (Lower is Better):
                  </span>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* SATHI Score */}
                    <div className="p-4 rounded-xl bg-[#131B2E] border border-cyan-500/50 text-center">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">SATHI Score</span>
                      <span className="text-2xl font-black font-mono text-cyan-300">{sathiScore.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Holistic Multi-Factor</span>
                    </div>

                    {/* Greedy Score */}
                    <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-700 text-center">
                      <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Greedy Score</span>
                      <span className="text-2xl font-black font-mono text-slate-300">{greedyScore.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Distance-Only</span>
                    </div>
                  </div>

                  {/* Breakdown details */}
                  <div className="space-y-1.5 text-xs font-mono text-slate-300 border-t border-slate-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance Component:</span>
                      <span>+{distScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Priority Weight (P{calcPriority}):</span>
                      <span>+{priorityWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coverage Penalty ({calcQuadrantIdle} idle):</span>
                      <span className={coveragePenalty > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        +{coveragePenalty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capacity Sharing Bonus:</span>
                      <span className={capacityBonus > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        -{capacityBonus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Explanation of the result */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <BrainCircuit className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    {calcQuadrantIdle <= 1 && calcPriority < 3
                      ? "⚠️ SATHI applies a heavy coverage penalty to prevent stripping the last vehicle in this quadrant for a non-critical call, preserving coverage for sudden P3 life-threats."
                      : calcCapacityState === 'half' && calcPriority < 3
                      ? "✨ SATHI awards a -15 capacity bonus, dynamic carpooling this patient with an existing ambulance to keep other vehicles ready!"
                      : "✅ SATHI verifies optimal balance between travel distance and quadrant fleet readiness."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE LABS */}
      {activeTab === 'playgrounds' && (
        <div className="space-y-6">
          {/* Lab 1: Dual-Slot Bed Visualizer */}
          <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-mono text-emerald-400 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Lab 1: Interactive Dual-Slot Bed Simulator
                </h3>
                <p className="text-xs text-slate-400">Test how SATHI loads patients into a 2-slot ambulance vehicle.</p>
              </div>
              <button
                onClick={resetBeds}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" /> Reset Beds
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Ambulance Visual Representation */}
              <div className="p-6 rounded-2xl bg-[#0B0F19] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                  <Truck className="w-4 h-4 text-cyan-400" /> AMBULANCE UNIT #01 (CAPACITY: 2 BEDS)
                </div>

                {/* 2 Beds Display */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {/* Bed 1 */}
                  <div
                    className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center min-h-[100px] transition-all ${
                      beds[0]
                        ? beds[0].priority === 3
                          ? 'border-red-500 bg-red-950/40 text-red-300'
                          : beds[0].priority === 2
                          ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                          : 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/50 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1">
                      Bed Slot 1
                    </span>
                    {beds[0] ? (
                      <span className="text-xs font-bold font-mono">{beds[0].label}</span>
                    ) : (
                      <span className="text-xs italic text-slate-500">Empty Stretcher</span>
                    )}
                  </div>

                  {/* Bed 2 */}
                  <div
                    className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center min-h-[100px] transition-all ${
                      beds[1]
                        ? beds[1].priority === 3
                          ? 'border-red-500 bg-red-950/40 text-red-300'
                          : beds[1].priority === 2
                          ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                          : 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/50 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1">
                      Bed Slot 2
                    </span>
                    {beds[1] ? (
                      <span className="text-xs font-bold font-mono">{beds[1].label}</span>
                    ) : (
                      <span className="text-xs italic text-slate-500">Empty Stretcher</span>
                    )}
                  </div>
                </div>

                <span className="text-[11px] font-mono text-cyan-400">
                  Current Status: {beds.length === 0 ? '0/2 (Available)' : beds.length === 1 ? '1/2 (Eligible for Carpool)' : '2/2 (Full Capacity)'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-slate-300 font-bold block">Simulate Patient Dispatch:</span>

                <button
                  onClick={() => addPatient(1)}
                  className="w-full p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" /> Dispatch P1 Patient (Minor Injury)
                  </span>
                  <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">Can Share</span>
                </button>

                <button
                  onClick={() => addPatient(2)}
                  className="w-full p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-300 hover:bg-amber-900/40 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" /> Dispatch P2 Patient (Moderate Trauma)
                  </span>
                  <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-700">Can Share</span>
                </button>

                <button
                  onClick={() => addPatient(3)}
                  className="w-full p-3 rounded-xl bg-red-950/30 border border-red-800/60 text-red-300 hover:bg-red-900/40 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" /> Dispatch P3 Critical (Cardiac Arrest)
                  </span>
                  <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-700">Locks 2/2 Slots</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lab 2: Quadrant Coverage Outage Simulator */}
          <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-mono text-cyan-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" /> Lab 2: Last Vehicle Protection & Coverage Simulator
                </h3>
                <p className="text-xs text-slate-400">Click to dispatch vehicles and observe how SATHI protects quadrants from total blindspots.</p>
              </div>
              <button
                onClick={resetFleet}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" /> Reset Fleet
              </button>
            </div>

            {/* 4 Quadrants Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(quadrantFleet).map(([qKey, count]) => {
                const isOutage = count === 0;
                const isCritical = count === 1;
                return (
                  <div
                    key={qKey}
                    className={`p-4 rounded-xl border text-center space-y-2 transition ${
                      isOutage
                        ? 'border-red-500 bg-red-950/30 text-red-300 animate-pulse'
                        : isCritical
                        ? 'border-amber-500 bg-amber-950/30 text-amber-300'
                        : 'border-slate-800 bg-[#0B0F19] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-bold">
                      <span>{qKey} Sector</span>
                      {isCritical && <Lock className="w-3.5 h-3.5 text-amber-400" title="Last Vehicle Protected" />}
                    </div>
                    <div className="text-3xl font-black font-mono">{count}</div>
                    <span className="text-[10px] text-slate-400 block">Idle Units</span>

                    <div className="space-y-1 pt-1">
                      <button
                        onClick={() => dispatchFromQuad(qKey, false)}
                        className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700"
                      >
                        Call P1/P2
                      </button>
                      <button
                        onClick={() => dispatchFromQuad(qKey, true)}
                        className="w-full py-1 rounded bg-red-950/50 hover:bg-red-900/50 text-[10px] font-mono text-red-300 border border-red-800"
                      >
                        Call P3 Critical
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Outage Log Banner */}
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{outageLog}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STEP-BY-STEP USER GUIDE */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold font-mono text-cyan-300 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" /> Step-by-Step Simulation Guide
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Follow these simple steps to run, observe, and test emergency dispatch simulations on SATHI:
            </p>

            <div className="space-y-4 pt-2">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100 font-mono">Select Emergency Scenario</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Use the left sidebar to toggle between <strong className="text-cyan-300">EMS Medical</strong>, <strong className="text-amber-300">Fire & Rescue</strong>, <strong className="text-red-300">Police Tactical</strong>, or <strong className="text-purple-300">Unified Command</strong>. Each scenario activates unique rules (e.g. water tanker hydrants, suspect threat levels).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100 font-mono">Navigate to "Live Dispatch Grid"</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Click on <strong className="text-cyan-300">Live Dispatch Grid</strong> in the sidebar or top header to open the live 100x100 municipal command map.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100 font-mono">Control Playback & Speed</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Use the bottom control bar to <strong>Play, Pause, Step Forward/Backward</strong>, scrub the timeline slider across all 100 incident steps, or adjust the speed from 1x to 8x. You can also toggle <strong>Cinematic Camera Mode</strong> for high-contrast presentation.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100 font-mono">Analyze Metrics & Battle Strategy</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Open <strong className="text-cyan-300">Analytics Dashboard</strong> to view average response time charts, or jump to <strong className="text-cyan-300">Strategy Battle</strong> to pit SATHI against the Greedy baseline side-by-side!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FAQ & GLOSSARY */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold font-mono text-cyan-300 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" /> Terminology Glossary & FAQ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold font-mono text-cyan-400">What does "Causal Dispatching" mean?</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Causal means the algorithm has zero future knowledge. It cannot predict when or where the next incident will occur, making it 100% faithful to real-world municipal dispatch conditions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold font-mono text-red-400">What is a "Coverage Outage"?</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  A state when an entire quadrant has 0 idle emergency units available. During an outage, any new emergency in that sector experiences extreme response delays because distant units must travel across town.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold font-mono text-emerald-400">How do Priority Levels (P1, P2, P3) work?</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  <strong>P3 (Critical)</strong>: Immediate life-threat requiring exclusive vehicle lock.<br />
                  <strong>P2 (Moderate)</strong>: Urgent medical need; eligible for carpooling.<br />
                  <strong>P1 (Low)</strong>: Minor non-life-threatening incident.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold font-mono text-purple-400">What is the "What-If Lab"?</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  An interactive testing sandbox where dispatchers can manually override vehicle assignments for any incident and calculate immediate delta impacts on city response time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Direct CTA Strip */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-[#0D1322] to-blue-950/80 border border-cyan-500/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2 justify-center md:justify-start">
            <Sparkles className="w-5 h-5 text-cyan-400" /> Ready to See SATHI in Action?
          </h3>
          <p className="text-xs text-slate-300">
            Launch the simulation now to watch SATHI causally coordinate municipal fleet operations in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setScenario('medical');
              onStartSim();
              setActivePage('sim');
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition shadow-lg shadow-cyan-500/30"
          >
            <Play className="w-4 h-4 fill-slate-950" /> Launch EMS Sim
          </button>
          <button
            onClick={() => setActivePage('battle')}
            className="px-5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:border-cyan-500/50 transition"
          >
            <Swords className="w-4 h-4 text-cyan-400" /> Battle Arena
          </button>
        </div>
      </div>
    </div>
  );
}
