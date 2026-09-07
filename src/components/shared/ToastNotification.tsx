import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#102025] text-white text-sm font-medium rounded-xl shadow-2xl border border-gray-700 animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss toast"
        className="p-1 text-gray-400 hover:text-white rounded-md transition-colors ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
