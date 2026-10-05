import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Download, ChevronDown, FileSpreadsheet, FileText, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { WithdrawalStatus, WithdrawalNetwork, CustomerWithdrawal } from '../../types/admin';
import { getZambiaTodayString, formatIsoToDdMmYyyy } from '../../utils/dateUtils';
import { formatZambianMobileNumber, formatWithdrawalId } from '../../utils/formatters';
import { CustomerWithdrawalDateInput } from './CustomerWithdrawalDateInput';

export interface CustomerWithdrawalFiltersState {
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
  const [dateError, setDateError] = useState<string | null>(null);
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

  const handleFromDateChange = (val: string) => {
    if (filters.submittedTo && val > filters.submittedTo) {
      setDateError('From Date cannot be later than To Date.');
      onFilterChange({ submittedFrom: val });
      return;
    }
    setDateError(null);
    onFilterChange({ submittedFrom: val });
  };

  const handleToDateChange = (val: string) => {
    if (filters.submittedFrom && val && val < filters.submittedFrom) {
      setDateError('To Date cannot be earlier than From Date.');
      onFilterChange({ submittedTo: val });
      return;
    }
    setDateError(null);
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
        'Withdrawal ID': formatWithdrawalId(w.reference),
        'Customer': w.customerName,
        'Vendor': w.network,
        'Amount (ZMW)': Number(w.amount.toFixed(2)),
        'Phone Number': formatZambianMobileNumber(w.payoutNumber || w.customerPhone),
        'Reserved (ZMW)': isReservationActive ? Number(reservedAmount.toFixed(2)) : '—',
        'Status': w.status,
      };
    });
  };

  const getExportFilenameSuffix = () => {
    const fromStr = filters.submittedFrom ? formatIsoToDdMmYyyy(filters.submittedFrom) : '';
    const toStr = filters.submittedTo ? formatIsoToDdMmYyyy(filters.submittedTo) : '';
    if (fromStr && toStr) {
      return fromStr === toStr ? fromStr : `${fromStr}-to-${toStr}`;
    }
    if (fromStr) return fromStr;
    if (toStr) return toStr;
    return todayStr;
  };

  const handleExportCSV = () => {
    setShowExportMenu(false);
    const data = prepareExportData();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const dateSuffix = getExportFilenameSuffix();
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
    link.setAttribute('download', `TellerBud_Customer_Withdrawals_${dateSuffix}.csv`);
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
      { wch: 20 }, // Withdrawal ID
      { wch: 24 }, // Customer
      { wch: 20 }, // Vendor
      { wch: 18 }, // Amount (ZMW)
      { wch: 20 }, // Phone Number
      { wch: 18 }, // Reserved (ZMW)
      { wch: 16 }, // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Withdrawals');
    const dateSuffix = getExportFilenameSuffix();
    XLSX.writeFile(wb, `TellerBud_Customer_Withdrawals_${dateSuffix}.xlsx`);
  };

  return (
    <div
      id="customer-withdrawals-filter-section"
      className="bg-white border border-gray-200/80 rounded-xl p-2.5 sm:p-3 shadow-xs shrink-0"
    >
      <div className="w-full overflow-x-auto transaction-table-scroll focus:outline-none">
        {/* Single horizontal line in exact required order:
            1. Vendor (200–230px)
            2. Status (180–210px)
            3. From Date (170–190px)
            4. To Date (170–190px)
            5. Clear Filters (compact button)
            6. Refresh (compact button)
            7. Export (compact primary button)
        */}
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 min-w-max flex-nowrap h-9">
          {/* Left group of filters: Vendor, Status, From Date, To Date */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Vendor Select (200–230 px) */}
            <div className="w-[210px] sm:w-[220px] flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
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
                className="w-full bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1 truncate"
              >
                <option value="ALL">All Vendors</option>
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money</option>
              </select>
            </div>

            {/* 2. Status Select (180–210 px) */}
            <div className="w-[190px] sm:w-[200px] flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
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
                className="w-full bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1 truncate"
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

            {/* 3. From Date (170–190 px) */}
            <div className="w-[175px] sm:w-[185px] shrink-0">
              <CustomerWithdrawalDateInput
                label="From"
                value={filters.submittedFrom}
                onChange={handleFromDateChange}
                maxDate={filters.submittedTo || todayStr}
                errorMessage={dateError && filters.submittedFrom > filters.submittedTo ? dateError : null}
                id="filter-submitted-from"
              />
            </div>

            {/* 4. To Date (170–190 px) */}
            <div className="w-[175px] sm:w-[185px] shrink-0">
              <CustomerWithdrawalDateInput
                label="To"
                value={filters.submittedTo}
                onChange={handleToDateChange}
                minDate={filters.submittedFrom || undefined}
                maxDate={todayStr}
                errorMessage={dateError && filters.submittedTo < filters.submittedFrom ? dateError : null}
                id="filter-submitted-to"
              />
            </div>
          </div>

          {/* Right group of action buttons: Clear Filters, Refresh, Export */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
            {/* 5. Clear Filters (compact button) */}
            <button
              type="button"
              id="btn-clear-withdrawal-filters"
              onClick={() => {
                setDateError(null);
                onClearFilters();
              }}
              disabled={!hasActiveFilters}
              className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                hasActiveFilters
                  ? 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 cursor-pointer'
                  : 'text-gray-400 bg-transparent border-gray-200/60 opacity-50 cursor-not-allowed'
              }`}
              title={hasActiveFilters ? 'Reset all applied filters' : 'No filters active'}
            >
              <X size={13} />
              <span>Clear Filters</span>
            </button>

            {/* 6. Refresh (compact button) */}
            <button
              type="button"
              id="btn-refresh-withdrawals"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 px-3.5 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              title="Refresh customer withdrawal records"
            >
              <RotateCcw
                size={13}
                className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
              />
              <span>Refresh</span>
            </button>

            {/* 7. Export (compact primary button with dropdown) */}
            <div className="relative shrink-0" ref={exportMenuRef}>
              <button
                type="button"
                id="btn-export-withdrawals"
                onClick={() => setShowExportMenu((prev) => !prev)}
                className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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
    </div>
  );
};
