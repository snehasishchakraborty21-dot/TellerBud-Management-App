import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentToAgentRequest } from '../../types/admin';
import { AgentLiquidityStatusBadge } from './AgentLiquidityStatusBadge';
import { AgentLiquidityTypeBadge } from './AgentLiquidityTypeBadge';
import { formatZMW, formatWithdrawalDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Repeat,
  Building2,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  ShieldAlert,
  Info,
  Timer,
  Check,
} from 'lucide-react';

interface AgentLiquiditySummaryModalProps {
  request: AgentToAgentRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentLiquiditySummaryModal: React.FC<AgentLiquiditySummaryModalProps> = ({
  request,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0D93AA] flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-title" className="text-base font-bold text-[#102025]">
                  Agent-to-Agent Liquidity Summary
                </h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {request.reference}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto scrollbar-thin">
          {/* Key Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Requested Amount
              </span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">
                {formatZMW(request.amount)}
              </span>
            </div>

            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Request Type
              </span>
              <div className="mt-1">
                <AgentLiquidityTypeBadge requestType={request.requestType} size="sm" />
              </div>
            </div>

            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Requested From
              </span>
              <span className="text-xs font-bold text-[#0D93AA] bg-cyan-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-[#0D93AA]/20">
                {request.requestedFrom}
              </span>
            </div>

            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Status
              </span>
              <div className="mt-1">
                <AgentLiquidityStatusBadge status={request.status} size="sm" />
              </div>
            </div>
          </div>

          {/* Requesting Agent Information */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <User className="w-4 h-4 text-[#0D93AA]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Requesting Agent Details
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Agent Name</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {request.requestingAgentName}
                </span>
                <span className="text-gray-500 font-mono block text-[11px] mt-0.5">
                  ID: {request.requestingAgentId}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Phone Number</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {request.requestingAgentPhone}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] font-semibold text-gray-400 block">Business Center</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {request.requestingAgentBusiness}
                </span>
              </div>
            </div>
          </div>

          {/* Matched or Offered Agent Section */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Repeat className="w-4 h-4 text-[#0D93AA]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {request.status === 'Matching'
                  ? 'Offered Candidate Agent (30s Window)'
                  : request.matchedAgent
                  ? 'Matched Peer Agent'
                  : 'Peer Candidate Status'}
              </h3>
            </div>

            {request.status === 'Matching' && request.currentOfferedAgent ? (
              <div className="space-y-3">
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span className="text-xs font-bold text-amber-900">
                        Active Offer: {request.currentOfferedAgent.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full">
                      30-Second Response Window
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-amber-950">
                    <div>
                      <span className="text-[10px] text-amber-700 font-medium block">Agent ID</span>
                      <span className="font-mono">{request.currentOfferedAgent.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 font-medium block">Phone</span>
                      <span>{request.currentOfferedAgent.phone}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-amber-700 font-medium block">Business Agency</span>
                      <span>{request.currentOfferedAgent.business}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : request.matchedAgent ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 block">Matched Agent</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {request.matchedAgent.name}
                  </span>
                  <span className="text-gray-500 font-mono block text-[11px] mt-0.5">
                    ID: {request.matchedAgent.id}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-gray-400 block">Phone Number</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {request.matchedAgent.phone}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] font-semibold text-gray-400 block">Business Agency</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {request.matchedAgent.business}
                  </span>
                </div>

                {request.matchedAgent.matchedAt && (
                  <div className="sm:col-span-2 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Accepted & matched on {formatWithdrawalDate(request.matchedAgent.matchedAt)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                {request.status === 'No Agent Available' && (
                  <div className="flex items-start gap-2 text-red-700">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      No available peer agent within the regional proximity accepted the request during the discovery window.
                    </span>
                  </div>
                )}
                {request.status === 'Expired' && (
                  <div className="flex items-start gap-2 text-stone-700">
                    <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                    <span>
                      The request lifecycle expired before a peer agent accepted and completed the transfer.
                    </span>
                  </div>
                )}
                {request.status === 'Cancelled' && (
                  <div className="flex items-start gap-2 text-gray-700">
                    <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>
                      This peer liquidity request was cancelled by the requesting agent.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          {request.timeline && request.timeline.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Calendar className="w-4 h-4 text-[#0D93AA]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Lifecycle Timeline
                </h3>
              </div>
              <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {request.timeline.map((event) => (
                  <div key={event.id} className="relative flex items-center justify-between text-xs">
                    <div className="absolute -left-6 w-4 h-4 rounded-full bg-[#0D93AA] text-white flex items-center justify-center ring-4 ring-white">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="font-semibold text-gray-800">{event.status}</span>
                    <span className="text-gray-500 font-mono text-[11px]">
                      {formatWithdrawalDate(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              const basePath = currentUser?.role === 'business_owner'
                ? '/business-owner/operations/agent-to-agent-liquidity'
                : '/super-admin/operations/agent-to-agent-liquidity';
              navigate(`${basePath}/${request.reference}`);
            }}
            className="px-4 py-2 bg-[#0D93AA] hover:bg-[#0b8296] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Open Full Details
          </button>
        </div>
      </div>
    </div>
  );
};
