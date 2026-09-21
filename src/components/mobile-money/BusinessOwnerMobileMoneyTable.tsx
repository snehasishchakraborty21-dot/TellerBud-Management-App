import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Store,
  HelpCircle,
} from 'lucide-react';
import {
  MobileMoneyTransaction,
  MobileMoneySortField,
  MobileMoneySortDirection,
  ServiceChannel,
  MobileMoneyTransactionType,
} from '../../types/mobileMoney';
import { formatZMW } from '../../utils/formatters';
import { formatZambianPhone } from '../../utils/customerUtils';
import { VENDOR_LOGO_MAP } from '../walk-in/VendorLogo';

interface BusinessOwnerMobileMoneyTableProps {
  transactions: MobileMoneyTransaction[];
  isLoading: boolean;
  sortField: MobileMoneySortField;
  sortDirection: MobileMoneySortDirection;
  onSort: (field: MobileMoneySortField) => void;
  onRowClick: (transaction: MobileMoneyTransaction) => void;
  highlightedReference?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

// 2. Service Channel Badge (11px, compact, semibold)
const ChannelBadge: React.FC<{ channel: ServiceChannel }> = ({ channel }) => {
  if (channel === 'Pickup') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/80 whitespace-nowrap">
        <MapPin size={11} className="text-teal-600 shrink-0" />
        <span>Pickup</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 whitespace-nowrap">
      <Store size={11} className="text-indigo-600 shrink-0" />
      <span>Walk-In</span>
    </span>
  );
};

// 3. Transaction Type Pill (11px, compact, semibold)
const TransactionTypeBadge: React.FC<{ type: MobileMoneyTransactionType }> = ({ type }) => {
  switch (type) {
    case 'Deposit':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
          Deposit
        </span>
      );
    case 'Withdrawal':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
          Withdrawal
        </span>
      );
    case 'Purchase':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 whitespace-nowrap">
          Purchase
        </span>
      );
    case 'Liquidity Transfer':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 whitespace-nowrap">
          Liquidity Transfer
        </span>
      );
    default:
      return <span className="font-semibold text-gray-900 text-[11px] whitespace-nowrap">{type}</span>;
  }
};

