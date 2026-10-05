import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
} from 'lucide-react';
import {
  AgentToAgentRequest,
  AgentToAgentStatusSummary,
} from '../types/admin';
import { BusinessRecord } from '../types/business';
import { adminService } from '../services/mockAdminService';
import { businessService } from '../services/businessService';
import { deriveAgentLiquidityStatusSummary } from '../data/mockAgentLiquidityData';
import { getZambiaTodayString } from '../utils/dateUtils';

interface BusinessLiquiditySummary {
  businessId: string;
  businessName: string;
  city?: string;
  totalRequests: number;
  matching: number;
  agentMatched: number;
  inProgress: number;
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
  | 'agentMatched'
  | 'inProgress'
  | 'completed'
  | 'noAgent'
  | 'expired'
  | 'cancelled';

type SortDirection = 'asc' | 'desc';

export const AgentLiquidityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayStr = useMemo(() => getZambiaTodayString() || '2026-10-05', []);

  // Primary Data State
  const [allRequests, setAllRequests] = useState<AgentToAgentRequest[]>([]);
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

  // Filter requests by date if fromDate / toDate are active (KPI period updates, but always includes ALL businesses)
  const dateFilteredRequests = useMemo(() => {
    if (!fromDate && !toDate) return allRequests;
    return allRequests.filter((r) => {
      const reqDate = r.requestedAt ? r.requestedAt.split('T')[0] : '';
      if (!reqDate) return true;
      if (fromDate && reqDate < fromDate) return false;
      if (toDate && reqDate > toDate) return false;
      return true;
    });
  }, [allRequests, fromDate, toDate]);

  // Global KPI summary: always represents ALL registered businesses across the date-filtered dataset (unaffected by business search)
  const globalSummary: AgentToAgentStatusSummary = useMemo(() => {
    return deriveAgentLiquidityStatusSummary(dateFilteredRequests);
  }, [dateFilteredRequests]);

  // Build Business-wise Liquidity Summaries with all 7 distinct statuses
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

