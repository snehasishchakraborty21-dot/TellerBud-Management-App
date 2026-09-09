import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Users,
  Eye,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  BusinessRecord,
  BusinessSortField,
  BusinessSortDirection,
} from '../../types/business';
import { formatZMW } from '../../config/appConfig';

interface BusinessTableProps {
  businesses: BusinessRecord[];
  loading: boolean;
  error: string | null;
  sortField: BusinessSortField;
  sortDirection: BusinessSortDirection;
  onSort: (field: BusinessSortField) => void;
  onViewDetails: (business: BusinessRecord, e?: React.MouseEvent<HTMLButtonElement>) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onResetFilters?: () => void;
}

export const BusinessTable: React.FC<BusinessTableProps> = ({
  businesses,
  loading,
  error,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  onRetry,
  hasActiveFilters,
  onResetFilters,
}) => {
  const renderSortIcon = (field: BusinessSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-gray-400 group-hover:text-gray-600 ml-1 inline shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-[#0D93AA] ml-1 inline shrink-0" />
    ) : (
      <ArrowDown size={12} className="text-[#0D93AA] ml-1 inline shrink-0" />
    );
  };

  const getStatusBadge = (status: BusinessRecord['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  // 1. Loading Skeleton
  if (loading) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-100 rounded w-1/4 animate-pulse" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-50/80 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">Failed to load businesses</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0D93AA] hover:bg-[#0b7e92] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
          Retry Connection
        </button>
      </div>
    );
  }

  // 3. Empty State
  if (businesses.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <Building2 size={24} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">No businesses found</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
          {hasActiveFilters
            ? 'No businesses match the specified search query and filter criteria.'
            : 'No business agency records currently available in the system.'}
        </p>
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  // 4. Data Table: Exact 8 columns ordered per requirement:
  // 1. Business
  // 2. Business Owner
  // 3. Location
  // 4. Associated Agents
  // 5. Shared Wallet Balance
  // 6. Registered
  // 7. Status
  // 8. Action (Sticky on right on narrower viewports)
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFB] text-gray-700 font-semibold border-b border-gray-200 text-[11px] uppercase tracking-wider select-none">
              {/* 1. Business */}
              <th className="py-3.5 px-4 min-w-[210px]">
                <button
                  type="button"
                  onClick={() => onSort('name')}
                  className="group inline-flex items-center font-bold text-gray-700 hover:text-[#0D93AA] cursor-pointer"
                >
                  Business
                  {renderSortIcon('name')}
                </button>
              </th>

              {/* 2. Business Owner */}
              <th className="py-3.5 px-4 min-w-[190px]">Business Owner</th>

              {/* 3. Location */}
              <th className="py-3.5 px-4 min-w-[140px]">Location</th>

              {/* 4. Associated Agents */}
              <th className="py-3.5 px-4 text-center min-w-[100px]">
                <button
                  type="button"
                  onClick={() => onSort('associatedAgents')}
                  className="group inline-flex items-center font-bold text-gray-700 hover:text-[#0D93AA] cursor-pointer"
                >
                  Agents
                  {renderSortIcon('associatedAgents')}
                </button>
              </th>

              {/* 5. Shared Wallet Balance */}
              <th className="py-3.5 px-4 text-right min-w-[150px]">
                <button
                  type="button"
                  onClick={() => onSort('sharedWalletBalance')}
                  className="group inline-flex items-center font-bold text-gray-700 hover:text-[#0D93AA] cursor-pointer ml-auto"
                >
                  Shared Wallet Balance
                  {renderSortIcon('sharedWalletBalance')}
                </button>
              </th>

              {/* 6. Registered */}
              <th className="py-3.5 px-4 min-w-[110px]">
                <button
                  type="button"
                  onClick={() => onSort('registeredDateIso')}
                  className="group inline-flex items-center font-bold text-gray-700 hover:text-[#0D93AA] cursor-pointer"
                >
                  Registered
                  {renderSortIcon('registeredDateIso')}
                </button>
              </th>

              {/* 7. Status */}
              <th className="py-3.5 px-4 min-w-[100px]">Status</th>

              {/* 8. Action: Sticky on right with solid background */}
              <th className="py-3.5 px-4 text-right min-w-[130px] sticky right-0 z-20 bg-[#F8FAFB] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {businesses.map((business) => {
              return (
                <tr
                  key={business.id}
                  id={`business-row-${business.id}`}
                  className="group hover:bg-gray-50/70 transition-colors"
                >
                  {/* 1. Business */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0 border border-[#0D93AA]/20">
                        {business.logoInitials}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={(e) => onViewDetails(business, e)}
                          className="font-bold text-gray-900 hover:text-[#0D93AA] transition-colors text-left truncate block cursor-pointer"
                        >
                          {business.name}
                        </button>
                        <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                          {business.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Business Owner (Masked mobile number for privacy) */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">
                        {business.ownerName}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                        {business.ownerId}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 mt-0.5" title="Protected mobile number">
                        {business.ownerPhoneMasked}
                      </div>
                    </div>
                  </td>

                  {/* 3. Location */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {business.city}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {business.province}, {business.country}
                      </div>
                    </div>
                  </td>

                  {/* 4. Associated Agents */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 text-gray-800 font-semibold">
                      <Users size={12} className="text-gray-400" />
                      <span>{business.associatedAgents}</span>
                    </div>
                  </td>

                  {/* 5. Shared Wallet Balance (Read-only financial value on a single line) */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-bold text-gray-900 whitespace-nowrap">
                      {formatZMW(business.sharedWalletBalance)}
                    </div>
                    {business.walletState === 'Low Balance' && (
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">
                        Low Balance
                      </span>
                    )}
                    {business.walletState === 'Suspended' && (
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 whitespace-nowrap">
                        Suspended
                      </span>
                    )}
                  </td>

                  {/* 6. Registered */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                    {business.registeredDate}
                  </td>

                  {/* 7. Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(business.status)}
                  </td>

                  {/* 8. Action: Outlined Oceanic Blue button with eye icon, sticky on right with solid white background */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 z-10 bg-white group-hover:bg-[#fbfcfc] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                    <button
                      type="button"
                      id={`btn-view-details-${business.id}`}
                      onClick={(e) => onViewDetails(business, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-transparent hover:bg-[#0D93AA]/10 border border-[#0D93AA] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Eye size={13} className="shrink-0" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