export const BusinessOwnerMobileMoneyTable: React.FC<BusinessOwnerMobileMoneyTableProps> = ({
  transactions,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  highlightedReference,
  containerRef,
}) => {
  const localRef = React.useRef<HTMLDivElement>(null);
  const activeRef = containerRef || localRef;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = activeRef.current;
    if (!el) return;
    const pageJump = el.clientHeight * 0.8;
    if (e.key === 'PageDown') {
      e.preventDefault();
      el.scrollBy({ top: pageJump, behavior: 'smooth' });
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      el.scrollBy({ top: -pageJump, behavior: 'smooth' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      el.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  };

  const renderSortIcon = (field: MobileMoneySortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} className="text-gray-400 group-hover:text-gray-600 shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={11} className="text-[#0D93AA] shrink-0" />
    ) : (
      <ArrowDown size={11} className="text-[#0D93AA] shrink-0" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0D93AA] mb-4" />
        <p className="text-xs sm:text-sm text-gray-600 font-medium">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
          <Store size={22} />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
          No Mobile Money Transactions found
        </h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          No transactions were found for your business with the selected criteria. Try adjusting the date filter or clearing active search terms.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={activeRef}
      tabIndex={0}
      role="region"
      aria-label="Mobile Money Transactions List"
      onKeyDown={handleKeyDown}
      className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-auto transaction-table-scroll focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA]"
    >
      <table className="w-full text-left border-collapse min-w-[920px]">
        {/* Table Header: Exactly 9 columns in strict order, 11px font size, sticky top-0, opaque snow-white/light-grey background */}
        <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
          <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider select-none bg-[#F9FAFB]">
            {/* 1. Ref/Date */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 sm:px-3 whitespace-nowrap min-w-[125px]">
              <button
                type="button"
                id="btn-sort-ref"
                onClick={() => onSort('reference')}
                className="flex items-center gap-1 font-bold text-gray-700 hover:text-gray-900 group cursor-pointer focus:outline-none"
              >
                <span>Ref/Date</span>
                {renderSortIcon('reference')}
              </button>
            </th>

            {/* 2. Service Channel */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 sm:px-2.5 whitespace-nowrap min-w-[95px]">
              Service Channel
            </th>

            {/* 3. Transaction Type */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 sm:px-2.5 whitespace-nowrap min-w-[115px]">
              Transaction Type
            </th>

            {/* 4. Cust/TB ID */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 sm:px-3 whitespace-nowrap min-w-[125px]">
              Cust/TB ID
            </th>

            {/* 5. Customer # */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 sm:px-3 whitespace-nowrap min-w-[140px]">
              Customer #
            </th>

            {/* 6. Vendor (Narrow, Logo only, centered) */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-1.5 sm:px-2 whitespace-nowrap text-center w-[54px] min-w-[50px]">
              Vendor
            </th>

            {/* 7. Amount */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 sm:px-3 whitespace-nowrap text-right min-w-[105px]">
              <button
                type="button"
                id="btn-sort-amount"
                onClick={() => onSort('amount')}
                className="flex items-center gap-1 font-bold text-gray-700 hover:text-gray-900 group cursor-pointer ml-auto focus:outline-none"
              >
                <span>Amount</span>
                {renderSortIcon('amount')}
              </button>
            </th>

            {/* 8. Commission */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 sm:px-2.5 whitespace-nowrap text-right min-w-[95px]">
              <div className="inline-flex items-center gap-1 justify-end ml-auto">
                <span>Commission</span>
                <div className="relative group/help inline-flex items-center">
                  <HelpCircle size={11} className="text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/help:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-gray-900 text-white text-[11px] rounded px-2.5 py-1 whitespace-nowrap shadow-lg font-normal normal-case">
                      MNO commission will be available in Phase 2.
                    </div>
                    <div className="w-1.5 h-1.5 -mt-1 rotate-45 bg-gray-900 mr-1.5" />
                  </div>
                </div>
              </div>
            </th>

            {/* 9. Balance */}
            <th scope="col" className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 pl-2.5 pr-3 sm:pl-3 sm:pr-4 whitespace-nowrap text-right min-w-[105px]">
              <button
                type="button"
                id="btn-sort-balance"
                onClick={() => onSort('balanceAfter')}
                className="flex items-center gap-1 font-bold text-gray-700 hover:text-gray-900 group cursor-pointer ml-auto focus:outline-none"
              >
                <span>Balance</span>
                {renderSortIcon('balanceAfter')}
              </button>
            </th>
          </tr>
        </thead>

        {/* Table Body: 12-13px primary, 10-11px secondary, clean vertical spacing, tight horizontal padding */}
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => {
            const isHighlighted = highlightedReference === tx.reference;
            const isUnregistered = !tx.isRegisteredCustomer || !tx.customerId;
            const vendorConfig = VENDOR_LOGO_MAP[tx.vendor] || {
              name: tx.vendor,
              assetPath: `/assets/vendors/${String(tx.vendor).toLowerCase()}.svg`,
              alt: `${tx.vendor} logo`,
            };

            return (
              <tr
                key={tx.id}
                id={`bo-tx-row-${tx.reference}`}
                tabIndex={0}
                role="button"
                aria-label={`View full details for transaction ${tx.reference}`}
                onClick={() => onRowClick(tx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(tx);
                  }
                }}
                className={`group cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0D93AA] ${
                  isHighlighted
                    ? 'bg-cyan-50/60 ring-1 ring-inset ring-[#0D93AA]/40'
                    : 'hover:bg-slate-50/90 focus:bg-slate-50'
                }`}
              >
                {/* 1. Ref/Date */}
                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">
                  <div className="font-mono text-xs font-bold text-gray-900 group-hover:text-[#0D93AA] transition-colors leading-tight">
                    {tx.reference}
                  </div>
                  <div className="text-[10.5px] text-gray-500 mt-0.5 leading-tight">
                    {tx.formattedDate}
                  </div>
                </td>

                {/* 2. Service Channel */}
                <td className="py-2.5 sm:py-3 px-2 sm:px-2.5 whitespace-nowrap">
                  <ChannelBadge channel={tx.serviceChannel} />
                </td>

                {/* 3. Transaction Type */}
                <td className="py-2.5 sm:py-3 px-2 sm:px-2.5 whitespace-nowrap">
                  <TransactionTypeBadge type={tx.transactionType} />
                </td>

                {/* 4. Cust/TB ID */}
                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">
                  {isUnregistered ? (
                    <div>
                      <div className="text-xs font-semibold text-gray-900 leading-tight">Walk-In Customer</div>
                      <div className="text-[10.5px] text-gray-400 mt-0.5 leading-tight">No TB ID</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold text-gray-900 leading-tight">{tx.customerName}</div>
                      <div className="font-mono text-[10.5px] text-gray-500 mt-0.5 leading-tight">{tx.customerId}</div>
                    </div>
                  )}
                </td>

                {/* 5. Customer # */}
                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap font-mono text-xs font-medium text-gray-700 leading-tight">
                  {formatZambianPhone(tx.customerPhone)}
                </td>

                {/* 6. Vendor: Only official logo (28-32px), centered, scaled without stretch/crop, tooltip on hover */}
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-center whitespace-nowrap">
                  <div className="inline-flex justify-center items-center">
                    <div className="relative group/vendor inline-flex items-center justify-center">
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center p-0.5 rounded transition-transform group-hover/vendor:scale-105"
                        role="img"
                        aria-label={vendorConfig.name}
                      >
                        <img
                          src={vendorConfig.assetPath}
                          alt={vendorConfig.alt || vendorConfig.name}
                          className="max-h-full max-w-full object-contain object-center select-none"
                          loading="lazy"
                        />
                      </div>
                      {/* Accessible Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/vendor:flex flex-col items-center z-30 pointer-events-none">
                        <div className="bg-gray-900 text-white text-[11px] font-medium rounded px-2.5 py-1 whitespace-nowrap shadow-lg">
                          {vendorConfig.name}
                        </div>
                        <div className="w-1.5 h-1.5 -mt-1 rotate-45 bg-gray-900" />
                      </div>
                    </div>
                  </div>
                </td>

                {/* 7. Amount */}
                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap text-right font-mono text-xs font-bold text-gray-900 leading-tight">
                  {formatZMW(tx.amount)}
                </td>

                {/* 8. Commission: Compact Coming Soon badge with explanation tooltip */}
                <td className="py-2.5 sm:py-3 px-2 sm:px-2.5 whitespace-nowrap text-right">
                  <div className="relative group/comm inline-flex justify-end">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
                      Coming Soon
                    </span>
                    <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/comm:flex flex-col items-center z-30 pointer-events-none">
                      <div className="bg-gray-900 text-white text-[11px] rounded px-2.5 py-1 whitespace-nowrap shadow-lg font-normal normal-case">
                        MNO commission will be available in Phase 2.
                      </div>
                      <div className="w-1.5 h-1.5 -mt-1 rotate-45 bg-gray-900 mr-2" />
                    </div>
                  </div>
                </td>

                {/* 9. Balance: Read-only balanceAfter, right-aligned, bold/semibold */}
                <td className="py-2.5 sm:py-3 pl-2.5 pr-3 sm:pl-3 sm:pr-4 whitespace-nowrap text-right font-mono text-xs font-semibold text-gray-900 leading-tight">
                  {tx.balanceAfter !== undefined ? formatZMW(tx.balanceAfter) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
