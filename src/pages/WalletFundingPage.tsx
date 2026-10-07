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
    ownerType: 'ALL',
    provider: 'ALL',
    status: 'ALL',
    initiatedFrom: '',
    initiatedTo: '',
    kpiFilter: 'ALL',
  });

  // Sorting state (default: newest first by initiated timestamp)
  const [sortField, setSortField] = useState<WalletFundingSortField>('initiated');
  const [sortDirection, setSortDirection] = useState<WalletFundingSortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Derive records matching current search/owner/provider/date filters (ignoring kpiFilter so user can see category breakdowns responding to applied filters)
  const baseFilteredForKpi = useMemo(() => {
    return filterAndSortWalletFunding(
      MOCK_WALLET_FUNDING_RECORDS,
      { ...filters, kpiFilter: 'ALL' },
      { field: 'initiated', direction: 'desc' }
    );
  }, [filters]);

  // Compute KPI summary from filtered dataset (including both Customer and Business records)
  const summary = useMemo(
    () => calculateWalletFundingSummary(baseFilteredForKpi),
    [baseFilteredForKpi]
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
      ownerType: 'ALL',
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
    navigate(`/super-admin/wallet-funding/${encodeURIComponent(reference)}`);
  };

  const hasActiveFilters =
    filters.ownerType !== 'ALL' ||
    filters.provider !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.initiatedFrom !== '' ||
    filters.initiatedTo !== '' ||
    filters.kpiFilter !== 'ALL';

  return (
    <div className="h-full flex flex-col min-h-0 p-3.5 sm:p-4 md:p-5 lg:p-6 space-y-2.5 overflow-hidden w-full select-text">
      {/* TOP FROZEN SECTION: KPI Cards + Compact Filter Bar */}
      <div
        id="frozen-wallet-funding-top-section"
        className="shrink-0 space-y-2.5 bg-[#FAFAFA]"
      >
        {/* 1. Compact Clickable KPI Cards */}
        <WalletFundingKpiCards
          summary={summary}
          activeKpiFilter={filters.kpiFilter}
          onSelectKpiFilter={handleSelectKpiFilter}
        />

        {/* 2. Compact Filter Bar */}
        <WalletFundingFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          hasActiveFilters={hasActiveFilters}
          isRefreshing={isRefreshing}
          recordsToExport={filteredRecords}
        />
      </div>

      {/* MAIN TABLE SECTION WITH FROZEN THEAD & INTERNAL VERTICAL SCROLL */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden w-full">
        {/* Scrollable Table Area */}
        <WalletFundingTable
          records={paginatedRecords}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewDetails={handleViewDetails}
        />

        {/* Compact Pagination */}
        {filteredRecords.length > 0 && (
          <div className="shrink-0 px-4 py-2.5 bg-slate-50/80 border-t border-gray-200/90">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletFundingPage;
