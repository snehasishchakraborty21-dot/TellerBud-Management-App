import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CustomerFilters, CustomerAccountStatus, CustomerRecord } from '../../types/customer';
import { getZambiaTodayString } from '../../utils/dateUtils';
import { formatZMW } from '../../utils/formatters';

interface CustomerFilterBarProps {
  filters: CustomerFilters;
  onFilterChange: <K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isFiltered: boolean;
  isRefreshing?: boolean;
  customersToExport: CustomerRecord[];
}

export const CustomerFilterBar: React.FC<CustomerFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFiltered,
  isRefreshing = false,
  customersToExport,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const todayStr = getZambiaTodayString() || '2026-09-29';

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

  const prepareExportData = () => {
    return customersToExport.map((c) => ({
      'Customer Name': c.name,
      'Customer ID': c.id,
      'Mobile Number': c.phone,
      'Account Status': c.accountStatus,
      'Wallet Balance (ZMW)': c.walletBalance,
      'Active Requests': c.activeRequestsCount,
      'Pending Withdrawal': c.pendingWithdrawalsCount,
      'Withdrawal Amount':
        c.pendingWithdrawalsCount > 0 && c.pendingWithdrawalAmount
          ? formatZMW(c.pendingWithdrawalAmount)
          : '—',
      'Last Activity': c.lastActivity,
      'Registered Date': c.registeredDate,
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
    link.setAttribute('download', `TellerBud_Customers_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    const data = prepareExportData();
    if (data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, `TellerBud_Customers_${todayStr}.xlsx`);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-2.5 sm:p-3 shadow-sm">
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-2.5 w-full">
        {/* 1. Account Status */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Status:
          </span>
          <select
            value={filters.accountStatus}
            onChange={(e) =>
              onFilterChange(
                'accountStatus',
                e.target.value as CustomerAccountStatus | 'ALL'
              )
            }
            className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* 2. Request State */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Requests:
          </span>
          <select
            value={filters.requestState}
            onChange={(e) =>
              onFilterChange(
                'requestState',
                e.target.value as 'ALL' | 'HAS_ACTIVE' | 'NO_ACTIVE'
              )
            }
            className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All Requests</option>
            <option value="HAS_ACTIVE">Has Active</option>
            <option value="NO_ACTIVE">No Active</option>
          </select>
        </div>

        {/* 3. Withdrawal State */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Withdrawal:
          </span>
          <select
            value={filters.withdrawalState}
            onChange={(e) =>
              onFilterChange(
                'withdrawalState',
                e.target.value as 'ALL' | 'HAS_PENDING' | 'NO_PENDING'
              )
            }
            className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All States</option>
            <option value="HAS_PENDING">Pending Only</option>
            <option value="NO_PENDING">No Pending</option>
          </select>
        </div>

        {/* 4. Registration From */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            From:
          </span>
          <input
            type="date"
            value={filters.fromDate}
            max={filters.toDate || todayStr}
            onChange={handleFromDateChange}
            className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* 5. Registration To */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            To:
          </span>
          <input
            type="date"
            value={filters.toDate}
            min={filters.fromDate || undefined}
            max={todayStr}
            onChange={handleToDateChange}
            className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Right Action Buttons: Clear, Refresh, Export */}
        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          {/* 6. Clear */}
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!isFiltered}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-9"
          >
            <X size={13} />
            Clear
          </button>

          {/* 7. Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-60 h-9"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          {/* 8. Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-2xs transition-all cursor-pointer h-9"
            >
              <Download size={13} className="text-[#0D93AA]" />
              <span>Export</span>
              <ChevronDown size={12} className="text-gray-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30 divide-y divide-gray-100 select-none animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
                  <span>Export as Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer"
                >
                  <FileText size={14} className="text-blue-600 shrink-0" />
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
