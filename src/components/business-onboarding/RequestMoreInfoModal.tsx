import React, { useState } from 'react';
import { HelpCircle, X, AlertCircle } from 'lucide-react';
import { BusinessOnboardingApplication } from '../../types/businessOnboarding';

interface RequestMoreInfoModalProps {
  application: BusinessOnboardingApplication;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting?: boolean;
}

export const RequestMoreInfoModal: React.FC<RequestMoreInfoModalProps> = ({
  application,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide specific details or documents required from the applicant.');
      return;
    }
    onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Request More Information</h3>
              <p className="text-xs text-slate-500">Applicant Clarification Request</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-slate-600">
            Specify the additional documentation, business premises clarification, or licensing credentials required from{' '}
            <strong className="text-slate-900">{application.websiteData.ownerFullName}</strong> ({application.websiteData.businessName}).
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Information / Clarification Request Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Please provide certified PACRA certificate of incorporation, valid council trading permit for Kafue location, and utility bill..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <p className="text-[11px] text-slate-500">
            The application will remain in the Business Onboarding directory with status{' '}
            <span className="font-semibold text-orange-700">More Information Required</span>.
          </p>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Information Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
