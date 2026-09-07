import React from 'react';
import { AgentAvailabilitySummary } from '../../types/admin';

interface AgentAvailabilityCardProps {
  data: AgentAvailabilitySummary;
}

export const AgentAvailabilityCard: React.FC<AgentAvailabilityCardProps> = ({ data }) => {
  const stats = [
    {
      label: 'Online',
      value: data.online,
      color: 'text-[#102025]',
    },
    {
      label: 'Assigned',
      value: data.assigned,
      color: 'text-[#102025]',
    },
    {
      label: 'Available',
      value: data.available,
      color: 'text-[#0D93AA]',
    },
    {
      label: 'Offline',
      value: data.offline,
      color: 'text-gray-400',
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-base text-[#102025]">
          Agent Availability
        </h2>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {data.online + data.offline} Total Agents
        </span>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100/60 transition-colors"
          >
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              {stat.label}
            </div>
            <div className={`text-xl font-bold ${stat.color} tracking-tight`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
