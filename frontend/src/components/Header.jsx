import React, { useState, useEffect } from "react";
import { Shield, Map, Home, Navigation, Users, Globe, Sliders, Clock, Wifi, WifiOff } from "lucide-react";

export function Header({ activeTab, setActiveTab, isOnline, riskLevel, showSimulator, setShowSimulator }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (riskLevel) {
      case "CRITICAL":
        return {
          bg: "bg-red-500/10 text-red-400 border-red-500/30",
          dot: "bg-red-500 animate-ping",
          text: "Critical Emergency Alert",
        };
      case "WARNING":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          dot: "bg-amber-400",
          text: "High Alert Warning",
        };
      case "WATCH":
        return {
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          dot: "bg-blue-400",
          text: "Weather Watch Active",
        };
      default:
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-400",
          text: "Normal Conditions",
        };
    }
  };

  const status = getStatusBadge();

  const navItems = [
    { id: "overview", label: "Live Map & Overview", icon: Map },
    { id: "shelters", label: "Safe Shelters", icon: Home },
    { id: "routes", label: "Evacuation Routes", icon: Navigation },
    { id: "impact", label: "Community Impact", icon: Users },
    { id: "national", label: "National Monitor", icon: Globe },
  ];

  return (
    <header className="w-full bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Hima<span className="text-cyan-400">Rakshak</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-gray-300 font-medium border border-slate-700/60">
                  Chamoli District, Uttarakhand
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Himalayan Early Warning & Community Safety Network
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-[#0d1322] p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Live Status Pill */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${status.bg}`}>
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span>{status.text}</span>
            </div>

            {/* Simulation Drill Button */}
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                showSimulator
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-500/30"
                  : "bg-slate-900/80 hover:bg-slate-800 text-gray-300 border-slate-700/80"
              }`}
              title="Simulate different weather conditions and emergency response drills"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate Weather</span>
            </button>

            {/* Time / Connection */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{timeStr}</span>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/60 gap-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
