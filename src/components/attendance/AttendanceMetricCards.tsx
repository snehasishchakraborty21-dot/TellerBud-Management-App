import React from 'react';
import { Users, CheckCircle2, LogOut, AlertCircle } from 'lucide-react';
import { AttendanceMetrics } from '../../types/attendance';

interface AttendanceMetricCardsProps {
  metrics: AttendanceMetrics;
  isCurrentDate?: boolean;
}

export const AttendanceMetricCards: React.FC<AttendanceMetricCardsProps> = ({
  metrics,
}) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Agents',
      value: metrics.totalAgents,
      icon: Users,
      iconBg: 'bg-cyan-50 text-[#0D93AA]',
      accentColor: 'text-gray-900',
    },
    {
      id: 'checked-in',
      label: 'Checked In',
      value: metrics.checkedIn,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      accentColor: 'text-emerald-700',
    },
    {
      id: 'checked-out',
      label: 'Checked Out',
      value: metrics.checkedOut,
      icon: LogOut,
      iconBg: 'bg-blue-50 text-blue-600',
      accentColor: 'text-blue-700',
    },
    {
      id: 'not-checked-in',
      label: 'Not Checked In',
      value: metrics.notCheckedIn,
      icon: AlertCircle,
      iconBg: 'bg-gray-100 text-gray-600',
      accentColor: 'text-gray-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-gray-200/90 px-3.5 sm:px-4 py-2.5 shadow-2xs h-[64px] flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-[12.5px] font-semibold text-gray-700 whitespace-nowrap">
                {card.label}
              </span>
            </div>
            <span
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight shrink-0 ${card.accentColor}`}
            >
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

