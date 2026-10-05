export type ServiceAvailability = 'Active' | 'Inactive' | 'Coming Soon';

export type ServiceAudience = 'Customer App' | 'Agent App' | 'Customer and Agent';

export type ServiceTransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'Purchase'
  | 'Liquidity Transfer';

export interface ReservationFeeConfig {
  percentageRate: number; // 0.012 (1.2%)
  timeRatePerMinute: number; // 0.10 (ZMW 0.10 per minute)
  penaltyReserve: number; // 20.00 (ZMW 20.00)
  customerVisibilityRate: number; // 1.00 (100%)
  agentVisibilityRate: number; // 0.80 (80%)
  formulaDisplay: string; // '(Reservation Amount × 1.2%) + (Minutes × ZMW 0.10) + ZMW 20.00'
  isDynamic: boolean;
}

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
  reservationCharge: string; // 'Dynamic' | 'Not Applicable'
  hasReservationFee?: boolean;
  reservationFeeConfig?: ReservationFeeConfig;
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
