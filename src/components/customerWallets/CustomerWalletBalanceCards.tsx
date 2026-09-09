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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Posted Ledger Balance */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Posted Ledger Balance
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-slate-600 flex items-center justify-center shrink-0">
            <Wallet size={16} />
          </div>
        </div>
        <div className="text-2xl font-black text-[#102025] tracking-tight">
          {formatZMW(walletBalance)}
        </div>
      </div>

      {/* 2. Available Balance */}
      <div className="bg-white border border-emerald-200/70 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/20">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Available Balance
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-700 tracking-tight">
          {formatZMW(availableBalance)}
        </div>
      </div>

      {/* 3. Reserved Funds */}
      <div className="bg-white border border-amber-200/70 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm bg-gradient-to-br from-white via-white to-amber-50/20">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Reserved Funds
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
            <Lock size={16} />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-700 tracking-tight">
          {formatZMW(reservedFunds)}
        </div>
      </div>
    </div>
  );
};
