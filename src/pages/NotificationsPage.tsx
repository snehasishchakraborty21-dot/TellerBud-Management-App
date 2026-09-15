import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCheck, RefreshCw, Check } from 'lucide-react';
import {
  TellerBudNotification,
  NotificationFiltersState,
} from '../types/notificationsPage';
import { tellerBudNotificationService } from '../services/tellerBudNotificationService';
import { NotificationsSummaryCards } from '../components/notifications/NotificationsSummaryCards';
import { NotificationsFilterBar } from '../components/notifications/NotificationsFilterBar';
import { NotificationsTable } from '../components/notifications/NotificationsTable';
import { NotificationsPagination } from '../components/notifications/NotificationsPagination';
import { NotificationsMarkAllModal } from '../components/notifications/NotificationsMarkAllModal';

const DEFAULT_FILTERS: NotificationFiltersState = {
  search: '',
  category: 'All',
  priority: 'All',
  status: 'All',
  fromDate: '',
  toDate: '',
};

const STORAGE_STATE_KEY = 'tellerbud_notifications_list_state';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Restore filters and pagination if returning from details page
  const [filters, setFilters] = useState<NotificationFiltersState>(() => {
    const fromLocation = (location.state as any)?.filters;
    if (fromLocation) return fromLocation;
    try {
      const saved = sessionStorage.getItem(STORAGE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.filters) return parsed.filters;
      }
    } catch {}
    return DEFAULT_FILTERS;
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const fromLocation = (location.state as any)?.currentPage;
    if (typeof fromLocation === 'number') return fromLocation;
    try {
      const saved = sessionStorage.getItem(STORAGE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.currentPage === 'number') return parsed.currentPage;
      }
    } catch {}
    return 1;
  });

  const [notifications, setNotifications] = useState<TellerBudNotification[]>(() =>
    tellerBudNotificationService.getAll()
  );
  const pageSize = 20;

  const [isMarkAllModalOpen, setIsMarkAllModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preserve state for back navigation
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_STATE_KEY,
        JSON.stringify({ filters, currentPage })
      );
    } catch {}
  }, [filters, currentPage]);

  // Subscribe to service changes
  useEffect(() => {
    const updateList = () => {
      const updated = tellerBudNotificationService.getAll();
      setNotifications(updated);
    };
    const unsubscribe = tellerBudNotificationService.subscribe(updateList);
    return () => unsubscribe();
  }, []);

  // Toast notification auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    return tellerBudNotificationService.getSummaryMetrics();
  }, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesMessage = item.message.toLowerCase().includes(query);
        const matchesRef = item.relatedRecord.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage && !matchesRef && !matchesId) {
          return false;
        }
      }

      // Category
      if (filters.category !== 'All' && item.category !== filters.category) {
        return false;
      }

      // Priority
      if (filters.priority !== 'All' && item.priority !== filters.priority) {
        return false;
      }

      // Status
      if (filters.status !== 'All' && item.status !== filters.status) {
        return false;
      }

      // Date Range
      if (filters.fromDate) {
        const itemDate = item.createdAt.split('T')[0];
        if (itemDate < filters.fromDate) return false;
      }
      if (filters.toDate) {
        const itemDate = item.createdAt.split('T')[0];
        if (itemDate > filters.toDate) return false;
      }

      return true;
    });
  }, [notifications, filters]);

  // Reset page when filter changes (unless restoring)
  const handleFilterChange = (newFilters: NotificationFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Paginated Notifications (20 items per page)
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  // Handlers - Navigate to dedicated full-width Notification Details page
  const handleViewDetails = (item: TellerBudNotification) => {
    // Automatically mark as read if unread when View Details is clicked
    if (item.status === 'Unread') {
      tellerBudNotificationService.markAsRead(item.id, 'Sililo Lubinda (Super Admin)');
    }
    navigate(`/notifications/${item.id}`, {
      state: {
        filters,
        currentPage,
      },
    });
  };

  const handleMarkAsRead = (id: string) => {
    tellerBudNotificationService.markAsRead(id);
    showToast(`Notification ${id} marked as read`);
  };

  const handleMarkAsUnread = (id: string) => {
    tellerBudNotificationService.markAsUnread(id);
    showToast(`Notification ${id} marked as unread`);
  };

  const handleConfirmMarkAllAsRead = () => {
    tellerBudNotificationService.markAllAsRead();
    showToast('All notifications marked as read');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setNotifications(tellerBudNotificationService.getAll());
      setIsRefreshing(false);
      showToast('Notifications list refreshed');
    }, 400);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-2 pb-6 space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl shadow-xl text-xs font-medium animate-in slide-in-from-bottom-2 duration-150">
          <Check size={14} className="text-[#0D93AA]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Toolbar: Mark All as Read aligned on the upper-right */}
      <div className="flex items-center justify-end pt-1">
        <button
          type="button"
          id="btn-mark-all-as-read"
          onClick={() => setIsMarkAllModalOpen(true)}
          disabled={metrics.unread === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7F93] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors cursor-pointer"
          title={
            metrics.unread === 0
              ? 'No unread notifications to mark'
              : 'Mark all unread notifications as read'
          }
        >
          <CheckCheck size={15} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Summary Cards */}
      <NotificationsSummaryCards
        metrics={metrics}
        onFilterUnread={() =>
          handleFilterChange({
            ...DEFAULT_FILTERS,
            status: filters.status === 'Unread' ? 'All' : 'Unread',
          })
        }
        onFilterActionRequired={() => {
          handleFilterChange({
            ...DEFAULT_FILTERS,
            status: 'All',
            priority: 'All',
          });
        }}
        onFilterCritical={() =>
          handleFilterChange({
            ...DEFAULT_FILTERS,
            priority: filters.priority === 'Critical' ? 'All' : 'Critical',
          })
        }
      />

      {/* Filter Bar */}
      <NotificationsFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Table Section */}
      <NotificationsTable
        notifications={paginatedNotifications}
        onViewDetails={handleViewDetails}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsUnread={handleMarkAsUnread}
      />

      {/* Pagination */}
      <NotificationsPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredNotifications.length}
        onPageChange={setCurrentPage}
      />

      {/* Mark All as Read Confirmation Modal */}
      <NotificationsMarkAllModal
        isOpen={isMarkAllModalOpen}
        unreadCount={metrics.unread}
        onConfirm={handleConfirmMarkAllAsRead}
        onClose={() => setIsMarkAllModalOpen(false)}
      />
    </div>
  );
};
