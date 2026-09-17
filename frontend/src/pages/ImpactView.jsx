import React from "react";
import { Users, Navigation, Landmark, Building2, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";

export function ImpactView({ exposure }) {
  const pop = exposure?.population ?? 8420;
  const roadsKm = exposure?.roads_km ?? 11.4;
  const bridges = exposure?.bridges ?? 2;
  const settlements = exposure?.settlements ?? 3;

  const wards = [
    {
      id: "SETTLE_001",
      name: "Chamoli Low-Lying Riverside (Zone A)",
      population: 8420,
      elevation: "1,050 m",
      status: "Immediate Evacuation",
      statusColor: "bg-red-500/15 text-red-300 border-red-500/30",
      threat: "Alaknanda flash surge buffer (within 50m of river channel)",
      recommendation: "Move all families immediately to Gopeshwar High Shelter.",
    },
    {
      id: "SETTLE_002",
      name: "Birahi River Confluence Village",
      population: 1850,
      elevation: "1,120 m",
      status: "Warning Stage",
      statusColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      threat: "Tributary backflow and culvert overflow",
      recommendation: "Stage emergency kits; prepare elderly for assisted transit.",
    },
    {
      id: "SETTLE_003",
      name: "Pipalkoti Central Valley Ward",
      population: 4200,
      elevation: "1,340 m",
      status: "Watch Active",
      statusColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      threat: "Surface runoff and minor road waterlogging",
      recommendation: "Remain alert; stay off hillside footpaths.",
    },
    {
      id: "SETTLE_004",
      name: "Gopeshwar Upper Township",
      population: 21400,
      elevation: "1,550 m",
      status: "Safe High Ground",
      statusColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      threat: "No direct flood or landslide threat",
      recommendation: "Operational evacuation receiving center active.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-[#0e1526]/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Community Impact & Exposure Assessment</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Real-time monitoring of riverside wards, resident populations, and essential mountain infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b0f19] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Population at Risk</span>
            <span className="text-2xl font-black text-white">{pop.toLocaleString()}</span>
            <span className="text-[11px] text-red-400 block mt-0.5">In low-lying buffer</span>
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Roads Monitored</span>
            <span className="text-2xl font-black text-white">{roadsKm} km</span>
            <span className="text-[11px] text-amber-400 block mt-0.5">Corridors checked</span>
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Bridges on Watch</span>
            <span className="text-2xl font-black text-white">{bridges}</span>
            <span className="text-[11px] text-cyan-400 block mt-0.5">Clearance monitored</span>
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Affected Wards</span>
            <span className="text-2xl font-black text-white">{settlements}</span>
            <span className="text-[11px] text-purple-400 block mt-0.5">Under live advisory</span>
          </div>
        </div>
      </div>

      {/* Ward-by-Ward Community Status */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4">
          Settlements & Community Risk Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wards.map((w) => (
            <div
              key={w.id}
              className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-white text-sm">{w.name}</h3>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${w.statusColor}`}>
                    {w.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span>Population: <strong className="text-white">{w.population.toLocaleString()}</strong></span>
                  <span>Elevation: <strong className="text-white">{w.elevation}</strong></span>
                </div>

                <p className="text-xs text-gray-300 bg-black/20 p-2.5 rounded-lg border border-white/5 mb-3 leading-relaxed">
                  <strong className="text-gray-400 block mb-0.5">Threat Factor:</strong>
                  {w.threat}
                </p>
              </div>

              <div className="text-xs text-cyan-300 bg-cyan-950/20 border border-cyan-900/30 p-2 rounded-lg">
                <strong>Action:</strong> {w.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
