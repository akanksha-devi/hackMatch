import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING, MOTION, FOCUS } from '../../design-system/tokens';
import { SpatialAnimatedIcon } from './SpatialAnimatedIcon';

/**
 * SpatialDropdown - Premium floating glass dropdown replacing native HTML <select>.
 * Fully accessible with smooth scale/fade spring transitions, keyboard navigation,
 * viewport-aware flip positioning, and strict theme awareness.
 */
export const SpatialDropdown = React.forwardRef(({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select option...',
  icon: Icon = null,
  label = '',
  name = '',
  id,
  error = null,
  size = 'md',
  fullWidth = true,
  disabled = false,
  className = '',
  panelClassName = '',
  align = 'left', // 'left' | 'right'
  required = false,
}, ref) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Close when a modal or other major overlay requests it
  useEffect(() => {
    const handleClosePopovers = () => setIsOpen(false);
    window.addEventListener('close-all-popovers', handleClosePopovers);
    return () => window.removeEventListener('close-all-popovers', handleClosePopovers);
  }, []);

  // Viewport-aware upward/downward placement
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Normalize options: supports both ['Option 1', 'Option 2'] and [{ value: '1', label: 'One', icon?: Comp }]
  const normalizedOptions = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: String(opt.value),
          label: opt.label || String(opt.value),
          icon: opt.icon || null,
        };
      }
      return {
        value: String(opt),
        label: String(opt),
        icon: null,
      };
    });
  }, [options]);

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  const handleSelect = useCallback(
    (optValue) => {
      setIsOpen(false);
      if (!onChange) return;

      // Polymorphic event object that satisfies both `e.target.value` and direct `val` consumers
      const syntheticEvent = {
        target: { value: optValue, name },
        currentTarget: { value: optValue, name },
        value: optValue,
        preventDefault: () => {},
        stopPropagation: () => {},
        toString: () => optValue,
      };

      onChange(syntheticEvent, optValue);
    },
    [onChange, name]
  );

  // Click outside to dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Keyboard navigation within open dropdown
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        const idx = normalizedOptions.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % normalizedOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const sizeStyles = {
    sm: `${SPACING.controlHeight.sm} px-3 text-xs`,
    md: `${SPACING.controlHeight.md} px-3.5 text-sm`,
    lg: `${SPACING.controlHeight.lg} px-4 text-base`,
  }[size] || `${SPACING.controlHeight.md} px-3.5 text-sm`;

  const borderState = error
    ? 'border-rose-500/80 dark:border-rose-500/70 ring-2 ring-rose-500/20'
    : isOpen
    ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:ring-indigo-500/30'
    : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20';

  const baseTriggerStyles = `w-full flex items-center justify-between gap-2.5 ${RADIUS.control} ${sizeStyles} bg-white/70 dark:bg-slate-900/60 backdrop-blur-md backdrop-saturate-140 text-slate-900 dark:text-white border transition-all ${MOTION.duration.micro} ease-out select-none ${FOCUS.ring} ${MOTION.activePress} ${MOTION.reducedMotion} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100/60 dark:disabled:bg-gray-950/60 shadow-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`;


  return (
    <div
      ref={containerRef}
      className={`relative text-left ${fullWidth ? 'w-full' : 'inline-block w-full md:w-auto'} ${isOpen ? 'z-30' : ''} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={id}
          className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Dropdown Trigger */}
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={`${baseTriggerStyles} ${borderState} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 min-w-0 overflow-visible">
          {Icon && (
            <Icon className={`w-4 h-4 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          )}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className={`truncate ${isLight ? 'text-slate-900 font-semibold' : 'text-white font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <SpatialAnimatedIcon
          icon={ChevronDown}
          animation="rotate"
          trigger="state"
          isActive={isOpen}
          className={`w-4 h-4 shrink-0 ${
            isOpen
              ? isLight
                ? 'text-indigo-600'
                : 'text-indigo-400'
              : isLight
              ? 'text-slate-500'
              : 'text-gray-400'
          }`}
        />
      </button>

      {typeof error === 'string' && error && (
        <p id={id ? `${id}-error` : undefined} className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </p>
      )}

      {/* Floating Spatial Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          onMouseLeave={() => setHighlightedIndex(-1)}
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} w-full min-w-[200px] max-h-64 overflow-y-auto rounded-2xl p-1.5 z-35 scrollbar-thin transition-all liquid-glass-floating ${
            isLight
              ? 'text-slate-900'
              : 'text-white'
          } ${panelClassName}`}
          style={{
            transformOrigin: openUpward ? 'bottom' : 'top',
          }}
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightedIndex;
            const OptIcon = opt.icon;

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm cursor-pointer transition-colors duration-150 select-none ${
                  isSelected
                    ? isLight
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-xs'
                      : 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40 shadow-xs'
                    : isHighlighted
                    ? isLight
                      ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200/60'
                      : 'bg-slate-800 text-white font-medium border border-slate-700/60'
                    : isLight
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {OptIcon && <OptIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <SpatialAnimatedIcon
                    icon={Check}
                    animation="pop"
                    trigger="state"
                    isActive={true}
                    className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

SpatialDropdown.displayName = 'SpatialDropdown';

export default SpatialDropdown;
