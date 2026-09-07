import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { RequiresAttentionItem } from '../../types/admin';

interface RequiresAttentionProps {
  items: RequiresAttentionItem[];
  onViewItem?: (item: RequiresAttentionItem) => void;
}

export const RequiresAttentionSection: React.FC<RequiresAttentionProps> = ({
  items,
  onViewItem,
}) => {
  const navigate = useNavigate();

  const getDotColor = (type: string) => {
    switch (type) {
      case 'withdrawal_review':
        return 'bg-red-500';
      case 'bo_cash_float':
        return 'bg-amber-400';
      case 'api_funding_exception':
        return 'bg-red-500';
      case 'finding_agent':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleAction = (item: RequiresAttentionItem) => {
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
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {items.reduce((acc, i) => acc + i.count, 0)} Total
        </span>
      </div>

      {/* Actionable Rows */}
      <div className="space-y-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleAction(item)}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getDotColor(item.type)} flex-shrink-0`} />
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#102025]">
                {item.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#102025]">
                {item.count}
              </span>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-[#0D93AA] transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
