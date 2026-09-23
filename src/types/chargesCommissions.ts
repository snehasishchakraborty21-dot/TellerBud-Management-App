export type ChargeType = 'Reservation Fee' | 'Transaction Fee' | 'Platform Fee';

export type CommissionType =
  | 'Business Commission'
  | 'Transaction Commission'
  | 'Promotional Commission'
  | 'Commission Adjustment';

export type ChargeCommissionRecordType = 'Charge' | 'Commission';

export type ChargeCommissionSubType = ChargeType | CommissionType;

export type ChargeCommissionStatus = 'Completed' | 'Pending';

export type WalletDirection = 'Debit' | 'Credit';

export type ChargeStatus = 'Pending' | 'Posted' | 'Completed' | 'Cancelled' | 'Failed';

export type CommissionSettlementStatus =
  | 'Accrued'
  | 'Pending Settlement'
  | 'Settled'
  | 'Cancelled';

export type RecipientType = 'Agent' | 'Business Owner' | 'TellerBud Platform';

export interface ChargeCommissionLifecycleStep {
  id: string;
  status: string;
  timestamp: string;
  actor: string;
  notes?: string;
}

export interface ChargeRecord {
  id: string;
  reference: string;
  createdAt: string;
  dateTime?: string;
  timestamp: number;
  rawDate: string; // YYYY-MM-DD
  transactionReference: string;
  transactionType: string;
  customerName: string;
  customerId: string;
  customerWalletId?: string;
  customerMobile?: string;
  service: string;
  provider: string;
  transactionAmount: number;
  reservationCharge: number;
  status: ChargeStatus;
  businessName?: string;
  businessId?: string;
  agentName?: string;
  agentId?: string;
  rateRuleVersion?: string;
  idempotencyKey?: string;
  ledgerEntryReference?: string;
  walletLedgerReference?: string;
  description?: string;
  lifecycleTimeline?: ChargeCommissionLifecycleStep[];
}

export interface CommissionRecord {
  id: string;
  reference: string;
  createdAt: string;
  dateTime?: string;
  timestamp: number;
  rawDate: string; // YYYY-MM-DD
  transactionReference: string;
  transactionType: string;
  service: string;
  provider?: string;
  recipient: string;
  recipientId: string;
  recipientType: RecipientType;
  associatedBusiness?: string;
  calculationBasis: string;
  commissionRate?: string;
  rateRuleVersion: string;
  transactionAmount?: number;
  commissionAmount: number;
  settlementStatus: CommissionSettlementStatus;
  settlementLedgerReference?: string;
  walletLedgerReference?: string;
  idempotencyKey?: string;
  settledAt?: string;
  description?: string;
  lifecycleTimeline?: ChargeCommissionLifecycleStep[];
}

export interface ChargesCommissionsKpiData {
  reservationCharges: number;
  tellerBudCharges: number;
  businessRevenue: number;
  // Backward-compatibility aliases
  reservationChargesCollected?: number;
  tellerBudRevenue?: number;
  agentRevenue?: number;
  pendingSettlements?: number;
  agentCommissions?: number;
  businessCommissions?: number;
}

export interface RevenueSharingRule {
  ruleId: string;
  ruleName: string;
  version: string;
  service: string;
  agentRevenueShareRate: number;
  businessRevenueShareRate: number;
  tellerBudPlatformShareRate: number;
  description: string;
}

export interface AgentRevenueBreakdownRecord {
  agentId: string;
  agentName: string;
  avatarInitials: string;
  avatarUrl?: string;
  businessId: string;
  businessName: string;
  storeId: string;
  storeName: string;
  boothId: string;
  boothName: string;
  completedTransactions: number;
  reservationCharges: number; // Reservation Charges (ZMW)
  tellerBudCharges: number;   // TellerBud Charges (ZMW)
  revenueGenerated: number;   // Revenue Generated (ZMW) = Reservation Charges - TellerBud Charges
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface AgentTransactionRevenueRecord {
  id: string;
  chargeRecord: string;
  transactionReference: string;
  customer: string;
  customerId: string;
  service: string;
  transactionType: string;
  provider: string;
  transactionAmount: number; // Principal (informational, excluded from revenue)
  reservationCharge: number; // Reservation Charge (ZMW)
  tellerBudCharge: number;   // TellerBud Charge (ZMW)
  revenueGenerated: number;  // Revenue Generated (ZMW) = reservationCharge - tellerBudCharge
  dateTime: string;
  rawDate: string;           // YYYY-MM-DD
  timestamp: number;
  settlementStatus?: CommissionSettlementStatus;
  status: ChargeStatus;
  storeId: string;
  storeName: string;
  boothId: string;
  boothName: string;
  agentId: string;
  agentName: string;
  businessId: string;
  businessName: string;
}

export interface AgentRevenueFilters {
  fromDate: string;
  toDate: string;
  storeId: string;
  boothId: string;
  agentId: string;
  settlementStatus?: string;
}

export interface ChargesCommissionsFilters {
  search: string;
  service: string;
  provider: string;
  status: string;
  fromDate: string;
  toDate: string;
}

// Legacy interfaces for mockAdminService
export interface ChargeCommissionRecord {
  id: string;
  reference: string;
  dateTime: string;
  rawDate: string; // YYYY-MM-DD
  recordType: ChargeCommissionRecordType;
  subType: ChargeCommissionSubType;
  relatedTransaction: string;
  principalAmount: number; // Informational only
  agent: {
    id?: string;
    name: string;
  } | null;
  amount: number;
  walletDirection: WalletDirection;
  walletBalanceBefore: number;
  walletBalanceAfter: number;
  walletLedgerReference: string;
  status: ChargeCommissionStatus;
  businessName: string;
  businessId: string;
  currency: 'ZMW';
  createdAt: string;
  completedAt?: string | null;
  description: string;
  lifecycleTimeline: ChargeCommissionLifecycleStep[];
}

export interface ChargeCommissionFilters {
  search: string;
  recordType: 'All' | 'Charge' | 'Commission';
  subType: string;
  agent: string;
  status: 'All' | 'Completed' | 'Pending';
  fromDate: string;
  toDate: string;
}

export interface ChargeCommissionSummary {
  totalCharges: number;
  totalCommissions: number;
  netWalletImpact: number;
  currentWalletBalance: number;
}

export interface ChargeCommissionTabCounts {
  all: number;
  charges: number;
  commissions: number;
  pending: number;
  completed: number;
}

