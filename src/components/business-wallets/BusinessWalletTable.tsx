import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  Building2,
} from 'lucide-react';
import {
  BusinessGlobalWallet,
  BusinessWalletSortField,
  BusinessWalletSortDirection,
  BusinessWalletHealth,
  BusinessWalletState,
} from '../../types/businessWallet';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface BusinessWalletTableProps {
  wallets: BusinessGlobalWallet[];
  loading: boolean;
  sortField: BusinessWalletSortField;
  sortDirection: BusinessWalletSortDirection;
  onSort: (field: BusinessWalletSortField) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const BusinessWalletTable: React.FC<BusinessWalletTableProps> = ({
  wallets,
  loading,
  sortField,
  sortDirection,
  onSort,
  hasActiveFilters,
  onClearFilters,
}) => {
  // Sort icon renderer
  const renderSortIcon = (field: BusinessWalletSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          size={12}
          className="text-slate-400 group-hover:text-slate-600 transition-colors"
        />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-[#0D93AA]" />
    ) : (
      <ArrowDown size={12} className="text-[#0D93AA]" />
    );
  };

  // Health badge renderer
  const renderHealthBadge = (health: BusinessWalletHealth) => {
    switch (health) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
            Healthy
          </span>
        );
      case 'Low Balance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            <Clock size={12} className="text-amber-600 shrink-0" />
            Low Balance
          </span>
        );
      case 'Funds Reserved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50/80 text-amber-800 border border-amber-300 shadow-2xs whitespace-nowrap">
            <Lock size={12} className="text-amber-700 shrink-0" />
            Funds Reserved
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
            <AlertTriangle size={12} className="text-rose-600 shrink-0" />
            Needs Review
          </span>
        );
    }
  };

  // State badge renderer
  const renderStateBadge = (state: BusinessWalletState) => {
    switch (state) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            Active
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            Pending
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap">
            <Ban size={11} className="text-slate-500 shrink-0" />
            Suspended
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
              <div className="flex items-center gap-3 w-1/4">
                <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded w-3/4 animate-pulse" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-16 animate-pulse" />
              <div className="h-6 bg-slate-100 rounded-full w-24 animate-pulse" />
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
    <div className="bg-white border border-gray-200/90 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/90 border-b border-gray-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider select-none">
              {/* 1. Business */}
              <th scope="col" className="py-3 pl-4 pr-3 min-w-[260px]">
                <button
                  type="button"
                  onClick={() => onSort('businessName')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Business</span>
                  {renderSortIcon('businessName')}
                </button>
              </th>

              {/* 2. Business Owner */}
              <th scope="col" className="py-3 px-3 min-w-[170px]">
                <button
                  type="button"
                  onClick={() => onSort('ownerName')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Business Owner</span>
                  {renderSortIcon('ownerName')}
                </button>
              </th>

              {/* 3. Posted Balance */}
              <th scope="col" className="py-3 px-3 text-right whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('postedBalance')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none ml-auto cursor-pointer"
                >
                  <span>Posted Balance</span>
                  {renderSortIcon('postedBalance')}
                </button>
              </th>

              {/* 4. Available Balance */}
              <th scope="col" className="py-3 px-3 text-right whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('availableBalance')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none ml-auto cursor-pointer"
                >
                  <span>Available Balance</span>
                  {renderSortIcon('availableBalance')}
                </button>
              </th>

              {/* 5. Reserved Funds */}
              <th scope="col" className="py-3 px-3 text-right whitespace-nowrap min-w-[120px]">
                <button
                  type="button"
                  onClick={() => onSort('reservedFunds')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none ml-auto cursor-pointer"
                >
                  <span>Reserved Funds</span>
                  {renderSortIcon('reservedFunds')}
                </button>
              </th>

              {/* 6. Wallet Health */}
              <th scope="col" className="py-3 px-3 min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('health')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Wallet Health</span>
                  {renderSortIcon('health')}
                </button>
              </th>

              {/* 7. Wallet State */}
              <th scope="col" className="py-3 px-3 min-w-[105px]">
                <button
                  type="button"
                  onClick={() => onSort('state')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Wallet State</span>
                  {renderSortIcon('state')}
                </button>
              </th>

              {/* 8. Action: Clearly visible, single-line View Details */}
              <th
                scope="col"
                className="py-3 px-4 text-center min-w-[135px] sticky right-0 bg-slate-50/95 backdrop-blur-xs z-10"
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
                {/* 1. Business: initials/avatar, business name, Business ID, Business Wallet ID */}
                <td className="py-3 pl-4 pr-3 align-middle">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[#0D93AA]/10 border border-[#0D93AA]/20 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {wallet.businessInitials}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-xs sm:text-[13px] leading-tight truncate">
                        {wallet.businessName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                        <span className="text-slate-600 font-medium">
                          {wallet.businessId}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">
                          {wallet.walletId}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Business Owner: full owner name, Owner ID */}
                <td className="py-3 px-3 align-middle">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 text-xs sm:text-[13px] leading-tight truncate">
                      {wallet.ownerName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {wallet.ownerId}
                    </div>
                  </div>
                </td>

                {/* 3. Posted Balance (authoritative ledger balance) */}
                <td className="py-3 px-3 align-middle text-right whitespace-nowrap">
                  <span className="font-bold font-mono text-[#102025] text-xs sm:text-[13px]">
                    {formatZMW(wallet.postedBalance)}
                  </span>
                </td>

                {/* 4. Available Balance (excludes reserved funds) */}
                <td className="py-3 px-3 align-middle text-right whitespace-nowrap">
                  <span className="font-semibold font-mono text-emerald-700 text-xs sm:text-[13px]">
                    {formatZMW(wallet.availableBalance)}
                  </span>
                </td>

                {/* 5. Reserved Funds */}
                <td className="py-3 px-3 align-middle text-right whitespace-nowrap">
                  <span
                    className={`font-semibold font-mono text-xs sm:text-[13px] ${
                      wallet.reservedFunds > 0 ? 'text-amber-700' : 'text-slate-400'
                    }`}
                  >
                    {formatZMW(wallet.reservedFunds)}
                  </span>
                </td>

                {/* 6. Wallet Health */}
                <td className="py-3 px-3 align-middle whitespace-nowrap">
                  {renderHealthBadge(wallet.health)}
                </td>

                {/* 7. Wallet State */}
                <td className="py-3 px-3 align-middle whitespace-nowrap">
                  {renderStateBadge(wallet.state)}
                </td>

                {/* 8. Action: Single-line View Details */}
                <td className="py-3 px-4 align-middle text-center sticky right-0 bg-white/95 group-hover:bg-slate-50/95 transition-colors z-10 whitespace-nowrap">
                  <Link
                    to={`/business-global-wallets/${wallet.walletId}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-lg transition-colors border border-[#0D93AA]/20 shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
                    title={`View Details for ${wallet.walletId}`}
                  >
                    <Eye size={13} className="shrink-0" />
                    <span className="whitespace-nowrap">View Details</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
