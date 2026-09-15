import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Shield,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  SystemSettingsState,
  SettingsChangeImpact,
  SettingsChangeRecord,
} from '../types/settings';
import { systemSettingsService } from '../services/systemSettingsService';
import { SettingsSummaryCards } from '../components/settings/SettingsSummaryCards';
import { GeneralPlatformSettingsSection } from '../components/settings/GeneralPlatformSettingsSection';
import { AuthSessionSecuritySection } from '../components/settings/AuthSessionSecuritySection';
import { WalletWithdrawalControlsSection } from '../components/settings/WalletWithdrawalControlsSection';
import { TransactionReconciliationSection } from '../components/settings/TransactionReconciliationSection';
import { NotificationRulesSection } from '../components/settings/NotificationRulesSection';
import { ModuleSpecificSettingsSection } from '../components/settings/ModuleSpecificSettingsSection';
import { SettingsChangeHistoryTable } from '../components/settings/SettingsChangeHistoryTable';
import { SettingsConfirmModal } from '../components/settings/SettingsConfirmModal';
import { DiscardUnsavedChangesModal } from '../components/settings/DiscardUnsavedChangesModal';

// Critical setting keys that require explicit warning/confirmation
const CRITICAL_KEYS: Array<keyof SystemSettingsState> = [
  'maxFailedSignInAttempts',
  'tempAccountLockDurationMinutes',
  'adminSessionTimeoutMinutes',
  'reauthForCriticalActions',
  'customerCancellationDuringPendingReview',
  'duplicateCallbackProtection',
  'providerSignatureVerification',
  'automatedReconciliation',
  'reconciliationSchedule',
  'reversalProtection',
];

