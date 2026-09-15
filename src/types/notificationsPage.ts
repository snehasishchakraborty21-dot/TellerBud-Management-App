export type NotificationCategory =
  | 'Withdrawal'
  | 'Transaction'
  | 'Provider/API'
  | 'Reconciliation'
  | 'Vendor Eligibility'
  | 'System';

export type NotificationPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type NotificationStatus = 'Unread' | 'Read' | 'Resolved';

export interface NotificationActivityEvent {
  id: string;
  event: string;
  actingUserOrSystem: string;
  previousStatus: string;
  newStatus: string;
  dateTime: string;
}

export interface TellerBudNotification {
  id: string; // e.g. 'TB-NTF-001'
  title: string;
  message: string;
  category: NotificationCategory;
  relatedRecord: string; // e.g. 'TB-WDR-8812'
  priority: NotificationPriority;
  status: NotificationStatus;
  dateTime: string; // e.g. 'Today, 11:52 AM'
  createdAt: string; // ISO date string e.g. '2026-09-13T11:52:00'
  source?: string; // e.g. 'Customer Withdrawal System'
  deliveredAt?: string; // e.g. 'Today, 11:52 AM'
  deliveredTo?: string; // e.g. 'Super Admin Dispatcher'
  readAt?: string; // e.g. 'Today, 11:55 AM'
  readBy?: string; // e.g. 'Super Admin'
  resolvedAt?: string; // e.g. 'Today, 12:10 PM'
  resolvedBy?: string; // e.g. 'Super Admin'
  actionRequired?: boolean;
  actionLabel?: string; // e.g. 'Review Withdrawal'
  actionRoute?: string; // e.g. '/super-admin/wallets/customer-withdrawals'
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
