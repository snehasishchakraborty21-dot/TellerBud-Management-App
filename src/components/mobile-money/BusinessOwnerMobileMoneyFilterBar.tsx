import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Download, RotateCcw, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import {
  getZambiaTodayString,
  isValidDateString,
  toDisplayDate,
  toISODate,
} from '../../utils/dateUtils';

interface BusinessOwnerMobileMoneyFilterBarProps {
  dateFrom?: string; // ISO YYYY-MM-DD
  dateTo?: string; // ISO YYYY-MM-DD
  onDateRangeChange: (dateFrom?: string, dateTo?: string) => void;
  onExport: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isExporting?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const BusinessOwnerMobileMoneyFilterBar: React.FC<BusinessOwnerMobileMoneyFilterBarProps> = ({
  dateFrom,
  dateTo,
  onDateRangeChange,
  onExport,
  onRefresh,
  isRefreshing = false,
  isExporting = false,
}) => {
  const todayStr = getZambiaTodayString();
  const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);

  // Raw text input states in dd-mm-yyyy format
  const [rawFrom, setRawFrom] = useState<string>(() => toDisplayDate(dateFrom));
  const [rawTo, setRawTo] = useState<string>(() => toDisplayDate(dateTo));

  // Calendar popover open states
  const [isFromOpen, setIsFromOpen] = useState<boolean>(false);
  const [isToOpen, setIsToOpen] = useState<boolean>(false);

  // Month navigation states for calendar popovers
  const [fromViewYear, setFromViewYear] = useState<number>(() => {
    if (dateFrom) return parseInt(dateFrom.split('-')[0], 10) || todayYear;
    return todayYear;
  });
  const [fromViewMonth, setFromViewMonth] = useState<number>(() => {
    if (dateFrom) return (parseInt(dateFrom.split('-')[1], 10) || todayMonth) - 1;
    return todayMonth - 1;
  });

  const [toViewYear, setToViewYear] = useState<number>(() => {
    if (dateTo) return parseInt(dateTo.split('-')[0], 10) || todayYear;
    return todayYear;
  });
  const [toViewMonth, setToViewMonth] = useState<number>(() => {
    if (dateTo) return (parseInt(dateTo.split('-')[1], 10) || todayMonth) - 1;
    return todayMonth - 1;
  });

  // Validation message state
  const [validationError, setValidationError] = useState<string | null>(null);

  const fromContainerRef = useRef<HTMLDivElement>(null);
  const toContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize when external date props change
  useEffect(() => {
    const nextFrom = toDisplayDate(dateFrom);
    const nextTo = toDisplayDate(dateTo);
    setRawFrom(nextFrom);
    setRawTo(nextTo);
    if (!dateFrom && !dateTo) {
      setValidationError(null);
    }
  }, [dateFrom, dateTo]);

  // Close calendar popovers on outside click or Escape
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

