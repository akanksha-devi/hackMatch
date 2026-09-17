import React from "react";
import { Navigation, CheckCircle2, AlertOctagon, Clock, ShieldAlert, ArrowRight, Ban, MapPin, Compass } from "lucide-react";

export function RoutesView({ isCutoff }) {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#0e1526]/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Safe Evacuation Corridors & Road Status</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Autonomous route planning that verifies every segment is clear of flood inundation and landslide debris.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Fallback: If All Routes Cutoff */}
      {isCutoff ? (
        <div className="bg-purple-950/30 border border-purple-500/60 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3 text-purple-400">
            <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-500/50">
              <AlertOctagon className="w-6 h-6 text-purple-300 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-300 tracking-wider uppercase">
                EMERGENCY CONTINGENCY PROTOCOL
              </span>
              <h2 className="text-lg font-bold text-white">No Safe Escape Route Available — Shelter in Place</h2>
            </div>
          </div>

          <div className="bg-[#0b0d18] border border-purple-500/30 p-4 rounded-xl text-gray-200 text-sm leading-relaxed">
            All ground transit passes (including NH-07 Bypass and Road D) are compromised by active inundation or massive debris flows. 
            <strong className="text-white block mt-1">Vehicular evacuation is unsafe and strictly suspended.</strong>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-purple-400 font-bold">1. Move to High Floors</span>
              <span className="text-gray-400 text-[11px]">
                Seek immediate shelter on upper floors of reinforced multi-story concrete structures.
              </span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-purple-400 font-bold">2. Conserve Clean Water</span>
              <span className="text-gray-400 text-[11px]">
                Store tap water before supply disruption; turn off main gas and electrical switches.
              </span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-purple-400 font-bold">3. Signal for Aerial Rescue</span>
              <span className="text-gray-400 text-[11px]">
                Display bright markers or flashlights on rooftops for SDRF/IAF helicopter teams.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Recommended Corridor (8 cols) */}
          <div className="md:col-span-8 bg-[#0c1424] border border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Recommended Evacuation Path
                  </span>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  Status: Fully Open & Clear
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-1">
                Route 001: Chamoli Low-Lying Wards → NH-07 Bypass → Gopeshwar Safe Complex
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Assigned escape corridor that ascends along the stable western ridge, bypassing all riverbed floodplains.
              </p>

              {/* Transit metrics */}
              <div className="grid grid-cols-3 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center mb-5">
                <div>
                  <span className="text-[10px] text-gray-400 block">TOTAL DISTANCE</span>
                  <span className="text-base font-extrabold text-white">4.8 km</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">ESTIMATED TIME</span>
                  <span className="text-base font-extrabold text-emerald-400">14 minutes</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">SURFACE TYPE</span>
                  <span className="text-base font-extrabold text-cyan-300">Paved 2-Lane</span>
                </div>
              </div>

              {/* Step-by-Step Directions */}
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-300 block mb-2.5">
                  Turn-by-Turn Safe Transit Guide:
                </span>
                <div className="flex flex-col gap-2.5 text-xs text-gray-300">
                  <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Depart Ward A:</strong> Move east away from Alaknanda riverbank toward the elevated connector road (0.8 km).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Merge onto NH-07 Bypass:</strong> Follow police-escorted ridge lane toward Gopeshwar. Avoid lower drainage culverts (2.6 km).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Arrive at Gopeshwar Complex:</strong> Enter via Main Gate. Medical checkpost and shelter registration desks active (1.4 km).
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification checklist */}
            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Route has zero intersection with active river surge or hillside debris zones.</span>
            </div>
          </div>

          {/* Blocked Road Alert (4 cols) */}
          <div className="md:col-span-4 bg-[#140c12] border border-red-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-3">
                <Ban className="w-4 h-4 text-red-500" />
                <span>Severed Road Warning</span>
              </div>

              <h3 className="text-base font-bold text-white mb-2">
                Road D (Gorge Cut Link) is Strictly Closed
              </h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Active mudslides and falling boulders reported along the steep gorge escarpment. 
                <strong className="text-red-400 block mt-1">Do not attempt to travel via Road D under any circumstances.</strong>
              </p>

              <div className="bg-red-950/30 border border-red-800/40 p-3 rounded-xl text-xs text-red-300 flex flex-col gap-1.5">
                <div className="font-semibold">Hazard Summary:</div>
                <div className="text-[11px] text-gray-300">• 2.4 km road stretch covered in debris</div>
                <div className="text-[11px] text-gray-300">• High risk of secondary rockfall</div>
                <div className="text-[11px] text-gray-300">• Emergency road clearing crews staged</div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 italic pt-4 border-t border-slate-800">
              * Travel time estimates assume convoy escort under normal emergency conditions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
