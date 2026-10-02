import React from 'react';
import { Wallet, CheckCircle2, Lock } from 'lucide-react';
import { formatZMW } from '../../data/mockCustomerWalletData';

interface CustomerWalletBalanceCardsProps {
  walletBalance: number;
  availableBalance: number;
  reservedFunds: number;
}

export const CustomerWalletBalanceCards: React.FC<CustomerWalletBalanceCardsProps> = ({
  walletBalance,
  availableBalance,
  reservedFunds,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {/* 1. Posted Ledger Balance */}
      <div
        id="kpi-card-posted-ledger-balance"
        className="bg-white border border-gray-200/90 rounded-xl px-4 py-2.5 sm:py-3 shadow-2xs flex items-center justify-between gap-3 min-h-[46px] sm:min-h-[48px] transition-shadow hover:shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100/90 text-slate-600 flex items-center justify-center shrink-0">
            <Wallet size={15} />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider truncate">
            Posted Ledger Balance
          </span>
        </div>
        <div className="text-[14px] sm:text-[15px] font-bold font-mono text-[#102025] tracking-tight shrink-0 whitespace-nowrap">
          {formatZMW(walletBalance)}
        </div>
      </div>

      {/* 2. Available Balance */}
      <div
        id="kpi-card-available-balance"
        className="bg-white border border-emerald-200/80 rounded-xl px-4 py-2.5 sm:py-3 shadow-2xs flex items-center justify-between gap-3 min-h-[46px] sm:min-h-[48px] bg-gradient-to-r from-white via-white to-emerald-50/20 transition-shadow hover:shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <CheckCircle2 size={15} />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider truncate">
            Available Balance
          </span>
        </div>
        <div className="text-[14px] sm:text-[15px] font-bold font-mono text-emerald-700 tracking-tight shrink-0 whitespace-nowrap">
          {formatZMW(availableBalance)}
        </div>
      </div>

      {/* 3. Reserved Funds */}
      <div
        id="kpi-card-reserved-funds"
        className="bg-white border border-amber-200/80 rounded-xl px-4 py-2.5 sm:py-3 shadow-2xs flex items-center justify-between gap-3 min-h-[46px] sm:min-h-[48px] bg-gradient-to-r from-white via-white to-amber-50/20 transition-shadow hover:shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
            <Lock size={15} />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-amber-800 uppercase tracking-wider truncate">
            Reserved Funds
          </span>
        </div>
        <div className="text-[14px] sm:text-[15px] font-bold font-mono text-amber-700 tracking-tight shrink-0 whitespace-nowrap">
          {formatZMW(reservedFunds)}
        </div>
      </div>
    </div>
  );
};
