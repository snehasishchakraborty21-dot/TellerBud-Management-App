import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Eye,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldAlert,
  RotateCcw,
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
  onViewDetails: (business: BusinessRecord, e?: React.MouseEvent) => void;
  onSuspendBusiness: (business: BusinessRecord) => void;
  onReactivateBusiness: (business: BusinessRecord) => void;
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
  onSuspendBusiness,
  onReactivateBusiness,
  onRetry,
  hasActiveFilters,
  onResetFilters,
}) => {
  // Modal state
  const [suspendingBusiness, setSuspendingBusiness] = useState<BusinessRecord | null>(null);
  const [reactivatingBusiness, setReactivatingBusiness] = useState<BusinessRecord | null>(null);

  const renderSortIcon = (field: BusinessSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          size={12}
          className="text-gray-400 group-hover:text-gray-600 ml-1 inline shrink-0"
        />
      );
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
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Active
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Pending
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const handleConfirmSuspend = () => {
    if (suspendingBusiness) {
      onSuspendBusiness(suspendingBusiness);
      setSuspendingBusiness(null);
    }
  };

  const handleConfirmReactivate = () => {
    if (reactivatingBusiness) {
      onReactivateBusiness(reactivatingBusiness);
      setReactivatingBusiness(null);
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
            ? 'No businesses match the specified filter criteria.'
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

  // 4. Data Table: 8 columns ordered per requirement:
  // 1. Business
  // 2. Business Owner
  // 3. City (renamed from Location)
  // 4. Agents
  // 5. Wallet Balance
  // 6. Registered
  // 7. Status
  // 8. Actions
  return (
    <>
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto max-h-[calc(100vh-270px)] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs">
              <tr className="border-b border-gray-200 text-[10.5px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none text-left">
                {/* 1. Business */}
                <th
                  onClick={() => onSort('name')}
                  className="py-3 px-3.5 text-left align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group min-w-[210px] sm:min-w-[230px]"
                >
                  <div className="flex items-center justify-start gap-1">
                    <span>Business</span>
                    {renderSortIcon('name')}
                  </div>
                </th>

                {/* 2. Business Owner */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[170px] sm:min-w-[185px]">
                  <div className="flex items-center justify-start gap-1">
                    <span>Business Owner</span>
                  </div>
                </th>

                {/* 3. City (Renamed from Location) */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[110px] sm:min-w-[125px]">
                  <div className="flex items-center justify-start gap-1">
                    <span>City</span>
                  </div>
                </th>

                {/* 4. Agents */}
                <th
                  onClick={() => onSort('associatedAgents')}
                  className="py-3 px-3.5 text-left align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group min-w-[80px] sm:min-w-[85px]"
                >
                  <div className="flex items-center justify-start gap-1">
                    <span>Agents</span>
                    {renderSortIcon('associatedAgents')}
                  </div>
                </th>

                {/* 5. Wallet Balance */}
                <th
                  onClick={() => onSort('sharedWalletBalance')}
                  className="py-3 px-3.5 text-left align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group min-w-[130px] sm:min-w-[145px]"
                >
                  <div className="flex items-center justify-start gap-1">
                    <span>Wallet Balance</span>
                    {renderSortIcon('sharedWalletBalance')}
                  </div>
                </th>

                {/* 6. Registered */}
                <th
                  onClick={() => onSort('registeredDateIso')}
                  className="py-3 px-3.5 text-left align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group min-w-[110px] sm:min-w-[120px]"
                >
                  <div className="flex items-center justify-start gap-1">
                    <span>Registered</span>
                    {renderSortIcon('registeredDateIso')}
                  </div>
                </th>

                {/* 7. Status */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[95px] sm:min-w-[100px]">
                  <div className="flex items-center justify-start gap-1">
                    <span>Status</span>
                  </div>
                </th>

                {/* 8. Actions */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[95px] sm:min-w-[105px]">
                  <div className="flex items-center justify-start gap-1">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {businesses.map((business) => {
                return (
                  <tr
                    key={`business-row-${business.id}`}
                    id={`business-row-${business.id}`}
                    className="hover:bg-gray-50/70 transition-colors text-left align-middle"
                  >
                    {/* 1. Business: Logo initials, Name (Line 1), and Business ID (Line 2) */}
                    <td className="py-3 px-3.5 text-left align-middle">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="w-7 h-7 rounded-md bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#0D93AA]/20">
                          {business.logoInitials}
                        </div>
                        <div className="min-w-0 text-left">
                          <button
                            type="button"
                            onClick={(e) => onViewDetails(business, e)}
                            className="font-bold text-[#102025] hover:text-[#0D93AA] transition-colors text-xs sm:text-[13px] text-left cursor-pointer line-clamp-2 block"
                            title={business.name}
                          >
                            {business.name}
                          </button>
                          <div className="text-[10.5px] font-mono text-gray-400 mt-0.5 whitespace-nowrap text-left">
                            {business.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Business Owner: Full name (Line 1) + Complete phone number (Line 2) */}
                    <td className="py-3 px-3.5 text-left align-middle">
                      <div className="min-w-0 text-left">
                        <div className="font-semibold text-gray-900 text-xs sm:text-[12.5px] truncate text-left" title={business.ownerName}>
                          {business.ownerName}
                        </div>
                        <div className="text-[11px] font-mono text-gray-500 mt-0.5 whitespace-nowrap text-left">
                          {business.ownerPhone}
                        </div>
                      </div>
                    </td>

                    {/* 3. City: One clean line only with database city field */}
                    <td className="py-3 px-3.5 text-left align-middle whitespace-nowrap">
                      <span className="font-medium text-gray-800 text-xs text-left block">
                        {business.city && business.city.trim() ? business.city.trim() : 'Not Provided'}
                      </span>
                    </td>

                    {/* 4. Agents */}
                    <td className="py-3 px-3.5 text-left align-middle font-mono font-bold text-gray-800 text-xs sm:text-[13px] whitespace-nowrap">
                      <span className="text-left block">{business.associatedAgents}</span>
                    </td>

                    {/* 5. Wallet Balance */}
                    <td className="py-3 px-3.5 text-left align-middle whitespace-nowrap">
                      <div className="text-left">
                        <span className="font-mono font-bold text-gray-900 text-xs sm:text-[13px] text-left block">
                          {formatZMW(business.sharedWalletBalance)}
                        </span>
                        {business.walletState === 'Low Balance' && (
                          <span className="inline-block mt-0.5 text-[9.5px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 whitespace-nowrap text-left">
                            Low Balance
                          </span>
                        )}
                        {business.walletState === 'Suspended' && (
                          <span className="inline-block mt-0.5 text-[9.5px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 whitespace-nowrap text-left">
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Registered */}
                    <td className="py-3 px-3.5 text-left align-middle text-gray-600 text-xs whitespace-nowrap">
                      <span className="text-left block">{business.registeredDate}</span>
                    </td>

                    {/* 7. Status */}
                    <td className="py-3 px-3.5 text-left align-middle whitespace-nowrap">
                      <div className="flex items-center justify-start text-left">
                        {getStatusBadge(business.status)}
                      </div>
                    </td>

                    {/* 8. Actions: Left-aligned small icon-only buttons with consistent gap */}
                    <td className="py-3 px-3.5 text-left align-middle whitespace-nowrap">
                      <div className="flex items-center justify-start gap-1.5 text-left">
                        {/* View Details Action */}
                        <button
                          type="button"
                          id={`btn-view-${business.id}`}
                          onClick={(e) => onViewDetails(business, e)}
                          title="View Business"
                          className="w-7 h-7 rounded-lg text-[#0D93AA] hover:text-[#0B7C90] hover:bg-[#0D93AA]/10 flex items-center justify-center border border-transparent hover:border-[#0D93AA]/20 transition-all cursor-pointer"
                          aria-label="View Business"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Suspend Action (for Active businesses) */}
                        {business.status === 'Active' && (
                          <button
                            type="button"
                            id={`btn-suspend-${business.id}`}
                            onClick={() => setSuspendingBusiness(business)}
                            title="Suspend Business"
                            className="w-7 h-7 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            aria-label="Suspend Business"
                          >
                            <PauseCircle size={14} />
                          </button>
                        )}

                        {/* Reactivate Action (for Suspended businesses) */}
                        {business.status === 'Suspended' && (
                          <button
                            type="button"
                            id={`btn-reactivate-${business.id}`}
                            onClick={() => setReactivatingBusiness(business)}
                            title="Reactivate Business"
                            className="w-7 h-7 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
                            aria-label="Reactivate Business"
                          >
                            <PlayCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      {suspendingBusiness && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="suspend-modal-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <ShieldAlert size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="suspend-modal-title" className="text-base font-bold text-gray-900">
                  Suspend Business?
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Are you sure you want to suspend <span className="font-semibold text-gray-900">{suspendingBusiness.name}</span>? The business and its users will temporarily lose access to operational services. Existing records and financial history will remain preserved.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSuspendingBusiness(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-suspend-business"
                onClick={handleConfirmSuspend}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Suspend Business
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Confirmation Dialog */}
      {reactivatingBusiness && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reactivate-modal-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <RotateCcw size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="reactivate-modal-title" className="text-base font-bold text-gray-900">
                  Reactivate Business?
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Are you sure you want to reactivate <span className="font-semibold text-gray-900">{reactivatingBusiness.name}</span>? The business and its authorised users will regain access to operational services.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReactivatingBusiness(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-reactivate-business"
                onClick={handleConfirmReactivate}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Reactivate Business
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
