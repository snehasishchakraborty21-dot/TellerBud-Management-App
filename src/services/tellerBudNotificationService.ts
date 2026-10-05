import {
  TellerBudNotification,
  NotificationSummaryMetrics,
  NotificationActivityEvent,
  WithdrawalNotificationDetails,
} from '../types/notificationsPage';
import { INITIAL_TELLERBUD_NOTIFICATIONS } from '../data/mockTellerBudNotifications';
import { AdminNotification } from '../types/admin';

const STORAGE_KEY = 'tellerbud_admin_notifications_v8';

export function getDefaultSource(notification: Pick<TellerBudNotification, 'category'>): string {
  switch (notification.category) {
    case 'Customer Withdrawal':
    case 'Withdrawal':
      return 'Customer Withdrawal System';
    case 'Business Withdrawal':
      return 'Business Wallet System';
    case 'Transaction':
      return 'Core Transaction Settlement Engine';
    case 'Provider/API':
      return 'Provider Gateway & Callback Monitor';
    case 'Reconciliation':
      return 'Ledger Reconciliation Service';
    case 'Vendor Eligibility':
      return 'Vendor Management System';
    case 'System':
      return 'Security & Access Policy Engine';
    default:
      return 'TellerBud System Core';
  }
}

function initializeActivities(n: TellerBudNotification): NotificationActivityEvent[] {
  if (n.activities && n.activities.length > 0) {
    return n.activities;
  }

  const events: NotificationActivityEvent[] = [
    {
      id: `act-init-${n.id}-1`,
      event: 'Notification received',
      actingUserOrSystem: n.source || getDefaultSource(n),
      dateTime: n.dateTime,
    },
  ];

  if (n.status === 'Read' || n.readAt) {
    events.push({
      id: `act-init-${n.id}-2`,
      event: `Marked as read`,
      actingUserOrSystem: n.readBy || 'Sililo Lubinda',
      dateTime: n.readAt || n.dateTime,
    });
  }

  if (n.status === 'Resolved' || n.resolvedAt || n.status === 'Approved' || n.status === 'Completed') {
    events.push({
      id: `act-init-${n.id}-3`,
      event: n.category.includes('Withdrawal') ? 'Withdrawal approved' : 'Marked as resolved',
      actingUserOrSystem: n.resolvedBy || 'Sililo Lubinda',
      dateTime: n.resolvedAt || n.dateTime,
    });
  }

  return events;
}

function loadNotifications(): TellerBudNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: TellerBudNotification) => {
          let cat = item.category;
          if ((cat as string) === 'Withdrawal') {
            cat = 'Customer Withdrawal';
          }
          return {
            ...item,
            category: cat,
            source: item.source || getDefaultSource(item),
            activities: item.activities && item.activities.length > 0 ? item.activities : initializeActivities(item),
          };
        });
      }
    }
  } catch (e) {
    console.error('Failed to load notifications from storage:', e);
  }
  return INITIAL_TELLERBUD_NOTIFICATIONS.map((item) => ({
    ...item,
    source: item.source || getDefaultSource(item),
    activities: initializeActivities(item),
  }));
}

function saveNotifications(items: TellerBudNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save notifications to storage:', e);
  }
}

function formatCurrentTimeString(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `Today, ${formattedHours}:${formattedMinutes} ${ampm}`;
}

class TellerBudNotificationService {
  private notifications: TellerBudNotification[] = loadNotifications();
  private listeners: Set<() => void> = new Set();

