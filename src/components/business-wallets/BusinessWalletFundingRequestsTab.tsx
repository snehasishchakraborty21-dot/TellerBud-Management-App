import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Phone,
  User,
} from 'lucide-react';
import { BusinessAgentFundingRequest } from '../../types/businessWallet';

interface BusinessWalletFundingRequestsTabProps {
  requests: BusinessAgentFundingRequest[];
  onViewRequest: (req: BusinessAgentFundingRequest) => void;
}

export const BusinessWalletFundingRequestsTab: React.FC<BusinessWalletFundingRequestsTabProps> = ({
  requests,
  onViewRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending Review' | 'Approved' | 'Dispatched'>('ALL');

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        searchTerm === '' ||
        req.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.agentPhone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#102025] flex items-center gap-2">
            <Inbox size={16} className="text-[#0D93AA]" />
            Agent Funding Requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational liquidity float replenishment requests submitted by registered business agents.
          </p>
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
            placeholder="Search request ref, agent name, agent ID..."
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
            <option value="ALL">All Requests ({requests.length})</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Dispatched">Dispatched</option>
          </select>
        </div>
      </div>

      {/* Requests Table (NO AMOUNT, NO MESSAGE) */}
      <div className="overflow-x-auto border border-gray-200/80 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200 text-slate-600 font-semibold">
              <th className="py-2.5 px-3.5 whitespace-nowrap">Request Reference</th>
              <th className="py-2.5 px-3.5">Agent Details</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Mobile Number</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Submitted At</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No agent funding requests found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const isPending = req.status === 'Pending Review';
                const isApproved = req.status === 'Approved';
                const isDispatched = req.status === 'Dispatched';

                return (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {req.reference}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-800">
                        {req.agentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {req.agentId}
                      </div>
                    </td>
                    {/* All mobile number digits visible to admin */}
                    <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {req.agentPhone}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {req.submittedAt}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                          isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isPending && <Clock size={10} />}
                        {isApproved && <CheckCircle2 size={10} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewRequest(req)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View Request</span>
                      </button>
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
