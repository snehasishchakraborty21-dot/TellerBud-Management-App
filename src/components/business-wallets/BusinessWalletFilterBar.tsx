import React from 'react';
import { Search, X, RotateCw, FilterX } from 'lucide-react';
import {
  BusinessWalletFilters,
  BusinessWalletState,
  BalanceRangeFilter,
} from '../../types/businessWallet';

interface BusinessWalletFilterBarProps {
  filters: BusinessWalletFilters;
  onFilterChange: (filters: Partial<BusinessWalletFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
}

export const BusinessWalletFilterBar: React.FC<BusinessWalletFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  hasActiveFilters,
  isRefreshing,
}) => {
  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs space-y-2.5">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search business, Business ID, owner or Wallet ID..."
          className="w-full pl-9 pr-9 py-2 bg-slate-50/70 border border-gray-200 rounded-lg text-xs sm:text-sm text-[#102025] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-all"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onFilterChange({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Row: Wallet State, Balance Range, Updated From, Updated To, Clear Filters, Refresh */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-2.5 pt-2 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
          {/* 1. Wallet State */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Wallet State
            </label>
            <select
              value={filters.state}
              onChange={(e) =>
                onFilterChange({
                  state: e.target.value as BusinessWalletState | 'ALL',
                })
              }
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-gray-200 rounded-lg text-[#102025] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
            >
              <option value="ALL">All States</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* 2. Balance Range */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Balance Range
            </label>
            <select
              value={filters.balanceRange}
              onChange={(e) =>
                onFilterChange({
                  balanceRange: e.target.value as BalanceRangeFilter,
                })
              }
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-gray-200 rounded-lg text-[#102025] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
            >
              <option value="ALL">All Balances</option>
              <option value="0-10000">ZMW 0–10,000</option>
              <option value="10001-50000">ZMW 10,001–50,000</option>
              <option value="50001-100000">ZMW 50,001–100,000</option>
              <option value="above-100000">Above ZMW 100,000</option>
            </select>
          </div>

          {/* 3. Updated From */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Updated From
            </label>
            <input
              type="date"
              value={filters.updatedFrom}
              onChange={(e) => onFilterChange({ updatedFrom: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-gray-200 rounded-lg text-[#102025] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
            />
          </div>

          {/* 4. Updated To */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Updated To
            </label>
            <input
              type="date"
              value={filters.updatedTo}
              onChange={(e) => onFilterChange({ updatedTo: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-gray-200 rounded-lg text-[#102025] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
            />
          </div>
        </div>

        {/* Clear Filters & Refresh */}
        <div className="flex items-center gap-2 justify-end shrink-0 pt-1 lg:pt-0">
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all h-[33px] ${
              hasActiveFilters
                ? 'border-[#0D93AA]/40 text-[#0D93AA] hover:bg-[#0D93AA]/10 bg-white cursor-pointer shadow-2xs'
                : 'border-gray-200 text-slate-400 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
            title={hasActiveFilters ? 'Clear all applied filters' : 'No filters applied'}
          >
            <FilterX size={14} />
            <span>Clear Filters</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-slate-700 hover:text-[#0D93AA] hover:border-[#0D93AA]/40 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA] cursor-pointer shadow-2xs h-[33px]"
            title="Refresh business wallet data"
          >
            <RotateCw
              size={14}
              className={`${isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-slate-500'}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
