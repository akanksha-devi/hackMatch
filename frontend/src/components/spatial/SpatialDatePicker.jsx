import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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

  // Close calendar when clicking outside or pressing Escape
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
    const minParsed = minDate ? parseDateString(minDate) : null;
    const maxParsed = maxDate ? parseDateString(maxDate) : null;

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
        <label className="block text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 outline-none spatial-control ${
          isOpen ? 'ring-2 ring-indigo-500/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-500/40'}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-indigo-400 dark:text-indigo-400 light:text-indigo-600 shrink-0" />
          <span className={`truncate ${value ? 'text-white dark:text-white light:text-slate-900 font-medium' : 'text-gray-500 dark:text-gray-500 light:text-slate-400'}`}>
            {displayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200 transition-colors cursor-pointer"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Spatial Calendar Popup */}
      {isOpen && (
        <div
          className="absolute left-0 sm:left-auto right-auto top-full mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-slate-900/98 dark:bg-slate-900/98 light:bg-white/98 backdrop-blur-2xl border border-white/10 dark:border-white/10 light:border-slate-200 shadow-2xl z-35 animate-in fade-in zoom-in-95 duration-200"
          style={{ transformOrigin: 'top left' }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-white/10 light:border-slate-200 mb-3">
            <span className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200 transition-colors"
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
                className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 light:text-slate-500 py-1"
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
                    className="h-8 flex items-center justify-center text-xs text-gray-600 dark:text-gray-600 light:text-slate-300 select-none"
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
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-150 relative select-none ${
                    cell.isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-md shadow-indigo-500/30'
                      : cell.disabled
                      ? 'opacity-25 cursor-not-allowed text-gray-500'
                      : 'text-gray-200 dark:text-gray-200 light:text-slate-800 hover:bg-white/15 dark:hover:bg-white/15 light:hover:bg-slate-200 cursor-pointer'
                  }`}
                >
                  {cell.day}
                  {cell.isToday && !cell.isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400 dark:bg-indigo-400 light:bg-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 dark:border-white/10 light:border-slate-200 text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-indigo-400 hover:text-indigo-300 dark:text-indigo-400 dark:hover:text-indigo-300 light:text-indigo-600 light:hover:text-indigo-700 font-semibold px-2 py-1 rounded hover:bg-indigo-500/10 transition-colors"
            >
              Today
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-white dark:hover:text-white light:text-slate-500 light:hover:text-slate-800 px-2 py-1 rounded hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpatialDatePicker;
