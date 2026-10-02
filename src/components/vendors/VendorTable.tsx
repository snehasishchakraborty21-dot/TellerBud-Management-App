import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Landmark,
  Building2,
  Clock,
} from 'lucide-react';
import {
  VendorRecord,
  VendorSortField,
  SortDirection,
  VendorStatus,
} from '../../types/vendor';

interface VendorTableProps {
  vendors: VendorRecord[];
  sortField: VendorSortField;
  sortDirection: SortDirection;
  onSort: (field: VendorSortField) => void;
  onViewDetails: (vendor: VendorRecord) => void;
  currentPage: number;
  totalVendorsCount: number;
  pageSize?: number;
}

export const VendorTable: React.FC<VendorTableProps> = ({
  vendors,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  currentPage,
  totalVendorsCount,
  pageSize = 10,
}) => {
  const [revealedVendorId, setRevealedVendorId] = useState<string | null>(null);
  const [hoveredVendorId, setHoveredVendorId] = useState<string | null>(null);

  const renderSortIndicator = (field: VendorSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-[#0D93AA]" />
    ) : (
      <ArrowDown size={12} className="text-[#0D93AA]" />
    );
  };

  const renderStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium leading-[16px] bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium leading-[16px] bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
            Inactive
          </span>
        );
      case 'Pending Integration':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium leading-[16px] bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
            Pending Integration
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium leading-[16px] bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium leading-[16px] bg-slate-100 text-slate-700 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const startRecordNum = vendors.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecordNum = Math.min(currentPage * pageSize, vendors.length);
  const totalPages = Math.max(1, Math.ceil(vendors.length / pageSize));

  return (
    <div
      id="vendor-table-container"
      className="bg-white border border-slate-200/90 rounded-xl shadow-xs flex-1 min-h-0 flex flex-col overflow-hidden"
    >
      {/* Scrollable Table Area: Header sticks at top, data rows scroll vertically beneath it */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-2xs">
            <tr className="text-[11px] font-bold leading-[16px] text-slate-700 uppercase tracking-wider select-none bg-slate-50">
              {/* Column 1: Vendor */}
              <th
                onClick={() => onSort('name')}
                className="py-3 px-4 sm:px-5 bg-slate-50 cursor-pointer hover:bg-slate-100/90 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Vendor</span>
                  {renderSortIndicator('name')}
                </div>
              </th>

              {/* Column 2: Vendor Type */}
              <th
                onClick={() => onSort('type')}
                className="py-3 px-4 bg-slate-50 cursor-pointer hover:bg-slate-100/90 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Vendor Type</span>
                  {renderSortIndicator('type')}
                </div>
              </th>

              {/* Column 3: Supported Services */}
              <th className="py-3 px-4 bg-slate-50">
                <span>Supported Services</span>
              </th>

              {/* Column 4: Integration Mode */}
              <th
                onClick={() => onSort('integrationMode')}
                className="py-3 px-4 bg-slate-50 cursor-pointer hover:bg-slate-100/90 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Integration Mode</span>
                  {renderSortIndicator('integrationMode')}
                </div>
              </th>

              {/* Column 5: Status */}
              <th
                onClick={() => onSort('status')}
                className="py-3 px-4 bg-slate-50 cursor-pointer hover:bg-slate-100/90 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>

              {/* Column 6: Last Updated */}
              <th
                onClick={() => onSort('lastUpdated')}
                className="py-3 px-4 bg-slate-50 cursor-pointer hover:bg-slate-100/90 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Updated</span>
                  {renderSortIndicator('lastUpdated')}
                </div>
              </th>

              {/* Column 7: Action */}
              <th className="py-3 px-4 sm:px-5 bg-slate-50 text-right">
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Building2 size={32} className="text-slate-300" />
                    <p className="text-[14px] font-semibold leading-[20px] text-slate-700">
                      No vendors found
                    </p>
                    <p className="text-[13px] font-medium leading-[18px] text-slate-500">
                      Try adjusting your filter parameters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => {
                const firstTwoServices = vendor.services.slice(0, 2);
                const hiddenServices = vendor.services.slice(2);
                const remainingServicesCount = hiddenServices.length;
                const isRevealed =
                  (revealedVendorId === vendor.id || hoveredVendorId === vendor.id) &&
                  remainingServicesCount > 0;

                return (
                  <tr
                    key={vendor.id}
                    id={`vendor-row-${vendor.id}`}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* 1. Vendor (Text-Only Name + ID) */}
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold leading-[18px] text-slate-900 group-hover:text-[#0D93AA] transition-colors truncate">
                          {vendor.name}
                        </div>
                        {/* Secondary Vendor ID */}
                        <div className="text-[11px] font-normal leading-[15px] font-mono text-slate-500 mt-0.5">
                          {vendor.id}
                        </div>
                      </div>
                    </td>

                    {/* 2. Vendor Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium leading-[18px] text-slate-800">
                        {vendor.type === 'Mobile Money' ? (
                          <Smartphone size={14} className="text-blue-600 shrink-0" />
                        ) : (
                          <Landmark size={14} className="text-indigo-600 shrink-0" />
                        )}
                        <span>{vendor.type}</span>
                      </div>
                    </td>

                    {/* 3. Supported Services (Max 2 tags + Interactive "+N" reveal badge) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        {firstTwoServices.map((service) => (
                          <span
                            key={service}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-[16px] bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap"
                          >
                            {service}
                          </span>
                        ))}
                        {remainingServicesCount > 0 && (
                          <div className="relative inline-flex items-center">
                            <button
                              type="button"
                              id={`reveal-services-btn-${vendor.id}`}
                              aria-label={`Show ${remainingServicesCount} more services: ${hiddenServices.join(', ')}`}
                              aria-expanded={isRevealed}
                              onMouseEnter={() => setHoveredVendorId(vendor.id)}
                              onMouseLeave={() => setHoveredVendorId(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRevealedVendorId((prev) =>
                                  prev === vendor.id ? null : vendor.id
                                );
                              }}
                              onFocus={() => setHoveredVendorId(vendor.id)}
                              onBlur={() => {
                                setHoveredVendorId(null);
                                setRevealedVendorId(null);
                              }}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[12px] font-semibold leading-[16px] bg-teal-50 text-[#0D93AA] hover:bg-[#0D93AA] hover:text-white border border-[#0D93AA]/30 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
                              title={`Click or hover to view additional services: ${hiddenServices.join(', ')}`}
                            >
                              +{remainingServicesCount}
                            </button>

                            {/* Revealed popover tooltip */}
                            {isRevealed && (
                              <div
                                role="tooltip"
                                id={`hidden-services-popover-${vendor.id}`}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
                                onMouseEnter={() => setHoveredVendorId(vendor.id)}
                                onMouseLeave={() => setHoveredVendorId(null)}
                              >
                                <div className="bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap flex items-center gap-1.5">
                                  <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                                    Additional:
                                  </span>
                                  <span className="text-white font-semibold">
                                    {hiddenServices.join(', ')}
                                  </span>
                                </div>
                                <div className="w-2 h-1 mx-auto border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 4. Integration Mode */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[12px] font-medium leading-[16px] font-mono text-slate-800 bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200">
                        {vendor.integrationMode}
                      </span>
                    </td>

                    {/* 5. Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(vendor.status)}
                    </td>

                    {/* 6. Last Updated */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium leading-[18px] text-slate-700 font-mono">
                        <Clock size={12} className="text-slate-500 shrink-0" />
                        <span>{vendor.lastUpdated}</span>
                      </div>
                    </td>

                    {/* 7. Action: View Details Button */}
                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onViewDetails(vendor)}
                        id={`view-details-${vendor.id}`}
                        aria-label={`View Details for ${vendor.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium leading-[16px] text-[#0D93AA] bg-teal-50/80 hover:bg-[#0D93AA] hover:text-white border border-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title={`View Details for ${vendor.name}`}
                      >
                        <span>View Details</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pinned Pagination Footer at bottom of table container */}
      <div
        id="vendor-table-pagination"
        className="shrink-0 border-t border-slate-200 bg-slate-50/80 px-4 sm:px-5 py-2.5 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] font-medium leading-[18px] text-slate-700 select-none"
      >
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="font-semibold text-slate-900">{startRecordNum}</strong> to{' '}
            <strong className="font-semibold text-slate-900">{endRecordNum}</strong> of{' '}
            <strong className="font-semibold text-slate-900">{totalVendorsCount}</strong> vendors
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Rows per page:</span>
            <span className="font-semibold font-mono text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
              {pageSize}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">
              Page <strong className="font-semibold text-slate-900">{currentPage}</strong> of{' '}
              <strong className="font-semibold text-slate-900">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1 ml-2">
              <button
                disabled={currentPage <= 1}
                aria-label="Previous Page"
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage >= totalPages}
                aria-label="Next Page"
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
