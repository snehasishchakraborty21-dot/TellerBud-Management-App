import React, { useState } from 'react';
import { Download, RotateCcw, RefreshCw } from 'lucide-react';
import { AttendanceFilters, AttendanceStatusType, AssignmentType } from '../../types/attendance';
import { AttendanceDateRangePicker } from './AttendanceDateRangePicker';

interface AttendanceFilterBarProps {
  filters: AttendanceFilters;
  onFilterChange: (filters: AttendanceFilters) => void;
  onExport: () => void;
  onClearDateRange: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isExporting?: boolean;
  isExportDisabled?: boolean;
  isCurrentDate?: boolean;
}

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
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
        date: from === to ? from : undefined,
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
    <div className="bg-white px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 shadow-2xs">
      {/* All controls on a single horizontal line */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left Filters: From Date, To Date, All Attendance, All Activities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1 min-w-0">
          {/* 1. From Date & 2. To Date */}
          <AttendanceDateRangePicker
            className="contents"
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onChange={handleDateChange}
            onValidationError={setValidationError}
          />

          {/* 3. All Attendance Dropdown */}
          <div className="min-w-0">
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  status: e.target.value as AttendanceStatusType | 'ALL',
                })
              }
              aria-label="All Attendance"
              className="w-full h-[36px] px-3 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Attendance</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Not Checked In">Not Checked In</option>
              <option value="No Attendance Record">No Attendance Record</option>
            </select>
          </div>

          {/* 4. All Activities Dropdown */}
          <div className="min-w-0">
            <select
              value={filters.assignment}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  assignment: e.target.value as AssignmentType | 'ALL',
                })
              }
              aria-label="All Activities"
              className="w-full h-[36px] px-3 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Activities</option>
              <option value="Pickup">Pickup</option>
              <option value="Walk-In">Walk-In</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>

        {/* Right Action Buttons: Export, Clear Date Range, Refresh */}
        <div className="flex items-center gap-2 shrink-0 lg:ml-auto">
          {/* 5. Export Button */}
          <button
            type="button"
            onClick={onExport}
            disabled={isExportDisabled || !isRangeValid || isExporting}
            className={`inline-flex items-center justify-center gap-1.5 h-[36px] px-3 text-xs font-semibold rounded-lg border transition-all ${
              !isExportDisabled && isRangeValid && !isExporting
                ? 'bg-[#0D93AA] hover:bg-[#0B7A8D] active:bg-[#096677] text-white border-[#0D93AA] shadow-2xs cursor-pointer'
                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]`}
            aria-label="Export Attendance"
            title="Download Attendance records as CSV"
          >
            <Download size={14} className="shrink-0" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>

          {/* 6. Clear Date Range Button */}
          <button
            type="button"
            onClick={onClearDateRange}
            disabled={!hasAnyDate}
            className={`inline-flex items-center justify-center gap-1.5 h-[36px] px-3 text-xs font-semibold rounded-lg border transition-all ${
              hasAnyDate
                ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer shadow-2xs'
                : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed shadow-none'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]`}
            aria-label="Clear Date Range"
            title="Clear Date Range"
          >
            <RotateCcw size={13} className="shrink-0" />
            <span>Clear Date Range</span>
          </button>

          {/* 7. Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 h-[36px] px-3 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-2xs disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]"
            title="Refresh Attendance"
            aria-label="Refresh Attendance"
          >
            <RefreshCw
              size={13}
              className={`shrink-0 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-gray-500'}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
