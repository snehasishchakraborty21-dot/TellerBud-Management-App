import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  Users,
  Building2,
  Landmark,
  Clock,
  Search,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Layers,
  FileCheck,
} from 'lucide-react';
import {
  MOCK_CHARGES_COMMISSIONS_KPIS,
  MOCK_CHARGE_RECORDS,
  MOCK_COMMISSION_RECORDS,
} from '../data/mockChargesCommissionsData';
import {
  ChargeRecord,
  CommissionRecord,
  ChargeStatus,
  CommissionSettlementStatus,
} from '../types/chargesCommissions';

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
  'Refunded',
  'Reversed',
];

function formatZMW(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const ChargesCommissionsPage: React.FC = () => {
  const navigate = useNavigate();

  // Active Tab: 'charges' | 'commissions'
  const [activeTab, setActiveTab] = useState<'charges' | 'commissions'>('charges');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State
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

  // Filter Charge Records (Cash Pickup Reservation Charges only, sorted descending by timestamp)
  const filteredChargeRecords = useMemo(() => {
    return MOCK_CHARGE_RECORDS.filter((rec) => {
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
  }, [searchQuery, selectedService, selectedProvider, selectedStatus, fromDate, toDate]);

  // Filter Commission Records (sorted descending by timestamp)
  const filteredCommissionRecords = useMemo(() => {
    return MOCK_COMMISSION_RECORDS.filter((rec) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchRef = rec.reference.toLowerCase().includes(q);
        const matchTxn = rec.transactionReference.toLowerCase().includes(q);
        const matchRecipient = rec.recipient.toLowerCase().includes(q);
        const matchRecipientId = rec.recipientId.toLowerCase().includes(q);
        const matchBiz = rec.associatedBusiness?.toLowerCase().includes(q) || false;
        if (!matchRef && !matchTxn && !matchRecipient && !matchRecipientId && !matchBiz) {
          return false;
        }
      }

      // Service
      if (selectedService !== 'All Services') {
        if (rec.service !== selectedService) return false;
      }

      // Provider
      if (selectedProvider !== 'All Providers') {
        if (rec.provider && rec.provider !== selectedProvider) return false;
      }

      // Status
      if (selectedStatus !== 'All Statuses') {
        const recSt = rec.settlementStatus.toLowerCase();
        const targetSt = selectedStatus.toLowerCase();
        if (targetSt === 'pending' && recSt.includes('pending')) {
          // match pending settlement
        } else if (!recSt.includes(targetSt)) {
          return false;
        }
      }

      // Date Range
      if (fromDate && rec.rawDate < fromDate) return false;
      if (toDate && rec.rawDate > toDate) return false;

      return true;
    }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [searchQuery, selectedService, selectedProvider, selectedStatus, fromDate, toDate]);

  // Active records based on tab
  const activeRecords = activeTab === 'charges' ? filteredChargeRecords : filteredCommissionRecords;
  const totalRecordsCount = activeRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / rowsPerPage));

  // Current page records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return activeRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [activeRecords, currentPage, rowsPerPage]);

  // Safe navigation to details page
  const handleViewDetails = (recordId: string) => {
    navigate(`/super-admin/transactions/commissions/${recordId}`);
  };

  // Export filtered records to CSV
  const handleExport = () => {
    if (activeTab === 'charges') {
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
    } else {
      const headers = [
        'Commission Record',
        'Transaction Ref',
        'Created At',
        'Recipient',
        'Recipient ID',
        'Recipient Type',
        'Associated Business',
        'Calculation Basis',
        'Commission Amount (ZMW)',
        'Settlement Status',
      ];
      const rows = (activeRecords as CommissionRecord[]).map((r) => [
        r.reference,
        r.transactionReference,
        r.createdAt,
        `"${r.recipient}"`,
        r.recipientId,
        r.recipientType,
        `"${r.associatedBusiness || ''}"`,
        `"${r.calculationBasis}"`,
        r.commissionAmount.toFixed(2),
        r.settlementStatus,
      ]);
      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `tellerbud_commissions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Charge status pill styling
  const renderChargeStatus = (status: ChargeStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            Pending
          </span>
        );
      case 'Posted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            Posted
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            Cancelled
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
            Refunded
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap">
            Reversed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  // Commission status pill styling
  const renderCommissionStatus = (status: CommissionSettlementStatus) => {
    switch (status) {
      case 'Accrued':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
            Accrued
          </span>
        );
      case 'Pending Settlement':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            Pending Settlement
          </span>
        );
      case 'Settled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            Settled
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            Cancelled
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap">
            Reversed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const startRecordNum = totalRecordsCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecordNum = Math.min(currentPage * rowsPerPage, totalRecordsCount);

  return (
    <div id="charges-commissions-container" className="w-full space-y-4 px-3 sm:px-6 pt-2 pb-4">
      {/* 1. FIVE COMPACT SUMMARY CARDS (Full Width, No Truncation, Exact Reconciled Values) */}
      <div
        id="kpi-summary-cards"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5"
      >
        {/* Card 1: Reservation Charges Collected */}
        <div
          id="kpi-reservation-charges"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider leading-tight">
              Reservation Charges Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D93AA] flex items-center justify-center flex-shrink-0">
              <Coins size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[20px] 2xl:text-[22px] font-bold font-mono text-slate-900 tracking-tight whitespace-nowrap">
              {formatZMW(MOCK_CHARGES_COMMISSIONS_KPIS.reservationChargesCollected)}
            </div>
          </div>
        </div>

        {/* Card 2: Agent Commissions */}
        <div
          id="kpi-agent-commissions"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider leading-tight">
              Agent Commissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[20px] 2xl:text-[22px] font-bold font-mono text-emerald-700 tracking-tight whitespace-nowrap">
              {formatZMW(MOCK_CHARGES_COMMISSIONS_KPIS.agentCommissions)}
            </div>
          </div>
        </div>

        {/* Card 3: Business Commissions */}
        <div
          id="kpi-business-commissions"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider leading-tight">
              Business Commissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[20px] 2xl:text-[22px] font-bold font-mono text-indigo-700 tracking-tight whitespace-nowrap">
              {formatZMW(MOCK_CHARGES_COMMISSIONS_KPIS.businessCommissions)}
            </div>
          </div>
        </div>

        {/* Card 4: TellerBud Revenue */}
        <div
          id="kpi-tellerbud-revenue"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider leading-tight">
              TellerBud Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#0D93AA] flex items-center justify-center flex-shrink-0">
              <Landmark size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[20px] 2xl:text-[22px] font-bold font-mono text-[#0D93AA] tracking-tight whitespace-nowrap">
              {formatZMW(MOCK_CHARGES_COMMISSIONS_KPIS.tellerBudRevenue)}
            </div>
          </div>
        </div>

        {/* Card 5: Pending Settlements */}
        <div
          id="kpi-pending-settlements"
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider leading-tight">
              Pending Settlements
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[20px] 2xl:text-[22px] font-bold font-mono text-amber-700 tracking-tight whitespace-nowrap">
              {formatZMW(MOCK_CHARGES_COMMISSIONS_KPIS.pendingSettlements)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABS: Charge Records (default) & Commission Records */}
      <div id="tabs-header" className="border-b border-slate-200 bg-white px-2 rounded-t-xl">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            id="tab-charge-records"
            type="button"
            onClick={() => {
              setActiveTab('charges');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'charges'
                ? 'border-[#0D93AA] text-[#0D93AA] bg-cyan-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Coins size={16} />
            <span>Charge Records</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                activeTab === 'charges'
                  ? 'bg-[#0D93AA]/15 text-[#0D93AA]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {filteredChargeRecords.length}
            </span>
          </button>

          <button
            id="tab-commission-records"
            type="button"
            onClick={() => {
              setActiveTab('commissions');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'commissions'
                ? 'border-[#0D93AA] text-[#0D93AA] bg-cyan-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers size={16} />
            <span>Commission Records</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                activeTab === 'commissions'
                  ? 'bg-[#0D93AA]/15 text-[#0D93AA]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {filteredCommissionRecords.length}
            </span>
          </button>
        </nav>
      </div>

      {/* 3. COMMON FILTERS SECTION (Organized into 2 clean, balanced rows) */}
      <div
        id="filter-controls-section"
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3"
      >
        {/* Row 1: Search, Service, Provider, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="lg:col-span-6 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              id="filter-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search record, transaction, customer, agent or business..."
              className="w-full h-[38px] pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
            />
          </div>

          {/* Service Dropdown */}
          <div className="lg:col-span-2">
            <select
              id="filter-service-select"
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[38px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              {SERVICES_OPTIONS.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Dropdown */}
          <div className="lg:col-span-2">
            <select
              id="filter-provider-select"
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[38px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              {PROVIDERS_OPTIONS.map((prv) => (
                <option key={prv} value={prv}>
                  {prv}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="lg:col-span-2">
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[38px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all cursor-pointer"
            >
              {STATUSES_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: From Date, To Date, Clear Filters, Refresh, Export Records */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2.5 border-t border-slate-100">
          {/* Date Inputs without clipping */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-from-date" className="text-xs font-medium text-slate-500 whitespace-nowrap">
                From:
              </label>
              <input
                id="filter-from-date"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[38px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
                title="From Date"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-to-date" className="text-xs font-medium text-slate-500 whitespace-nowrap">
                To:
              </label>
              <input
                id="filter-to-date"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[38px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] focus:bg-white transition-all"
                title="To Date"
              />
            </div>
          </div>

          {/* Action buttons with consistent heights and clear spacing */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-clear-filters"
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 h-[38px] px-3.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw size={13} />
              <span>Clear Filters</span>
            </button>

            <button
              id="btn-refresh"
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 h-[38px] px-3.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Refresh records"
            >
              <RotateCcw
                size={13}
                className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
              />
              <span>Refresh</span>
            </button>

            <button
              id="btn-export-records"
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-[38px] px-4 text-xs sm:text-sm font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download size={14} />
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
          {activeTab === 'charges' ? (
            /* ========================================================================= */
            /* CHARGE RECORDS TABLE                                                      */
            /* ========================================================================= */
            <table id="charge-records-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Charge Record</th>
                  <th className="py-3.5 px-4">Transaction</th>
                  <th className="py-3.5 px-4">Charged Customer</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Transaction Amount</th>
                  <th className="py-3.5 px-4">Reservation Charge</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No charge records matching your criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedRecords as ChargeRecord[]).map((row) => (
                    <tr
                      key={row.id}
                      id={`charge-row-${row.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* 1. Charge Record */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-semibold text-[#0D93AA] whitespace-nowrap">
                          {row.reference}
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap mt-0.5">
                          {row.createdAt}
                        </div>
                      </td>

                      {/* 2. Transaction */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-800 whitespace-nowrap">
                          {row.transactionReference}
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap mt-0.5">
                          {row.transactionType}
                        </div>
                      </td>

                      {/* 3. Charged Customer (IDs on one line, no hyphens break) */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 whitespace-nowrap">
                          {row.customerName}
                        </div>
                        <div className="text-xs font-mono text-slate-500 whitespace-nowrap mt-0.5">
                          {row.customerId}
                        </div>
                      </td>

                      {/* 4. Service & Provider stacked */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 whitespace-nowrap">
                          {row.service}
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap mt-0.5">
                          {row.provider}
                        </div>
                      </td>

                      {/* 5. Transaction Amount (Separated, one line) */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-700 whitespace-nowrap">
                          {formatZMW(row.transactionAmount)}
                        </div>
                      </td>

                      {/* 6. Reservation Charge (Separated, one line) */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatZMW(row.reservationCharge)}
                        </div>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3 px-4">{renderChargeStatus(row.status)}</td>

                      {/* 8. Action (One-line View Details button) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          id={`btn-view-details-${row.id}`}
                          type="button"
                          onClick={() => handleViewDetails(row.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#0D93AA] hover:text-white hover:bg-[#0D93AA] bg-cyan-50/60 border border-[#0D93AA]/30 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* ========================================================================= */
            /* COMMISSION RECORDS TABLE                                                  */
            /* ========================================================================= */
            <table id="commission-records-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Commission Record</th>
                  <th className="py-3.5 px-4">Transaction</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Recipient Type</th>
                  <th className="py-3.5 px-4">Calculation Basis</th>
                  <th className="py-3.5 px-4">Commission Amount</th>
                  <th className="py-3.5 px-4">Settlement Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No commission records matching your criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedRecords as CommissionRecord[]).map((row) => (
                    <tr
                      key={row.id}
                      id={`commission-row-${row.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* 1. Commission Record */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-semibold text-[#0D93AA] whitespace-nowrap">
                          {row.reference}
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap mt-0.5">
                          {row.createdAt}
                        </div>
                      </td>

                      {/* 2. Transaction */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-800 whitespace-nowrap">
                          {row.transactionReference}
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap mt-0.5">
                          {row.transactionType}
                        </div>
                      </td>

                      {/* 3. Recipient */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 whitespace-nowrap">
                          {row.recipient}
                        </div>
                        <div className="text-xs font-mono text-slate-500 whitespace-nowrap mt-0.5">
                          {row.recipientId}
                        </div>
                        {row.associatedBusiness && (
                          <div className="text-[11px] text-slate-400 whitespace-nowrap mt-0.5">
                            {row.associatedBusiness}
                          </div>
                        )}
                      </td>

                      {/* 4. Recipient Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            row.recipientType === 'Agent'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                              : row.recipientType === 'Business Owner'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                              : 'bg-cyan-50 text-cyan-800 border border-cyan-200/70'
                          }`}
                        >
                          {row.recipientType}
                        </span>
                      </td>

                      {/* 5. Calculation Basis (Read-only) */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 text-xs whitespace-nowrap">
                          {row.calculationBasis}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap mt-0.5">
                          {row.rateRuleVersion}
                        </div>
                      </td>

                      {/* 6. Commission Amount */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatZMW(row.commissionAmount)}
                        </div>
                      </td>

                      {/* 7. Settlement Status */}
                      <td className="py-3 px-4">{renderCommissionStatus(row.settlementStatus)}</td>

                      {/* 8. Action (One-line View Details button) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          id={`btn-view-details-${row.id}`}
                          type="button"
                          onClick={() => handleViewDetails(row.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#0D93AA] hover:text-white hover:bg-[#0D93AA] bg-cyan-50/60 border border-[#0D93AA]/30 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 5. PAGINATION SECTION (Strictly Conforming to User Spec) */}
        <div
          id="table-pagination-controls"
          className="bg-slate-50/80 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600"
        >
          {/* Status Text: e.g. "Showing 1 to 20 of 369 charge records" */}
          <div className="flex items-center gap-4">
            <span id="pagination-record-count-text" className="font-medium text-slate-700">
              Showing {startRecordNum} to {endRecordNum} of {totalRecordsCount}{' '}
              {activeTab === 'charges' ? 'charge records' : 'commission records'}
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
    </div>
  );
};

export default ChargesCommissionsPage;
