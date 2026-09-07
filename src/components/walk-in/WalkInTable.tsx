import React from 'react';
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  WalkInTransaction,
  WalkInSortField,
  WalkInSortDirection,
} from '../../types/admin';
import { VendorLogo } from './VendorLogo';
import { WalkInStatusBadge } from './WalkInStatusBadge';
import { WalkInTypeBadge } from './WalkInTypeBadge';
import { formatZMW } from '../../config/appConfig';

interface WalkInTableProps {
  transactions: WalkInTransaction[];
  isLoading: boolean;
  sortField: WalkInSortField;
  sortDirection: WalkInSortDirection;
  onSort: (field: WalkInSortField) => void;
  onView: (transaction: WalkInTransaction) => void;
  highlightedReference?: string;
}

export const WalkInTable: React.FC<WalkInTableProps> = ({
  transactions,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  onView,
  highlightedReference,
}) => {
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return { datePart: isoString, timePart: '' };
      }

      // Format Date: e.g. "31 Aug 2026"
      const datePart = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Format Time: e.g. "11:15 AM"
      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return { datePart, timePart };
    } catch {
      return { datePart: isoString, timePart: '' };
    }
  };

  const renderSortIcon = (field: WalkInSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA]" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-2xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0D93AA] mb-4" />
        <p className="text-sm font-medium text-gray-500">
          Loading Walk-In Transactions...
        </p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
          <Eye className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          No Walk-In Transactions Found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No transactions match your current search and filter criteria. Try clearing filters to view all records.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Reference</th>
              <th className="py-3.5 px-4">Agent</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Transaction Type</th>
              <th className="py-3.5 px-4">Vendor</th>
              <th className="py-3.5 px-4 text-right">
                <button
                  type="button"
                  onClick={() => onSort('amount')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-600 hover:text-[#0D93AA] focus:outline-none transition-colors ml-auto cursor-pointer"
                >
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </button>
              </th>
              <th className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => onSort('transactionTime')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-600 hover:text-[#0D93AA] focus:outline-none transition-colors cursor-pointer"
                >
                  <span>Transaction Time</span>
                  {renderSortIcon('transactionTime')}
                </button>
              </th>
              <th className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => onSort('status')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-600 hover:text-[#0D93AA] focus:outline-none transition-colors cursor-pointer"
                >
                  <span>Status</span>
                  {renderSortIcon('status')}
                </button>
              </th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const { datePart, timePart } = formatDateTime(tx.transactionTime);
              const isHighlighted =
                highlightedReference &&
                (tx.reference.toLowerCase() === highlightedReference.toLowerCase() ||
                  tx.id.toLowerCase() === highlightedReference.toLowerCase());

              return (
                <tr
                  key={tx.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    isHighlighted ? 'bg-cyan-50/60 border-l-4 border-l-[#0D93AA]' : ''
                  }`}
                >
                  {/* 1. Reference */}
                  <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                    {tx.reference}
                  </td>

                  {/* 2. Agent */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900 leading-tight">
                      {tx.agentName}
                    </div>
                    <div className="font-mono text-[11px] text-gray-500">
                      {tx.agentId}
                    </div>
                  </td>

                  {/* 3. Customer Identifier */}
                  <td className="py-3 px-4 font-mono text-gray-700 whitespace-nowrap">
                    {tx.customerPhone}
                  </td>

                  {/* 4. Transaction Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <WalkInTypeBadge type={tx.transactionType} />
                  </td>

                  {/* 5. Vendor */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <VendorLogo vendor={tx.vendor} size="table" showName={true} />
                  </td>

                  {/* 6. Amount (never truncated) */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                    {formatZMW(tx.amount)}
                  </td>

                  {/* 7. Transaction Time */}
                  <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                    <div className="font-medium text-gray-900">{datePart}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{timePart}</div>
                  </td>

                  {/* 8. Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <WalkInStatusBadge status={tx.status} size="sm" />
                  </td>

                  {/* 9. Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onView(tx)}
                      aria-label={`View walk-in transaction ${tx.reference}`}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-md transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
