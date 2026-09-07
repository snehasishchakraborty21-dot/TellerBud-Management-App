import React from 'react';
import { AgentStatusSummary } from '../../types/admin';

interface AgentStatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  summary: AgentStatusSummary;
}

export const AgentStatusTabs: React.FC<AgentStatusTabsProps> = ({
  activeTab,
  onTabChange,
  summary,
}) => {
  const tabs = [
    { id: 'ALL', label: 'All Agents', count: summary.all },
    { id: 'Online', label: 'Online', count: summary.online },
    { id: 'Available', label: 'Available', count: summary.available },
    { id: 'Assigned', label: 'On Active Request', count: summary.assigned },
    { id: 'Offline', label: 'Offline', count: summary.offline },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-gray-50/80 rounded-xl border border-gray-100 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-white text-gray-900 shadow-2xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive
                  ? 'bg-cyan-50 text-[#0D93AA]'
                  : 'bg-gray-200/70 text-gray-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
