import React from 'react';
import { Users, CheckCircle2, LogOut, AlertCircle, HelpCircle } from 'lucide-react';
import { AttendanceMetrics } from '../../types/attendance';

interface AttendanceMetricCardsProps {
  metrics: AttendanceMetrics;
  isCurrentDate?: boolean;
}

export const AttendanceMetricCards: React.FC<AttendanceMetricCardsProps> = ({
  metrics,
  isCurrentDate = true,
}) => {
  const allCards = [
    {
      id: 'total',
      label: 'Total Agents',
      value: metrics.totalAgents,
      icon: Users,
      iconBg: 'bg-cyan-50 text-[#0D93AA]',
      accentColor: 'text-gray-900',
      showForCurrent: true,
      showForPrevious: true,
    },
    {
      id: 'checked-in',
      label: 'Checked In',
      value: metrics.checkedIn,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      accentColor: 'text-emerald-700',
      showForCurrent: true,
      showForPrevious: false,
    },
    {
      id: 'checked-out',
      label: 'Checked Out',
      value: metrics.checkedOut,
      icon: LogOut,
      iconBg: 'bg-blue-50 text-blue-600',
      accentColor: 'text-blue-700',
      showForCurrent: true,
      showForPrevious: true,
    },
    {
      id: 'not-checked-in',
      label: 'Not Checked In',
      value: metrics.notCheckedIn,
      icon: AlertCircle,
      iconBg: 'bg-gray-100 text-gray-600',
      accentColor: 'text-gray-700',
      showForCurrent: true,
      showForPrevious: false,
    },
    {
      id: 'no-attendance-record',
      label: 'No Attendance Record',
      value: metrics.noAttendanceRecord,
      icon: HelpCircle,
      iconBg: 'bg-amber-50 text-amber-600',
      accentColor: 'text-amber-700',
      showForCurrent: false,
      showForPrevious: true,
    },
  ];

  const visibleCards = allCards.filter((c) =>
    isCurrentDate ? c.showForCurrent : c.showForPrevious
  );

  return (
    <div
      className={`grid gap-3.5 ${
        isCurrentDate
          ? 'grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-3'
      }`}
    >
      {visibleCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="flex flex-col justify-between p-4 rounded-xl border border-gray-100 shadow-2xs bg-white"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-semibold text-gray-500 tracking-tight">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold tracking-tight ${card.accentColor}`}>
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
