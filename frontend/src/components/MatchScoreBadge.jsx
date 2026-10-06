import React from 'react';
import { Zap } from 'lucide-react';
import { RADIUS, ACCENTS } from '../design-system/tokens';

/**
 * MatchScoreBadge - Displays teammate algorithmic match percentage.
 * Consumes central design system tokens.
 */
export const MatchScoreBadge = ({ score = 0, matchCount = 0, size = 'sm', className = '' }) => {
  let accent = ACCENTS.emerald;
  if (score < 50) {
    accent = ACCENTS.cyan;
  } else if (score < 80) {
    accent = ACCENTS.indigo;
  }

  const sizeClasses = size === 'md'
    ? 'text-xs px-2.5 py-0.5 min-h-[24px] gap-1.5'
    : 'text-[10px] px-2 py-0.5 min-h-[20px] gap-1';

  const iconSizeClass = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  return (
    <span
      title={`${score}% Match with ${matchCount} overlapping skill${matchCount === 1 ? '' : 's'}`}
      className={`inline-flex items-center shrink-0 ${RADIUS.pill} border ${accent.bg} ${accent.text} ${accent.border} ${sizeClasses} font-semibold select-none ${className}`}
    >
      <Zap className={`${iconSizeClass} fill-current shrink-0`} aria-hidden="true" />
      <span>{score}% Match</span>
      {matchCount > 0 && (
        <span className="opacity-75">
          ({matchCount} skill{matchCount > 1 ? 's' : ''})
        </span>
      )}
    </span>
  );
};

export default MatchScoreBadge;
