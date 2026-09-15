import React from 'react';
import {
  Wallet,
  ArrowLeftRight,
  Radio,
  Scale,
  Building2,
  ShieldAlert,
  Clock,
  ExternalLink,
  CheckCircle2,
  Mail,
  Check,
  Bell,
} from 'lucide-react';
import {
  TellerBudNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
} from '../../types/notificationsPage';

interface NotificationDetailsHeaderCardProps {
  notification: TellerBudNotification;
  onExecutePrimaryAction: () => void;
  onToggleReadStatus: () => void;
  onMarkAsResolved: () => void;
  primaryActionLabel: string;
}

export const NotificationDetailsHeaderCard: React.FC<NotificationDetailsHeaderCardProps> = ({
  notification,
  onExecutePrimaryAction,
  onToggleReadStatus,
  onMarkAsResolved,
  primaryActionLabel,
}) => {
  const isUnread = notification.status === 'Unread';
  const isResolved = notification.status === 'Resolved';

  // Category Icon
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Withdrawal':
        return <Wallet className="w-5 h-5 text-[#0D93AA]" aria-hidden="true" />;
      case 'Transaction':
        return <ArrowLeftRight className="w-5 h-5 text-blue-600" aria-hidden="true" />;
      case 'Provider/API':
        return <Radio className="w-5 h-5 text-purple-600" aria-hidden="true" />;
      case 'Reconciliation':
        return <Scale className="w-5 h-5 text-amber-600" aria-hidden="true" />;
      case 'Vendor Eligibility':
        return <Building2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />;
      case 'System':
        return <ShieldAlert className="w-5 h-5 text-slate-700" aria-hidden="true" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" aria-hidden="true" />;
    }
  };

  const getCategoryIconBg = (category: NotificationCategory) => {
    switch (category) {
      case 'Withdrawal':
        return 'bg-[#0D93AA]/10 border-[#0D93AA]/20';
      case 'Transaction':
        return 'bg-blue-50 border-blue-200';
      case 'Provider/API':
        return 'bg-purple-50 border-purple-200';
      case 'Reconciliation':
        return 'bg-amber-50 border-amber-200';
      case 'Vendor Eligibility':
        return 'bg-emerald-50 border-emerald-200';
      case 'System':
        return 'bg-slate-100 border-slate-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Category Badge
  const getCategoryBadge = (category: NotificationCategory) => {
    switch (category) {
      case 'Withdrawal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/25">
            Withdrawal
          </span>
        );
      case 'Transaction':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Transaction
          </span>
        );
      case 'Provider/API':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Provider/API
          </span>
        );
      case 'Reconciliation':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Reconciliation
          </span>
        );
      case 'Vendor Eligibility':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Vendor Eligibility
          </span>
        );
      case 'System':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {category}
          </span>
        );
    }
  };

  // Priority Badge (with visible text and indicator)
  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Critical Priority
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            Medium Priority
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            Low Priority
          </span>
        );
    }
  };

  // Status Badge (with visible text)
  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'Unread':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA] animate-pulse" />
            Unread
          </span>
        );
      case 'Read':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Read
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div
      id="notification-header-card"
      className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 md:p-6 w-full"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Info: Icon, Title, ID, Badges, Created */}
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${getCategoryIconBg(
              notification.category
            )}`}
          >
            {getCategoryIcon(notification.category)}
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                id="notification-details-title"
                className="text-lg md:text-xl font-bold text-gray-900 tracking-tight"
              >
                {notification.title}
              </h1>
              <span
                id="notification-details-id-badge"
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200"
              >
                {notification.id}
              </span>
            </div>

            {/* Badges & Created Date/Time */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {getCategoryBadge(notification.category)}
              {getPriorityBadge(notification.priority)}
              {getStatusBadge(notification.status)}

              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium pl-1">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>Created: {notification.dateTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions: Review Action, Mark Read/Unread, Mark as Resolved */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          {/* Contextual Primary Action */}
          <button
            type="button"
            id="btn-notification-primary-action"
            onClick={onExecutePrimaryAction}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7F94] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span>{primaryActionLabel}</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Mark as Read or Mark as Unread */}
          {isUnread ? (
            <button
              type="button"
              id="btn-toggle-read-status"
              onClick={onToggleReadStatus}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0D93AA]" />
              <span>Mark as Read</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-toggle-read-status"
              onClick={onToggleReadStatus}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-gray-500" />
              <span>Mark as Unread</span>
            </button>
          )}

          {/* Mark as Resolved */}
          {!isResolved ? (
            <button
              type="button"
              id="btn-mark-as-resolved"
              onClick={onMarkAsResolved}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Mark as Resolved</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-mark-as-resolved-disabled"
              disabled
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50/70 border border-emerald-200/70 rounded-lg opacity-80 cursor-not-allowed"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Resolved</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
