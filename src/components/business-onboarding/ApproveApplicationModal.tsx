import React, { useState } from 'react';
import { Building2, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { BusinessOnboardingApplication } from '../../types/businessOnboarding';

interface ApproveApplicationModalProps {
  application: BusinessOnboardingApplication;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const ApproveApplicationModal: React.FC<ApproveApplicationModalProps> = ({
  application,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100/80 text-sky-700">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Approve Business Application</h3>
              <p className="text-xs text-slate-500">Initial Administrative Approval</p>
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
          <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-xl text-sky-900 font-medium text-xs leading-relaxed">
            “Approve this Business application and create the pending Business Owner account?”
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Business Name:</span>
              <span className="font-semibold text-slate-900">{application.websiteData.businessName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Business Owner:</span>
              <span className="font-semibold text-slate-900">{application.websiteData.ownerFullName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Operating Cities:</span>
              <span className="font-semibold text-slate-900">{application.websiteData.operatingCities.join(', ')}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Agents:</span>
              <span className="font-semibold text-slate-900">{application.websiteData.numberOfAgents} Agents</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11.5px] text-slate-600">
            <p className="font-semibold text-slate-800">What happens upon approval:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Creates pending Business record and pending Business Owner account.</li>
              <li>Generates client-approved IDs using sequence counters (<span className="font-mono font-bold text-slate-800">TB-BIZ-000000</span> and <span className="font-mono font-bold text-slate-800">TB-BOO-000000</span>).</li>
              <li>Sets status to <span className="font-semibold text-sky-700">Approved – Onboarding Pending</span>.</li>
              <li>Account remains <strong className="text-slate-800">Inactive</strong> (no login permitted, not displayed in All Businesses, no active wallet created yet).</li>
              <li>Enables assignment to a TellerBud Executive for physical tablet onboarding.</li>
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
            className="px-4 py-2 rounded-xl bg-[#0D93AA] hover:bg-[#0b8296] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {isSubmitting ? 'Approving...' : 'Confirm & Approve Application'}
          </button>
        </div>
      </div>
    </div>
  );
};
