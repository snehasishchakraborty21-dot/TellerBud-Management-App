import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  CustomerWalletRecord,
  CustomerWalletSummary,
  CustomerWalletFilters,
  CustomerWalletSortField,
  CustomerWalletSortDirection,
  WalletAccountState,
  ReservationStateFilter,
  BalanceRangeFilter,
} from '../types/customerWallet';
import {
  MOCK_CUSTOMER_WALLETS,
  calculateCustomerWalletSummary,
  filterAndSortCustomerWallets,
} from '../data/mockCustomerWalletData';
import { CustomerWalletKpiCards } from '../components/customerWallets/CustomerWalletKpiCards';
import { CustomerWalletFilterBar } from '../components/customerWallets/CustomerWalletFilterBar';
import { CustomerWalletTable } from '../components/customerWallets/CustomerWalletTable';
import { CustomerWalletPagination } from '../components/customerWallets/CustomerWalletPagination';

export const CustomerWalletsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params if present
  const [filters, setFilters] = useState<CustomerWalletFilters>({
    search: searchParams.get('search') || '',
    walletState: (searchParams.get('state') as WalletAccountState | 'ALL') || 'ALL',
    reservationState:
      (searchParams.get('reservation') as ReservationStateFilter) || 'ALL',
    balanceRange: (searchParams.get('range') as BalanceRangeFilter) || 'ALL',
    updatedFrom: searchParams.get('from') || '',
    updatedTo: searchParams.get('to') || '',
    kpiFilter: (searchParams.get('kpi') as CustomerWalletFilters['kpiFilter']) || 'ALL',
  });

  // Sorting state
  const [sortField, setSortField] = useState<CustomerWalletSortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<CustomerWalletSortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Data & UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Derived KPI summary from the exact canonical wallet records
  const summary: CustomerWalletSummary = useMemo(() => {
    return calculateCustomerWalletSummary(MOCK_CUSTOMER_WALLETS);
  }, []);

  // Filtered and sorted customer wallets
  const filteredWallets = useMemo(() => {
    return filterAndSortCustomerWallets(MOCK_CUSTOMER_WALLETS, filters, {
      field: sortField,
      direction: sortDirection,
    });
  }, [filters, sortField, sortDirection]);

  // Paginated records
  const paginatedWallets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWallets.slice(startIndex, startIndex + pageSize);
  }, [filteredWallets, currentPage, pageSize]);

  // Determine if any non-default filter is currently active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (filters.search && filters.search.trim() !== '') ||
        filters.walletState !== 'ALL' ||
        filters.reservationState !== 'ALL' ||
        filters.balanceRange !== 'ALL' ||
        filters.updatedFrom !== '' ||
        filters.updatedTo !== '' ||
        (filters.kpiFilter && filters.kpiFilter !== 'ALL')
    );
  }, [filters]);

  // Synchronize filter changes with searchParams
  const handleFilterChange = useCallback(
    (newFilters: Partial<CustomerWalletFilters>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        const params = new URLSearchParams();

        if (updated.search) params.set('search', updated.search);
        if (updated.walletState && updated.walletState !== 'ALL')
          params.set('state', updated.walletState);
        if (updated.reservationState && updated.reservationState !== 'ALL')
          params.set('reservation', updated.reservationState);
        if (updated.balanceRange && updated.balanceRange !== 'ALL')
          params.set('range', updated.balanceRange);
        if (updated.updatedFrom) params.set('from', updated.updatedFrom);
        if (updated.updatedTo) params.set('to', updated.updatedTo);
        if (updated.kpiFilter && updated.kpiFilter !== 'ALL')
          params.set('kpi', updated.kpiFilter);

        setSearchParams(params, { replace: true });
        return updated;
      });
      setCurrentPage(1);
    },
    [setSearchParams]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      walletState: 'ALL',
      reservationState: 'ALL',
      balanceRange: 'ALL',
      updatedFrom: '',
      updatedTo: '',
      kpiFilter: 'ALL',
    });
    setSearchParams(new URLSearchParams(), { replace: true });
    setCurrentPage(1);
  }, [setSearchParams]);

  // Handle KPI card click
  const handleSelectKpiFilter = useCallback(
    (kpi: CustomerWalletFilters['kpiFilter']) => {
      handleFilterChange({ kpiFilter: kpi });
    },
    [handleFilterChange]
  );

  // Sorting handler
  const handleSort = useCallback((field: CustomerWalletSortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return currentField;
      }
      setSortDirection('desc');
      return field;
    });
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  // Simulated refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setError(null);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  }, []);

  const location = useLocation();

  // Navigate to dedicated full-width Customer Wallet Details route
  const handleViewDetails = useCallback(
    (walletId: string) => {
      navigate(`/super-admin/wallets/customers/${walletId}`, {
        state: { fromSearch: location.search },
      });
    },
    [navigate, location.search]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Compact KPI Cards (Click to filter, strictly no subtitles beneath values) */}
      <CustomerWalletKpiCards
        summary={summary}
        activeKpiFilter={filters.kpiFilter}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* 2. Filter Bar with Search, States, Ranges, Dates, Clear, Refresh */}
      <CustomerWalletFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        hasActiveFilters={hasActiveFilters}
        isRefreshing={isRefreshing}
      />

      {/* 3. Customer Wallets Table */}
      <div className="flex flex-col">
        <CustomerWalletTable
          wallets={paginatedWallets}
          loading={loading || isRefreshing}
          error={error}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewDetails={handleViewDetails}
          onRetry={handleRefresh}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        {/* 4. Pagination */}
        <CustomerWalletPagination
          currentPage={currentPage}
          totalItems={filteredWallets.length}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};
