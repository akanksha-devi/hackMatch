/**
 * HackMatch Design System - Central Semantic Tokens
 * Single source of truth for surfaces, text, borders, accents, typography, spacing, radius, elevation, and motion.
 */

export const RADIUS = {
  small: 'rounded-lg',    // 8px - Tooltips, sub-controls, inner tags
  control: 'rounded-xl',  // 12px - Buttons, inputs, dropdowns, date pickers, filter tabs
  card: 'rounded-2xl',    // 16px - Cards, panels, user items, modals
  large: 'rounded-3xl',   // 24px - Banners, dashboard overview, dialog containers
  pill: 'rounded-full',   // 9999px - Skill chips, status badges, verification badges, circular avatars
};

export const SPACING = {
  controlHeight: {
    sm: 'h-8 min-h-[32px]',
    md: 'h-10 min-h-[40px]',
    lg: 'h-12 min-h-[48px]',
  },
  chipHeight: {
    sm: 'min-h-[22px]',
    md: 'min-h-[26px]',
    lg: 'min-h-[32px]',
  },
  chipPadding: {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-medium',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  },
  buttonPadding: {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm font-semibold gap-2',
    lg: 'px-6 py-3 text-sm sm:text-base font-bold gap-2.5',
  },
  iconButtonPadding: {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  },
  inputPadding: {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  },
};

export const TYPOGRAPHY = {
  display: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
  heading: 'text-xl sm:text-2xl font-bold tracking-tight',
  subheading: 'text-base sm:text-lg font-semibold',
  body: 'text-sm font-normal leading-relaxed',
  label: 'text-xs font-semibold tracking-wide',
  caption: 'text-[11px] font-medium text-slate-500 dark:text-gray-400',
  button: 'text-xs sm:text-sm font-semibold select-none',
  chip: 'text-xs font-medium select-none',
  mono: 'font-mono text-xs',
};

export const MOTION = {
  duration: {
    micro: 'duration-120',      // 120ms - Press, active, toggle, scale tick
    standard: 'duration-180',   // 180ms - Hover, focus, transitions
    enter: 'duration-220',      // 220ms - Popovers, menus, entrances
    exit: 'duration-140',       // 140ms - Popover dismiss, swift exit
    modal: 'duration-260',      // 260ms - Dialogs, full command palette
  },
  easing: {
    standard: 'cubic-bezier(0.23, 1, 0.32, 1)', // Emil Kowalski deceleration
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',     // Apple fluid physical settle
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  },
  scale: {
    press: 'scale-[0.97]',
    lift: 'scale-[1.01]',
  },
  hoverLift: 'hover:-translate-y-0.5 transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
  activePress: 'active:translate-y-0 active:scale-[0.97] transition-all duration-[120ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
  reducedMotion: 'motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none',
};

export const FOCUS = {
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  ringDanger: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  ringControl: 'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40',
};

export const ACCENTS = {
  indigo: {
    name: 'indigo',
    text: 'text-indigo-700 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-200 dark:border-indigo-500/30',
  },
  cyan: {
    name: 'cyan',
    text: 'text-cyan-800 dark:text-cyan-300',
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-cyan-200 dark:border-cyan-500/30',
  },
  emerald: {
    name: 'emerald',
    text: 'text-emerald-800 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/30',
  },
  amber: {
    name: 'amber',
    text: 'text-amber-800 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  rose: {
    name: 'rose',
    text: 'text-rose-800 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/30',
  },
  purple: {
    name: 'purple',
    text: 'text-purple-800 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/30',
  },
  slate: {
    name: 'slate',
    text: 'text-slate-700 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700',
  },
};

export const ELEVATION = {
  flat: 'shadow-none',
  control: 'shadow-xs dark:shadow-none',
  card: 'shadow-sm dark:shadow-lg dark:shadow-black/40',
  floating: 'shadow-md dark:shadow-xl dark:shadow-black/50',
  modal: 'shadow-2xl dark:shadow-black/70',
};

/**
 * Liquid Glass Material Engine (Step 4.0A Prototype)
 * Centralized specifications for optical refraction, translucency, blur, saturation,
 * border opacity, inner highlight, and layered depth.
 */
export const LIQUID_GLASS = {
  flat: {
    tier: 1,
    name: 'glass-flat',
    blur: '12px',
    saturate: '130%',
    contrast: '100%',
    refractionScale: 0,
    radius: RADIUS.card,
    dark: {
      translucency: 0.25,
      bg: 'rgba(15, 23, 42, 0.25)',
      borderOpacity: 0.08,
      border: 'rgba(255, 255, 255, 0.08)',
      highlight: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      shadow: '0 2px 10px -2px rgba(0, 0, 0, 0.25)',
      className: 'liquid-glass-flat',
    },
    light: {
      translucency: 0.35,
      bg: 'rgba(255, 255, 255, 0.35)',
      borderOpacity: 0.50,
      border: 'rgba(203, 213, 225, 0.50)',
      highlight: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.85)',
      shadow: '0 2px 8px -2px rgba(15, 23, 42, 0.03)',
      className: 'liquid-glass-flat',
    },
    classes: 'liquid-glass-flat',
  },
  raised: {
    tier: 2,
    name: 'glass-raised',
    blur: '18px',
    saturate: '150%',
    contrast: '105%',
    refractionScale: 0,
    radius: RADIUS.card,
    dark: {
      translucency: 0.40,
      bg: 'rgba(15, 23, 42, 0.40)',
      borderOpacity: 0.12,
      border: 'rgba(255, 255, 255, 0.12)',
      highlight: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.20)',
      shadow: '0 12px 32px -8px rgba(0, 0, 0, 0.55)',
      className: 'liquid-glass-raised',
    },
    light: {
      translucency: 0.55,
      bg: 'rgba(255, 255, 255, 0.55)',
      borderOpacity: 0.65,
      border: 'rgba(203, 213, 225, 0.65)',
      highlight: 'inset 0 1px 0 0 #ffffff',
      shadow: '0 12px 30px -6px rgba(15, 23, 42, 0.07)',
      className: 'liquid-glass-raised',
    },
    classes: 'liquid-glass-raised',
  },
  floating: {
    tier: 3,
    name: 'glass-floating',
    blur: '20px',
    saturate: '160%',
    contrast: '108%',
    refractionScale: 0,
    radius: RADIUS.card,
    dark: {
      translucency: 0.48,
      bg: 'rgba(15, 23, 42, 0.48)',
      borderOpacity: 0.16,
      border: 'rgba(255, 255, 255, 0.16)',
      highlight: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.26)',
      shadow: '0 20px 48px -10px rgba(0, 0, 0, 0.65)',
      className: 'liquid-glass-floating',
    },
    light: {
      translucency: 0.66,
      bg: 'rgba(255, 255, 255, 0.66)',
      borderOpacity: 0.75,
      border: 'rgba(203, 213, 225, 0.75)',
      highlight: 'inset 0 1px 1px 0 #ffffff',
      shadow: '0 18px 40px -8px rgba(15, 23, 42, 0.09)',
      className: 'liquid-glass-floating',
    },
    classes: 'liquid-glass-floating',
  },
  refraction: {
    tier: 4,
    name: 'glass-refraction',
    blur: '20px',
    saturate: '165%',
    contrast: '115%',
    refractionScale: 6,
    filterId: 'liquid-glass-refract',
    radius: RADIUS.card,
    dark: {
      translucency: 0.48,
      bg: 'rgba(15, 23, 42, 0.48)',
      borderOpacity: 0.24,
      border: 'rgba(255, 255, 255, 0.24)',
      highlight: 'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35)',
      shadow: '0 28px 64px -12px rgba(0, 0, 0, 0.85)',
      className: 'liquid-glass-refraction',
    },
    light: {
      translucency: 0.62,
      bg: 'rgba(255, 255, 255, 0.62)',
      borderOpacity: 0.90,
      border: 'rgba(203, 213, 225, 0.90)',
      highlight: 'inset 0 1.5px 2px 0 #ffffff',
      shadow: '0 24px 56px -10px rgba(15, 23, 42, 0.16)',
      className: 'liquid-glass-refraction',
    },
    classes: 'liquid-glass-refraction',
  },
};

export default {
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  MOTION,
  FOCUS,
  ACCENTS,
  ELEVATION,
  LIQUID_GLASS,
};

