import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';
  const paddingClass = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 select-none ${
        isDark
          ? 'bg-gray-900/80 hover:bg-gray-800/90 text-amber-300 border-gray-800 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10'
          : 'bg-white/90 hover:bg-slate-100 text-indigo-600 border-slate-200 hover:border-indigo-400/40 shadow-sm hover:shadow-md hover:shadow-indigo-500/10'
      } ${paddingClass} ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">Toggle theme</span>
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className={`${iconSize} transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-300`} />
        ) : (
          <Moon className={`${iconSize} transition-transform duration-300 -rotate-12 hover:rotate-0 text-indigo-600`} />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
