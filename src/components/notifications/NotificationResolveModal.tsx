import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { TellerBudNotification } from '../../types/notificationsPage';

interface NotificationResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  notification: TellerBudNotification;
}

export const NotificationResolveModal: React.FC<NotificationResolveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  notification,
}) => {
  if (!isOpen) return null;

  const isUnread = notification.status === 'Unread';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolve-modal-title"
    >
      <div
        id="resolve-confirmation-dialog"
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden transform transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="resolve-modal-title" className="text-base font-bold text-gray-900">
                Mark as Resolved
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                {notification.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            Are you sure you want to mark this notification as <strong className="text-gray-900 font-semibold">Resolved</strong>?
          </p>

          {isUnread && (
            <div className="rounded-lg bg-sky-50/80 border border-sky-200/80 p-3 flex items-start gap-2.5 text-xs text-sky-900 leading-normal">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                Because this notification is currently <strong>Unread</strong>, confirming will automatically mark it as <strong>Read</strong> first before completing resolution.
              </span>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Notification:</span>
              <span className="font-semibold text-gray-900 text-right truncate max-w-[200px]">{notification.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium text-gray-800">{notification.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current Status:</span>
              <span className="font-semibold text-[#0D93AA]">{notification.status}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50/80 px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="btn-cancel-resolve"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200/70 border border-gray-300 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-resolve"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Confirm Resolution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
