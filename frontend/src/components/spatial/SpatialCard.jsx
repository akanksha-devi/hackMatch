import React from 'react';
import { SpatialSurface } from './SpatialSurface';
import { RADIUS, FOCUS, MOTION } from '../../design-system/tokens';

/**
 * SpatialCard - Floating glass card for hackathons, users, team requests, and metrics.
 * Centralized primitive for semantic cards across HackMatch with dual-theme spatial depth.
 */
export const SpatialCard = React.forwardRef(({
  as: Component = 'div',
  variant = 'card',      // 'card' | 'glass' | 'panel'
  elevation = 'raised',  // 'flat' | 'raised' | 'floating'
  glass = null,          // null | 'flat' | 'raised' | 'floating' | 'refraction' | 'refraction-subtle'
  padding = 'normal',    // 'none' | 'compact' | 'normal' | 'large' | 'loose'
  hover = true,
  accentLine = false,    // gradient accent line on top edge
  interactive = false,
  className = '',
  children,
  onClick,
  ...props
}, ref) => {
  const isInteractive = interactive || Boolean(onClick);

  const interactiveClasses = isInteractive
    ? `cursor-pointer ${FOCUS.ring} ${MOTION.activePress} ${MOTION.reducedMotion}`
    : '';

  const paddingClass = padding === 'none'
    ? ''
    : (padding && padding !== 'normal'
        ? ({ compact: 'p-4', normal: 'p-6', large: 'p-6 sm:p-8', loose: 'p-8 sm:p-12' }[padding] || '')
        : (/\bp(?:x|y|t|b|l|r|-[a-z0-9]+|\b)/.test(className) ? '' : 'p-6'));

  return (
    <SpatialSurface
      ref={ref}
      as={Component}
      variant={variant}
      elevation={elevation}
      glass={glass}
      hoverDepth={hover}

      onClick={onClick}
      tabIndex={isInteractive && props.tabIndex === undefined ? 0 : props.tabIndex}
      role={isInteractive && !props.role ? 'button' : props.role}
      className={`relative overflow-hidden ${RADIUS.card} ${paddingClass} ${interactiveClasses} ${className}`}
      {...props}
    >
      {accentLine && (
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-white/30 via-indigo-400/40 to-cyan-400/30 dark:from-white/20 dark:via-indigo-300/30 dark:to-cyan-300/20 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      {children}
    </SpatialSurface>
  );
});

SpatialCard.displayName = 'SpatialCard';

export default SpatialCard;

