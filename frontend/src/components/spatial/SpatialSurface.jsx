import React from 'react';

/**
 * SpatialSurface - The core visual foundation for HackMatch Spatial UI.
 * Provides translucent glass, backdrop blur, layered depth shadow, and optional hover elevation.
 */
export const SpatialSurface = React.forwardRef(({
  as: Component = 'div',
  elevation = 'raised', // 'flat' | 'raised' | 'floating' | 'overlay'
  variant = 'glass',    // 'glass' | 'panel' | 'card' | 'control'
  glow = false,         // false | true | 'indigo' | 'cyan' | 'violet'
  hoverDepth = false,   // Adds 3D translateY(-3px) and shadow lift on hover
  className = '',
  children,
  style = {},
  ...props
}, ref) => {
  // Elevation class mapping
  const elevationStyles = {
    flat: 'spatial-flat',
    raised: 'spatial-raised',
    floating: 'spatial-floating',
    overlay: 'spatial-overlay',
  }[elevation] || 'spatial-raised';

  // Variant class mapping
  const variantStyles = {
    glass: 'spatial-glass',
    panel: 'spatial-panel',
    card: 'spatial-card',
    control: 'spatial-control',
  }[variant] || 'spatial-glass';

  // Optional glow rims
  const glowStyles = {
    true: 'spatial-glow-indigo',
    indigo: 'spatial-glow-indigo',
    cyan: 'spatial-glow-cyan',
    violet: 'spatial-glow-violet',
  }[glow] || '';

  const hoverStyle = hoverDepth ? 'spatial-hover-lift' : '';

  return (
    <Component
      ref={ref}
      className={`spatial-surface ${elevationStyles} ${variantStyles} ${hoverStyle} ${glowStyles} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
});

SpatialSurface.displayName = 'SpatialSurface';

export default SpatialSurface;
