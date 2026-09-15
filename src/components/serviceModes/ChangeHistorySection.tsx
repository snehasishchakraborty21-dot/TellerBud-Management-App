import React from 'react';
import { History, ShieldCheck } from 'lucide-react';
import { ServiceModeChangeLog } from '../../types/serviceMode';

interface ChangeHistorySectionProps {
  history: ServiceModeChangeLog[];
  serviceName: string;
}

export const ChangeHistorySection: React.FC<ChangeHistorySectionProps> = ({
  history,
  serviceName,
}) => {
  return (
    <section
      id="section-change-history"
      aria-labelledby="heading-change-history"
      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <History className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3
              id="heading-change-history"
              className="text-sm sm:text-base font-bold text-slate-900 tracking-tight"
            >
              Change History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit log of operational modifications, state changes, and parameter updates for {serviceName}.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>Immutable Ledger</span>
        </div>
      </div>

      {/* Table */}
      {history.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          No previous operational changes recorded for this service mode.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th scope="col" className="py-2.5 px-4">Event</th>
                <th scope="col" className="py-2.5 px-4">Previous Value</th>
                <th scope="col" className="py-2.5 px-4">New Value</th>
                <th scope="col" className="py-2.5 px-4">Changed By</th>
                <th scope="col" className="py-2.5 px-4 text-right">Date and Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {history.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Event / Parameter */}
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                      {log.fieldChanged}
                    </span>
                  </td>

                  {/* Previous Value */}
                  <td className="py-3 px-4 text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px] border border-slate-200">
                      {log.previousValue}
                    </span>
                  </td>

                  {/* New Value */}
                  <td className="py-3 px-4 text-slate-900 font-medium">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[11px] border border-emerald-200">
                      {log.newValue}
                    </span>
                  </td>

                  {/* Changed By */}
                  <td className="py-3 px-4 text-slate-700">
                    <span className="font-medium text-slate-800">{log.updatedBy}</span>
                  </td>

                  {/* Date and Time */}
                  <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
