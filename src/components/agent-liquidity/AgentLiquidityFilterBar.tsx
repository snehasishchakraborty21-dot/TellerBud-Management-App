import React from 'react';
import { Search, X, RotateCcw, RefreshCw } from 'lucide-react';
import {
  AgentToAgentFilters,
  AgentToAgentStatus,
  AgentToAgentRequestType,
} from '../../types/admin';

interface AgentLiquidityFilterBarProps {
  filters: AgentToAgentFilters;
  onFilterChange: <K extends keyof AgentToAgentFilters>(
    key: K,
    value: AgentToAgentFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh?: () => void;
  isFiltered: boolean;
  isRefreshing?: boolean;
}

export const AgentLiquidityFilterBar: React.FC<AgentLiquidityFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFiltered,
  isRefreshing = false,
}) => {
  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onFilterChange('fromDate', val);
    if (val && filters.toDate && val > filters.toDate) {
      onFilterChange('toDate', val);
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (filters.fromDate && val && val < filters.fromDate) {
      return;
    }
    onFilterChange('toDate', val);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {/* Search Input */}
        <div className="lg:col-span-3 sm:col-span-2 relative">
          <label
            htmlFor="agent-liquidity-search"
            className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
          >
            SEARCH
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="agent-liquidity-search"
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Search reference, Agent or Agent ID"
              className="w-full pl-9 pr-8 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange('search', '')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="lg:col-span-2">
          <label
            htmlFor="agent-liquidity-status-filter"
            className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
          >
            STATUS
          </label>
          <select
            id="agent-liquidity-status-filter"
            value={filters.status}
            onChange={(e) =>
              onFilterChange('status', e.target.value as AgentToAgentStatus | 'ALL')
            }
            aria-label="Filter by status"
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Matching">Matching</option>
            <option value="Agent Matched">Agent Matched</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="No Agent Available">No Agent Available</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Request Type Dropdown */}
        <div className="lg:col-span-2">
          <label
            htmlFor="agent-liquidity-type-filter"
            className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
          >
            REQUEST TYPE
          </label>
          <select
            id="agent-liquidity-type-filter"
            value={filters.requestType}
            onChange={(e) =>
              onFilterChange(
                'requestType',
                e.target.value as AgentToAgentRequestType | 'ALL'
              )
            }
            aria-label="Filter by request type"
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium cursor-pointer"
          >
            <option value="ALL">All Request Types</option>
            <option value="Cash">Cash</option>
            <option value="Float">Float</option>
          </select>
        </div>

        {/* From Date */}
        <div className="lg:col-span-2">
          <label
            htmlFor="agent-liquidity-from-date"
            className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
          >
            FROM DATE
          </label>
          <input
            id="agent-liquidity-from-date"
            type="date"
            value={filters.fromDate}
            onChange={handleFromDateChange}
            aria-label="Filter from date"
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
          />
        </div>

        {/* To Date */}
        <div className="lg:col-span-2">
          <label
            htmlFor="agent-liquidity-to-date"
            className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
          >
            TO DATE
          </label>
          <input
            id="agent-liquidity-to-date"
            type="date"
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={handleToDateChange}
            aria-label="Filter to date"
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
          />
        </div>

        {/* Action Buttons: Clear & Refresh */}
        <div className="lg:col-span-1 sm:col-span-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!isFiltered}
            title="Clear all filters"
            aria-label="Clear all filters"
            className="flex-1 py-2 px-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Clear</span>
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh queue"
              aria-label="Refresh queue"
              className="py-2 px-2.5 bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 text-[#0D93AA] font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center disabled:opacity-40 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
