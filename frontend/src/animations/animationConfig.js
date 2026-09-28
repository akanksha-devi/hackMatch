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
      slate: '#94a3b8',
      glow1: '#4338ca',
      glow2: '#0284c7',
      orb1: '#4f46e5',
      orb2: '#06b6d4',
      orb3: '#9333ea',
      baseOpacity: 0.88,
    },
    light: {
      primary: '#3730a3',      // Deep saturated indigo (high visibility on light)
      secondary: '#0284c7',    // Radiant azure blue
      accent: '#6d28d9',       // Deep royal violet
      slate: '#475569',        // Sophisticated cool slate
      glow1: '#38bdf8',        // Soft sky volumetric illumination
      glow2: '#818cf8',        // Soft periwinkle volumetric illumination
      orb1: '#4f46e5',
      orb2: '#0284c7',
      orb3: '#7c3aed',
      baseOpacity: 0.92,
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
      baseOpacity: 0.88,
    },
    light: {
      primary: '#0369a1',
      secondary: '#4338ca',
      accent: '#0891b2',
      glow1: '#38bdf8',
      glow2: '#818cf8',
      ring1: '#0284c7',
      ring2: '#4338ca',
      ring3: '#6d28d9',
      baseOpacity: 0.92,
    },
  },
  [SCENE_KEYS.HACKATHON_DETAIL]: {
    dark: {
      primary: '#a78bfa',
      secondary: '#38bdf8',
      accent: '#6366f1',
      glow1: '#4f46e5',
      glow2: '#7c3aed',
      baseOpacity: 0.88,
    },
    light: {
      primary: '#6d28d9',
      secondary: '#0284c7',
      accent: '#4338ca',
      glow1: '#818cf8',
      glow2: '#38bdf8',
      baseOpacity: 0.92,
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
      baseOpacity: 0.88,
    },
    light: {
      primary: '#0284c7',
      secondary: '#4338ca',
      accent: '#059669',
      cluster1: '#1d4ed8',
      cluster2: '#6d28d9',
      cluster3: '#047857',
      glow1: '#38bdf8',
      glow2: '#818cf8',
      baseOpacity: 0.92,
    },
  },
  [SCENE_KEYS.PROFILE]: {
    dark: {
      primary: '#818cf8',
      secondary: '#c084fc',
      accent: '#a78bfa',
      glow1: '#6366f1',
      glow2: '#a855f7',
      baseOpacity: 0.9,
    },
    light: {
      primary: '#4338ca',
      secondary: '#6d28d9',
      accent: '#4f46e5',
      glow1: '#818cf8',
      glow2: '#c084fc',
      baseOpacity: 0.92,
    },
  },
  [SCENE_KEYS.POST_REQUEST]: {
    dark: {
      primary: '#38bdf8',
      secondary: '#a855f7',
      accent: '#818cf8',
      glow1: '#6366f1',
      glow2: '#38bdf8',
      baseOpacity: 0.88,
    },
    light: {
      primary: '#0284c7',
      secondary: '#6d28d9',
      accent: '#4338ca',
      glow1: '#38bdf8',
      glow2: '#818cf8',
      baseOpacity: 0.92,
    },
  },
  [SCENE_KEYS.MY_REQUESTS]: {
    dark: {
      primary: '#38bdf8',
      secondary: '#818cf8',
      accent: '#7c3aed',
      glow1: '#0284c7',
      glow2: '#7c3aed',
      baseOpacity: 0.88,
    },
    light: {
      primary: '#0284c7',
      secondary: '#4338ca',
      accent: '#6d28d9',
      glow1: '#38bdf8',
      glow2: '#818cf8',
      baseOpacity: 0.92,
    },
  },
  [SCENE_KEYS.DASHBOARD]: {
    dark: {
      primary: '#818cf8',
      secondary: '#38bdf8',
      accent: '#06b6d4',
      glow1: '#4f46e5',
      glow2: '#06b6d4',
      baseOpacity: 0.88,
    },
    light: {
      primary: '#4338ca',
      secondary: '#0284c7',
      accent: '#0891b2',
      glow1: '#818cf8',
      glow2: '#38bdf8',
      baseOpacity: 0.92,
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
      baseOpacity: 0.88,
    },
    light: {
      primary: '#4338ca',
      secondary: '#0284c7',
      accent: '#94a3b8',
      gridColor: '#cbd5e1',
      glow1: '#818cf8',
      glow2: '#38bdf8',
      baseOpacity: 0.92,
    },
  },
  [SCENE_KEYS.AUTH]: {
    dark: {
      primary: '#c084fc',
      secondary: '#818cf8',
      accent: '#6366f1',
      glow1: '#6366f1',
      glow2: '#a855f7',
      baseOpacity: 0.88,
    },
    light: {
      primary: '#6d28d9',
      secondary: '#4338ca',
      accent: '#0284c7',
      glow1: '#818cf8',
      glow2: '#38bdf8',
      baseOpacity: 0.92,
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

