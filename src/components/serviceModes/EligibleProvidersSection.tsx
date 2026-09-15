import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Eye,
  BookOpen,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { ServiceModeRecord } from '../../types/serviceMode';
import { VendorLogo } from '../walk-in/VendorLogo';
import { ApprovedVendor } from '../../types/admin';

interface EligibleProviderItem {
  id: string;
  name: string;
  vendorKey: ApprovedVendor;
  type: 'Mobile Money' | 'Bank';
  status: 'Active' | 'Inactive';
  logoPath: string;
  integrationMode: string;
}

const CASH_PICKUP_PROVIDERS: EligibleProviderItem[] = [
  {
    id: 'TB-VND-MTN-001',
    name: 'MTN Mobile Money',
    vendorKey: 'MTN',
    type: 'Mobile Money',
    status: 'Active',
    logoPath: '/assets/vendors/mtn.svg',
    integrationMode: 'Direct REST API',
  },
  {
    id: 'TB-VND-ATL-002',
    name: 'Airtel Money',
    vendorKey: 'Airtel',
    type: 'Mobile Money',
    status: 'Active',
    logoPath: '/assets/vendors/airtel.svg',
    integrationMode: 'Merchant REST API',
  },
  {
    id: 'TB-VND-ACS-008',
    name: 'Access Bank',
    vendorKey: 'Access',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/access.svg',
    integrationMode: 'Bank Integration',
  },
  {
    id: 'TB-VND-FNB-005',
    name: 'FNB',
    vendorKey: 'FNB',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/fnb.svg',
    integrationMode: 'Bank Integration',
  },
  {
    id: 'TB-VND-IND-006',
    name: 'INDO Zambia Bank',
    vendorKey: 'INDO',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/indo.svg',
    integrationMode: 'Bank Integration',
  },
  {
    id: 'TB-VND-STB-007',
    name: 'Stanbic Bank',
    vendorKey: 'Stanbic',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/stanbic.svg',
    integrationMode: 'Bank Integration',
  },
  {
    id: 'TB-VND-ZNC-004',
    name: 'Zanaco',
    vendorKey: 'Zanaco',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/zanaco.svg',
    integrationMode: 'Bank Integration',
  },
];

const WALK_IN_PROVIDERS: EligibleProviderItem[] = [
  {
    id: 'TB-VND-ACS-008',
    name: 'Access Bank',
    vendorKey: 'Access',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/access.svg',
    integrationMode: 'Bank Integration',
  },
  {
    id: 'TB-VND-FNB-005',
    name: 'FNB',
    vendorKey: 'FNB',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/fnb.svg',
    integrationMode: 'Bank Integration',
  },
  {
    id: 'TB-VND-IND-006',
    name: 'INDO Zambia Bank',
    vendorKey: 'INDO',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/indo.svg',
    integrationMode: 'Bank Integration',
  },
  {
    id: 'TB-VND-STB-007',
    name: 'Stanbic Bank',
    vendorKey: 'Stanbic',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/stanbic.svg',
    integrationMode: 'Bank Integration',
  },
  {
    id: 'TB-VND-ZNC-004',
    name: 'Zanaco',
    vendorKey: 'Zanaco',
    type: 'Bank',
    status: 'Active',
    logoPath: '/assets/vendors/zanaco.svg',
    integrationMode: 'Bank Integration',
  },
];

interface EligibleProvidersSectionProps {
  service: ServiceModeRecord;
}

export const EligibleProvidersSection: React.FC<EligibleProvidersSectionProps> = ({ service }) => {
  const navigate = useNavigate();

  const getProvidersForService = (): EligibleProviderItem[] => {
    if (service.id === 'TB-SVC-CP-001') {
      return CASH_PICKUP_PROVIDERS;
    }
    if (service.id === 'TB-SVC-WI-003') {
      return WALK_IN_PROVIDERS;
    }
    return [];
  };

  const providers = getProvidersForService();

  const handleManageEligibility = () => {
    navigate('/super-admin/configuration/vendor-eligibility');
  };

  const handleViewVendor = (vendorId: string) => {
    navigate(`/super-admin/configuration/vendors/${vendorId}`);
  };

  return (
    <section
      id="section-eligible-providers"
      aria-labelledby="heading-eligible-providers"
      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
        <div>
          <div className="flex items-center gap-2.5">
            <h3
              id="heading-eligible-providers"
              className="text-sm sm:text-base font-bold text-slate-900 tracking-tight"
            >
              Eligible Providers
            </h3>
            {service.isInternalLedger ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Core Engine
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {providers.length} {providers.length === 1 ? 'Provider' : 'Providers'} Enabled
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {service.isInternalLedger
              ? 'Core internal ledger transactions with zero external gateway dependencies.'
              : service.id === 'TB-SVC-CP-001'
              ? 'All 7 enabled financial providers configured for Cash Pickup teller dispatch (Zamtel excluded).'
              : service.id === 'TB-SVC-WI-003'
              ? 'Authorized banking institutions enabled for counter-side Walk-In settlements.'
              : 'Configured gateway institutions and liquidity providers.'}
          </p>
        </div>

        {/* Manage Vendor Eligibility action */}
        <button
          type="button"
          id="btn-manage-vendor-eligibility"
          onClick={handleManageEligibility}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0a7587] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/15 border border-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>Manage Vendor Eligibility</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Content based on service mode */}
      {service.isInternalLedger ? (
        /* TellerBud Ledger Special View */
        <div className="p-6">
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
              <BookOpen className="w-6 h-6 text-sky-600" aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  TellerBud Core Balance Ledger
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active System Engine
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Agent-to-Agent Liquidity operations execute directly against TellerBud internal
                vault balances. This internal service mode does not require third-party MNO or
                Commercial Banking integrations.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                <span>Routing: <strong className="text-slate-700 font-medium">Internal Core</strong></span>
                <span>•</span>
                <span>Latency: <strong className="text-slate-700 font-medium">&lt; 150ms</strong></span>
                <span>•</span>
                <span>Audit Key: <strong className="text-slate-700 font-medium">TB-SYS-LEDGER</strong></span>
              </div>
            </div>
          </div>
        </div>
      ) : service.id === 'TB-SVC-CD-002' ? (
        /* Cash Delivery Coming Soon View */
        <div className="p-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertCircle className="w-6 h-6 text-amber-600" aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  No Providers Configured in Phase 1
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  SOON
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cash Delivery is scheduled for Phase 2 rollout. Provider integrations, secure mobile
                courier escorts, and automated dispatch gateways are locked against operational
                use during the current pilot phase.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Providers Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th scope="col" className="py-2.5 px-4">Provider</th>
                <th scope="col" className="py-2.5 px-4">Vendor Type</th>
                <th scope="col" className="py-2.5 px-4">Status</th>
                <th scope="col" className="py-2.5 px-4">Integration Mode</th>
                <th scope="col" className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {providers.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Provider Logo + Name + ID */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                        <VendorLogo
                          vendor={vendor.vendorKey}
                          size="sm"
                          showName={false}
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {vendor.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {vendor.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Vendor Type */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        vendor.type === 'Mobile Money'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {vendor.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      {vendor.status}
                    </span>
                  </td>

                  {/* Integration Mode */}
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <span className="text-xs">{vendor.integrationMode}</span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      id={`btn-view-vendor-${vendor.id}`}
                      onClick={() => handleViewVendor(vendor.id)}
                      aria-label={`View vendor details for ${vendor.name}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] hover:text-white hover:bg-[#0D93AA] border border-[#0D93AA]/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>View Vendor</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
