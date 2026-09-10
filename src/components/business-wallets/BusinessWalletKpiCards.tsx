import React from 'react';
import {
  Wallet,
  Banknote,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import {
  BusinessWalletSummary,
  BusinessWalletFilters,
} from '../../types/businessWallet';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface BusinessWalletKpiCardsProps {
  summary: BusinessWalletSummary;
  activeKpiFilter: BusinessWalletFilters['kpiFilter'];
  onSelectKpiFilter: (filter: BusinessWalletFilters['kpiFilter']) => void;
}

export const BusinessWalletKpiCards: React.FC<BusinessWalletKpiCardsProps> = ({
  summary,
  activeKpiFilter,
  onSelectKpiFilter,
}) => {
  const cards: {
    id: BusinessWalletFilters['kpiFilter'];
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
      title: 'Total Business Wallets',
      value: summary.totalWallets.toString(),
      icon: Wallet,
      colorClasses: {
        iconBg: 'bg-slate-100',
        iconText: 'text-slate-700',
        valueText: 'text-[#102025]',
      },
    },
    {
      id: 'TOTAL_BALANCE',
      title: 'Total Wallet Balance',
      value: formatZMW(summary.totalWalletBalance),
      icon: Banknote,
      colorClasses: {
        iconBg: 'bg-sky-50',
        iconText: 'text-[#0D93AA]',
        valueText: 'text-[#102025]',
      },
    },
    {
      id: 'AVAILABLE',
      title: 'Total Available Balance',
      value: formatZMW(summary.totalAvailableBalance),
      icon: CheckCircle2,
      colorClasses: {
        iconBg: 'bg-emerald-50',
        iconText: 'text-emerald-600',
        valueText: 'text-emerald-700',
      },
    },
    {
      id: 'RESERVED',
      title: 'Total Reserved Funds',
      value: formatZMW(summary.totalReservedFunds),
      icon: ShieldAlert,
      colorClasses: {
        iconBg: 'bg-amber-50',
        iconText: 'text-amber-600',
        valueText: 'text-amber-700',
      },
    },
    {
      id: 'NEEDS_REVIEW',
      title: 'Wallets Needing Review',
      value: summary.walletsNeedingReview.toString(),
      icon: AlertTriangle,
      colorClasses: {
        iconBg: summary.walletsNeedingReview > 0 ? 'bg-rose-50' : 'bg-slate-50',
        iconText: summary.walletsNeedingReview > 0 ? 'text-rose-600' : 'text-slate-400',
        valueText: summary.walletsNeedingReview > 0 ? 'text-rose-700' : 'text-slate-700',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeKpiFilter === card.id;

        const handleClick = () => {
          if (card.id === 'ALL') {
            onSelectKpiFilter('ALL');
          } else if (activeKpiFilter === card.id) {
            onSelectKpiFilter('ALL');
          } else {
            onSelectKpiFilter(card.id);
          }
        };

        return (
          <button
            key={card.title}
            type="button"
            onClick={handleClick}
            aria-pressed={isSelected}
            className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-150 relative flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] cursor-pointer ${
              isSelected
                ? 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-[#0D93AA]/5 shadow-xs'
                : 'bg-white border-gray-200/90 hover:border-gray-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-600 leading-snug">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.colorClasses.iconBg} ${card.colorClasses.iconText}`}
              >
                <Icon size={15} />
              </div>
            </div>

            <div className="flex items-baseline">
              <span
                className={`text-lg sm:text-xl font-bold tracking-tight ${card.colorClasses.valueText} whitespace-nowrap`}
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
