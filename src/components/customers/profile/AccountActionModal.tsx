import React, { useState, useEffect, useRef } from 'react';
import { UserX, UserCheck, ShieldAlert, ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import { CustomerRecord } from '../../../types/customer';

export type AccountActionType = 'suspend' | 'reactivate' | 'approve-kyc' | 'flag-kyc';

interface AccountActionModalProps {
  isOpen: boolean;
  actionType: AccountActionType | null;
  onClose: () => void;
  customer: CustomerRecord;
  onConfirm: (actionType: AccountActionType, reason: string) => void;
}

export const AccountActionModal: React.FC<AccountActionModalProps> = ({
  isOpen,
  actionType,
  onClose,
  customer,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (actionType === 'suspend') {
      setReason('Unusual account activity / temporary risk hold');
    } else if (actionType === 'reactivate') {
      setReason('Customer identity and KYC compliance confirmed');
    } else if (actionType === 'approve-kyc') {
      setReason('Document inspection verified against Zambia National Registry');
    } else if (actionType === 'flag-kyc') {
      setReason('Identity documents require manual re-submission');
    }
  }, [actionType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !actionType) return null;

  const getTitleAndDetails = () => {
    switch (actionType) {
      case 'suspend':
        return {
          title: 'Suspend Customer Account',
          subtitle: 'Restrict active pickups, mobile money and wallet withdrawals',
          icon: UserX,
          color: 'rose',
          btnText: 'Confirm Account Suspension',
          btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
        };
      case 'reactivate':
        return {
          title: 'Reactivate Customer Account',
          subtitle: 'Restore full access to customer services and transactions',
          icon: UserCheck,
          color: 'emerald',
          btnText: 'Confirm Account Reactivation',
          btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'flag-kyc':
        return {
          title: 'Flag Identity for Review',
          subtitle: 'Prompt customer to re-submit identity verification on next sign-in',
          icon: ShieldAlert,
          color: 'amber',
          btnText: 'Flag Identity for Review',
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'approve-kyc':
        return {
          title: 'Re-verify Identity Tier',
          subtitle: 'Update customer verification status in TellerBud registry',
          icon: ShieldCheck,
          color: 'blue',
          btnText: 'Confirm Verification',
          btnClass: 'bg-[#0D93AA] hover:bg-[#0b8296] text-white',
        };
    }
  };

  const meta = getTitleAndDetails();
  const IconComponent = meta.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(actionType, reason.trim());
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                meta.color === 'rose'
                  ? 'bg-rose-100 text-rose-700'
                  : meta.color === 'emerald'
                  ? 'bg-emerald-100 text-emerald-700'
                  : meta.color === 'amber'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-cyan-100 text-[#0D93AA]'
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{meta.title}</h2>
              <span className="text-xs text-gray-500">{meta.subtitle}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Affected Customer:</span>
              <span className="font-semibold text-gray-900">{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Customer ID:</span>
              <span className="font-mono font-semibold text-gray-900">{customer.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Current Status:</span>
              <span className="font-semibold text-gray-800">{customer.accountStatus}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Administrative Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter mandatory justification for this administrative decision..."
              className="w-full text-xs p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA] resize-none"
              required
            />
            <span className="text-[11px] text-gray-400 block">
              This action will be permanently recorded in the system audit log with your admin timestamp.
            </span>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${meta.btnClass} disabled:opacity-50`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Processing...' : meta.btnText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
