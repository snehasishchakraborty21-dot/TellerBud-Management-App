import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  ShieldCheck,
} from 'lucide-react';
import { MOCK_BUSINESS_WALLETS, formatZMW } from '../data/mockBusinessWalletData';

export const BusinessGlobalWalletDetailPage: React.FC = () => {
  const { walletId } = useParams<{ walletId: string }>();
  const navigate = useNavigate();

  const wallet = MOCK_BUSINESS_WALLETS.find(
    (w) => w.walletId === walletId || w.id === walletId
  );

  if (!wallet) {
    return (
      <div className="max-w-[1536px] mx-auto p-4 sm:p-6 pb-20">
        <div className="bg-white border border-gray-200/90 rounded-xl p-8 text-center shadow-xs">
          <Building2 size={32} className="mx-auto text-slate-400 mb-2" />
          <h2 className="text-base font-semibold text-slate-800">
            Business Wallet Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            The requested business wallet ({walletId}) could not be located in the authoritative registry.
          </p>
          <Link
            to="/business-global-wallets"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Business Global Wallets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1536px] mx-auto p-4 sm:p-5 space-y-4 pb-20">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/business-global-wallets"
          className="hover:text-[#0D93AA] transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft size={14} />
          Business Global Wallets
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{wallet.walletId}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0D93AA]/10 border border-[#0D93AA]/20 text-[#0D93AA] font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
            {wallet.businessInitials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[#102025]">
                {wallet.businessName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {wallet.state}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {wallet.health}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
              <span>Business ID: {wallet.businessId}</span>
              <span>•</span>
              <span>Wallet ID: {wallet.walletId}</span>
              <span>•</span>
              <span>Owner: {wallet.ownerName} ({wallet.ownerId})</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer self-start sm:self-center shrink-0"
        >
          <ArrowLeft size={14} />
          Back to List
        </button>
      </div>

      {/* Financial Position Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Posted Ledger Balance
          </div>
          <div className="text-xl font-bold font-mono text-[#102025]">
            {formatZMW(wallet.postedBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Authoritative ledger balance
          </div>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Available Balance
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {formatZMW(wallet.availableBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Excludes reserved funds
          </div>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Reserved Funds
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">
            {formatZMW(wallet.reservedFunds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Active reservations cannot be spent
          </div>
        </div>
      </div>
    </div>
  );
};
