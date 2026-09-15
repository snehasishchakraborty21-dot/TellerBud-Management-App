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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Ledger Entries */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Total Ledger Entries
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <BookOpen size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-[#102025]">
            {kpis.totalLedgerEntries.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. Total Wallet Balances */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Total Wallet Balances
          </span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Wallet size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-[#102025]">
            {formatZMW(kpis.totalWalletBalances)}
          </div>
        </div>
      </div>

      {/* 3. Credits Today */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Credits Today
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ArrowDownLeft size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-emerald-700">
            {formatZMW(kpis.creditsToday)}
          </div>
        </div>
      </div>

      {/* 4. Debits Today */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Debits Today
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <ArrowUpRight size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-rose-700">
            {formatZMW(kpis.debitsToday)}
          </div>
        </div>
      </div>

      {/* 5. Reconciliation Exceptions */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Reconciliation Exceptions
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-amber-700">
            {kpis.reconciliationExceptions}
          </div>
        </div>
      </div>
    </div>
  );
};
