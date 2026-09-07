import React from 'react';
import { CustomerWithdrawal } from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW, formatWithdrawalDate } from '../../utils/formatters';

interface WithdrawalDetailInfoProps {
  withdrawal: CustomerWithdrawal;
}

export const WithdrawalDetailInfo: React.FC<WithdrawalDetailInfoProps> = ({ withdrawal }) => {
  return (
    <section aria-labelledby="section-withdrawal-info" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h2 id="section-withdrawal-info" className="text-base font-bold text-[#102025] mb-5">
        Withdrawal Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Reference
          </span>
          <span className="font-mono font-bold text-[#102025] text-base">
            {withdrawal.reference}
          </span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Amount
          </span>
          <span className="font-bold text-[#102025] text-base">
            {formatZMW(withdrawal.amount)}
          </span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Network
          </span>
          <span className="font-medium text-gray-900">
            {withdrawal.network}
          </span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Payout Number
          </span>
          <span className="font-mono font-medium text-gray-900">
            {withdrawal.payoutNumber}
          </span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Requested
          </span>
          <span className="text-gray-900">
            {formatWithdrawalDate(withdrawal.requestedAt)}
          </span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Current Status
          </span>
          <div>
            <StatusChip status={withdrawal.status} size="sm" />
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Funds State
          </span>
          <div>
            <StatusChip status={withdrawal.fundsState} size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
};
