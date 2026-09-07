import React from 'react';
import { WalkInTransactionStatus, WalkInStatusSummary } from '../../types/admin';

interface WalkInStatusTabsProps {
  activeTab: WalkInTransactionStatus | 'ALL';
  onTabChange: (tab: WalkInTransactionStatus | 'ALL') => void;
  summary: WalkInStatusSummary;
  className?: string;
}

export const WalkInStatusTabs: React.FC<WalkInStatusTabsProps> = ({
  activeTab,
  onTabChange,
  summary,
  className = '',
}) => {
  const tabs: Array<{
    id: WalkInTransactionStatus | 'ALL';
    label: string;
    count: number;
  }> = [
    { id: 'ALL', label: 'All Transactions', count: summary.all },
    { id: 'Completed', label: 'Completed', count: summary.completed },
    { id: 'Processing', label: 'Processing', count: summary.processing },
    { id: 'Pending', label: 'Pending', count: summary.pending },
    { id: 'Failed', label: 'Failed', count: summary.failed },
    { id: 'Cancelled', label: 'Cancelled', count: summary.cancelled },
  ];

  return (
    <div
      className={`border-b border-gray-200 bg-white px-2 overflow-x-auto scrollbar-none ${className}`}
    >
      <nav className="flex space-x-2 sm:space-x-4 min-w-max" aria-label="Walk-In status tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`group inline-flex items-center gap-2 py-3 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 rounded-t-md ${
                isActive
                  ? 'border-[#0D93AA] text-[#0D93AA] font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0D93AA]/15 text-[#0D93AA]'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
