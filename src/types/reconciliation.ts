export type ReconciliationProvider = 'MTN Mobile Money' | 'Airtel Money' | 'TellerBud Ledger';

export type ReconciliationTransactionType =
  | 'Wallet Funding'
  | 'Customer Withdrawal'
  | 'Customer Transaction'
  | 'Business Wallet Transaction'
  | 'Reversal';

export type ReconciliationWalletType = 'Customer Wallet' | 'Business Global Wallet';

export type ProviderResponseStatus =
  | 'Processing'
  | 'Successful'
  | 'Failed'
  | 'Expired'
  | 'Reversed'
  | 'Awaiting Callback';

export type LedgerResultStatus =
  | 'Credited'
  | 'Debited'
  | 'Not Posted'
  | 'Hold Created'
  | 'Hold Released'
  | 'Reversal Posted';

export type ReconciliationStatus = 'Matched' | 'Pending' | 'Exception' | 'Reversed';

export interface ReconciliationRecord {
  id: string; // e.g. TB-REC-1041-02
  reconciliationRef: string;
  createdAt: string; // e.g. 'Today, 11:35 AM'
  rawDate: string; // ISO date string
  updatedAt?: string;
  transactionRef: string; // e.g. TB-FND-1041-02
  transactionType: ReconciliationTransactionType;
  holderName: string;
  customerId?: string;
  customerPhone?: string;
  businessId?: string;
  businessOwner?: string;
  ownerPhone?: string;
  walletId: string;
  walletType: ReconciliationWalletType;
  provider: ReconciliationProvider;
  amount: number;
  providerResponse: ProviderResponseStatus;
  ledgerResult: LedgerResultStatus;
  reconciliation: ReconciliationStatus;
  providerTransactionId?: string;
  channel?: string;
  exceptionReason?: string;
  apiOperation?: 'Collection' | 'Payout';
  callbackStatus?: string;
  callbackReceivedAt?: string;
  verificationAttempts?: string;
  lastProviderResponseTime?: string;
  ledgerEntryRef?: string;
  postingStatus?: string;
  postedAmount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  balanceChange?: number;
  reservationRef?: string;
  reversalRef?: string;
  expectedAmount?: number;
  providerConfirmedAmount?: string;
  ledgerPostedAmount?: number;
  amountVariance?: string;
  signatureVerification?: string;
  duplicateCallbackStatus?: string;
  reconciliationDate?: string;
}

export interface CallbackEvent {
  id: string; // CB-MTN-94012
  provider: 'MTN Mobile Money' | 'Airtel Money';
  transactionRef: string;
  eventType: string; // e.g. 'Payment Succeeded', 'Payout Completed', 'Payment Failed'
  receivedAt: string; // 'Today, 11:48 AM'
  rawDate: string;
  signatureVerified: boolean;
  processingResult: 'Processed' | 'Ignored' | 'Rejected' | 'Discarded';
  duplicateStatus: 'Original' | 'Duplicate Discarded';
  endpoint: string;
  httpStatus: number;
  ipAddress: string;
}

export interface ApiConnection {
  id: string;
  provider: 'MTN Mobile Money' | 'Airtel Money';
  collectionsApiStatus: 'Operational' | 'Degraded' | 'Offline';
  payoutApiStatus: 'Operational' | 'Degraded' | 'Offline';
  callbackEndpointStatus: 'Operational' | 'Degraded' | 'Offline';
  collectionsEndpoint: string;
  payoutEndpoint: string;
  callbackEndpoint: string;
  lastSuccessfulRequest: string;
  lastSuccessfulCallback: string;
  avgResponseTimeMs: number;
  successRate: number;
  status: 'Connected' | 'Disconnected' | 'Reconnecting';
  protocol: string;
  uptime: string;
}
