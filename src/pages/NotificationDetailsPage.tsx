import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { tellerBudNotificationService } from '../services/tellerBudNotificationService';
import { TellerBudNotification } from '../types/notificationsPage';
import { NotificationDetailsHeaderCard } from '../components/notifications/NotificationDetailsHeaderCard';
import { NotificationDetailsInfoCard } from '../components/notifications/NotificationDetailsInfoCard';
import { NotificationDetailsRelatedRecordCard } from '../components/notifications/NotificationDetailsRelatedRecordCard';
import { NotificationDetailsLifecycleCard } from '../components/notifications/NotificationDetailsLifecycleCard';
import { NotificationDetailsActivityCard } from '../components/notifications/NotificationDetailsActivityCard';
import { NotificationResolveModal } from '../components/notifications/NotificationResolveModal';

export const NotificationDetailsPage: React.FC = () => {
  const { notificationId } = useParams<{ notificationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [notification, setNotification] = useState<TellerBudNotification | null>(
    () => (notificationId ? tellerBudNotificationService.getById(notificationId) || null : null)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Sync with service, record viewed, and auto-mark as read if unread
  useEffect(() => {
    if (!notificationId) return;

    // Load initial
    const record = tellerBudNotificationService.getById(notificationId);
    setNotification(record || null);

    if (record) {
      // Record Notification Details Opened event
      tellerBudNotificationService.recordViewed(notificationId);

      // Business rule: Opening full Notification Details page automatically marks unread notification as Read
      if (record.status === 'Unread') {
        tellerBudNotificationService.markAsRead(notificationId, 'Sililo Lubinda (Super Admin)');
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
    // If state was passed via location.state, navigate back to notifications list with state
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

  const handleOpenResolveModal = useCallback(() => {
    setIsResolveModalOpen(true);
  }, []);

  const handleConfirmResolve = useCallback(() => {
    if (!notification) return;
    tellerBudNotificationService.markAsResolved(notification.id);
    setIsResolveModalOpen(false);
    showToast('Notification marked as resolved');
  }, [notification]);

  // Contextual primary action config based on Category
  const getPrimaryActionConfig = () => {
    if (!notification) return { label: 'View Details', route: '/notifications' };

    switch (notification.category) {
      case 'Withdrawal':
        return {
          label: 'Review Withdrawal',
          route: `/super-admin/wallets/customer-withdrawals/${notification.relatedRecord}`,
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

  const handleNavigateToRelatedRecord = (route: string) => {
    navigate(route);
  };

  // 10. Clean Not Found State
  if (!notification) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          type="button"
          id="btn-back-to-notifications-notfound"
          onClick={handleBackToNotifications}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notifications</span>
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 border border-amber-200">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Notification Not Found</h2>
          <p className="text-sm text-gray-500 mt-1.5 max-w-md mx-auto">
            The notification with ID <span className="font-mono font-semibold text-gray-700">{notificationId}</span> could not be located. It may have been removed or does not exist.
          </p>
          <div className="mt-6">
            <button
              type="button"
              id="btn-not-found-back"
              onClick={handleBackToNotifications}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D93AA] hover:bg-[#0B7F94] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
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
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-8"
    >
      {/* 2. Back to Notifications button below page header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="btn-back-to-notifications"
          onClick={handleBackToNotifications}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-gray-500 group-hover:text-gray-900" />
          <span>Back to Notifications</span>
        </button>
      </div>

      {/* 3. Notification Header Card */}
      <NotificationDetailsHeaderCard
        notification={notification}
        onExecutePrimaryAction={handleExecutePrimaryAction}
        onToggleReadStatus={handleToggleReadStatus}
        onMarkAsResolved={handleOpenResolveModal}
        primaryActionLabel={primaryConfig.label}
      />

      {/* 4. Notification Information Card */}
      <NotificationDetailsInfoCard
        notification={notification}
        onNavigateToRelatedRecord={() => handleNavigateToRelatedRecord(primaryConfig.route)}
      />

      {/* 5. Related Record Summary Card */}
      <NotificationDetailsRelatedRecordCard
        notification={notification}
        onNavigateToRelatedRecord={handleNavigateToRelatedRecord}
        primaryActionLabel={primaryConfig.label}
      />

      {/* 6. Notification Lifecycle Timeline */}
      <NotificationDetailsLifecycleCard notification={notification} />

      {/* 7. Notification Activity & Audit History */}
      <NotificationDetailsActivityCard notification={notification} />

      {/* Confirmation Dialog for Mark as Resolved */}
      <NotificationResolveModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={handleConfirmResolve}
        notification={notification}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          id="notification-details-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200"
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
