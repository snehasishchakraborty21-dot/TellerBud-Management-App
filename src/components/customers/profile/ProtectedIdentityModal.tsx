import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Lock, CheckCircle2 } from 'lucide-react';
import { CustomerRecord } from '../../../types/customer';

interface ProtectedIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord;
  onConfirm: (reason: string) => void;
}

export const ProtectedIdentityModal: React.FC<ProtectedIdentityModalProps> = ({
  isOpen,
  onClose,
  customer,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>('KYC Compliance & Verification Audit');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(finalReason);
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
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Access Protected Identity Data
              </h2>
              <span className="text-xs text-amber-800">
                Zambia Data Protection Act Compliance
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Customer:</span>
              <span className="font-semibold text-gray-900">{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Customer ID:</span>
              <span className="font-mono font-semibold text-gray-900">{customer.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Protected Records:</span>
              <span className="font-medium text-amber-800">National Registration Card (NRC) & Selfie</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700 leading-relaxed bg-amber-50/40 border border-amber-200/60 rounded-xl p-3">
            <div className="font-semibold text-amber-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Administrative Audit Notice
            </div>
            <p>
              Unmasking government-issued identity documents requires an explicit administrative justification. This access event will be permanently written to the administrative audit log.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Administrative Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2.5 min-h-[40px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA]"
            >
              <option value="KYC Compliance & Verification Audit">KYC Compliance & Verification Audit</option>
              <option value="Fraud & Risk Prevention Investigation">Fraud & Risk Prevention Investigation</option>
              <option value="Account Recovery Dispute Resolution">Account Recovery Dispute Resolution</option>
              <option value="Regulatory Authority Formal Request">Regulatory Authority Formal Request</option>
              <option value="Customer-Requested Identity Update">Customer-Requested Identity Update</option>
              <option value="Other">Other (Specify below)</option>
            </select>
          </div>

          {reason === 'Other' && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Specify Reason <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter justification for unmasking identity..."
                className="w-full text-xs px-3 py-2.5 min-h-[40px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA]"
                required
              />
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[40px] text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (reason === 'Other' && !customReason.trim())}
              className="px-4 py-2.5 min-h-[40px] text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] disabled:opacity-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & View Protected Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
