import React from 'react';
import { CheckCheck, X } from 'lucide-react';

interface NotificationsMarkAllModalProps {
  isOpen: boolean;
  unreadCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const NotificationsMarkAllModal: React.FC<NotificationsMarkAllModalProps> = ({
  isOpen,
  unreadCount,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA]">
                <CheckCheck size={18} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Mark All as Read</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="py-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to mark all{' '}
              <span className="font-semibold text-gray-900">{unreadCount}</span> unread
              notifications as read?
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-confirm-mark-all-read"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7F93] rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              Mark All Read
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
