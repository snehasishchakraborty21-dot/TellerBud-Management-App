import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Banknote, Coins, Building2, User, Phone, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { CashFloatRequest } from '../../types/admin';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW, formatWithdrawalDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface CashFloatSummaryModalProps {
  request: CashFloatRequest | null;
  onClose: () => void;
}

export const CashFloatSummaryModal: React.FC<CashFloatSummaryModalProps> = ({
  request,
  onClose,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (request) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedElementRef.current) {
          previouslyFocusedElementRef.current.focus();
        }
      };
    }
  }, [request, onClose]);

  if (!request) return null;

  const handleOpenFullDetails = () => {
    const basePath = currentUser?.role === 'business_owner'
      ? '/business-owner/cash-float-requests'
      : '/super-admin/operations/cash-float-requests';
    navigate(`${basePath}/${request.reference}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="cash-float-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h3
                id="cash-float-modal-title"
                className="text-base font-bold text-[#102025]"
              >
                Cash / Float Request Summary
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {request.reference}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Top Metric Strip */}
            <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  REQUESTED AMOUNT
                </span>
                <div className="text-2xl font-bold text-[#102025] tracking-tight mt-0.5">
                  {formatZMW(request.amount)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  CURRENT STATUS
                </span>
                <StatusChip status={request.status} />
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Agent & Business Details */}
              <div className="p-3.5 bg-gray-50/40 rounded-xl border border-gray-100 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-[#0D93AA]" />
                  <span>Agent Information</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{request.agentName}</div>
                  <div className="font-mono text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{request.agentPhone}</span>
                  </div>
                  <div className="text-gray-400 font-mono text-[11px] mt-0.5">
                    ID: {request.agentId}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#0D93AA]" />
                    <span>Business</span>
                  </div>
                  <div className="font-medium text-gray-800 mt-0.5">
                    {request.businessName}
                  </div>
                </div>
              </div>

              {/* Request Metadata */}
              <div className="p-3.5 bg-gray-50/40 rounded-xl border border-gray-100 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#0D93AA]" />
                  <span>Request Specifications</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Requested From:</span>
                    <span className="font-semibold text-gray-900 bg-cyan-50 text-[#0D93AA] px-2 py-0.5 rounded text-[11px]">
                      {request.requestedFrom}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Request Type:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                        request.requestType === 'Cash'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {request.requestType === 'Cash' ? (
                        <Banknote className="w-3 h-3" />
                      ) : (
                        <Coins className="w-3 h-3" />
                      )}
                      <span>{request.requestType}</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Date Requested:</span>
                    <span className="font-medium text-gray-900">
                      {formatWithdrawalDate(request.requestedAt)}
                    </span>
                  </div>
                </div>

                {request.notes && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Agent Notes:
                    </span>
                    <p className="text-gray-700 mt-0.5 italic">{request.notes}</p>
                  </div>
                )}

                {request.reason && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                      Status Reason:
                    </span>
                    <p className="text-red-700 mt-0.5 font-medium">{request.reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status History Timeline */}
            {request.history && request.history.length > 0 && (
              <div className="p-3.5 bg-gray-50/40 rounded-xl border border-gray-100 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0D93AA]" />
                  <span>Timeline</span>
                </div>
                <div className="relative pl-4 space-y-3 pt-1">
                  {/* Vertical connecting line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#0D93AA]/25 rounded-full" />

                  {request.history.map((h, idx) => (
                    <div key={h.id || idx} className="relative flex items-center justify-between text-xs">
                      {/* Circular tick */}
                      <div className="absolute -left-4 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white border border-[#0D93AA] text-[#0D93AA]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0D93AA]" />
                      </div>
                      <span className="font-semibold text-gray-800 ml-1.5">{h.status}</span>
                      <span className="text-gray-500 font-mono text-[11px]">
                        {formatWithdrawalDate(h.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleOpenFullDetails}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e93] active:bg-[#096a7d] rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 cursor-pointer"
            >
              Open Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
