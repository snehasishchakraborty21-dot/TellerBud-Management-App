import React from 'react';
import {
  Building2,
  CheckCircle2,
  Users,
  Radio,
  Clock,
} from 'lucide-react';
import { BusinessSummary, BusinessQuickFilter } from '../../types/business';

interface BusinessKPICardsProps {
  summary: BusinessSummary;
  activeFilter: BusinessQuickFilter;
  statusFilter: string;
  onSelectFilter: (filter: BusinessQuickFilter) => void;
}

export const BusinessKPICards: React.FC<BusinessKPICardsProps> = ({
  summary,
  activeFilter,
  statusFilter,
  onSelectFilter,
}) => {
  // Determine if each card is actively filtering
  const isTotalActive = activeFilter === 'ALL' && statusFilter === 'ALL';
  const isActiveActive = activeFilter === 'ACTIVE' || (activeFilter === 'ALL' && statusFilter === 'Active');
  const isAgentsActive = activeFilter === 'AGENTS';
  const isOnlineActive = activeFilter === 'ONLINE';
  const isPendingTopUpsActive = activeFilter === 'PENDING_TOPUPS';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Businesses */}
      <button
        type="button"
        id="kpi-total-businesses"
        onClick={() => onSelectFilter('ALL')}
        className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
          isTotalActive
            ? 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-[#0D93AA]/5'
            : 'border-gray-200/80 hover:border-[#0D93AA]/40'
        }`}
        aria-pressed={isTotalActive}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
            TOTAL BUSINESSES
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Building2 size={14} />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-[#0D93AA] font-mono tracking-tight">
          {summary.totalBusinesses}
        </div>
      </button>

      {/* 2. Active Businesses */}
      <button
        type="button"
        id="kpi-active-businesses"
        onClick={() => onSelectFilter('ACTIVE')}
        className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
          isActiveActive
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
            : 'border-gray-200/80 hover:border-emerald-300'
        }`}
        aria-pressed={isActiveActive}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
            ACTIVE BUSINESSES
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={14} />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono tracking-tight">
          {summary.activeBusinesses}
        </div>
      </button>

      {/* 3. Associated Agents */}
      <button
        type="button"
        id="kpi-associated-agents"
        onClick={() => onSelectFilter('AGENTS')}
        className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
          isAgentsActive
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
            : 'border-gray-200/80 hover:border-blue-300'
        }`}
        aria-pressed={isAgentsActive}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
            ASSOCIATED AGENTS
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
            <Users size={14} />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-blue-700 font-mono tracking-tight">
          {summary.associatedAgents}
        </div>
      </button>

      {/* 4. Agents Online */}
      <button
        type="button"
        id="kpi-agents-online"
        onClick={() => onSelectFilter('ONLINE')}
        className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
          isOnlineActive
            ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/20'
            : 'border-gray-200/80 hover:border-cyan-300'
        }`}
        aria-pressed={isOnlineActive}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
            AGENTS ONLINE
          </span>
          <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center shrink-0">
            <Radio size={14} />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-cyan-700 font-mono tracking-tight">
          {summary.agentsOnline}
        </div>
      </button>

      {/* 5. Pending Wallet Top-Ups */}
      <button
        type="button"
        id="kpi-pending-top-ups"
        onClick={() => onSelectFilter('PENDING_TOPUPS')}
        className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
          isPendingTopUpsActive
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
            : 'border-gray-200/80 hover:border-amber-300'
        }`}
        aria-pressed={isPendingTopUpsActive}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
            PENDING WALLET TOP-UPS
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock size={14} />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-amber-700 font-mono tracking-tight">
          {summary.pendingTopUps}
        </div>
      </button>
    </div>
  );
};
