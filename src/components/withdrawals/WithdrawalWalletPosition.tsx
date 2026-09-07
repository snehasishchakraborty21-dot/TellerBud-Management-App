import React from 'react';
import { CustomerWalletPosition } from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW } from '../../utils/formatters';

interface WithdrawalWalletPositionProps {
  walletPosition: CustomerWalletPosition;
}

export const WithdrawalWalletPositionSection: React.FC<WithdrawalWalletPositionProps> = ({
  walletPosition,
}) => {
  return (
    <section aria-labelledby="section-wallet-position" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h2 id="section-wallet-position" className="text-base font-bold text-[#102025] mb-5">
        Wallet Position
      </h2>

      {/* Primary Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-50/70 border border-gray-100 rounded-lg p-3.5">
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Posted Balance
          </span>
          <span className="text-base font-bold text-[#102025] block">
            {formatZMW(walletPosition.postedBalance)}
          </span>
        </div>

        <div className="bg-[#0D93AA]/5 border border-[#0D93AA]/15 rounded-lg p-3.5">
          <span className="block text-xs font-semibold text-[#0D93AA] uppercase tracking-wider mb-1">
            Available Balance
          </span>
          <span className="text-base font-bold text-[#0D93AA] block">
            {formatZMW(walletPosition.availableBalance)}
          </span>
        </div>
      </div>

      {/* Secondary Details Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-sm">
        <div className="flex items-center justify-between sm:justify-start sm:gap-6">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Withdrawal Amount
          </span>
          <span className="font-bold text-[#102025]">
            {formatZMW(walletPosition.withdrawalAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-start sm:gap-6">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Funds State
          </span>
          <div>
            <StatusChip status={walletPosition.fundsState} size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
};
