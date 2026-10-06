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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            <span>Critical</span>
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
            <span>High</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
            <span>Medium</span>
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
            <span>Low</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'Unread':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA] animate-pulse shrink-0" />
            <span>Unread</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
            <span>Resolved</span>
          </span>
        );
      case 'Read':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            <span>Read</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Customer Withdrawal':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/20">
            Customer Withdrawal
          </span>
        );
      case 'Business Withdrawal':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Business Withdrawal
          </span>
        );
      case 'Transaction':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Transaction
          </span>
        );
      case 'Provider/API':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            Provider/API
          </span>
        );
      case 'Reconciliation':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Reconciliation
          </span>
        );
      case 'Vendor Eligibility':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Vendor Eligibility
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80">
            {category}
          </span>
        );
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center p-8 bg-white">
        <div className="text-center space-y-2 max-w-sm">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
            <AlertCircle size={22} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No notifications found</h3>
          <p className="text-xs text-gray-500">
            No records match the current filter criteria. Try adjusting your search or clearing filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Notifications listing"
      className="flex-1 min-h-0 overflow-y-auto overflow-x-auto focus:outline-none focus:ring-1 focus:ring-[#0D93AA]/30"
    >
      <table className="w-full text-left border-collapse min-w-[960px] lg:min-w-full">
        <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs border-b border-gray-200 text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 select-none shadow-[0_1px_0_0_#E5E7EB]">
          <tr>
            {/* 1. Notification */}
            <th scope="col" className="py-3 px-4 text-left min-w-[260px] w-[30%]">
              Notification
            </th>
            {/* 2. Category */}
            <th scope="col" className="py-3 px-3 text-left whitespace-nowrap min-w-[130px] w-[13%]">
              Category
            </th>
            {/* 3. Related Record */}
            <th scope="col" className="py-3 px-3 text-left whitespace-nowrap min-w-[130px] w-[13%]">
              Related Record
            </th>
            {/* 4. Priority */}
            <th scope="col" className="py-3 px-3 text-left whitespace-nowrap min-w-[95px] w-[10%]">
              Priority
            </th>
            {/* 5. Status */}
            <th scope="col" className="py-3 px-3 text-left whitespace-nowrap min-w-[95px] w-[10%]">
              Status
            </th>
            {/* 6. Date and Time */}
            <th scope="col" className="py-3 px-3 text-left whitespace-nowrap min-w-[130px] w-[12%]">
              Date and Time
            </th>
            {/* 7. Action */}
            <th scope="col" className="py-3 px-4 text-left whitespace-nowrap min-w-[180px] w-[12%]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-[12.5px] sm:text-[13px]">
          {notifications.map((item) => {
            const isUnread = item.status === 'Unread';

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
                {/* 1. Notification Title & Message */}
                <td className="py-3 px-4 align-top text-left">
                  <div className="flex items-start gap-2.5">
                    {isUnread ? (
                      <span
                        className="mt-1.5 w-2 h-2 rounded-full bg-[#0D93AA] shrink-0"
                        title="Unread notification"
                      />
                    ) : (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-transparent shrink-0" />
                    )}
                    <div className="min-w-0 text-left">
                      <button
                        type="button"
                        onClick={() => onViewDetails(item)}
                        className="text-left font-semibold text-gray-900 group-hover:text-[#0D93AA] transition-colors leading-snug cursor-pointer block hover:underline"
                      >
                        {item.title}
                      </button>
                      <p
                        className="text-[12px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed text-left"
                        title={item.message}
                      >
                        {item.message}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Category */}
                <td className="py-3 px-3 align-top whitespace-nowrap text-left">
                  {getCategoryBadge(item.category)}
                </td>

                {/* 3. Related Record */}
                <td className="py-3 px-3 align-top whitespace-nowrap text-left">
                  <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100/90 border border-gray-200/80 px-2 py-0.5 rounded-md inline-block">
                    {item.relatedRecord}
                  </span>
                </td>

                {/* 4. Priority */}
                <td className="py-3 px-3 align-top whitespace-nowrap text-left">
                  {getPriorityBadge(item.priority)}
                </td>

                {/* 5. Status */}
                <td className="py-3 px-3 align-top whitespace-nowrap text-left">
                  {getStatusBadge(item.status)}
                </td>

                {/* 6. Date and Time */}
                <td className="py-3 px-3 align-top whitespace-nowrap text-xs text-gray-500 font-medium text-left">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock size={12} className="text-gray-400 shrink-0" />
                    <span>{item.dateTime}</span>
                  </div>
                </td>

                {/* 7. Action (Left-aligned, View Details and Mark as Read side-by-side) */}
                <td className="py-3 px-4 align-top whitespace-nowrap text-left">
                  <div className="flex items-center justify-start gap-1.5 text-left">
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
  );
};
