import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerWithdrawal } from '../../types/admin';
import { ArrowRight } from 'lucide-react';

interface WithdrawalCustomerInfoProps {
  withdrawal: CustomerWithdrawal;
}

export const WithdrawalCustomerInfo: React.FC<WithdrawalCustomerInfoProps> = ({ withdrawal }) => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="section-customer-info" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 id="section-customer-info" className="text-base font-bold text-[#102025]">
          Customer
        </h2>
        <button
          type="button"
          onClick={() => navigate('/people/customers')}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0D93AA] hover:text-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded px-1.5 py-1"
        >
          <span>View Customer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Customer Name
          </span>
          <span className="font-semibold text-[#102025]">
            {withdrawal.customerName}
          </span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Customer Phone
          </span>
          <span className="font-mono font-medium text-gray-900">
            {withdrawal.customerPhone}
          </span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Customer Wallet
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="font-medium text-emerald-800 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              {withdrawal.walletStatus || 'Active'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
