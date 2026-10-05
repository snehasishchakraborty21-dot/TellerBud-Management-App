import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { adminService } from '../services/mockAdminService';
import {
  CustomerWithdrawal,
  WithdrawalStatus,
  WithdrawalNetwork,
} from '../types/admin';
import {
  CustomerWithdrawalKpiCards,
  WithdrawalKpiFilter,
} from '../components/withdrawals/CustomerWithdrawalKpiCards';
import {
  CustomerWithdrawalFilterBar,
  CustomerWithdrawalFiltersState,
} from '../components/withdrawals/CustomerWithdrawalFilterBar';
import {
  WithdrawalTable,
  CustomerWithdrawalSortField,
  CustomerWithdrawalSortDirection,
} from '../components/withdrawals/WithdrawalTable';
import { WithdrawalPagination } from '../components/withdrawals/WithdrawalPagination';

const PAGE_SIZE = 10;

export const CustomerWithdrawalsPage: React.FC = () => {
  // All system withdrawals for accurate calculation
  const [allWithdrawals, setAllWithdrawals] = useState<CustomerWithdrawal[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter States (Search box removed from filter section)
  const [filters, setFilters] = useState<CustomerWithdrawalFiltersState>({
    provider: 'ALL',
    status: 'ALL',
    submittedFrom: '',
    submittedTo: '',
  });

  const [activeKpiFilter, setActiveKpiFilter] = useState<WithdrawalKpiFilter>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<CustomerWithdrawalSortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<CustomerWithdrawalSortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Load withdrawal records
  const loadData = useCallback(async () => {
    try {
      const response = await adminService.getCustomerWithdrawals();
      setAllWithdrawals(response.items);
    } catch (err) {
      console.error('Failed to load withdrawals', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = adminService.subscribe(loadData);
    return () => unsubscribe();
  }, [loadData]);

  // Filter withdrawals by date range for KPI calculations
  const dateFilteredWithdrawals = useMemo(() => {
    return allWithdrawals.filter((w) => {
      const reqDate = w.requestedAt ? w.requestedAt.split('T')[0] : '';
      if (filters.submittedFrom && reqDate && reqDate < filters.submittedFrom) return false;
      if (filters.submittedTo && reqDate && reqDate > filters.submittedTo) return false;
      return true;
    });
  }, [allWithdrawals, filters.submittedFrom, filters.submittedTo]);

  // KPI Calculations across the date-filtered dataset
  const kpiMetrics = useMemo(() => {
    const totalCount = dateFilteredWithdrawals.length;
    const pendingReviewCount = dateFilteredWithdrawals.filter(
      (w) => w.status === 'Pending Review'
    ).length;

    // Reserved Amount: Total funds currently reserved for Pending Review, Approved and Processing withdrawals
    const reservedAmount = dateFilteredWithdrawals.reduce((sum, w) => {
      if (
        w.status === 'Pending Review' ||
        w.status === 'Approved' ||
        w.status === 'Processing'
      ) {
        return sum + (w.reservedFunds ?? w.amount);
      }
      return sum;
    }, 0);

    const processingCount = dateFilteredWithdrawals.filter(
      (w) => w.status === 'Processing'
    ).length;

    const paidAmount = dateFilteredWithdrawals.reduce((sum, w) => {
      if (w.status === 'Paid') {
        return sum + w.amount;
      }
      return sum;
    }, 0);

    return {
      totalCount,
      pendingReviewCount,
      reservedAmount,
      processingCount,
      paidAmount,
    };
  }, [dateFilteredWithdrawals]);

  // Handle KPI Card Selection
  const handleSelectKpiFilter = (filter: WithdrawalKpiFilter) => {
    setActiveKpiFilter(filter);
    setCurrentPage(1);

    if (filter === 'ALL') {
      setFilters((prev) => ({ ...prev, status: 'ALL' }));
    } else if (filter === 'PENDING_REVIEW') {
      setFilters((prev) => ({ ...prev, status: 'Pending Review' }));
    } else if (filter === 'PROCESSING') {
      setFilters((prev) => ({ ...prev, status: 'Processing' }));
    } else if (filter === 'PAID') {
      setFilters((prev) => ({ ...prev, status: 'Paid' }));
    } else if (filter === 'RESERVED') {
      // Reserved filter applies across Pending Review, Approved and Processing
      setFilters((prev) => ({ ...prev, status: 'ALL' }));
    }
  };

  // Handle Filter Toolbar Changes
  const handleFilterChange = (changes: Partial<CustomerWithdrawalFiltersState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...changes };
      // Sync KPI filter when status changes manually
      if (changes.status !== undefined) {
        if (changes.status === 'Pending Review') {
          setActiveKpiFilter('PENDING_REVIEW');
        } else if (changes.status === 'Processing') {
          setActiveKpiFilter('PROCESSING');
        } else if (changes.status === 'Paid') {
          setActiveKpiFilter('PAID');
        } else if (changes.status === 'ALL') {
          setActiveKpiFilter('ALL');
        } else {
          setActiveKpiFilter('ALL');
        }
      }
      return next;
    });
    setCurrentPage(1);
  };

  // Clear Filters Handler
  const handleClearFilters = () => {
    setFilters({
      provider: 'ALL',
      status: 'ALL',
      submittedFrom: '',
      submittedTo: '',
    });
    setActiveKpiFilter('ALL');
    setCurrentPage(1);
  };

  // Refresh Handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  // Check if any filter differs from default
  const hasActiveFilters = useMemo(() => {
    return (
      filters.provider !== 'ALL' ||
      filters.status !== 'ALL' ||
      activeKpiFilter !== 'ALL' ||
      Boolean(filters.submittedFrom) ||
      Boolean(filters.submittedTo)
    );
  }, [filters, activeKpiFilter]);

  // Handle Sorting
  const handleSort = (field: CustomerWithdrawalSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'requestedAt' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  // Filter and Sort Rows
  const filteredAndSortedWithdrawals = useMemo(() => {
    let result = [...dateFilteredWithdrawals];

    // 1. Provider filter
    if (filters.provider !== 'ALL') {
      result = result.filter((w) => w.network === filters.provider);
    }

    // 2. Status filter
    if (filters.status !== 'ALL') {
      result = result.filter((w) => w.status === filters.status);
    }

    // 3. KPI Reserved Amount filter
    if (activeKpiFilter === 'RESERVED' && filters.status === 'ALL') {
      result = result.filter(
        (w) =>
          w.status === 'Pending Review' ||
          w.status === 'Approved' ||
          w.status === 'Processing'
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'requestedAt') {
        comparison =
          new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      } else if (sortField === 'customer') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortField === 'provider') {
        comparison = a.network.localeCompare(b.network);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [dateFilteredWithdrawals, filters.provider, filters.status, activeKpiFilter, sortField, sortDirection]);

  // Paginated Rows
  const totalFilteredItems = filteredAndSortedWithdrawals.length;
  const paginatedWithdrawals = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedWithdrawals.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedWithdrawals, currentPage]);

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto pb-16">
      {/* 5 Clickable KPI Cards */}
      <CustomerWithdrawalKpiCards
        totalCount={kpiMetrics.totalCount}
        pendingReviewCount={kpiMetrics.pendingReviewCount}
        reservedAmount={kpiMetrics.reservedAmount}
        processingCount={kpiMetrics.processingCount}
        paidAmount={kpiMetrics.paidAmount}
        activeKpiFilter={activeKpiFilter}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* Filter Container */}
      <CustomerWithdrawalFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        hasActiveFilters={hasActiveFilters}
        isRefreshing={isRefreshing}
        withdrawalsToExport={filteredAndSortedWithdrawals}
      />

      {/* Table & Pagination */}
      <div className="space-y-0">
        <WithdrawalTable
          withdrawals={paginatedWithdrawals}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        {totalFilteredItems > 0 && (
          <WithdrawalPagination
            currentPage={currentPage}
            totalItems={totalFilteredItems}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
};
