import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CashFloatRequest } from '../../types/admin';
import { User, Phone, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface CashFloatAgentCardProps {
  request: CashFloatRequest;
}

export const CashFloatAgentCard: React.FC<CashFloatAgentCardProps> = ({ request }) => {
  const navigate = useNavigate();
  const agentStatus = request.agentAccountStatus || 'Active';

  const handleViewAgent = () => {
    navigate(`/agents`);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#0D93AA]" />
          <h2 className="text-sm font-bold text-[#102025]">Agent</h2>
        </div>
        <button
          type="button"
          onClick={handleViewAgent}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:text-[#0b7e93] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded px-1.5 py-0.5 cursor-pointer"
        >
          <span>View Agent</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Agent Name
          </span>
          <span className="font-semibold text-gray-900 text-sm">
            {request.agentName}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Agent ID
          </span>
          <span className="font-mono text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60 inline-block font-medium">
            {request.agentId}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Agent Phone
          </span>
          <span className="font-mono text-gray-800 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>{request.agentPhone}</span>
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Agent Account Status
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{agentStatus}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
