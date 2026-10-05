import React, { useState, useRef, useEffect, useId } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import {
  getZambiaTodayString,
  isValidDateString,
  formatIsoToDdMmYyyy,
} from '../../utils/dateUtils';

interface CustomerWithdrawalDateInputProps {
  label: 'From' | 'To';
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  errorMessage?: string | null;
  id?: string;
  className?: string;
}

export const CustomerWithdrawalDateInput: React.FC<CustomerWithdrawalDateInputProps> = ({
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
  const inputId = id || `withdrawal-date-${label.toLowerCase()}-${generatedId}`;

  // Default active view date
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

  const isNextMonthDisabled =
    viewYear > todayY || (viewYear === todayY && viewMonth >= todayM - 1);

  // Generate calendar days for viewMonth and viewYear
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    const daysInPrevMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();

    const days: {
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Leading padding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 12 : viewMonth;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        isDisabled: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isFuture = dateStr > effectiveMaxDate;
      const isBeforeMin = minDate ? dateStr < minDate : false;
      const isDisabled = isFuture || isBeforeMin;

      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isDisabled,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
      });
    }

    // Trailing padding days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 1 : viewMonth + 2;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        isDisabled: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
      });
    }

    return days;
  }, [viewYear, viewMonth, effectiveMaxDate, minDate, todayStr, value]);

  const monthName = new Date(Date.UTC(viewYear, viewMonth, 1)).toLocaleString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  });

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const formattedDisplay = isValidDateString(value) ? formatIsoToDdMmYyyy(value) : '';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Date Trigger Button formatted as "From: dd-mm-yyyy" or "To: dd-mm-yyyy" */}
      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${label} Date: ${formattedDisplay || 'dd-mm-yyyy'}. Click to open date picker.`}
        className={`h-9 w-[175px] sm:w-[185px] px-3 flex items-center justify-between gap-2 bg-gray-50 hover:bg-gray-100/80 rounded-lg text-xs transition-all cursor-pointer select-none focus:outline-none focus:ring-2 ${
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
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {monthName} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              aria-label="Next month"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((wd) => (
              <span key={wd} className="text-[10px] font-bold text-slate-400 py-0.5">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((d, idx) => {
              const key = `${d.dateStr}-${idx}`;
              if (!d.isCurrentMonth) {
                return (
                  <div
                    key={key}
                    className="h-7 flex items-center justify-center text-[11px] text-slate-300 select-none"
                  >
                    {d.dayNum}
                  </div>
                );
              }

              if (d.isDisabled) {
                return (
                  <div
                    key={key}
                    className="h-7 flex items-center justify-center text-[11px] text-slate-300 cursor-not-allowed select-none"
                    title={d.dateStr > todayStr ? 'Future dates cannot be selected' : 'Date is outside allowed range'}
                  >
                    {d.dayNum}
                  </div>
                );
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectDay(d.dateStr)}
                  className={`h-7 w-7 mx-auto rounded-lg text-[11px] font-medium transition-all flex items-center justify-center cursor-pointer ${
                    d.isSelected
                      ? 'bg-[#0D93AA] text-white font-bold shadow-2xs'
                      : d.isToday
                      ? 'border border-[#0D93AA] text-[#0D93AA] font-bold hover:bg-cyan-50'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label={`${d.dayNum} ${monthName} ${viewYear}`}
                  aria-pressed={d.isSelected}
                >
                  {d.dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => handleSelectDay(todayStr)}
              className="text-[11px] font-semibold text-[#0D93AA] hover:text-[#0B7C90] hover:underline cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
