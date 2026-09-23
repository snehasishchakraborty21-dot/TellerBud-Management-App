import React, { useState } from 'react';
import { Download, RotateCcw, RefreshCw, AlertCircle } from 'lucide-react';
import { EndOfDayFilters, EndOfDayStatusType, AgentAvailabilityType } from '../../types/attendance';
import { AttendanceDateRangePicker } from './AttendanceDateRangePicker';

interface EndOfDayFilterBarProps {
  filters: EndOfDayFilters;
  onFilterChange: (filters: EndOfDayFilters) => void;
  onExport: () => void;
  onClearDateRange: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isExporting?: boolean;
  isExportDisabled?: boolean;
}

export const EndOfDayFilterBar: React.FC<EndOfDayFilterBarProps> = ({
  filters,
  onFilterChange,
  onExport,
  onClearDateRange,
  onRefresh,
  isRefreshing = false,
  isExporting = false,
  isExportDisabled = false,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const hasAnyDate = Boolean(filters.dateFrom || filters.dateTo);
  const isRangeValid = !validationError;

  const handleDateChange = (from?: string, to?: string, isValid: boolean = true) => {
    if (isValid) {
      setValidationError(null);
      onFilterChange({
        ...filters,
        dateFrom: from,
        dateTo: to,
        businessDate: from === to ? from : undefined,
      });
    } else {
      // Invalid range
      onFilterChange({
        ...filters,
        dateFrom: from,
        dateTo: to,
      });
    }
  };

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-2xs">
      <div className="end-of-day-filter-row">
        {/* 1. From Date & 2. To Date */}
        <AttendanceDateRangePicker
          className="contents"
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onChange={handleDateChange}
          onValidationError={setValidationError}
        />

        {/* 3. All Statuses Dropdown */}
        <div className="w-full min-w-0">
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as EndOfDayStatusType | 'ALL',
              })
            }
            aria-label="All Statuses"
            className="w-full h-[38px] px-3 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending Submission">Pending Submission</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Reconciled">Reconciled</option>
            <option value="Exception">Exception</option>
          </select>
        </div>

        {/* 4. All Availabilities Dropdown */}
        <div className="w-full min-w-0">
          <select
            value={filters.availability}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                availability: e.target.value as AgentAvailabilityType | 'ALL',
              })
            }
            aria-label="All Availabilities"
            className="w-full h-[38px] px-3 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Availabilities</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* 5. Export Button (Oceanic-green) */}
        <button
          type="button"
          onClick={onExport}
          disabled={isExportDisabled || !isRangeValid || isExporting}
          className={`inline-flex items-center justify-center gap-1.5 h-[38px] px-3.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
            !isExportDisabled && isRangeValid && !isExporting
              ? 'bg-[#0D93AA] hover:bg-[#0B7A8D] active:bg-[#096677] text-white border-[#0D93AA] shadow-2xs cursor-pointer'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none'
          } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-1`}
          aria-label="Export End-of-Day"
          title={
            isExportDisabled
              ? 'No records available to export'
              : !isRangeValid
              ? 'Select a valid date range to enable Export'
              : 'Download End-of-Day records as CSV'
          }
        >
          <Download size={15} className="shrink-0" />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </button>

        {/* 6. Clear Date Range Button */}
        <button
          type="button"
          onClick={onClearDateRange}
          disabled={!hasAnyDate}
          className={`inline-flex items-center justify-center gap-1.5 h-[38px] px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
            hasAnyDate
              ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer shadow-2xs'
              : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed shadow-none'
          } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-1`}
          aria-label="Clear Date Range"
          title="Clear Date Range and restore default view"
        >
          <RotateCcw size={14} className="shrink-0" />
          <span>Clear Date Range</span>
        </button>

        {/* 7. Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-1.5 h-[38px] px-3 text-xs sm:text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-2xs disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-1"
          title="Refresh End-of-Day"
          aria-label="Refresh End-of-Day"
        >
          <RefreshCw
            size={14}
            className={`shrink-0 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-gray-500'}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Inline validation message */}
      {validationError && (
        <div
          role="alert"
          className="mt-2.5 pt-2 border-t border-rose-100 flex items-center gap-1.5 text-xs text-rose-600 font-medium animate-in fade-in"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
