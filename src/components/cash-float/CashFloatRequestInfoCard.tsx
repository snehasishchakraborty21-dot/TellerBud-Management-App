import React from 'react';
import { CashFloatRequest } from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW, formatWithdrawalDate } from '../../utils/formatters';
import { Banknote, Coins, FileText } from 'lucide-react';

interface CashFloatRequestInfoCardProps {
  request: CashFloatRequest;
}

export const CashFloatRequestInfoCard: React.FC<CashFloatRequestInfoCardProps> = ({ request }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <FileText className="w-4 h-4 text-[#0D93AA]" />
        <h2 className="text-sm font-bold text-[#102025]">Request Information</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Reference
          </span>
          <span className="font-mono text-sm font-semibold text-gray-900">
            {request.reference}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Requested From
          </span>
          <span className="font-semibold text-gray-900 bg-cyan-50 text-[#0D93AA] px-2.5 py-0.5 rounded text-xs inline-block">
            {request.requestedFrom}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Request Type
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
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

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Requested Amount
          </span>
          <span className="font-bold text-gray-900 text-sm">
            {formatZMW(request.amount)}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Requested Date and Time
          </span>
          <span className="font-medium text-gray-900">
            {formatWithdrawalDate(request.requestedAt)}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Current Status
          </span>
          <div>
            <StatusChip status={request.status} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
