import React, { useMemo } from 'react';
import { useThemeTransition } from '../context/ThemeTransitionContext';

/**
 * ⚡ ThemeRipple — GPU-Accelerated Shockwave & Expanding Ripple
 * Originates from the exact screen position of the clicked theme toggle.
 * Sweeps across the entire viewport to unveil the new theme without layout shifts.
 */
export const ThemeRipple = () => {
  const { isTransitioning, transitionProgress, rippleOrigin, targetTheme } = useThemeTransition();

  const isSwitchingToLight = targetTheme === 'light';

  // Calculate maximum distance from the ripple origin to the farthest viewport corner
  const maxRadius = useMemo(() => {
    if (typeof window === 'undefined') return 1200;
    const { x, y } = rippleOrigin;
    const cornerX = Math.max(x, window.innerWidth - x);
    const cornerY = Math.max(y, window.innerHeight - y);
    return Math.hypot(cornerX, cornerY) * 1.05;
  }, [rippleOrigin]);

  if (!isTransitioning) return null;

  const { x, y } = rippleOrigin;

  // Timeline curve:
  // 0.00 - 0.15: Preparation / initial button ping
  // 0.15 - 0.75: Rapid circular expansion across viewport
  // 0.75 - 1.00: Fade out overlay, revealing settled environment
  const expansionProgress = Math.min(1, Math.max(0, (transitionProgress - 0.12) / 0.65));
  // Smooth cubic ease-out for natural explosion wave physics
  const easeRadius = Math.sin((expansionProgress * Math.PI) / 2) * maxRadius;

  // Secondary shockwave rings
  const ring1Progress = Math.min(1, Math.max(0, (transitionProgress - 0.15) / 0.55));
  const ring1Radius = Math.sin((ring1Progress * Math.PI) / 2) * (maxRadius * 0.95);
  const ring1Opacity = ring1Progress > 0 ? (1 - ring1Progress) * 0.8 : 0;

  const ring2Progress = Math.min(1, Math.max(0, (transitionProgress - 0.22) / 0.6));
  const ring2Radius = Math.sin((ring2Progress * Math.PI) / 2) * (maxRadius * 0.85);
  const ring2Opacity = ring2Progress > 0 ? (1 - ring2Progress) * 0.6 : 0;

  // Overall overlay opacity fade in final stage (0.75 - 1.0)
  const overlayOpacity = transitionProgress > 0.75 ? Math.max(0, 1 - (transitionProgress - 0.75) / 0.25) : 1;

  // Dynamic theme gradients
  const curtainStyle = {
    clipPath: `circle(${easeRadius}px at ${x}px ${y}px)`,
    WebkitClipPath: `circle(${easeRadius}px at ${x}px ${y}px)`,
    opacity: overlayOpacity,
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-20 transition-opacity duration-150"
      aria-hidden="true"
    >
      {/* 1. Main Environmental Transformation Wave Curtain */}
      <div
        className={`absolute inset-0 will-change-transform ${
          isSwitchingToLight
            ? 'bg-gradient-to-br from-white/95 via-sky-50/90 to-indigo-50/85'
            : 'bg-gradient-to-br from-[#07090e]/95 via-[#0b0f17]/90 to-[#1e1b4b]/85'
        }`}
        style={curtainStyle}
      />

      {/* 2. Concentric Luminous Shockwave Ring 1 */}
      {ring1Progress > 0 && ring1Progress < 1 && (
        <div
          className="absolute rounded-full pointer-events-none will-change-transform"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: `${ring1Radius * 2}px`,
            height: `${ring1Radius * 2}px`,
            transform: 'translate(-50%, -50%)',
            border: isSwitchingToLight ? '2px solid rgba(56, 189, 248, 0.7)' : '2px solid rgba(168, 85, 247, 0.7)',
            boxShadow: isSwitchingToLight
              ? '0 0 25px 4px rgba(56, 189, 248, 0.5), inset 0 0 15px 2px rgba(99, 102, 241, 0.3)'
              : '0 0 25px 4px rgba(168, 85, 247, 0.5), inset 0 0 15px 2px rgba(6, 182, 212, 0.3)',
            opacity: ring1Opacity * overlayOpacity,
          }}
        />
      )}

      {/* 3. Secondary Radiant Shockwave Ring 2 */}
      {ring2Progress > 0 && ring2Progress < 1 && (
        <div
          className="absolute rounded-full pointer-events-none will-change-transform"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: `${ring2Radius * 2}px`,
            height: `${ring2Radius * 2}px`,
            transform: 'translate(-50%, -50%)',
            border: isSwitchingToLight ? '1.5px solid rgba(99, 102, 241, 0.5)' : '1.5px solid rgba(6, 182, 212, 0.5)',
            boxShadow: isSwitchingToLight
              ? '0 0 20px 2px rgba(99, 102, 241, 0.35)'
              : '0 0 20px 2px rgba(6, 182, 212, 0.35)',
            opacity: ring2Opacity * overlayOpacity,
          }}
        />
      )}
    </div>
  );
};

export default ThemeRipple;
