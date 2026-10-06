import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { RADIUS } from '../design-system/tokens';

const GRADIENTS = [
  'from-indigo-600 via-indigo-500 to-purple-600',
  'from-cyan-600 via-teal-500 to-indigo-600',
  'from-purple-600 via-violet-500 to-indigo-600',
  'from-blue-600 via-indigo-500 to-violet-600',
  'from-emerald-600 via-teal-500 to-cyan-600',
];

const getDeterministicGradient = (str) => {
  if (!str) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

const getMonogram = (str) => {
  if (!str || typeof str !== 'string') return 'U';
  const trimmed = str.trim();
  if (!trimmed) return 'U';
  const parts = trimmed.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, Math.min(2, trimmed.length)).toUpperCase();
};

/**
 * Avatar - Canonical user avatar component with deterministic monogram fallback and verification indicator.
 * Sizing: 'xs' (24px), 'sm' (32px), 'md' (40px), 'lg' (48px), 'xl' (64px), '2xl' (96/112px).
 * Variants: 'ring' (default) | 'plain'.
 */
export const Avatar = React.forwardRef(({
  src = null,
  name = 'User',
  size = 'md',
  variant = 'ring',
  ring = true,
  verified = false,
  alt,
  className = '',
  ...props
}, ref) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const isRing = variant === 'ring' && ring !== false;

  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
  }[size] || 'w-10 h-10 text-sm';

  const ringStyles = isRing
    ? 'ring-2 ring-indigo-500/30 dark:ring-indigo-500/40 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]'
    : 'border border-slate-200/90 dark:border-white/10 shadow-xs';


  const verifiedSizeStyles = {
    xs: 'w-2 h-2 -bottom-0.5 -right-0.5 ring-1',
    sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5 ring-1.5',
    md: 'w-3 h-3 bottom-0 right-0 ring-2',
    lg: 'w-3.5 h-3.5 bottom-0 right-0 ring-2',
    xl: 'w-4.5 h-4.5 bottom-0.5 right-0.5 ring-2',
    '2xl': 'w-6 h-6 sm:w-7 sm:h-7 bottom-1 right-1 ring-2',
  }[size] || 'w-3 h-3 bottom-0 right-0 ring-2';

  const hasValidImage = Boolean(src) && !imageError;
  const resolvedAlt = alt !== undefined ? alt : (name ? `${name}'s profile photo` : 'User avatar');
  const gradient = getDeterministicGradient(name);
  const monogram = getMonogram(name);

  return (
    <div
      ref={ref}
      className={`relative inline-flex items-center justify-center shrink-0 ${RADIUS.pill} select-none ${className}`}
      {...props}
    >
      {hasValidImage ? (
        <img
          src={src}
          alt={resolvedAlt}
          decoding="async"
          loading="lazy"
          onError={() => setImageError(true)}
          className={`${sizeStyles} ${RADIUS.pill} object-cover ${ringStyles} bg-slate-100 dark:bg-gray-800`}
        />
      ) : (
        <div
          role="img"
          aria-label={resolvedAlt}
          className={`${sizeStyles} ${RADIUS.pill} ${ringStyles} bg-gradient-to-tr ${gradient} text-white font-bold tracking-tight flex items-center justify-center shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35)]`}
        >

          {monogram}
        </div>
      )}

      {verified && (
        <span
          className={`absolute ${verifiedSizeStyles} rounded-full bg-emerald-500 ring-white dark:ring-slate-900 flex items-center justify-center`}
          title="Verified Experience"
        >
          {(size === 'xl' || size === '2xl') ? (
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white stroke-[3]" />
          ) : (
            <span className="sr-only">Verified Experience</span>
          )}
        </span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
