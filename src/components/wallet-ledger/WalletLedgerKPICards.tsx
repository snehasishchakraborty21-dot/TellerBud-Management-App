import React from 'react';
import {
  BookOpen,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { LedgerSummaryKPIs } from '../../types/walletLedger';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface WalletLedgerKPICardsProps {
  kpis: LedgerSummaryKPIs;
}

export const WalletLedgerKPICards: React.FC<WalletLedgerKPICardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5">
      {/* 1. Total Ledger Entries */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between min-h-[76px] sm:min-h-[82px] h-full">
        <div className="flex items-center gap-2 mb-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <BookOpen size={14} />
          </div>
          <span className="text-xs font-semibold text-slate-600 leading-tight">
            Total Ledger Entries
          </span>
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-[#102025] tracking-tight leading-none">
          {kpis.totalLedgerEntries.toLocaleString()}
        </div>
      </div>

      {/* 2. Total Wallet Balances */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between min-h-[76px] sm:min-h-[82px] h-full">
        <div className="flex items-center gap-2 mb-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Wallet size={14} />
          </div>
          <span className="text-xs font-semibold text-slate-600 leading-tight">
            Total Wallet Balances
          </span>
        </div>
        <div className="text-base sm:text-lg font-bold font-mono text-[#102025] tracking-tight leading-none">
          {formatZMW(kpis.totalWalletBalances)}
        </div>
      </div>

      {/* 3. Credits Today */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between min-h-[76px] sm:min-h-[82px] h-full">
        <div className="flex items-center gap-2 mb-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ArrowDownLeft size={14} />
          </div>
          <span className="text-xs font-semibold text-slate-600 leading-tight">
            Credits Today
          </span>
        </div>
        <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 tracking-tight leading-none">
          {formatZMW(kpis.creditsToday)}
        </div>
      </div>

      {/* 4. Debits Today */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between min-h-[76px] sm:min-h-[82px] h-full">
        <div className="flex items-center gap-2 mb-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <ArrowUpRight size={14} />
          </div>
          <span className="text-xs font-semibold text-slate-600 leading-tight">
            Debits Today
          </span>
        </div>
        <div className="text-base sm:text-lg font-bold font-mono text-rose-700 tracking-tight leading-none">
          {formatZMW(kpis.debitsToday)}
        </div>
      </div>

      {/* 5. Reconciliation Exceptions */}
      <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between min-h-[76px] sm:min-h-[82px] h-full">
        <div className="flex items-center gap-2 mb-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={14} />
          </div>
          <span className="text-xs font-semibold text-slate-600 leading-tight">
            Reconciliation Exceptions
          </span>
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-amber-700 tracking-tight leading-none">
          {kpis.reconciliationExceptions}
        </div>
      </div>
    </div>
  );
};
