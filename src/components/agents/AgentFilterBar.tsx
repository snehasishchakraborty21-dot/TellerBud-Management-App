import React from 'react';
import {
  AgentFilters,
  AgentAvailabilityStatus,
  AgentAssignmentType,
  AgentAttendanceStatus,
} from '../../types/admin';
import { RotateCw, RotateCcw } from 'lucide-react';

interface AgentFilterBarProps {
  filters: AgentFilters;
  onFilterChange: (filters: AgentFilters) => void;
  onClearFilters: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isFiltered: boolean;
}

export const AgentFilterBar: React.FC<AgentFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isRefreshing = false,
  isFiltered,
}) => {
  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      availability: e.target.value as AgentAvailabilityStatus | 'ALL' | 'Online',
    });
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      assignment: e.target.value as AgentAssignmentType | 'ALL',
    });
  };

  const handleAttendanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      attendance: e.target.value as AgentAttendanceStatus | 'ALL',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs px-3.5 sm:px-4 py-2.5 sm:py-3">
      {/* Controls arranged in one compact row: [All Availability] [All Activities] [All Attendance] [Clear] [Refresh] */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: 3 equal-width dropdown filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl lg:max-w-3xl">
          {/* 1. Availability */}
          <div>
            <select
              value={filters.availability}
              onChange={handleAvailabilityChange}
              aria-label="Filter by availability"
              className="w-full h-[36px] px-3 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Availability</option>
              <option value="Online">Online</option>
              <option value="Available">Available</option>
              <option value="Assigned">On Active Request</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {/* 2. Assignment / Activities */}
          <div>
            <select
              value={filters.assignment}
              onChange={handleAssignmentChange}
              aria-label="Filter by activity"
              className="w-full h-[36px] px-3 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Activities</option>
              <option value="Pickup">Pickup</option>
              <option value="Unassigned">Standby</option>
            </select>
          </div>

          {/* 3. Attendance */}
          <div>
            <select
              value={filters.attendance}
              onChange={handleAttendanceChange}
              aria-label="Filter by attendance"
              className="w-full h-[36px] px-3 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Attendance</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Not Checked In">Not Checked In</option>
            </select>
          </div>
        </div>

        {/* Right: Action Buttons (Clear & Refresh) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 sm:ml-auto">
          <button
            type="button"
            id="agent-clear-filters-btn"
            onClick={onClearFilters}
            disabled={!isFiltered}
            className={`inline-flex items-center justify-center gap-1.5 h-[36px] px-3.5 text-xs font-semibold rounded-lg border transition-all ${
              isFiltered
                ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer shadow-2xs'
                : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed shadow-none'
            }`}
            title="Clear all filters"
          >
            <RotateCcw size={13} className="shrink-0" />
            <span>Clear</span>
          </button>

          {onRefresh && (
            <button
              type="button"
              id="agent-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 h-[36px] px-3.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer shadow-2xs disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]"
              title="Refresh agents list"
            >
              <RotateCw
                size={13}
                className={`shrink-0 ${
                  isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-gray-500'
                }`}
              />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

