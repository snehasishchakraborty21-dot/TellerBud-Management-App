import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Banknote, Coins } from 'lucide-react';
import {
  CashFloatRequest,
  CashFloatSortField,
  CashFloatSortDirection,
} from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW, getWithdrawalDateParts } from '../../utils/formatters';

interface CashFloatTableProps {
  requests: CashFloatRequest[];
  sortField: CashFloatSortField;
  sortDirection: CashFloatSortDirection;
  onSort: (field: CashFloatSortField) => void;
  onView: (request: CashFloatRequest) => void;
  highlightedReference?: string | null;
  showBusinessColumn?: boolean;
}

export const CashFloatTable: React.FC<CashFloatTableProps> = ({
  requests,
  sortField,
  sortDirection,
  onSort,
  onView,
  highlightedReference,
  showBusinessColumn = false,
}) => {
  const formatDateTime = (isoStr: string) => {
    return getWithdrawalDateParts(isoStr);
  };

  const formatAmount = (amount: number) => {
    return formatZMW(amount);
  };

  const renderSortIcon = (field: CashFloatSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA]" />
    );
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-600">No cash or float requests found.</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query.</p>
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
              <th className="py-3.5 px-4 font-bold">Agent</th>
              <th className="py-3.5 px-4 font-bold">Agent ID</th>
              {showBusinessColumn && <th className="py-3.5 px-4 font-bold">Business</th>}
              <th className="py-3.5 px-4 font-bold">Request Type</th>
              <th className="py-3.5 px-4 font-bold">
                <button
                  type="button"
                  onClick={() => onSort('amount')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-500 hover:text-[#0D93AA] focus:outline-none transition-colors cursor-pointer"
                  aria-label={`Sort by amount, currently ${sortField === 'amount' ? sortDirection : 'none'}`}
                >
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </button>
              </th>
              <th className="py-3.5 px-4 font-bold">
                <button
                  type="button"
                  onClick={() => onSort('requestedAt')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-500 hover:text-[#0D93AA] focus:outline-none transition-colors cursor-pointer"
                  aria-label={`Sort by requested date, currently ${sortField === 'requestedAt' ? sortDirection : 'none'}`}
                >
                  <span>Requested</span>
                  {renderSortIcon('requestedAt')}
                </button>
              </th>
              <th className="py-3.5 px-4 font-bold">
                <button
                  type="button"
                  onClick={() => onSort('status')}
                  className="group inline-flex items-center gap-1 font-bold text-gray-500 hover:text-[#0D93AA] focus:outline-none transition-colors cursor-pointer"
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
            {requests.map((item) => {
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
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                    {item.reference}
                  </td>

                  {/* Agent */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.agentName}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{item.agentPhone}</div>
                  </td>

                  {/* Agent ID */}
                  <td className="py-3.5 px-4 font-mono text-gray-700 whitespace-nowrap">
                    {item.agentId}
                  </td>

                  {/* Business */}
                  {showBusinessColumn && (
                    <td className="py-3.5 px-4 text-gray-800 whitespace-nowrap">
                      {item.businessName}
                    </td>
                  )}

                  {/* Request Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                        item.requestType === 'Cash'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      }`}
                    >
                      {item.requestType === 'Cash' ? (
                        <Banknote className="w-3 h-3" />
                      ) : (
                        <Coins className="w-3 h-3" />
                      )}
                      <span>{item.requestType}</span>
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {formatAmount(item.amount)}
                  </td>

                  {/* Requested */}
                  <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{datePart}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{timePart}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusChip status={item.status} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      aria-label={`View request ${item.reference}`}
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
        {requests.map((item) => {
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
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sm text-gray-900">
                    {item.reference}
                  </span>
                  <span className="ml-2 text-xs font-mono text-gray-500">
                    {item.agentId}
                  </span>
                </div>
                <StatusChip status={item.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Agent</div>
                  <div className="font-medium text-gray-900">{item.agentName}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{item.agentPhone}</div>
                </div>
                {showBusinessColumn && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Business</div>
                    <div className="text-gray-800 truncate">{item.businessName}</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Type & Amount</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        item.requestType === 'Cash'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {item.requestType}
                    </span>
                    <span className="font-bold text-gray-900 whitespace-nowrap">{formatAmount(item.amount)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Requested</div>
                  <div className="text-gray-900">{datePart}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{timePart}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onView(item)}
                  aria-label={`View request ${item.reference}`}
                  className="w-full py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
