import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useThemeTransition } from '../context/ThemeTransitionContext';

/**
 * ⚡ ThemeToggle — Premium Theme Switcher with Micro-Interaction
 * Triggers coordinated particle transformation, expanding ripple shockwave, and central energy core.
 */
export const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { resolvedTheme } = useTheme();
  const { isTransitioning, startTransition } = useThemeTransition();

  const isDark = resolvedTheme === 'dark';

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';
  const paddingClass = size === 'sm' ? 'p-1.5' : 'p-2';

  const handleClick = (e) => {
    // Prevent overlapping transitions and double-clicks
    if (isTransitioning) return;

    // Dynamically calculate the exact center coordinates of the clicked button
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2),
    };

    startTransition(origin);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      disabled={isTransitioning}
      aria-busy={isTransitioning}
      className={`relative inline-flex items-center justify-center rounded-xl border transition-all duration-300 focus:outline-none select-none ${
        isTransitioning
          ? 'scale-95 ring-2 ring-indigo-500/60 shadow-lg shadow-indigo-500/25 cursor-wait'
          : 'hover:scale-105 active:scale-95'
      } ${
        isDark
          ? 'bg-gray-900/80 hover:bg-gray-800/90 text-amber-300 border-gray-800 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10'
          : 'bg-white/90 hover:bg-slate-100 text-indigo-600 border-slate-200 hover:border-indigo-400/40 shadow-sm hover:shadow-md hover:shadow-indigo-500/10'
      } ${paddingClass} ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">Toggle theme</span>
      <div className={`relative w-4 h-4 flex items-center justify-center transition-transform duration-700 ease-out ${
        isTransitioning ? 'rotate-180 scale-110' : ''
      }`}>
        {isDark ? (
          <Sun className={`${iconSize} transition-transform duration-300 rotate-0 text-amber-300`} />
        ) : (
          <Moon className={`${iconSize} transition-transform duration-300 -rotate-12 text-indigo-600`} />
        )}
      </div>

      {/* Subtle active excitation ring during transition */}
      {isTransitioning && (
        <span className="absolute inset-0 rounded-xl animate-ping bg-indigo-500/20 pointer-events-none" />
      )}
    </button>
  );
};

export default ThemeToggle;
