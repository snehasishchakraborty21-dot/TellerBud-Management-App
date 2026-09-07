import React from 'react';
import { Eye, User } from 'lucide-react';
import { AttendanceRecord, AttendanceStatusType, AssignmentType } from '../../types/attendance';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onView: (record: AttendanceRecord) => void;
  isLoading?: boolean;
}

export const AttendanceBadge: React.FC<{ status: AttendanceStatusType }> = ({ status }) => {
  switch (status) {
    case 'Checked In':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Checked In
        </span>
      );
    case 'Checked Out':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Checked Out
        </span>
      );
    case 'Not Checked In':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Not Checked In
        </span>
      );
    case 'No Attendance Record':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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

export const AssignmentBadge: React.FC<{ assignment: AssignmentType }> = ({ assignment }) => {
  if (assignment === 'Pickup') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-50 text-[#0D93AA] border border-cyan-200">
        Pickup
      </span>
    );
  }
  return <span className="text-gray-400 font-medium">—</span>;
};

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onView,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-[#0D93AA]" />
        <p className="mt-3 text-xs text-gray-500 font-medium">Loading attendance records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-12 text-center">
        <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-gray-800">No attendance records found</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Try clearing your filters or selecting a different attendance date.
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
              <th className="py-3 px-4">Agent</th>
              <th className="py-3 px-4">Agent ID</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Check In</th>
              <th className="py-3 px-4">Check Out</th>
              <th className="py-3 px-4">Checked-In Duration</th>
              <th className="py-3 px-4">Attendance</th>
              <th className="py-3 px-4">Current Activity</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-cyan-50/20 transition-colors group cursor-pointer"
                onClick={() => onView(record)}
              >
                {/* 1. Agent Name & Avatar */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-200">
                      {record.avatarInitials}
                    </div>
                    <span className="font-semibold text-gray-900 group-hover:text-[#0D93AA] transition-colors">
                      {record.agentName}
                    </span>
                  </div>
                </td>

                {/* 2. Agent ID */}
                <td className="py-3 px-4 font-mono text-gray-600">
                  {record.agentId}
                </td>

                {/* 3. Phone */}
                <td className="py-3 px-4 text-gray-600 font-mono">
                  {record.agentPhone}
                </td>

                {/* 4. Check In */}
                <td className="py-3 px-4 text-gray-700 font-mono">
                  {record.checkInTime || '—'}
                </td>

                {/* 5. Check Out */}
                <td className="py-3 px-4 text-gray-700 font-mono">
                  {record.checkOutTime || '—'}
                </td>

                {/* 6. Checked-In Duration */}
                <td className="py-3 px-4 text-gray-700 font-medium">
                  {record.totalHours || record.checkedInDuration || (record.status === 'Checked In' ? 'In Progress' : '—')}
                </td>

                {/* 7. Attendance Badge */}
                <td className="py-3 px-4">
                  <AttendanceBadge status={record.status} />
                </td>

                {/* 8. Current Activity Badge */}
                <td className="py-3 px-4">
                  <AssignmentBadge assignment={record.assignment} />
                </td>

                {/* 9. Action Button */}
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
