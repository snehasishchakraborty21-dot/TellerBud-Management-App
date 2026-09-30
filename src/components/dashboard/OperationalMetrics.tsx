import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OperationalMetrics } from '../../types/admin';

interface OperationalMetricsProps {
  metrics: OperationalMetrics;
  onCardClick?: (cardId: string) => void;
}

export const OperationalMetricsGrid: React.FC<OperationalMetricsProps> = ({
  metrics,
  onCardClick,
}) => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'active-pickup',
      label: 'ACTIVE PICKUP REQUESTS',
      value: metrics.activePickupRequests,
      colorClass: 'text-[#0D93AA]',
      targetRoute: '/super-admin/operations/requests',
    },
    {
      id: 'pending-withdrawals',
      label: 'PENDING WITHDRAWALS',
      value: metrics.pendingWithdrawals,
      colorClass: 'text-[#0D93AA]',
      targetRoute: '/super-admin/wallets/customer-withdrawals?status=Pending Review',
    },
    {
      id: 'agents-online',
      label: 'AGENTS ONLINE',
      value: metrics.agentsOnline,
      colorClass: 'text-[#0D93AA]',
    },
    {
      id: 'api-funding-exceptions',
      label: 'API FUNDING EXCEPTIONS',
      value: metrics.apiFundingExceptions,
      colorClass: 'text-red-600',
      targetRoute: '/super-admin/wallets/reconciliation?tab=funding_exceptions',
    },
  ];

  const handleCardClick = (card: (typeof cards)[0]) => {
    if (onCardClick) {
      onCardClick(card.id);
    } else if (card.targetRoute) {
      navigate(card.targetRoute);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const isClickable = Boolean(card.targetRoute || onCardClick);

        return (
          <div
            key={card.id}
            onClick={() => {
              if (isClickable) handleCardClick(card);
            }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleCardClick(card);
              }
            }}
            className={`bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm transition-all flex items-center justify-between gap-3 h-[56px] group ${
              isClickable
                ? 'hover:border-[#0D93AA]/40 hover:shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30'
                : 'cursor-default'
            }`}
          >
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">
              {card.label}
            </span>
            <span className={`text-[20px] font-bold font-mono tracking-tight leading-none shrink-0 ${card.colorClass}`}>
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
