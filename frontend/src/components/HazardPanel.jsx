import React from "react";
import { Waves, Mountain, Droplets, Compass, Zap, HelpCircle } from "lucide-react";

export function HazardPanel({ hazards, weather, confidence, modelVersion, leadTime }) {
  const floodProb = hazards?.flood_probability ?? 0.24;
  const landslideProb = hazards?.landslide_probability ?? 0.18;
  const floodPct = Math.round(floodProb * 100);
  const landPct = Math.round(landslideProb * 100);

  const getFloodColor = (pct) => {
    if (pct >= 75) return "text-red-400 stroke-red-500";
    if (pct >= 50) return "text-amber-400 stroke-amber-500";
    if (pct >= 30) return "text-blue-400 stroke-blue-500";
    return "text-emerald-400 stroke-emerald-500";
  };

  const getLandslideColor = (pct) => {
    if (pct >= 70) return "text-amber-400 stroke-amber-500";
    if (pct >= 45) return "text-yellow-400 stroke-yellow-500";
    return "text-emerald-400 stroke-emerald-500";
  };

  return (
    <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono-code text-white">
            AI DUAL-HAZARD INFERENCE
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono-code border border-cyan-800">
            {modelVersion || "RF-DUAL v1"}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-gray-300 font-mono-code">
            CONF: {Math.round((confidence || 0.84) * 100)}%
          </span>
        </div>
      </div>

      {/* Probability Dials */}
      <div className="grid grid-cols-2 gap-3">
        {/* Flash Flood Meter */}
        <div className="bg-[#070a13] border border-slate-800/90 rounded-xl p-3 flex flex-col items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold mb-2">
            <Waves className="w-4 h-4 text-blue-400" />
            <span>FLASH FLOOD</span>
          </div>
          
          <div className="relative flex items-center justify-center my-1">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * floodPct) / 100}
                strokeLinecap="round"
                className={`transition-all duration-700 ease-out ${getFloodColor(floodPct)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-xl font-extrabold font-mono-code ${getFloodColor(floodPct).split(" ")[0]}`}>
                {floodPct}%
              </span>
              <span className="text-[9px] text-gray-400 uppercase font-mono-code">
                {floodPct >= 75 ? "CRITICAL" : floodPct >= 50 ? "ELEVATED" : "NORMAL"}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 font-mono-code">
            Lead Time: {leadTime?.minimum_hours || 1}-{leadTime?.maximum_hours || 3} hrs
          </span>
        </div>

        {/* Landslide Meter */}
        <div className="bg-[#070a13] border border-slate-800/90 rounded-xl p-3 flex flex-col items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold mb-2">
            <Mountain className="w-4 h-4 text-amber-400" />
            <span>LANDSLIDE</span>
          </div>

          <div className="relative flex items-center justify-center my-1">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * landPct) / 100}
                strokeLinecap="round"
                className={`transition-all duration-700 ease-out ${getLandslideColor(landPct)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-xl font-extrabold font-mono-code ${getLandslideColor(landPct).split(" ")[0]}`}>
                {landPct}%
              </span>
              <span className="text-[9px] text-gray-400 uppercase font-mono-code">
                {landPct >= 70 ? "HIGH RISK" : landPct >= 40 ? "MODERATE" : "STABLE"}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 font-mono-code">
            Slope Debris Envelopes Active
          </span>
        </div>
      </div>

      {/* Hydrometeorological Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2 font-mono-code text-xs">
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
          <div className="flex items-center justify-between text-gray-400 text-[10px] mb-0.5">
            <span>1H RAIN</span>
            <Droplets className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-white font-bold">{weather?.rainfall_1h_mm ?? 85.0} mm</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
          <div className="flex items-center justify-between text-gray-400 text-[10px] mb-0.5">
            <span>3H CUMUL</span>
            <Droplets className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-white font-bold">{weather?.rainfall_3h_mm ?? 160.0} mm</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
          <div className="flex items-center justify-between text-gray-400 text-[10px] mb-0.5">
            <span>24H ACCUM</span>
            <Droplets className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-white font-bold">{weather?.rainfall_24h_mm ?? 240.0} mm</div>
        </div>
      </div>

      {/* Secondary Telemetry */}
      <div className="flex items-center justify-between text-[11px] font-mono-code bg-slate-900/40 px-3 py-2 rounded-lg border border-slate-800/80 text-gray-300">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Slope: 38.5° | Elev: 1,850m</span>
        </div>
        <div className="text-amber-400 font-semibold">
          Soil Sat: {Math.round((weather?.soil_moisture_saturation ?? 0.88) * 100)}%
        </div>
      </div>
    </div>
  );
}
