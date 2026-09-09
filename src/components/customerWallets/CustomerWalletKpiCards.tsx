import React from 'react';
import { Wallet, Banknote, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { CustomerWalletSummary, CustomerWalletFilters } from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';

interface CustomerWalletKpiCardsProps {
  summary: CustomerWalletSummary;
  activeKpiFilter: CustomerWalletFilters['kpiFilter'];
  onSelectKpiFilter: (filter: CustomerWalletFilters['kpiFilter']) => void;
}

export const CustomerWalletKpiCards: React.FC<CustomerWalletKpiCardsProps> = ({
  summary,
  activeKpiFilter,
  onSelectKpiFilter,
}) => {
  const cards: {
    id: CustomerWalletFilters['kpiFilter'];
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    colorClasses: {
      iconBg: string;
      iconText: string;
      valueText: string;
      badge?: string;
    };
  }[] = [
    {
      id: 'ALL',
      title: 'Total Customer Wallets',
      value: summary.totalWallets.toLocaleString(),
      icon: Wallet,
      colorClasses: {
        iconBg: 'bg-slate-100',
        iconText: 'text-slate-700',
        valueText: 'text-[#102025]',
      },
    },
    {
      id: undefined, // Total Wallet Balance
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
      id: 'REVIEW',
      title: 'Wallets Needing Review',
      value: summary.walletsNeedingReview.toString(),
      icon: AlertTriangle,
      colorClasses: {
        iconBg: summary.walletsNeedingReview > 0 ? 'bg-rose-50' : 'bg-slate-50',
        iconText: summary.walletsNeedingReview > 0 ? 'text-rose-600' : 'text-slate-400',
        valueText: summary.walletsNeedingReview > 0 ? 'text-rose-700' : 'text-slate-600',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isClickable = card.id !== undefined || index === 1;
        const isTotalCard = card.id === 'ALL';
        const isSelected =
          (isTotalCard && (activeKpiFilter === 'ALL' || !activeKpiFilter)) ||
          (card.id && card.id === activeKpiFilter);

        const handleClick = () => {
          if (card.id === undefined) {
            onSelectKpiFilter('ALL');
          } else if (activeKpiFilter === card.id && !isTotalCard) {
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
            className={`text-left p-4 rounded-xl border transition-all duration-150 relative flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] ${
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
