import React from 'react';
import { X } from 'lucide-react';
import { RADIUS, SPACING, FOCUS, MOTION } from '../../design-system/tokens';

/**
 * SpatialInput - Canonical form text input with unified theme awareness, clearable actions, and accessible focus states.
 */
export const SpatialInput = React.forwardRef(({
  size = 'md',             // 'sm' | 'md' | 'lg'
  label = null,
  icon: Icon = null,
  actionIcon: ActionIcon = null,
  onAction = null,
  clearable = false,
  onClear = null,
  actionLabel = 'Clear input',
  error = null,
  helperText = null,
  disabled = false,
  className = '',
  wrapperClassName = '',
  id,
  value,
  required = false,
  ...props
}, ref) => {
  const sizeStyles = {
    sm: `${SPACING.controlHeight.sm} px-3 text-xs`,
    md: `${SPACING.controlHeight.md} px-3.5 text-sm`,
    lg: `${SPACING.controlHeight.lg} px-4 text-base`,
  }[size] || `${SPACING.controlHeight.md} px-3.5 text-sm`;

  // Clearable action resolution
  const isClearActive = clearable && Boolean(value) && !disabled;
  const ResolvedActionIcon = ActionIcon || (isClearActive ? X : null);
  const resolvedOnAction = onAction || (isClearActive ? onClear : null);

  const paddingLeft = Icon ? (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-11' : 'pl-9') : '';
  const paddingRight = ResolvedActionIcon ? (size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-11' : 'pr-9') : '';

  const borderState = error
    ? 'border-rose-500/80 dark:border-rose-500/70 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
    : 'border-slate-300 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30';

  const baseInputStyles = `spatial-input w-full ${RADIUS.control} bg-white/80 dark:bg-slate-900/70 backdrop-blur-md backdrop-saturate-140 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 border transition-all ${MOTION.duration.micro} ease-out outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100/60 dark:disabled:bg-gray-950/60 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)]`;


  const ariaDescribedBy = error && id
    ? `${id}-error`
    : helperText && id
    ? `${id}-helper`
    : undefined;

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-xs font-semibold mb-1.5 ${
            error ? 'text-rose-500' : 'text-slate-700 dark:text-gray-300'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative w-full">
        {Icon && (
          <div className={`absolute inset-y-0 left-0 ${size === 'sm' ? 'pl-2.5' : 'pl-3'} flex items-center pointer-events-none text-slate-400 dark:text-gray-500`}>
            <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} aria-hidden="true" />
          </div>
        )}

        <input
          ref={ref}
          id={id}
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={ariaDescribedBy}
          className={`${baseInputStyles} ${sizeStyles} ${paddingLeft} ${paddingRight} ${borderState} ${className}`}
          {...props}
        />

        {ResolvedActionIcon && (
          <button
            type="button"
            tabIndex={resolvedOnAction ? 0 : -1}
            onClick={resolvedOnAction}
            disabled={disabled}
            aria-label={actionLabel}
            className={`absolute inset-y-0 right-0 ${size === 'sm' ? 'pr-2.5' : 'pr-3'} flex items-center text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer ${FOCUS.ring} rounded-md`}
          >
            <ResolvedActionIcon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {typeof error === 'string' && error && (
        <p id={id ? `${id}-error` : undefined} className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </p>
      )}

      {!error && typeof helperText === 'string' && helperText && (
        <p id={id ? `${id}-helper` : undefined} className="mt-1 text-xs text-slate-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

SpatialInput.displayName = 'SpatialInput';

export default SpatialInput;
