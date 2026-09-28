import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * SpatialModal - Viewport-anchored floating glass modal rendered via React Portal.
 * Breaks out of ancestor transforms/overflows to guarantee true viewport centering,
 * backdrop blur, internal scrolling, and body scroll locking.
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
  const modalRef = useRef(null);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalNode = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Translucent Animated Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 dark:bg-black/75 light:bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={() => {
          if (!preventBackdropClose && onClose) onClose();
        }}
        aria-hidden="true"
      />

      {/* Floating Spatial Modal Shell */}
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} max-h-[85vh] sm:max-h-[82vh] flex flex-col rounded-3xl bg-slate-900/98 dark:bg-slate-900/98 light:bg-white/98 backdrop-blur-2xl border border-white/10 dark:border-white/10 light:border-slate-300 shadow-2xl shadow-black/60 relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-3 duration-250 ${className}`}
      >
        {/* Top Decorative Ambient Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-80 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 dark:border-white/10 light:border-slate-200/80 shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 dark:text-indigo-400 light:text-indigo-600">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-400 dark:text-gray-400 light:text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin space-y-4">
          {children}
        </div>

        {/* Optional Sticky Footer Actions */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 dark:border-white/10 light:border-slate-200/80 bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-50/80 shrink-0 flex items-center justify-end gap-3">
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
