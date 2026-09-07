import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../services/mockAdminService';
import {
  CustomerWithdrawal,
  WithdrawalFilters,
  WithdrawalStatusSummary,
  WithdrawalStatus,
  WithdrawalNetwork,
  WithdrawalSortField,
  WithdrawalSortDirection,
} from '../types/admin';
import { WithdrawalStatusStrip } from '../components/withdrawals/WithdrawalStatusStrip';
import { WithdrawalFilterToolbar } from '../components/withdrawals/WithdrawalFilterToolbar';
import { WithdrawalTable } from '../components/withdrawals/WithdrawalTable';
import { WithdrawalPagination } from '../components/withdrawals/WithdrawalPagination';
import { WithdrawalQuickViewModal } from '../components/withdrawals/WithdrawalQuickViewModal';

const PAGE_SIZE = 10;

export const CustomerWithdrawalsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const initialStatusParam = searchParams.get('status') as WithdrawalStatus | null;
  const highlightParam = searchParams.get('highlight');

  const [filters, setFilters] = useState<WithdrawalFilters>({
    search: searchParams.get('search') || '',
    status: initialStatusParam || 'ALL',
    network: (searchParams.get('network') as WithdrawalNetwork) || 'ALL',
    fromDate: searchParams.get('fromDate') || '',
    toDate: searchParams.get('toDate') || '',
  });

  const [sortField, setSortField] = useState<WithdrawalSortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<WithdrawalSortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [withdrawals, setWithdrawals] = useState<CustomerWithdrawal[]>([]);
  const [summary, setSummary] = useState<WithdrawalStatusSummary>({
    all: 18,
    pendingReview: 9,
    approved: 2,
    processing: 2,
    paid: 2,
    rejected: 2,
    cancelled: 1,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<CustomerWithdrawal | null>(null);

  // Sync state if URL searchParams change
  useEffect(() => {
    const statusFromUrl = searchParams.get('status') as WithdrawalStatus | null;
    if (statusFromUrl && statusFromUrl !== filters.status) {
      setFilters((prev) => ({ ...prev, status: statusFromUrl }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getCustomerWithdrawals(filters, {
        field: sortField,
        direction: sortDirection,
      });
      setWithdrawals(response.items);
      setSummary(response.summary);
    } catch (err) {
      console.error('Failed to load withdrawals', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortDirection]);

  useEffect(() => {
    fetchData();
    const unsubscribe = adminService.subscribe(fetchData);
    return () => unsubscribe();
  }, [fetchData]);

  // Check if any filter is active
  const isFiltered = useMemo(() => {
    return (
      Boolean(filters.search.trim()) ||
      filters.status !== 'ALL' ||
      filters.network !== 'ALL' ||
      Boolean(filters.fromDate) ||
      Boolean(filters.toDate)
    );
  }, [filters]);

  const handleFilterChange = <K extends keyof WithdrawalFilters>(
    key: K,
    value: WithdrawalFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectStatus = (status: WithdrawalStatus | 'ALL') => {
    setFilters((prev) => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      network: 'ALL',
      fromDate: '',
      toDate: '',
    });
    setCurrentPage(1);
    // Clear url query params without breaking history
    setSearchParams({});
  };

  const handleSort = (field: WithdrawalSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'requestedAt' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalItems = withdrawals.length;
  const paginatedWithdrawals = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return withdrawals.slice(startIndex, startIndex + PAGE_SIZE);
  }, [withdrawals, currentPage]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Status Summary Strip */}
      <WithdrawalStatusStrip
        summary={summary}
        selectedStatus={filters.status}
        onSelectStatus={handleSelectStatus}
      />

      {/* Filter Toolbar */}
      <WithdrawalFilterToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isFiltered={isFiltered}
      />

      {/* Table & Content */}
      <div className="space-y-0">
        <WithdrawalTable
          withdrawals={paginatedWithdrawals}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onView={(withdrawal) => setSelectedWithdrawal(withdrawal)}
          highlightedReference={highlightParam}
        />

        {/* Pagination */}
        <WithdrawalPagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Frontend-Only Quick View Drawer / Modal */}
      <WithdrawalQuickViewModal
        withdrawal={selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
      />
    </div>
  );
};
