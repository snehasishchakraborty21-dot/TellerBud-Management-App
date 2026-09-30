import React from 'react';
import {
  WalletFundingSummary,
  WalletFundingKpiFilter,
} from '../../types/walletFunding';
import { formatZMW } from '../../data/mockWalletFundingData';

interface WalletFundingKpiCardsProps {
  summary: WalletFundingSummary;
  activeKpiFilter: WalletFundingKpiFilter;
  onSelectKpiFilter: (filter: WalletFundingKpiFilter) => void;
}

export const WalletFundingKpiCards: React.FC<WalletFundingKpiCardsProps> = ({
  summary,
  activeKpiFilter,
  onSelectKpiFilter,
}) => {
  const cards: {
    id: WalletFundingKpiFilter;
    title: string;
    value: string;
    valueColor: string;
  }[] = [
    {
      id: 'ALL',
      title: 'TOTAL FUNDING ATTEMPTS',
      value: summary.totalAttempts.toLocaleString(),
      valueColor: 'text-[#102025]',
    },
    {
      id: 'COMPLETED',
      title: 'COMPLETED FUNDING',
      value: formatZMW(summary.completedAmount),
      valueColor: 'text-emerald-700',
    },
    {
      id: 'PENDING_VERIFICATION',
      title: 'PENDING VERIFICATION',
      value: summary.pendingVerificationCount.toLocaleString(),
      valueColor: 'text-amber-700',
    },
    {
      id: 'FAILED_EXPIRED',
      title: 'FAILED / EXPIRED',
      value: summary.failedExpiredCount.toLocaleString(),
      valueColor: summary.failedExpiredCount > 0 ? 'text-rose-700' : 'text-slate-600',
    },
    {
      id: 'REVERSED',
      title: 'REVERSED',
      value: summary.reversedCount.toLocaleString(),
      valueColor: summary.reversedCount > 0 ? 'text-purple-700' : 'text-slate-600',
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
