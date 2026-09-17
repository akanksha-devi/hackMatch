import React from 'react';
import { Zap } from 'lucide-react';

export const MatchScoreBadge = ({ score = 0, matchCount = 0 }) => {
  let colorStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (score < 50) {
    colorStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  } else if (score < 80) {
    colorStyle = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${colorStyle} font-semibold text-xs`}>
      <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
      <span>{score}% Match</span>
      {matchCount > 0 && <span className="opacity-75">({matchCount} skill{matchCount > 1 ? 's' : ''})</span>}
    </div>
  );
};
