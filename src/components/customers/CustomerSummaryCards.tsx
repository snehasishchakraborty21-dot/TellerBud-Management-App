import React from 'react';
import { CustomerSummary, CustomerQuickFilter } from '../../types/customer';
import { Users, UserCheck, Activity, ArrowUpRight, ShieldAlert } from 'lucide-react';

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
  isFiltered = false,
}) => {
  const cards: Array<{
    id: CustomerQuickFilter;
    label: string;
    value: number;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    activeBorder: string;
    description: string;
  }> = [
    {
      id: 'ALL',
      label: 'TOTAL CUSTOMERS',
      value: summary.totalCustomers,
      icon: Users,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-[#0D93AA]',
      activeBorder: 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-cyan-50/20',
      description: 'Registered Customer accounts',
    },
    {
      id: 'ACTIVE_ACCOUNTS',
      label: 'ACTIVE ACCOUNTS',
      value: summary.activeAccounts,
      icon: UserCheck,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20',
      description: 'Status is Active',
    },
    {
      id: 'ACTIVE_REQUESTS',
      label: 'ACTIVE REQUESTS',
      value: summary.activeRequests,
      icon: Activity,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20',
      description: 'Ongoing Pickup requests',
    },
    {
      id: 'PENDING_WITHDRAWALS',
      label: 'PENDING WITHDRAWALS',
      value: summary.pendingWithdrawals,
      icon: ArrowUpRight,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20',
      description: 'Pending Review, Approved or Processing',
    },
    {
      id: 'RECOVERY_SUPPORT',
      label: 'RECOVERY SUPPORT',
      value: summary.recoverySupport,
      icon: ShieldAlert,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20',
      description: 'Admin-assisted recovery cases',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`flex flex-col justify-between p-4 rounded-xl border transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 select-none ${
              isSelected
                ? `${card.activeBorder} shadow-sm`
                : 'bg-white border-gray-100 shadow-2xs hover:border-gray-200 hover:bg-gray-50/60'
            }`}
            aria-pressed={isSelected}
            title={`${card.label}: ${card.description}`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span
                className={`text-[11px] font-bold tracking-wider uppercase truncate ${
                  isSelected ? 'text-[#102025]' : 'text-gray-500'
                }`}
              >
                {card.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between w-full">
              <span className="text-2xl font-bold tracking-tight text-[#102025]">
                {card.value}
              </span>
              {isSelected && (card.id === 'ALL' ? isFiltered : true) && (
                <span className="text-[10px] font-semibold text-[#0D93AA] bg-[#0D93AA]/10 px-1.5 py-0.5 rounded">
                  Filtered
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
