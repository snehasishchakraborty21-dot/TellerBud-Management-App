import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getBusinessSummary,
  filterAndSortBusinesses,
} from '../data/mockBusinessData';
import {
  BusinessRecord,
  BusinessFilters,
  BusinessQuickFilter,
  BusinessSortField,
  BusinessSortDirection,
} from '../types/business';
import { businessService } from '../services/businessService';
import { BusinessKPICards } from '../components/businesses/BusinessKPICards';
import { BusinessFilterBar } from '../components/businesses/BusinessFilterBar';
import { BusinessTable } from '../components/businesses/BusinessTable';
import { BusinessPagination } from '../components/businesses/BusinessPagination';

const DEFAULT_FILTERS: BusinessFilters = {
  search: '',
  quickFilter: 'ALL',
  status: 'ALL',
  province: 'ALL',
  walletState: 'ALL',
  fromDate: '',
  toDate: '',
};

export const BusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as
    | {
        filters?: BusinessFilters;
        sortField?: BusinessSortField;
        sortDirection?: BusinessSortDirection;
        currentPage?: number;
      }
    | undefined;

  // Primary data state from businessService
  const [businesses, setBusinesses] = useState<BusinessRecord[]>(() =>
    businessService.getBusinesses()
  );
  const [loading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state (restored if returning from details)
  const [filters, setFilters] = useState<BusinessFilters>(
    navState?.filters || DEFAULT_FILTERS
  );

  // Sorting state (restored if returning from details)
  const [sortField, setSortField] = useState<BusinessSortField>(
    navState?.sortField || 'name'
  );
  const [sortDirection, setSortDirection] = useState<BusinessSortDirection>(
    navState?.sortDirection || 'asc'
  );

  // Pagination state (restored if returning from details)
  const [currentPage, setCurrentPage] = useState(navState?.currentPage || 1);
  const [pageSize, setPageSize] = useState(10);

  // Subscribe to real-time business updates
  useEffect(() => {
    const update = () => {
      setBusinesses(businessService.getBusinesses());
    };
    const unsub = businessService.subscribe(update);
    return () => unsub();
  }, []);

  // Derive KPI summary metrics across all business records
  const summary = useMemo(() => {
    return getBusinessSummary(businesses);
  }, [businesses]);

  // Handle KPI card selection
  const handleSelectQuickFilter = useCallback((quickFilter: BusinessQuickFilter) => {
    setFilters((prev) => {
      if (quickFilter === 'ALL') {
        return { ...prev, quickFilter: 'ALL', status: 'ALL' };
      }
      if (quickFilter === 'ACTIVE') {
        return {
          ...prev,
          quickFilter: prev.quickFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE',
          status: prev.quickFilter === 'ACTIVE' ? 'ALL' : 'Active',
        };
      }
      // For AGENTS, ONLINE, PENDING_TOPUPS
      return {
        ...prev,
        quickFilter: prev.quickFilter === quickFilter ? 'ALL' : quickFilter,
      };
    });
    setCurrentPage(1);
  }, []);

  // Update specific filter property
  const handleFilterChange = useCallback(
    <K extends keyof BusinessFilters>(key: K, value: BusinessFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'status') {
          if (value === 'Active') {
            next.quickFilter = 'ACTIVE';
          } else if (next.quickFilter === 'ACTIVE' && value !== 'Active') {
            next.quickFilter = 'ALL';
          }
        }
        return next;
      });
      setCurrentPage(1);
    },
    []
  );

  // Reset all filters
  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setError(null);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, []);

  // Sorting handler
  const handleSort = useCallback(
    (field: BusinessSortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    },
    [sortField]
  );

  // Navigate to dedicated full-width Business Details page
  const handleOpenDetails = useCallback(
    (business: BusinessRecord) => {
      navigate(`/super-admin/people/businesses/${business.id}`, {
        state: {
          from: location.pathname + location.search,
          filters,
          sortField,
          sortDirection,
          currentPage,
        },
      });
    },
    [navigate, location.pathname, location.search, filters, sortField, sortDirection, currentPage]
  );

  // Determine if any non-default filter is currently active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search.trim() !== '' ||
      filters.quickFilter !== 'ALL' ||
      filters.status !== 'ALL' ||
      filters.province !== 'ALL' ||
      filters.walletState !== 'ALL' ||
      filters.fromDate !== '' ||
      filters.toDate !== ''
    );
  }, [filters]);

  // Apply filtering and sorting
  const filteredBusinesses = useMemo(() => {
    return filterAndSortBusinesses(businesses, filters, {
      field: sortField,
      direction: sortDirection,
    });
  }, [businesses, filters, sortField, sortDirection]);

  // Paginated businesses
  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBusinesses.slice(start, start + pageSize);
  }, [filteredBusinesses, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto pb-16">
      {/* 1. KPI Cards Section (Interactive, no subtitles) */}
      <section aria-label="Business Metrics Summary">
        <BusinessKPICards
          summary={summary}
          activeFilter={filters.quickFilter}
          statusFilter={filters.status}
          onSelectFilter={handleSelectQuickFilter}
        />
      </section>

      {/* 2. Filter Bar Section */}
      <section aria-label="Business Filters">
        <BusinessFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          isFiltered={hasActiveFilters}
          isRefreshing={isRefreshing}
        />
      </section>

      {/* 3. Businesses Table Section */}
      <section aria-label="Businesses Table">
        <BusinessTable
          businesses={paginatedBusinesses}
          loading={loading}
          error={error}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewDetails={handleOpenDetails}
          onRetry={handleRefresh}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleClearFilters}
        />
      </section>

      {/* 4. Pagination Section */}
      <section aria-label="Pagination">
        <BusinessPagination
          currentPage={currentPage}
          totalItems={filteredBusinesses.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </div>
  );
};
