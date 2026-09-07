import React from 'react';
import { AgentAssignmentType } from '../../types/admin';
import { Navigation } from 'lucide-react';

interface AgentAssignmentBadgeProps {
  assignment: AgentAssignmentType;
  size?: 'sm' | 'md';
}

export const AgentAssignmentBadge: React.FC<AgentAssignmentBadgeProps> = ({
  assignment,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-0.5 text-xs gap-1.5';

  if (assignment === 'Pickup') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}
        title="Active Pickup Service"
      >
        <Navigation className="w-3 h-3 text-blue-600" />
        <span>Pickup</span>
      </span>
    );
  }

  return <span className="text-gray-400 font-medium">—</span>;
};
