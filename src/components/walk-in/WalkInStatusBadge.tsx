import React from 'react';
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { WalkInTransactionStatus } from '../../types/admin';

interface WalkInStatusBadgeProps {
  status: WalkInTransactionStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const WalkInStatusBadge: React.FC<WalkInStatusBadgeProps> = ({
  status,
  size = 'sm',
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'Processing':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
          icon: Loader2,
          spin: true,
        };
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
        };
      case 'Failed':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: AlertCircle,
        };
      case 'Cancelled':
        return {
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          dot: 'bg-gray-400',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses} whitespace-nowrap select-none ${className}`}
    >
      <Icon
        className={`w-3 h-3 ${config.spin ? 'animate-spin' : ''} shrink-0`}
      />
      <span>{status}</span>
    </span>
  );
};
