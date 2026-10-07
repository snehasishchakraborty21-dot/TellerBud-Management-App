import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
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
      <div className="w-full overflow-x-auto transaction-table-scroll focus:outline-none">
        {/* Evenly distributed single horizontal line on desktop with minmax widths and exact required order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(180px,1.2fr)_minmax(180px,1.2fr)_minmax(150px,1fr)_minmax(155px,1fr)_minmax(155px,1fr)_auto_auto_auto] gap-2.5 items-center w-full min-w-max lg:min-w-0">
          {/* 1. Owner */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 w-full min-w-0">
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
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer w-full min-w-0 pr-1"
            >
              <option value="ALL">All Wallet Owners</option>
              <option value="Customer">Customers</option>
              <option value="Business">Businesses</option>
            </select>
          </div>

          {/* 2. Vendor */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 w-full min-w-0">
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
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer w-full min-w-0 pr-1"
            >
              <option value="ALL">All Vendors</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
            </select>
          </div>

          {/* 3. Status */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 w-full min-w-0">
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
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer w-full min-w-0 pr-1"
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

          {/* 4. From Date */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 w-full min-w-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              From:
            </span>
            <input
              id="filter-initiated-from"
              type="date"
              value={filters.initiatedFrom}
              max={filters.initiatedTo || todayStr}
              placeholder="dd-mm-yyyy"
              onChange={handleFromDateChange}
              title="Initiated From Date (dd-mm-yyyy)"
              aria-label="Initiated From Date"
              className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer w-full min-w-0"
            />
          </div>

          {/* 5. To Date */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 w-full min-w-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              To:
            </span>
            <input
              id="filter-initiated-to"
              type="date"
              value={filters.initiatedTo}
              min={filters.initiatedFrom || undefined}
              max={todayStr}
              placeholder="dd-mm-yyyy"
              onChange={handleToDateChange}
              title="Initiated To Date (dd-mm-yyyy)"
              aria-label="Initiated To Date"
              className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer w-full min-w-0"
            />
          </div>

          {/* 6. Clear Filters */}
          <button
            type="button"
            id="btn-clear-funding-filters"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`h-9 px-3.5 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
              hasActiveFilters
                ? 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 cursor-pointer bg-gray-50'
                : 'text-gray-400 bg-transparent border-gray-200/60 opacity-50 cursor-not-allowed'
            }`}
            title={hasActiveFilters ? 'Reset all applied filters' : 'No filters active'}
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>

          {/* 7. Refresh */}
          <button
            type="button"
            id="btn-refresh-funding"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3.5 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
            title="Refresh wallet funding records"
          >
            <RotateCcw
              size={13}
              className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
            />
            <span>Refresh</span>
          </button>

          {/* 8. Export Dropdown */}
          <div className="relative shrink-0" ref={exportMenuRef}>
            <button
              type="button"
              id="btn-export-funding"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
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

export default WalletFundingFilterBar;
