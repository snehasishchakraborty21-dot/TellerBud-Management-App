import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

export interface PendingOperationalChange {
  field: string;
  previousValue: string;
  newValue: string;
}

interface ConfirmOperationalChangesModalProps {
  isOpen: boolean;
  serviceName: string;
  serviceId: string;
  changes: PendingOperationalChange[];
  onConfirm: () => void;
  onClose: () => void;
  isSaving?: boolean;
}

export const ConfirmOperationalChangesModal: React.FC<ConfirmOperationalChangesModalProps> = ({
  isOpen,
  serviceName,
  serviceId,
  changes,
  onConfirm,
  onClose,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirm-changes-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="modal-confirm-changes-title"
                className="text-base font-bold text-slate-900"
              >
                Confirm Operational Changes
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {serviceName} ({serviceId})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation dialog"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
            <strong>Warning:</strong> You are modifying operational routing parameters. Changes take
            effect immediately across customer mobile applications and active agent terminal nodes.
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              Summary of Modifications ({changes.length})
            </span>
            {changes.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No parameters were modified.</p>
            ) : (
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {changes.map((change, idx) => (
                  <div key={idx} className="p-2.5 text-xs flex flex-col gap-1">
                    <span className="font-semibold text-slate-800">{change.field}</span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded line-through">
                        {change.previousValue}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                        {change.newValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-apply-changes"
            onClick={onConfirm}
            disabled={isSaving || changes.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0a7587] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isSaving ? 'Applying Changes...' : 'Confirm & Apply Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
