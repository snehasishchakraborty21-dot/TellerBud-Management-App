import React from 'react';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SystemSettingsState } from '../../types/settings';
import { LockedBadge } from './LockedBadge';
import { ToggleSwitch } from './ToggleSwitch';

interface WalletWithdrawalControlsSectionProps {
  settings: SystemSettingsState;
  isEditing: boolean;
  draftSettings: SystemSettingsState;
  onUpdateDraft: <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => void;
  isFieldModified?: (key: keyof SystemSettingsState) => boolean;
  onNavigate?: (path: string) => void;
}

export const WalletWithdrawalControlsSection: React.FC<WalletWithdrawalControlsSectionProps> = ({
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
      id="section-wallet-withdrawal-controls"
      className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-[#0D93AA]">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Wallet & Withdrawal Controls
            </h2>
          </div>
        </div>

        {/* Link that opens Customer Withdrawals */}
        <button
          type="button"
          id="link-manage-withdrawals"
          onClick={() => handleLinkClick('/super-admin/wallets/customer-withdrawals')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0D93AA] hover:text-[#0b8094] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/15 border border-[#0D93AA]/25 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Manage Withdrawal Requests</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Wallet Credit Policy - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Wallet Credit Policy</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold text-gray-900">{settings.walletCreditPolicy}</p>
        </div>

        {/* 2. Withdrawal Review Method - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Withdrawal Review Method</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold text-gray-900">{settings.withdrawalReviewMethod}</p>
          <p className="text-[11px] text-gray-500">Customer withdrawals require manual review and approval by the Super Admin.</p>
        </div>

        {/* 3. Pending Withdrawal Funds - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Pending Withdrawal Funds</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold text-gray-900">{settings.pendingWithdrawalFunds}</p>
          <p className="text-[11px] text-gray-500">The requested withdrawal amount remains reserved while the request is under review.</p>
        </div>

        {/* 4. Customer Cancellation - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('customerCancellationDuringPendingReview')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-customer-cancellation" className="text-xs font-semibold text-gray-700">
              Customer Cancellation
            </label>
            {isEditing && (
              isFieldModified('customerCancellationDuringPendingReview') ? (
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
                id="setting-customer-cancellation"
                checked={current.customerCancellationDuringPendingReview}
                onChange={(checked) => onUpdateDraft('customerCancellationDuringPendingReview', checked)}
                label={
                  current.customerCancellationDuringPendingReview
                    ? 'Allowed during Pending Review'
                    : 'Disallowed'
                }
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`w-2 h-2 rounded-full ${settings.customerCancellationDuringPendingReview ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <p className="text-sm font-semibold text-gray-900">
                {settings.customerCancellationDuringPendingReview
                  ? 'Allowed during Pending Review'
                  : 'Disallowed'}
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-500">Customers can cancel a withdrawal while its status is Pending Review.</p>
        </div>

        {/* 5. Supported Withdrawal Providers - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Supported Withdrawal Providers</span>
            <LockedBadge label="Phase 1 Locked" />
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {settings.supportedWithdrawalProviders.map((provider) => (
              <span
                key={provider}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-200 text-gray-800 shadow-2xs"
              >
                {provider}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">Zambian Mobile Money rails locked for Phase 1 production rollout.</p>
        </div>
      </div>
    </div>
  );
};
