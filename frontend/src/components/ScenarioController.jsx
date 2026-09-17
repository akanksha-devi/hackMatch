import React from "react";
import { Sun, CloudRain, AlertTriangle, ShieldAlert, X, SlidersHorizontal } from "lucide-react";

export function ScenarioController({ currentMode, rainfall1h, onSelectScenario, onSliderChange, onClose }) {
  const presets = [
    {
      id: "NORMAL",
      title: "Normal Weather",
      subtitle: "Clear conditions • Roads open",
      icon: Sun,
      color: "emerald",
    },
    {
      id: "WATCH",
      title: "Monsoon Watch",
      subtitle: "22 mm/hr • River rising",
      icon: CloudRain,
      color: "blue",
    },
    {
      id: "CRITICAL",
      title: "Severe Cloudburst",
      subtitle: "85 mm/hr • Active evacuation",
      icon: AlertTriangle,
      color: "red",
    },
    {
      id: "CUTOFF",
      title: "Road Blockage Drill",
      subtitle: "Passes blocked • Shelter in place",
      icon: ShieldAlert,
      color: "purple",
    },
  ];

  return (
    <div className="w-full bg-[#0d1424]/95 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl mb-5 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Weather Simulation & Preparedness Drill</h3>
            <p className="text-xs text-gray-400">
              Select a weather scenario or adjust rainfall to see how risk levels, shelters, and routes respond in real time.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Scenario preset cards */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {presets.map((p) => {
            const Icon = p.icon;
            const isSelected = currentMode === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectScenario(p.id)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
                    : "bg-slate-900/60 border-slate-800 text-gray-300 hover:bg-slate-800/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-300" : "text-gray-400"}`} />
                  <span>{p.title}</span>
                </div>
                <span className="text-[11px] text-gray-400 leading-tight">{p.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Live Rainfall Slider */}
        <div className="md:col-span-4 bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Custom Rainfall:</span>
            <span className="text-cyan-300 font-bold text-sm">{rainfall1h} mm / hr</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={rainfall1h}
            onChange={(e) => onSliderChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>0 mm (Dry)</span>
            <span>50 mm (Heavy)</span>
            <span>120 mm (Cloudburst)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
