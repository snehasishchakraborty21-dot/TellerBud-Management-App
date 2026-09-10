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

      {/* 3 Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Posted Ledger Balance
          </span>
          <span className="text-lg font-bold text-[#102025] block font-mono">
            {formatZMW(walletPosition.postedBalance)}
          </span>
        </div>

        <div className="bg-[#0D93AA]/5 border border-[#0D93AA]/20 rounded-xl p-4">
          <span className="block text-xs font-semibold text-[#0D93AA] uppercase tracking-wider mb-1.5">
            Available Balance
          </span>
          <span className="text-lg font-bold text-[#0D93AA] block font-mono">
            {formatZMW(walletPosition.availableBalance)}
          </span>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4">
          <span className="block text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5">
            Reserved Funds
          </span>
          <span className="text-lg font-bold text-amber-900 block font-mono">
            {formatZMW(walletPosition.reservedFunds ?? 0)}
          </span>
        </div>
      </div>

      {/* Secondary Details Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
        <div className="flex items-center justify-between sm:justify-start sm:gap-6">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Withdrawal Amount
          </span>
          <span className="font-bold text-[#102025] font-mono">
            {formatZMW(walletPosition.withdrawalAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-start sm:gap-6">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Funds State
          </span>
          <div>
            <StatusChip
              status={walletPosition.fundsState === 'Pending' ? 'Reserved' : walletPosition.fundsState}
              size="sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
