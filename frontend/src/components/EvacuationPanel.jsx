import React from "react";
import { Compass, Shield, ArrowRight, CheckCircle2, AlertOctagon, HelpCircle, ShieldAlert } from "lucide-react";

export function EvacuationPanel({ safeArea, route, isCutoff }) {
  if (isCutoff || route?.status === "NO_SAFE_ROUTE") {
    return (
      <div className="bg-purple-950/30 border border-purple-500/60 rounded-xl p-4 shadow-xl flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-purple-400">
          <AlertOctagon className="w-5 h-5 text-purple-400 animate-pulse" />
          <h3 className="text-xs font-bold tracking-wider font-mono-code uppercase">
            NO SAFE ROUTE FALLBACK PROTOCOL
          </h3>
        </div>

        <div className="bg-[#0b0c16] border border-purple-500/40 p-3.5 rounded-lg">
          <div className="flex items-center gap-2 text-purple-300 font-bold font-mono-code text-sm mb-1">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>ACTION: SHELTER IN PLACE (MANDATORY)</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            All ground transit corridors (NH-07 and Road D) are severed by active flood inundation
            or major debris flows. <strong className="text-white">Do not attempt vehicular escape.</strong>
          </p>
        </div>

        <div className="text-[11px] font-mono-code text-gray-300 bg-purple-950/20 p-2.5 rounded-lg border border-purple-900/50 flex flex-col gap-1">
          <div className="text-purple-300 font-semibold">DIRECTIVES FOR GROUND TEAMS:</div>
          <div>• Move residents immediately to top floors of reinforced concrete multi-story structures.</div>
          <div>• Prepare rooftop visual beacons for SDRF/IAF aerial extraction.</div>
          <div>• Conserve clean drinking water; switch transceivers to channel VHF 156.8 MHz.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono-code text-white">
            AUTONOMOUS EVACUATION ROUTE
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono-code border border-emerald-800">
          STATUS: RECOMMENDED
        </span>
      </div>

      {/* Candidate Safe Area Header */}
      <div className="bg-[#070a13] border border-slate-800 p-3 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-white font-mono-code">
              {safeArea?.name || "Demo Safe Area A (Gopeshwar High Complex)"}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono-code text-[11px] font-bold">
            SCORE: 0.91
          </div>
        </div>

        {/* Mandatory Hackathon Prototype Labeling */}
        <div className="text-[10px] bg-amber-950/40 border border-amber-800/40 text-amber-300/90 px-2.5 py-1 rounded font-mono-code flex items-center gap-1.5">
          <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Label: Candidate Safe Area — Demo Prototype (Not Officially Verified)</span>
        </div>

        {/* 5-Criteria Multi-Objective Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono-code text-gray-300">
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
            <span className="text-gray-500 block">HAZARD (30%)</span>
            <span className="text-emerald-400 font-semibold">100% Clear</span>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
            <span className="text-gray-500 block">TERRAIN (25%)</span>
            <span className="text-emerald-400 font-semibold">High Ridge</span>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
            <span className="text-gray-500 block">ROAD (20%)</span>
            <span className="text-emerald-400 font-semibold">Paved Arterial</span>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
            <span className="text-gray-500 block">DIST (15%)</span>
            <span className="text-white font-semibold">4.8 km</span>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
            <span className="text-gray-500 block">CAP (10%)</span>
            <span className="text-white font-semibold">1,200 Cap</span>
          </div>
        </div>
      </div>

      {/* Recommended Route Details */}
      <div className="bg-[#070a13] border border-slate-800 p-3 rounded-xl flex flex-col gap-2 font-mono-code">
        <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
          <span className="text-gray-400">ASSIGNED CORRIDOR:</span>
          <span className="text-cyan-400 font-bold">ROUTE_001 (NH-07 Bypass)</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-gray-500 text-[10px] block">TOTAL DISTANCE</span>
            <span className="text-white font-extrabold text-sm">{route?.distance_km ?? 4.8} km</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-gray-500 text-[10px] block">ESTIMATED TRANSIT</span>
            <span className="text-emerald-400 font-extrabold text-sm">{route?.estimated_time_minutes ?? 14} min</span>
          </div>
        </div>

        {/* Avoids List */}
        <div className="text-[10px] text-gray-300 mt-1 flex flex-col gap-1">
          <div className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>ALGORITHM EXCLUSIONS CONFIRMED:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-gray-300 border border-slate-700">
              Avoids Alaknanda Flood Polygon
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-gray-300 border border-slate-700">
              Avoids Landslide Escarpment
            </span>
            <span className="px-1.5 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/50">
              Bypasses Severed Road D
            </span>
          </div>
        </div>

        {/* Assumptions */}
        <div className="text-[9px] text-gray-400 italic pt-1 border-t border-slate-800/60">
          * Assumptions: Road network assumed passable unless marked blocked. Travel time under emergency escort.
        </div>
      </div>
    </div>
  );
}
