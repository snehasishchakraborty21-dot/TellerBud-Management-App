import React from 'react';
import {
  Building2,
  Smartphone,
  Check,
  Ban,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  VendorRecord,
  MatrixEligibleService,
  SupportedService,
} from '../../types/vendor';

interface EligibilityMatrixTableProps {
  vendors: VendorRecord[];
  isEditing: boolean;
  draftEligibilities: Record<string, SupportedService[]>;
  onToggleService: (vendorId: string, service: MatrixEligibleService) => void;
  highlightVendorId?: string | null;
}

const SERVICES: MatrixEligibleService[] = [
  'Cash Pickup',
  'Wallet Funding',
  'Customer Withdrawal',
  'Walk-In Transaction',
];

// Exact DOM and visual order requirement:
// 1. Table header
// 2. MTN Mobile Money
// 3. Airtel Money
// 4. Zamtel
// 5. Zanaco
// 6. FNB
// 7. INDO Zambia Bank
// 8. Stanbic Bank
// 9. Access Bank
const EXACT_VENDOR_ORDER: string[] = [
  'TB-VND-MTN-001', // MTN Mobile Money
  'TB-VND-ATL-002', // Airtel Money
  'TB-VND-ZMT-003', // Zamtel
  'TB-VND-ZNC-004', // Zanaco
  'TB-VND-FNB-005', // FNB
  'TB-VND-IND-006', // INDO Zambia Bank
  'TB-VND-STB-007', // Stanbic Bank
  'TB-VND-ACS-008', // Access Bank
];

