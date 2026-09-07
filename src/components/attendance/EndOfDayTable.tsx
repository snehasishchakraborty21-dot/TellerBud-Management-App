import React from 'react';
import { Eye, FileCheck } from 'lucide-react';
import { EndOfDayRecord, EndOfDayStatusType } from '../../types/attendance';

interface EndOfDayTableProps {
  records: EndOfDayRecord[];
  onView: (record: EndOfDayRecord) => void;
  isLoading?: boolean;
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
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-[#0D93AA]" />
        <p className="mt-3 text-xs text-gray-500 font-medium">Loading End-of-Day records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-12 text-center">
        <FileCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-gray-800">No End-of-Day records found</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Try clearing your filters or selecting a different business date.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-3.5">Reference</th>
              <th className="py-3 px-3.5">Agent</th>
              <th className="py-3 px-3.5">Agent ID</th>
              <th className="py-3 px-3.5">Business Date</th>
              <th className="py-3 px-3.5">Expected Cash</th>
              <th className="py-3 px-3.5">Declared Cash</th>
              <th className="py-3 px-3.5">Cash Variance</th>
              <th className="py-3 px-3.5">Submitted</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {records.map((record) => {
              const hasDeclaredCash = record.declaredCash !== undefined;

              return (
                <tr
                  key={record.id}
                  className="hover:bg-cyan-50/20 transition-colors group cursor-pointer"
                  onClick={() => onView(record)}
                >
                  {/* 1. Reference */}
                  <td className="py-3 px-3.5 font-mono font-semibold text-[#0D93AA] whitespace-nowrap">
                    {record.reference}
                  </td>

                  {/* 2. Agent */}
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-100 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-200">
                        {record.avatarInitials}
                      </div>
                      <span className="font-semibold text-gray-900 group-hover:text-[#0D93AA] transition-colors whitespace-nowrap">
                        {record.agentName}
                      </span>
                    </div>
                  </td>

                  {/* 3. Agent ID */}
                  <td className="py-3 px-3.5 font-mono text-gray-600 whitespace-nowrap">
                    {record.agentId}
                  </td>

                  {/* 4. Business Date */}
                  <td className="py-3 px-3.5 font-mono text-gray-600 whitespace-nowrap">
                    {record.businessDate}
                  </td>

                  {/* 5. Expected Cash */}
                  <td className="py-3 px-3.5 font-mono text-gray-800 whitespace-nowrap font-medium">
                    {formatZMW(record.expectedCash)}
                  </td>

                  {/* 6. Declared Cash */}
                  <td className="py-3 px-3.5 font-mono text-gray-800 whitespace-nowrap font-medium">
                    {hasDeclaredCash ? formatZMW(record.declaredCash!) : '—'}
                  </td>

                  {/* 7. Cash Variance */}
                  <td
                    className={`py-3 px-3.5 font-mono whitespace-nowrap font-semibold ${
                      record.cashVariance !== 0 && hasDeclaredCash
                        ? 'text-rose-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {formatVariance(record.cashVariance, hasDeclaredCash)}
                  </td>

                  {/* 8. Submitted */}
                  <td className="py-3 px-3.5 font-mono text-gray-600 whitespace-nowrap">
                    {record.submittedTimestamp || '—'}
                  </td>

                  {/* 9. Status */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <EndOfDayBadge status={record.status} />
                  </td>

                  {/* 10. Action */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onView(record)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] hover:bg-cyan-50 border border-transparent hover:border-[#0D93AA]/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
