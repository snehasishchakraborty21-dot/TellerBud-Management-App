import React from 'react';
import { AgentToAgentRequestType } from '../../types/admin';
import { Banknote, Smartphone } from 'lucide-react';

interface AgentLiquidityTypeBadgeProps {
  requestType: AgentToAgentRequestType;
  size?: 'sm' | 'md';
  className?: string;
}

export const AgentLiquidityTypeBadge: React.FC<AgentLiquidityTypeBadgeProps> = ({
  requestType,
  size = 'md',
  className = '',
}) => {
  const isCash = requestType === 'Cash';

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs whitespace-nowrap ${
        isCash
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
          : 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
      } ${sizeClasses} ${className}`}
    >
      {isCash ? (
        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
      )}
      <span>{requestType}</span>
    </span>
  );
};
