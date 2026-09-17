import React from "react";
import { MapView } from "../components/MapView";
import { Waves, Mountain, Droplets, ArrowRight, ShieldCheck, Clock, MapPin, Compass } from "lucide-react";

export function OverviewView({ layers, riskData, weatherData, selectedLocation, setSelectedLocation, onNavigateTab }) {
  const hazards = riskData?.hazards;
  const floodPct = Math.round((hazards?.flood_probability ?? 0.24) * 100);
  const landPct = Math.round((hazards?.landslide_probability ?? 0.18) * 100);
  const isHighRisk = floodPct >= 70 || landPct >= 70;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left (7 Cols): Interactive Emergency Map */}
      <div className="lg:col-span-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Chamoli Valley Live Situation Map
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            Click on settlements or shelters on the map for details
          </span>
        </div>

        <MapView
          layers={layers}
          onSelectLocation={(id) => setSelectedLocation(id)}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Right (4 Cols): Clear, Minimal Risk Telemetry & Quick Action Cards */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Risk Overview Card */}
        <div className="bg-[#0e1526]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Current Threat Assessment</h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              isHighRisk 
                ? "bg-red-500/15 text-red-400 border-red-500/30" 
                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            }`}>
              {isHighRisk ? "Action Urged" : "Monitored"}
            </span>
          </div>

          {/* Clean Percentage Meters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
                <Waves className="w-4 h-4" />
                <span>Flash Flood</span>
              </div>
              <span className={`text-2xl font-black ${floodPct >= 70 ? "text-red-400" : floodPct >= 40 ? "text-amber-400" : "text-emerald-400"}`}>
                {floodPct}%
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5 font-medium">
                {floodPct >= 70 ? "Critical Level" : floodPct >= 40 ? "Elevated" : "Low Risk"}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                <Mountain className="w-4 h-4" />
                <span>Landslide</span>
              </div>
              <span className={`text-2xl font-black ${landPct >= 70 ? "text-amber-400" : landPct >= 40 ? "text-yellow-400" : "text-emerald-400"}`}>
                {landPct}%
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5 font-medium">
                {landPct >= 70 ? "High Debris Risk" : landPct >= 40 ? "Moderate" : "Stable Slope"}
              </span>
            </div>
          </div>

          {/* Expected Window */}
          <div className="flex items-center justify-between text-xs bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 text-gray-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Response Window:</span>
            </div>
            <span className="font-bold text-white">1 to 3 Hours</span>
          </div>

          {/* Weather telemetry pill grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-gray-400 text-[10px] block">Current Rain</span>
              <span className="font-bold text-white">{weatherData?.rainfall_1h_mm ?? 85} mm/h</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-gray-400 text-[10px] block">24h Cumulative</span>
              <span className="font-bold text-white">{weatherData?.rainfall_24h_mm ?? 240} mm</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-gray-400 text-[10px] block">Soil Saturation</span>
              <span className="font-bold text-cyan-400">
                {Math.round((weatherData?.soil_moisture_saturation ?? 0.88) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          {/* Safe Shelters shortcut */}
          <button
            onClick={() => onNavigateTab("shelters")}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                  Safe Shelters & Relief Centers
                </div>
                <div className="text-[11px] text-gray-400">
                  Gopeshwar High Ground • 1,200 Capacity
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
          </button>

          {/* Evacuation Routes shortcut */}
          <button
            onClick={() => onNavigateTab("routes")}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                  Safe Evacuation Route 001
                </div>
                <div className="text-[11px] text-gray-400">
                  NH-07 Bypass Open • 14 min transit
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
          </button>
        </div>

      </div>
    </div>
  );
}
