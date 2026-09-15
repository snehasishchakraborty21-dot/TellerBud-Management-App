import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Lock,
  Inbox,
  Users,
} from 'lucide-react';
import { BusinessWalletDetailTab } from '../../types/businessWallet';

interface BusinessWalletTabsProps {
  activeTab: BusinessWalletDetailTab;
  onTabChange: (tab: BusinessWalletDetailTab) => void;
  reservationsCount: number;
  pendingFundingCount: number;
  agentsCount: number;
}

export const BusinessWalletTabs: React.FC<BusinessWalletTabsProps> = ({
  activeTab,
  onTabChange,
  reservationsCount,
  pendingFundingCount,
  agentsCount,
}) => {
  const tabs: {
    id: BusinessWalletDetailTab;
    label: string;
    icon: React.FC<{ size?: number; className?: string }>;
    count?: number;
    countHighlight?: boolean;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ledger', label: 'Ledger', icon: FileText },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: Lock,
      count: reservationsCount,
    },
    {
      id: 'funding-requests',
      label: 'Funding Requests',
      icon: Inbox,
      count: pendingFundingCount,
      countHighlight: pendingFundingCount > 0,
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: Users,
      count: agentsCount,
    },
  ];

  return (
    <div className="border-b border-gray-200/90 bg-white rounded-t-xl px-4 pt-1 shadow-2xs">
      <nav
        className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar"
        aria-label="Business Global Wallet Detail Tabs"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-3 inline-flex items-center gap-2 border-b-2 text-xs font-semibold transition-colors whitespace-nowrap group cursor-pointer ${
                isActive
                  ? 'border-[#0D93AA] text-[#0D93AA]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon
                size={14}
                className={`transition-colors shrink-0 ${
                  isActive
                    ? 'text-[#0D93AA]'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                    tab.countHighlight
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : isActive
                      ? 'bg-[#0D93AA]/10 text-[#0D93AA]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
