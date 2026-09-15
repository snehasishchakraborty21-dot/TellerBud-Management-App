import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { ServiceAvailability } from '../../types/serviceMode';

interface StatusToggleModalProps {
  isOpen: boolean;
  serviceName: string;
  serviceId: string;
  currentAvailability: ServiceAvailability;
  onConfirm: () => void;
  onClose: () => void;
  isProcessing?: boolean;
  activeRequestsCount?: number;
  pendingRequestsCount?: number;
  isDeactivationBlocked?: boolean;
  blockingReason?: string;
}

export const StatusToggleModal: React.FC<StatusToggleModalProps> = ({
  isOpen,
  serviceName,
  serviceId,
  currentAvailability,
  onConfirm,
  onClose,
  isProcessing = false,
  activeRequestsCount = 14,
  pendingRequestsCount = 6,
  isDeactivationBlocked = false,
  blockingReason,
}) => {
  if (!isOpen) return null;

  const isDeactivating = currentAvailability === 'Active';
  const targetStatus = isDeactivating ? 'Inactive' : 'Active';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-status-toggle-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div
          className={`p-5 border-b border-slate-100 flex items-start justify-between gap-3 ${
            isDeactivating ? 'bg-rose-50/50' : 'bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDeactivating
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isDeactivating ? (
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <h3 id="modal-status-toggle-title" className="text-base font-bold text-slate-900">
                {isDeactivating ? 'Deactivate Service Mode' : 'Activate Service Mode'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {serviceName} ({serviceId})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close status dialog"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {isDeactivating ? (
            <>
              {/* Operational Request Statistics */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Current In-Flight Customer Requests
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <span className="text-xs text-slate-500 block">Active Requests</span>
                    <span className="text-lg font-bold text-slate-900 block mt-0.5">
                      {activeRequestsCount} Active
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      In progress with assigned agents
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <span className="text-xs text-slate-500 block">Pending Requests</span>
                    <span className="text-lg font-bold text-amber-700 block mt-0.5">
                      {pendingRequestsCount} Pending
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Awaiting teller allocation
                    </span>
                  </div>
                </div>
              </div>

              {/* Policy & Impact Explanation */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Existing confirmed requests will continue</strong> and will be completed by assigned agents without interruption.
                  </span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>No new {serviceName} requests will be accepted</strong> across the customer application immediately after deactivation.
                  </span>
                </div>
              </div>

              {/* Deactivation Protection Blocking Banner */}
              {isDeactivationBlocked && (
                <div
                  id="deactivation-blocked-banner"
                  className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900"
                >
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1">
                    <span className="font-bold text-rose-800 block">Deactivation Blocked</span>
                    <p className="leading-relaxed">
                      {blockingReason ||
                        `${serviceName} is currently the only active customer-facing service on the platform. Deactivation is blocked because the platform cannot operate without at least one active customer-facing service.`}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Activation Details */
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to transition <strong>{serviceName}</strong> to{' '}
                <span className="font-semibold text-emerald-700">Active</span>? This service mode
                will immediately become selectable for transactions across customer mobile apps and
                teller terminals.
              </p>
              <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-900 text-xs leading-relaxed">
                <strong>Operational Status:</strong> Eligible provider integrations and scheduling rules will be activated immediately.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="btn-cancel-status-toggle"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-status-toggle"
            onClick={onConfirm}
            disabled={isProcessing || isDeactivationBlocked}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors ${
              isDeactivationBlocked
                ? 'bg-slate-300 cursor-not-allowed opacity-80'
                : isDeactivating
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 cursor-pointer'
                : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer'
            }`}
            title={
              isDeactivationBlocked
                ? 'Deactivation blocked: At least one customer-facing service must remain active.'
                : undefined
            }
          >
            {isProcessing
              ? 'Updating...'
              : isDeactivating
              ? 'Confirm Deactivation'
              : 'Confirm Activation'}
          </button>
        </div>
      </div>
    </div>
  );
};
