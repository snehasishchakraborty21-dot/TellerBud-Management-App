import React from 'react';
import { TransactionStatus } from '../../data/mockAllTransactionsData';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Pending':
    case 'Pending Review':
    case 'Pending Confirmation':
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200/90';
      break;

    case 'Finding an Agent':
    case 'Agent Confirmed':
    case 'Approved':
      badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200/90';
      break;

    case 'Ready for Pickup':
      badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200/90';
      break;

    case 'Processing':
    case 'Reversed':
      badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200/90';
      break;

    case 'Completed':
    case 'Paid':
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
      break;

    case 'Failed':
    case 'Rejected':
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/90';
      break;

    case 'Cancelled':
      badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200/90';
      break;

    default:
      badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200/90';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeStyle} whitespace-nowrap select-none ${className}`}
    >
      {status}
    </span>
  );
};
