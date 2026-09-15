import React from 'react';
import {
  Building2,
  Smartphone,
  Info,
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
          {/* Table Header inside proper thead before tbody, standard semantic header */}
          <thead className="bg-slate-50/90 border-b border-slate-200">
            <tr className="text-[11.5px] font-semibold text-slate-600 uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 min-w-[220px]">
                Vendor
              </th>
              <th className="py-3.5 px-3 min-w-[120px]">
                Vendor Type
              </th>
              <th className="py-3.5 px-3 text-center min-w-[130px]">
                <div className="inline-flex items-center justify-center gap-1">
                  <span>Cash Pickup</span>
                  <span
                    className="cursor-help text-slate-400 hover:text-slate-600"
                    title="Reservation Charge (ZMW 50.00) applies only to Cash Pickup routing."
                  >
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-center min-w-[130px]">
                Wallet Funding
              </th>
              <th className="py-3.5 px-3 text-center min-w-[155px]">
                Customer Withdrawal
              </th>
              <th className="py-3.5 px-3 text-center min-w-[155px]">
                Walk-In Transaction
              </th>
              <th className="py-3.5 px-3 text-center min-w-[115px]">
                Vendor Status
              </th>
              <th className="py-3.5 px-4 text-right min-w-[130px]">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {sortedVendors.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 border-b border-slate-100">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <Building2 className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No vendors found</p>
                    <p className="text-xs text-slate-500 mt-1">
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
                      {/* Column 1: Vendor Identification (Duplicate "Inactive" label removed beside ID) */}
                      <td className="py-3.5 px-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden">
                            <img
                              src={vendor.logo}
                              alt={vendor.name}
                              className={`w-7 h-7 object-contain ${isInactive ? 'grayscale opacity-70' : ''}`}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/super-admin/configuration/vendors/${encodeURIComponent(vendor.id)}`}
                              className="font-semibold text-slate-900 hover:text-[#0D93AA] flex items-center gap-1 group truncate"
                              title={`View ${vendor.name} details`}
                            >
                              <span className="truncate">{vendor.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#0D93AA] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </Link>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-500">{vendor.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Vendor Type */}
                      <td className="py-3.5 px-3 border-b border-slate-100">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                            vendor.type === 'Mobile Money'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200/70'
                          }`}
                        >
                          {vendor.type === 'Mobile Money' ? (
                            <Smartphone className="w-3 h-3 text-amber-600" />
                          ) : (
                            <Building2 className="w-3 h-3 text-indigo-600" />
                          )}
                          <span>{vendor.type}</span>
                        </span>
                      </td>

                      {/* Columns 3-6: 4 External Services */}
                      {SERVICES.map((service) => {
                        const isEnabled = currentServices.includes(service);
                        const originalEnabled = originalServices.includes(service);
                        const isModified = isEditing && isEnabled !== originalEnabled;

                        if (isInactive) {
                          // Inactive vendor (Zamtel): Controls locked, Cash Pickup is Configured, no repeated "Muted"
                          const isConfiguredService = vendor.services.includes(service);
                          return (
                            <td
                              key={service}
                              className="py-3.5 px-3 text-center align-middle border-b border-slate-100"
                            >
                              <div
                                className="flex flex-col items-center justify-center cursor-not-allowed"
                                title="Reactivate this vendor from Vendor Details before changing eligibility."
                              >
                                <div className="w-10 h-5.5 flex items-center rounded-full p-0.5 bg-slate-200/80 opacity-60">
                                  <div
                                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs ${
                                      isConfiguredService ? 'translate-x-4.5' : 'translate-x-0'
                                    }`}
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-slate-500 mt-1">
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
                            className={`py-3.5 px-3 text-center align-middle transition-colors border-b ${
                              isModified
                                ? isEnabled
                                  ? 'bg-emerald-50/80 border-emerald-300'
                                  : 'bg-amber-50/90 border-amber-300'
                                : 'border-slate-100'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center">
                              {isEditing ? (
                                // Active vendor in Edit Mode: Interactive Toggle with previous and proposed values
                                <div className="flex flex-col items-center">
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
                                    <div className="mt-1.5 flex flex-col items-center leading-tight">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
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
                                      className={`text-[10.5px] font-semibold mt-1 ${
                                        isEnabled ? 'text-emerald-700' : 'text-slate-500'
                                      }`}
                                    >
                                      {isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                // Read-only mode: Clean Status Badge
                                <div
                                  className="inline-flex items-center"
                                  title="Click 'Edit Eligibility' to modify"
                                >
                                  {isEnabled ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                                      <span>Enabled</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200/80">
                                      <Ban className="w-3 h-3 text-slate-400" />
                                      <span>Disabled</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Column 7: Vendor Status */}
                      <td className="py-3.5 px-3 text-center border-b border-slate-100">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
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
                      </td>

                      {/* Column 8: Last Updated */}
                      <td className="py-3.5 px-4 text-right border-b border-slate-100">
                        <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
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
