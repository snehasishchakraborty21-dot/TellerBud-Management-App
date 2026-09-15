import React from 'react';
import {
  PlusCircle,
  Eye,
  CheckCircle2,
  Check,
  Mail,
  Clock,
  Activity,
} from 'lucide-react';
import {
  TellerBudNotification,
  NotificationActivityEvent,
} from '../../types/notificationsPage';

interface NotificationDetailsActivityCardProps {
  notification: TellerBudNotification;
}

export const NotificationDetailsActivityCard: React.FC<
  NotificationDetailsActivityCardProps
> = ({ notification }) => {
  const activities: NotificationActivityEvent[] =
    notification.activities && notification.activities.length > 0
      ? notification.activities
      : [
          {
            id: `act-fallback-1`,
            event: 'Notification Created',
            actingUserOrSystem: notification.source || 'Customer Withdrawal System',
            previousStatus: '—',
            newStatus: 'Unread',
            dateTime: notification.dateTime || 'Today, 11:52 AM',
          },
          {
            id: `act-fallback-2`,
            event: 'Notification Details Opened',
            actingUserOrSystem: 'Sililo Lubinda (Super Admin)',
            previousStatus: 'Unread',
            newStatus: 'Unread',
            dateTime: 'Today, 11:55 AM',
          },
        ];

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'Notification Created':
        return <PlusCircle className="w-3.5 h-3.5 text-blue-600" />;
      case 'Notification Details Opened':
      case 'Notification Viewed':
        return <Eye className="w-3.5 h-3.5 text-[#0D93AA]" />;
      case 'Marked as Read':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Marked as Resolved':
        return <Check className="w-3.5 h-3.5 text-emerald-700" />;
      case 'Marked as Unread':
        return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === '—' || !status) {
      return <span className="text-gray-400 font-mono text-xs">—</span>;
    }

    switch (status) {
      case 'Unread':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA]" />
            Unread
          </span>
        );
      case 'Read':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Read
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      id="notification-activity-card"
      className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 md:p-6 w-full"
    >
      <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Notification Activity</h2>
        <span className="text-xs text-gray-500 font-medium">
          {activities.length} logged {activities.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th scope="col" className="py-2.5 px-4 w-[28%]">
                Event
              </th>
              <th scope="col" className="py-2.5 px-4 w-[24%]">
                Acting User or System
              </th>
              <th scope="col" className="py-2.5 px-4 w-[16%]">
                Previous Status
              </th>
              <th scope="col" className="py-2.5 px-4 w-[16%]">
                New Status
              </th>
              <th scope="col" className="py-2.5 px-4 w-[16%] text-right">
                Date and Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {activities.map((act) => (
              <tr
                key={act.id}
                className="hover:bg-gray-50/70 transition-colors"
              >
                {/* Event */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <span className="p-1 rounded-md bg-gray-50 border border-gray-200/60 shrink-0">
                      {getEventIcon(act.event)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {act.event}
                    </span>
                  </div>
                </td>

                {/* Acting User or System */}
                <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-700">
                  {act.actingUserOrSystem}
                </td>

                {/* Previous Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {renderStatusBadge(act.previousStatus)}
                </td>

                {/* New Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {renderStatusBadge(act.newStatus)}
                </td>

                {/* Date and Time */}
                <td className="py-3 px-4 whitespace-nowrap text-right text-gray-500 font-medium">
                  <div className="inline-flex items-center gap-1 text-gray-600">
                    <Clock size={11} className="text-gray-400" />
                    <span>{act.dateTime}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
