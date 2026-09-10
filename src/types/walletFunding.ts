export type FundingStatus =
  | 'Initiated'
  | 'Pending'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Expired'
  | 'Reversed';

export type FundingProvider = 'MTN Mobile Money' | 'Airtel Money';

export interface WalletFundingTimelineStep {
  step: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'failed';
}

export interface WalletFundingRecord {
  id: string;
  fundingReference: string; // e.g. 'TB-FND-1052-01'
  walletId: string; // e.g. 'TB-WAL-1052'
  customerId: string; // e.g. 'TB-CUS-1052'
  customerName: string; // e.g. 'Mwamba Mulenga'
  maskedMobileNumber: string; // e.g. '+260 96 123 9900'
  customerMobileNumber?: string; // e.g. '+260 96 123 9900'
  provider: FundingProvider;
  amount: number;
  providerReference: string; // e.g. 'MTN-TXN-4910284'
  status: FundingStatus;
  walletCreditReference: string | null; // e.g. 'TB-LED-1052-01'
  reversalCreditReference?: string | null; // e.g. 'TB-LED-1048-REV'
  initiatedAt: string; // e.g. '14 Jan 2025, 09:58 AM'
  initiatedTimestamp: string; // ISO 8601 string
  lastUpdated: string;
  lastUpdatedTimestamp: string;
  timeline: WalletFundingTimelineStep[];

  // Ledger & Balance Impact
  balanceBefore?: number;
  fundingCredit?: number;
  balanceAfter?: number;
  postedAt?: string;
  reversalDebitReference?: string | null;
  reversalDebitAmount?: number | null;
  reconciliationStatus?: 'Reconciled' | 'Compensated' | 'Pending' | 'Failed' | 'Zero Impact';

  // Provider Verification Details
  providerStatus?: string;
  verificationMethod?: string;
  callbackReceived?: string;
  backendVerificationStatus?: 'Confirmed' | 'Pending' | 'Failed' | 'Compensated';
  verificationAttempts?: number;
  lastProviderResponseTime?: string;

  // Operational Audit Details
  createdBy?: string;
  source?: string;
  country?: string;
  currency?: string;
  providerIntegration?: string;
  lastUpdatedBy?: string;
  idempotencyCheck?: string;
  duplicateCallbackCount?: number;
  reconciliationResult?: string;
}

export interface WalletFundingSummary {
  totalAttempts: number;
  completedAmount: number;
  pendingVerificationCount: number;
  failedExpiredCount: number;
  reversedCount: number;
}

export type WalletFundingKpiFilter =
  | 'ALL'
  | 'COMPLETED'
  | 'PENDING_VERIFICATION'
  | 'FAILED_EXPIRED'
  | 'REVERSED';

export interface WalletFundingFilters {
  search: string;
  provider: 'ALL' | FundingProvider;
  status: 'ALL' | FundingStatus;
  initiatedFrom: string;
  initiatedTo: string;
  kpiFilter: WalletFundingKpiFilter;
}

export type WalletFundingSortField =
  | 'initiated'
  | 'reference'
  | 'amount'
  | 'customer'
  | 'provider'
  | 'status';

export type WalletFundingSortDirection = 'asc' | 'desc';
