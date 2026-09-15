import React from 'react';
import { Search, RotateCcw, RefreshCw, X } from 'lucide-react';
import { VendorFilters, VendorType, VendorStatus, SupportedService } from '../../types/vendor';

interface VendorFilterBarProps {
  filters: VendorFilters;
  onFilterChange: (filters: VendorFilters) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  totalFiltered: number;
  totalCount: number;
}

export const VendorFilterBar: React.FC<VendorFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isRefreshing = false,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.type !== 'All' ||
    filters.status !== 'All' ||
    filters.service !== 'All';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleClearSearch = () => {
    onFilterChange({ ...filters, search: '' });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      type: e.target.value as 'All' | VendorType,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: e.target.value as 'All' | VendorStatus,
    });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      service: e.target.value as 'All' | SupportedService,
    });
  };

  return (
    <div
      id="vendor-filter-bar"
      className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs"
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            id="vendor-search-input"
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by vendor name or vendor ID..."
            aria-label="Search by vendor name or vendor ID"
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
          />
          {filters.search && (
            <button
              onClick={handleClearSearch}
              aria-label="Clear search text"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Vendor Type Filter */}
          <div className="flex-1 sm:flex-initial min-w-[140px]">
            <select
              id="vendor-type-select"
              value={filters.type}
              onChange={handleTypeChange}
              aria-label="Vendor Type"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
            >
              <option value="All">All Vendor Types</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 sm:flex-initial min-w-[130px]">
            <select
              id="vendor-status-select"
              value={filters.status}
              onChange={handleStatusChange}
              aria-label="Status"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending Integration">Pending Integration</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Supported Service Filter */}
          <div className="flex-1 sm:flex-initial min-w-[160px]">
            <select
              id="vendor-service-select"
              value={filters.service}
              onChange={handleServiceChange}
              aria-label="Supported Service"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
            >
              <option value="All">All Services</option>
              <option value="Cash Pickup">Cash Pickup</option>
              <option value="Wallet Funding">Wallet Funding</option>
              <option value="Customer Withdrawal">Customer Withdrawal</option>
              <option value="Walk-In Transaction">Walk-In Transaction</option>
              <option value="Agent-to-Agent Liquidity">Agent-to-Agent Liquidity</option>
            </select>
          </div>

          {/* Clear Filters Button - disabled until at least one filter or search is active */}
          <button
            id="clear-filters-btn"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            aria-disabled={!hasActiveFilters}
            aria-label="Clear Filters"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors shrink-0 ${
              hasActiveFilters
                ? 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300 shadow-2xs cursor-pointer'
                : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title="Clear all filters"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Clear Filters</span>
            <span className="sm:hidden">Clear</span>
          </button>

          {/* Refresh Button */}
          <button
            id="refresh-vendors-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
            title="Refresh vendor list (preserves active filters)"
          >
            <RefreshCw
              size={13}
              className={`text-[#0D93AA] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
