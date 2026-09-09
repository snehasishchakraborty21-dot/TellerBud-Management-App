import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MOCK_WALLET_FUNDING_RECORDS,
  calculateWalletFundingSummary,
  filterAndSortWalletFunding,
} from '../data/mockWalletFundingData';
import {
  WalletFundingFilters,
  WalletFundingSortField,
  WalletFundingSortDirection,
  WalletFundingKpiFilter,
} from '../types/walletFunding';
import { WalletFundingKpiCards } from '../components/walletFunding/WalletFundingKpiCards';
import { WalletFundingFilterBar } from '../components/walletFunding/WalletFundingFilterBar';
import { WalletFundingTable } from '../components/walletFunding/WalletFundingTable';
import { WalletFundingPagination } from '../components/walletFunding/WalletFundingPagination';

export const WalletFundingPage: React.FC = () => {
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState<WalletFundingFilters>({
    search: '',
    provider: 'ALL',
    status: 'ALL',
    initiatedFrom: '',
    initiatedTo: '',
    kpiFilter: 'ALL',
  });

  // Sorting state
  const [sortField, setSortField] = useState<WalletFundingSortField>('initiated');
  const [sortDirection, setSortDirection] = useState<WalletFundingSortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Compute KPI summary from raw dataset
  const summary = useMemo(
    () => calculateWalletFundingSummary(MOCK_WALLET_FUNDING_RECORDS),
    []
  );

  // Filter and sort records
  const filteredRecords = useMemo(
    () =>
      filterAndSortWalletFunding(MOCK_WALLET_FUNDING_RECORDS, filters, {
        field: sortField,
        direction: sortDirection,
      }),
    [filters, sortField, sortDirection]
  );

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Handlers
  const handleFilterChange = (newFilters: Partial<WalletFundingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleSelectKpiFilter = (kpiFilter: WalletFundingKpiFilter) => {
    setFilters((prev) => ({ ...prev, kpiFilter }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      provider: 'ALL',
      status: 'ALL',
      initiatedFrom: '',
      initiatedTo: '',
      kpiFilter: 'ALL',
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const handleSort = (field: WalletFundingSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (reference: string) => {
    navigate(`/super-admin/wallets/add-funds/${encodeURIComponent(reference)}`);
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.provider !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.initiatedFrom !== '' ||
    filters.initiatedTo !== '' ||
    filters.kpiFilter !== 'ALL';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 5 Clickable KPI Cards with Oceanic Blue active-state */}
      <WalletFundingKpiCards
        summary={summary}
        activeKpiFilter={filters.kpiFilter}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* Compact Filter Container */}
      <WalletFundingFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        hasActiveFilters={hasActiveFilters}
        isRefreshing={isRefreshing}
      />

      {/* Results Table */}
      <WalletFundingTable
        records={paginatedRecords}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onViewDetails={handleViewDetails}
      />

      {/* Compact Pagination */}
      {filteredRecords.length > 0 && (
        <WalletFundingPagination
          currentPage={currentPage}
          totalItems={filteredRecords.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
};
export default WalletFundingPage;
