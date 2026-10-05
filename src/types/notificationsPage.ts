export type NotificationCategory =
  | 'Customer Withdrawal'
  | 'Business Withdrawal'
  | 'Withdrawal' // Legacy fallback
  | 'Transaction'
  | 'Provider/API'
  | 'Reconciliation'
  | 'Vendor Eligibility'
  | 'System';

export type NotificationPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type NotificationStatus =
  | 'Unread'
  | 'Read'
  | 'Resolved'
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export interface NotificationActivityEvent {
  id: string;
  event: string;
  actingUserOrSystem?: string;
  previousStatus?: string;
  newStatus?: string;
  dateTime: string;
}

export interface WithdrawalNotificationDetails {
  withdrawalId: string; // e.g. 'TB-WDL-008812' or 'TB-WDL-000001'
  requestType: 'Customer Withdrawal' | 'Business Withdrawal';
  customerName?: string;
  customerId?: string;
  businessName?: string;
  businessId?: string;
  businessOwnerName?: string;
  amount: number; // e.g. 7200.00
  vendor: string; // e.g. 'MTN Mobile Money' | 'Airtel Money'
  mobileMoneyNumber: string; // e.g. '+260 96 612 9901'
  submittedDateTime: string; // e.g. 'Today, 11:52 AM'
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Completed' | 'Failed' | 'Cancelled';
}

export interface TellerBudNotification {
  id: string; // e.g. 'TB-NTF-001'
  title: string;
  message: string;
  category: NotificationCategory;
  relatedRecord: string; // e.g. 'TB-WDL-008812'
  priority: NotificationPriority;
  status: NotificationStatus;
  dateTime: string; // e.g. 'Today, 11:52 AM'
  createdAt: string; // ISO date string e.g. '2026-09-13T11:52:00'
  withdrawalType?: 'Customer Withdrawal' | 'Business Withdrawal';
  withdrawalDetails?: WithdrawalNotificationDetails;
  source?: string;
  deliveredAt?: string;
  deliveredTo?: string;
  readAt?: string;
  readBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  actionRequired?: boolean;
  actionLabel?: string; // e.g. 'Review Withdrawal'
  actionRoute?: string; // e.g. '/super-admin/wallets/customer-withdrawals/TB-WDL-008812'
  activities?: NotificationActivityEvent[];
}

export interface NotificationFiltersState {
  search: string;
  category: 'All' | NotificationCategory;
  priority: 'All' | NotificationPriority;
  status: 'All' | NotificationStatus;
  fromDate: string;
  toDate: string;
}

export interface NotificationSummaryMetrics {
  total: number;
  unread: number;
  actionRequired: number;
  criticalAlerts: number;
}
