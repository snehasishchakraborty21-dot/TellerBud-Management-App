import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getZambiaTodayString,
  formatHeaderDate,
  isToday,
} from '../../utils/dateUtils';

interface MobileMoneyDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

export const MobileMoneyDatePicker: React.FC<MobileMoneyDatePickerProps> = ({
  selectedDate,
  onDateChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const todayStr = getZambiaTodayString();

  // Parse currently selected date or view month
  const [viewYear, setViewYear] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return parts[0] || 2026;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return (parts[1] || 9) - 1; // 0-indexed month
  });

  // Sync view month when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number);
      if (parts[0] && parts[1]) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [selectedDate]);

  // Handle click outside to close
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

  // Today parts
  const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    // Cannot navigate past the current month/year
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

  // Calendar grid calculation
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const firstDayOfWeek = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();

  const handleSelectDate = (year: number, month: number, day: number) => {
    const yStr = String(year);
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    // Disallow future dates
    if (dateStr > todayStr) return;

    onDateChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    onDateChange(todayStr);
    const parts = todayStr.split('-').map(Number);
    setViewYear(parts[0]);
    setViewMonth(parts[1] - 1);
    setIsOpen(false);
  };

  const monthName = new Date(Date.UTC(viewYear, viewMonth, 1)).toLocaleString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  });

  const displayText = formatHeaderDate(selectedDate);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Compact Interactive Header Trigger Button */}
      <button
        type="button"
        id="btn-header-date-selector"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Select transaction date"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="group inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50/90 hover:bg-white hover:text-[#0D93AA] border border-gray-200 hover:border-[#0D93AA]/50 rounded-lg shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] select-none"
      >
        <CalendarIcon
          size={14}
          className="text-[#0D93AA] group-hover:scale-105 transition-transform shrink-0"
          aria-hidden="true"
        />
        <span className="truncate tracking-tight">{displayText}</span>
      </button>

      {/* Popover Calendar Picker */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select transaction date"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Calendar Header: Month/Year navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 text-gray-500 hover:text-[#102025] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
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
              className={`p-1 rounded-md transition-colors ${
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
              const isSelected = dateStr === selectedDate;
              const isCurrentDay = dateStr === todayStr;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleSelectDate(viewYear, viewMonth, day)}
                  className={`text-xs py-1.5 rounded-lg transition-all font-medium ${
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

          {/* Footer with "Today" Shortcut and Status */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-100 text-xs">
            <button
              type="button"
              id="btn-calendar-shortcut-today"
              onClick={handleSelectToday}
              className="px-2.5 py-1 text-xs font-semibold text-[#0D93AA] hover:bg-cyan-50 rounded-md transition-colors cursor-pointer"
            >
              Today
            </button>

            <span className="text-[11px] text-gray-400">
              {isToday(selectedDate) ? 'Showing Today' : 'Single Date Filter'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
