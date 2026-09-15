import React from 'react';
import {
  TellerBudNotification,
  NotificationPriority,
  NotificationStatus,
} from '../../types/notificationsPage';
import {
  Eye,
  CheckCircle2,
  Mail,
  ExternalLink,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface NotificationsTableProps {
  notifications: TellerBudNotification[];
  onViewDetails: (item: TellerBudNotification) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
}

export const NotificationsTable: React.FC<NotificationsTableProps> = ({
  notifications,
  onViewDetails,
  onMarkAsRead,
  onMarkAsUnread,
}) => {
  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'Unread':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA] animate-pulse" />
            Unread
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} className="text-emerald-600" />
            Resolved
          </span>
        );
      case 'Read':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Read
          </span>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80">
        {category}
      </span>
    );
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
          <AlertCircle size={22} />
        </div>
        <h3 className="text-base font-semibold text-gray-900">No notifications found</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          No records match the current filter criteria. Try adjusting your search or clearing
          filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px] lg:min-w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-200/90 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th scope="col" className="py-3 px-4 w-[28%]">
                Notification
              </th>
              <th scope="col" className="py-3 px-3 w-[14%]">
                Category
              </th>
              <th scope="col" className="py-3 px-3 w-[14%]">
                Related Record
              </th>
              <th scope="col" className="py-3 px-3 w-[10%]">
                Priority
              </th>
              <th scope="col" className="py-3 px-3 w-[10%]">
                Status
              </th>
              <th scope="col" className="py-3 px-3 w-[12%]">
                Date and Time
              </th>
              <th scope="col" className="py-3 px-4 w-[12%] text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[13px]">
            {notifications.map((item) => {
              const isUnread = item.status === 'Unread';
              const isResolved = item.status === 'Resolved';

              return (
                <tr
                  key={item.id}
                  id={`row-notification-${item.id}`}
                  className={`transition-colors group ${
                    isUnread
                      ? 'bg-[#F0F9FA]/80 hover:bg-[#E6F4F7]'
                      : 'bg-white hover:bg-gray-50/80'
                  }`}
                >
                  {/* Notification Title & Message */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-start gap-2.5">
                      {isUnread ? (
                        <span
                          className="mt-1.5 w-2 h-2 rounded-full bg-[#0D93AA] shrink-0"
                          title="Unread notification"
                        />
                      ) : (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-transparent shrink-0" />
                      )}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onViewDetails(item)}
                          className="text-left font-semibold text-gray-900 group-hover:text-[#0D93AA] transition-colors leading-snug cursor-pointer block hover:underline"
                        >
                          {item.title}
                        </button>
                        <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    {getCategoryBadge(item.category)}
                  </td>

                  {/* Related Record */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100/90 border border-gray-200/80 px-2 py-0.5 rounded-md inline-block">
                      {item.relatedRecord}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    {getPriorityBadge(item.priority)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Date and Time */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock size={12} className="text-gray-400 shrink-0" />
                      <span>{item.dateTime}</span>
                    </div>
                  </td>

                  {/* Row Actions */}
                  <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        id={`btn-view-details-${item.id}`}
                        onClick={() => onViewDetails(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-md transition-colors cursor-pointer"
                        title="View Notification Details"
                      >
                        <Eye size={12} />
                        <span>View Details</span>
                      </button>

                      {isUnread ? (
                        <button
                          type="button"
                          id={`btn-mark-as-read-${item.id}`}
                          onClick={() => onMarkAsRead(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                          title="Mark as Read"
                        >
                          <CheckCircle2 size={12} className="text-[#0D93AA]" />
                          <span>Mark as Read</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          id={`btn-mark-as-unread-${item.id}`}
                          onClick={() => onMarkAsUnread(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                          title="Mark as Unread"
                        >
                          <Mail size={12} className="text-gray-500" />
                          <span>Mark as Unread</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
