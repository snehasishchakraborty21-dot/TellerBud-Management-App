import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toISODate, toDisplayDate } from '../../utils/dateUtils';
import { TODAY_DATE } from '../../data/mockAttendanceData';

interface AttendanceDateRangePickerProps {
  dateFrom?: string; // dd-mm-yyyy
  dateTo?: string; // dd-mm-yyyy
  onChange: (from?: string, to?: string, isValid?: boolean) => void;
  onValidationError?: (error: string | null) => void;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const AttendanceDateRangePicker: React.FC<AttendanceDateRangePickerProps> = ({
  dateFrom = '',
  dateTo = '',
  onChange,
  onValidationError,
  className,
}) => {
  // Default to business today: 22-09-2026
  const defaultYear = parseInt(TODAY_DATE.split('-')[2], 10) || 2026;
  const defaultMonth = (parseInt(TODAY_DATE.split('-')[1], 10) || 9) - 1; // September (0-indexed: 8)

  const [rawFrom, setRawFrom] = useState<string>(dateFrom);
  const [rawTo, setRawTo] = useState<string>(dateTo);

  const [isFromOpen, setIsFromOpen] = useState<boolean>(false);
  const [isToOpen, setIsToOpen] = useState<boolean>(false);

  const [fromViewYear, setFromViewYear] = useState<number>(() => {
    if (dateFrom && dateFrom.length === 10) {
      const y = parseInt(dateFrom.split('-')[2], 10);
      if (!isNaN(y)) return y;
    }
    return defaultYear;
  });
  const [fromViewMonth, setFromViewMonth] = useState<number>(() => {
    if (dateFrom && dateFrom.length === 10) {
      const m = parseInt(dateFrom.split('-')[1], 10);
      if (!isNaN(m)) return m - 1;
    }
    return defaultMonth;
  });

  const [toViewYear, setToViewYear] = useState<number>(() => {
    if (dateTo && dateTo.length === 10) {
      const y = parseInt(dateTo.split('-')[2], 10);
      if (!isNaN(y)) return y;
    }
    return defaultYear;
  });
  const [toViewMonth, setToViewMonth] = useState<number>(() => {
    if (dateTo && dateTo.length === 10) {
      const m = parseInt(dateTo.split('-')[1], 10);
      if (!isNaN(m)) return m - 1;
    }
    return defaultMonth;
  });

  const fromContainerRef = useRef<HTMLDivElement>(null);
  const toContainerRef = useRef<HTMLDivElement>(null);

  // Sync external props changes
  useEffect(() => {
    setRawFrom(dateFrom);
    setRawTo(dateTo);
  }, [dateFrom, dateTo]);

  // Click outside handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        fromContainerRef.current &&
        !fromContainerRef.current.contains(e.target as Node)
      ) {
        setIsFromOpen(false);
      }
      if (
        toContainerRef.current &&
        !toContainerRef.current.contains(e.target as Node)
      ) {
        setIsToOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFromOpen(false);
        setIsToOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const validateAndNotify = useCallback(
    (fromStr: string, toStr: string) => {
      const trimmedFrom = fromStr.trim();
      const trimmedTo = toStr.trim();

      // Case 1: Both empty
      if (!trimmedFrom && !trimmedTo) {
        onValidationError?.(null);
        onChange(undefined, undefined, true);
        return;
      }

      // Case 2: Only one or both typing in progress (< 10 chars)
      if (trimmedFrom.length < 10 || trimmedTo.length < 10) {
        onValidationError?.(null);
        // Do not update query until both are complete
        return;
      }

      // Case 3: Both 10 chars, validate syntax
      const fromIso = toISODate(trimmedFrom);
      const toIso = toISODate(trimmedTo);

      if (!fromIso || !toIso) {
        onValidationError?.('Please enter a valid date in dd-mm-yyyy format.');
        onChange(trimmedFrom, trimmedTo, false);
        return;
      }

      if (toIso < fromIso) {
        onValidationError?.('To Date cannot be earlier than From Date.');
        onChange(trimmedFrom, trimmedTo, false);
        return;
      }

      onValidationError?.(null);
      onChange(trimmedFrom, trimmedTo, true);
    },
    [onChange, onValidationError]
  );

  const handleDateInputChange = (value: string, field: 'from' | 'to') => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = '';
    if (digitsOnly.length <= 2) {
      formatted = digitsOnly;
    } else if (digitsOnly.length <= 4) {
      formatted = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
    } else {
      formatted = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 4)}-${digitsOnly.slice(4, 8)}`;
    }

    if (field === 'from') {
      setRawFrom(formatted);
      validateAndNotify(formatted, rawTo);
    } else {
      setRawTo(formatted);
      validateAndNotify(rawFrom, formatted);
    }
  };

  const handleSelectDateFromCalendar = (day: number, month: number, year: number, field: 'from' | 'to') => {
    const dd = String(day).padStart(2, '0');
    const mm = String(month + 1).padStart(2, '0');
    const yyyy = String(year);
    const selectedDisplay = `${dd}-${mm}-${yyyy}`;

    if (field === 'from') {
      setRawFrom(selectedDisplay);
      setIsFromOpen(false);
      validateAndNotify(selectedDisplay, rawTo);
    } else {
      setRawTo(selectedDisplay);
      setIsToOpen(false);
      validateAndNotify(rawFrom, selectedDisplay);
    }
  };

  const renderCalendar = (field: 'from' | 'to') => {
    const viewYear = field === 'from' ? fromViewYear : toViewYear;
    const viewMonth = field === 'from' ? fromViewMonth : toViewMonth;
    const setViewYear = field === 'from' ? setFromViewYear : setToViewYear;
    const setViewMonth = field === 'from' ? setFromViewMonth : setToViewMonth;

    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const currentSelected = field === 'from' ? rawFrom : rawTo;

    const handlePrevMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    };

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="w-7 h-7" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${String(d).padStart(2, '0')}-${String(viewMonth + 1).padStart(2, '0')}-${viewYear}`;
      const isSelected = currentSelected === dStr;
      const isToday = dStr === TODAY_DATE;

