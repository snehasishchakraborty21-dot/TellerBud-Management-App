import React from 'react';
import { AgentToAgentStatus } from '../../types/admin';
import {
  Timer,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  Hourglass,
} from 'lucide-react';

interface AgentLiquidityStatusBadgeProps {
  status: AgentToAgentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const AgentLiquidityStatusBadge: React.FC<AgentLiquidityStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getBadgeConfig = (
    st: AgentToAgentStatus
  ): {
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
  } => {
    switch (st) {
      case 'Matching':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200/80',
          icon: <Timer className="w-3.5 h-3.5 text-amber-600 animate-pulse" />,
        };
      case 'Agent Matched':
        return {
          bg: 'bg-[#0D93AA]/10',
          text: 'text-[#0D93AA]',
          border: 'border-[#0D93AA]/25',
          icon: <UserCheck className="w-3.5 h-3.5 text-[#0D93AA]" />,
        };
      case 'In Progress':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200/80',
          icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
        };
      case 'Completed':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200/80',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'No Agent Available':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200/80',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
        };
      case 'Expired':
        return {
          bg: 'bg-stone-100',
          text: 'text-stone-700',
          border: 'border-stone-200',
          icon: <Hourglass className="w-3.5 h-3.5 text-stone-500" />,
        };
      case 'Cancelled':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: <Ban className="w-3.5 h-3.5 text-gray-500" />,
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: null,
        };
    }
  };

  const config = getBadgeConfig(status);
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {config.icon}
      <span>{status}</span>
    </span>
  );
};
