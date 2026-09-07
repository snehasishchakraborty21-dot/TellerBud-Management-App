import React from 'react';
import { Search, X } from 'lucide-react';
import {
  CashFloatFilters,
  CashFloatStatus,
  CashFloatRequestType,
} from '../../types/admin';

interface CashFloatFilterToolbarProps {
  filters: CashFloatFilters;
  onFilterChange: <K extends keyof CashFloatFilters>(key: K, value: CashFloatFilters[K]) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export const CashFloatFilterToolbar: React.FC<CashFloatFilterToolbarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isFiltered,
}) => {
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
      return;
    }
    onFilterChange('toDate', val);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <label
            htmlFor="cash-float-search"
            className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
          >
            SEARCH
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="cash-float-search"
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Search reference, Agent or Agent ID"
              className="w-full pl-9 pr-8 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange('search', '')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-2">
          <label
            htmlFor="cash-float-status-filter"
            className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
          >
            STATUS
          </label>
          <select
            id="cash-float-status-filter"
            value={filters.status}
            onChange={(e) =>
              onFilterChange('status', e.target.value as CashFloatStatus | 'ALL')
            }
            aria-label="Filter by status"
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Processing">Processing</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Request Type Dropdown */}
        <div className="md:col-span-2">
          <label
            htmlFor="cash-float-type-filter"
            className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
          >
            REQUEST TYPE
          </label>
          <select
            id="cash-float-type-filter"
            value={filters.requestType}
            onChange={(e) =>
              onFilterChange('requestType', e.target.value as CashFloatRequestType | 'ALL')
            }
            aria-label="Filter by request type"
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium cursor-pointer"
          >
            <option value="ALL">All Request Types</option>
            <option value="Cash">Cash</option>
            <option value="Float">Float</option>
          </select>
        </div>

        {/* Date Ranges */}
        <div className="md:col-span-3 flex items-center gap-2">
          <div className="relative flex-1">
            <label
              htmlFor="cash-float-from-date"
              className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
            >
              FROM DATE
            </label>
            <input
              id="cash-float-from-date"
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
              htmlFor="cash-float-to-date"
              className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5"
            >
              TO DATE
            </label>
            <input
              id="cash-float-to-date"
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

        {/* Clear Filters Action */}
        <div className="md:col-span-1 flex justify-end">
          {isFiltered ? (
            <button
              type="button"
              onClick={onClearFilters}
              aria-label="Clear all filters"
              className="w-full py-2 px-2.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              aria-label="No active filters to clear"
              className="w-full py-2 px-2.5 text-xs font-semibold text-gray-400 bg-gray-100/70 rounded-lg inline-flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
