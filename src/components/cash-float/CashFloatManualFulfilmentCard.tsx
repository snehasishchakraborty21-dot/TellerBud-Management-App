import React from 'react';
import { CashFloatRequest } from '../../types/admin';
import { formatZMW, formatWithdrawalDate } from '../../utils/formatters';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface CashFloatManualFulfilmentCardProps {
  request: CashFloatRequest;
}

export const CashFloatManualFulfilmentCard: React.FC<CashFloatManualFulfilmentCardProps> = ({
  request,
}) => {
  if (request.status !== 'Fulfilled') return null;

  const method =
    request.fulfilmentMethod ||
    (request.requestType === 'Float'
      ? 'Manual Float Transfer'
      : 'Physical Cash Handover');

  const fulfilledDate = request.fulfilledAt
    ? formatWithdrawalDate(request.fulfilledAt)
    : formatWithdrawalDate(request.requestedAt);

  const amount = request.fulfilledAmount ?? request.amount;
  const manualRef = request.manualReference?.trim() || '—';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <ShieldCheck className="w-4 h-4 text-[#0D93AA]" />
        <h2 className="text-sm font-bold text-[#102025]">Manual Fulfilment</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Fulfilment Method
          </span>
          <span className="font-semibold text-gray-900 text-xs">
            {method}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Fulfilled Amount
          </span>
          <span className="font-bold text-emerald-700 text-sm">
            {formatZMW(amount)}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Manual Reference
          </span>
          <span className="font-mono text-gray-800 font-medium">
            {manualRef}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Fulfilled
          </span>
          <span className="font-medium text-gray-900">
            {fulfilledDate}
          </span>
        </div>

        {request.internalNote && (
          <div className="sm:col-span-2 pt-2 border-t border-gray-100">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Internal Fulfilment Note
            </span>
            <p className="text-gray-700 bg-gray-50/70 p-2.5 rounded border border-gray-100 font-medium text-xs">
              {request.internalNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
