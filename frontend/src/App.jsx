import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ScenarioController } from "./components/ScenarioController";
import { AlertBanner } from "./components/AlertBanner";
import { OverviewView } from "./pages/OverviewView";
import { SheltersView } from "./pages/SheltersView";
import { RoutesView } from "./pages/RoutesView";
import { ImpactView } from "./pages/ImpactView";
import { NationalHotspotsView } from "./components/NationalHotspotsView";
import { apiService } from "./services/api";
import { Phone, Shield, ExternalLink } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'shelters', 'routes', 'impact', 'national'
  const [showSimulator, setShowSimulator] = useState(false);
  const [scenarioMode, setScenarioMode] = useState("CRITICAL");
  const [rainfall1h, setRainfall1h] = useState(85.0);
  const [isOnline, setIsOnline] = useState(true);

  // Data states
  const [riskData, setRiskData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [layers, setLayers] = useState(null);
  const [nationalHotspots, setNationalHotspots] = useState(null);
  const [nationalSummary, setNationalSummary] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("CHAMOLI_001");

  // Initial Data Load
  const refreshAllData = async (mode = scenarioMode) => {
    const [riskRes, weatherRes, layersRes, hotspotsRes, summaryRes] = await Promise.all([
      apiService.getLocationRisk(selectedLocation),
      apiService.getWeather(selectedLocation),
      apiService.getTacticalLayers(mode),
      apiService.getNationalHotspots(),
      apiService.getNationalSummary(),
    ]);

    setRiskData(riskRes.data);
    setWeatherData(weatherRes.data);
    setLayers(layersRes);
    setNationalHotspots(hotspotsRes.data);
    setNationalSummary(summaryRes.data);
    setIsOnline(riskRes.isOnline);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handle Scenario Switch
  const handleSelectScenario = async (mode) => {
    setScenarioMode(mode);
    let rain = 85.0;
    let blocked = false;

    if (mode === "NORMAL") rain = 4.5;
    else if (mode === "WATCH") rain = 22.0;
    else if (mode === "WARNING") rain = 48.0;
    else if (mode === "CRITICAL") rain = 85.0;
    else if (mode === "CUTOFF") {
      rain = 115.0;
      blocked = true;
    }

    setRainfall1h(rain);
    await apiService.setScenario(mode, rain, blocked);
    await refreshAllData(mode);
  };

  // Handle Rainfall Slider Change
  const handleSliderChange = async (val) => {
    setRainfall1h(val);
    let derivedMode = "NORMAL";
    if (val >= 75) derivedMode = "CRITICAL";
    else if (val >= 40) derivedMode = "WARNING";
    else if (val >= 15) derivedMode = "WATCH";

    setScenarioMode(derivedMode);
    await apiService.setScenario(derivedMode, val, derivedMode === "CUTOFF");
    await refreshAllData(derivedMode);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col selection:bg-cyan-500 selection:text-black font-sans">
      {/* Clean Minimal Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        riskLevel={riskData?.risk_level || "CRITICAL"}
        showSimulator={showSimulator}
        setShowSimulator={setShowSimulator}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Collapsible Simulation / Weather Drill Bar */}
        {showSimulator && (
          <ScenarioController
            currentMode={scenarioMode}
            rainfall1h={rainfall1h}
            onSelectScenario={handleSelectScenario}
            onSliderChange={handleSliderChange}
            onClose={() => setShowSimulator(false)}
          />
        )}

        {/* Global Urgent Emergency Alert Banner (Shown in all Chamoli views) */}
        {activeTab !== "national" && (
          <AlertBanner
            action={riskData?.recommended_action}
            riskLevel={riskData?.risk_level || "CRITICAL"}
            onNavigateToShelter={() => setActiveTab("shelters")}
          />
        )}

        {/* Dedicated Clean Views */}
        {activeTab === "overview" && (
          <OverviewView
            layers={layers}
            riskData={riskData}
            weatherData={weatherData}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "shelters" && (
          <SheltersView onSelectRoute={() => setActiveTab("routes")} />
        )}

        {activeTab === "routes" && (
          <RoutesView isCutoff={scenarioMode === "CUTOFF"} />
        )}

        {activeTab === "impact" && (
          <ImpactView exposure={riskData?.exposure} />
        )}

        {activeTab === "national" && (
          <NationalHotspotsView
            hotspots={nationalHotspots}
            summary={nationalSummary}
            onDrillDown={(locId) => {
              setSelectedLocation(locId);
              setActiveTab("overview");
            }}
          />
        )}
      </main>

      {/* Clean Minimal Emergency Footer */}
      <footer className="w-full bg-[#05070a] border-t border-slate-900 mt-10 py-6 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-300 font-medium">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>HimaRakshak • Himalayan Early Warning & Evacuation Network</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Phone className="w-3.5 h-3.5 text-red-400" />
              <span>National Disaster Helpline: <strong className="text-white">1070 / 112</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <span>DDMA Chamoli Control Room: <strong className="text-white">01372-251437</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
