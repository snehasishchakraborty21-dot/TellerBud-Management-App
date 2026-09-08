import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  MapPin,
  Store,
} from 'lucide-react';
import {
  MobileMoneyTransaction,
  MobileMoneySortField,
  MobileMoneySortDirection,
  ServiceChannel,
} from '../../types/mobileMoney';
import { formatZMW } from '../../utils/formatters';

interface MobileMoneyTableProps {
  transactions: MobileMoneyTransaction[];
  isLoading: boolean;
  sortField: MobileMoneySortField;
  sortDirection: MobileMoneySortDirection;
  onSort: (field: MobileMoneySortField) => void;
  onViewDetails: (transaction: MobileMoneyTransaction) => void;
  highlightedReference?: string;
}

// Channel badge helper
const ChannelBadge: React.FC<{ channel: ServiceChannel }> = ({ channel }) => {
  if (channel === 'Pickup') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
        <MapPin size={11} className="text-teal-600" />
        <span>Pickup</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
      <Store size={11} className="text-indigo-600" />
      <span>Walk-In</span>
    </span>
  );
};

export const MobileMoneyTable: React.FC<MobileMoneyTableProps> = ({
  transactions,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  highlightedReference,
}) => {
  const renderSortIcon = (field: MobileMoneySortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-gray-400 group-hover:text-gray-600" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-[#0D93AA]" />
    ) : (
      <ArrowDown size={12} className="text-[#0D93AA]" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0D93AA] mb-4" />
        <p className="text-sm text-gray-600">Loading mobile money transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
          <Store size={22} />
        </div>
        <h4 className="text-sm font-bold text-gray-900">No Mobile Money Transactions Found</h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          No transactions match your current filter selections. Try adjusting or clearing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            {/* 1. REFERENCE / DATE */}
            <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[170px]">
              <button
                type="button"
                onClick={() => onSort('reference')}
                className="flex items-center gap-1 font-bold text-gray-700 hover:text-gray-900 group cursor-pointer"
              >
                <span>Reference / Date</span>
                {renderSortIcon('reference')}
              </button>
            </th>

            {/* 2. SERVICE CHANNEL */}
            <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
              Service Channel
            </th>

            {/* 3. TRANSACTION TYPE */}
            <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[145px]">
              Transaction Type
            </th>

            {/* 4. CUSTOMER */}
            <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[180px]">
              Customer
            </th>

            {/* 5. AMOUNT */}
            <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-right min-w-[130px]">
              <button
                type="button"
                onClick={() => onSort('amount')}
                className="flex items-center gap-1 font-bold text-gray-700 hover:text-gray-900 group cursor-pointer ml-auto"
              >
                <span>Amount</span>
                {renderSortIcon('amount')}
              </button>
            </th>

            {/* 6. CHARGES */}
            <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-right min-w-[110px]">
              Charges
            </th>

            {/* 7. CUSTOMER TOTAL */}
            <th scope="col" className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[160px]">
              Customer Total
            </th>

            {/* 8. ACTION (Sticky right, opaque white background, no clipping) */}
            <th
              scope="col"
              className="py-3.5 px-4 text-center whitespace-nowrap sticky right-0 z-20 bg-gray-50 border-l border-gray-200/80 shadow-[-6px_0_10px_-3px_rgba(0,0,0,0.06)] w-[140px] min-w-[140px]"
            >
              Action
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => {
            const isHighlighted = highlightedReference === tx.reference;

            return (
              <tr
                key={tx.id}
                id={`mmt-row-${tx.reference}`}
                className={`group transition-colors hover:bg-gray-50/70 ${
                  isHighlighted ? 'bg-cyan-50/50 ring-1 ring-inset ring-[#0D93AA]/40' : ''
                }`}
              >
                {/* 1. REFERENCE / DATE */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-mono text-xs font-bold text-gray-900">
                    {tx.reference}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {tx.formattedDate}
                  </div>
                </td>

                {/* 2. SERVICE CHANNEL */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <ChannelBadge channel={tx.serviceChannel} />
                </td>

                {/* 3. TRANSACTION TYPE */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-900">{tx.transactionType}</span>
                </td>

                {/* 4. CUSTOMER */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-900">
                    {tx.customerName}
                  </div>
                  <div className="font-mono text-[11px] text-gray-500 mt-0.5">
                    {tx.customerId ? tx.customerId : tx.customerPhone}
                  </div>
                </td>

                {/* 5. AMOUNT */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-gray-900">
                  {formatZMW(tx.amount)}
                </td>

                {/* 6. CHARGES */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-gray-600">
                  {tx.reservationCharge > 0 ? (
                    <span>{formatZMW(tx.reservationCharge)}</span>
                  ) : (
                    <span className="text-gray-400">ZMW 0.00</span>
                  )}
                </td>

                {/* 7. CUSTOMER TOTAL */}
                <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right font-mono font-bold text-[#0D93AA]">
                  {formatZMW(tx.customerTotal)}
                </td>

                {/* 8. ACTION (Sticky right, opaque white background, no clipping) */}
                <td
                  className={`py-3.5 px-4 text-center whitespace-nowrap sticky right-0 z-10 border-l border-gray-200/80 shadow-[-6px_0_10px_-3px_rgba(0,0,0,0.06)] w-[140px] min-w-[140px] ${
                    isHighlighted ? 'bg-[#F0F9FB]' : 'bg-white group-hover:bg-[#F9FAFB]'
                  }`}
                >
                  <button
                    type="button"
                    id={`btn-view-details-${tx.reference}`}
                    onClick={() => onViewDetails(tx)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0D93AA] bg-cyan-50/80 hover:bg-cyan-100 border border-cyan-200 transition-colors cursor-pointer shrink-0"
                  >
                    <Eye size={13} className="shrink-0" />
                    <span className="whitespace-nowrap">View Details</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
