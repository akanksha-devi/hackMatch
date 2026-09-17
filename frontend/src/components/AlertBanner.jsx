import React from "react";
import { AlertTriangle, CheckCircle, Info, ShieldAlert, ArrowRight } from "lucide-react";

export function AlertBanner({ action, riskLevel, onNavigateToShelter }) {
  const message = action?.message || "All weather parameters are within safe seasonal levels.";
  const isCritical = riskLevel === "CRITICAL";
  const isWarning = riskLevel === "WARNING";
  const isWatch = riskLevel === "WATCH";

  const getStyle = () => {
    if (isCritical) {
      return {
        card: "bg-red-950/40 border-red-500/40 shadow-xl shadow-red-950/20",
        badge: "bg-red-500/20 text-red-300 border-red-500/30",
        badgeText: "Immediate Action Required",
        icon: ShieldAlert,
        iconColor: "text-red-400",
      };
    }
    if (isWarning) {
      return {
        card: "bg-amber-950/30 border-amber-500/40 shadow-xl shadow-amber-950/20",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        badgeText: "High Alert Advisory",
        icon: AlertTriangle,
        iconColor: "text-amber-400",
      };
    }
    if (isWatch) {
      return {
        card: "bg-blue-950/30 border-blue-500/40",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        badgeText: "Monitoring Monsoon Watch",
        icon: Info,
        iconColor: "text-blue-400",
      };
    }
    return {
      card: "bg-emerald-950/25 border-emerald-500/30",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      badgeText: "Normal & Safe Conditions",
      icon: CheckCircle,
      iconColor: "text-emerald-400",
    };
  };

  const current = getStyle();
  const Icon = current.icon;

  return (
    <div className={`w-full rounded-2xl border p-4 sm:p-5 mb-5 transition-all duration-300 ${current.card}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left: Icon & Core Message */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0">
            <Icon className={`w-6 h-6 ${current.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${current.badge}`}>
                {current.badgeText}
              </span>
              <span className="text-xs text-gray-400 font-medium">Chamoli Cluster • Alaknanda Corridor</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-gray-100 leading-snug">
              {message}
            </p>
          </div>
        </div>

        {/* Action Button if emergency */}
        {(isCritical || isWarning) && onNavigateToShelter && (
          <button
            onClick={onNavigateToShelter}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-gray-100 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md"
          >
            <span>View Safe Shelter & Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Reassuring note */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Automated multi-hazard guidance based on live rainfall and terrain gradient.</span>
        </div>
        <span className="text-gray-400 text-[11px]">
          Always follow official instructions from State Disaster Management Authorities (NDRF/SDMA).
        </span>
      </div>
    </div>
  );
}
