import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, RefreshCw, Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import { VendorFilters, VendorType, VendorStatus, SupportedService } from '../../types/vendor';

interface VendorFilterBarProps {
  filters: VendorFilters;
  onFilterChange: (filters: VendorFilters) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  isRefreshing?: boolean;
}

export const VendorFilterBar: React.FC<VendorFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onExportCSV,
  onExportExcel,
  isRefreshing = false,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    filters.type !== 'All' ||
    filters.status !== 'All' ||
    filters.service !== 'All';

  // Click outside and escape handler for Export dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExportOpen(false);
      }
    };

    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExportOpen]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      type: e.target.value as 'All' | VendorType,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: e.target.value as 'All' | VendorStatus,
    });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      service: e.target.value as 'All' | SupportedService,
    });
  };

  return (
    <div
      id="vendor-filter-bar"
      className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-2.5 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Three Filter Dropdowns starting from left */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Vendor Type Filter */}
          <div className="min-w-[140px]">
            <label htmlFor="vendor-type-select" className="sr-only">
              Vendor Type
            </label>
            <select
              id="vendor-type-select"
              value={filters.type}
              onChange={handleTypeChange}
              aria-label="Vendor Type"
              className="w-full px-3 py-2 text-[13px] font-medium leading-[18px] bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all cursor-pointer"
            >
              <option value="All">All Vendor Types</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[130px]">
            <label htmlFor="vendor-status-select" className="sr-only">
              Status
            </label>
            <select
              id="vendor-status-select"
              value={filters.status}
              onChange={handleStatusChange}
              aria-label="Status"
              className="w-full px-3 py-2 text-[13px] font-medium leading-[18px] bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending Integration">Pending Integration</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Supported Service Filter */}
          <div className="min-w-[160px]">
            <label htmlFor="vendor-service-select" className="sr-only">
              Supported Service
            </label>
            <select
              id="vendor-service-select"
              value={filters.service}
              onChange={handleServiceChange}
              aria-label="Supported Service"
              className="w-full px-3 py-2 text-[13px] font-medium leading-[18px] bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all cursor-pointer"
            >
              <option value="All">All Services</option>
              <option value="Cash Pickup">Cash Pickup</option>
              <option value="Wallet Funding">Wallet Funding</option>
              <option value="Customer Withdrawal">Customer Withdrawal</option>
              <option value="Walk-In Transaction">Walk-In Transaction</option>
              <option value="Agent-to-Agent Liquidity">Agent-to-Agent Liquidity</option>
            </select>
          </div>
        </div>

        {/* Right Side: Export | Clear Filters | Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Export Button with Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              id="btn-export-vendors"
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              aria-expanded={isExportOpen}
              aria-haspopup="true"
              aria-label="Export Vendors"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold leading-[18px] text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20"
              title="Export vendor data"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                  isExportOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isExportOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-40 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  id="btn-export-vendors-csv"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setIsExportOpen(false);
                    onExportCSV();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium leading-[18px] text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Export CSV</span>
                </button>
                <button
                  id="btn-export-vendors-excel"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setIsExportOpen(false);
                    onExportExcel();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium leading-[18px] text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] transition-colors cursor-pointer border-t border-slate-100"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Export Excel</span>
                </button>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          <button
            id="clear-filters-btn"
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            aria-disabled={!hasActiveFilters}
            aria-label="Clear Filters"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium leading-[18px] rounded-lg border transition-colors shrink-0 ${
              hasActiveFilters
                ? 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer'
                : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title="Clear all filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Clear Filters</span>
            <span className="sm:hidden">Clear</span>
          </button>

          {/* Refresh Button */}
          <button
            id="refresh-vendors-btn"
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold leading-[18px] text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
            title="Refresh vendor list (preserves active filters)"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#0D93AA] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
