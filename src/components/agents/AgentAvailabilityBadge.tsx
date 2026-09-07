import React from 'react';
import { AgentAvailabilityStatus } from '../../types/admin';

interface AgentAvailabilityBadgeProps {
  status: AgentAvailabilityStatus | 'Online';
  size?: 'sm' | 'md';
}

export const AgentAvailabilityBadge: React.FC<AgentAvailabilityBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-1.5';

  switch (status) {
    case 'Available':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Available</span>
        </span>
      );

    case 'On Active Request':
    case 'Assigned':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-cyan-50 text-[#0D93AA] border border-cyan-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA] shrink-0" />
          <span>On Active Request</span>
        </span>
      );

    case 'Online':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
          <span>Online</span>
        </span>
      );

    case 'Offline':
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
          <span>Offline</span>
        </span>
      );
  }
};
