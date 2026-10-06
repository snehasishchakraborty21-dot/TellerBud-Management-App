import React from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Mail,
  Clock,
  Wallet,
  ArrowLeftRight,
  Radio,
  Scale,
  Building2,
  ShieldAlert,
  Bell,
} from 'lucide-react';
import {
  TellerBudNotification,
  NotificationCategory,
  NotificationStatus,
} from '../../types/notificationsPage';

interface NotificationDetailsHeaderCardProps {
  notification: TellerBudNotification;
  onExecutePrimaryAction: () => void;
  onToggleReadStatus: () => void;
  primaryActionLabel?: string;
}

export const NotificationDetailsHeaderCard: React.FC<NotificationDetailsHeaderCardProps> = ({
  notification,
  onExecutePrimaryAction,
  onToggleReadStatus,
  primaryActionLabel = 'Review Withdrawal',
}) => {
  const isUnread = notification.status === 'Unread';

  // Category Badge
  const getCategoryBadge = (category: NotificationCategory) => {
    switch (category) {
      case 'Customer Withdrawal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/25">
            Customer Withdrawal
          </span>
        );
      case 'Business Withdrawal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Business Withdrawal
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
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {category}
          </span>
        );
    }
  };

  // Status Badge
  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'Pending Review':
      case 'Unread':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA] animate-pulse" />
            {notification.withdrawalDetails ? notification.withdrawalDetails.status : 'Pending Review'}
          </span>
        );
      case 'Approved':
      case 'Completed':
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            {notification.withdrawalDetails?.status || status}
          </span>
        );
      case 'Rejected':
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            {notification.withdrawalDetails?.status || status}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            Cancelled
          </span>
        );
      case 'Read':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {notification.withdrawalDetails?.status || 'Read'}
          </span>
        );
    }
  };

  // Plain language summary
  const getPlainSummary = (): string => {
    if (notification.category === 'Customer Withdrawal' || notification.withdrawalType === 'Customer Withdrawal') {
      const details = notification.withdrawalDetails;
      const name = details?.customerName || 'Lombe Kasonde';
      const amount = details?.amount ? `ZMW ${details.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'ZMW 7,200.00';
      const vendor = details?.vendor || 'MTN Mobile Money';
      const phoneDigits = details?.mobileMoneyNumber?.slice(-4) || '9901';
      return `${name} requested to withdraw ${amount} to the ${vendor} number ending in ${phoneDigits}. The request is waiting for your review.`;
    }

    if (notification.category === 'Business Withdrawal' || notification.withdrawalType === 'Business Withdrawal') {
      const details = notification.withdrawalDetails;
      const bizName = details?.businessName || 'Lusaka Central Express Agency';
      const amount = details?.amount ? `ZMW ${details.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'ZMW 25,000.00';
      return `${bizName} requested to withdraw ${amount} from its business wallet. The request is waiting for your review.`;
    }

    return notification.message;
  };

  return (
    <div
      id="notification-details-header-card"
      className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden"
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top line: Title & Action buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {notification.title}
            </h2>

            {/* Badges & Date line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
              {getCategoryBadge(notification.category)}
              <span className="text-gray-300">·</span>
              {getStatusBadge(notification.status)}
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock size={13} className="text-gray-400" />
                <span>{notification.dateTime}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Primary Action Button */}
            <button
              type="button"
              id="btn-primary-action"
              onClick={onExecutePrimaryAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] hover:bg-[#0B7F94] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span>{primaryActionLabel}</span>
              <ExternalLink size={13} />
            </button>

            {/* Toggle Read/Unread */}
            <button
              type="button"
              id="btn-toggle-read"
              onClick={onToggleReadStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-gray-200/80"
            >
              {isUnread ? (
                <>
                  <CheckCircle2 size={14} className="text-[#0D93AA]" />
                  <span>Mark as Read</span>
                </>
              ) : (
                <>
                  <Mail size={14} className="text-gray-500" />
                  <span>Mark as Unread</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 9. Simple Request Summary Box */}
        <div className="p-3.5 bg-gray-50/90 rounded-lg border border-gray-200/70 text-sm text-gray-700 leading-relaxed font-normal">
          {getPlainSummary()}
        </div>
      </div>
    </div>
  );
};
