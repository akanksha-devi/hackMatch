import React from 'react';
import { RADIUS, FOCUS, MOTION } from '../../design-system/tokens';

/**
 * SpatialTextarea - Canonical multi-line text input with unified theme awareness and accessible focus states.
 */
export const SpatialTextarea = React.forwardRef(({
  rows = 3,
  label = null,
  error = null,
  helperText = null,
  disabled = false,
  className = '',
  wrapperClassName = '',
  id,
  required = false,
  ...props
}, ref) => {
  const borderState = error
    ? 'border-rose-500/80 dark:border-rose-500/70 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
    : 'border-slate-300 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30';

  const baseTextareaStyles = `spatial-textarea w-full ${RADIUS.control} p-3.5 text-sm bg-white/80 dark:bg-slate-900/70 backdrop-blur-md backdrop-saturate-140 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 border transition-all ${MOTION.duration.micro} ease-out outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100/60 dark:disabled:bg-gray-950/60 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] resize-y min-h-[80px]`;


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
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={ariaDescribedBy}
          className={`${baseTextareaStyles} ${borderState} ${className}`}
          {...props}
        />
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

SpatialTextarea.displayName = 'SpatialTextarea';

export default SpatialTextarea;
