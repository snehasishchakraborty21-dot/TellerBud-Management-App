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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="attendance-kpi-card rounded-xl border border-gray-100 shadow-2xs bg-white"
          >
            <div className="attendance-kpi-content">
              <span className="attendance-kpi-label text-gray-500 tracking-tight">
                {card.label}
              </span>
              <span className={`attendance-kpi-value tracking-tight ${card.accentColor}`}>
                {card.value}
              </span>
            </div>
            <div
              className={`attendance-kpi-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
