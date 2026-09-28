import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format Date to 'YYYY-MM-DD'
 */
const toDateString = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

/**
 * Parse 'YYYY-MM-DD' into { year, month (0-11), day }
 */
const parseDateString = (str) => {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
};

/**
 * Format for human-friendly input display
 */
const formatDisplayDate = (str) => {
  const parsed = parseDateString(str);
  if (!parsed) return '';
  const monthName = MONTHS[parsed.month]?.slice(0, 3);
  return `${monthName} ${parsed.day}, ${parsed.year}`;
};

/**
 * SpatialDatePicker - Custom floating glass calendar replacing native browser date pickers.
 * Features viewport-anchored portal rendering, smart upward/downward flip positioning,
 * and high-contrast WCAG-compliant Light and Dark mode themes.
 */
export const SpatialDatePicker = ({
  value = '',
  onChange,
  label = '',
  placeholder = 'Select date...',
  minDate = '',
  maxDate = '',
  name = '',
  disabled = false,
  required = false,
  className = '',
}) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 310, openUpward: false });
  const containerRef = useRef(null);
  const popupRef = useRef(null);

  const initialParsed = useMemo(() => parseDateString(value), [value]);
  const today = useMemo(() => new Date(), []);

  // View state for navigating calendar months
  const [viewYear, setViewYear] = useState(() => initialParsed?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialParsed?.month ?? today.getMonth());

  // Update view state when value changes from outside
  useEffect(() => {
    if (initialParsed) {
      setViewYear(initialParsed.year);
      setViewMonth(initialParsed.month);
    }
  }, [initialParsed]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const notifyChange = useCallback(
    (newDateStr) => {
      if (!onChange) return;
      const syntheticEvent = {
        target: { value: newDateStr, name },
        currentTarget: { value: newDateStr, name },
        value: newDateStr,
        preventDefault: () => {},
        stopPropagation: () => {},
        toString: () => newDateStr,
      };
      onChange(syntheticEvent, newDateStr);
    },
    [onChange, name]
  );

  const handleSelectDay = (day) => {
    const formatted = toDateString(viewYear, viewMonth, day);
    notifyChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.stopPropagation();
    const tYear = today.getFullYear();
    const tMonth = today.getMonth();
    const tDay = today.getDate();
    setViewYear(tYear);
    setViewMonth(tMonth);
    const formatted = toDateString(tYear, tMonth, tDay);
    notifyChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    notifyChange('');
  };

  // Close when a modal or other major overlay requests it
  useEffect(() => {
    const handleClosePopovers = () => setIsOpen(false);
    window.addEventListener('close-all-popovers', handleClosePopovers);
    return () => window.removeEventListener('close-all-popovers', handleClosePopovers);
  }, []);

  const updateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const calendarHeight = 345;
    const calendarWidth = Math.min(310, window.innerWidth - 24);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward = spaceBelow < calendarHeight && spaceAbove > spaceBelow;

    let top = openUpward ? rect.top - calendarHeight - 8 : rect.bottom + 8;
    if (top < 10) top = 10;
    if (top + calendarHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - calendarHeight - 10);
    }

    let left = rect.left;
    if (left + calendarWidth > window.innerWidth - 12) {
      left = window.innerWidth - calendarWidth - 12;
    }
    if (left < 12) left = 12;

    setCoords({ top, left, width: calendarWidth, openUpward });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateCoords]);

  // Close calendar when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popupRef.current &&
        !popupRef.current.contains(e.target)
      ) {
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

  // Compute calendar days for current viewMonth & viewYear
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon...
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        disabled: true,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = toDateString(viewYear, viewMonth, d);
      const isSelected = value === dateStr;
      const isToday =
        today.getFullYear() === viewYear &&
        today.getMonth() === viewMonth &&
        today.getDate() === d;

      let isDisabled = false;
      if (minDate && dateStr < minDate) isDisabled = true;
      if (maxDate && dateStr > maxDate) isDisabled = true;

      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isSelected,
        isToday,
        disabled: isDisabled,
      });
    }

    // Trailing days from next month to complete 35 or 42 grid slots
    const totalSlots = days.length <= 35 ? 35 : 42;
    const trailingCount = totalSlots - days.length;
    for (let d = 1; d <= trailingCount; d++) {
      days.push({
        day: d,
        isCurrentMonth: false,
        disabled: true,
      });
    }

    return days;
  }, [viewYear, viewMonth, value, minDate, maxDate, today]);

  const displayValue = formatDisplayDate(value);

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-30' : ''} ${className}`}>
      {label && (
        <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
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
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className={`w-4 h-4 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          <span className={`truncate ${value ? (isLight ? 'text-slate-900 font-semibold' : 'text-white font-medium') : (isLight ? 'text-slate-400' : 'text-gray-500')}`}>
            {displayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Viewport-Anchored Portal Calendar Popup */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={popupRef}
          className={`fixed p-4 rounded-2xl shadow-2xl z-[70] transition-all duration-150 select-none ${
            isLight
              ? 'bg-white border border-slate-200 shadow-slate-300/60 text-slate-900'
              : 'bg-slate-900 border border-slate-700/80 shadow-black/80 text-slate-100'
          }`}
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
          }}
        >
          {/* Calendar Header */}
          <div className={`flex items-center justify-between pb-3 border-b mb-3 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className={`text-[11px] font-bold py-1 uppercase tracking-wider ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className={`h-8 flex items-center justify-center text-xs select-none ${
                      isLight ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {cell.day}
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => !cell.disabled && handleSelectDay(cell.day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-150 relative select-none ${
                    cell.isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30'
                      : cell.disabled
                      ? isLight
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 cursor-not-allowed'
                      : isLight
                      ? 'text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer'
                  }`}
                >
                  {cell.day}
                  {cell.isToday && !cell.isSelected && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isLight ? 'bg-indigo-600' : 'bg-indigo-400'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className={`flex items-center justify-between pt-3 mt-3 border-t text-xs ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <button
              type="button"
              onClick={handleSelectToday}
              className={`font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                isLight
                  ? 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                  : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800'
              }`}
            >
              Today
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SpatialDatePicker;
