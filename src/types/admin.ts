export type CountryCode = 'ZM';
export type CurrencyCode = 'ZMW';

export type CustomerTransactionType = 'Deposit' | 'Withdrawal' | 'Purchase';

export type ServiceMode = 'Pickup';

export type ApprovedMNO = 'MTN' | 'Airtel' | 'Zamtel';
export type ApprovedBank = 'Zanaco' | 'FNB' | 'INDO' | 'Stanbic' | 'Access';
export type ApprovedVendor = ApprovedMNO | ApprovedBank;

export type PickupRequestStatus = 
  | 'Agent Confirmed'
  | 'Matching'
  | 'Active Service'
  | 'Ready for Pickup'
  | 'Finding an Agent'
  | 'Pending Confirmation'
  | 'No Agent Available'
  | 'Completed'
  | 'Cancelled';

export interface PickupRequest {
  id: string; // e.g. 'TB-REQ-1048'
  customerId?: string; // e.g. 'TB-CUS-1048'
  customerName: string;
  customerPhone: string;
  type: CustomerTransactionType;
  vendor: ApprovedVendor;
  amount: number; // in ZMW
  status: PickupRequestStatus;
  agentName: string | null;
  agentId?: string; // e.g. 'TB-AGT-1024'
  agentPhone?: string;
  businessName?: string; // e.g. 'Lusaka Central Express Agency'
  businessId?: string;
  serviceTime?: string; // e.g. 'Now' or 'Scheduled - Today, 02:30 PM'
  isScheduled?: boolean;
  pickupLocation?: string;
  createdAt: string; // time formatted e.g. 'Today, 11:42 AM'
  timestamp: string; // ISO string or human formatted
  notes?: string;
}

export interface OperationalMetrics {
  activePickupRequests: number; // 18
  matchingCount: number; // 6
  pendingWithdrawals: number; // 9
  businessOwnerCashFloat: number; // 5
  agentsOnline: number; // 42
  apiFundingExceptions: number; // 3
}

export type RequiresAttentionType = 
  | 'withdrawal_review'
  | 'agent_liquidity'
  | 'api_funding_exception'
  | 'unassigned_pickup';

