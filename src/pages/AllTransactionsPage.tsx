import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  RotateCw,
  Download,
  X,
  Layers,
  CheckCircle2,
  Clock,
  Coins,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  BusinessTransactionRecord,
  BusinessTransactionCategory,
  BusinessTransactionStatus,
  ApprovedVendor,
} from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { formatZMW } from '../utils/formatters';
import { StatusChip } from '../components/shared/StatusChip';
import { VendorLogo } from '../components/walk-in/VendorLogo';
import { TransactionSummaryModal } from '../components/transactions/TransactionSummaryModal';
import { CATEGORY_TYPE_MAPPING } from '../data/mockBusinessTransactionsData';

type StatusTabType = 'All' | BusinessTransactionStatus;

const STATUS_TABS: { label: string; value: StatusTabType }[] = [
  { label: 'All Transactions', value: 'All' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Reversed', value: 'Reversed' },
];

const CATEGORIES: BusinessTransactionCategory[] = [
  'Walk-In Transaction',
  'Customer Pickup Transaction',
  'Cash / Float Fulfilment',
  'Agent-to-Agent Liquidity',
  'Global Wallet Transaction',
  'Charge or Commission',
  'Refund or Reversal',
];

const VENDORS: ApprovedVendor[] = [
  'Zanaco',
  'MTN',
  'Airtel',
  'Zamtel',
  'Stanbic',
  'FNB',
  'Access',
  'INDO',
];

const AGENTS = [
  'Kelvin Phiri',
  'Natasha Zulu',
  'Joseph Kaunda',
  'Mwape Tembo',
  'Gift Banda',
  'Brian Chanda',
  'Memory Lungu',
  'Kondwani Mwale',
];

export const AllTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Primary Data State
  const [transactions, setTransactions] = useState<BusinessTransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Active Status Tab
  const [activeTab, setActiveTab] = useState<StatusTabType>('All');

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return searchParams.get('search') || searchParams.get('ref') || searchParams.get('reference') || '';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [selectedAgent, setSelectedAgent] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('ref') || searchParams.get('reference');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modal State
  const [summaryModalOpen, setSummaryModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BusinessTransactionRecord | null>(null);

  // Fetch transactions
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getBusinessTransactions(
        undefined,
        'BIZ-LUS-001'
      );
      setTransactions(response.items);
    } catch (error) {
      console.error('Failed to load business transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTransactions();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Dynamic Transaction Types based on selected category
  const availableTypes = useMemo(() => {
    if (selectedCategory === 'All' || !selectedCategory) {
      // Return all unique types across all categories
      const allTypes = Object.values(CATEGORY_TYPE_MAPPING).flat();
      return Array.from(new Set(allTypes));
    }
    const cat = selectedCategory as BusinessTransactionCategory;
    return CATEGORY_TYPE_MAPPING[cat] || [];
  }, [selectedCategory]);

  // When category changes, reset selected type if not in the new category
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedType('All');
    setCurrentPage(1);
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedVendor('All');
    setSelectedAgent('All');
    setSelectedStatus('All');
    setFromDate('');
    setToDate('');
    setActiveTab('All');
    setCurrentPage(1);
  };

  // Tab Counts: accurate counts for each status across the entire business dataset
  const tabCounts = useMemo(() => {
    const counts: Record<StatusTabType, number> = {
      All: transactions.length,
      Completed: 0,
      Processing: 0,
      Pending: 0,
      Failed: 0,
      Cancelled: 0,
      Reversed: 0,
    };

    transactions.forEach((tx) => {
      if (counts[tx.status] !== undefined) {
        counts[tx.status]++;
      }
    });

    return counts;
  }, [transactions]);

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Tab filter
      if (activeTab !== 'All' && tx.status !== activeTab) {
        return false;
      }

      // 2. Status dropdown filter
      if (selectedStatus !== 'All' && tx.status !== selectedStatus) {
        return false;
      }

      // 3. Search query: reference, agent, customer phone, vendor, counterparty
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesRef = tx.reference.toLowerCase().includes(q);
        const matchesAgent = tx.agentName ? tx.agentName.toLowerCase().includes(q) : false;
        const matchesCounterparty = tx.customerOrCounterparty.toLowerCase().includes(q);
        const matchesPhone = tx.customerPhone ? tx.customerPhone.includes(q) : false;
        const matchesVendor = tx.vendor ? tx.vendor.toLowerCase().includes(q) : false;
        const matchesDesc = tx.description ? tx.description.toLowerCase().includes(q) : false;
        if (!matchesRef && !matchesAgent && !matchesCounterparty && !matchesPhone && !matchesVendor && !matchesDesc) {
          return false;
        }
      }

      // 4. Category
      if (selectedCategory !== 'All' && tx.category !== selectedCategory) {
        return false;
      }

      // 5. Transaction Type
      if (selectedType !== 'All' && tx.transactionType !== selectedType) {
        return false;
      }

      // 6. Vendor
      if (selectedVendor !== 'All' && tx.vendor !== selectedVendor) {
        return false;
      }

      // 7. Agent
      if (selectedAgent !== 'All' && tx.agentName !== selectedAgent) {
        return false;
      }

      // 8. Date Range
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
    activeTab,
    selectedStatus,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedVendor,
    selectedAgent,
    fromDate,
    toDate,
  ]);

  // 4 SUMMARY CARDS:
  // - Total Transactions
  // - Total Transaction Value (operational reporting value, not Global Wallet balance)
  // - Completed Transactions
  // - Pending / Processing
  const summaryMetrics = useMemo(() => {
    // Total Transactions in business
    const totalCount = transactions.length;

    // Total Transaction Value: Sum of all operational transaction amounts
    const totalValue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Completed Transactions count
    const completedCount = transactions.filter((tx) => tx.status === 'Completed').length;

    // Pending / Processing count
    const pendingProcessingCount = transactions.filter(
      (tx) => tx.status === 'Pending' || tx.status === 'Processing'
    ).length;

    return {
      totalCount,
      totalValue,
      completedCount,
      pendingProcessingCount,
    };
  }, [transactions]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage));
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      'Reference',
      'Date Time',
      'Category',
      'Transaction Type',
      'Agent',
      'Customer / Counterparty',
      'Vendor',
      'Amount (ZMW)',
      'Status',
      'Related Reference',
      'Related Ledger Entry',
      'Business',
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.reference,
      `"${tx.dateTime}"`,
      `"${tx.category}"`,
      `"${tx.transactionType}"`,
      `"${tx.agentName || '—'}"`,
      `"${tx.customerOrCounterparty.replace(/"/g, '""')}"`,
      `"${tx.vendor || '—'}"`,
      tx.amount.toFixed(2),
      `"${tx.status}"`,
      `"${tx.relatedReference || '—'}"`,
      `"${tx.relatedLedgerEntry || '—'}"`,
      `"${tx.businessName}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `All_Transactions_BIZ-LUS-001_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Summary Modal
  const handleOpenSummary = (tx: BusinessTransactionRecord) => {
    setSelectedTransaction(tx);
    setSummaryModalOpen(true);
  };

  // Open Full Details Page
  const handleOpenFullDetails = (reference: string) => {
    setSummaryModalOpen(false);
    navigate(`/business-owner/transactions/all/${reference}`);
  };

  return (
    <div id="all-transactions-page" className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Action Controls Bar (Application Header presents the primary page title) */}
      <div className="flex items-center justify-end gap-3">
        <button
          id="btn-refresh-transactions"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
        >
          <RotateCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>

        <button
          id="btn-export-csv"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors shadow-2xs"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 1. STATUS TABS WITH ACCURATE COUNTS */}
      <div className="border-b border-slate-200">
        <nav
          id="status-tabs"
          className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-px scrollbar-thin"
          aria-label="Transaction Status Tabs"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = tabCounts[tab.value];
            return (
              <button
                key={tab.value}
                id={`tab-status-${tab.value.toLowerCase()}`}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#0D93AA] text-[#0D93AA]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors ${
                    isActive
                      ? 'bg-[#0D93AA]/10 text-[#0D93AA]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. SUMMARY CARDS: EXACTLY FOUR COMPACT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div
          id="card-total-transactions"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Transactions
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {summaryMetrics.totalCount}
            </span>
          </div>
        </div>

        {/* Total Transaction Value (Operational reporting value, not Global Wallet) */}
        <div
          id="card-total-transaction-value"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Transaction Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center">
              <Coins size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-[#0D93AA] tracking-tight">
              {formatZMW(summaryMetrics.totalValue)}
            </span>
          </div>
        </div>

        {/* Completed Transactions */}
        <div
          id="card-completed-transactions"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Transactions
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
              {summaryMetrics.completedCount}
            </span>
          </div>
        </div>

        {/* Pending / Processing */}
        <div
          id="card-pending-processing"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending / Processing
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-700 tracking-tight">
              {summaryMetrics.pendingProcessingCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH AND FILTERS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="input-transaction-search"
              type="text"
              placeholder="Search by reference, Agent, customer phone or vendor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D93AA] focus:ring-1 focus:ring-[#0D93AA] text-slate-800 placeholder-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            id="btn-clear-filters"
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <X size={13} />
            <span>Clear</span>
          </button>
        </div>

        {/* Dropdowns Row: Category, Type, Vendor, Agent, Status, From Date, To Date */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-1">
          {/* Transaction Category */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D93AA]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type (dynamically matches selected category) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Type
            </label>
            <select
              id="filter-type"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D93AA]"
            >
              <option value="All">All Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Vendor
            </label>
            <select
              id="filter-vendor"
              value={selectedVendor}
              onChange={(e) => {
                setSelectedVendor(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D93AA]"
            >
              <option value="All">All Vendors</option>
              {VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Agent */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Agent
            </label>
            <select
              id="filter-agent"
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D93AA]"
            >
              <option value="All">All Agents</option>
              {AGENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D93AA]"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              From Date
            </label>
            <input
              id="filter-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D93AA]"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              To Date
            </label>
            <input
              id="filter-to-date"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D93AA]"
            />
          </div>
        </div>
      </div>

      {/* 4. TRANSACTIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table responsive container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RotateCw size={18} className="animate-spin text-[#0D93AA]" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium text-slate-600">No transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No records match the current filters or search query.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 rounded-lg hover:bg-[#0D93AA]/20 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    id={`transaction-row-${tx.reference.toLowerCase()}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Reference */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenSummary(tx)}
                        className="text-left text-[#0D93AA] hover:underline"
                        title="Click to view summary"
                      >
                        {tx.reference}
                      </button>
                    </td>

                    {/* Date and Time */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {tx.dateTime}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 text-slate-700">
                        {tx.category}
                      </span>
                    </td>

                    {/* Transaction Type */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {tx.transactionType}
                    </td>

                    {/* Agent */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-800">
                      {tx.agentName ? (
                        <div>
                          <span className="font-medium text-slate-900 block">
                            {tx.agentName}
                          </span>
                          {tx.agentId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {tx.agentId}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.vendor ? (
                        <VendorLogo vendor={tx.vendor} size="table" showName={true} />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatZMW(tx.amount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <StatusChip status={tx.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          id={`btn-view-summary-${tx.reference.toLowerCase()}`}
                          onClick={() => handleOpenSummary(tx)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          View Summary
                        </button>
                        <button
                          id={`btn-view-details-${tx.reference.toLowerCase()}`}
                          onClick={() => handleOpenFullDetails(tx.reference)}
                          className="p-1 text-[#0D93AA] hover:bg-[#0D93AA]/10 rounded-md transition-colors"
                          title="Open Full Details"
                        >
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Showing</span>
            <span className="font-semibold text-slate-900">
              {filteredTransactions.length === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
            </span>
            <span>to</span>
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * rowsPerPage, filteredTransactions.length)}
            </span>
            <span>of</span>
            <span className="font-semibold text-slate-900">
              {filteredTransactions.length}
            </span>
            <span>transactions</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-[#0D93AA]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-1">
              <button
                id="btn-prev-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                id="btn-next-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. TRANSACTION SUMMARY MODAL */}
      <TransactionSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        transaction={selectedTransaction}
        onOpenFullDetails={handleOpenFullDetails}
      />
    </div>
  );
};
