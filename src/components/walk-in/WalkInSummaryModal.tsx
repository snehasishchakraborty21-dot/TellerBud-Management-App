import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  User,
  Phone,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Receipt,
  Store,
} from 'lucide-react';
import { WalkInTransaction } from '../../types/admin';
import { VendorLogo } from './VendorLogo';
import { WalkInStatusBadge } from './WalkInStatusBadge';
import { WalkInTypeBadge } from './WalkInTypeBadge';
import { formatZMW } from '../../config/appConfig';

interface WalkInSummaryModalProps {
  transaction: WalkInTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WalkInSummaryModal: React.FC<WalkInSummaryModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const datePart = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return `${datePart}, ${timePart}`;
    } catch {
      return isoString;
    }
  };

  const handleOpenFullDetails = () => {
    onClose();
    navigate(`/business-owner/walk-in-transactions/${transaction.reference}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="walkin-summary-title"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Reference {transaction.reference}
            </span>
            <h2
              id="walkin-summary-title"
              className="text-lg font-bold text-gray-900 tracking-tight"
            >
              Walk-In Transaction Summary
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close summary modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Header Banner */}
          <div className="bg-gradient-to-r from-gray-50 to-cyan-50/30 p-4.5 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-medium block">
                Transaction Amount
              </span>
              <div className="text-2xl font-bold font-mono text-gray-900 tracking-tight">
                {formatZMW(transaction.amount)}
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <WalkInTypeBadge type={transaction.transactionType} />
                <VendorLogo vendor={transaction.vendor} size="detail" showName={true} />
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end space-y-1">
              <span className="text-xs text-gray-500 font-medium">Status</span>
              <WalkInStatusBadge status={transaction.status} size="md" />
              <div className="text-[11px] text-gray-500 flex items-center gap-1 font-mono pt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{formatDateTime(transaction.transactionTime)}</span>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Agent Details & Customer / Terminal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Agent Details */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-200/60 text-gray-900 font-bold text-xs">
                <User className="w-3.5 h-3.5 text-[#0D93AA]" />
                <span>Agent Details</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Agent Name & ID
                  </span>
                  <div className="font-bold text-gray-900">{transaction.agentName}</div>
                  <div className="font-mono text-gray-500 text-[11px]">{transaction.agentId}</div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Agent Phone
                  </span>
                  <div className="font-mono text-gray-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{transaction.agentPhone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Business Center
                  </span>
                  <div className="text-gray-800 font-medium flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{transaction.businessName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Customer & Transaction Identifiers */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-200/60 text-gray-900 font-bold text-xs">
                <Store className="w-3.5 h-3.5 text-[#0D93AA]" />
                <span>Walk-In Identifiers</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Customer Phone
                  </span>
                  <div className="font-mono font-bold text-gray-900 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#0D93AA]" />
                    <span>{transaction.customerPhone}</span>
                  </div>
                </div>

                {transaction.terminalId && (
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Terminal / POS
                    </span>
                    <div className="font-mono text-gray-700">{transaction.terminalId}</div>
                  </div>
                )}

                {transaction.receiptNumber && (
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Receipt Reference
                    </span>
                    <div className="font-mono text-gray-700 flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-gray-400" />
                      <span>{transaction.receiptNumber}</span>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Transaction Timestamp
                  </span>
                  <div className="font-mono text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{formatDateTime(transaction.transactionTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Lifecycle Timeline */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Lifecycle Timeline
            </h3>

            <div className="bg-white border border-gray-100 rounded-xl p-4.5 space-y-4 shadow-2xs">
              {transaction.timeline.map((event, index) => {
                const isLast = index === transaction.timeline.length - 1;

                return (
                  <div key={event.id} className="relative flex items-start gap-3">
                    {/* Connecting Vertical Line */}
                    {!isLast && (
                      <div
                        className="absolute left-[11px] top-6 w-[2px] bg-gray-200"
                        style={{ height: 'calc(100% + 4px)' }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Oceanic Blue Circular Tick */}
                    <div className="relative z-10 w-6 h-6 rounded-full bg-[#0D93AA] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Event Info (No actor info, no agent notes) */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900">
                          {event.status}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500 whitespace-nowrap">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm font-semibold rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleOpenFullDetails}
            className="px-4 py-2 bg-[#0D93AA] hover:bg-[#0b8296] text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30"
          >
            <span>Open Full Details</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
