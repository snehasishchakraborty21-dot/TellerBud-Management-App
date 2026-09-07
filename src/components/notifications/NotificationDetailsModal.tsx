import React from 'react';
import {
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  User,
  Hash,
  Eye,
  EyeOff,
  Bell,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BONotification } from '../../types/notifications';
import { boNotificationService } from '../../services/notificationService';

interface NotificationDetailsModalProps {
  notification: BONotification | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead?: (id: string) => void;
}

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  notification,
  isOpen,
  onClose,
  onToggleRead,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !notification) return null;

  const handleNavigateToRecord = () => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const handleToggleRead = () => {
    if (onToggleRead) {
      onToggleRead(notification.id);
    } else {
      boNotificationService.toggleRead(notification.id);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Urgent
          </span>
        );
      case 'Important':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Important
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            Normal
          </span>
        );
    }
  };

  const getReadBadge = (read: boolean) => {
    if (read) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle size={12} className="text-slate-500" />
          <span>Read</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
        <span>Unread</span>
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 flex-shrink-0">
              <Bell size={16} />
            </div>
            <h2 id="notification-modal-title" className="text-base font-bold text-slate-900 truncate">
              Notification Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-sm">
          {/* Notification Title & Priority */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                {notification.category}
              </span>
              {getPriorityBadge(notification.priority)}
              {getReadBadge(notification.read)}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {notification.title}
            </h3>
          </div>

          {/* Event Message */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
            {notification.message}
          </div>

          {/* Key-Value Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-xs text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
                <Hash size={13} className="text-slate-400" />
                Related Reference
              </span>
              <span className="font-mono font-semibold text-slate-900 text-xs">
                {notification.relatedReference || '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-xs text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                Created Timestamp
              </span>
              <span className="font-medium text-slate-800 text-xs">
                {notification.createdAt}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-white sm:col-span-2">
              <span className="text-xs text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
                {notification.agent ? (
                  <User size={13} className="text-slate-400" />
                ) : (
                  <Building2 size={13} className="text-slate-400" />
                )}
                Agent or Business Involved
              </span>
              <span className="font-medium text-slate-900 text-xs">
                {notification.agent
                  ? `${notification.agent.name}${
                      notification.agent.id ? ` (${notification.agent.id})` : ''
                    }`
                  : notification.businessName}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 gap-3">
          <button
            type="button"
            onClick={handleToggleRead}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {notification.read ? (
              <>
                <EyeOff size={13} className="text-slate-500" />
                <span>Mark as Unread</span>
              </>
            ) : (
              <>
                <Eye size={13} className="text-sky-600" />
                <span>Mark as Read</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleNavigateToRecord}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7F93] rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Related Record</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
