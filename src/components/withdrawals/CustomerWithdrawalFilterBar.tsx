import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { WithdrawalStatus, WithdrawalNetwork } from '../../types/admin';

export interface CustomerWithdrawalFiltersState {
  search: string;
  provider: 'ALL' | WithdrawalNetwork;
  status: 'ALL' | WithdrawalStatus;
  submittedFrom: string;
  submittedTo: string;
}

interface CustomerWithdrawalFilterBarProps {
  filters: CustomerWithdrawalFiltersState;
  onFilterChange: (changes: Partial<CustomerWithdrawalFiltersState>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
}

export const CustomerWithdrawalFilterBar: React.FC<CustomerWithdrawalFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  hasActiveFilters,
  isRefreshing,
}) => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-3 sm:p-3.5 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search reference, customer, ID or mobile…"
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Select */}
          <div className="w-[145px] shrink-0">
            <select
              value={filters.provider}
              onChange={(e) =>
                onFilterChange({
                  provider: e.target.value as 'ALL' | WithdrawalNetwork,
                })
              }
              aria-label="Filter by provider"
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Providers</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="w-[140px] shrink-0">
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({
                  status: e.target.value as 'ALL' | WithdrawalStatus,
                })
              }
              aria-label="Filter by status"
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Submitted From Date with label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label
              htmlFor="filter-submitted-from"
              className="text-xs font-semibold text-slate-700 shrink-0"
            >
              From
            </label>
            <input
              id="filter-submitted-from"
              type="date"
              value={filters.submittedFrom}
              onChange={(e) => onFilterChange({ submittedFrom: e.target.value })}
              title="Submitted From Date"
              aria-label="Submitted From Date"
              className="w-[125px] px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] focus:bg-white"
            />
          </div>

          {/* Submitted To Date with label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label
              htmlFor="filter-submitted-to"
              className="text-xs font-semibold text-slate-700 shrink-0"
            >
              To
            </label>
            <input
              id="filter-submitted-to"
              type="date"
              value={filters.submittedTo}
              onChange={(e) => onFilterChange({ submittedTo: e.target.value })}
              title="Submitted To Date"
              aria-label="Submitted To Date"
              className="w-[125px] px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] focus:bg-white"
            />
          </div>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
              hasActiveFilters
                ? 'border-gray-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs'
                : 'border-gray-100 text-slate-400 bg-slate-50 cursor-not-allowed'
            }`}
          >
            Clear Filters
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh customer withdrawal records"
            aria-label="Refresh customer withdrawal records"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <RotateCcw
              size={13}
              className={`shrink-0 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-slate-600'}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
