import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ModuleSpecificSettingsSection: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Vendors',
      description: 'Vendor onboarding, credentials, status management, and provider configuration.',
      path: '/super-admin/configuration/vendors',
      buttonLabel: 'Go to Vendors',
    },
    {
      title: 'Vendor Eligibility',
      description: 'Service routing matrix, allowed transaction channels, and failover eligibility per provider.',
      path: '/super-admin/configuration/vendor-eligibility',
      buttonLabel: 'Go to Vendor Eligibility',
    },
    {
      title: 'Service Modes',
      description: 'Service mode availability, audience targeting, limits, and customer/agent permissions.',
      path: '/super-admin/configuration/service-modes',
      buttonLabel: 'Go to Service Modes',
    },
    {
      title: 'Customer Withdrawals',
      description: 'Customer cash-out queues, manual verification review, approval workflow, and settlement.',
      path: '/super-admin/wallets/customer-withdrawals',
      buttonLabel: 'Go to Customer Withdrawals',
    },
    {
      title: 'Notifications',
      description: 'Operational alert feeds, unresolved notification tracking, and audit read receipts.',
      path: '/super-admin/configuration/notifications',
      buttonLabel: 'Go to Notifications',
    },
  ];

  return (
    <div
      id="section-module-specific-settings"
      className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Module-Specific Settings
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {modules.map((m) => (
          <div
            key={m.title}
            className="p-4 rounded-lg border border-gray-200/80 bg-gray-50/40 hover:bg-white hover:border-[#0D93AA]/30 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">{m.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
            </div>

            <button
              type="button"
              onClick={() => navigate(m.path)}
              className="inline-flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/15 rounded-md border border-[#0D93AA]/20 transition-colors cursor-pointer"
            >
              <span>{m.buttonLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
