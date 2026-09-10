import React from 'react';
import {
  PickupRequestStatus,
  FinancialActivityStatus,
  WithdrawalStatus,
  WithdrawalFundsState,
} from '../../types/admin';

interface StatusChipProps {
  status:
    | PickupRequestStatus
    | FinancialActivityStatus
    | WithdrawalStatus
    | WithdrawalFundsState
    | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const getStatusStyles = (
    val: string
  ): { bg: string; text: string; border?: string; dot?: string } => {
    switch (val) {
      case 'Approved':
      case 'Agent Confirmed':
      case 'Ready for Pickup':
        return {
          bg: 'bg-[#0D93AA]/10',
          text: 'text-[#0D93AA]',
          border: 'border-[#0D93AA]/20',
          dot: 'bg-[#0D93AA]',
        };
      case 'Pending Review':
      case 'Matching':
      case 'Finding an Agent':
      case 'Pending':
      case 'Reserved':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200/60',
          dot: 'bg-amber-500',
        };
      case 'Processing':
      case 'Pending Confirmation':
      case 'Initiated':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200/60',
          dot: 'bg-blue-600',
        };
      case 'Active Service':
        return {
          bg: 'bg-sky-50',
          text: 'text-sky-800',
          border: 'border-sky-200/60',
          dot: 'bg-sky-600',
        };
      case 'Fulfilled':
      case 'Paid':
      case 'Completed':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200/60',
          dot: 'bg-emerald-600',
        };
      case 'Rejected':
      case 'No Agent Available':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200/60',
          dot: 'bg-red-500',
        };
      case 'Failed':
      case 'Cancelled':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          dot: 'bg-gray-400',
        };
      case 'Reversed':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200/60',
          dot: 'bg-purple-500',
        };
      // Funds States
      case 'Debited':
        return {
          bg: 'bg-[#0D93AA]/10',
          text: 'text-[#0D93AA]',
          border: 'border-[#0D93AA]/20',
          dot: 'bg-[#0D93AA]',
        };
      case 'Released':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200',
          dot: 'bg-gray-400',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          dot: 'bg-gray-400',
        };
    }
  };

  const styles = getStatusStyles(status);
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold whitespace-nowrap rounded-full border ${
        styles.border || 'border-transparent'
      } ${styles.bg} ${styles.text} ${sizeClasses} ${className}`}
    >
      {styles.dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
      )}
      {status}
    </span>
  );
};

