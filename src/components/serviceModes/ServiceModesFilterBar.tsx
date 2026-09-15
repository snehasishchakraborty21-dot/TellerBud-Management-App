import React from 'react';
import { Search, RotateCw, X, Filter } from 'lucide-react';
import { ServiceModeFilters } from '../../types/serviceMode';

interface ServiceModesFilterBarProps {
  filters: ServiceModeFilters;
  onFilterChange: (newFilters: Partial<ServiceModeFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const ServiceModesFilterBar: React.FC<ServiceModesFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isRefreshing = false,
}) => {
  const hasActiveFilters = Boolean(
    filters.search.trim() !== '' ||
    filters.availability !== 'all' ||
    filters.audience !== 'all' ||
    filters.transactionType !== 'all'
  );

  return (
    <div
      id="service-modes-filter-bar"
      className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-3.5 shadow-xs flex flex-wrap items-center gap-2.5 sm:gap-3"
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          id="service-mode-search"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search by service name or service ID..."
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onFilterChange({ search: '' })}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Availability Filter */}
      <div className="min-w-[140px] flex-1 sm:flex-initial">
        <select
          id="filter-availability"
          value={filters.availability}
          onChange={(e) => onFilterChange({ availability: e.target.value })}
          className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
        >
          <option value="all">All Availability</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Coming Soon">Coming Soon</option>
        </select>
      </div>

      {/* Audience Filter */}
      <div className="min-w-[150px] flex-1 sm:flex-initial">
        <select
          id="filter-audience"
          value={filters.audience}
          onChange={(e) => onFilterChange({ audience: e.target.value })}
          className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
        >
          <option value="all">All Audiences</option>
          <option value="Customer App">Customer App</option>
          <option value="Agent App">Agent App</option>
          <option value="Customer and Agent">Customer and Agent</option>
        </select>
      </div>

      {/* Transaction Type Filter */}
      <div className="min-w-[160px] flex-1 sm:flex-initial">
        <select
          id="filter-transaction-type"
          value={filters.transactionType}
          onChange={(e) => onFilterChange({ transactionType: e.target.value })}
          className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
        >
          <option value="all">All Transaction Types</option>
          <option value="Deposit">Deposit</option>
          <option value="Withdrawal">Withdrawal</option>
          <option value="Purchase">Purchase</option>
          <option value="Liquidity Transfer">Liquidity Transfer</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      <button
        type="button"
        id="btn-clear-filters"
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
          hasActiveFilters
            ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs active:scale-[0.98]'
            : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
        }`}
        title={hasActiveFilters ? 'Reset all filters' : 'No active filters to clear'}
      >
        <X className="w-3.5 h-3.5" />
        <span>Clear Filters</span>
      </button>

      {/* Refresh Button */}
      <button
        type="button"
        id="btn-refresh-service-modes"
        onClick={onRefresh}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
        title="Refresh service modes (preserves active filters)"
      >
        <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>
  );
};
