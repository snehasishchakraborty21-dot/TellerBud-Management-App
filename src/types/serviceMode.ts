export type ServiceAvailability = 'Active' | 'Inactive' | 'Coming Soon';

export type ServiceAudience = 'Customer App' | 'Agent App' | 'Customer and Agent';

export type ServiceTransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'Purchase'
  | 'Liquidity Transfer';

export interface ServiceModeRecord {
  id: string; // e.g. 'TB-SVC-CP-001'
  name: string;
  audience: ServiceAudience;
  availability: ServiceAvailability;
  displayLabel?: string; // e.g. 'SOON'
  transactionTypes: ServiceTransactionType[];
  eligibleProvidersCount: number;
  isInternalLedger?: boolean;
  providerDisplay?: string; // e.g. 'TellerBud Ledger'
  scheduling: string; // 'Now, Later' | 'Unavailable' | 'Immediate'
  completionConfirmation?: string[];
  reservationCharge: string; // 'ZMW 50.00' | 'Not Applicable'
  lastUpdated: string; // 'Today, 10:45 AM'
  description?: string;
  canActivateInPhase1: boolean;
}

export interface ServiceModeFilters {
  search: string;
  availability: string; // 'all' | 'Active' | 'Inactive' | 'Coming Soon'
  audience: string; // 'all' | 'Customer App' | 'Agent App' | 'Customer and Agent'
  transactionType: string; // 'all' | 'Deposit' | 'Withdrawal' | 'Purchase' | 'Liquidity Transfer'
}

export interface ServiceModeChangeLog {
  id: string;
  serviceId: string;
  serviceName: string;
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  updatedBy: string;
  timestamp: string;
}
