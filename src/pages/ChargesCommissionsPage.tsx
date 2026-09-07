import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Wallet,
  Search,
  Filter,
  RefreshCw,
  Download,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import {
  ChargeCommissionRecord,
  ChargeCommissionFilters,
  ChargeCommissionSummary,
  ChargeCommissionTabCounts,
} from '../types/chargesCommissions';

const ALL_FEE_COMMISSION_TYPES = [
  'Reservation Fee',
  'Transaction Fee',
  'Platform Fee',
  'Business Commission',
  'Transaction Commission',
  'Promotional Commission',
  'Commission Adjustment',
];

const KNOWN_AGENTS = [
  'Natasha Zulu',
  'Kelvin Phiri',
  'Joseph Kaunda',
  'Memory Lungu',
];

export const ChargesCommissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Data State
  const [records, setRecords] = useState<ChargeCommissionRecord[]>([]);
  const [summary, setSummary] = useState<ChargeCommissionSummary>({
    totalCharges: 0,
    totalCommissions: 0,
    netWalletImpact: 0,
    currentWalletBalance: 0,
  });
  const [tabCounts, setTabCounts] = useState<ChargeCommissionTabCounts>({
    all: 0,
    charges: 0,
    commissions: 0,
    pending: 0,
    completed: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Status Tabs: 'All' | 'Charges' | 'Commissions' | 'Pending' | 'Completed'
  const [activeTab, setActiveTab] = useState<string>('All');

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('All');
  const [selectedSubType, setSelectedSubType] = useState<string>('All');
  const [selectedAgent, setSelectedAgent] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(10);

  // Details Modal State
  const [selectedRecord, setSelectedRecord] = useState<ChargeCommissionRecord | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  // Check URL query parameters for deep linking
  useEffect(() => {
    const querySearch = searchParams.get('search');
    const queryRef = searchParams.get('reference') || searchParams.get('ref');
    if (querySearch) {
      setSearchQuery(querySearch);
    }
    if (queryRef) {
      setSearchQuery(queryRef);
    }
  }, [searchParams]);

  // Load Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getChargesAndCommissions(
        undefined,
        'BIZ-LUS-001'
      );
      setRecords(response.items);
      setSummary(response.summary);
      setTabCounts(response.tabCounts);

      // Auto open modal if exact reference parameter is provided
      const queryRef = searchParams.get('reference') || searchParams.get('ref');
      if (queryRef) {
        const matching = response.items.find(
          (r) => r.reference.toLowerCase() === queryRef.trim().toLowerCase()
        );
        if (matching) {
          setSelectedRecord(matching);
          setDetailsModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to load charges and commissions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRecordType('All');
    setSelectedSubType('All');
    setSelectedAgent('All');
    setSelectedStatus('All');
    setFromDate('');
    setToDate('');
    setActiveTab('All');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Filtered Records based on Tab, Search, and Dropdown Filters
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // 1. Tab filtering
      if (activeTab === 'Charges' && record.recordType !== 'Charge') return false;
      if (activeTab === 'Commissions' && record.recordType !== 'Commission') return false;
      if (activeTab === 'Pending' && record.status !== 'Pending') return false;
      if (activeTab === 'Completed' && record.status !== 'Completed') return false;

      // 2. Search query (reference, related transaction, Agent or fee type, ledger)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchRef = record.reference.toLowerCase().includes(q);
        const matchTx = record.relatedTransaction.toLowerCase().includes(q);
        const matchAgent = record.agent?.name.toLowerCase().includes(q) ?? false;
        const matchType = record.subType.toLowerCase().includes(q);
        const matchLedger = record.walletLedgerReference.toLowerCase().includes(q);
        if (!matchRef && !matchTx && !matchAgent && !matchType && !matchLedger) {
          return false;
        }
      }

      // 3. Record Type filter
      if (selectedRecordType !== 'All' && record.recordType !== selectedRecordType) {
        return false;
      }

      // 4. SubType filter
      if (selectedSubType !== 'All' && record.subType !== selectedSubType) {
        return false;
      }

      // 5. Agent filter
      if (selectedAgent !== 'All') {
        if (record.agent?.name !== selectedAgent && record.agent?.id !== selectedAgent) {
          return false;
        }
      }

      // 6. Status filter
      if (selectedStatus !== 'All' && record.status !== selectedStatus) {
        return false;
      }

      // 7. Date range filter
      if (fromDate && record.rawDate < fromDate) {
        return false;
      }
      if (toDate && record.rawDate > toDate) {
        return false;
      }

      return true;
    });
  }, [
    records,
    activeTab,
    searchQuery,
    selectedRecordType,
    selectedSubType,
    selectedAgent,
    selectedStatus,
    fromDate,
    toDate,
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Reference',
      'Date Time',
      'Record Type',
      'Fee / Commission Type',
      'Related Transaction',
      'Agent (Attribution)',
      'Amount (ZMW)',
      'Wallet Direction',
      'Wallet Balance Before (ZMW)',
      'Wallet Balance After (ZMW)',
      'Wallet Ledger Ref',
      'Status',
      'Business Name',
      'Business ID',
    ];

    const rows = filteredRecords.map((r) => [
      r.reference,
      `"${r.dateTime}"`,
      r.recordType,
      `"${r.subType}"`,
      r.relatedTransaction,
      `"${r.agent ? r.agent.name : '—'}"`,
      r.amount.toFixed(2),
      r.walletDirection,
      r.walletBalanceBefore.toFixed(2),
      r.walletBalanceAfter.toFixed(2),
      r.walletLedgerReference,
      r.status,
      `"${r.businessName}"`,
      r.businessId,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Charges_Commissions_BIZ-LUS-001_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatZMW = (num: number) => {
    return `ZMW ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const activeFilterCount = [
    searchQuery.trim() !== '',
    selectedRecordType !== 'All',
    selectedSubType !== 'All',
    selectedAgent !== 'All',
    selectedStatus !== 'All',
    fromDate !== '',
    toDate !== '',
  ].filter(Boolean).length;

  const isActualTransaction = (ref: string) => {
    return (
      ref.startsWith('TB-WLK') ||
      ref.startsWith('TB-PKP') ||
      ref.startsWith('TB-TXN') ||
      ref.startsWith('TXN-')
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-600 mb-3" />
        <p className="text-sm font-medium">Loading Charges & Commissions...</p>
      </div>
    );
  }

  return (
    <div id="charges-commissions-page" className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. EXACTLY FOUR SUMMARY CARDS (Header heading removed to use recovered space) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Charges */}
        <div
          id="summary-total-charges"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Charges
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-rose-700 tracking-tight">
              {formatZMW(summary.totalCharges)}
            </div>
          </div>
        </div>

        {/* Card 2: Total Commissions */}
        <div
          id="summary-total-commissions"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Commissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
              {formatZMW(summary.totalCommissions)}
            </div>
          </div>
        </div>

        {/* Card 3: Net Wallet Impact (Total Commissions - Total Charges) */}
        <div
          id="summary-net-wallet-impact"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Wallet Impact
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                summary.netWalletImpact >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              <Scale size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold font-mono tracking-tight ${
                summary.netWalletImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {summary.netWalletImpact >= 0 ? '+' : ''}
              {formatZMW(summary.netWalletImpact)}
            </div>
          </div>
        </div>

        {/* Card 4: Current Global Wallet Balance (Matches Global Wallet & Ledger) */}
        <div
          id="summary-current-wallet-balance"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Global Wallet Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {formatZMW(summary.currentWalletBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATUS TABS */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 overflow-x-auto pb-px" aria-label="Status Tabs">
          {[
            { id: 'All', label: 'All', count: tabCounts.all },
            { id: 'Charges', label: 'Charges', count: tabCounts.charges },
            { id: 'Commissions', label: 'Commissions', count: tabCounts.commissions },
            { id: 'Pending', label: 'Pending', count: tabCounts.pending },
            { id: 'Completed', label: 'Completed', count: tabCounts.completed },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id.toLowerCase()}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-sky-600 text-sky-700 bg-sky-50/50 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                    isActive
                      ? 'bg-sky-100 text-sky-800 font-bold'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. SEARCH AND FILTERS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Search by reference, related transaction, Agent or fee type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Record Type Filter */}
          <div>
            <select
              id="filter-record-type"
              value={selectedRecordType}
              onChange={(e) => {
                setSelectedRecordType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            >
              <option value="All">All Record Types</option>
              <option value="Charge">Charge (Debits)</option>
              <option value="Commission">Commission (Credits)</option>
            </select>
          </div>

          {/* Fee or Commission Type Filter */}
          <div>
            <select
              id="filter-sub-type"
              value={selectedSubType}
              onChange={(e) => {
                setSelectedSubType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            >
              <option value="All">All Fee / Commission Types</option>
              {ALL_FEE_COMMISSION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row of Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Agent Filter */}
          <div>
            <select
              id="filter-agent"
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            >
              <option value="All">All Agents (Attribution)</option>
              {KNOWN_AGENTS.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <input
              id="filter-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            />
          </div>

          {/* To Date */}
          <div>
            <input
              id="filter-to-date"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            />
          </div>
        </div>

        {/* Action Controls: Clear, Refresh, Export CSV */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <span className="text-xs text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200 font-medium">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
            <button
              id="btn-clear-filters"
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2.5 py-1.5 rounded hover:bg-slate-100 transition-colors flex items-center space-x-1"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-refresh"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Date and Time</th>
                <th className="py-3 px-4">Record Type</th>
                <th className="py-3 px-4">Charge / Commission Type</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Wallet Direction</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                <th className="py-3 px-4 text-center min-w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No charges or commissions match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const isCharge = r.recordType === 'Charge';
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/75 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedRecord(r);
                        setDetailsModalOpen(true);
                      }}
                    >
                      {/* Reference */}
                      <td className="py-3.5 px-4 font-mono font-medium text-sky-700 whitespace-nowrap">
                        {r.reference}
                      </td>

                      {/* Date and Time */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {r.dateTime}
                      </td>

                      {/* Record Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            isCharge
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {r.recordType}
                        </span>
                      </td>

                      {/* Charge / Commission Type */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {r.subType}
                      </td>

                      {/* Agent */}
                      <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                        {r.agent ? r.agent.name : <span className="text-slate-400">—</span>}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {formatZMW(r.amount)}
                      </td>

                      {/* Wallet Direction */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {r.walletDirection === 'Debit' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Debit
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Credit
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap min-w-[100px]">
                        {getStatusBadge(r.status)}
                      </td>

                      {/* Action */}
                      <td
                        className="py-3.5 px-4 text-center whitespace-nowrap min-w-[120px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          id={`btn-view-details-${r.id.toLowerCase()}`}
                          onClick={() => {
                            setSelectedRecord(r);
                            setDetailsModalOpen(true);
                          }}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded transition-colors"
                        >
                          <Eye size={12} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredRecords.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-200 text-xs text-slate-600 gap-3">
            <div>
              Showing{' '}
              <span className="font-semibold text-slate-800">
                {(currentPage - 1) * rowsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * rowsPerPage, filteredRecords.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-800">{filteredRecords.length}</span>{' '}
              records
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-xs font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. DETAILS MODAL */}
      {detailsModalOpen && selectedRecord && (
        <div
          id="charge-commission-details-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setDetailsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: "Charge Details" or "Commission Details" */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    selectedRecord.recordType === 'Charge'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {selectedRecord.recordType === 'Charge' ? (
                    <TrendingDown size={18} />
                  ) : (
                    <TrendingUp size={18} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedRecord.recordType === 'Charge'
                      ? 'Charge Details'
                      : 'Commission Details'}
                  </h2>
                  <p className="text-xs font-mono text-slate-500">
                    {selectedRecord.reference}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Top Financial Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Record Type
                  </span>
                  <span
                    className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedRecord.recordType === 'Charge'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {selectedRecord.recordType}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Direction
                  </span>
                  <span
                    className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedRecord.walletDirection === 'Debit'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {selectedRecord.walletDirection}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Amount
                  </span>
                  <span className="mt-1 font-mono font-bold text-sm text-slate-900 block">
                    {formatZMW(selectedRecord.amount)}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Status
                  </span>
                  <span className="mt-1 block">
                    {getStatusBadge(selectedRecord.status)}
                  </span>
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Record Reference</span>
                  <div className="font-mono font-semibold text-slate-900">
                    {selectedRecord.reference}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Charge / Commission Type</span>
                  <div className="font-medium text-slate-900">{selectedRecord.subType}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Business Scope</span>
                  <div className="font-medium text-slate-900">
                    {selectedRecord.businessName}{' '}
                    <span className="text-slate-500 font-mono font-normal">
                      ({selectedRecord.businessId})
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Agent</span>
                  <div className="font-medium text-slate-900">
                    {selectedRecord.agent ? (
                      `${selectedRecord.agent.name}${
                        selectedRecord.agent.id ? ` (${selectedRecord.agent.id})` : ''
                      }`
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">
                    {selectedRecord.recordType === 'Commission' &&
                    !isActualTransaction(selectedRecord.relatedTransaction)
                      ? 'Related Source'
                      : 'Related Transaction'}
                  </span>
                  <div>
                    {isActualTransaction(selectedRecord.relatedTransaction) ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedRecord.relatedTransaction.startsWith('TB-WLK')) {
                            navigate(
                              `/business-owner/transactions/all/${selectedRecord.relatedTransaction}`
                            );
                          } else {
                            navigate(
                              `/business-owner/transactions/all?search=${selectedRecord.relatedTransaction}`
                            );
                          }
                        }}
                        className="font-mono text-sky-700 hover:text-sky-900 hover:underline flex items-center space-x-1"
                      >
                        <span>{selectedRecord.relatedTransaction}</span>
                        <ExternalLink size={12} />
                      </button>
                    ) : (
                      <span className="font-mono font-medium text-slate-900">
                        {selectedRecord.relatedTransaction}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Wallet Ledger Reference</span>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(
                          `/business-owner/wallets/ledger?search=${selectedRecord.walletLedgerReference}`
                        );
                      }}
                      className="font-mono text-sky-700 hover:text-sky-900 hover:underline flex items-center space-x-1"
                    >
                      <span>{selectedRecord.walletLedgerReference}</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Created Timestamp</span>
                  <div className="text-slate-800 font-medium">{selectedRecord.dateTime}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Completed Timestamp</span>
                  <div className="text-slate-800 font-medium">
                    {selectedRecord.completedAt ? selectedRecord.dateTime : 'Pending'}
                  </div>
                </div>
              </div>

              {/* External Transaction Amount */}
              {selectedRecord.principalAmount > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      External Transaction Amount
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatZMW(selectedRecord.principalAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Wallet Balance Impact */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                  Global Wallet Balance Impact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Global Wallet Balance Before</span>
                    <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                      {formatZMW(selectedRecord.walletBalanceBefore)}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Global Wallet Balance After</span>
                    <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                      {formatZMW(selectedRecord.walletBalanceAfter)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  {selectedRecord.walletDirection === 'Debit'
                    ? `Calculation: ${formatZMW(selectedRecord.walletBalanceBefore)} - ${formatZMW(selectedRecord.amount)} = ${formatZMW(selectedRecord.walletBalanceAfter)}`
                    : `Calculation: ${formatZMW(selectedRecord.walletBalanceBefore)} + ${formatZMW(selectedRecord.amount)} = ${formatZMW(selectedRecord.walletBalanceAfter)}`}
                </div>
              </div>

              {/* 8. LIFECYCLE TIMELINE */}
              <div>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-3">
                  Lifecycle Timeline
                </span>
                <div className="space-y-3">
                  {selectedRecord.lifecycleTimeline.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-start space-x-3 text-xs">
                      <div className="mt-0.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{step.status}</span>
                          <span className="text-slate-500 ml-2">by {step.actor}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                          <Clock size={11} />
                          <span>{step.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isActualTransaction(selectedRecord.relatedTransaction)) {
                      if (selectedRecord.relatedTransaction.startsWith('TB-WLK')) {
                        navigate(`/business-owner/transactions/all/${selectedRecord.relatedTransaction}`);
                      } else {
                        navigate(`/business-owner/transactions/all?search=${selectedRecord.relatedTransaction}`);
                      }
                    } else {
                      navigate(`/business-owner/transactions/commissions?search=${selectedRecord.relatedTransaction}`);
                      setDetailsModalOpen(false);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-sky-700 bg-white border border-sky-200 hover:bg-sky-50 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <ExternalLink size={12} />
                  <span>
                    {isActualTransaction(selectedRecord.relatedTransaction)
                      ? 'View Related Transaction'
                      : 'View Related Source'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/business-owner/wallets/ledger?search=${selectedRecord.walletLedgerReference}`);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <ExternalLink size={12} />
                  <span>View in Wallet Ledger</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
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
export default ChargesCommissionsPage;
