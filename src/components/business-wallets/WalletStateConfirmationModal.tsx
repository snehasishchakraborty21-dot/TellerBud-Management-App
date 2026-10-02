import React, { useState } from 'react';
import { AlertTriangle, Ban, CheckCircle2, X } from 'lucide-react';
import { BusinessGlobalWallet } from '../../types/businessWallet';
import { formatZmwListingAmount } from '../../utils/formatters';

interface WalletStateConfirmationModalProps {
  wallet: BusinessGlobalWallet;
  action: 'SUSPEND' | 'REACTIVATE';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (wallet: BusinessGlobalWallet, action: 'SUSPEND' | 'REACTIVATE', reason: string) => void;
}

export const WalletStateConfirmationModal: React.FC<WalletStateConfirmationModalProps> = ({
  wallet,
  action,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const isSuspend = action === 'SUSPEND';
  const [reason, setReason] = useState(
    isSuspend ? 'Administrative compliance review' : 'Compliance verification completed'
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(wallet, action, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isSuspend ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {isSuspend ? <Ban size={22} /> : <CheckCircle2 size={22} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {isSuspend
                ? 'Are you sure you want to suspend this business wallet?'
                : 'Are you sure you want to reactivate this business wallet?'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isSuspend
                ? 'Suspending this wallet will prevent new wallet transactions while preserving its financial balance and transaction history.'
                : 'Reactivating this wallet will restore standard operational transactions and agent funding capabilities.'}
            </p>
          </div>
        </div>

        {/* Target Details Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 mb-4 text-xs">
          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
            <span className="text-slate-500 font-medium">Business:</span>
            <span className="font-semibold text-slate-800">{wallet.businessName}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
            <span className="text-slate-500 font-medium">Business ID:</span>
            <span className="font-mono font-medium text-slate-700">{wallet.businessId}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
            <span className="text-slate-500 font-medium">Wallet ID:</span>
            <span className="font-mono font-semibold text-[#0D93AA]">{wallet.walletId}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 font-medium">Current Balance:</span>
            <span className="font-mono font-bold text-slate-900">
              {formatZmwListingAmount(wallet.postedBalance)}
            </span>
          </div>
        </div>

        {/* Reason Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Audit Reason / Note:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isSuspend ? 'Enter reason for suspension...' : 'Enter reason for reactivation...'}
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs ${
              isSuspend
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500'
                : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500'
            }`}
          >
            {isSuspend ? 'Confirm Suspension' : 'Confirm Reactivation'}
          </button>
        </div>
      </div>
    </div>
  );
};
