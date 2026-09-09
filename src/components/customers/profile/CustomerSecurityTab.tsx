import React from 'react';
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Phone,
  HelpCircle,
  Clock,
  History,
  Shield,
} from 'lucide-react';
import { CustomerSecurityState, CustomerAuditEvent } from '../../../types/customerProfile';
import { CustomerRecord } from '../../../types/customer';
import { maskZambianPhone } from '../../../utils/customerUtils';

interface CustomerSecurityTabProps {
  customer: CustomerRecord;
  security: CustomerSecurityState;
  auditEvents: CustomerAuditEvent[];
  onInitiateRecovery: () => void;
}

export const CustomerSecurityTab: React.FC<CustomerSecurityTabProps> = ({
  customer,
  security,
  auditEvents,
  onInitiateRecovery,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">
          Security & Recovery
        </h2>
      </div>

      {/* Strict Security Architecture Notice */}
      <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-100 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900">
              Zero-Knowledge Credential Security Model
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              In accordance with TellerBud compliance guidelines and the Republic of Zambia Data Protection Act, customer authentication secrets (4-digit passcode, security question answers) are salted, hashed, and stored strictly on hardware security modules. TellerBud Admin staff are strictly prohibited from viewing or manually setting customer credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Security State Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Phone Verification */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              Primary Authentication Factor
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-bold font-mono text-gray-900">
              {maskZambianPhone(customer.phone)}
            </div>
            <p className="text-xs text-gray-500">{security.phoneVerificationStatus}</p>
          </div>

          <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            Carrier: Republic of Zambia Telecommunication Pool
          </div>
        </div>

        {/* 2. 4-Digit Passcode Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0D93AA]" />
              4-Digit Customer Passcode
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Configured
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="font-mono text-gray-400 tracking-widest text-base">••••</span>
              <span className="text-xs text-gray-500 font-normal">(Encrypted)</span>
            </div>
            <p className="text-xs text-gray-500">
              Last updated: <span className="font-medium text-gray-700">{security.lastPasscodeChange}</span>
            </p>
          </div>

          <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            BCrypt hash stored on secure auth enclave
          </div>
        </div>

        {/* 3. Security Questions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Security Challenge Questions
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Configured
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-bold text-gray-900">
              {security.securityQuestionsSummary}
            </div>
            <p className="text-xs text-gray-500">Answers are irreversible one-way hashes</p>
          </div>

          <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            Used during customer-driven recovery verification
          </div>
        </div>

        {/* 4. Recovery Support Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0D93AA]" />
              Recovery Support Status
            </span>
            {security.hasActiveRecoveryCase ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Active Case
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                Idle
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-sm font-bold text-gray-900">
              {security.recoveryStatusText}
            </div>
            <p className="text-xs text-gray-500">{security.lastRecoveryActivity}</p>
          </div>

          <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            Customer-initiated support requests
          </div>
        </div>

        {/* 5. Failed Authentication & Lockouts */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Auth Health & Lockout Monitor
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Healthy
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-bold text-gray-900">
              {security.failedAttemptsText}
            </div>
            <p className="text-xs text-gray-500">Lockout threshold: 5 consecutive invalid passcodes</p>
          </div>

          <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            Automatic 30-minute security freeze on breach
          </div>
        </div>

        {/* 6. Administrative Recovery Action Card */}
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0D93AA] flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                Administrative Action
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-[#0D93AA]">
                Admin Controlled
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-900">Initiate Recovery Support</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Triggers a secure SMS OTP verification link to the customer’s phone. The customer resets their passcode directly on their mobile device.
            </p>
          </div>

          <button
            type="button"
            onClick={onInitiateRecovery}
            className="w-full py-2.5 px-4 min-h-[40px] bg-[#0D93AA] hover:bg-[#0b8296] text-white text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer mt-2 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Initiate Recovery Support</span>
          </button>
        </div>
      </div>

      {/* Audit Log for Security Events */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-bold text-gray-900">Security & Administrative Audit Trail</h3>
          </div>
          <span className="text-xs text-gray-400">Recorded by TellerBud Security Service</span>
        </div>

        {auditEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No administrative audit actions recorded for this customer in this session.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {auditEvents.map((evt) => (
              <div key={evt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{evt.action}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                      {evt.id}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px]">
                    <span className="font-medium text-gray-700">Reason:</span> {evt.reason}
                  </p>
                </div>

                <div className="text-right shrink-0 text-[11px] text-gray-400">
                  <div>Actor: <span className="font-medium text-gray-700">{evt.actor}</span></div>
                  <div>{new Date(evt.timestamp).toLocaleString('en-GB')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