      return {
        businessId: biz.id,
        businessName: biz.name,
        city: biz.city,
        totalRequests: combinedRequests.length,
        matching,
        agentMatched,
        inProgress,
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
        case 'agentMatched':
          comparison = a.agentMatched - b.agentMatched;
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
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBusinesses.length / pageSize));
  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedBusinesses.slice(start, start + pageSize);
  }, [filteredAndSortedBusinesses, currentPage, pageSize]);

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

  // 8 Global KPI Cards without icons, with proportional widths according to label length
  const kpisList = [
    {
      id: 'kpi-all',
      label: 'All Requests',
      value: globalSummary.all,
      color: 'text-[#102025]',
      flexGrow: 'flex-[1.1]',
    },
    {
      id: 'kpi-matching',
      label: 'Matching',
      value: globalSummary.matching,
      color: 'text-amber-600',
      flexGrow: 'flex-[0.95]',
    },
    {
      id: 'kpi-matched',
      label: 'Agent Matched',
      value: globalSummary.agentMatched,
      color: 'text-blue-600',
      flexGrow: 'flex-[1.2]',
    },
    {
      id: 'kpi-in-progress',
      label: 'In Progress',
      value: globalSummary.inProgress,
      color: 'text-[#0D93AA]',
      flexGrow: 'flex-[1.05]',
    },
    {
      id: 'kpi-completed',
      label: 'Completed',
      value: globalSummary.completed,
      color: 'text-emerald-600',
      flexGrow: 'flex-[1]',
    },
    {
      id: 'kpi-no-agent',
      label: 'No Agent',
      value: globalSummary.noAgentAvailable,
      color: 'text-amber-600',
      flexGrow: 'flex-[0.95]',
    },
    {
      id: 'kpi-expired',
      label: 'Expired',
      value: globalSummary.expired,
      color: 'text-gray-600',
      flexGrow: 'flex-[0.9]',
    },
    {
      id: 'kpi-cancelled',
      label: 'Cancelled',
      value: globalSummary.cancelled,
      color: 'text-red-600',
      flexGrow: 'flex-[0.95]',
    },
  ];

  return (
    <div
      id="agent-liquidity-page-container"
      className="w-full flex-1 flex flex-col min-h-0 h-full gap-2.5 sm:gap-3 px-3 sm:px-6 pt-1.5 pb-3 sm:pb-4 overflow-hidden"
    >
      {/* 1 & 2. TOP FROZEN SECTION: 8 KPI Cards + Compact Filter Bar */}
      <div
        id="frozen-agent-liquidity-kpi-filter-section"
        className="shrink-0 bg-[#FAFAFA] space-y-2.5 transition-all"
      >
        {/* 1. Top Global KPI Cards (One Horizontal Row, No Icons, Label on Left, Value on Right) */}
        <div className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-2.5 w-full">
          {kpisList.map((kpi) => (
            <div
              key={kpi.id}
              className={`bg-white rounded-xl border border-gray-100 px-3 py-2 shadow-sm h-[52px] sm:h-[54px] flex items-center justify-between gap-2 transition-all hover:border-gray-200 min-w-[110px] ${kpi.flexGrow}`}
            >
              <span className="text-[10px] sm:text-[10.5px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                {kpi.label}
              </span>
              <span className={`text-[17px] sm:text-[18px] font-bold font-mono tracking-tight ${kpi.color} leading-none shrink-0`}>
                {isLoading ? '...' : kpi.value.toLocaleString()}
              </span>
            </div>
          ))}
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
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs border-b border-gray-100 shadow-[0_1px_0_0_#E5E7EB] text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => handleSort('businessName')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group min-w-[190px] sm:min-w-[210px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Business Name</span>
                    {renderSortIcon('businessName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('businessId')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[100px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Business ID</span>
                    {renderSortIcon('businessId')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalRequests')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[90px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total Requests</span>
                    {renderSortIcon('totalRequests')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('matching')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[80px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Matching</span>
                    {renderSortIcon('matching')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('agentMatched')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[95px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Agent Matched</span>
                    {renderSortIcon('agentMatched')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('completed')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[85px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Completed</span>
                    {renderSortIcon('completed')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('noAgent')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[80px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>No Agent</span>
                    {renderSortIcon('noAgent')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('expired')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[75px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Expired</span>
                    {renderSortIcon('expired')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cancelled')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[80px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Cancelled</span>
                    {renderSortIcon('cancelled')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 align-middle">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-[#0D93AA]" />
                      <span className="text-xs">Loading business liquidity summary...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 align-middle">
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
                    key={`al-row-${biz.businessId}-${idx}`}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* Business Name */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex flex-col items-center justify-center text-center mx-auto max-w-[220px]">
                        <div className="font-semibold text-[#102025] leading-snug break-normal text-xs sm:text-sm">
                          {biz.businessName}
                        </div>
                        {biz.city && (
                          <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                            {biz.city}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Business ID */}
                    <td className="py-3 px-3 text-center align-middle">
                      <span className="inline-block font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/80 whitespace-nowrap">
                        {biz.businessId}
                      </span>
                    </td>

                    {/* Total Liquidity Requests */}
                    <td className="py-3 px-3 text-center align-middle font-mono font-bold text-[#102025]">
                      {biz.totalRequests > 0 ? (
                        biz.totalRequests.toLocaleString()
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Matching */}
                    <td className="py-3 px-3 text-center align-middle font-mono">
                      {biz.matching > 0 ? (
                        <span className="font-bold text-amber-600">{biz.matching.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Agent Matched */}
                    <td className="py-3 px-3 text-center align-middle font-mono">
                      {biz.agentMatched > 0 ? (
                        <span className="font-bold text-blue-600">{biz.agentMatched.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Completed */}
                    <td className="py-3 px-3 text-center align-middle font-mono">
                      {biz.completed > 0 ? (
                        <span className="font-bold text-emerald-600">{biz.completed.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* No Agent */}
                    <td className="py-3 px-3 text-center align-middle font-mono">
                      {biz.noAgent > 0 ? (
                        <span className="font-bold text-amber-600">{biz.noAgent.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Expired */}
                    <td className="py-3 px-3 text-center align-middle font-mono">
                      {biz.expired > 0 ? (
                        <span className="font-bold text-gray-600">{biz.expired.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* Cancelled */}
                    <td className="py-3 px-3 text-center align-middle font-mono">
                      {biz.cancelled > 0 ? (
                        <span className="font-bold text-red-600">{biz.cancelled.toLocaleString()}</span>
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
