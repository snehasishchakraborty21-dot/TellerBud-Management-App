import React from 'react';
import { Search, X, RotateCw, Filter } from 'lucide-react';
import { CustomerFilters, CustomerAccountStatus } from '../../types/customer';

interface CustomerFilterBarProps {
  filters: CustomerFilters;
  onFilterChange: <K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isFiltered: boolean;
  isRefreshing?: boolean;
}

export const CustomerFilterBar: React.FC<CustomerFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFiltered,
  isRefreshing = false,
}) => {
  const todayStr = '2026-09-08';

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
      {/* Top Filter Row: Search & Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {/* Search Input */}
        <div className="sm:col-span-2 lg:col-span-4 relative">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Search by Customer name, Customer ID or mobile number"
              className="w-full pl-9 pr-8 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange('search', '')}
                aria-label="Clear search text"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Account Status
          </label>
          <select
            value={filters.accountStatus}
            onChange={(e) =>
              onFilterChange(
                'accountStatus',
                e.target.value as CustomerAccountStatus | 'ALL'
              )
            }
            className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Request State */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Request State
          </label>
          <select
            value={filters.requestState}
            onChange={(e) =>
              onFilterChange(
                'requestState',
                e.target.value as 'ALL' | 'HAS_ACTIVE' | 'NO_ACTIVE'
              )
            }
            className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
          >
            <option value="ALL">All Request States</option>
            <option value="HAS_ACTIVE">Has Active Requests</option>
            <option value="NO_ACTIVE">No Active Requests</option>
          </select>
        </div>

        {/* Withdrawal State */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Withdrawal State
          </label>
          <select
            value={filters.withdrawalState}
            onChange={(e) =>
              onFilterChange(
                'withdrawalState',
                e.target.value as 'ALL' | 'HAS_PENDING' | 'NO_PENDING'
              )
            }
            className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
          >
            <option value="ALL">All Withdrawal States</option>
            <option value="HAS_PENDING">Has Pending Withdrawal</option>
            <option value="NO_PENDING">No Pending Withdrawal</option>
          </select>
        </div>
      </div>

      {/* Bottom Filter Row: Date Range & Action Buttons */}
      <div className="flex flex-wrap items-end justify-between gap-3 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Registration Date From */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">
              Registration From:
            </span>
            <input
              type="date"
              value={filters.fromDate}
              max={todayStr}
              onChange={handleFromDateChange}
              className="py-1.5 px-2.5 bg-gray-50/70 border border-gray-200 rounded-lg text-xs text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
            />
          </div>

          {/* Registration Date To */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">To:</span>
            <input
              type="date"
              value={filters.toDate}
              min={filters.fromDate || undefined}
              max={todayStr}
              onChange={handleToDateChange}
              className="py-1.5 px-2.5 bg-gray-50/70 border border-gray-200 rounded-lg text-xs text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Clear & Refresh Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!isFiltered}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all select-none ${
              isFiltered
                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#102025] hover:border-gray-300 cursor-pointer shadow-2xs'
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            title={isFiltered ? 'Reset applied filters' : 'Clear is disabled until a search or filter is applied'}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#102025] hover:border-gray-300 shadow-2xs transition-all cursor-pointer select-none"
            title="Refresh customer data while preserving current filters"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
