import React from 'react';
import {
  Server,
  CheckCircle2,
  Clock,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';

interface ReconciliationSummaryCardsProps {
  providerApis?: number;
  operationalApis?: number;
  pendingResponses?: number;
  reconciledToday?: number;
  reconciliationExceptions?: number;
}

export const ReconciliationSummaryCards: React.FC<ReconciliationSummaryCardsProps> = ({
  providerApis = 2,
  operationalApis = 2,
  pendingResponses = 4,
  reconciledToday = 26,
  reconciliationExceptions = 2,
}) => {
  const cards = [
    {
      label: 'Providers',
      value: providerApis,
      valueColor: 'text-[#102025]',
      icon: Server,
      iconBg: 'bg-[#0D93AA]/10 text-[#0D93AA]',
    },
    {
      label: 'Active Providers',
      value: operationalApis,
      valueColor: 'text-emerald-700',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Pending Confirmations',
      value: pendingResponses,
      valueColor: 'text-amber-700',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Reconciled Today',
      value: reconciledToday,
      valueColor: 'text-[#102025]',
      icon: CheckCheck,
      iconBg: 'bg-teal-50 text-teal-700',
    },
    {
      label: 'Reconciliation Exceptions',
      value: reconciliationExceptions,
      valueColor: 'text-rose-700',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-gray-200/90 rounded-xl px-3.5 py-3 sm:px-4 shadow-xs flex items-center justify-between min-h-[58px] max-h-[68px] h-full"
          >
            <div className="flex items-center gap-2 min-w-0 pr-1.5">
              <div
                className={`w-6 h-6 rounded-md ${card.iconBg} flex items-center justify-center shrink-0`}
              >
                <IconComponent size={13} />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 tracking-tight whitespace-nowrap">
                {card.label}
              </span>
            </div>

            <span
              className={`text-base sm:text-lg font-bold font-mono ${card.valueColor} shrink-0 pl-1`}
            >
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ReconciliationSummaryCards;
