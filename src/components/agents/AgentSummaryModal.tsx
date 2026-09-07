import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentRecord } from '../../types/admin';
import { AgentAvailabilityBadge } from './AgentAvailabilityBadge';
import { AgentAssignmentBadge } from './AgentAssignmentBadge';
import { AgentAttendanceBadge } from './AgentAttendanceBadge';
import {
  X,
  Building2,
  Phone,
  Clock,
  Banknote,
  ExternalLink,
  Activity,
  Calendar,
  Wallet,
  MessageSquare,
} from 'lucide-react';

interface AgentSummaryModalProps {
  agent: AgentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentSummaryModal: React.FC<AgentSummaryModalProps> = ({
  agent,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !agent) return null;

  const formatZMW = (val: number) => {
    return `ZMW ${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleOpenFullDetails = () => {
    onClose();
    navigate(`/business-owner/agents/${agent.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900">Agent Summary</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close summary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Agent Identity Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-200/70">
            <div className="flex items-center gap-3.5">
              {agent.avatarUrl ? (
                <img
                  src={agent.avatarUrl}
                  alt={agent.name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div className="w-13 h-13 rounded-full bg-cyan-50 border border-[#0D93AA]/30 text-[#0D93AA] font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                  {agent.avatarInitials}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    {agent.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {agent.accountStatus}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="font-mono font-semibold text-gray-700">
                    {agent.id}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {agent.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
              <AgentAvailabilityBadge status={agent.availability} size="md" />
              <div className="text-[11px] text-gray-500 font-medium">
                Active: {agent.lastActive}
              </div>
            </div>
          </div>

          {/* Operational Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-2xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Current Activity
              </span>
              <AgentAssignmentBadge assignment={agent.assignment} size="md" />
            </div>

            <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-2xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Attendance Today
              </span>
              <AgentAttendanceBadge
                status={agent.attendance}
                checkInTime={agent.checkInTime}
                size="md"
              />
            </div>

            <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-2xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Business Centre
              </span>
              <div className="flex items-start gap-1.5 text-xs font-semibold text-gray-800 leading-snug">
                <Building2 className="w-3.5 h-3.5 text-[#0D93AA] shrink-0 mt-0.5" />
                <span>{agent.businessCentre}</span>
              </div>
            </div>
          </div>

          {/* Wallet Balances (Clearly labeled Cash Position & Float Position) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-200 bg-cyan-50/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-600">
                  Cash Position
                </span>
                <Wallet className="w-4 h-4 text-[#0D93AA]" />
              </div>
              <div className="text-lg font-bold text-gray-900 tracking-tight font-mono">
                {formatZMW(agent.cashPosition)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 bg-blue-50/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-600">
                  Float Position
                </span>
                <Banknote className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-900 tracking-tight font-mono">
                {formatZMW(agent.floatPosition)}
              </div>
            </div>
          </div>

          {/* Recent Operational Activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0D93AA]" />
                Recent Operational Activity
              </h4>
            </div>

            {agent.recentActivity && agent.recentActivity.length > 0 ? (
              <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 bg-white shadow-2xs">
                {agent.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {act.type}
                        </span>
                        {act.reference && (
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                            {act.reference}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{act.timestamp}</span>
                      </div>
                    </div>

                    {act.amount !== undefined && (
                      <div className="text-right shrink-0">
                        <span className="font-bold text-gray-900 block font-mono">
                          {formatZMW(act.amount)}
                        </span>
                        {act.status && (
                          <span className="text-[10px] font-semibold text-emerald-600">
                            {act.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-center text-xs text-gray-500">
                No recent transactions recorded for this shift.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            id={`btn-modal-chat-agent-${agent.id}`}
            onClick={() => {
              onClose();
              navigate(`/business-owner/communication/chats?agentId=${agent.id}`);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 border border-[#0D93AA]/30 rounded-lg transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={handleOpenFullDetails}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7A8D] rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <span>Open Full Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
