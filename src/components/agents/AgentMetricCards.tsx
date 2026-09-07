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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="flex flex-col justify-between p-4 rounded-xl border border-gray-100 shadow-2xs bg-white"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-semibold text-gray-500 tracking-tight">
                {card.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between w-full">
              <span className={`text-2xl font-bold tracking-tight ${card.accentColor}`}>
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
