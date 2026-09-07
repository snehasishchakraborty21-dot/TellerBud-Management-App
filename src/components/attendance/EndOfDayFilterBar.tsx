import React from 'react';
import { Search, RotateCcw, RefreshCw, Calendar } from 'lucide-react';
import { EndOfDayFilters, EndOfDayStatusType, AgentAvailabilityType } from '../../types/attendance';

interface EndOfDayFilterBarProps {
  filters: EndOfDayFilters;
  onFilterChange: (filters: EndOfDayFilters) => void;
  onClear: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const EndOfDayFilterBar: React.FC<EndOfDayFilterBarProps> = ({
  filters,
  onFilterChange,
  onClear,
  onRefresh,
  isRefreshing = false,
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
            placeholder="Search Agent name, ID or reference"
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all"
          />
        </div>

        {/* 2. Business Date (dd-mm-yyyy) */}
        <div className="lg:col-span-2 relative">
          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.businessDate}
            onChange={(e) => onFilterChange({ ...filters, businessDate: e.target.value })}
            placeholder="dd-mm-yyyy"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all font-mono"
          />
        </div>

        {/* 3. Status Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as EndOfDayStatusType | 'ALL',
              })
            }
            aria-label="End-of-Day Status"
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending Submission">Pending Submission</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Reconciled">Reconciled</option>
            <option value="Exception">Exception</option>
          </select>
        </div>

        {/* 4. Availability Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={filters.availability}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                availability: e.target.value as AgentAvailabilityType | 'ALL',
              })
            }
            aria-label="Agent Availability"
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all"
          >
            <option value="ALL">All Availabilities</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Offline">Offline</option>
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
            title="Refresh End-of-Day"
            aria-label="Refresh End-of-Day"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
