import React from 'react';
import { CashFloatStatus, CashFloatStatusSummary } from '../../types/admin';

interface CashFloatStatusStripProps {
  activeStatus: CashFloatStatus | 'ALL';
  onSelectStatus: (status: CashFloatStatus | 'ALL') => void;
  summary: CashFloatStatusSummary;
}

interface StatusTabConfig {
  id: CashFloatStatus | 'ALL';
  label: string;
  getCount: (summary: CashFloatStatusSummary) => number;
}

const TABS: StatusTabConfig[] = [
  { id: 'ALL', label: 'All', getCount: (s) => s.all },
  { id: 'Pending Review', label: 'Pending Review', getCount: (s) => s.pendingReview },
  { id: 'Approved', label: 'Approved', getCount: (s) => s.approved },
  { id: 'Processing', label: 'Processing', getCount: (s) => s.processing },
  { id: 'Fulfilled', label: 'Fulfilled', getCount: (s) => s.fulfilled },
  { id: 'Rejected', label: 'Rejected', getCount: (s) => s.rejected },
  { id: 'Cancelled', label: 'Cancelled', getCount: (s) => s.cancelled },
];

export const CashFloatStatusStrip: React.FC<CashFloatStatusStripProps> = ({
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
