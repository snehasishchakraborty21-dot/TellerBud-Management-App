import React from 'react';
import { CustomerSummary, CustomerQuickFilter } from '../../types/customer';

interface CustomerSummaryCardsProps {
  summary: CustomerSummary;
  activeFilter: CustomerQuickFilter;
  onSelectFilter: (filter: CustomerQuickFilter) => void;
  isFiltered?: boolean;
}

export const CustomerSummaryCards: React.FC<CustomerSummaryCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter,
}) => {
  const cards: Array<{
    id: CustomerQuickFilter;
    label: string;
    value: number;
    valueColor: string;
    activeBorder: string;
  }> = [
    {
      id: 'ALL',
      label: 'Total Customers',
      value: summary.totalCustomers,
      valueColor: 'text-[#102025]',
      activeBorder: 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-cyan-50/20',
    },
    {
      id: 'ACTIVE_ACCOUNTS',
      label: 'Active Accounts',
      value: summary.activeAccounts,
      valueColor: 'text-emerald-600',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20',
    },
    {
      id: 'ACTIVE_REQUESTS',
      label: 'Active Requests',
      value: summary.activeRequests,
      valueColor: 'text-blue-600',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20',
    },
    {
      id: 'PENDING_WITHDRAWALS',
      label: 'Pending Withdrawals',
      value: summary.pendingWithdrawals,
      valueColor: 'text-amber-600',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20',
    },
    {
      id: 'RECOVERY_SUPPORT',
      label: 'Recovery Support',
      value: summary.recoverySupport,
      valueColor: 'text-rose-600',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full">
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 select-none h-[52px] sm:h-[54px] ${
              isSelected
                ? `${card.activeBorder} shadow-sm`
                : 'bg-white border-gray-100 shadow-2xs hover:border-gray-200 hover:bg-gray-50/60'
            }`}
            aria-pressed={isSelected}
            title={`${card.label}: ${card.value.toLocaleString()}`}
          >
            <span
              className={`text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase truncate ${
                isSelected ? 'text-[#102025]' : 'text-gray-600'
              }`}
            >
              {card.label}
            </span>
            <span
              className={`text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none shrink-0 ${card.valueColor}`}
            >
              {card.value.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
};
