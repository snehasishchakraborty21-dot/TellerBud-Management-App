import { SystemSettingsState, SettingsChangeRecord } from '../types/settings';

export const INITIAL_SYSTEM_SETTINGS: SystemSettingsState = {
  // General Platform Settings
  platformName: 'TellerBud',
  launchMarket: 'Zambia',
  countryCallingCode: '+260',
  defaultCurrency: 'ZMW',
  timeZone: 'Africa/Lusaka (CAT)',
  defaultLanguage: 'English',
  dateFormat: 'DD MMM YYYY',
  timeFormat: '12-hour',

  // Authentication & Session Security
  customerAuthMethod: 'Phone Number and 4-digit Passcode',
  mandatorySecurityQuestions: 3,
  maxFailedSignInAttempts: 5,
  tempAccountLockDurationMinutes: 30,
  adminSessionTimeoutMinutes: 30,
  reauthForCriticalActions: true,

  // Wallet & Withdrawal Controls
  walletCreditPolicy: 'Credit only after provider verification',
  withdrawalReviewMethod: 'Manual Super Admin Approval',
  pendingWithdrawalFunds: 'Reserved',
  customerCancellationDuringPendingReview: true,
  supportedWithdrawalProviders: ['MTN Mobile Money', 'Airtel Money'],

  // Transaction & Reconciliation Controls
  doubleEntryLedgerPosting: true,
  duplicateCallbackProtection: true,
  providerSignatureVerification: true,
  automatedReconciliation: true,
  reconciliationSchedule: 'Daily at 23:59 CAT',
  reversalProtection: true,
  cashDeliveryStatus: 'Coming Soon — Phase 1 Disabled',

  // Notification Rules
  notifyCustomerWithdrawalSubmitted: true,
  notifyWithdrawalStatusChanged: true,
  notifyProviderApiFailure: true,
  notifyProviderCallbackDelayed: true,
  notifyReconciliationException: true,
  notifyVendorStatusChanged: true,
  notifyVendorEligibilityChanged: true,
  notifyHighValueTransactionAlert: false,
  highValueTransactionThresholdZmw: null,
  inAppAdminNotifications: true,
  autoMarkReadOnDetailsOpened: true,
};

export const INITIAL_SETTINGS_HISTORY: SettingsChangeRecord[] = [
  {
    id: 'SCH-010',
    event: 'Reconciliation Schedule Updated',
    settingKey: 'reconciliationSchedule',
    settingLabel: 'Reconciliation Schedule',
    previousValue: 'Daily at 23:00 CAT',
    newValue: 'Daily at 23:59 CAT',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Today, 10:45 AM',
    operationalImpact: 'End-of-day bank reconciliation timing shifted to capture late midnight settlement windows.',
  },
  {
    id: 'SCH-009',
    event: 'Admin Session Timeout Updated',
    settingKey: 'adminSessionTimeoutMinutes',
    settingLabel: 'Admin Session Timeout',
    previousValue: '15 minutes',
    newValue: '30 minutes',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Yesterday, 04:15 PM',
    operationalImpact: 'Idle admin portal session duration extended to balance security posture with operator efficiency.',
  },
  {
    id: 'SCH-008',
    event: 'Provider Signature Verification Enabled',
    settingKey: 'providerSignatureVerification',
    settingLabel: 'Provider Signature Verification',
    previousValue: 'Disabled',
    newValue: 'Enabled',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Yesterday, 02:30 PM',
    operationalImpact: 'Enforced HMAC SHA-256 header validation across all mobile money inbound webhooks.',
  },
  {
    id: 'SCH-007',
    event: 'Customer Cancellation Rule Updated',
    settingKey: 'customerCancellationDuringPendingReview',
    settingLabel: 'Customer Cancellation',
    previousValue: 'Disallowed',
    newValue: 'Allowed during Pending Review',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Sep 11, 2026, 11:20 AM',
    operationalImpact: 'Customers can now voluntarily cancel cash withdrawal requests before an admin begins review.',
  },
  {
    id: 'SCH-006',
    event: 'High-Value Transaction Alert Set to Disabled',
    settingKey: 'notifyHighValueTransactionAlert',
    settingLabel: 'High-Value Transaction Alert',
    previousValue: 'Not Configured',
    newValue: 'Disabled — Pending Threshold',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Sep 10, 2026, 09:15 AM',
    operationalImpact: 'High-value threshold review initiated; notification rule remains disabled until threshold is approved.',
  },
  {
    id: 'SCH-005',
    event: 'Temporary Account Lock Duration Updated',
    settingKey: 'tempAccountLockDurationMinutes',
    settingLabel: 'Account Lock Duration',
    previousValue: '15 minutes',
    newValue: '30 minutes',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Sep 08, 2026, 03:40 PM',
    operationalImpact: 'Increased brute-force throttling threshold duration following multiple failed passcode attempts.',
  },
  {
    id: 'SCH-004',
    event: 'Duplicate Callback Protection Enabled',
    settingKey: 'duplicateCallbackProtection',
    settingLabel: 'Duplicate Callback Protection',
    previousValue: 'Disabled',
    newValue: 'Enabled',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Sep 06, 2026, 01:10 PM',
    operationalImpact: 'Idempotency validation activated on all provider transaction webhooks to reject replay events.',
  },
  {
    id: 'SCH-003',
    event: 'Vendor Eligibility Notification Rule Updated',
    settingKey: 'notifyVendorEligibilityChanged',
    settingLabel: 'Vendor Eligibility Changed Notification',
    previousValue: 'Disabled',
    newValue: 'Enabled',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Sep 04, 2026, 05:00 PM',
    operationalImpact: 'Automated administrative broadcast enabled whenever a vendor service route is toggled in matrix.',
  },
  {
    id: 'SCH-002',
    event: 'Reversal Protection Enabled',
    settingKey: 'reversalProtection',
    settingLabel: 'Reversal Protection',
    previousValue: 'Disabled',
    newValue: 'Enabled',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Sep 02, 2026, 11:30 AM',
    operationalImpact: 'Direct debits prevented from retroactive rollback without dual-authorization workflow.',
  },
  {
    id: 'SCH-001',
    event: 'Initial Platform Launch Configuration',
    settingKey: 'platformName',
    settingLabel: 'System Baseline Setup',
    previousValue: 'Draft Defaults',
    newValue: 'Production Settings Baseline',
    changedBy: 'Sililo Lubinda (Super Admin)',
    dateTime: 'Sep 01, 2026, 08:00 AM',
    operationalImpact: 'Zambia market launch baseline configured with ZMW currency, CAT timezone, and double-entry ledger.',
  },
];

