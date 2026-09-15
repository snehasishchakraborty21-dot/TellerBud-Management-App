export interface SystemSettingsState {
  // General Platform Settings
  platformName: string; // locked
  launchMarket: string; // locked
  countryCallingCode: string; // locked
  defaultCurrency: string; // locked
  timeZone: string; // locked
  defaultLanguage: string; // editable: English | French | Swahili
  dateFormat: string; // editable: DD MMM YYYY | YYYY-MM-DD | DD/MM/YYYY | MM/DD/YYYY
  timeFormat: string; // editable: 12-hour | 24-hour

  // Authentication & Session Security
  customerAuthMethod: string; // locked: Phone Number and 4-digit Passcode
  mandatorySecurityQuestions: number; // locked: 3
  maxFailedSignInAttempts: number; // editable: e.g. 5 (3-10)
  tempAccountLockDurationMinutes: number; // editable: e.g. 30 (15, 30, 60, 120)
  adminSessionTimeoutMinutes: number; // editable: e.g. 30 (15, 30, 60, 120)
  reauthForCriticalActions: boolean; // editable: true / false

  // Wallet & Withdrawal Controls
  walletCreditPolicy: string; // locked: Credit only after provider verification
  withdrawalReviewMethod: string; // locked: Manual Super Admin Approval
  pendingWithdrawalFunds: string; // locked: Reserved
  customerCancellationDuringPendingReview: boolean; // editable: true / false
  supportedWithdrawalProviders: string[]; // locked: ['MTN Mobile Money', 'Airtel Money']

  // Transaction & Reconciliation Controls
  doubleEntryLedgerPosting: boolean; // locked: true
  duplicateCallbackProtection: boolean; // editable: true / false
  providerSignatureVerification: boolean; // editable: true / false
  automatedReconciliation: boolean; // editable: true / false
  reconciliationSchedule: string; // editable: 'Daily at 23:59 CAT' | 'Daily at 00:00 CAT' | 'Twice Daily (12:00 & 23:59 CAT)'
  reversalProtection: boolean; // editable: true / false
  cashDeliveryStatus: string; // read-only: Coming Soon — Phase 1 Disabled

  // Notification Rules
  notifyCustomerWithdrawalSubmitted: boolean; // editable
  notifyWithdrawalStatusChanged: boolean; // editable
  notifyProviderApiFailure: boolean; // editable
  notifyProviderCallbackDelayed: boolean; // editable
  notifyReconciliationException: boolean; // editable
  notifyVendorStatusChanged: boolean; // editable
  notifyVendorEligibilityChanged: boolean; // editable
  notifyHighValueTransactionAlert: boolean; // editable
  highValueTransactionThresholdZmw: number | null; // editable: number | null (Not Configured)
  inAppAdminNotifications: boolean; // locked: true
  autoMarkReadOnDetailsOpened: boolean; // locked: true
}

export interface SettingsChangeRecord {
  id: string;
  event: string;
  settingKey: keyof SystemSettingsState | string;
  settingLabel: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
  dateTime: string;
  operationalImpact: string;
}

export interface SettingsChangeImpact {
  settingKey: string;
  settingLabel: string;
  previousValue: string;
  newValue: string;
  impactDescription: string;
}
