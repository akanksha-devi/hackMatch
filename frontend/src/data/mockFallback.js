/**
 * Bundled offline fallback datasets.
 * Ensures zero-failure presentation when presenting off-grid.
 */

export const MOCK_NATIONAL_HOTSPOTS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "CHAMOLI_UK",
        name: "Chamoli & Alaknanda Basin",
        state: "Uttarakhand",
        hazard_type: "Flash Flood & Landslide",
        status: "CRITICAL",
        active_rainfall_mm: 85.0,
        risk_score: 0.89,
        lead_time: "1-3 Hours",
        has_tactical_data: true
      },
      geometry: { type: "Point", coordinates: [79.3150, 30.3750] }
    },
    {
      type: "Feature",
      properties: {
        id: "RUDRAPRAYAG_UK",
        name: "Rudraprayag / Mandakini",
        state: "Uttarakhand",
        hazard_type: "Landslide Watch",
        status: "WARNING",
        active_rainfall_mm: 42.0,
        risk_score: 0.68,
        lead_time: "4-6 Hours",
        has_tactical_data: false
      },
      geometry: { type: "Point", coordinates: [78.9800, 30.2850] }
    },
    {
      type: "Feature",
      properties: {
        id: "WAYANAD_KL",
        name: "Meppadi / Chooralmala Basin",
        state: "Kerala",
        hazard_type: "Debris Flow / Landslide",
        status: "WATCH",
        active_rainfall_mm: 35.0,
        risk_score: 0.54,
        lead_time: "6-12 Hours",
        has_tactical_data: false
      },
      geometry: { type: "Point", coordinates: [76.1300, 11.5500] }
    },
    {
      type: "Feature",
      properties: {
        id: "KULLU_HP",
        name: "Kullu & Beas River Corridor",
        state: "Himachal Pradesh",
        hazard_type: "Flash Flood Watch",
        status: "WATCH",
        active_rainfall_mm: 28.0,
        risk_score: 0.45,
        lead_time: "8-12 Hours",
        has_tactical_data: false
      },
      geometry: { type: "Point", coordinates: [77.1095, 31.9579] }
    },
    {
      type: "Feature",
      properties: {
        id: "TEESTA_SK",
        name: "Teesta Basin / Mangan",
        state: "Sikkim",
        hazard_type: "GLOF & Flash Flood",
        status: "NORMAL",
        active_rainfall_mm: 12.0,
        risk_score: 0.22,
        lead_time: "N/A",
        has_tactical_data: false
      },
      geometry: { type: "Point", coordinates: [88.5200, 27.5000] }
    },
    {
      type: "Feature",
      properties: {
        id: "BARPETA_AS",
        name: "Brahmaputra Lower Basin",
        state: "Assam",
        hazard_type: "Riverine Flood",
        status: "NORMAL",
        active_rainfall_mm: 18.0,
        risk_score: 0.31,
        lead_time: "24-48 Hours",
        has_tactical_data: false
      },
      geometry: { type: "Point", coordinates: [91.0000, 26.3200] }
    }
  ]
};

