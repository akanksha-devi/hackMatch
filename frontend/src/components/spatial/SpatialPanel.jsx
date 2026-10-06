import React from 'react';
import { SpatialSurface } from './SpatialSurface';
import { RADIUS } from '../../design-system/tokens';

/**
 * SpatialPanel - Floating glass panel for toolbars, control sections, forms, and data tables.
 * Centralized structural surface primitive sharing the same geometry and depth language as SpatialCard.
 */
export const SpatialPanel = React.forwardRef(({
  as: Component = 'div',
  variant = 'panel',     // 'panel' | 'glass' | 'card'
  elevation = 'flat',    // 'flat' | 'raised' | 'floating'
  glass = null,          // null | 'flat' | 'raised' | 'floating' | 'refraction' | 'refraction-subtle'
  padding = 'normal',    // 'none' | 'compact' | 'normal' | 'large' | 'loose'
  hover = false,
  className = '',
  children,
  ...props
}, ref) => {
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
      className={`${RADIUS.card} ${paddingClass} ${className}`}

      {...props}
    >
      {children}
    </SpatialSurface>
  );
});

SpatialPanel.displayName = 'SpatialPanel';

export default SpatialPanel;

