import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CustomerRecord,
  CustomerSummary,
  CustomerFilters,
  CustomerQuickFilter,
  CustomerSortField,
  CustomerSortDirection,
  CustomerAccountStatus,
} from '../types/customer';
import {
  MOCK_REGISTERED_CUSTOMERS,
  getCustomerSummary,
  filterAndSortCustomers,
} from '../data/mockCustomerData';
import { CustomerSummaryCards } from '../components/customers/CustomerSummaryCards';
import { CustomerFilterBar } from '../components/customers/CustomerFilterBar';
import { CustomerTable } from '../components/customers/CustomerTable';
import { CustomerPagination } from '../components/customers/CustomerPagination';

export const CustomersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters state initialized from URL params if present
  const [filters, setFilters] = useState<CustomerFilters>({
    search: searchParams.get('search') || '',
    quickFilter: (searchParams.get('quickFilter') as CustomerQuickFilter) || 'ALL',
    accountStatus: (searchParams.get('status') as CustomerAccountStatus | 'ALL') || 'ALL',
    requestState: (searchParams.get('requestState') as 'ALL' | 'HAS_ACTIVE' | 'NO_ACTIVE') || 'ALL',
    withdrawalState: (searchParams.get('withdrawalState') as 'ALL' | 'HAS_PENDING' | 'NO_PENDING') || 'ALL',
    fromDate: searchParams.get('fromDate') || '',
    toDate: searchParams.get('toDate') || '',
  });

  // Sorting state
  const [sortField, setSortField] = useState<CustomerSortField>('registeredDateIso');
  const [sortDirection, setSortDirection] = useState<CustomerSortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Data & UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Summary counts calculated from all registered customers
  const summary: CustomerSummary = useMemo(() => {
    return getCustomerSummary(MOCK_REGISTERED_CUSTOMERS);
  }, []);

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    return filterAndSortCustomers(MOCK_REGISTERED_CUSTOMERS, filters, {
      field: sortField,
      direction: sortDirection,
    });
  }, [filters, sortField, sortDirection]);

  // Paginated slice
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Check if any filter or search is active
  const isFiltered = useMemo(() => {
    return (
      Boolean(filters.search.trim()) ||
      filters.quickFilter !== 'ALL' ||
      filters.accountStatus !== 'ALL' ||
      filters.requestState !== 'ALL' ||
      filters.withdrawalState !== 'ALL' ||
      Boolean(filters.fromDate) ||
      Boolean(filters.toDate)
    );
  }, [filters]);

  // URL search params synchronizer
  const updateUrlParams = useCallback((newFilters: CustomerFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search.trim()) params.set('search', newFilters.search.trim());
    if (newFilters.quickFilter !== 'ALL') params.set('quickFilter', newFilters.quickFilter);
    if (newFilters.accountStatus !== 'ALL') params.set('status', newFilters.accountStatus);
    if (newFilters.requestState !== 'ALL') params.set('requestState', newFilters.requestState);
    if (newFilters.withdrawalState !== 'ALL') params.set('withdrawalState', newFilters.withdrawalState);
    if (newFilters.fromDate) params.set('fromDate', newFilters.fromDate);
    if (newFilters.toDate) params.set('toDate', newFilters.toDate);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Handler for individual filter changes
  const handleFilterChange = <K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K]
  ) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      updateUrlParams(updated);
      return updated;
    });
    setCurrentPage(1);
  };

  // Handler for summary card click
  const handleSelectQuickFilter = (quickFilter: CustomerQuickFilter) => {
    setFilters((prev) => {
      const newFilter = prev.quickFilter === quickFilter && quickFilter !== 'ALL' ? 'ALL' : quickFilter;
      const updated = { ...prev, quickFilter: newFilter };
      updateUrlParams(updated);
      return updated;
    });
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const reset: CustomerFilters = {
      search: '',
      quickFilter: 'ALL',
      accountStatus: 'ALL',
      requestState: 'ALL',
      withdrawalState: 'ALL',
      fromDate: '',
      toDate: '',
    };
    setFilters(reset);
    updateUrlParams(reset);
    setCurrentPage(1);
  };

  // Refresh preserves current filters
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  // Sorting
  const handleSort = (field: CustomerSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  // Rows per page change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Navigate to customer profile
  const handleViewProfile = (customerId: string) => {
    navigate(`/super-admin/people/customers/${customerId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Summary Cards (Clickable Quick Filters) */}
      <CustomerSummaryCards
        summary={summary}
        activeFilter={filters.quickFilter}
        onSelectFilter={handleSelectQuickFilter}
        isFiltered={isFiltered}
      />

      {/* 2. Filter Bar */}
      <CustomerFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        isFiltered={isFiltered}
        isRefreshing={isRefreshing}
      />

      {/* 3. Customer Table with Sticky Actions */}
      <div className="flex flex-col">
        <CustomerTable
          customers={paginatedCustomers}
          loading={loading || isRefreshing}
          error={error}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewProfile={handleViewProfile}
          onRetry={handleRefresh}
          hasActiveFilters={isFiltered}
        />

        {/* 4. Pagination */}
        <CustomerPagination
          currentPage={currentPage}
          totalItems={filteredCustomers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};
