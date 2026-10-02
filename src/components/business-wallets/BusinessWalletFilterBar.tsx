import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, FilterX, Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import {
  BusinessWalletFilters,
  BusinessWalletState,
  BalanceRangeFilter,
} from '../../types/businessWallet';

interface BusinessWalletFilterBarProps {
  filters: BusinessWalletFilters;
  onFilterChange: (filters: Partial<BusinessWalletFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
}

export const BusinessWalletFilterBar: React.FC<BusinessWalletFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onExportExcel,
  onExportCSV,
  hasActiveFilters,
  isRefreshing,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 shadow-xs">
      {/* Single horizontal bar on desktop: 1. Wallet State, 2. Balance Range, 3. Updated From, 4. Updated To, 5. Clear Filters, 6. Refresh, 7. Export */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-2.5">
        {/* 1. Wallet State */}
        <div className="flex items-center gap-1.5 min-w-[140px] flex-1 sm:flex-initial">
          <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap shrink-0">
            State:
          </label>
          <select
            value={filters.state}
            onChange={(e) =>
              onFilterChange({
                state: e.target.value as BusinessWalletState | 'ALL',
              })
            }
            aria-label="Wallet State"
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-[#102025] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] h-[34px] cursor-pointer"
          >
            <option value="ALL">All States</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* 2. Balance Range */}
        <div className="flex items-center gap-1.5 min-w-[155px] flex-1 sm:flex-initial">
          <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap shrink-0">
            Balance:
          </label>
          <select
            value={filters.balanceRange}
            onChange={(e) =>
              onFilterChange({
                balanceRange: e.target.value as BalanceRangeFilter,
              })
            }
            aria-label="Balance Range"
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-[#102025] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] h-[34px] cursor-pointer"
          >
            <option value="ALL">All Balances</option>
            <option value="0-10000">ZMW 0–10,000</option>
            <option value="10001-50000">ZMW 10,001–50,000</option>
            <option value="50001-100000">ZMW 50,001–100,000</option>
            <option value="above-100000">Above ZMW 100,000</option>
          </select>
        </div>

        {/* 3. Updated From */}
        <div className="flex items-center gap-1.5 min-w-[145px] flex-1 sm:flex-initial">
          <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap shrink-0">
            From:
          </label>
          <input
            type="date"
            value={filters.updatedFrom}
            onChange={(e) => onFilterChange({ updatedFrom: e.target.value })}
            aria-label="Updated From"
            className="w-full px-2 py-1 text-xs bg-slate-50 border border-gray-200 rounded-lg text-[#102025] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] h-[34px] cursor-pointer"
          />
        </div>

        {/* 4. Updated To */}
        <div className="flex items-center gap-1.5 min-w-[145px] flex-1 sm:flex-initial">
          <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap shrink-0">
            To:
          </label>
          <input
            type="date"
            value={filters.updatedTo}
            onChange={(e) => onFilterChange({ updatedTo: e.target.value })}
            aria-label="Updated To"
            className="w-full px-2 py-1 text-xs bg-slate-50 border border-gray-200 rounded-lg text-[#102025] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] h-[34px] cursor-pointer"
          />
        </div>

        {/* Spacer for desktop horizontal alignment */}
        <div className="hidden lg:block lg:flex-1" />

        {/* Action Buttons: 5. Clear Filters, 6. Refresh, 7. Export */}
        <div className="flex items-center gap-2 justify-end shrink-0 ml-auto lg:ml-0">
          {/* 5. Clear Filters */}
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all h-[34px] shrink-0 ${
              hasActiveFilters
                ? 'border-[#0D93AA]/40 text-[#0D93AA] hover:bg-[#0D93AA]/10 bg-white cursor-pointer shadow-2xs'
                : 'border-gray-200 text-slate-400 bg-gray-50 opacity-60 cursor-not-allowed'
            }`}
            title={hasActiveFilters ? 'Clear all applied filters' : 'No filters applied'}
          >
            <FilterX size={13} />
            <span className="whitespace-nowrap">Clear Filters</span>
          </button>

          {/* 6. Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-slate-700 hover:text-[#0D93AA] hover:border-[#0D93AA]/40 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA] cursor-pointer shadow-2xs h-[34px] shrink-0"
            title="Refresh business wallet data"
          >
            <RotateCw
              size={13}
              className={`${isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-slate-500'}`}
            />
            <span className="whitespace-nowrap">Refresh</span>
          </button>

          {/* 7. Export with Dropdown (Excel and CSV) */}
          <div className="relative shrink-0" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportOpen((prev) => !prev)}
              aria-expanded={exportOpen}
              aria-haspopup="true"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0D93AA] text-white hover:bg-[#0b8296] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] cursor-pointer shadow-xs h-[34px] shrink-0"
              title="Export business global wallets"
            >
              <Download size={13} />
              <span className="whitespace-nowrap">Export</span>
              <ChevronDown size={12} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setExportOpen(false);
                    onExportExcel();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
                  <span>Export as Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportOpen(false);
                    onExportCSV();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] flex items-center gap-2 transition-colors cursor-pointer border-t border-gray-100"
                >
                  <FileText size={14} className="text-sky-600 shrink-0" />
                  <span>Export as CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
