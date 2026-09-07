import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Search,
  X,
  FileText,
  Building2,
  PlusCircle,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import {
  BusinessWallet,
  BusinessWalletLedgerEntry,
  GlobalWalletActivity,
  GlobalWalletTransactionType,
} from '../types/admin';
import { formatZMW } from '../utils/formatters';
import { AddFundsDrawer } from '../components/wallet/AddFundsDrawer';
import { RequestWithdrawalDrawer } from '../components/wallet/RequestWithdrawalDrawer';
import { ActivityDetailsModal } from '../components/wallet/ActivityDetailsModal';

// Allowed transaction types in the Global Wallet
const ALLOWED_WALLET_TYPES: GlobalWalletTransactionType[] = [
  'Funding',
  'Charge',
  'Commission',
  'Withdrawal',
  'Business Wallet Funding',
  'TellerBud Charge',
];

export const GlobalWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<BusinessWallet | null>(null);
  const [activities, setActivities] = useState<GlobalWalletActivity[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<BusinessWalletLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters for Recent Wallet Activity
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'Credit' | 'Debit'>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Drawers and Modals
  const [isAddFundsOpen, setIsAddFundsOpen] = useState<boolean>(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<GlobalWalletActivity | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState<boolean>(false);

  // Trigger element references for accessibility restoration
  const addFundsBtnRef = useRef<HTMLButtonElement | null>(null);
  const withdrawalBtnRef = useRef<HTMLButtonElement | null>(null);
  const ledgerBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveTriggerRef = useRef<HTMLElement | null>(null);

  // Prevent background scrolling while any modal or drawer is active
  useEffect(() => {
    if (isAddFundsOpen || isWithdrawalOpen || selectedActivity || isLedgerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAddFundsOpen, isWithdrawalOpen, selectedActivity, isLedgerOpen]);

  const loadData = async () => {
    try {
      const [walletData, activitiesData, ledgerData] = await Promise.all([
        adminService.getBusinessWallet('BIZ-LUS-001'),
        adminService.getGlobalWalletActivities('BIZ-LUS-001'),
        adminService.getBusinessWalletLedger('BIZ-LUS-001'),
      ]);
      setWallet(walletData);
      setActivities(activitiesData);
      setLedgerEntries(ledgerData);
    } catch (err) {
      console.error('Failed to load global wallet data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = adminService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Only include genuine wallet transaction types (strictly filter out operational customer/agent cash)
  const validWalletActivities = useMemo(() => {
    return activities.filter((act) => ALLOWED_WALLET_TYPES.includes(act.transactionType));
  }, [activities]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return validWalletActivities.filter((act) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRef = act.reference.toLowerCase().includes(query);
        const matchesDesc = act.description.toLowerCase().includes(query);
        const matchesType = act.transactionType.toLowerCase().includes(query);
        const matchesInitiator = act.initiatedBy?.name.toLowerCase().includes(query) ?? false;
        const matchesAgent = act.agent?.name.toLowerCase().includes(query) ?? false;
        const matchesProvider = act.externalProvider?.toLowerCase().includes(query) ?? false;
        const matchesAccount = act.mobileMoneyNumber?.toLowerCase().includes(query) ?? false;

        if (
          !matchesRef &&
          !matchesDesc &&
          !matchesType &&
          !matchesInitiator &&
          !matchesAgent &&
          !matchesProvider &&
          !matchesAccount
        ) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'ALL') {
        if (selectedType === 'Funding' && act.transactionType !== 'Funding' && act.transactionType !== 'Business Wallet Funding') {
          return false;
        } else if (selectedType === 'Charge' && act.transactionType !== 'Charge' && act.transactionType !== 'TellerBud Charge') {
          return false;
        } else if (selectedType !== 'Funding' && selectedType !== 'Charge' && act.transactionType !== selectedType) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'ALL' && act.status !== selectedStatus) {
        return false;
      }

      // Direction filter
      if (selectedDirection === 'Credit' && (!act.credit || act.credit <= 0)) {
        return false;
      }
      if (selectedDirection === 'Debit' && (!act.debit || act.debit <= 0)) {
        return false;
      }

      // Date Range filter
      if (fromDate && act.rawDate < fromDate) {
        return false;
      }
      if (toDate && act.rawDate > toDate) {
        return false;
      }

      return true;
    });
  }, [validWalletActivities, searchQuery, selectedType, selectedStatus, selectedDirection, fromDate, toDate]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedDirection !== 'ALL' ||
    fromDate !== '' ||
    toDate !== '';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSelectedDirection('ALL');
    setFromDate('');
    setToDate('');
  };

  const openAddFunds = () => {
    lastActiveTriggerRef.current = addFundsBtnRef.current;
    setIsAddFundsOpen(true);
  };

  const openWithdrawal = () => {
    lastActiveTriggerRef.current = withdrawalBtnRef.current;
    setIsWithdrawalOpen(true);
  };

  const openLedger = () => {
    navigate('/business-owner/wallets/ledger');
  };

  const openActivityDetails = (act: GlobalWalletActivity, e?: React.MouseEvent) => {
    lastActiveTriggerRef.current = (e?.currentTarget as HTMLElement) || (document.activeElement as HTMLElement);
    setSelectedActivity(act);
  };

  // Badge styler for Transaction Type
  const getTypeBadge = (type: GlobalWalletTransactionType) => {
    switch (type) {
      case 'Funding':
      case 'Business Wallet Funding':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Withdrawal':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Charge':
      case 'TellerBud Charge':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Commission':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Badge styler for Status
  const getStatusBadge = (status: GlobalWalletActivity['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Reversed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading || !wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-700 mb-3" />
        <p className="text-sm font-medium">Loading Global Wallet...</p>
      </div>
    );
  }

  const currentAvailableBalance = wallet.currentBalance ?? 164350.0;

  return (
    <div id="global-wallet-page" className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Full-width Global Wallet Summary Card */}
      <div
        id="global-wallet-summary-card"
        className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs p-5 sm:p-6 transition-all"
      >
        {/* Card Header: Business Identity, Status & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">{wallet.businessName}</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                {wallet.businessId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {wallet.walletStatus}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono">
              {wallet.currency}
            </span>
            <button
              id="refresh-global-wallet-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
              aria-label="Refresh wallet balances"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Available Balance Display & Actions */}
        <div className="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Available Balance
            </span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatZMW(currentAvailableBalance)}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Add Funds: Oceanic Blue Primary Button */}
            <button
              ref={addFundsBtnRef}
              id="wallet-add-funds-btn"
              type="button"
              onClick={openAddFunds}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-sky-200" />
              <span>Add Funds</span>
            </button>

            {/* Request Withdrawal: Outlined Button */}
            <button
              ref={withdrawalBtnRef}
              id="wallet-request-withdrawal-btn"
              type="button"
              onClick={openWithdrawal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
              <span>Request Withdrawal</span>
            </button>

            {/* View Wallet Ledger: Outlined Button */}
            <button
              ref={ledgerBtnRef}
              id="wallet-view-ledger-btn"
              type="button"
              onClick={openLedger}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>View Wallet Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Wallet Activity Table Section */}
      <div
        id="recent-wallet-activity-section"
        className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 shrink-0">Recent Wallet Activity</h2>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[180px] sm:min-w-[210px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="activity-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference..."
                className="w-full pl-8.5 pr-8 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Range: From Date */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase">From:</span>
              <input
                id="activity-from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-xs text-slate-700 bg-transparent focus:outline-none font-mono"
              />
            </div>

            {/* Date Range: To Date */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase">To:</span>
              <input
                id="activity-to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-xs text-slate-700 bg-transparent focus:outline-none font-mono"
              />
            </div>

            {/* Activity Type Filter */}
            <select
              id="activity-type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="ALL">All Types</option>
              <option value="Funding">Funding</option>
              <option value="Charge">Charge</option>
              <option value="Commission">Commission</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>

            {/* Direction Filter */}
            <select
              id="activity-direction-filter"
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value as 'ALL' | 'Credit' | 'Debit')}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="ALL">All Directions</option>
              <option value="Credit">Credit (+)</option>
              <option value="Debit">Debit (-)</option>
            </select>

            {/* Status Filter */}
            <select
              id="activity-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Reset filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Compact Table (Fits desktop without horizontal scroll) */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">Date &amp; Time</th>
                <th scope="col" className="px-3.5 py-3 whitespace-nowrap">Reference</th>
                <th scope="col" className="px-3.5 py-3 whitespace-nowrap">Activity / Type</th>
                <th scope="col" className="px-3.5 py-3 whitespace-nowrap">Direction</th>
                <th scope="col" className="px-3.5 py-3 whitespace-nowrap text-right">Amount</th>
                <th scope="col" className="px-3.5 py-3 whitespace-nowrap text-right">Balance After</th>
                <th scope="col" className="px-3.5 py-3">Attribution / Source</th>
                <th scope="col" className="px-3.5 py-3 whitespace-nowrap text-center">Status</th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No wallet activity records found matching criteria.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="mt-2 text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const isFundingOrWithdrawal =
                    act.transactionType === 'Funding' ||
                    act.transactionType === 'Business Wallet Funding' ||
                    act.transactionType === 'Withdrawal';

                  const isCredit = act.credit !== null && act.credit > 0;
                  const displayAmount = isCredit ? act.credit! : (act.debit || 0);

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date & Time */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                        {act.dateTime}
                      </td>

                      {/* Reference */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-medium text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                          {act.reference}
                        </span>
                      </td>

                      {/* Activity / Type */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getTypeBadge(
                            act.transactionType
                          )}`}
                        >
                          {act.transactionType === 'Business Wallet Funding'
                            ? 'Funding'
                            : act.transactionType === 'TellerBud Charge'
                            ? 'Charge'
                            : act.transactionType}
                        </span>
                      </td>

                      {/* Direction */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        {isCredit ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Credit
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Debit
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-right font-mono font-bold">
                        {isCredit ? (
                          <span className="text-emerald-600">+{formatZMW(displayAmount)}</span>
                        ) : (
                          <span className="text-rose-600">-{formatZMW(displayAmount)}</span>
                        )}
                      </td>

                      {/* Balance After */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                        {formatZMW(act.balanceAfter)}
                      </td>

                      {/* Attribution / Source */}
                      <td className="px-3.5 py-3.5">
                        {isFundingOrWithdrawal ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-[9px] font-bold shrink-0">
                              CM
                            </div>
                            <span className="font-medium text-slate-900 text-xs">
                              Chileshe Mwamba <span className="text-[10px] text-slate-400">({act.externalProvider ? act.externalProvider.split(' ')[0] : 'Owner'})</span>
                            </span>
                          </div>
                        ) : act.agent ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                              {act.agent.avatarInitials || act.agent.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-slate-900 text-xs">{act.agent.name}</span>
                              <span className="text-[9px] px-1 bg-slate-100 text-slate-600 rounded font-mono">
                                {act.agent.id}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 font-medium">TellerBud Billing</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                            act.status
                          )}`}
                        >
                          {act.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <button
                          id={`view-activity-details-btn-${act.id}`}
                          onClick={(e) => openActivityDetails(act, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer"
                        >
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

        {/* Footer Summary */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredActivities.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{validWalletActivities.length}</span> recorded activities
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* DRAWERS & MODALS */}

      {/* 1. Add Funds Drawer */}
      <AddFundsDrawer
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        availableBalance={currentAvailableBalance}
        onViewActivityDetails={(act) => setSelectedActivity(act)}
        triggerButtonRef={addFundsBtnRef}
      />

      {/* 2. Request Withdrawal Drawer */}
      <RequestWithdrawalDrawer
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        availableBalance={currentAvailableBalance}
        onViewActivityDetails={(act) => setSelectedActivity(act)}
        triggerButtonRef={withdrawalBtnRef}
      />

      {/* 3. Activity Details Modal */}
      <ActivityDetailsModal
        activity={selectedActivity}
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        triggerButtonRef={lastActiveTriggerRef as React.RefObject<HTMLButtonElement | null>}
        onActivityUpdated={(updated) => {
          setSelectedActivity(updated);
          loadData();
        }}
      />

      {/* 4. Global Wallet Ledger Modal */}
      {isLedgerOpen && (
        <div
          id="global-wallet-ledger-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-wallet-ledger-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsLedgerOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center shrink-0 border border-sky-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="global-wallet-ledger-title" className="text-base font-bold text-slate-900">
                    Global Wallet Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    {wallet.businessName} ({wallet.businessId}) — Central Core Ledger
                  </p>
                </div>
              </div>
              <button
                id="close-wallet-ledger-modal"
                onClick={() => setIsLedgerOpen(false)}
                aria-label="Close Global Wallet Ledger"
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ledger Balances Ribbon */}
            <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Available Balance</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{formatZMW(currentAvailableBalance)}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Currency: <span className="font-semibold text-slate-700">{wallet.currency}</span>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-y-auto flex-1 max-h-[500px]">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-4 py-3">Reference</th>
                    <th scope="col" className="px-4 py-3">Timestamp</th>
                    <th scope="col" className="px-4 py-3">Type</th>
                    <th scope="col" className="px-4 py-3">Description</th>
                    <th scope="col" className="px-4 py-3 text-right">Debit</th>
                    <th scope="col" className="px-4 py-3 text-right">Credit</th>
                    <th scope="col" className="px-4 py-3 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-sky-800">
                        {entry.reference}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {entry.timestamp}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs text-slate-600">
                        {entry.description}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {entry.direction === 'Debit' ? (
                          <span className="text-rose-600">-{formatZMW(entry.amount)}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {entry.direction === 'Credit' ? (
                          <span className="text-emerald-600">+{formatZMW(entry.amount)}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                        {formatZMW(entry.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                {ledgerEntries.length} chronological ledger records
              </span>
              <button
                id="close-ledger-bottom-btn"
                type="button"
                onClick={() => setIsLedgerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
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