  private notify() {
    saveNotifications(this.notifications);
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in notification listener:', err);
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getAll(): TellerBudNotification[] {
    return [...this.notifications];
  }

  getAdminNotifications(): AdminNotification[] {
    return this.notifications.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      timestamp: n.dateTime,
      read: n.status === 'Read' || n.status === 'Resolved',
      message: n.message,
      actionUrl: n.actionRoute,
      priority: n.priority === 'Critical' ? 'Urgent' : n.priority === 'High' ? 'Important' : 'Normal',
      actionRequired: n.actionRequired,
      relatedReference: n.relatedRecord,
      createdAt: n.createdAt,
    }));
  }

  getById(id: string): TellerBudNotification | undefined {
    return this.notifications.find((n) => n.id === id);
  }

  getSummaryMetrics(): NotificationSummaryMetrics {
    const total = this.notifications.length;
    const unread = this.notifications.filter((n) => n.status === 'Unread').length;
    const actionRequired = this.notifications.filter(
      (n) => n.actionRequired && n.status !== 'Resolved' && n.status !== 'Approved' && n.status !== 'Completed' && n.status !== 'Rejected' && n.status !== 'Cancelled'
    ).length;
    const criticalAlerts = this.notifications.filter(
      (n) => n.priority === 'Critical' && n.status !== 'Resolved' && n.status !== 'Completed'
    ).length;

    return {
      total,
      unread,
      actionRequired,
      criticalAlerts,
    };
  }

  recordViewed(id: string, viewer = 'Sililo Lubinda'): void {
    const timeStr = formatCurrentTimeString();
    let hasChanged = false;
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        const activities = n.activities ? [...n.activities] : initializeActivities(n);
        const alreadyViewed = activities.some((a) => a.event.startsWith('Viewed by'));
        if (!alreadyViewed) {
          activities.push({
            id: `act-${Date.now()}-view`,
            event: `Viewed by ${viewer}`,
            actingUserOrSystem: viewer,
            dateTime: timeStr,
          });
          hasChanged = true;
          return { ...n, activities };
        }
      }
      return n;
    });

    if (hasChanged) {
      this.notify();
    }
  }

  markAsRead(id: string, actor = 'Sililo Lubinda'): void {
    const timeStr = formatCurrentTimeString();
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        const newActivities = [...currentActivities];
        if (n.status === 'Unread') {
          newActivities.push({
            id: `act-${Date.now()}-read`,
            event: `Marked as read`,
            actingUserOrSystem: actor,
            previousStatus: 'Unread',
            newStatus: 'Read',
            dateTime: timeStr,
          });
        }
        return {
          ...n,
          status: 'Read',
          readAt: n.readAt || timeStr,
          readBy: actor,
          activities: newActivities,
        };
      }
      return n;
    });
    this.notify();
  }

  markAsUnread(id: string, actor = 'Sililo Lubinda'): void {
    const timeStr = formatCurrentTimeString();
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        const newActivities = [...currentActivities];
        if (n.status !== 'Unread') {
          newActivities.push({
            id: `act-${Date.now()}-unread`,
            event: `Marked as unread`,
            actingUserOrSystem: actor,
            previousStatus: n.status,
            newStatus: 'Unread',
            dateTime: timeStr,
          });
        }
        return {
          ...n,
          status: 'Unread',
          readAt: undefined,
          readBy: undefined,
          activities: newActivities,
        };
      }
      return n;
    });
    this.notify();
  }

  markAllAsRead(actor = 'Sililo Lubinda'): void {
    const timeStr = formatCurrentTimeString();
    this.notifications = this.notifications.map((n) => {
      if (n.status === 'Unread') {
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        return {
          ...n,
          status: 'Read',
          readAt: n.readAt || timeStr,
          readBy: actor,
          activities: [
            ...currentActivities,
            {
              id: `act-${Date.now()}-read-${n.id}`,
              event: 'Marked as read',
              actingUserOrSystem: actor,
              previousStatus: 'Unread',
              newStatus: 'Read',
              dateTime: timeStr,
            },
          ],
        };
      }
      return n;
    });
    this.notify();
  }

  markAsResolved(id: string, actor = 'Sililo Lubinda'): void {
    const timeStr = formatCurrentTimeString();
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        const newActivities = [...currentActivities];
        newActivities.push({
          id: `act-${Date.now()}-res`,
          event: n.category.includes('Withdrawal') ? 'Withdrawal processed' : 'Marked as resolved',
          actingUserOrSystem: actor,
          previousStatus: n.status,
          newStatus: 'Resolved',
          dateTime: timeStr,
        });

        return {
          ...n,
          status: 'Resolved',
          resolvedAt: timeStr,
          resolvedBy: actor,
          actionRequired: false,
          activities: newActivities,
        };
      }
      return n;
    });
    this.notify();
  }

  /**
   * Automatic resolution & status synchronization whenever a Customer or Business Withdrawal is updated
   */
  handleWithdrawalStatusChanged(
    reference: string,
    newStatus: 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'Paid' | 'Processing' | string,
    actor = 'Sililo Lubinda'
  ): void {
    const timeStr = formatCurrentTimeString();
    const cleanRef = reference.trim().toLowerCase();

    this.notifications = this.notifications.map((n) => {
      if (n.relatedRecord.toLowerCase() === cleanRef) {
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        const newActivities = [...currentActivities];

        let eventTitle = `Withdrawal ${newStatus.toLowerCase()}`;
        if (newStatus === 'Paid' || newStatus === 'Completed') {
          eventTitle = 'Withdrawal completed';
        } else if (newStatus === 'Approved') {
          eventTitle = 'Withdrawal approved';
        } else if (newStatus === 'Rejected') {
          eventTitle = 'Withdrawal rejected';
        } else if (newStatus === 'Cancelled') {
          eventTitle = 'Withdrawal cancelled';
        }

        newActivities.push({
          id: `act-${Date.now()}-status`,
          event: eventTitle,
          actingUserOrSystem: actor,
          previousStatus: n.status,
          newStatus: newStatus as any,
          dateTime: timeStr,
        });

        const isTerminal = ['Approved', 'Rejected', 'Cancelled', 'Completed', 'Paid'].includes(newStatus);

        return {
          ...n,
          status: isTerminal ? 'Resolved' : n.status,
          resolvedAt: isTerminal ? timeStr : n.resolvedAt,
          resolvedBy: isTerminal ? actor : n.resolvedBy,
          actionRequired: !isTerminal,
          withdrawalDetails: n.withdrawalDetails
            ? {
                ...n.withdrawalDetails,
                status: (newStatus === 'Paid' ? 'Completed' : newStatus) as any,
              }
            : undefined,
          activities: newActivities,
        };
      }
      return n;
    });
    this.notify();
  }

  /**
   * Create a Customer Withdrawal Notification
   */
  createCustomerWithdrawalNotification(params: {
    reference: string;
    customerName: string;
    customerId: string;
    amount: number;
    vendor: string;
    mobileMoneyNumber: string;
  }): TellerBudNotification {
    const timeStr = formatCurrentTimeString();
    const newId = `TB-NTF-${String(this.notifications.length + 1).padStart(3, '0')}`;
    const amountFormatted = `ZMW ${params.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const newNotification: TellerBudNotification = {
      id: newId,
      title: 'Customer Withdrawal Request',
      message: `${params.customerName} requested to withdraw ${amountFormatted} to ${params.vendor}. Please review the request.`,
      category: 'Customer Withdrawal',
      relatedRecord: params.reference,
      priority: 'High',
      status: 'Unread',
      dateTime: timeStr,
      createdAt: new Date().toISOString(),
      withdrawalType: 'Customer Withdrawal',
      withdrawalDetails: {
        withdrawalId: params.reference,
        requestType: 'Customer Withdrawal',
        customerName: params.customerName,
        customerId: params.customerId,
        amount: params.amount,
        vendor: params.vendor,
        mobileMoneyNumber: params.mobileMoneyNumber,
        submittedDateTime: timeStr,
        status: 'Pending Review',
      },
      actionRequired: true,
      actionLabel: 'Review Withdrawal',
      actionRoute: `/super-admin/wallets/customer-withdrawals/${params.reference}`,
      activities: [
        {
          id: `act-${newId}-1`,
          event: 'Notification received',
          actingUserOrSystem: 'Customer Withdrawal System',
          dateTime: timeStr,
        },
      ],
    };

    this.notifications.unshift(newNotification);
    this.notify();
    return newNotification;
  }

  /**
   * Create a Business Owner Withdrawal Notification
   */
  createBusinessWithdrawalNotification(params: {
    reference: string;
    businessName: string;
    businessId: string;
    businessOwnerName?: string;
    amount: number;
    vendor: string;
    mobileMoneyNumber: string;
  }): TellerBudNotification {
    const timeStr = formatCurrentTimeString();
    const newId = `TB-NTF-${String(this.notifications.length + 1).padStart(3, '0')}`;
    const amountFormatted = `ZMW ${params.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const newNotification: TellerBudNotification = {
      id: newId,
      title: 'Business Withdrawal Request',
      message: `${params.businessName} requested to withdraw ${amountFormatted} from its business wallet. Please review the request.`,
      category: 'Business Withdrawal',
      relatedRecord: params.reference,
      priority: 'High',
      status: 'Unread',
      dateTime: timeStr,
      createdAt: new Date().toISOString(),
      withdrawalType: 'Business Withdrawal',
      withdrawalDetails: {
        withdrawalId: params.reference,
        requestType: 'Business Withdrawal',
        businessName: params.businessName,
        businessId: params.businessId,
        businessOwnerName: params.businessOwnerName || 'Chileshe Mwamba',
        amount: params.amount,
        vendor: params.vendor,
        mobileMoneyNumber: params.mobileMoneyNumber,
        submittedDateTime: timeStr,
        status: 'Pending Review',
      },
      actionRequired: true,
      actionLabel: 'Review Withdrawal',
      actionRoute: `/super-admin/wallets/business-agent`,
      activities: [
        {
          id: `act-${newId}-1`,
          event: 'Notification received',
          actingUserOrSystem: 'Business Wallet System',
          dateTime: timeStr,
        },
      ],
    };

    this.notifications.unshift(newNotification);
    this.notify();
    return newNotification;
  }
}

export const tellerBudNotificationService = new TellerBudNotificationService();
