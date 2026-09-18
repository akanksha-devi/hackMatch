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
 * Device & Viewport Performance Presets
 */
export const PERFORMANCE_PROFILES = {
  desktop: {
    particleMultiplier: 1.0,
    dpr: [1, 1.5],
    blurQuality: 'high',
    enableSecondaryEffects: true,
  },
  laptop: {
    particleMultiplier: 0.75,
    dpr: [1, 1.25],
    blurQuality: 'medium',
    enableSecondaryEffects: true,
  },
  tablet: {
    particleMultiplier: 0.5,
    dpr: [1, 1.2],
    blurQuality: 'low',
    enableSecondaryEffects: false,
  },
  mobile: {
    particleMultiplier: 0.25,
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
 * Cinematic Color Palettes for 3D Shaders & Particles
 */
export const ANIMATION_PALETTES = {
  cyberIndigo: ['#6366f1', '#8b5cf6', '#3b82f6', '#a855f7'],
  auroraCyan: ['#06b6d4', '#0ea5e9', '#6366f1', '#10b981'],
  amberSolar: ['#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  emeraldMatrix: ['#10b981', '#06b6d4', '#3b82f6', '#059669'],
  deepSpace: ['#1e1b4b', '#0f172a', '#312e81', '#030712'],
};
