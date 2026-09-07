import React from 'react';
import { CashFloatStatusHistoryItem } from '../../types/admin';
import { formatWithdrawalDate } from '../../utils/formatters';
import { History, Check, X } from 'lucide-react';

interface CashFloatStatusHistoryCardProps {
  history: CashFloatStatusHistoryItem[];
}

export const CashFloatStatusHistoryCard: React.FC<CashFloatStatusHistoryCardProps> = ({
  history,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <History className="w-4 h-4 text-[#0D93AA]" />
        <h2 className="text-sm font-bold text-[#102025]">Status History</h2>
      </div>

      <div className="relative pl-6 space-y-6">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          const isTerminalNegative =
            item.status === 'Rejected' || item.status === 'Cancelled';

          return (
            <div key={item.id || index} className="relative group">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute -left-6 top-4 bottom-0 w-0.5 bg-[#0D93AA]/30"
                  style={{ height: 'calc(100% + 1.5rem)' }}
                />
              )}

              {/* Status Circle Icon */}
              <div
                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 bg-white ${
                  isTerminalNegative
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-[#0D93AA] text-[#0D93AA] bg-cyan-50'
                }`}
              >
                {isTerminalNegative ? (
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                )}
              </div>

              {/* Content: Event Name and Date/Time */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <span
                    className={`text-xs font-bold ${
                      isTerminalNegative ? 'text-red-600' : 'text-[#102025]'
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.reason && (
                    <p className="text-[11px] text-gray-500 italic mt-0.5">
                      Reason: {item.reason}
                    </p>
                  )}
                </div>

                <span className="text-[11px] font-mono text-gray-500 whitespace-nowrap">
                  {formatWithdrawalDate(item.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
