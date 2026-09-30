import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { formatZMW } from '../../utils/formatters';

export interface WithdrawalAttentionItem {
  id: string;
  type: 'Customer Withdrawal' | 'Business Withdrawal';
  count: number;
  amount: number;
  targetRoute: string;
  subLabel?: string;
}

interface RequiresAttentionProps {
  items?: WithdrawalAttentionItem[];
  onViewItem?: (item: WithdrawalAttentionItem) => void;
}

export const RequiresAttentionSection: React.FC<RequiresAttentionProps> = ({
  items = [],
  onViewItem,
}) => {
  const navigate = useNavigate();

  const totalCount = items.reduce((acc, i) => acc + (i.count || 0), 0);

  const handleAction = (item: WithdrawalAttentionItem) => {
    if (onViewItem) {
      onViewItem(item);
    } else if (item.targetRoute) {
      navigate(item.targetRoute);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-base text-[#102025]">
          Requires Attention
        </h2>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          {totalCount} Total
        </span>
      </div>

      {/* Withdrawal Actionable Rows */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center italic">
            No withdrawal requests requiring review
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAction(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAction(item);
                }
              }}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#0D93AA]/30 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#102025] group-hover:text-[#0D93AA] transition-colors truncate">
                    {item.type}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {item.count} {item.count === 1 ? 'request' : 'requests'} pending
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                {item.amount > 0 && (
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-[#102025]">
                      {formatZMW(item.amount)}
                    </span>
                  </div>
                )}
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-[#0D93AA]/10 transition-colors">
                  <ChevronRight size={15} className="text-gray-400 group-hover:text-[#0D93AA] transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
