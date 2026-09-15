import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Circle,
  Monitor,
  CheckCircle2,
} from 'lucide-react';
import { BusinessAgentRecord } from '../../types/businessWallet';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface BusinessWalletAgentsTabProps {
  agents: BusinessAgentRecord[];
}

export const BusinessWalletAgentsTab: React.FC<BusinessWalletAgentsTabProps> = ({
  agents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Online' | 'Offline'>('ALL');

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        searchTerm === '' ||
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.mobileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.assignedTerminal.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agents, searchTerm, statusFilter]);

  const onlineCount = agents.filter((a) => a.status === 'Online').length;
  const offlineCount = agents.filter((a) => a.status === 'Offline').length;

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#102025] flex items-center gap-2">
            <Users size={16} className="text-[#0D93AA]" />
            Associated Business Agents
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational agents authorized under this business global wallet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium text-slate-700">
            Total: <span className="font-bold font-mono">{agents.length}</span>
          </div>
          <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
            Online: <span className="font-bold font-mono">{onlineCount}</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
            Offline: <span className="font-bold font-mono">{offlineCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agent name, agent ID, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={13} />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
          >
            <option value="ALL">All Agents ({agents.length})</option>
            <option value="Online">Online Agents ({onlineCount})</option>
            <option value="Offline">Offline Agents ({offlineCount})</option>
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="overflow-x-auto border border-gray-200/80 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200 text-slate-600 font-semibold">
              <th className="py-2.5 px-3.5 whitespace-nowrap">Agent Identity</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Mobile Number</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Terminal ID</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Current Float</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No agents found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredAgents.map((agent) => {
                const isOnline = agent.status === 'Online';

                return (
                  <tr key={agent.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0">
                          {agent.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {agent.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {agent.agentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* All digits visible to authorised admin */}
                    <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {agent.mobileNumber}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {agent.assignedTerminal}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                      {formatZMW(agent.currentFloat)}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Circle size={8} className="text-slate-400" />
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {agent.lastActive}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
