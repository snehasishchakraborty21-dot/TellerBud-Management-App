import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AgentToAgentRequest,
  AgentToAgentFilters,
  AgentToAgentStatus,
  AgentToAgentStatusSummary,
  AgentToAgentSortField,
  AgentToAgentSortDirection,
} from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { AgentLiquidityStatusTabs } from '../components/agent-liquidity/AgentLiquidityStatusTabs';
import { AgentLiquidityFilterBar } from '../components/agent-liquidity/AgentLiquidityFilterBar';
import { AgentLiquidityTable } from '../components/agent-liquidity/AgentLiquidityTable';
import { exportAgentLiquidityRequestsToExcel } from '../utils/agentLiquidityExport';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AgentLiquidityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Restore saved state from sessionStorage if returning from details page
  const savedStatus = sessionStorage.getItem('bo_atl_status') as AgentToAgentStatus | 'ALL' | null;
  const savedFrom = sessionStorage.getItem('bo_atl_from');
  const savedTo = sessionStorage.getItem('bo_atl_to');
  const savedPage = sessionStorage.getItem('bo_atl_page');
  const savedScroll = sessionStorage.getItem('bo_atl_scroll');

  // Filters State
  const [status, setStatus] = useState<AgentToAgentStatus | 'ALL'>(() => {
    if (savedStatus) return savedStatus;
    const urlStatus = searchParams.get('status') as AgentToAgentStatus | null;
    const validStatuses: AgentToAgentStatus[] = [
      'Matching',
      'Agent Matched',
      'In Progress',
      'Completed',
      'No Agent Available',
      'Expired',
      'Cancelled',
    ];
    return urlStatus && validStatuses.includes(urlStatus) ? urlStatus : 'ALL';
  });

  const [dateFrom, setDateFrom] = useState<string | undefined>(() => {
    if (savedFrom) return savedFrom;
    return searchParams.get('from') || undefined;
  });

  const [dateTo, setDateTo] = useState<string | undefined>(() => {
    if (savedTo) return savedTo;
    return searchParams.get('to') || undefined;
  });

  // Primary Data State
  const [allRequests, setAllRequests] = useState<AgentToAgentRequest[]>([]);
  const [summary, setSummary] = useState<AgentToAgentStatusSummary>({
    all: 24,
    matching: 4,
    agentMatched: 3,
    inProgress: 3,
    completed: 8,
    noAgentAvailable: 2,
    expired: 2,
    cancelled: 2,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Sorting State
  const [sortField, setSortField] = useState<AgentToAgentSortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<AgentToAgentSortDirection>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (savedPage) {
      const p = parseInt(savedPage, 10);
      return isNaN(p) || p < 1 ? 1 : p;
    }
    return 1;
  });
  const [pageSize, setPageSize] = useState<number>(10);

  // Clear sessionStorage saved items once initialized so they don't stick forever
  useEffect(() => {
    sessionStorage.removeItem('bo_atl_status');
    sessionStorage.removeItem('bo_atl_from');
    sessionStorage.removeItem('bo_atl_to');
    sessionStorage.removeItem('bo_atl_page');
  }, []);

  // Restore scroll position once data is loaded
  useEffect(() => {
    if (savedScroll && tableContainerRef.current && !isLoading) {
      const top = parseInt(savedScroll, 10);
      if (!isNaN(top)) {
        tableContainerRef.current.scrollTop = top;
      }
      sessionStorage.removeItem('bo_atl_scroll');
    }
  }, [isLoading, savedScroll]);

  // Load data from adminService
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const businessScope =
        currentUser?.role === 'business_owner' ? currentUser.businessName : undefined;

      const filters: AgentToAgentFilters = {
        search: '',
        status,
        requestType: 'ALL',
        fromDate: dateFrom || '',
        toDate: dateTo || '',
      };

      const response = await adminService.getAgentLiquidityRequests(
        filters,
        {
          field: sortField,
          direction: sortDirection,
        },
        businessScope
      );
      setAllRequests(response.items);
      setSummary(response.summary);
    } catch (err) {
      console.error('Failed to load Agent-to-Agent liquidity requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [status, dateFrom, dateTo, sortField, sortDirection, currentUser?.role, currentUser?.businessName]);

  useEffect(() => {
    loadData();
    const unsubscribe = adminService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [loadData]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') {
      params.set('status', status);
    }
    if (dateFrom) {
      params.set('from', dateFrom);
    }
    if (dateTo) {
      params.set('to', dateTo);
    }
    setSearchParams(params, { replace: true });
  }, [status, dateFrom, dateTo, setSearchParams]);

  // Status Tab Selection
  const handleStatusTabSelect = useCallback((newStatus: AgentToAgentStatus | 'ALL') => {
    setStatus(newStatus);
    setCurrentPage(1);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Date Range Change
  const handleDateRangeChange = useCallback((from?: string, to?: string) => {
    setDateFrom(from);
    setDateTo(to);
    setCurrentPage(1);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Sort Change
  const handleSortChange = useCallback((field: AgentToAgentSortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortDirection((currentDir) => (currentDir === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortDirection('desc');
      return field;
    });
  }, []);

  // Details Navigation: store state in sessionStorage and navigate
  const handleNavigateToDetails = useCallback(
    (req: AgentToAgentRequest) => {
      sessionStorage.setItem('bo_atl_status', status);
      if (dateFrom) sessionStorage.setItem('bo_atl_from', dateFrom);
      if (dateTo) sessionStorage.setItem('bo_atl_to', dateTo);
      sessionStorage.setItem('bo_atl_page', String(currentPage));
      if (tableContainerRef.current) {
        sessionStorage.setItem('bo_atl_scroll', String(tableContainerRef.current.scrollTop));
      }

      const basePath =
        currentUser?.role === 'business_owner'
          ? '/business-owner/operations/agent-to-agent-liquidity'
          : '/super-admin/operations/agent-to-agent-liquidity';

      navigate(`${basePath}/${req.reference}`);
    },
    [status, dateFrom, dateTo, currentPage, currentUser?.role, navigate]
  );

  // Export matching requests
  const handleExport = useCallback(() => {
    setIsExporting(true);
    try {
      exportAgentLiquidityRequestsToExcel(
        allRequests,
        status,
        dateFrom,
        dateTo,
        currentUser?.businessName
      );
    } catch (err) {
      console.error('Failed to export Agent-to-Agent liquidity requests:', err);
    } finally {
      setIsExporting(false);
    }
  }, [allRequests, status, dateFrom, dateTo, currentUser?.businessName]);

  // Paginated records
  const totalRecords = allRequests.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allRequests.slice(startIndex, startIndex + pageSize);
  }, [allRequests, currentPage, pageSize]);

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 max-w-7xl mx-auto w-full">
      {/* 1. Status Tabs (Frozen upper section) */}
      <div className="shrink-0">
        <AgentLiquidityStatusTabs
          activeStatus={status}
          onSelectStatus={handleStatusTabSelect}
          summary={summary}
        />
      </div>

      {/* 2. Filter & Action Bar: Date Range Selector & Export (Frozen upper section) */}
      <div className="shrink-0">
        <AgentLiquidityFilterBar
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
          onRefresh={loadData}
          isRefreshing={isLoading}
          isExporting={isExporting}
        />
      </div>

      {/* 3. Table Container: Flexible container with Sticky Header, Scrollable Rows, and Fixed Pagination */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Scrollable Rows Table with Sticky Header */}
        <div
          ref={tableContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar-thin"
        >
          <AgentLiquidityTable
            requests={paginatedRequests}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            onDetails={handleNavigateToDetails}
            isLoading={isLoading}
          />
        </div>

        {/* 4. Fixed Pagination Area at Bottom */}
        {totalRecords > 0 && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-gray-600">
              <span>
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(currentPage * pageSize, totalRecords)}
                </span>{' '}
                of <span className="font-semibold text-gray-900">{totalRecords}</span> requests
              </span>

              <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-gray-200">
                <span className="text-gray-500">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    currentPage === pageNum
                      ? 'bg-[#0D93AA] text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
