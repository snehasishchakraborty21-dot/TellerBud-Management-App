export type NotificationCategory =
  | 'Cash / Float Requests'
  | 'Live Operations'
  | 'Agents'
  | 'Agent-to-Agent Liquidity'
  | 'Walk-In Transactions'
  | 'Attendance'
  | 'End-of-Day'
  | 'Global Wallet'
  | 'Charges & Commissions'
  | 'System';

export type NotificationPriority = 'Normal' | 'Important' | 'Urgent';

export type NotificationActionType =
  | 'View Request'
  | 'View Agent'
  | 'View Transaction'
  | 'View Attendance'
  | 'Review End-of-Day'
  | 'View Wallet Entry'
  | 'View Charge'
  | 'View Commission'
  | 'View System';

export interface BONotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  actionRequired: boolean;
  relatedReference?: string;
  agent?: {
    id?: string;
    name: string;
  } | null;
  businessName: string;
  businessId: string;
  rawDate: string; // YYYY-MM-DD
  createdAt: string; // e.g. "02 Sep 2026, 02:45 PM"
  timeAgo: string; // e.g. "10 mins ago"
  actionType: NotificationActionType;
  actionUrl: string;
}

export interface NotificationTabCounts {
  all: number;
  unread: number;
  actionRequired: number;
  read: number;
}

export interface NotificationFilters {
  search: string;
  category: string;
  readStatus: 'All' | 'Read' | 'Unread';
  priority: 'All' | NotificationPriority;
  fromDate: string;
  toDate: string;
}
