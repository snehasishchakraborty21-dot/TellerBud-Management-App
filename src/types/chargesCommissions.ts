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

export interface ChargeCommissionLifecycleStep {
  id: string;
  status: string;
  timestamp: string;
  actor: string;
}

export interface ChargeCommissionRecord {
  id: string;
  reference: string;
  dateTime: string;
  rawDate: string; // YYYY-MM-DD
  recordType: ChargeCommissionRecordType;
  subType: ChargeCommissionSubType;
  relatedTransaction: string;
  principalAmount: number; // Informational only: settled externally and not part of Global Wallet calculation
  agent: {
    id?: string;
    name: string;
  } | null; // Operational attribution only; never an agent wallet balance
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
