import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * SpatialDropdown - Premium floating glass dropdown replacing native HTML <select>.
 * Fully accessible with smooth scale/fade spring transitions, keyboard navigation,
 * viewport-aware flip positioning, and strict theme awareness.
 */
export const SpatialDropdown = ({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select option...',
  icon: Icon = null,
  label = '',
  name = '',
  disabled = false,
  className = '',
  panelClassName = '',
  align = 'left', // 'left' | 'right'
  required = false,
}) => {
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

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left w-full md:w-auto ${isOpen ? 'z-30' : ''} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 outline-none ${
          isLight
            ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 text-white shadow-md'
        } ${
          isOpen
            ? isLight
              ? 'ring-2 ring-indigo-500/30 border-indigo-500'
              : 'ring-2 ring-indigo-500/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
            : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-500/40'}`}
      >
        <div className="flex items-center gap-2 truncate">
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

        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
            isOpen
              ? isLight
                ? 'rotate-180 text-indigo-600'
                : 'rotate-180 text-indigo-400'
              : isLight
              ? 'text-slate-500'
              : 'text-gray-400'
          }`}
        />
      </button>

      {/* Floating Spatial Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} w-full min-w-[200px] max-h-64 overflow-y-auto rounded-2xl p-1.5 shadow-2xl z-35 scrollbar-thin transition-all ${
            isLight
              ? 'bg-white border border-slate-200 text-slate-900 shadow-slate-300/60'
              : 'bg-slate-900/98 border border-slate-700 text-white shadow-black/80'
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
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'bg-indigo-600/30 text-indigo-300 font-semibold'
                    : isHighlighted
                    ? isLight
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'bg-slate-800 text-white font-medium'
                    : isLight
                    ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {OptIcon && <OptIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SpatialDropdown;