const SETTINGS_STORAGE_KEY = 'tellerbud_system_settings_v1';
const HISTORY_STORAGE_KEY = 'tellerbud_settings_history_v1';

class SystemSettingsService {
  private settings: SystemSettingsState;
  private history: SettingsChangeRecord[];
  private listeners: Array<() => void> = [];

  constructor() {
    this.settings = this.loadSettings();
    this.history = this.loadHistory();
  }

  private loadSettings(): SystemSettingsState {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If legacy high priority key was stored, reset to unconfigured high value defaults
        if ('notifyHighPriorityTransactionAlert' in parsed) {
          delete parsed.notifyHighPriorityTransactionAlert;
        }
        return {
          ...INITIAL_SYSTEM_SETTINGS,
          ...parsed,
          highValueTransactionThresholdZmw:
            typeof parsed.highValueTransactionThresholdZmw === 'number'
              ? parsed.highValueTransactionThresholdZmw
              : null,
          notifyHighValueTransactionAlert:
            typeof parsed.highValueTransactionThresholdZmw === 'number' &&
            parsed.highValueTransactionThresholdZmw > 0
              ? Boolean(parsed.notifyHighValueTransactionAlert)
              : false,
        };
      }
    } catch (e) {
      console.error('Failed to load system settings from localStorage:', e);
    }
    return { ...INITIAL_SYSTEM_SETTINGS };
  }

  private loadHistory(): SettingsChangeRecord[] {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const records: SettingsChangeRecord[] = JSON.parse(stored);
        return records.map((rec) => {
          if (rec.id === 'SCH-006') {
            return {
              ...rec,
              event: 'High-Value Transaction Alert Set to Disabled',
              previousValue: 'Not Configured',
              newValue: 'Disabled — Pending Threshold',
            };
          }
          return rec;
        });
      }
    } catch (e) {
      console.error('Failed to load settings history from localStorage:', e);
    }
    return [...INITIAL_SETTINGS_HISTORY];
  }

  public getSettings(): SystemSettingsState {
    return { ...this.settings };
  }

  public getHistory(): SettingsChangeRecord[] {
    return [...this.history];
  }

  public saveSettings(
    newSettings: SystemSettingsState,
    newHistoryRecords: SettingsChangeRecord[]
  ): void {
    this.settings = { ...newSettings };
    this.history = [...newHistoryRecords, ...this.history];

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.error('Failed to persist settings:', e);
    }

    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const systemSettingsService = new SystemSettingsService();
