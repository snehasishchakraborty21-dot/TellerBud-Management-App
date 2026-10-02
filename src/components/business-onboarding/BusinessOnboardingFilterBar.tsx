import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCw,
  FilterX,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Globe,
  Plus,
} from 'lucide-react';
import {
  BusinessOnboardingFilters,
  BusinessOnboardingApplication,
  OnboardingApplicationStatus,
} from '../../types/businessOnboarding';
import {
  exportOnboardingToExcel,
  exportOnboardingToCSV,
} from '../../utils/businessOnboardingExport';

interface BusinessOnboardingFilterBarProps {
  filters: BusinessOnboardingFilters;
  onFilterChange: <K extends keyof BusinessOnboardingFilters>(
    key: K,
    value: BusinessOnboardingFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isFiltered: boolean;
  isRefreshing?: boolean;
  applicationsToExport: BusinessOnboardingApplication[];
  onOpenWebsiteSignUp: () => void;
}

const STATUS_OPTIONS: Array<{ value: 'ALL' | OnboardingApplicationStatus; label: string }> = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'Pending Review', label: 'Pending Review' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'More Information Required', label: 'More Information Required' },
  { value: 'Approved – Onboarding Pending', label: 'Approved – Onboarding Pending' },
  { value: 'Onboarding in Progress', label: 'Onboarding in Progress' },
  { value: 'Submitted for Activation', label: 'Submitted for Activation' },
  { value: 'Returned for Correction', label: 'Returned for Correction' },
  { value: 'Active', label: 'Active (Activated)' },
  { value: 'Rejected', label: 'Rejected' },
];

export const BusinessOnboardingFilterBar: React.FC<BusinessOnboardingFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFiltered,
  isRefreshing = false,
  applicationsToExport,
  onOpenWebsiteSignUp,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportExcel = () => {
    exportOnboardingToExcel(applicationsToExport);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportOnboardingToCSV(applicationsToExport);
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs px-3.5 py-2.5">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
        {/* Left Side: Filter Selectors in one line */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
          {/* 1. Application Status */}
          <div className="flex items-center gap-1.5 min-w-[170px]">
            <label htmlFor="onb-status-filter" className="text-slate-500 font-medium whitespace-nowrap text-[11.5px]">
              Status:
            </label>
            <select
              id="onb-status-filter"
              value={filters.status}
              onChange={(e) =>
                onFilterChange('status', e.target.value as 'ALL' | OnboardingApplicationStatus)
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1.5 focus:ring-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Submitted From */}
          <div className="flex items-center gap-1.5 min-w-[145px]">
            <label htmlFor="onb-from-filter" className="text-slate-500 font-medium whitespace-nowrap text-[11.5px]">
              From:
            </label>
            <input
              id="onb-from-filter"
              type="date"
              value={filters.submittedFrom}
              onChange={(e) => onFilterChange('submittedFrom', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1.5 focus:ring-[#0D93AA] focus:bg-white transition-all"
            />
          </div>

          {/* 3. Submitted To */}
          <div className="flex items-center gap-1.5 min-w-[145px]">
            <label htmlFor="onb-to-filter" className="text-slate-500 font-medium whitespace-nowrap text-[11.5px]">
              To:
            </label>
            <input
              id="onb-to-filter"
              type="date"
              value={filters.submittedTo}
              onChange={(e) => onFilterChange('submittedTo', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1.5 focus:ring-[#0D93AA] focus:bg-white transition-all"
            />
          </div>

          {/* 4. Clear Filters */}
          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
              title="Reset all filters to default"
            >
              <FilterX size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Right Side: Actions in the same single line */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Website Sign Up form opener */}
          <button
            type="button"
            onClick={onOpenWebsiteSignUp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D93AA]/10 border border-[#0D93AA]/30 text-[#0D93AA] text-xs font-semibold hover:bg-[#0D93AA]/20 transition-all cursor-pointer"
            title="Open website registration form"
          >
            <Globe size={13} />
            <span className="hidden sm:inline">Website Sign Up Form</span>
            <span className="sm:hidden">Website Form</span>
          </button>

          {/* 5. Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh application records"
          >
            <RotateCw size={14} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
          </button>

          {/* 6. Export Button with dropdown (Excel & CSV) */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Export filtered records"
            >
              <Download size={13} />
              <span>Export</span>
              <ChevronDown size={12} className={showExportMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Export Options ({applicationsToExport.length})
                </div>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" />
                  <span>Export as Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left cursor-pointer"
                >
                  <FileText size={14} className="text-sky-600" />
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
