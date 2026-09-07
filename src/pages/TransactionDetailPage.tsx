import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCw,
  Building2,
  User,
  Phone,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Share2,
  Wallet,
} from 'lucide-react';
import { BusinessTransactionRecord } from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { formatZMW } from '../utils/formatters';
import { StatusChip } from '../components/shared/StatusChip';
import { VendorLogo } from '../components/walk-in/VendorLogo';
import {
  buildNormalizedLifecycleTimeline,
  buildNormalizedWalletImpact,
} from '../utils/transactionLifecycle';

export const TransactionDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<BusinessTransactionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!reference) return;
      setIsLoading(true);
      setError(null);
      try {
        const item = await adminService.getBusinessTransactionByReference(
          reference,
          'BIZ-LUS-001'
        );
        if (item) {
          setTransaction(item);
        } else {
          setError(`Transaction with reference "${reference}" could not be found.`);
        }
      } catch (err) {
        console.error('Error fetching transaction detail:', err);
        setError('Failed to load transaction details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [reference]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-3">
        <RotateCw size={24} className="animate-spin text-[#0D93AA] mx-auto" />
        <p className="text-sm font-medium text-slate-600">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <AlertCircle size={32} className="text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-red-900">Transaction Not Found</h2>
          <p className="text-sm text-red-700">{error || 'Unable to locate transaction record.'}</p>
          <button
            onClick={() => navigate('/business-owner/transactions/all')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Transactions</span>
          </button>
        </div>
      </div>
    );
  }

  // Resolve related operational link if applicable
  const getRelatedOperationalLink = (relRef?: string | null) => {
    if (!relRef) return null;
    if (relRef.startsWith('TB-WLK-')) {
      return { path: `/business-owner/walk-in-transactions/${relRef}`, label: 'Walk-In Record' };
    }
    if (relRef.startsWith('TB-CFR-')) {
      return { path: `/business-owner/operations/cash-float-requests/${relRef}`, label: 'Cash / Float Record' };
    }
    if (relRef.startsWith('TB-ATL-')) {
      return { path: `/business-owner/operations/agent-to-agent-liquidity/${relRef}`, label: 'Agent Liquidity Record' };
    }
    return null;
  };

  const operationalLink = getRelatedOperationalLink(transaction.relatedReference);

  const walletImpact =
    transaction.globalWalletImpact ||
    buildNormalizedWalletImpact({
      reference: transaction.reference,
      category: transaction.category,
      amount: transaction.amount,
      dateTime: transaction.dateTime,
      tellerBudChargeOrCommission: transaction.tellerBudChargeOrCommission,
      status: transaction.status,
      relatedLedgerEntry: transaction.relatedLedgerEntry,
    });

  const lifecycleStages = buildNormalizedLifecycleTimeline({
    status: transaction.status,
    agentName: transaction.agentName,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    completedAt: transaction.completedAt,
    dateTime: transaction.dateTime,
  });

  return (
    <div id="transaction-detail-page" className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. Working Back Navigation Control */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-all-transactions"
          onClick={() => navigate('/business-owner/transactions/all')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D93AA] hover:text-[#0b7e92] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to All Transactions</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">ID: {transaction.reference}</span>
        </div>
      </div>

      {/* 2. Top Transaction Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                {transaction.reference}
              </h1>
              <StatusChip status={transaction.status} size="md" />
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {transaction.category}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Logged on {transaction.dateTime} • Channel: External USSD Dialler • Method: External USSD
            </p>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Transaction Amount
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {formatZMW(transaction.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Information Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 size={16} className="text-[#0D93AA]" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Business Information
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Business Name</span>
              <span className="font-semibold text-slate-900 text-right">{transaction.businessName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Business ID</span>
              <span className="font-mono font-semibold text-slate-800 text-right">{transaction.businessId}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Operating Centre</span>
              <span className="font-medium text-slate-800 text-right">Lusaka Central Express Agency</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Business Portal</span>
              <span className="font-medium text-emerald-700 text-right">Authenticated Owner Access</span>
            </div>
          </div>
        </div>

        {/* Agent Information Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={16} className="text-[#0D93AA]" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Agent Information
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Agent Assigned</span>
              <span className="font-semibold text-slate-900 text-right">
                {transaction.agentName || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Agent ID</span>
              <span className="font-mono text-slate-800 text-right">
                {transaction.agentId || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Agent Phone</span>
              <span className="font-mono text-slate-800 text-right">
                {transaction.agentPhone || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Agency Station</span>
              <span className="text-slate-800 text-right">Lusaka Central Express Agency</span>
            </div>
          </div>
        </div>

        {/* Customer / Counterparty Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone size={16} className="text-[#0D93AA]" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Customer / Counterparty
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Counterparty</span>
              <span className="font-semibold text-slate-900 text-right max-w-[60%]">
                {transaction.customerOrCounterparty}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Contact Phone</span>
              <span className="font-mono text-slate-800 text-right">
                {transaction.customerPhone || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Transaction Type</span>
              <span className="font-medium text-slate-800 text-right">
                {transaction.transactionType}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Description</span>
              <span className="text-slate-600 text-right max-w-[65%]">
                {transaction.description || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Vendor & Channel Information Card (External USSD Boundary) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers size={16} className="text-[#0D93AA]" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vendor & Channel
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Vendor</span>
              <div>
                {transaction.vendor ? (
                  <VendorLogo vendor={transaction.vendor} size="detail" showName={true} />
                ) : (
                  <span className="text-slate-400 font-medium">— (Internal Transfer)</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Channel / Terminal</span>
              <span className="font-semibold text-slate-900 text-right">
                External USSD Dialler
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Transaction Method</span>
              <span className="font-medium text-slate-800 text-right">
                External USSD
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">TellerBud Fee</span>
              <span className="font-mono font-semibold text-slate-900 text-right">
                {formatZMW(walletImpact.feeAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Operational Status</span>
              <span className="text-right">
                <StatusChip status={transaction.status} size="sm" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DEDICATED GLOBAL WALLET IMPACT SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA]">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Global Wallet Impact
              </h3>
              <p className="text-xs text-slate-500">
                TellerBud fee deducted from the business Global Wallet for this operational transaction.
              </p>
            </div>
          </div>
          <button
            id="btn-view-in-wallet-ledger"
            onClick={() =>
              navigate(
                `/business-owner/wallets/ledger?search=${walletImpact.ledgerReference}`
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors shadow-2xs shrink-0"
          >
            <span>View in Wallet Ledger</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Global Wallet Impact Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Fee Type
            </span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {walletImpact.feeType}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Fee Amount
            </span>
            <span className="text-sm font-bold font-mono text-rose-700 mt-1 block">
              {formatZMW(walletImpact.feeAmount)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Entry Direction
            </span>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {walletImpact.entryDirection}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Deduction Status
            </span>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {walletImpact.deductionStatus}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Global Wallet Balance Before
            </span>
            <span className="text-sm font-semibold font-mono text-slate-800 mt-1 block">
              {formatZMW(walletImpact.walletBalanceBefore)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Global Wallet Balance After
            </span>
            <span className="text-sm font-bold font-mono text-[#0D93AA] mt-1 block">
              {formatZMW(walletImpact.walletBalanceAfter)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Wallet Ledger Reference
            </span>
            <button
              onClick={() =>
                navigate(
                  `/business-owner/wallets/ledger?search=${walletImpact.ledgerReference}`
                )
              }
              className="text-sm font-bold font-mono text-[#0D93AA] hover:underline mt-1 block text-left"
            >
              {walletImpact.ledgerReference}
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Deduction Timestamp
            </span>
            <span className="text-xs font-medium text-slate-700 mt-1 block">
              {walletImpact.deductionTimestamp}
            </span>
          </div>
        </div>

        {/* Operational Principal Amount Boundary Notice */}
        <div className="p-3.5 rounded-lg bg-sky-50/60 border border-sky-200/80 text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            <strong>Principal Amount:</strong> {formatZMW(transaction.amount)} processed externally via vendor USSD dialler; not deducted from or credited to the Global Wallet.
          </span>
          <span className="text-[11px] font-semibold text-sky-800 shrink-0 uppercase tracking-wider">
            External USSD Boundary
          </span>
        </div>
      </div>

      {/* 5. RELATED OPERATIONAL RECORDS (CLEAN, NO EXPLANATORY SENTENCES) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Receipt size={16} className="text-[#0D93AA]" />
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Related Operational Records
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Related Operational Record */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Related Request Reference
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 mt-0.5 block">
                {transaction.relatedReference || '—'}
              </span>
            </div>
            {operationalLink && (
              <Link
                to={operationalLink.path}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:underline"
              >
                <span>View {operationalLink.label}</span>
                <ExternalLink size={13} />
              </Link>
            )}
          </div>

          {/* Related Wallet Ledger Entry */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Wallet Ledger Reference
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 mt-0.5 block">
                {walletImpact.ledgerReference}
              </span>
            </div>
            <button
              onClick={() =>
                navigate(
                  `/business-owner/wallets/ledger?search=${walletImpact.ledgerReference}`
                )
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:underline"
            >
              <span>View in Wallet Ledger</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. SIMPLIFIED LIFECYCLE TIMELINE (EXACTLY 3 STAGES, NO EXPLANATORY SENTENCES) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#0D93AA]" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lifecycle Timeline
            </h3>
          </div>
          <div className="text-xs text-slate-500">
            <span>3 Lifecycle Stages</span>
          </div>
        </div>

        {/* Step-by-step visual timeline */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {lifecycleStages.map((step) => (
            <div key={step.id} className="relative group">
              <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#0D93AA] ring-4 ring-white shadow-xs" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <span className="text-sm font-bold text-slate-900">
                  {step.status}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {step.timestamp}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {step.actor}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Timestamps Footer */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
          <div>
            <span className="font-medium text-slate-400 block">Created At</span>
            <span className="font-mono text-slate-700">{transaction.createdAt}</span>
          </div>
          <div>
            <span className="font-medium text-slate-400 block">Last Updated</span>
            <span className="font-mono text-slate-700">{transaction.updatedAt}</span>
          </div>
          <div>
            <span className="font-medium text-slate-400 block">Completed At</span>
            <span className="font-mono text-slate-700">{transaction.completedAt || 'In Progress / Pending'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
