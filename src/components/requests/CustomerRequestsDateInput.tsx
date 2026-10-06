import React, { useState, useRef, useEffect, useId } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import {
  getZambiaTodayString,
  isValidDateString,
  formatIsoToDdMmYyyy,
} from '../../utils/dateUtils';

interface CustomerRequestsDateInputProps {
  label: 'From' | 'To';
  value: string; // YYYY-MM-DD or empty string
  onChange: (date: string) => void;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  errorMessage?: string | null;
  id?: string;
  className?: string;
}

export const CustomerRequestsDateInput: React.FC<CustomerRequestsDateInputProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  errorMessage,
  id,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const todayStr = getZambiaTodayString();
  const generatedId = useId();
  const inputId = id || `requests-date-${label.toLowerCase()}-${generatedId}`;

  // Default active view date when opening picker
  const activeDate = isValidDateString(value) ? value : todayStr;

  const [viewYear, setViewYear] = useState<number>(() => {
    const parts = activeDate.split('-').map(Number);
    return parts[0] || 2026;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const parts = activeDate.split('-').map(Number);
    return (parts[1] || 10) - 1;
  });

  // Sync calendar view when value changes or popover opens
  useEffect(() => {
    if (isValidDateString(value)) {
      const parts = value.split('-').map(Number);
      if (parts[0] && parts[1]) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [value, isOpen]);

  // Click outside and escape key handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const [todayY, todayM] = todayStr.split('-').map(Number);
  const effectiveMaxDate = maxDate && maxDate < todayStr ? maxDate : todayStr;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewYear > todayY || (viewYear === todayY && viewMonth >= todayM - 1)) {
      return;
    }
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Generate calendar days
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const adjustedFirstDay = (firstDayIndex + 6) % 7; // Mon = 0, Sun = 6

  const calendarDays: Array<{
    day: number;
    iso: string;
    isCurrentMonth: boolean;
    isDisabled: boolean;
    isSelected: boolean;
    isToday: boolean;
  }> = [];

  // Prev month padding
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth === 0 ? 12 : viewMonth;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      day: d,
      iso,
      isCurrentMonth: false,
      isDisabled: true,
      isSelected: false,
      isToday: iso === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isDisabled =
      (effectiveMaxDate ? iso > effectiveMaxDate : false) ||
      (minDate ? iso < minDate : false) ||
      iso > todayStr;
    const isSelected = value === iso;
    const isToday = iso === todayStr;

    calendarDays.push({
      day: d,
      iso,
      isCurrentMonth: true,
      isDisabled,
      isSelected,
      isToday,
    });
  }

  // Next month padding to fill 35 or 42 grid cells
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const m = viewMonth === 11 ? 1 : viewMonth + 2;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      day: d,
      iso,
      isCurrentMonth: false,
      isDisabled: true,
      isSelected: false,
      isToday: iso === todayStr,
    });
  }

  const handleSelectDate = (iso: string) => {
    onChange(iso);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelectToday = () => {
    onChange(todayStr);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const formattedDisplay = isValidDateString(value) ? formatIsoToDdMmYyyy(value) : '';
  const canGoNext = !(viewYear > todayY || (viewYear === todayY && viewMonth >= todayM - 1));

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${label} Date: ${formattedDisplay || 'dd-mm-yyyy'}. Click to open date picker.`}
        className={`h-9 w-[155px] sm:w-[165px] px-2.5 sm:px-3 flex items-center justify-between gap-1.5 bg-gray-50 hover:bg-gray-100/80 rounded-lg text-xs transition-all cursor-pointer select-none focus:outline-none focus:ring-2 ${
          errorMessage
            ? 'border border-red-400 ring-2 ring-red-400/20 bg-red-50/20 text-red-900 focus:ring-red-400'
            : isOpen
            ? 'border border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-white'
            : 'border border-gray-200 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] focus:bg-white'
        }`}
      >
        <span className="flex items-center gap-1.5 min-w-0 truncate">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            {label}:
          </span>
          {formattedDisplay ? (
            <span className="font-mono text-xs font-semibold text-gray-800 tracking-tight truncate">
              {formattedDisplay}
            </span>
          ) : (
            <span className="font-mono text-xs text-gray-400 tracking-tight truncate">
              dd-mm-yyyy
            </span>
          )}
        </span>
        <CalendarIcon
          size={13}
          className={`shrink-0 transition-colors ${
            errorMessage
              ? 'text-red-500'
              : isOpen
              ? 'text-[#0D93AA]'
              : 'text-gray-400 group-hover:text-gray-600'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Inline Tooltip Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="absolute left-0 top-[calc(100%+4px)] z-40 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-red-700 bg-red-50 border border-red-200 rounded-md shadow-md whitespace-nowrap animate-in fade-in slide-in-from-top-1"
        >
          <AlertCircle size={12} className="text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Calendar Date Picker Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Select ${label} Date`}
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[270px] bg-white rounded-xl shadow-xl border border-gray-200 p-3 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-gray-800">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoNext}
              aria-label="Next month"
              className="p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-gray-400">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return (
                  <div
                    key={`pad-${idx}`}
                    className="h-7 flex items-center justify-center text-[11px] text-gray-300 select-none"
                  >
                    {item.day}
                  </div>
                );
              }

              return (
                <button
                  key={`day-${item.iso}`}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={() => handleSelectDate(item.iso)}
                  className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-[11px] font-medium transition-all ${
                    item.isSelected
                      ? 'bg-[#0D93AA] text-white font-bold shadow-xs'
                      : item.isToday
                      ? 'border border-[#0D93AA] text-[#0D93AA] font-bold bg-[#0D93AA]/5 hover:bg-[#0D93AA]/15'
                      : item.isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                  }`}
                  aria-label={`${item.day} ${monthNames[viewMonth]} ${viewYear}${
                    item.isToday ? ' (Today)' : ''
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-semibold text-[#0D93AA] hover:text-[#0B7C90] transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
