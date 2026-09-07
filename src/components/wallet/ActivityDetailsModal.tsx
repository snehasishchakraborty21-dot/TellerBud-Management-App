import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Clock, ShieldCheck, ArrowRight, Zap, Building2, User } from 'lucide-react';
import { GlobalWalletActivity } from '../../types/admin';
import { MtnLogo, AirtelLogo } from './ProviderLogos';
import { adminService } from '../../services/adminService';

interface ActivityDetailsModalProps {
  activity: GlobalWalletActivity | null;
  isOpen: boolean;
  onClose: () => void;
  triggerButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onActivityUpdated?: (updated: GlobalWalletActivity) => void;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  activity,
  isOpen,
  onClose,
  triggerButtonRef,
  onActivityUpdated,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const formatZMW = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return `ZMW ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    if (!isOpen) {
      if (triggerButtonRef?.current) {
        triggerButtonRef.current.focus();
      }
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, triggerButtonRef]);

  if (!isOpen || !activity) return null;

  const isCredit = activity.credit !== null && activity.credit > 0;
  const isDebit = activity.debit !== null && activity.debit > 0;
  const isPending = activity.status === 'Pending' || activity.status === 'Processing';

  const handleSimulateWebhook = async () => {
    setIsProcessing(true);
    try {
      const res = await adminService.verifyFundingWebhook(activity.reference);
      if (res.success && res.activity && onActivityUpdated) {
        onActivityUpdated(res.activity);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayout = async () => {
    setIsProcessing(true);
    try {
      const res = await adminService.markWithdrawalAsPaid(activity.reference);
      if (res.success && res.activity && onActivityUpdated) {
        onActivityUpdated(res.activity);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="activity-details-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-details-modal-title"
    >
      <div
        ref={modalRef}
        id="activity-details-modal-content"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activity Record</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  activity.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {activity.status}
              </span>
            </div>
            <h2 id="activity-details-modal-title" className="text-lg font-bold text-slate-900 font-mono mt-1">
              {activity.reference}
            </h2>
          </div>
          <button
            id="close-activity-details-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Close activity details modal"
            className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-600">
          {/* Amount Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase">Impact Direction</span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isCredit
                      ? 'bg-emerald-100 text-emerald-800'
                      : isDebit
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCredit ? 'CREDIT' : isDebit ? 'DEBIT' : 'NO BALANCE CHANGE'}
                </span>
                <span className="text-xs font-medium text-slate-600">{activity.transactionType}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Amount</span>
              <div
                className={`text-2xl font-bold font-mono mt-0.5 ${
                  isCredit ? 'text-emerald-700' : isDebit ? 'text-rose-700' : 'text-slate-800'
                }`}
              >
                {isCredit && '+'}
                {isDebit && '-'}
                {formatZMW(activity.credit || activity.debit || 0)}
              </div>
            </div>
          </div>

          {/* Balance Position Transition */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-xl border border-slate-200 bg-white">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Balance Before</span>
              <div className="text-sm font-mono font-bold text-slate-800 mt-1">
                {formatZMW(activity.balanceBefore)}
              </div>
            </div>
            <div className="border-l border-slate-100 pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Balance After</span>
              <div className="text-sm font-mono font-bold text-slate-800 mt-1">
                {formatZMW(activity.balanceAfter)}
              </div>
            </div>
          </div>

          {/* Attributes Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Transaction Attributes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 border border-slate-200 rounded-xl p-4">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Transaction Type</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5">{activity.transactionType}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Date & Time</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5">{activity.dateTime}</span>
              </div>

              {/* Attribution / Initiator */}
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Initiated By / Attribution</span>
                {activity.transactionType === 'Funding' || activity.transactionType === 'Withdrawal' ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-sky-700" />
                    <span className="text-xs font-semibold text-slate-900">
                      Chileshe Mwamba <span className="text-[11px] font-normal text-slate-500">(Business Owner)</span>
                    </span>
                  </div>
                ) : activity.agent ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-900">{activity.agent.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                      {activity.agent.id}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 mt-0.5 block">Central Core System</span>
                )}
              </div>

              {activity.externalProvider && (
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Mobile Money Provider</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {activity.externalProvider === 'MTN Mobile Money' ? (
                      <MtnLogo className="w-5 h-5" />
                    ) : (
                      <AirtelLogo className="w-5 h-5" />
                    )}
                    <span className="text-xs font-semibold text-slate-900">{activity.externalProvider}</span>
                  </div>
                </div>
              )}

              {activity.mobileMoneyNumber && (
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Mobile Money Account</span>
                  <span className="text-xs font-mono font-semibold text-slate-900 block mt-0.5">
                    {activity.mobileMoneyNumber}
                  </span>
                </div>
              )}

              {activity.providerReference && (
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Provider Reference</span>
                  <span className="text-xs font-mono text-slate-700 block mt-0.5">{activity.providerReference}</span>
                </div>
              )}

              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-400 block font-medium">Description</span>
                <span className="text-xs text-slate-800 block mt-0.5">{activity.description}</span>
              </div>
            </div>
          </div>

          {/* Operational Principle Callout */}
          <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-sky-900 leading-relaxed">
              <strong>TellerBud Core Principle:</strong> Customer and Agent operational transaction principal amounts are processed externally through USSD and never debit or credit the TellerBud Global Wallet. The wallet exclusively handles working capital funding, legitimate charges/commissions, and authorized owner withdrawals.
            </div>
          </div>

          {/* Lifecycle Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Audit & Lifecycle History</h3>
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              {activity.lifecycleHistory.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative pb-3 last:pb-0">
                  {idx !== activity.lifecycleHistory.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-0 w-px bg-slate-200" />
                  )}
                  <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 border border-sky-300 z-10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{step.step}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                    </div>
                    {step.actor && (
                      <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
                        Actor: {step.actor}
                      </span>
                    )}
                    {step.details && (
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{step.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Action Simulations */}
          {isPending && activity.transactionType === 'Funding' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-950">Awaiting Provider Webhook Callback</span>
              </div>
              <p className="text-[11px] text-amber-900">
                This funding request is awaiting provider confirmation. You can simulate the verified webhook callback to immediately credit the Available Balance.
              </p>
              <button
                type="button"
                onClick={handleSimulateWebhook}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-sky-800 hover:bg-sky-900 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isProcessing ? 'Verifying...' : 'Simulate Verified Provider Webhook'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isPending && activity.transactionType === 'Withdrawal' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-950">Awaiting TellerBud Admin Review & Payout</span>
              </div>
              <p className="text-[11px] text-amber-900">
                This withdrawal request is pending review. You can simulate TellerBud Admin marking it as Paid to debit the Global Wallet exactly once.
              </p>
              <button
                type="button"
                onClick={handleSimulatePayout}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-sky-800 hover:bg-sky-900 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isProcessing ? 'Processing...' : 'Mark as Paid by TellerBud Admin'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            id="close-activity-details-footer-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
