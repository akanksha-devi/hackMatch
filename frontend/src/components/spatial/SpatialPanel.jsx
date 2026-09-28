import React from 'react';
import { SpatialSurface } from './SpatialSurface';

/**
 * SpatialPanel - Floating glass panel for toolbars, control sections, forms, and tables.
 */
export const SpatialPanel = React.forwardRef(({
  elevation = 'raised',
  hover = false,
  className = '',
  children,
  ...props
}, ref) => {
  return (
    <SpatialSurface
      ref={ref}
      variant="panel"
      elevation={elevation}
      hoverDepth={hover}
      className={`rounded-2xl p-4 ${className}`}
      {...props}
    >
      {children}
    </SpatialSurface>
  );
});

SpatialPanel.displayName = 'SpatialPanel';

export default SpatialPanel;
