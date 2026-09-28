import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeContext';

const ThemeTransitionContext = createContext({
  isTransitioning: false,
  transitionProgress: 0,
  collapseAmount: 0,
  rippleOrigin: { x: 0, y: 0 },
  targetTheme: 'dark',
  fromTheme: 'light',
  startTransition: () => {},
  transitionRef: { current: null },
});

export const ThemeTransitionProvider = ({ children }) => {
  const { resolvedTheme, setTheme } = useTheme();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [collapseAmount, setCollapseAmount] = useState(0);
  const [rippleOrigin, setRippleOrigin] = useState({ x: 0, y: 0 });
  const [targetTheme, setTargetTheme] = useState(resolvedTheme === 'dark' ? 'light' : 'dark');
  const [fromTheme, setFromTheme] = useState(resolvedTheme);

  // High-performance shared ref for 60fps WebGL canvas access without React re-render overhead
  const transitionRef = useRef({
    active: false,
    startTime: 0,
    duration: 1050,
    progress: 0,
    collapseAmount: 0,
    targetTheme: 'light',
    fromTheme: 'dark',
    origin: { x: 0, y: 0 },
    themeSwitched: false,
  });

  const animFrameRef = useRef(null);

  // Check system prefers-reduced-motion
  const isReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const startTransition = useCallback((originPoint) => {
    // Prevent overlapping transitions
    if (transitionRef.current.active) return;

    const reduced = isReducedMotion();
    const duration = reduced ? 220 : 1050;
    const currentTheme = resolvedTheme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Default origin to center if not provided
    const origin = originPoint || {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    };

    setRippleOrigin(origin);
    setFromTheme(currentTheme);
    setTargetTheme(nextTheme);
    setIsTransitioning(true);
    setTransitionProgress(0);
    setCollapseAmount(0);

    const now = performance.now();
    transitionRef.current = {
      active: true,
      startTime: now,
      duration,
      progress: 0,
      collapseAmount: 0,
      targetTheme: nextTheme,
      fromTheme: currentTheme,
      origin,
      themeSwitched: false,
      isReduced: reduced,
    };

    const animate = (timestamp) => {
      const elapsed = timestamp - transitionRef.current.startTime;
      const rawProgress = Math.min(1, Math.max(0, elapsed / duration));

      // Calculate organic collapse amount:
      // In normal mode:
      // 0.0 - 0.45: rises from 0 to 1 (particles collapse into core)
      // 0.45 - 0.60: stays at peak 1.0 (energy core peak)
      // 0.60 - 1.00: falls from 1 to 0 (particles expand outward into new theme)
      let collapse = 0;
      if (reduced) {
        collapse = rawProgress < 0.5 ? rawProgress * 2 * 0.15 : (1 - rawProgress) * 2 * 0.15;
      } else {
        if (rawProgress < 0.45) {
          // Smooth acceleration curve (ease-in-out)
          const p = rawProgress / 0.45;
          collapse = 0.5 * (1 - Math.cos(p * Math.PI));
        } else if (rawProgress <= 0.6) {
          collapse = 1.0;
        } else {
          // Elastic / smooth release
          const p = (rawProgress - 0.6) / 0.4;
          collapse = 0.5 * (1 + Math.cos(p * Math.PI));
        }
      }

      transitionRef.current.progress = rawProgress;
      transitionRef.current.collapseAmount = collapse;

      // Visual Transition Point: switch DOM theme at ~52% (550ms into transition)
      const switchPoint = reduced ? 0.4 : 0.52;
      if (rawProgress >= switchPoint && !transitionRef.current.themeSwitched) {
        transitionRef.current.themeSwitched = true;
        setTheme(nextTheme);
      }

      // Update coarse state for React components every few frames
      setTransitionProgress(rawProgress);
      setCollapseAmount(collapse);

      if (rawProgress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Transition Completed
        transitionRef.current.active = false;
        setIsTransitioning(false);
        setTransitionProgress(1);
        setCollapseAmount(0);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [resolvedTheme, setTheme, isReducedMotion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <ThemeTransitionContext.Provider
      value={{
        isTransitioning,
        transitionProgress,
        collapseAmount,
        rippleOrigin,
        targetTheme,
        fromTheme,
        startTransition,
        transitionRef,
      }}
    >
      {children}
    </ThemeTransitionContext.Provider>
  );
};

export const useThemeTransition = () => useContext(ThemeTransitionContext);

export default ThemeTransitionContext;
