import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw, Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  CustomerWalletFilters,
  WalletAccountState,
  BalanceRangeFilter,
  CustomerWalletRecord,
} from '../../types/customerWallet';
import { getZambiaTodayString } from '../../utils/dateUtils';

interface CustomerWalletFilterBarProps {
  filters: CustomerWalletFilters;
  onFilterChange: (filters: Partial<CustomerWalletFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  walletsToExport: CustomerWalletRecord[];
}

export const CustomerWalletFilterBar: React.FC<CustomerWalletFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  hasActiveFilters,
  isRefreshing,
  walletsToExport,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const todayStr = getZambiaTodayString() || new Date().toISOString().split('T')[0];

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const updates: Partial<CustomerWalletFilters> = { updatedFrom: val };
    if (val && filters.updatedTo && val > filters.updatedTo) {
      updates.updatedTo = val;
    }
    onFilterChange(updates);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (filters.updatedFrom && val && val < filters.updatedFrom) {
      return;
    }
    onFilterChange({ updatedTo: val });
  };

  const prepareExportData = () => {
    return walletsToExport.map((w) => ({
      'Customer': w.customerName,
      'Wallet ID': w.walletId,
      'Balance (ZMW)': Number(w.walletBalance.toFixed(2)),
      'Available (ZMW)': Number(w.availableBalance.toFixed(2)),
      'Reserved (ZMW)': Number(w.reservedFunds.toFixed(2)),
      'Pending Withdrawal (ZMW)':
        w.pendingWithdrawalAmount !== null ? Number(w.pendingWithdrawalAmount.toFixed(2)) : 0,
    }));
  };

  const handleExportCSV = () => {
    setShowExportMenu(false);
    const data = prepareExportData();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const val = (row as Record<string, string | number>)[header];
            const escaped = String(val ?? '').replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      ),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `TellerBud_Customer_Wallets_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    const data = prepareExportData();
    if (data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 28 }, // Customer
      { wch: 18 }, // Wallet ID
      { wch: 20 }, // Balance (ZMW)
      { wch: 20 }, // Available (ZMW)
      { wch: 20 }, // Reserved (ZMW)
      { wch: 28 }, // Pending Withdrawal (ZMW)
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customer Wallets');
    XLSX.writeFile(wb, `TellerBud_Customer_Wallets_${todayStr}.xlsx`);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
        {/* Left Side: Filter Selectors (Wallet State, Balance Range, Updated From, Updated To) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          {/* 1. Wallet State */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              State:
            </span>
            <select
              id="customer-wallet-state-select"
              value={filters.walletState}
              onChange={(e) =>
                onFilterChange({
                  walletState: e.target.value as WalletAccountState | 'ALL',
                })
              }
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by Wallet State"
            >
              <option value="ALL">All States</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* 2. Balance Range */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Balance:
            </span>
            <select
              id="customer-wallet-balance-range-select"
              value={filters.balanceRange}
              onChange={(e) =>
                onFilterChange({
                  balanceRange: e.target.value as BalanceRangeFilter,
                })
              }
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by Balance Range"
            >
              <option value="ALL">All Balances</option>
              <option value="UNDER_5K">Under ZMW 5,000</option>
              <option value="5K_15K">ZMW 5,000 – 15,000</option>
              <option value="15K_30K">ZMW 15,000 – 30,000</option>
              <option value="OVER_30K">Over ZMW 30,000</option>
            </select>
          </div>

          {/* 3. Updated From */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              From:
            </span>
            <input
              type="date"
              id="customer-wallet-from-date"
              value={filters.updatedFrom}
              max={filters.updatedTo || todayStr}
              onChange={handleFromDateChange}
              className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
              aria-label="Filter by Updated From Date"
            />
          </div>

          {/* 4. Updated To */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              To:
            </span>
            <input
              type="date"
              id="customer-wallet-to-date"
              value={filters.updatedTo}
              min={filters.updatedFrom || undefined}
              max={todayStr}
              onChange={handleToDateChange}
              className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
              aria-label="Filter by Updated To Date"
            />
          </div>
        </div>

        {/* Right Side: Clear Filters, Refresh, and Export */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
          {/* 5. Clear Filters */}
          <button
            type="button"
            id="btn-clear-customer-wallet-filters"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              hasActiveFilters
                ? 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 cursor-pointer'
                : 'text-gray-400 bg-transparent border-gray-200/60 opacity-50 cursor-not-allowed'
            }`}
            title={hasActiveFilters ? 'Reset filters' : 'No filters active'}
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>

          {/* 6. Refresh */}
          <button
            type="button"
            id="btn-refresh-customer-wallets"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3.5 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh customer wallet records"
          >
            <RotateCw
              size={13}
              className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
            />
            <span>Refresh</span>
          </button>

          {/* 7. Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              id="btn-export-customer-wallets"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export customer wallet records"
            >
              <Download size={13} />
              <span>Export</span>
              <ChevronDown
                size={12}
                className={showExportMenu ? 'rotate-180 transition-transform' : 'transition-transform'}
              />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" />
                  <span>Export as Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileText size={14} className="text-blue-600" />
                  <span>Export as CSV (.csv)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
