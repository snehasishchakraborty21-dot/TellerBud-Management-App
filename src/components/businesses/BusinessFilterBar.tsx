import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  BusinessFilters,
  BusinessAccountStatus,
  BusinessWalletState,
  BusinessRecord,
} from '../../types/business';
import { getZambiaTodayString } from '../../utils/dateUtils';

interface BusinessFilterBarProps {
  filters: BusinessFilters;
  onFilterChange: <K extends keyof BusinessFilters>(key: K, value: BusinessFilters[K]) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isFiltered: boolean;
  isRefreshing: boolean;
  businessesToExport: BusinessRecord[];
}

export const BusinessFilterBar: React.FC<BusinessFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFiltered,
  isRefreshing,
  businessesToExport,
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

  const prepareExportData = () => {
    return businessesToExport.map((b) => ({
      'Business': b.name,
      'Business ID': b.id,
      'Business Owner': b.ownerName,
      'Phone Number': b.ownerPhone,
      'City': b.city && b.city.trim() ? b.city.trim() : 'Not Provided',
      'Agents': b.associatedAgents,
      'Wallet Balance (ZMW)': b.sharedWalletBalance,
      'Registered Date': b.registeredDate,
      'Status': b.status,
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
    link.setAttribute('download', `TellerBud_Businesses_${todayStr}.csv`);
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
      { wch: 32 }, // Business
      { wch: 18 }, // Business ID
      { wch: 24 }, // Business Owner
      { wch: 20 }, // Phone Number
      { wch: 18 }, // City
      { wch: 10 }, // Agents
      { wch: 20 }, // Wallet Balance (ZMW)
      { wch: 16 }, // Registered Date
      { wch: 14 }, // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Businesses');
    XLSX.writeFile(wb, `TellerBud_Businesses_${todayStr}.xlsx`);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
        {/* Left side: Business Status & Wallet State */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          {/* 1. Business Status */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <select
              id="business-status-select"
              value={filters.status}
              onChange={(e) =>
                onFilterChange(
                  'status',
                  e.target.value as BusinessAccountStatus | 'ALL'
                )
              }
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by Business Status"
            >
              <option value="ALL">All Business Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* 2. Wallet State */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Wallet:
            </span>
            <select
              id="business-wallet-state-select"
              value={filters.walletState}
              onChange={(e) =>
                onFilterChange(
                  'walletState',
                  e.target.value as BusinessWalletState | 'ALL'
                )
              }
              className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by Wallet State"
            >
              <option value="ALL">All Wallet States</option>
              <option value="Active">Active Balance</option>
              <option value="Low Balance">Low Balance</option>
              <option value="Suspended">Suspended Wallet</option>
            </select>
          </div>
        </div>

        {/* Right side: Clear Filters, Refresh, and Export */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
          {/* Clear Filters */}
          <button
            type="button"
            id="btn-clear-business-filters"
            onClick={onClearFilters}
            disabled={!isFiltered}
            className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              isFiltered
                ? 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 cursor-pointer'
                : 'text-gray-400 bg-transparent border-gray-200/60 opacity-50 cursor-not-allowed'
            }`}
            title={isFiltered ? 'Reset filters' : 'No filters active'}
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            id="btn-refresh-businesses"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3.5 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh business records"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
            />
            <span>Refresh</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              id="btn-export-businesses"
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export business records"
            >
              <Download size={13} />
              <span>Export</span>
              <ChevronDown size={12} className={showExportMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
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
