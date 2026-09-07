import React from 'react';
import { WithdrawalStatusHistoryItem } from '../../types/admin';
import { formatWithdrawalDate } from '../../utils/formatters';
import { Check, X } from 'lucide-react';

interface WithdrawalStatusHistoryProps {
  history: WithdrawalStatusHistoryItem[];
}

export const WithdrawalStatusHistory: React.FC<WithdrawalStatusHistoryProps> = ({ history }) => {
  const getAccessibleLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('reject')) return 'Withdrawal Rejected';
    if (s.includes('cancel')) return 'Withdrawal Cancelled';
    return `${status} completed`;
  };

  const isFailureStatus = (status: string) => {
    const s = status.toLowerCase();
    return s.includes('reject') || s.includes('cancel') || s.includes('failed');
  };

  const isPaidStatus = (status: string) => {
    return status.toLowerCase() === 'paid';
  };

  return (
    <section aria-labelledby="section-status-history" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h2 id="section-status-history" className="text-base font-bold text-[#102025] mb-5">
        Status History
      </h2>

      <div className="relative pl-7 space-y-4">
        {/* Continuous thin vertical connecting line between completed nodes */}
        {history.length > 1 && (
          <div
            className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-[#0D93AA]"
            aria-hidden="true"
          />
        )}

        {history.map((item, index) => {
          const isFailure = isFailureStatus(item.status);
          const isPaid = isPaidStatus(item.status);
          const accessibleLabel = getAccessibleLabel(item.status);

          return (
            <div key={item.id || index} className="relative flex items-start justify-between gap-4 text-sm">
              {/* Status Node Circle (approx 18-20px) */}
              <div
                className={`absolute -left-7 top-0.5 w-[19px] h-[19px] rounded-full flex items-center justify-center z-10 ${
                  isFailure ? 'bg-red-600' : 'bg-[#0D93AA]'
                }`}
                aria-label={accessibleLabel}
                title={accessibleLabel}
              >
                {isFailure ? (
                  <X className="w-3 h-3 text-white stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <Check className="w-3 h-3 text-white stroke-[2.5]" aria-hidden="true" />
                )}
                <span className="sr-only">{accessibleLabel}</span>
              </div>

              {/* Event Info */}
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {item.status}
                  </p>
                  {isPaid && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid
                    </span>
                  )}
                </div>
                {item.reason && (
                  <p className="text-xs text-red-600 mt-1 bg-red-50/70 border border-red-100 rounded px-2 py-1">
                    <span className="font-semibold text-gray-700">Reason: </span>
                    {item.reason}
                  </p>
                )}
              </div>

              {/* Date and Time with AM/PM */}
              <div className="text-xs text-gray-600 font-mono flex-shrink-0 text-right">
                {formatWithdrawalDate(item.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

