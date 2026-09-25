import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Coins,
  Users,
  Building2,
  Landmark,
  Clock,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  FileCheck,
} from 'lucide-react';
import {
  MOCK_CHARGES_COMMISSIONS_KPIS,
  MOCK_CHARGE_RECORDS,
  calculateRevenueKpis,
  MOCK_AGENT_TRANSACTION_REVENUE_RECORDS,
  calculateAgentRevenueBreakdown,
  MOCK_BUSINESS_AGENTS,
  formatCurrencyAmount,
} from '../data/mockChargesCommissionsData';
import {
  ChargeRecord,
  ChargeStatus,
  AgentRevenueFilters,
} from '../types/chargesCommissions';
import { formatZmwListingAmount } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { AgentRevenueBreakdownTable } from '../components/charges/AgentRevenueBreakdownTable';

const SERVICES_OPTIONS = [
  'All Services',
  'Cash Pickup',
  'Walk-In Transaction',
  'Agent-to-Agent Liquidity',
  'Customer Withdrawal',
  'Business Wallet Transaction',
];

const PROVIDERS_OPTIONS = [
  'All Providers',
  'MTN Mobile Money',
  'Airtel Money',
  'Zamtel',
  'Zanaco',
  'FNB',
  'INDO',
  'Stanbic',
  'Access',
  'TellerBud Ledger',
];

const STATUSES_OPTIONS = [
  'All Statuses',
  'Pending',
  'Accrued',
  'Posted',
  'Settled',
  'Cancelled',
];

