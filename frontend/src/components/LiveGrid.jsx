import React, { useEffect, useRef, useState } from 'react';
import { Eye, Activity, AlertTriangle, TrafficCone, Compass } from 'lucide-react';

export default function LiveGrid({ snapshot, currentStep }) {
  const canvasRef = useRef(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTraffic, setShowTraffic] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    const scaleX = width / 100;
    const scaleY = height / 100;

    const toCanvasX = (x) => x * scaleX;
    const toCanvasY = (y) => (100 - y) * scaleY;

    // 1. Draw Heatmap if enabled
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

    // 🚦 2. Draw TRAFFIC CONGESTION ZONES
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

        // Label
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
          ctx.strokeStyle = '#A855F7'; // Purple for rebalancing
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = v.patients.some(p => p.priority === 3) ? '#EF4444' : '#00F0FF';
          ctx.lineWidth = 1.5;
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

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ix, iy, 14 + Math.sin(Date.now() / 200) * 4, 0, Math.PI * 2);
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
        color = '#A855F7'; // 🟣 Rebalancing
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

  }, [snapshot, showHeatmap, showTraffic]);

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
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showTraffic
                ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-neon-red'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <TrafficCone className="w-3.5 h-3.5" /> Traffic Zones
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
          className="cursor-crosshair block"
        />
        
        {snapshot?.outage_active && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500 text-red-300 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-neon-red">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            QUADRANT COVERAGE OUTAGE DETECTED!
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
            <span className="w-2.5 h-2.5 rounded bg-red-500/40 border border-red-500"></span> Red Traffic Zone (50% Speed)
          </span>
        </div>
      </div>
    </div>
  );
}
