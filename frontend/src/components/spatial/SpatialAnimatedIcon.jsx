import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * ICON_ANIMATION_MAP - Semantic mapping of Lucide icons to their bespoke motion behaviors.
 * Conforms to Emil Kowalski + Apple Design engineering principles.
 * 
 * Motion-driven (whileHover): primary interactive icons — held state while hovering,
 * smooth spring return on leave.
 * 
 * CSS-fallback (parent-hover / choreography): icons inside cards/buttons that animate
 * in response to a parent's hover without direct pointer contact.
 */
export const ICON_ANIMATION_MAP = {
  // Navigation & Actions
  ArrowRight: 'pointing',
  ArrowLeft: 'pointing-left',
  ExternalLink: 'outward',
  Plus: 'rotate-expand',
  PlusCircle: 'rotate-expand',
  Search: 'magnify',
  Bell: 'signal',
  Send: 'launch',
  Check: 'pop',
  CheckCircle: 'pop',
  CheckCircle2: 'pop',
  X: 'cross',
  XCircle: 'cross',
  ChevronDown: 'rotate',
  ChevronRight: 'glide-right',
  ChevronLeft: 'glide-left',
  ChevronUp: 'rotate-up',
  Filter: 'tilt',

  // Cards & Meaningful Content
  Trophy: 'lift',
  Calendar: 'calendar-tick',
  MapPin: 'bounce',
  Clock: 'tick',
  Sparkles: 'sparkle',
  Users: 'group',
  UserCheck: 'pop',
  MessageSquare: 'bubble',
  Mail: 'rise',
  Globe: 'orbit',
  Code: 'bracket',
  Code2: 'bracket',
  Share2: 'bloom',
  RefreshCw: 'spin-once',
  Edit: 'tilt',
  Trash: 'bounce',
  Trash2: 'bounce',
  FileText: 'calendar-tick',
  Sun: 'rotate-expand',
  Moon: 'tilt',
  FolderKanban: 'bubble',
  Inbox: 'bubble',
  LayoutDashboard: 'micro-lift',
  LogOut: 'pointing-left',
  ShieldAlert: 'tilt',
  ShieldCheck: 'pop',
  Shield: 'micro-lift',
};

/**
 * Motion variants for whileHover — the "held state" while pointer is inside.
 * On hover leave, Motion spring-returns to the base (rest) variant.
 * 
 * Design constraints per Emil:
 * - transform & opacity only (GPU-composited)
 * - ease-out on entrance; spring on return  
 * - amplitude: clearly perceptible at normal viewing distance
 * - no infinite loops, no continuous animation
 */
