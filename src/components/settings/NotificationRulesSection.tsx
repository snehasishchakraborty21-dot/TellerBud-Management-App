import React from 'react';
import { BellRing, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SystemSettingsState } from '../../types/settings';
import { LockedBadge } from './LockedBadge';
import { ToggleSwitch } from './ToggleSwitch';

interface NotificationRulesSectionProps {
  settings: SystemSettingsState;
  isEditing: boolean;
  draftSettings: SystemSettingsState;
  onUpdateDraft: <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => void;
  isFieldModified?: (key: keyof SystemSettingsState) => boolean;
  onNavigate?: (path: string) => void;
}

export const NotificationRulesSection: React.FC<NotificationRulesSectionProps> = ({
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

  const standardToggles: Array<{
    key: keyof SystemSettingsState;
    label: string;
    description: string;
  }> = [
    {
      key: 'notifyCustomerWithdrawalSubmitted',
      label: 'Customer Withdrawal Submitted',
      description: 'Trigger notification when a new customer withdrawal request arrives.',
    },
    {
      key: 'notifyWithdrawalStatusChanged',
      label: 'Withdrawal Status Changed',
      description: 'Alert when a withdrawal moves between Pending, Review, Approved, or Rejected.',
    },
    {
      key: 'notifyProviderApiFailure',
      label: 'Provider/API Failure',
      description: 'Critical broadcast when MTN or Airtel API endpoints respond with errors or timeouts.',
    },
    {
      key: 'notifyProviderCallbackDelayed',
      label: 'Provider Callback Delayed',
      description: 'Triggered when a mobile money callback exceeds the expected response threshold.',
    },
    {
      key: 'notifyReconciliationException',
      label: 'Reconciliation Exception',
      description: 'Notification triggered when bank settlement amount mismatches internal ledger record.',
    },
    {
      key: 'notifyVendorStatusChanged',
      label: 'Vendor Status Changed',
      description: 'Alert when a vendor changes between Active and Inactive.',
    },
    {
      key: 'notifyVendorEligibilityChanged',
      label: 'Vendor Eligibility Changed',
      description: 'Notification dispatched when service routing rules are modified in Eligibility Matrix.',
    },
  ];

  const highValueThreshold = current.highValueTransactionThresholdZmw;
  const isThresholdValid = typeof highValueThreshold === 'number' && highValueThreshold > 0;

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/[^0-9]/g, '');
    if (digitsOnly === '') {
      onUpdateDraft('highValueTransactionThresholdZmw', null);
      onUpdateDraft('notifyHighValueTransactionAlert', false);
      return;
    }
    const val = parseInt(digitsOnly, 10);
    if (val > 0) {
      onUpdateDraft('highValueTransactionThresholdZmw', val);
    } else {
      onUpdateDraft('highValueTransactionThresholdZmw', null);
      onUpdateDraft('notifyHighValueTransactionAlert', false);
    }
  };

  const handleThresholdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const isHighValueModified =
    isEditing &&
    (isFieldModified('notifyHighValueTransactionAlert') ||
      isFieldModified('highValueTransactionThresholdZmw'));

  return (
    <div
      id="section-notification-rules"
      className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Notification Rules
            </h2>
          </div>
        </div>

        {/* View Notifications Link */}
        <button
          type="button"
          id="link-view-notifications"
          onClick={() => handleLinkClick('/super-admin/configuration/notifications')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0D93AA] hover:text-[#0b8094] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/15 border border-[#0D93AA]/25 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>View Notifications</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Toggles + High Value Alert Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {standardToggles.map((item) => {
          const val = Boolean(current[item.key]);
          const modified = isEditing && isFieldModified(item.key);
          return (
            <div
              key={item.key}
              className={`p-3.5 rounded-lg border transition-all ${
                modified
                  ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
                  : isEditing
                  ? 'border-gray-200 hover:border-[#0D93AA]/50 bg-white'
                  : 'border-gray-100 bg-gray-50/50'
              } flex flex-col justify-between space-y-2`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-800 leading-snug">
                      {item.label}
                    </span>
                    {modified && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                        Changed
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="shrink-0 mt-0.5">
                      <ToggleSwitch
                        id={`setting-${item.key}`}
                        checked={val}
                        onChange={(checked) => onUpdateDraft(item.key, checked as any)}
                      />
                    </div>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold">
                      <span className={`w-2 h-2 rounded-full ${val ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className={val ? 'text-emerald-700' : 'text-gray-500'}>
                        {val ? 'Enabled' : 'Disabled'}
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}

        {/* 8. High-Value Transaction Alert */}
        <div
          className={`p-3.5 rounded-lg border transition-all ${
            isHighValueModified
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : isEditing
              ? 'border-gray-200 hover:border-[#0D93AA]/50 bg-white'
              : 'border-gray-100 bg-gray-50/50'
          } flex flex-col justify-between space-y-2`}
        >
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-800 leading-snug">
                  High-Value Transaction Alert
                </span>
                {isHighValueModified && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                    Changed
                  </span>
                )}
              </div>
              {isEditing ? (
                <div className="shrink-0 mt-0.5">
                  <ToggleSwitch
                    id="setting-notifyHighValueTransactionAlert"
                    disabled={!isThresholdValid}
                    checked={Boolean(current.notifyHighValueTransactionAlert)}
                    onChange={(checked) => {
                      if (checked && !isThresholdValid) return;
                      onUpdateDraft('notifyHighValueTransactionAlert', checked);
                    }}
                  />
                </div>
              ) : (
                <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      current.notifyHighValueTransactionAlert ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                  <span
                    className={
                      current.notifyHighValueTransactionAlert ? 'text-emerald-700' : 'text-gray-500'
                    }
                  >
                    {current.notifyHighValueTransactionAlert ? 'Enabled' : 'Disabled'}
                  </span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-gray-500 leading-tight">
              Disabled by default. Requires a configured threshold greater than 0 ZMW to enable.
            </p>

            {/* Threshold Configuration / Display */}
            <div className="pt-1">
              {isEditing ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">
                    Alert Threshold
                  </label>
                  <div className="flex items-stretch rounded-md border border-gray-300 bg-white overflow-hidden focus-within:border-[#0D93AA] focus-within:ring-1 focus-within:ring-[#0D93AA]">
                    <span className="inline-flex items-center px-2.5 bg-gray-100 text-gray-600 text-xs font-bold border-r border-gray-300 select-none">
                      ZMW
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter amount"
                      value={highValueThreshold !== null && highValueThreshold > 0 ? highValueThreshold : ''}
                      onChange={handleThresholdChange}
                      onKeyDown={handleThresholdKeyDown}
                      className="w-full px-2.5 py-1.5 text-xs font-mono text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                  {!isThresholdValid && (
                    <span className="text-[10px] text-amber-600 block leading-tight">
                      Enter an amount &gt; ZMW 0 to enable this alert.
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-gray-600 font-medium">
                  Threshold:{' '}
                  <span className={`font-semibold ${isThresholdValid ? 'text-gray-900' : 'text-gray-500'}`}>
                    {isThresholdValid ? `ZMW ${highValueThreshold?.toLocaleString()}` : 'Not Configured'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System-Locked Notification Invariants (In-App Admin & Auto Mark Read) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        {/* In-App Admin Notifications: Locked Enabled */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/80 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-800">In-App Admin Notifications</span>
            <LockedBadge label="Mandatory" />
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-bold text-gray-900">Enabled</p>
          </div>
          <p className="text-[11px] text-gray-500">
            Super Admins receive in-app notifications for critical platform events.
          </p>
        </div>

        {/* Automatically mark a notification as Read when its Details page is opened: Locked Enabled */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/80 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-800">
              Automatically Mark Notification as Read
            </span>
            <LockedBadge label="System Rule" />
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-bold text-gray-900">Enabled</p>
          </div>
          <p className="text-[11px] text-gray-500">
            A notification is automatically marked as Read when its Details page is opened.
          </p>
        </div>
      </div>
    </div>
  );
};
