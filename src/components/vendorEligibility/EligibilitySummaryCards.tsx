import React from 'react';
import { VendorRecord } from '../../types/vendor';

interface EligibilitySummaryCardsProps {
  vendors: VendorRecord[];
}

export const EligibilitySummaryCards: React.FC<EligibilitySummaryCardsProps> = ({ vendors }) => {
  // Only ACTIVE vendors count towards active summary metrics
  const activeVendors = vendors.filter((v) => v.status === 'Active');
  
  const activeVendorsCount = activeVendors.length;
  const cashPickupCount = activeVendors.filter((v) => v.services.includes('Cash Pickup')).length;
  const walletFundingCount = activeVendors.filter((v) => v.services.includes('Wallet Funding')).length;
  const customerWithdrawalCount = activeVendors.filter((v) => v.services.includes('Customer Withdrawal')).length;
  const walkInTransactionCount = activeVendors.filter((v) => v.services.includes('Walk-In Transaction')).length;

  const cards = [
    {
      id: 'active-vendors',
      label: 'Active Vendors',
      value: activeVendorsCount,
    },
    {
      id: 'cash-pickup-vendors',
      label: 'Cash Pickup Vendors',
      value: cashPickupCount,
    },
    {
      id: 'wallet-funding-vendors',
      label: 'Wallet Funding Vendors',
      value: walletFundingCount,
    },
    {
      id: 'customer-withdrawal-vendors',
      label: 'Customer Withdrawal Vendors',
      value: customerWithdrawalCount,
    },
    {
      id: 'walk-in-vendors',
      label: 'Walk-In Transaction Vendors',
      value: walkInTransactionCount,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {cards.map((card) => (
        <div
          key={card.id}
          id={`summary-card-${card.id}`}
          className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-3.5 py-2.5 flex items-center justify-between transition-all hover:border-slate-300 min-h-[42px]"
        >
          <span
            className="text-[12px] font-medium leading-[16px] text-slate-600 truncate mr-2 whitespace-nowrap select-none"
            title={card.label}
          >
            {card.label}
          </span>
          <span className="text-[14px] font-bold leading-[18px] text-slate-900 shrink-0 font-mono">
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
};
