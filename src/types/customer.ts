export type CustomerAccountStatus = 'Active' | 'Pending' | 'Suspended';

export type CustomerQuickFilter =
  | 'ALL'
  | 'ACTIVE_ACCOUNTS'
  | 'ACTIVE_REQUESTS'
  | 'PENDING_WITHDRAWALS'
  | 'RECOVERY_SUPPORT';

export interface CustomerRecord {
  id: string; // e.g. 'TB-CUS-1052'
  name: string; // e.g. 'Mwamba Mulenga'
  phone: string; // e.g. '+260 97 778 9012'
  avatarUrl?: string;
  avatarInitials: string;
  accountStatus: CustomerAccountStatus;
  walletBalance: number; // in ZMW
  activeRequestsCount: number;
  pendingWithdrawalsCount: number;
  hasRecoverySupport: boolean;
  recoveryCaseTitle?: string;
  lastActivity: string; // e.g. 'Today, 11:52 AM'
  lastActivityTimestamp: string; // ISO string for sorting
  registeredDate: string; // e.g. '14 Jan 2025'
  registeredDateIso: string; // '2025-01-14' for date filtering
  city: string; // e.g. 'Lusaka'
}

export interface CustomerSummary {
  totalCustomers: number;
  activeAccounts: number;
  activeRequests: number;
  pendingWithdrawals: number;
  recoverySupport: number;
}

export interface CustomerFilters {
  search: string;
  quickFilter: CustomerQuickFilter;
  accountStatus: CustomerAccountStatus | 'ALL';
  requestState: 'ALL' | 'HAS_ACTIVE' | 'NO_ACTIVE';
  withdrawalState: 'ALL' | 'HAS_PENDING' | 'NO_PENDING';
  fromDate: string;
  toDate: string;
}

export type CustomerSortField =
  | 'name'
  | 'walletBalance'
  | 'activeRequestsCount'
  | 'pendingWithdrawalsCount'
  | 'lastActivityTimestamp'
  | 'registeredDateIso';

export type CustomerSortDirection = 'asc' | 'desc';