      cells.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectDateFromCalendar(d, viewMonth, viewYear, field);
          }}
          className={`w-7 h-7 text-xs rounded-full flex items-center justify-center font-medium transition-colors cursor-pointer ${
            isSelected
              ? 'bg-[#0D93AA] text-white font-bold shadow-2xs'
              : isToday
              ? 'bg-cyan-50 text-[#0D93AA] font-bold border border-[#0D93AA]/30 hover:bg-[#0D93AA] hover:text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {d}
        </button>
      );
    }

    const [todayD, todayM, todayY] = TODAY_DATE.split('-').map(Number);

    return (
      <div
        className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-64 animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Month Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-gray-800">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {WEEKDAY_NAMES.map((w) => (
            <div key={w} className="text-[10px] font-semibold text-gray-400">
              {w}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">{cells}</div>

        {/* Quick select Today */}
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Africa/Lusaka</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectDateFromCalendar(todayD, todayM - 1, todayY, field);
            }}
            className="font-semibold text-[#0D93AA] hover:underline cursor-pointer"
          >
            {TODAY_DATE}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={className || 'flex flex-wrap items-center gap-3'}>
      {/* From Date */}
      <div ref={fromContainerRef} className="flex items-center gap-2 min-w-0 w-full">
        <label
          htmlFor="bo-att-date-from"
          className="text-xs font-semibold text-gray-700 whitespace-nowrap shrink-0"
        >
          From Date
        </label>
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            id="bo-att-date-from"
            value={rawFrom}
            onChange={(e) => handleDateInputChange(e.target.value, 'from')}
            placeholder="dd-mm-yyyy"
            maxLength={10}
            className="w-full h-[38px] pl-3 pr-8 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 font-mono focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
            aria-label="From Date (dd-mm-yyyy)"
          />
          <button
            type="button"
            onClick={() => {
              setIsFromOpen((prev) => !prev);
              setIsToOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D93AA] transition-colors p-1 cursor-pointer focus:outline-none"
            aria-label="Open From Date calendar"
          >
            <CalendarIcon size={14} />
          </button>
          {isFromOpen && renderCalendar('from')}
        </div>
      </div>

      {/* To Date */}
      <div ref={toContainerRef} className="flex items-center gap-2 min-w-0 w-full">
        <label
          htmlFor="bo-att-date-to"
          className="text-xs font-semibold text-gray-700 whitespace-nowrap shrink-0"
        >
          To Date
        </label>
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            id="bo-att-date-to"
            value={rawTo}
            onChange={(e) => handleDateInputChange(e.target.value, 'to')}
            placeholder="dd-mm-yyyy"
            maxLength={10}
            className="w-full h-[38px] pl-3 pr-8 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 font-mono focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
            aria-label="To Date (dd-mm-yyyy)"
          />
          <button
            type="button"
            onClick={() => {
              setIsToOpen((prev) => !prev);
              setIsFromOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D93AA] transition-colors p-1 cursor-pointer focus:outline-none"
            aria-label="Open To Date calendar"
          >
            <CalendarIcon size={14} />
          </button>
          {isToOpen && renderCalendar('to')}
        </div>
      </div>
    </div>
  );
};
