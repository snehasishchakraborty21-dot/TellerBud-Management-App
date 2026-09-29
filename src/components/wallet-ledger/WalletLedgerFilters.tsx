import React from 'react';
import {
  RefreshCw,
  Download,
  X,
} from 'lucide-react';
import {
  WalletType,
  LedgerEntryType,
  ReconciliationState,
} from '../../types/walletLedger';

export interface WalletLedgerFilterState {
  walletType: 'ALL' | WalletType;
  entryType: 'ALL' | LedgerEntryType;
  reconciliation: 'ALL' | ReconciliationState;
  dateFrom: string;
  dateTo: string;
  search?: string;
  direction?: string;
}

interface WalletLedgerFiltersProps {
  filters: WalletLedgerFilterState;
  onFilterChange: (newFilters: Partial<WalletLedgerFilterState>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing?: boolean;
  filteredCount?: number;
}

export const WalletLedgerFilters: React.FC<WalletLedgerFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onExport,
  isRefreshing = false,
}) => {
  const hasActiveFilters =
    filters.walletType !== 'ALL' ||
    filters.entryType !== 'ALL' ||
    filters.reconciliation !== 'ALL' ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-xs">
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none flex-nowrap">
        {/* Left / Middle: Filters and Secondary Actions in single horizontal line */}
        <div className="flex items-center gap-2 flex-nowrap shrink-0">
          {/* 1. Wallet Type */}
          <div className="shrink-0">
            <select
              value={filters.walletType}
              onChange={(e) => onFilterChange({ walletType: e.target.value as any })}
              className="h-[36px] text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white text-slate-800 font-medium cursor-pointer w-[140px] sm:w-[150px] truncate"
              title="Filter by Wallet Type"
            >
              <option value="ALL">All Wallet Types</option>
              <option value="Customer Wallet">Customer Wallet</option>
              <option value="Business Global Wallet">Business Global Wallet</option>
            </select>
          </div>

          {/* 2. Entry Type */}
          <div className="shrink-0">
            <select
              value={filters.entryType}
              onChange={(e) => onFilterChange({ entryType: e.target.value as any })}
              className="h-[36px] text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white text-slate-800 font-medium cursor-pointer w-[145px] sm:w-[155px] truncate"
              title="Filter by Entry Type"
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

          {/* 3. Reconciliation */}
          <div className="shrink-0">
            <select
              value={filters.reconciliation}
              onChange={(e) => onFilterChange({ reconciliation: e.target.value as any })}
              className="h-[36px] text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white text-slate-800 font-medium cursor-pointer w-[135px] sm:w-[145px] truncate"
              title="Filter by Reconciliation State"
            >
              <option value="ALL">All Reconciliation</option>
              <option value="Matched">Matched</option>
              <option value="Pending">Pending</option>
              <option value="Exception">Exception</option>
            </select>
          </div>

          {/* 4. From Date */}
          <div className="shrink-0 flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-400 hidden xl:inline">From</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
              className="h-[36px] text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white text-slate-800 cursor-pointer w-[125px] sm:w-[130px]"
              title="Filter From Date"
            />
          </div>

          {/* 5. To Date */}
          <div className="shrink-0 flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-400 hidden xl:inline">To</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange({ dateTo: e.target.value })}
              className="h-[36px] text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white text-slate-800 cursor-pointer w-[125px] sm:w-[130px]"
              title="Filter To Date"
            />
          </div>

          {/* 6. Clear Filters */}
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`h-[36px] inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs ${
              hasActiveFilters
                ? 'text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                : 'text-slate-400 bg-slate-50 border border-gray-200 cursor-not-allowed opacity-70'
            }`}
            title="Clear active filters"
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>

          {/* 7. Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-[36px] inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs disabled:opacity-60"
            title="Refresh Ledger Data"
          >
            <RefreshCw
              size={13}
              className={`text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Right side: 8. Export Ledger */}
        <div className="shrink-0 ml-auto pl-2">
          <button
            type="button"
            onClick={onExport}
            className="h-[36px] inline-flex items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
            title="Export filtered records to CSV"
          >
            <Download size={13} />
            <span>Export Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
};
