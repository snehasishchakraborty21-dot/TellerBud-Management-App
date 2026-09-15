import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface EligibilityDiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  unsavedCount: number;
}

export const EligibilityDiscardModal: React.FC<EligibilityDiscardModalProps> = ({
  isOpen,
  onClose,
  onDiscard,
  unsavedCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="eligibility-discard-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900">
                Discard eligibility changes?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                You have {unsavedCount} unsaved eligibility change{unsavedCount === 1 ? '' : 's'}.
                Discarding will revert all service configurations back to their original values.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            id="btn-continue-editing"
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Continue Editing
          </button>
          <button
            id="btn-confirm-discard"
            type="button"
            onClick={onDiscard}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};
