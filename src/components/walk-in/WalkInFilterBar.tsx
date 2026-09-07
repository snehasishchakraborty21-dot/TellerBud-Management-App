import React from 'react';
import { Search, X, RotateCw } from 'lucide-react';
import {
  WalkInFilters,
  WalkInTransactionType,
  WalkInTransactionStatus,
  ApprovedVendor,
} from '../../types/admin';
import { ALL_APPROVED_VENDORS } from '../../config/appConfig';

interface WalkInFilterBarProps {
  filters: WalkInFilters;
  onFilterChange: (filters: Partial<WalkInFilters>) => void;
  onClearFilters: () => void;
  onRefresh?: () => void;
  isFiltered: boolean;
  isRefreshing?: boolean;
}

export const WalkInFilterBar: React.FC<WalkInFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFiltered,
  isRefreshing = false,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
        {/* 1. Search Box */}
        <div className="lg:col-span-2 space-y-1">
          <label className="block text-xs font-bold text-gray-700">
            Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search reference, Agent or phone"
              className="w-full pl-9 pr-8 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                title="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Transaction Type */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">
            Transaction Type
          </label>
          <select
            value={filters.transactionType}
            onChange={(e) =>
              onFilterChange({
                transactionType: e.target.value as WalkInTransactionType | 'ALL',
              })
            }
            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>

        {/* 3. Vendor */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">
            Vendor
          </label>
          <select
            value={filters.vendor}
            onChange={(e) =>
              onFilterChange({
                vendor: e.target.value as ApprovedVendor | 'ALL',
              })
            }
            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
          >
            <option value="ALL">All Vendors</option>
            {ALL_APPROVED_VENDORS.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Status */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value as WalkInTransactionStatus | 'ALL',
              })
            }
            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* 5. From Date & To Date & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-bold text-gray-700">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => onFilterChange({ fromDate: e.target.value })}
              className="w-full px-2 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-bold text-gray-700">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => onFilterChange({ toDate: e.target.value })}
              className="w-full px-2 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter Actions: Clear and Refresh */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!isFiltered}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer"
          title="Clear all filters"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh queue data"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? 'animate-spin text-[#0D93AA]' : ''
              }`}
            />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
};
