import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sanitizeDateParam } from '../utils/dateUtils';
import { adminService } from '../services/adminService';
import {
  MobileMoneyTransaction,
  MobileMoneyFilters,
  MobileMoneySortField,
  MobileMoneySortDirection,
  MobileMoneyStatus,
  ServiceChannel,
  MobileMoneyKPIPeriods,
} from '../types/mobileMoney';
import { MobileMoneySummaryCards } from '../components/mobile-money/MobileMoneySummaryCards';
import { MobileMoneyFilterBar } from '../components/mobile-money/MobileMoneyFilterBar';
import { BusinessOwnerMobileMoneyTable } from '../components/mobile-money/BusinessOwnerMobileMoneyTable';
import { MobileMoneyPagination } from '../components/mobile-money/MobileMoneyPagination';

const DEFAULT_FILTERS: MobileMoneyFilters = {
  search: '',
  serviceChannel: 'ALL',
  transactionType: 'ALL',
  vendor: 'ALL',
  status: 'ALL',
  business: 'ALL',
};

export const BusinessOwnerMobileMoneyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Date synchronization with URL (?date=YYYY-MM-DD)
  const rawDateParam = searchParams.get('date');
  const selectedDate = sanitizeDateParam(rawDateParam);

  // Normalize URL on load if date param is missing or invalid/future
  useEffect(() => {
    if (rawDateParam !== selectedDate) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('date', selectedDate);
      setSearchParams(nextParams, { replace: true });
    }
  }, [rawDateParam, selectedDate, searchParams, setSearchParams]);

  // Strict backend-level isolation for Business Owner
  const businessScope =
    currentUser?.businessName || currentUser?.businessId || 'Lusaka Central Express Agency';

  // Read saved session state if returning from detail page
  const savedFiltersRaw = sessionStorage.getItem('bo_mmt_filters');
  const savedPageRaw = sessionStorage.getItem('bo_mmt_page');
  const savedSortRaw = sessionStorage.getItem('bo_mmt_sort');

  const initialFilters: MobileMoneyFilters = savedFiltersRaw
    ? { ...DEFAULT_FILTERS, ...JSON.parse(savedFiltersRaw) }
    : {
        ...DEFAULT_FILTERS,
        status: (searchParams.get('status') as MobileMoneyStatus | 'Cancelled_Failed') || 'ALL',
        serviceChannel: (searchParams.get('channel') as ServiceChannel) || 'ALL',
      };

  const initialPage = savedPageRaw ? Math.max(1, parseInt(savedPageRaw, 10)) : 1;
  const initialSort = savedSortRaw ? JSON.parse(savedSortRaw) : { field: 'postedAt', direction: 'desc' };

  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [kpis, setKpis] = useState<MobileMoneyKPIPeriods>({
    todayCount: 0,
    weekToDateCount: 0,
    monthToDateCount: 0,
    yearToDateCount: 0,
  });
  const [isKpiLoading, setIsKpiLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<MobileMoneyFilters>(initialFilters);
  const [sortField, setSortField] = useState<MobileMoneySortField>(initialSort.field || 'postedAt');
  const [sortDirection, setSortDirection] = useState<MobileMoneySortDirection>(initialSort.direction || 'desc');
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [scrollRestored, setScrollRestored] = useState<boolean>(false);

  // Load KPI periods independently (scoped strictly to this business)
  const loadKPIs = useCallback(async () => {
    try {
      setIsKpiLoading(true);
      const kpiData = await adminService.getMobileMoneyKPIs(businessScope);
      setKpis(kpiData);
    } catch (err) {
      console.error('Failed to load mobile money period KPIs for business owner:', err);
    } finally {
      setIsKpiLoading(false);
    }
  }, [businessScope]);

  // Load table data (scoped strictly to this business)
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getMobileMoneyTransactions(
        {
          ...filters,
          selectedDate,
        },
        { field: sortField, direction: sortDirection },
        businessScope
      );

      setTransactions(res.items);
    } catch (err) {
      console.error('Failed to load mobile money transactions for business owner:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, selectedDate, sortField, sortDirection, businessScope]);

  useEffect(() => {
    loadData();
    loadKPIs();
    const unsubscribe = adminService.subscribe(() => {
      loadData();
      loadKPIs();
    });
    return () => unsubscribe();
  }, [loadData, loadKPIs]);

  // Restore scroll position after initial table render
  useEffect(() => {
    if (!isLoading && !scrollRestored) {
      const savedScroll = sessionStorage.getItem('bo_mmt_scroll_pos');
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo({
            top: Number(savedScroll),
            behavior: 'instant' as ScrollBehavior,
          });
          setScrollRestored(true);
        }, 60);
      } else {
        setScrollRestored(true);
      }
    }
  }, [isLoading, scrollRestored]);

  // Filter change handler
  const handleFilterChange = (updates: Partial<MobileMoneyFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      sessionStorage.setItem('bo_mmt_filters', JSON.stringify(next));

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('date', selectedDate);
      if (updates.status !== undefined) {
        if (updates.status === 'ALL') nextParams.delete('status');
        else nextParams.set('status', updates.status);
      }
      if (updates.serviceChannel !== undefined) {
        if (updates.serviceChannel === 'ALL') nextParams.delete('channel');
        else nextParams.set('channel', updates.serviceChannel);
      }
      setSearchParams(nextParams, { replace: true });
      return next;
    });
    setCurrentPage(1);
    sessionStorage.setItem('bo_mmt_page', '1');
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    sessionStorage.setItem('bo_mmt_filters', JSON.stringify(DEFAULT_FILTERS));
    sessionStorage.setItem('bo_mmt_page', '1');

    const nextParams = new URLSearchParams();
    nextParams.set('date', selectedDate);
    setSearchParams(nextParams, { replace: true });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    loadKPIs();
  };

  const handleSort = (field: MobileMoneySortField) => {
    let nextDir: MobileMoneySortDirection = 'desc';
    if (sortField === field) {
      nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(nextDir);
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    sessionStorage.setItem('bo_mmt_sort', JSON.stringify({ field, direction: nextDir }));
    setCurrentPage(1);
    sessionStorage.setItem('bo_mmt_page', '1');
  };

  const handleRowClick = (tx: MobileMoneyTransaction) => {
    // Preserve current scroll position, active page, and filters
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    sessionStorage.setItem('bo_mmt_scroll_pos', String(scrollY));
    sessionStorage.setItem('bo_mmt_page', String(currentPage));
    sessionStorage.setItem('bo_mmt_filters', JSON.stringify(filters));
    sessionStorage.setItem('bo_mmt_sort', JSON.stringify({ field: sortField, direction: sortDirection }));

    navigate(`/business-owner/mobile-money-transactions/${tx.reference}`);
  };

  const isFiltered =
    filters.search.trim() !== '' ||
    filters.serviceChannel !== 'ALL' ||
    filters.transactionType !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.business !== 'ALL';

  // Pagination calculation
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 pb-12">
      {/* 1. Summary Cards: Exactly 5 cards row */}
      <MobileMoneySummaryCards kpis={kpis} isLoading={isKpiLoading} />

      {/* 2. Filter Bar */}
      <MobileMoneyFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        onRefresh={handleRefresh}
        isFiltered={isFiltered}
        isRefreshing={isRefreshing}
        isSuperAdmin={false}
      />

      {/* 3. Transaction Listing Table: 9 approved columns in order */}
      <div className="space-y-4">
        <BusinessOwnerMobileMoneyTable
          transactions={paginatedTransactions}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={handleRowClick}
        />

        {/* 4. Pagination */}
        <MobileMoneyPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            sessionStorage.setItem('bo_mmt_page', String(page));
          }}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
            sessionStorage.setItem('bo_mmt_page', '1');
          }}
        />
      </div>
    </div>
  );
};
