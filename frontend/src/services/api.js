import axios from "axios";
import { MOCK_NATIONAL_HOTSPOTS, MOCK_CHAMOLI_LAYERS } from "../data/mockFallback";

const API_BASE = "http://localhost:8000/api/v1";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 4000,
});

export const apiService = {
  // Scenario Control
  async getScenarioStatus() {
    try {
      const res = await client.get("/scenario/status");
      return { data: res.data, isOnline: true };
    } catch {
      return {
        data: { current_mode: "CRITICAL", rainfall_1h: 85.0, all_blocked: false },
        isOnline: false,
      };
    }
  },

  async setScenario(mode, rainfall_1h = null, all_blocked = null) {
    try {
      const res = await client.post("/scenario/set", { mode, rainfall_1h, all_blocked });
      return { data: res.data, isOnline: true };
    } catch {
      return {
        data: { status: "offline_applied", scenario: { mode, rainfall_1h: rainfall_1h || 85.0, all_blocked: all_blocked || false } },
        isOnline: false,
      };
    }
  },

  // National Hotspots
  async getNationalHotspots() {
    try {
      const res = await client.get("/national/hotspots");
      return { data: res.data, isOnline: true };
    } catch {
      return { data: MOCK_NATIONAL_HOTSPOTS, isOnline: false };
    }
  },

  async getNationalSummary() {
    try {
      const res = await client.get("/national/summary");
      return { data: res.data, isOnline: true };
    } catch {
      return {
        data: {
          active_monitored_basins: 6,
          critical_hotspots: 1,
          warning_zones: 1,
          watch_zones: 2,
          normal_zones: 2,
          primary_emergency_corridor: "Chamoli / Alaknanda Basin (UK)",
          ndma_alert_code: "RED_FLASH_FLOOD",
        },
        isOnline: false,
      };
    }
  },

  // Tactical Chamoli Risk & Exposure
  async getLocationRisk(locationId = "CHAMOLI_001") {
    try {
      const res = await client.get(`/risk/${locationId}`);
      return { data: res.data, isOnline: true };
    } catch {
      return {
        data: {
          location_id: locationId,
          timestamp: new Date().toISOString(),
          hazards: { flood_probability: 0.89, landslide_probability: 0.72 },
          risk_level: "CRITICAL",
          lead_time: { minimum_hours: 1, maximum_hours: 3 },
          exposure: { population: 8420, roads_km: 11.4, bridges: 2, settlements: 3, hospitals: 0 },
          recommended_safe_area: { id: "SAFE_001", name: "Demo Safe Area A (Gopeshwar High)", verified: false, status: "candidate_safe_area" },
          recommended_route: { id: "ROUTE_001", distance_km: 4.8, estimated_time_minutes: 14, status: "recommended" },
          recommended_action: {
            priority: "IMMEDIATE",
            message: "Evacuate residents of affected low-lying zone toward Candidate Safe Area A using Route 001. Avoid Road D due to active landslide.",
            basis: ["High flood probability (89%)", "Elevated landslide probability (72%)", "High population exposure (8,420)", "Safe area outside modeled hazard zones"]
          },
          disclaimer: "Prototype recommendation only. Follow instructions from official local disaster-management authorities during real emergencies."
        },
        isOnline: false,
      };
    }
  },

  // GIS Tactical Layers
  async getTacticalLayers(scenarioMode = "CRITICAL") {
    try {
      const [rivers, roads, settlements, shelters, riskZones, routes] = await Promise.all([
        client.get("/gis/rivers"),
        client.get("/gis/roads"),
        client.get("/gis/settlements"),
        client.get("/gis/shelters"),
        client.get("/gis/risk-zones"),
        client.get("/gis/routes"),
      ]);
      return {
        rivers: rivers.data,
        roads: roads.data,
        settlements: settlements.data,
        shelters: shelters.data,
        risk_zones: riskZones.data,
        route: routes.data,
        isOnline: true,
      };
    } catch {
      // Offline fallback
      let filteredZones = MOCK_CHAMOLI_LAYERS.hazard_zones;
      let filteredRoute = MOCK_CHAMOLI_LAYERS.route;
      let roadsData = MOCK_CHAMOLI_LAYERS.roads;

      if (scenarioMode === "NORMAL") {
        filteredZones = { type: "FeatureCollection", features: [] };
      } else if (scenarioMode === "CUTOFF") {
        filteredRoute = { type: "FeatureCollection", features: [] };
      }

      return {
        rivers: MOCK_CHAMOLI_LAYERS.rivers,
        roads: roadsData,
        settlements: MOCK_CHAMOLI_LAYERS.settlements,
        shelters: MOCK_CHAMOLI_LAYERS.shelters,
        risk_zones: filteredZones,
        route: filteredRoute,
        isOnline: false,
      };
    }
  },

  // Live Weather Telemetry
  async getWeather(locationId = "CHAMOLI_001") {
    try {
      const res = await client.get(`/weather/${locationId}`);
      return { data: res.data, isOnline: true };
    } catch {
      return {
        data: {
          location_id: locationId,
          location_name: "Chamoli Cluster, Uttarakhand",
          rainfall_1h_mm: 85.0,
          rainfall_3h_mm: 160.0,
          rainfall_24h_mm: 240.0,
          soil_moisture_saturation: 0.94,
          station_status: "LOCAL_BACKUP",
          source: "Offline Telemetry Cache"
        },
        isOnline: false,
      };
    }
  }
};
