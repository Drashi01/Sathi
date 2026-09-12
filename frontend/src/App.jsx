import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LiveGrid from './components/LiveGrid';
import CapacityPanel from './components/CapacityPanel';
import CoveragePanel from './components/CoveragePanel';
import AIExplainerPanel from './components/AIExplainerPanel';
import ControlBar from './components/ControlBar';
import CriticalAlertBanner from './components/CriticalAlertBanner';

import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import BattlePage from './pages/BattlePage';
import WhatIfPage from './pages/WhatIfPage';
import AIAssistantPage from './pages/AIAssistantPage';

import { fetchSimulation } from './utils/api';
import { sounds } from './audio/soundEffects';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [strategy, setStrategy] = useState('sathi');
  const [seed, setSeed] = useState(42);
  const [simResult, setSimResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchSimulation(strategy, seed)
      .then(res => {
        setSimResult(res);
        setCurrentStep(0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load simulation:", err);
        setLoading(false);
      });
  }, [strategy, seed]);

  useEffect(() => {
    if (isPlaying && simResult) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= simResult.snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const snap = simResult.snapshots[next];
          
          if (snap && snap.is_critical_broadcast) {
            sounds.playSiren();
          } else if (snap && snap.recent_decisions && snap.recent_decisions.length > 0) {
            sounds.playDispatchChime();
          }
          if (snap && snap.outage_active) {
            sounds.playAlert();
          }
          return next;
        });
      }, 1000 / speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, simResult]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetSim = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const currentSnapshot = simResult?.snapshots[currentStep] || null;
  const recentDecisions = simResult?.decisions.filter(d => d.step <= currentStep) || [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          strategy={strategy}
          setStrategy={setStrategy}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          resetSim={resetSim}
          audioEnabled={audioEnabled}
          setAudioEnabled={setAudioEnabled}
          cinematicMode={cinematicMode}
          setCinematicMode={setCinematicMode}
          activeTab={activePage}
          setActiveTab={setActivePage}
        />

        {/* 🚨 Critical Event Broadcast System Top Banner */}
        {currentSnapshot && <CriticalAlertBanner snapshot={currentSnapshot} />}

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center font-mono">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mb-4"></div>
              <p className="text-cyan-400 text-sm font-bold">Initializing SATHI Neural Dispatcher Engine v3.0...</p>
              <span className="text-xs text-slate-500 mt-1">Generating 100 causal incidents, fleet vectors & critical broadcast channels</span>
            </div>
          ) : (
            <>
              {activePage === 'home' && (
                <HomePage
                  setActivePage={setActivePage}
                  onStartSim={() => setIsPlaying(true)}
                />
              )}

              {activePage === 'sim' && currentSnapshot && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 7 Cols: Live 100x100 Grid with Cinematic Camera */}
                    <div className="lg:col-span-7">
                      <LiveGrid
                        snapshot={currentSnapshot}
                        currentStep={currentStep}
                        cinematicMode={cinematicMode}
                        toggleCinematicMode={() => setCinematicMode(!cinematicMode)}
                      />
                    </div>

                    {/* Right 5 Cols: Coverage Health + Patient Handling Intelligence */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                      <CoveragePanel
                        snapshot={currentSnapshot}
                        outageMinutes={simResult.metrics.coverage_outage_minutes}
                      />
                      <CapacityPanel snapshot={currentSnapshot} />
                    </div>
                  </div>

                  {/* AI Decision Explainer */}
                  <AIExplainerPanel decisions={recentDecisions} />
                </div>
              )}

              {activePage === 'analytics' && simResult && (
                <AnalyticsPage metrics={simResult.metrics} />
              )}

              {activePage === 'battle' && (
                <BattlePage seed={seed} />
              )}

              {activePage === 'whatif' && currentSnapshot && (
                <WhatIfPage
                  incidents={currentSnapshot.incidents}
                  vehicles={currentSnapshot.vehicles}
                  seed={seed}
                />
              )}

              {activePage === 'assistant' && (
                <AIAssistantPage strategy={strategy} seed={seed} />
              )}
            </>
          )}
        </main>

        {/* Fixed Control Bar when on Simulation Page */}
        {activePage === 'sim' && simResult && (
          <ControlBar
            currentStep={currentStep}
            totalSteps={simResult.snapshots.length}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            setStep={setCurrentStep}
            speed={speed}
            setSpeed={setSpeed}
            resetSim={resetSim}
          />
        )}
      </div>
    </div>
  );
}
