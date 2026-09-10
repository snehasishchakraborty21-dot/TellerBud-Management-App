import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  XCircle,
  ShieldCheck,
  Building2,
  User,
  Wallet,
  Smartphone,
  Calendar,
  Layers,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Activity,
} from 'lucide-react';
import {
  getWalletFundingByReference,
  formatZMW,
  getFundingExtendedDetails,
} from '../data/mockWalletFundingData';
import { getCustomerRegisteredPhone } from '../data/mockCustomerData';
import { useAuth } from '../context/AuthContext';
import { FundingStatus } from '../types/walletFunding';
import { MtnLogo, AirtelLogo } from '../components/wallet/ProviderLogos';

export const WalletFundingDetailPage: React.FC = () => {
  const { fundingId } = useParams<{ fundingId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAuthorizedAdmin = !!currentUser;

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttemptCount, setRefreshAttemptCount] = useState(0);
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);
  const [manualRefreshTime, setManualRefreshTime] = useState<string | null>(null);

  const record = fundingId ? getWalletFundingByReference(fundingId) : undefined;
  const ext = record ? getFundingExtendedDetails(record) : null;

  const fullCustomerPhone = record && isAuthorizedAdmin
    ? (record.customerMobileNumber || getCustomerRegisteredPhone(record.customerId, record.customerName))
    : 'Access Restricted';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefreshStatus = () => {
    if (isRefreshing || !record) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshAttemptCount((prev) => prev + 1);
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      setManualRefreshTime(`${formattedDate}, ${formattedTime}`);
      setRefreshNotification(
        `Backend provider query successful: Status verified as "${record.status.toUpperCase()}". Idempotency preserved with zero duplicate balance impact.`
      );
      setTimeout(() => setRefreshNotification(null), 6000);
    }, 700);
  };

  const renderStatusBadge = (status: FundingStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>Completed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} className="shrink-0" />
            <span>Pending Verification</span>
          </span>
        );
      case 'Initiated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock size={13} className="shrink-0" />
            <span>Initiated</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} className="shrink-0" />
            <span>Failed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle size={13} className="shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertTriangle size={13} className="shrink-0" />
            <span>Expired</span>
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw size={13} className="shrink-0" />
            <span>Reversed</span>
          </span>
        );
    }
  };

  const formatDisplayProviderStatus = (status: string) => {
    if (
      status === 'PENDING_USER_INPUT' ||
      status === 'Awaiting Customer Authorization' ||
      status === 'PROCESSING_BY_PROVIDER' ||
      status === 'Processing by Provider' ||
      status === 'PENDING'
    ) {
      return 'Processing by Provider';
    }
    return status;
  };

  if (!record || !ext) {
    return (
      <div className="w-full space-y-4 pb-16">
        <button
          type="button"
          onClick={() => navigate('/super-admin/wallets/add-funds')}
          aria-label="Back to Wallet Funding list"
          title="Back to Wallet Funding"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Wallet Funding</span>
        </button>

        <div className="bg-white border border-gray-200/80 rounded-xl p-12 text-center shadow-xs">
          <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">
            Funding Attempt Not Found
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            The funding record reference &ldquo;{fundingId}&rdquo; could not be
            located. It may have been archived or an incorrect reference was
            provided.
          </p>
          <button
            type="button"
            onClick={() => navigate('/super-admin/wallets/add-funds')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b7e93] focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Wallet Funding List</span>
          </button>
        </div>
      </div>
    );
  }

  // Derive status characteristics
  const isCompleted = record.status === 'Completed';
  const isPending = record.status === 'Pending' || record.status === 'Initiated';
  const isReversed = record.status === 'Reversed';
  const isFailed =
    record.status === 'Failed' ||
    record.status === 'Cancelled' ||
    record.status === 'Expired';

  // Build canonical lifecycle timeline steps
  const buildTimelineSteps = () => {
    return [
      {
        step: 1,
        title: 'Funding Initiated',
        description: `Customer initiated wallet collection for ${formatZMW(record.amount)} via ${record.provider}.`,
        timestamp: record.initiatedAt,
        status: 'completed' as const,
      },
      {
        step: 2,
        title: 'API Request Submitted',
        description: `Direct TLS request dispatched to ${record.provider} collection gateway (HTTP 202 Accepted).`,
        timestamp: record.initiatedAt,
        status: 'completed' as const,
      },
      {
        step: 3,
        title: 'Provider Processing',
        description: isFailed
          ? `Provider reported transaction termination (${formatDisplayProviderStatus(ext.providerStatus)}).`
          : isPending
          ? `Direct API payment request is being processed by ${record.provider}. Awaiting provider transaction resolution.`
          : `Direct API payment request processed successfully by ${record.provider}.`,
        timestamp: isCompleted || isReversed ? record.initiatedAt : record.lastUpdated,
        status: isCompleted || isReversed
          ? ('completed' as const)
          : isPending
          ? ('in_progress' as const)
          : ('failed' as const),
      },
      {
        step: 4,
        title: 'Provider Confirmation Received',
        description: isFailed
          ? `Gateway reported failure callback (${formatDisplayProviderStatus(ext.providerStatus)}). Zero funds collected.`
          : isPending
          ? `Awaiting provider callback with cryptographic signature.`
          : `Signed webhook confirmed from ${record.provider} (Ref: ${record.providerReference}). Status: ${formatDisplayProviderStatus(ext.providerStatus)}.`,
        timestamp: isPending ? 'Pending Callback' : ext.lastProviderResponseTime,
        status: isCompleted || isReversed
          ? ('completed' as const)
          : isPending
          ? ('upcoming' as const)
          : ('failed' as const),
      },
      {
        step: 5,
        title: 'Backend Verification Completed',
        description: isFailed
          ? `Backend verified transaction termination with zero ledger impact.`
          : isPending
          ? `Awaiting verification: signature, nonce freshness, and idempotency key check.`
          : `Backend cryptographic validation passed (HMAC-SHA256). Idempotency key verified.`,
        timestamp: isPending ? 'Pending Verification' : record.lastUpdated,
        status: isCompleted || isReversed
          ? ('completed' as const)
          : isPending
          ? ('upcoming' as const)
          : ('failed' as const),
      },
      {
        step: 6,
        title: isCompleted || isReversed
          ? 'Wallet Credited'
          : isPending
          ? 'Wallet Credited'
          : 'No Wallet Credit Created',
        description: isCompleted
          ? `Immutable ledger credit posted: ${record.walletCreditReference} (+ ${formatZMW(record.amount)}). Balance: ${formatZMW(ext.balanceAfter)}.`
          : isReversed
          ? `Initial ledger credit posted: ${record.walletCreditReference} (+ ${formatZMW(record.amount)}).`
          : isPending
          ? `Wallet balance untouched. Strictly awaiting backend verification before crediting.`
          : `No wallet credit has been created. Ledger balance remains unchanged at ${formatZMW(ext.balanceAfter)}.`,
        timestamp: isCompleted || isReversed
          ? ext.postedAt
          : isPending
          ? 'Awaiting Verification'
          : record.lastUpdated,
        status: isCompleted || isReversed
          ? ('completed' as const)
          : isPending
          ? ('upcoming' as const)
          : ('failed' as const),
      },
      ...(isReversed
        ? [
            {
              step: 7,
              title: 'Compensating Reversal Posted',
              description: `Compensating debit entry ${ext.reversalDebitReference} (- ${formatZMW(ext.reversalDebitAmount || record.amount)}) posted. Original credit preserved in immutable audit log.`,
              timestamp: record.lastUpdated,
              status: 'completed' as const,
              isReversal: true,
            },
          ]
        : isFailed
        ? [
            {
              step: 7,
              title: 'Settlement Outcome Finalized',
              description: `Transaction closed with zero ledger effect. No credit or debit was posted to wallet ${record.walletId}.`,
              timestamp: record.lastUpdated,
              status: 'failed' as const,
            },
          ]
        : []),
    ];
  };

  const timelineSteps = buildTimelineSteps();
  const currentAttempts = ext.verificationAttempts + refreshAttemptCount;
  const currentResponseTime = manualRefreshTime || ext.lastProviderResponseTime;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 1. Sub-Top-Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        {/* Back to Wallet Funding */}
        <button
          type="button"
          onClick={() => navigate('/super-admin/wallets/add-funds')}
          aria-label="Back to Wallet Funding list"
          title="Back to Wallet Funding"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#0D93AA] bg-white border border-gray-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-colors shadow-2xs cursor-pointer w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Wallet Funding</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Provider Status */}
          <button
            type="button"
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            aria-label="Refresh provider transaction status"
            title="Refresh Provider Status"
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 transition-colors shadow-2xs cursor-pointer ${
              isRefreshing
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-gray-200 hover:bg-slate-50 hover:text-[#0D93AA]'
            }`}
          >
            <RefreshCw
              size={13}
              className={`shrink-0 ${isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-slate-600'}`}
            />
            <span>
              {isRefreshing ? 'Querying Provider API...' : 'Refresh Provider Status'}
            </span>
          </button>

          {/* View Customer Wallet (Primary top-right action) */}
          <button
            type="button"
            onClick={() =>
              navigate(`/super-admin/wallets/customers/${encodeURIComponent(record.walletId)}`)
            }
            aria-label={`View wallet details for customer ${record.customerName} (${record.walletId})`}
            title={`View wallet details for ${record.walletId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e93] focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Wallet size={13} className="shrink-0" />
            <span>View Customer Wallet</span>
          </button>

          {/* View Ledger Entry (if credited) */}
          {record.walletCreditReference && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/super-admin/wallets/customers/${encodeURIComponent(
                    record.walletId
                  )}?tab=ledger`
                )
              }
              aria-label={`View ledger entry for reference ${record.walletCreditReference}`}
              title="View ledger entry"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 hover:text-[#0D93AA] focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Layers size={13} className="shrink-0 text-[#0D93AA]" />
              <span>View Ledger Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulation Refresh Toast / Banner */}
      {refreshNotification && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-emerald-950">Provider Verification: </span>
            {refreshNotification}
          </div>
        </div>
      )}

      {/* 2. Header Banner Card */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Provider Logo, Reference, Status Badge, Customer Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-gray-200/80 flex items-center justify-center shrink-0 p-2 shadow-2xs">
              {record.provider === 'MTN Mobile Money' ? (
                <MtnLogo className="w-8 h-8 rounded-full" />
              ) : (
                <AirtelLogo className="w-8 h-8 rounded-full" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">
                  {record.fundingReference}
                </h1>
                {renderStatusBadge(record.status)}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">
                  {record.customerName}
                </span>
                <span className="text-slate-300">/</span>
                <span className="font-mono text-[#0D93AA] font-semibold">
                  {record.customerId}
                </span>
                <span className="text-slate-300">/</span>
                <span className="font-mono text-slate-800 font-medium select-all">
                  {fullCustomerPhone}
                </span>
                <span className="text-slate-300">/</span>
                <span className="font-mono text-slate-600 font-medium">
                  Wallet: {record.walletId}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-600 font-mono">
                  Initiated: {record.initiatedAt}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Funding Amount (Duplicate View Customer Wallet button removed per instruction) */}
          <div className="flex flex-col sm:items-start lg:items-end justify-center gap-1 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
            <span className="text-xs font-semibold text-slate-600 block">Funding Amount</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#102025]">
              {formatZMW(record.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Summary Cards (3 Cards) - Unnecessary supporting labels/decorative subtitles removed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Funding Amount */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="text-slate-700 font-semibold text-xs mb-2 uppercase tracking-wider text-[11px]">
            Funding Amount
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatZMW(record.amount)}
          </div>
        </div>

        {/* Card 2: Confirmed Amount */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="text-slate-700 font-semibold text-xs mb-2 uppercase tracking-wider text-[11px]">
            Confirmed Amount
          </div>
          <div className="text-2xl font-bold font-mono">
            {isCompleted ? (
              <span className="text-emerald-700">{formatZMW(record.amount)}</span>
            ) : isPending ? (
              <span className="text-amber-600 text-lg font-sans">
                Awaiting Confirmation
              </span>
            ) : isReversed ? (
              <span className="text-purple-700">{formatZMW(record.amount)}</span>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
        </div>

        {/* Card 3: Wallet Credit */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="text-slate-700 font-semibold text-xs mb-2 uppercase tracking-wider text-[11px]">
            Wallet Credit
          </div>
          <div className="text-2xl font-bold font-mono">
            {isCompleted ? (
              <span className="text-emerald-700 flex items-center gap-1.5 text-lg">
                <CheckCircle2 size={18} />
                <span>Credited</span>
              </span>
            ) : isPending ? (
              <span className="text-amber-600 text-lg font-sans">Not Credited</span>
            ) : isReversed ? (
              <span className="text-purple-700 flex items-center gap-1.5 text-lg">
                <RotateCcw size={18} />
                <span>Reversed</span>
              </span>
            ) : (
              <span className="text-slate-500 text-lg font-sans">Not Credited</span>
            )}
          </div>
          {isCompleted && record.walletCreditReference && (
            <div className="text-xs text-slate-600 mt-2 truncate">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/super-admin/wallets/customers/${encodeURIComponent(
                      record.walletId
                    )}?tab=ledger`
                  )
                }
                aria-label={`View ledger entry ${record.walletCreditReference}`}
                title="View ledger entry"
                className="font-mono font-semibold text-[#0D93AA] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              >
                Ref: {record.walletCreditReference}
              </button>
            </div>
          )}
          {isReversed && (
            <div className="text-xs text-slate-600 mt-2 space-x-1">
              <span className="font-mono font-semibold text-purple-700">
                {record.walletCreditReference}
              </span>
              <span>/</span>
              <span className="font-mono font-semibold text-purple-700">
                {ext.reversalDebitReference}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Desktop Two-Column Layout for the 4 core sections + Full-Width Operational Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Section 1: Funding Information */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <User size={15} className="text-[#0D93AA]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Funding Information
            </h2>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Funding Reference</dt>
              <dd className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span className="select-all">{record.fundingReference}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(record.fundingReference, 'fundingRef')}
                  aria-label={`Copy funding reference ${record.fundingReference}`}
                  title="Copy funding reference"
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded transition-colors cursor-pointer"
                >
                  {copiedField === 'fundingRef' ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Current Status</dt>
              <dd className="mt-0.5">{renderStatusBadge(record.status)}</dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Customer Name</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">
                {record.customerName}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Customer ID</dt>
              <dd className="mt-0.5">
                <Link
                  to={`/super-admin/people/customers/${encodeURIComponent(
                    record.customerId
                  )}`}
                  aria-label={`View profile for customer ID ${record.customerId}`}
                  title="View customer profile"
                  className="font-mono font-semibold text-[#0D93AA] hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded"
                >
                  <span>{record.customerId}</span>
                  <ExternalLink size={11} />
                </Link>
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Linked Wallet ID</dt>
              <dd className="mt-0.5">
                <Link
                  to={`/super-admin/wallets/customers/${encodeURIComponent(
                    record.walletId
                  )}`}
                  aria-label={`View wallet details for wallet ID ${record.walletId}`}
                  title="View customer wallet"
                  className="font-mono font-semibold text-[#0D93AA] hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded"
                >
                  <span>{record.walletId}</span>
                  <ExternalLink size={11} />
                </Link>
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Collection Provider</dt>
              <dd className="flex items-center gap-2 font-medium text-slate-900 mt-0.5">
                {record.provider === 'MTN Mobile Money' ? (
                  <MtnLogo className="w-4 h-4 rounded-full shrink-0" />
                ) : (
                  <AirtelLogo className="w-4 h-4 rounded-full shrink-0" />
                )}
                <span>{record.provider}</span>
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Funding Mobile Number</dt>
              <dd className="font-mono text-slate-800 font-medium mt-0.5 flex items-center gap-1.5 select-all">
                <Smartphone size={12} className="text-slate-500" />
                <span>{fullCustomerPhone}</span>
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Requested Amount</dt>
              <dd className="font-mono font-bold text-[#102025] mt-0.5">
                {formatZMW(record.amount)}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Initiated Date & Time</dt>
              <dd className="font-mono text-slate-700 mt-0.5">
                {record.initiatedAt}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Last Updated Timestamp</dt>
              <dd className="font-mono text-slate-700 mt-0.5">
                {record.lastUpdated}
              </dd>
            </div>
          </dl>
        </div>

        {/* Section 2: Wallet and Ledger Impact */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Layers size={15} className="text-[#0D93AA]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Wallet and Ledger Impact
            </h2>
          </div>

          {/* Completed Transaction Ledger Breakdown */}
          {isCompleted && (
            <div className="space-y-4">
              <div className="bg-slate-50/70 border border-gray-200/80 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200">
                  <span className="text-slate-600 font-medium">Linked Customer Wallet</span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/super-admin/wallets/customers/${encodeURIComponent(
                          record.walletId
                        )}`
                      )
                    }
                    aria-label={`Open wallet ${record.walletId}`}
                    title="Open customer wallet"
                    className="font-mono font-bold text-[#0D93AA] hover:underline inline-flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
                  >
                    <span>{record.walletId}</span>
                    <ExternalLink size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
                  <div>
                    <span className="text-[11px] text-slate-600 font-medium block">Balance Before</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatZMW(ext.balanceBefore)}
                    </span>
                  </div>

                  <div className="border-x border-gray-200 px-1">
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      Funding Credit
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      + {formatZMW(ext.fundingCredit)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-600 font-medium block">Balance After</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatZMW(ext.balanceAfter)}
                    </span>
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-slate-600 font-semibold text-[11px]">Ledger Entry Reference</dt>
                  <dd className="mt-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/super-admin/wallets/customers/${encodeURIComponent(
                            record.walletId
                          )}?tab=ledger`
                        )
                      }
                      aria-label={`View ledger entry for ${record.walletCreditReference}`}
                      title="View ledger record"
                      className="font-mono font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
                    >
                      <span>{record.walletCreditReference}</span>
                      <ExternalLink size={12} />
                    </button>
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-600 font-semibold text-[11px]">Ledger Entry Type</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">
                    Add Funds Credit (MNO Settlement)
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-600 font-semibold text-[11px]">Posted Date & Time</dt>
                  <dd className="font-mono text-slate-700 mt-0.5">
                    {ext.postedAt}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-600 font-semibold text-[11px]">Reconciliation Status</dt>
                  <dd className="mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} />
                      <span>Reconciled</span>
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Reversed Transaction Ledger Breakdown */}
          {isReversed && (
            <div className="space-y-4">
              <div className="bg-purple-50/50 border border-purple-200/80 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-purple-200">
                  <span className="text-purple-900 font-semibold">
                    Compensating Reversal Entries
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/super-admin/wallets/customers/${encodeURIComponent(
                          record.walletId
                        )}?tab=ledger`
                      )
                    }
                    aria-label={`Open wallet ${record.walletId}`}
                    title="Open customer wallet"
                    className="font-mono font-bold text-[#0D93AA] hover:underline inline-flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
                  >
                    <span>{record.walletId}</span>
                    <ExternalLink size={12} />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Original Credit Entry:</span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/super-admin/wallets/customers/${encodeURIComponent(
                            record.walletId
                          )}?tab=ledger`
                        )
                      }
                      aria-label="View original credit ledger entry"
                      className="font-mono font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{record.walletCreditReference} (+ {formatZMW(record.amount)})</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Compensating Debit Entry:</span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/super-admin/wallets/customers/${encodeURIComponent(
                            record.walletId
                          )}?tab=ledger`
                        )
                      }
                      aria-label="View compensating debit ledger entry"
                      className="font-mono font-semibold text-purple-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{ext.reversalDebitReference} (- {formatZMW(ext.reversalDebitAmount || record.amount)})</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-purple-200/80 flex items-center justify-between font-semibold text-slate-800">
                    <span>Net Balance Impact:</span>
                    <span className="font-mono text-purple-900">
                      ZMW 0.00 (Balanced Compensating Entry)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed">
                Financial Integrity Mandate: Original ledger entries are never deleted or modified. Reversals are executed exclusively via paired compensating debit records.
              </div>
            </div>
          )}

          {/* Pending, Failed, Cancelled, Expired Breakdown */}
          {(isPending || isFailed) && (
            <div className="space-y-3">
              <div className="bg-slate-50 border border-dashed border-gray-300 rounded-lg p-5 text-center space-y-1.5">
                <div className="font-semibold text-slate-800 text-sm">
                  No wallet credit has been created.
                </div>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {isPending
                    ? 'The wallet balance remains unchanged. Ledger credit is only generated upon cryptographic provider confirmation.'
                    : 'Under TellerBud banking rules, failed, cancelled, and expired attempts produce zero ledger balance impact.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-white border border-gray-200/80 rounded-lg p-3">
                  <span className="text-slate-600 font-semibold text-[11px] block">Ledger Status</span>
                  <span className="font-semibold text-slate-800">
                    {isPending ? 'Pending Callback' : 'Zero Ledger Impact'}
                  </span>
                </div>
                <div className="bg-white border border-gray-200/80 rounded-lg p-3">
                  <span className="text-slate-600 font-semibold text-[11px] block">Wallet Balance</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatZMW(ext.balanceAfter)} (Unchanged)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Provider Verification */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building2 size={15} className="text-[#0D93AA]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Provider Verification
            </h2>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Provider Name</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">
                {record.provider}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Provider Reference</dt>
              <dd className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span className="select-all">{record.providerReference}</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(record.providerReference, 'providerRef')
                  }
                  aria-label={`Copy provider reference ${record.providerReference}`}
                  title="Copy provider reference"
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded transition-colors cursor-pointer"
                >
                  {copiedField === 'providerRef' ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Provider Transaction Status</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    ext.providerStatus.includes('SUCCESS')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : ext.providerStatus.includes('FAIL')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : ext.providerStatus.includes('REVERS')
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                  title={ext.providerStatus === 'PENDING_USER_INPUT' ? 'Internal system status: PENDING_USER_INPUT' : undefined}
                >
                  {formatDisplayProviderStatus(ext.providerStatus)}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Verification Method</dt>
              <dd className="font-mono font-medium text-slate-800 mt-0.5">
                {ext.verificationMethod}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Callback Status</dt>
              <dd className="font-mono font-medium text-slate-800 mt-0.5">
                {isPending ||
                ext.callbackReceived === 'Awaiting Handset Input' ||
                ext.callbackReceived === 'No — awaiting provider callback' ||
                ext.callbackReceived === 'Awaiting Provider Response'
                  ? 'Awaiting Provider Response'
                  : ext.callbackReceived}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Backend Verification Status</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    ext.backendVerificationStatus === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : ext.backendVerificationStatus === 'Failed'
                      ? 'bg-rose-50 text-rose-700'
                      : ext.backendVerificationStatus === 'Compensated'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <ShieldCheck size={12} className="shrink-0" />
                  <span>{ext.backendVerificationStatus}</span>
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Verification Attempts</dt>
              <dd className="font-mono text-slate-700 mt-0.5">
                {currentAttempts} attempt{currentAttempts > 1 ? 's' : ''}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Last Provider Response Time</dt>
              <dd className="font-mono text-slate-700 mt-0.5">
                {currentResponseTime}
              </dd>
            </div>
          </dl>
        </div>

        {/* Section 4: Funding Timeline */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Calendar size={15} className="text-[#0D93AA]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Funding Timeline
            </h2>
          </div>

          {/* Vertical Timeline with Clear Colors and High Contrast Timestamps */}
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {timelineSteps.map((step, idx) => {
              const isStepCompleted = step.status === 'completed';
              const isStepFailed = step.status === 'failed';
              const isStepInProgress = step.status === 'in_progress';
              const isStepUpcoming = step.status === 'upcoming';
              const isHighlightedAmber = isStepInProgress || (step.step === 3 && isPending);

              return (
                <div key={idx} className="relative group">
                  {/* Bullet */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                      isStepCompleted
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                        : isStepFailed
                        ? 'border-rose-500 text-rose-600 bg-rose-50'
                        : isHighlightedAmber
                        ? 'border-amber-500 text-amber-700 bg-amber-100 ring-4 ring-amber-200/70 animate-pulse'
                        : 'border-slate-300 text-slate-500 bg-slate-100'
                    }`}
                  >
                    {isStepCompleted ? (
                      <CheckCircle2 size={11} className="shrink-0" />
                    ) : isStepFailed ? (
                      <XCircle size={11} className="shrink-0" />
                    ) : isHighlightedAmber ? (
                      <Clock size={11} className="shrink-0" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    )}
                  </div>

                  <div
                    className={`text-xs rounded-lg transition-colors ${
                      isHighlightedAmber
                        ? 'bg-amber-50/80 border border-amber-200 p-3 -ml-1'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isStepFailed
                              ? 'text-rose-700'
                              : isHighlightedAmber
                              ? 'text-amber-900 font-bold'
                              : isStepCompleted
                              ? 'text-slate-900'
                              : 'text-slate-600'
                          }`}
                        >
                          {step.step}. {step.title}
                        </span>
                        {isHighlightedAmber && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock size={10} className="animate-spin" />
                            <span>In Progress</span>
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-mono font-medium ${
                          isHighlightedAmber ? 'text-amber-800' : 'text-slate-600'
                        }`}
                      >
                        {step.timestamp}
                      </span>
                    </div>
                    <p
                      className={`mt-1 leading-relaxed text-xs ${
                        isHighlightedAmber
                          ? 'text-amber-800 font-medium'
                          : isStepUpcoming
                          ? 'text-slate-500'
                          : 'text-slate-600'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Operational Audit - Spans entire width (grid-column: 1 / -1) */}
        <div
          className="col-span-1 lg:col-span-2 bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4"
          style={{ gridColumn: '1 / -1' }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Activity size={15} className="text-[#0D93AA]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Operational Audit
            </h2>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5 text-xs">
            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Created By</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">
                {ext.createdBy}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Initiation Channel</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">
                {ext.source}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Country & Currency</dt>
              <dd className="font-mono text-slate-800 font-medium mt-0.5">
                {ext.country} ({ext.currency})
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Provider Integration</dt>
              <dd className="font-mono text-[11px] text-slate-800 font-medium mt-0.5 truncate" title={ext.providerIntegration}>
                {ext.providerIntegration}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Last Updated By</dt>
              <dd className="font-mono text-[11px] text-slate-800 font-medium mt-0.5">
                {ext.lastUpdatedBy}
              </dd>
            </div>

            <div>
              <dt className="text-slate-600 font-semibold text-[11px]">Duplicate Callbacks</dt>
              <dd className="font-mono text-emerald-700 font-semibold mt-0.5">
                {ext.duplicateCallbackCount} (Single Settlement Enforced)
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-slate-600 font-semibold text-[11px]">Idempotency Verification Key</dt>
              <dd className="font-mono text-[11px] text-slate-800 font-medium bg-slate-50 px-2.5 py-1.5 rounded border border-gray-200/80 mt-0.5 select-all">
                {ext.idempotencyCheck}
              </dd>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="text-slate-600 font-semibold text-[11px]">Reconciliation Outcome</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">
                {ext.reconciliationResult}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default WalletFundingDetailPage;