export const EligibilityMatrixTable: React.FC<EligibilityMatrixTableProps> = ({
  vendors,
  isEditing,
  draftEligibilities,
  onToggleService,
  highlightVendorId,
}) => {
  // Ensure exact DOM and visual order across all renders
  const sortedVendors = [...vendors].sort((a, b) => {
    const indexA = EXACT_VENDOR_ORDER.indexOf(a.id);
    const indexB = EXACT_VENDOR_ORDER.indexOf(b.id);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[860px]">
          {/* Table Header: Completely Left-Aligned for every column */}
          <thead className="bg-slate-50/90 border-b border-slate-200">
            <tr className="text-[11px] font-bold leading-[16px] text-slate-600 uppercase tracking-[0.03em] select-none text-left">
              <th className="py-3 px-3.5 w-[16%] min-w-[170px] text-left">
                Vendor
              </th>
              <th className="py-3 px-3.5 w-[11%] min-w-[110px] text-left">
                Vendor Type
              </th>
              <th className="py-3 px-3.5 w-[11%] min-w-[120px] text-left">
                Cash Pickup
              </th>
              <th className="py-3 px-3.5 w-[12%] min-w-[120px] text-left">
                Wallet Funding
              </th>
              <th className="py-3 px-3.5 w-[13%] min-w-[140px] text-left">
                Customer Withdrawal
              </th>
              <th className="py-3 px-3.5 w-[13%] min-w-[140px] text-left">
                Walk-In Transaction
              </th>
              <th className="py-3 px-3.5 w-[10%] min-w-[110px] text-left">
                Vendor Status
              </th>
              <th className="py-3 px-3.5 w-[14%] min-w-[140px] text-left">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedVendors.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 border-b border-slate-100">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <Building2 className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[13px] font-semibold leading-[18px] text-slate-700">No vendors found</p>
                    <p className="text-[11px] font-normal leading-[15px] text-slate-500 mt-1">
                      No vendors match your active filter criteria. Try clearing or modifying your filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedVendors.map((vendor) => {
                const isInactive = vendor.status === 'Inactive';
                const isHighlighted = highlightVendorId === vendor.id;
                const currentServices = draftEligibilities[vendor.id] ?? vendor.services;
                const originalServices = vendor.services;

                return (
                  <tr
                    key={vendor.id}
                    id={`vendor-row-${vendor.id}`}
                    className={`transition-colors duration-150 ${
                      isHighlighted
                        ? 'bg-cyan-50/70 hover:bg-cyan-50'
                        : isInactive
                        ? 'bg-slate-50/40 hover:bg-slate-50/70 text-slate-500'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Column 1: Vendor (Left-Aligned, Text-Only without Logo) */}
                    <td className="py-3 px-3.5 text-left align-middle">
                      <div className="flex flex-col justify-center items-start min-w-0">
                        <Link
                          to={`/super-admin/configuration/vendors/${encodeURIComponent(vendor.id)}`}
                          className="text-[13px] font-semibold leading-[18px] text-slate-900 hover:text-[#0D93AA] inline-flex items-center gap-1 group truncate text-left"
                          title={`View ${vendor.name} details`}
                        >
                          <span className="truncate">{vendor.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#0D93AA] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 text-left">
                          <span className="text-[11px] font-normal leading-[15px] text-slate-500 font-mono">
                            {vendor.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Vendor Type (Left-Aligned Badge) */}
                    <td className="py-3 px-3.5 text-left align-middle">
                      <div className="flex items-center justify-start">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium leading-[16px] whitespace-nowrap ${
                            vendor.type === 'Mobile Money'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200/70'
                          }`}
                        >
                          {vendor.type === 'Mobile Money' ? (
                            <Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                          <span>{vendor.type}</span>
                        </span>
                      </div>
                    </td>

                    {/* Columns 3-6: 4 External Services (Completely Left-Aligned) */}
                    {SERVICES.map((service) => {
                      const isEnabled = currentServices.includes(service);
                      const originalEnabled = originalServices.includes(service);
                      const isModified = isEditing && isEnabled !== originalEnabled;

                      if (isInactive) {
                        // Inactive vendor: Controls locked, Left-Aligned
                        const isConfiguredService = vendor.services.includes(service);
                        return (
                          <td
                            key={service}
                            className="py-3 px-3.5 text-left align-middle"
                          >
                            <div
                              className="flex flex-col items-start justify-center cursor-not-allowed text-left"
                              title="Reactivate this vendor from Vendor Details before changing eligibility."
                            >
                              <div className="w-10 h-5.5 flex items-center rounded-full p-0.5 bg-slate-200/80 opacity-60">
                                <div
                                  className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs ${
                                    isConfiguredService ? 'translate-x-4.5' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                              <span className="text-[11px] font-normal leading-[15px] text-slate-500 mt-1 text-left">
                                {isConfiguredService ? 'Configured' : 'Disabled'}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      // Active vendor
                      return (
                        <td
                          key={service}
                          className={`py-3 px-3.5 text-left align-middle transition-colors ${
                            isModified
                              ? isEnabled
                                ? 'bg-emerald-50/80 border-y border-emerald-300'
                                : 'bg-amber-50/90 border-y border-amber-300'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-start justify-center text-left">
                            {isEditing ? (
                              // Active vendor in Edit Mode: Interactive Toggle Left-Aligned with supporting text
                              <div className="flex flex-col items-start text-left">
                                <button
                                  id={`toggle-${vendor.id}-${service.replace(/\s+/g, '-').toLowerCase()}`}
                                  type="button"
                                  role="switch"
                                  aria-checked={isEnabled}
                                  aria-label={`Toggle ${service} for ${vendor.name}`}
                                  onClick={() => onToggleService(vendor.id, service)}
                                  onKeyDown={(e) => {
                                    if (e.key === ' ' || e.key === 'Enter') {
                                      e.preventDefault();
                                      onToggleService(vendor.id, service);
                                    }
                                  }}
                                  className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA] focus:ring-offset-2 cursor-pointer ${
                                    isEnabled ? 'bg-[#0D93AA]' : 'bg-slate-300 hover:bg-slate-400'
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out ${
                                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                {isModified ? (
                                  <div className="mt-1 flex flex-col items-start leading-tight text-left">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold leading-[15px] ${
                                        isEnabled
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                                      } whitespace-nowrap shadow-2xs`}
                                    >
                                      {originalEnabled ? 'Enabled' : 'Disabled'} → {isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    className={`text-[11px] font-normal leading-[15px] mt-1 text-left ${
                                      isEnabled ? 'text-emerald-700' : 'text-slate-500'
                                    }`}
                                  >
                                    {isEnabled ? 'Enabled' : 'Disabled'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              // Read-only mode: Clean Status Badge Left-Aligned
                              <div
                                className="inline-flex items-center justify-start text-left"
                                title="Click 'Edit Eligibility' to modify"
                              >
                                {isEnabled ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium leading-[16px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                                    <span>Enabled</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium leading-[16px] bg-slate-100 text-slate-500 border border-slate-200/80 whitespace-nowrap">
                                    <Ban className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Disabled</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Column 7: Vendor Status (Left-Aligned Badge) */}
                    <td className="py-3 px-3.5 text-left align-middle">
                      <div className="flex items-center justify-start">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium leading-[16px] whitespace-nowrap ${
                            vendor.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{vendor.status}</span>
                        </span>
                      </div>
                    </td>

                    {/* Column 8: Last Updated (Left-Aligned) */}
                    <td className="py-3 px-3.5 text-left align-middle">
                      <div className="flex items-center justify-start gap-1.5 text-[13px] font-medium leading-[18px] text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{vendor.lastUpdated}</span>
                      </div>
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
