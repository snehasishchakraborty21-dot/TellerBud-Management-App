import React, { useState, useRef, useEffect } from 'react';
import { Search, X, RotateCcw, Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  WalletFundingFilters,
  FundingOwnerType,
  FundingProvider,
  FundingStatus,
  WalletFundingRecord,
} from '../../types/walletFunding';
import { getZambiaTodayString } from '../../utils/dateUtils';

interface WalletFundingFilterBarProps {
  filters: WalletFundingFilters;
  onFilterChange: (filters: Partial<WalletFundingFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  recordsToExport: WalletFundingRecord[];
}

export const WalletFundingFilterBar: React.FC<WalletFundingFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  hasActiveFilters,
  isRefreshing,
  recordsToExport,
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
    const updates: Partial<WalletFundingFilters> = { initiatedFrom: val };
    if (val && filters.initiatedTo && val > filters.initiatedTo) {
      updates.initiatedTo = val;
    }
    onFilterChange(updates);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (filters.initiatedFrom && val && val < filters.initiatedFrom) {
      return;
    }
    onFilterChange({ initiatedTo: val });
  };

  const prepareExportData = () => {
    return recordsToExport.map((r) => {
      const isBiz = r.ownerType === 'Business';
      const ownerName = r.ownerName || (isBiz ? r.businessName : r.customerName) || 'Wallet Owner';
      const ownerId = r.ownerId || (isBiz ? r.businessId : r.customerId) || '';
      const phone = r.ownerPhone || r.customerMobileNumber || r.businessPhone || r.maskedMobileNumber || '';

      return {
        'Funding Reference': r.fundingReference,
        'Initiated Date and Time': r.initiatedAt,
        'Wallet Owner': ownerName,
        'Owner Type': r.ownerType || (isBiz ? 'Business' : 'Customer'),
        'Owner ID': ownerId,
        'Wallet ID': r.walletId,
        'Phone Number': phone,
        'Vendor': r.provider,
        'Amount (ZMW)': Number(r.amount.toFixed(2)),
        'Status': r.status,
        'Wallet Credit': r.walletCreditReference || (r.status === 'Completed' ? 'Credited' : r.status === 'Reversed' ? 'Reversed' : 'Awaiting Confirmation'),
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
    link.setAttribute('download', `TellerBud_Wallet_Funding_${todayStr}.csv`);
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
      { wch: 20 }, // Funding Reference
      { wch: 24 }, // Initiated Date and Time
      { wch: 28 }, // Wallet Owner
      { wch: 14 }, // Owner Type
      { wch: 18 }, // Owner ID
      { wch: 18 }, // Wallet ID
      { wch: 20 }, // Phone Number
      { wch: 22 }, // Vendor
      { wch: 16 }, // Amount (ZMW)
      { wch: 16 }, // Status
      { wch: 22 }, // Wallet Credit
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Wallet Funding');
    XLSX.writeFile(wb, `TellerBud_Wallet_Funding_${todayStr}.xlsx`);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
        {/* Left / Center: Search, Owner Type, Vendor, Status, From Date, To Date */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
          {/* 1. Funding Search */}
          <div className="relative w-full sm:w-[260px] lg:w-[290px] shrink-0">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              id="funding-search-input"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search funding reference, customer, business, wallet ID or phone..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] h-9 transition-colors"
              aria-label="Search funding reference, customer, business, wallet ID or phone"
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

          {/* 2. Owner Type Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Owner:
            </span>
            <select
              id="funding-owner-type-select"
              value={filters.ownerType || 'ALL'}
              onChange={(e) =>
                onFilterChange({
                  ownerType: e.target.value as 'ALL' | FundingOwnerType,
                })
              }
              aria-label="Filter by Wallet Owner type"
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Wallet Owners</option>
              <option value="Customer">Customers</option>
              <option value="Business">Businesses</option>
            </select>
          </div>

          {/* 3. Vendor Select */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Vendor:
            </span>
            <select
              id="funding-vendor-select"
              value={filters.provider}
              onChange={(e) =>
                onFilterChange({
                  provider: e.target.value as 'ALL' | FundingProvider,
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

          {/* 4. Status Select */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <select
              id="funding-status-select"
              value={filters.status}
              onChange={(e) =>
                onFilterChange({
                  status: e.target.value as 'ALL' | FundingStatus,
                })
              }
              aria-label="Filter by status"
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Statuses</option>
              <option value="Initiated">Initiated</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          {/* 5. From Date */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              From:
            </span>
            <input
              id="filter-initiated-from"
              type="date"
              value={filters.initiatedFrom}
              max={filters.initiatedTo || todayStr}
              onChange={handleFromDateChange}
              title="Initiated From Date"
              aria-label="Initiated From Date"
              className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
            />
          </div>

          {/* 6. To Date */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              To:
            </span>
            <input
              id="filter-initiated-to"
              type="date"
              value={filters.initiatedTo}
              min={filters.initiatedFrom || undefined}
              max={todayStr}
              onChange={handleToDateChange}
              title="Initiated To Date"
              aria-label="Initiated To Date"
              className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Clear Filters, Refresh, and Export */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto shrink-0">
          {/* Clear Filters */}
          <button
            type="button"
            id="btn-clear-funding-filters"
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
            id="btn-refresh-funding"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3.5 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh wallet funding records"
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
              id="btn-export-funding"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export wallet funding records"
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
