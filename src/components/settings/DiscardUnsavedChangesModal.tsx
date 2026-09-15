import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DiscardUnsavedChangesModalProps {
  isOpen: boolean;
  onContinueEditing: () => void;
  onDiscardChanges: () => void;
}

export const DiscardUnsavedChangesModal: React.FC<DiscardUnsavedChangesModalProps> = ({
  isOpen,
  onContinueEditing,
  onDiscardChanges,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="discard-unsaved-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="discard-unsaved-modal-container"
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-1 pr-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Discard Unsaved Changes?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                You have unsaved System Settings changes. Leaving this page will discard them.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="btn-continue-editing"
            onClick={onContinueEditing}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Continue Editing
          </button>
          <button
            type="button"
            id="btn-discard-changes"
            onClick={onDiscardChanges}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};
