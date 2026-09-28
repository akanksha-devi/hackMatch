import React from 'react';
import { SpatialSurface } from './SpatialSurface';

/**
 * SpatialCard - Floating glass card for hackathons, users, team requests, and metrics.
 */
export const SpatialCard = React.forwardRef(({
  accentLine = false,   // gradient accent line on top edge
  hover = true,
  elevation = 'raised',
  className = '',
  children,
  ...props
}, ref) => {
  return (
    <SpatialSurface
      ref={ref}
      variant="card"
      elevation={elevation}
      hoverDepth={hover}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      {...props}
    >
      {accentLine && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity" />
      )}
      {children}
    </SpatialSurface>
  );
});

SpatialCard.displayName = 'SpatialCard';

export default SpatialCard;
