import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Hourglass,
  ExternalLink,
  Building2,
  User,
  History,
  CheckCircle,
} from 'lucide-react';
import {
  MOCK_RECONCILIATION_RECORDS,
  resolveReconciliationDetails,
  ReconciliationAuditEvent,
} from '../data/mockReconciliationData';
import { MtnLogo, AirtelLogo } from '../components/wallet/ProviderLogos';
import { formatZMW } from '../data/mockBusinessWalletData';
import { ProviderResponseStatus, LedgerResultStatus, ReconciliationStatus } from '../types/reconciliation';

export const ApiLedgerReconciliationDetailPage: React.FC = () => {
  const { reconciliationId } = useParams<{ reconciliationId: string }>();
  const navigate = useNavigate();

  // Find authoritative mock record
  const rawRecord = MOCK_RECONCILIATION_RECORDS.find(
    (r) => r.id === reconciliationId || r.reconciliationRef === reconciliationId
  );

  // Resolved details with robust fallbacks
  const resolved = rawRecord ? resolveReconciliationDetails(rawRecord) : null;

  // Copy reference state
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Interactive audit state for retries and refreshes
  const [auditList, setAuditList] = useState<ReconciliationAuditEvent[]>(() => {
    return resolved?.auditHistory || [];
  });

  // Action loading states
  const [isRefreshingProvider, setIsRefreshingProvider] = useState<boolean>(false);
  const [isRetryingVerification, setIsRetryingVerification] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  // Verification retry readiness logic:
  // Must NOT be pending callback, and must have had verification failure or exception
  const isCallbackPending =
    resolved?.callbackStatus === 'Awaiting Provider Callback' ||
    resolved?.callbackStatus === 'Pending' ||
    resolved?.callbackStatus === '—' ||
    resolved?.providerResponse === 'Processing' ||
    resolved?.providerResponse === 'Awaiting Callback';

  const hasVerificationFailedOrException =
    resolved?.reconciliation === 'Exception' ||
    (resolved?.signatureVerification
      ? resolved.signatureVerification.toLowerCase().includes('failed') ||
        resolved.signatureVerification.toLowerCase().includes('mismatch') ||
        resolved.signatureVerification.toLowerCase().includes('invalid')
      : false);

  const isRetryVerificationEnabled = Boolean(!isCallbackPending && hasVerificationFailedOrException);

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/api-ledger-reconciliation');
    }
  };

  const handleRefreshProvider = () => {
    if (isRefreshingProvider || !resolved) return;
    setIsRefreshingProvider(true);
    setActionNotice(null);

    setTimeout(() => {
      setIsRefreshingProvider(false);
      // Strictly maintain 11 Sep 2026 page date timeline
      const timeString = '11 Sep 2026, 11:42 AM';

      const newAudit: ReconciliationAuditEvent = {
        id: `AUD-REF-${Date.now().toString().slice(-4)}`,
        timestamp: timeString,
        actor: 'Super Admin (Console)',
        action: 'Provider Status Refreshed',
        result: 'Provider Still Processing',
        details: `Direct API query to ${resolved.provider} gateway returned status: ${resolved.providerResponse}.`,
      };

      setAuditList((prev) => [newAudit, ...prev]);
      setActionNotice({
        type: 'success',
        message: `Provider status refreshed: ${resolved.providerResponse} (HTTP 200 from ${resolved.provider})`,
      });

      setTimeout(() => setActionNotice(null), 5000);
    }, 600);
  };

  const handleRetryVerification = () => {
    if (!isRetryVerificationEnabled || isRetryingVerification || !resolved) return;
    setIsRetryingVerification(true);
    setActionNotice(null);

    setTimeout(() => {
      setIsRetryingVerification(false);
      const timeString = '11 Sep 2026, 11:45 AM';

      const newAudit: ReconciliationAuditEvent = {
        id: `AUD-VER-${Date.now().toString().slice(-4)}`,
        timestamp: timeString,
        actor: 'Super Admin (Console)',
        action: 'Retry Verification',
        result: 'Signature Verified (HMAC-SHA256)',
        details: `Re-evaluated cryptographic payload and signature verification parameters against ${resolved.provider} endpoint.`,
      };

      setAuditList((prev) => [newAudit, ...prev]);
      setActionNotice({
        type: 'info',
        message: `Verification retry executed: Cryptographic parameters evaluated and audited.`,
      });

      setTimeout(() => setActionNotice(null), 5000);
    }, 600);
  };

  if (!resolved) {
    return (
      <div className="w-full min-h-screen bg-[#FAFAFA] p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-4 max-w-xl mx-auto mt-12 shadow-xs">
          <AlertTriangle size={36} className="mx-auto text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800">
            Reconciliation Details
          </h2>
          <p className="text-sm text-slate-500">
            The record with reference "{reconciliationId}" was not found in the authoritative ledger register.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0B7D91] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to API & Ledger Reconciliation
          </button>
        </div>
      </div>
    );
  }

  // Provider response badge helper
  const getProviderResponseBadge = (status: ProviderResponseStatus) => {
    switch (status) {
      case 'Successful':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="shrink-0" />
            Successful
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} className="shrink-0" />
            Processing
          </span>
        );
      case 'Awaiting Callback':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Hourglass size={12} className="shrink-0" />
            Awaiting Callback
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="shrink-0" />
            Failed
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock size={12} className="shrink-0" />
            Expired
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw size={12} className="shrink-0" />
            Reversed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock size={12} className="shrink-0" />
            {status}
          </span>
        );
    }
  };

  // Ledger result badge helper
  const getLedgerResultBadge = (status: LedgerResultStatus) => {
    switch (status) {
      case 'Not Posted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="shrink-0" />
            Not Posted
          </span>
        );
      case 'Credited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="shrink-0" />
            Credited
          </span>
        );
      case 'Debited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 size={12} className="shrink-0" />
            Debited
          </span>
        );
      case 'Hold Created':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Hourglass size={12} className="shrink-0" />
            Hold Created
          </span>
        );
      case 'Hold Released':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <CheckCircle2 size={12} className="shrink-0" />
            Hold Released
          </span>
        );
      case 'Reversal Posted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw size={12} className="shrink-0" />
            Reversal Posted
          </span>
        );
    }
  };

  // Reconciliation status badge helper
  const getReconciliationStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="shrink-0" />
            Matched
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="shrink-0" />
            Pending
          </span>
        );
      case 'Exception':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={12} className="shrink-0" />
            Exception
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw size={12} className="shrink-0" />
            Reversed
          </span>
        );
    }
  };

  const isCustomerWallet = resolved.walletType === 'Customer Wallet';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-28">
      {/* BACK NAVIGATION (Directly above the header card, no duplicate page title) */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b7d91] transition-colors group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform shrink-0" />
          <span>Back to API & Ledger Reconciliation</span>
        </button>
      </div>

      {/* ACTION BANNER / NOTIFICATION */}
      {actionNotice && (
        <div
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-medium ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <CheckCircle size={16} className="shrink-0 text-[#0D93AA]" />
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* DETAIL HEADER CARD */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Block: Reference, Provider, Response, Copy */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Reconciliation Reference:
              </span>
              <span className="font-mono font-bold text-slate-900 text-base sm:text-lg">
                {resolved.reconciliationRef}
              </span>
              <button
                type="button"
                onClick={() => handleCopyReference(resolved.reconciliationRef)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                title="Copy Reconciliation Reference"
              >
                {copiedRef ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                {resolved.provider === 'MTN Mobile Money' ? (
                  <MtnLogo className="w-6 h-6 rounded shrink-0 shadow-2xs" />
                ) : (
                  <AirtelLogo className="w-6 h-6 rounded shrink-0 shadow-2xs" />
                )}
                <span className="text-sm font-semibold text-slate-800">
                  {resolved.provider}
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Provider Response:</span>
                {getProviderResponseBadge(resolved.providerResponse)}
              </div>
            </div>
          </div>

          {/* Right Block: Actions & Financial Highlights */}
          <div className="flex flex-col lg:items-end gap-3.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
            {/* Right Meta Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 lg:justify-end">
              <div>
                <span className="text-slate-400 mr-1.5">Transaction Type:</span>
                <span className="font-semibold text-slate-800">{resolved.transactionType}</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div>
                <span className="text-slate-400 mr-1.5">Amount:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatZMW(resolved.amount)}
                </span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div>
                <span className="text-slate-400 mr-1.5">Created:</span>
                <span className="text-slate-700 font-medium">{resolved.createdAt}</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div>
                <span className="text-slate-400 mr-1.5">Last Updated:</span>
                <span className="text-slate-700 font-medium">{resolved.updatedAt || resolved.createdAt}</span>
              </div>
            </div>

            {/* Actions: Refresh Provider Status & Retry Verification */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRefreshProvider}
                disabled={isRefreshingProvider}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <RefreshCw size={13} className={isRefreshingProvider ? 'animate-spin text-[#0D93AA]' : 'text-slate-500'} />
                <span>{isRefreshingProvider ? 'Refreshing...' : 'Refresh Provider Status'}</span>
              </button>

              <div
                className="relative inline-block"
                title={!isRetryVerificationEnabled ? 'Verification can be retried after a provider callback is received.' : undefined}
              >
                <button
                  type="button"
                  onClick={handleRetryVerification}
                  disabled={!isRetryVerificationEnabled || isRetryingVerification}
                  title={!isRetryVerificationEnabled ? 'Verification can be retried after a provider callback is received.' : undefined}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors shadow-2xs ${
                    !isRetryVerificationEnabled
                      ? 'text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-75'
                      : 'text-white bg-[#0D93AA] hover:bg-[#0B7D91] cursor-pointer'
                  }`}
                >
                  <ShieldCheck size={13} className={isRetryingVerification ? 'animate-pulse' : ''} />
                  <span>{isRetryingVerification ? 'Retrying...' : 'Retry Verification'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 1 — TWO EQUAL COLUMNS: TRANSACTION INFORMATION & WALLET HOLDER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* LEFT: TRANSACTION INFORMATION */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transaction Information
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Reconciliation Reference</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {resolved.reconciliationRef}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Internal Transaction Reference</span>
              <span className="font-mono font-semibold text-slate-800">
                {resolved.transactionRef}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Transaction Type</span>
              <span className="font-medium text-slate-800">
                {resolved.transactionType}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Amount</span>
              <span className="font-mono font-bold text-[#102025] text-sm sm:text-base">
                {formatZMW(resolved.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Created Date and Time</span>
              <span className="font-medium text-slate-800">
                {resolved.createdAt}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Last Updated Date and Time</span>
              <span className="font-medium text-slate-800">
                {resolved.updatedAt || resolved.createdAt}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: WALLET HOLDER */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Wallet Holder
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                {isCustomerWallet ? <User size={11} /> : <Building2 size={11} />}
                {resolved.walletType}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {isCustomerWallet ? (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Customer Name</span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {resolved.holderName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Customer ID</span>
                    <span className="font-mono font-medium text-slate-700">
                      {resolved.customerId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Complete Mobile Number</span>
                    {/* Keep every digit visible - strictly unmasked */}
                    <span className="font-mono font-semibold text-slate-900 tracking-wide text-xs sm:text-sm">
                      {resolved.customerPhone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Customer Wallet ID</span>
                    <span className="font-mono font-semibold text-[#0D93AA]">
                      {resolved.walletId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Wallet Type</span>
                    <span className="font-medium text-slate-800">
                      Customer Wallet
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Business Name</span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {resolved.holderName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Business ID</span>
                    <span className="font-mono font-medium text-slate-700">
                      {resolved.businessId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Business Owner</span>
                    <span className="font-medium text-slate-800">
                      {resolved.businessOwner}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Complete Mobile Number</span>
                    {/* Keep every digit visible */}
                    <span className="font-mono font-semibold text-slate-900 tracking-wide text-xs sm:text-sm">
                      {resolved.ownerPhone || resolved.customerPhone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-slate-500">Business Global Wallet ID</span>
                    <span className="font-mono font-semibold text-[#0D93AA]">
                      {resolved.walletId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Wallet Type</span>
                    <span className="font-medium text-slate-800">
                      Business Global Wallet
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            {isCustomerWallet ? (
              <button
                type="button"
                onClick={() => navigate(`/super-admin/wallets/customers/${resolved.walletId}`)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>View Customer Wallet</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/super-admin/business-global-wallets/${resolved.walletId}`)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>View Business Global Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2 — TWO EQUAL COLUMNS: PROVIDER AND API RESPONSE & LEDGER RESULT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* LEFT: PROVIDER AND API RESPONSE */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Provider and API Response
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Provider Name</span>
              <div className="flex items-center gap-2">
                {resolved.provider === 'MTN Mobile Money' ? (
                  <MtnLogo className="w-5 h-5 rounded shrink-0 shadow-2xs" />
                ) : (
                  <AirtelLogo className="w-5 h-5 rounded shrink-0 shadow-2xs" />
                )}
                <span className="font-semibold text-slate-900">{resolved.provider}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">API Operation</span>
              <span className="font-semibold text-slate-800">
                {resolved.apiOperation}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Provider Transaction ID</span>
              <span className="font-mono font-medium text-slate-800">
                {resolved.providerTransactionId || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Provider Response</span>
              {getProviderResponseBadge(resolved.providerResponse)}
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Callback Status</span>
              <span className="font-medium text-slate-800">
                {resolved.callbackStatus}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Callback Received Time</span>
              <span className="font-medium text-slate-700">
                {resolved.callbackReceivedAt || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Verification Attempts</span>
              <span className="font-mono font-semibold text-slate-800">
                {resolved.verificationAttempts}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Last Provider Response Time</span>
              <span className="font-medium text-slate-800">
                {resolved.lastProviderResponseTime || resolved.updatedAt || resolved.createdAt}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: LEDGER RESULT */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ledger Result
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Ledger Result</span>
              {getLedgerResultBadge(resolved.ledgerResult)}
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Posting Status</span>
              <span className="font-semibold text-slate-800">
                {resolved.postingStatus}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Posted Amount</span>
              <span className="font-mono font-bold text-slate-900">
                {formatZMW(resolved.postedAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Ledger Entry Reference</span>
              <span className="font-mono font-medium text-slate-700">
                {resolved.ledgerEntryRef || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Balance Before</span>
              <span className="font-mono font-semibold text-slate-800">
                {formatZMW(resolved.balanceBefore)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Balance After</span>
              <span className="font-mono font-semibold text-slate-800">
                {formatZMW(resolved.balanceAfter)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Balance Change</span>
              <span className="font-mono font-bold text-slate-800">
                {formatZMW(resolved.balanceChange)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Reservation Reference</span>
              <span className="font-mono font-medium text-slate-600">
                {resolved.reservationRef || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Reversal Reference</span>
              <span className="font-mono font-medium text-slate-600">
                {resolved.reversalRef || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3 — TWO COLUMNS: RECONCILIATION (~45%) & PROCESSING TIMELINE (~55%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT, APPROXIMATELY 45%: RECONCILIATION (5 OF 12 COLS) - NATURAL HEIGHT, NO TOP BLANK AREA */}
        <div className="lg:col-span-5 bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reconciliation
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Reconciliation Status</span>
              {getReconciliationStatusBadge(resolved.reconciliation)}
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Expected Amount</span>
              <span className="font-mono font-bold text-slate-900">
                {formatZMW(resolved.expectedAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Provider Confirmed Amount</span>
              <span className="font-medium text-slate-800">
                {resolved.providerConfirmedAmount}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Ledger Posted Amount</span>
              <span className="font-mono font-bold text-slate-900">
                {formatZMW(resolved.ledgerPostedAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Amount Variance</span>
              <span
                className={`font-semibold ${
                  resolved.amountVariance === 'Pending'
                    ? 'text-amber-700'
                    : resolved.amountVariance.includes('Match')
                    ? 'text-emerald-700 font-mono'
                    : 'text-rose-700'
                }`}
              >
                {resolved.amountVariance}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Signature Verification</span>
              <span className="font-medium text-slate-800">
                {resolved.signatureVerification}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Duplicate Callback Status</span>
              <span className="font-medium text-slate-800">
                {resolved.duplicateCallbackStatus}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-slate-500">Reconciliation Date and Time</span>
              <span className="font-medium text-slate-800">
                {resolved.reconciliationDate || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Exception Reason</span>
              <span className="font-medium text-slate-600">
                {resolved.exceptionReason || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT, APPROXIMATELY 55%: PROCESSING TIMELINE (7 OF 12 COLS) */}
        <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Processing Timeline
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {resolved.resolvedTimeline.map((stepItem, idx) => {
              const isLast = idx === resolved.resolvedTimeline.length - 1;

              // Step styling: green for completed, amber for current stage, grey for pending, red for failed
              let statusLabel = 'Pending';
              let badgeClasses = 'bg-slate-100 text-slate-600 border-slate-200';
              let dotClasses = 'bg-slate-300 text-slate-600';
              let lineClasses = 'bg-slate-200';

              if (stepItem.status === 'completed') {
                statusLabel = 'Completed';
                badgeClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                dotClasses = 'bg-emerald-500 text-white';
                lineClasses = 'bg-emerald-300';
              } else if (stepItem.status === 'current') {
                statusLabel = 'Current';
                badgeClasses = 'bg-amber-50 text-amber-700 border-amber-200';
                dotClasses = 'bg-amber-500 text-white ring-4 ring-amber-100';
                lineClasses = 'bg-slate-200';
              } else if (stepItem.status === 'failed') {
                statusLabel = 'Exception';
                badgeClasses = 'bg-rose-50 text-rose-700 border-rose-200';
                dotClasses = 'bg-rose-500 text-white';
                lineClasses = 'bg-slate-200';
              }

              return (
                <div key={stepItem.step} className="relative flex items-start gap-3.5">
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px ${lineClasses}`}
                      aria-hidden="true"
                    />
                  )}

                  {/* Circle number */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-colors ${dotClasses}`}
                  >
                    {stepItem.status === 'completed' ? (
                      <Check size={14} className="stroke-[2.5]" />
                    ) : (
                      stepItem.step
                    )}
                  </div>

                  {/* Step Title & Status */}
                  <div className="flex-1 min-w-0 pb-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                        {stepItem.step}. {stepItem.title}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClasses}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {stepItem.detail && (
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                        {stepItem.detail}
                      </p>
                    )}

                    {stepItem.timestamp && (
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {stepItem.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ROW 4 — FULL WIDTH: AUDIT HISTORY */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#0D93AA]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Audit History
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50/70 text-slate-500 font-semibold">
                <th className="py-2.5 px-3 whitespace-nowrap">Event</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Acting User or System</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date and Time</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditList.map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {audit.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {audit.actor}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {audit.timestamp}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {audit.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
