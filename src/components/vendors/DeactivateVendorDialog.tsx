import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { VendorDetailData } from '../../types/vendor';

interface DeactivateVendorDialogProps {
  isOpen: boolean;
  vendor: VendorDetailData;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeactivateVendorDialog: React.FC<DeactivateVendorDialogProps> = ({
  isOpen,
  vendor,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-vendor-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with warning icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="deactivate-vendor-dialog-title" className="text-base font-bold text-slate-900">
                Deactivate Vendor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {vendor.name} ({vendor.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning Content */}
        <div className="mt-4 space-y-3">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Are you sure you want to deactivate <strong className="text-slate-900">{vendor.name}</strong>?
            Active transaction routing and API collections for this provider will be immediately suspended.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-[#0D93AA] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Historical Data Safeguard:</span> This vendor has{' '}
              <strong className="text-slate-900 font-mono">
                {vendor.historicalTransactionsCount.toLocaleString()}
              </strong>{' '}
              historical transactions. Per TellerBud financial regulations, vendors with historical transactions cannot be deleted. All historical records, ledger entries, and audit logs remain permanently preserved.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Confirm Deactivation
          </button>
        </div>
      </div>
    </div>
  );
};
