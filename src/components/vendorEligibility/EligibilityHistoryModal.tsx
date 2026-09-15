import React, { useState } from 'react';
import { History, X, Search, Clock, UserCheck } from 'lucide-react';
import { EligibilityChangeLogEntry } from '../../types/vendor';

interface EligibilityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: EligibilityChangeLogEntry[];
}

export const EligibilityHistoryModal: React.FC<EligibilityHistoryModalProps> = ({
  isOpen,
  onClose,
  entries,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredEntries = entries.filter((e) => {
    const q = searchTerm.toLowerCase();
    return (
      e.vendorName.toLowerCase().includes(q) ||
      e.service.toLowerCase().includes(q) ||
      e.changedBy.toLowerCase().includes(q)
    );
  });

  return (
    <div
      id="eligibility-history-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Vendor Eligibility Audit History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete historical record of service routing eligibility changes
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

        {/* Filter bar inside modal */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by vendor, service, or administrator..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA]"
            />
          </div>
        </div>

        {/* Modal Body: List */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Change</th>
                  <th className="py-2.5 px-3">Changed By</th>
                  <th className="py-2.5 px-3 text-right">Date and Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No matching history logs found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                            <img
                              src={entry.vendorLogo}
                              alt={entry.vendorName}
                              className="w-4 h-4 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-semibold text-slate-800 truncate">
                            {entry.vendorName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {entry.service}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px]">
                          {entry.previousStatus} →{' '}
                          <span
                            className={
                              entry.newStatus === 'Enabled'
                                ? 'text-emerald-700 font-bold'
                                : 'text-rose-700 font-bold'
                            }
                          >
                            {entry.newStatus}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {entry.changedBy === 'System Integration' ? (
                          <span className="font-medium text-slate-700">System Integration</span>
                        ) : (
                          <div className="leading-tight">
                            <div className="font-semibold text-slate-800 text-xs">Sililo Lubinda</div>
                            <div className="text-[11px] text-slate-500 font-normal">Super Admin</div>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[11px]">
                        {entry.dateTime}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50/70">
          <span className="text-xs text-slate-500">
            Showing {filteredEntries.length} of {entries.length} recorded events
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
