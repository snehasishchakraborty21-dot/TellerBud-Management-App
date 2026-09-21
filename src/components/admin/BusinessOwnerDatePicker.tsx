import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Info,
} from 'lucide-react';
import { useBusinessOwnerDate } from '../../context/BusinessOwnerDateContext';
import {
  getZambiaTodayString,
  formatBusinessOwnerHeaderDate,
  toDisplayDate,
  isToday,
} from '../../utils/dateUtils';

export const BusinessOwnerDatePicker: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    customDateRange,
    isCustomRange,
    resetToToday,
  } = useBusinessOwnerDate();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Parse current selected or fallback to today
  const todayStr = getZambiaTodayString();
  const [todayYear, todayMonth] = todayStr.split('-').map(Number);

  // Year and Month view in the calendar picker
  const [viewYear, setViewYear] = useState<number>(() => {
    const [y] = (selectedDate || todayStr).split('-').map(Number);
    return y;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const [, m] = (selectedDate || todayStr).split('-').map(Number);
    return m; // 1-12
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync calendar view month/year when calendar opens
  useEffect(() => {
    if (isOpen) {
      const [y, m] = (selectedDate || todayStr).split('-').map(Number);
      setViewYear(y);
      setViewMonth(m);
    }
  }, [isOpen, selectedDate, todayStr]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const isNextMonthDisabled =
    viewYear > todayYear || (viewYear === todayYear && viewMonth >= todayMonth);

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar grid for current viewMonth/viewYear
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const day = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return day === 0 ? 6 : day - 1; // 0 = Monday, ..., 6 = Sunday
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleSelectDate = (day: number) => {
    const formattedDate = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (formattedDate > todayStr) return; // Future date blocked

    setSelectedDate(formattedDate);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTodayShortcut = () => {
    resetToToday();
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Label text logic
  let labelText = '';
  if (isCustomRange) {
    labelText = 'Custom Date Range';
  } else {
    labelText = formatBusinessOwnerHeaderDate(selectedDate);
  }

  const isTodaySelected = !isCustomRange && isToday(selectedDate);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Interactive Trigger Button */}
      <button
        ref={triggerRef}
        id="header-bo-date-selector"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => isCustomRange && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Select operational date"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`group relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-1 select-none ${
          isOpen
            ? 'bg-teal-50/80 border-[#0D93AA] text-[#0D93AA]'
            : isCustomRange
            ? 'bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100/80'
            : isTodaySelected
            ? 'bg-gray-50/90 border-gray-200/90 hover:border-[#0D93AA]/60 hover:bg-gray-100/80 text-gray-700'
            : 'bg-teal-50/50 border-[#0D93AA]/40 hover:border-[#0D93AA] text-[#0A7385]'
        }`}
      >
        <CalendarIcon
          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            isOpen || !isTodaySelected ? 'text-[#0D93AA]' : 'text-gray-500 group-hover:text-[#0D93AA]'
          }`}
        />
        <span className="truncate max-w-[200px] sm:max-w-[240px] tracking-tight">
          {labelText}
        </span>
        {isCustomRange && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        )}
      </button>

      {/* Tooltip for Custom Date Range */}
      {showTooltip && isCustomRange && customDateRange && (
        <div
          role="tooltip"
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1.5 border border-gray-700 animate-fadeIn"
        >
          <Info size={12} className="text-[#0D93AA]" />
          <span>
            Active range: {toDisplayDate(customDateRange.from)} to {toDisplayDate(customDateRange.to)} (CAT)
          </span>
        </div>
      )}

      {/* Calendar Dialog / Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          aria-modal="true"
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header: Month / Year with Prev & Next buttons */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-xs font-bold text-gray-900">
              {monthNames[viewMonth - 1]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              aria-label="Next month"
              className={`p-1 rounded-md transition-colors ${
                isNextMonthDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels (Mo - Su) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <div
                key={day}
                className="text-[10px] font-bold text-gray-400 uppercase py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateIso = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isFuture = dateIso > todayStr;
              const isSelected = !isCustomRange && dateIso === selectedDate;
              const isCurrentDay = dateIso === todayStr;

              return (
                <button
                  key={dateIso}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleSelectDate(dayNum)}
                  className={`h-7 w-7 mx-auto rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                    isFuture
                      ? 'text-gray-300 opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#0D93AA] text-white font-bold shadow-xs cursor-pointer'
                      : isCurrentDay
                      ? 'border border-[#0D93AA] text-[#0D93AA] font-bold hover:bg-teal-50 cursor-pointer'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]`}
                  aria-label={`${dayNum} ${monthNames[viewMonth - 1]} ${viewYear}${isCurrentDay ? ', Today' : ''}`}
                  aria-pressed={isSelected}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer: Today Shortcut & Time Zone Notice */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleTodayShortcut}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] hover:bg-teal-50 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]"
            >
              <RotateCcw size={12} />
              <span>Today</span>
            </button>
            <span className="text-[10px] text-gray-400 font-mono">
              Africa/Lusaka (CAT)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
