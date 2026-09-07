import React from 'react';
import {
  AgentFilters,
  AgentAvailabilityStatus,
  AgentAssignmentType,
  AgentAttendanceStatus,
} from '../../types/admin';
import { Search, RotateCw, X } from 'lucide-react';

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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

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
    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 space-y-3 shadow-2xs">
      {/* Primary Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search Agent name, ID or phone"
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
          />
        </div>

        {/* 2. Availability Dropdown */}
        <div>
          <select
            value={filters.availability}
            onChange={handleAvailabilityChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
          >
            <option value="ALL">All Availability</option>
            <option value="Online">Online</option>
            <option value="Available">Available</option>
            <option value="Assigned">On Active Request</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* 3. Assignment / Current Activity Dropdown */}
        <div>
          <select
            value={filters.assignment}
            onChange={handleAssignmentChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
          >
            <option value="ALL">All Activities</option>
            <option value="Pickup">Pickup</option>
            <option value="Unassigned">Standby</option>
          </select>
        </div>

        {/* 4. Attendance Dropdown */}
        <div>
          <select
            value={filters.attendance}
            onChange={handleAttendanceChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
          >
            <option value="ALL">All Attendance</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Not Checked In">Not Checked In</option>
          </select>
        </div>
      </div>

      {/* Action Row: Clear & Refresh */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!isFiltered}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer"
          title="Clear all filters and search"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh agents list"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? 'animate-spin text-[#0D93AA]' : ''
              }`}
            />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
};
