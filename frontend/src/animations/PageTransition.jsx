import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition Wrapper
 * Provides subtle, cinematic fade and elevation entry for page contents
 * without interfering with layout, scrolling, or responsiveness.
 */
export const PageTransition = ({ children, className = '' }) => {
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  useEffect(() => {
    // Reset and trigger smooth entry on route change
    setIsLoaded(false);
    const timer = requestAnimationFrame(() => {
      setIsLoaded(true);
    });
    return () => cancelAnimationFrame(timer);
  }, [location.pathname]);

  if (prefersReducedMotion) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  return (
    <div
      className={`w-full transition-all duration-500 ease-out ${
        isLoaded
          ? 'opacity-100 translate-y-0 filter-none'
          : 'opacity-0 translate-y-2.5'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
