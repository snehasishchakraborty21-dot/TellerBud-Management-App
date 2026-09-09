import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import {
  WalletFundingFilters,
  FundingProvider,
  FundingStatus,
} from '../../types/walletFunding';

interface WalletFundingFilterBarProps {
  filters: WalletFundingFilters;
  onFilterChange: (filters: Partial<WalletFundingFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
}

export const WalletFundingFilterBar: React.FC<WalletFundingFilterBarProps> = ({
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
            placeholder="Search ref, customer, ID, mobile, provider ref..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Select */}
          <div className="w-[140px] shrink-0">
            <select
              value={filters.provider}
              onChange={(e) =>
                onFilterChange({
                  provider: e.target.value as 'ALL' | FundingProvider,
                })
              }
              aria-label="Filter by provider"
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white"
            >
              <option value="ALL">All Providers</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="w-[130px] shrink-0">
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({
                  status: e.target.value as 'ALL' | FundingStatus,
                })
              }
              aria-label="Filter by status"
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Initiated">Initiated</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          {/* Initiated From Date */}
          <div className="w-[125px] shrink-0">
            <input
              type="date"
              value={filters.initiatedFrom}
              onChange={(e) => onFilterChange({ initiatedFrom: e.target.value })}
              title="Initiated From Date"
              aria-label="Initiated From Date"
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white"
            />
          </div>

          {/* Initiated To Date */}
          <div className="w-[125px] shrink-0">
            <input
              type="date"
              value={filters.initiatedTo}
              onChange={(e) => onFilterChange({ initiatedTo: e.target.value })}
              title="Initiated To Date"
              aria-label="Initiated To Date"
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white"
            />
          </div>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors shrink-0 ${
              hasActiveFilters
                ? 'border-gray-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs'
                : 'border-gray-100 text-slate-300 bg-slate-50 cursor-not-allowed'
            }`}
          >
            Clear Filters
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh funding records"
            aria-label="Refresh funding records"
            className="p-2 rounded-lg border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw
              size={14}
              className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
