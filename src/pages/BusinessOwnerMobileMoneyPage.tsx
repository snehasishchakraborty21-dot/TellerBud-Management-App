import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBusinessOwnerDate } from '../context/BusinessOwnerDateContext';
import { isValidDateString } from '../utils/dateUtils';
import { adminService } from '../services/adminService';
import {
  MobileMoneyTransaction,
  MobileMoneySortField,
  MobileMoneySortDirection,
  MobileMoneyKPIPeriods,
  MobileMoneyFilters,
} from '../types/mobileMoney';
import { MobileMoneySummaryCards } from '../components/mobile-money/MobileMoneySummaryCards';
import { BusinessOwnerMobileMoneyFilterBar } from '../components/mobile-money/BusinessOwnerMobileMoneyFilterBar';
import { BusinessOwnerMobileMoneyTable } from '../components/mobile-money/BusinessOwnerMobileMoneyTable';
import { MobileMoneyPagination } from '../components/mobile-money/MobileMoneyPagination';
import { exportMobileMoneyTransactionsToExcel } from '../utils/mobileMoneyExport';

export const BusinessOwnerMobileMoneyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    selectedDate,
    setSelectedDate,
    customDateRange,
    setCustomDateRange,
    isCustomRange,
  } = useBusinessOwnerDate();

  // Strict backend-level isolation for Business Owner
  const businessScope =
    currentUser?.businessName || currentUser?.businessId || 'Lusaka Central Express Agency';

  // Read saved session state or URL parameters for date range (?from=YYYY-MM-DD&to=YYYY-MM-DD)
  const rawFromParam = searchParams.get('from');
  const rawToParam = searchParams.get('to');
  const savedDateFrom = sessionStorage.getItem('bo_mmt_date_from');
  const savedDateTo = sessionStorage.getItem('bo_mmt_date_to');

  const initialDateFrom = isValidDateString(rawFromParam)
    ? rawFromParam!
    : isValidDateString(savedDateFrom)
    ? savedDateFrom!
    : selectedDate;

  const initialDateTo = isValidDateString(rawToParam)
    ? rawToParam!
    : isValidDateString(savedDateTo)
    ? savedDateTo!
    : selectedDate;

  const savedPageRaw = sessionStorage.getItem('bo_mmt_page');
  const savedPageSizeRaw = sessionStorage.getItem('bo_mmt_page_size');
  const savedSortRaw = sessionStorage.getItem('bo_mmt_sort');

  const initialPage = savedPageRaw ? Math.max(1, parseInt(savedPageRaw, 10)) : 1;
  const initialPageSize = savedPageSizeRaw ? Math.max(5, parseInt(savedPageSizeRaw, 10)) : 10;
  const initialSort = savedSortRaw ? JSON.parse(savedSortRaw) : { field: 'postedAt', direction: 'desc' };

  const [dateFrom, setDateFrom] = useState<string | undefined>(initialDateFrom);
  const [dateTo, setDateTo] = useState<string | undefined>(initialDateTo);

  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [kpis, setKpis] = useState<MobileMoneyKPIPeriods>({
    todayCount: 0,
    weekToDateCount: 0,
    monthToDateCount: 0,
    yearToDateCount: 0,
  });
  const [isKpiLoading, setIsKpiLoading] = useState<boolean>(true);

  const [sortField, setSortField] = useState<MobileMoneySortField>(initialSort.field || 'postedAt');
  const [sortDirection, setSortDirection] = useState<MobileMoneySortDirection>(initialSort.direction || 'desc');
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [scrollRestored, setScrollRestored] = useState<boolean>(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize internal dates when header selected date or customDateRange changes
  useEffect(() => {
    if (isCustomRange && customDateRange) {
      setDateFrom(customDateRange.from);
      setDateTo(customDateRange.to);
    } else if (selectedDate) {
      setDateFrom(selectedDate);
      setDateTo(selectedDate);
    }
  }, [selectedDate, isCustomRange, customDateRange]);

  // Load KPI periods independently (scoped strictly to this business and targeted operational date)
  const loadKPIs = useCallback(async () => {
    try {
      setIsKpiLoading(true);
      const kpiData = await adminService.getMobileMoneyKPIs(businessScope, selectedDate);
      setKpis(kpiData);
    } catch (err) {
      console.error('Failed to load mobile money period KPIs for business owner:', err);
    } finally {
      setIsKpiLoading(false);
    }
  }, [businessScope, selectedDate]);

  // Load table data (scoped strictly to this business and active date range)
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryFilters: Partial<MobileMoneyFilters> = {};

      // When both dates are selected, filter strictly by range (CAT)
      // When no dates are selected, queryFilters has no date constraint -> normal latest transaction listing
      if (dateFrom && dateTo) {
        queryFilters.dateFrom = dateFrom;
        queryFilters.dateTo = dateTo;
      }

      const res = await adminService.getMobileMoneyTransactions(
        queryFilters,
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
  }, [dateFrom, dateTo, sortField, sortDirection, businessScope]);

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
        const timer = setTimeout(() => {
          if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = Number(savedScroll);
          }
          setScrollRestored(true);
        }, 60);
        return () => clearTimeout(timer);
      } else {
        setScrollRestored(true);
      }
    }
  }, [isLoading, scrollRestored]);

  // Handle date range change from toolbar
  const handleDateRangeChange = (newFrom?: string, newTo?: string) => {
    setDateFrom(newFrom);
    setDateTo(newTo);
    setCurrentPage(1);
    sessionStorage.setItem('bo_mmt_page', '1');

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('date'); // remove legacy single date param

    if (newFrom && newTo) {
      sessionStorage.setItem('bo_mmt_date_from', newFrom);
      sessionStorage.setItem('bo_mmt_date_to', newTo);
      nextParams.set('from', newFrom);
      nextParams.set('to', newTo);

      if (newFrom === newTo) {
        // Single date report: sync to header date and clear custom range
        setSelectedDate(newFrom);
        setCustomDateRange(null);
      } else {
        // Multi-day custom date range: update header to "Custom Date Range"
        setCustomDateRange({ from: newFrom, to: newTo });
      }
    } else {
      sessionStorage.removeItem('bo_mmt_date_from');
      sessionStorage.removeItem('bo_mmt_date_to');
      nextParams.delete('from');
      nextParams.delete('to');
      setCustomDateRange(null);
    }

    setSearchParams(nextParams, { replace: true });
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  // Refresh handler: refreshes within active date range if selected, or normal latest list if not
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    loadKPIs();
  };

  // Export handler: exports transactions within selected date range as .xlsx
  const handleExport = () => {
    if (!dateFrom || !dateTo) return;
    try {
      setIsExporting(true);
      exportMobileMoneyTransactionsToExcel(transactions, dateFrom, dateTo, businessScope);
    } catch (err) {
      console.error('Failed to export transactions to Excel:', err);
    } finally {
      setIsExporting(false);
    }
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
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  const handleRowClick = (tx: MobileMoneyTransaction) => {
    // Preserve current scroll position, active page, pageSize, and active date range
    const scrollY = tableContainerRef.current?.scrollTop ?? 0;
    sessionStorage.setItem('bo_mmt_scroll_pos', String(scrollY));
    sessionStorage.setItem('bo_mmt_page', String(currentPage));
    sessionStorage.setItem('bo_mmt_page_size', String(pageSize));
    if (dateFrom && dateTo) {
      sessionStorage.setItem('bo_mmt_date_from', dateFrom);
      sessionStorage.setItem('bo_mmt_date_to', dateTo);
    } else {
      sessionStorage.removeItem('bo_mmt_date_from');
      sessionStorage.removeItem('bo_mmt_date_to');
    }
    sessionStorage.setItem('bo_mmt_sort', JSON.stringify({ field: sortField, direction: sortDirection }));

    navigate(`/business-owner/mobile-money-transactions/${tx.reference}`);
  };

  // Pagination calculation
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4">
      {/* 1. Summary Cards: Exactly 5 cards row (Frozen upper section) */}
      <div className="shrink-0">
        <MobileMoneySummaryCards kpis={kpis} isLoading={isKpiLoading} selectedDate={selectedDate} />
      </div>

      {/* 2. Filter & Action Bar: Date Range Selector & Export (Frozen upper section) */}
      <div className="shrink-0">
        <BusinessOwnerMobileMoneyFilterBar
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isExporting={isExporting}
        />
      </div>

      {/* 3. Transaction Card: Flexible container with Sticky Header, Scrollable Rows, and Fixed Pagination */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Scrollable Transaction Listing Table */}
        <BusinessOwnerMobileMoneyTable
          transactions={paginatedTransactions}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={handleRowClick}
          onView={handleRowClick}
          containerRef={tableContainerRef}
        />

        {/* 4. Fixed Pagination Area at Bottom */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-3 sm:px-4 py-2.5">
          <MobileMoneyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            hideBorder={true}
            onPageChange={(page) => {
              setCurrentPage(page);
              sessionStorage.setItem('bo_mmt_page', String(page));
              if (tableContainerRef.current) {
                tableContainerRef.current.scrollTop = 0;
              }
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
              sessionStorage.setItem('bo_mmt_page', '1');
              sessionStorage.setItem('bo_mmt_page_size', String(newSize));
              if (tableContainerRef.current) {
                tableContainerRef.current.scrollTop = 0;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
