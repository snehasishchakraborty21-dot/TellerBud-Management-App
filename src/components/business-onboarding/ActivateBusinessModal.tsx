import React from 'react';
import { CheckCircle2, ShieldCheck, X, Zap, Mail, ArrowRight } from 'lucide-react';
import { BusinessOnboardingApplication } from '../../types/businessOnboarding';

interface ActivateBusinessModalProps {
  application: BusinessOnboardingApplication;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const ActivateBusinessModal: React.FC<ActivateBusinessModalProps> = ({
  application,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  const recipientEmail =
    application.digitalOnboarding?.ownerEmail ||
    application.websiteData.email ||
    'business.owner@company.zm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Activate Business Account</h3>
              <p className="text-xs text-slate-500">Final Administrative Activation</p>
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600">
          <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl text-teal-900 font-semibold text-xs leading-relaxed">
            “Are you sure you want to activate this Business and Business Owner account?”
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Business:</span>
              <span className="font-semibold text-slate-900">{application.websiteData.businessName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Business ID:</span>
              <span className="font-mono font-bold text-teal-700">{application.businessId}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Owner Full Name:</span>
              <span className="font-semibold text-slate-900">
                {application.digitalOnboarding?.ownerFullLegalName || application.websiteData.ownerFullName}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Owner ID:</span>
              <span className="font-mono font-bold text-teal-700">{application.businessOwnerId}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Activation Email Destination:</span>
              <span className="font-mono font-medium text-slate-800">{recipientEmail}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11.5px] text-slate-600">
            <p className="font-semibold text-slate-800">Upon Activation:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Changes Business status and Business Owner status to <strong className="text-emerald-700">Active</strong>.</li>
              <li>Enables the Business Owner's portal access.</li>
              <li>Provisions the initial Business Global Wallet.</li>
              <li>Displays the Business in <strong className="text-slate-900">All Businesses</strong> directory.</li>
              <li>Automatically dispatches an activation-confirmation email with a single-use passcode setup link.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Activating & Provisioning...</span>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Confirm & Activate Business</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
