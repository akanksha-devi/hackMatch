import React from 'react';

/**
 * LiquidGlassDefs - Centralized Hidden SVG Filter Definitions for HackMatch Optical Refraction.
 * Mounts the physical refraction filters into the DOM once at root level.
 *
 * Visual principle:
 * Uses feTurbulence (fractal noise) + feDisplacementMap to subtly displace backdrop pixels,
 * creating an authentic optical lens refraction underneath frosted surfaces without degrading
 * text sharpness or legibility.
 *
 * Filter Specs:
 * - #liquid-glass-refract:
 *     fractalNoise baseFrequency="0.03" numOctaves="2" scale="6"
 *     Provides organic lens refraction, environmental color dispersion, and zero pixel noise.
 * - #liquid-glass-refract-subtle:
 *     fractalNoise baseFrequency="0.045" numOctaves="2" scale="3.5"
 *     Restrained micro-refraction for dense data interfaces.
 */
export const LiquidGlassDefs = () => {
  return (
    <svg
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
      focusable="false"
      tabIndex={-1}
    >
      <defs>
        {/* Canonical Liquid Glass Optical Refraction Filter */}
        <filter id="liquid-glass-refract" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="2"
            result="liquidNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="liquidNoise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
        </filter>

        {/* Subtle Micro-Refraction for Dense Data Surfaces */}
        <filter id="liquid-glass-refract-subtle" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="2"
            result="subtleNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="subtleNoise"
            scale="3.5"
            xChannelSelector="R"
            yChannelSelector="G"
            result="subtleRefracted"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default LiquidGlassDefs;
