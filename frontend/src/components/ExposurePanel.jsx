import React from "react";
import { Users, Navigation, Landmark, Building, MapPin, AlertCircle } from "lucide-react";

export function ExposurePanel({ exposure }) {
  const pop = exposure?.population ?? 8420;
  const roadsKm = exposure?.roads_km ?? 11.4;
  const bridges = exposure?.bridges ?? 2;
  const settlements = exposure?.settlements ?? 3;

  return (
    <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono-code text-white">
            SPATIAL EXPOSURE & IMPACT
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono-code border border-amber-800">
          ZONE A: ALAKNANDA BASIN
        </span>
      </div>

      {/* Impact Metric Cards */}
      <div className="grid grid-cols-2 gap-2 font-mono-code">
        {/* Population */}
        <div className="bg-[#070a13] border border-slate-800/90 p-2.5 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-gray-400 text-[10px]">POPULATION EXPOSED</div>
            <div className="text-base font-extrabold text-white">{pop.toLocaleString()}</div>
          </div>
        </div>

        {/* Severed Roads */}
        <div className="bg-[#070a13] border border-slate-800/90 p-2.5 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center">
            <Navigation className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-gray-400 text-[10px]">ROADS SEVERED</div>
            <div className="text-base font-extrabold text-white">{roadsKm} km</div>
          </div>
        </div>

        {/* Bridges Impacted */}
        <div className="bg-[#070a13] border border-slate-800/90 p-2.5 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center">
            <Landmark className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-gray-400 text-[10px]">BRIDGES COMPROMISED</div>
            <div className="text-base font-extrabold text-white">{bridges}</div>
          </div>
        </div>

        {/* Settlements */}
        <div className="bg-[#070a13] border border-slate-800/90 p-2.5 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-center justify-center">
            <Building className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-gray-400 text-[10px]">SETTLEMENTS CUT OFF</div>
            <div className="text-base font-extrabold text-white">{settlements} Wards</div>
          </div>
        </div>
      </div>

      {/* Exposed Zones Tags */}
      <div className="mt-1">
        <div className="text-[10px] text-gray-400 font-mono-code mb-1">INTERSECTED INUNDATION ZONES:</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] px-2 py-0.5 rounded bg-red-950/40 border border-red-800/60 text-red-300 font-mono-code">
            📍 Alaknanda Low-Lying Zone A
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 font-mono-code">
            📍 Road D Escarpment Debris
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-gray-300 font-mono-code">
            📍 Birahi River Confluence
          </span>
        </div>
      </div>
    </div>
  );
}
