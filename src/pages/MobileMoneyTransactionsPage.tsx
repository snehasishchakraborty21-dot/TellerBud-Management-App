import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import {
  MobileMoneyTransaction,
  MobileMoneyFilters,
  MobileMoneySummary,
  MobileMoneySortField,
  MobileMoneySortDirection,
  ServiceChannel,
  MobileMoneyStatus,
} from '../types/mobileMoney';
import { MobileMoneySummaryCards } from '../components/mobile-money/MobileMoneySummaryCards';
import { MobileMoneyFilterBar } from '../components/mobile-money/MobileMoneyFilterBar';
import { MobileMoneyTable } from '../components/mobile-money/MobileMoneyTable';
import { MobileMoneyPagination } from '../components/mobile-money/MobileMoneyPagination';
import { MobileMoneyDetailsDrawer } from '../components/mobile-money/MobileMoneyDetailsDrawer';

const DEFAULT_FILTERS: MobileMoneyFilters = {
  search: '',
  serviceChannel: 'ALL',
  transactionType: 'ALL',
  status: 'ALL',
  business: 'ALL',
  dateFrom: '',
  dateTo: '',
};

export const MobileMoneyTransactionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { reference: routeRef } = useParams<{ reference?: string }>();

  const isSuperAdmin = currentUser?.role === 'super_admin';
  // Business Owner scope strictly restricted to their business
  const businessScope = isSuperAdmin
    ? undefined
    : currentUser?.businessName || currentUser?.businessId || 'Lusaka Central Express Agency';

  // Query parameter synchronization
  const paramStatus = (searchParams.get('status') as MobileMoneyStatus | 'Cancelled_Failed') || 'ALL';
  const paramChannel = (searchParams.get('channel') as ServiceChannel) || 'ALL';
  const highlightedRef = routeRef || searchParams.get('ref') || undefined;

  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [summary, setSummary] = useState<MobileMoneySummary>({
    total: 0,
    pickup: 0,
    walkIn: 0,
    completed: 0,
    pendingConfirmation: 0,
    cancelledFailed: 0,
  });

  const [filters, setFilters] = useState<MobileMoneyFilters>({
    ...DEFAULT_FILTERS,
    status: paramStatus,
    serviceChannel: paramChannel,
  });

  const [sortField, setSortField] = useState<MobileMoneySortField>('postedAt');
  const [sortDirection, setSortDirection] = useState<MobileMoneySortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected Transaction for Drawer
  const [selectedTransaction, setSelectedTransaction] =
    useState<MobileMoneyTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getMobileMoneyTransactions(
        filters,
        { field: sortField, direction: sortDirection },
        businessScope
      );

      setTransactions(res.items);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load mobile money transactions:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, sortField, sortDirection, businessScope]);

  useEffect(() => {
    loadData();
    const unsubscribe = adminService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [loadData]);

  // Open drawer if ref param or route param is present
  useEffect(() => {
    if (highlightedRef) {
      adminService.getMobileMoneyTransactionByReference(highlightedRef).then((tx) => {
        if (tx) {
          // If Business Owner, make sure they only access their own business record
          if (
            !isSuperAdmin &&
            businessScope &&
            tx.businessName.toLowerCase() !== businessScope.toLowerCase() &&
            tx.businessId.toLowerCase() !== businessScope.toLowerCase()
          ) {
            return;
          }
          setSelectedTransaction(tx);
          setIsDrawerOpen(true);
        }
      });
    }
  }, [highlightedRef, isSuperAdmin, businessScope]);

  // Filter handlers
  const handleFilterChange = (updates: Partial<MobileMoneyFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      // Sync search params
      if (updates.status !== undefined) {
        if (updates.status === 'ALL') searchParams.delete('status');
        else searchParams.set('status', updates.status);
      }
      if (updates.serviceChannel !== undefined) {
        if (updates.serviceChannel === 'ALL') searchParams.delete('channel');
        else searchParams.set('channel', updates.serviceChannel);
      }
      setSearchParams(searchParams, { replace: true });
      return next;
    });
    setCurrentPage(1);
  };

  const handleSelectSummaryCard = (
    channel: ServiceChannel | 'ALL',
    status: MobileMoneyStatus | 'ALL' | 'Cancelled_Failed'
  ) => {
    setFilters((prev) => ({
      ...prev,
      serviceChannel: channel,
      status: status,
    }));
    if (status === 'ALL') searchParams.delete('status');
    else searchParams.set('status', status);

    if (channel === 'ALL') searchParams.delete('channel');
    else searchParams.set('channel', channel);

    setSearchParams(searchParams, { replace: true });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSort = (field: MobileMoneySortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleViewDetails = (tx: MobileMoneyTransaction) => {
    setSelectedTransaction(tx);
    setIsDrawerOpen(true);
    searchParams.set('ref', tx.reference);
    setSearchParams(searchParams, { replace: true });
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTransaction(null);
    if (searchParams.has('ref')) {
      searchParams.delete('ref');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const isFiltered =
    filters.search.trim() !== '' ||
    filters.serviceChannel !== 'ALL' ||
    filters.transactionType !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.business !== 'ALL' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  // Pagination
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 pb-12">
      {/* Summary Cards */}
      <MobileMoneySummaryCards
        summary={summary}
        selectedChannel={filters.serviceChannel}
        selectedStatus={filters.status}
        onSelectFilter={handleSelectSummaryCard}
      />

      {/* Filter Bar */}
      <MobileMoneyFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        onRefresh={handleRefresh}
        isFiltered={isFiltered}
        isRefreshing={isRefreshing}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Table & Pagination Container */}
      <div className="space-y-4">
        <MobileMoneyTable
          transactions={paginatedTransactions}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewDetails={handleViewDetails}
          highlightedReference={highlightedRef}
        />

        <MobileMoneyPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Right-Side Details Drawer */}
      <MobileMoneyDetailsDrawer
        transaction={selectedTransaction}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};
