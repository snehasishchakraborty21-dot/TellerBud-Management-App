import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CashFloatRequest,
  CashFloatFilters,
  CashFloatStatus,
  CashFloatStatusSummary,
  CashFloatSortField,
  CashFloatSortDirection,
} from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { CashFloatStatusStrip } from '../components/cash-float/CashFloatStatusStrip';
import { CashFloatFilterBar } from '../components/cash-float/CashFloatFilterBar';
import { CashFloatTable } from '../components/cash-float/CashFloatTable';
import { CashFloatPagination } from '../components/cash-float/CashFloatPagination';
import { CashFloatSummaryModal } from '../components/cash-float/CashFloatSummaryModal';
import { exportCashFloatRequestsToExcel } from '../utils/cashFloatExport';
import { useAuth } from '../context/AuthContext';

const INITIAL_FILTERS: CashFloatFilters = {
  search: '',
  status: 'ALL',
  requestType: 'ALL',
  fromDate: '',
  toDate: '',
};

export const CashFloatRequestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Primary State
  const [allRequests, setAllRequests] = useState<CashFloatRequest[]>([]);
  const [summary, setSummary] = useState<CashFloatStatusSummary>({
    all: 18,
    pendingReview: 5,
    approved: 3,
    processing: 2,
    fulfilled: 5,
    rejected: 2,
    cancelled: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filters State
  const [filters, setFilters] = useState<CashFloatFilters>(() => {
    const statusParam = searchParams.get('status') as CashFloatStatus | null;
    const fromDateParam = searchParams.get('from') || '';
    const toDateParam = searchParams.get('to') || '';

    return {
      search: '',
      status:
        statusParam &&
        [
          'Pending Review',
          'Approved',
          'Processing',
          'Fulfilled',
          'Rejected',
          'Cancelled',
        ].includes(statusParam)
          ? statusParam
          : 'ALL',
      requestType: 'ALL',
      fromDate: fromDateParam,
      toDate: toDateParam,
    };
  });

  // Sorting State
  const [sortField, setSortField] = useState<CashFloatSortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<CashFloatSortDirection>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected Request for Quick View Modal
  const [selectedRequest, setSelectedRequest] = useState<CashFloatRequest | null>(null);

  // Highlighted reference from URL if present
  const highlightedRef = searchParams.get('reference');

  // Load data from adminService with business-level scoping
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const businessScope =
        currentUser?.role === 'business_owner' ? currentUser.businessName : undefined;

      const response = await adminService.getCashFloatRequests(
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
      console.error('Failed to load Cash/Float requests:', err);
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

  // Sync filters to URL search params
  const updateUrlParams = useCallback(
    (newFilters: CashFloatFilters) => {
      const params = new URLSearchParams();
      if (newFilters.status !== 'ALL') params.set('status', newFilters.status);
      if (newFilters.fromDate) params.set('from', newFilters.fromDate);
      if (newFilters.toDate) params.set('to', newFilters.toDate);
      if (highlightedRef) params.set('reference', highlightedRef);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams, highlightedRef]
  );

  // Status tab select handler
  const handleStatusTabSelect = (status: CashFloatStatus | 'ALL') => {
    const updated: CashFloatFilters = { ...filters, status };
    setFilters(updated);
    setCurrentPage(1);
    updateUrlParams(updated);
  };

  // Date range change handler
  const handleDateRangeChange = (from?: string, to?: string) => {
    const updated: CashFloatFilters = {
      ...filters,
      fromDate: from || '',
      toDate: to || '',
    };
    setFilters(updated);
    setCurrentPage(1);
    updateUrlParams(updated);
  };

  // Clear date range handler
  const handleClearDateRange = () => {
    handleDateRangeChange(undefined, undefined);
  };

  // Refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await loadData();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 400);
    }
  };

  // Export handler
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const businessScope =
        currentUser?.role === 'business_owner' ? currentUser.businessName : undefined;
      exportCashFloatRequestsToExcel(
        allRequests,
        filters.status,
        filters.fromDate,
        filters.toDate,
        businessScope
      );
    } catch (err) {
      console.error('Failed to export Cash/Float requests:', err);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    }
  };

  // Sorting handler
  const handleSort = (field: CashFloatSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Paginated records
  const totalPages = Math.ceil(allRequests.length / pageSize) || 1;
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allRequests.slice(startIndex, startIndex + pageSize);
  }, [allRequests, currentPage, pageSize]);

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4">
      {/* 1. Status Summary Tabs */}
      <div className="shrink-0">
        <CashFloatStatusStrip
          activeStatus={filters.status}
          onSelectStatus={handleStatusTabSelect}
          summary={summary}
        />
      </div>

      {/* 2. Filter Bar: From Date, To Date, Export, Clear Date Range, Refresh */}
      <div className="shrink-0">
        <CashFloatFilterBar
          dateFrom={filters.fromDate}
          dateTo={filters.toDate}
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || isLoading}
          isExporting={isExporting}
        />
      </div>

      {/* 3. Table Card: Flexible container with Sticky Header, Scrollable Rows, and Fixed Pagination */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Scrollable Request Listing Table Container */}
        <div
          ref={tableContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-auto relative"
        >
          <CashFloatTable
            requests={paginatedRequests}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onView={(req) => setSelectedRequest(req)}
            highlightedReference={highlightedRef}
            isLoading={isLoading}
            isFilteredByDate={Boolean(filters.fromDate || filters.toDate)}
            onClearDateRange={handleClearDateRange}
          />
        </div>

        {/* 4. Fixed Pagination Area at Bottom */}
        <div className="shrink-0 border-t border-gray-100 bg-white">
          <CashFloatPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allRequests.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Summary / Detail Modal */}
      <CashFloatSummaryModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};
