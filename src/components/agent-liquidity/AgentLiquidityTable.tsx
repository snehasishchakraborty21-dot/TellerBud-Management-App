import React from 'react';
import {
  AgentToAgentRequest,
  AgentToAgentSortField,
  AgentToAgentSortDirection,
} from '../../types/admin';
import { AgentLiquidityStatusBadge } from './AgentLiquidityStatusBadge';
import { AgentLiquidityTypeBadge } from './AgentLiquidityTypeBadge';
import { formatZMW, getWithdrawalDateParts } from '../../utils/formatters';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Repeat,
  Timer,
  Building2,
  Users,
} from 'lucide-react';

interface AgentLiquidityTableProps {
  requests: AgentToAgentRequest[];
  sortField: AgentToAgentSortField;
  sortDirection: AgentToAgentSortDirection;
  onSortChange: (field: AgentToAgentSortField) => void;
  onViewSummary: (request: AgentToAgentRequest) => void;
  isLoading?: boolean;
}

export const AgentLiquidityTable: React.FC<AgentLiquidityTableProps> = ({
  requests,
  sortField,
  sortDirection,
  onSortChange,
  onViewSummary,
  isLoading = false,
}) => {
  const renderSortIcon = (field: AgentToAgentSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA] ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA] ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D93AA]" />
        <p className="mt-3 text-sm text-gray-500 font-medium">
          Loading peer liquidity requests...
        </p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-cyan-50 text-[#0D93AA] mx-auto flex items-center justify-center mb-3">
          <Repeat className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#102025]">No Liquidity Requests Found</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          No peer liquidity requests match your selected filters. Try adjusting your search query, status tab, or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4">
                Reference
              </th>
              <th scope="col" className="py-3.5 px-4">
                Requesting Agent
              </th>
              <th scope="col" className="py-3.5 px-4">
                Requested From
              </th>
              <th scope="col" className="py-3.5 px-4">
                Type
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 cursor-pointer select-none hover:text-[#0D93AA] transition-colors"
                onClick={() => onSortChange('amount')}
              >
                <div className="flex items-center">
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4">
                Offered / Matched Agent
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 cursor-pointer select-none hover:text-[#0D93AA] transition-colors"
                onClick={() => onSortChange('requestedAt')}
              >
                <div className="flex items-center">
                  <span>Requested</span>
                  {renderSortIcon('requestedAt')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 cursor-pointer select-none hover:text-[#0D93AA] transition-colors"
                onClick={() => onSortChange('status')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {requests.map((req) => {
              const dateParts = getWithdrawalDateParts(req.requestedAt);

              return (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Reference */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-gray-900 whitespace-nowrap">
                    {req.reference}
                  </td>

                  {/* Requesting Agent */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div className="font-semibold text-gray-900 truncate">
                      {req.requestingAgentName}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5 mt-0.5 truncate">
                      <span>{req.requestingAgentId}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                      <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{req.requestingAgentBusiness}</span>
                    </div>
                  </td>

                  {/* Requested From */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-[#0D93AA] border border-[#0D93AA]/20">
                      <Users className="w-3 h-3 text-[#0D93AA]" />
                      <span>{req.requestedFrom}</span>
                    </span>
                  </td>

                  {/* Request Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <AgentLiquidityTypeBadge requestType={req.requestType} />
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {formatZMW(req.amount)}
                  </td>

                  {/* Offered / Matched Agent */}
                  <td className="py-3.5 px-4 max-w-[220px]">
                    {req.status === 'Matching' && req.currentOfferedAgent ? (
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-amber-900 truncate">
                          <Timer className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                          <span className="truncate">{req.currentOfferedAgent.name}</span>
                        </div>
                        <div className="text-[11px] text-amber-700/80 font-mono mt-0.5">
                          {req.currentOfferedAgent.id} • 30s Window
                        </div>
                        <div className="text-[10px] text-amber-600 font-medium">
                          Awaiting Response
                        </div>
                      </div>
                    ) : req.status === 'Matching' && !req.currentOfferedAgent ? (
                      <div className="text-gray-500 italic flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                        <span>Searching for Agent...</span>
                      </div>
                    ) : req.matchedAgent ? (
                      <div>
                        <div className="font-semibold text-gray-900 truncate">
                          {req.matchedAgent.name}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {req.matchedAgent.id}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">
                          {req.matchedAgent.business}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs font-medium">
                        {req.status === 'No Agent Available'
                          ? 'No Agent Available'
                          : req.status === 'Expired'
                          ? 'Offer Expired'
                          : req.status === 'Cancelled'
                          ? 'Cancelled'
                          : '—'}
                      </div>
                    )}
                  </td>

                  {/* Requested Date & Time */}
                  <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{dateParts.datePart}</div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">{dateParts.timePart}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <AgentLiquidityStatusBadge status={req.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewSummary(req)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 text-[#0D93AA] font-semibold rounded-lg text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Summary</span>
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
