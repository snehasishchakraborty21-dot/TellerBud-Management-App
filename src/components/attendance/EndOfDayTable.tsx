import React from 'react';
import { Eye, FileCheck } from 'lucide-react';
import { EndOfDayRecord, EndOfDayStatusType } from '../../types/attendance';
import { formatZmwListingAmount } from '../../utils/formatters';

interface EndOfDayTableProps {
  records: EndOfDayRecord[];
  onView: (record: EndOfDayRecord) => void;
  isLoading?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function formatZMW(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatVariance(variance: number, hasDeclared: boolean): string {
  if (!hasDeclared) return '—';
  if (variance === 0) return 'ZMW 0.00';
  if (variance > 0) {
    return `+${formatZMW(variance)}`;
  }
  return `-${formatZMW(Math.abs(variance))}`;
}

export function formatVarianceListing(variance: number, hasDeclared: boolean): string {
  if (!hasDeclared) return '—';
  if (variance === 0) return '0.00';
  if (variance > 0) {
    return `+${formatZmwListingAmount(variance)}`;
  }
  return `-${formatZmwListingAmount(Math.abs(variance))}`;
}

export const EndOfDayBadge: React.FC<{ status: EndOfDayStatusType }> = ({ status }) => {
  switch (status) {
    case 'Pending Review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Review
        </span>
      );
    case 'Pending Submission':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Pending Submission
        </span>
      );
    case 'Reconciled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Reconciled
        </span>
      );
    case 'Exception':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Exception
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
};

export const EndOfDayTable: React.FC<EndOfDayTableProps> = ({
  records,
  onView,
  isLoading = false,
  containerRef,
}) => {
  return (
    <div
      ref={containerRef}
      className="attendance-table-body flex-1 min-h-0 overflow-y-auto overflow-x-hidden focus:outline-none [scrollbar-gutter:stable]"
      tabIndex={0}
    >
      <table className="w-full text-left border-collapse table-fixed">
        <colgroup>
          <col className="w-[10%]" />
          <col className="w-[15%]" />
          <col className="w-[10%]" />
          <col className="w-[9%]" />
          <col className="w-[11%]" />
          <col className="w-[11%]" />
          <col className="w-[11%]" />
          <col className="w-[8%]" />
          <col className="w-[7%]" />
          <col className="w-[8%] min-w-[92px]" style={{ minWidth: 92 }} />
        </colgroup>
        <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
          <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Reference</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Agent</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Agent ID</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Business Date</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Expected Cash (ZMW)</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Declared Cash (ZMW)</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Cash Variance (ZMW)</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Submitted</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Status</th>
            <th className="py-3 pl-3.5 pr-4 text-left bg-[#F9FAFB] min-w-[92px]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={10} className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-[#0D93AA]" />
                <p className="mt-3 text-xs text-gray-500 font-medium">Loading End-of-Day records...</p>
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={10} className="py-16 text-center">
                <FileCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-gray-800">No End-of-Day records found</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Try changing the filters or selecting a different date range.
                </p>
              </td>
            </tr>
          ) : (
            records.map((record) => {
              const hasDeclaredCash = record.declaredCash !== undefined;

              return (
                <tr
                  key={record.id}
                  className="hover:bg-cyan-50/20 transition-colors group cursor-pointer"
                  onClick={() => onView(record)}
                >
                  {/* 1. Reference */}
                  <td className="py-3 px-3.5 text-left font-mono font-semibold text-[#0D93AA] truncate">
                    {record.reference}
                  </td>

                  {/* 2. Agent */}
                  <td className="py-3 px-3.5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-100 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-200">
                        {record.avatarInitials}
                      </div>
                      <span className="font-semibold text-gray-900 group-hover:text-[#0D93AA] transition-colors truncate">
                        {record.agentName}
                      </span>
                    </div>
                  </td>

                  {/* 3. Agent ID */}
                  <td className="py-3 px-3.5 text-left font-mono text-gray-600 truncate">
                    {record.agentId}
                  </td>

                  {/* 4. Business Date */}
                  <td className="py-3 px-3.5 text-left font-mono text-gray-600 truncate">
                    {record.businessDate}
                  </td>

                  {/* 5. Expected Cash */}
                  <td className="py-3 px-3.5 text-left font-mono text-gray-800 font-medium truncate">
                    {formatZmwListingAmount(record.expectedCash)}
                  </td>

                  {/* 6. Declared Cash */}
                  <td className="py-3 px-3.5 text-left font-mono text-gray-800 font-medium truncate">
                    {hasDeclaredCash ? formatZmwListingAmount(record.declaredCash!) : '—'}
                  </td>

                  {/* 7. Cash Variance */}
                  <td
                    className={`py-3 px-3.5 text-left font-mono font-semibold truncate ${
                      record.cashVariance !== 0 && hasDeclaredCash
                        ? 'text-rose-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {formatVarianceListing(record.cashVariance, hasDeclaredCash)}
                  </td>

                  {/* 8. Submitted */}
                  <td className="py-3 px-3.5 text-left font-mono text-gray-600 truncate">
                    {record.submittedTimestamp || '—'}
                  </td>

                  {/* 9. Status */}
                  <td className="py-3 px-3.5 text-left">
                    <EndOfDayBadge status={record.status} />
                  </td>

                  {/* 10. Action */}
                  <td className="py-3 pl-3.5 pr-4 text-left min-w-[92px]" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onView(record)}
                      className="inline-flex items-center justify-center gap-1.5 min-w-[64px] px-2.5 py-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] hover:bg-cyan-50 border border-transparent hover:border-[#0D93AA]/30 rounded-lg transition-colors cursor-pointer"
                      aria-label={`View details for ${record.reference}`}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
