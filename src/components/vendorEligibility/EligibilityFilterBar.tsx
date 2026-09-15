import React from 'react';
import { Search, RotateCcw, X, Filter } from 'lucide-react';
import { EligibilityFilters } from '../../types/vendor';

interface EligibilityFilterBarProps {
  filters: EligibilityFilters;
  onFilterChange: (updates: Partial<EligibilityFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isEditing?: boolean;
}

export const EligibilityFilterBar: React.FC<EligibilityFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isRefreshing = false,
  isEditing = false,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.type !== 'All' ||
    filters.status !== 'All' ||
    filters.service !== 'All';

  const editingTooltip = isEditing ? 'Save or cancel your eligibility changes first.' : undefined;

  return (
    <div
      id="vendor-eligibility-filter-bar"
      className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-xs"
      title={editingTooltip}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]" title={editingTooltip}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="eligibility-search-input"
            type="text"
            disabled={isEditing}
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by vendor name or vendor ID..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all disabled:bg-slate-100 disabled:text-slate-700 disabled:placeholder:text-slate-500 disabled:opacity-90 disabled:cursor-not-allowed"
          />
          {filters.search && !isEditing && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              aria-label="Clear search text"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Vendor Type */}
          <div className="min-w-[140px] flex-1 sm:flex-initial" title={editingTooltip}>
            <label htmlFor="filter-vendor-type" className="sr-only">
              Vendor Type
            </label>
            <select
              id="filter-vendor-type"
              disabled={isEditing}
              value={filters.type}
              onChange={(e) =>
                onFilterChange({ type: e.target.value as EligibilityFilters['type'] })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all disabled:bg-slate-100 disabled:text-slate-700 disabled:opacity-90 disabled:cursor-not-allowed"
            >
              <option value="All">All Vendor Types</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          {/* Vendor Status */}
          <div className="min-w-[130px] flex-1 sm:flex-initial" title={editingTooltip}>
            <label htmlFor="filter-vendor-status" className="sr-only">
              Vendor Status
            </label>
            <select
              id="filter-vendor-status"
              disabled={isEditing}
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ status: e.target.value as EligibilityFilters['status'] })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all disabled:bg-slate-100 disabled:text-slate-700 disabled:opacity-90 disabled:cursor-not-allowed"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Service */}
          <div className="min-w-[160px] flex-1 sm:flex-initial" title={editingTooltip}>
            <label htmlFor="filter-service" className="sr-only">
              Service
            </label>
            <select
              id="filter-service"
              disabled={isEditing}
              value={filters.service}
              onChange={(e) =>
                onFilterChange({ service: e.target.value as EligibilityFilters['service'] })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all disabled:bg-slate-100 disabled:text-slate-700 disabled:opacity-90 disabled:cursor-not-allowed"
            >
              <option value="All">All Services</option>
              <option value="Cash Pickup">Cash Pickup</option>
              <option value="Wallet Funding">Wallet Funding</option>
              <option value="Customer Withdrawal">Customer Withdrawal</option>
              <option value="Walk-In Transaction">Walk-In Transaction</option>
            </select>
          </div>

          {/* Actions: Clear Filters & Refresh */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Always present in the DOM between Service and Refresh */}
            <button
              id="btn-clear-eligibility-filters"
              type="button"
              disabled={!hasActiveFilters || isEditing}
              onClick={onClearFilters}
              title={
                isEditing
                  ? editingTooltip
                  : hasActiveFilters
                  ? 'Reset all filters to default'
                  : 'No filters applied'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                !hasActiveFilters || isEditing
                  ? 'bg-slate-50 text-slate-500 border-slate-200 opacity-80 cursor-not-allowed'
                  : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200 cursor-pointer'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>

            <button
              id="btn-refresh-eligibility"
              type="button"
              disabled={isRefreshing || isEditing}
              onClick={onRefresh}
              title={isEditing ? editingTooltip : 'Refresh eligibility status'}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-700"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
