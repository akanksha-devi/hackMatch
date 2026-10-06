import React from 'react';
import { RADIUS, SPACING, MOTION, FOCUS } from '../../design-system/tokens';

/**
 * FilterChip - Tactile toggle pill for filter toolbars, tags, and category selectors.
 */
export const FilterChip = React.forwardRef(({
  label,
  active = false,
  count = null,
  icon: Icon = null,
  size = 'sm',       // 'sm' | 'md'
  disabled = false,
  onClick = null,
  className = '',
  ...props
}, ref) => {
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[32px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[38px] gap-2',
  }[size] || 'text-xs px-3 py-1.5 min-h-[32px] gap-1.5';

  const baseStyles = `inline-flex items-center justify-center shrink-0 whitespace-nowrap font-semibold ${RADIUS.control} border transition-all ${MOTION.duration.micro} ease-out select-none ${FOCUS.ring} ${MOTION.reducedMotion} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${MOTION.activePress}`;

  const stateStyles = active
    ? 'bg-indigo-600 text-white border-indigo-400/80 shadow-sm shadow-indigo-600/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
    : 'bg-white/70 dark:bg-slate-900/50 backdrop-blur-md backdrop-saturate-125 border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-slate-400 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-800/60 shadow-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]';


  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      className={`${baseStyles} ${sizeStyles} ${stateStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} aria-hidden="true" />}
      <span>{label}</span>
      {count !== null && count !== undefined && (
        <span
          className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
});

FilterChip.displayName = 'FilterChip';

export default FilterChip;