function formatZMW(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const ChargesCommissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const isBusinessOwner =
    currentUser?.role === 'business_owner' ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/business-owner'));

  const currentBusinessId = currentUser?.businessId || 'BIZ-LUS-001';
  const currentBusinessName = currentUser?.businessName || 'Lusaka Central Express Agency';

  // Active Tab: 'charges' (default) | 'agent-breakdown'
  const [activeTab, setActiveTab] = useState<'agent-breakdown' | 'charges'>(() => {
    if (location.state && (location.state as any).activeTab) {
      const tab = (location.state as any).activeTab;
      if (tab === 'agent-breakdown' || tab === 'charges') return tab;
    }
    return 'charges';
  });

  // Agent Revenue Breakdown Filters
  const [agentFilters, setAgentFilters] = useState<AgentRevenueFilters>(() => {
    if (location.state && (location.state as any).filters) {
      return (location.state as any).filters;
    }
    return {
      fromDate: '',
      toDate: '',
      storeId: 'All',
      boothId: 'All',
      agentId: 'All',
    };
  });

  // Restore state if location.state changes
  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
    if (location.state && (location.state as any).filters) {
      setAgentFilters((location.state as any).filters);
    }
  }, [location.state]);

  // Business stores and booths for logged-in business
  const businessStores = useMemo(
    () => [
      { id: 'STR-LUS-001', name: 'Cairo Road Flagship Store' },
      { id: 'STR-LUS-002', name: 'Woodlands Mall Agency Branch' },
      { id: 'STR-LUS-003', name: 'Matero East Hub' },
    ],
    []
  );

  const businessBooths = useMemo(
    () => [
      { id: 'BTH-LUS-101', name: 'Counter 1 - Cash & Float Desk', storeId: 'STR-LUS-001' },
      { id: 'BTH-LUS-102', name: 'Counter 2 - MNO Pickup Hub', storeId: 'STR-LUS-001' },
      { id: 'BTH-LUS-103', name: 'Counter 3 - Express Walk-in Desk', storeId: 'STR-LUS-001' },
      { id: 'BTH-LUS-201', name: 'Booth 1 - Banking Services', storeId: 'STR-LUS-002' },
      { id: 'BTH-LUS-202', name: 'Booth 2 - Cash In / Cash Out', storeId: 'STR-LUS-002' },
      { id: 'BTH-LUS-301', name: 'Booth 1 - Main Till', storeId: 'STR-LUS-003' },
      { id: 'BTH-LUS-302', name: 'Booth 2 - Fast Cash Desk', storeId: 'STR-LUS-003' },
    ],
    []
  );

  // Business agents belonging strictly to currentBusinessId (Tenant isolation)
  const businessAgents = useMemo(() => {
    return MOCK_BUSINESS_AGENTS.filter((a) => a.businessId === currentBusinessId);
  }, [currentBusinessId]);

  // Agent revenue breakdown and 100% reconciling KPIs
  const { breakdown: agentBreakdown, kpis: agentKpis } = useMemo(() => {
    return calculateAgentRevenueBreakdown(
      MOCK_AGENT_TRANSACTION_REVENUE_RECORDS,
      currentBusinessId,
      agentFilters
    );
  }, [currentBusinessId, agentFilters]);

  // Common Filter States (for Charges & Revenue records tabs)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State for Charges & Revenue records tabs
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedService('All Services');
    setSelectedProvider('All Providers');
    setSelectedStatus('All Statuses');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  useEffect(() => {
    document.title = 'Charges & Revenue | TellerBud';
  }, []);

  // Filter Charge Records (Strict tenant isolation to current business)
  const filteredChargeRecords = useMemo(() => {
    return MOCK_CHARGE_RECORDS.filter((rec) => {
      // Business-level data isolation
      if (isBusinessOwner && rec.businessId && rec.businessId !== currentBusinessId) return false;

      // Reservation Charge applies strictly to Customer Cash Pickup requests
      if (rec.service !== 'Cash Pickup') return false;
      // Valid Cash Pickup transaction types: Deposit, Withdrawal, Purchase
      if (!['Deposit', 'Withdrawal', 'Purchase'].includes(rec.transactionType)) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchRef = rec.reference.toLowerCase().includes(q);
        const matchTxn = rec.transactionReference.toLowerCase().includes(q);
        const matchCust = rec.customerName.toLowerCase().includes(q);
        const matchCustId = rec.customerId.toLowerCase().includes(q);
        const matchAgent = rec.agentName?.toLowerCase().includes(q) || false;
        const matchBiz = rec.businessName?.toLowerCase().includes(q) || false;
        if (!matchRef && !matchTxn && !matchCust && !matchCustId && !matchAgent && !matchBiz) {
          return false;
        }
      }

      // Service
      if (selectedService !== 'All Services') {
        if (rec.service !== selectedService) return false;
      }

      // Provider
      if (selectedProvider !== 'All Providers') {
        if (rec.provider !== selectedProvider) return false;
      }

      // Status
      if (selectedStatus !== 'All Statuses') {
        if (rec.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }

      // Date Range
      if (fromDate && rec.rawDate < fromDate) return false;
      if (toDate && rec.rawDate > toDate) return false;

      return true;
    }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [
    isBusinessOwner,
    currentBusinessId,
    searchQuery,
    selectedService,
    selectedProvider,
    selectedStatus,
    fromDate,
    toDate,
  ]);

  // Active records for charges tab
  const activeRecords = filteredChargeRecords;
  const totalRecordsCount = activeRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / rowsPerPage));

  // Current page records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return activeRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [activeRecords, currentPage, rowsPerPage]);

  const handleViewDetails = (recordId: string) => {
    if (isBusinessOwner) {
      navigate(`/business-owner/transactions/commissions/${recordId}`);
    } else {
      navigate(`/super-admin/transactions/commissions/${recordId}`);
    }
  };

  // Dynamic revenue calculation for charge records
  const revenueKpis = useMemo(() => {
    return calculateRevenueKpis(filteredChargeRecords, []);
  }, [filteredChargeRecords]);

  // Active reconciling KPIs:
  // When viewing Agent Revenue Breakdown, use agentKpis which guarantees exact reconciliation
  // with the listing totals across all filtered agents.
  const activeKpis = useMemo(() => {
    if (activeTab === 'agent-breakdown') {
      return agentKpis;
    }
    return revenueKpis;
  }, [activeTab, agentKpis, revenueKpis]);

  // Export filtered charge records to CSV
  const handleExport = () => {
    const headers = [
      'Charge Record',
      'Transaction Ref',
      'Created At',
      'Customer Name',
      'Customer ID',
      'Service',
      'Provider',
      'Transaction Amount (ZMW)',
      'Reservation Charge (ZMW)',
      'Status',
    ];
    const rows = (activeRecords as ChargeRecord[]).map((r) => [
      r.reference,
      r.transactionReference,
      r.createdAt,
      `"${r.customerName}"`,
      r.customerId,
      r.service,
      r.provider,
      r.transactionAmount.toFixed(2),
      r.reservationCharge.toFixed(2),
      r.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tellerbud_charges_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Charge status pill styling
  const renderChargeStatus = (status: ChargeStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            Pending
          </span>
        );
      case 'Posted':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            Posted
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const startRecordNum = totalRecordsCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecordNum = Math.min(currentPage * rowsPerPage, totalRecordsCount);

  return (
    <div
      id="charges-commissions-container"
      aria-label="Charges & Revenue"
      className="w-full space-y-4 px-3 sm:px-6 pt-2 pb-4"
    >
      <h1 className="sr-only">Charges &amp; Revenue</h1>
      {/* 1. THREE COMPACT SUMMARY CARDS (Single horizontal line, equal height and width) */}
      <div
        id="kpi-summary-cards"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Card 1: Reservation Charges */}
        <div
          id="kpi-reservation-charges"
          className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-3 h-full"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 whitespace-nowrap">
            <span
              className="text-sm font-semibold text-slate-700 normal-case whitespace-nowrap"
              style={{ textTransform: 'none' }}
            >
              Reservation Charges
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900 tracking-tight whitespace-nowrap">
              {formatZMW(activeKpis.reservationCharges)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0D93AA] flex items-center justify-center flex-shrink-0">
            <Coins size={18} />
          </div>
        </div>

        {/* Card 2: TellerBud Charges */}
        <div
          id="kpi-tellerbud-charges"
          className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-3 h-full"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 whitespace-nowrap">
            <span
              className="text-sm font-semibold text-slate-700 normal-case whitespace-nowrap"
              style={{ textTransform: 'none' }}
            >
              TellerBud Charges
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#0D93AA] tracking-tight whitespace-nowrap">
              {formatZMW(activeKpis.tellerBudCharges)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-50 text-[#0D93AA] flex items-center justify-center flex-shrink-0">
            <Landmark size={18} />
          </div>
        </div>

        {/* Card 3: Business Revenue */}
        <div
          id="kpi-business-revenue"
          className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-3 h-full"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 whitespace-nowrap">
            <span
              className="text-sm font-semibold text-slate-700 normal-case whitespace-nowrap"
              style={{ textTransform: 'none' }}
            >
              Business Revenue
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-700 tracking-tight whitespace-nowrap">
              {formatZMW(activeKpis.businessRevenue)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} />
          </div>
        </div>
      </div>

      {/* 2. TABS: Agent Revenue Breakdown (default), Charge Records & Revenue Records */}
      <div id="tabs-header" className="border-b border-slate-200 bg-white px-2 sm:px-3 rounded-t-xl">
        <nav className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto" aria-label="Tabs">
          <button
            id="tab-agent-breakdown"
            type="button"
            onClick={() => setActiveTab('agent-breakdown')}
            className={`flex items-center gap-2 py-2 px-3 sm:px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'agent-breakdown'
                ? 'border-[#0D93AA] text-[#0D93AA] bg-cyan-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users size={15} />
            <span>Agent Revenue Breakdown</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                activeTab === 'agent-breakdown'
                  ? 'bg-[#0D93AA]/15 text-[#0D93AA]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {agentBreakdown.length}
            </span>
          </button>

          <button
            id="tab-charge-records"
            type="button"
            onClick={() => {
              setActiveTab('charges');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 py-2 px-3 sm:px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'charges'
                ? 'border-[#0D93AA] text-[#0D93AA] bg-cyan-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Coins size={15} />
            <span>Charge Records</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                activeTab === 'charges'
                  ? 'bg-[#0D93AA]/15 text-[#0D93AA]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {filteredChargeRecords.length}
            </span>
          </button>
        </nav>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'agent-breakdown' ? (
        <AgentRevenueBreakdownTable
          breakdown={agentBreakdown}
          allTransactions={MOCK_AGENT_TRANSACTION_REVENUE_RECORDS}
          filters={agentFilters}
          onFilterChange={setAgentFilters}
          stores={businessStores}
          booths={businessBooths}
          agents={businessAgents}
          onResetFilters={() =>
            setAgentFilters({
              fromDate: '',
              toDate: '',
              storeId: 'All',
              boothId: 'All',
              agentId: 'All',
            })
          }
        />
      ) : (
        <>
          {/* COMMON FILTERS SECTION (Compact single horizontal line layout) */}
          <div
            id="filter-controls-section"
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 sm:px-4 shadow-sm"
          >
            <div className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 w-full">
              {/* Filter controls: From Date, To Date, All Services, All Providers, All Statuses, Clear Filters, Refresh */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                {/* 1. From Date */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <label
                    htmlFor="filter-from-date"
                    className="text-xs font-semibold text-slate-700 whitespace-nowrap"
                  >
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
                    className="h-[34px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
                    title="From Date"
                  />
                </div>

                {/* 2. To Date */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <label
                    htmlFor="filter-to-date"
                    className="text-xs font-semibold text-slate-700 whitespace-nowrap"
                  >
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
                    className="h-[34px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
                    title="To Date"
                  />
                </div>

                {/* 3. All Services */}
                <div className="flex-1 min-w-[120px] max-w-[160px] flex-shrink-0">
                  <select
                    id="filter-service-select"
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-[34px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer truncate"
                  >
                    {SERVICES_OPTIONS.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. All Providers */}
                <div className="flex-1 min-w-[120px] max-w-[155px] flex-shrink-0">
                  <select
                    id="filter-provider-select"
                    value={selectedProvider}
                    onChange={(e) => {
                      setSelectedProvider(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-[34px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer truncate"
                  >
                    {PROVIDERS_OPTIONS.map((prv) => (
                      <option key={prv} value={prv}>
                        {prv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. All Statuses */}
                <div className="flex-1 min-w-[110px] max-w-[140px] flex-shrink-0">
                  <select
                    id="filter-status-select"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-[34px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer truncate"
                  >
                    {STATUSES_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Clear Filters */}
                <button
                  id="btn-clear-filters"
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center gap-1.5 h-[34px] px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <RotateCcw size={13} />
                  <span>Clear Filters</span>
                </button>

                {/* 7. Refresh */}
                <button
                  id="btn-refresh"
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center justify-center gap-1.5 h-[34px] px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                  title="Refresh records"
                >
                  <RotateCcw
                    size={13}
                    className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
                  />
                  <span>Refresh</span>
                </button>
              </div>

              {/* 8. Export Records Button aligned at far right */}
              <div className="flex-shrink-0">
                <button
                  id="btn-export-records"
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 sm:px-4 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download size={13} />
                  <span>Export Records</span>
                </button>
              </div>
            </div>
          </div>

      {/* 4. TABLE SECTION */}
      <div
        id="charges-commissions-table-card"
        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-0"
      >
        <div className="overflow-x-auto">
          {/* ========================================================================= */
          /* CHARGE RECORDS TABLE (Uniform 16px column spacing & balanced proportions) */
          /* ========================================================================= */}
          <div id="charge-records-table" className="w-full min-w-[860px]">
            {/* Table Heading */}
            <div className="grid grid-cols-[1.15fr_1fr_1.35fr_1.15fr_1.35fr_1.35fr_0.8fr_0.9fr] gap-4 items-center bg-slate-50/80 border-b border-slate-200 py-2.5 px-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-left">
              <div className="text-left whitespace-nowrap">Charge Record</div>
              <div className="text-left whitespace-nowrap">Transaction</div>
              <div className="text-left whitespace-nowrap">Charged Customer</div>
              <div className="text-left whitespace-nowrap">Service</div>
              <div className="text-left leading-tight">
                <div className="whitespace-nowrap">Transaction Amount</div>
                <div className="whitespace-nowrap">(ZMW)</div>
              </div>
              <div className="text-left leading-tight">
                <div className="whitespace-nowrap">Reservation Charge</div>
                <div className="whitespace-nowrap">(ZMW)</div>
              </div>
              <div className="text-left whitespace-nowrap">Status</div>
              <div className="text-left whitespace-nowrap">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100 text-xs">
              {paginatedRecords.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  No charge records matching your criteria.
                </div>
              ) : (
                (paginatedRecords as ChargeRecord[]).map((row) => (
                  <div
                    key={row.id}
                    id={`charge-row-${row.id}`}
                    className="grid grid-cols-[1.15fr_1fr_1.35fr_1.15fr_1.35fr_1.35fr_0.8fr_0.9fr] gap-4 items-center py-2.5 px-4 hover:bg-slate-50/70 transition-colors text-left"
                  >
                    {/* 1. Charge Record */}
                    <div className="text-left min-w-0">
                      <div className="font-mono font-semibold text-[#0D93AA] whitespace-nowrap text-xs truncate">
                        {row.reference}
                      </div>
                      <div className="text-[11px] text-slate-500 whitespace-nowrap mt-0.5">
                        {row.createdAt}
                      </div>
                    </div>

                    {/* 2. Transaction */}
                    <div className="text-left min-w-0">
                      <div className="font-mono font-medium text-slate-800 whitespace-nowrap text-xs truncate">
                        {row.transactionReference}
                      </div>
                      <div className="text-[11px] text-slate-500 whitespace-nowrap mt-0.5">
                        {row.transactionType}
                      </div>
                    </div>

                    {/* 3. Charged Customer */}
                    <div className="text-left min-w-0">
                      <div className="font-medium text-slate-900 whitespace-nowrap text-xs truncate">
                        {row.customerName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap mt-0.5 truncate">
                        {row.customerId}
                      </div>
                    </div>

                    {/* 4. Service & Provider stacked */}
                    <div className="text-left min-w-0">
                      <div className="font-medium text-slate-800 whitespace-nowrap text-xs truncate">
                        {row.service}
                      </div>
                      <div className="text-[11px] text-slate-500 whitespace-nowrap mt-0.5 truncate">
                        {row.provider}
                      </div>
                    </div>

                    {/* 5. Transaction Amount (ZMW) */}
                    <div className="text-left min-w-0">
                      <div className="font-mono font-medium text-slate-700 whitespace-nowrap text-xs">
                        {formatZmwListingAmount(row.transactionAmount)}
                      </div>
                    </div>

                    {/* 6. Reservation Charge (ZMW) */}
                    <div className="text-left min-w-0">
                      <div className="font-mono font-bold text-slate-900 whitespace-nowrap text-xs">
                        {formatZmwListingAmount(row.reservationCharge)}
                      </div>
                    </div>

                    {/* 7. Status */}
                    <div className="text-left min-w-0">{renderChargeStatus(row.status)}</div>

                    {/* 8. Action (Details button) */}
                    <div className="text-left whitespace-nowrap">
                      <button
                        id={`btn-details-${row.id}`}
                        type="button"
                        onClick={() => handleViewDetails(row.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#0D93AA] hover:text-white hover:bg-[#0D93AA] bg-cyan-50/60 border border-[#0D93AA]/30 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 5. PAGINATION SECTION */}
        <div
          id="table-pagination-controls"
          className="bg-slate-50/80 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600"
        >
          {/* Status Text: e.g. "Showing 1 to 20 of 369 charge records" */}
          <div className="flex items-center gap-4">
            <span id="pagination-record-count-text" className="font-medium text-slate-700">
              Showing {startRecordNum} to {endRecordNum} of {totalRecordsCount} charge records
            </span>

            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                id="pagination-rows-per-page"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page Indicators and Navigation */}
          <div className="flex items-center gap-3">
            {/* Page Count Text: e.g. "Page 1 of 19" */}
            <span id="pagination-page-number-text" className="font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center space-x-1">
              <button
                id="btn-pagination-prev"
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                id="btn-pagination-next"
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};

export default ChargesCommissionsPage;
