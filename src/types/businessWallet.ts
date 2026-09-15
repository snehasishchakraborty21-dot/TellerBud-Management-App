export type BusinessWalletState = 'Active' | 'Pending' | 'Suspended';

export type BusinessWalletHealth =
  | 'Healthy'
  | 'Low Balance'
  | 'Funds Reserved'
  | 'Needs Review';

export interface BusinessGlobalWallet {
  id: string; // Internal id
  businessId: string; // e.g. 'BIZ-CHI-001'
  businessName: string; // e.g. 'Chipata Eastern Financial Agency'
  businessInitials: string; // e.g. 'CE'
  walletId: string; // e.g. 'TB-BWL-1001'
  ownerName: string; // e.g. 'Aliness Phiri'
  ownerId: string; // e.g. 'USR-BO-007'
  postedBalance: number; // e.g. 0.00
  availableBalance: number; // e.g. 0.00
  reservedFunds: number; // e.g. 0.00
  health: BusinessWalletHealth;
  state: BusinessWalletState;
  updatedAt: string; // ISO timestamp
}

export type BalanceRangeFilter =
  | 'ALL'
  | '0-10000'
  | '10001-50000'
  | '50001-100000'
  | 'above-100000';

export interface BusinessWalletFilters {
  search: string;
  state: BusinessWalletState | 'ALL';
  balanceRange: BalanceRangeFilter;
  updatedFrom: string;
  updatedTo: string;
  kpiFilter: 'ALL' | 'TOTAL_BALANCE' | 'AVAILABLE' | 'RESERVED' | 'NEEDS_REVIEW';
}

export type BusinessWalletSortField =
  | 'businessName'
  | 'ownerName'
  | 'postedBalance'
  | 'availableBalance'
  | 'reservedFunds'
  | 'state'
  | 'updatedAt';

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
