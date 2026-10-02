import React, { useState } from 'react';
import { Mail, CheckCircle2, X, ExternalLink, Copy, Check, ShieldCheck } from 'lucide-react';
import { BusinessOnboardingApplication } from '../../types/businessOnboarding';

interface ActivationEmailPreviewModalProps {
  application: BusinessOnboardingApplication;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivationEmailPreviewModal: React.FC<ActivationEmailPreviewModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const ownerName =
    application.digitalOnboarding?.ownerFullLegalName ||
    application.websiteData.ownerFullName;
  const businessName =
    application.digitalOnboarding?.tradingName ||
    application.websiteData.businessName;
  const email =
    application.activationEmailRecipient ||
    application.digitalOnboarding?.ownerEmail ||
    application.websiteData.email ||
    'owner@agency.zm';
  const setupLink =
    application.securePasscodeSetupLink ||
    `https://tellerbud.com/portal/setup-passcode?token=tb_act_${application.id}_live`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(setupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Activation Confirmation Email</h3>
              <p className="text-xs text-slate-500">Delivered to Business Owner via Secure Mailer</p>
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

        {/* Email Container (Simulated Mail Client) */}
        <div className="p-6 space-y-4 text-xs">
          {/* Email Headers */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">To:</span>
              <span className="font-semibold text-slate-900">{ownerName} &lt;{email}&gt;</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">From:</span>
              <span className="text-slate-700">TellerBud Identity & Onboarding &lt;onboarding@tellerbud.co.zm&gt;</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Subject:</span>
              <span className="font-semibold text-teal-800">Your TellerBud Business Account is Active — Set Up Your Portal Passcode</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-2xs font-sans">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#0D93AA] text-white font-bold flex items-center justify-center text-sm">
                TB
              </div>
              <span className="font-bold text-slate-800 tracking-tight text-sm">TellerBud Financial Network</span>
            </div>

            <p className="text-slate-700">
              Dear <strong>{ownerName}</strong>,
            </p>

            <p className="text-slate-700 leading-relaxed">
              We are pleased to confirm that your business, <strong>{businessName}</strong>, has successfully completed physical onboarding and compliance verification. Your official TellerBud Business account is now <strong>Active</strong>.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Official Account Credentials</div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500 text-[11px]">Business Name:</span>
                  <div className="font-semibold text-slate-900">{businessName}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Business Owner:</span>
                  <div className="font-semibold text-slate-900">{ownerName}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Business ID:</span>
                  <div className="font-mono font-bold text-teal-700">{application.businessId || 'TB-BIZ-000001'}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Business Owner ID:</span>
                  <div className="font-mono font-bold text-teal-700">{application.businessOwnerId || 'TB-BOO-000001'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 leading-relaxed">
                For security reasons, your temporary password is not sent via plain text. Please use the secure, single-use link below to set up your personal 6-digit portal passcode:
              </p>

              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between gap-3">
                <div className="truncate font-mono text-[11px] text-teal-900">
                  {setupLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="text-[10.5px] text-slate-400 italic">
                * This single-use link is valid for 48 hours. After creating your passcode, access your portal at{' '}
                <span className="font-mono text-slate-600">https://tellerbud.com/portal</span>.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-slate-500 text-[11px] space-y-1">
              <p className="font-semibold text-slate-700">TellerBud Support</p>
              <p>Helpline: +260 211 123456 • WhatsApp: +260 97 700 0000 • Email: support@tellerbud.co.zm</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
