import React from 'react';
import { CashFloatStatus } from '../../types/admin';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export type CashFloatModalAction =
  | 'Approve'
  | 'Mark Processing'
  | 'Mark Fulfilled'
  | 'Reject';

interface CashFloatActionPanelProps {
  status: CashFloatStatus;
  onInitiateAction: (action: CashFloatModalAction) => void;
  disabled?: boolean;
  title?: string;
}

export const CashFloatActionPanel: React.FC<CashFloatActionPanelProps> = ({
  status,
  onInitiateAction,
  disabled = false,
  title = 'Business Owner Actions',
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <ShieldCheck className="w-4 h-4 text-[#0D93AA]" />
        <h2 className="text-sm font-bold text-[#102025]">{title}</h2>
      </div>

      {/* 1. Pending Review State */}
      {status === 'Pending Review' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Approve')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D93AA] text-white text-sm font-semibold rounded-lg hover:bg-[#0b8296] active:bg-[#096e80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Approve</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Reject')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      )}

      {/* 2. Approved State */}
      {status === 'Approved' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Mark Processing')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D93AA] text-white text-sm font-semibold rounded-lg hover:bg-[#0b8296] active:bg-[#096e80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Mark Processing</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Reject')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      )}

      {/* 3. Processing State */}
      {status === 'Processing' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Mark Fulfilled')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D93AA] text-white text-sm font-semibold rounded-lg hover:bg-[#0b8296] active:bg-[#096e80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Fulfilled</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onInitiateAction('Reject')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>
      )}

      {/* 4. Fulfilled Terminal State */}
      {status === 'Fulfilled' && (
        <div className="py-4 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0D93AA] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-[#0D93AA]" />
          </div>
          <div className="text-sm font-bold text-[#102025]">
            Status: Fulfilled
          </div>
        </div>
      )}

      {/* 5. Rejected Terminal State */}
      {status === 'Rejected' && (
        <div className="py-4 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7" />
          </div>
          <div className="text-sm font-bold text-red-600">
            Status: Rejected
          </div>
        </div>
      )}

      {/* 6. Cancelled Terminal State */}
      {status === 'Cancelled' && (
        <div className="py-4 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
            <Ban className="w-7 h-7" />
          </div>
          <div className="text-sm font-bold text-gray-700">
            Status: Cancelled
          </div>
        </div>
      )}
    </div>
  );
};
