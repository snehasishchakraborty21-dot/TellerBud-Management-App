import React, { useState, useMemo } from 'react';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { SettingsChangeRecord } from '../../types/settings';

interface SettingsChangeHistoryTableProps {
  history: SettingsChangeRecord[];
}

export const SettingsChangeHistoryTable: React.FC<SettingsChangeHistoryTableProps> = ({
  history,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(history.length / rowsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return history.slice(start, start + rowsPerPage);
  }, [history, currentPage]);

  const startCount = (currentPage - 1) * rowsPerPage + 1;
  const endCount = Math.min(currentPage * rowsPerPage, history.length);

  return (
    <div
      id="section-settings-change-history"
      className="bg-white border border-gray-200/90 rounded-xl shadow-xs overflow-hidden"
    >
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Settings Change History
            </h2>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
          {history.length} Total Audit Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <th className="px-4 py-3 whitespace-nowrap">Setting / Event</th>
              <th className="px-4 py-3 whitespace-nowrap">Previous Value</th>
              <th className="px-4 py-3 whitespace-nowrap">New Value</th>
              <th className="px-4 py-3 whitespace-nowrap">Changed By</th>
              <th className="px-4 py-3 whitespace-nowrap">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">
                  No configuration change history recorded.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                    <div>{row.event}</div>
                    <div className="text-[11px] text-gray-500 font-normal">{row.settingLabel}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                      {row.previousValue}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[#0D93AA] whitespace-nowrap font-medium">
                    <span className="px-2 py-0.5 rounded bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/20 text-xs">
                      {row.newValue}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                    {row.changedBy}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {row.dateTime}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4 text-xs text-gray-500 whitespace-nowrap overflow-x-hidden">
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <span>
            Showing <span className="font-semibold text-gray-800">{history.length === 0 ? 0 : startCount}</span> to{' '}
            <span className="font-semibold text-gray-800">{endCount}</span> of{' '}
            <span className="font-semibold text-gray-800">{history.length}</span> audit logs
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Rows per page: <span className="font-semibold text-gray-800">{rowsPerPage}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Page <span className="font-semibold text-gray-800">{currentPage}</span> of{' '}
            <span className="font-semibold text-gray-800">{totalPages}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
