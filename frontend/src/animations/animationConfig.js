/**
 * ⚡ HackMatch — Centralized Animation Configuration
 * Maps routes, page types, scene definitions, and device performance profiles.
 */

export const SCENE_KEYS = {
  HOME: 'particle-universe',
  HACKATHONS: 'event-orbit',
  HACKATHON_DETAIL: 'constellation',
  USERS: 'skill-constellation',
  PROFILE: 'personal-aura',
  POST_REQUEST: 'team-assembly',
  MY_REQUESTS: 'connection-flow',
  DASHBOARD: 'data-universe',
  ADMIN: 'data-grid',
  AUTH: 'portal',
};

export const PAGE_SCENE_MAP = {
  home: SCENE_KEYS.HOME,
  hackathons: SCENE_KEYS.HACKATHONS,
  hackathonDetail: SCENE_KEYS.HACKATHON_DETAIL,
  users: SCENE_KEYS.USERS,
  profile: SCENE_KEYS.PROFILE,
  postRequest: SCENE_KEYS.POST_REQUEST,
  myRequests: SCENE_KEYS.MY_REQUESTS,
  dashboard: SCENE_KEYS.DASHBOARD,
  admin: SCENE_KEYS.ADMIN,
  auth: SCENE_KEYS.AUTH,
};

/**
 * Route-to-Scene Matcher
 * Determines the ideal animation atmosphere for any given React Router pathname.
 */
export const getSceneForRoute = (pathname = '/') => {
  if (!pathname || pathname === '/') return SCENE_KEYS.HOME;
  if (pathname === '/hackathons') return SCENE_KEYS.HACKATHONS;
  if (pathname.startsWith('/hackathons/')) return SCENE_KEYS.HACKATHON_DETAIL;
  if (pathname === '/users' || pathname.startsWith('/users/')) return SCENE_KEYS.USERS;
  if (pathname === '/profile' || pathname.startsWith('/profile/') || pathname === '/edit-profile') return SCENE_KEYS.PROFILE;
  if (pathname === '/post-request' || pathname === '/team-requests/create') return SCENE_KEYS.POST_REQUEST;
  if (pathname === '/my-requests') return SCENE_KEYS.MY_REQUESTS;
  if (pathname === '/dashboard') return SCENE_KEYS.DASHBOARD;
  if (pathname.startsWith('/admin')) return SCENE_KEYS.ADMIN;
  if (pathname === '/login' || pathname === '/signup' || pathname === '/admin/login') return SCENE_KEYS.AUTH;
  if (pathname === '/notifications') return SCENE_KEYS.MY_REQUESTS;

  return SCENE_KEYS.HOME;
};

/**
 * Centralized Animation Intensity Presets
 */
export const ANIMATION_INTENSITY = {
  desktop: 1.0,
  mobile: 0.55,
  reducedMotion: 0.15,
};

/**
 * Device & Viewport Performance Presets
 */
export const PERFORMANCE_PROFILES = {
  desktop: {
    particleMultiplier: 1.0,
    intensity: ANIMATION_INTENSITY.desktop,
    dpr: [1, 1.5],
    blurQuality: 'high',
    enableSecondaryEffects: true,
  },
  laptop: {
    particleMultiplier: 0.85,
    intensity: 0.85,
    dpr: [1, 1.25],
    blurQuality: 'medium',
    enableSecondaryEffects: true,
  },
  tablet: {
    particleMultiplier: 0.65,
    intensity: 0.7,
    dpr: [1, 1.2],
    blurQuality: 'low',
    enableSecondaryEffects: false,
  },
  mobile: {
    particleMultiplier: 0.55,
    intensity: ANIMATION_INTENSITY.mobile,
    dpr: [1, 1],
    blurQuality: 'low',
    enableSecondaryEffects: false,
  },
};

/**
 * Resolves current device profile based on screen width
 */
export const getDeviceProfile = () => {
  if (typeof window === 'undefined') return PERFORMANCE_PROFILES.desktop;
  const w = window.innerWidth;
  if (w < 640) return PERFORMANCE_PROFILES.mobile;
  if (w < 1024) return PERFORMANCE_PROFILES.tablet;
  if (w < 1440) return PERFORMANCE_PROFILES.laptop;
  return PERFORMANCE_PROFILES.desktop;
};

/**
 * Scene Theme Palettes
 * Distinct visual signatures optimized for Dark (glowing/ethereal) and Light (vibrant/crisp) modes.
 */