const HOVER_VARIANTS = {
  rest: { 
    transform: 'translate(0px, 0px) rotate(0deg) scale(1)',
    transition: { 
      type: 'spring', 
      duration: 0.35, 
      bounce: 0.1 
    }
  },

  magnify: {
    transform: 'translate(3px, -3px) rotate(-8deg) scale(1.10)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.15 
    }
  },

  signal: {
    // Bell swing: animate via keyframes (oscillation) then settle
    // We use a CSS keyframe for the swing itself but hold a subtle emphasized state via Motion
    transform: 'translate(0px, -1px) rotate(0deg) scale(1.06)',
    transition: { 
      type: 'spring', 
      duration: 0.45, 
      bounce: 0.2 
    }
  },

  pointing: {
    transform: 'translate(6px, 0px) rotate(0deg) scale(1)',
    transition: { 
      type: 'spring', 
      duration: 0.38, 
      bounce: 0.2 
    }
  },

  'pointing-left': {
    transform: 'translate(-6px, 0px) rotate(0deg) scale(1)',
    transition: { 
      type: 'spring', 
      duration: 0.38, 
      bounce: 0.2 
    }
  },

  'rotate-expand': {
    transform: 'translate(0px, 0px) rotate(90deg) scale(1.10)',
    transition: { 
      type: 'spring', 
      duration: 0.5, 
      bounce: 0.2 
    }
  },

  lift: {
    transform: 'translate(0px, -5px) rotate(-4deg) scale(1.08)',
    transition: { 
      type: 'spring', 
      duration: 0.45, 
      bounce: 0.25 
    }
  },

  'calendar-tick': {
    transform: 'translate(0px, -4px) rotate(0deg) scale(1.06)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.2 
    }
  },

  bounce: {
    transform: 'translate(0px, -5px) rotate(0deg) scale(1.05)',
    transition: { 
      type: 'spring', 
      duration: 0.45, 
      bounce: 0.4 
    }
  },

  tick: {
    transform: 'translate(0px, 0px) rotate(28deg) scale(1)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.15 
    }
  },

  group: {
    transform: 'translate(0px, -2px) rotate(0deg) scale(1.12)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.2 
    }
  },

  sparkle: {
    transform: 'translate(0px, 0px) rotate(18deg) scale(1.18)',
    transition: { 
      type: 'spring', 
      duration: 0.45, 
      bounce: 0.25 
    }
  },

  launch: {
    transform: 'translate(5px, -5px) rotate(0deg) scale(1.10)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.15 
    }
  },

  outward: {
    transform: 'translate(4px, -4px) rotate(0deg) scale(1.06)',
    transition: { 
      type: 'spring', 
      duration: 0.38, 
      bounce: 0.15 
    }
  },

  pop: {
    transform: 'translate(0px, 0px) rotate(0deg) scale(1.20)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.35 
    }
  },

  cross: {
    transform: 'translate(0px, 0px) rotate(90deg) scale(1.08)',
    transition: { 
      type: 'spring', 
      duration: 0.35, 
      bounce: 0.1 
    }
  },

  tilt: {
    transform: 'translate(0px, -2px) rotate(-14deg) scale(1.08)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.2 
    }
  },

  bubble: {
    transform: 'translate(0px, -3px) rotate(0deg) scale(1.16)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.3 
    }
  },

  rise: {
    transform: 'translate(0px, -4px) rotate(0deg) scale(1.05)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.2 
    }
  },

  orbit: {
    transform: 'translate(0px, 0px) rotate(28deg) scale(1.06)',
    transition: { 
      type: 'spring', 
      duration: 0.5, 
      bounce: 0.1 
    }
  },

  bracket: {
    transform: 'translate(0px, 0px) rotate(0deg) scale(1.18)',
    transition: { 
      type: 'spring', 
      duration: 0.4, 
      bounce: 0.25 
    }
  },

  bloom: {
    transform: 'translate(0px, 0px) rotate(10deg) scale(1.14)',
    transition: { 
      type: 'spring', 
      duration: 0.42, 
      bounce: 0.2 
    }
  },

  'spin-once': {
    transform: 'translate(0px, 0px) rotate(180deg) scale(1)',
    transition: { 
      type: 'spring', 
      duration: 0.6, 
      bounce: 0.1 
    }
  },

  'micro-lift': {
    transform: 'translate(0px, -3px) rotate(0deg) scale(1.06)',
    transition: { 
      type: 'spring', 
      duration: 0.35, 
      bounce: 0.2 
    }
  },

  'glide-right': {
    transform: 'translate(4px, 0px) rotate(0deg) scale(1)',
    transition: { 
      type: 'spring', 
      duration: 0.35, 
      bounce: 0.25 
    }
  },

  'glide-left': {
    transform: 'translate(-4px, 0px) rotate(0deg) scale(1)',
    transition: { 
      type: 'spring', 
      duration: 0.35, 
      bounce: 0.25 
    }
  },

  // State-controlled rotation (ChevronDown in dropdowns) — not hover, uses data-state
  rotate: {
    transform: 'translate(0px, 0px) rotate(0deg) scale(1)',
  },
  'rotate-open': {
    transform: 'translate(0px, 0px) rotate(180deg) scale(1)',
    transition: { type: 'spring', duration: 0.4, bounce: 0.1 }
  },
};

/**
 * Transform origins for correct physics pivot points
 */
const TRANSFORM_ORIGINS = {
  signal: '50% 15%',   // Bell pivot at top (clapper)
  bounce: '50% 90%',   // MapPin anchored at tip
  lift: '50% 90%',     // Trophy lifts from base
  launch: '20% 80%',   // Send launches from lower-left
  outward: '20% 80%',  // ExternalLink diagonal
  tilt: '50% 10%',     // Tilt from top
  'calendar-tick': '50% 10%',
};

/**
 * SpatialAnimatedIcon — Motion-Driven Premium Animated Icon System.
 *
 * Architecture (Step 4.5E):
 * - trigger="hover": uses Motion whileHover variants → held state + spring return
 * - trigger="parent-hover": CSS animation on parent hover (cards/buttons)
 * - trigger="state": Motion animate prop for controlled state (chevron rotation)
 * - trigger="tap": Motion whileTap press feedback
 */
