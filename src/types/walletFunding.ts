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
  maskedMobileNumber: string; // e.g. '+260 97 ••• 9012'
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
