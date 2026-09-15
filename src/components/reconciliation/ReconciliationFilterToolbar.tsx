import React from 'react';
import { Search, RotateCcw, RefreshCw, Download, X } from 'lucide-react';
import {
  ReconciliationProvider,
  ReconciliationTransactionType,
  ProviderResponseStatus,
  ReconciliationStatus,
} from '../../types/reconciliation';

export interface ReconciliationFilterState {
  search: string;
  provider: 'ALL' | ReconciliationProvider;
  transactionType: 'ALL' | ReconciliationTransactionType;
  providerStatus: 'ALL' | ProviderResponseStatus;
  reconciliationStatus: 'ALL' | ReconciliationStatus;
  dateFrom: string;
  dateTo: string;
}

interface ReconciliationFilterToolbarProps {
  filters: ReconciliationFilterState;
  onFilterChange: (newFilters: Partial<ReconciliationFilterState>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing: boolean;
  filteredCount: number;
  totalCount: number;
}

export const ReconciliationFilterToolbar: React.FC<ReconciliationFilterToolbarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onExport,
  isRefreshing,
  filteredCount,
  totalCount,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.provider !== 'ALL' ||
    filters.transactionType !== 'ALL' ||
    filters.providerStatus !== 'ALL' ||
    filters.reconciliationStatus !== 'ALL' ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* Top row: Search input & Primary Action Buttons */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search reconciliation, transaction, wallet or customer..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-800 placeholder-slate-400 bg-white"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
            >
              <RotateCcw size={13} />
              Clear Filters
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#102025] hover:bg-slate-50 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh records"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
            Refresh
          </button>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7D91] rounded-lg transition-colors shadow-xs"
            title="Export filtered records"
          >
            <Download size={13} />
            Export Records
          </button>
        </div>
      </div>

      {/* Second row: Dropdown Filters & Date Range */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* Provider */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Provider
          </label>
          <select
            value={filters.provider}
            onChange={(e) =>
              onFilterChange({ provider: e.target.value as 'ALL' | ReconciliationProvider })
            }
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-800 bg-white"
          >
            <option value="ALL">All Providers</option>
            <option value="MTN Mobile Money">MTN Mobile Money</option>
            <option value="Airtel Money">Airtel Money</option>
            <option value="TellerBud Ledger">TellerBud Ledger</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Transaction Type
          </label>
          <select
            value={filters.transactionType}
            onChange={(e) =>
              onFilterChange({
                transactionType: e.target.value as 'ALL' | ReconciliationTransactionType,
              })
            }
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-800 bg-white"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="Wallet Funding">Wallet Funding</option>
            <option value="Customer Withdrawal">Customer Withdrawal</option>
            <option value="Customer Transaction">Customer Transaction</option>
            <option value="Business Wallet Transaction">Business Wallet Transaction</option>
            <option value="Reversal">Reversal</option>
          </select>
        </div>

        {/* Provider Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Provider Status
          </label>
          <select
            value={filters.providerStatus}
            onChange={(e) =>
              onFilterChange({
                providerStatus: e.target.value as 'ALL' | ProviderResponseStatus,
              })
            }
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-800 bg-white"
          >
            <option value="ALL">All Provider Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Successful">Successful</option>
            <option value="Failed">Failed</option>
            <option value="Expired">Expired</option>
            <option value="Reversed">Reversed</option>
            <option value="Awaiting Callback">Awaiting Callback</option>
          </select>
        </div>

        {/* Reconciliation Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Reconciliation Status
          </label>
          <select
            value={filters.reconciliationStatus}
            onChange={(e) =>
              onFilterChange({
                reconciliationStatus: e.target.value as 'ALL' | ReconciliationStatus,
              })
            }
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-800 bg-white"
          >
            <option value="ALL">All Reconciliation States</option>
            <option value="Matched">Matched</option>
            <option value="Pending">Pending</option>
            <option value="Exception">Exception</option>
            <option value="Reversed">Reversed</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-800 bg-white"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange({ dateTo: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-800 bg-white"
          />
        </div>
      </div>

      {/* Filter status banner if filtered */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-gray-100">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{filteredCount}</strong> of{' '}
            {totalCount} total reconciliation records
          </span>
          <button
            onClick={onClearFilters}
            className="text-[#0D93AA] hover:underline font-medium text-xs"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
