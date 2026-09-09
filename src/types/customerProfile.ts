import { CustomerRecord } from './customer';

export type CustomerProfileTab =
  | 'overview'
  | 'requests'
  | 'transactions'
  | 'wallet'
  | 'locations'
  | 'security';

export interface CustomerFinancialSummary {
  walletBalance: number;
  availableBalance: number;
  reservedFunds: number;
  pendingWithdrawalAmount: number;
  pendingWithdrawalsCount: number;
  activeRequestsCount: number;
  totalFundsAdded: number;
  totalFundsWithdrawn: number;
}

export interface CustomerSavedLocation {
  id: string;
  name: string;
  street: string;
  city: string;
  province: string;
  country: string;
  source: string;
  dateAdded: string;
  lastUsed: string;
  isDefault: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface CustomerWalletActivity {
  id: string;
  reference: string;
  dateTime: string;
  activityType: 'Funding' | 'Withdrawal' | 'Pickup Reservation' | 'Service Fee' | 'Refund';
  description: string;
  credit: number | null;
  debit: number | null;
  resultingBalance: number;
  status: 'Posted' | 'Pending';
  relatedReference?: string;
}

export interface CustomerSecurityState {
  phoneVerificationStatus: string;
  passcodeConfigured: boolean;
  securityQuestionsSummary: string;
  lastPasscodeChange: string;
  hasActiveRecoveryCase: boolean;
  recoveryCaseId?: string;
  recoveryStatusText: string;
  lastRecoveryActivity: string;
  failedAttemptsText: string;
}

export interface CustomerAuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  reason: string;
  customerId: string;
  customerName: string;
}

export interface CustomerProfileData {
  customer: CustomerRecord;
  financials: CustomerFinancialSummary;
  nrcMasked: string;
  nrcFull: string;
  identityVerificationStatus: string;
  selfieUrl?: string;
  lastSignIn: string;
  locations: CustomerSavedLocation[];
  walletActivities: CustomerWalletActivity[];
  security: CustomerSecurityState;
}
