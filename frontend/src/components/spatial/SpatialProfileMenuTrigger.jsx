import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Avatar } from '../Avatar';
import { RADIUS, FOCUS, MOTION } from '../../design-system/tokens';
import { SpatialAnimatedIcon } from './SpatialAnimatedIcon';

/**
 * SpatialProfileMenuTrigger - Canonical compound trigger for user profile dropdown menus.
 * Composes the avatar, truncated user identity, animated stateful chevron, and spatial interaction states.
 */
export const SpatialProfileMenuTrigger = React.forwardRef(({
  user,
  isOpen = false,
  onClick,
  disabled = false,
  className = '',
  size = 'md', // 'sm' | 'md'
  ...props
}, ref) => {
  const heightClass = size === 'sm' ? 'h-8 min-h-[32px]' : 'h-10 min-h-[40px]';
  const paddingClass = size === 'sm' ? 'pl-1 pr-2 py-0.5' : 'pl-1.5 pr-2.5 py-1';
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';
  const chevronSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label={user?.name ? `${user.name} profile menu` : 'User profile menu'}
      className={`group shrink-0 inline-flex items-center gap-2 ${heightClass} ${paddingClass} ${RADIUS.control} border transition-all ${MOTION.duration.standard} ease-out select-none cursor-pointer box-border ${FOCUS.ring} ${MOTION.activePress} ${MOTION.hoverLift} ${MOTION.reducedMotion} disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none bg-white/70 dark:bg-slate-900/60 backdrop-blur-md backdrop-saturate-140 border-slate-200/80 dark:border-white/10 hover:border-indigo-400/60 dark:hover:border-indigo-400/50 hover:shadow-[0_0_16px_-3px_rgba(99,102,241,0.25)] hover:bg-white/90 dark:hover:bg-slate-800/70 text-slate-800 dark:text-gray-200 shadow-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
      {...props}
    >
      <div className="rounded-full ring-1 ring-transparent group-hover:ring-indigo-400/60 transition-all duration-180 shrink-0 flex items-center justify-center">
        <Avatar
          src={user?.avatarUrl}
          name={user?.name}
          size="sm"
          verified={user?.experienceVerificationStatus === 'Verified' || user?.isVerified}
        />
      </div>
      <span className={`${textClass} font-medium text-slate-900 dark:text-gray-200 max-w-[110px] truncate whitespace-nowrap group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-180`}>
        {user?.name || 'Account'}
      </span>
      <SpatialAnimatedIcon
        icon={ChevronDown}
        animation="rotate"
        trigger="state"
        isActive={isOpen}
        className={`${chevronSize} text-slate-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 shrink-0`}
        aria-hidden="true"
      />
    </button>
  );
});

SpatialProfileMenuTrigger.displayName = 'SpatialProfileMenuTrigger';

export default SpatialProfileMenuTrigger;
