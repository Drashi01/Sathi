import React, { useEffect, useRef, useState } from 'react';
import { Eye, Activity, AlertTriangle, TrafficCone, Compass, Camera, Truck, Users, Clock } from 'lucide-react';

export default function LiveGrid({ snapshot, currentStep, cinematicMode, toggleCinematicMode }) {
  const canvasRef = useRef(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTraffic, setShowTraffic] = useState(true);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Camera Interpolation State for Cinematic Mode
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const scaleX = width / 100;
    const scaleY = height / 100;

    const toCanvasX = (x) => x * scaleX;
    const toCanvasY = (y) => (100 - y) * scaleY;

    // 🎥 Calculate Cinematic Camera Target
    let targetX = 0;
    let targetY = 0;
    let targetZoom = 1.0;

    if (cinematicMode) {
      // Find active P3 incident or active moving vehicle to focus on
      const p3Inc = snapshot.incidents.find(i => i.priority === 3 && i.status !== 'completed');
      const busyVeh = snapshot.vehicles.find(v => v.status === 'moving' || v.status === 'busy' || v.status === 'rebalancing');

      if (p3Inc) {
        targetX = toCanvasX(p3Inc.x);
        targetY = toCanvasY(p3Inc.y);
        targetZoom = 1.8;
      } else if (busyVeh) {
        targetX = toCanvasX(busyVeh.x);
        targetY = toCanvasY(busyVeh.y);
        targetZoom = 1.4;
      } else {
        targetX = width / 2;
        targetY = height / 2;
        targetZoom = 1.0;
      }
    } else {
      targetX = width / 2;
      targetY = height / 2;
      targetZoom = 1.0;
    }

    // Smoothly interpolate camera position
    const cam = cameraRef.current;
    cam.zoom += (targetZoom - cam.zoom) * 0.1;
    cam.x += (targetX - cam.x) * 0.1;
    cam.y += (targetY - cam.y) * 0.1;

    ctx.save();

    // Apply Camera Transform if Cinematic Mode active
    if (cinematicMode && cam.zoom > 1.05) {
      ctx.translate(width / 2, height / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);
    }

    // Clear Canvas
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    // 1. Heatmap
    if (showHeatmap) {
      snapshot.incidents.forEach(inc => {
        const cx = toCanvasX(inc.x);
        const cy = toCanvasY(inc.y);
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 35);
        const color = inc.priority === 3 ? 'rgba(239, 68, 68, 0.25)' : inc.priority === 2 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.15)';
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 2. Traffic Congestion Zones
    if (showTraffic && snapshot.traffic_zones) {
      snapshot.traffic_zones.forEach(tz => {
        const x1 = toCanvasX(tz.x_min);
        const y1 = toCanvasY(tz.y_max);
        const w = (tz.x_max - tz.x_min) * scaleX;
        const h = (tz.y_max - tz.y_min) * scaleY;

        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.fillRect(x1, y1, w, h);
        ctx.strokeRect(x1, y1, w, h);

        ctx.fillStyle = '#F87171';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(`🚦 ${tz.name} (${Math.round((1 - tz.speed_factor)*100)}% DELAY)`, x1 + 6, y1 + 14);
      });
    }

    // 3. Grid Lines & Quadrant Divisions
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let i = 10; i < 100; i += 10) {
      if (i === 50) continue;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(i), 0);
      ctx.lineTo(toCanvasX(i), height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(i));
      ctx.lineTo(width, toCanvasY(i));
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Major Quadrant Lines (x=50, y=50)
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(50), 0);
    ctx.lineTo(toCanvasX(50), height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(50));
    ctx.lineTo(width, toCanvasY(50));
    ctx.stroke();

    // Quadrant Badges
    const quads = [
      { id: 1, label: 'Q1 (North-West)', x: 25, y: 75 },
      { id: 2, label: 'Q2 (North-East)', x: 75, y: 75 },
      { id: 3, label: 'Q3 (South-West)', x: 25, y: 25 },
      { id: 4, label: 'Q4 (South-East)', x: 75, y: 25 },
    ];

    ctx.font = '600 11px "JetBrains Mono", monospace';
    quads.forEach(q => {
      const qState = snapshot.quadrants.find(item => item.id === q.id);
      const isOutage = qState && qState.idle_vehicles === 0;
      
      const quadBoxX = q.id === 1 || q.id === 3 ? 10 : width / 2 + 10;
      const quadBoxY = q.id === 1 || q.id === 2 ? 10 : height / 2 + 10;
      
      ctx.fillStyle = isOutage ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(quadBoxX, quadBoxY, 150, 30);

      ctx.fillStyle = isOutage ? '#EF4444' : '#64748B';
      ctx.fillText(`${q.label}`, quadBoxX + 8, quadBoxY + 14);

      ctx.font = '700 10px monospace';
      ctx.fillStyle = isOutage ? '#F87171' : '#00F0FF';
      const statusText = isOutage ? 'OUTAGE (0 IDLE)' : `${qState?.idle_vehicles || 0} Available`;
      ctx.fillText(statusText, quadBoxX + 8, quadBoxY + 25);
      ctx.font = '600 11px "JetBrains Mono", monospace';
    });

    // 4. Draw Dispatch Vectors & Rebalancing Lines
    snapshot.vehicles.forEach(v => {
      if (v.target_x !== null && v.target_y !== null) {
        const vx = toCanvasX(v.x);
        const vy = toCanvasY(v.y);
        const tx = toCanvasX(v.target_x);
        const ty = toCanvasY(v.target_y);

        ctx.setLineDash([4, 4]);
        if (v.status === 'rebalancing') {
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 1.5;
        } else {
          const isP3 = v.patients.some(p => p.priority === 3);
          ctx.strokeStyle = isP3 ? '#EF4444' : '#00F0FF';
          ctx.lineWidth = isP3 ? 2.5 : 1.5;
        }

        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 5. Draw Incidents
    snapshot.incidents.forEach(inc => {
      if (inc.status === 'completed') return;
      const ix = toCanvasX(inc.x);
      const iy = toCanvasY(inc.y);

      let color = '#3B82F6';
      let radius = 6;
      if (inc.priority === 2) {
        color = '#F59E0B';
        radius = 7;
      } else if (inc.priority === 3) {
        color = '#EF4444';
        radius = 9;

        // Blinking Red Pulsing Halo
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ix, iy, 15 + Math.sin(Date.now() / 150) * 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(ix, iy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${inc.priority}`, ix, iy);
    });

    // 6. Draw Vehicles
    snapshot.vehicles.forEach(v => {
      const vx = toCanvasX(v.x);
      const vy = toCanvasY(v.y);

      let color = '#10B981'; // 🟢 Idle
      if (v.status === 'rebalancing') {
        color = '#A855F7';
      } else if (v.occupied_slots >= 2 || v.patients.some(p => p.priority === 3)) {
        color = '#EF4444'; // 🔴 Busy/Full
      } else if (v.occupied_slots === 1 || v.status === 'moving') {
        color = '#F59E0B'; // 🟡 Moving
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vx, vy, 11, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(vx, vy, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(vx, vy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '900 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${v.id}`, vx, vy - 13);
      
      ctx.fillStyle = v.status === 'rebalancing' ? '#A855F7' : v.occupied_slots === 0 ? '#10B981' : v.occupied_slots === 1 ? '#F59E0B' : '#EF4444';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(v.status === 'rebalancing' ? '[REBAL]' : `[${v.occupied_slots}/2]`, vx, vy + 22);
    });

    ctx.restore();

  }, [snapshot, showHeatmap, showTraffic, cinematicMode]);

  // Handle Mouse Move for Vehicle Hover Patient Tooltip
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 100;

    let found = null;
    snapshot.vehicles.forEach(v => {
      const vx = v.x * scaleX;
      const vy = (100 - v.y) * scaleY;
      const dist = Math.hypot(mouseX - vx, mouseY - vy);
      if (dist <= 16) {
        found = v;
      }
    });

    if (found) {
      setHoveredVehicle(found);
      setTooltipPos({ x: mouseX + 15, y: mouseY + 15 });
    } else {
      setHoveredVehicle(null);
    }
  };

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-2xl relative flex flex-col items-center">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100 font-mono">
            100x100 LIVE DISPATCH GRID
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Time: <span className="text-cyan-400 font-bold">t = {currentStep}m</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 🎥 Cinematic Mode Toggle */}
          <button
            onClick={toggleCinematicMode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
              cinematicMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-neon-cyan animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Cinematic Camera {cinematicMode ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showTraffic
                ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-neon-red'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <TrafficCone className="w-3.5 h-3.5" /> Traffic
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showHeatmap
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-neon-cyan'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Heatmap
          </button>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="relative border-2 border-slate-800 rounded-xl overflow-hidden shadow-inner bg-[#090D16]">
        <canvas
          ref={canvasRef}
          width={540}
          height={540}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredVehicle(null)}
          className="cursor-crosshair block"
        />

        {/* 🎬 Cinematic Text Overlay Banner */}
        {cinematicMode && snapshot?.recent_decisions?.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-purple-500 text-purple-300 px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-2xl animate-bounce">
            <Camera className="w-4 h-4 text-purple-400" />
            Dispatching {snapshot.recent_decisions[0].vehicle_name} to {snapshot.recent_decisions[0].incident_id} (P{snapshot.recent_decisions[0].priority})
          </div>
        )}

        {/* Floating Patient Intelligence Tooltip */}
        {hoveredVehicle && (
          <div
            style={{ top: tooltipPos.y, left: tooltipPos.x }}
            className="absolute z-50 bg-[#0B0F19]/95 backdrop-blur-md border border-cyan-500/60 rounded-xl p-3 shadow-2xl text-xs font-mono text-slate-100 min-w-[200px] pointer-events-none"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-bold text-cyan-300 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> {hoveredVehicle.name}
              </span>
              <span className="text-[10px] text-slate-400">Q{hoveredVehicle.current_quadrant}</span>
            </div>

            <div className="text-[11px] mb-2 flex items-center justify-between">
              <span>Slots Occupied:</span>
              <span className="font-bold text-cyan-400">[{hoveredVehicle.occupied_slots}/2]</span>
            </div>

            {/* Patients Onboard List */}
            {hoveredVehicle.patients && hoveredVehicle.patients.length > 0 ? (
              <div className="space-y-1.5 border-t border-slate-800/80 pt-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Patients Onboard:</span>
                {hoveredVehicle.patients.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#080B12] p-1.5 rounded text-[10px]">
                    <span className={`font-bold ${p.priority === 3 ? 'text-red-400' : p.priority === 2 ? 'text-amber-400' : 'text-blue-400'}`}>
                      Patient {idx + 1} (P{p.priority})
                    </span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {p.service_remaining.toFixed(1)}m left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-emerald-400 italic border-t border-slate-800/80 pt-1.5">
                Vehicle Available (0 Patients)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid Legend Footer */}
      <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono bg-[#0B0F19] p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold">VEHICLES:</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Idle (0/2)
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Moving (1/2)
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Rebalancing
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold">ZONES:</span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2.5 h-2.5 rounded bg-red-500/40 border border-red-500"></span> Red Traffic Corridor
          </span>
        </div>
      </div>
    </div>
  );
}
