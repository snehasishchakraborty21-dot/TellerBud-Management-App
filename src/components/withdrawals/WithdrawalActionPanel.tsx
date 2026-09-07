import React from 'react';
import { WithdrawalStatus } from '../../types/admin';
import { Check, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * TellerBud Admin Action Panel
 * CODE BOUNDARY NOTICE: Frontend role visibility and action triggers are for client review only.
 * The production backend service (Cloud Functions / Firebase rules) must independently verify
 * TellerBud Admin authentication, claims, idempotency tokens, and status transition preconditions.
 */

interface WithdrawalActionPanelProps {
  status: WithdrawalStatus;
  onInitiateAction: (action: 'Approve' | 'Mark Processing' | 'Mark Paid' | 'Reject') => void;
  disabled?: boolean;
}

export const WithdrawalActionPanel: React.FC<WithdrawalActionPanelProps> = ({
  status,
  onInitiateAction,
  disabled = false,
}) => {
  const isTerminal = status === 'Paid' || status === 'Rejected' || status === 'Cancelled';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h2 className="text-base font-bold text-[#102025] mb-5">
        TellerBud Admin Actions
      </h2>

      {status === 'Pending Review' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Approve')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D93AA] hover:bg-[#0b8296] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>Approve</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Reject')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      )}

      {status === 'Approved' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Mark Processing')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D93AA] hover:bg-[#0b8296] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Mark Processing</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Reject')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      )}

      {status === 'Processing' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Mark Paid')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Paid</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Reject')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      )}

      {isTerminal && (
        <div className="rounded-lg p-4 bg-gray-50 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 bg-gray-200 text-gray-700">
            {status === 'Paid' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            {status === 'Rejected' && <XCircle className="w-5 h-5 text-red-600" />}
            {status === 'Cancelled' && <AlertCircle className="w-5 h-5 text-gray-600" />}
          </div>
          <p className="text-sm font-bold text-[#102025]">Status: {status}</p>
        </div>
      )}
    </div>
  );
};
