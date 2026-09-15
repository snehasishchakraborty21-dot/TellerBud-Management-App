import React from 'react';
import { Building2, CheckCircle2, Smartphone, Landmark, AlertCircle } from 'lucide-react';
import { VendorSummaryMetrics } from '../../types/vendor';

interface VendorSummaryCardsProps {
  summary: VendorSummaryMetrics;
  onFilterClick?: (filterType: 'all' | 'active' | 'mobile_money' | 'banking' | 'inactive') => void;
}

export const VendorSummaryCards: React.FC<VendorSummaryCardsProps> = ({
  summary,
  onFilterClick,
}) => {
  const cards = [
    {
      id: 'total-vendors',
      label: 'Total Vendors',
      value: summary.totalVendors,
      icon: Building2,
      color: 'text-[#0D93AA]',
      bgIcon: 'bg-teal-50 text-[#0D93AA]',
      filterKey: 'all' as const,
    },
    {
      id: 'active-vendors',
      label: 'Active Vendors',
      value: summary.activeVendors,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgIcon: 'bg-emerald-50 text-emerald-700',
      filterKey: 'active' as const,
    },
    {
      id: 'mobile-money-providers',
      label: 'Mobile Money Providers',
      value: summary.mobileMoneyProviders,
      icon: Smartphone,
      color: 'text-blue-700',
      bgIcon: 'bg-blue-50 text-blue-700',
      filterKey: 'mobile_money' as const,
    },
    {
      id: 'banking-providers',
      label: 'Banking Providers',
      value: summary.bankingProviders,
      icon: Landmark,
      color: 'text-indigo-700',
      bgIcon: 'bg-indigo-50 text-indigo-700',
      filterKey: 'banking' as const,
    },
    {
      id: 'inactive-vendors',
      label: 'Inactive Vendors',
      value: summary.inactiveVendors,
      icon: AlertCircle,
      color: 'text-slate-600',
      bgIcon: 'bg-slate-100 text-slate-600',
      filterKey: 'inactive' as const,
    },
  ];

  return (
    <div
      id="vendor-summary-cards"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5"
    >
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            onClick={() => onFilterClick && onFilterClick(card.filterKey)}
            className={`bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col justify-between transition-all ${
              onFilterClick ? 'cursor-pointer hover:border-[#0D93AA]/40 hover:shadow-sm' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg shrink-0 ${card.bgIcon}`}>
                <IconComponent size={15} />
              </div>
            </div>
            <div className="mt-2.5">
              <div className={`text-2xl font-bold font-mono ${card.color}`}>
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
