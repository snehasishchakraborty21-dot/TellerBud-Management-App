import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  X,
  GitPullRequest,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
} from 'lucide-react';
import { PickupRequest } from '../types/admin';
import { BusinessRecord } from '../types/business';
import { adminService } from '../services/mockAdminService';
import { businessService } from '../services/businessService';
import { getCustomerRequestsSummary } from '../data/mockCustomerRequestsData';
import { getZambiaTodayString } from '../utils/dateUtils';

interface BusinessCustomerRequestsSummary {
  businessId: string;
  businessName: string;
  businessType?: string;
  city?: string;
  totalRequests: number;
  active: number;
  completed: number;
  cancelled: number;
  noAgentAvailable: number;
}

type SortField =
  | 'businessName'
  | 'businessId'
  | 'totalRequests'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'noAgentAvailable';

type SortDirection = 'asc' | 'desc';

export const CustomerRequestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayStr = useMemo(() => getZambiaTodayString() || '2026-10-05', []);

  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Date Filter State (defaults to today if not provided)
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [fromDate, setFromDate] = useState<string>(searchParams.get('from') || todayStr);
  const [toDate, setToDate] = useState<string>(searchParams.get('to') || todayStr);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('totalRequests');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Active status set
  const activeStatuses = useMemo(
    () =>
      new Set([
        'Finding an Agent',
        'Agent Confirmed',
        'Active Service',
        'Pending Confirmation',
      ]),
    []
  );

  // Load Customer Requests & Registered Businesses
  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [requestsData, bizData] = await Promise.all([
        adminService.getCustomerRequests(),
        Promise.resolve(businessService.getBusinesses()),
      ]);
      setRequests(requestsData);
      setBusinesses(bizData);
    } catch (error) {
      console.error('Failed to fetch customer requests data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribeAdmin = adminService.subscribe(() => {
      loadData();
    });
    const unsubscribeBiz = businessService.subscribe(() => {
      loadData();
    });
    return () => {
      unsubscribeAdmin();
      unsubscribeBiz();
    };
  }, [loadData]);

  // Synchronise state when searchParams change externally (e.g. from top header date selector)
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (qParam !== searchQuery) setSearchQuery(qParam);
    if (fromParam !== null && fromParam !== fromDate) setFromDate(fromParam);
    if (toParam !== null && toParam !== toDate) setToDate(toParam);
  }, [searchParams]);

  // Push local filter updates to URL params
  const updateUrlParams = useCallback(
    (q: string, from: string, to: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Filter requests by date range for KPI calculations (always includes ALL registered businesses)
  const dateFilteredRequests = useMemo(() => {
    if (!fromDate && !toDate) return requests;
    return requests.filter((r) => {
      let reqDate = r.timestamp ? r.timestamp.split('T')[0] : '';
      if ((!reqDate || reqDate.startsWith('2026-09-04') || reqDate.startsWith('2026-09-28')) && r.createdAt?.startsWith('Today')) {
        reqDate = todayStr;
      }
      if (!reqDate) return true;
      if (fromDate && reqDate < fromDate) return false;
      if (toDate && reqDate > toDate) return false;
      return true;
    });
  }, [requests, fromDate, toDate, todayStr]);

  // Global KPI summary: always represents ALL registered businesses across the date-filtered dataset (unaffected by business search)
  const globalKpis = useMemo(() => {
    return getCustomerRequestsSummary(dateFilteredRequests);
  }, [dateFilteredRequests]);

  // Build Business-wise Customer Request Summaries
  const businessSummaries: BusinessCustomerRequestsSummary[] = useMemo(() => {
    const requestsByBusinessId = new Map<string, PickupRequest[]>();
    const requestsByBusinessName = new Map<string, PickupRequest[]>();

    dateFilteredRequests.forEach((req) => {
      if (req.businessId) {
        const list = requestsByBusinessId.get(req.businessId) || [];
        list.push(req);
        requestsByBusinessId.set(req.businessId, list);
      }
      if (req.businessName) {
        const list = requestsByBusinessName.get(req.businessName.toLowerCase()) || [];
        list.push(req);
        requestsByBusinessName.set(req.businessName.toLowerCase(), list);
      }
    });

    // Generate row for every registered business
    return businesses.map((biz) => {
      const bizRequestsById = requestsByBusinessId.get(biz.id) || [];
      const bizRequestsByName = requestsByBusinessName.get(biz.name.toLowerCase()) || [];

      // Combine unique requests for this business
      const seen = new Set<string>();
      const combinedRequests: PickupRequest[] = [];
      [...bizRequestsById, ...bizRequestsByName].forEach((r) => {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          combinedRequests.push(r);
        }
      });

      let active = 0;
      let completed = 0;
      let cancelled = 0;
      let noAgentAvailable = 0;

      combinedRequests.forEach((r) => {
        if (activeStatuses.has(r.status)) {
          active++;
        } else if (r.status === 'Completed') {
          completed++;
        } else if (r.status === 'Cancelled') {
          cancelled++;
        } else if (r.status === 'No Agent Available') {
          noAgentAvailable++;
        }
      });

      return {
        businessId: biz.id,
        businessName: biz.name,
        businessType: biz.businessType,
        city: biz.city,
        totalRequests: combinedRequests.length,
        active,
        completed,
        cancelled,
        noAgentAvailable,
      };
    });
  }, [businesses, dateFilteredRequests, activeStatuses]);

  // Filtered and Sorted Business Summaries
  const filteredAndSortedBusinesses = useMemo(() => {
    let list = [...businessSummaries];

    // Filter by search query (Business Name or Business ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) ||
          b.businessId.toLowerCase().includes(q)
      );
    }

    // Sort list
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
        case 'active':
          comparison = a.active - b.active;
          break;
        case 'completed':
          comparison = a.completed - b.completed;
          break;
        case 'cancelled':
          comparison = a.cancelled - b.cancelled;
          break;
        case 'noAgentAvailable':
          comparison = a.noAgentAvailable - b.noAgentAvailable;
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [businessSummaries, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBusinesses.length / pageSize));
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

  // Sort handler
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
      return <ArrowUpDown size={12} className="text-gray-400 group-hover:text-gray-600 ml-1 shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-[#0D93AA] ml-1 shrink-0" />
    ) : (
      <ArrowDown size={12} className="text-[#0D93AA] ml-1 shrink-0" />
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFromDate(todayStr);
    setToDate(todayStr);
    setCurrentPage(1);
    updateUrlParams('', todayStr, todayStr);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    updateUrlParams(q, fromDate, toDate);
  };

  const handleFromDateChange = (from: string) => {
    setFromDate(from);
    let nextTo = toDate;
    if (toDate && from > toDate) {
      nextTo = from;
      setToDate(from);
    }
    setCurrentPage(1);
    updateUrlParams(searchQuery, from, nextTo);
  };

  const handleToDateChange = (to: string) => {
    setToDate(to);
    let nextFrom = fromDate;
    if (fromDate && to < fromDate) {
      nextFrom = to;
      setFromDate(to);
    }
    setCurrentPage(1);
    updateUrlParams(searchQuery, nextFrom, to);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    fromDate !== todayStr ||
    toDate !== todayStr;

  return (
    <div
      id="customer-requests-page-container"
      className="w-full flex-1 flex flex-col min-h-0 h-full gap-2.5 sm:gap-3 px-3 sm:px-6 pt-1.5 pb-3 sm:pb-4 overflow-hidden"
    >
      {/* 1 & 2. TOP FROZEN SECTION: KPI Cards + Compact Filter Bar */}
      <div
        id="frozen-customer-requests-kpi-filter-section"
        className="shrink-0 bg-[#FAFAFA] space-y-2.5 transition-all"
      >
        {/* 1. Top Combined Global KPI Cards (One Horizontal Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Total Requests */}
          <div
            id="kpi-card-total-requests"
            className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2.5 shadow-sm h-[52px] sm:h-[54px] flex items-center justify-between gap-2 transition-all hover:border-gray-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <GitPullRequest size={14} className="text-[#0D93AA] shrink-0" />
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
                Total Requests
              </span>
            </div>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-[#102025] leading-none shrink-0">
              {isLoading ? '...' : globalKpis.total.toLocaleString()}
            </span>
          </div>

          {/* Active */}
          <div
            id="kpi-card-active-requests"
            className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2.5 shadow-sm h-[52px] sm:h-[54px] flex items-center justify-between gap-2 transition-all hover:border-gray-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Activity size={14} className="text-amber-500 shrink-0" />
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
                Active
              </span>
            </div>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-amber-600 leading-none shrink-0">
              {isLoading ? '...' : globalKpis.active.toLocaleString()}
            </span>
          </div>

          {/* Completed */}
          <div
            id="kpi-card-completed-requests"
            className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2.5 shadow-sm h-[52px] sm:h-[54px] flex items-center justify-between gap-2 transition-all hover:border-gray-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
                Completed
              </span>
            </div>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-emerald-600 leading-none shrink-0">
              {isLoading ? '...' : globalKpis.completed.toLocaleString()}
            </span>
          </div>

          {/* Cancelled */}
          <div
            id="kpi-card-cancelled-requests"
            className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2.5 shadow-sm h-[52px] sm:h-[54px] flex items-center justify-between gap-2 transition-all hover:border-gray-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <XCircle size={14} className="text-red-500 shrink-0" />
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
                Cancelled
              </span>
            </div>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-red-600 leading-none shrink-0">
              {isLoading ? '...' : globalKpis.cancelled.toLocaleString()}
            </span>
          </div>

          {/* No Agent Available */}
          <div
            id="kpi-card-no-agent-available"
            className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2.5 shadow-sm h-[52px] sm:h-[54px] flex items-center justify-between gap-2 transition-all hover:border-gray-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
                No Agent Available
              </span>
            </div>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-amber-600 leading-none shrink-0">
              {isLoading ? '...' : globalKpis.noAgentAvailable.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 2. Compact Filter Section (Single Horizontal Line) */}
        <div className="bg-white border border-gray-100 rounded-xl p-2.5 sm:p-3 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
            {/* Search Box (Preserved on page filter bar) */}
            <div className="relative flex-1 min-w-[260px]">
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
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date Range: From Date & To Date */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                  From:
                </span>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || todayStr}
                  onChange={(e) => handleFromDateChange(e.target.value)}
                  className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                  To:
                </span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  max={todayStr}
                  onChange={(e) => handleToDateChange(e.target.value)}
                  className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons: Clear & Refresh on the Right */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-9"
              >
                <X size={13} />
                Clear Filters
              </button>

              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-60 h-9"
              >
                <RefreshCw
                  size={13}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN TABLE SECTION WITH FROZEN THEAD & INTERNAL VERTICAL SCROLL */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden w-full">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs border-b border-gray-100 shadow-[0_1px_0_0_#E5E7EB] text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => handleSort('businessName')}
                  className="py-3 px-4 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Business Name</span>
                    {renderSortIcon('businessName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('businessId')}
                  className="py-3 px-4 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Business ID</span>
                    {renderSortIcon('businessId')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalRequests')}
                  className="py-3 px-4 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total Customer Requests</span>
                    {renderSortIcon('totalRequests')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('active')}
                  className="py-3 px-4 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Active</span>
                    {renderSortIcon('active')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('completed')}
                  className="py-3 px-4 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Completed</span>
                    {renderSortIcon('completed')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cancelled')}
                  className="py-3 px-4 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Cancelled</span>
                    {renderSortIcon('cancelled')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('noAgentAvailable')}
                  className="py-3 px-4 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>No Agent Available</span>
                    {renderSortIcon('noAgentAvailable')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 align-middle">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-[#0D93AA]" />
                      <span className="text-xs">Loading business requests summary...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 align-middle">
                    <Building2 size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600 text-sm">No businesses match the filters</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {searchQuery
                        ? `No registered business matches "${searchQuery}"`
                        : 'No records found for the selected criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((biz, idx) => (
                  <tr
                    key={`cr-row-${biz.businessId}-${idx}`}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* Business Name */}
                    <td className="py-3 px-4 text-center align-middle">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="font-semibold text-[#102025]">
                          {biz.businessName}
                        </div>
                        {biz.city && (
                          <div className="text-xs text-gray-400">
                            {biz.city}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Business ID */}
                    <td className="py-3 px-4 text-center align-middle">
                      <span className="inline-block font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/80">
                        {biz.businessId}
                      </span>
                    </td>

                    {/* Total Customer Requests */}
                    <td className="py-3 px-4 text-center align-middle font-mono font-bold text-[#102025]">
                      {biz.totalRequests > 0 ? (
                        biz.totalRequests.toLocaleString()
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Active */}
                    <td className="py-3 px-4 text-center align-middle font-mono">
                      {biz.active > 0 ? (
                        <span className="font-bold text-amber-600">{biz.active.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Completed */}
                    <td className="py-3 px-4 text-center align-middle font-mono">
                      {biz.completed > 0 ? (
                        <span className="font-bold text-emerald-600">{biz.completed.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Cancelled */}
                    <td className="py-3 px-4 text-center align-middle font-mono">
                      {biz.cancelled > 0 ? (
                        <span className="font-bold text-red-600">{biz.cancelled.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* No Agent Available */}
                    <td className="py-3 px-4 text-center align-middle font-mono">
                      {biz.noAgentAvailable > 0 ? (
                        <span className="font-bold text-amber-600">{biz.noAgentAvailable.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination & Counter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-500">
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
