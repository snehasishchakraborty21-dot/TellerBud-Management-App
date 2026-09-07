import React, { useState, useEffect, useRef } from 'react';
import { CashFloatRequest } from '../../types/admin';
import { CashFloatModalAction } from './CashFloatActionPanel';
import { StatusChip } from '../shared/StatusChip';
import { formatZMW } from '../../utils/formatters';
import { X, AlertCircle, Loader2 } from 'lucide-react';

interface CashFloatActionModalProps {
  actionType: CashFloatModalAction | null;
  request: CashFloatRequest;
  isOpen: boolean;
  isProcessing: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (payload?: {
    reason?: string;
    manualReference?: string;
    internalNote?: string;
  }) => void;
}

export const CashFloatActionModal: React.FC<CashFloatActionModalProps> = ({
  actionType,
  request,
  isOpen,
  isProcessing,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [manualReference, setManualReference] = useState('');
  const [internalNote, setInternalNote] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement | HTMLTextAreaElement | null>(null);

  // Reset form inputs when modal opens/changes
  useEffect(() => {
    if (isOpen) {
      setRejectionReason('');
      setValidationError(null);
      setManualReference('');
      setInternalNote('');
    }
  }, [isOpen, actionType]);

  // Handle ESC key to close modal safely before submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  // Focus trap / auto-focus
  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen || !actionType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (actionType === 'Reject') {
      if (!rejectionReason.trim()) {
        setValidationError('Please provide a reason for rejecting this request.');
        return;
      }
      onConfirm({ reason: rejectionReason.trim() });
      return;
    }

    if (actionType === 'Mark Fulfilled') {
      onConfirm({
        manualReference: manualReference.trim(),
        internalNote: internalNote.trim(),
      });
      return;
    }

    onConfirm();
  };

  const getModalTitle = () => {
    switch (actionType) {
      case 'Approve':
        return 'Approve Cash / Float Request';
      case 'Mark Processing':
        return 'Mark Request as Processing';
      case 'Mark Fulfilled':
        return 'Mark Request as Fulfilled';
      case 'Reject':
        return 'Reject Cash / Float Request';
    }
  };

  const fulfilmentMethod =
    request.requestType === 'Float'
      ? 'Manual Float Transfer'
      : 'Physical Cash Handover';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cfr-action-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2
            id="cfr-action-modal-title"
            className="text-base font-bold text-[#102025]"
          >
            {getModalTitle()}
          </h2>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Error alerts */}
          {(errorMessage || validationError) && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{validationError || errorMessage}</span>
            </div>
          )}

          {/* Core Transaction Metadata Grid */}
          <div className="bg-gray-50/80 border border-gray-200/70 rounded-lg p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Reference
              </span>
              <span className="font-mono font-bold text-gray-900">
                {request.reference}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Agent
              </span>
              <span className="font-semibold text-gray-900">
                {request.agentName}
              </span>
            </div>

            {actionType === 'Mark Fulfilled' && (
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Agent ID
                </span>
                <span className="font-mono text-gray-800">
                  {request.agentId}
                </span>
              </div>
            )}

            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Request Type
              </span>
              <span className="font-semibold text-gray-900">
                {request.requestType}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {actionType === 'Mark Processing' ? 'Amount' : 'Requested Amount'}
              </span>
              <span className="font-bold text-gray-900">
                {formatZMW(request.amount)}
              </span>
            </div>

            {(actionType === 'Approve' || actionType === 'Mark Fulfilled') && (
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Requested From
                </span>
                <span className="font-medium text-gray-800">
                  {request.requestedFrom}
                </span>
              </div>
            )}

            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Current Status
              </span>
              <div>
                <StatusChip status={request.status} size="sm" />
              </div>
            </div>

            {actionType === 'Mark Fulfilled' && (
              <div className="col-span-2 pt-1 border-t border-gray-200/60">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Fulfilment Method
                </span>
                <span className="font-semibold text-[#0D93AA]">
                  {fulfilmentMethod}
                </span>
              </div>
            )}
          </div>

          {/* Mark Fulfilled Specific Inputs */}
          {actionType === 'Mark Fulfilled' && (
            <div className="space-y-3 pt-2">
              <div>
                <label
                  htmlFor="manualReferenceInput"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Manual Reference <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="manualReferenceInput"
                  type="text"
                  value={manualReference}
                  onChange={(e) => setManualReference(e.target.value)}
                  placeholder="Enter transfer or handover reference"
                  disabled={isProcessing}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 focus:border-[#0D93AA] transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="internalNoteInput"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Internal Note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="internalNoteInput"
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add an internal fulfilment note"
                  disabled={isProcessing}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 focus:border-[#0D93AA] transition-all disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          )}

          {/* Reject Specific Inputs */}
          {actionType === 'Reject' && (
            <div className="space-y-1.5 pt-2">
              <label
                htmlFor="rejectionReasonInput"
                className="block text-xs font-semibold text-gray-700"
              >
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectionReasonInput"
                ref={(el) => {
                  initialFocusRef.current = el;
                }}
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter mandatory reason for rejecting this request..."
                disabled={isProcessing}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all disabled:opacity-50 resize-none"
              />
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            {actionType === 'Approve' && (
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] active:bg-[#096e80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Approval</span>
              </button>
            )}

            {actionType === 'Mark Processing' && (
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] active:bg-[#096e80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Processing</span>
              </button>
            )}

            {actionType === 'Mark Fulfilled' && (
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] active:bg-[#096e80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Fulfilled</span>
              </button>
            )}

            {actionType === 'Reject' && (
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
