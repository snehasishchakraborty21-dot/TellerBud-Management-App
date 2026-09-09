export type BusinessAccountStatus = 'Active' | 'Pending' | 'Suspended';
export type BusinessWalletState = 'Active' | 'Low Balance' | 'Suspended';

export interface ContextualAgent {
  id: string; // e.g. 'TB-AGT-1024'
  name: string; // e.g. 'Kelvin Phiri'
  phoneMasked?: string; // e.g. '+260 97 ••• 1024'
  availability: 'Available' | 'Assigned' | 'Offline';
  assignment?: string; // e.g. 'Pickup' or 'Unassigned'
  lastActivity?: string; // e.g. 'Today, 11:15 AM'
  totalCompletedTransactions?: number;
}

export interface WalletTopUpItem {
  id: string;
  reference: string;
  agentName: string;
  agentId: string;
  submittedAt: string;
  updatedAt: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  standardMessage: string; // "Please top up the wallet to allow for transactions."
}

export interface WalletLedgerEntry {
  id: string;
  reference: string;
  timestamp: string;
  transactionType: string; // e.g. 'Customer Withdrawal Settlement', 'Wallet Float Top-up', 'Cash Liquidity Inbound'
  amount: number; // positive or negative
  runningBalance: number;
  status: 'Completed' | 'Pending' | 'Reversed';
}

export interface BusinessActivityLog {
  id: string;
  reference: string; // e.g. 'ACT-ZM-10928'
  activityType: string; // e.g. 'Account Created', 'Status Change', 'Wallet Float Allocation', 'Password Reset Requested'
  actor: string; // e.g. 'Sililo Lubinda (Admin)', 'Chileshe Mwamba (Owner)', 'System Bot'
  timestamp: string;
  result: 'Success' | 'Approved' | 'Logged' | 'Updated';
  relatedRecord: string; // e.g. 'BIZ-LUS-001', 'USR-BO-001', 'TB-TOP-4011'
  details?: string;
}

export interface PendingTopUpRequest {
  id: string;
  reference: string;
  agentName: string;
  agentId: string;
  submittedAt: string;
  status: 'Pending Review';
  standardMessage: string; // "Please top up the wallet to allow for transactions."
}

export interface BusinessRecentActivity {
  lastActivity: string;
  reference: string;
  activityType: string;
  actor: string;
  timestamp: string;
}

export interface BusinessRecord {
  id: string; // e.g. 'BIZ-LUS-001'
  name: string; // e.g. 'Lusaka Central Express Agency'
  registrationNumber: string; // e.g. 'PACRA-2023-884920'
  businessType: string;
  logoInitials: string;

  // Business Owner details
  ownerName: string; // e.g. 'Chileshe Mwamba'
  ownerId: string; // e.g. 'USR-BO-001'
  ownerPhone: string; // Raw phone e.g. '+260 97 712 3456'
  ownerPhoneMasked: string; // Masked phone e.g. '+260 97 ••• 3456'
  ownerEmail: string;
  ownerUsername?: string; // e.g. 'chileshe.mwamba'
  ownerAccountStatus: 'Active' | 'Pending' | 'Suspended';
  lastSignIn?: string; // e.g. 'Today, 09:42 AM' or 'Pending First Sign-In'
  firstLoginPasswordChangeStatus?: 'Pending First Sign-In' | 'Completed';
  temporaryPasswordStatus?: 'Temporary Password Issued - Change Required on First Login' | 'Permanent Password Active';
  passwordChangeRequired?: boolean;
  accountCreatedAt?: string;
  lastAccountUpdate?: string;

  // Location
  city: string; // e.g. 'Lusaka'
  province: string; // e.g. 'Lusaka Province'
  country: 'Zambia';
  streetAddress: string;

  // Operational metrics
  associatedAgents: number; // Count of registered agents
  agentsOnline: number; // Count of online agents
  agentsOffline: number; // associatedAgents - agentsOnline
  agentsAssigned: number;
  agentsAvailable: number;
  contextualAgents: ContextualAgent[];

  // Shared Wallet Balance: Available Balance + Reserved Funds = Shared Wallet Balance
  sharedWalletBalance: number; // Formatted ZMW
  availableBalance: number;
  reservedFunds: number;
  walletState: BusinessWalletState;
  lastWalletActivity: string;
  recentLedgerEntries?: WalletLedgerEntry[];

  // Pending & historical top-up requests
  pendingTopUps: number; // Count of pending top-up requests
  pendingTopUpRequests: PendingTopUpRequest[];
  walletTopUpsList?: WalletTopUpItem[];

  // Activity & Audit
  lastActivity: string; // Relative timestamp e.g. 'Today, 11:20 AM'
  lastActivityIso: string; // ISO date for sorting
  recentActivity: BusinessRecentActivity;
  activityLogs?: BusinessActivityLog[];

  // Registration
  registeredDate: string; // Formatted date e.g. '14 Jan 2023'
  registeredDateIso: string; // ISO date e.g. '2023-01-14'

  // Account information
  operatingCurrency: 'ZMW';
  timeZone: 'Africa/Lusaka (CAT)';
  status: BusinessAccountStatus;
}

export interface BusinessSummary {
  totalBusinesses: number;
  activeBusinesses: number;
  associatedAgents: number;
  agentsOnline: number;
  pendingTopUps: number;
}

export type BusinessQuickFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'AGENTS'
  | 'ONLINE'
  | 'PENDING_TOPUPS';

export interface BusinessFilters {
  search: string;
  quickFilter: BusinessQuickFilter;
  status: BusinessAccountStatus | 'ALL';
  province: string | 'ALL';
  walletState: BusinessWalletState | 'ALL';
  fromDate: string;
  toDate: string;
}

export type BusinessSortField =
  | 'name'
  | 'associatedAgents'
  | 'sharedWalletBalance'
  | 'registeredDateIso';

export type BusinessSortDirection = 'asc' | 'desc';
