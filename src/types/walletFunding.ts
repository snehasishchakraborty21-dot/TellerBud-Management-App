export type FundingStatus =
  | 'Initiated'
  | 'Pending'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Expired'
  | 'Reversed';

export type FundingProvider = 'MTN Mobile Money' | 'Airtel Money';

export type FundingOwnerType = 'Customer' | 'Business';

export interface WalletFundingTimelineStep {
  step: string | number;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'failed' | 'upcoming';
  isReversal?: boolean;
}

export interface WalletFundingRecord {
  id: string;
  fundingReference: string; // e.g. 'TB-FND-1052-01'
  walletId: string; // e.g. 'TB-WAL-1052' or 'TB-WAL-BIZ-001'
  ownerType?: FundingOwnerType; // 'Customer' | 'Business'
  ownerName?: string; // e.g. 'Mwamba Mulenga' or 'Lusaka Central Express Agency'
  ownerId?: string; // e.g. 'TB-CUS-001052' or 'TB-BIZ-000001'
  ownerPhone?: string; // e.g. '+260 97 778 9012' or '+260 97 712 3456'
  customerId?: string; // e.g. 'TB-CUS-001052'
  customerName?: string; // e.g. 'Mwamba Mulenga'
  businessId?: string; // e.g. 'TB-BIZ-000001'
  businessName?: string; // e.g. 'Lusaka Central Express Agency'
  maskedMobileNumber: string; // e.g. '+260 96 ••• 9900'
  customerMobileNumber?: string; // e.g. '+260 96 123 9900'
  businessPhone?: string; // e.g. '+260 97 712 3456'
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
  reconciliationStatus?: 'Reconciled' | 'Compensated' | 'Pending' | 'Failed' | 'Zero Impact' | string;

  // Provider Verification Details
  providerStatus?: string;
  verificationMethod?: string;
  callbackReceived?: string;
  backendVerificationStatus?: 'Confirmed' | 'Pending' | 'Failed' | 'Compensated' | string;
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
  ownerType: 'ALL' | FundingOwnerType;
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
  | 'owner'
  | 'customer'
  | 'provider'
  | 'status';

export type WalletFundingSortDirection = 'asc' | 'desc';
