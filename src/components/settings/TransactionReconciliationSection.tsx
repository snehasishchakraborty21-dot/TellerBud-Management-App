import React from 'react';
import { ArrowLeftRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SystemSettingsState } from '../../types/settings';
import { LockedBadge } from './LockedBadge';
import { ToggleSwitch } from './ToggleSwitch';

interface TransactionReconciliationSectionProps {
  settings: SystemSettingsState;
  isEditing: boolean;
  draftSettings: SystemSettingsState;
  onUpdateDraft: <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => void;
  isFieldModified?: (key: keyof SystemSettingsState) => boolean;
  onNavigate?: (path: string) => void;
}

export const TransactionReconciliationSection: React.FC<TransactionReconciliationSectionProps> = ({
  settings,
  isEditing,
  draftSettings,
  onUpdateDraft,
  isFieldModified = () => false,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const current = isEditing ? draftSettings : settings;

  const handleLinkClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <div
      id="section-transaction-reconciliation-controls"
      className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Transaction & Reconciliation Controls
            </h2>
          </div>
        </div>

        {/* Links: Manage Service Modes & View Reconciliation */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            id="link-manage-service-modes"
            onClick={() => handleLinkClick('/super-admin/configuration/service-modes')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0D93AA] hover:text-[#0b8094] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/15 border border-[#0D93AA]/25 transition-colors cursor-pointer"
          >
            <span>Manage Service Modes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="link-view-reconciliation"
            onClick={() => handleLinkClick('/super-admin/wallets/reconciliation')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
          >
            <span>View Reconciliation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Double-Entry Ledger Posting - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Double-Entry Ledger Posting</span>
            <LockedBadge label="Core Invariant" />
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-bold text-gray-900">Enabled</p>
          </div>
          <p className="text-[11px] text-gray-500">Zero-sum balance invariant enforced on every journal entry.</p>
        </div>

        {/* 2. Duplicate Callback Protection - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('duplicateCallbackProtection')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-duplicate-callback-protection" className="text-xs font-semibold text-gray-700">
              Duplicate Callback Protection
            </label>
            {isEditing && (
              isFieldModified('duplicateCallbackProtection') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <div className="pt-1.5">
              <ToggleSwitch
                id="setting-duplicate-callback-protection"
                checked={current.duplicateCallbackProtection}
                onChange={(checked) => onUpdateDraft('duplicateCallbackProtection', checked)}
                label={current.duplicateCallbackProtection ? 'Enabled' : 'Disabled'}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`w-2 h-2 rounded-full ${settings.duplicateCallbackProtection ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <p className="text-sm font-semibold text-gray-900">
                {settings.duplicateCallbackProtection ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-500">Webhook idempotency lock against network retry spikes.</p>
        </div>

        {/* 3. Provider Signature Verification - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('providerSignatureVerification')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-provider-signature-verification" className="text-xs font-semibold text-gray-700">
              Provider Signature Verification
            </label>
            {isEditing && (
              isFieldModified('providerSignatureVerification') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <div className="pt-1.5">
              <ToggleSwitch
                id="setting-provider-signature-verification"
                checked={current.providerSignatureVerification}
                onChange={(checked) => onUpdateDraft('providerSignatureVerification', checked)}
                label={current.providerSignatureVerification ? 'Enabled' : 'Disabled'}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`w-2 h-2 rounded-full ${settings.providerSignatureVerification ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <p className="text-sm font-semibold text-gray-900">
                {settings.providerSignatureVerification ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-500">Cryptographic HMAC validation of MTN & Airtel inbound messages.</p>
        </div>

        {/* 4. Automated Reconciliation - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('automatedReconciliation')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-automated-reconciliation" className="text-xs font-semibold text-gray-700">
              Automated Reconciliation
            </label>
            {isEditing && (
              isFieldModified('automatedReconciliation') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <div className="pt-1.5">
              <ToggleSwitch
                id="setting-automated-reconciliation"
                checked={current.automatedReconciliation}
                onChange={(checked) => onUpdateDraft('automatedReconciliation', checked)}
                label={current.automatedReconciliation ? 'Enabled' : 'Disabled'}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`w-2 h-2 rounded-full ${settings.automatedReconciliation ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <p className="text-sm font-semibold text-gray-900">
                {settings.automatedReconciliation ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-500">Automated end-of-day comparison between provider statements and ledger.</p>
        </div>

        {/* 5. Reconciliation Schedule - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('reconciliationSchedule')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-reconciliation-schedule" className="text-xs font-semibold text-gray-700">
              Reconciliation Schedule
            </label>
            {isEditing && (
              isFieldModified('reconciliationSchedule') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <select
              id="setting-reconciliation-schedule"
              value={current.reconciliationSchedule}
              onChange={(e) => onUpdateDraft('reconciliationSchedule', e.target.value)}
              className="w-full h-9 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-900 focus:border-[#0D93AA] focus:ring-1 focus:ring-[#0D93AA] focus:outline-none"
            >
              <option value="Daily at 23:59 CAT">Daily at 23:59 CAT (Default)</option>
              <option value="Daily at 00:00 CAT">Daily at 00:00 CAT</option>
              <option value="Twice Daily (12:00 & 23:59 CAT)">Twice Daily (12:00 & 23:59 CAT)</option>
            </select>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{settings.reconciliationSchedule}</p>
          )}
          <p className="text-[11px] text-gray-500">Execution time window for batch reconciliation runs.</p>
        </div>

        {/* 6. Reversal Protection - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('reversalProtection')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-reversal-protection" className="text-xs font-semibold text-gray-700">
              Reversal Protection
            </label>
            {isEditing && (
              isFieldModified('reversalProtection') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <div className="pt-1.5">
              <ToggleSwitch
                id="setting-reversal-protection"
                checked={current.reversalProtection}
                onChange={(checked) => onUpdateDraft('reversalProtection', checked)}
                label={current.reversalProtection ? 'Enabled' : 'Disabled'}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`w-2 h-2 rounded-full ${settings.reversalProtection ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <p className="text-sm font-semibold text-gray-900">
                {settings.reversalProtection ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-500">Safeguards ledger from unauthorized unilateral clawbacks.</p>
        </div>

        {/* 7. Cash Delivery - Read-Only */}
        <div className="p-3.5 rounded-lg border border-amber-200/70 bg-amber-50/40 space-y-1.5 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-amber-900">Cash Delivery Service Mode</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              Read-Only
            </span>
          </div>
          <p className="text-sm font-bold text-amber-950">{settings.cashDeliveryStatus}</p>
          <p className="text-[11px] text-amber-800">
            Cash Delivery is disabled in Phase 1 and governed directly through the Service Modes module.
          </p>
        </div>
      </div>
    </div>
  );
};
