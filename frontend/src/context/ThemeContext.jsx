import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const THEME_STORAGE_KEY = 'hackmatch_theme';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  // 1. Initialize from localStorage or default to 'system'
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
      }
    }
    return 'system';
  });

  // 2. Track OS system color-scheme preference
  const [systemPreference, setSystemPreference] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 3. Resolve active theme ('dark' or 'light')
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemPreference;
    }
    return theme;
  }, [theme, systemPreference]);

  // 4. Apply theme classes and attributes to <html> root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.classList.remove('dark', 'light');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // 5. Public setTheme with persistence
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage access errors
    }
  };

  useEffect(() => {
    window.__setTheme = setTheme;
  }, []);

  // 6. Convenience toggle
  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
