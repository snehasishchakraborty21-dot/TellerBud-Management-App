import React from 'react';
import { Search, X, Calendar, Filter } from 'lucide-react';
import {
  WithdrawalFilters,
  WithdrawalStatus,
  WithdrawalNetwork,
} from '../../types/admin';

interface WithdrawalFilterToolbarProps {
  filters: WithdrawalFilters;
  onFilterChange: <K extends keyof WithdrawalFilters>(key: K, value: WithdrawalFilters[K]) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export const WithdrawalFilterToolbar: React.FC<WithdrawalFilterToolbarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isFiltered,
}) => {
  // Max date is today (e.g., 2026-08-31)
  const todayStr = new Date().toISOString().split('T')[0];

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
      return; // Do not allow toDate earlier than fromDate
    }
    onFilterChange('toDate', val);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search reference, Customer or phone"
            className="w-full pl-9 pr-8 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-2">
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange('status', e.target.value as WithdrawalStatus | 'ALL')
            }
            aria-label="Filter by status"
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium cursor-pointer"
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

        {/* Network Dropdown */}
        <div className="md:col-span-2">
          <select
            value={filters.network}
            onChange={(e) =>
              onFilterChange('network', e.target.value as WithdrawalNetwork | 'ALL')
            }
            aria-label="Filter by network"
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium cursor-pointer"
          >
            <option value="ALL">All Networks</option>
            <option value="MTN Mobile Money">MTN Mobile Money</option>
            <option value="Airtel Money">Airtel Money</option>
          </select>
        </div>

        {/* Date Ranges */}
        <div className="md:col-span-3 flex items-center gap-2">
          <div className="relative flex-1">
            <label
              htmlFor="withdrawal-from-date"
              className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
            >
              FROM DATE
            </label>
            <input
              id="withdrawal-from-date"
              type="date"
              value={filters.fromDate}
              max={todayStr}
              onChange={handleFromDateChange}
              aria-label="From Date"
              title="From Date"
              className="w-full px-2 py-1.5 bg-gray-50/70 border border-gray-200 rounded-lg text-xs text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
            />
          </div>
          <div className="relative flex-1">
            <label
              htmlFor="withdrawal-to-date"
              className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
            >
              TO DATE
            </label>
            <input
              id="withdrawal-to-date"
              type="date"
              value={filters.toDate}
              min={filters.fromDate || undefined}
              max={todayStr}
              onChange={handleToDateChange}
              aria-label="To Date"
              title="To Date"
              className="w-full px-2 py-1.5 bg-gray-50/70 border border-gray-200 rounded-lg text-xs text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="md:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!isFiltered}
            className={`w-full md:w-auto px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              isFiltered
                ? 'text-[#0D93AA] hover:bg-[#0D93AA]/10 cursor-pointer'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};
