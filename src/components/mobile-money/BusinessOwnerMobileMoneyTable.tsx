import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Store,
  HelpCircle,
  Eye,
} from 'lucide-react';
import {
  MobileMoneyTransaction,
  MobileMoneySortField,
  MobileMoneySortDirection,
  ServiceChannel,
  MobileMoneyTransactionType,
} from '../../types/mobileMoney';
import { formatZmwListingAmount } from '../../utils/formatters';
import { formatZambianPhone } from '../../utils/customerUtils';
import { VENDOR_LOGO_MAP } from '../walk-in/VendorLogo';

interface BusinessOwnerMobileMoneyTableProps {
  transactions: MobileMoneyTransaction[];
  isLoading: boolean;
  sortField: MobileMoneySortField;
  sortDirection: MobileMoneySortDirection;
  onSort: (field: MobileMoneySortField) => void;
  onRowClick: (transaction: MobileMoneyTransaction) => void;
  onView?: (transaction: MobileMoneyTransaction) => void;
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

// 4. Reusable Coming Soon Badge with identical styling and optional hover tooltip
const ComingSoonBadge: React.FC<{ tooltip?: string }> = ({ tooltip }) => {
  return (
    <div className="relative group/cs inline-flex justify-start">
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap select-none">
        Coming Soon
      </span>
      {tooltip && (
        <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/cs:flex flex-col items-start z-30 pointer-events-none">
          <div className="bg-gray-900 text-white text-[11px] rounded px-2.5 py-1 whitespace-nowrap shadow-lg font-normal normal-case">
            {tooltip}
          </div>
          <div className="w-1.5 h-1.5 -mt-1 rotate-45 bg-gray-900 ml-2" />
        </div>
      )}
    </div>
  );
};

export const BusinessOwnerMobileMoneyTable: React.FC<BusinessOwnerMobileMoneyTableProps> = ({
  transactions,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  onView,
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
      <table className="business-mobile-money-table w-full table-fixed text-left border-collapse min-w-[960px]">
        {/* Single shared column definition with recommended proportional widths totaling 100% */}
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>

        {/* Table Header: Exactly 10 columns in strict order, 11px font size, sticky top-0 */}
        <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
          <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider select-none bg-[#F9FAFB] h-[44px]">
            {/* 1. Ref/Date (10%) */}
            <th
              scope="col"
              style={{ width: '10%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle"
            >
              <button
                type="button"
                id="btn-sort-ref"
                onClick={() => onSort('reference')}
                className="inline-flex items-center gap-1 font-bold text-gray-700 hover:text-gray-900 group cursor-pointer focus:outline-none"
              >
                <span>Ref/Date</span>
                {renderSortIcon('reference')}
              </button>
            </th>

            {/* 2. Service Channel (10%) */}
            <th
              scope="col"
              style={{ width: '10%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle"
            >
              Service Channel
            </th>

            {/* 3. Transaction Type (11%) */}
            <th
              scope="col"
              style={{ width: '11%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle"
            >
              Transaction Type
            </th>

            {/* 4. CUST/TB ID (12%) */}
            <th
              scope="col"
              style={{ width: '12%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle"
            >
              CUST/TB ID
            </th>

            {/* 5. Customer # (11%) */}
            <th
              scope="col"
              style={{ width: '11%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle"
            >
              Customer #
            </th>

            {/* 6. Vendor (6%) */}
            <th
              scope="col"
              style={{ width: '6%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle"
            >
              Vendor
            </th>

            {/* 7. Amount (ZMW) (11%) */}
            <th
              scope="col"
              style={{ width: '11%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle amount-heading"
            >
              <button
                type="button"
                id="btn-sort-amount"
                onClick={() => onSort('amount')}
                className="inline-flex items-center gap-1 font-bold text-gray-700 hover:text-gray-900 group cursor-pointer focus:outline-none"
              >
                <span>Amount (ZMW)</span>
                {renderSortIcon('amount')}
              </button>
            </th>

            {/* 8. Commission (10%) */}
            <th
              scope="col"
              style={{ width: '10%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle"
            >
              <div className="inline-flex items-center gap-1 justify-start">
                <span>Commission</span>
                <div className="relative group/help inline-flex items-center">
                  <HelpCircle size={11} className="text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/help:flex flex-col items-start z-30 pointer-events-none">
                    <div className="bg-gray-900 text-white text-[11px] rounded px-2.5 py-1 whitespace-nowrap shadow-lg font-normal normal-case">
                      MNO commission will be available in Phase 2.
                    </div>
                    <div className="w-1.5 h-1.5 -mt-1 rotate-45 bg-gray-900 ml-1.5" />
                  </div>
                </div>
              </div>
            </th>

            {/* 9. Balance (ZMW) (11%) */}
            <th
              scope="col"
              style={{ width: '11%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle"
            >
              <div className="inline-flex items-center gap-1 justify-start">
                <span>Balance (ZMW)</span>
                <div className="relative group/balance-help inline-flex items-center">
                  <HelpCircle size={11} className="text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/balance-help:flex flex-col items-start z-30 pointer-events-none">
                    <div className="bg-gray-900 text-white text-[11px] rounded px-2.5 py-1 whitespace-nowrap shadow-lg font-normal normal-case">
                      Balance information will be available in a future release.
                    </div>
                    <div className="w-1.5 h-1.5 -mt-1 rotate-45 bg-gray-900 ml-1.5" />
                  </div>
                </div>
              </div>
            </th>

            {/* 10. Action (8%) */}
            <th
              scope="col"
              style={{ width: '8%' }}
              className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 whitespace-nowrap text-left align-middle action-heading"
            >
              Action
            </th>
          </tr>
        </thead>

        {/* Table Body: 10 columns, left-aligned, vertical centering, clean padding */}
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
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle">
                  <div className="font-mono text-xs font-bold text-gray-900 group-hover:text-[#0D93AA] transition-colors leading-tight truncate">
                    {tx.reference}
                  </div>
                  <div className="text-[10.5px] text-gray-500 mt-0.5 leading-tight truncate">
                    {tx.formattedDate}
                  </div>
                </td>

                {/* 2. Service Channel */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle">
                  <ChannelBadge channel={tx.serviceChannel} />
                </td>

                {/* 3. Transaction Type */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle">
                  <TransactionTypeBadge type={tx.transactionType} />
                </td>

                {/* 4. CUST/TB ID */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle">
                  {isUnregistered ? (
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-900 leading-tight truncate">Walk-In Customer</div>
                      <div className="text-[10.5px] text-gray-400 mt-0.5 leading-tight">No TB ID</div>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-900 leading-tight truncate">{tx.customerName}</div>
                      <div className="font-mono text-[10.5px] text-gray-500 mt-0.5 leading-tight truncate">{tx.customerId}</div>
                    </div>
                  )}
                </td>

                {/* 5. Customer # */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle font-mono text-xs font-medium text-gray-700 leading-tight">
                  {formatZambianPhone(tx.customerPhone)}
                </td>

                {/* 6. Vendor */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle">
                  <div className="flex items-center justify-start">
                    <div className="relative group/vendor inline-flex items-center justify-start">
                      <div
                        className="w-7 h-7 flex items-center justify-center p-0.5 rounded transition-transform group-hover/vendor:scale-105"
                        role="img"
                        aria-label={vendorConfig.name}
                      >
                        <img
                          src={vendorConfig.assetPath}
                          alt={vendorConfig.alt || vendorConfig.name}
                          className="max-h-full max-w-full object-contain select-none"
                          loading="lazy"
                        />
                      </div>
                      {/* Accessible Hover Tooltip */}
                      <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/vendor:flex flex-col items-start z-30 pointer-events-none">
                        <div className="bg-gray-900 text-white text-[11px] font-medium rounded px-2.5 py-1 whitespace-nowrap shadow-lg">
                          {vendorConfig.name}
                        </div>
                        <div className="w-1.5 h-1.5 -mt-1 rotate-45 bg-gray-900 ml-2.5" />
                      </div>
                    </div>
                  </div>
                </td>

                {/* 7. Amount (ZMW) */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left font-mono text-xs font-bold text-gray-900 leading-tight align-middle amount-cell">
                  {formatZmwListingAmount(tx.amount)}
                </td>

                {/* 8. Commission */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle">
                  <ComingSoonBadge tooltip="MNO commission will be available in Phase 2." />
                </td>

                {/* 9. Balance (ZMW) */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle">
                  <ComingSoonBadge tooltip="Balance information will be available in a future release." />
                </td>

                {/* 10. Action */}
                <td className="py-2.5 px-2.5 whitespace-nowrap text-left align-middle action-cell">
                  <div className="flex items-center justify-start">
                    <button
                      type="button"
                      id={`btn-view-${tx.reference.toLowerCase()}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onView) {
                          onView(tx);
                        } else {
                          onRowClick(tx);
                        }
                      }}
                      className="inline-flex items-center justify-start gap-1 h-[32px] px-2.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer shadow-2xs whitespace-nowrap"
                      aria-label={`View transaction ${tx.reference}`}
                    >
                      <Eye size={13} className="shrink-0" />
                      <span>View</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
