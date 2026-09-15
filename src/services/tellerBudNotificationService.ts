import {
  TellerBudNotification,
  NotificationSummaryMetrics,
  NotificationActivityEvent,
} from '../types/notificationsPage';
import { INITIAL_TELLERBUD_NOTIFICATIONS } from '../data/mockTellerBudNotifications';
import { AdminNotification } from '../types/admin';

const STORAGE_KEY = 'tellerbud_admin_notifications_v7';

export function getDefaultSource(notification: Pick<TellerBudNotification, 'category'>): string {
  switch (notification.category) {
    case 'Withdrawal':
      return 'Customer Withdrawal System';
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

  // Explicit initial activities for TB-NTF-001 matching specification
  if (n.id === 'TB-NTF-001') {
    const events: NotificationActivityEvent[] = [
      {
        id: `act-tb001-1`,
        event: 'Notification Created',
        actingUserOrSystem: 'Customer Withdrawal System',
        previousStatus: '—',
        newStatus: 'Unread',
        dateTime: 'Today, 11:52 AM',
      },
      {
        id: `act-tb001-2`,
        event: 'Notification Details Opened',
        actingUserOrSystem: 'Sililo Lubinda (Super Admin)',
        previousStatus: 'Unread',
        newStatus: 'Unread',
        dateTime: 'Today, 11:55 AM',
      },
    ];

    if (n.status === 'Read' || n.readAt) {
      events.push({
        id: `act-tb001-3`,
        event: 'Marked as Read',
        actingUserOrSystem: n.readBy || 'Sililo Lubinda (Super Admin)',
        previousStatus: 'Unread',
        newStatus: 'Read',
        dateTime: n.readAt || 'Today, 11:56 AM',
      });
    }

    if (n.status === 'Resolved' || n.resolvedAt) {
      events.push({
        id: `act-tb001-4`,
        event: 'Marked as Resolved',
        actingUserOrSystem: n.resolvedBy || 'Sililo Lubinda (Super Admin)',
        previousStatus: n.readAt ? 'Read' : 'Unread',
        newStatus: 'Resolved',
        dateTime: n.resolvedAt || 'Today, 12:00 PM',
      });
    }

    return events;
  }

  const source = n.source || getDefaultSource(n);
  const events: NotificationActivityEvent[] = [
    {
      id: `act-init-${n.id}-1`,
      event: 'Notification Created',
      actingUserOrSystem: source,
      previousStatus: '—',
      newStatus: 'Unread',
      dateTime: n.dateTime,
    },
    {
      id: `act-init-${n.id}-2`,
      event: 'Notification Details Opened',
      actingUserOrSystem: 'Sililo Lubinda (Super Admin)',
      previousStatus: 'Unread',
      newStatus: 'Unread',
      dateTime: n.dateTime,
    },
  ];

  if (n.status === 'Read' || n.readAt) {
    events.push({
      id: `act-init-${n.id}-3`,
      event: 'Marked as Read',
      actingUserOrSystem: n.readBy || 'Sililo Lubinda (Super Admin)',
      previousStatus: 'Unread',
      newStatus: 'Read',
      dateTime: n.readAt || n.dateTime,
    });
  }

  if (n.status === 'Resolved' || n.resolvedAt) {
    events.push({
      id: `act-init-${n.id}-4`,
      event: 'Marked as Resolved',
      actingUserOrSystem: n.resolvedBy || 'Sililo Lubinda (Super Admin)',
      previousStatus: n.readAt ? 'Read' : 'Unread',
      newStatus: 'Resolved',
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
        return parsed.map((item: TellerBudNotification) => ({
          ...item,
          source: item.source || getDefaultSource(item),
          deliveredAt: item.deliveredAt || item.dateTime,
          deliveredTo: item.deliveredTo || 'Super Admin Dispatcher',
          activities: item.activities && item.activities.length > 0 ? item.activities : initializeActivities(item),
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load notifications from storage:', e);
  }
  return INITIAL_TELLERBUD_NOTIFICATIONS.map((item) => ({
    ...item,
    source: item.source || getDefaultSource(item),
    deliveredAt: item.deliveredAt || item.dateTime,
    deliveredTo: item.deliveredTo || 'Super Admin Dispatcher',
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

  getById(id: string): TellerBudNotification | undefined {
    return this.notifications.find((n) => n.id === id);
  }

  getSummaryMetrics(): NotificationSummaryMetrics {
    const total = this.notifications.length;
    const unread = this.notifications.filter((n) => n.status === 'Unread').length;
    const actionRequired = this.notifications.filter(
      (n) => n.actionRequired && n.status !== 'Resolved'
    ).length;
    const criticalAlerts = this.notifications.filter(
      (n) => n.priority === 'Critical' && n.status !== 'Resolved'
    ).length;

    return {
      total,
      unread,
      actionRequired,
      criticalAlerts,
    };
  }

  markAsRead(id: string, actor = 'Sililo Lubinda (Super Admin)'): void {
    const timeStr = formatCurrentTimeString();
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        const oldStatus = n.status;
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        const newActivities = [...currentActivities];
        if (oldStatus !== 'Read') {
          newActivities.push({
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            event: 'Marked as Read',
            actingUserOrSystem: actor,
            previousStatus: oldStatus,
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

  markAsUnread(id: string, actor = 'Sililo Lubinda (Super Admin)'): void {
    const timeStr = formatCurrentTimeString();
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        const oldStatus = n.status;
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        const newActivities = [...currentActivities];
        if (oldStatus !== 'Unread') {
          newActivities.push({
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            event: 'Marked as Unread',
            actingUserOrSystem: actor,
            previousStatus: oldStatus,
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

  markAsResolved(id: string, actor = 'Sililo Lubinda (Super Admin)'): void {
    const timeStr = formatCurrentTimeString();
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        const oldStatus = n.status;
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        const newActivities = [...currentActivities];

        const wasUnread = oldStatus === 'Unread';
        const readTime = n.readAt || timeStr;

        // If notification is still unread, automatically mark it as read first
        if (wasUnread) {
          newActivities.push({
            id: `act-${Date.now()}-read`,
            event: 'Marked as Read',
            actingUserOrSystem: actor,
            previousStatus: 'Unread',
            newStatus: 'Read',
            dateTime: timeStr,
          });
        }

        if (oldStatus !== 'Resolved') {
          newActivities.push({
            id: `act-${Date.now()}-resolved`,
            event: 'Marked as Resolved',
            actingUserOrSystem: actor,
            previousStatus: wasUnread ? 'Read' : oldStatus,
            newStatus: 'Resolved',
            dateTime: timeStr,
          });
        }

        return {
          ...n,
          status: 'Resolved',
          readAt: readTime,
          readBy: n.readBy || actor,
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

  recordViewed(id: string, actor = 'Sililo Lubinda (Super Admin)'): void {
    const timeStr = formatCurrentTimeString();
    let changed = false;
    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        const currentActivities = n.activities && n.activities.length > 0 ? n.activities : initializeActivities(n);
        const alreadyOpened = currentActivities.some(
          (a) => a.event === 'Notification Details Opened' || a.event === 'Notification Viewed'
        );
        if (!alreadyOpened) {
          changed = true;
          return {
            ...n,
            activities: [
              ...currentActivities,
              {
                id: `act-opened-${Date.now()}`,
                event: 'Notification Details Opened',
                actingUserOrSystem: actor,
                previousStatus: n.status,
                newStatus: n.status,
                dateTime: timeStr,
              },
            ],
          };
        }
      }
      return n;
    });
    if (changed) {
      this.notify();
    }
  }

  markAllAsRead(): void {
    const timeStr = formatCurrentTimeString();
    this.notifications = this.notifications.map((n) => {
      if (n.status === 'Unread') {
        return {
          ...n,
          status: 'Read',
          readAt: n.readAt || timeStr,
        };
      }
      return n;
    });
    this.notify();
  }

  resetToDefault(): void {
    this.notifications = [...INITIAL_TELLERBUD_NOTIFICATIONS];
    this.notify();
  }

  // Adapter for global AdminHeader bell popover
  getAdminNotifications(): AdminNotification[] {
    return this.notifications.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      timestamp: n.dateTime,
      read: n.status !== 'Unread',
      actionUrl: n.actionRoute,
      message: n.message,
      priority:
        n.priority === 'Critical'
          ? 'Urgent'
          : n.priority === 'High'
          ? 'Important'
          : 'Normal',
      actionRequired: n.actionRequired,
      relatedReference: n.relatedRecord,
      actionType: n.actionLabel,
      createdAt: n.createdAt,
    }));
  }
}

export const tellerBudNotificationService = new TellerBudNotificationService();
