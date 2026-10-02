import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Ban,
  RotateCcw,
  Building2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  BusinessGlobalWallet,
  BusinessWalletSortField,
  BusinessWalletSortDirection,
  BusinessWalletState,
} from '../../types/businessWallet';
import { formatZmwListingAmount, formatBusinessWalletId } from '../../utils/formatters';

interface BusinessWalletTableProps {
  wallets: BusinessGlobalWallet[];
  loading: boolean;
  sortField: BusinessWalletSortField;
  sortDirection: BusinessWalletSortDirection;
  onSort: (field: BusinessWalletSortField) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onSuspendWallet: (wallet: BusinessGlobalWallet) => void;
  onReactivateWallet: (wallet: BusinessGlobalWallet) => void;
}

export const BusinessWalletTable: React.FC<BusinessWalletTableProps> = ({
  wallets,
  loading,
  sortField,
  sortDirection,
  onSort,
  hasActiveFilters,
  onClearFilters,
  onSuspendWallet,
  onReactivateWallet,
}) => {
  // Sort icon renderer
  const renderSortIcon = (field: BusinessWalletSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          size={12}
          className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0"
        />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-[#0D93AA] shrink-0" />
    ) : (
      <ArrowDown size={12} className="text-[#0D93AA] shrink-0" />
    );
  };

  // Status badge renderer - Active, Pending, Suspended
  const renderStatusBadge = (state: BusinessWalletState) => {
    switch (state) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            <CheckCircle2 size={11} className="shrink-0 text-emerald-600" />
            <span>Active</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            <Clock size={11} className="shrink-0 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
            <Ban size={11} className="shrink-0 text-rose-500" />
            <span>Suspended</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
            <span>{state}</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-xs">
        <div className="p-8 space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/4 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded w-3/4 animate-pulse" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-28 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
              <div className="h-8 bg-slate-200 rounded-lg w-24 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="bg-white border border-gray-200/90 rounded-xl p-12 shadow-xs flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
          <Building2 size={22} />
        </div>
        <h3 className="text-sm font-semibold text-[#102025] mb-1">
          No business wallets found
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-3">
          No records match the current filter criteria.
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl shadow-xs overflow-hidden mb-6">
      <div className="overflow-x-auto max-h-[calc(100vh-270px)] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs shadow-2xs">
            <tr className="border-b border-gray-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
              {/* 1. Business */}
              <th scope="col" className="py-3 px-4 min-w-[210px]">
                <button
                  type="button"
                  onClick={() => onSort('businessName')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Business</span>
                  {renderSortIcon('businessName')}
                </button>
              </th>

              {/* 2. Business Owner */}
              <th scope="col" className="py-3 px-3 min-w-[150px]">
                <button
                  type="button"
                  onClick={() => onSort('ownerName')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Business Owner</span>
                  {renderSortIcon('ownerName')}
                </button>
              </th>

              {/* 3. Balance (ZMW) */}
              <th scope="col" className="py-3 px-3 text-left whitespace-nowrap min-w-[130px] amount-heading">
                <button
                  type="button"
                  onClick={() => onSort('postedBalance')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Balance (ZMW)</span>
                  {renderSortIcon('postedBalance')}
                </button>
              </th>

              {/* 4. Available (ZMW) */}
              <th scope="col" className="py-3 px-3 text-left whitespace-nowrap min-w-[130px] amount-heading">
                <button
                  type="button"
                  onClick={() => onSort('availableBalance')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Available (ZMW)</span>
                  {renderSortIcon('availableBalance')}
                </button>
              </th>

              {/* 5. Reserved (ZMW) */}
              <th scope="col" className="py-3 px-3 text-left whitespace-nowrap min-w-[125px] amount-heading">
                <button
                  type="button"
                  onClick={() => onSort('reservedFunds')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Reserved (ZMW)</span>
                  {renderSortIcon('reservedFunds')}
                </button>
              </th>

              {/* 6. Status */}
              <th scope="col" className="py-3 px-3 text-center min-w-[115px]">
                <button
                  type="button"
                  onClick={() => onSort('state')}
                  className="group inline-flex items-center justify-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Status</span>
                  {renderSortIcon('state')}
                </button>
              </th>

              {/* 7. Action */}
              <th
                scope="col"
                className="py-3 px-3 text-center min-w-[100px] whitespace-nowrap sticky right-0 bg-slate-50/95 backdrop-blur-xs z-10"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {wallets.map((wallet) => (
              <tr
                key={wallet.id}
                className="group hover:bg-slate-50/70 transition-colors"
              >
                {/* 1. Business: name line 1, Business ID TB-BIZ-000000 line 2 */}
                <td className="py-3 px-4 align-middle">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar / Logo Initials */}
                    <div className="w-8 h-8 rounded-full bg-[#0D93AA]/10 border border-[#0D93AA]/20 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {wallet.businessInitials}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-xs sm:text-[13px] leading-tight truncate">
                        {wallet.businessName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 font-medium">
                        {wallet.businessId}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Business Owner: Only owner full name */}
                <td className="py-3 px-3 align-middle">
                  <div className="font-medium text-slate-800 text-xs sm:text-[13px] leading-tight truncate">
                    {wallet.ownerName}
                  </div>
                </td>

                {/* 3. Balance (ZMW) */}
                <td className="py-3 px-3 align-middle text-left whitespace-nowrap amount-cell">
                  <span className="font-bold font-mono text-[#102025] text-xs sm:text-[13px]">
                    {formatZmwListingAmount(wallet.postedBalance)}
                  </span>
                </td>

                {/* 4. Available (ZMW) */}
                <td className="py-3 px-3 align-middle text-left whitespace-nowrap amount-cell">
                  <span className="font-semibold font-mono text-emerald-700 text-xs sm:text-[13px]">
                    {formatZmwListingAmount(wallet.availableBalance)}
                  </span>
                </td>

                {/* 5. Reserved (ZMW) */}
                <td className="py-3 px-3 align-middle text-left whitespace-nowrap amount-cell">
                  <span
                    className={`font-semibold font-mono text-xs sm:text-[13px] ${
                      wallet.reservedFunds > 0 ? 'text-amber-700' : 'text-slate-400'
                    }`}
                  >
                    {formatZmwListingAmount(wallet.reservedFunds)}
                  </span>
                </td>

                {/* 6. Status */}
                <td className="py-3 px-3 align-middle text-center whitespace-nowrap">
                  {renderStatusBadge(wallet.state)}
                </td>

                {/* 7. Action: Small action icons */}
                <td className="py-3 px-3 align-middle text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/70 z-10">
                  <div className="inline-flex items-center justify-center gap-1.5">
                    {/* View Details Eye Icon */}
                    <Link
                      to={`/business-global-wallets/${wallet.walletId}`}
                      className="p-1.5 text-slate-500 hover:text-[#0D93AA] hover:bg-[#0D93AA]/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#0D93AA]/20 shrink-0"
                      title="View Wallet Details"
                      aria-label="View Wallet Details"
                    >
                      <Eye size={15} />
                    </Link>

                    {/* Suspend Icon (for Active wallet) */}
                    {wallet.state === 'Active' && (
                      <button
                        type="button"
                        onClick={() => onSuspendWallet(wallet)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200 shrink-0"
                        title="Suspend Wallet"
                        aria-label="Suspend Wallet"
                      >
                        <Ban size={15} />
                      </button>
                    )}

                    {/* Reactivate Icon (for Suspended wallet) */}
                    {wallet.state === 'Suspended' && (
                      <button
                        type="button"
                        onClick={() => onReactivateWallet(wallet)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-emerald-200 shrink-0"
                        title="Reactivate Wallet"
                        aria-label="Reactivate Wallet"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
