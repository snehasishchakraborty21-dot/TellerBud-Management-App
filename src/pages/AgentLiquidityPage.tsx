import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  AgentToAgentRequest,
  AgentToAgentStatusSummary,
} from '../types/admin';
import { BusinessRecord } from '../types/business';
import { adminService } from '../services/mockAdminService';
import { businessService } from '../services/businessService';
import { deriveAgentLiquidityStatusSummary } from '../data/mockAgentLiquidityData';
import { getZambiaTodayString, formatIsoToDdMmYyyy } from '../utils/dateUtils';
import { CustomerRequestsDateInput } from '../components/requests/CustomerRequestsDateInput';

interface BusinessLiquiditySummary {
  businessId: string;
  businessName: string;
  city?: string;
  totalRequests: number;
  matching: number;
  inProgress: number; // Aggregated: Agent Matched + In Progress
  completed: number;
  noAgent: number;
  expired: number;
  cancelled: number;
}

type SortField =
  | 'businessName'
  | 'businessId'
  | 'totalRequests'
  | 'matching'
  | 'inProgress'
  | 'completed'
  | 'noAgent'
  | 'expired'
  | 'cancelled';

type SortDirection = 'asc' | 'desc';

export const AgentLiquidityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayStr = useMemo(() => getZambiaTodayString() || '2026-10-06', []);

  // Primary reporting date (from URL date parameter if present, or today in Zambia)
  const dateParam = searchParams.get('date');
  const primaryReportingDate = dateParam || todayStr;

  // Primary Data State
  const [allRequests, setAllRequests] = useState<AgentToAgentRequest[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Search & Date Filter State: From and To are blank ("") by default
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [fromDate, setFromDate] = useState<string>(searchParams.get('from') || '');
  const [toDate, setToDate] = useState<string>(searchParams.get('to') || '');

  // Export State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExportMenuOpen) {
        setIsExportMenuOpen(false);
      }
    };

    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExportMenuOpen]);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('totalRequests');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Load all data
  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [requestsRes, bizList] = await Promise.all([
        adminService.getAgentLiquidityRequests(),
        Promise.resolve(businessService.getBusinesses()),
      ]);

      setAllRequests(requestsRes.items);
      setBusinesses(bizList);
    } catch (err) {
      console.error('Failed to load Agent-to-Agent liquidity requests:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribeAdmin = adminService.subscribe(() => loadData());
    const unsubscribeBiz = businessService.subscribe(() => loadData());

    return () => {
      unsubscribeAdmin();
      unsubscribeBiz();
    };
  }, [loadData]);

  // Synchronise state when searchParams change externally (e.g. from top header date selector)
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const fromParam = searchParams.get('from') || '';
    const toParam = searchParams.get('to') || '';

    if (qParam !== searchQuery) setSearchQuery(qParam);
    if (fromParam !== fromDate) setFromDate(fromParam);
    if (toParam !== toDate) setToDate(toParam);
  }, [searchParams]);

  // Push local filter updates to URL params
  const updateUrlParams = useCallback(
    (q: string, from: string, to: string) => {
      const params = new URLSearchParams();
      if (dateParam) params.set('date', dateParam);
      if (q.trim()) params.set('q', q.trim());
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams, dateParam]
  );

  // Filter requests by date:
  // When From & To date fields are blank: default to primary reporting date (e.g. 2026-10-06).
  // When user selects From & To dates: filter by the chosen range.
  const dateFilteredRequests = useMemo(() => {
    if (fromDate || toDate) {
      return allRequests.filter((r) => {
        const reqDate = r.requestedAt ? r.requestedAt.split('T')[0] : '';
        if (!reqDate) return true;
        if (fromDate && reqDate < fromDate) return false;
        if (toDate && reqDate > toDate) return false;
        return true;
      });
    }

    // Default when date range inputs are blank
    return allRequests.filter((r) => {
      const reqDate = r.requestedAt ? r.requestedAt.split('T')[0] : '';
      return reqDate === primaryReportingDate;
    });
  }, [allRequests, fromDate, toDate, primaryReportingDate]);

  // Global KPI summary derived from displayed dataset
  const rawGlobalSummary: AgentToAgentStatusSummary = useMemo(() => {
    return deriveAgentLiquidityStatusSummary(dateFilteredRequests);
  }, [dateFilteredRequests]);

  // Build Business-wise Liquidity Summaries
  // Aggregating internal status 'Agent Matched' + 'In Progress' -> In Progress
  const businessSummaries: BusinessLiquiditySummary[] = useMemo(() => {
    const reqsByBizName = new Map<string, AgentToAgentRequest[]>();
    const reqsByBizId = new Map<string, AgentToAgentRequest[]>();

    dateFilteredRequests.forEach((req) => {
      const bizName = (req.requestingAgentBusiness || '').trim().toLowerCase();
      if (bizName) {
        const list = reqsByBizName.get(bizName) || [];
        list.push(req);
        reqsByBizName.set(bizName, list);
      }
      if ((req as unknown as { businessId?: string }).businessId) {
        const bId = (req as unknown as { businessId: string }).businessId;
        const list = reqsByBizId.get(bId) || [];
        list.push(req);
        reqsByBizId.set(bId, list);
      }
    });

    return businesses.map((biz) => {
      const byName = reqsByBizName.get(biz.name.trim().toLowerCase()) || [];
      const byId = reqsByBizId.get(biz.id) || [];

      // Combine unique requests for this business
      const seen = new Set<string>();
      const combinedRequests: AgentToAgentRequest[] = [];
      [...byName, ...byId].forEach((r) => {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          combinedRequests.push(r);
        }
      });

      let matching = 0;
      let agentMatched = 0;
      let inProgress = 0;
      let completed = 0;
      let noAgent = 0;
      let expired = 0;
      let cancelled = 0;

      combinedRequests.forEach((r) => {
        switch (r.status) {
          case 'Matching':
            matching++;
            break;
          case 'Agent Matched':
            agentMatched++;
            break;
          case 'In Progress':
            inProgress++;
            break;
          case 'Completed':
            completed++;
            break;
          case 'No Agent Available':
            noAgent++;
            break;
          case 'Expired':
            expired++;
            break;
          case 'Cancelled':
            cancelled++;
            break;
        }
      });

      // Aggregate: In Progress = Agent Matched + In Progress
      const aggregatedInProgress = agentMatched + inProgress;

      return {
        businessId: biz.id,
        businessName: biz.name,
        city: biz.city,
        totalRequests: combinedRequests.length,
        matching,
        inProgress: aggregatedInProgress,
        completed,
        noAgent,
        expired,
        cancelled,
      };
    });
  }, [businesses, dateFilteredRequests]);

  // Filter & Sort
  const filteredAndSortedBusinesses = useMemo(() => {
    let list = [...businessSummaries];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) ||
          b.businessId.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'businessName':
          comparison = a.businessName.localeCompare(b.businessName);
          break;
        case 'businessId':
          comparison = a.businessId.localeCompare(b.businessId);
          break;
        case 'totalRequests':
          comparison = a.totalRequests - b.totalRequests;
          break;
        case 'matching':
          comparison = a.matching - b.matching;
          break;
        case 'inProgress':
          comparison = a.inProgress - b.inProgress;
          break;
        case 'completed':
          comparison = a.completed - b.completed;
          break;
        case 'noAgent':
          comparison = a.noAgent - b.noAgent;
          break;
        case 'expired':
          comparison = a.expired - b.expired;
          break;
        case 'cancelled':
          comparison = a.cancelled - b.cancelled;
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [businessSummaries, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBusinesses.length / pageSize) || 1;
  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedBusinesses.slice(start, start + pageSize);
  }, [filteredAndSortedBusinesses, currentPage, pageSize]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} className="text-gray-400 group-hover:text-gray-600 ml-1 shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={11} className="text-[#0D93AA] ml-1 shrink-0" />
    ) : (
      <ArrowDown size={11} className="text-[#0D93AA] ml-1 shrink-0" />
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setDateError(null);
    setCurrentPage(1);
    setSortField('totalRequests');
    setSortDirection('desc');
    updateUrlParams('', '', '');
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    updateUrlParams(q, fromDate, toDate);
  };

  const handleFromDateChange = (from: string) => {
    if (toDate && from && from > toDate) {
      setDateError('From Date cannot be later than To Date.');
    } else {
      setDateError(null);
    }
    setFromDate(from);
    setCurrentPage(1);
    updateUrlParams(searchQuery, from, toDate);
  };

  const handleToDateChange = (to: string) => {
    if (fromDate && to && to < fromDate) {
      setDateError('To Date cannot be earlier than From Date.');
    } else {
      setDateError(null);
    }
    setToDate(to);
    setCurrentPage(1);
    updateUrlParams(searchQuery, fromDate, to);
  };

  // Clear Filters is active only when user manually enters a search term or selects dates
  const hasActiveFilters = Boolean(
    searchQuery.trim() !== '' ||
    fromDate !== '' ||
    toDate !== ''
  );

  // Export handlers for CSV and Excel formats
  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExportMenuOpen(false);
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const fromDdMm = fromDate ? formatIsoToDdMmYyyy(fromDate) : '';
      const toDdMm = toDate ? formatIsoToDdMmYyyy(toDate) : '';
      let dateSuffix = formatIsoToDdMmYyyy(primaryReportingDate) || 'report';
      if (fromDdMm && toDdMm) {
        dateSuffix = fromDdMm === toDdMm ? fromDdMm : `${fromDdMm}-to-${toDdMm}`;
      } else if (fromDdMm) {
        dateSuffix = `from-${fromDdMm}`;
      } else if (toDdMm) {
        dateSuffix = `to-${toDdMm}`;
      }

      const filename = `agent-to-agent-liquidity-${dateSuffix}.${format}`;

      // Export only the revised 9 columns (omitting Agent Matched, with aggregated In Progress)
      const exportRows = filteredAndSortedBusinesses.map((b) => ({
        'Business Name': b.businessName,
        'Business ID': b.businessId,
        'City': b.city || '—',
        'Total Requests': b.totalRequests,
        'Matching': b.matching,
        'In Progress': b.inProgress,
        'Completed': b.completed,
        'No Agent': b.noAgent,
        'Expired': b.expired,
        'Cancelled': b.cancelled,
        'Reporting Date': fromDdMm || toDdMm ? `${fromDdMm || '—'} to ${toDdMm || '—'}` : formatIsoToDdMmYyyy(primaryReportingDate),
      }));

      if (exportRows.length === 0) {
        exportRows.push({
          'Business Name': 'No matching records',
          'Business ID': '—',
          'City': '—',
          'Total Requests': 0,
          'Matching': 0,
          'In Progress': 0,
          'Completed': 0,
          'No Agent': 0,
          'Expired': 0,
          'Cancelled': 0,
          'Reporting Date': fromDdMm || toDdMm ? `${fromDdMm || '—'} to ${toDdMm || '—'}` : formatIsoToDdMmYyyy(primaryReportingDate),
        });
      }

      if (format === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(exportRows);
        ws['!cols'] = [
          { wch: 30 }, // Business Name
          { wch: 18 }, // Business ID
          { wch: 16 }, // City
          { wch: 14 }, // Total Requests
          { wch: 12 }, // Matching
          { wch: 14 }, // In Progress
          { wch: 12 }, // Completed
          { wch: 12 }, // No Agent
          { wch: 12 }, // Expired
          { wch: 12 }, // Cancelled
          { wch: 18 }, // Reporting Date
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Agent Liquidity');
        XLSX.writeFile(wb, filename);
      } else {
        const headers = Object.keys(exportRows[0]);
        const csvRows = [
          headers.join(','),
          ...exportRows.map((row) =>
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
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setExportToast({
        message: 'Agent-to-Agent Liquidity report exported successfully.',
        type: 'success',
      });
      setTimeout(() => setExportToast(null), 4000);
    } catch (err) {
      console.error('Failed to export report:', err);
      setExportToast({
        message: 'The report could not be exported. Please try again.',
        type: 'error',
      });
      setTimeout(() => setExportToast(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // 7 Revised Global KPI Cards in one single horizontal row (without Agent Matched, In Progress aggregated)
  const kpisList = [
    {
      id: 'kpi-all',
      label: 'All Requests',
      value: rawGlobalSummary.all,
      color: 'text-[#102025]',
    },
    {
      id: 'kpi-matching',
      label: 'Matching',
      value: rawGlobalSummary.matching,
      color: 'text-amber-600',
    },
    {
      id: 'kpi-in-progress',
      label: 'In Progress',
      value: rawGlobalSummary.inProgress + rawGlobalSummary.agentMatched,
      color: 'text-[#0D93AA]',
    },
    {
      id: 'kpi-completed',
      label: 'Completed',
      value: rawGlobalSummary.completed,
      color: 'text-emerald-600',
    },
    {
      id: 'kpi-no-agent',
      label: 'No Agent',
      value: rawGlobalSummary.noAgentAvailable,
      color: 'text-amber-600',
    },
    {
      id: 'kpi-expired',
      label: 'Expired',
      value: rawGlobalSummary.expired,
      color: 'text-gray-600',
    },
    {
      id: 'kpi-cancelled',
      label: 'Cancelled',
      value: rawGlobalSummary.cancelled,
      color: 'text-red-600',
    },
  ];

  return (
    <div
      id="agent-liquidity-page-container"
      className="w-full flex-1 flex flex-col min-h-0 h-full gap-2.5 sm:gap-3 px-3 sm:px-6 pt-1.5 pb-3 sm:pb-4 overflow-hidden relative"
    >
      {/* Toast Feedback for Export */}
      {exportToast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-3 duration-200 ${
            exportToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          {exportToast.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{exportToast.message}</span>
          <button
            type="button"
            onClick={() => setExportToast(null)}
            className="p-0.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 1 & 2. TOP FROZEN SECTION: 7 KPI Cards + Compact Filter Bar */}
      <div
        id="frozen-agent-liquidity-kpi-filter-section"
        className="shrink-0 bg-[#FAFAFA] space-y-2.5 transition-all"
      >
        {/* 1. Top Global KPI Cards (7 cards in one row, No Icons, Label on Left, Value on Right) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5 w-full">
          {kpisList.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white rounded-xl border border-gray-100 px-3 py-2 shadow-sm h-[52px] sm:h-[54px] flex items-center justify-between gap-2 transition-all hover:border-gray-200 min-w-0"
            >
              <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap truncate">
                {kpi.label}
              </span>
              <span className={`text-[17px] sm:text-[18px] font-bold font-mono tracking-tight ${kpi.color} leading-none shrink-0`}>
                {isLoading ? '...' : kpi.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* 2. Compact Filter Section (Single Horizontal Line in Exact Order: Search, From, To, Clear, Refresh, Export) */}
        <div className="bg-white border border-gray-100 rounded-xl p-2.5 sm:p-3 shadow-sm">
          <div className="w-full overflow-x-auto transaction-table-scroll focus:outline-none">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-max flex-nowrap h-9">
              {/* 1. Search Box (Flexible width) */}
              <div className="relative flex-1 min-w-[220px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search business name or Business ID…"
                  className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 h-9"
                  aria-label="Search business name or Business ID"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* 2. From Date (150–165 px) with dd-mm-yyyy placeholder when empty */}
              <CustomerRequestsDateInput
                label="From"
                value={fromDate}
                onChange={handleFromDateChange}
                maxDate={toDate || todayStr}
                errorMessage={dateError && fromDate > toDate ? dateError : null}
                id="agent-liquidity-filter-from-date"
              />

              {/* 3. To Date (150–165 px) with dd-mm-yyyy placeholder when empty */}
              <CustomerRequestsDateInput
                label="To"
                value={toDate}
                onChange={handleToDateChange}
                minDate={fromDate || undefined}
                maxDate={todayStr}
                errorMessage={dateError && toDate < fromDate ? dateError : null}
                id="agent-liquidity-filter-to-date"
              />

              {/* 4. Clear Filters (105–115 px) - Active only after search term or date is selected */}
              <button
                id="btn-clear-agent-liquidity-filters"
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="w-[105px] sm:w-[110px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-9 whitespace-nowrap shrink-0"
                title={hasActiveFilters ? 'Reset applied filters' : 'No filters active'}
              >
                <X size={13} />
                <span>Clear Filters</span>
              </button>

              {/* 5. Refresh (95–105 px) */}
              <button
                id="btn-refresh-agent-liquidity"
                type="button"
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="w-[95px] sm:w-[100px] inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-60 h-9 whitespace-nowrap shrink-0"
                title="Refresh records"
              >
                <RefreshCw
                  size={13}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                <span>Refresh</span>
              </button>

              {/* 6. Export (100–110 px) */}
              <div className="relative shrink-0" ref={exportMenuRef}>
                <button
                  id="btn-export-agent-liquidity"
                  type="button"
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  disabled={isExporting}
                  className="w-[100px] sm:w-[105px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-60 h-9 whitespace-nowrap"
                  aria-expanded={isExportMenuOpen}
                  aria-haspopup="true"
                  title="Export Agent-to-Agent Liquidity report"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Exporting</span>
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      <span>Export</span>
                      <ChevronDown
                        size={12}
                        className={isExportMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
                      />
                    </>
                  )}
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={() => handleExport('csv')}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText size={14} className="text-blue-600" />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('xlsx')}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>Export as Excel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN TABLE SECTION WITH FROZEN THEAD & INTERNAL VERTICAL SCROLL */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden w-full">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs border-b border-gray-100 shadow-[0_1px_0_0_#E5E7EB] text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
              <tr>
                {/* 1. Business Name */}
                <th
                  onClick={() => handleSort('businessName')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group min-w-[200px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Business Name</span>
                    {renderSortIcon('businessName')}
                  </div>
                </th>

                {/* 2. Business ID */}
                <th
                  onClick={() => handleSort('businessId')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[110px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Business ID</span>
                    {renderSortIcon('businessId')}
                  </div>
                </th>

                {/* 3. Total Requests */}
                <th
                  onClick={() => handleSort('totalRequests')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[110px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total Requests</span>
                    {renderSortIcon('totalRequests')}
                  </div>
                </th>

                {/* 4. Matching */}
                <th
                  onClick={() => handleSort('matching')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[90px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-amber-600">Matching</span>
                    {renderSortIcon('matching')}
                  </div>
                </th>

                {/* 5. In Progress (Aggregated: Agent Matched + In Progress) */}
                <th
                  onClick={() => handleSort('inProgress')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[100px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[#0D93AA]">In Progress</span>
                    {renderSortIcon('inProgress')}
                  </div>
                </th>

                {/* 6. Completed */}
                <th
                  onClick={() => handleSort('completed')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[100px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-emerald-600">Completed</span>
                    {renderSortIcon('completed')}
                  </div>
                </th>

                {/* 7. No Agent */}
                <th
                  onClick={() => handleSort('noAgent')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[90px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-amber-600">No Agent</span>
                    {renderSortIcon('noAgent')}
                  </div>
                </th>

                {/* 8. Expired */}
                <th
                  onClick={() => handleSort('expired')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[85px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-gray-500">Expired</span>
                    {renderSortIcon('expired')}
                  </div>
                </th>

                {/* 9. Cancelled */}
                <th
                  onClick={() => handleSort('cancelled')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[90px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-red-600">Cancelled</span>
                    {renderSortIcon('cancelled')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-36 mx-auto" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-10 mx-auto" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <Building2 className="w-9 h-9 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-sm text-gray-700">No Agent-to-Agent Liquidity requests found for the selected date.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery
                        ? `No registered business matches "${searchQuery}".`
                        : 'No records available for the selected criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((biz) => (
                  <tr
                    key={biz.businessId}
                    className="hover:bg-[#F4FBFB]/50 transition-colors"
                  >
                    {/* 1. Business Name */}
                    <td className="py-3 px-3 text-center align-middle">
                      <span className="font-semibold text-gray-900 text-xs sm:text-[13px] block truncate max-w-[240px] mx-auto">
                        {biz.businessName}
                      </span>
                    </td>

                    {/* 2. Business ID */}
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                      <span className="font-mono text-xs text-gray-600 font-medium">
                        {biz.businessId}
                      </span>
                    </td>

                    {/* 3. Total Requests */}
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                      <span className="font-bold font-mono text-gray-900 text-xs sm:text-[13px]">
                        {biz.totalRequests}
                      </span>
                    </td>

                    {/* 4. Matching */}
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                      <span className={`font-mono text-xs font-semibold ${biz.matching > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                        {biz.matching}
                      </span>
                    </td>

                    {/* 5. In Progress (Aggregated: Agent Matched + In Progress) */}
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                      <span className={`font-mono text-xs font-semibold ${biz.inProgress > 0 ? 'text-[#0D93AA] font-bold' : 'text-gray-400'}`}>
                        {biz.inProgress}
                      </span>
                    </td>

                    {/* 6. Completed */}
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                      <span className={`font-mono text-xs font-semibold ${biz.completed > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                        {biz.completed}
                      </span>
                    </td>

                    {/* 7. No Agent */}
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                      <span className={`font-mono text-xs font-semibold ${biz.noAgent > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                        {biz.noAgent}
                      </span>
                    </td>

                    {/* 8. Expired */}
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                      <span className={`font-mono text-xs font-semibold ${biz.expired > 0 ? 'text-gray-700 font-bold' : 'text-gray-400'}`}>
                        {biz.expired}
                      </span>
                    </td>

                    {/* 9. Cancelled */}
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                      <span className={`font-mono text-xs font-semibold ${biz.cancelled > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                        {biz.cancelled}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. FROZEN FOOTER: Pagination Controls & Record Counts */}
        <div className="shrink-0 bg-gray-50/90 border-t border-gray-100 px-3.5 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-gray-500 font-medium">
            Showing{' '}
            <span className="font-semibold text-gray-800">
              {filteredAndSortedBusinesses.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * pageSize, filteredAndSortedBusinesses.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-800">
              {filteredAndSortedBusinesses.length}
            </span>{' '}
            registered businesses
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
