import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { RADIUS, SPACING, MOTION, FOCUS } from '../../design-system/tokens';
import { SpatialAnimatedIcon } from './SpatialAnimatedIcon';

/**
 * SpatialButton - Tactile button with spatial elevation and glow.
 * The canonical button primitive for all button actions in HackMatch.
 * Supports polymorphic rendering (button, Link, or a) and responsive sizing.
 */
export const SpatialButton = React.forwardRef(({
  as: ComponentOverride = null,
  to = null,
  href = null,
  variant = 'primary',      // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
  size = 'md',              // 'sm' | 'md' | 'lg'
  icon: Icon = null,
  iconPosition = 'left',    // 'left' | 'right'
  loading = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...props
}, ref) => {
  const isSpinning = Boolean(loading || isLoading);
  const isDisabled = Boolean(disabled || isSpinning);

  const baseStyles = `inline-flex items-center justify-center font-semibold ${RADIUS.control} transition-all ${MOTION.duration.standard} ease-out select-none ${FOCUS.ring} ${MOTION.reducedMotion} disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none`;

  const sizeStyles = {
    sm: `${SPACING.buttonPadding.sm} ${SPACING.controlHeight.sm}`,
    md: `${SPACING.buttonPadding.md} ${SPACING.controlHeight.md}`,
    lg: `${SPACING.buttonPadding.lg} ${SPACING.controlHeight.lg}`,
  }[size] || `${SPACING.buttonPadding.md} ${SPACING.controlHeight.md}`;

  const variantStyles = {
    primary:
      `bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 text-white shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 hover:brightness-105 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] ${MOTION.hoverLift} ${MOTION.activePress}`,
    secondary:
      `bg-white/70 dark:bg-slate-900/60 backdrop-blur-md backdrop-saturate-140 border border-slate-300/80 dark:border-white/10 text-slate-800 dark:text-gray-100 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 hover:bg-white/90 dark:hover:bg-slate-800/80 shadow-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${MOTION.hoverLift} ${MOTION.activePress}`,
    outline:
      `bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${MOTION.hoverLift} ${MOTION.activePress}`,
    ghost:
      `bg-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 ${MOTION.activePress}`,
    danger:
      `bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-600/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] ${MOTION.hoverLift} ${MOTION.activePress} ${FOCUS.ringDanger}`,
    link:
      'bg-transparent text-indigo-600 dark:text-indigo-400 hover:underline p-0 h-auto min-h-0 focus-visible:underline',
  }[variant] || '';


  const widthStyle = fullWidth ? 'w-full' : '';
  const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  // Determine polymorphic component
  let Component = ComponentOverride;
  if (!Component) {
    if (to) {
      Component = Link;
    } else if (href) {
      Component = 'a';
    } else {
      Component = 'button';
    }
  }

  const componentProps = {};
  if (Component === 'button') {
    componentProps.type = type;
    componentProps.disabled = isDisabled;
  } else if (to) {
    componentProps.to = to;
    if (isDisabled) {
      componentProps['aria-disabled'] = true;
      componentProps.onClick = (e) => e.preventDefault();
    }
  } else if (href) {
    componentProps.href = href;
    if (isDisabled) {
      componentProps['aria-disabled'] = true;
      componentProps.onClick = (e) => e.preventDefault();
    }
  }

  return (
    <Component
      ref={ref}
      className={`${baseStyles} ${variant === 'link' ? '' : sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...componentProps}
      {...props}
    >
      {isSpinning ? (
        <Loader2 className={`${iconSizeClass} animate-spin shrink-0`} />
      ) : Icon && iconPosition === 'left' ? (
        <SpatialAnimatedIcon
          icon={Icon}
          trigger="parent-hover"
          className={`${iconSizeClass} shrink-0`}
          aria-hidden="true"
        />
      ) : null}

      {children && (
        <span className={isSpinning ? 'opacity-80' : ''}>{children}</span>
      )}

      {!isSpinning && Icon && iconPosition === 'right' ? (
        <SpatialAnimatedIcon
          icon={Icon}
          trigger="parent-hover"
          className={`${iconSizeClass} shrink-0`}
          aria-hidden="true"
        />
      ) : null}
    </Component>
  );
});

SpatialButton.displayName = 'SpatialButton';

export default SpatialButton;
