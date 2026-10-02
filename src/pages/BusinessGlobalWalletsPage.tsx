import React, { useState, useMemo, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  BusinessGlobalWallet,
  BusinessWalletFilters,
  BusinessWalletSortField,
  BusinessWalletSortDirection,
} from '../types/businessWallet';
import {
  MOCK_BUSINESS_WALLETS,
  calculateBusinessWalletSummary,
  filterAndSortBusinessWallets,
  updateBusinessWalletState,
} from '../data/mockBusinessWalletData';
import { BusinessWalletKpiCards } from '../components/business-wallets/BusinessWalletKpiCards';
import { BusinessWalletFilterBar } from '../components/business-wallets/BusinessWalletFilterBar';
import { BusinessWalletTable } from '../components/business-wallets/BusinessWalletTable';
import { BusinessWalletPagination } from '../components/business-wallets/BusinessWalletPagination';
import { WalletStateConfirmationModal } from '../components/business-wallets/WalletStateConfirmationModal';
import {
  exportBusinessWalletsToExcel,
  exportBusinessWalletsToCSV,
} from '../utils/businessWalletExport';
import { useAuth } from '../context/AuthContext';

export const BusinessGlobalWalletsPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Local state for wallets registry
  const [wallets, setWallets] = useState<BusinessGlobalWallet[]>(MOCK_BUSINESS_WALLETS);

  // Filters state
  const [filters, setFilters] = useState<BusinessWalletFilters>({
    state: 'ALL',
    balanceRange: 'ALL',
    updatedFrom: '',
    updatedTo: '',
    kpiFilter: 'ALL', // Default is "Total Business Wallets" ('ALL')
  });

  // Default sorting: registration order (newest first)
  const [sortField, setSortField] = useState<BusinessWalletSortField>('registeredDateIso');
  const [sortDirection, setSortDirection] = useState<BusinessWalletSortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Refresh & loading state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Confirmation Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    wallet: BusinessGlobalWallet | null;
    action: 'SUSPEND' | 'REACTIVATE';
  }>({
    isOpen: false,
    wallet: null,
    action: 'SUSPEND',
  });

  // Notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derived KPI summary from current authoritative wallets
  const summary = useMemo(() => {
    return calculateBusinessWalletSummary(wallets);
  }, [wallets]);

  // Filtered & sorted wallets
  const filteredWallets = useMemo(() => {
    return filterAndSortBusinessWallets(wallets, filters, {
      field: sortField,
      direction: sortDirection,
    });
  }, [wallets, filters, sortField, sortDirection]);

  // Paginated records
  const paginatedWallets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWallets.slice(startIndex, startIndex + pageSize);
  }, [filteredWallets, currentPage, pageSize]);

  // Active filter detection
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.state !== 'ALL' ||
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
      state: 'ALL',
      balanceRange: 'ALL',
      updatedFrom: '',
      updatedTo: '',
      kpiFilter: 'ALL',
    });
    // Return to default Registered Date – Newest First
    setSortField('registeredDateIso');
    setSortDirection('desc');
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
      setWallets([...MOCK_BUSINESS_WALLETS]);
      setIsRefreshing(false);
    }, 400);
  }, []);

  // Suspend & Reactivate modal openers
  const handleOpenSuspend = useCallback((wallet: BusinessGlobalWallet) => {
    setModalState({
      isOpen: true,
      wallet,
      action: 'SUSPEND',
    });
  }, []);

  const handleOpenReactivate = useCallback((wallet: BusinessGlobalWallet) => {
    setModalState({
      isOpen: true,
      wallet,
      action: 'REACTIVATE',
    });
  }, []);

  // Confirm state change
  const handleConfirmStateChange = useCallback(
    (wallet: BusinessGlobalWallet, action: 'SUSPEND' | 'REACTIVATE', reason: string) => {
      const newState = action === 'SUSPEND' ? 'Suspended' : 'Active';
      const adminName = currentUser?.fullName || 'Authorized Admin';
      const updated = updateBusinessWalletState(wallet.walletId, newState, adminName, reason);

      if (updated) {
        setWallets([...MOCK_BUSINESS_WALLETS]);
        const msg =
          action === 'SUSPEND'
            ? `Business wallet ${wallet.walletId} (${wallet.businessName}) has been suspended. Financial history preserved and audit record created.`
            : `Business wallet ${wallet.walletId} (${wallet.businessName}) has been reactivated successfully. Audit record created.`;

        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 5000);
      }
    },
    [currentUser]
  );

  // Export handlers
  const handleExportExcel = useCallback(() => {
    exportBusinessWalletsToExcel(filteredWallets);
  }, [filteredWallets]);

  const handleExportCSV = useCallback(() => {
    exportBusinessWalletsToCSV(filteredWallets);
  }, [filteredWallets]);

  return (
    <div className="max-w-[1536px] mx-auto p-4 sm:p-5 space-y-3.5 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3 border border-slate-800 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs leading-relaxed">{toastMessage}</div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Five compact KPI Cards */}
      <BusinessWalletKpiCards
        summary={summary}
        activeKpiFilter={filters.kpiFilter}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* 2. Compact Single-Line Filter and Action Bar */}
      <BusinessWalletFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
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
          onSuspendWallet={handleOpenSuspend}
          onReactivateWallet={handleOpenReactivate}
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

      {/* 5. Wallet State Confirmation Modal */}
      {modalState.wallet && (
        <WalletStateConfirmationModal
          wallet={modalState.wallet}
          action={modalState.action}
          isOpen={modalState.isOpen}
          onClose={() => setModalState((prev) => ({ ...prev, isOpen: false, wallet: null }))}
          onConfirm={handleConfirmStateChange}
        />
      )}
    </div>
  );
};
