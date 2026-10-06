import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { RADIUS, MOTION, FOCUS } from '../../design-system/tokens';
import { SpatialTooltip } from './SpatialTooltip';
import { SpatialAnimatedIcon } from './SpatialAnimatedIcon';

/**
 * SpatialIconButton - Tactile icon-only button for toolbar, close, and navigation actions.
 * Enforces accessible aria-label, standardized focus/hover micro-interactions, and supports children.
 */
export const SpatialIconButton = React.forwardRef(({
  as: ComponentOverride = null,
  to = null,
  href = null,
  icon: Icon,
  variant = 'ghost',      // 'ghost' | 'secondary' | 'outline' | 'primary' | 'danger'
  size = 'md',            // 'sm' | 'md' | 'lg'
  tooltip = '',
  tooltipPosition = 'top',
  disabled = false,
  loading = false,
  isLoading = false,
  className = '',
  label = '',
  ariaLabel = '',
  type = 'button',
  children,
  ...props
}, ref) => {
  const isSpinning = Boolean(loading || isLoading);
  const isDisabled = Boolean(disabled || isSpinning);

  const accessibleName = ariaLabel || label || props['aria-label'] || tooltip || 'Action';

  const baseStyles = `inline-flex items-center justify-center relative ${RADIUS.control} transition-all ${MOTION.duration.standard} ease-out select-none ${FOCUS.ring} ${MOTION.reducedMotion} disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none shrink-0`;

  const sizeStyles = {
    sm: 'w-8 h-8 min-w-[32px] min-h-[32px] p-1.5',
    md: 'w-10 h-10 min-w-[40px] min-h-[40px] p-2',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px] p-2.5',
  }[size] || 'w-10 h-10 min-w-[40px] min-h-[40px] p-2';

  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  const variantStyles = {
    primary:
      `bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs hover:shadow-sm hover:brightness-105 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] ${MOTION.hoverLift} ${MOTION.activePress}`,
    secondary:
      `bg-white/70 dark:bg-slate-900/60 backdrop-blur-md backdrop-saturate-140 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-white/90 dark:hover:bg-slate-800 shadow-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${MOTION.hoverLift} ${MOTION.activePress}`,
    outline:
      `bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${MOTION.hoverLift} ${MOTION.activePress}`,
    ghost:
      `bg-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5 ${MOTION.activePress}`,
    danger:
      `bg-rose-600/10 text-rose-600 dark:text-rose-400 border border-rose-300/40 dark:border-rose-500/30 hover:bg-rose-600 hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ${MOTION.hoverLift} ${MOTION.activePress} ${FOCUS.ringDanger}`,
  }[variant] || '';


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

  const buttonElement = (
    <Component
      ref={ref}
      aria-label={accessibleName}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...componentProps}
      {...props}
    >
      {isSpinning ? (
        <Loader2 className={`${iconSizeClass} animate-spin`} />
      ) : Icon ? (
        <SpatialAnimatedIcon
          icon={Icon}
          trigger="parent-hover"
          className={iconSizeClass}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </Component>
  );

  if (tooltip) {
    return (
      <SpatialTooltip content={tooltip} position={tooltipPosition}>
        {buttonElement}
      </SpatialTooltip>
    );
  }

  return buttonElement;
});

SpatialIconButton.displayName = 'SpatialIconButton';

export default SpatialIconButton;
