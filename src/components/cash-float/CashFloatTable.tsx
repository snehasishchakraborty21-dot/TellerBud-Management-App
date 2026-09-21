import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Banknote,
  Coins,
  Phone,
} from 'lucide-react';
import {
  CashFloatRequest,
  CashFloatSortField,
  CashFloatSortDirection,
} from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW, getWithdrawalDateParts } from '../../utils/formatters';
import { formatZambianPhone } from '../../utils/customerUtils';

interface CashFloatTableProps {
  requests: CashFloatRequest[];
  sortField: CashFloatSortField;
  sortDirection: CashFloatSortDirection;
  onSort: (field: CashFloatSortField) => void;
  onView: (request: CashFloatRequest) => void;
  highlightedReference?: string | null;
  showBusinessColumn?: boolean;
  isLoading?: boolean;
  isFilteredByDate?: boolean;
  onClearDateRange?: () => void;
}

export const CashFloatTable: React.FC<CashFloatTableProps> = ({
  requests,
  sortField,
  sortDirection,
  onSort,
  onView,
  highlightedReference,
  isLoading = false,
  isFilteredByDate = false,
  onClearDateRange,
}) => {
  const formatDateTime = (isoStr: string) => {
    return getWithdrawalDateParts(isoStr);
  };

  const formatAmount = (amount: number) => {
    return formatZMW(amount);
  };

  const renderSortIcon = (field: CashFloatSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 ml-1 inline shrink-0" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA] ml-1 inline shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA] ml-1 inline shrink-0" />
    );
  };

  return (
    <>
      {/* Desktop Table View - table-fixed with revised 100% shared colgroup */}
      <table className="hidden md:table w-full table-fixed text-left border-collapse min-w-[960px]">
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '7%' }} />
        </colgroup>
        <thead className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none shadow-2xs">
          <tr className="h-[44px]">
            {/* 1. Reference (10%, Left) */}
            <th
              scope="col"
              style={{ width: '10%' }}
              className="h-[44px] px-3 py-2.5 text-left whitespace-nowrap align-middle"
            >
              Reference
            </th>

            {/* 2. Agent (11%, Left) */}
            <th
              scope="col"
              style={{ width: '11%' }}
              className="h-[44px] px-3 py-2.5 text-left whitespace-nowrap align-middle"
            >
              Agent
            </th>

            {/* 3. Agent Number (17%, Left) */}
            <th
              scope="col"
              style={{ width: '17%' }}
              className="h-[44px] px-3 py-2.5 text-left whitespace-nowrap align-middle"
            >
              Agent Number
            </th>

            {/* 4. Agent ID (13%, Left) */}
            <th
              scope="col"
              style={{ width: '13%' }}
              className="h-[44px] px-3 py-2.5 text-left whitespace-nowrap align-middle"
            >
              Agent ID
            </th>

            {/* 5. Type (9%, Centred) */}
            <th
              scope="col"
              style={{ width: '9%' }}
              className="h-[44px] px-3 py-2.5 text-center whitespace-nowrap align-middle"
            >
              Type
            </th>

            {/* 6. Amount (10%, Right, Sortable) */}
            <th
              scope="col"
              style={{ width: '10%' }}
              className="h-[44px] px-3 py-2.5 text-right cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap align-middle"
              onClick={() => onSort('amount')}
              title="Sort by Amount"
            >
              <div className="inline-flex items-center justify-end gap-1">
                <span>Amount</span>
                {renderSortIcon('amount')}
              </div>
            </th>

            {/* 7. Requested (13%, Left, Sortable) */}
            <th
              scope="col"
              style={{ width: '13%' }}
              className="h-[44px] px-3 py-2.5 text-left cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap align-middle"
              onClick={() => onSort('requestedAt')}
              title="Sort by Requested Date"
            >
              <div className="inline-flex items-center justify-start gap-1">
                <span>Requested</span>
                {renderSortIcon('requestedAt')}
              </div>
            </th>

            {/* 8. Status (10%, Centred, Sortable) */}
            <th
              scope="col"
              style={{ width: '10%' }}
              className="h-[44px] px-3 py-2.5 text-center cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap align-middle"
              onClick={() => onSort('status')}
              title="Sort by Status"
            >
              <div className="inline-flex items-center justify-center gap-1">
                <span>Status</span>
                {renderSortIcon('status')}
              </div>
            </th>

            {/* 9. Action (7%, Centred) */}
            <th
              scope="col"
              style={{ width: '7%' }}
              className="h-[44px] px-3 py-2.5 text-center whitespace-nowrap align-middle"
            >
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 text-xs bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={9} className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D93AA]" />
                <p className="mt-3 text-sm text-gray-500 font-medium">
                  Loading Cash/Float requests...
                </p>
              </td>
            </tr>
          ) : requests.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-50 text-[#0D93AA] mx-auto flex items-center justify-center mb-3">
                  <Banknote className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#102025]">
                  {isFilteredByDate
                    ? 'No Cash/Float Requests found for the selected date range.'
                    : 'No Cash or Float Requests Found'}
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                  {isFilteredByDate
                    ? 'Try selecting another status tab or clearing the date range to see more records.'
                    : 'No cash or float requests match your current filters. Try adjusting your filters or status tabs.'}
                </p>
                {isFilteredByDate && onClearDateRange && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={onClearDateRange}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear Date Range
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            requests.map((item) => {
              const { datePart, timePart } = formatDateTime(item.requestedAt);
              const formattedPhone = formatZambianPhone(item.agentPhone);
              const isHighlighted =
                highlightedReference &&
                (item.reference.toLowerCase() === highlightedReference.toLowerCase() ||
                  item.id.toLowerCase() === highlightedReference.toLowerCase());

              return (
                <tr
                  key={item.id}
                  className={`h-[56px] hover:bg-cyan-50/30 transition-colors group ${
                    isHighlighted ? 'bg-cyan-50/70 border-l-4 border-l-[#0D93AA]' : ''
                  }`}
                >
                  {/* 1. Reference (10%, Left) */}
                  <td className="px-3 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap align-middle text-left">
                    {item.reference}
                  </td>

                  {/* 2. Agent (11%, Left) */}
                  <td className="px-3 py-2.5 text-left align-middle whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{item.agentName}</span>
                  </td>

                  {/* 3. Agent Number (17%, Left) */}
                  <td className="px-3 py-2.5 text-left align-middle whitespace-nowrap">
                    {formattedPhone !== '—' ? (
                      <div className="flex items-center justify-start gap-[6px] text-gray-700">
                        <Phone className="w-[13px] h-[13px] text-gray-400 shrink-0" />
                        <span className="font-mono whitespace-nowrap">{formattedPhone}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-mono">—</span>
                    )}
                  </td>

                  {/* 4. Agent ID (13%, Left) */}
                  <td className="px-3 py-2.5 font-mono text-gray-700 whitespace-nowrap align-middle text-left">
                    {item.agentId}
                  </td>

                  {/* 5. Type (9%, Centred) */}
                  <td className="px-3 py-2.5 whitespace-nowrap align-middle text-center">
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex items-center justify-center gap-1 min-w-[68px] px-2 py-0.5 rounded text-xs font-semibold ${
                          item.requestType === 'Cash'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                        }`}
                      >
                        {item.requestType === 'Cash' ? (
                          <Banknote className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Coins className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{item.requestType}</span>
                      </span>
                    </div>
                  </td>

                  {/* 6. Amount (10%, Right) */}
                  <td className="px-3 py-2.5 font-mono tabular-nums font-bold text-gray-900 whitespace-nowrap align-middle text-right">
                    {formatAmount(item.amount)}
                  </td>

                  {/* 7. Requested (13%, Left) */}
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap align-middle text-left">
                    <div className="flex flex-col justify-center">
                      <div className="font-medium text-gray-900 leading-tight">{datePart}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5 leading-tight">{timePart}</div>
                    </div>
                  </td>

                  {/* 8. Status (10%, Centred) */}
                  <td className="px-3 py-2.5 whitespace-nowrap align-middle text-center">
                    <div className="flex items-center justify-center">
                      <StatusChip status={item.status} size="sm" />
                    </div>
                  </td>

                  {/* 9. Action (7%, Centred) */}
                  <td className="px-3 py-2.5 text-center whitespace-nowrap align-middle">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        id={`btn-view-${item.reference.toLowerCase()}`}
                        onClick={() => onView(item)}
                        aria-label={`View request ${item.reference}`}
                        className="inline-flex items-center justify-center gap-1 min-w-[64px] h-[32px] px-2.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer shadow-2xs whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100 bg-white">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D93AA]" />
            <p className="mt-3 text-sm text-gray-500 font-medium">
              Loading Cash/Float requests...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-50 text-[#0D93AA] mx-auto flex items-center justify-center mb-3">
              <Banknote className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#102025]">
              {isFilteredByDate
                ? 'No Cash/Float Requests found for the selected date range.'
                : 'No Cash or Float Requests Found'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              {isFilteredByDate
                ? 'Try selecting another status tab or clearing the date range to see more records.'
                : 'No cash or float requests match your current filters. Try adjusting your filters or status tabs.'}
            </p>
            {isFilteredByDate && onClearDateRange && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onClearDateRange}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Date Range
                </button>
              </div>
            )}
          </div>
        ) : (
          requests.map((item) => {
            const { datePart, timePart } = formatDateTime(item.requestedAt);
            const formattedPhone = formatZambianPhone(item.agentPhone);
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
                    <div className="font-semibold text-gray-900">{item.agentName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Agent Number</div>
                    <div className="text-gray-700 font-mono text-[11px]">{formattedPhone}</div>
                  </div>
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
                    className="w-full py-2 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