export const SystemSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SystemSettingsState>(() =>
    systemSettingsService.getSettings()
  );
  const [history, setHistory] = useState<SettingsChangeRecord[]>(() =>
    systemSettingsService.getHistory()
  );

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftSettings, setDraftSettings] = useState<SystemSettingsState>(() => ({
    ...settings,
  }));
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = systemSettingsService.subscribe(() => {
      setSettings(systemSettingsService.getSettings());
      setHistory(systemSettingsService.getHistory());
    });
    return unsubscribe;
  }, []);

  // Sync draft when entering edit mode or when settings update
  const handleStartEditing = useCallback(() => {
    setDraftSettings({ ...settings });
    setIsEditing(true);
  }, [settings]);

  const handleCancelEditing = useCallback(() => {
    setDraftSettings({ ...settings });
    setIsEditing(false);
    setIsDiscardModalOpen(false);
    setPendingNavigation(null);
  }, [settings]);

  const handleUpdateDraft = useCallback(
    <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => {
      setDraftSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Compute pending differences between draftSettings and settings
  const pendingChanges = useMemo<SettingsChangeImpact[]>(() => {
    if (!isEditing) return [];

    const changes: SettingsChangeImpact[] = [];

    const checkChange = (
      key: keyof SystemSettingsState,
      label: string,
      impactText: string
    ) => {
      const orig = settings[key];
      const draft = draftSettings[key];
      if (orig !== draft) {
        changes.push({
          settingKey: key,
          settingLabel: label,
          previousValue: typeof orig === 'boolean' ? (orig ? 'Enabled' : 'Disabled') : String(orig),
          newValue: typeof draft === 'boolean' ? (draft ? 'Enabled' : 'Disabled') : String(draft),
          impactDescription: impactText,
        });
      }
    };

    checkChange('defaultLanguage', 'Default Language', 'Affects system-wide default UI language for unauthenticated views.');
    checkChange('dateFormat', 'Date Format', 'Changes visual timestamp formatting across administration tables.');
    checkChange('timeFormat', 'Time Format', 'Toggles between 12-hour AM/PM and 24-hour military clock display.');
    checkChange('maxFailedSignInAttempts', 'Max Failed Sign-In Attempts', 'Controls customer account passcode brute-force lock threshold.');
    checkChange('tempAccountLockDurationMinutes', 'Temporary Account Lock Duration', 'Cooldown timer length before locked accounts can retry passcodes.');
    checkChange('adminSessionTimeoutMinutes', 'Admin Session Timeout', 'Portal idle activity timeout for Super Admin authentication token.');
    checkChange('reauthForCriticalActions', 'Re-authentication for Critical Actions', 'Prompts Super Admin re-authorization before manual withdrawal overrides.');
    checkChange('customerCancellationDuringPendingReview', 'Customer Withdrawal Cancellation', 'Allows customers to abort self-service withdrawal requests in Pending state.');
    checkChange('duplicateCallbackProtection', 'Duplicate Callback Protection', 'Idempotency gate rejecting duplicate inbound provider payment notifications.');
    checkChange('providerSignatureVerification', 'Provider Signature Verification', 'HMAC SHA-256 header validation on MTN and Airtel webhook events.');
    checkChange('automatedReconciliation', 'Automated Reconciliation', 'Scheduled reconciliation ledger auto-comparison job execution.');
    checkChange('reconciliationSchedule', 'Reconciliation Schedule', 'Batch ledger reconciliation settlement execution window.');
    checkChange('reversalProtection', 'Reversal Protection', 'Prevents unilateral ledger debit clawbacks without manual override.');
    checkChange('notifyCustomerWithdrawalSubmitted', 'Customer Withdrawal Submitted Notification', 'Dispatches in-app notification upon incoming withdrawal requests.');
    checkChange('notifyWithdrawalStatusChanged', 'Withdrawal Status Changed Notification', 'Dispatches notification whenever withdrawal lifecycle updates.');
    checkChange('notifyProviderApiFailure', 'Provider/API Failure Notification', 'Critical alert broadcast upon MTN or Airtel connection exceptions.');
    checkChange('notifyProviderCallbackDelayed', 'Provider Callback Delayed Notification', 'Alerts operators if payment webhook has exceeded SLA window.');
    checkChange('notifyReconciliationException', 'Reconciliation Exception Notification', 'Flags settlement discrepancy between provider file and ledger.');
    checkChange('notifyVendorStatusChanged', 'Vendor Status Changed Notification', 'Alerts when vendor health changes between Active and Inactive.');
    checkChange('notifyVendorEligibilityChanged', 'Vendor Eligibility Changed Notification', 'Alerts when vendor service route matrix eligibility is toggled.');
    checkChange('notifyHighValueTransactionAlert', 'High-Value Transaction Alert Notification', 'Flags single transaction amounts exceeding configured threshold.');
    checkChange('highValueTransactionThresholdZmw', 'High-Value Transaction Threshold', 'Configures the transaction threshold above which priority alerts are generated.');

    return changes;
  }, [isEditing, settings, draftSettings]);

  const hasUnsavedChanges = pendingChanges.length > 0;

  const isFieldModified = useCallback(
    (key: keyof SystemSettingsState) => {
      if (!isEditing) return false;
      return settings[key] !== draftSettings[key];
    },
    [isEditing, settings, draftSettings]
  );

  // Check if any critical setting is in the pending changes
  const hasCriticalChanges = useMemo(() => {
    return pendingChanges.some((c) =>
      CRITICAL_KEYS.includes(c.settingKey as keyof SystemSettingsState)
    );
  }, [pendingChanges]);

  // Handle Cancel Click with Guard
  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('cancel');
      setIsDiscardModalOpen(true);
    } else {
      handleCancelEditing();
    }
  };

  // Guarded internal navigation
  const handleGuardedNavigate = (path: string) => {
    if (isEditing && hasUnsavedChanges) {
      setPendingNavigation(path);
      setIsDiscardModalOpen(true);
    } else {
      navigate(path);
    }
  };

  // Confirm Discard handler
  const handleConfirmDiscard = () => {
    const dest = pendingNavigation;
    setDraftSettings({ ...settings });
    setIsEditing(false);
    setIsDiscardModalOpen(false);
    setPendingNavigation(null);

    if (dest && dest !== 'cancel') {
      navigate(dest);
    }
  };

  const handleContinueEditing = () => {
    setIsDiscardModalOpen(false);
    setPendingNavigation(null);
  };

  // Navigation guard for browser unload and clicks outside settings container
  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore elements within settings page or modal overlays
      if (
        target.closest('#system-settings-page-container') ||
        target.closest('#discard-unsaved-modal-overlay') ||
        target.closest('#settings-confirm-modal-overlay')
      ) {
        return;
      }

      // Check if user clicked a navigation link outside (e.g. sidebar or breadcrumbs)
      const anchor = target.closest('a');
      if (anchor && anchor.href && !anchor.href.startsWith('#')) {
        const url = new URL(anchor.href, window.location.origin);
        if (url.pathname !== window.location.pathname) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(url.pathname + url.search + url.hash);
          setIsDiscardModalOpen(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isEditing, hasUnsavedChanges]);

  // Handle Save Click
  const handleSaveClick = () => {
    if (!hasUnsavedChanges) return;
    setIsConfirmModalOpen(true);
  };

  // Confirm Save handler
  const handleConfirmSave = () => {
    const nowTimeStr =
      'Today, ' +
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newAuditRecords: SettingsChangeRecord[] = pendingChanges.map((change, idx) => ({
      id: `SCH-${Date.now()}-${idx}`,
      event: `${change.settingLabel} Updated`,
      settingKey: change.settingKey,
      settingLabel: change.settingLabel,
      previousValue: change.previousValue,
      newValue: change.newValue,
      changedBy: 'Sililo Lubinda (Super Admin)',
      dateTime: nowTimeStr,
      operationalImpact: change.impactDescription,
    }));

    // Commit changes to service and storage
    systemSettingsService.saveSettings(draftSettings, newAuditRecords);

    setIsConfirmModalOpen(false);
    setIsEditing(false);
    setToastMessage('System settings saved and applied successfully.');
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div
      id="system-settings-page-container"
      className="w-full flex flex-col gap-4 sm:gap-5 px-3 sm:px-6 pt-1 pb-10 min-h-0 h-auto"
    >
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Action Bar / Edit Header: Super Admin Only badge + Edit Settings button */}
      {isEditing ? (
        <div
          id="system-settings-edit-bar"
          className="w-full min-h-[56px] bg-white border border-gray-200/90 shadow-xs rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D93AA] animate-pulse" />
              <span className="text-sm font-bold text-gray-900 tracking-tight">
                Editing System Settings
              </span>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Shield className="w-3 h-3 text-amber-600" />
              Super Admin Only
            </span>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                hasUnsavedChanges
                  ? 'bg-cyan-50 text-[#0D93AA] border border-[#0D93AA]/30'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Unsaved Changes: {pendingChanges.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-settings"
              type="button"
              onClick={handleCancelClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-500" />
              <span>Cancel</span>
            </button>

            <button
              id="btn-save-settings"
              type="button"
              disabled={!hasUnsavedChanges}
              onClick={handleSaveClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] active:bg-[#09697a] rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex items-center justify-between py-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Super Admin Only</span>
            </span>
          </div>

          <button
            id="btn-edit-settings"
            type="button"
            onClick={handleStartEditing}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] active:bg-[#09697a] rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Configure platform-wide settings"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Settings</span>
          </button>
        </div>
      )}

      {/* 3. Summary Cards (Platform Status, Launch Market, Default Currency, Time Zone) */}
      <SettingsSummaryCards
        platformStatus="Operational"
        launchMarket={settings.launchMarket}
        defaultCurrency={settings.defaultCurrency}
        timeZoneName="Africa/Lusaka"
        timeZoneAbbr="CAT"
      />

      {/* 4. Section: General Platform Settings */}
      <GeneralPlatformSettingsSection
        settings={settings}
        isEditing={isEditing}
        draftSettings={draftSettings}
        onUpdateDraft={handleUpdateDraft}
        isFieldModified={isFieldModified}
      />

      {/* 5. Section: Authentication & Session Security */}
      <AuthSessionSecuritySection
        settings={settings}
        isEditing={isEditing}
        draftSettings={draftSettings}
        onUpdateDraft={handleUpdateDraft}
        isFieldModified={isFieldModified}
      />

      {/* 6. Section: Wallet & Withdrawal Controls */}
      <WalletWithdrawalControlsSection
        settings={settings}
        isEditing={isEditing}
        draftSettings={draftSettings}
        onUpdateDraft={handleUpdateDraft}
        isFieldModified={isFieldModified}
        onNavigate={handleGuardedNavigate}
      />

      {/* 7. Section: Transaction & Reconciliation Controls */}
      <TransactionReconciliationSection
        settings={settings}
        isEditing={isEditing}
        draftSettings={draftSettings}
        onUpdateDraft={handleUpdateDraft}
        isFieldModified={isFieldModified}
        onNavigate={handleGuardedNavigate}
      />

      {/* 8. Section: Notification Rules */}
      <NotificationRulesSection
        settings={settings}
        isEditing={isEditing}
        draftSettings={draftSettings}
        onUpdateDraft={handleUpdateDraft}
        isFieldModified={isFieldModified}
        onNavigate={handleGuardedNavigate}
      />

      {/* 9. Section: Module-Specific Settings (Separation of Concerns) */}
      <ModuleSpecificSettingsSection />

      {/* 10. Section: Settings Change History Table */}
      <SettingsChangeHistoryTable history={history} />

      {/* Confirmation Modal */}
      <SettingsConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        pendingChanges={pendingChanges}
        hasCriticalChanges={hasCriticalChanges}
      />

      {/* Discard Unsaved Changes Modal */}
      <DiscardUnsavedChangesModal
        isOpen={isDiscardModalOpen}
        onContinueEditing={handleContinueEditing}
        onDiscardChanges={handleConfirmDiscard}
      />
    </div>
  );
};
export default SystemSettingsPage;

