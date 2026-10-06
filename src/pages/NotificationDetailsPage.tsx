import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { tellerBudNotificationService } from '../services/tellerBudNotificationService';
import { TellerBudNotification } from '../types/notificationsPage';
import { NotificationDetailsHeaderCard } from '../components/notifications/NotificationDetailsHeaderCard';
import { NotificationDetailsWithdrawalCard } from '../components/notifications/NotificationDetailsWithdrawalCard';
import { NotificationDetailsActivityCard } from '../components/notifications/NotificationDetailsActivityCard';

export const NotificationDetailsPage: React.FC = () => {
  const { notificationId } = useParams<{ notificationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [notification, setNotification] = useState<TellerBudNotification | null>(
    () => (notificationId ? tellerBudNotificationService.getById(notificationId) || null : null)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with service, record viewed, and auto-mark as read if unread
  useEffect(() => {
    if (!notificationId) return;

    // Load initial
    const record = tellerBudNotificationService.getById(notificationId);
    setNotification(record || null);

    if (record) {
      // Record Notification viewed
      tellerBudNotificationService.recordViewed(notificationId);

      // Business rule: Opening full Notification Details page automatically marks unread notification as Read
      if (record.status === 'Unread') {
        tellerBudNotificationService.markAsRead(notificationId, 'Sililo Lubinda');
      }
    }

    // Subscribe to state mutations
    const unsubscribe = tellerBudNotificationService.subscribe(() => {
      const updated = tellerBudNotificationService.getById(notificationId);
      setNotification(updated || null);
    });

    return () => unsubscribe();
  }, [notificationId]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Back Navigation preserving filters and pagination
  const handleBackToNotifications = useCallback(() => {
    const returnPath = location.pathname.startsWith('/super-admin')
      ? '/super-admin/configuration/notifications'
      : '/notifications';

    navigate(returnPath, {
      state: location.state,
    });
  }, [navigate, location.state, location.pathname]);

  // Actions
  const handleToggleReadStatus = useCallback(() => {
    if (!notification) return;
    if (notification.status === 'Unread') {
      tellerBudNotificationService.markAsRead(notification.id);
      showToast('Notification marked as read');
    } else {
      tellerBudNotificationService.markAsUnread(notification.id);
      showToast('Notification marked as unread');
    }
  }, [notification]);

  // Review Withdrawal & Primary Navigation
  const getPrimaryActionConfig = () => {
    if (!notification) return { label: 'View Details', route: '/notifications' };

    switch (notification.category) {
      case 'Customer Withdrawal':
      case 'Withdrawal':
        return {
          label: 'Review Withdrawal',
          route: `/super-admin/wallets/customer-withdrawals/${notification.relatedRecord}`,
        };
      case 'Business Withdrawal':
        return {
          label: 'Review Withdrawal',
          route: '/super-admin/wallets/business-agent',
        };
      case 'Transaction':
        return {
          label: 'View Transaction',
          route: '/super-admin/transactions/all',
        };
      case 'Provider/API':
        return {
          label: 'View Vendor',
          route: '/super-admin/configuration/vendors',
        };
      case 'Reconciliation':
        return {
          label: 'View Reconciliation',
          route: '/super-admin/wallets/reconciliation',
        };
      case 'Vendor Eligibility':
        return {
          label: 'View Vendor Eligibility',
          route: '/super-admin/configuration/vendor-eligibility',
        };
      case 'System':
      default:
        return {
          label: 'View System Settings',
          route: '/super-admin/configuration/service-modes',
        };
    }
  };

  const primaryConfig = getPrimaryActionConfig();

  const handleExecutePrimaryAction = () => {
    navigate(primaryConfig.route);
  };

  // Not Found State
  if (!notification) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-5 pb-12 w-full animate-fadeIn">
        <div>
          <button
            type="button"
            id="btn-back-to-notifications-notfound"
            onClick={handleBackToNotifications}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0B7F94] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Notifications</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 border border-amber-200">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-base font-bold text-gray-900">Notification Not Found</h2>
          <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto">
            The notification with ID <span className="font-mono font-semibold text-gray-700">{notificationId}</span> could not be located.
          </p>
          <div className="mt-6">
            <button
              type="button"
              id="btn-not-found-back"
              onClick={handleBackToNotifications}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] hover:bg-[#0B7F94] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Notifications</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="notification-details-page-root"
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-5 pb-12 w-full animate-fadeIn"
    >
      {/* Back to Notifications Navigation */}
      <div>
        <button
          type="button"
          id="btn-back-to-notifications"
          onClick={handleBackToNotifications}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0D93AA] transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-gray-500 group-hover:text-[#0D93AA]" />
          <span>Back to Notifications</span>
        </button>
      </div>

      {/* Notification Header Card with Plain-Language Summary */}
      <NotificationDetailsHeaderCard
        notification={notification}
        onExecutePrimaryAction={handleExecutePrimaryAction}
        onToggleReadStatus={handleToggleReadStatus}
        primaryActionLabel={primaryConfig.label}
      />

      {/* 10 & 11. Single Compact "Withdrawal Details" Section */}
      <NotificationDetailsWithdrawalCard notification={notification} />

      {/* 13. Simplified Collapsed Activity History */}
      <NotificationDetailsActivityCard notification={notification} />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          id="notification-details-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDetailsPage;
