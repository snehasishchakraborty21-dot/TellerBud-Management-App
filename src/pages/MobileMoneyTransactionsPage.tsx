import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  MobileMoneyTransaction,
  MobileMoneyKPIPeriods,
} from '../types/mobileMoney';
import { BusinessRecord } from '../types/business';
import { adminService } from '../services/mockAdminService';
import { businessService } from '../services/businessService';
import { getZambiaTodayString } from '../utils/dateUtils';

interface BusinessMobileMoneySummary {
  businessId: string;
  formattedBusinessId: string;
  businessName: string;
  city?: string;
  totalTransactions: number;
  deposit: number;
  withdrawal: number;
  purchase: number;
  completed: number;
  failedCancelled: number;
  serviceCharge: number;
}

type SortField =
  | 'businessName'
  | 'businessId'
  | 'totalTransactions'
  | 'deposit'
  | 'withdrawal'
  | 'purchase'
  | 'completed'
  | 'failedCancelled'
  | 'serviceCharge';

type SortDirection = 'asc' | 'desc';

/**
 * Ensures system-standard Business ID formatting: TB-BIZ-000001
 */
function formatToStandardBizId(rawId: string, index = 0): string {
  if (!rawId) return `TB-BIZ-${String(index + 1).padStart(6, '0')}`;
  if (rawId.startsWith('TB-BIZ-')) return rawId;
  const digits = rawId.match(/\d+/);
  if (digits) {
    const num = parseInt(digits[0], 10);
    return `TB-BIZ-${String(num).padStart(6, '0')}`;
  }
  return `TB-BIZ-${String(index + 1).padStart(6, '0')}`;
}

/**
 * Formats monetary amounts with thousands separators and two decimal places (without repeating ZMW prefix).
 */
