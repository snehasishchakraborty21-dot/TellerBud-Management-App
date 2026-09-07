import React from 'react';
import { Search, RotateCcw, RefreshCw, Calendar } from 'lucide-react';
import { AttendanceFilters, AttendanceStatusType, AssignmentType } from '../../types/attendance';

interface AttendanceFilterBarProps {
  filters: AttendanceFilters;
  onFilterChange: (filters: AttendanceFilters) => void;
  onClear: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isCurrentDate?: boolean;
}

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
  filters,
  onFilterChange,
  onClear,
  onRefresh,
  isRefreshing = false,
  isCurrentDate = true,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* 1. Search Input */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search Agent name, ID or phone"
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all"
          />
        </div>

        {/* 2. Attendance Date (dd-mm-yyyy) */}
        <div className="lg:col-span-2 relative">
          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.date}
            onChange={(e) => {
              const newDate = e.target.value;
              const willBeCurrent = !newDate || newDate === '01-09-2026';
              let newStatus = filters.status;
              if (willBeCurrent && newStatus === 'No Attendance Record') {
                newStatus = 'ALL';
              } else if (!willBeCurrent && (newStatus === 'Checked In' || newStatus === 'Not Checked In')) {
                newStatus = 'ALL';
              }
              onFilterChange({ ...filters, date: newDate, status: newStatus });
            }}
            placeholder="dd-mm-yyyy"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all font-mono"
          />
        </div>

        {/* 3. Attendance Status Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as AttendanceStatusType | 'ALL',
              })
            }
            aria-label="Attendance Status"
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all"
          >
            <option value="ALL">All Attendance</option>
            {isCurrentDate ? (
              <>
                <option value="Checked In">Checked In</option>
                <option value="Checked Out">Checked Out</option>
                <option value="Not Checked In">Not Checked In</option>
              </>
            ) : (
              <>
                <option value="Checked Out">Checked Out</option>
                <option value="No Attendance Record">No Attendance Record</option>
              </>
            )}
          </select>
        </div>

        {/* 4. Current Activity Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={filters.assignment}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                assignment: e.target.value as AssignmentType | 'ALL',
              })
            }
            aria-label="Current Activity"
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all"
          >
            <option value="ALL">All Activities</option>
            <option value="Pickup">Pickup</option>
          </select>
        </div>

        {/* 5. Clear and Refresh Controls */}
        <div className="lg:col-span-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-600 hover:text-[#0D93AA] bg-gray-50 hover:bg-cyan-50 border border-gray-200 hover:border-[#0D93AA]/30 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Refresh Attendance"
            aria-label="Refresh Attendance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
