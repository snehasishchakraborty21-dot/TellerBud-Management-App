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

export type ChargeStatus = 'Pending' | 'Posted' | 'Cancelled' | 'Refunded' | 'Reversed';

export type CommissionSettlementStatus =
  | 'Accrued'
  | 'Pending Settlement'
  | 'Settled'
  | 'Cancelled'
  | 'Reversed';

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
  reservationChargesCollected: number; // 18450.00
  agentCommissions: number; // 10250.00
  businessCommissions: number; // 4900.00
  tellerBudRevenue: number; // 3300.00
  pendingSettlements: number; // 1200.00
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

