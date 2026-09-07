import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CashFloatRequest } from '../../types/admin';
import { Building2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface CashFloatBusinessCardProps {
  request: CashFloatRequest;
}

export const CashFloatBusinessCard: React.FC<CashFloatBusinessCardProps> = ({ request }) => {
  const navigate = useNavigate();
  const businessStatus = request.businessAccountStatus || 'Active';

  const handleViewBusiness = () => {
    navigate('/businesses');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0D93AA]" />
          <h2 className="text-sm font-bold text-[#102025]">Associated Business</h2>
        </div>
        <button
          type="button"
          onClick={handleViewBusiness}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:text-[#0b7e93] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded px-1.5 py-0.5 cursor-pointer"
        >
          <span>View Business</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Business Name
          </span>
          <span className="font-semibold text-gray-900 text-sm">
            {request.businessName}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Business Account Status
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{businessStatus}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
