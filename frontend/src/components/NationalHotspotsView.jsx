import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Globe, ArrowRight, ShieldCheck, MapPin, Radio, Compass } from "lucide-react";

export function NationalHotspotsView({ hotspots, summary, onDrillDown }) {
  const indiaCenter = [22.5937, 78.9629];

  const getStatusBadge = (status) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-500/15 text-red-300 border-red-500/30 font-bold";
      case "WARNING":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold";
      case "WATCH":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30 font-bold";
      default:
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#0e1526]/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">National Multi-Hazard Surveillance</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Macro-level monitoring across high-vulnerability mountain and river corridors in India.
            </p>
          </div>
        </div>

        {/* Drill-down CTA */}
        <button
          onClick={() => onDrillDown("CHAMOLI_001")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 transition cursor-pointer whitespace-nowrap"
        >
          <span>Open Chamoli District View</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: India Map + Region Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* National Map (7 cols) */}
        <div className="lg:col-span-7 bg-[#07090e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative h-[480px]">
          <div className="absolute top-3 left-3 z-[1000] bg-[#070a13]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-gray-200">
            India Disaster Hotspots
          </div>

          <MapContainer
            center={indiaCenter}
            zoom={5}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={12}
            />

            {hotspots?.features?.map((feat, idx) => {
              const [lon, lat] = feat.geometry.coordinates;
              const isCrit = feat.properties.status === "CRITICAL";
              return (
                <CircleMarker
                  key={idx}
                  center={[lat, lon]}
                  radius={isCrit ? 12 : 8}
                  pathOptions={{
                    color: isCrit ? "#ef4444" : "#38bdf8",
                    fillColor: isCrit ? "#ef4444" : "#38bdf8",
                    fillOpacity: 0.65,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => {
                      if (feat.properties.has_tactical_data) {
                        onDrillDown(feat.properties.id);
                      }
                    },
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1 font-sans">
                      <strong className="text-slate-900 block text-sm">{feat.properties.name}</strong>
                      <span className="text-slate-600">{feat.properties.state}</span>
                      <div className="mt-1 text-blue-700 font-semibold">{feat.properties.hazard_type}</div>
                      <div className="text-slate-700">Rainfall: {feat.properties.active_rainfall_mm} mm/h</div>
                      {feat.properties.has_tactical_data && (
                        <button
                          onClick={() => onDrillDown(feat.properties.id)}
                          className="mt-2 w-full py-1.5 bg-blue-600 text-white rounded font-bold text-[11px]"
                        >
                          View District Map &rarr;
                        </button>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Region List (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white">Monitored Basins Registry</h2>
              <span className="text-xs text-gray-400">6 High-Risk Zones</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {hotspots?.features?.map((feat, idx) => {
                const p = feat.properties;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="text-[11px] text-gray-400">({p.state})</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {p.hazard_type} • <span className="text-cyan-300 font-medium">{p.active_rainfall_mm} mm/h</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                      {p.has_tactical_data && (
                        <button
                          onClick={() => onDrillDown(p.id)}
                          title="Open Detailed District View"
                          className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-slate-800 leading-relaxed">
            Clicking <strong>Chamoli</strong> provides village-level elevation modeling, safe shelter locations, and automated evacuation routing.
          </p>
        </div>

      </div>
    </div>
  );
}
