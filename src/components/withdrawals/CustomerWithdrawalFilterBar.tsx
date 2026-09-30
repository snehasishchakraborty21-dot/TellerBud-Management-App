import React, { useState, useRef, useEffect } from 'react';
import { Search, X, RotateCcw, Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { WithdrawalStatus, WithdrawalNetwork, CustomerWithdrawal } from '../../types/admin';
import { getZambiaTodayString } from '../../utils/dateUtils';
import { formatWithdrawalDate, formatZambianMobileNumber } from '../../utils/formatters';

export interface CustomerWithdrawalFiltersState {
  search: string;
  provider: 'ALL' | WithdrawalNetwork;
  status: 'ALL' | WithdrawalStatus;
  submittedFrom: string;
  submittedTo: string;
}

interface CustomerWithdrawalFilterBarProps {
  filters: CustomerWithdrawalFiltersState;
  onFilterChange: (changes: Partial<CustomerWithdrawalFiltersState>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  withdrawalsToExport?: CustomerWithdrawal[];
}

export const CustomerWithdrawalFilterBar: React.FC<CustomerWithdrawalFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  hasActiveFilters,
  isRefreshing,
  withdrawalsToExport = [],
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const todayStr = getZambiaTodayString() || new Date().toISOString().split('T')[0];

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
    const updates: Partial<CustomerWithdrawalFiltersState> = { submittedFrom: val };
    if (val && filters.submittedTo && val > filters.submittedTo) {
      updates.submittedTo = val;
    }
    onFilterChange(updates);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (filters.submittedFrom && val && val < filters.submittedFrom) {
      return;
    }
    onFilterChange({ submittedTo: val });
  };

  const prepareExportData = () => {
    return withdrawalsToExport.map((w) => {
      const isReservationActive =
        w.status === 'Pending Review' ||
        w.status === 'Approved' ||
        w.status === 'Processing';

      const reservedAmount = isReservationActive
        ? (w.reservedFunds ?? w.amount)
        : 0;

      return {
        'Withdrawal Reference': w.reference,
        'Submitted Date': formatWithdrawalDate(w.requestedAt),
        'Customer Name': w.customerName,
        'Customer ID': w.customerId || '',
        'Wallet ID': w.walletId || '',
        'Vendor': w.network,
        'Withdrawal Amount (ZMW)': Number(w.amount.toFixed(2)),
        'Mobile Number': formatZambianMobileNumber(w.payoutNumber || w.customerPhone),
        'Reserved Funds (ZMW)': isReservationActive ? Number(reservedAmount.toFixed(2)) : '—',
        'Status': w.status,
      };
    });
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
    link.setAttribute('download', `TellerBud_Customer_Withdrawals_${todayStr}.csv`);
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
      { wch: 22 }, // Withdrawal Reference
      { wch: 22 }, // Submitted Date
      { wch: 24 }, // Customer Name
      { wch: 18 }, // Customer ID
      { wch: 18 }, // Wallet ID
      { wch: 20 }, // Vendor
      { wch: 22 }, // Withdrawal Amount (ZMW)
      { wch: 20 }, // Mobile Number
      { wch: 20 }, // Reserved Funds (ZMW)
      { wch: 16 }, // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Withdrawals');
    XLSX.writeFile(wb, `TellerBud_Customer_Withdrawals_${todayStr}.xlsx`);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
        {/* Left: Search, Vendor, Status, From Date, To Date */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-[220px] lg:w-[240px] shrink-0">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              id="withdrawal-search-input"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search reference, customer, ID or mobile…"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] h-9 transition-colors"
              aria-label="Search reference, customer, ID or mobile"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search input"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Vendor Select (Updated from Provider) */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Vendor:
            </span>
            <select
              id="withdrawal-vendor-select"
              value={filters.provider}
              onChange={(e) =>
                onFilterChange({
                  provider: e.target.value as 'ALL' | WithdrawalNetwork,
                })
              }
              aria-label="Filter by Vendor"
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Vendors</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <select
              id="withdrawal-status-select"
              value={filters.status}
              onChange={(e) =>
                onFilterChange({
                  status: e.target.value as 'ALL' | WithdrawalStatus,
                })
              }
              aria-label="Filter by status"
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
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

          {/* Submitted From Date */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              From:
            </span>
            <input
              id="filter-submitted-from"
              type="date"
              value={filters.submittedFrom}
              max={filters.submittedTo || todayStr}
              onChange={handleFromDateChange}
              title="Submitted From Date"
              aria-label="Submitted From Date"
              className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Submitted To Date */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              To:
            </span>
            <input
              id="filter-submitted-to"
              type="date"
              value={filters.submittedTo}
              min={filters.submittedFrom || undefined}
              max={todayStr}
              onChange={handleToDateChange}
              title="Submitted To Date"
              aria-label="Submitted To Date"
              className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Clear Filters, Refresh, and Export */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto shrink-0">
          {/* Clear Filters */}
          <button
            type="button"
            id="btn-clear-withdrawal-filters"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              hasActiveFilters
                ? 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 cursor-pointer'
                : 'text-gray-400 bg-transparent border-gray-200/60 opacity-50 cursor-not-allowed'
            }`}
            title={hasActiveFilters ? 'Reset all applied filters' : 'No filters active'}
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            id="btn-refresh-withdrawals"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3.5 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh customer withdrawal records"
          >
            <RotateCcw
              size={13}
              className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
            />
            <span>Refresh</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              id="btn-export-withdrawals"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export customer withdrawal records"
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
