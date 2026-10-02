import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, X, Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import { ServiceModeFilters } from '../../types/serviceMode';

interface ServiceModesFilterBarProps {
  filters: ServiceModeFilters;
  onFilterChange: (newFilters: Partial<ServiceModeFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  isRefreshing?: boolean;
  isExporting?: boolean;
}

export const ServiceModesFilterBar: React.FC<ServiceModesFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onExportCSV,
  onExportExcel,
  isRefreshing = false,
  isExporting = false,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasActiveFilters = Boolean(
    filters.availability !== 'all' ||
    filters.audience !== 'all' ||
    filters.transactionType !== 'all'
  );

  const handleExportSelect = (type: 'csv' | 'excel') => {
    setIsExportOpen(false);
    if (type === 'csv') {
      onExportCSV();
    } else {
      onExportExcel();
    }
  };

  return (
    <div
      id="service-modes-filter-bar"
      className="bg-white rounded-xl border border-slate-200/80 px-3 py-2 sm:py-2.5 shadow-2xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 w-full"
    >
      {/* Left: Three Dropdowns */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
        {/* 1. Availability Filter */}
        <div className="w-full sm:w-[155px] shrink-0">
          <select
            id="filter-availability"
            value={filters.availability}
            onChange={(e) => onFilterChange({ availability: e.target.value })}
            className="w-full h-9 py-1.5 px-2.5 text-xs sm:text-[13px] font-medium bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
          >
            <option value="all">All Availability</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>
        </div>

        {/* 2. Audience Filter */}
        <div className="w-full sm:w-[165px] shrink-0">
          <select
            id="filter-audience"
            value={filters.audience}
            onChange={(e) => onFilterChange({ audience: e.target.value })}
            className="w-full h-9 py-1.5 px-2.5 text-xs sm:text-[13px] font-medium bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
          >
            <option value="all">All Audiences</option>
            <option value="Customer App">Customer App</option>
            <option value="Agent App">Agent App</option>
            <option value="Customer and Agent">Customer and Agent</option>
          </select>
        </div>

        {/* 3. Transaction Type Filter */}
        <div className="w-full sm:w-[175px] shrink-0">
          <select
            id="filter-transaction-type"
            value={filters.transactionType}
            onChange={(e) => onFilterChange({ transactionType: e.target.value })}
            className="w-full h-9 py-1.5 px-2.5 text-xs sm:text-[13px] font-medium bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all cursor-pointer"
          >
            <option value="all">All Transaction Types</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Purchase">Purchase</option>
            <option value="Liquidity Transfer">Liquidity Transfer</option>
          </select>
        </div>
      </div>

      {/* Right: Export | Clear Filters | Refresh */}
      <div className="flex items-center gap-2 sm:gap-2.5 ml-auto shrink-0">
        {/* Export Button & Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            type="button"
            id="btn-export-service-modes"
            onClick={() => setIsExportOpen((prev) => !prev)}
            disabled={isExporting}
            className={`inline-flex items-center gap-1.5 h-9 px-3 text-xs sm:text-[13px] font-medium rounded-lg border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
              isExporting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            title="Export Service Modes (CSV or Excel)"
            aria-expanded={isExportOpen}
            aria-haspopup="true"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                id="btn-export-csv"
                onClick={() => handleExportSelect('csv')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-left transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                id="btn-export-excel"
                onClick={() => handleExportSelect('excel')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-left transition-colors cursor-pointer border-t border-slate-100"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel</span>
              </button>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        <button
          type="button"
          id="btn-clear-filters"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className={`inline-flex items-center gap-1.5 h-9 px-3 text-xs sm:text-[13px] font-medium rounded-lg border transition-all ${
            hasActiveFilters
              ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs active:scale-[0.98]'
              : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
          }`}
          title={hasActiveFilters ? 'Reset all active filters' : 'No active filters to clear'}
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>

        {/* Refresh Button */}
        <button
          type="button"
          id="btn-refresh-service-modes"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 h-9 px-3 text-xs sm:text-[13px] font-medium rounded-lg border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          title="Refresh service modes (preserves active filters)"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};
