import React, { useState, useRef, useEffect, useId } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import {
  getZambiaTodayString,
  isValidDateString,
  formatOperationsHeaderDate,
} from '../../utils/dateUtils';

interface AdminOperationsDatePickerProps {
  fromDate?: string | null;
  toDate?: string | null;
  onSingleDateChange: (date: string) => void;
  className?: string;
}

export const AdminOperationsDatePicker: React.FC<AdminOperationsDatePickerProps> = ({
  fromDate,
  toDate,
  onSingleDateChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const todayStr = getZambiaTodayString();
  const dialogId = useId();

  // Initial selected date for the calendar view
  const activeDate = isValidDateString(fromDate) ? fromDate! : todayStr;
  const [pendingSelectedDate, setPendingSelectedDate] = useState<string>(activeDate);

  // Month navigation state (0-indexed month)
  const [viewYear, setViewYear] = useState<number>(() => {
    const parts = activeDate.split('-').map(Number);
    return parts[0] || 2026;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const parts = activeDate.split('-').map(Number);
    return (parts[1] || 10) - 1;
  });

  // Sync state when popup opens or props change
  useEffect(() => {
    const target = isValidDateString(fromDate) ? fromDate! : todayStr;
    setPendingSelectedDate(target);
    const parts = target.split('-').map(Number);
    if (parts[0] && parts[1]) {
      setViewYear(parts[0]);
      setViewMonth(parts[1] - 1);
    }
  }, [fromDate, isOpen, todayStr]);

  // Click outside and keyboard event handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
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

  const [todayYear, todayMonth] = todayStr.split('-').map(Number);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewYear > todayYear || (viewYear === todayYear && viewMonth >= todayMonth - 1)) {
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
    viewYear > todayYear || (viewYear === todayYear && viewMonth >= todayMonth - 1);

  // Calendar calculations
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const firstDayOfWeek = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();

  const handleSelectDay = (day: number) => {
    const yStr = String(viewYear);
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    if (dateStr > todayStr) return; // Future dates disabled
    setPendingSelectedDate(dateStr);
  };

  const handleApply = () => {
    onSingleDateChange(pendingSelectedDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setPendingSelectedDate(isValidDateString(fromDate) ? fromDate! : todayStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    setPendingSelectedDate(todayStr);
    const parts = todayStr.split('-').map(Number);
    setViewYear(parts[0]);
    setViewMonth(parts[1] - 1);
  };

  const monthName = new Date(Date.UTC(viewYear, viewMonth, 1)).toLocaleString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  });

  const displayText = formatOperationsHeaderDate(fromDate, toDate);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Compact Interactive Centred Date Trigger Button */}
      <button
        type="button"
        id="btn-admin-operations-date-picker"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Filter by date (operating in Africa/Lusaka CAT)"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        className="group inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50/90 hover:text-[#0D93AA] border border-gray-200/90 hover:border-[#0D93AA]/50 rounded-lg shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] select-none"
      >
        <CalendarIcon
          size={14}
          className="text-[#0D93AA] group-hover:scale-105 transition-transform shrink-0"
          aria-hidden="true"
        />
        <span className="truncate tracking-tight font-medium text-slate-800 group-hover:text-[#0D93AA]">
          {displayText}
        </span>
      </button>

      {/* Popover Calendar Picker */}
      {isOpen && (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-label="Select date filter"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Calendar Header: Month/Year navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 text-gray-500 hover:text-[#102025] hover:bg-gray-100 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA]"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs sm:text-sm font-bold text-gray-900">
              {monthName} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              aria-label="Next month"
              className={`p-1 rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA] ${
                isNextMonthDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-[#102025] hover:bg-gray-100 cursor-pointer'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[11px] font-semibold text-gray-400 py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous month filler days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <span
                  key={`prev-${i}`}
                  className="text-xs text-gray-300 py-1.5 select-none"
                >
                  {dayNum}
                </span>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(
                day
              ).padStart(2, '0')}`;
              const isFuture = dateStr > todayStr;
              const isSelected = dateStr === pendingSelectedDate;
              const isCurrentDay = dateStr === todayStr;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleSelectDay(day)}
                  className={`text-xs py-1.5 rounded-lg transition-all font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] ${
                    isSelected
                      ? 'bg-[#0D93AA] text-white font-bold shadow-2xs'
                      : isFuture
                      ? 'text-gray-300 cursor-not-allowed'
                      : isCurrentDay
                      ? 'border border-[#0D93AA] text-[#0D93AA] font-bold hover:bg-cyan-50'
                      : 'text-gray-700 hover:bg-cyan-50 hover:text-[#0D93AA] cursor-pointer'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Controls: Today shortcut, Cancel & Apply buttons */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-100 text-xs">
            <button
              type="button"
              id="btn-operations-calendar-today"
              onClick={handleSelectToday}
              className="px-2.5 py-1 text-xs font-semibold text-[#0D93AA] hover:bg-cyan-50 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA]"
            >
              Today
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-operations-calendar-cancel"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
              >
                <X size={12} />
                Cancel
              </button>

              <button
                type="button"
                id="btn-operations-calendar-apply"
                onClick={handleApply}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-md shadow-2xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]"
              >
                <Check size={12} />
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
