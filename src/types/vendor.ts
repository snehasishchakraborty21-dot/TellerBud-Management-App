export type VendorType = 'Mobile Money' | 'Bank';

export type VendorStatus = 'Active' | 'Inactive' | 'Pending Integration' | 'Archived';

export type SupportedService =
  | 'Cash Pickup'
  | 'Wallet Funding'
  | 'Customer Withdrawal'
  | 'Walk-In Transaction'
  | 'Agent-to-Agent Liquidity';

export interface VendorRecord {
  id: string; // e.g. TB-VND-MTN-001
  name: string; // e.g. MTN Mobile Money
  type: VendorType;
  services: SupportedService[];
  integrationMode: string; // e.g. Direct REST API, Merchant REST API, Bank Integration, Manual Settlement
  status: VendorStatus;
  lastUpdated: string; // e.g. Today, 11:48 AM
  lastUpdatedTimestamp: number;
  logo: string; // e.g. /assets/vendors/mtn.svg
  historicalTransactionsCount: number;
  linkedLedgerEntriesCount?: number;
  pendingTransactionsCount?: number;
  reconciliationRecordsCount?: number;
}

export interface VendorFilters {
  search: string;
  type: 'All' | VendorType;
  status: 'All' | VendorStatus;
  service: 'All' | SupportedService;
}

export type VendorSortField =
  | 'name'
  | 'id'
  | 'type'
  | 'integrationMode'
  | 'status'
  | 'lastUpdated';

export type SortDirection = 'asc' | 'desc';

export interface VendorSummaryMetrics {
  totalVendors: number;
  activeVendors: number;
  mobileMoneyProviders: number;
  bankingProviders: number;
  inactiveVendors: number;
}

export interface ServiceEligibilityItem {
  name: string;
  enabled: boolean;
  notes?: string;
}

export interface VendorActivityEvent {
  id: string;
  event: string;
  service: string;
  reference: string;
  status: 'Completed' | 'Successful' | 'Processed' | 'Pending' | 'Failed';
  dateTime: string;
}

export interface VendorChangeHistoryEntry {
  id: string;
  event: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
  dateTime: string;
}

export type MatrixEligibleService =
  | 'Cash Pickup'
  | 'Wallet Funding'
  | 'Customer Withdrawal'
  | 'Walk-In Transaction';

export interface EligibilityChangeLogEntry {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  service: MatrixEligibleService;
  previousStatus: 'Enabled' | 'Disabled';
  newStatus: 'Enabled' | 'Disabled';
  changedBy: string;
  dateTime: string;
}

export interface EligibilityFilters {
  search: string;
  type: 'All' | VendorType;
  status: 'All' | 'Active' | 'Inactive';
  service: 'All' | MatrixEligibleService;
}

export interface VendorDetailData extends VendorRecord {
  country: string; // e.g. Zambia
  currency: string; // e.g. ZMW
  addedDate: string; // e.g. 14 Jan 2023
  updatedBy: string; // e.g. Mwansa Tembo (System Admin)

  // Section 2: Supported Services
  serviceEligibilities: ServiceEligibilityItem[];

  // Section 3: Integration and API Status
  isApiConnected: boolean;
  connectionStatus: 'Operational' | 'Degraded' | 'Offline';
  collectionsApi?: string;
  payoutApi?: string;
  callbackEndpoint?: string;
  lastSuccessfulCallback?: string;
  successRate?: string;
  lastConnectionCheck?: string;

  // For non-API or Bank vendors
  nonApiDetails?: {
    methodTitle: string;
    settlementMechanism: string;
    processingWindow: string;
    dispatchChannel: string;
    settlementAccount?: string;
    protocol?: string;
    clearingNetwork?: string;
    operationsContact?: string;
    lastBatchOrPing: string;
    operationalStatus: string;
  };

  // Section 4: Configuration
  minTransactionAmount: number;
  maxTransactionAmount: number;
  reservationChargeEligibility: string;
  settlementMethod: string;
  reconciliationEnabled: boolean;
  reconciliationSchedule: string;
  automaticCallbackVerification: boolean;
  configurationStatus: string;

  // Section 5 & 6: Activity & History
  recentActivities: VendorActivityEvent[];
  changeHistory: VendorChangeHistoryEntry[];
}
