import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AgentToAgentRequest,
  AgentToAgentFilters,
  AgentToAgentStatus,
  AgentToAgentRequestType,
  AgentToAgentStatusSummary,
  AgentToAgentSortField,
  AgentToAgentSortDirection,
} from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { AgentLiquidityStatusTabs } from '../components/agent-liquidity/AgentLiquidityStatusTabs';
import { AgentLiquidityFilterBar } from '../components/agent-liquidity/AgentLiquidityFilterBar';
import { AgentLiquidityTable } from '../components/agent-liquidity/AgentLiquidityTable';
import { AgentLiquiditySummaryModal } from '../components/agent-liquidity/AgentLiquiditySummaryModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL_FILTERS: AgentToAgentFilters = {
  search: '',
  status: 'ALL',
  requestType: 'ALL',
  fromDate: '',
  toDate: '',
};

export const AgentLiquidityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary State
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

  // Filters State
  const [filters, setFilters] = useState<AgentToAgentFilters>(() => {
    const statusParam = searchParams.get('status') as AgentToAgentStatus | null;
    const searchParam = searchParams.get('search') || '';
    const typeParam = searchParams.get('type') as AgentToAgentRequestType | null;
    const fromDateParam = searchParams.get('from') || '';
    const toDateParam = searchParams.get('to') || '';

    const validStatuses: AgentToAgentStatus[] = [
      'Matching',
      'Agent Matched',
      'In Progress',
      'Completed',
      'No Agent Available',
      'Expired',
      'Cancelled',
    ];

    return {
      search: searchParam,
      status: statusParam && validStatuses.includes(statusParam) ? statusParam : 'ALL',
      requestType: typeParam && ['Cash', 'Float'].includes(typeParam) ? typeParam : 'ALL',
      fromDate: fromDateParam,
      toDate: toDateParam,
    };
  });

  // Sorting State
  const [sortField, setSortField] = useState<AgentToAgentSortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<AgentToAgentSortDirection>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected Request for Summary Modal
  const [selectedRequest, setSelectedRequest] = useState<AgentToAgentRequest | null>(null);

  // Load data from adminService
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const businessScope =
        currentUser?.role === 'business_owner' ? currentUser.businessName : undefined;

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
  }, [filters, sortField, sortDirection, currentUser?.role, currentUser?.businessName]);

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
    if (filters.status && filters.status !== 'ALL') {
      params.set('status', filters.status);
    }
    if (filters.search) {
      params.set('search', filters.search);
    }
    if (filters.requestType && filters.requestType !== 'ALL') {
      params.set('type', filters.requestType);
    }
    if (filters.fromDate) {
      params.set('from', filters.fromDate);
    }
    if (filters.toDate) {
      params.set('to', filters.toDate);
    }
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  }, [filters, setSearchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    <K extends keyof AgentToAgentFilters>(key: K, value: AgentToAgentFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleStatusTabSelect = useCallback((status: AgentToAgentStatus | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      status,
    }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  }, []);

  const isFiltered = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.status !== 'ALL' ||
      filters.requestType !== 'ALL' ||
      filters.fromDate !== '' ||
      filters.toDate !== ''
    );
  }, [filters]);

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

  // Paginated records
  const totalRecords = allRequests.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allRequests.slice(startIndex, startIndex + pageSize);
  }, [allRequests, currentPage, pageSize]);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Horizontal Status Strip Tabs */}
      <AgentLiquidityStatusTabs
        activeStatus={filters.status}
        onSelectStatus={handleStatusTabSelect}
        summary={summary}
      />

      {/* Filter Toolbar */}
      <AgentLiquidityFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={loadData}
        isFiltered={isFiltered}
        isRefreshing={isLoading}
      />

      {/* Main Table */}
      <AgentLiquidityTable
        requests={paginatedRequests}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onViewSummary={(req) => setSelectedRequest(req)}
        isLoading={isLoading}
      />

      {/* Pagination Bar */}
      {totalRecords > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
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

            <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-gray-200">
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
                    ? 'bg-[#0D93AA] text-white'
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

      {/* Summary Modal */}
      <AgentLiquiditySummaryModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};
