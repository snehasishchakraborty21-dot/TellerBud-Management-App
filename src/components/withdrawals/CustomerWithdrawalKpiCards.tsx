import React from 'react';
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
    valueColor: string;
  }[] = [
    {
      id: 'ALL',
      title: 'TOTAL WITHDRAWAL REQUESTS',
      value: totalCount.toLocaleString(),
      valueColor: 'text-[#102025]',
    },
    {
      id: 'PENDING_REVIEW',
      title: 'PENDING REVIEW',
      value: pendingReviewCount.toLocaleString(),
      valueColor: 'text-amber-700',
    },
    {
      id: 'RESERVED',
      title: 'RESERVED AMOUNT',
      value: formatZMW(reservedAmount),
      valueColor: 'text-cyan-700',
    },
    {
      id: 'PROCESSING',
      title: 'PROCESSING',
      value: processingCount.toLocaleString(),
      valueColor: 'text-purple-700',
    },
    {
      id: 'PAID',
      title: 'PAID',
      value: formatZMW(paidAmount),
      valueColor: 'text-emerald-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {cards.map((card) => {
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
            className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] cursor-pointer ${
              isSelected
                ? 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-[#0D93AA]/5 shadow-xs'
                : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-2xs'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate shrink-0">
              {card.title}
            </span>

            <span
              className={`text-xs sm:text-[13px] font-bold font-mono tracking-tight ${card.valueColor} whitespace-nowrap ml-auto`}
            >
              {card.value}
            </span>
          </button>
        );
      })}
    </div>
  );
};