export const SCENE_THEME_PALETTES = {
  [SCENE_KEYS.HOME]: {
    dark: {
      primary: '#818cf8',
      secondary: '#38bdf8',
      accent: '#c084fc',
      glow1: '#4338ca',
      glow2: '#0284c7',
      orb1: '#4f46e5',
      orb2: '#06b6d4',
      orb3: '#9333ea',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#4f46e5',
      secondary: '#0284c7',
      accent: '#7c3aed',
      glow1: '#c7d2fe',
      glow2: '#bae6fd',
      orb1: '#6366f1',
      orb2: '#38bdf8',
      orb3: '#a855f7',
      baseOpacity: 0.55,
    },
  },
  [SCENE_KEYS.HACKATHONS]: {
    dark: {
      primary: '#38bdf8',
      secondary: '#818cf8',
      accent: '#06b6d4',
      glow1: '#0284c7',
      glow2: '#6366f1',
      ring1: '#06b6d4',
      ring2: '#818cf8',
      ring3: '#c084fc',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#0284c7',
      secondary: '#4f46e5',
      accent: '#0891b2',
      glow1: '#bae6fd',
      glow2: '#c7d2fe',
      ring1: '#0284c7',
      ring2: '#4f46e5',
      ring3: '#7c3aed',
      baseOpacity: 0.55,
    },
  },
  [SCENE_KEYS.HACKATHON_DETAIL]: {
    dark: {
      primary: '#a78bfa',
      secondary: '#38bdf8',
      accent: '#6366f1',
      glow1: '#4f46e5',
      glow2: '#7c3aed',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#7c3aed',
      secondary: '#0284c7',
      accent: '#4f46e5',
      glow1: '#ddd6fe',
      glow2: '#bae6fd',
      baseOpacity: 0.55,
    },
  },
  [SCENE_KEYS.USERS]: {
    dark: {
      primary: '#38bdf8',
      secondary: '#818cf8',
      accent: '#34d399',
      cluster1: '#60a5fa',
      cluster2: '#a855f7',
      cluster3: '#34d399',
      glow1: '#0891b2',
      glow2: '#4f46e5',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#0284c7',
      secondary: '#4f46e5',
      accent: '#059669',
      cluster1: '#2563eb',
      cluster2: '#7c3aed',
      cluster3: '#059669',
      glow1: '#bae6fd',
      glow2: '#c7d2fe',
      baseOpacity: 0.55,
    },
  },
  [SCENE_KEYS.PROFILE]: {
    dark: {
      primary: '#818cf8',
      secondary: '#c084fc',
      accent: '#a78bfa',
      glow1: '#6366f1',
      glow2: '#a855f7',
      baseOpacity: 0.85,
    },
    light: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      accent: '#6366f1',
      glow1: '#c7d2fe',
      glow2: '#ddd6fe',
      baseOpacity: 0.6,
    },
  },
  [SCENE_KEYS.POST_REQUEST]: {
    dark: {
      primary: '#38bdf8',
      secondary: '#a855f7',
      accent: '#818cf8',
      glow1: '#6366f1',
      glow2: '#38bdf8',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#0284c7',
      secondary: '#7c3aed',
      accent: '#4f46e5',
      glow1: '#bae6fd',
      glow2: '#ddd6fe',
      baseOpacity: 0.55,
    },
  },
  [SCENE_KEYS.MY_REQUESTS]: {
    dark: {
      primary: '#38bdf8',
      secondary: '#818cf8',
      accent: '#7c3aed',
      glow1: '#0284c7',
      glow2: '#7c3aed',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#0284c7',
      secondary: '#4f46e5',
      accent: '#6d28d9',
      glow1: '#bae6fd',
      glow2: '#ddd6fe',
      baseOpacity: 0.55,
    },
  },
  [SCENE_KEYS.DASHBOARD]: {
    dark: {
      primary: '#818cf8',
      secondary: '#38bdf8',
      accent: '#06b6d4',
      glow1: '#4f46e5',
      glow2: '#06b6d4',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#4f46e5',
      secondary: '#0284c7',
      accent: '#0891b2',
      glow1: '#c7d2fe',
      glow2: '#bae6fd',
      baseOpacity: 0.55,
    },
  },
  [SCENE_KEYS.ADMIN]: {
    dark: {
      primary: '#6366f1',
      secondary: '#06b6d4',
      accent: '#312e81',
      gridColor: '#1e1b4b',
      glow1: '#312e81',
      glow2: '#0369a1',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#4f46e5',
      secondary: '#0284c7',
      accent: '#cbd5e1',
      gridColor: '#e2e8f0',
      glow1: '#c7d2fe',
      glow2: '#bae6fd',
      baseOpacity: 0.55,
    },
  },
  [SCENE_KEYS.AUTH]: {
    dark: {
      primary: '#c084fc',
      secondary: '#818cf8',
      accent: '#6366f1',
      glow1: '#6366f1',
      glow2: '#a855f7',
      baseOpacity: 0.8,
    },
    light: {
      primary: '#7c3aed',
      secondary: '#4f46e5',
      accent: '#6366f1',
      glow1: '#ddd6fe',
      glow2: '#c7d2fe',
      baseOpacity: 0.55,
    },
  },
};

/**
 * Returns theme-specific palette for a given scene
 */
export const getSceneThemePalette = (sceneKey, theme = 'dark') => {
  const mode = theme === 'light' ? 'light' : 'dark';
  const scenePalette = SCENE_THEME_PALETTES[sceneKey] || SCENE_THEME_PALETTES[SCENE_KEYS.HOME];
  return scenePalette[mode];
};

/**
 * Cinematic Color Palettes for 3D Shaders & Particles
 */
export const ANIMATION_PALETTES = {
  cyberIndigo: ['#6366f1', '#8b5cf6', '#3b82f6', '#a855f7'],
  auroraCyan: ['#06b6d4', '#0ea5e9', '#6366f1', '#10b981'],
  amberSolar: ['#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  emeraldMatrix: ['#10b981', '#06b6d4', '#3b82f6', '#059669'],
  deepSpace: ['#1e1b4b', '#0f172a', '#312e81', '#030712'],
};

