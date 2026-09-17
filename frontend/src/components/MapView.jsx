import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polyline, Polygon } from "react-leaflet";
import L from "leaflet";
import { Layers, Eye, EyeOff, Navigation, Shield, AlertTriangle } from "lucide-react";

// Fix standard Leaflet icon paths in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom futuristic HTML marker pins
const createCustomIcon = (bgColor, borderColor, text) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background-color: ${bgColor};
        border: 2px solid ${borderColor};
        color: white;
        border-radius: 8px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 10px;
        font-weight: bold;
        box-shadow: 0 0 10px ${borderColor};
        white-space: nowrap;
      ">
        ${text}
      </div>
    `,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
  });
};

export function MapView({ layers, onSelectLocation, selectedLocation }) {
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showSettlements, setShowSettlements] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRoute, setShowRoute] = useState(true);

  const center = [30.385, 79.325]; // Chamoli / Alaknanda Valley

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-cyan-500/20 shadow-2xl bg-[#07090e]">
      {/* Clean Map Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] bg-[#070a13]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl text-xs">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-2.5 pb-1.5 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5" />
          <span>MAP LAYERS</span>
        </div>
        <div className="flex flex-col gap-2 text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showHazardZones}
              onChange={(e) => setShowHazardZones(e.target.checked)}
              className="accent-red-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Danger Zones (Flood / Slide)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRivers}
              onChange={(e) => setShowRivers(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> River Corridors
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRoads}
              onChange={(e) => setShowRoads(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Roads (Open / Blocked)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showSettlements}
              onChange={(e) => setShowSettlements(e.target.checked)}
              className="accent-purple-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Villages & Towns
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safe Shelters
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRoute}
              onChange={(e) => setShowRoute(e.target.checked)}
              className="accent-emerald-400 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /> Safe Evacuation Route
            </span>
          </label>
        </div>
      </div>

      {/* Map Location Tag */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#070a13]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-gray-300 font-medium">
        Chamoli District, Uttarakhand • Interactive View
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* 1. Rivers */}
        {showRivers && layers?.rivers?.features?.map((feat, idx) => {
          const coords = feat.geometry.coordinates.map((c) => [c[1], c[0]]);
          return (
            <Polyline
              key={`river-${idx}`}
              positions={coords}
              pathOptions={{
                color: "#38bdf8",
                weight: feat.properties.type === "major_river" ? 4 : 2,
                opacity: 0.85,
                dashArray: "6, 4"
              }}
            >
              <Popup className="tactical-popup">
                <div className="font-mono-code text-xs">
                  <div className="font-bold text-sky-400">{feat.properties.name}</div>
                  <div className="text-gray-300">{feat.properties.water_level}</div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 2. Roads */}
        {showRoads && layers?.roads?.features?.map((feat, idx) => {
          const coords = feat.geometry.coordinates.map((c) => [c[1], c[0]]);
          const isBlocked = feat.properties.status === "BLOCKED_HAZARD";
          return (
            <Polyline
              key={`road-${idx}`}
              positions={coords}
              pathOptions={{
                color: isBlocked ? "#ef4444" : "#94a3b8",
                weight: 3,
                dashArray: isBlocked ? "5, 5" : undefined,
                opacity: 0.8
              }}
            >
              <Popup>
                <div className="font-mono-code text-xs">
                  <div className="font-bold">{feat.properties.name}</div>
                  <div className={isBlocked ? "text-red-400 font-bold" : "text-emerald-400"}>
                    {feat.properties.condition}
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 3. Hazard Polygons */}
        {showHazardZones && layers?.risk_zones?.features?.map((feat, idx) => {
          const coords = feat.geometry.coordinates[0].map((c) => [c[1], c[0]]);
          const isFlood = feat.properties.hazard === "FLOOD";
          return (
            <Polygon
              key={`hazard-${idx}`}
              positions={coords}
              pathOptions={{
                color: isFlood ? "#ef4444" : "#f59e0b",
                fillColor: isFlood ? "#ef4444" : "#f59e0b",
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div className="font-mono-code text-xs">
                  <div className="font-bold text-red-400 uppercase">
                    ⚠️ {feat.properties.hazard} RISK ENVELOPE
                  </div>
                  <div className="text-gray-300">{feat.properties.description}</div>
                  <div className="text-amber-300 text-[10px] mt-1">Lead Time: {feat.properties.lead_time}</div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 4. Settlements */}
        {showSettlements && layers?.settlements?.features?.map((feat, idx) => {
          const [lon, lat] = feat.geometry.coordinates;
          const isZoneA = feat.properties.id === "SETTLE_001";
          const icon = createCustomIcon(
            isZoneA ? "#ef4444" : "#1e293b",
            isZoneA ? "#dc2626" : "#475569",
            feat.properties.name.split(" ")[0]
          );
          return (
            <Marker
              key={`settle-${idx}`}
              position={[lat, lon]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectLocation && onSelectLocation(feat.properties.id),
              }}
            >
              <Popup>
                <div className="font-mono-code text-xs">
                  <div className="font-bold text-white">{feat.properties.name}</div>
                  <div>Population: {feat.properties.population.toLocaleString()}</div>
                  <div>Elevation: {feat.properties.elevation_m}m</div>
                  <div className={isZoneA ? "text-red-400 font-bold" : "text-gray-400"}>
                    Status: {feat.properties.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 5. Safe Shelters */}
        {showShelters && layers?.shelters?.features?.map((feat, idx) => {
          const [lon, lat] = feat.geometry.coordinates;
          const icon = createCustomIcon(
            "#065f46",
            "#10b981",
            "SAFE SHELTER A"
          );
          return (
            <Marker
              key={`shelter-${idx}`}
              position={[lat, lon]}
              icon={icon}
            >
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-emerald-600 text-sm">
                    🛡️ {feat.properties.name}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    Safe High-Ground Facility
                  </div>
                  <div className="text-slate-800 mt-1 font-medium">Capacity: {feat.properties.capacity} people</div>
                  <div className="text-emerald-700 font-bold">Safety Rating: {Math.round(feat.properties.score * 100)}%</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 6. Recommended Evacuation Route */}
        {showRoute && layers?.route?.features?.map((feat, idx) => {
          const coords = feat.geometry.coordinates.map((c) => [c[1], c[0]]);
          return (
            <Polyline
              key={`route-${idx}`}
              positions={coords}
              pathOptions={{
                color: "#10b981",
                weight: 5,
                opacity: 0.95,
              }}
            >
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-emerald-700 text-sm">
                    Recommended Safe Route 001
                  </div>
                  <div className="text-slate-700 mt-1">Distance: {feat.properties.distance_km} km</div>
                  <div className="text-slate-700">Transit Time: {feat.properties.estimated_time_minutes} minutes</div>
                  <div className="text-emerald-600 text-[11px] mt-1 font-semibold">
                    ✓ Avoids river surge & landslide debris
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>
    </div>
  );
}
