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
      targetRoute: '/super-admin/operations/live',
    },
    {
      id: 'matching',
      label: 'FINDING AN AGENT',
      value: metrics.matchingCount,
      colorClass: 'text-[#0D93AA]',
      targetRoute: '/super-admin/operations/matching?status=matching',
    },
    {
      id: 'pending-withdrawals',
      label: 'PENDING WITHDRAWALS',
      value: metrics.pendingWithdrawals,
      colorClass: 'text-[#0D93AA]',
      targetRoute: '/super-admin/wallets/customer-withdrawals?status=Pending Review',
    },
    {
      id: 'business-owner-requests',
      label: 'PENDING CASH / FLOAT REQUESTS',
      value: metrics.businessOwnerCashFloat,
      colorClass: 'text-[#0D93AA]',
      targetRoute: '/super-admin/operations/cash-float-requests',
    },
    {
      id: 'agents-online',
      label: 'AGENTS ONLINE',
      value: metrics.agentsOnline,
      colorClass: 'text-[#0D93AA]',
      targetRoute: '/super-admin/people/agents?status=online',
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => handleCardClick(card)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardClick(card);
            }
          }}
          className="bg-white p-4 border border-gray-100 rounded-xl shadow-sm hover:border-[#0D93AA]/40 hover:shadow transition-all flex flex-col justify-between min-h-[96px] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30"
        >
          <div className="text-[10px] text-gray-500 group-hover:text-gray-700 font-bold uppercase tracking-wider mb-1.5 leading-snug break-words transition-colors">
            {card.label}
          </div>
          <div className={`text-2xl font-bold ${card.colorClass} tracking-tight`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