export const MOCK_CHAMOLI_LAYERS = {
  rivers: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Alaknanda River Corridor", type: "major_river", water_level: "+3.4m ABOVE DANGER MARK" },
        geometry: {
          type: "LineString",
          coordinates: [
            [79.5600, 30.5600],
            [79.4800, 30.4900],
            [79.4000, 30.4300],
            [79.3500, 30.4000],
            [79.3150, 30.3750],
            [79.2800, 30.3400],
            [79.2200, 30.2900]
          ]
        }
      },
      {
        type: "Feature",
        properties: { name: "Birahi Ganga", type: "tributary", water_level: "+1.2m SURGE" },
        geometry: {
          type: "LineString",
          coordinates: [
            [79.4100, 30.4100],
            [79.3650, 30.3950],
            [79.3300, 30.3800]
          ]
        }
      }
    ]
  },
  roads: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "NH_07_SAFE", name: "NH-07 Bypass Ridge Arterial", status: "PASSABLE", condition: "Clear of modeled debris" },
        geometry: {
          type: "LineString",
          coordinates: [
            [79.3150, 30.3750],
            [79.3180, 30.3860],
            [79.3221, 30.4012]
          ]
        }
      },
      {
        type: "Feature",
        properties: { id: "ROAD_D_BLOCKED", name: "Road D (Gorge Cut Link)", status: "BLOCKED_HAZARD", condition: "Severe debris flow reported" },
        geometry: {
          type: "LineString",
          coordinates: [
            [79.3150, 30.3750],
            [79.3280, 30.3820],
            [79.3310, 30.3950],
            [79.3221, 30.4012]
          ]
        }
      }
    ]
  },
  settlements: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "SETTLE_001", name: "Chamoli Low-Lying Zone A", population: 8420, elevation_m: 1050, status: "IMMEDIATE_EVACUATION" },
        geometry: { type: "Point", coordinates: [79.3150, 30.3750] }
      },
      {
        type: "Feature",
        properties: { id: "SETTLE_002", name: "Birahi Village", population: 1850, elevation_m: 1120, status: "WARNING" },
        geometry: { type: "Point", coordinates: [79.3400, 30.3900] }
      },
      {
        type: "Feature",
        properties: { id: "SETTLE_003", name: "Pipalkoti Central", population: 4200, elevation_m: 1340, status: "WATCH" },
        geometry: { type: "Point", coordinates: [79.4200, 30.4350] }
      },
      {
        type: "Feature",
        properties: { id: "SETTLE_004", name: "Gopeshwar Township", population: 21400, elevation_m: 1550, status: "SAFE_HIGH_GROUND" },
        geometry: { type: "Point", coordinates: [79.3221, 30.4012] }
      }
    ]
  },
  shelters: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          safe_area_id: "SAFE_001",
          name: "Demo Safe Area A (Gopeshwar High Complex)",
          status: "candidate_safe_area",
          verified: false,
          outside_flood_zone: true,
          outside_landslide_zone: true,
          terrain_safety: "high",
          road_access: true,
          distance_from_affected_area_km: 3.2,
          capacity: 1200,
          score: 0.91,
          criteria_breakdown: {
            hazard_avoidance: "Pass (Outside all modeled zones)",
            terrain_safety: "High (Stable mountain ridge 1550m)",
            road_connectivity: "Two-lane paved road open",
            distance: "3.2 km direct",
            capacity: "1200 persons (medical triage ready)"
          }
        },
        geometry: { type: "Point", coordinates: [79.3221, 30.4012] }
      },
      {
        type: "Feature",
        properties: {
          safe_area_id: "SAFE_002",
          name: "Demo Safe Area B (Pipalkoti Upper Plateau)",
          status: "candidate_safe_area",
          verified: false,
          outside_flood_zone: true,
          outside_landslide_zone: false,
          terrain_safety: "medium",
          road_access: true,
          distance_from_affected_area_km: 8.4,
          capacity: 800,
          score: 0.72,
          criteria_breakdown: {
            hazard_avoidance: "Warning (Within 200m of slope failure)",
            terrain_safety: "Medium terraced slope",
            road_connectivity: "Single lane paved",
            distance: "8.4 km",
            capacity: "800 persons"
          }
        },
        geometry: { type: "Point", coordinates: [79.4250, 30.4400] }
      }
    ]
  },
  hazard_zones: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          hazard: "FLOOD",
          severity: "CRITICAL",
          lead_time: "1-3 hours",
          description: "Alaknanda Flash Flood Inundation Buffer",
          color: "#ef4444"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [79.3080, 30.3700],
            [79.3200, 30.3720],
            [79.3240, 30.3800],
            [79.3180, 30.3840],
            [79.3100, 30.3780],
            [79.3080, 30.3700]
          ]]
        }
      },
      {
        type: "Feature",
        properties: {
          hazard: "LANDSLIDE",
          severity: "HIGH",
          lead_time: "Active Debris",
          description: "Road D Escarpment Slope Failure Envelope",
          color: "#f59e0b"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [79.3240, 30.3800],
            [79.3350, 30.3810],
            [79.3360, 30.3920],
            [79.3270, 30.3900],
            [79.3240, 30.3800]
          ]]
        }
      }
    ]
  },
  route: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          route_id: "ROUTE_001",
          safe_area_id: "SAFE_001",
          distance_km: 4.8,
          estimated_time_minutes: 14,
          status: "recommended",
          avoids: ["flood_zone", "landslide_zone", "blocked_road"],
          assumptions: [
            "Road network is assumed passable unless marked blocked",
            "Travel time is estimated under escorted convoy speed"
          ]
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [79.3150, 30.3750],
            [79.3180, 30.3860],
            [79.3221, 30.4012]
          ]
        }
      }
    ]
  }
};
