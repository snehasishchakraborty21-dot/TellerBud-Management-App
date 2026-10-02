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

  // Agent-Only Modes: 2 (Walk-In Transaction, Agent-to-Agent Liquidity)
  const agentOnlyCount = serviceModes.filter(
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
      value: agentOnlyCount,
      icon: Users,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50',
    },
  ];

  return (
    <div
      id="service-modes-kpi-row"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 w-full"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`summary-card-${card.id}`}
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs px-3 sm:px-3.5 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 transition-all hover:border-slate-300 min-h-[44px]"
          >
            {/* Left: Icon + Label on one horizontal line */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`w-7 h-7 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span
                className="text-[12px] sm:text-[12.5px] font-semibold text-slate-700 tracking-tight leading-tight truncate"
                title={card.label}
              >
                {card.label}
              </span>
            </div>

            {/* Right: Number */}
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight shrink-0 pl-1">
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
