import React from "react";
import { ShieldCheck, MapPin, Users, Zap, HeartPulse, Droplets, Radio, ArrowRight, HelpCircle, AlertTriangle } from "lucide-react";

export function SheltersView({ onSelectRoute }) {
  const shelters = [
    {
      id: "SAFE_001",
      name: "Gopeshwar Safe Community Complex",
      tag: "Primary Evacuation Hub",
      isPrimary: true,
      elevation: "1,550 m (High Stable Ridge)",
      capacity: 1200,
      available: 1200,
      score: "91%",
      distance: "4.8 km via NH-07 Bypass",
      time: "14 min transit",
      status: "Safe & Ready",
      amenities: [
        { icon: Zap, text: "Backup Generators & Solar" },
        { icon: HeartPulse, text: "Medical Triage Station" },
        { icon: Droplets, text: "Clean Drinking Water Tank" },
        { icon: Radio, text: "Emergency VHF Radio Uplink" },
      ],
      safetyNotes: "Completely outside all modeled river inundation corridors and debris flow zones.",
    },
    {
      id: "SAFE_002",
      name: "Pipalkoti Upper Terrace Center",
      tag: "Secondary Standby Hub",
      isPrimary: false,
      elevation: "1,380 m (Terraced Plateau)",
      capacity: 800,
      available: 800,
      score: "72%",
      distance: "8.4 km via North Link",
      time: "26 min transit",
      status: "Standby Only",
      amenities: [
        { icon: Zap, text: "Standard Grid Power" },
        { icon: HeartPulse, text: "First Aid Kit on site" },
        { icon: Droplets, text: "Municipal Water Supply" },
      ],
      safetyNotes: "Safe from flooding, but situated within 300 meters of a monitored slope margin. Use only if Primary Hub is full.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-[#0e1526]/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Designated Emergency Shelters & Safe Havens</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Verified high-ground facilities located outside active flood channels and away from landslide risk zones.
            </p>
          </div>
        </div>

        {/* Prototype Credibility Label */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-gray-400">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Safety Standards Notice:</strong> Safe areas are evaluated objectively using terrain elevation, road connectivity, and spatial hazard buffer zones.
          </span>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shelters.map((s) => (
          <div
            key={s.id}
            className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
              s.isPrimary
                ? "bg-[#0c1424] border-emerald-500/40 shadow-xl shadow-emerald-950/20"
                : "bg-[#0b0f19] border-slate-800"
            }`}
          >
            <div>
              {/* Top Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  s.isPrimary
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-slate-800 text-gray-300 border-slate-700"
                }`}>
                  {s.tag}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  Safety Rating: {s.score}
                </div>
              </div>

              {/* Title & Elevation */}
              <h3 className="text-lg font-bold text-white mb-1">{s.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Elevation: {s.elevation}</span>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 mb-4 text-center">
                <div>
                  <span className="text-[10px] text-gray-400 block">CAPACITY</span>
                  <span className="text-sm font-extrabold text-white">{s.capacity}</span>
                  <span className="text-[10px] text-gray-400 block">citizens</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">ROAD DISTANCE</span>
                  <span className="text-sm font-extrabold text-cyan-300">{s.distance.split(" ")[0]} km</span>
                  <span className="text-[10px] text-gray-400 block">paved</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">ESTIMATED TIME</span>
                  <span className="text-sm font-extrabold text-emerald-400">{s.time.split(" ")[0]} min</span>
                  <span className="text-[10px] text-gray-400 block">escorted</span>
                </div>
              </div>

              {/* Amenities List */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-gray-300 block mb-2">
                  Emergency Facilities on Site:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {s.amenities.map((a, i) => {
                    const AIcon = a.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                        <AIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{a.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safety Notes */}
              <p className="text-xs text-gray-400 bg-black/20 p-2.5 rounded-lg border border-white/5 leading-relaxed mb-4">
                {s.safetyNotes}
              </p>
            </div>

            {/* Action CTA */}
            {s.isPrimary ? (
              <button
                onClick={onSelectRoute}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                <span>Navigate to Shelter via Safe Route 001</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 text-xs font-semibold text-center">
                Standby Facility (Secondary Option)
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transparent Evaluation Criteria Box */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-2">How Shelter Safety Scores Are Calculated</h3>
        <p className="text-xs text-gray-400 mb-3">
          To ensure total transparency, shelters are rated using five strict safety criteria:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block text-sm">30%</span>
            <span className="text-gray-300 font-medium">Hazard Clearance</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Outside flood & debris</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block text-sm">25%</span>
            <span className="text-gray-300 font-medium">Terrain Stability</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">High mountain ridge</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block text-sm">20%</span>
            <span className="text-gray-300 font-medium">Road Accessibility</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Paved 2-lane roads</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block text-sm">15%</span>
            <span className="text-gray-300 font-medium">Proximity</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Quick transit time</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-bold block text-sm">10%</span>
            <span className="text-gray-300 font-medium">Capacity</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Adequate room & food</span>
          </div>
        </div>
      </div>
    </div>
  );
}
