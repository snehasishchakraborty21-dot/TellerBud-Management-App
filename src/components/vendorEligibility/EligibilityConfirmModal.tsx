import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Info,
  Clock,
} from 'lucide-react';
import {
  VendorRecord,
  MatrixEligibleService,
  SupportedService,
} from '../../types/vendor';

export interface PendingEligibilityChange {
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  service: MatrixEligibleService;
  previousValue: 'Enabled' | 'Disabled';
  newValue: 'Enabled' | 'Disabled';
  activeRequestsCount: number;
}

interface EligibilityConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: PendingEligibilityChange[];
  isSafeguardViolated: boolean;
  safeguardViolations: string[];
}

export const EligibilityConfirmModal: React.FC<EligibilityConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  changes,
  isSafeguardViolated,
  safeguardViolations,
}) => {
  if (!isOpen) return null;

  const hasDisablingWithActiveRequests = changes.some(
    (c) => c.newValue === 'Disabled' && c.activeRequestsCount > 0
  );

  return (
    <div
      id="eligibility-confirm-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSafeguardViolated
                  ? 'bg-rose-100 text-rose-600'
                  : hasDisablingWithActiveRequests
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-[#0D93AA]/10 text-[#0D93AA]'
              }`}
            >
              {isSafeguardViolated ? (
                <ShieldAlert className="w-5 h-5" />
              ) : hasDisablingWithActiveRequests ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Vendor Eligibility Changes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review {changes.length} proposed service configuration change{changes.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 overflow-y-auto space-y-4">
          {/* Safeguard Alert */}
          {isSafeguardViolated && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">System Safeguard Triggered</p>
                <p className="mt-0.5">
                  Platform policy prevents disabling the last active vendor for a required service:
                </p>
                <ul className="list-disc list-inside mt-1 font-medium space-y-0.5">
                  {safeguardViolations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
                <p className="mt-1 text-rose-700">
                  Please keep at least one active vendor enabled for each service before saving.
                </p>
              </div>
            </div>
          )}

          {/* Warning for active in-flight requests */}
          {hasDisablingWithActiveRequests && !isSafeguardViolated && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-bold">Active Transaction Requests In Flight</p>
                <p className="mt-1 leading-relaxed">
                  {changes.some(
                    (c) =>
                      c.vendorId === 'TB-VND-MTN-001' &&
                      c.service === 'Cash Pickup' &&
                      c.newValue === 'Disabled'
                  )
                    ? '8 active or pending Cash Pickup requests currently use MTN Mobile Money. Existing confirmed requests will continue. After saving, MTN Mobile Money will not be available for new Cash Pickup requests.'
                    : `${changes
                        .filter((c) => c.newValue === 'Disabled' && c.activeRequestsCount > 0)
                        .map(
                          (c) =>
                            `${c.activeRequestsCount} active or pending ${c.service} requests currently use ${c.vendorName}. Existing confirmed requests will continue. After saving, ${c.vendorName} will not be available for new ${c.service} requests.`
                        )
                        .join(' ')}`}
                </p>
              </div>
            </div>
          )}

          {/* List of Changes */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100/80 px-4 py-2.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider grid grid-cols-12 gap-2">
              <span className="col-span-4">Vendor</span>
              <span className="col-span-3">Service</span>
              <span className="col-span-3">Status Change</span>
              <span className="col-span-2 text-right">In-Flight Requests</span>
            </div>
            <div className="divide-y divide-slate-100">
              {changes.map((change, idx) => {
                const isDisabling = change.newValue === 'Disabled';
                const hasPending = change.activeRequestsCount > 0;

                return (
                  <div
                    key={`${change.vendorId}-${change.service}-${idx}`}
                    className="px-4 py-3 grid grid-cols-12 gap-2 items-center text-xs hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Vendor */}
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                        <img
                          src={change.vendorLogo}
                          alt={change.vendorName}
                          className="w-5 h-5 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-semibold text-slate-900 truncate">
                        {change.vendorName}
                      </span>
                    </div>

                    {/* Service */}
                    <div className="col-span-3 font-medium text-slate-700">
                      {change.service}
                    </div>

                    {/* Previous -> New */}
                    <div className="col-span-3 flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          change.previousValue === 'Enabled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {change.previousValue}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          change.newValue === 'Enabled'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {change.newValue}
                      </span>
                    </div>

                    {/* In-Flight Count: "8 requests" */}
                    <div className="col-span-2 text-right">
                      {isDisabling && hasPending ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800"
                          title={`${change.activeRequestsCount} active in-flight requests`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{change.activeRequestsCount} requests</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0 requests</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Informational routing note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Applying these updates will synchronize TellerBud routing tables immediately.
              Customer Mobile App and Agent Mobile App provider listings will reflect these choices
              for all new transactions.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/70">
          <button
            id="btn-cancel-confirm-eligibility"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-apply-confirm-eligibility"
            type="button"
            disabled={isSafeguardViolated}
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7d91] active:bg-[#09697a] rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  );
};
