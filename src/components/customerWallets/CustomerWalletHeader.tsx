import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { CustomerWalletRecord, WalletHealthStatus } from '../../types/customerWallet';

interface CustomerWalletHeaderProps {
  wallet: CustomerWalletRecord;
  onBack: () => void;
}

export const CustomerWalletHeader: React.FC<CustomerWalletHeaderProps> = ({
  wallet,
  onBack,
}) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderHealthBadge = (health: WalletHealthStatus, reason?: string) => {
    switch (health) {
      case 'Healthy':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap"
            title="Balances reconcile and there is no active reservation."
          >
            <CheckCircle2 size={13} className="text-emerald-600" />
            Healthy
          </span>
        );
      case 'Funds Reserved':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap"
            title="Balances reconcile with active reserved funds."
          >
            <Lock size={13} className="text-amber-600" />
            Funds Reserved
          </span>
        );
      case 'Review Required':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap cursor-help"
            title={reason || 'Verified ledger, reservation or provider inconsistency exists.'}
          >
            <AlertTriangle size={13} className="text-rose-600" />
            Review Required
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0D93AA] transition-colors group px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100/70"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Customer Wallets</span>
        </button>
      </div>

      {/* Main card header */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Customer Avatar and Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D93AA]/15 to-[#0D93AA]/5 text-[#0D93AA] font-bold text-lg flex items-center justify-center shrink-0 border border-[#0D93AA]/20 shadow-xs">
              {wallet.customerInitials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-[#102025] tracking-tight">
                  {wallet.customerName}
                </h1>

                {/* Account status badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    wallet.walletState === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : wallet.walletState === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {wallet.walletState}
                </span>

                {/* Health Badge */}
                {renderHealthBadge(wallet.walletHealth, wallet.reviewReason)}
              </div>

              {/* Identity metadata strip */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 font-mono">
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans">Wallet:</span>
                  <span className="font-semibold text-slate-800">{wallet.walletId}</span>
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => handleCopy(wallet.walletId, 'walletId')}
                      aria-label={`Copy Wallet ID ${wallet.walletId}`}
                      title="Copy Wallet ID"
                      className="text-slate-400 hover:text-[#0D93AA] hover:bg-slate-100 p-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA]"
                    >
                      {copiedId === 'walletId' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                    {copiedId === 'walletId' && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-slate-900 rounded shadow-sm whitespace-nowrap animate-in fade-in duration-150 pointer-events-none z-10"
                      >
                        Copied
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-slate-300">•</span>

                <div className="inline-flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans">Customer ID:</span>
                  <span className="font-semibold text-slate-800">{wallet.customerId}</span>
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => handleCopy(wallet.customerId, 'customerId')}
                      aria-label={`Copy Customer ID ${wallet.customerId}`}
                      title="Copy Customer ID"
                      className="text-slate-400 hover:text-[#0D93AA] hover:bg-slate-100 p-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA]"
                    >
                      {copiedId === 'customerId' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                    {copiedId === 'customerId' && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-slate-900 rounded shadow-sm whitespace-nowrap animate-in fade-in duration-150 pointer-events-none z-10"
                      >
                        Copied
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-slate-300">•</span>

                <div className="inline-flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans">Mobile:</span>
                  <span className="font-semibold text-slate-700 font-sans">{wallet.customerPhoneMasked}</span>
                </div>

                {wallet.city && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-sans">{wallet.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action: Internal Link to Customer Profile (NO external link icon) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/super-admin/people/customers/${wallet.customerId}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 transition-colors shadow-2xs"
            >
              <User size={14} className="text-slate-500" />
              <span>View Customer Profile</span>
            </button>
          </div>
        </div>

        {/* Attention Required Banner (if reviewReason present) */}
        {wallet.reviewReason && (
          <div className="mt-5 p-3.5 rounded-lg bg-rose-50/80 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <div className="space-y-0.5">
              <span className="font-bold text-rose-900 block">Attention Required (Review Required):</span>
              <p className="text-rose-700 leading-relaxed">{wallet.reviewReason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
