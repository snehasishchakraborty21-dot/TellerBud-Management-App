import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CustomerRecord } from '../../../types/customer';

interface RecoverySupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord;
  onConfirm: (reason: string) => void;
}

export const RecoverySupportModal: React.FC<RecoverySupportModalProps> = ({
  isOpen,
  onClose,
  customer,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>('Customer forgot 4-digit passcode');
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
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-cyan-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-[#0D93AA] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Initiate Customer Recovery Support
              </h2>
              <span className="text-xs text-[#0D93AA]">
                Customer Security & Passcode Reset Flow
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Customer:</span>
              <span className="font-semibold text-gray-900">{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Customer ID:</span>
              <span className="font-mono font-semibold text-gray-900">{customer.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Registered Phone:</span>
              <span className="font-mono font-semibold text-gray-900">{customer.phone}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-blue-800">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Customer-Self-Service Security Policy
            </div>
            <p>
              Admins cannot choose, set, or view a customer's 4-digit passcode or security question answers. Initiating recovery will trigger an encrypted SMS OTP challenge to the customer's verified mobile device, allowing them to complete the recovery independently.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Administrative Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA]"
            >
              <option value="Customer forgot 4-digit passcode">Customer forgot 4-digit passcode</option>
              <option value="Locked out following maximum failed attempts">Locked out following maximum failed attempts</option>
              <option value="Customer requested assisted recovery ticket">Customer requested assisted recovery ticket</option>
              <option value="Device lost/replaced - verified customer identity">Device lost/replaced - verified customer identity</option>
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
                placeholder="Enter justification for initiating recovery..."
                className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA]"
                required
              />
            </div>
          )}

          {/* Footer buttons */}
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
              disabled={isSubmitting || (reason === 'Other' && !customReason.trim())}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] disabled:opacity-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Initiate Recovery Flow</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
