import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Hash,
  Calendar,
  Layers,
  Lock,
} from 'lucide-react';
import {
  getWalletFundingByReference,
  formatZMW,
} from '../data/mockWalletFundingData';
import { FundingStatus } from '../types/walletFunding';
import { MtnLogo, AirtelLogo } from '../components/wallet/ProviderLogos';

export const WalletFundingDetailPage: React.FC = () => {
  const { fundingId } = useParams<{ fundingId: string }>();
  const navigate = useNavigate();

  const record = fundingId ? getWalletFundingByReference(fundingId) : undefined;

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
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

  if (!record) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/super-admin/wallets/add-funds')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Wallet Funding</span>
        </button>

        <div className="bg-white border border-gray-200/80 rounded-xl p-12 text-center shadow-xs">
          <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">
            Funding Attempt Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            The funding record reference &ldquo;{fundingId}&rdquo; could not be
            located. It may have been archived or an incorrect reference was
            provided.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/super-admin/wallets/add-funds')}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#0D93AA] bg-white border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Wallet Funding</span>
        </button>

        <div className="flex items-center gap-2">
          {renderStatusBadge(record.status)}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Funding Attempt
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">
                {record.initiatedAt}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {record.fundingReference}
            </h1>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-500 block">Funding Amount</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#102025]">
              {formatZMW(record.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Read-Only Notice */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-900">
        <Lock size={16} className="text-[#0D93AA] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-sky-950">
            Operational Read-Only Policy:
          </span>{' '}
          Wallet funding operates through automated, direct provider API webhooks.
          Manual &ldquo;Credit Wallet&rdquo; and status overrides are permanently disabled
          to maintain financial ledger integrity and prevent double-crediting.
        </div>
      </div>

      {/* 3-Column Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* 1. Customer & Account */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-slate-800 pb-2 border-b border-gray-100 font-semibold text-xs uppercase tracking-wider">
            <User size={14} className="text-[#0D93AA]" />
            <span>Customer Profile</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Customer Name</span>
              <span className="font-semibold text-slate-900">
                {record.customerName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Customer ID</span>
              <span className="font-mono text-[#0D93AA] font-semibold">
                {record.customerId}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Registered Mobile
              </span>
              <div className="flex items-center gap-1.5 font-mono text-slate-800 mt-0.5">
                <Smartphone size={13} className="text-slate-400" />
                <span>{record.maskedMobileNumber}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Linked Wallet</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-800 mt-0.5">
                <Wallet size={13} className="text-slate-400" />
                <span>{record.walletId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Provider Gateway & Settlement */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-slate-800 pb-2 border-b border-gray-100 font-semibold text-xs uppercase tracking-wider">
            <Building2 size={14} className="text-[#0D93AA]" />
            <span>Provider Gateway</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">
                Collection Provider
              </span>
              <div className="flex items-center gap-2 mt-1">
                {record.provider === 'MTN Mobile Money' ? (
                  <MtnLogo className="w-5 h-5 rounded-full shrink-0" />
                ) : (
                  <AirtelLogo className="w-5 h-5 rounded-full shrink-0" />
                )}
                <span className="font-semibold text-slate-900">
                  {record.provider}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Provider Transaction Ref
              </span>
              <span className="font-mono text-slate-800 font-semibold select-all">
                {record.providerReference}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Integration Protocol
              </span>
              <span className="text-slate-700 font-mono text-[11px]">
                Direct MNO REST / Webhook (TLS 1.3)
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Callback Security
              </span>
              <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                HMAC-SHA256 Verified
              </span>
            </div>
          </div>
        </div>

        {/* 3. Wallet Ledger & Reconciliation */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-slate-800 pb-2 border-b border-gray-100 font-semibold text-xs uppercase tracking-wider">
            <Layers size={14} className="text-[#0D93AA]" />
            <span>Ledger Settlement</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">
                Ledger Credit Ref
              </span>
              {record.walletCreditReference ? (
                <span className="font-mono font-bold text-emerald-700">
                  {record.walletCreditReference}
                </span>
              ) : (
                <span className="text-slate-400 font-mono">
                  {record.status === 'Pending' || record.status === 'Initiated'
                    ? 'Awaiting Provider Confirmation'
                    : 'No credit posted'}
                </span>
              )}
            </div>

            {record.reversalCreditReference && (
              <div>
                <span className="text-slate-500 block text-[11px]">
                  Compensating Reversal Ref
                </span>
                <span className="font-mono font-bold text-purple-700 flex items-center gap-1">
                  <RotateCcw size={12} className="shrink-0" />
                  {record.reversalCreditReference}
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-500 block text-[11px]">
                Reconciliation Status
              </span>
              <span className="font-semibold text-slate-800">
                {record.status === 'Completed'
                  ? 'Reconciled'
                  : record.status === 'Reversed'
                  ? 'Compensated'
                  : 'Pending'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Last Event Timestamp
              </span>
              <span className="font-mono text-slate-700 text-[11px]">
                {record.lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Callback & Settlement Lifecycle Timeline */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#0D93AA]" />
            <h2 className="text-sm font-bold text-slate-900">
              Provider Callback & Settlement Lifecycle
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Strictly Idempotent
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
          {record.timeline.map((step, idx) => {
            const isDone = step.status === 'completed';
            const isFailed = step.status === 'failed';
            const isCurrent = step.status === 'in_progress';

            return (
              <div key={idx} className="relative group">
                {/* Bullet */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                    isDone
                      ? 'border-emerald-600 text-emerald-600'
                      : isFailed
                      ? 'border-rose-600 text-rose-600'
                      : isCurrent
                      ? 'border-[#0D93AA] text-[#0D93AA] animate-pulse'
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={11} />
                  ) : isFailed ? (
                    <XCircle size={11} />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  )}
                </div>

                <div className="text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span
                      className={`font-semibold ${
                        isFailed ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed text-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default WalletFundingDetailPage;
