import React from 'react';
import { AgentAttendanceStatus } from '../../types/admin';
import { CheckCircle2, LogOut, AlertCircle, CircleDashed } from 'lucide-react';

interface AgentAttendanceBadgeProps {
  status: AgentAttendanceStatus;
  checkInTime?: string;
  size?: 'sm' | 'md';
}

export const AgentAttendanceBadge: React.FC<AgentAttendanceBadgeProps> = ({
  status,
  checkInTime,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-0.5 text-xs gap-1.5';

  switch (status) {
    case 'Checked In':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
          title={checkInTime ? `Checked in at ${checkInTime}` : 'Checked In'}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Checked In</span>
        </span>
      );

    case 'Checked Out':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}
          title="Checked Out"
        >
          <LogOut className="w-3 h-3 text-blue-600 shrink-0" />
          <span>Checked Out</span>
        </span>
      );

    case 'No Attendance Record':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}
          title="No Attendance Record Today"
        >
          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
          <span>No Attendance Record</span>
        </span>
      );

    case 'Not Checked In':
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200 ${sizeClasses}`}
          title="Not Checked In Today"
        >
          <CircleDashed className="w-3 h-3 text-gray-400 shrink-0" />
          <span>Not Checked In</span>
        </span>
      );
  }
};
