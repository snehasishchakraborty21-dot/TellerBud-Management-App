export type BusinessWalletState = 'Active' | 'Pending' | 'Suspended';

export type BusinessWalletHealth =
  | 'Healthy'
  | 'Low Balance'
  | 'Funds Reserved'
  | 'Needs Review';

export interface BusinessGlobalWallet {
  id: string; // Internal id
  businessId: string; // e.g. 'TB-BIZ-000001'
  businessName: string; // e.g. 'Lusaka Central Express Agency'
  businessInitials: string; // e.g. 'LC'
  walletId: string; // e.g. 'TB-BWL-000002'
  ownerName: string; // e.g. 'Chileshe Mwamba'
  ownerId: string; // e.g. 'USR-BO-001'
  postedBalance: number; // e.g. 164350.00
  availableBalance: number; // e.g. 145900.00
  reservedFunds: number; // e.g. 18450.00
  health: BusinessWalletHealth;
  state: BusinessWalletState;
  updatedAt: string; // ISO timestamp
  createdAt?: string; // Registration timestamp e.g. '2023-01-14T09:00:00.000Z'
  registeredDateIso?: string; // '2023-01-14'
}

export type BalanceRangeFilter =
  | 'ALL'
  | '0-10000'
  | '10001-50000'
  | '50001-100000'
  | 'above-100000';

export interface BusinessWalletFilters {
  search?: string;
  state: BusinessWalletState | 'ALL';
  balanceRange: BalanceRangeFilter;
  updatedFrom: string;
  updatedTo: string;
  kpiFilter: 'ALL' | 'TOTAL_BALANCE' | 'AVAILABLE' | 'RESERVED' | 'NEEDS_REVIEW';
}

export type BusinessWalletSortField =
  | 'businessName'
  | 'businessId'
  | 'ownerName'
  | 'postedBalance'
  | 'walletId'
  | 'availableBalance'
  | 'reservedFunds'
  | 'state'
  | 'updatedAt'
  | 'createdAt'
  | 'registeredDateIso';

export type BusinessWalletSortDirection = 'asc' | 'desc';

export interface BusinessWalletSummary {
  totalWallets: number;
  totalWalletBalance: number;
  totalAvailableBalance: number;
  totalReservedFunds: number;
  walletsNeedingReview: number;
}

export type BusinessWalletDetailTab =
  | 'overview'
  | 'ledger'
  | 'reservations'
  | 'funding-requests'
  | 'agents';

export interface BusinessWalletReservation {
  id: string;
  reference: string;
  purpose: string;
  amount: number;
  status: 'Active' | 'Released' | 'Completed';
  allocatedTo: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface BusinessWalletLedgerEntry {
  id: string;
  reference: string;
  type: 'Credit' | 'Debit' | 'Hold Memo';
  date: string;
  timestamp: string;
  amount: number;
  resultingBalance: number;
  description: string;
  counterparty: string;
  actor: string;
  actorId: string;
}

export interface BusinessAgentRecord {
  id: string;
  agentId: string;
  name: string;
  mobileNumber: string; // All digits visible to authorised admin
  status: 'Online' | 'Offline';
  lastActive: string;
  assignedTerminal: string;
  currentFloat: number;
}

export interface BusinessAgentFundingRequest {
  id: string;
  reference: string;
  agentName: string;
  agentId: string;
  agentPhone: string;
  submittedAt: string;
  status: 'Pending Review' | 'Approved' | 'Dispatched' | 'Rejected';
  currentFloat: number;
  // NOTE: Per strict requirement, NO requested amount and NO custom message
}

export interface BusinessWalletActivity {
  lastActivityTime: string;
  activityType: string;
  transactionReference: string;
  actingUser: string;
  actingUserId: string;
}
