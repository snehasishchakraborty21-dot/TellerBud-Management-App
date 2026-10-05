import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Coins,
  Users,
  Building2,
  Landmark,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCw,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  MOCK_CHARGE_RECORDS,
  calculateRevenueKpis,
  calculateBusinessSummaries,
  MOCK_AGENT_TRANSACTION_REVENUE_RECORDS,
  calculateAgentRevenueBreakdown,
  MOCK_BUSINESS_AGENTS,
  REGISTERED_BUSINESSES,
} from '../data/mockChargesCommissionsData';
import {
  ChargeRecord,
  ChargeStatus,
  AgentRevenueFilters,
  BusinessChargesRevenueSummary,
} from '../types/chargesCommissions';
import { formatZmwListingAmount, formatZMW } from '../utils/formatters';
import { sanitizeDateParam, getZambiaTodayString } from '../utils/dateUtils';
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

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const day = String(d).padStart(2, '0');
  const month = dateObj.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  const year = y;
  return `${day} ${month} ${year}`;
}

export const ChargesCommissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const isBusinessOwner =
    currentUser?.role === 'business_owner' ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/business-owner'));

  const currentBusinessId = currentUser?.businessId || 'BIZ-LUS-001';

  // Read authoritative single date from URL parameter, defaulting to Zambia today (Africa/Lusaka)
  const dateParam = searchParams.get('date');
  const selectedDate = useMemo(() => sanitizeDateParam(dateParam), [dateParam]);

  // Active Tab: 'business-summary' (default) | 'agent-breakdown'
  const [activeTab, setActiveTab] = useState<'business-summary' | 'agent-breakdown'>(() => {
    if (location.state && (location.state as any).activeTab) {
      const tab = (location.state as any).activeTab;
      if (tab === 'agent-breakdown' || tab === 'business-summary') return tab;
    }
    return 'business-summary';
  });

  // Export dropdown state
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Agent Revenue Breakdown Filters (Store, Booth, Agent)
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

  // Agent revenue breakdown scoped strictly to selectedDate
  const effectiveAgentFilters = useMemo(() => {
    return {
      ...agentFilters,
      date: selectedDate,
      fromDate: selectedDate,
      toDate: selectedDate,
    };
  }, [agentFilters, selectedDate]);

  const { breakdown: agentBreakdown, kpis: agentKpis } = useMemo(() => {
    return calculateAgentRevenueBreakdown(
      MOCK_AGENT_TRANSACTION_REVENUE_RECORDS,
      currentBusinessId,
      effectiveAgentFilters
    );
  }, [currentBusinessId, effectiveAgentFilters]);

  // Filter States for Business Summary (Service, Provider, Status only; Date is controlled by top header)
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Check if any dropdown filter is active
  const isFilterActive = useMemo(() => {
    return (
      selectedService !== 'All Services' ||
      selectedProvider !== 'All Providers' ||
      selectedStatus !== 'All Statuses'
    );
  }, [selectedService, selectedProvider, selectedStatus]);

  // Pagination State for Business Summary
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Clear dropdown filters (Preserves selected date!)
  const handleClearFilters = () => {
    setSelectedService('All Services');
    setSelectedProvider('All Providers');
    setSelectedStatus('All Statuses');
    setCurrentPage(1);
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  };

  useEffect(() => {
    document.title = 'Charges & Revenue | TellerBud Admin';
  }, []);

  // Filter Charge Records strictly by selected date and active dropdown filters
  const filteredChargeRecords = useMemo(() => {
    return MOCK_CHARGE_RECORDS.filter((rec) => {
      // 1. Authoritative single date filtering
      if (rec.rawDate !== selectedDate) {
        return false;
      }

      // Business-level data isolation for business owners
      if (isBusinessOwner && rec.businessId && rec.businessId !== currentBusinessId && rec.businessId !== 'TB-BIZ-000001') {
        return false;
      }

      // Service filter
      if (selectedService !== 'All Services' && rec.service !== selectedService) {
        return false;
      }

      // Provider filter
      if (selectedProvider !== 'All Providers' && rec.provider !== selectedProvider) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All Statuses' && rec.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [
    selectedDate,
    isBusinessOwner,
    currentBusinessId,
    selectedService,
    selectedProvider,
    selectedStatus,
  ]);

  // Generate Business Summaries strictly for the selected date
  const businessSummaries = useMemo<BusinessChargesRevenueSummary[]>(() => {
    const targetBusinesses = isBusinessOwner
      ? REGISTERED_BUSINESSES.filter(
          (b) => b.id === currentBusinessId || b.legacyId === currentBusinessId || b.id === 'TB-BIZ-000001'
        )
      : REGISTERED_BUSINESSES;

    return calculateBusinessSummaries(filteredChargeRecords, targetBusinesses);
  }, [filteredChargeRecords, isBusinessOwner, currentBusinessId]);

  // Overall KPIs computed strictly for the selected date and filters
  const revenueKpis = useMemo(() => {
    return calculateRevenueKpis(filteredChargeRecords);
  }, [filteredChargeRecords]);

  // Active KPIs depending on active tab
  const activeKpis = activeTab === 'agent-breakdown' ? agentKpis : revenueKpis;

  // Pagination for business summary table
  const totalCount = businessSummaries.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBusinesses = useMemo(() => {
    const start = (validCurrentPage - 1) * rowsPerPage;
    return businessSummaries.slice(start, start + rowsPerPage);
  }, [businessSummaries, validCurrentPage, rowsPerPage]);

  // Navigate to business charges detail page preserving the selected date
  const handleViewBusinessDetails = (businessId: string) => {
    const url = isBusinessOwner
      ? `/business-owner/transactions/commissions/business/${encodeURIComponent(businessId)}?date=${selectedDate}`
      : `/super-admin/transactions/commissions/business/${encodeURIComponent(businessId)}?date=${selectedDate}`;
    navigate(url);
  };

  // Export handlers with date in filename
  const handleExport = useCallback(
    (format: 'csv' | 'xlsx' = 'csv') => {
      setIsExportMenuOpen(false);

      const headers = [
        'Business Name',
        'Business ID',
        'Transactions',
        'Reservation Charges (ZMW)',
        'TellerBud Charges (ZMW)',
        'Business Revenue (ZMW)',
        'Posted Records',
        'Pending Records',
        'Last Activity Date',
        'Last Activity Time',
      ];

      const rows = businessSummaries.map((b) => [
        `"${b.businessName}"`,
        b.businessId,
        b.transactionsCount,
        b.reservationCharges.toFixed(2),
        b.tellerBudCharges.toFixed(2),
        b.businessRevenue.toFixed(2),
        b.postedCount,
        b.pendingCount,
        b.lastActivityDate,
        b.lastActivityTime,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      const filename = `TellerBud_Business_Charges_Revenue_${selectedDate}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [businessSummaries, selectedDate]
  );

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 max-w-[1720px] w-full mx-auto">
      {/* 1. SUMMARY KPI CARDS (3 Cards in one row) */}
      <div
        id="kpi-summary-cards"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 shrink-0"
      >
        {/* Card 1: Reservation Charges */}
        <div
          id="kpi-reservation-charges"
          className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs flex items-center justify-between gap-3 h-full"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 normal-case whitespace-nowrap">
              Reservation Charges
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900 tracking-tight whitespace-nowrap">
              {formatZMW(activeKpis.reservationCharges)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Coins size={18} />
          </div>
        </div>

        {/* Card 2: TellerBud Charges */}
        <div
          id="kpi-tellerbud-charges"
          className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs flex items-center justify-between gap-3 h-full"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 normal-case whitespace-nowrap">
              TellerBud Charges
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#0D93AA] tracking-tight whitespace-nowrap">
              {formatZMW(activeKpis.tellerBudCharges)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-50 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Landmark size={18} />
          </div>
        </div>

        {/* Card 3: Business Revenue */}
        <div
          id="kpi-business-revenue"
          className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs flex items-center justify-between gap-3 h-full"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 normal-case whitespace-nowrap">
              Business Revenue
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-700 tracking-tight whitespace-nowrap">
              {formatZMW(activeKpis.businessRevenue)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
        </div>
      </div>

      {/* 2. TABS: Business Summary (default) & Agent Revenue Breakdown */}
      <div id="tabs-header" className="border border-slate-200 bg-white px-2 sm:px-3 rounded-xl shrink-0 shadow-2xs">
        <nav className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto" aria-label="Tabs">
          {/* Tab 1: Business Summary (Default active tab) */}
          <button
            id="tab-business-summary"
            type="button"
            onClick={() => {
              setActiveTab('business-summary');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 py-2 px-3 sm:px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'business-summary'
                ? 'border-[#0D93AA] text-[#0D93AA] bg-cyan-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Building2 size={15} />
            <span>Business Summary</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                activeTab === 'business-summary'
                  ? 'bg-[#0D93AA]/15 text-[#0D93AA]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {businessSummaries.length}
            </span>
          </button>

          {/* Tab 2: Agent Revenue Breakdown */}
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
          selectedDate={selectedDate}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          {/* COMPACT SINGLE-ROW FILTER & ACTION BAR (All Services, All Providers, All Statuses, Clear, Refresh, Export) */}
          <div
            id="filter-controls-section"
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 sm:px-3.5 shadow-2xs shrink-0"
          >
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
              {/* Left Side: Filter Controls */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 min-w-0">
                {/* 1. All Services */}
                <div className="w-full sm:w-auto min-w-[140px] flex-1">
                  <select
                    id="filter-service-select"
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-[32px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer truncate"
                  >
                    {SERVICES_OPTIONS.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. All Providers */}
                <div className="w-full sm:w-auto min-w-[140px] flex-1">
                  <select
                    id="filter-provider-select"
                    value={selectedProvider}
                    onChange={(e) => {
                      setSelectedProvider(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-[32px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer truncate"
                  >
                    {PROVIDERS_OPTIONS.map((prv) => (
                      <option key={prv} value={prv}>
                        {prv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. All Statuses */}
                <div className="w-full sm:w-auto min-w-[130px] flex-1">
                  <select
                    id="filter-status-select"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-[32px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer truncate"
                  >
                    {STATUSES_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {/* 4. Clear Filters */}
                <button
                  id="btn-clear-filters"
                  type="button"
                  onClick={handleClearFilters}
                  disabled={!isFilterActive}
                  className="inline-flex items-center justify-center gap-1.5 h-[32px] px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 disabled:opacity-45 disabled:cursor-not-allowed border border-slate-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw size={13} />
                  <span>Clear Filters</span>
                </button>

                {/* 5. Refresh */}
                <button
                  id="btn-refresh"
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center justify-center gap-1.5 h-[32px] px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                  title="Refresh records"
                >
                  <RotateCw
                    size={13}
                    className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
                  />
                  <span>Refresh</span>
                </button>

                {/* 6. Export Button with Dropdown (CSV & Excel) */}
                <div className="relative" ref={exportDropdownRef}>
                  <button
                    id="btn-export-records"
                    type="button"
                    onClick={() => setIsExportMenuOpen((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-1.5 h-[32px] px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Download size={13} />
                    <span>Export</span>
                    <ChevronDown size={12} className="opacity-80" />
                  </button>

                  {isExportMenuOpen && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => handleExport('csv')}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] transition-colors cursor-pointer"
                      >
                        <FileText size={14} className="text-slate-500" />
                        <span>Export as CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport('xlsx')}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet size={14} className="text-slate-500" />
                        <span>Export as Excel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. BUSINESS SUMMARY TABLE CARD */}
          <div
            id="charges-commissions-table-card"
            className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto transaction-table-scroll focus:outline-none">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '5%' }} />
                </colgroup>
                <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
                  <tr className="border-b border-gray-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] bg-[#F9FAFB] h-[44px]">
                    <th className="py-3 px-3.5 font-semibold text-left align-middle">Business</th>
                    <th className="py-3 px-2 font-semibold text-left align-middle whitespace-nowrap">Transactions</th>
                    <th className="py-3 px-2.5 font-semibold text-left align-middle leading-tight">
                      <div>Reservation Charges</div>
                      <div className="text-[10px] font-normal text-slate-400 normal-case">(ZMW)</div>
                    </th>
                    <th className="py-3 px-2.5 font-semibold text-left align-middle leading-tight">
                      <div>TellerBud Charges</div>
                      <div className="text-[10px] font-normal text-slate-400 normal-case">(ZMW)</div>
                    </th>
                    <th className="py-3 px-2.5 font-semibold text-left align-middle leading-tight">
                      <div>Business Revenue</div>
                      <div className="text-[10px] font-normal text-slate-400 normal-case">(ZMW)</div>
                    </th>
                    <th className="py-3 px-2 font-semibold text-left align-middle whitespace-nowrap">Posted</th>
                    <th className="py-3 px-2 font-semibold text-left align-middle whitespace-nowrap">Pending</th>
                    <th className="py-3 px-2.5 font-semibold text-left align-middle whitespace-nowrap">Last Activity</th>
                    <th className="py-3 px-2 font-semibold text-center align-middle whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-sm text-slate-700">
                          No charges or revenue records found for {formatDisplayDate(selectedDate)}.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try selecting another date from the header calendar or adjusting your filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedBusinesses.map((biz) => (
                      <tr
                        key={biz.businessId}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => handleViewBusinessDetails(biz.businessId)}
                      >
                        {/* 1. Business Name and ID (Line 1: Name, Line 2: ID, Max 2 lines for name) */}
                        <td className="py-3 px-3.5 align-middle text-left">
                          <div className="space-y-0.5 min-w-0">
                            <div
                              className="font-semibold text-slate-900 text-xs sm:text-[13px] leading-snug line-clamp-2 group-hover:text-[#0D93AA] transition-colors"
                              title={biz.businessName}
                            >
                              {biz.businessName}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500 font-medium whitespace-nowrap">
                              {biz.businessId}
                            </div>
                          </div>
                        </td>

                        {/* 2. Transactions */}
                        <td className="py-3 px-2 align-middle text-left whitespace-nowrap">
                          <span className="font-semibold text-slate-900 text-xs tabular-nums">
                            {biz.transactionsCount}
                          </span>
                        </td>

                        {/* 3. Reservation Charges (ZMW) */}
                        <td className="py-3 px-2.5 align-middle text-left whitespace-nowrap">
                          <span className="font-bold font-mono text-slate-900 text-xs tabular-nums">
                            {formatZmwListingAmount(biz.reservationCharges)}
                          </span>
                        </td>

                        {/* 4. TellerBud Charges (ZMW) */}
                        <td className="py-3 px-2.5 align-middle text-left whitespace-nowrap">
                          <span className="font-semibold font-mono text-[#0D93AA] text-xs tabular-nums">
                            {formatZmwListingAmount(biz.tellerBudCharges)}
                          </span>
                        </td>

                        {/* 5. Business Revenue (ZMW) */}
                        <td className="py-3 px-2.5 align-middle text-left whitespace-nowrap">
                          <span className="font-bold font-mono text-emerald-700 text-xs tabular-nums">
                            {formatZmwListingAmount(biz.businessRevenue)}
                          </span>
                        </td>

                        {/* 6. Posted */}
                        <td className="py-3 px-2 align-middle text-left whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {biz.postedCount}
                          </span>
                        </td>

                        {/* 7. Pending */}
                        <td className="py-3 px-2 align-middle text-left whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            {biz.pendingCount}
                          </span>
                        </td>

                        {/* 8. Last Activity (Date and Time in two lines) */}
                        <td className="py-3 px-2.5 align-middle text-left whitespace-nowrap">
                          <div className="space-y-0.5 text-left leading-tight">
                            <div className="font-medium text-slate-800 text-xs">{biz.lastActivityDate}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{biz.lastActivityTime}</div>
                          </div>
                        </td>

                        {/* 9. Action (Compact eye icon-only button, centered) */}
                        <td className="py-3 px-2 align-middle text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            id={`btn-view-details-${biz.businessId.toLowerCase()}`}
                            onClick={() => handleViewBusinessDetails(biz.businessId)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-[#0D93AA] hover:bg-[#0D93AA]/10 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 transition-all cursor-pointer shadow-2xs"
                            title="View Details"
                            aria-label={`View charges and revenue details for ${biz.businessName}`}
                          >
                            <Eye size={15} className="shrink-0 stroke-[2.2]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. FOOTER PAGINATION */}
            <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-4">
                <span className="font-medium text-slate-700">
                  Showing <span className="font-bold text-slate-900">{totalCount === 0 ? 0 : (validCurrentPage - 1) * rowsPerPage + 1}</span> to{' '}
                  <span className="font-bold text-slate-900">{Math.min(validCurrentPage * rowsPerPage, totalCount)}</span> of{' '}
                  <span className="font-bold text-slate-900">{totalCount}</span> businesses
                </span>

                <div className="flex items-center gap-1.5">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
                  >
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
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validCurrentPage <= 1}
                    className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      )}
    </div>
  );
};

export default ChargesCommissionsPage;
