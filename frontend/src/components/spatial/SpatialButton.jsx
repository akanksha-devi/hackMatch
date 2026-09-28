import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * SpatialButton - Tactile button with spatial elevation and glow.
 */
export const SpatialButton = React.forwardRef(({
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md',         // 'sm' | 'md' | 'lg'
  icon: Icon = null,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  }[size] || 'px-4 py-2.5 text-sm gap-2';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    secondary:
      'spatial-control text-white dark:text-white light:text-slate-800 hover:border-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    outline:
      'border border-gray-700 dark:border-white/10 light:border-slate-300 text-gray-300 dark:text-gray-300 light:text-slate-700 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    ghost:
      'text-gray-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  }[variant] || 'bg-indigo-600 text-white';

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

SpatialButton.displayName = 'SpatialButton';

export default SpatialButton;
