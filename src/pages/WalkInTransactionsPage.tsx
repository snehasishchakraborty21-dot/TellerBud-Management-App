import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import {
  WalkInTransaction,
  WalkInFilters,
  WalkInTransactionStatus,
  WalkInSortField,
  WalkInSortDirection,
  WalkInStatusSummary,
} from '../types/admin';
import { WalkInStatusTabs } from '../components/walk-in/WalkInStatusTabs';
import { WalkInFilterBar } from '../components/walk-in/WalkInFilterBar';
import { WalkInTable } from '../components/walk-in/WalkInTable';
import { WalkInPagination } from '../components/walk-in/WalkInPagination';
import { WalkInSummaryModal } from '../components/walk-in/WalkInSummaryModal';

const DEFAULT_FILTERS: WalkInFilters = {
  search: '',
  transactionType: 'ALL',
  vendor: 'ALL',
  status: 'ALL',
  fromDate: '',
  toDate: '',
};

export const WalkInTransactionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Business Owner Scoping
  const businessScope =
    currentUser?.businessName || 'Lusaka Central Express Agency';

  // State
  const [transactions, setTransactions] = useState<WalkInTransaction[]>([]);
  const [summary, setSummary] = useState<WalkInStatusSummary>({
    all: 0,
    completed: 0,
    processing: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
  });
  const [filters, setFilters] = useState<WalkInFilters>(() => {
    const statusParam = searchParams.get('status') as WalkInTransactionStatus;
    return {
      ...DEFAULT_FILTERS,
      status: statusParam || 'ALL',
    };
  });
  const [sortField, setSortField] = useState<WalkInSortField>('transactionTime');
  const [sortDirection, setSortDirection] = useState<WalkInSortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected Transaction for Summary Modal
  const [selectedTransaction, setSelectedTransaction] =
    useState<WalkInTransaction | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);

  const highlightedRef = searchParams.get('ref') || undefined;

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getWalkInTransactions(
        filters,
        { field: sortField, direction: sortDirection },
        businessScope
      );

      setTransactions(res.items);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load walk-in transactions:', err);
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

  // Open modal automatically if 'ref' param is present
  useEffect(() => {
    if (highlightedRef) {
      adminService
        .getWalkInTransactionByReference(highlightedRef)
        .then((tx) => {
          if (tx) {
            setSelectedTransaction(tx);
            setIsSummaryOpen(true);
          }
        });
    }
  }, [highlightedRef]);

  // Status Tab selection
  const handleTabChange = (tab: WalkInTransactionStatus | 'ALL') => {
    setFilters((prev) => ({ ...prev, status: tab }));
    setCurrentPage(1);

    if (tab === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', tab);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Filter Updates
  const handleFilterChange = (newFilters: Partial<WalkInFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      if (newFilters.status) {
        if (newFilters.status === 'ALL') {
          searchParams.delete('status');
        } else {
          searchParams.set('status', newFilters.status);
        }
        setSearchParams(searchParams, { replace: true });
      }
      return updated;
    });
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  // Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Sorting
  const handleSort = (field: WalkInSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Modal handlers
  const handleView = (transaction: WalkInTransaction) => {
    setSelectedTransaction(transaction);
    setIsSummaryOpen(true);
  };

  const handleCloseModal = () => {
    setIsSummaryOpen(false);
    setSelectedTransaction(null);
    if (highlightedRef) {
      searchParams.delete('ref');
      setSearchParams(searchParams, { replace: true });
    }
  };

  // Filter Active Check
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.transactionType !== 'ALL' ||
    filters.vendor !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.fromDate !== '' ||
    filters.toDate !== '';

  // Pagination slicing
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Status Tabs */}
        <WalkInStatusTabs
          activeTab={filters.status}
          onTabChange={handleTabChange}
          summary={summary}
        />

        <div className="p-4 sm:p-6 space-y-4">
          {/* Filter Bar */}
          <WalkInFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onRefresh={handleRefresh}
            isFiltered={isFiltered}
            isRefreshing={isRefreshing}
          />

          {/* Table */}
          <WalkInTable
            transactions={paginatedTransactions}
            isLoading={isLoading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onView={handleView}
            highlightedReference={highlightedRef}
          />

          {/* Pagination */}
          <WalkInPagination
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
      </div>

      {/* Summary Modal */}
      <WalkInSummaryModal
        transaction={selectedTransaction}
        isOpen={isSummaryOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
