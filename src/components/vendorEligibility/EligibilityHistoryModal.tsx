import React, { useState } from 'react';
import { History, X, Search, Clock, ShieldCheck } from 'lucide-react';
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
              <h3 className="text-[16px] font-bold leading-[22px] text-slate-900">
                Vendor Eligibility Audit History
              </h3>
              <p className="text-[11px] font-normal leading-[15px] text-slate-500 mt-0.5">
                Complete historical record of service routing eligibility changes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium leading-[18px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA]"
            />
          </div>
        </div>

        {/* Modal Body: List */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold leading-[16px] text-slate-600 uppercase tracking-[0.03em]">
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Status Change</th>
                  <th className="py-2.5 px-3">Changed By</th>
                  <th className="py-2.5 px-3 text-right">Date and Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[13px] font-medium leading-[18px] text-slate-500">
                      No matching history logs found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const isTellerBudAdmin =
                      entry.changedBy === 'System Integration' ||
                      entry.changedBy === 'TellerBud Admin' ||
                      entry.changedBy === 'System';

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col justify-center min-w-0">
                            <span className="text-[13px] font-semibold leading-[18px] text-slate-900 truncate">
                              {entry.vendorName}
                            </span>
                            {entry.vendorId && (
                              <span className="text-[11px] font-normal leading-[15px] text-slate-500 font-mono">
                                {entry.vendorId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[13px] font-medium leading-[18px] text-slate-700">
                          {entry.service}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium leading-[15px] whitespace-nowrap ${
                                entry.previousStatus === 'Enabled'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {entry.previousStatus}
                            </span>
                            <span className="text-slate-400 text-xs">→</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold leading-[15px] whitespace-nowrap ${
                                entry.newStatus === 'Enabled'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {entry.newStatus}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {isTellerBudAdmin ? (
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[13px] font-medium leading-[18px] text-slate-800">
                                TellerBud Admin
                              </span>
                            </div>
                          ) : (
                            <div className="leading-tight">
                              <div className="text-[13px] font-semibold leading-[18px] text-slate-900">
                                {entry.changedBy}
                              </div>
                              <div className="text-[11px] font-normal leading-[15px] text-slate-500">
                                Super Admin
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[13px] font-medium leading-[18px] text-slate-700">
                          <div className="flex items-center justify-end gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{entry.dateTime}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-normal leading-[15px] text-slate-500">
            Showing {filteredEntries.length} log {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium leading-[18px] text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