  // Format typing as dd-mm-yyyy with auto-inserted hyphens
  const handleDateInputChange = (
    value: string,
    field: 'from' | 'to'
  ) => {
    // Keep numbers and hyphens only
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
      validateAndApply(formatted, rawTo);
    } else {
      setRawTo(formatted);
      validateAndApply(rawFrom, formatted);
    }
  };

  // Validate date range and notify parent
  const validateAndApply = useCallback(
    (fromDisplay: string, toDisplay: string) => {
      const trimmedFrom = fromDisplay.trim();
      const trimmedTo = toDisplay.trim();

      // Case 1: Both fields empty -> normal latest transaction listing
      if (!trimmedFrom && !trimmedTo) {
        setValidationError(null);
        onDateRangeChange(undefined, undefined);
        return;
      }

      // Check if both fields are fully entered (10 characters: dd-mm-yyyy)
      const isFromComplete = trimmedFrom.length === 10;
      const isToComplete = trimmedTo.length === 10;

      // Incomplete typing in progress: clear error while user is typing unless invalid characters
      if (!isFromComplete || !isToComplete) {
        setValidationError(null);
        return;
      }

      const isoFrom = toISODate(trimmedFrom);
      const isoTo = toISODate(trimmedTo);

      if (!isValidDateString(isoFrom)) {
        setValidationError('From Date must be a valid calendar date (dd-mm-yyyy) and cannot be in the future.');
        return;
      }

      if (!isValidDateString(isoTo)) {
        setValidationError('To Date must be a valid calendar date (dd-mm-yyyy) and cannot be in the future.');
        return;
      }

      // Africa/Lusaka CAT Future Date check
      if (isoFrom > todayStr) {
        setValidationError('From Date cannot be in the future (Africa/Lusaka CAT).');
        return;
      }
      if (isoTo > todayStr) {
        setValidationError('To Date cannot be in the future (Africa/Lusaka CAT).');
        return;
      }

      // Range check: To Date cannot be earlier than From Date
      if (isoTo < isoFrom) {
        setValidationError('To Date cannot be earlier than From Date.');
        return;
      }

      // Valid range (single-day or multi-day up to today)
      setValidationError(null);
      onDateRangeChange(isoFrom, isoTo);
    },
    [onDateRangeChange, todayStr]
  );

  // Select date from calendar popover
  const handleSelectFromCalendar = (isoDate: string, field: 'from' | 'to') => {
    const display = toDisplayDate(isoDate);
    if (field === 'from') {
      setRawFrom(display);
      setIsFromOpen(false);
      validateAndApply(display, rawTo);
    } else {
      setRawTo(display);
      setIsToOpen(false);
      validateAndApply(rawFrom, display);
    }
  };

  // Clear Date Range handler
  const handleClear = () => {
    setRawFrom('');
    setRawTo('');
    setValidationError(null);
    setIsFromOpen(false);
    setIsToOpen(false);
    onDateRangeChange(undefined, undefined);
  };

  // Determine button enabled/disabled states
  const hasAnyDate = Boolean(rawFrom.trim() || rawTo.trim());
  const isCompleteRange =
    rawFrom.trim().length === 10 &&
    rawTo.trim().length === 10 &&
    isValidDateString(toISODate(rawFrom)) &&
    isValidDateString(toISODate(rawTo));

  const isRangeValid = isCompleteRange && !validationError;

  // Month navigation helpers
  const handlePrevMonth = (field: 'from' | 'to') => {
    if (field === 'from') {
      if (fromViewMonth === 0) {
        setFromViewMonth(11);
        setFromViewYear((y) => y - 1);
      } else {
        setFromViewMonth((m) => m - 1);
      }
    } else {
      if (toViewMonth === 0) {
        setToViewMonth(11);
        setToViewYear((y) => y - 1);
      } else {
        setToViewMonth((m) => m - 1);
      }
    }
  };

  const handleNextMonth = (field: 'from' | 'to') => {
    if (field === 'from') {
      if (
        fromViewYear > todayYear ||
        (fromViewYear === todayYear && fromViewMonth >= todayMonth - 1)
      ) {
        return;
      }
      if (fromViewMonth === 11) {
        setFromViewMonth(0);
        setFromViewYear((y) => y + 1);
      } else {
        setFromViewMonth((m) => m + 1);
      }
    } else {
      if (
        toViewYear > todayYear ||
        (toViewYear === todayYear && toViewMonth >= todayMonth - 1)
      ) {
        return;
      }
      if (toViewMonth === 11) {
        setToViewMonth(0);
        setToViewYear((y) => y + 1);
      } else {
        setToViewMonth((m) => m + 1);
      }
    }
  };

  // Render month calendar grid for a popover
  const renderCalendar = (field: 'from' | 'to') => {
    const viewYear = field === 'from' ? fromViewYear : toViewYear;
    const viewMonth = field === 'from' ? fromViewMonth : toViewMonth;
    const currentIsoVal = field === 'from' ? toISODate(rawFrom) : toISODate(rawTo);
    const minIsoVal = field === 'to' ? toISODate(rawFrom) : undefined;

    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    const firstDayOfWeek = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay(); // 0 = Sunday
    // Convert to Monday = 0
    const startCol = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const isNextDisabled =
      viewYear > todayYear || (viewYear === todayYear && viewMonth >= todayMonth - 1);

    const cells: React.ReactNode[] = [];

    // Empty offset cells before 1st day of month
    for (let i = 0; i < startCol; i++) {
      cells.push(<div key={`empty-${i}`} className="h-7 w-7" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayIso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isFuture = dayIso > todayStr;
      const isBeforeMin = Boolean(minIsoVal && isValidDateString(minIsoVal) && dayIso < minIsoVal);
      const isDisabled = isFuture || isBeforeMin;
      const isSelected = dayIso === currentIsoVal;
      const isTodayCell = dayIso === todayStr;

      cells.push(
        <button
          key={dayIso}
          type="button"
          disabled={isDisabled}
          onClick={() => handleSelectFromCalendar(dayIso, field)}
          className={`h-7 w-7 text-xs rounded-md flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-[#0D93AA] text-white font-bold shadow-2xs'
              : isTodayCell && !isDisabled
              ? 'border border-[#0D93AA] text-[#0D93AA] font-bold hover:bg-cyan-50'
              : isDisabled
              ? 'text-gray-300 cursor-not-allowed bg-gray-50/60'
              : 'text-gray-700 hover:bg-gray-100 font-medium'
          }`}
          aria-label={`Select ${dayIso}`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 mt-1.5 z-50 bg-white rounded-xl border border-gray-200 shadow-xl p-3 w-64 text-left">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => handlePrevMonth(field)}
            className="p-1 rounded-md text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-gray-800">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={() => handleNextMonth(field)}
            disabled={isNextDisabled}
            className={`p-1 rounded-md transition-colors ${
              isNextDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
            }`}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10.5px] font-bold text-gray-400">
          {WEEKDAY_NAMES.map((w) => (
            <div key={w} className="h-6 flex items-center justify-center">
              {w}
            </div>
          ))}
        </div>

        {/* Day numbers */}
        <div className="grid grid-cols-7 gap-1 text-center">{cells}</div>

        {/* Footer info: CAT Lusaka Time */}
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
          <span>Africa/Lusaka (CAT)</span>
          <button
            type="button"
            onClick={() => handleSelectFromCalendar(todayStr, field)}
            className="font-semibold text-[#0D93AA] hover:underline cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3 sm:p-3.5">
      {/* Controls arranged in one clean desktop row: [From Date] [To Date] [Export] [Clear] [Refresh] */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Left/Center: Equal-width Date Range Fields */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 max-w-2xl lg:max-w-3xl">
          {/* From Date Input */}
          <div
            ref={fromContainerRef}
            className="flex-1 flex items-center gap-2.5 min-w-0"
          >
            <label
              htmlFor="bo-date-from-input"
              className="text-xs font-bold text-gray-700 whitespace-nowrap min-w-[64px]"
            >
              From Date
            </label>
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                id="bo-date-from-input"
                value={rawFrom}
                onChange={(e) => handleDateInputChange(e.target.value, 'from')}
                placeholder="dd-mm-yyyy"
                maxLength={10}
                className="w-full h-[38px] pl-3 pr-9 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 font-mono focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
                aria-label="From Date (dd-mm-yyyy)"
              />
              <button
                type="button"
                id="bo-date-from-calendar-btn"
                onClick={() => {
                  setIsFromOpen((prev) => !prev);
                  setIsToOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D93AA] transition-colors p-1 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA] rounded"
                aria-label="Open From Date calendar"
                aria-expanded={isFromOpen}
              >
                <CalendarIcon size={16} />
              </button>

              {isFromOpen && renderCalendar('from')}
            </div>
          </div>

          {/* To Date Input */}
          <div
            ref={toContainerRef}
            className="flex-1 flex items-center gap-2.5 min-w-0"
          >
            <label
              htmlFor="bo-date-to-input"
              className="text-xs font-bold text-gray-700 whitespace-nowrap min-w-[52px]"
            >
              To Date
            </label>
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                id="bo-date-to-input"
                value={rawTo}
                onChange={(e) => handleDateInputChange(e.target.value, 'to')}
                placeholder="dd-mm-yyyy"
                maxLength={10}
                className="w-full h-[38px] pl-3 pr-9 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 font-mono focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
                aria-label="To Date (dd-mm-yyyy)"
              />
              <button
                type="button"
                id="bo-date-to-calendar-btn"
                onClick={() => {
                  setIsToOpen((prev) => !prev);
                  setIsFromOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D93AA] transition-colors p-1 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA] rounded"
                aria-label="Open To Date calendar"
                aria-expanded={isToOpen}
              >
                <CalendarIcon size={16} />
              </button>

              {isToOpen && renderCalendar('to')}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons aligned towards the right */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 self-end lg:self-center ml-auto">
          {/* Export Button (Oceanic-green #0D93AA) */}
          <button
            type="button"
            id="bo-export-btn"
            onClick={onExport}
            disabled={!isRangeValid || isExporting}
            className={`inline-flex items-center justify-center gap-1.5 h-[38px] px-3.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
              isRangeValid && !isExporting
                ? 'bg-[#0D93AA] hover:bg-[#0B7A8D] active:bg-[#096677] text-white border-[#0D93AA] shadow-2xs cursor-pointer'
                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-1`}
            aria-label="Export transactions to Excel"
            title={
              !isRangeValid
                ? 'Select a valid From Date and To Date to enable Export'
                : 'Download Mobile Money transactions within selected date range'
            }
          >
            <Download size={15} className="flex-shrink-0" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>

          {/* Clear Date Range Button */}
          <button
            type="button"
            id="bo-clear-date-range-btn"
            onClick={handleClear}
            disabled={!hasAnyDate}
            className={`inline-flex items-center justify-center gap-1.5 h-[38px] px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
              hasAnyDate
                ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer shadow-2xs'
                : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed shadow-none'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-1`}
            aria-label="Clear Date Range"
            title="Clear Date Range and restore latest transactions"
          >
            <RotateCcw size={14} className="flex-shrink-0" />
            <span className="hidden sm:inline">Clear Date Range</span>
            <span className="sm:hidden">Clear</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            id="bo-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 h-[38px] px-3 text-xs sm:text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-2xs disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-1"
            aria-label="Refresh transactions"
            title={
              isCompleteRange
                ? 'Refresh transactions within the selected date range'
                : 'Refresh latest transactions'
            }
          >
            <RefreshCw
              size={14}
              className={`flex-shrink-0 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-gray-500'}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Inline validation message */}
      {validationError && (
        <div
          id="bo-date-range-validation-error"
          role="alert"
          className="mt-2.5 pt-2 border-t border-rose-100 flex items-center gap-1.5 text-xs text-rose-600 font-medium animate-fadeIn"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
