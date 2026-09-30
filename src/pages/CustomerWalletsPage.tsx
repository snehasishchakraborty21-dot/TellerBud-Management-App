import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
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
  calculateCustomerWalletSummary,
  filterAndSortCustomerWallets,
} from '../data/mockCustomerWalletData';
import { customerWalletService } from '../services/customerWalletService';
import { CustomerWalletKpiCards } from '../components/customerWallets/CustomerWalletKpiCards';
import { CustomerWalletFilterBar } from '../components/customerWallets/CustomerWalletFilterBar';
import { CustomerWalletTable } from '../components/customerWallets/CustomerWalletTable';
import { CustomerWalletPagination } from '../components/customerWallets/CustomerWalletPagination';

export const CustomerWalletsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Reactive wallet list from customerWalletService
  const [allWallets, setAllWallets] = useState<CustomerWalletRecord[]>(() =>
    customerWalletService.getWallets()
  );

  // Subscribe to updates in customerWalletService
  useEffect(() => {
    const unsubscribe = customerWalletService.subscribe(() => {
      setAllWallets(customerWalletService.getWallets());
    });
    return unsubscribe;
  }, []);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning';
  } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

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
    return calculateCustomerWalletSummary(allWallets);
  }, [allWallets]);

  // Filtered and sorted customer wallets
  const filteredWallets = useMemo(() => {
    return filterAndSortCustomerWallets(allWallets, filters, {
      field: sortField,
      direction: sortDirection,
    });
  }, [allWallets, filters, sortField, sortDirection]);

  // Paginated records
  const paginatedWallets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWallets.slice(startIndex, startIndex + pageSize);
  }, [filteredWallets, currentPage, pageSize]);

  // Determine if any non-default filter is currently active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.walletState !== 'ALL' ||
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
      setAllWallets(customerWalletService.getWallets());
      setIsRefreshing(false);
      showToast('Customer wallets data refreshed successfully.');
    }, 450);
  }, [showToast]);

  // Navigate to dedicated full-width Customer Wallet Details route
  const handleViewDetails = useCallback(
    (walletId: string) => {
      navigate(`/super-admin/wallets/customers/${walletId}`, {
        state: { fromSearch: location.search },
      });
    },
    [navigate, location.search]
  );

  // Action: Suspend Wallet
  const handleSuspendWallet = useCallback(
    (walletId: string, reason: string) => {
      const success = customerWalletService.suspendWallet(walletId, reason);
      if (success) {
        showToast(`Wallet ${walletId} has been suspended.`, 'warning');
      }
    },
    [showToast]
  );

  // Action: Reactivate Wallet
  const handleReactivateWallet = useCallback(
    (walletId: string) => {
      const success = customerWalletService.reactivateWallet(walletId);
      if (success) {
        showToast(`Wallet ${walletId} has been reactivated successfully.`, 'success');
      }
    },
    [showToast]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {toastMessage.type === 'warning' ? (
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Compact KPI Cards (Click to filter, strictly no subtitles beneath values) */}
      <CustomerWalletKpiCards
        summary={summary}
        activeKpiFilter={filters.kpiFilter}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* 2. Compact Filter Bar with State, Ranges, Dates, Clear, Refresh, and Export */}
      <CustomerWalletFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        hasActiveFilters={hasActiveFilters}
        isRefreshing={isRefreshing}
        walletsToExport={filteredWallets}
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
          onSuspendWallet={handleSuspendWallet}
          onReactivateWallet={handleReactivateWallet}
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
