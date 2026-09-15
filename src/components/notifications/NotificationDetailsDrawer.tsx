import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Mail,
  Clock,
  Tag,
  ShieldAlert,
  FileText,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import {
  TellerBudNotification,
  NotificationPriority,
  NotificationStatus,
} from '../../types/notificationsPage';

interface NotificationDetailsDrawerProps {
  notification: TellerBudNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onMarkAsResolved: (id: string) => void;
}

export const NotificationDetailsDrawer: React.FC<NotificationDetailsDrawerProps> = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkAsResolved,
}) => {
  const navigate = useNavigate();

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

  const isUnread = notification.status === 'Unread';
  const isResolved = notification.status === 'Resolved';

  // Contextual primary action config
  const getContextualAction = () => {
    const cat = notification.category;
    let label = 'View Details';
    let path = notification.actionRoute || '/super-admin/dashboard';

    if (cat === 'Withdrawal') {
      label = 'Review Withdrawal';
      path = '/super-admin/wallets/customer-withdrawals';
    } else if (cat === 'Transaction') {
      label = 'View Transaction';
      path = '/super-admin/transactions/all';
    } else if (cat === 'Reconciliation') {
      label = 'View Reconciliation';
      path = notification.actionRoute || '/super-admin/wallets/reconciliation';
    } else if (cat === 'Vendor Eligibility') {
      label = 'View Vendor';
      path = notification.actionRoute || '/super-admin/configuration/vendor-eligibility';
    } else if (cat === 'System') {
      label = notification.actionLabel || 'View Settings';
      path = notification.actionRoute || '/super-admin/configuration/settings';
    } else if (notification.actionLabel) {
      label = notification.actionLabel;
    }

    return { label, path };
  };

  const contextualAction = getContextualAction();

  const handleExecutePrimaryAction = () => {
    // If unread, mark as read when following the action
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
    navigate(contextualAction.path);
    onClose();
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Critical Priority
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            Medium Priority
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'Unread':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA] animate-pulse" />
            Unread
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Resolved
          </span>
        );
      case 'Read':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Read
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-200 animate-in slide-in-from-right duration-200">
          {/* Top Header */}
          <div className="p-5 border-b border-gray-200/80 bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-gray-200 text-gray-800">
                  {notification.id}
                </span>
                <span className="text-xs text-gray-500 font-medium">Notification Details</span>
              </div>
              <button
                type="button"
                id="btn-close-notification-drawer"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                {notification.title}
              </h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {getStatusBadge(notification.status)}
                {getPriorityBadge(notification.priority)}
              </div>
            </div>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="p-5 flex-1 overflow-y-auto space-y-5">
            {/* Message Card */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                Message
              </label>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 text-[13.5px] text-gray-800 leading-relaxed">
                {notification.message}
              </div>
            </div>

            {/* Metadata Details */}
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Metadata & References
              </label>

              <div className="bg-white rounded-xl border border-gray-200/80 divide-y divide-gray-100 text-xs">
                {/* Category */}
                <div className="p-3 flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2 font-medium">
                    <Tag size={14} className="text-gray-400" />
                    Category
                  </span>
                  <span className="font-semibold text-gray-900 px-2 py-0.5 rounded-md bg-slate-100">
                    {notification.category}
                  </span>
                </div>

                {/* Related Record */}
                <div className="p-3 flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2 font-medium">
                    <FileText size={14} className="text-gray-400" />
                    Related Record
                  </span>
                  <button
                    type="button"
                    onClick={handleExecutePrimaryAction}
                    className="inline-flex items-center gap-1 font-mono font-semibold text-[#0D93AA] hover:text-[#0B7A8D] hover:underline cursor-pointer"
                  >
                    <span>{notification.relatedRecord}</span>
                    <ExternalLink size={12} />
                  </button>
                </div>

                {/* Created Date and Time */}
                <div className="p-3 flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2 font-medium">
                    <Clock size={14} className="text-gray-400" />
                    Created Time
                  </span>
                  <span className="font-medium text-gray-800">{notification.dateTime}</span>
                </div>

                {/* Read Date and Time */}
                {notification.readAt && (
                  <div className="p-3 flex items-center justify-between bg-gray-50/50">
                    <span className="text-gray-500 flex items-center gap-2 font-medium">
                      <CheckCheck size={14} className="text-gray-400" />
                      Read Time
                    </span>
                    <span className="font-medium text-gray-800">{notification.readAt}</span>
                  </div>
                )}

                {/* Resolved Date and Time */}
                {notification.resolvedAt && (
                  <div className="p-3 flex items-center justify-between bg-emerald-50/40">
                    <span className="text-emerald-700 flex items-center gap-2 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Resolved Time
                    </span>
                    <span className="font-semibold text-emerald-800">
                      {notification.resolvedAt}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-gray-200/90 bg-[#F8FAFC] space-y-3">
            {/* Contextual Primary Action */}
            <button
              type="button"
              id="btn-drawer-primary-action"
              onClick={handleExecutePrimaryAction}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7F93] transition-colors shadow-2xs cursor-pointer"
            >
              <span>{contextualAction.label}</span>
              <ArrowRight size={15} />
            </button>

            {/* Secondary Controls */}
            <div className="flex items-center gap-2">
              {/* Mark as Read / Unread toggle */}
              {isUnread ? (
                <button
                  type="button"
                  id="btn-drawer-toggle-read"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={14} className="text-[#0D93AA]" />
                  <span>Mark as Read</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-drawer-toggle-unread"
                  onClick={() => onMarkAsUnread(notification.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                >
                  <Mail size={14} className="text-gray-500" />
                  <span>Mark as Unread</span>
                </button>
              )}

              {/* Mark as Resolved button */}
              {!isResolved && (
                <button
                  type="button"
                  id="btn-drawer-mark-resolved"
                  onClick={() => onMarkAsResolved(notification.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                id="btn-drawer-close"
                onClick={onClose}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
