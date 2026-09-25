import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
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
} from 'lucide-react';
import {
  MOCK_ALL_TRANSACTIONS,
  ALL_TRANSACTIONS_SUMMARY,
  AllTransactionRecord,
  TransactionSource,
} from '../data/mockAllTransactionsData';
import { TransactionStatusBadge } from '../components/transactions/TransactionStatusBadge';
import { formatZmwListingAmount } from '../utils/formatters';

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

export const AllTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Primary Data State
  const [transactions, setTransactions] = useState<AllTransactionRecord[]>(MOCK_ALL_TRANSACTIONS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Pagination State (Default 20 per specification)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  // Filter Handling
  const handleClearFilters = () => {
    setSearchQuery('');
    setSourceFilter('ALL');
    setServiceFilter('ALL');
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

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesRef = tx.reference.toLowerCase().includes(q);
        const matchesCustName = tx.customerName ? tx.customerName.toLowerCase().includes(q) : false;
        const matchesCustId = tx.customerId ? tx.customerId.toLowerCase().includes(q) : false;
        const matchesAgent = tx.agentName ? tx.agentName.toLowerCase().includes(q) : false;
        const matchesAgentId = tx.agentId ? tx.agentId.toLowerCase().includes(q) : false;
        const matchesSending = tx.sendingAgent ? tx.sendingAgent.toLowerCase().includes(q) : false;
        const matchesReceiving = tx.receivingAgent ? tx.receivingAgent.toLowerCase().includes(q) : false;
        const matchesBiz = tx.businessName ? tx.businessName.toLowerCase().includes(q) : false;
        const matchesVendor =
          tx.provider.toLowerCase().includes(q) ||
          getVendorDisplayName(tx.provider).toLowerCase().includes(q);
        const matchesService = tx.service.toLowerCase().includes(q);
        const matchesType = tx.transactionType.toLowerCase().includes(q);

        if (
          !matchesRef &&
          !matchesCustName &&
          !matchesCustId &&
          !matchesAgent &&
          !matchesAgentId &&
          !matchesSending &&
          !matchesReceiving &&
          !matchesBiz &&
          !matchesVendor &&
          !matchesService &&
          !matchesType
        ) {
          return false;
        }
      }

      // 2. Source
      if (sourceFilter !== 'ALL' && tx.source !== sourceFilter) {
        return false;
      }

      // 3. Service
      if (serviceFilter !== 'ALL' && tx.service !== serviceFilter) {
        return false;
      }

      // 4. Transaction Type
      if (typeFilter !== 'ALL' && tx.transactionType !== typeFilter) {
        return false;
      }

      // 5. Vendor
      if (vendorFilter !== 'ALL') {
        if (vendorFilter === 'Access' || vendorFilter === 'Access Bank') {
          if ((tx.provider as string) !== 'Access' && (tx.provider as string) !== 'Access Bank') return false;
        } else if (tx.provider !== vendorFilter) {
          return false;
        }
      }

      // 6. Status
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
        return false;
      }

      // 7. Date Range
      if (fromDate && tx.rawDate < fromDate) {
        return false;
      }
      if (toDate && tx.rawDate > toDate) {
        return false;
      }

      return true;
    });
  }, [
    transactions,
    searchQuery,
    sourceFilter,
    serviceFilter,
    typeFilter,
    vendorFilter,
    statusFilter,
    fromDate,
    toDate,
  ]);

  // Export Filtered Transactions
  const handleExport = useCallback(() => {
    const headers = [
      'Transaction Reference',
      'Date and Time',
      'Source',
      'Customer Name',
      'Customer ID',
      'Agent / Counterparty',
      'Business Name',
      'Service',
      'Transaction Type',
      'Vendor',
      'Amount (ZMW)',
      'Status',
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.reference,
      tx.dateTime,
      tx.source,
      tx.customerName || '—',
      tx.customerId || '—',
      tx.service === 'Agent-to-Agent Liquidity'
        ? `Sender: ${tx.sendingAgent || '—'} -> Receiver: ${tx.receivingAgent || '—'}`
        : `${tx.agentName}${tx.agentId ? ` (${tx.agentId})` : ''}`,
      tx.businessName || '—',
      tx.service,
      tx.transactionType,
      getVendorDisplayName(tx.provider),
      tx.amount.toFixed(2),
      tx.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TellerBud_Transactions_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredTransactions]);

  // Pagination Math
  const totalFilteredCount = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (validCurrentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, validCurrentPage, rowsPerPage]);

  const startIndex = totalFilteredCount === 0 ? 0 : (validCurrentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(validCurrentPage * rowsPerPage, totalFilteredCount);

  // Helper for source badge
  const renderSourceBadge = (source: TransactionSource) => {
    let classes = 'bg-slate-100 text-slate-700 border-slate-200';
    if (source === 'Customer App') {
      classes = 'bg-sky-50 text-sky-700 border-sky-200';
    } else if (source === 'Agent App') {
      classes = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    } else if (source === 'Business Owner Portal') {
      classes = 'bg-slate-100 text-slate-700 border-slate-200';
    } else if (source === 'TellerBud Admin') {
      classes = 'bg-teal-50 text-teal-700 border-teal-200';
    } else if (source === 'Provider API') {
      classes = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${classes}`}>
        {source}
      </span>
    );
  };

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
              {ALL_TRANSACTIONS_SUMMARY.total}
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
              {ALL_TRANSACTIONS_SUMMARY.completed}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
            <CheckCircle2 size={20} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Card 3: Pending or Processing (reconciles with completed: 276, pending: 40, failed: 12) */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
              Pending or Processing
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 whitespace-nowrap">
              {ALL_TRANSACTIONS_SUMMARY.pendingOrProcessing}
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
              {ALL_TRANSACTIONS_SUMMARY.failedOrCancelled}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
            <XCircle size={20} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Card 5: Total Transaction Value - Complete info, no ellipsis, single line */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
              Total Transaction Value
            </span>
            <div className="text-base sm:text-lg xl:text-xl font-bold text-slate-900 mt-1 whitespace-nowrap">
              ZMW {ALL_TRANSACTIONS_SUMMARY.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA] shrink-0">
            <Wallet size={20} className="stroke-[2.2]" />
          </div>
        </div>
      </div>
      </div>

      {/* 2. COMPACT TWO-ROW FILTER AREA (Frozen upper section) */}
      <div className="shrink-0 bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
        {/* Row 1: Search + Source + Service + Transaction Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
            <input
              type="text"
              placeholder="Search transaction, customer, agent, business or mobile..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-800 placeholder-slate-400 transition-colors"
            />
          </div>

          {/* Transaction Source */}
          <div className="lg:col-span-2">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium"
            >
              <option value="ALL">All Sources</option>
              <option value="Customer App">Customer App</option>
              <option value="Agent App">Agent App</option>
              <option value="Business Owner Portal">Business Owner Portal</option>
              <option value="TellerBud Admin">TellerBud Admin</option>
              <option value="Provider API">Provider API</option>
            </select>
          </div>

          {/* Service */}
          <div className="lg:col-span-3">
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium"
            >
              <option value="ALL">All Services</option>
              <option value="Cash Pickup">Cash Pickup</option>
              <option value="Walk-In Transaction">Walk-In Transaction</option>
              <option value="Agent-to-Agent Liquidity">Agent-to-Agent Liquidity</option>
              <option value="Wallet Funding">Wallet Funding</option>
              <option value="Customer Withdrawal">Customer Withdrawal</option>
              <option value="Business Wallet Transaction">Business Wallet Transaction</option>
            </select>
          </div>

          {/* Transaction Type */}
          <div className="lg:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium"
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
        </div>

        {/* Row 2: Vendor + Status + Date Range + Action Buttons */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 pt-0.5">
          {/* Vendor */}
          <div className="w-full sm:w-auto min-w-[150px] flex-1">
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium"
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

          {/* Status - Standardized "Finding an Agent", "Pending Review", "Paid" */}
          <div className="w-full sm:w-auto min-w-[145px] flex-1">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium"
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

          {/* Date: From */}
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

          {/* Date: To */}
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

          {/* Action Buttons: Clear Filters, Refresh, Export Transactions */}
          <div className="flex items-center gap-2 ml-auto shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Clear Filters</span>
            </button>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Refresh transaction records"
            >
              <RotateCw size={13} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              title="Export currently filtered records to CSV"
            >
              <Download size={13} />
              <span>Export Transactions</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. TRANSACTION TABLE CARD (Flex-1 min-h-0 container with sticky header, scrollable rows, and fixed pagination) */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
        {/* Scrollable Transaction Listing Table Container */}
        <div
          ref={tableContainerRef}
          tabIndex={0}
          role="region"
          aria-label="All Transactions List"
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-auto transaction-table-scroll focus:outline-none"
        >
          <table className="all-transactions-table w-full text-left text-xs border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
              <tr className="border-b border-gray-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] bg-[#F9FAFB] h-[44px]">
                <th scope="col" style={{ width: '12%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3 font-semibold whitespace-nowrap text-left align-middle">Transaction</th>
                <th scope="col" style={{ width: '12%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3 font-semibold whitespace-nowrap text-left align-middle">Customer</th>
                <th scope="col" style={{ width: '18%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3 font-semibold whitespace-nowrap text-left align-middle">Agent / Business</th>
                <th scope="col" style={{ width: '13%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3 font-semibold whitespace-nowrap text-left align-middle">Service</th>
                <th scope="col" style={{ width: '12%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3 font-semibold whitespace-nowrap text-left align-middle">Vendor</th>
                <th scope="col" style={{ width: '10%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3 font-semibold text-left whitespace-nowrap align-middle amount-heading">Amount (ZMW)</th>
                <th scope="col" style={{ width: '11%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3 font-semibold text-left whitespace-nowrap align-middle">Status</th>
                <th scope="col" style={{ width: '12%' }} className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-3 px-3 font-semibold text-left whitespace-nowrap align-middle">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Receipt size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No matching transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* 1. TRANSACTION COLUMN (12%) */}
                    <td className="py-3 px-3 align-middle text-left">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-mono font-bold text-slate-900 text-xs block whitespace-nowrap group-hover:text-[#0D93AA] transition-colors truncate" title={tx.reference}>
                          {tx.reference}
                        </span>
                        <span className="text-[11px] text-slate-600 block whitespace-nowrap font-medium">
                          {tx.dateTime}
                        </span>
                        <div className="pt-0.5">{renderSourceBadge(tx.source)}</div>
                      </div>
                    </td>

                    {/* 2. CUSTOMER COLUMN (12%) */}
                    <td className="py-3 px-3 align-middle text-left">
                      {tx.customerName === '—' ? (
                        <div className="text-slate-400 font-medium text-xs">—</div>
                      ) : (
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-900 text-xs truncate" title={tx.customerName}>
                            {tx.customerName}
                          </div>
                          {tx.customerId && tx.customerId !== '—' && (
                            <div className="text-[11px] font-mono text-slate-600 font-medium whitespace-nowrap">
                              {tx.customerId}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 3. AGENT / BUSINESS COLUMN (18%) */}
                    <td className="py-3 px-3 align-middle text-left">
                      {tx.service === 'Agent-to-Agent Liquidity' ? (
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs text-slate-800 leading-tight truncate">
                            <span className="text-slate-500 font-medium">From: </span>
                            <span className="font-semibold text-slate-900">{tx.sendingAgent || '—'}</span>
                            {tx.sendingAgentId && (
                              <span className="text-[11px] font-mono text-slate-600 font-medium ml-1">
                                ({tx.sendingAgentId})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-800 leading-tight truncate">
                            <span className="text-slate-500 font-medium">To: </span>
                            <span className="font-semibold text-slate-900">{tx.receivingAgent || '—'}</span>
                            {tx.receivingAgentId && (
                              <span className="text-[11px] font-mono text-slate-600 font-medium ml-1">
                                ({tx.receivingAgentId})
                              </span>
                            )}
                          </div>
                          {tx.businessName && tx.businessName !== '—' && (
                            <div className="text-[11px] text-slate-600 leading-snug break-words line-clamp-2 mt-0.5" title={tx.businessName}>
                              {tx.businessName}
                            </div>
                          )}
                        </div>
                      ) : tx.agentName === 'Automated Provider API' ? (
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-800 text-xs truncate">
                            Automated Provider API
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">
                            System Integration
                          </div>
                        </div>
                      ) : tx.agentName === '—' ? (
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs text-slate-400 font-medium">—</div>
                          {tx.businessName && tx.businessName !== '—' && (
                            <div className="text-[11px] text-slate-600 leading-snug break-words line-clamp-2" title={tx.businessName}>
                              {tx.businessName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs text-slate-900 truncate" title={tx.agentName}>
                            <span className="font-semibold">{tx.agentName}</span>
                            {tx.agentId && (
                              <span className="text-[11px] font-mono text-slate-600 font-medium ml-1.5 whitespace-nowrap">
                                {tx.agentId}
                              </span>
                            )}
                          </div>
                          {tx.businessName && tx.businessName !== '—' && (
                            <div className="text-[11px] text-slate-600 leading-snug break-words line-clamp-2" title={tx.businessName}>
                              {tx.businessName}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 4. SERVICE COLUMN (13%) */}
                    <td className="py-3 px-3 align-middle text-left">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-slate-900 text-xs truncate" title={tx.service}>
                          {tx.service}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium whitespace-nowrap">
                          {tx.transactionType}
                        </div>
                      </div>
                    </td>

                    {/* 5. VENDOR COLUMN (12%) - Plain text vendor name without logo */}
                    <td className="py-3 px-3 align-middle text-left whitespace-nowrap">
                      <span className="font-semibold text-slate-800 text-xs truncate block" title={getVendorDisplayName(tx.provider)}>
                        {getVendorDisplayName(tx.provider)}
                      </span>
                    </td>

                    {/* 6. AMOUNT COLUMN (10%) - Single line, no currency prefix repetition, left-aligned */}
                    <td className="py-3 px-3 align-middle text-left whitespace-nowrap amount-cell">
                      <span className="font-semibold text-slate-900 text-xs sm:text-[13px] tabular-nums whitespace-nowrap">
                        {formatZmwListingAmount(tx.amount)}
                      </span>
                    </td>

                    {/* 7. STATUS COLUMN (11%) - Left aligned badge */}
                    <td className="py-3 px-3 align-middle text-left whitespace-nowrap">
                      <div className="flex items-center justify-start">
                        <TransactionStatusBadge status={tx.status} />
                      </div>
                    </td>

                    {/* 8. ACTION COLUMN (12%) - Fully visible View Details button */}
                    <td className="py-3 px-3 align-middle text-left whitespace-nowrap">
                      <button
                        type="button"
                        id={`btn-view-details-${tx.reference.toLowerCase()}`}
                        onClick={() => {
                          const isBo = window.location.pathname.startsWith('/business-owner');
                          navigate(isBo ? `/business-owner/transactions/${tx.reference}` : `/super-admin/transactions/${tx.reference}`);
                        }}
                        className="inline-flex items-center gap-1.5 h-[32px] px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                        title={`View Details for ${tx.reference}`}
                        aria-label={`View Details for ${tx.reference}`}
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
              <span className="font-bold text-slate-900">{totalFilteredCount}</span> transactions
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
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
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
    </div>
  );
};