function formatServiceChargeAmount(val: number): string {
  return Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const MobileMoneyTransactionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayStr = useMemo(() => getZambiaTodayString() || new Date().toISOString().split('T')[0], []);

  // Primary Data State
  const [allTransactions, setAllTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [kpis, setKpis] = useState<MobileMoneyKPIPeriods>({
    todayCount: 0,
    weekToDateCount: 0,
    monthToDateCount: 0,
    yearToDateCount: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Date Filter State
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [fromDate, setFromDate] = useState<string>(searchParams.get('from') || '');
  const [toDate, setToDate] = useState<string>(searchParams.get('to') || '');

  // Export State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('totalTransactions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load all data (Global scope for Super Admin)
  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [txnsRes, kpiData, bizList] = await Promise.all([
        adminService.getMobileMoneyTransactions({}),
        adminService.getMobileMoneyKPIs(), // Global across all businesses
        Promise.resolve(businessService.getBusinesses()),
      ]);

      setAllTransactions(txnsRes.items);
      setKpis(kpiData);
      setBusinesses(bizList);
    } catch (err) {
      console.error('Failed to load mobile money transactions data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribeAdmin = adminService.subscribe(() => loadData());
    const unsubscribeBiz = businessService.subscribe(() => loadData());

    return () => {
      unsubscribeAdmin();
      unsubscribeBiz();
    };
  }, [loadData]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    setSearchParams(params, { replace: true });
  }, [searchQuery, fromDate, toDate, setSearchParams]);

  // Filter transactions by date range
  const dateFilteredTransactions = useMemo(() => {
    if (!fromDate && !toDate) return allTransactions;
    return allTransactions.filter((txn) => {
      const txnDate = txn.postedAt ? txn.postedAt.split('T')[0] : '';
      if (!txnDate) return true;
      if (fromDate && txnDate < fromDate) return false;
      if (toDate && txnDate > toDate) return false;
      return true;
    });
  }, [allTransactions, fromDate, toDate]);

  // Build Business-wise Mobile Money Summaries with Service Charge
  const businessSummaries: BusinessMobileMoneySummary[] = useMemo(() => {
    const txnsByBizId = new Map<string, MobileMoneyTransaction[]>();
    const txnsByBizName = new Map<string, MobileMoneyTransaction[]>();

    dateFilteredTransactions.forEach((txn) => {
      if (txn.businessId) {
        const list = txnsByBizId.get(txn.businessId) || [];
        list.push(txn);
        txnsByBizId.set(txn.businessId, list);
      } else if (txn.businessName) {
        const list = txnsByBizName.get(txn.businessName.toLowerCase()) || [];
        list.push(txn);
        txnsByBizName.set(txn.businessName.toLowerCase(), list);
      }
    });

    const seenBizIds = new Set<string>();
    const summaries: BusinessMobileMoneySummary[] = [];

    businesses.forEach((biz, idx) => {
      const formattedBizId = formatToStandardBizId(biz.id, idx);
      if (seenBizIds.has(formattedBizId)) return;
      seenBizIds.add(formattedBizId);

      const byId = txnsByBizId.get(biz.id) || txnsByBizId.get(formattedBizId) || [];
      const byName = txnsByBizName.get(biz.name.toLowerCase()) || [];

      // Combine unique transactions for this business
      const seen = new Set<string>();
      const combinedTxns: MobileMoneyTransaction[] = [];
      [...byId, ...byName].forEach((t) => {
        if (!seen.has(t.id)) {
          seen.add(t.id);
          combinedTxns.push(t);
        }
      });

      let deposit = 0;
      let withdrawal = 0;
      let purchase = 0;
      let completed = 0;
      let failedCancelled = 0;
      let serviceCharge = 0;

      combinedTxns.forEach((t) => {
        // Transaction Types
        if (t.transactionType === 'Deposit') {
          deposit++;
        } else if (t.transactionType === 'Withdrawal') {
          withdrawal++;
        } else {
          purchase++;
        }

        // Status & Service Charge calculation
        // Exclude failed, cancelled, reversed, expired transactions
        if (t.status === 'Completed') {
          completed++;
          const fee = Number(t.reservationCharge || 0);
          if (fee > 0) {
            serviceCharge += fee;
          }
        } else if (t.status === 'Failed' || t.status === 'Cancelled') {
          failedCancelled++;
        }
      });

      // Total Transactions strictly equals deposit + withdrawal + purchase
      const totalTransactions = deposit + withdrawal + purchase;

      summaries.push({
        businessId: biz.id,
        formattedBusinessId: formattedBizId,
        businessName: biz.name,
        city: biz.city,
        totalTransactions,
        deposit,
        withdrawal,
        purchase,
        completed,
        failedCancelled,
        serviceCharge: Math.round(serviceCharge * 100) / 100,
      });
    });

    return summaries;
  }, [businesses, dateFilteredTransactions]);

  // Filter & Sort
  const filteredAndSortedBusinesses = useMemo(() => {
    let list = [...businessSummaries];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) ||
          b.formattedBusinessId.toLowerCase().includes(q) ||
          b.businessId.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'businessName':
          comparison = a.businessName.localeCompare(b.businessName);
          break;
        case 'businessId':
          comparison = a.formattedBusinessId.localeCompare(b.formattedBusinessId);
          break;
        case 'totalTransactions':
          comparison = a.totalTransactions - b.totalTransactions;
          break;
        case 'deposit':
          comparison = a.deposit - b.deposit;
          break;
        case 'withdrawal':
          comparison = a.withdrawal - b.withdrawal;
          break;
        case 'purchase':
          comparison = a.purchase - b.purchase;
          break;
        case 'completed':
          comparison = a.completed - b.completed;
          break;
        case 'failedCancelled':
          comparison = a.failedCancelled - b.failedCancelled;
          break;
        case 'serviceCharge':
          comparison = a.serviceCharge - b.serviceCharge;
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [businessSummaries, searchQuery, sortField, sortDirection]);

  // Global totals for reconciliation & export summary
  const totals = useMemo(() => {
    return filteredAndSortedBusinesses.reduce(
      (acc, curr) => ({
        totalTransactions: acc.totalTransactions + curr.totalTransactions,
        deposit: acc.deposit + curr.deposit,
        withdrawal: acc.withdrawal + curr.withdrawal,
        purchase: acc.purchase + curr.purchase,
        completed: acc.completed + curr.completed,
        failedCancelled: acc.failedCancelled + curr.failedCancelled,
        serviceCharge: acc.serviceCharge + curr.serviceCharge,
      }),
      {
        totalTransactions: 0,
        deposit: 0,
        withdrawal: 0,
        purchase: 0,
        completed: 0,
        failedCancelled: 0,
        serviceCharge: 0,
      }
    );
  }, [filteredAndSortedBusinesses]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBusinesses.length / pageSize));
  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedBusinesses.slice(start, start + pageSize);
  }, [filteredAndSortedBusinesses, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} className="text-gray-400 group-hover:text-gray-600 shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={11} className="text-[#0D93AA] shrink-0" />
    ) : (
      <ArrowDown size={11} className="text-[#0D93AA] shrink-0" />
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || fromDate !== '' || toDate !== '';

  // Export Data Preparation
  const prepareExportData = () => {
    const rows = filteredAndSortedBusinesses.map((b) => ({
      'Business Name': b.businessName + (b.city ? ` (${b.city})` : ''),
      'Business ID': b.formattedBusinessId,
      'Total': b.totalTransactions,
      'Deposit': b.deposit,
      'Withdrawal': b.withdrawal,
      'Purchase': b.purchase,
      'Completed': b.completed,
      'Failed/Cancelled': b.failedCancelled,
      'Service Charge (ZMW)': Number(b.serviceCharge.toFixed(2)),
    }));

    // Final total row reconciling combined Service Charge across all businesses
    rows.push({
      'Business Name': 'TOTAL',
      'Business ID': '—',
      'Total': totals.totalTransactions,
      'Deposit': totals.deposit,
      'Withdrawal': totals.withdrawal,
      'Purchase': totals.purchase,
      'Completed': totals.completed,
      'Failed/Cancelled': totals.failedCancelled,
      'Service Charge (ZMW)': Number(totals.serviceCharge.toFixed(2)),
    });

    return rows;
  };

  const handleExportCSV = () => {
    setShowExportMenu(false);
    const data = prepareExportData();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const val = (row as Record<string, string | number>)[header];
            const escaped = String(val ?? '').replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      ),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `TellerBud_Mobile_Money_Transactions_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    const data = prepareExportData();
    if (data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 32 }, // Business Name
      { wch: 18 }, // Business ID
      { wch: 12 }, // Total
      { wch: 12 }, // Deposit
      { wch: 14 }, // Withdrawal
      { wch: 12 }, // Purchase
      { wch: 14 }, // Completed
      { wch: 18 }, // Failed/Cancelled
      { wch: 22 }, // Service Charge (ZMW)
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mobile Money Transactions');
    XLSX.writeFile(wb, `TellerBud_Mobile_Money_Transactions_${todayStr}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 max-w-7xl mx-auto w-full">
      {/* 1. Top Global KPI Cards (One Row of 4 Equal Width Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
        {/* 1. TODAY'S TRANSACTIONS */}
        <div
          id="kpi-card-todays-transactions"
          className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2.5 shadow-sm h-[54px] sm:h-[56px] flex items-center justify-between gap-2 transition-all hover:border-gray-200"
        >
          <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
            Today’s Transactions
          </span>
          <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-[#102025] leading-none shrink-0">
            {isLoading ? '...' : (kpis?.todayCount ?? 0).toLocaleString()}
          </span>
        </div>

        {/* 2. WEEK TO DATE */}
        <div
          id="kpi-card-week-to-date"
          className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2 shadow-sm h-[54px] sm:h-[56px] flex flex-col justify-between transition-all hover:border-gray-200"
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
              Week to Date
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-[#102025] leading-none shrink-0">
              {isLoading ? '...' : (kpis?.weekToDateCount ?? 0).toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] sm:text-[9.5px] text-gray-400 font-normal leading-none tracking-tight">
            Week starts Monday
          </span>
        </div>

        {/* 3. MONTH TO DATE */}
        <div
          id="kpi-card-month-to-date"
          className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2.5 shadow-sm h-[54px] sm:h-[56px] flex items-center justify-between gap-2 transition-all hover:border-gray-200"
        >
          <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
            Month to Date
          </span>
          <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-[#102025] leading-none shrink-0">
            {isLoading ? '...' : (kpis?.monthToDateCount ?? 0).toLocaleString()}
          </span>
        </div>

        {/* 4. YEAR TO DATE */}
        <div
          id="kpi-card-year-to-date"
          className="bg-white rounded-xl border border-gray-100 px-3.5 sm:px-4 py-2.5 shadow-sm h-[54px] sm:h-[56px] flex items-center justify-between gap-2 transition-all hover:border-gray-200"
        >
          <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate">
            Year to Date
          </span>
          <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight text-[#102025] leading-none shrink-0">
            {isLoading ? '...' : (kpis?.yearToDateCount ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Compact Filter & Action Section (Single Horizontal Line) */}
      <div className="bg-white border border-gray-100 rounded-xl p-2.5 sm:p-3 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Left: Search & Date Ranges */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
            {/* Search Box */}
            <div className="relative w-full sm:w-[240px] lg:w-[260px] shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                id="biz-search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Business Name or Business ID..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 h-9"
                aria-label="Search Business Name or Business ID"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date Range: From Date & To Date */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                  From:
                </span>
                <input
                  id="filter-from-date"
                  type="date"
                  value={fromDate}
                  max={toDate || todayStr}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  title="From Date"
                  aria-label="From Date"
                  className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-[#0D93AA]/20 focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                  To:
                </span>
                <input
                  id="filter-to-date"
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  max={todayStr}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  title="To Date"
                  aria-label="To Date"
                  className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right: Clear Filters, Refresh & Export Dropdown */}
          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto shrink-0">
            {/* Clear Filters */}
            <button
              type="button"
              id="btn-clear-filters"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                hasActiveFilters
                  ? 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 cursor-pointer'
                  : 'text-gray-400 bg-transparent border-gray-200/60 opacity-50 cursor-not-allowed'
              }`}
              title={hasActiveFilters ? 'Reset applied filters' : 'No active filters'}
            >
              <X size={13} />
              <span>Clear Filters</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              id="btn-refresh-momo"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-9 px-3.5 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh mobile money transaction summaries"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
              />
              <span>Refresh</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                id="btn-export-momo"
                onClick={() => setShowExportMenu((prev) => !prev)}
                className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Export mobile money transactions"
              >
                <Download size={13} />
                <span>Export</span>
                <ChevronDown
                  size={12}
                  className={showExportMenu ? 'rotate-180 transition-transform' : 'transition-transform'}
                />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span>Export as Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText size={14} className="text-blue-600" />
                    <span>Export as CSV (.csv)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Business-Wise Mobile Money Summary Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
          <table className="w-full text-center border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs">
              <tr className="border-b border-gray-200 text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
                {/* 1. Business Name */}
                <th
                  scope="col"
                  onClick={() => handleSort('businessName')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group min-w-[220px] sm:min-w-[240px] w-[24%]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Business Name</span>
                    {renderSortIcon('businessName')}
                  </div>
                </th>

                {/* 2. Business ID */}
                <th
                  scope="col"
                  onClick={() => handleSort('businessId')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[110px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Business ID</span>
                    {renderSortIcon('businessId')}
                  </div>
                </th>

                {/* 3. Total */}
                <th
                  scope="col"
                  onClick={() => handleSort('totalTransactions')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[80px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total</span>
                    {renderSortIcon('totalTransactions')}
                  </div>
                </th>

                {/* 4. Deposit */}
                <th
                  scope="col"
                  onClick={() => handleSort('deposit')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[80px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Deposit</span>
                    {renderSortIcon('deposit')}
                  </div>
                </th>

                {/* 5. Withdrawal */}
                <th
                  scope="col"
                  onClick={() => handleSort('withdrawal')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[85px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Withdrawal</span>
                    {renderSortIcon('withdrawal')}
                  </div>
                </th>

                {/* 6. Purchase */}
                <th
                  scope="col"
                  onClick={() => handleSort('purchase')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[80px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Purchase</span>
                    {renderSortIcon('purchase')}
                  </div>
                </th>

                {/* 7. Completed */}
                <th
                  scope="col"
                  onClick={() => handleSort('completed')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[80px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Completed</span>
                    {renderSortIcon('completed')}
                  </div>
                </th>

                {/* 8. Failed/Cancelled */}
                <th
                  scope="col"
                  onClick={() => handleSort('failedCancelled')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[95px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Failed/Cancelled</span>
                    {renderSortIcon('failedCancelled')}
                  </div>
                </th>

                {/* 9. Service Charge (ZMW) */}
                <th
                  scope="col"
                  onClick={() => handleSort('serviceCharge')}
                  className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[145px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Service Charge (ZMW)</span>
                    {renderSortIcon('serviceCharge')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 align-middle">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-[#0D93AA]" />
                      <span className="text-xs">Loading business transactions summary...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 align-middle">
                    <Building2 size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600 text-sm">No businesses found</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {searchQuery
                        ? `No registered business matches "${searchQuery}"`
                        : 'No registered businesses available for the selected criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((biz, idx) => {
                  const hasServiceCharge = biz.serviceCharge > 0;

                  return (
                    <tr
                      key={`biz-row-${biz.formattedBusinessId || biz.businessId}-${idx}`}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* 1. Business Name: Line 1 = Full Name (single line), Line 2 = Location */}
                      <td className="py-3 px-3.5 text-center align-middle">
                        <div className="flex flex-col items-center justify-center text-center mx-auto">
                          <div className="font-semibold text-[#102025] text-xs sm:text-[13px] whitespace-nowrap leading-tight">
                            {biz.businessName}
                          </div>
                          {biz.city && (
                            <div className="text-[10.5px] sm:text-[11px] text-gray-400 mt-0.5 whitespace-nowrap leading-tight">
                              {biz.city}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 2. Business ID */}
                      <td className="py-3 px-3 text-center align-middle">
                        <span className="inline-block font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded border border-gray-200/80 whitespace-nowrap">
                          {biz.formattedBusinessId}
                        </span>
                      </td>

                      {/* 3. Total */}
                      <td className="py-3 px-3 text-center align-middle font-mono font-bold text-[#102025]">
                        {biz.totalTransactions > 0 ? (
                          biz.totalTransactions.toLocaleString()
                        ) : (
                          <span className="text-gray-400 font-normal">0</span>
                        )}
                      </td>

                      {/* 4. Deposit */}
                      <td className="py-3 px-3 text-center align-middle font-mono">
                        {biz.deposit > 0 ? (
                          <span className="font-bold text-[#0D93AA]">{biz.deposit.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">0</span>
                        )}
                      </td>

                      {/* 5. Withdrawal */}
                      <td className="py-3 px-3 text-center align-middle font-mono">
                        {biz.withdrawal > 0 ? (
                          <span className="font-bold text-blue-600">{biz.withdrawal.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">0</span>
                        )}
                      </td>

                      {/* 6. Purchase */}
                      <td className="py-3 px-3 text-center align-middle font-mono">
                        {biz.purchase > 0 ? (
                          <span className="font-bold text-purple-600">{biz.purchase.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">0</span>
                        )}
                      </td>

                      {/* 7. Completed */}
                      <td className="py-3 px-3 text-center align-middle font-mono">
                        {biz.completed > 0 ? (
                          <span className="font-bold text-emerald-600">{biz.completed.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">0</span>
                        )}
                      </td>

                      {/* 8. Failed/Cancelled */}
                      <td className="py-3 px-3 text-center align-middle font-mono">
                        {biz.failedCancelled > 0 ? (
                          <span className="font-bold text-red-600">{biz.failedCancelled.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">0</span>
                        )}
                      </td>

                      {/* 9. Service Charge (ZMW) */}
                      <td className="py-3 px-3 text-center align-middle font-mono">
                        {hasServiceCharge ? (
                          <span className="font-bold text-[#0D93AA] whitespace-nowrap">
                            {formatServiceChargeAmount(biz.serviceCharge)}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal whitespace-nowrap">
                            0.00
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination & Counter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-800">
              {filteredAndSortedBusinesses.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * pageSize, filteredAndSortedBusinesses.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-800">
              {filteredAndSortedBusinesses.length}
            </span>{' '}
            registered businesses
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
