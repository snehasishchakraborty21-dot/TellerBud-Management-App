import React from 'react';
import { AgentRecord } from '../../types/admin';
import { AgentAvailabilityBadge } from './AgentAvailabilityBadge';
import { AgentAssignmentBadge } from './AgentAssignmentBadge';
import { AgentAttendanceBadge } from './AgentAttendanceBadge';
import { Eye, Users } from 'lucide-react';

interface AgentTableProps {
  agents: AgentRecord[];
  onSelectAgent: (agent: AgentRecord) => void;
  loading?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  onSelectAgent,
  loading = false,
  containerRef,
}) => {
  if (loading) {
    return (
      <div className="flex-1 min-h-0 bg-white p-12 text-center flex flex-col items-center justify-center">
        <div className="inline-block w-8 h-8 border-3 border-[#0D93AA]/30 border-t-[#0D93AA] rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-500">
          Loading business agents...
        </p>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex-1 min-h-0 bg-white p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3 text-gray-400">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          No Agents Found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No agent records match the selected availability, assignment, or attendance criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-auto relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <table className="w-full text-left border-collapse table-fixed min-w-[920px]">
        {/* Proportional column layout totaling 100% */}
        <colgroup>
          <col style={{ width: '21%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '7%' }} />
        </colgroup>

        {/* Sticky Frozen Table Header */}
        <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
          <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <th scope="col" className="py-2.5 px-3.5 bg-[#F9FAFB] text-left align-middle border-b border-gray-200">
              Agent
            </th>
            <th scope="col" className="py-2.5 px-3 bg-[#F9FAFB] text-left align-middle border-b border-gray-200">
              Agent ID
            </th>
            <th scope="col" className="py-2.5 px-3 bg-[#F9FAFB] text-left align-middle border-b border-gray-200">
              Phone
            </th>
            <th scope="col" className="py-2.5 px-3 bg-[#F9FAFB] text-left align-middle border-b border-gray-200">
              Availability
            </th>
            <th scope="col" className="py-2.5 px-3 bg-[#F9FAFB] text-left align-middle border-b border-gray-200">
              Current Activity
            </th>
            <th scope="col" className="py-2.5 px-3 bg-[#F9FAFB] text-left align-middle border-b border-gray-200">
              Attendance
            </th>
            <th scope="col" className="py-2.5 px-3 bg-[#F9FAFB] text-left align-middle border-b border-gray-200">
              Last Active
            </th>
            <th scope="col" className="py-2.5 px-3.5 bg-[#F9FAFB] text-right align-middle border-b border-gray-200">
              Action
            </th>
          </tr>
        </thead>

        {/* Scrollable Table Rows */}
        <tbody className="divide-y divide-gray-100 text-xs bg-white">
          {agents.map((agent) => (
            <tr
              key={agent.id}
              className="hover:bg-cyan-50/30 transition-colors group cursor-pointer"
              onClick={() => onSelectAgent(agent)}
            >
              {/* 1. Agent: Avatar + Full Name */}
              <td className="py-2.5 px-3.5 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  {agent.avatarUrl ? (
                    <img
                      src={agent.avatarUrl}
                      alt={agent.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-50 border border-[#0D93AA]/20 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0">
                      {agent.avatarInitials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 group-hover:text-[#0D93AA] transition-colors truncate">
                      {agent.name}
                    </div>
                  </div>
                </div>
              </td>

              {/* 2. Agent ID */}
              <td className="py-2.5 px-3 whitespace-nowrap">
                <span className="font-mono text-xs text-gray-700 font-medium">
                  {agent.id}
                </span>
              </td>

              {/* 3. Phone */}
              <td className="py-2.5 px-3 whitespace-nowrap font-mono text-gray-600 text-[11.5px]">
                {agent.phone}
              </td>

              {/* 4. Availability */}
              <td className="py-2.5 px-3 whitespace-nowrap">
                <AgentAvailabilityBadge status={agent.availability} size="sm" />
              </td>

              {/* 5. Current Assignment */}
              <td className="py-2.5 px-3 whitespace-nowrap">
                <AgentAssignmentBadge assignment={agent.assignment} size="sm" />
              </td>

              {/* 6. Attendance */}
              <td className="py-2.5 px-3 whitespace-nowrap">
                <AgentAttendanceBadge
                  status={agent.attendance}
                  checkInTime={agent.checkInTime}
                  size="sm"
                />
              </td>

              {/* 7. Last Active */}
              <td className="py-2.5 px-3 whitespace-nowrap text-gray-500 font-medium text-[11px]">
                {agent.lastActive}
              </td>

              {/* 8. Action */}
              <td className="py-2.5 px-3.5 whitespace-nowrap text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAgent(agent);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50 hover:bg-cyan-100 rounded-md transition-colors cursor-pointer"
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
  );
};

