import React from 'react';
import { Bell, MailOpen, AlertTriangle, AlertCircle } from 'lucide-react';
import { NotificationSummaryMetrics } from '../../types/notificationsPage';

interface NotificationsSummaryCardsProps {
  metrics: NotificationSummaryMetrics;
  onFilterUnread?: () => void;
  onFilterActionRequired?: () => void;
  onFilterCritical?: () => void;
}

export const NotificationsSummaryCards: React.FC<NotificationsSummaryCardsProps> = ({
  metrics,
  onFilterUnread,
  onFilterActionRequired,
  onFilterCritical,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Notifications */}
      <div
        id="card-metric-total"
        className="bg-white rounded-xl border border-gray-200/80 px-4 py-3 shadow-2xs hover:border-gray-300 transition-colors h-[64px] flex items-center justify-between"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <span className="text-[11.5px] sm:text-[12px] font-bold text-gray-600 uppercase tracking-wider truncate">
            Total Notifications
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold text-gray-900 tracking-tight leading-none">
            {metrics.total}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
          <Bell size={14} />
        </div>
      </div>

      {/* 2. Unread Notifications */}
      <div
        id="card-metric-unread"
        onClick={onFilterUnread}
        className="bg-white rounded-xl border border-gray-200/80 px-4 py-3 shadow-2xs hover:border-[#0D93AA]/40 transition-colors cursor-pointer group h-[64px] flex items-center justify-between"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <span className="text-[11.5px] sm:text-[12px] font-bold text-gray-600 group-hover:text-[#0D93AA] uppercase tracking-wider transition-colors truncate">
            Unread
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold text-[#0D93AA] tracking-tight leading-none">
            {metrics.unread}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA] shrink-0">
          <MailOpen size={14} />
        </div>
      </div>

      {/* 3. Action Required */}
      <div
        id="card-metric-action-required"
        onClick={onFilterActionRequired}
        className="bg-white rounded-xl border border-gray-200/80 px-4 py-3 shadow-2xs hover:border-amber-300 transition-colors cursor-pointer group h-[64px] flex items-center justify-between"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <span className="text-[11.5px] sm:text-[12px] font-bold text-gray-600 group-hover:text-amber-700 uppercase tracking-wider transition-colors truncate">
            Action Required
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold text-amber-700 tracking-tight leading-none">
            {metrics.actionRequired}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200/50 shrink-0">
          <AlertTriangle size={14} />
        </div>
      </div>

      {/* 4. Critical Alerts */}
      <div
        id="card-metric-critical"
        onClick={onFilterCritical}
        className="bg-white rounded-xl border border-gray-200/80 px-4 py-3 shadow-2xs hover:border-rose-300 transition-colors cursor-pointer group h-[64px] flex items-center justify-between"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <span className="text-[11.5px] sm:text-[12px] font-bold text-gray-600 group-hover:text-rose-700 uppercase tracking-wider transition-colors truncate">
            Critical Alerts
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold text-rose-700 tracking-tight leading-none">
            {metrics.criticalAlerts}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200/50 shrink-0">
          <AlertCircle size={14} />
        </div>
      </div>
    </div>
  );
};
