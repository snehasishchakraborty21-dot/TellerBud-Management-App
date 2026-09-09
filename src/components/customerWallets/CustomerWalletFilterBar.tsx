import React from 'react';
import { Search, X, RotateCw, FilterX } from 'lucide-react';
import {
  CustomerWalletFilters,
  WalletAccountState,
  ReservationStateFilter,
  BalanceRangeFilter,
} from '../../types/customerWallet';

interface CustomerWalletFilterBarProps {
  filters: CustomerWalletFilters;
  onFilterChange: (filters: Partial<CustomerWalletFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
}

export const CustomerWalletFilterBar: React.FC<CustomerWalletFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  hasActiveFilters,
  isRefreshing,
}) => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-sm space-y-3">
      {/* Top Row: Search + Clear + Refresh */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by customer name, Customer ID, mobile number or Wallet ID..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50/60 border border-gray-200 rounded-lg text-xs sm:text-sm text-[#102025] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Buttons: Clear Filters & Refresh */}
        <div className="flex items-center gap-2 justify-end shrink-0">
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              hasActiveFilters
                ? 'border-[#0D93AA]/40 text-[#0D93AA] hover:bg-[#0D93AA]/10 bg-white cursor-pointer'
                : 'border-gray-200 text-slate-400 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
            title={hasActiveFilters ? 'Reset all applied filters' : 'No filters active'}
          >
            <FilterX size={14} />
            <span>Clear Filters</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-slate-700 hover:text-[#0D93AA] hover:border-[#0D93AA]/30 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA]"
            title="Refresh customer wallet data"
          >
            <RotateCw
              size={14}
              className={`${isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-slate-500'}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: State & Range Selectors + Dates */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 border-t border-gray-100">
        {/* Wallet State */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Wallet State
          </label>
          <select
            value={filters.walletState}
            onChange={(e) =>
              onFilterChange({
                walletState: e.target.value as WalletAccountState | 'ALL',
              })
            }
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
          >
            <option value="ALL">All States</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Reservation State */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Reservation State
          </label>
          <select
            value={filters.reservationState}
            onChange={(e) =>
              onFilterChange({
                reservationState: e.target.value as ReservationStateFilter,
              })
            }
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
          >
            <option value="ALL">All Reservations</option>
            <option value="RESERVED">Funds Reserved</option>
            <option value="NONE">No Reservations</option>
          </select>
        </div>

        {/* Balance Range */}
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
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
          >
            <option value="ALL">All Balances</option>
            <option value="UNDER_5K">Under ZMW 5,000</option>
            <option value="5K_15K">ZMW 5,000 – 15,000</option>
            <option value="15K_30K">ZMW 15,000 – 30,000</option>
            <option value="OVER_30K">Over ZMW 30,000</option>
          </select>
        </div>

        {/* Updated From */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Updated From
          </label>
          <input
            type="date"
            value={filters.updatedFrom}
            onChange={(e) => onFilterChange({ updatedFrom: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
          />
        </div>

        {/* Updated To */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Updated To
          </label>
          <input
            type="date"
            value={filters.updatedTo}
            onChange={(e) => onFilterChange({ updatedTo: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
          />
        </div>
      </div>
    </div>
  );
};
