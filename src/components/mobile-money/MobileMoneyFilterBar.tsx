import React from 'react';
import { Search, RefreshCw, X, RotateCcw } from 'lucide-react';
import {
  MobileMoneyFilters,
  ServiceChannel,
  MobileMoneyTransactionType,
} from '../../types/mobileMoney';

interface MobileMoneyFilterBarProps {
  filters: MobileMoneyFilters;
  onFilterChange: (updates: Partial<MobileMoneyFilters>) => void;
  onClear: () => void;
  onRefresh: () => void;
  isFiltered: boolean;
  isRefreshing: boolean;
  isSuperAdmin?: boolean;
}

const KNOWN_BUSINESSES = [
  'Lusaka Central Express Agency',
  'Copperbelt Liquidity Hub',
  'Livingstone Digital Agency',
  'Kabwata Market Agency',
  'Ndola Commerce Express',
];

export const MobileMoneyFilterBar: React.FC<MobileMoneyFilterBarProps> = ({
  filters,
  onFilterChange,
  onClear,
  onRefresh,
  isFiltered,
  isRefreshing,
  isSuperAdmin = false,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
      {/* Top row: Search and primary selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search input */}
        <div className="sm:col-span-2 lg:col-span-6 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            id="mobile-money-search-input"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search reference, customer or agent..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              aria-label="Clear search text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Service Channel */}
        <div className="lg:col-span-3">
          <select
            id="mobile-money-channel-select"
            value={filters.serviceChannel}
            onChange={(e) =>
              onFilterChange({
                serviceChannel: e.target.value as ServiceChannel | 'ALL',
              })
            }
            className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Service Channels</option>
            <option value="Pickup">Pickup</option>
            <option value="Walk-In">Walk-In</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div className="lg:col-span-3">
          <select
            id="mobile-money-type-select"
            value={filters.transactionType}
            onChange={(e) =>
              onFilterChange({
                transactionType: e.target.value as MobileMoneyTransactionType | 'ALL',
              })
            }
            className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>
      </div>

      {/* Second row: Dates, Business filter (if Super Admin), and action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Super Admin Business Filter */}
          {isSuperAdmin && (
            <div className="min-w-[180px]">
              <select
                id="mobile-money-business-select"
                value={filters.business}
                onChange={(e) => onFilterChange({ business: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
              >
                <option value="ALL">All Businesses</option>
                {KNOWN_BUSINESSES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date From */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-medium whitespace-nowrap">From:</span>
            <input
              type="date"
              id="mobile-money-date-from"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
              className="px-2 py-1 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-medium whitespace-nowrap">To:</span>
            <input
              type="date"
              id="mobile-money-date-to"
              value={filters.dateTo}
              onChange={(e) => onFilterChange({ dateTo: e.target.value })}
              className="px-2 py-1 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Action buttons: Clear & Refresh */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            id="mobile-money-clear-filters-btn"
            onClick={onClear}
            disabled={!isFiltered}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isFiltered
                ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer shadow-2xs'
                : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={13} />
            Clear
          </button>

          <button
            type="button"
            id="mobile-money-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-gray-500'}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
