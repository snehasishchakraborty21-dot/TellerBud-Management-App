import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  RotateCw,
  RotateCcw,
  Download,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  Users,
  X,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import {
  MOCK_ALL_TRANSACTIONS,
  ALL_TRANSACTIONS_SUMMARY,
  AllTransactionRecord,
  TransactionSource,
} from '../data/mockAllTransactionsData';
import { MOCK_BUSINESSES } from '../data/mockBusinessData';
import { TransactionStatusBadge } from '../components/transactions/TransactionStatusBadge';
import { formatZmwListingAmount, formatZMW } from '../utils/formatters';

const getVendorDisplayName = (vendorOrProvider: string): string => {
  if (vendorOrProvider === 'MTN Mobile Money' || vendorOrProvider === 'MTN') return 'MTN Mobile Money';
  if (vendorOrProvider === 'Airtel Money' || vendorOrProvider === 'Airtel') return 'Airtel Money';
  if (vendorOrProvider === 'Zamtel') return 'Zamtel';
  if (vendorOrProvider === 'Zanaco') return 'Zanaco';
  if (vendorOrProvider === 'FNB') return 'FNB';
  if (vendorOrProvider === 'INDO' || vendorOrProvider === 'Indo-Zambia Bank') return 'INDO';
  if (vendorOrProvider === 'Stanbic') return 'Stanbic';
  if (vendorOrProvider === 'Access' || vendorOrProvider === 'Access Bank') return 'Access Bank';
  if (vendorOrProvider === 'TellerBud Ledger' || vendorOrProvider === 'TellerBud') return 'TellerBud Ledger';
  return vendorOrProvider;
};

interface BusinessTransactionSummary {
  businessId: string;
  businessName: string;
  ownerName: string;
  ownerPhone: string;
  city: string;
  province: string;
  associatedAgents: number;
  agentsOnline: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  lastActivity: string;
  recentTxRef?: string;
  transactions: AllTransactionRecord[];
}

