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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Total Ledger Entries */}
      <div className="bg-white border border-gray-200/90 rounded-xl px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <BookOpen size={15} />
          </div>
          <span className="text-xs font-medium text-slate-500 truncate" title="Total Ledger Entries">
            Total Ledger Entries
          </span>
        </div>
        <div className="text-base font-bold font-mono text-[#102025] shrink-0">
          {kpis.totalLedgerEntries.toLocaleString()}
        </div>
      </div>

      {/* 2. Total Wallet Balances */}
      <div className="bg-white border border-gray-200/90 rounded-xl px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Wallet size={15} />
          </div>
          <span className="text-xs font-medium text-slate-500 truncate" title="Total Wallet Balances">
            Total Wallet Balances
          </span>
        </div>
        <div className="text-base font-bold font-mono text-[#102025] shrink-0">
          {formatZMW(kpis.totalWalletBalances)}
        </div>
      </div>

      {/* 3. Credits Today */}
      <div className="bg-white border border-gray-200/90 rounded-xl px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ArrowDownLeft size={15} />
          </div>
          <span className="text-xs font-medium text-slate-500 truncate" title="Credits Today">
            Credits Today
          </span>
        </div>
        <div className="text-base font-bold font-mono text-emerald-700 shrink-0">
          {formatZMW(kpis.creditsToday)}
        </div>
      </div>

      {/* 4. Debits Today */}
      <div className="bg-white border border-gray-200/90 rounded-xl px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <ArrowUpRight size={15} />
          </div>
          <span className="text-xs font-medium text-slate-500 truncate" title="Debits Today">
            Debits Today
          </span>
        </div>
        <div className="text-base font-bold font-mono text-rose-700 shrink-0">
          {formatZMW(kpis.debitsToday)}
        </div>
      </div>

      {/* 5. Reconciliation Exceptions */}
      <div className="bg-white border border-gray-200/90 rounded-xl px-3.5 py-2.5 shadow-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={15} />
          </div>
          <span className="text-xs font-medium text-slate-500 truncate" title="Reconciliation Exceptions">
            Reconciliation Exceptions
          </span>
        </div>
        <div className="text-base font-bold font-mono text-amber-700 shrink-0">
          {kpis.reconciliationExceptions}
        </div>
      </div>
    </div>
  );
};