export interface RequiresAttentionItem {
  id: string;
  type: RequiresAttentionType;
  label: string;
  count: number;
  badgeLabel?: string;
  targetRoute?: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface AgentAvailabilitySummary {
  online: number; // 42
  assigned: number; // 17
  available: number; // 25
  offline: number; // 13
}

export type FinancialActivityType = 
  | 'Add Funds (MTN API)'
  | 'Add Funds (Airtel API)'
  | 'Customer Withdrawal'
  | 'Business Global Wallet Funding'
  | 'Business / Agent Wallet Funding';

export type FinancialActivityStatus =
  | 'Completed'
  | 'Pending Review'
  | 'Pending'
  | 'Initiated'
  | 'Processing'
  | 'Failed'
  | 'Cancelled'
  | 'Expired'
  | 'Reversed';

export interface FinancialActivityRecord {
  id: string;
  reference: string;
  type: FinancialActivityType;
  vendor: ApprovedVendor;
  relatedEntity: string; // Person or Business Name
  entityRole: 'Customer' | 'Agent' | 'Business Owner';
  amount: number; // in ZMW
  status: FinancialActivityStatus;
  timestamp: string; // e.g. 'Today, 05:28' or '10 mins ago'
}

export interface AdminNotification {
  id: string;
  title: string;
  category: 'Operations' | 'Finance' | 'Exception' | string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  message?: string;
  priority?: 'Normal' | 'Important' | 'Urgent';
  actionRequired?: boolean;
  relatedReference?: string;
  agent?: { id?: string; name: string } | null;
  businessName?: string;
  businessId?: string;
  actionType?: string;
  createdAt?: string;
}

export interface AdminUserProfile {
  id: string;
  name: string;
  email?: string;
  role: 'TellerBud Admin';
  country: 'Zambia';
  countryCode: 'ZM';
  phonePrefix: '+260';
  avatarInitials: string;
}

// Customer Withdrawal Types
export type WithdrawalStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Processing'
  | 'Paid'
  | 'Rejected'
  | 'Cancelled';

export type WithdrawalNetwork = 'MTN Mobile Money' | 'Airtel Money';

export type WithdrawalFundsState = 'Pending' | 'Debited' | 'Released' | 'Cancelled';

export interface WithdrawalStatusHistoryItem {
  id: string;
  status: string; // e.g. 'Withdrawal Requested', 'Validation Verified', 'Pending Review', 'Approved', 'Processing', 'Paid', 'Rejected'
  actor: string; // e.g. 'Lombe Kasonde', 'TellerBud System', 'Sililo Lubinda'
  timestamp: string; // ISO string e.g. '2026-08-31T10:51:00Z'
  reason?: string; // Optional reason (e.g. for rejection)
}

export interface CustomerWalletPosition {
  postedBalance: number; // in ZMW e.g. 15450
  availableBalance: number; // in ZMW e.g. 8250 or 15450
  withdrawalAmount: number; // in ZMW e.g. 7200
  fundsState: WithdrawalFundsState;
}

export interface CustomerWithdrawal {
  id: string; // Internal unique id e.g. 'WDR-REC-001'
  reference: string; // Reference e.g. 'TB-WDR-8812'
  customerName: string;
  customerPhone: string; // formatted Zambia phone e.g. '+260 97 123 4567'
  amount: number; // in ZMW
  network: WithdrawalNetwork;
  payoutNumber: string; // formatted Zambia phone e.g. '+260 97 123 4567'
  requestedAt: string; // ISO string e.g. '2026-08-31T10:51:00Z'
  fundsState: WithdrawalFundsState;
  status: WithdrawalStatus;
  notes?: string;
  initialPostedBalance?: number; // Base posted balance for calculating wallet positions
  walletStatus?: 'Active' | 'Suspended';
  history?: WithdrawalStatusHistoryItem[];
}

export interface WithdrawalFilters {
  search: string;
  status: WithdrawalStatus | 'ALL';
  network: WithdrawalNetwork | 'ALL';
  fromDate: string; // 'YYYY-MM-DD'
  toDate: string; // 'YYYY-MM-DD'
}

export interface WithdrawalStatusSummary {
  all: number;
  pendingReview: number;
  approved: number;
  processing: number;
  paid: number;
  rejected: number;
  cancelled: number;
}

export type WithdrawalSortField = 'requestedAt' | 'amount' | 'status';
export type WithdrawalSortDirection = 'asc' | 'desc';

// Agent Cash / Float Request Types (Business Owner Scope)
export type CashFloatRequestType = 'Cash' | 'Float';

export type CashFloatStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Processing'
  | 'Fulfilled'
  | 'Rejected'
  | 'Cancelled';

export type CashFloatRequestedFrom = 'Business Owner';

export interface CashFloatStatusHistoryItem {
  id: string;
  status: string;
  actor: string;
  timestamp: string;
  reason?: string;
}

export interface CashFloatRequest {
  id: string; // e.g. 'CFR-001'
  reference: string; // e.g. 'TB-CFR-5001'
  agentName: string; // e.g. 'Kelvin Phiri'
  agentId: string; // e.g. 'TB-AGT-1024'
  agentPhone: string; // e.g. '+260 97 234 5678'
  agentAccountStatus?: string; // 'Active'
  businessName: string; // e.g. 'Lusaka Central Express Agency'
  businessAccountStatus?: string; // 'Active'
  requestedFrom: CashFloatRequestedFrom;
  requestType: CashFloatRequestType;
  amount: number; // in ZMW
  requestedAt: string; // ISO string e.g. '2026-08-31T10:45:00+02:00'
  status: CashFloatStatus;
  notes?: string;
  reason?: string;
  rejectionReason?: string;
  fulfilmentMethod?: string; // 'Manual Float Transfer' | 'Physical Cash Handover'
  fulfilledAmount?: number;
  manualReference?: string;
  internalNote?: string;
  fulfilledAt?: string;
  history?: CashFloatStatusHistoryItem[];
}

export interface CashFloatFilters {
  search: string;
  status: CashFloatStatus | 'ALL';
  requestType: CashFloatRequestType | 'ALL';
  fromDate: string; // 'YYYY-MM-DD'
  toDate: string; // 'YYYY-MM-DD'
}

export interface CashFloatStatusSummary {
  all: number;
  pendingReview: number;
  approved: number;
  processing: number;
  fulfilled: number;
  rejected: number;
  cancelled: number;
}

export type CashFloatSortField = 'requestedAt' | 'amount' | 'status';
export type CashFloatSortDirection = 'asc' | 'desc';

// ==========================================
// Agent-to-Agent Liquidity Monitoring Types
// ==========================================

export type AgentToAgentStatus =
  | 'Matching'
  | 'Agent Matched'
  | 'In Progress'
  | 'Completed'
  | 'No Agent Available'
  | 'Expired'
  | 'Cancelled';

export type AgentToAgentRequestType = 'Cash' | 'Float';

export type OfferResponseStatus =
  | 'Awaiting Response'
  | 'Accepted'
  | 'Declined'
  | 'Expired';

export interface AgentOffer {
  offerId: string;
  requestId: string;
  offeredAgentId: string;
  offeredAgentName: string;
  offeredAgentBusiness: string;
  offeredAgentPhone?: string;
  offerSentAt: string;
  offerExpiresAt: string;
  responseStatus: OfferResponseStatus;
  respondedAt?: string;
}

export interface AgentToAgentTimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  note?: string;
}