export const AllTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();

  // Primary Data State
  const [transactions, setTransactions] = useState<AllTransactionRecord[]>(MOCK_ALL_TRANSACTIONS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected Business for Detailed Transaction Drawer
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessTransactionSummary | null>(null);

  const parseStatusParam = (param: string | null): string => {
    if (!param) return 'ALL';
    if (param.toLowerCase() === 'pending confirmation' || param.toLowerCase() === 'pending_confirmation') {
      return 'Pending Confirmation';
    }
    if (param.toLowerCase() === 'pending') {
      return 'Pending';
    }
    return param;
  };

  // Filter States (Clean 1-line controls: Type, Vendor, Status, From Date, To Date)
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>(() => parseStatusParam(searchParams.get('status')));
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(parseStatusParam(status));
    }
  }, [searchParams]);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return (
      typeFilter !== 'ALL' ||
      vendorFilter !== 'ALL' ||
      statusFilter !== 'ALL' ||
      fromDate !== '' ||
      toDate !== ''
    );
  }, [typeFilter, vendorFilter, statusFilter, fromDate, toDate]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Filter Handling
  const handleClearFilters = () => {
    setTypeFilter('ALL');
    setVendorFilter('ALL');
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    tableContainerRef.current?.scrollTo({ top: 0 });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTransactions([...MOCK_ALL_TRANSACTIONS]);
      setIsRefreshing(false);
      tableContainerRef.current?.scrollTo({ top: 0 });
    }, 350);
  };

  // Filter individual transactions first based on active filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Transaction Type
      if (typeFilter !== 'ALL' && tx.transactionType !== typeFilter) {
        return false;
      }

      // 2. Vendor
      if (vendorFilter !== 'ALL') {
        if (vendorFilter === 'Access' || vendorFilter === 'Access Bank') {
          if ((tx.provider as string) !== 'Access' && (tx.provider as string) !== 'Access Bank') return false;
        } else if (tx.provider !== vendorFilter) {
          return false;
        }
      }

      // 3. Status
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
        return false;
      }

      // 4. Date Range
      if (fromDate && tx.rawDate < fromDate) {
        return false;
      }
      if (toDate && tx.rawDate > toDate) {
        return false;
      }

      return true;
    });
  }, [transactions, typeFilter, vendorFilter, statusFilter, fromDate, toDate]);

  // Aggregate Transactions by Registered Business
  const businessSummaries = useMemo<BusinessTransactionSummary[]>(() => {
    // Map of normalized business names / IDs to registered business records
    return MOCK_BUSINESSES.map((biz) => {
      // Find all matching transactions for this business
      const bizTransactions = filteredTransactions.filter((tx) => {
        if (tx.businessId && (tx.businessId === biz.id || tx.businessId === biz.id.replace('TB-BIZ-', 'BIZ-LUS-').slice(0, 11))) {
          return true;
        }
        if (tx.businessName && tx.businessName.toLowerCase() === biz.name.toLowerCase()) {
          return true;
        }
        return false;
      });

      const totalVolume = bizTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const completed = bizTransactions.filter((tx) => tx.status === 'Completed' || tx.status === 'Paid').length;
      const pending = bizTransactions.filter((tx) =>
        tx.status.includes('Pending') ||
        tx.status === 'Processing' ||
        tx.status === 'Finding an Agent' ||
        tx.status === 'Agent Confirmed' ||
        tx.status === 'Ready for Pickup'
      ).length;
      const failed = bizTransactions.filter((tx) =>
        tx.status === 'Failed' ||
        tx.status === 'Cancelled' ||
        tx.status === 'Rejected'
      ).length;

      // Find latest transaction activity
      const latestTx = bizTransactions.length > 0 ? bizTransactions[0] : null;

      return {
        businessId: biz.id,
        businessName: biz.name,
        ownerName: biz.ownerName,
        ownerPhone: biz.ownerPhone,
        city: biz.city,
        province: biz.province,
        associatedAgents: biz.associatedAgents,
        agentsOnline: biz.agentsOnline,
        totalTransactions: bizTransactions.length,
        completedTransactions: completed,
        pendingTransactions: pending,
        failedTransactions: failed,
        totalVolume,
        lastActivity: latestTx ? latestTx.dateTime : biz.lastActivity || '—',
        recentTxRef: latestTx ? latestTx.reference : undefined,
        transactions: bizTransactions,
      };
    });
  }, [filteredTransactions]);

  // Summary Card Metrics
  const summaryMetrics = useMemo(() => {
    const totalTx = businessSummaries.reduce((acc, b) => acc + b.totalTransactions, 0);
    const completedTx = businessSummaries.reduce((acc, b) => acc + b.completedTransactions, 0);
    const pendingTx = businessSummaries.reduce((acc, b) => acc + b.pendingTransactions, 0);
    const failedTx = businessSummaries.reduce((acc, b) => acc + b.failedTransactions, 0);
    const totalVal = businessSummaries.reduce((acc, b) => acc + b.totalVolume, 0);

    return {
      total: totalTx || ALL_TRANSACTIONS_SUMMARY.total,
      completed: completedTx || ALL_TRANSACTIONS_SUMMARY.completed,
      pending: pendingTx || ALL_TRANSACTIONS_SUMMARY.pendingOrProcessing,
      failed: failedTx || ALL_TRANSACTIONS_SUMMARY.failedOrCancelled,
      totalValue: totalVal || ALL_TRANSACTIONS_SUMMARY.totalValue,
    };
  }, [businessSummaries]);

  // Export Filtered Business Summary
  const handleExport = useCallback(() => {
    const headers = [
      'Business ID',
      'Business Name',
      'Owner Name',
      'Owner Phone',
      'City',
      'Associated Agents',
      'Total Transactions',
      'Completed Transactions',
      'Pending Transactions',
      'Failed Transactions',
      'Total Transaction Volume (ZMW)',
      'Last Activity',
    ];

    const rows = businessSummaries.map((b) => [
      b.businessId,
      b.businessName,
      b.ownerName,
      b.ownerPhone,
      b.city,
      `${b.associatedAgents} (${b.agentsOnline} Online)`,
      b.totalTransactions,
      b.completedTransactions,
      b.pendingTransactions,
      b.failedTransactions,
      b.totalVolume.toFixed(2),
      b.lastActivity,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TellerBud_Business_Transactions_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [businessSummaries]);

  // Pagination Math
  const totalCount = businessSummaries.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBusinesses = useMemo(() => {
    const start = (validCurrentPage - 1) * rowsPerPage;
    return businessSummaries.slice(start, start + rowsPerPage);
  }, [businessSummaries, validCurrentPage, rowsPerPage]);

  const startIndex = totalCount === 0 ? 0 : (validCurrentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(validCurrentPage * rowsPerPage, totalCount);

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 max-w-[1720px] w-full mx-auto">
      {/* 1. SUMMARY CARDS (5 Compact Cards per specification - Frozen upper section) */}
      <div className="shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1.25fr] gap-3 sm:gap-4">
          {/* Card 1: Total Transactions */}
          <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
                Total Transactions
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 whitespace-nowrap">
                {summaryMetrics.total}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA] shrink-0">
              <Receipt size={20} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Card 2: Completed */}
          <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
                Completed
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 whitespace-nowrap">
                {summaryMetrics.completed}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
              <CheckCircle2 size={20} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Card 3: Pending or Processing */}
          <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
                Pending or Processing
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 whitespace-nowrap">
                {summaryMetrics.pending}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
              <Clock size={20} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Card 4: Failed or Cancelled */}
          <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
                Failed or Cancelled
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 whitespace-nowrap">
                {summaryMetrics.failed}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
              <XCircle size={20} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Card 5: Total Transaction Value */}
          <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
                Total Transaction Value
              </span>
              <div className="text-base sm:text-lg xl:text-xl font-bold text-slate-900 mt-1 whitespace-nowrap">
                ZMW {summaryMetrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA] shrink-0">
              <Wallet size={20} className="stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPACT SINGLE-ROW FILTER & ACTION BAR (All controls on one horizontal line) */}
      <div className="shrink-0 bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 shadow-2xs">
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 justify-between">
          {/* Left: Filter Controls (Transaction Types, Vendors, Statuses, From Date, To Date) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 min-w-0">
            {/* 1. All Transaction Types */}
            <div className="w-full sm:w-auto min-w-[150px] flex-1">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">All Transaction Types</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="Purchase">Purchase</option>
                <option value="Liquidity Transfer">Liquidity Transfer</option>
                <option value="Wallet Funding">Wallet Funding</option>
                <option value="Wallet Payout">Wallet Payout</option>
              </select>
            </div>

            {/* 2. All Vendors */}
            <div className="w-full sm:w-auto min-w-[140px] flex-1">
              <select
                value={vendorFilter}
                onChange={(e) => {
                  setVendorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">All Vendors</option>
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Zamtel">Zamtel</option>
                <option value="Zanaco">Zanaco</option>
                <option value="FNB">FNB</option>
                <option value="INDO">INDO</option>
                <option value="Stanbic">Stanbic</option>
                <option value="Access">Access Bank</option>
                <option value="TellerBud Ledger">TellerBud Ledger</option>
              </select>
            </div>

            {/* 3. All Statuses */}
            <div className="w-full sm:w-auto min-w-[135px] flex-1">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Paid">Paid</option>
                <option value="Finding an Agent">Finding an Agent</option>
                <option value="Agent Confirmed">Agent Confirmed</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Processing">Processing</option>
                <option value="Pending Confirmation">Pending Confirmation</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* 4. From Date */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-700"
              />
            </div>

            {/* 5. To Date */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-700"
              />
            </div>
          </div>

          {/* Right: Actions (Clear Filters, Refresh, Export) */}
          <div className="flex items-center gap-2 shrink-0 ml-auto justify-end">
            <button
              onClick={handleClearFilters}
              disabled={!isFilterActive}
              className="inline-flex items-center gap-1 h-[32px] px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Clear Filters</span>
            </button>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 h-[32px] px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Refresh transaction records"
            >
              <RotateCw size={13} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-[32px] px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              title="Export currently filtered business summaries to CSV"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. BUSINESS TRANSACTION SUMMARY TABLE CARD */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div
          ref={tableContainerRef}
          tabIndex={0}
          role="region"
          aria-label="Business Transactions Summary List"
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-auto transaction-table-scroll focus:outline-none"
        >
          <table className="all-transactions-table w-full text-left text-xs border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
              <tr className="border-b border-gray-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] bg-[#F9FAFB] h-[44px]">
                <th scope="col" style={{ width: '22%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Business</th>
                <th scope="col" style={{ width: '18%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Owner / Contact</th>
                <th scope="col" style={{ width: '12%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Agents</th>
                <th scope="col" style={{ width: '14%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Transactions</th>
                <th scope="col" style={{ width: '14%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3.5 font-semibold text-left whitespace-nowrap align-middle">Total Volume</th>
                <th scope="col" style={{ width: '10%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3.5 font-semibold text-left whitespace-nowrap align-middle">Status</th>
                <th scope="col" style={{ width: '10%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3.5 font-semibold text-left whitespace-nowrap align-middle">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No matching business transaction summaries found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((biz) => (
                  <tr
                    key={biz.businessId}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedBusiness(biz)}
                  >
                    {/* 1. BUSINESS COLUMN (22%) */}
                    <td className="py-3 px-3.5 align-middle text-left">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-slate-900 text-xs sm:text-[13px] group-hover:text-[#0D93AA] transition-colors truncate" title={biz.businessName}>
                          {biz.businessName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span className="font-mono text-slate-600">{biz.businessId}</span>
                          <span>•</span>
                          <span>{biz.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. OWNER / CONTACT COLUMN (18%) */}
                    <td className="py-3 px-3.5 align-middle text-left">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-medium text-slate-900 text-xs truncate" title={biz.ownerName}>
                          {biz.ownerName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {biz.ownerPhone}
                        </div>
                      </div>
                    </td>

                    {/* 3. AGENTS COLUMN (12%) */}
                    <td className="py-3 px-3.5 align-middle text-left whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100/80 text-slate-700 text-xs font-medium">
                        <Users size={12} className="text-slate-500 shrink-0" />
                        <span>{biz.associatedAgents} Agents</span>
                        <span className="text-emerald-600 text-[11px] font-semibold">({biz.agentsOnline} online)</span>
                      </div>
                    </td>

                    {/* 4. TRANSACTIONS COLUMN (14%) */}
                    <td className="py-3 px-3.5 align-middle text-left whitespace-nowrap">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-slate-900 text-xs">
                          {biz.totalTransactions} transactions
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <span className="text-emerald-600 font-semibold">{biz.completedTransactions} completed</span>
                          {biz.pendingTransactions > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 font-semibold">{biz.pendingTransactions} pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 5. TOTAL VOLUME COLUMN (14%) */}
                    <td className="py-3 px-3.5 align-middle text-left whitespace-nowrap">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-slate-900 text-xs sm:text-[13px] tabular-nums">
                          ZMW {biz.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10.5px] text-slate-400">
                          Last: {biz.lastActivity}
                        </div>
                      </div>
                    </td>

                    {/* 6. STATUS COLUMN (10%) */}
                    <td className="py-3 px-3.5 align-middle text-left whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>

                    {/* 7. ACTION COLUMN (10%) */}
                    <td className="py-3 px-3.5 align-middle text-left whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        id={`btn-view-business-${biz.businessId.toLowerCase()}`}
                        onClick={() => setSelectedBusiness(biz)}
                        className="inline-flex items-center gap-1.5 h-[30px] px-2.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                        title={`View Transactions for ${biz.businessName}`}
                        aria-label={`View Transactions for ${biz.businessName}`}
                      >
                        <Eye size={13} className="shrink-0 stroke-[2.2]" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. FIXED PAGINATION FOOTER */}
        <div className="shrink-0 border-t border-gray-100 bg-slate-50/70 px-4 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-700">
              Showing <span className="font-bold text-slate-900">{startIndex}</span> to{' '}
              <span className="font-bold text-slate-900">{endIndex}</span> of{' '}
              <span className="font-bold text-slate-900">{totalCount}</span> businesses
            </span>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                  tableContainerRef.current?.scrollTo({ top: 0 });
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Page <strong className="text-slate-800">{validCurrentPage}</strong> of{' '}
              <strong className="text-slate-800">{totalPages}</strong>
            </span>

            <div className="inline-flex items-center gap-1">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  tableContainerRef.current?.scrollTo({ top: 0 });
                }}
                disabled={validCurrentPage <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  tableContainerRef.current?.scrollTo({ top: 0 });
                }}
                disabled={validCurrentPage >= totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BUSINESS TRANSACTION DETAILS DRAWER / MODAL */}
      {selectedBusiness && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => setSelectedBusiness(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedBusiness.businessName}</h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                    {selectedBusiness.businessId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Owner: {selectedBusiness.ownerName} ({selectedBusiness.ownerPhone}) • {selectedBusiness.city}, {selectedBusiness.province}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/super-admin/people/businesses/${selectedBusiness.businessId}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Building2 size={13} />
                  <span>Business Profile</span>
                  <ExternalLink size={11} className="text-slate-400" />
                </button>
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Key Summary Cards */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-slate-100 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Transactions
                </span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {selectedBusiness.totalTransactions}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Completed
                </span>
                <span className="text-base font-bold text-emerald-600 mt-0.5 block">
                  {selectedBusiness.completedTransactions}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Pending / Review
                </span>
                <span className="text-base font-bold text-amber-600 mt-0.5 block">
                  {selectedBusiness.pendingTransactions}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Volume
                </span>
                <span className="text-base font-bold text-[#0D93AA] mt-0.5 block">
                  ZMW {selectedBusiness.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Modal Transactions Table */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Transactions ({selectedBusiness.transactions.length})
              </h3>
              {selectedBusiness.transactions.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <Receipt size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">No transactions recorded for this business under active filters.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Agent / Customer</th>
                        <th className="py-2.5 px-3">Service & Type</th>
                        <th className="py-2.5 px-3">Vendor</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedBusiness.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {tx.reference}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {tx.dateTime}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-900">{tx.agentName || '—'}</div>
                            <div className="text-[11px] text-slate-500">{tx.customerName || '—'}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-900">{tx.service}</div>
                            <div className="text-[11px] text-slate-500">{tx.transactionType}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">
                            {getVendorDisplayName(tx.provider)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {formatZmwListingAmount(tx.amount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <TransactionStatusBadge status={tx.status} />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const isBo = window.location.pathname.startsWith('/business-owner');
                                navigate(isBo ? `/business-owner/transactions/${tx.reference}` : `/super-admin/transactions/${tx.reference}`);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded transition-colors cursor-pointer"
                              title={`View Details for ${tx.reference}`}
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedBusiness(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
