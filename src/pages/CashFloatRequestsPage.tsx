import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CashFloatRequest,
  CashFloatFilters,
  CashFloatStatus,
  CashFloatRequestType,
  CashFloatStatusSummary,
  CashFloatSortField,
  CashFloatSortDirection,
} from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { CashFloatStatusStrip } from '../components/cash-float/CashFloatStatusStrip';
import { CashFloatFilterToolbar } from '../components/cash-float/CashFloatFilterToolbar';
import { CashFloatTable } from '../components/cash-float/CashFloatTable';
import { CashFloatPagination } from '../components/cash-float/CashFloatPagination';
import { CashFloatSummaryModal } from '../components/cash-float/CashFloatSummaryModal';
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

  // Filters State
  const [filters, setFilters] = useState<CashFloatFilters>(() => {
    const statusParam = searchParams.get('status') as CashFloatStatus | null;
    const searchParam = searchParams.get('search') || '';
    const typeParam = searchParams.get('type') as CashFloatRequestType | null;
    const fromDateParam = searchParams.get('from') || '';
    const toDateParam = searchParams.get('to') || '';

    return {
      search: searchParam,
      status: statusParam && ['Pending Review', 'Approved', 'Processing', 'Fulfilled', 'Rejected', 'Cancelled'].includes(statusParam)
        ? statusParam
        : 'ALL',
      requestType: typeParam && ['Cash', 'Float'].includes(typeParam) ? typeParam : 'ALL',
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

  // Load data from adminService
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
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.status !== 'ALL') params.set('status', newFilters.status);
      if (newFilters.requestType !== 'ALL') params.set('type', newFilters.requestType);
      if (newFilters.fromDate) params.set('from', newFilters.fromDate);
      if (newFilters.toDate) params.set('to', newFilters.toDate);
      if (highlightedRef) params.set('reference', highlightedRef);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams, highlightedRef]
  );

  // Filter change handlers
  const handleFilterChange = <K extends keyof CashFloatFilters>(
    key: K,
    value: CashFloatFilters[K]
  ) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setCurrentPage(1);
    updateUrlParams(updated);
  };

  const handleStatusTabSelect = (status: CashFloatStatus | 'ALL') => {
    handleFilterChange('status', status);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    updateUrlParams(INITIAL_FILTERS);
  };

  const isFiltered = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.status !== 'ALL' ||
      filters.requestType !== 'ALL' ||
      filters.fromDate !== '' ||
      filters.toDate !== ''
    );
  }, [filters]);

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
    <div className="space-y-5">
      {/* Status Summary Tabs */}
      <CashFloatStatusStrip
        activeStatus={filters.status}
        onSelectStatus={handleStatusTabSelect}
        summary={summary}
      />

      {/* Filter Toolbar */}
      <CashFloatFilterToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isFiltered={isFiltered}
      />

      {/* Main Table */}
      <CashFloatTable
        requests={paginatedRequests}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onView={(req) => setSelectedRequest(req)}
        highlightedReference={highlightedRef}
        showBusinessColumn={currentUser?.role !== 'business_owner'}
      />

      {/* Pagination Bar */}
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

      {/* Summary / Detail Modal */}
      <CashFloatSummaryModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};
