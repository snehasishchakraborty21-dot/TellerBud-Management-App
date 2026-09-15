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
      {/* Total Notifications */}
      <div
        id="card-metric-total"
        className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-600">Total Notifications</span>
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
            <Bell size={16} />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">{metrics.total}</span>
          <span className="text-xs text-gray-500 font-medium">recorded in system</span>
        </div>
      </div>

      {/* Unread Notifications */}
      <div
        id="card-metric-unread"
        onClick={onFilterUnread}
        className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs hover:border-[#0D93AA]/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-600 group-hover:text-[#0D93AA] transition-colors">
            Unread
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA]">
            <MailOpen size={16} />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#0D93AA] tracking-tight">{metrics.unread}</span>
          <span className="text-xs text-gray-500 font-medium">requiring attention</span>
        </div>
      </div>

      {/* Action Required */}
      <div
        id="card-metric-action-required"
        onClick={onFilterActionRequired}
        className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs hover:border-amber-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-600 group-hover:text-amber-700 transition-colors">
            Action Required
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200/50">
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-700 tracking-tight">
            {metrics.actionRequired}
          </span>
          <span className="text-xs text-gray-500 font-medium">pending resolution</span>
        </div>
      </div>

      {/* Critical Alerts */}
      <div
        id="card-metric-critical"
        onClick={onFilterCritical}
        className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs hover:border-rose-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-600 group-hover:text-rose-700 transition-colors">
            Critical Alerts
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200/50">
            <AlertCircle size={16} />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-700 tracking-tight">
            {metrics.criticalAlerts}
          </span>
          <span className="text-xs text-gray-500 font-medium">high-severity items</span>
        </div>
      </div>
    </div>
  );
};