export interface AgentToAgentRequest {
  id: string;
  reference: string; // e.g. 'TB-ATL-7001'
  requestingAgentName: string;
  requestingAgentId: string;
  requestingAgentPhone: string;
  requestingAgentBusiness: string;
  requestedFrom: 'Another Agent';
  requestType: CashFloatRequestType; // 'Cash' | 'Float'
  amount: number; // in ZMW
  requestedAt: string; // ISO string
  status: AgentToAgentStatus;
  notes?: string;
  currentOfferedAgent?: {
    id: string;
    name: string;
    business: string;
    phone?: string;
  };
  matchedAgent?: {
    id: string;
    name: string;
    business: string;
    phone?: string;
    matchedAt?: string;
  };
  activeOffer?: AgentOffer;
  offers?: AgentOffer[];
  timeline: AgentToAgentTimelineEvent[];
}

export interface AgentToAgentFilters {
  search: string;
  status: AgentToAgentStatus | 'ALL';
  requestType: CashFloatRequestType | 'ALL';
  fromDate: string; // 'YYYY-MM-DD'
  toDate: string; // 'YYYY-MM-DD'
}

export interface AgentToAgentStatusSummary {
  all: number;
  matching: number;
  agentMatched: number;
  inProgress: number;
  completed: number;
  noAgentAvailable: number;
  expired: number;
  cancelled: number;
}

export type AgentToAgentSortField = 'requestedAt' | 'amount' | 'status';
export type AgentToAgentSortDirection = 'asc' | 'desc';

// ==========================================
// Walk-In Transactions Types
// ==========================================

export type WalkInTransactionStatus =
  | 'Completed'
  | 'Processing'
  | 'Pending'
  | 'Failed'
  | 'Cancelled';

export type WalkInTransactionType = 'Deposit' | 'Withdrawal' | 'Purchase';

export interface WalkInTimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  note?: string;
}

export interface WalkInTransaction {
  id: string; // e.g. 'WLK-001'
  reference: string; // e.g. 'TB-WLK-3301'
  agentName: string; // e.g. 'Natasha Zulu'
  agentId: string; // e.g. 'TB-AGT-1062'
  agentPhone: string; // e.g. '+260 97 556 7890'
  businessId: string; // e.g. 'BIZ-LUS-001'
  businessName: string; // e.g. 'Lusaka Central Express Agency'
  customerPhone: string; // e.g. '+260 97 112 3456'
  transactionType: WalkInTransactionType;
  vendor: ApprovedVendor;
  amount: number; // in ZMW
  transactionTime: string; // ISO string e.g. '2026-08-31T11:15:00+02:00'
  status: WalkInTransactionStatus;
  receiptNumber?: string;
  terminalId?: string;
  timeline: WalkInTimelineEvent[];
}

export interface WalkInFilters {
  search: string;
  transactionType: WalkInTransactionType | 'ALL';
  vendor: ApprovedVendor | 'ALL';
  status: WalkInTransactionStatus | 'ALL';
  fromDate: string; // 'YYYY-MM-DD'
  toDate: string; // 'YYYY-MM-DD'
}

export interface WalkInStatusSummary {
  all: number;
  completed: number;
  processing: number;
  pending: number;
  failed: number;
  cancelled: number;
}

