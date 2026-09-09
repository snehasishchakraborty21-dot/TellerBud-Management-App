import React from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertOctagon,
  RotateCcw,
} from 'lucide-react';
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
    icon: React.ComponentType<{ className?: string; size?: number }>;
    colorClasses: {
      iconBg: string;
      iconText: string;
      valueText: string;
    };
  }[] = [
    {
      id: 'ALL',
      title: 'Total Funding Attempts',
      value: summary.totalAttempts.toLocaleString(),
      icon: Layers,
      colorClasses: {
        iconBg: 'bg-slate-100',
        iconText: 'text-slate-700',
        valueText: 'text-[#102025]',
      },
    },
    {
      id: 'COMPLETED',
      title: 'Completed Funding',
      value: formatZMW(summary.completedAmount),
      icon: CheckCircle2,
      colorClasses: {
        iconBg: 'bg-emerald-50',
        iconText: 'text-emerald-600',
        valueText: 'text-emerald-700',
      },
    },
    {
      id: 'PENDING_VERIFICATION',
      title: 'Pending Verification',
      value: summary.pendingVerificationCount.toLocaleString(),
      icon: Clock,
      colorClasses: {
        iconBg: 'bg-amber-50',
        iconText: 'text-amber-600',
        valueText: 'text-amber-700',
      },
    },
    {
      id: 'FAILED_EXPIRED',
      title: 'Failed / Expired',
      value: summary.failedExpiredCount.toLocaleString(),
      icon: AlertOctagon,
      colorClasses: {
        iconBg: summary.failedExpiredCount > 0 ? 'bg-rose-50' : 'bg-slate-50',
        iconText: summary.failedExpiredCount > 0 ? 'text-rose-600' : 'text-slate-400',
        valueText: summary.failedExpiredCount > 0 ? 'text-rose-700' : 'text-slate-600',
      },
    },
    {
      id: 'REVERSED',
      title: 'Reversed',
      value: summary.reversedCount.toLocaleString(),
      icon: RotateCcw,
      colorClasses: {
        iconBg: summary.reversedCount > 0 ? 'bg-purple-50' : 'bg-slate-50',
        iconText: summary.reversedCount > 0 ? 'text-purple-600' : 'text-slate-400',
        valueText: summary.reversedCount > 0 ? 'text-purple-700' : 'text-slate-600',
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
