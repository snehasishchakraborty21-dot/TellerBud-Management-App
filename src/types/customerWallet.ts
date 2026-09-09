export type WalletHealthStatus = 'Healthy' | 'Funds Reserved' | 'Review Required';

export type WalletAccountState = 'Active' | 'Pending' | 'Suspended';

export type ReservationStateFilter = 'ALL' | 'RESERVED' | 'NONE';

export type BalanceRangeFilter = 'ALL' | 'UNDER_5K' | '5K_15K' | '15K_30K' | 'OVER_30K';

export type CustomerWalletSortField =
  | 'customer'
  | 'walletBalance'
  | 'availableBalance'
  | 'reservedFunds'
  | 'pendingWithdrawal'
  | 'lastUpdated';

export type CustomerWalletSortDirection = 'asc' | 'desc';

export interface CustomerWalletRecord {
  walletId: string; // e.g. 'TB-WAL-1021'
  customerId: string; // e.g. 'TB-CUS-1021'
  customerName: string; // e.g. 'Bupe Chileshe'
  customerInitials: string; // e.g. 'BC'
  customerPhone: string; // e.g. '+260 96 223 5588'
  customerPhoneMasked: string; // e.g. '+260 96 ••• 5588'
  walletBalance: number; // Posted ledger balance
  availableBalance: number; // walletBalance - reservedFunds (never negative)
  reservedFunds: number; // Active reserved funds
  pendingWithdrawalAmount: number | null; // e.g. 7200.0 or null
  pendingWithdrawalReference?: string;
  walletHealth: WalletHealthStatus;
  walletState: WalletAccountState;
  hasActiveReservation: boolean;
  lastUpdated: string; // e.g. 'Today, 09:55 AM'
  lastUpdatedTimestamp: string; // ISO string for sorting / filtering
  reviewReason?: string; // Reason when walletHealth is 'Review Required'
  city?: string;
}

export interface CustomerWalletSummary {
  totalWallets: number;
  totalWalletBalance: number;
  totalAvailableBalance: number;
  totalReservedFunds: number;
  walletsNeedingReview: number;
}

export interface CustomerWalletFilters {
  search: string;
  walletState: WalletAccountState | 'ALL';
  reservationState: ReservationStateFilter;
  balanceRange: BalanceRangeFilter;
  updatedFrom: string;
  updatedTo: string;
  kpiFilter?: 'ALL' | 'AVAILABLE' | 'RESERVED' | 'REVIEW';
}

// ----------------------------------------------------------------------------
// Customer Wallet Details: Reservations, Ledger, Add Funds, Withdrawals
// ----------------------------------------------------------------------------

export type WalletReservationType = 'Customer Withdrawal' | 'Customer Pickup Request';

export type WalletReservationStatus = 'Active' | 'Consumed' | 'Released';

export interface CustomerWalletReservation {
  id: string;
  reference: string; // e.g. 'TB-RES-1052-01'
  walletId: string;
  customerId: string;
  reservationType: WalletReservationType;
  relatedReference: string; // e.g. 'TB-WDR-8807' or 'TB-REQ-1052'
  originalAmount: number;
  remainingAmount: number; // Active reserved amount
  status: WalletReservationStatus;
  createdAt: string; // e.g. '31 Aug 2026, 05:15 AM'
  createdAtTimestamp: string;
  releasedOrConsumedAt?: string;
  notes?: string;
}

export type WalletLedgerEntryType =
  | 'Add Funds Credit'
  | 'Withdrawal Debit'
  | 'Reservation Created'
  | 'Reservation Released'
  | 'Transaction Charge'
  | 'Reversal Credit'
  | 'Compensating Entry';

export interface CustomerWalletLedgerEntry {
  id: string;
  reference: string; // e.g. 'TB-LED-1052-01'
  walletId: string;
  customerId: string;
  dateTime: string;
  timestamp: string;
  entryType: WalletLedgerEntryType;
  source: string; // e.g. 'MTN MoMo Gateway', 'Airtel Money Gateway', 'Customer Withdrawal Core', 'Pickup Cash Outflow'
  credit: number | null;
  debit: number | null;
  balanceAfter: number; // Chronologically reconciled balance
  relatedReference: string; // e.g. 'TB-WDR-8807', 'TB-FND-1052-01', 'TB-REQ-1052'
  status: 'Posted';
  description: string;
}

export type AddFundsStatus =
  | 'Initiated'
  | 'Pending'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Expired'
  | 'Reversed';

export interface CustomerWalletAddFundsTimelineStep {
  step: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'failed';
}

export interface CustomerWalletAddFundsRecord {
  id: string;
  fundingReference: string; // e.g. 'TB-FND-1052-01'
  walletId: string;
  customerId: string;
  initiatedAt: string;
  initiatedTimestamp: string;
  mno: 'MTN Mobile Money' | 'Airtel Money';
  maskedMobileNumber: string;
  amount: number;
  providerReference: string; // e.g. 'MTN-REF-9021841'
  providerStatus: AddFundsStatus;
  walletCreditReference: string | null; // e.g. 'TB-LED-1052-01'
  lastUpdated: string;
  lastUpdatedTimestamp: string;
  timeline: CustomerWalletAddFundsTimelineStep[];
}

export type CustomerWithdrawalStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Processing'
  | 'Paid'
  | 'Rejected'
  | 'Cancelled';

export interface CustomerWalletWithdrawalRecord {
  id: string;
  withdrawalReference: string; // e.g. 'TB-WDR-8807'
  walletId: string;
  customerId: string;
  requestedAt: string;
  requestedTimestamp: string;
  amount: number;
  mno: 'MTN Mobile Money' | 'Airtel Money';
  maskedPayoutNumber: string;
  reservationReference: string; // e.g. 'TB-RES-1052-01'
  reservedAmount: number;
  status: CustomerWithdrawalStatus;
  lastUpdated: string;
  lastUpdatedTimestamp: string;
}

