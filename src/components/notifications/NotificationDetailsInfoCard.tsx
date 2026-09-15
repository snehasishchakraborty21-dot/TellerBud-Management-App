import React from 'react';
import { ExternalLink } from 'lucide-react';
import {
  TellerBudNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
} from '../../types/notificationsPage';

interface NotificationDetailsInfoCardProps {
  notification: TellerBudNotification;
  onNavigateToRelatedRecord?: () => void;
}

export const NotificationDetailsInfoCard: React.FC<NotificationDetailsInfoCardProps> = ({
  notification,
  onNavigateToRelatedRecord,
}) => {
  // Category Badge
  const renderCategoryBadge = (category: NotificationCategory) => {
    switch (category) {
      case 'Withdrawal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/25">
            Withdrawal
          </span>
        );
      case 'Transaction':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Transaction
          </span>
        );
      case 'Provider/API':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Provider/API
          </span>
        );
      case 'Reconciliation':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Reconciliation
          </span>
        );
      case 'Vendor Eligibility':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Vendor Eligibility
          </span>
        );
      case 'System':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {category}
          </span>
        );
    }
  };

  // Priority Badge
  const renderPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            Low
          </span>
        );
    }
  };

  // Status Badge
  const renderStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'Unread':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA]" />
            Unread
          </span>
        );
      case 'Read':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Read
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Resolved
          </span>
        );
    }
  };

  const source = notification.source || 'Customer Withdrawal System';

  return (
    <div
      id="notification-information-card"
      className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 md:p-6 w-full"
    >
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
        Notification Information
      </h2>

      <div className="space-y-4">
        {/* Prominent Message Box */}
        <div className="bg-gray-50/90 rounded-lg p-4 border border-gray-200/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Message
          </p>
          <p
            id="notification-info-message"
            className="text-sm md:text-base font-medium text-gray-900 leading-relaxed"
          >
            {notification.message}
          </p>
        </div>

        {/* Key-Value Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Category */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Category</p>
            <div>{renderCategoryBadge(notification.category)}</div>
          </div>

          {/* Priority */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Priority</p>
            <div>{renderPriorityBadge(notification.priority)}</div>
          </div>

          {/* Current Status */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Current Status</p>
            <div>{renderStatusBadge(notification.status)}</div>
          </div>

          {/* Related Record */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Related Record</p>
            {onNavigateToRelatedRecord ? (
              <button
                type="button"
                id="notification-info-related-record-btn"
                onClick={onNavigateToRelatedRecord}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-50 hover:bg-cyan-100/90 text-[#0D93AA] hover:text-[#0B7F94] border border-cyan-200/80 transition-colors cursor-pointer group"
                title={`Open ${notification.relatedRecord}`}
              >
                <span>{notification.relatedRecord}</span>
                <ExternalLink className="w-3 h-3 text-[#0D93AA] group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <span
                id="notification-info-related-record"
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-gray-200/70 text-gray-800"
              >
                {notification.relatedRecord}
              </span>
            )}
          </div>

          {/* Source */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 mb-1">Source</p>
            <p
              id="notification-info-source"
              className="text-sm font-semibold text-gray-900"
            >
              {source}
            </p>
          </div>

          {/* Created Date & Time */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 mb-1">Created Date and Time</p>
            <p
              id="notification-info-created-time"
              className="text-sm font-medium text-gray-800"
            >
              {notification.dateTime}
            </p>
          </div>

          {/* Read Date & Time */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 mb-1">Read Date and Time</p>
            <p
              id="notification-info-read-time"
              className={`text-sm ${
                notification.readAt ? 'font-medium text-gray-800' : 'text-gray-400 font-mono'
              }`}
            >
              {notification.readAt || '—'}
            </p>
          </div>

          {/* Resolved Date & Time */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 mb-1">Resolved Date and Time</p>
            <p
              id="notification-info-resolved-time"
              className={`text-sm ${
                notification.resolvedAt
                  ? 'font-medium text-emerald-700'
                  : 'text-gray-400 font-mono'
              }`}
            >
              {notification.resolvedAt || '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
