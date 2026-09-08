import { ApprovedVendor } from './admin';

export type ServiceChannel = 'Pickup' | 'Walk-In';
export type MobileMoneyTransactionType = 'Deposit' | 'Withdrawal' | 'Purchase';

export type MobileMoneyStatus =
  | 'Agent Confirmed'
  | 'Active Service'
  | 'Pending Confirmation'
  | 'Completed'
  | 'Cancelled'
  | 'Failed';

export interface MobileMoneyTimelineEvent {
  id: string;
  eventName: string;
  actor: string;
  timestamp: string;
  result: string;
}

export interface MobileMoneyTransaction {
  id: string;
  reference: string; // e.g. TB-TXN-1048
  sourceReference?: string; // For Pickup: e.g. TB-REQ-1048. For Walk-In: e.g. TB-WLK-3301
  sourceReferenceType?: 'Customer Request' | 'Walk-In';
  serviceChannel: ServiceChannel;
  transactionType: MobileMoneyTransactionType;
  vendor: ApprovedVendor;
  vendorType: 'MNO Mobile Money' | 'Bank API';
  
  // Customer Information
  isRegisteredCustomer: boolean;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAccountStatus?: string;

  // Agent & Business Information
  agentId: string;
  agentName: string;
  agentPhone: string;
  businessId: string;
  businessName: string;
  businessLocation?: string;

  // Service Information
  pickupLocation?: string;
  requestedServiceTime?: string;
  assignmentMethod?: string;
  assignedTimestamp?: string;

  walkInLocation?: string;
  processingAgent?: string;
  terminalId?: string;
  receiptNumber?: string;
  initiationTimestamp?: string;

  // Financial Amounts & Charges
  amount: number;
  reservationCharge: number;
  otherCharges: number;
  customerTotal: number;

  // Processing & Confirmation
  principalProcessingMethod: string;
  customerConfirmationStatus: 'Confirmed' | 'Pending' | 'Not Required' | 'Failed';
  customerConfirmationTimestamp?: string;
  customerConfirmationMethod?: string;
  agentConfirmationStatus: 'Confirmed' | 'Pending' | 'In Progress';
  agentConfirmationTimestamp?: string;
  agentConfirmationMethod?: string;

  // Status & Date
  status: MobileMoneyStatus;
  postedAt: string; // ISO string
  formattedDate: string;

  // Timeline
  timeline: MobileMoneyTimelineEvent[];

  // System Information
  recordSource: string;
  lastUpdated: string;
}

export interface MobileMoneyFilters {
  search: string;
  serviceChannel: ServiceChannel | 'ALL';
  transactionType: MobileMoneyTransactionType | 'ALL';
  vendor?: ApprovedVendor | 'ALL';
  status: MobileMoneyStatus | 'ALL' | 'Cancelled_Failed';
  business: string | 'ALL';
  dateFrom: string;
  dateTo: string;
}

export interface MobileMoneySummary {
  total: number;
  pickup: number;
  walkIn: number;
  completed: number;
  pendingConfirmation: number;
  cancelledFailed: number;
}

export type MobileMoneySortField = 'postedAt' | 'amount' | 'status' | 'reference';
export type MobileMoneySortDirection = 'asc' | 'desc';
