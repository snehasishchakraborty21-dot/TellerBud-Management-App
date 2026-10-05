import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History, Circle } from 'lucide-react';
import { TellerBudNotification } from '../../types/notificationsPage';

interface NotificationDetailsActivityCardProps {
  notification: TellerBudNotification;
}

export const NotificationDetailsActivityCard: React.FC<NotificationDetailsActivityCardProps> = ({
  notification,
}) => {
  // Collapsed by default
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Generate simple clean readable entries
  const activities = notification.activities && notification.activities.length > 0
    ? notification.activities
    : [
        {
          id: '1',
          event: 'Notification received',
          dateTime: notification.dateTime,
        },
      ];

  return (
    <div
      id="section-activity-history"
      className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden"
    >
      <button
        type="button"
        id="btn-toggle-activity-history"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 bg-gray-50/50 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer text-left select-none"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <History size={16} className="text-gray-500" />
          <span>Activity History</span>
          <span className="text-xs font-normal text-gray-400 ml-1">
            ({activities.length} {activities.length === 1 ? 'event' : 'events'})
          </span>
        </div>
        <div className="text-gray-400 hover:text-gray-600 p-1">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 sm:p-6 border-t border-gray-100 animate-fadeIn">
          <div className="space-y-3">
            {activities.map((act, index) => {
              // Format simple clean line e.g. "Notification received — Today, 11:52 AM"
              const simpleLine = `${act.event} — ${act.dateTime}`;

              return (
                <div
                  key={act.id || `act-entry-${index}`}
                  className="flex items-center gap-3 text-xs text-gray-700"
                >
                  <Circle size={6} className="text-[#0D93AA] fill-[#0D93AA] shrink-0" />
                  <span className="font-medium text-gray-800">{simpleLine}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
