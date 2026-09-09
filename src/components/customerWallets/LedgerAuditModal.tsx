import React from 'react';
import { X, ShieldCheck, ArrowDownLeft, ArrowUpRight, FileText, CheckCircle2 } from 'lucide-react';
import { CustomerWalletLedgerEntry } from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';

interface LedgerAuditModalProps {
  entry: CustomerWalletLedgerEntry | null;
  onClose: () => void;
}

export const LedgerAuditModal: React.FC<LedgerAuditModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  const isCredit = entry.credit !== null && entry.credit > 0;
  const isDebit = entry.debit !== null && entry.debit > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#102025]">
                  Ledger Entry Audit Record
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} />
                  {entry.status}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Ref: <span className="font-semibold text-slate-800">{entry.reference}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Key transaction badge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-gray-200/70 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5 font-medium">
                Entry Type
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {entry.entryType}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block mb-0.5 font-medium">
                Amount Effect
              </span>
              {isCredit && (
                <span className="text-base font-black text-emerald-600 inline-flex items-center gap-0.5">
                  <ArrowDownLeft size={16} />
                  + {formatZMW(entry.credit)}
                </span>
              )}
              {isDebit && (
                <span className="text-base font-black text-rose-600 inline-flex items-center gap-0.5">
                  <ArrowUpRight size={16} />
                  - {formatZMW(entry.debit)}
                </span>
              )}
              {!isCredit && !isDebit && (
                <span className="text-sm font-semibold text-slate-500 font-mono">
                  Hold / Memo (ZMW 0.00)
                </span>
              )}
            </div>
          </div>

          {/* Detailed field pairs */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Date and Time</span>
              <span className="font-mono text-slate-800 font-semibold">{entry.dateTime}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Source Gateway / Core</span>
              <span className="text-slate-800 font-semibold">{entry.source}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Balance After Entry</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{formatZMW(entry.balanceAfter)}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Related Reference</span>
              <span className="font-mono text-slate-800 font-semibold">{entry.relatedReference}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-100 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <FileText size={13} />
              Description & Notes
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {entry.description}
            </p>
          </div>

          {/* Immutable Guarantee Notice */}
          <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-500 shrink-0" />
            <span>
              This entry is recorded in the append-only ledger and is immutable. It cannot be edited or deleted.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200/80 text-slate-700 hover:bg-slate-300/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
