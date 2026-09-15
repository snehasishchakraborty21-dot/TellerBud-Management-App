import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, Archive, FileText, CheckCircle } from 'lucide-react';
import { VendorDetailData } from '../../types/vendor';

interface DeleteVendorModalProps {
  isOpen: boolean;
  vendor: VendorDetailData;
  onClose: () => void;
  onPermanentDelete: (vendorId: string) => void;
  onArchive: (vendorId: string) => void;
}

export const DeleteVendorModal: React.FC<DeleteVendorModalProps> = ({
  isOpen,
  vendor,
  onClose,
  onPermanentDelete,
  onArchive,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
    }
  }, [isOpen, vendor]);

  if (!isOpen) return null;

  // Determine if vendor has financial or historical records
  const linkedTransactions = vendor.historicalTransactionsCount || 0;
  const linkedLedgerEntries =
    vendor.linkedLedgerEntriesCount ?? (linkedTransactions > 0 ? Math.round(linkedTransactions * 1.9) : 0);
  const hasHistoricalRecords =
    linkedTransactions > 0 || linkedLedgerEntries > 0 || (vendor.recentActivities && vendor.recentActivities.length > 0);

  const isNameMatching = confirmationInput.trim() === vendor.name.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-vendor-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                hasHistoricalRecords
                  ? 'bg-amber-50 border border-amber-200 text-amber-600'
                  : 'bg-rose-50 border border-rose-200 text-rose-600'
              }`}
            >
              {hasHistoricalRecords ? <ShieldAlert size={20} /> : <Trash2 size={20} />}
            </div>
            <div>
              <h3 id="delete-vendor-modal-title" className="text-base font-bold text-slate-900">
                {hasHistoricalRecords ? 'Vendor Records Notice' : 'Delete Vendor Confirmation'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Financial compliance &amp; administrative governance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Vendor Detail Summary Card */}
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block text-[11px]">Vendor Name</span>
              <span className="font-semibold text-slate-900">{vendor.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Vendor ID</span>
              <span className="font-mono font-semibold text-slate-800">{vendor.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Current Status</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    vendor.status === 'Active'
                      ? 'bg-emerald-500'
                      : vendor.status === 'Archived'
                      ? 'bg-purple-500'
                      : 'bg-slate-400'
                  }`}
                />
                {vendor.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Linked Transactions</span>
              <span className="font-mono font-bold text-slate-900">
                {linkedTransactions.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Linked Ledger Entries</span>
            <span className="font-mono font-bold text-slate-900">
              {linkedLedgerEntries.toLocaleString()}
            </span>
          </div>
        </div>

        {/* CASE A: Has Historical / Financial Records */}
        {hasHistoricalRecords ? (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 mb-1">
                  This vendor cannot be permanently deleted because it is connected to financial or historical records.
                </p>
                <p className="text-amber-800 text-[11px] leading-normal">
                  TellerBud financial governance requires complete transactional auditability. In order to preserve ledger consistency, historical statements, and regulatory compliance, providers with recorded transactions cannot be purged.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
              <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                What happens when archived:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                <li>Disappears from active vendor selection lists.</li>
                <li>Remains fully available in historical transactions and audit records.</li>
                <li>Accessible at any time through the <strong>Archived</strong> status filter.</li>
                <li>Never breaks existing transaction, commission, or ledger references.</li>
              </ul>
            </div>

            {/* Actions for Historical Records */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onArchive(vendor.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-1"
              >
                <Archive size={14} />
                <span>Deactivate and Archive Vendor</span>
              </button>
            </div>
          </div>
        ) : (
          /* CASE B: Never Used (0 Historical/Financial Records) */
          <div className="mt-4 space-y-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 text-xs leading-relaxed">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950 mb-0.5">
                  Warning: Permanent deletion cannot be reversed.
                </p>
                <p className="text-rose-800 text-[11px]">
                  This vendor has no linked transactions or financial ledger entries. Deleting it will permanently purge all configuration records.
                </p>
              </div>
            </div>

            {/* Confirm by typing name */}
            <div>
              <label
                htmlFor="confirm-vendor-name-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Please type <span className="font-mono font-bold text-slate-900 select-all">{vendor.name}</span> to confirm:
              </label>
              <input
                id="confirm-vendor-name-input"
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={vendor.name}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                autoComplete="off"
              />
            </div>

            {/* Actions for Permanent Deletion */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isNameMatching}
                onClick={() => {
                  onPermanentDelete(vendor.id);
                  onClose();
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 ${
                  isNameMatching
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-rose-200 text-rose-400 cursor-not-allowed'
                }`}
              >
                <Trash2 size={14} />
                <span>Permanently Delete Vendor</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
