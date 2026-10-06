import React from 'react';
import { Check, X } from 'lucide-react';
import { RADIUS, SPACING, MOTION, FOCUS } from '../design-system/tokens';

export const CATEGORY_COLORS = {
  // Frontend
  React: 'badge-indigo',
  TypeScript: 'badge-indigo',
  TailwindCSS: 'badge-cyan',
  'Next.js': 'badge-indigo',
  Frontend: 'badge-cyan',
  'Three.js': 'badge-purple',

  // AI & Data
  Python: 'badge-amber',
  PyTorch: 'badge-amber',
  AI: 'badge-purple',
  LLM: 'badge-purple',
  'Gemini API': 'badge-cyan',
  TensorFlow: 'badge-amber',
  'Machine Learning': 'badge-amber',

  // Backend
  'Node.js': 'badge-emerald',
  Express: 'badge-emerald',
  MongoDB: 'badge-emerald',
  FastAPI: 'badge-amber',
  Docker: 'badge-indigo',

  // Design
  'UI/UX': 'badge-purple',
  Figma: 'badge-purple',
  'Design Systems': 'badge-purple',

  // Web3
  Solidity: 'badge-cyan',
  Blockchain: 'badge-cyan',
  Web3: 'badge-cyan',
  Rust: 'badge-amber',
};

/**
 * SkillChip - Canonical component for all skills, tags, tech stacks, and selection chips.
 * All variants share the exact same structural pill geometry, font scale, and theme behavior.
 */
export const SkillChip = React.forwardRef(({
  name,
  skill,
  children,
  variant = 'default', // 'default' | 'required' | 'matched' | 'selected' | 'interactive' | 'removable'
  size = 'md',         // 'sm' | 'md' | 'lg'
  selected = false,
  disabled = false,
  onToggle = null,
  onRemove = null,
  className = '',
  ...props
}, ref) => {
  const label = skill || name || children;
  const badgeClass = CATEGORY_COLORS[label] || 'badge-indigo';

  // Shared geometric scale from central tokens
  const sizeClasses = {
    sm: `${SPACING.chipPadding.sm} ${SPACING.chipHeight.sm} gap-1`,
    md: `${SPACING.chipPadding.md} ${SPACING.chipHeight.md} gap-1.5`,
    lg: `${SPACING.chipPadding.lg} ${SPACING.chipHeight.lg} gap-2`,
  }[size] || `${SPACING.chipPadding.md} ${SPACING.chipHeight.md} gap-1.5`;

  const isRemovable = variant === 'removable' || Boolean(onRemove);
  const isInteractive = (variant === 'interactive' || typeof onToggle === 'function') && !isRemovable;
  const isSelected = selected || variant === 'selected';

  // Base pill structure shared across all variants
  const baseClasses = `inline-flex items-center justify-center ${RADIUS.pill} font-sans transition-all ${MOTION.duration.standard} ease-out select-none border`;

  // Semantic variant styling
  let variantClasses = badgeClass;
  if (isSelected) {
    variantClasses = 'bg-indigo-600 text-white border-indigo-500 shadow-xs dark:bg-indigo-600 dark:border-indigo-400';
  } else if (variant === 'required') {
    // Skills Needed: Subtle requirement accent border - NO heavy black rings or dark offset
    variantClasses = `${badgeClass} border-indigo-400/40 dark:border-indigo-400/50 shadow-xs`;
  } else if (variant === 'matched') {
    // Matched skills in recommendations/search: emerald accent hint
    variantClasses = `${badgeClass} border-emerald-400/40 dark:border-emerald-400/50`;
  } else if (isInteractive && !isSelected) {
    variantClasses = `${badgeClass} hover:border-indigo-400/50 hover:opacity-90 cursor-pointer ${MOTION.hoverLift} ${MOTION.activePress}`;
  }

  const focusClasses = isInteractive ? FOCUS.ring : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  const Component = isInteractive ? 'button' : 'span';
  const componentProps = isInteractive
    ? {
        type: 'button',
        disabled,
        onClick: (e) => {
          if (disabled) return;
          if (onToggle) onToggle(label, e);
        },
        'aria-pressed': isSelected,
      }
    : {};

  return (
    <Component
      ref={ref}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${focusClasses} ${disabledClasses} ${className}`}
      {...componentProps}
      {...props}
    >
      {/* Requirement indicator dot for 'required' variant */}
      {variant === 'required' && !isSelected && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0"
          title="Required skill"
          aria-hidden="true"
        />
      )}

      {/* Selected checkmark for 'interactive' or 'selected' */}
      {isSelected && (
        <Check className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} shrink-0 text-white`} aria-hidden="true" />
      )}

      {/* Matched check icon for 'matched' */}
      {variant === 'matched' && !isSelected && (
        <Check className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} shrink-0 text-emerald-600 dark:text-emerald-400`} aria-hidden="true" />
      )}

      <span className="truncate">{label}</span>

      {/* Accessible remove button for 'removable' or when onRemove is supplied */}
      {isRemovable && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (onRemove) onRemove(label, e);
          }}
          className={`hover:text-red-500 dark:hover:text-red-400 transition-colors ${FOCUS.ringDanger} rounded-full text-slate-400 dark:text-gray-400 -mr-0.5 p-0.5 cursor-pointer`}
          title={`Remove ${label}`}
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Component>
  );
});

SkillChip.displayName = 'SkillChip';

export default SkillChip;
