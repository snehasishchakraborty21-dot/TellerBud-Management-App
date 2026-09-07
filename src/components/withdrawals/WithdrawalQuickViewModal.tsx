import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { CustomerWithdrawal } from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW, formatWithdrawalDate } from '../../utils/formatters';

interface WithdrawalQuickViewModalProps {
  withdrawal: CustomerWithdrawal | null;
  onClose: () => void;
}

export const WithdrawalQuickViewModal: React.FC<WithdrawalQuickViewModalProps> = ({
  withdrawal,
  onClose,
}) => {
  const navigate = useNavigate();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (withdrawal) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      // Focus the close button when opened
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedElementRef.current) {
          previouslyFocusedElementRef.current.focus();
        }
      };
    }
  }, [withdrawal, onClose]);

  if (!withdrawal) {
    return null;
  }

  const formatRequestedDate = (isoStr: string) => {
    return formatWithdrawalDate(isoStr);
  };

  const formattedAmount = formatZMW(withdrawal.amount);

  const handleOpenFullDetails = () => {
    onClose();
    navigate(`/wallets/customer-withdrawals/${withdrawal.reference}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="withdrawal-quick-view-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer / Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h3
                id="withdrawal-quick-view-title"
                className="text-base font-bold text-[#102025]"
              >
                Withdrawal Summary
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {withdrawal.reference}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Status & Funds Header Strip */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                  Status
                </span>
                <StatusChip status={withdrawal.status} />
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                  Funds
                </span>
                <StatusChip status={withdrawal.fundsState} />
              </div>
            </div>

            {/* Key-Value Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Reference
                </span>
                <span className="font-mono font-semibold text-gray-900 text-sm">
                  {withdrawal.reference}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Amount
                </span>
                <span className="font-bold text-gray-900 text-base text-[#102025]">
                  {formattedAmount}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Customer
                </span>
                <span className="font-medium text-gray-900">
                  {withdrawal.customerName}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Customer Phone
                </span>
                <span className="font-medium text-gray-700 font-mono text-xs">
                  {withdrawal.customerPhone}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Network
                </span>
                <span className="font-medium text-gray-900">
                  {withdrawal.network}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Payout Number
                </span>
                <span className="font-medium text-gray-700 font-mono text-xs">
                  {withdrawal.payoutNumber}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-xs text-gray-400 font-medium block">
                  Requested
                </span>
                <span className="font-medium text-gray-800">
                  {formatRequestedDate(withdrawal.requestedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleOpenFullDetails}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40"
            >
              <span>Open Full Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