export type WalkInSortField = 'transactionTime' | 'amount' | 'status';
export type WalkInSortDirection = 'asc' | 'desc';

// ==========================================
// Agent Directory Types (Business Owner & Admin)
// ==========================================

export type AgentAvailabilityStatus = 'Available' | 'On Active Request' | 'Assigned' | 'Offline';
export type AgentAssignmentType = 'Pickup' | 'Walk-In' | 'None' | 'Unassigned';
export type AgentAttendanceStatus = 'Checked In' | 'Checked Out' | 'Not Checked In' | 'No Attendance Record';

export interface AgentActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  amount?: number;
  reference?: string;
  status?: string;
}

export interface AgentRecord {
  id: string; // e.g. 'TB-AGT-1024'
  name: string; // e.g. 'Kelvin Phiri'
  phone: string; // e.g. '+260 97 234 5678'
  avatarUrl?: string;
  avatarInitials: string;
  businessId: string; // e.g. 'BIZ-LUS-001'
  businessName: string; // e.g. 'Lusaka Central Express Agency'
  businessCentre: string; // e.g. 'Lusaka Central Express Agency'
  availability: AgentAvailabilityStatus;
  assignment: AgentAssignmentType;
  attendance: AgentAttendanceStatus;
  checkInTime?: string; // e.g. '07:45 AM'
  lastActive: string; // e.g. 'Today, 11:15 AM'
  accountStatus: 'Active' | 'Pending' | 'Suspended';
  cashPosition: number; // in ZMW
  floatPosition: number; // in ZMW
  cashFloatRequestCount: number;
  walkInTransactionCount: number;
  recentActivity: AgentActivityItem[];
  joinedDate: string;
}

export interface AgentFilters {
  search: string;
  availability: AgentAvailabilityStatus | 'ALL' | 'Online';
  assignment: AgentAssignmentType | 'ALL';
  attendance: AgentAttendanceStatus | 'ALL';
}

export interface AgentStatusSummary {
  all: number;
  online: number;
  available: number;
  assigned: number;
  offline: number;
}

export type AgentSortField = 'operationalPriority' | 'name' | 'lastActive';
export type AgentSortDirection = 'asc' | 'desc';

// ==========================================
// Global Business Wallet Types
// ==========================================

export interface BusinessWallet {
  businessId: string;
  businessName: string;
  currentBalance: number; // in ZMW (Current Global Wallet Balance)
  availableBalance?: number; // optional alias for backward-compatibility
  totalBalance?: number;     // optional alias for backward-compatibility
  currency: 'ZMW';
  walletStatus: 'Active' | 'Suspended';
  lastUpdated: string;
  createdAt?: string;
}

export interface BusinessWalletLedgerEntry {
  id: string;
  reference: string;
  timestamp: string;
  type: string;
  description: string;
  direction: 'Credit' | 'Debit';
  amount: number;
  balanceAfter: number;
  category?: 'Float Funding' | 'Fee Commission' | 'Platform Fee' | 'Agent Liquidity' | string;
  ledgerEntry?: string;
  debit?: number | null;
  credit?: number | null;
  balanceBefore?: number;
  agent?: { id?: string; name: string } | null;
  status?: 'Completed' | 'Settled' | 'Reversed' | 'Posted' | 'Approved' | string;
  rawDate?: string;
  relatedReference?: string;
  relatedPath?: string;
  businessName?: string;
  businessId?: string;
  lifecycleHistory?: Array<{
    step: string;
    timestamp: string;
    status: string;
    actor?: string;
    details?: string;
  }>;
}

export type WalletLedgerTransactionType =
  | 'Funding'
  | 'Charge'
  | 'Commission'
  | 'Withdrawal'
  | 'Business Wallet Funding'
  | 'TellerBud Charge'
  | 'Approved Adjustment'
  | 'Refund'
  | 'Reversal';

