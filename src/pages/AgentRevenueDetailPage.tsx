import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  RotateCcw,
  RefreshCw,
  Download,
  Building2,
  Store as StoreIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Coins,
  Landmark,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  MOCK_BUSINESS_AGENTS,
  MOCK_AGENT_TRANSACTION_REVENUE_RECORDS,
  formatCurrencyAmount,
  isEligibleRevenueTransaction,
  BusinessAgentRevenueConfig,
} from '../data/mockChargesCommissionsData';
import { AgentTransactionRevenueRecord } from '../types/chargesCommissions';
import { formatZMW } from '../utils/formatters';

export const AgentRevenueDetailPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Logged-in business owner's business ID
  const currentBusinessId = currentUser?.businessId || 'BIZ-LUS-001';

  // Loading & error state simulation
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [service, setService] = useState('All');
  const [transactionType, setTransactionType] = useState('All');
  const [provider, setProvider] = useState('All');
  const [status, setStatus] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Simulate loading delay for clean UX
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [agentId]);

  // Find the agent by unique Agent ID
  const agent: BusinessAgentRevenueConfig | undefined = useMemo(() => {
    if (!agentId) return undefined;
    const cleanId = agentId.trim().toLowerCase();
    return MOCK_BUSINESS_AGENTS.find(
      (a) =>
        a.agentId.toLowerCase() === cleanId ||
        a.agentId.replace('-01', '').toLowerCase() === cleanId ||
        cleanId.startsWith(a.agentId.toLowerCase())
    );
  }, [agentId]);

  // Security check: Verify tenant isolation
  const isAgentInBusiness = useMemo(() => {
    if (!agent) return false;
    // Super admins can view all, business owners can only view their own
    if (currentUser?.role === 'super_admin') return true;
    return agent.businessId === currentBusinessId;
  }, [agent, currentBusinessId, currentUser]);

  // Base transactions belonging exclusively to this agent and verified business
  const agentAllTransactions = useMemo(() => {
    if (!agent || !isAgentInBusiness) return [];
    return MOCK_AGENT_TRANSACTION_REVENUE_RECORDS.filter(
      (t) =>
        t.agentId === agent.agentId ||
        t.agentId.replace('-01', '') === agent.agentId.replace('-01', '')
    );
  }, [agent, isAgentInBusiness]);

  // Agent summary cards data (must match Agent Revenue Breakdown listing row exactly)
  const agentSummary = useMemo(() => {
    const eligibleTxns = agentAllTransactions.filter((t) => isEligibleRevenueTransaction(t.status));
    const completedTransactions = eligibleTxns.length;
    const reservationCharges = eligibleTxns.reduce((sum, t) => sum + (t.reservationCharge || 0), 0);
    const tellerBudCharges = eligibleTxns.reduce((sum, t) => sum + (t.tellerBudCharge || 0), 0);
    const roundedRes = Math.round(reservationCharges * 100) / 100;
    const roundedTB = Math.round(tellerBudCharges * 100) / 100;
    const revenueGenerated = Math.round((roundedRes - roundedTB) * 100) / 100;

    return {
      completedTransactions,
      reservationCharges: roundedRes,
      tellerBudCharges: roundedTB,
      revenueGenerated,
    };
  }, [agentAllTransactions]);

  // Unique options for filter dropdowns
  const serviceOptions = useMemo(() => {
    const set = new Set(agentAllTransactions.map((t) => t.service));
    return ['All', ...Array.from(set)];
  }, [agentAllTransactions]);

  const transactionTypeOptions = useMemo(() => {
    const set = new Set(agentAllTransactions.map((t) => t.transactionType).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [agentAllTransactions]);

  const providerOptions = useMemo(() => {
    const set = new Set(agentAllTransactions.map((t) => t.provider));
    return ['All', ...Array.from(set)];
  }, [agentAllTransactions]);

  const statusOptions = useMemo(() => {
    const set = new Set(agentAllTransactions.map((t) => t.status));
    return ['All', ...Array.from(set)];
  }, [agentAllTransactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return agentAllTransactions.filter((t) => {
      // Search by transaction reference or customer
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesRef = t.transactionReference.toLowerCase().includes(q);
        const matchesCust = t.customer.toLowerCase().includes(q);
        const matchesChg = t.chargeRecord.toLowerCase().includes(q);
        if (!matchesRef && !matchesCust && !matchesChg) return false;
      }

      // Date range filter
      if (fromDate && t.rawDate < fromDate) return false;
      if (toDate && t.rawDate > toDate) return false;

      // Dropdowns
      if (service !== 'All' && t.service !== service) return false;
      if (transactionType !== 'All' && t.transactionType !== transactionType) return false;
      if (provider !== 'All' && t.provider !== provider) return false;
      if (status !== 'All' && t.status !== status) return false;

      return true;
    });
  }, [agentAllTransactions, search, fromDate, toDate, service, transactionType, provider, status]);

  // Table summary totals for current filtered set
  const filteredTotals = useMemo(() => {
    const eligibleFiltered = filteredTransactions.filter((t) => isEligibleRevenueTransaction(t.status));
    const completedTransactions = eligibleFiltered.length;
    const reservationCharges = eligibleFiltered.reduce((sum, t) => sum + (t.reservationCharge || 0), 0);
    const tellerBudCharges = eligibleFiltered.reduce((sum, t) => sum + (t.tellerBudCharge || 0), 0);
    const roundedRes = Math.round(reservationCharges * 100) / 100;
    const roundedTB = Math.round(tellerBudCharges * 100) / 100;
    const revenueGenerated = Math.round((roundedRes - roundedTB) * 100) / 100;

    return {
      completedTransactions,
      reservationCharges: roundedRes,
      tellerBudCharges: roundedTB,
      revenueGenerated,
    };
  }, [filteredTransactions]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate, service, transactionType, provider, status, pageSize]);

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setService('All');
    setTransactionType('All');
    setProvider('All');
    setStatus('All');
    setCurrentPage(1);
  };

  // Refresh trigger
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // CSV Export for filtered transactions
  const handleExportTransactions = () => {
    const headers = [
      'Transaction Reference',
      'Date and Time',
      'Customer',
      'Service',
      'Transaction Type',
      'Provider',
      'Store / Booth',
      'Transaction Amount (ZMW)',
      'Reservation Charges (ZMW)',
      'TellerBud Charges (ZMW)',
      'Revenue Generated (ZMW)',
      'Status',
    ];

    const rows = filteredTransactions.map((t) => [
      t.transactionReference,
      `"${t.dateTime}"`,
      `"${t.customer}"`,
      `"${t.service}"`,
      `"${t.transactionType || ''}"`,
      `"${t.provider}"`,
      `"${t.storeName} / ${t.boothName}"`,
      formatCurrencyAmount(t.transactionAmount),
      formatCurrencyAmount(t.reservationCharge),
      formatCurrencyAmount(t.tellerBudCharge),
      formatCurrencyAmount(t.revenueGenerated),
      t.status,
    ]);

    // Summary totals row
    rows.push([
      '"Total (Eligible Filtered)"',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      formatCurrencyAmount(filteredTotals.reservationCharges),
      formatCurrencyAmount(filteredTotals.tellerBudCharges),
      formatCurrencyAmount(filteredTotals.revenueGenerated),
      '""',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `tellerbud_transactions_${agent?.agentId || 'agent'}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Back button handler
  const handleBack = () => {
    // Preserve tab and scroll state if passed or return to breakdown tab
    if (location.state && (location.state as any).returnTab) {
      navigate('/business-owner/charges-revenue', {
        state: { activeTab: (location.state as any).returnTab },
      });
    } else {
      navigate('/business-owner/charges-revenue', {
        state: { activeTab: 'agent-breakdown' },
      });
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-8 space-y-3">
        <RefreshCw className="w-8 h-8 text-[#0D93AA] animate-spin" />
        <div className="text-sm font-medium text-slate-600">Loading agent revenue details...</div>
      </div>
    );
  }

  // 2. Not Found State
  if (!agent) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Charges &amp; Revenue
        </button>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Agent Not Found</h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            The Agent ID <span className="font-mono font-semibold text-slate-800">{agentId}</span> could not be found in our records.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#0D93AA] text-white text-sm font-semibold rounded-lg hover:bg-[#0b7f94] transition-colors cursor-pointer"
          >
            Return to Charges &amp; Revenue
          </button>
        </div>
      </div>
    );
  }

  // 3. Access Denied State (Tenant Isolation)
  if (!isAgentInBusiness) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Charges &amp; Revenue
        </button>
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-xs">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            You do not have permission to view revenue records for agents belonging to another business organization.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Return to Charges &amp; Revenue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="agent-revenue-details-container"
      className="w-full space-y-5 px-3 sm:px-6 pt-3 pb-8 max-w-[1600px] mx-auto"
    >
      {/* 1. TOP NAVIGATION & HEADING */}
      <div className="space-y-2">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0D93AA] transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Charges &amp; Revenue</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-lg sm:text-xl flex items-center justify-center shadow-xs shrink-0">
              {agent.avatarInitials}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
                <span>Agent Revenue Details – {agent.agentName}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                <span className="font-mono font-semibold text-slate-800">{agent.agentId}</span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <Building2 size={14} className="text-slate-400" />
                  {agent.storeName}
                </span>
                <span className="text-slate-300">|</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {agent.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh transaction data"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. AGENT SUMMARY CARDS (Equal Width, Height, Spacing) */}
      <div
        id="agent-summary-cards"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Completed Transactions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3 h-full">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Transactions
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {agentSummary.completedTransactions}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 2: Reservation Charges */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3 h-full">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reservation Charges
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {formatZMW(agentSummary.reservationCharges)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Coins size={20} />
          </div>
        </div>

        {/* Card 3: TellerBud Charges */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3 h-full">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              TellerBud Charges
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#0D93AA] mt-1">
              {formatZMW(agentSummary.tellerBudCharges)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-50 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Landmark size={20} />
          </div>
        </div>

        {/* Card 4: Revenue Generated */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3 h-full">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Revenue Generated
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1">
              {formatZMW(agentSummary.revenueGenerated)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
        </div>
      </div>

      {/* 3. AGENT TRANSACTIONS SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Transactions Executed by {agent.agentName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Eligible completed transactions handled by this agent contributing to business revenue.
            </p>
          </div>
          <button
            onClick={handleExportTransactions}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <Download size={14} />
            <span>Export Transactions</span>
          </button>
        </div>

        {/* Filters Controls Section */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white"
              />
            </div>

            {/* From Date */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white"
              />
            </div>

            {/* To Date */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white"
              />
            </div>

            {/* Service */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Service
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white cursor-pointer"
              >
                {serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Services' : opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Type */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white cursor-pointer"
              >
                {transactionTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Types' : opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* Provider */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Provider:</span>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
                >
                  {providerOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === 'All' ? 'All Providers' : opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === 'All' ? 'All Statuses' : opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10">
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Transaction Reference</th>
                <th className="px-4 py-3 text-left">Date and Time</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Transaction Type</th>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-left">Store / Booth</th>
                <th className="px-4 py-3 text-left">Transaction Amount (ZMW)</th>
                <th className="px-4 py-3 text-left">Reservation Charges (ZMW)</th>
                <th className="px-4 py-3 text-left">TellerBud Charges (ZMW)</th>
                <th className="px-4 py-3 text-left">Revenue Generated (ZMW)</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-semibold text-slate-700 text-sm">No transactions match criteria</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Try clearing filters or changing the selected date range.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Transaction Reference */}
                    <td className="px-4 py-3 text-left font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {t.transactionReference}
                    </td>

                    {/* 2. Date and Time */}
                    <td className="px-4 py-3 text-left text-slate-600 whitespace-nowrap">
                      {t.dateTime}
                    </td>

                    {/* 3. Customer */}
                    <td className="px-4 py-3 text-left font-medium text-slate-800 whitespace-nowrap">
                      {t.customer}
                    </td>

                    {/* 4. Service */}
                    <td className="px-4 py-3 text-left text-slate-700 whitespace-nowrap">
                      {t.service}
                    </td>

                    {/* 5. Transaction Type */}
                    <td className="px-4 py-3 text-left text-slate-700 whitespace-nowrap">
                      {t.transactionType || 'Cash Withdrawal'}
                    </td>

                    {/* 6. Provider */}
                    <td className="px-4 py-3 text-left text-slate-700 whitespace-nowrap">
                      {t.provider}
                    </td>

                    {/* 7. Store / Booth */}
                    <td className="px-4 py-3 text-left text-slate-600 whitespace-nowrap">
                      <span>{t.storeName}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-slate-500">{t.boothName}</span>
                    </td>

                    {/* 8. Transaction Amount (ZMW) - Principal value */}
                    <td className="px-4 py-3 text-left font-mono font-medium text-slate-900 whitespace-nowrap">
                      {formatCurrencyAmount(t.transactionAmount)}
                    </td>

                    {/* 9. Reservation Charges (ZMW) */}
                    <td className="px-4 py-3 text-left font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrencyAmount(t.reservationCharge)}
                    </td>

                    {/* 10. TellerBud Charges (ZMW) */}
                    <td className="px-4 py-3 text-left font-mono font-medium text-slate-700 whitespace-nowrap">
                      {formatCurrencyAmount(t.tellerBudCharge)}
                    </td>

                    {/* 11. Revenue Generated (ZMW) = Reservation Charges - TellerBud Charges */}
                    <td className="px-4 py-3 text-left font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {formatCurrencyAmount(t.revenueGenerated)}
                    </td>

                    {/* 12. Status */}
                    <td className="px-4 py-3 text-left whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          t.status === 'Posted' || t.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'Posted' || t.status === 'Completed'
                              ? 'bg-emerald-500'
                              : t.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer: Summary Reconciled Totals */}
            {filteredTransactions.length > 0 && (
              <tfoot className="bg-slate-50/95 border-t-2 border-slate-200 text-xs font-bold text-slate-900 sticky bottom-0">
                <tr>
                  <td className="px-4 py-3.5 text-left" colSpan={7}>
                    Total ({filteredTransactions.length} Filtered Transactions)
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono text-slate-400">
                    —
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono text-slate-900">
                    {formatCurrencyAmount(filteredTotals.reservationCharges)}
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono text-slate-700">
                    {formatCurrencyAmount(filteredTotals.tellerBudCharges)}
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono text-emerald-700">
                    {formatCurrencyAmount(filteredTotals.revenueGenerated)}
                  </td>
                  <td className="px-4 py-3.5 text-left">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Reconciled with Agent Summary
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2">
              Showing{' '}
              <span className="font-semibold text-slate-800">
                {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * pageSize, filteredTransactions.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{filteredTransactions.length}</span> records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AgentRevenueDetailPage;
