import React from 'react';
import { Eye, Users } from 'lucide-react';
import { AttendanceRecord, AttendanceStatusType, AssignmentType } from '../../types/attendance';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onView: (record: AttendanceRecord) => void;
  isLoading?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const AttendanceBadge: React.FC<{ status: AttendanceStatusType }> = ({ status }) => {
  switch (status) {
    case 'Checked In':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Checked In
        </span>
      );
    case 'Checked Out':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Checked Out
        </span>
      );
    case 'Not Checked In':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Not Checked In
        </span>
      );
    case 'No Attendance Record':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          No Attendance Record
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

export const AssignmentBadge: React.FC<{ assignment?: AssignmentType }> = ({ assignment }) => {
  if (!assignment || assignment === 'None' || assignment === 'Unassigned') {
    return <span className="text-gray-400 text-xs font-medium">None</span>;
  }
  if (assignment === 'Pickup') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        Pickup
      </span>
    );
  }
  if (assignment === 'Walk-In') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        Walk-In
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
      {assignment}
    </span>
  );
};

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
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
          <col className="w-[18%]" />
          <col className="w-[11%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[8%]" />
          <col className="w-[7%] min-w-[92px]" style={{ minWidth: 92 }} />
        </colgroup>
        <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
          <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Agent</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Agent ID</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Phone</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Check In</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Check Out</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Duration</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Attendance</th>
            <th className="py-3 px-3.5 text-left bg-[#F9FAFB]">Current Activity</th>
            <th className="py-3 pl-3.5 pr-4 text-left bg-[#F9FAFB] min-w-[92px]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={9} className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-[#0D93AA]" />
                <p className="mt-3 text-xs text-gray-500 font-medium">Loading Attendance records...</p>
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-16 text-center">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-gray-800">No attendance records found</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Try changing the filters or selecting a different date range.
                </p>
              </td>
            </tr>
          ) : (
            records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-cyan-50/20 transition-colors group cursor-pointer"
                onClick={() => onView(record)}
              >
                {/* 1. Agent Name & Avatar */}
                <td className="py-3 px-3.5 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-cyan-100 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-200">
                      {record.avatarInitials}
                    </div>
                    <span className="font-semibold text-gray-900 group-hover:text-[#0D93AA] transition-colors truncate">
                      {record.agentName}
                    </span>
                  </div>
                </td>

                {/* 2. Agent ID */}
                <td className="py-3 px-3.5 text-left font-mono text-gray-600 truncate">
                  {record.agentId}
                </td>

                {/* 3. Phone */}
                <td className="py-3 px-3.5 text-left text-gray-600 font-mono truncate">
                  {record.agentPhone}
                </td>

                {/* 4. Check In */}
                <td className="py-3 px-3.5 text-left text-gray-700 font-mono">
                  {record.checkInTime || '—'}
                </td>

                {/* 5. Check Out */}
                <td className="py-3 px-3.5 text-left text-gray-700 font-mono">
                  {record.checkOutTime || '—'}
                </td>

                {/* 6. Duration */}
                <td className="py-3 px-3.5 text-left text-gray-700 font-medium truncate">
                  {record.totalHours || record.checkedInDuration || (record.status === 'Checked In' ? 'In Progress' : '—')}
                </td>

                {/* 7. Attendance Badge */}
                <td className="py-3 px-3.5 text-left">
                  <AttendanceBadge status={record.status} />
                </td>

                {/* 8. Current Activity Badge */}
                <td className="py-3 px-3.5 text-left">
                  <AssignmentBadge assignment={record.assignment} />
                </td>

                {/* 9. Action Button */}
                <td className="py-3 pl-3.5 pr-4 text-left min-w-[92px]" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onView(record)}
                    className="inline-flex items-center justify-center gap-1.5 min-w-[64px] px-2.5 py-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] hover:bg-cyan-50 border border-transparent hover:border-[#0D93AA]/30 rounded-lg transition-colors cursor-pointer"
                    aria-label={`View details for ${record.agentName}`}
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
