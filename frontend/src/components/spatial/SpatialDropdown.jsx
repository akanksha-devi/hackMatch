import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * SpatialDropdown - Premium floating glass dropdown replacing native HTML <select>.
 * Fully accessible with smooth scale/fade spring transitions, keyboard navigation, and theme awareness.
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
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

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
      className={`relative inline-block text-left w-full md:w-auto ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="block text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-slate-700 mb-1.5">
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
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 outline-none spatial-control ${
          isOpen ? 'ring-2 ring-indigo-500/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-500/40'}`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && (
            <Icon className="w-4 h-4 text-indigo-400 dark:text-indigo-400 light:text-indigo-600 shrink-0" />
          )}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className="truncate text-white dark:text-white light:text-slate-900">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
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
          } mt-2 w-full min-w-[200px] max-h-64 overflow-y-auto rounded-2xl spatial-overlay spatial-glass border border-white/10 dark:border-white/10 light:border-slate-300 p-1.5 shadow-2xl z-35 animate-in fade-in zoom-in-95 duration-180 scrollbar-thin`}
          style={{
            transformOrigin: 'top',
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
                    ? 'bg-indigo-600/20 text-indigo-300 dark:text-indigo-300 light:text-indigo-700 font-semibold'
                    : isHighlighted
                    ? 'bg-white/10 dark:bg-white/10 light:bg-slate-100 text-white dark:text-white light:text-slate-900'
                    : 'text-gray-300 dark:text-gray-300 light:text-slate-700 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {OptIcon && <OptIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-400 light:text-indigo-600 shrink-0" />
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
