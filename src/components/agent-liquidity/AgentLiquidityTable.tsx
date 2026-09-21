import React from 'react';
import {
  AgentToAgentRequest,
  AgentToAgentSortField,
  AgentToAgentSortDirection,
} from '../../types/admin';
import { AgentLiquidityStatusBadge } from './AgentLiquidityStatusBadge';
import { AgentLiquidityTypeBadge } from './AgentLiquidityTypeBadge';
import { formatZMW, getWithdrawalDateParts } from '../../utils/formatters';
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
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA] ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA] ml-1 inline" />
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
    <table className="w-full text-left border-collapse min-w-[960px]">
      <thead className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none shadow-2xs">
        <tr>
          {/* 1. Reference */}
          <th scope="col" className="py-3 px-3.5 w-[140px] whitespace-nowrap">
            Reference
          </th>

          {/* 2. Requesting Agent */}
          <th scope="col" className="py-3 px-3.5 min-w-[210px]">
            Requesting Agent
          </th>

          {/* 3. Type */}
          <th scope="col" className="py-3 px-3 w-[90px] whitespace-nowrap">
            Type
          </th>

          {/* 4. Amount (Sortable) */}
          <th
            scope="col"
            className="py-3 px-3.5 w-[130px] cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap"
            onClick={() => onSortChange('amount')}
            title="Sort by Amount"
          >
            <div className="flex items-center">
              <span>Amount</span>
              {renderSortIcon('amount')}
            </div>
          </th>

          {/* 5. Offered / Matched Agent */}
          <th scope="col" className="py-3 px-3.5 min-w-[220px]">
            Offered / Matched Agent
          </th>

          {/* 6. Requested (Sortable) */}
          <th
            scope="col"
            className="py-3 px-3.5 w-[140px] cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap"
            onClick={() => onSortChange('requestedAt')}
            title="Sort by Request Date"
          >
            <div className="flex items-center">
              <span>Requested</span>
              {renderSortIcon('requestedAt')}
            </div>
          </th>

          {/* 7. Status (Sortable) */}
          <th
            scope="col"
            className="py-3 px-3.5 w-[140px] cursor-pointer select-none hover:text-[#0D93AA] transition-colors whitespace-nowrap"
            onClick={() => onSortChange('status')}
            title="Sort by Status"
          >
            <div className="flex items-center">
              <span>Status</span>
              {renderSortIcon('status')}
            </div>
          </th>

          {/* 8. Action */}
          <th scope="col" className="py-3 px-3.5 text-right w-[110px] whitespace-nowrap">
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
              className="hover:bg-cyan-50/30 transition-colors group"
            >
              {/* 1. Reference */}
              <td className="py-3 px-3.5 font-mono font-bold text-gray-900 whitespace-nowrap align-middle">
                {req.reference}
              </td>

              {/* 2. Requesting Agent */}
              <td className="py-3 px-3.5 align-middle">
                <div className="font-semibold text-gray-900 leading-snug">
                  {req.requestingAgentName}
                </div>
                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                  ID: {req.requestingAgentId}
                </div>
                <div className="text-[11px] text-gray-600 font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{formatZambianPhone(req.requestingAgentPhone)}</span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{req.requestingAgentBusiness}</span>
                </div>
              </td>

              {/* 3. Type */}
              <td className="py-3 px-3 whitespace-nowrap align-middle">
                <AgentLiquidityTypeBadge requestType={req.requestType} />
              </td>

              {/* 4. Amount */}
              <td className="py-3 px-3.5 font-mono font-bold text-gray-900 whitespace-nowrap align-middle">
                {formatZMW(req.amount)}
              </td>

              {/* 5. Offered / Matched Agent */}
              <td className="py-3 px-3.5 align-middle">
                {req.status === 'Matching' && req.currentOfferedAgent ? (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-amber-900 truncate">
                      <Timer className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                      <span className="truncate">{req.currentOfferedAgent.name}</span>
                    </div>
                    <div className="text-[11px] text-amber-800/90 font-mono mt-0.5">
                      {req.currentOfferedAgent.id} • 30s Window
                    </div>
                    <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                      Awaiting Response
                    </div>
                  </div>
                ) : req.status === 'Matching' && !req.currentOfferedAgent ? (
                  <div className="text-gray-500 italic flex items-center gap-1.5 py-1">
                    <Timer className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
                    <span>Searching for Agent...</span>
                  </div>
                ) : req.matchedAgent ? (
                  <div>
                    <div className="font-semibold text-gray-900 leading-snug">
                      {req.matchedAgent.name}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                      ID: {req.matchedAgent.id}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{req.matchedAgent.business}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs font-medium py-1">
                    {req.status === 'No Agent Available' ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                        No Agent Available
                      </span>
                    ) : req.status === 'Expired' ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-50 text-stone-700 border border-stone-200/60">
                        Offer Expired
                      </span>
                    ) : req.status === 'Cancelled' ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        Cancelled
                      </span>
                    ) : (
                      '—'
                    )}
                  </div>
                )}
              </td>

              {/* 6. Requested Date & Time */}
              <td className="py-3 px-3.5 text-gray-700 whitespace-nowrap align-middle">
                <div className="font-medium text-gray-900">{dateParts.datePart}</div>
                <div className="text-[11px] text-gray-500 font-mono mt-0.5">{dateParts.timePart}</div>
              </td>

              {/* 7. Status */}
              <td className="py-3 px-3.5 whitespace-nowrap align-middle">
                <AgentLiquidityStatusBadge status={req.status} />
              </td>

              {/* 8. Action (Details button) */}
              <td className="py-3 px-3.5 text-right whitespace-nowrap align-middle">
                <button
                  type="button"
                  id={`btn-details-${req.reference.toLowerCase()}`}
                  onClick={() => onDetails(req)}
                  className="inline-flex items-center justify-center gap-1.5 min-w-[88px] h-[36px] px-3 bg-[#0D93AA]/10 hover:bg-[#0D93AA] text-[#0D93AA] hover:text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 whitespace-nowrap shadow-2xs"
                  aria-label={`View details for liquidity request ${req.reference}`}
                >
                  <Eye size={14} className="shrink-0" />
                  <span>Details</span>
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
