import React from 'react';
import { X, User, Phone, Calendar, Clock, ShieldCheck, CheckCircle2, Send } from 'lucide-react';
import { BusinessAgentFundingRequest } from '../../types/businessWallet';

interface AgentFundingRequestModalProps {
  request: BusinessAgentFundingRequest;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onDispatch?: (id: string) => void;
}

export const AgentFundingRequestModal: React.FC<AgentFundingRequestModalProps> = ({
  request,
  onClose,
  onApprove,
  onDispatch,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-[#102025]">
              Agent Funding Request Details
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Reference: {request.reference}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Agent Identity */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center font-bold text-xs">
                  {request.agentName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {request.agentName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {request.agentId}
                  </div>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  request.status === 'Pending Review'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : request.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {request.status}
              </span>
            </div>

            {/* Mobile number - ALL DIGITS VISIBLE */}
            <div className="flex items-center gap-2 text-xs text-slate-700 pt-1 border-t border-slate-200/60">
              <Phone size={13} className="text-slate-400" />
              <span className="font-mono font-medium">{request.agentPhone}</span>
            </div>
          </div>

          {/* Submission Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-slate-500">Request Reference</span>
              <span className="font-mono font-semibold text-slate-800">
                {request.reference}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-slate-500">Submission Timestamp</span>
              <span className="font-medium text-slate-700">
                {request.submittedAt}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-slate-500">Current Agent Operating Float</span>
              <span className="font-mono font-semibold text-slate-800">
                ZMW {request.currentFloat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Review Status</span>
              <span className="font-medium text-slate-700">{request.status}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            {request.status === 'Pending Review' && onApprove && (
              <button
                type="button"
                onClick={() => {
                  onApprove(request.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <CheckCircle2 size={13} />
                <span>Approve Request</span>
              </button>
            )}
            {request.status === 'Approved' && onDispatch && (
              <button
                type="button"
                onClick={() => {
                  onDispatch(request.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Send size={13} />
                <span>Dispatch Float</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
