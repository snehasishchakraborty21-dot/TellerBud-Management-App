import React from 'react';
import { AgentToAgentStatus, AgentToAgentStatusSummary } from '../../types/admin';

interface AgentLiquidityStatusTabsProps {
  activeStatus: AgentToAgentStatus | 'ALL';
  onSelectStatus: (status: AgentToAgentStatus | 'ALL') => void;
  summary: AgentToAgentStatusSummary;
}

interface StatusTabConfig {
  id: AgentToAgentStatus | 'ALL';
  label: string;
  getCount: (summary: AgentToAgentStatusSummary) => number;
}

const TABS: StatusTabConfig[] = [
  { id: 'ALL', label: 'All Requests', getCount: (s) => s.all },
  { id: 'Matching', label: 'Matching', getCount: (s) => s.matching },
  { id: 'Agent Matched', label: 'Agent Matched', getCount: (s) => s.agentMatched },
  { id: 'In Progress', label: 'In Progress', getCount: (s) => s.inProgress },
  { id: 'Completed', label: 'Completed', getCount: (s) => s.completed },
  { id: 'No Agent Available', label: 'No Agent Available', getCount: (s) => s.noAgentAvailable },
  { id: 'Expired', label: 'Expired', getCount: (s) => s.expired },
  { id: 'Cancelled', label: 'Cancelled', getCount: (s) => s.cancelled },
];

export const AgentLiquidityStatusTabs: React.FC<AgentLiquidityStatusTabsProps> = ({
  activeStatus,
  onSelectStatus,
  summary,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1.5 min-w-max">
        {TABS.map((tab) => {
          const isActive = activeStatus === tab.id;
          const count = tab.getCount(summary);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectStatus(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer ${
                isActive
                  ? 'bg-[#0D93AA] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
