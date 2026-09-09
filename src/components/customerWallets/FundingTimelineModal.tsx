import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { CustomerWalletAddFundsRecord } from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';
import { MtnLogo, AirtelLogo } from '../wallet/ProviderLogos';

interface FundingTimelineModalProps {
  record: CustomerWalletAddFundsRecord | null;
  onClose: () => void;
  onNavigateToLedger?: () => void;
}

export const FundingTimelineModal: React.FC<FundingTimelineModalProps> = ({
  record,
  onClose,
  onNavigateToLedger,
}) => {
  if (!record) return null;

  const isMtn = record.mno === 'MTN Mobile Money';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {isMtn ? <MtnLogo className="w-8 h-8" /> : <AirtelLogo className="w-8 h-8" />}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#102025]">
                  Funding Attempt Timeline
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    record.providerStatus === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : record.providerStatus === 'Pending' || record.providerStatus === 'Initiated'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {record.providerStatus}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Ref: <span className="font-semibold text-slate-700">{record.fundingReference}</span>
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

        {/* Summary Card */}
        <div className="p-5 bg-white border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Amount</span>
            <span className="font-bold text-slate-900 text-sm">{formatZMW(record.amount)}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Provider</span>
            <span className="font-semibold text-slate-800">{record.mno}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Provider Ref</span>
            <span className="font-mono font-medium text-slate-700 truncate block" title={record.providerReference}>
              {record.providerReference}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Customer Mobile</span>
            <span className="font-semibold text-slate-800 font-sans">{record.maskedMobileNumber}</span>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {record.timeline.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Step dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    step.status === 'completed'
                      ? 'bg-emerald-600 border-white text-white shadow-xs'
                      : step.status === 'failed'
                      ? 'bg-rose-600 border-white text-white shadow-xs'
                      : 'bg-amber-500 border-white text-white shadow-xs'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle2 size={12} />
                  ) : step.status === 'failed' ? (
                    <AlertCircle size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Wallet Credit Reference notice */}
          {record.walletCreditReference ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-900 block">
                    Posted Ledger Credit
                  </span>
                  <span className="font-mono text-emerald-700">
                    {record.walletCreditReference}
                  </span>
                </div>
              </div>

              {onNavigateToLedger && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToLedger();
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
                >
                  <span>View in Ledger</span>
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center gap-2">
              <AlertCircle size={15} className="text-slate-400 shrink-0" />
              <span>No ledger credit posted (payment not completed or cancelled).</span>
            </div>
          )}
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
