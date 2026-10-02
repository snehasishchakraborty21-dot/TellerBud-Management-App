import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, X, Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { EligibilityFilters } from '../../types/vendor';

interface EligibilityFilterBarProps {
  filters: EligibilityFilters;
  onFilterChange: (updates: Partial<EligibilityFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  isRefreshing?: boolean;
  isEditing?: boolean;
}

export const EligibilityFilterBar: React.FC<EligibilityFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onExportCSV,
  onExportExcel,
  isRefreshing = false,
  isEditing = false,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    filters.type !== 'All' ||
    filters.status !== 'All' ||
    filters.service !== 'All';

  const editingTooltip = isEditing ? 'Save or cancel your eligibility changes first.' : undefined;

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

  return (
    <div
      id="vendor-eligibility-filter-bar"
      className="bg-white rounded-xl border border-slate-200/80 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs"
      title={editingTooltip}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Three Filter Dropdowns starting from left */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Vendor Type */}
          <div className="min-w-[140px]" title={editingTooltip}>
            <label htmlFor="filter-vendor-type" className="sr-only">
              Vendor Type
            </label>
            <select
              id="filter-vendor-type"
              disabled={isEditing}
              value={filters.type}
              onChange={(e) =>
                onFilterChange({ type: e.target.value as EligibilityFilters['type'] })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium leading-[18px] text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all disabled:bg-slate-100 disabled:text-slate-700 disabled:opacity-90 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="All">All Vendor Types</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          {/* Vendor Status */}
          <div className="min-w-[130px]" title={editingTooltip}>
            <label htmlFor="filter-vendor-status" className="sr-only">
              Vendor Status
            </label>
            <select
              id="filter-vendor-status"
              disabled={isEditing}
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ status: e.target.value as EligibilityFilters['status'] })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium leading-[18px] text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all disabled:bg-slate-100 disabled:text-slate-700 disabled:opacity-90 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Service */}
          <div className="min-w-[160px]" title={editingTooltip}>
            <label htmlFor="filter-service" className="sr-only">
              Service
            </label>
            <select
              id="filter-service"
              disabled={isEditing}
              value={filters.service}
              onChange={(e) =>
                onFilterChange({ service: e.target.value as EligibilityFilters['service'] })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium leading-[18px] text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] transition-all disabled:bg-slate-100 disabled:text-slate-700 disabled:opacity-90 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="All">All Services</option>
              <option value="Cash Pickup">Cash Pickup</option>
              <option value="Wallet Funding">Wallet Funding</option>
              <option value="Customer Withdrawal">Customer Withdrawal</option>
              <option value="Walk-In Transaction">Walk-In Transaction</option>
            </select>
          </div>
        </div>

        {/* Right Side: Export | Clear Filters | Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Export Button with Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              id="btn-export-eligibility"
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              aria-expanded={isExportOpen}
              aria-haspopup="true"
              aria-label="Export Vendor Eligibility"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium leading-[18px] text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20"
              title="Export vendor eligibility data"
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
                  id="btn-export-csv"
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
                  id="btn-export-excel"
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
            id="btn-clear-eligibility-filters"
            type="button"
            disabled={!hasActiveFilters || isEditing}
            onClick={onClearFilters}
            title={
              isEditing
                ? editingTooltip
                : hasActiveFilters
                ? 'Reset all filters to default'
                : 'No filters applied'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium leading-[18px] rounded-lg border transition-colors ${
              !hasActiveFilters || isEditing
                ? 'bg-slate-50 text-slate-500 border-slate-200 opacity-80 cursor-not-allowed'
                : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200 cursor-pointer'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>

          {/* Refresh Button */}
          <button
            id="btn-refresh-eligibility"
            type="button"
            disabled={isRefreshing || isEditing}
            onClick={onRefresh}
            title={isEditing ? editingTooltip : 'Refresh eligibility status'}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium leading-[18px] text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-700 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
