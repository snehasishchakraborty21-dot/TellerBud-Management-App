import React from 'react';
import { Compass, CheckCircle2, Clock, Smartphone, Users } from 'lucide-react';
import { ServiceModeRecord } from '../../types/serviceMode';

interface ServiceModesSummaryCardsProps {
  serviceModes: ServiceModeRecord[];
}

export const ServiceModesSummaryCards: React.FC<ServiceModesSummaryCardsProps> = ({
  serviceModes,
}) => {
  const totalCount = serviceModes.length;
  const activeCount = serviceModes.filter((m) => m.availability === 'Active').length;
  const comingSoonCount = serviceModes.filter((m) => m.availability === 'Coming Soon').length;
  
  // Customer-Facing Modes: 2 (Cash Pickup, Cash Delivery - both accessible via Customer App)
  const customerFacingCount = serviceModes.filter(
    (m) => m.audience === 'Customer and Agent' || m.audience === 'Customer App'
  ).length;

  // Agent Operational Modes: 2 (Walk-In Transaction, Agent-to-Agent Liquidity)
  const agentOperationalCount = serviceModes.filter(
    (m) => m.audience === 'Agent App'
  ).length;

  const cards = [
    {
      id: 'total-service-modes',
      label: 'Total Service Modes',
      value: totalCount,
      icon: Compass,
      iconColor: 'text-[#0D93AA]',
      iconBg: 'bg-[#0D93AA]/10',
    },
    {
      id: 'active-modes',
      label: 'Active Modes',
      value: activeCount,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      id: 'coming-soon',
      label: 'Coming Soon',
      value: comingSoonCount,
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      id: 'customer-facing-modes',
      label: 'Customer-Facing Modes',
      value: customerFacingCount,
      icon: Smartphone,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      id: 'agent-only-modes',
      label: 'Agent-Only Modes',
      value: agentOperationalCount,
      icon: Users,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`summary-card-${card.id}`}
            className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-2 mb-2 min-h-[36px]">
              <span className="text-xs font-semibold text-slate-600 tracking-tight leading-snug">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
