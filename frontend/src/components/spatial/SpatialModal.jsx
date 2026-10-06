import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SpatialIconButton } from './SpatialIconButton';

/**
 * SpatialModal - Viewport-anchored floating glass modal rendered via React Portal.
 * Breaks out of ancestor transforms/overflows to guarantee true viewport centering,
 * backdrop blur, internal scrolling, and jitter-free body scroll locking.
 */
export const SpatialModal = ({
  isOpen = false,
  onClose,
  title = '',
  subtitle = '',
  icon: Icon = null,
  maxWidth = 'max-w-2xl', // 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl'
  children,
  footer = null,
  preventBackdropClose = false,
  className = '',
}) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const modalRef = useRef(null);

  // Lock body scroll and coordinate floating popovers
  useEffect(() => {
    if (!isOpen) return;

    // Close any open floating menus (notifications, profile, dropdowns, calendars)
    window.dispatchEvent(new CustomEvent('close-all-popovers'));

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalNode = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none"
      aria-modal="true"
      role="dialog"
    >
      {/* Translucent Animated Backdrop */}
      <div
        className={`fixed inset-0 modal-backdrop-anim transition-opacity duration-300 ${
          isLight ? 'bg-slate-900/30 backdrop-blur-sm' : 'bg-black/70 backdrop-blur-sm'
        }`}
        onClick={() => {
          if (!preventBackdropClose && onClose) onClose();
        }}
        aria-hidden="true"
      />

      {/* Floating Spatial Modal Shell (Liquid Glass Refraction Tier 4) */}
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} max-h-[85vh] sm:max-h-[82vh] flex flex-col rounded-3xl modal-shell-anim relative z-10 overflow-hidden liquid-glass-refraction ${
          isLight
            ? 'text-slate-900 shadow-slate-400/30'
            : 'text-white shadow-black/80'
        } ${className}`}
      >
        {/* Top Decorative Ambient Accent Line */}
        <div className="h-[1.5px] w-full bg-gradient-to-r from-white/30 via-indigo-400/40 to-cyan-400/30 dark:from-white/20 dark:via-indigo-300/30 dark:to-cyan-300/20 opacity-80 shrink-0" />

        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isLight ? 'border-slate-200/80 bg-slate-50/50' : 'border-white/10 bg-white/[0.02]'
          }`}
        >

          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isLight
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                    : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className={`text-lg sm:text-xl font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <SpatialIconButton
            icon={X}
            label="Close"
            variant="ghost"
            size="sm"
            onClick={onClose}
            tooltip="Close modal (Esc)"
          />
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin space-y-4 select-text">
          {children}
        </div>

        {/* Optional Sticky Footer Actions */}
        {footer && (
          <div
            className={`px-6 py-4 border-t shrink-0 flex items-center justify-end gap-3 ${
              isLight ? 'border-slate-200/80 bg-slate-50/60' : 'border-white/10 bg-white/[0.02]'
            }`}

          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalNode, document.body)
    : null;
};

export default SpatialModal;
