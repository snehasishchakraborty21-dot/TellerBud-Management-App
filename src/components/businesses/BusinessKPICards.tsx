import React from 'react';
import { BusinessSummary, BusinessQuickFilter } from '../../types/business';

interface BusinessKPICardsProps {
  summary: BusinessSummary;
  activeFilter: BusinessQuickFilter;
  statusFilter: string;
  onSelectFilter: (filter: BusinessQuickFilter) => void;
}

export const BusinessKPICards: React.FC<BusinessKPICardsProps> = ({
  summary,
  activeFilter,
  statusFilter,
  onSelectFilter,
}) => {
  // Determine if each card is actively filtering
  const isTotalActive = activeFilter === 'ALL' && statusFilter === 'ALL';
  const isActiveActive = activeFilter === 'ACTIVE' || (activeFilter === 'ALL' && statusFilter === 'Active');
  const isAgentsActive = activeFilter === 'AGENTS';
  const isOnlineActive = activeFilter === 'ONLINE';
  const isPendingTopUpsActive = activeFilter === 'PENDING_TOPUPS';

  const cards: Array<{
    id: BusinessQuickFilter;
    label: string;
    value: number;
    valueColor: string;
    activeBorder: string;
    isActive: boolean;
  }> = [
    {
      id: 'ALL',
      label: 'TOTAL BUSINESSES',
      value: summary.totalBusinesses,
      valueColor: 'text-[#0D93AA]',
      activeBorder: 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-[#0D93AA]/5',
      isActive: isTotalActive,
    },
    {
      id: 'ACTIVE',
      label: 'ACTIVE BUSINESSES',
      value: summary.activeBusinesses,
      valueColor: 'text-emerald-700',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20',
      isActive: isActiveActive,
    },
    {
      id: 'AGENTS',
      label: 'ASSOCIATED AGENTS',
      value: summary.associatedAgents,
      valueColor: 'text-blue-700',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20',
      isActive: isAgentsActive,
    },
    {
      id: 'ONLINE',
      label: 'AGENTS ONLINE',
      value: summary.agentsOnline,
      valueColor: 'text-cyan-700',
      activeBorder: 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/20',
      isActive: isOnlineActive,
    },
    {
      id: 'PENDING_TOPUPS',
      label: 'PENDING WALLET TOP-UPS',
      value: summary.pendingTopUps,
      valueColor: 'text-amber-700',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20',
      isActive: isPendingTopUpsActive,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full">
      {cards.map((card) => {
        return (
          <button
            key={card.id}
            type="button"
            id={`kpi-${card.id.toLowerCase().replace(/_/g, '-')}`}
            onClick={() => onSelectFilter(card.id)}
            className={`flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 select-none h-[52px] sm:h-[54px] ${
              card.isActive
                ? `${card.activeBorder} shadow-sm`
                : 'bg-white border-gray-200/80 shadow-2xs hover:border-gray-300 hover:bg-gray-50/60'
            }`}
            aria-pressed={card.isActive}
            title={`${card.label}: ${card.value.toLocaleString()}`}
          >
            <span
              className={`text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase truncate ${
                card.isActive ? 'text-[#102025]' : 'text-gray-600'
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
