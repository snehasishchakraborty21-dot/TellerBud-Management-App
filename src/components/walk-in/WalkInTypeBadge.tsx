import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { WalkInTransactionType } from '../../types/admin';

interface WalkInTypeBadgeProps {
  type: WalkInTransactionType;
  className?: string;
}

export const WalkInTypeBadge: React.FC<WalkInTypeBadgeProps> = ({
  type,
  className = '',
}) => {
  const getConfig = () => {
    switch (type) {
      case 'Deposit':
        return {
          bg: 'bg-teal-50 text-[#0D93AA] border-teal-200',
          icon: ArrowDownLeft,
          label: 'Deposit',
        };
      case 'Withdrawal':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: ArrowUpRight,
          label: 'Withdrawal',
        };
      case 'Purchase':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: ShoppingBag,
          label: 'Purchase',
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: ArrowDownLeft,
          label: type,
        };
    }
  };

  const { bg, icon: Icon, label } = getConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} whitespace-nowrap ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
