import React from 'react';
import { WithdrawalStatus, WithdrawalStatusSummary } from '../../types/admin';

interface WithdrawalStatusStripProps {
  summary: WithdrawalStatusSummary;
  selectedStatus: WithdrawalStatus | 'ALL';
  onSelectStatus: (status: WithdrawalStatus | 'ALL') => void;
}

export const WithdrawalStatusStrip: React.FC<WithdrawalStatusStripProps> = ({
  summary,
  selectedStatus,
  onSelectStatus,
}) => {
  const items: Array<{
    id: WithdrawalStatus | 'ALL';
    label: string;
    count: number;
  }> = [
    { id: 'ALL', label: 'ALL REQUESTS', count: summary.all },
    { id: 'Pending Review', label: 'PENDING REVIEW', count: summary.pendingReview },
    { id: 'Approved', label: 'APPROVED', count: summary.approved },
    { id: 'Processing', label: 'PROCESSING', count: summary.processing },
    { id: 'Paid', label: 'PAID', count: summary.paid },
    { id: 'Rejected', label: 'REJECTED', count: summary.rejected },
    { id: 'Cancelled', label: 'CANCELLED', count: summary.cancelled },
  ];

  return (
    <div
      className="bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm flex flex-wrap items-center gap-1 sm:gap-1.5"
      role="toolbar"
      aria-label="Filter by withdrawal status"
    >
      {items.map((item) => {
        const isSelected = selectedStatus === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectStatus(item.id)}
            aria-pressed={isSelected}
            className={`flex-1 min-w-[110px] sm:min-w-[130px] flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
              isSelected
                ? 'bg-[#0D93AA] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isSelected ? 'text-white/90' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
            <span
              className={`text-sm font-bold ml-2 ${
                isSelected ? 'text-white' : 'text-[#102025]'
              }`}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
