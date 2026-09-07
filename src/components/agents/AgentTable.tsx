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
}

export const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  onSelectAgent,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-2xs">
        <div className="inline-block w-8 h-8 border-3 border-[#0D93AA]/30 border-t-[#0D93AA] rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-500">
          Loading business agents...
        </p>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3 text-gray-400">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          No Agents Found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No agent records match the selected availability, assignment, attendance, or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-3.5">Agent</th>
              <th className="py-3 px-3">Agent ID</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3">Availability</th>
              <th className="py-3 px-3">Current Activity</th>
              <th className="py-3 px-3">Attendance</th>
              <th className="py-3 px-3">Last Active</th>
              <th className="py-3 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                onClick={() => onSelectAgent(agent)}
              >
                {/* 1. Agent: Avatar + Full Name */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    {agent.avatarUrl ? (
                      <img
                        src={agent.avatarUrl}
                        alt={agent.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-cyan-50 border border-[#0D93AA]/20 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0">
                        {agent.avatarInitials}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#0D93AA] transition-colors">
                        {agent.name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Agent ID */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="font-mono text-xs text-gray-700 font-medium">
                    {agent.id}
                  </span>
                </td>

                {/* 3. Phone */}
                <td className="py-3 px-3 whitespace-nowrap font-mono text-gray-600">
                  {agent.phone}
                </td>

                {/* 4. Availability */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <AgentAvailabilityBadge status={agent.availability} size="sm" />
                </td>

                {/* 5. Current Assignment */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <AgentAssignmentBadge assignment={agent.assignment} size="sm" />
                </td>

                {/* 6. Attendance */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <AgentAttendanceBadge
                    status={agent.attendance}
                    checkInTime={agent.checkInTime}
                    size="sm"
                  />
                </td>

                {/* 7. Last Active */}
                <td className="py-3 px-3 whitespace-nowrap text-gray-500 font-medium">
                  {agent.lastActive}
                </td>

                {/* 8. Action */}
                <td className="py-3 px-3.5 whitespace-nowrap text-right">
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
    </div>
  );
};
