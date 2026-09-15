import React from 'react';
import { History, ArrowRight, Clock, UserCheck, Cpu } from 'lucide-react';
import { EligibilityChangeLogEntry } from '../../types/vendor';

interface RecentEligibilityChangesTableProps {
  entries: EligibilityChangeLogEntry[];
  onViewFullHistory: () => void;
}

export const RecentEligibilityChangesTable: React.FC<RecentEligibilityChangesTableProps> = ({
  entries,
  onViewFullHistory,
}) => {
  // Show the latest 5 entries
  const latestFive = entries.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Eligibility Changes
            </h2>
          </div>
        </div>

        <button
          id="btn-view-full-eligibility-history"
          type="button"
          onClick={onViewFullHistory}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b7d91] transition-colors px-2.5 py-1 rounded-md hover:bg-[#0D93AA]/5"
        >
          <span>View Full History</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Compact Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4">Vendor</th>
              <th className="py-2.5 px-3">Service</th>
              <th className="py-2.5 px-3">Previous Status</th>
              <th className="py-2.5 px-3">New Status</th>
              <th className="py-2.5 px-3">Changed By</th>
              <th className="py-2.5 px-4 text-right">Date and Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {latestFive.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No eligibility modifications recorded yet.
                </td>
              </tr>
            ) : (
              latestFive.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Vendor */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                        <img
                          src={entry.vendorLogo}
                          alt={entry.vendorName}
                          className="w-4 h-4 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-semibold text-slate-800">
                        {entry.vendorName}
                      </span>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {entry.service}
                  </td>

                  {/* Previous Status */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        entry.previousStatus === 'Enabled'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {entry.previousStatus}
                    </span>
                  </td>

                  {/* New Status */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        entry.newStatus === 'Enabled'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {entry.newStatus}
                    </span>
                  </td>

                  {/* Changed By */}
                  <td className="py-2.5 px-3">
                    {entry.changedBy === 'System Integration' ? (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">System Integration</span>
                      </div>
                    ) : (
                      <div className="leading-tight">
                        <div className="font-semibold text-slate-800 text-xs">Sililo Lubinda</div>
                        <div className="text-[11px] text-slate-500 font-normal">Super Admin</div>
                      </div>
                    )}
                  </td>

                  {/* Date and Time */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-500 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{entry.dateTime}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
