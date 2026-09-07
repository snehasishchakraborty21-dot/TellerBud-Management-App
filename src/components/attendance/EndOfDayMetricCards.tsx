import React from 'react';
import { Users, FileQuestion, Clock, CheckCheck, AlertTriangle } from 'lucide-react';
import { EndOfDayMetrics } from '../../types/attendance';

interface EndOfDayMetricCardsProps {
  metrics: EndOfDayMetrics;
}

export const EndOfDayMetricCards: React.FC<EndOfDayMetricCardsProps> = ({ metrics }) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Agents',
      value: metrics.totalAgents,
      icon: Users,
      iconBg: 'bg-cyan-50 text-[#0D93AA]',
      accentColor: 'text-gray-900',
    },
    {
      id: 'pending-sub',
      label: 'Pending Submission',
      value: metrics.pendingSubmission,
      icon: FileQuestion,
      iconBg: 'bg-gray-100 text-gray-600',
      accentColor: 'text-gray-700',
    },
    {
      id: 'pending-rev',
      label: 'Pending Review',
      value: metrics.pendingReview,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
      accentColor: 'text-amber-700',
    },
    {
      id: 'reconciled',
      label: 'Reconciled',
      value: metrics.reconciled,
      icon: CheckCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      accentColor: 'text-emerald-700',
    },
    {
      id: 'exceptions',
      label: 'Exceptions',
      value: metrics.exceptions,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
      accentColor: 'text-rose-700',
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
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
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
