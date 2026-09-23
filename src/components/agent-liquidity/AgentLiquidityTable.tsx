import React from 'react';
import {
  AgentToAgentRequest,
  AgentToAgentSortField,
  AgentToAgentSortDirection,
} from '../../types/admin';
import { AgentLiquidityStatusBadge } from './AgentLiquidityStatusBadge';
import { AgentLiquidityTypeBadge } from './AgentLiquidityTypeBadge';
import { formatZMW, formatZmwListingAmount, getWithdrawalDateParts } from '../../utils/formatters';
import { formatZambianPhone } from '../../utils/customerUtils';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Repeat,
  Timer,
  Building2,
  Phone,
} from 'lucide-react';

interface AgentLiquidityTableProps {
  requests: AgentToAgentRequest[];
  sortField: AgentToAgentSortField;
  sortDirection: AgentToAgentSortDirection;
  onSortChange: (field: AgentToAgentSortField) => void;
  onDetails: (request: AgentToAgentRequest) => void;
  isLoading?: boolean;
}

export const AgentLiquidityTable: React.FC<AgentLiquidityTableProps> = ({
  requests,
  sortField,
  sortDirection,
  onSortChange,
  onDetails,
  isLoading = false,
}) => {
  const renderSortIcon = (field: AgentToAgentSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA] shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA] shrink-0" />
    );
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D93AA]" />
        <p className="mt-3 text-sm text-gray-500 font-medium">
          Loading Agent-to-Agent liquidity requests...
        </p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-cyan-50 text-[#0D93AA] mx-auto flex items-center justify-center mb-3">
          <Repeat className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#102025]">No Liquidity Requests Found</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          No peer liquidity requests match your selected status tab or date range. Try selecting another status tab or clearing the date range.
        </p>
      </div>
    );
  }

  return (
    <table className="cash-liquidity-table w-full table-fixed text-left border-collapse min-w-[980px]">
      <colgroup>
        <col style={{ width: '8%' }} />
        <col style={{ width: '18%' }} />
        <col style={{ width: '8%' }} />
        <col style={{ width: '11%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '14%' }} />
        <col style={{ width: '11%' }} />
      </colgroup>
      <thead className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none shadow-2xs">
        <tr className="h-[44px]">
          {/* 1. Reference (8%) */}
          <th
            scope="col"
            style={{ width: '8%' }}
            className="px-3 py-2.5 text-left whitespace-nowrap align-middle reference-heading"
          >
            Reference
          </th>

          {/* 2. Requesting Agent (18%) */}
          <th
            scope="col"
            style={{ width: '18%' }}
            className="px-3 py-2.5 text-left align-middle agent-heading"
          >
            Requesting Agent
          </th>

          {/* 3. Type (8%) */}
          <th
            scope="col"
            style={{ width: '8%' }}
            className="px-3 py-2.5 text-left whitespace-nowrap align-middle type-heading"
          >
            Type
          </th>

          {/* 4. Amount (ZMW) (11%, Sortable) */}
          <th
            scope="col"
            style={{ width: '11%' }}
            className="px-3 py-2.5 text-left cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap align-middle amount-heading"
            onClick={() => onSortChange('amount')}
            title="Sort by Amount (ZMW)"
          >
            <div className="sortable-heading">
              <span>Amount (ZMW)</span>
              {renderSortIcon('amount')}
            </div>
          </th>

          {/* 5. Offered / Matched Agent (20%) */}
          <th
            scope="col"
            style={{ width: '20%' }}
            className="px-3 py-2.5 text-left align-middle offered-agent-heading"
          >
            Offered / Matched Agent
          </th>

          {/* 6. Requested (10%, Sortable) */}
          <th
            scope="col"
            style={{ width: '10%' }}
            className="px-3 py-2.5 text-left cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap align-middle requested-heading"
            onClick={() => onSortChange('requestedAt')}
            title="Sort by Request Date"
          >
            <div className="sortable-heading">
              <span>Requested</span>
              {renderSortIcon('requestedAt')}
            </div>
          </th>

          {/* 7. Status (14%, Sortable) */}
          <th
            scope="col"
            style={{ width: '14%' }}
            className="px-3 py-2.5 text-left cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap align-middle status-heading"
            onClick={() => onSortChange('status')}
            title="Sort by Status"
          >
            <div className="sortable-heading">
              <span>Status</span>
              {renderSortIcon('status')}
            </div>
          </th>

          {/* 8. Action (11%) */}
          <th
            scope="col"
            style={{ width: '11%' }}
            className="px-3 py-2.5 text-left whitespace-nowrap align-middle action-heading"
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-xs bg-white">
        {requests.map((req) => {
          const dateParts = getWithdrawalDateParts(req.requestedAt);

          return (
            <tr
              key={req.id}
              className="h-[92px] hover:bg-cyan-50/30 transition-colors group align-middle"
            >
              {/* 1. Reference */}
              <td className="px-3 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap align-middle text-left reference-cell">
                <div className="table-cell-content">
                  <span>{req.reference}</span>
                </div>
              </td>

              {/* 2. Requesting Agent */}
              <td className="px-3 py-2.5 align-middle text-left agent-cell">
                <div className="table-cell-content multiline agent-details w-full min-w-0">
                  <div className="font-semibold text-gray-900 leading-snug truncate w-full">
                    {req.requestingAgentName}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    ID: {req.requestingAgentId}
                  </div>
                  <div className="text-[11px] text-gray-600 font-mono flex items-center justify-start gap-1 w-full">
                    <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">{formatZambianPhone(req.requestingAgentPhone)}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center justify-start gap-1 w-full">
                    <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate w-full">{req.requestingAgentBusiness}</span>
                  </div>
                </div>
              </td>

              {/* 3. Type */}
              <td className="px-3 py-2.5 whitespace-nowrap align-middle text-left type-cell">
                <div className="type-cell-content">
                  <AgentLiquidityTypeBadge requestType={req.requestType} />
                </div>
              </td>

              {/* 4. Amount (ZMW) */}
              <td className="px-3 py-2.5 text-left font-mono font-bold text-gray-900 whitespace-nowrap align-middle amount-cell">
                <div className="table-cell-content">
                  <span>{formatZmwListingAmount(req.amount)}</span>
                </div>
              </td>

              {/* 5. Offered / Matched Agent */}
              <td className="px-3 py-2.5 align-middle text-left offered-agent-cell">
                <div className="offered-agent-wrapper w-full min-w-0">
                  {req.status === 'Matching' && req.currentOfferedAgent ? (
                    <div className="offered-agent-card bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-xs w-full">
                      <div className="flex items-center justify-start gap-1 font-semibold text-amber-900 truncate">
                        <Timer className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                        <span className="truncate">{req.currentOfferedAgent.name}</span>
                      </div>
                      <div className="text-[11px] text-amber-800/90 font-mono mt-0.5 truncate">
                        {req.currentOfferedAgent.id} • 30s Window
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                        Awaiting Response
                      </div>
                    </div>
                  ) : req.status === 'Matching' && !req.currentOfferedAgent ? (
                    <div className="text-gray-500 italic flex items-center justify-start gap-1.5 py-1">
                      <Timer className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
                      <span>Searching for Agent...</span>
                    </div>
                  ) : req.matchedAgent ? (
                    <div className="matched-agent-details w-full min-w-0">
                      <div className="font-semibold text-gray-900 leading-snug truncate w-full">
                        {req.matchedAgent.name}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        ID: {req.matchedAgent.id}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate flex items-center justify-start gap-1 w-full">
                        <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate w-full">{req.matchedAgent.business}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-xs font-medium py-1">
                      {req.status === 'No Agent Available' ? (
                        <span className="inline-flex items-center justify-start px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                          No Agent Available
                        </span>
                      ) : req.status === 'Expired' ? (
                        <span className="inline-flex items-center justify-start px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-50 text-stone-700 border border-stone-200/60">
                          Offer Expired
                        </span>
                      ) : req.status === 'Cancelled' ? (
                        <span className="inline-flex items-center justify-start px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          Cancelled
                        </span>
                      ) : (
                        '—'
                      )}
                    </div>
                  )}
                </div>
              </td>

              {/* 6. Requested Date & Time */}
              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap align-middle text-left requested-cell">
                <div className="requested-cell-content">
                  <div className="font-medium text-gray-900">{dateParts.datePart}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{dateParts.timePart}</div>
                </div>
              </td>

              {/* 7. Status */}
              <td className="px-3 py-2.5 whitespace-nowrap align-middle text-left status-cell">
                <div className="status-cell-content">
                  <AgentLiquidityStatusBadge status={req.status} />
                </div>
              </td>

              {/* 8. Action (Details button) */}
              <td className="px-3 py-2.5 whitespace-nowrap align-middle text-left action-cell">
                <div className="action-cell-content">
                  <button
                    type="button"
                    id={`btn-details-${req.reference.toLowerCase()}`}
                    onClick={() => onDetails(req)}
                    className="inline-flex items-center justify-start gap-1.5 h-[36px] px-3 bg-[#0D93AA]/10 hover:bg-[#0D93AA] text-[#0D93AA] hover:text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 whitespace-nowrap shadow-2xs"
                    aria-label={`View details for liquidity request ${req.reference}`}
                  >
                    <Eye size={14} className="shrink-0" />
                    <span>Details</span>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
