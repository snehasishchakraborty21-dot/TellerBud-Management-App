import React from 'react';
import { AgentStatusSummary } from '../../types/admin';
import { Users, Wifi, UserCheck, Activity, UserX } from 'lucide-react';

interface AgentMetricCardsProps {
  summary: AgentStatusSummary;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AgentMetricCards: React.FC<AgentMetricCardsProps> = ({
  summary,
}) => {
  const cards = [
    {
      id: 'ALL',
      label: 'Total Agents',
      value: summary.all,
      icon: Users,
      iconBg: 'bg-cyan-50 text-[#0D93AA]',
      accentColor: 'text-gray-900',
    },
    {
      id: 'Online',
      label: 'Online',
      value: summary.online,
      icon: Wifi,
      iconBg: 'bg-teal-50 text-teal-600',
      accentColor: 'text-teal-700',
    },
    {
      id: 'Available',
      label: 'Available',
      value: summary.available,
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      accentColor: 'text-emerald-700',
    },
    {
      id: 'Assigned',
      label: 'On Active Request',
      value: summary.assigned,
      icon: Activity,
      iconBg: 'bg-blue-50 text-blue-600',
      accentColor: 'text-blue-700',
    },
    {
      id: 'Offline',
      label: 'Offline',
      value: summary.offline,
      icon: UserX,
      iconBg: 'bg-gray-100 text-gray-600',
      accentColor: 'text-gray-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-gray-200/90 px-3.5 sm:px-4 py-3 shadow-2xs h-[66px] flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-[12.5px] font-semibold text-gray-700 whitespace-nowrap">
                {card.label}
              </span>
            </div>

            <span
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight shrink-0 ${card.accentColor}`}
            >
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