export const SpatialAnimatedIcon = React.forwardRef(({
  icon: Icon,
  animation,
  trigger = 'hover',
  isActive = false,
  isOpen = false,
  choreography = 'none',
  size = null,
  className = '',
  disabled = false,
  'aria-hidden': ariaHidden = true,
  ...props
}, ref) => {
  const shouldReduceMotion = useReducedMotion();

  if (!Icon) return null;

  // Infer animation from Icon name or displayName if not explicitly supplied
  const iconName = Icon.displayName || Icon.name || '';
  const resolvedAnimation = animation || ICON_ANIMATION_MAP[iconName] || 'micro-lift';

  const isStateActive = Boolean(isActive || isOpen);

  // Size styling helper
  const sizeClass = typeof size === 'string' ? {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }[size] || '' : '';

  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {};

  // CSS fallback trigger for parent-hover (card choreography) — unchanged
  const triggerAttr = disabled ? 'none' : trigger;

  // Get transform origin for correct physics
  const transformOrigin = TRANSFORM_ORIGINS[resolvedAnimation] || '50% 50%';

  // For Motion-driven hover trigger: use whileHover variant
  if (trigger === 'hover' && !disabled && !shouldReduceMotion) {
    const hoverVariant = HOVER_VARIANTS[resolvedAnimation] || HOVER_VARIANTS['micro-lift'];
    const restVariant = HOVER_VARIANTS.rest;

    return (
      <span
        ref={ref}
        className={`spatial-animated-icon inline-flex items-center justify-center shrink-0 ${className}`}
        data-animation={resolvedAnimation}
        data-trigger={triggerAttr}
        data-choreography={choreography}
        data-state={isStateActive ? 'open' : 'closed'}
        style={sizeStyle}
        aria-hidden={ariaHidden}
        {...props}
      >
        <motion.span
          className={`spatial-icon-svg-wrapper inline-flex items-center justify-center w-full h-full`}
          style={{ transformOrigin, display: 'contents' }}
          variants={{ rest: restVariant, hover: hoverVariant }}
          initial="rest"
          whileHover="hover"
          whileTap={{ transform: 'translate(0px, 0px) rotate(0deg) scale(0.92)', transition: { duration: 0.12, ease: 'easeOut' } }}
        >
          <Icon
            className={`spatial-icon-svg ${sizeClass || 'w-full h-full'}`}
            style={{ display: 'block' }}
          />
        </motion.span>
      </span>
    );
  }

  // For state-controlled (chevron in dropdowns)
  if (trigger === 'state' && !disabled && !shouldReduceMotion) {
    return (
      <span
        ref={ref}
        className={`spatial-animated-icon inline-flex items-center justify-center shrink-0 ${className}`}
        data-animation={resolvedAnimation}
        data-trigger={triggerAttr}
        data-choreography={choreography}
        data-state={isStateActive ? 'open' : 'closed'}
        style={sizeStyle}
        aria-hidden={ariaHidden}
        {...props}
      >
        <motion.span
          className="inline-flex items-center justify-center w-full h-full"
          style={{ transformOrigin: '50% 50%', display: 'contents' }}
          animate={{
            transform: isStateActive 
              ? 'translate(0px, 0px) rotate(180deg) scale(1)' 
              : 'translate(0px, 0px) rotate(0deg) scale(1)',
          }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
        >
          <Icon
            className={`spatial-icon-svg ${sizeClass || 'w-full h-full'}`}
            style={{ display: 'block' }}
          />
        </motion.span>
      </span>
    );
  }

  // CSS fallback: parent-hover trigger (card choreography) or reduced motion
  return (
    <span
      ref={ref}
      className={`spatial-animated-icon inline-flex items-center justify-center shrink-0 ${className}`}
      data-animation={resolvedAnimation}
      data-trigger={triggerAttr}
      data-choreography={choreography}
      data-state={isStateActive ? 'open' : 'closed'}
      style={sizeStyle}
      aria-hidden={ariaHidden}
      {...props}
    >
      <Icon
        className={`spatial-icon-svg ${sizeClass || 'w-full h-full'}`}
        style={{ transformOrigin, display: 'block' }}
      />
    </span>
  );
});

SpatialAnimatedIcon.displayName = 'SpatialAnimatedIcon';

export default SpatialAnimatedIcon;
