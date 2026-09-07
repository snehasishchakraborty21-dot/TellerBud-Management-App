import React, { useEffect, useRef, useState } from 'react';
import { CustomerWithdrawal, WithdrawalStatus } from '../../types/admin';
import { formatZMW } from '../../utils/formatters';
import { X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export type ActionModalType = 'Approve' | 'Mark Processing' | 'Mark Paid' | 'Reject';

interface WithdrawalConfirmationModalProps {
  actionType: ActionModalType | null;
  withdrawal: CustomerWithdrawal;
  isOpen: boolean;
  isProcessing: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export const WithdrawalConfirmationModal: React.FC<WithdrawalConfirmationModalProps> = ({
  actionType,
  withdrawal,
  isOpen,
  isProcessing,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [reasonValidationErr, setReasonValidationErr] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRejectionReason('');
      setReasonValidationErr(null);
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isProcessing) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen || !actionType) {
    return null;
  }

  // Get heading & button titles
  const getModalConfig = () => {
    switch (actionType) {
      case 'Approve':
        return {
          title: 'Approve Withdrawal',
          confirmLabel: isProcessing ? 'Approving...' : 'Approve',
          confirmButtonClass:
            'bg-[#0D93AA] hover:bg-[#0b8296] text-white focus:ring-[#0D93AA]/40',
        };
      case 'Mark Processing':
        return {
          title: 'Mark Withdrawal as Processing',
          confirmLabel: isProcessing ? 'Updating...' : 'Mark Processing',
          confirmButtonClass:
            'bg-[#0D93AA] hover:bg-[#0b8296] text-white focus:ring-[#0D93AA]/40',
        };
      case 'Mark Paid':
        return {
          title: 'Mark Withdrawal as Paid',
          confirmLabel: isProcessing ? 'Confirming Paid...' : 'Confirm Paid',
          confirmButtonClass:
            'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/40',
          safetyStatement: 'This will record the final wallet debit.',
        };
      case 'Reject':
        return {
          title: 'Reject Withdrawal',
          confirmLabel: isProcessing ? 'Rejecting...' : 'Reject',
          confirmButtonClass:
            'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/40',
          safetyStatement: 'This will reject the withdrawal request and close the transaction.',
        };
    }
  };

  const config = getModalConfig();

  const handleConfirmClick = () => {
    if (actionType === 'Reject') {
      if (!rejectionReason.trim()) {
        setReasonValidationErr('Please provide a reason for rejecting this withdrawal.');
        return;
      }
      onConfirm(rejectionReason.trim());
    } else {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={() => {
        if (!isProcessing) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 id="modal-title" className="text-lg font-bold text-[#102025]">
            {config.title}
          </h3>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Error banner if action failed */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Details Grid */}
          <div className="bg-gray-50/70 border border-gray-100 rounded-lg p-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reference
              </span>
              <span className="font-mono font-bold text-[#102025]">
                {withdrawal.reference}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer
              </span>
              <span className="font-semibold text-gray-800">
                {withdrawal.customerName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </span>
              <span className="font-bold text-[#102025]">
                {formatZMW(withdrawal.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Network
              </span>
              <span className="text-gray-700">
                {withdrawal.network}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Payout Number
              </span>
              <span className="font-mono text-gray-700">
                {withdrawal.payoutNumber}
              </span>
            </div>

            {(actionType === 'Mark Paid' || actionType === 'Reject') && (
              <>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Status
                  </span>
                  <span className="font-semibold text-gray-800">
                    {withdrawal.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Funds State
                  </span>
                  <span className="font-semibold text-gray-800">
                    {withdrawal.fundsState}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Rejection Reason Input */}
          {actionType === 'Reject' && (
            <div className="space-y-1.5">
              <label htmlFor="rejection-reason" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                disabled={isProcessing}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (reasonValidationErr) setReasonValidationErr(null);
                }}
                placeholder="Specify the reason for rejection (e.g. KYC mismatch, suspected duplicate, customer request)..."
                className={`w-full text-sm rounded-lg p-2.5 border focus:outline-none focus:ring-2 transition-all ${
                  reasonValidationErr
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA]'
                } disabled:bg-gray-50 disabled:text-gray-400`}
              />
              {reasonValidationErr && (
                <p className="text-xs font-medium text-red-600">
                  {reasonValidationErr}
                </p>
              )}
            </div>
          )}

          {/* Safety Statement if required */}
          {config.safetyStatement && (
            <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-lg text-xs font-medium text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{config.safetyStatement}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            disabled={isProcessing || (actionType === 'Reject' && !rejectionReason.trim())}
            onClick={handleConfirmClick}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmButtonClass}`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
