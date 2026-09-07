import { BONotification, NotificationTabCounts } from '../types/notifications';
import { MOCK_BO_NOTIFICATIONS } from '../data/mockNotificationsData';
import { AdminNotification } from '../types/admin';

const STORAGE_KEY = 'tellerbud_bo_notifications_read_v2';

type ReadStateMap = Record<string, boolean>;

function loadReadState(): ReadStateMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load notification read state from localStorage', e);
  }
  return {};
}

function saveReadState(state: ReadStateMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save notification read state to localStorage', e);
  }
}

class NotificationService {
  private readState: ReadStateMap = loadReadState();
  private listeners: Set<() => void> = new Set();

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Error in notification listener', err);
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getBONotifications(): BONotification[] {
    return MOCK_BO_NOTIFICATIONS.map((item) => {
      const isRead = this.readState[item.id] !== undefined ? this.readState[item.id] : item.read;
      return {
        ...item,
        read: isRead,
      };
    });
  }

  getNotificationById(id: string): BONotification | undefined {
    const all = this.getBONotifications();
    return all.find((n) => n.id === id);
  }

  getCounts(): NotificationTabCounts {
    const all = this.getBONotifications();
    const unread = all.filter((n) => !n.read).length;
    const read = all.filter((n) => n.read).length;
    const actionRequired = all.filter((n) => n.actionRequired).length;

    return {
      all: all.length,
      unread,
      actionRequired,
      read,
    };
  }

  markAsRead(id: string): void {
    this.readState[id] = true;
    saveReadState(this.readState);
    this.notify();
  }

  markAsUnread(id: string): void {
    this.readState[id] = false;
    saveReadState(this.readState);
    this.notify();
  }

  toggleRead(id: string): void {
    const current = this.getNotificationById(id);
    if (!current) return;
    this.readState[id] = !current.read;
    saveReadState(this.readState);
    this.notify();
  }

  markAllAsRead(ids?: string[]): void {
    if (ids && ids.length > 0) {
      ids.forEach((id) => {
        this.readState[id] = true;
      });
    } else {
      MOCK_BO_NOTIFICATIONS.forEach((item) => {
        this.readState[item.id] = true;
      });
    }
    saveReadState(this.readState);
    this.notify();
  }

  getAdminNotifications(): AdminNotification[] {
    const list = this.getBONotifications();
    return list.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      timestamp: item.timeAgo,
      read: item.read,
      actionUrl: item.actionUrl,
      message: item.message,
      priority: item.priority,
      actionRequired: item.actionRequired,
      relatedReference: item.relatedReference,
      agent: item.agent,
      businessName: item.businessName,
      businessId: item.businessId,
      actionType: item.actionType,
      createdAt: item.createdAt,
    }));
  }
}

export const boNotificationService = new NotificationService();
