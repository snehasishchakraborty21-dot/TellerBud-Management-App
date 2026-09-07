import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import {
  CustomerWithdrawal,
  WithdrawalSortField,
  WithdrawalSortDirection,
} from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW, getWithdrawalDateParts, formatWithdrawalDate } from '../../utils/formatters';

interface WithdrawalTableProps {
  withdrawals: CustomerWithdrawal[];
  sortField: WithdrawalSortField;
  sortDirection: WithdrawalSortDirection;
  onSort: (field: WithdrawalSortField) => void;
  onView: (withdrawal: CustomerWithdrawal) => void;
  highlightedReference?: string | null;
}

export const WithdrawalTable: React.FC<WithdrawalTableProps> = ({
  withdrawals,
  sortField,
  sortDirection,
  onSort,
  onView,
  highlightedReference,
}) => {
  const formatDateTime = (isoStr: string) => {
    return getWithdrawalDateParts(isoStr);
  };

  const formatAmount = (amount: number) => {
    return formatZMW(amount);
  };

  const renderSortIcon = (field: WithdrawalSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA]" />
    );
  };

  if (withdrawals.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-600">No withdrawal requests found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold">Reference</th>
              <th className="py-3.5 px-4 font-bold">Customer</th>
              <th className="py-3.5 px-4 font-bold">Customer Phone</th>
              <th className="py-3.5 px-4 font-bold">
                <button
                  type="button"
                  onClick={() => onSort('amount')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-500 hover:text-[#0D93AA] focus:outline-none transition-colors"
                  aria-label={`Sort by amount, currently ${sortField === 'amount' ? sortDirection : 'none'}`}
                >
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </button>
              </th>
              <th className="py-3.5 px-4 font-bold">Network</th>
              <th className="py-3.5 px-4 font-bold">Payout Number</th>
              <th className="py-3.5 px-4 font-bold">
                <button
                  type="button"
                  onClick={() => onSort('requestedAt')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-500 hover:text-[#0D93AA] focus:outline-none transition-colors"
                  aria-label={`Sort by requested date, currently ${sortField === 'requestedAt' ? sortDirection : 'none'}`}
                >
                  <span>Requested</span>
                  {renderSortIcon('requestedAt')}
                </button>
              </th>
              <th className="py-3.5 px-4 font-bold">Funds</th>
              <th className="py-3.5 px-4 font-bold">
                <button
                  type="button"
                  onClick={() => onSort('status')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-500 hover:text-[#0D93AA] focus:outline-none transition-colors"
                  aria-label={`Sort by status, currently ${sortField === 'status' ? sortDirection : 'none'}`}
                >
                  <span>Status</span>
                  {renderSortIcon('status')}
                </button>
              </th>
              <th className="py-3.5 px-4 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withdrawals.map((item) => {
              const { datePart, timePart } = formatDateTime(item.requestedAt);
              const isHighlighted =
                highlightedReference &&
                (item.reference.toLowerCase() === highlightedReference.toLowerCase() ||
                  item.id.toLowerCase() === highlightedReference.toLowerCase());

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    isHighlighted
                      ? 'bg-cyan-50/70 border-l-4 border-l-[#0D93AA]'
                      : ''
                  }`}
                >
                  {/* Reference */}
                  <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                    {item.reference}
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                    {item.customerName}
                  </td>

                  {/* Customer Phone */}
                  <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                    {item.customerPhone}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {formatAmount(item.amount)}
                  </td>

                  {/* Network */}
                  <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">
                    {item.network}
                  </td>

                  {/* Payout Number */}
                  <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                    {item.payoutNumber}
                  </td>

                  {/* Requested */}
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{datePart}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{timePart}</div>
                  </td>

                  {/* Funds */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusChip status={item.fundsState} size="sm" />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusChip status={item.status} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      aria-label={`View withdrawal ${item.reference}`}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-md transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer"
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

      {/* Tablet & Mobile Card Layout */}
      <div className="lg:hidden divide-y divide-gray-100">
        {withdrawals.map((item) => {
          const { datePart, timePart } = formatDateTime(item.requestedAt);
          const isHighlighted =
            highlightedReference &&
            (item.reference.toLowerCase() === highlightedReference.toLowerCase() ||
              item.id.toLowerCase() === highlightedReference.toLowerCase());

          return (
            <div
              key={item.id}
              className={`p-4 space-y-3 ${
                isHighlighted ? 'bg-cyan-50/70 border-l-4 border-l-[#0D93AA]' : ''
              }`}
            >
              {/* Header: Reference & Status */}
              <div className="flex items-center justify-between">
                <div className="font-mono font-bold text-sm text-gray-900">
                  {item.reference}
                </div>
                <StatusChip status={item.status} size="sm" />
              </div>

              {/* Customer & Amount */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {item.customerName}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">
                    {item.customerPhone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-sm">
                    {formatAmount(item.amount)}
                  </div>
                  <div className="mt-1">
                    <StatusChip status={item.fundsState} size="sm" />
                  </div>
                </div>
              </div>

              {/* Network, Payout & Date */}
              <div className="pt-2 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Network
                  </span>
                  <span className="font-medium text-gray-800">{item.network}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Payout To
                  </span>
                  <span className="font-mono text-gray-800">{item.payoutNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Requested
                  </span>
                  <span className="text-gray-800">{formatWithdrawalDate(item.requestedAt)}</span>
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => onView(item)}
                    aria-label={`View withdrawal ${item.reference}`}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
