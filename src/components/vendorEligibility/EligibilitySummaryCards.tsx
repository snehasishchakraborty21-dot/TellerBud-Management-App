import React from 'react';
import { Building2, Banknote, Wallet, ArrowDownToLine, Users } from 'lucide-react';
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
      icon: Building2,
      iconColor: 'text-[#0D93AA]',
      iconBg: 'bg-[#0D93AA]/10',
      borderAccent: 'border-l-4 border-l-[#0D93AA]',
    },
    {
      id: 'cash-pickup-vendors',
      label: 'Cash Pickup Vendors',
      value: cashPickupCount,
      icon: Banknote,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      borderAccent: 'border-l-4 border-l-emerald-500',
    },
    {
      id: 'wallet-funding-vendors',
      label: 'Wallet Funding Vendors',
      value: walletFundingCount,
      icon: Wallet,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      borderAccent: 'border-l-4 border-l-blue-500',
    },
    {
      id: 'customer-withdrawal-vendors',
      label: 'Customer Withdrawal Vendors',
      value: customerWithdrawalCount,
      icon: ArrowDownToLine,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      borderAccent: 'border-l-4 border-l-purple-500',
    },
    {
      id: 'walk-in-vendors',
      label: 'Walk-In Transaction Vendors',
      value: walkInTransactionCount,
      icon: Users,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      borderAccent: 'border-l-4 border-l-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`summary-card-${card.id}`}
            className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-2 mb-2 min-h-[36px]">
              <span className="text-xs font-semibold text-slate-600 tracking-tight leading-snug whitespace-normal">
                {card.id === 'customer-withdrawal-vendors' ? (
                  <>
                    Customer Withdrawal
                    <br />
                    Vendors
                  </>
                ) : (
                  card.label
                )}
              </span>
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
