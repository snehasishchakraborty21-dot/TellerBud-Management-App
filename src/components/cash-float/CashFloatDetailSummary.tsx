import React from 'react';
import { CashFloatRequest } from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW, formatWithdrawalDate } from '../../utils/formatters';
import { Banknote, Coins } from 'lucide-react';

interface CashFloatDetailSummaryProps {
  request: CashFloatRequest;
}

export const CashFloatDetailSummary: React.FC<CashFloatDetailSummaryProps> = ({ request }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Reference, Status, Request Type */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Reference
            </span>
            <span className="font-mono text-base font-bold text-[#102025]">
              {request.reference}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block" />

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Status
            </span>
            <StatusChip status={request.status} size="sm" />
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block" />

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Request Type
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                request.requestType === 'Cash'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
              }`}
            >
              {request.requestType === 'Cash' ? (
                <Banknote className="w-3.5 h-3.5" />
              ) : (
                <Coins className="w-3.5 h-3.5" />
              )}
              <span>{request.requestType}</span>
            </span>
          </div>
        </div>

        {/* Right: Requested Amount, Requested Date and Time */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left sm:text-right mb-0.5">
              Requested Amount
            </span>
            <span className="font-bold text-[#102025] text-lg block text-left sm:text-right">
              {formatZMW(request.amount)}
            </span>
          </div>

          <div className="hidden sm:block h-8 w-px bg-gray-200" />

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left sm:text-right mb-0.5">
              Requested
            </span>
            <span className="text-xs font-mono text-gray-700 block text-left sm:text-right">
              {formatWithdrawalDate(request.requestedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
