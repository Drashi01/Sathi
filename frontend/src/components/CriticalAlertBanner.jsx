import React from 'react';
import { AlertOctagon, Siren, Radio, ShieldAlert } from 'lucide-react';

export default function CriticalAlertBanner({ snapshot }) {
  if (!snapshot || !snapshot.is_critical_broadcast) return null;

  const inc = snapshot.broadcast_incident;

  return (
    <div className="w-full bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-y-2 border-red-500 text-white px-6 py-3 shadow-2xl animate-pulse-red flex items-center justify-between z-30 font-mono">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center animate-ping">
          <Siren className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest text-red-100 uppercase">
              🚨 CRITICAL EMERGENCY DETECTED – PRIORITY RESPONSE MODE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500 text-slate-950 uppercase">
              P3 EXCLUSIVE LOCK
            </span>
          </div>
          <p className="text-xs text-red-200 font-sans">
            High-priority incident detected. Quadrant coverage constraints temporarily overridden for critical emergency dispatch.
          </p>
        </div>
      </div>

      {inc && (
        <div className="hidden md:flex items-center gap-4 bg-black/40 px-3 py-1.5 rounded-xl border border-red-500/40 text-xs">
          <div>
            <span className="text-red-400 font-bold">INCIDENT:</span> {inc.id}
          </div>
          <div>
            <span className="text-red-400 font-bold">LOC:</span> ({inc.x}, {inc.y})
          </div>
          <div>
            <span className="text-red-400 font-bold">QUAD:</span> Q{inc.quadrant}
          </div>
        </div>
      )}
    </div>
  );
}
