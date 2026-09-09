import React from 'react';
import {
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Wallet,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import {
  CustomerWalletRecord,
  CustomerWalletSortField,
  CustomerWalletSortDirection,
  WalletHealthStatus,
} from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';

interface CustomerWalletTableProps {
  wallets: CustomerWalletRecord[];
  loading: boolean;
  error: string | null;
  sortField: CustomerWalletSortField;
  sortDirection: CustomerWalletSortDirection;
  onSort: (field: CustomerWalletSortField) => void;
  onViewDetails: (walletId: string) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const CustomerWalletTable: React.FC<CustomerWalletTableProps> = ({
  wallets,
  loading,
  error,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  onRetry,
  hasActiveFilters,
  onClearFilters,
}) => {
  // Sort icon renderer
  const renderSortIcon = (field: CustomerWalletSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={13} className="text-[#0D93AA]" />
    ) : (
      <ArrowDown size={13} className="text-[#0D93AA]" />
    );
  };

  // Wallet Health Badge renderer
  const renderHealthBadge = (health: WalletHealthStatus, reason?: string) => {
    switch (health) {
      case 'Healthy':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap"
            title="Balances reconcile and there is no active reservation."
          >
            <CheckCircle2 size={12} className="text-emerald-600" />
            Healthy
          </span>
        );
      case 'Funds Reserved':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap"
            title="Balances reconcile with active reserved funds."
          >
            <Lock size={12} className="text-amber-600" />
            Funds Reserved
          </span>
        );
      case 'Review Required':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap cursor-help"
            title={reason || 'Verified ledger, reservation or provider inconsistency exists.'}
          >
            <AlertTriangle size={12} className="text-rose-600" />
            Review Required
          </span>
        );
    }
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-8 space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/4 animate-pulse mb-6" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 w-1/4">
                <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded w-3/4 animate-pulse" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-16 animate-pulse" />
              <div className="h-6 bg-slate-100 rounded-full w-24 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
              <div className="h-8 bg-slate-200 rounded-lg w-24 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle size={22} />
        </div>
        <h3 className="text-sm font-semibold text-[#102025] mb-1">
          Unable to load customer wallets
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          A temporary network issue occurred while loading records. Please retry.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0D93AA] text-white hover:bg-[#0b788b] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]"
        >
          <RotateCcw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Empty state
  if (wallets.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
          <Wallet size={22} />
        </div>
        <h3 className="text-sm font-medium text-[#102025] mb-1">
          No customer wallets found
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b788b] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[860px]">
          {/* Exact table columns order:
              1. Customer
              2. Wallet Balance
              3. Available Balance
              4. Reserved Funds
              5. Pending Withdrawal
              6. Wallet Health
              7. Last Updated
              8. Action
          */}
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200 text-[11.5px] font-semibold text-slate-600 uppercase tracking-wider select-none">
              {/* 1. Customer */}
              <th scope="col" className="py-3.5 pl-4 pr-3 min-w-[220px]">
                <button
                  type="button"
                  onClick={() => onSort('customer')}
                  className="group inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0D93AA] focus:outline-none"
                >
                  <span>Customer</span>
                  {renderSortIcon('customer')}
                </button>
              </th>

              {/* 2. Wallet Balance */}
              <th scope="col" className="py-3.5 px-3 text-right whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('walletBalance')}
                  className="group inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0D93AA] focus:outline-none ml-auto"
                >
                  <span>Wallet Balance</span>
                  {renderSortIcon('walletBalance')}
                </button>
              </th>

              {/* 3. Available Balance */}
              <th scope="col" className="py-3.5 px-3 text-right whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('availableBalance')}
                  className="group inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0D93AA] focus:outline-none ml-auto"
                >
                  <span>Available Balance</span>
                  {renderSortIcon('availableBalance')}
                </button>
              </th>

              {/* 4. Reserved Funds */}
              <th scope="col" className="py-3.5 px-3 text-right whitespace-nowrap min-w-[125px]">
                <button
                  type="button"
                  onClick={() => onSort('reservedFunds')}
                  className="group inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0D93AA] focus:outline-none ml-auto"
                >
                  <span>Reserved Funds</span>
                  {renderSortIcon('reservedFunds')}
                </button>
              </th>

              {/* 5. Pending Withdrawal */}
              <th scope="col" className="py-3.5 px-3 text-right whitespace-nowrap min-w-[135px]">
                <button
                  type="button"
                  onClick={() => onSort('pendingWithdrawal')}
                  className="group inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0D93AA] focus:outline-none ml-auto"
                >
                  <span>Pending Withdrawal</span>
                  {renderSortIcon('pendingWithdrawal')}
                </button>
              </th>

              {/* 6. Wallet Health */}
              <th scope="col" className="py-3.5 px-3 whitespace-nowrap min-w-[130px]">
                <span>Wallet Health</span>
              </th>

              {/* 7. Last Updated */}
              <th scope="col" className="py-3.5 px-3 whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('lastUpdated')}
                  className="group inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0D93AA] focus:outline-none"
                >
                  <span>Last Updated</span>
                  {renderSortIcon('lastUpdated')}
                </button>
              </th>

              {/* 8. Action (Sticky on mobile scroll) */}
              <th
                scope="col"
                className="py-3.5 pl-3 pr-4 text-center sticky right-0 bg-slate-50/90 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)] sm:shadow-none min-w-[120px]"
              >
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {wallets.map((wallet) => (
              <tr
                key={wallet.walletId}
                className="group hover:bg-slate-50/70 transition-colors"
              >
                {/* 1. Customer: Initials avatar + name + ID & masked phone */}
                <td className="py-3 pl-4 pr-3 min-w-[220px]">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar Circle */}
                    <div className="w-8 h-8 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0">
                      {wallet.customerInitials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-medium text-[#102025] hover:text-[#0D93AA] transition-colors truncate block"
                          title={wallet.customerName}
                        >
                          {wallet.customerName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 truncate mt-0.5">
                        <span title={`Customer ID: ${wallet.customerId}`}>{wallet.customerId}</span>
                        <span>•</span>
                        <span title={`Mobile: ${wallet.customerPhoneMasked}`}>{wallet.customerPhoneMasked}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-mono mt-0.5" title={`Wallet ID: ${wallet.walletId}`}>
                        {wallet.walletId}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Wallet Balance */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span className="font-semibold text-[#102025]">
                    {formatZMW(wallet.walletBalance)}
                  </span>
                </td>

                {/* 3. Available Balance */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span className="font-semibold text-emerald-700">
                    {formatZMW(wallet.availableBalance)}
                  </span>
                </td>

                {/* 4. Reserved Funds */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span
                    className={`font-medium ${
                      wallet.reservedFunds > 0 ? 'text-amber-700' : 'text-slate-400'
                    }`}
                  >
                    {formatZMW(wallet.reservedFunds)}
                  </span>
                </td>

                {/* 5. Pending Withdrawal */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  {wallet.pendingWithdrawalAmount !== null ? (
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-purple-700">
                        {formatZMW(wallet.pendingWithdrawalAmount)}
                      </span>
                      {wallet.pendingWithdrawalReference && (
                        <span className="text-[10.5px] text-purple-600/80 font-mono">
                          {wallet.pendingWithdrawalReference}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium">—</span>
                  )}
                </td>

                {/* 6. Wallet Health */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {renderHealthBadge(wallet.walletHealth, wallet.reviewReason)}
                </td>

                {/* 7. Last Updated */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="text-slate-500 text-[11.5px]">
                    {wallet.lastUpdated}
                  </span>
                </td>

                {/* 8. Action: View Details (Outlined Oceanic Blue button) */}
                <td className="py-3 pl-3 pr-4 text-center sticky right-0 bg-white group-hover:bg-slate-50/90 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)] sm:shadow-none whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewDetails(wallet.walletId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#0D93AA] text-[#0D93AA] hover:bg-[#0D93AA]/10 active:bg-[#0D93AA]/20 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA]"
                    title={`View Details for ${wallet.walletId}`}
                  >
                    <Eye size={13} className="shrink-0" />
                    <span>View Details</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
