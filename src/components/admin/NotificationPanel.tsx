import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, ExternalLink, X, ChevronRight, AlertCircle } from 'lucide-react';
import { AdminNotification } from '../../types/admin';
import { useNavigate } from 'react-router-dom';
import { boNotificationService } from '../../services/notificationService';
import { NotificationDetailsModal } from '../notifications/NotificationDetailsModal';
import { BONotification } from '../../types/notifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [selectedNotification, setSelectedNotification] = useState<BONotification | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If modal is open, don't close panel from modal backdrop clicks
      if (selectedNotification) return;

      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedNotification) {
          setSelectedNotification(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, selectedNotification]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  // Display strictly the five latest notifications
  const latestFive = notifications.slice(0, 5);

  const handleItemClick = (item: AdminNotification) => {
    // Opening/clicking one notification marks it as read
    onMarkAsRead(item.id);

    // Look up full BONotification record or create from item
    const full = boNotificationService.getNotificationById(item.id);
    if (full) {
      setSelectedNotification(full);
    } else {
      setSelectedNotification({
        id: item.id,
        title: item.title,
        message: item.message || item.title,
        category: (item.category as any) || 'System',
        priority: item.priority || 'Normal',
        read: true,
        actionRequired: item.actionRequired || false,
        relatedReference: item.relatedReference,
        agent: item.agent,
        businessName: item.businessName || 'Lusaka Central Express Agency',
        businessId: item.businessId || 'BIZ-LUS-001',
        rawDate: '2026-09-02',
        createdAt: item.createdAt || item.timestamp,
        timeAgo: item.timestamp,
        actionType: (item.actionType as any) || 'View Request',
        actionUrl: item.actionUrl || '/business-owner/communication/notifications',
      });
    }
  };

  const handleViewAll = () => {
    navigate('/business-owner/communication/notifications');
    onClose();
  };

  const getPriorityDot = (priority?: string) => {
    if (priority === 'Urgent') {
      return <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />;
    }
    if (priority === 'Important') {
      return <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />;
    }
    return <span className="w-2 h-2 rounded-full bg-[#0D93AA] flex-shrink-0" />;
  };

  return (
    <>
      <div
        ref={panelRef}
        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#102025]">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0D93AA]/10 text-[#0D93AA] rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-xs text-[#0D93AA] hover:text-[#0B7F93] font-semibold transition-colors cursor-pointer"
              >
                Mark All as Read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notification List (5 latest items) */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
          {latestFive.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No active notifications
            </div>
          ) : (
            latestFive.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                  item.read
                    ? 'bg-white hover:bg-gray-50/80'
                    : 'bg-sky-50/50 hover:bg-sky-50/80 border-l-2 border-l-[#0D93AA]'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-1 flex-shrink-0">
                    {item.read ? (
                      <span className="w-2 h-2 block rounded-full bg-gray-300" />
                    ) : (
                      getPriorityDot(item.priority)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm truncate ${item.read ? 'text-gray-700 font-normal' : 'text-gray-900 font-semibold'}`}>
                      {item.title}
                    </p>
                    {item.message && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {item.message}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                      <span className="font-medium text-gray-500 uppercase">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                      {item.priority === 'Urgent' && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-rose-600">Urgent</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5 text-gray-400">
                  <ChevronRight size={14} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: View All Notifications */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Showing latest {latestFive.length} of {notifications.length}
          </span>
          <button
            type="button"
            onClick={handleViewAll}
            className="text-xs font-semibold text-[#0D93AA] hover:text-[#0B7F93] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All Notifications</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Notification Details Modal when triggered from panel */}
      {selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          isOpen={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          onToggleRead={(id) => {
            boNotificationService.toggleRead(id);
            const updated = boNotificationService.getNotificationById(id);
            if (updated) setSelectedNotification(updated);
          }}
        />
      )}
    </>
  );
};