export interface GlobalWalletLedgerRecord {
  id: string;
  ledgerEntry: string;
  reference: string;
  dateTime: string;
  rawDate: string; // YYYY-MM-DD
  transactionType: WalletLedgerTransactionType;
  entryType?: 'Funding' | 'Charge' | 'Commission' | 'Withdrawal';
  feeType?: GlobalWalletFeeType | string;
  initiatedByAttribution?: string;
  calculation?: string;
  agent: {
    id?: string;
    name: string;
  } | null;
  direction: 'Credit' | 'Debit';
  amount: number;
  debit: number | null;
  credit: number | null;
  balanceBefore: number;
  balanceAfter: number;
  status: 'Completed' | 'Settled' | 'Reversed' | 'Posted' | 'Approved' | 'Pending' | 'Processing';
  description: string;
  relatedReference?: string;
  relatedPath?: string;
  businessName: string;
  businessId: string;
  lifecycleHistory: Array<{
    step: string;
    timestamp: string;
    status: string;
    actor?: string;
    details?: string;
  }>;
}

export type GlobalWalletTransactionType =
  | 'Funding'
  | 'Charge'
  | 'Commission'
  | 'Withdrawal'
  | 'Business Wallet Funding'
  | 'TellerBud Charge';

export interface GlobalWalletLifecycleStep {
  step: string;
  timestamp: string;
  status: string;
  details?: string;
  actor?: string;
}

export interface GlobalWalletActivity {
  id: string;
  reference: string;
  dateTime: string;
  rawDate?: string;
  transactionType: GlobalWalletTransactionType;
  subType?: string;
  initiatedBy?: {
    name: string;
    role: string;
    avatarInitials?: string;
  };
  agent?: {
    id: string;
    name: string;
    avatarInitials?: string;
    isOperationalAttribution?: boolean;
  } | null;
  description: string;
  debit: number | null;
  credit: number | null;
  balanceBefore: number;
  balanceAfter: number;
  status: 'Completed' | 'Pending' | 'Processing' | 'Reversed';
  externalProvider?: string;
  providerReference?: string;
  mobileMoneyNumber?: string;
  createdTimestamp?: string;
  completedTimestamp?: string;
  lifecycleHistory: GlobalWalletLifecycleStep[];
}

export type BusinessTransactionCategory =
  | 'Walk-In Transaction'
  | 'Customer Pickup Transaction'
  | 'Cash / Float Fulfilment'
  | 'Agent-to-Agent Liquidity'
  | 'Global Wallet Transaction'
  | 'Charge or Commission'
  | 'Refund or Reversal';

export type BusinessTransactionStatus =
  | 'Completed'
  | 'Processing'
  | 'Pending'
  | 'Failed'
  | 'Cancelled'
  | 'Reversed';

export type GlobalWalletFeeType = 'Reservation Fee' | 'Transaction Fee' | 'Platform Fee';

export interface GlobalWalletFeeImpact {
  feeType: GlobalWalletFeeType;
  feeAmount: number;
  entryDirection: 'Debit';
  walletBalanceBefore: number;
  walletBalanceAfter: number;
  ledgerReference: string;
  deductionStatus: 'Debited' | 'Pending' | 'Waived';
  deductionTimestamp: string;
}

export interface BusinessTransactionTimeline {
  id: string;
  status: string;
  timestamp: string;
  actor: string;
  details?: string;
}

export interface BusinessTransactionRecord {
  id: string;
  reference: string;
  dateTime: string;
  rawDate: string;
  category: BusinessTransactionCategory;
  transactionType: string;
  businessId: string;
  businessName: string;
  agentId?: string | null;
  agentName?: string | null;
  agentPhone?: string | null;
  customerOrCounterparty: string;
  customerPhone?: string | null;
  vendor?: ApprovedVendor | null;
  channel?: string | null;
  transactionMethod?: string | null;
  amount: number;
  tellerBudChargeOrCommission?: number | null;
  status: BusinessTransactionStatus;
  relatedReference?: string | null;
  relatedLedgerEntry?: string | null;
  globalWalletImpact?: GlobalWalletFeeImpact | null;
  description?: string;
  lifecycleTimeline: BusinessTransactionTimeline[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface BusinessTransactionFilters {
  search: string;
  category: BusinessTransactionCategory | 'All';
  transactionType: string | 'All';
  vendor: ApprovedVendor | 'All';
  agent: string | 'All';
  status: BusinessTransactionStatus | 'All';
  fromDate: string;
  toDate: string;
}

export interface BusinessTransactionStatusCounts {
  all: number;
  completed: number;
  processing: number;
  pending: number;
  failed: number;
  cancelled: number;
  reversed: number;
}

export * from './mobileMoney';

