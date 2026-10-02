import React from 'react';
import { Plus } from 'lucide-react';
import { VendorSummaryMetrics } from '../../types/vendor';

interface VendorSummaryCardsProps {
  summary: VendorSummaryMetrics;
  onFilterClick?: (filterType: 'all' | 'active' | 'mobile_money' | 'banking' | 'inactive') => void;
  onAddClick?: () => void;
}

export const VendorSummaryCards: React.FC<VendorSummaryCardsProps> = ({
  summary,
  onFilterClick,
  onAddClick,
}) => {
  const cards = [
    {
      id: 'total-vendors',
      label: 'Total Vendors',
      value: summary.totalVendors,
      color: 'text-[#0D93AA]',
      filterKey: 'all' as const,
    },
    {
      id: 'active-vendors',
      label: 'Active Vendors',
      value: summary.activeVendors,
      color: 'text-emerald-700',
      filterKey: 'active' as const,
    },
    {
      id: 'mobile-money-providers',
      label: 'Mobile Money Providers',
      value: summary.mobileMoneyProviders,
      color: 'text-blue-700',
      filterKey: 'mobile_money' as const,
    },
    {
      id: 'banking-providers',
      label: 'Banking Providers',
      value: summary.bankingProviders,
      color: 'text-indigo-700',
      filterKey: 'banking' as const,
    },
    {
      id: 'inactive-vendors',
      label: 'Inactive Vendors',
      value: summary.inactiveVendors,
      color: 'text-slate-600',
      filterKey: 'inactive' as const,
    },
  ];

  return (
    <div
      id="vendor-summary-cards-row"
      className="flex flex-col lg:flex-row items-stretch gap-2.5 sm:gap-3"
    >
      {/* 5 Equal Flexible-Width KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 flex-1 gap-2.5 sm:gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            id={card.id}
            onClick={() => onFilterClick && onFilterClick(card.filterKey)}
            className={`bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-2xs flex items-center justify-between min-h-[42px] transition-all ${
              onFilterClick ? 'cursor-pointer hover:border-[#0D93AA]/40 hover:shadow-xs' : ''
            }`}
          >
            <span className="text-[12px] font-medium leading-[16px] text-slate-600 truncate mr-2">
              {card.label}
            </span>
            <span
              className={`text-[14px] font-bold leading-[18px] font-mono ${card.color} shrink-0`}
            >
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Add Button at Far-Right */}
      {onAddClick && (
        <button
          id="btn-add-vendor-kpi"
          type="button"
          onClick={onAddClick}
          aria-label="Add Vendor"
          className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0D93AA] hover:bg-[#0b8094] active:bg-[#09697a] text-white text-[13px] font-semibold leading-[18px] rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap min-w-[85px] min-h-[42px] self-stretch"
          title="Register a new vendor"
        >
          <Plus size={15} className="shrink-0" />
          <span>Add</span>
        </button>
      )}
    </div>
  );
};
