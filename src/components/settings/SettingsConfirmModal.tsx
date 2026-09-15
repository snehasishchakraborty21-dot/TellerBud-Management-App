import React from 'react';
import { AlertTriangle, ShieldAlert, X, Check } from 'lucide-react';
import { SettingsChangeImpact } from '../../types/settings';

interface SettingsConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingChanges: SettingsChangeImpact[];
  hasCriticalChanges: boolean;
}

export const SettingsConfirmModal: React.FC<SettingsConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingChanges,
  hasCriticalChanges,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-confirm-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="settings-confirm-modal-container"
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b ${
          hasCriticalChanges ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50/70 border-slate-200'
        } flex items-start justify-between gap-3`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              hasCriticalChanges ? 'bg-amber-100 text-amber-700' : 'bg-[#0D93AA]/10 text-[#0D93AA]'
            }`}>
              {hasCriticalChanges ? (
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#0D93AA]" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {hasCriticalChanges
                  ? 'Confirm Critical System Configuration Changes'
                  : 'Review & Confirm Settings Changes'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Acting as <span className="font-semibold text-gray-800">Sililo Lubinda (Super Admin)</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {hasCriticalChanges && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Operational Impact Warning</span>
              </p>
              <p className="leading-relaxed">
                You have modified security, reconciliation, or transaction control settings. These changes take immediate effect across all customer and agent interactions.
              </p>
            </div>
          )}

          <div>
            <div className="overflow-x-auto border border-gray-200/90 rounded-xl bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-3.5 py-2.5 whitespace-nowrap">Setting</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">Previous Value</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">New Value</th>
                    <th className="px-3.5 py-2.5">Operational Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingChanges.map((change) => (
                    <tr key={change.settingKey} className="hover:bg-gray-50/50">
                      <td className="px-3.5 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {change.settingLabel}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-gray-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                          {change.previousValue}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-mono text-[#0D93AA] whitespace-nowrap font-medium">
                        <span className="px-2 py-0.5 rounded bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/25 text-xs">
                          {change.newValue}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-gray-600 leading-snug">
                        {change.impactDescription}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg shadow-2xs transition-colors cursor-pointer ${
              hasCriticalChanges
                ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                : 'bg-[#0D93AA] hover:bg-[#0b8094] active:bg-[#09697a]'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Confirm Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
