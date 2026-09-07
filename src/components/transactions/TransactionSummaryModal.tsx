import React from 'react';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import { BusinessTransactionRecord } from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { VendorLogo } from '../walk-in/VendorLogo';
import { formatZMW } from '../../utils/formatters';

interface TransactionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BusinessTransactionRecord | null;
  onOpenFullDetails: (reference: string) => void;
}

export const TransactionSummaryModal: React.FC<TransactionSummaryModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onOpenFullDetails,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div
      id="transaction-summary-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="transaction-summary-modal"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-900">Transaction Summary</h2>
          <button
            id="btn-close-summary-modal-x"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 flex-1">
          {/* Top Key Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Transaction Reference
              </span>
              <span className="text-base font-bold font-mono text-slate-900 tracking-tight">
                {transaction.reference}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-right">
                Amount
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 tracking-tight">
                {formatZMW(transaction.amount)}
              </span>
            </div>
          </div>

          {/* Core Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Category
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {transaction.category}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Transaction Type
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {transaction.transactionType}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </span>
              <StatusChip status={transaction.status} size="sm" />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Transaction Timestamp
              </span>
              <span className="text-sm font-medium text-slate-700">
                {transaction.dateTime}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Agent Involved
              </span>
              <span className="text-sm font-medium text-slate-900">
                {transaction.agentName || '—'}
              </span>
              {transaction.agentPhone && (
                <span className="text-xs text-slate-500 block">{transaction.agentPhone}</span>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Customer / Counterparty
              </span>
              <span className="text-sm font-medium text-slate-900">
                {transaction.customerOrCounterparty}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Vendor
              </span>
              {transaction.vendor ? (
                <VendorLogo vendor={transaction.vendor} size="detail" showName={true} />
              ) : (
                <span className="text-sm text-slate-500">—</span>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Business
              </span>
              <span className="text-sm font-medium text-slate-900">
                {transaction.businessName}
              </span>
              <span className="text-xs text-slate-500 block">ID: {transaction.businessId}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Channel / Method
              </span>
              <span className="text-sm font-medium text-slate-900 block">
                External USSD Dialler
              </span>
              <span className="text-xs text-slate-500">Method: External USSD</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Global Wallet Impact
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {transaction.globalWalletImpact?.feeType || 'Transaction Fee'}: {formatZMW(transaction.globalWalletImpact?.feeAmount || 15.0)}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0D93AA]/10 text-[#0D93AA]">
                  {transaction.globalWalletImpact?.ledgerReference || 'BWL-001'}
                </span>
              </div>
              <span className="text-xs text-slate-500 block">Principal amount processed externally via USSD</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Related Reference
              </span>
              <span className="text-sm font-mono text-slate-800">
                {transaction.relatedReference || '—'}
              </span>
            </div>
          </div>

          {/* Lifecycle Timeline */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
              Lifecycle Timeline
            </span>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {transaction.lifecycleTimeline.map((step) => (
                <div key={step.id} className="relative group">
                  <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-[#0D93AA] ring-4 ring-white" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {step.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {step.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-slate-500">
                      {step.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            id="btn-close-transaction-summary"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            id="btn-open-full-transaction-details"
            onClick={() => onOpenFullDetails(transaction.reference)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors shadow-xs"
          >
            <span>Open Full Details</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
