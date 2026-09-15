import React from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  X,
  Calendar,
} from 'lucide-react';
import {
  WalletType,
  LedgerEntryType,
  LedgerDirection,
  ReconciliationState,
} from '../../types/walletLedger';

export interface WalletLedgerFilterState {
  search: string;
  walletType: 'ALL' | WalletType;
  entryType: 'ALL' | LedgerEntryType;
  direction: 'ALL' | LedgerDirection;
  reconciliation: 'ALL' | ReconciliationState;
  dateFrom: string;
  dateTo: string;
}

interface WalletLedgerFiltersProps {
  filters: WalletLedgerFilterState;
  onFilterChange: (newFilters: Partial<WalletLedgerFilterState>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing?: boolean;
  filteredCount: number;
}

export const WalletLedgerFilters: React.FC<WalletLedgerFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onExport,
  isRefreshing = false,
  filteredCount,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.walletType !== 'ALL' ||
    filters.entryType !== 'ALL' ||
    filters.direction !== 'ALL' ||
    filters.reconciliation !== 'ALL' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* Top row: Search input + Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search ledger reference, wallet ID, holder or source reference..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-2xs ${
              hasActiveFilters
                ? 'text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                : 'text-slate-400 bg-slate-50 border border-gray-200 cursor-not-allowed opacity-75'
            }`}
            title="Clear all active filters"
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs disabled:opacity-60"
            title="Refresh Ledger Data"
          >
            <RefreshCw
              size={13}
              className={`text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
            title="Export only currently filtered results"
          >
            <Download size={13} />
            <span>Export Ledger</span>
          </button>
        </div>
      </div>

      {/* Second row: Dropdowns & Date inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 border-t border-gray-100">
        {/* 1. Wallet Type */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Wallet Type
          </label>
          <select
            value={filters.walletType}
            onChange={(e) => onFilterChange({ walletType: e.target.value as any })}
            className="w-full text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
          >
            <option value="ALL">All Wallet Types</option>
            <option value="Customer Wallet">Customer Wallet</option>
            <option value="Business Global Wallet">Business Global Wallet</option>
          </select>
        </div>

        {/* 2. Entry Type */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Entry Type
          </label>
          <select
            value={filters.entryType}
            onChange={(e) => onFilterChange({ entryType: e.target.value as any })}
            className="w-full text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer truncate"
          >
            <option value="ALL">All Entry Types</option>
            <option value="Funding Credit">Funding Credit</option>
            <option value="Transaction Credit">Transaction Credit</option>
            <option value="Withdrawal Debit">Withdrawal Debit</option>
            <option value="Transaction Debit">Transaction Debit</option>
            <option value="Reservation Created">Reservation Created</option>
            <option value="Reservation Released">Reservation Released</option>
            <option value="Transaction Charge">Transaction Charge</option>
            <option value="Reversal">Reversal</option>
          </select>
        </div>

        {/* 3. Direction */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Direction
          </label>
          <select
            value={filters.direction}
            onChange={(e) => onFilterChange({ direction: e.target.value as any })}
            className="w-full text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
          >
            <option value="ALL">All Directions</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
            <option value="Hold Memo">Hold Memo</option>
          </select>
        </div>

        {/* 4. Reconciliation */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Reconciliation
          </label>
          <select
            value={filters.reconciliation}
            onChange={(e) => onFilterChange({ reconciliation: e.target.value as any })}
            className="w-full text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
          >
            <option value="ALL">All Reconciliation</option>
            <option value="Matched">Matched</option>
            <option value="Pending">Pending</option>
            <option value="Exception">Exception</option>
          </select>
        </div>

        {/* 5. Date From */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
          />
        </div>

        {/* 6. Date To */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange({ dateTo: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
