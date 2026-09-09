import React from 'react';
import { Search, X, RefreshCw, Calendar } from 'lucide-react';
import { BusinessFilters, BusinessAccountStatus, BusinessWalletState } from '../../types/business';

interface BusinessFilterBarProps {
  filters: BusinessFilters;
  onFilterChange: <K extends keyof BusinessFilters>(key: K, value: BusinessFilters[K]) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isFiltered: boolean;
  isRefreshing: boolean;
}

export const BusinessFilterBar: React.FC<BusinessFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFiltered,
  isRefreshing,
}) => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-3 sm:p-4 shadow-xs space-y-3">
      {/* Top row: Search and primary selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 1. Search input with ample room so placeholder is never awkwardly clipped */}
        <div className="relative min-w-0">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none shrink-0"
          />
          <input
            type="text"
            id="business-search-input"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by business, ID, owner, mobile, city..."
            className="w-full h-9 pl-9 pr-8 text-xs bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 placeholder:text-[11.5px] sm:placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* 2. Business Status */}
        <div className="min-w-0">
          <select
            id="business-status-select"
            value={filters.status}
            onChange={(e) =>
              onFilterChange('status', e.target.value as BusinessAccountStatus | 'ALL')
            }
            className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
            aria-label="Filter by Business Status"
          >
            <option value="ALL">All Business Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* 3. Province */}
        <div className="min-w-0">
          <select
            id="business-province-select"
            value={filters.province}
            onChange={(e) => onFilterChange('province', e.target.value)}
            className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
            aria-label="Filter by Province"
          >
            <option value="ALL">All Provinces (Zambia)</option>
            <option value="Lusaka Province">Lusaka Province</option>
            <option value="Copperbelt Province">Copperbelt Province</option>
            <option value="Central Province">Central Province</option>
            <option value="Southern Province">Southern Province</option>
            <option value="Eastern Province">Eastern Province</option>
          </select>
        </div>

        {/* 4. Wallet State */}
        <div className="min-w-0">
          <select
            id="business-wallet-state-select"
            value={filters.walletState}
            onChange={(e) =>
              onFilterChange('walletState', e.target.value as BusinessWalletState | 'ALL')
            }
            className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
            aria-label="Filter by Wallet State"
          >
            <option value="ALL">All Wallet States</option>
            <option value="Active">Active Balance</option>
            <option value="Low Balance">Low Balance</option>
            <option value="Suspended">Suspended Wallet</option>
          </select>
        </div>
      </div>

      {/* Second row: Registration Date range, Clear, and Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar size={12} className="text-gray-400" />
            Registered:
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              id="business-from-date"
              value={filters.fromDate}
              onChange={(e) => onFilterChange('fromDate', e.target.value)}
              className="h-8 px-2.5 text-xs bg-gray-50/50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              title="Registered from date"
            />
            <span className="text-xs text-gray-400 font-medium">to</span>
            <input
              type="date"
              id="business-to-date"
              value={filters.toDate}
              onChange={(e) => onFilterChange('toDate', e.target.value)}
              className="h-8 px-2.5 text-xs bg-gray-50/50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              title="Registered to date"
            />
          </div>
        </div>

        {/* Clear Filters & Refresh buttons - Clear button is always visible, disabled when no filter active */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            id="btn-clear-business-filters"
            onClick={onClearFilters}
            disabled={!isFiltered}
            className={`h-8 px-2.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
              isFiltered
                ? 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 cursor-pointer'
                : 'text-gray-400 bg-transparent border-gray-200/60 opacity-50 cursor-not-allowed'
            }`}
            title={isFiltered ? 'Clear all active filters' : 'No filters active'}
          >
            <X size={12} />
            Clear Filters
          </button>

          <button
            type="button"
            id="btn-refresh-businesses"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh businesses"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
