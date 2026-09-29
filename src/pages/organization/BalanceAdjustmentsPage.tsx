import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Building2,
  Lock,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatZmwListingAmount } from '../../utils/formatters';
import { organizationService } from '../../services/organizationService';
import {
  BalanceAdjustment,
  OrgUser,
  StoreWithStats,
  BoothWithDetails,
  BalanceType,
  AdjustmentDirection,
} from '../../types/organization';

export const BalanceAdjustmentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const isBusinessOwner = currentUser?.role === 'business_owner';

  const [adjustments, setAdjustments] = useState<BalanceAdjustment[]>([]);
  const [agents, setAgents] = useState<OrgUser[]>([]);
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [booths, setBooths] = useState<BoothWithDetails[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceTypeFilter, setBalanceTypeFilter] = useState<'All' | BalanceType>('All');
  const [directionFilter, setDirectionFilter] = useState<'All' | AdjustmentDirection>('All');

  // New Adjustment Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    staffUserId: '',
    balanceType: 'Cash Balance' as BalanceType,
    providerId: '',
    direction: 'Increase' as AdjustmentDirection,
    amount: '',
    reason: '',
    supportingReference: '',
  });

  // Details Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<BalanceAdjustment | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableScrollRef = React.useRef<HTMLDivElement>(null);

  const loadData = () => {
    if (!currentUser) return;
    setAdjustments(organizationService.getBalanceAdjustments(currentUser));
    const u = organizationService.getUsers(currentUser);
    setAgents(u.filter((user) => user.role === 'agent'));
    setStores(organizationService.getStores(currentUser));
    setBooths(organizationService.getBooths(currentUser));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = organizationService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Reset scrollbar to top when filters change
  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }, [searchQuery, balanceTypeFilter, directionFilter]);

  // Format UTC dates consistently as DD/MM/YYYY HH:MM
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${mins}`,
    };
  };

  // Selected agent current balance preview
  const selectedAgent = agents.find((a) => a.id === formData.staffUserId);
  const currentAgentBalance = selectedAgent
    ? organizationService.getAgentCurrentBalance(
        currentUser,
        selectedAgent.id,
        formData.balanceType,
        formData.providerId || undefined
      )
    : 0;

  const parsedAmount = parseFloat(formData.amount) || 0;
  const projectedBalance =
    formData.direction === 'Increase'
      ? currentAgentBalance + parsedAmount
      : currentAgentBalance - parsedAmount;

  // Filter adjustments
  const filteredAdjustments = adjustments.filter((adj) => {
    if (balanceTypeFilter !== 'All' && adj.balanceType !== balanceTypeFilter) return false;
    if (directionFilter !== 'All' && adj.direction !== directionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = adj.adjustmentReference.toLowerCase().includes(q);
      const matchStaff = (adj.staffName || '').toLowerCase().includes(q);
      const matchStore = (adj.storeName || '').toLowerCase().includes(q);
      const matchReason = adj.reason.toLowerCase().includes(q);
      if (!matchRef && !matchStaff && !matchStore && !matchReason) return false;
    }
    return true;
  });

  // KPIs
  const totalAdjustments = adjustments.length;
  const netIncrease = adjustments
    .filter((a) => a.direction === 'Increase' && a.status === 'Completed')
    .reduce((acc, a) => acc + a.amount, 0);
  const netDecrease = adjustments
    .filter((a) => a.direction === 'Decrease' && a.status === 'Completed')
    .reduce((acc, a) => acc + a.amount, 0);
  const netVariance = netIncrease - netDecrease;

  // If Business Admin tries to access
  if (!isBusinessOwner) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Access: Business Owner Only</h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Staff balance adjustments modify official vault and operational float ledgers. Under TellerBud internal controls, this capability is strictly restricted to the primary Business Owner.
        </p>
        <div className="pt-2">
          <a
            href="/business-owner/organization/stores"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Return to Stores & Booths
          </a>
        </div>
      </div>
    );
  }

  const openCreateAdjustment = () => {
    setFormData({
      staffUserId: agents[0]?.id || '',
      balanceType: 'Cash Balance',
      providerId: '',
      direction: 'Increase',
      amount: '',
      reason: '',
      supportingReference: '',
    });
    setShowModal(true);
  };

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;
    setFeedback(null);

    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFeedback({ type: 'error', message: 'Amount must be strictly greater than zero.' });
      return;
    }

    if (!formData.reason.trim()) {
      setFeedback({ type: 'error', message: 'Mandatory reason is required for balance adjustment.' });
      return;
    }

    setIsSubmitting(true);

    const idempotencyKey = `idemp-adj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const res = organizationService.createBalanceAdjustment(currentUser, {
      idempotencyKey,
      staffUserId: formData.staffUserId,
      balanceType: formData.balanceType,
      providerId: formData.providerId || null,
      direction: formData.direction,
      amount: amt,
      reason: formData.reason,
      supportingReference: formData.supportingReference,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to process balance adjustment.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Adjustment ${res.adjustment?.adjustmentReference} successfully completed for ${res.adjustment?.staffName}.`,
    });
    setShowModal(false);
  };

  const exportToCSV = () => {
    const headers = [
      'Reference',
      'Date',
      'Staff User',
      'Store',
      'Booth',
      'Balance Type',
      'Direction',
      'Amount',
      'Previous Balance',
      'New Balance',
      'Status',
      'Reason',
      'Authorized By',
    ];

    const rows = filteredAdjustments.map((a) => [
      a.adjustmentReference,
      new Date(a.createdAt).toLocaleString(),
      `"${a.staffName || a.staffUserId}"`,
      `"${a.storeName || ''}"`,
      `"${a.boothName || ''}"`,
      a.balanceType,
      a.direction,
      a.amount.toFixed(2),
      a.previousBalance.toFixed(2),
      a.newBalance.toFixed(2),
      a.status,
      `"${a.reason.replace(/"/g, '""')}"`,
      `"${a.createdBy}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TellerBud_Balance_Adjustments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-3 sm:p-4 lg:p-5 gap-3 sm:gap-3.5 max-w-[1720px] w-full mx-auto">
      {/* 1. FROZEN TOP SECTION: Breadcrumb, Feedback, KPI Cards, Filter Bar */}
      <div className="shrink-0 flex flex-col gap-3 sm:gap-3.5">
        {/* Page Header / Breadcrumb & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Scale className="w-3.5 h-3.5" />
            <span>Organization Management</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Financial Governance</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              id="btn-new-adjustment"
              onClick={openCreateAdjustment}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Balance Adjustment
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`flex items-start justify-between p-4 rounded-xl border text-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <p className="font-medium">{feedback.message}</p>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Cards: Single Horizontal Line (Fixed Icon, Flexible Complete Label, Fixed Far-Right Value) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Adjustments */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 min-h-[66px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] 2xl:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                TOTAL ADJUSTMENTS
              </span>
            </div>
            <div className="text-[15px] leading-[20px] font-semibold font-mono text-slate-900 shrink-0 text-right whitespace-nowrap">
              {totalAdjustments}
            </div>
          </div>

          {/* Total Injections (+) */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 min-h-[66px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100/60 text-teal-600 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] 2xl:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                TOTAL INJECTIONS (+)
              </span>
            </div>
            <div className="text-[15px] leading-[20px] font-semibold font-mono text-teal-700 shrink-0 text-right whitespace-nowrap">
              ZMW {netIncrease.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Total Deductions (-) */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 min-h-[66px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100/60 text-rose-600 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] 2xl:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                TOTAL DEDUCTIONS (-)
              </span>
            </div>
            <div className="text-[15px] leading-[20px] font-semibold font-mono text-rose-700 shrink-0 text-right whitespace-nowrap">
              ZMW {netDecrease.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Net Balance Shift */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 min-h-[66px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/60 text-indigo-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] 2xl:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                NET BALANCE SHIFT
              </span>
            </div>
            <div
              className={`text-[15px] leading-[20px] font-semibold font-mono shrink-0 text-right whitespace-nowrap ${
                netVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {netVariance >= 0 ? '+' : ''}ZMW{' '}
              {netVariance.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Filter Bar: Compact Single Horizontal Line */}
        <div className="bg-white rounded-xl border border-slate-200/90 px-3.5 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-2.5 w-full">
          {/* Search field (~36%) */}
          <div className="relative w-full sm:w-[36%] shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-adjustments"
              type="text"
              placeholder="Search reference, staff name, store, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[34px] pl-8.5 pr-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Balance Type (~16%) */}
          <select
            id="select-baltype-filter"
            value={balanceTypeFilter}
            onChange={(e) => setBalanceTypeFilter(e.target.value as any)}
            className="h-[34px] text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-[16%] shrink-0 cursor-pointer"
          >
            <option value="All">All Balance Types</option>
            <option value="Cash Balance">Cash Balance</option>
            <option value="MNO Balance">MNO Balance</option>
            <option value="Bank Balance">Bank Balance</option>
          </select>

          {/* Direction (~14%) */}
          <select
            id="select-direction-filter"
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value as any)}
            className="h-[34px] text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-[14%] shrink-0 cursor-pointer"
          >
            <option value="All">All Directions</option>
            <option value="Increase">Increase (+)</option>
            <option value="Decrease">Decrease (-)</option>
          </select>

          {/* Showing X adjustment records (Right-aligned in remaining space) */}
          <div className="text-xs font-semibold text-slate-500 shrink-0 sm:ml-auto text-left sm:text-right whitespace-nowrap self-start sm:self-auto">
            Showing <span className="text-slate-800 font-bold">{filteredAdjustments.length}</span> {filteredAdjustments.length === 1 ? 'adjustment record' : 'adjustment records'}
          </div>
        </div>
      </div>

      {/* 2. ADJUSTMENTS TABLE CARD (Flex-1 min-h-0 with sticky header & scrollable records) */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div
          tabIndex={0}
          role="region"
          aria-label="Balance Adjustments Table"
          ref={tableScrollRef}
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-auto device-table-scroll focus:outline-none"
        >
          <table className="w-full text-left text-xs text-slate-600 table-fixed min-w-[1050px] border-collapse">
            <colgroup>
              <col style={{ width: '12%', minWidth: '125px' }} />
              <col style={{ width: '11%', minWidth: '115px' }} />
              <col style={{ width: '17%', minWidth: '170px' }} />
              <col style={{ width: '14%', minWidth: '135px' }} />
              <col style={{ width: '16%', minWidth: '155px' }} />
              <col style={{ width: '16%', minWidth: '155px' }} />
              <col style={{ width: '8%', minWidth: '95px' }} />
              <col style={{ width: '6%', minWidth: '85px' }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#F9FAFB] shadow-[0_1px_0_0_#E2E8F0]">
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] bg-[#F9FAFB] min-h-[44px]">
                <th scope="col" style={{ width: '12%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-2.5 px-3.5 font-semibold whitespace-nowrap text-left align-middle">
                  Adjustment Ref
                </th>
                <th scope="col" style={{ width: '11%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-2.5 px-3.5 font-semibold whitespace-nowrap text-left align-middle">
                  Date & Time
                </th>
                <th scope="col" style={{ width: '17%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-2.5 px-3.5 font-semibold whitespace-nowrap text-left align-middle">
                  Agent / Station
                </th>
                <th scope="col" style={{ width: '14%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-2.5 px-3.5 font-semibold whitespace-nowrap text-left align-middle">
                  Type & Provider
                </th>
                <th scope="col" style={{ width: '16%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-2.5 px-3.5 font-semibold whitespace-nowrap text-left align-middle">
                  <div className="leading-tight">
                    <div>ADJUSTMENT</div>
                    <div>AMOUNT (ZMW)</div>
                  </div>
                </th>
                <th scope="col" style={{ width: '16%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-2.5 px-3.5 font-semibold whitespace-nowrap text-left align-middle">
                  <div className="leading-tight">
                    <div>BALANCE DELTA</div>
                    <div>(ZMW)</div>
                  </div>
                </th>
                <th scope="col" style={{ width: '8%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-2.5 pl-3.5 pr-4 font-semibold whitespace-nowrap text-left align-middle min-w-[95px]">
                  Status
                </th>
                <th scope="col" style={{ width: '6%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-2.5 pl-4 pr-5 font-semibold whitespace-nowrap text-left align-middle min-w-[85px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No balance adjustments found.</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => {
                  const dt = formatDateTime(adj.createdAt);
                  return (
                    <tr key={adj.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Adjustment Ref (12%) */}
                      <td className="py-3 px-3.5 align-middle font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                        {adj.adjustmentReference}
                      </td>

                      {/* 2. Date & Time (11%) */}
                      <td className="py-3 px-3.5 align-middle text-slate-600 text-xs whitespace-nowrap">
                        <span>{dt.date}</span>{' '}
                        <span className="text-[11px] text-slate-400 font-mono">{dt.time}</span>
                      </td>

                      {/* 3. Agent / Station (17%) */}
                      <td className="py-3 px-3.5 align-middle">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-900 text-xs truncate" title={adj.staffName || adj.staffUserId}>
                            {adj.staffName || adj.staffUserId}
                          </div>
                          <div className="text-slate-400 text-[11px] truncate" title={adj.storeName}>
                            {adj.storeName}
                          </div>
                        </div>
                      </td>

                      {/* 4. Type & Provider (14%) */}
                      <td className="py-3 px-3.5 align-middle">
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-medium text-slate-800 text-xs block truncate" title={adj.balanceType}>
                            {adj.balanceType}
                          </span>
                          <span className="block text-slate-400 text-[11px] truncate" title={adj.providerId || 'Cash'}>
                            {adj.providerId || 'Cash'}
                          </span>
                        </div>
                      </td>

                      {/* 5. Adjustment Amount (ZMW) (16%) */}
                      <td className="py-3 px-3.5 align-middle text-left whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1 font-bold text-xs whitespace-nowrap ${
                            adj.direction === 'Increase' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {adj.direction === 'Increase' ? (
                            <span>↗ +ZMW {adj.amount.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          ) : (
                            <span>↙ -ZMW {adj.amount.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          )}
                        </div>
                      </td>

                      {/* 6. Balance Delta (ZMW) (16%) */}
                      <td className="py-3 px-3.5 align-middle font-mono text-[11px] text-left whitespace-nowrap">
                        <div className="whitespace-nowrap">
                          <span className="text-slate-400">
                            {adj.previousBalance.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-slate-300 mx-1.5">→</span>
                          <span className="font-semibold text-slate-800">
                            {adj.newBalance.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      {/* 7. Status (8%) */}
                      <td className="py-3 pl-3.5 pr-4 align-middle text-left whitespace-nowrap min-w-[95px]">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold text-[11px] border whitespace-nowrap ${
                            adj.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {adj.status}
                        </span>
                      </td>

                      {/* 8. Actions (6%) */}
                      <td className="py-3 pl-4 pr-5 align-middle text-left whitespace-nowrap min-w-[85px]">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAdjustment(adj);
                            setShowDetailModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: NEW BALANCE ADJUSTMENT */}
      {/* ========================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">New Staff Balance Adjustment</h3>
                <p className="text-xs text-slate-500">Atomic ledger mutation backed by organization audit trail.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-4 text-xs">
              {/* Agent Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.staffUserId}
                  onChange={(e) => setFormData({ ...formData, staffUserId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {agents.map((ag) => {
                    const store = stores.find((s) => s.id === ag.storeId);
                    const booth = booths.find((b) => b.id === ag.boothId);
                    return (
                      <option key={ag.id} value={ag.id}>
                        {ag.firstName} {ag.lastName} ({ag.id}) —{' '}
                        {booth ? `${store?.storeName} > ${booth.boothName}` : 'Unassigned'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Balance Type & Provider */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Balance Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.balanceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        balanceType: e.target.value as BalanceType,
                        providerId:
                          e.target.value === 'MNO Balance'
                            ? 'MTN'
                            : e.target.value === 'Bank Balance'
                            ? 'Zanaco'
                            : '',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Cash Balance">Cash Balance</option>
                    <option value="MNO Balance">MNO Balance</option>
                    <option value="Bank Balance">Bank Balance</option>
                  </select>
                </div>

                {formData.balanceType !== 'Cash Balance' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Provider / Institution <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.providerId}
                      onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {formData.balanceType === 'MNO Balance' ? (
                        <>
                          <option value="MTN">MTN Mobile Money</option>
                          <option value="Airtel">Airtel Money</option>
                          <option value="Zamtel">Zamtel Kwacha</option>
                        </>
                      ) : (
                        <>
                          <option value="Zanaco">Zanaco Express</option>
                          <option value="Stanbic">Stanbic Agency</option>
                          <option value="Atlas Mara">Atlas Mara Tenga</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* Direction & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Direction <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, direction: 'Increase' })}
                      className={`py-2 rounded-lg font-bold border transition-all text-center ${
                        formData.direction === 'Increase'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      + Increase
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, direction: 'Decrease' })}
                      className={`py-2 rounded-lg font-bold border transition-all text-center ${
                        formData.direction === 'Decrease'
                          ? 'border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-500'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      - Decrease
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Amount (ZMW) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 1500.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Real-time Balance Delta Simulation */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Current Staff Balance:</span>
                  <span className="font-mono font-medium text-slate-800">
                    ZMW {currentAgentBalance.toLocaleString('en-ZM', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Adjustment:</span>
                  <span
                    className={`font-mono font-bold ${
                      formData.direction === 'Increase' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formData.direction === 'Increase' ? '+' : '-'}ZMW{' '}
                    {parsedAmount.toLocaleString('en-ZM', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold pt-1.5 border-t border-slate-200 text-slate-900">
                  <span>Projected New Balance:</span>
                  <span
                    className={`font-mono text-sm ${
                      projectedBalance < 0 ? 'text-rose-600 font-extrabold' : 'text-emerald-800'
                    }`}
                  >
                    ZMW {projectedBalance.toLocaleString('en-ZM', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {projectedBalance < 0 && (
                  <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-[11px] pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Rejected: A balance adjustment cannot reduce staff balance below zero.</span>
                  </div>
                )}
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Adjustment <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Physical till vault count reconciliation variance resolved, morning till injection..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Supporting Reference */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Supporting Reference / Ticket #
                </label>
                <input
                  type="text"
                  placeholder="e.g. REC-2026-09-001, MTN-REF-884920, BANK-TX-332"
                  value={formData.supportingReference}
                  onChange={(e) => setFormData({ ...formData, supportingReference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectedBalance < 0 || parsedAmount <= 0 || !formData.reason.trim()}
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-semibold shadow-xs"
                >
                  Authorize Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ADJUSTMENT DETAILS */}
      {/* ========================================== */}
      {showDetailModal && selectedAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-mono">
                  {selectedAdjustment.adjustmentReference}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {formatDateTime(selectedAdjustment.createdAt).date}{' '}
                  {formatDateTime(selectedAdjustment.createdAt).time}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Staff Member:</span>
                <span className="font-semibold text-slate-900">{selectedAdjustment.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-800">
                  {selectedAdjustment.storeName} &gt; {selectedAdjustment.boothName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Balance Type:</span>
                <span className="font-medium text-slate-800">
                  {selectedAdjustment.balanceType}{' '}
                  {selectedAdjustment.providerId ? `(${selectedAdjustment.providerId})` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Adjustment Direction:</span>
                <span
                  className={`font-bold ${
                    selectedAdjustment.direction === 'Increase' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {selectedAdjustment.direction} (+/- ZMW {selectedAdjustment.amount.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previous Balance:</span>
                <span className="font-mono text-slate-700">
                  ZMW {selectedAdjustment.previousBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5">
                <span className="text-slate-800">New Balance:</span>
                <span className="font-mono text-emerald-800">
                  ZMW {selectedAdjustment.newBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-slate-500 font-semibold mb-1">Reason:</span>
              <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 border border-slate-200">
                {selectedAdjustment.reason}
              </p>
            </div>

            {selectedAdjustment.supportingReference && (
              <div>
                <span className="block text-slate-500 font-semibold mb-1">Supporting Reference:</span>
                <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedAdjustment.supportingReference}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 text-[11px] pt-2 border-t border-slate-100">
              <span>Authorized By: {selectedAdjustment.createdBy}</span>
              <span>Status: {selectedAdjustment.status}</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
