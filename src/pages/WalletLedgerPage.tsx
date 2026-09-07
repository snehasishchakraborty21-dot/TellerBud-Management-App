import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '../services/mockAdminService';
import { useAuth } from '../context/AuthContext';
import { GlobalWalletLedgerRecord, BusinessWallet } from '../types/admin';
import { formatZMW } from '../utils/formatters';

const ENTRY_TYPES = ['Funding', 'Charge', 'Commission', 'Withdrawal'] as const;
type EntryTypeFilter = 'All' | typeof ENTRY_TYPES[number];

export const WalletLedgerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  // Data states
  const [records, setRecords] = useState<GlobalWalletLedgerRecord[]>([]);
  const [wallet, setWallet] = useState<BusinessWallet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<EntryTypeFilter>('All');
  const [selectedDirection, setSelectedDirection] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Details Drawer state
  const [selectedEntry, setSelectedEntry] = useState<GlobalWalletLedgerRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isRelatedModalOpen, setIsRelatedModalOpen] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Initial Data Load
  const loadData = async () => {
    try {
      const [ledgerData, walletData] = await Promise.all([
        adminService.getGlobalWalletLedgerRecords(),
        adminService.getBusinessWallet(),
      ]);
      setRecords(ledgerData);
      setWallet(walletData);

      // Deep link support from search query or reference
      const paramRef = searchParams.get('ref') || searchParams.get('entry');
      if (paramRef) {
        setSearchQuery(paramRef);
        const matched = ledgerData.find(
          (r) =>
            r.ledgerEntry.toLowerCase() === paramRef.toLowerCase() ||
            r.reference.toLowerCase() === paramRef.toLowerCase() ||
            (r.relatedReference && r.relatedReference.toLowerCase() === paramRef.toLowerCase())
        );
        if (matched) {
          setSelectedEntry(matched);
          setIsDrawerOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to load wallet ledger data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to live wallet updates
    const unsubscribe = adminService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [searchParams]);

  // Refresh preserves all current filters
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  // Clear resets all filters and returns to page 1
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedDirection('All');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'All' ||
    selectedDirection !== 'All' ||
    fromDate !== '' ||
    toDate !== '';

  // Filtered Records (Chronological newest first)
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Search filter: Ledger Reference or Source Reference
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchLedger = record.ledgerEntry.toLowerCase().includes(query);
        const matchSource = record.reference.toLowerCase().includes(query);
        const matchAttr = (record.initiatedByAttribution || '').toLowerCase().includes(query);
        const matchAgent = record.agent?.name.toLowerCase().includes(query) ?? false;
        const matchDesc = record.description.toLowerCase().includes(query);

        if (!matchLedger && !matchSource && !matchAttr && !matchAgent && !matchDesc) {
          return false;
        }
      }

      // Entry Type filter
      if (selectedType !== 'All') {
        const entryType = record.entryType || (
          record.transactionType === 'Business Wallet Funding'
            ? 'Funding'
            : record.transactionType === 'TellerBud Charge'
            ? 'Charge'
            : record.transactionType
        );
        if (entryType !== selectedType) {
          return false;
        }
      }

      // Direction filter
      if (selectedDirection !== 'All' && record.direction !== selectedDirection) {
        return false;
      }

      // Date Range filter
      if (fromDate && record.rawDate < fromDate) {
        return false;
      }
      if (toDate && record.rawDate > toDate) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, selectedType, selectedDirection, fromDate, toDate]);

  // Four Summary Cards Calculations directly from visible ledger records
  const summaryCardsData = useMemo(() => {
    // 1. Available Balance: Same shared balance as Global Wallet
    const availableBalance = wallet?.availableBalance ?? wallet?.currentBalance ?? 164350.0;

    // 2. Total Ledger Entries: Calculated directly from visible ledger records
    const totalEntries = filteredRecords.length;

    // 3. Total Credits: Calculated directly from visible ledger records
    const totalCredits = filteredRecords
      .filter((r) => r.direction === 'Credit')
      .reduce((sum, r) => sum + (r.credit ?? r.amount), 0);

    // 4. Total Debits: Calculated directly from visible ledger records
    const totalDebits = filteredRecords
      .filter((r) => r.direction === 'Debit')
      .reduce((sum, r) => sum + (r.debit ?? r.amount), 0);

    return {
      availableBalance,
      totalEntries,
      totalCredits,
      totalDebits,
    };
  }, [wallet, filteredRecords]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Drawer handlers
  const openDrawer = (entry: GlobalWalletLedgerRecord, triggerBtn?: HTMLButtonElement) => {
    if (triggerBtn) {
      drawerTriggerRef.current = triggerBtn;
    }
    setSelectedEntry(entry);
    setIsDrawerOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsRelatedModalOpen(false);
    document.body.style.overflow = 'unset';
    if (drawerTriggerRef.current) {
      drawerTriggerRef.current.focus();
    }
  };

  // Keyboard accessibility (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isRelatedModalOpen) {
          setIsRelatedModalOpen(false);
        } else if (isDrawerOpen) {
          closeDrawer();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isRelatedModalOpen]);

  const copyToClipboard = (text: string, idKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(idKey);
    setTimeout(() => setCopiedRef(null), 1800);
  };

  // Helper for Entry Type pill badge
  const getEntryTypeBadge = (type: string) => {
    switch (type) {
      case 'Funding':
      case 'Business Wallet Funding':
        return 'bg-sky-50 text-[#0D93AA] border-sky-200 font-semibold';
      case 'Charge':
      case 'TellerBud Charge':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      case 'Commission':
        return 'bg-teal-50 text-teal-800 border-teal-200 font-semibold';
      case 'Withdrawal':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  // Attribution helper for Table: Compact format, no Business Owner role truncation
  const getTableAttribution = (entry: GlobalWalletLedgerRecord): string => {
    if (entry.agent) {
      return `${entry.agent.name} — Agent`;
    }
    const attr = entry.initiatedByAttribution || '';
    if (attr.includes('Chileshe Mwamba')) {
      return 'Chileshe Mwamba';
    }
    if (attr.includes('Natasha Zulu')) {
      return 'Natasha Zulu — Agent';
    }
    if (attr.includes('Kelvin Phiri')) {
      return 'Kelvin Phiri — Agent';
    }
    return attr || 'TellerBud Billing Service';
  };

  // Attribution helper for Details Drawer: Complete role included
  const getDrawerAttribution = (entry: GlobalWalletLedgerRecord): string => {
    if (entry.agent) {
      return `${entry.agent.name} — Agent`;
    }
    const attr = entry.initiatedByAttribution || '';
    if (attr.includes('Chileshe Mwamba')) {
      return 'Chileshe Mwamba — Business Owner';
    }
    if (attr.includes('Natasha Zulu')) {
      return 'Natasha Zulu — Agent';
    }
    if (attr.includes('Kelvin Phiri')) {
      return 'Kelvin Phiri — Agent';
    }
    return attr || 'TellerBud Billing Service';
  };

  // Check role authorization (Restricted to Business Owners and TellerBud Admins)
  if (currentUser && currentUser.role !== 'business_owner' && currentUser.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <ShieldCheck size={24} />
        </div>
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          The TellerBud Global Wallet Ledger is restricted to Business Owners and Administrators.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-slate-500">
        <RefreshCw className="w-7 h-7 animate-spin text-[#0D93AA] mb-3" />
        <p className="text-xs font-medium text-slate-700">Loading Wallet Ledger...</p>
      </div>
    );
  }

  return (
    <div id="wallet-ledger-page" className="max-w-7xl mx-auto space-y-5 p-4 sm:p-6 pb-12">
      {/* 1. FOUR COMPACT SUMMARY CARDS */}
      <div
        id="ledger-summary-cards"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* Card 1: Available Balance */}
        <div
          id="summary-card-available-balance"
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              Available Balance
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
              <Wallet size={15} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#0D93AA] tracking-tight">
              {formatZMW(summaryCardsData.availableBalance)}
            </div>
          </div>
        </div>

        {/* Card 2: Total Ledger Entries */}
        <div
          id="summary-card-total-entries"
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              Total Ledger Entries
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <FileText size={15} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {summaryCardsData.totalEntries}
            </div>
          </div>
        </div>

        {/* Card 3: Total Credits */}
        <div
          id="summary-card-total-credits"
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              Total Credits
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ArrowDownLeft size={15} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 tracking-tight">
              +{formatZMW(summaryCardsData.totalCredits)}
            </div>
          </div>
        </div>

        {/* Card 4: Total Debits */}
        <div
          id="summary-card-total-debits"
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              Total Debits
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <ArrowUpRight size={15} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-700 tracking-tight">
              -{formatZMW(summaryCardsData.totalDebits)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER AREA */}
      <div
        id="ledger-filters-container"
        className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3"
      >
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              id="ledger-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ledger or source ref..."
              className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Entry Type Selector */}
          <div className="w-full sm:w-auto min-w-[140px]">
            <select
              id="ledger-filter-entry-type"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as EntryTypeFilter);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white"
            >
              <option value="All">All Entry Types</option>
              {ENTRY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Direction Selector */}
          <div className="w-full sm:w-auto min-w-[130px]">
            <select
              id="ledger-filter-direction"
              value={selectedDirection}
              onChange={(e) => {
                setSelectedDirection(e.target.value as 'All' | 'Credit' | 'Debit');
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white"
            >
              <option value="All">All Directions</option>
              <option value="Credit">Credit (+)</option>
              <option value="Debit">Debit (-)</option>
            </select>
          </div>

          {/* Date Range with Visible Labels (From: & To:) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="ledger-filter-from-date"
                className="text-xs text-slate-500 font-medium whitespace-nowrap"
              >
                From:
              </label>
              <input
                id="ledger-filter-from-date"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="ledger-filter-to-date"
                className="text-xs text-slate-500 font-medium whitespace-nowrap"
              >
                To:
              </label>
              <input
                id="ledger-filter-to-date"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white"
              />
            </div>
          </div>

          {/* Action Buttons: Clear & Refresh always side-by-side */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Clear Button: Disabled when no filter is active, enabled immediately when active */}
            <button
              id="ledger-filter-clear-btn"
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              aria-label="Clear all filters"
            >
              <X size={13} className="text-slate-500" />
              <span>Clear</span>
            </button>

            {/* Refresh Button: Preserves currently selected filters */}
            <button
              id="ledger-filter-refresh-btn"
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
              aria-label="Refresh ledger records"
            >
              <RefreshCw
                size={13}
                className={`text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. LEDGER TABLE SECTION (DESKTOP & TABLET) */}
      <div
        id="wallet-ledger-card"
        className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
      >
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th scope="col" className="py-3 px-3.5 whitespace-nowrap">Ledger Ref</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Posting Date & Time</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Entry Type</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Source Ref</th>
                <th scope="col" className="py-3 px-3 whitespace-nowrap">Initiated By / Attribution</th>
                <th scope="col" className="py-3 px-2 text-center whitespace-nowrap">Direction</th>
                <th scope="col" className="py-3 px-3 text-right whitespace-nowrap">Amount</th>
                <th scope="col" className="py-3 px-3 text-right whitespace-nowrap">Balance After</th>
                <th scope="col" className="py-3 px-3 text-center whitespace-nowrap">Status</th>
                <th scope="col" className="py-3 px-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <Filter className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No matching ledger entries</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Adjust your search query or clear filters to see records.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((entry) => {
                  const resolvedEntryType =
                    entry.entryType ||
                    (entry.transactionType === 'Business Wallet Funding'
                      ? 'Funding'
                      : entry.transactionType === 'TellerBud Charge'
                      ? 'Charge'
                      : entry.transactionType);

                  const tableAttributionText = getTableAttribution(entry);

                  return (
                    <tr
                      key={entry.id}
                      id={`ledger-row-${entry.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* 1. Ledger Reference */}
                      <td className="py-3 px-3.5 font-mono font-bold text-[#0D93AA] whitespace-nowrap">
                        {entry.ledgerEntry}
                      </td>

                      {/* 2. Posting Date & Time */}
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {entry.dateTime}
                      </td>

                      {/* 3. Entry Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${getEntryTypeBadge(
                            resolvedEntryType
                          )}`}
                        >
                          {resolvedEntryType}
                        </span>
                      </td>

                      {/* 4. Source Reference */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {entry.reference}
                      </td>

                      {/* 5. Initiated By / Attribution: Clean format, no truncation */}
                      <td className="py-3 px-3 text-slate-800 font-medium whitespace-nowrap">
                        {tableAttributionText}
                      </td>

                      {/* 6. Direction */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold ${
                            entry.direction === 'Credit' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {entry.direction}
                        </span>
                      </td>

                      {/* 7. Amount */}
                      <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                        {entry.direction === 'Credit' ? (
                          <span className="text-emerald-700">
                            +{formatZMW(entry.credit ?? entry.amount)}
                          </span>
                        ) : (
                          <span className="text-rose-700">
                            -{formatZMW(entry.debit ?? entry.amount)}
                          </span>
                        )}
                      </td>

                      {/* 8. Balance After */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatZMW(entry.balanceAfter)}
                      </td>

                      {/* 9. Status (Posted) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                          {entry.status || 'Posted'}
                        </span>
                      </td>

                      {/* 10. Action (View Details) */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          id={`btn-view-ledger-${entry.id}`}
                          type="button"
                          onClick={(e) => openDrawer(entry, e.currentTarget)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-md transition-colors cursor-pointer"
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

        {/* Mobile Stacked Cards Layout */}
        <div className="block md:hidden divide-y divide-slate-200">
          {paginatedRecords.length === 0 ? (
            <div className="py-10 px-4 text-center text-slate-500">
              <Filter className="w-7 h-7 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No matching ledger entries</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Adjust your search or clear filters to view records.
              </p>
            </div>
          ) : (
            paginatedRecords.map((entry) => {
              const resolvedEntryType =
                entry.entryType ||
                (entry.transactionType === 'Business Wallet Funding'
                  ? 'Funding'
                  : entry.transactionType === 'TellerBud Charge'
                  ? 'Charge'
                  : entry.transactionType);

              const tableAttributionText = getTableAttribution(entry);

              return (
                <div
                  key={entry.id}
                  id={`ledger-card-mobile-${entry.id}`}
                  className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#0D93AA]">
                        {entry.ledgerEntry}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${getEntryTypeBadge(
                          resolvedEntryType
                        )}`}
                      >
                        {resolvedEntryType}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                      {entry.status || 'Posted'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Source Ref</span>
                      <span className="font-mono text-slate-800 font-medium">{entry.reference}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date & Time</span>
                      <span className="text-slate-700">{entry.dateTime}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attribution</span>
                      <span className="text-slate-800 font-medium block">{tableAttributionText}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Amount</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          entry.direction === 'Credit' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {entry.direction === 'Credit' ? '+' : '-'}
                        {formatZMW(entry.amount)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Balance After</span>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {formatZMW(entry.balanceAfter)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 text-right">
                    <button
                      type="button"
                      onClick={(e) => openDrawer(entry, e.currentTarget)}
                      className="w-full py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. PAGINATION CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/60 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <span className="font-semibold text-slate-800">
                {filteredRecords.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * rowsPerPage, filteredRecords.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{filteredRecords.length}</span>{' '}
              ledger entries
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-slate-400">Rows:</span>
              <select
                id="ledger-rows-per-page-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Previous / Next Controls */}
          <div className="flex items-center gap-1.5">
            <button
              id="ledger-page-prev-btn"
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="px-3 py-1 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>

            <button
              id="ledger-page-next-btn"
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || filteredRecords.length === 0}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. WALLET LEDGER DETAILS DRAWER (READ-ONLY) */}
      {isDrawerOpen && selectedEntry && (
        <div
          id="wallet-ledger-details-drawer"
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity animate-in fade-in"
            onClick={closeDrawer}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl sm:w-[500px] md:w-[540px] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
              {/* Drawer Header: Sticky */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 id="drawer-title" className="text-base font-bold text-slate-900">
                      Wallet Ledger Details
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-slate-500">
                      <span>{selectedEntry.ledgerEntry}</span>
                      <span>&bull;</span>
                      <span>{selectedEntry.reference}</span>
                    </div>
                  </div>
                </div>

                <button
                  id="drawer-close-x-btn"
                  type="button"
                  onClick={closeDrawer}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content: Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700">
                {/* Balance & Amount Highlights */}
                <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Balance Before
                    </span>
                    <span className="font-mono font-semibold text-xs sm:text-sm text-slate-800 mt-1 block">
                      {formatZMW(selectedEntry.balanceBefore)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {selectedEntry.direction === 'Credit' ? 'Credit Amount' : 'Debit Amount'}
                    </span>
                    <span
                      className={`font-mono font-bold text-xs sm:text-sm mt-1 block ${
                        selectedEntry.direction === 'Credit' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {selectedEntry.direction === 'Credit' ? '+' : '-'}
                      {formatZMW(selectedEntry.amount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Balance After
                    </span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 mt-1 block">
                      {formatZMW(selectedEntry.balanceAfter)}
                    </span>
                  </div>
                </div>

                {/* Calculation Block */}
                <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                      Ledger Balance Calculation
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block">
                      {selectedEntry.direction === 'Credit' ? (
                        <span>
                          {formatZMW(selectedEntry.balanceBefore)} +{' '}
                          <span className="text-emerald-700 font-bold">{formatZMW(selectedEntry.amount)}</span> ={' '}
                          {formatZMW(selectedEntry.balanceAfter)}
                        </span>
                      ) : (
                        <span>
                          {formatZMW(selectedEntry.balanceBefore)} -{' '}
                          <span className="text-rose-700 font-bold">{formatZMW(selectedEntry.amount)}</span> ={' '}
                          {formatZMW(selectedEntry.balanceAfter)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white text-[#0D93AA] flex items-center justify-center border border-sky-200 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                </div>

                {/* Core Record Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Wallet Ledger Reference</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {selectedEntry.ledgerEntry}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedEntry.ledgerEntry, 'ledger')}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Copy Ledger Reference"
                      >
                        {copiedRef === 'ledger' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Source Reference</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {selectedEntry.reference}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedEntry.reference, 'source')}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Copy Source Reference"
                      >
                        {copiedRef === 'source' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Entry Type</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${getEntryTypeBadge(
                          selectedEntry.entryType || selectedEntry.transactionType
                        )}`}
                      >
                        {selectedEntry.entryType || selectedEntry.transactionType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Direction</span>
                    <span
                      className={`font-bold mt-1 block text-xs ${
                        selectedEntry.direction === 'Credit' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {selectedEntry.direction}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Amount</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block text-xs">
                      {formatZMW(selectedEntry.amount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Status</span>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                        {selectedEntry.status || 'Posted'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Posting Date & Time</span>
                    <span className="font-medium text-slate-900 mt-0.5 block text-xs">
                      {selectedEntry.dateTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Business Name & ID</span>
                    <span className="font-medium text-slate-900 mt-0.5 block text-xs">
                      {selectedEntry.businessName} ({selectedEntry.businessId})
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-medium block">Initiated By / Attribution</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block text-xs">
                      {getDrawerAttribution(selectedEntry)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Description
                  </span>
                  <p className="text-xs text-slate-800 mt-1 leading-relaxed">
                    {selectedEntry.description}
                  </p>
                </div>

                {/* View Related Record Action */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Related Record
                    </span>
                    <span className="font-mono font-semibold text-xs text-slate-900 mt-0.5 block">
                      {selectedEntry.reference}
                    </span>
                  </div>
                  <button
                    id="btn-view-related-record"
                    type="button"
                    onClick={() => setIsRelatedModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-white border border-[#0D93AA]/30 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>View Related Record</span>
                    <ExternalLink size={12} />
                  </button>
                </div>

                {/* Lifecycle Timeline */}
                {selectedEntry.lifecycleHistory && selectedEntry.lifecycleHistory.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                      Lifecycle Timeline
                    </span>
                    <div className="space-y-2">
                      {selectedEntry.lifecycleHistory.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50/60"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-slate-900">{step.step}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {step.timestamp}
                              </span>
                            </div>
                            {step.actor && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Actor: <span className="text-slate-700 font-medium">{step.actor}</span>
                              </p>
                            )}
                            {step.details && (
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{step.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audit Note */}
                <div className="p-3 bg-slate-100/80 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-[#0D93AA] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      Ledger Audit Note
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedEntry.entryType === 'Withdrawal' || selectedEntry.transactionType === 'Withdrawal'
                        ? 'Immutable ledger entry. Recorded only after the withdrawal payout was completed and marked Paid.'
                        : 'Immutable ledger entry. Recorded upon completed wallet settlement.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drawer Footer: Sticky (Read-only, no Edit / Delete / Reverse / Adjust actions) */}
              <div className="sticky bottom-0 z-10 flex items-center justify-between px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200">
                <span className="text-[11px] text-slate-400 font-mono">
                  BIZ-LUS-001 &bull; {selectedEntry.ledgerEntry}
                </span>
                <button
                  id="drawer-footer-close-btn"
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. RELATED RECORD DETAILS MODAL */}
      {isRelatedModalOpen && selectedEntry && (
        <div
          id="related-record-modal"
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="related-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsRelatedModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center">
                  <ExternalLink size={15} />
                </div>
                <div>
                  <h3 id="related-modal-title" className="text-sm font-bold text-slate-900">
                    {selectedEntry.entryType || selectedEntry.transactionType} Source Record
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">{selectedEntry.reference}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRelatedModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Source Reference</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{selectedEntry.reference}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Ledger Reference</span>
                  <span className="font-mono font-bold text-[#0D93AA] mt-0.5 block">{selectedEntry.ledgerEntry}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Amount</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{formatZMW(selectedEntry.amount)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                    {selectedEntry.entryType === 'Withdrawal' ? 'Paid' : 'Completed & Settled'}
                  </span>
                </div>
                {selectedEntry.entryType === 'Withdrawal' && (
                  <>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Payout Method</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">MTN Mobile Money</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination Account</span>
                      <span className="font-mono font-semibold text-slate-800 mt-0.5 block">+260 96 ••• ••84</span>
                    </div>
                  </>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Attribution & Origin</span>
                <p className="text-slate-800 font-medium mt-0.5">
                  {getDrawerAttribution(selectedEntry)}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Operational Context</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedEntry.description}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-sky-50/60 border border-sky-200 rounded-lg">
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase block">Navigate to Module</span>
                  <span className="text-xs text-slate-600">
                    {selectedEntry.entryType === 'Funding' || selectedEntry.entryType === 'Withdrawal'
                      ? 'View in Global Wallet Activity'
                      : 'View in Charges & Commissions'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRelatedModalOpen(false);
                    closeDrawer();
                    if (selectedEntry.entryType === 'Funding' || selectedEntry.entryType === 'Withdrawal') {
                      navigate('/business-owner/wallets/global-wallet');
                    } else {
                      navigate('/business-owner/transactions/commissions');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7b8f] rounded-lg transition-colors cursor-pointer"
                >
                  <span>Go to Module</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRelatedModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Back to Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
