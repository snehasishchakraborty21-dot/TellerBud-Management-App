import React, { useState, useMemo, useCallback } from 'react';
import {
  BusinessWalletFilters,
  BusinessWalletSortField,
  BusinessWalletSortDirection,
} from '../types/businessWallet';
import {
  MOCK_BUSINESS_WALLETS,
  calculateBusinessWalletSummary,
  filterAndSortBusinessWallets,
} from '../data/mockBusinessWalletData';
import { BusinessWalletKpiCards } from '../components/business-wallets/BusinessWalletKpiCards';
import { BusinessWalletFilterBar } from '../components/business-wallets/BusinessWalletFilterBar';
import { BusinessWalletTable } from '../components/business-wallets/BusinessWalletTable';
import { BusinessWalletPagination } from '../components/business-wallets/BusinessWalletPagination';

export const BusinessGlobalWalletsPage: React.FC = () => {
  // Filters state
  const [filters, setFilters] = useState<BusinessWalletFilters>({
    search: '',
    state: 'ALL',
    health: 'ALL',
    balanceRange: 'ALL',
    updatedFrom: '',
    updatedTo: '',
    kpiFilter: 'ALL', // Default is "Total Business Wallets" ('ALL')
  });

  // Sorting state
  const [sortField, setSortField] = useState<BusinessWalletSortField>('postedBalance');
  const [sortDirection, setSortDirection] = useState<BusinessWalletSortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Refresh & loading state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Derived KPI summary from authoritative wallets
  const summary = useMemo(() => {
    return calculateBusinessWalletSummary(MOCK_BUSINESS_WALLETS);
  }, []);

  // Filtered & sorted wallets
  const filteredWallets = useMemo(() => {
    return filterAndSortBusinessWallets(MOCK_BUSINESS_WALLETS, filters, {
      field: sortField,
      direction: sortDirection,
    });
  }, [filters, sortField, sortDirection]);

  // Paginated records
  const paginatedWallets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWallets.slice(startIndex, startIndex + pageSize);
  }, [filteredWallets, currentPage, pageSize]);

  // Active filter detection
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (filters.search && filters.search.trim() !== '') ||
        filters.state !== 'ALL' ||
        filters.health !== 'ALL' ||
        filters.balanceRange !== 'ALL' ||
        filters.updatedFrom !== '' ||
        filters.updatedTo !== '' ||
        filters.kpiFilter !== 'ALL'
    );
  }, [filters]);

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: Partial<BusinessWalletFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      state: 'ALL',
      health: 'ALL',
      balanceRange: 'ALL',
      updatedFrom: '',
      updatedTo: '',
      kpiFilter: 'ALL',
    });
    setCurrentPage(1);
  }, []);

  const handleSelectKpiFilter = useCallback(
    (kpi: BusinessWalletFilters['kpiFilter']) => {
      handleFilterChange({ kpiFilter: kpi });
    },
    [handleFilterChange]
  );

  // Sorting handler
  const handleSort = useCallback((field: BusinessWalletSortField) => {
    setSortField((currField) => {
      if (currField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        return currField;
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

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, []);

  return (
    <div className="max-w-[1536px] mx-auto p-4 sm:p-5 space-y-3.5 pb-20">
      {/* 1. Five compact KPI Cards */}
      <BusinessWalletKpiCards
        summary={summary}
        activeKpiFilter={filters.kpiFilter}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* 2. Compact Filters */}
      <BusinessWalletFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        hasActiveFilters={hasActiveFilters}
        isRefreshing={isRefreshing}
      />

      {/* 3. Business Wallets Table */}
      <div>
        <BusinessWalletTable
          wallets={paginatedWallets}
          loading={isRefreshing}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        {/* 4. Compact Pagination */}
        <BusinessWalletPagination
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
