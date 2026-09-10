import React from 'react';
import {
  Layers,
  Clock,
  Lock,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { formatZMW } from '../../utils/formatters';

export type WithdrawalKpiFilter =
  | 'ALL'
  | 'PENDING_REVIEW'
  | 'RESERVED'
  | 'PROCESSING'
  | 'PAID';

export interface CustomerWithdrawalKpiCardsProps {
  totalCount: number;
  pendingReviewCount: number;
  reservedAmount: number;
  processingCount: number;
  paidAmount: number;
  activeKpiFilter: WithdrawalKpiFilter;
  onSelectKpiFilter: (filter: WithdrawalKpiFilter) => void;
}

export const CustomerWithdrawalKpiCards: React.FC<CustomerWithdrawalKpiCardsProps> = ({
  totalCount,
  pendingReviewCount,
  reservedAmount,
  processingCount,
  paidAmount,
  activeKpiFilter,
  onSelectKpiFilter,
}) => {
  const cards: {
    id: WithdrawalKpiFilter;
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    colorClasses: {
      iconBg: string;
      iconText: string;
      valueText: string;
    };
  }[] = [
    {
      id: 'ALL',
      title: 'Total Withdrawal Requests',
      value: totalCount.toString(),
      icon: Layers,
      colorClasses: {
        iconBg: 'bg-slate-100',
        iconText: 'text-slate-700',
        valueText: 'text-[#102025]',
      },
    },
    {
      id: 'PENDING_REVIEW',
      title: 'Pending Review',
      value: pendingReviewCount.toString(),
      icon: Clock,
      colorClasses: {
        iconBg: 'bg-amber-50',
        iconText: 'text-amber-600',
        valueText: 'text-amber-700',
      },
    },
    {
      id: 'RESERVED',
      title: 'Reserved Amount',
      value: formatZMW(reservedAmount),
      icon: Lock,
      colorClasses: {
        iconBg: 'bg-cyan-50',
        iconText: 'text-[#0D93AA]',
        valueText: 'text-slate-900',
      },
    },
    {
      id: 'PROCESSING',
      title: 'Processing',
      value: processingCount.toString(),
      icon: Activity,
      colorClasses: {
        iconBg: 'bg-purple-50',
        iconText: 'text-purple-600',
        valueText: 'text-purple-700',
      },
    },
    {
      id: 'PAID',
      title: 'Paid',
      value: formatZMW(paidAmount),
      icon: CheckCircle2,
      colorClasses: {
        iconBg: 'bg-emerald-50',
        iconText: 'text-emerald-600',
        valueText: 'text-emerald-700',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isTotalCard = card.id === 'ALL';
        const isSelected =
          (isTotalCard && (activeKpiFilter === 'ALL' || !activeKpiFilter)) ||
          card.id === activeKpiFilter;

        const handleClick = () => {
          if (activeKpiFilter === card.id && !isTotalCard) {
            onSelectKpiFilter('ALL');
          } else {
            onSelectKpiFilter(card.id);
          }
        };

        return (
          <button
            key={card.id}
            type="button"
            onClick={handleClick}
            aria-pressed={isSelected}
            className={`text-left p-4 rounded-xl border transition-all duration-150 relative flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] cursor-pointer ${
              isSelected
                ? 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-[#0D93AA]/5 shadow-sm'
                : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-medium text-slate-600 leading-snug">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.colorClasses.iconBg} ${card.colorClasses.iconText}`}
              >
                <Icon size={14} />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-auto">
              <span
                className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${card.colorClasses.valueText}`}
              >
                {card.value}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
