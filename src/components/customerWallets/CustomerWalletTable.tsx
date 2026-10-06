import React, { useState } from 'react';
import {
  Eye,
  PauseCircle,
  PlayCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Wallet,
  AlertCircle,
  RotateCcw,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  CustomerWalletRecord,
  CustomerWalletSortField,
  CustomerWalletSortDirection,
} from '../../types/customerWallet';

interface CustomerWalletTableProps {
  wallets: CustomerWalletRecord[];
  loading: boolean;
  error: string | null;
  sortField: CustomerWalletSortField;
  sortDirection: CustomerWalletSortDirection;
  onSort: (field: CustomerWalletSortField) => void;
  onViewDetails: (walletId: string) => void;
  onSuspendWallet?: (walletId: string, reason: string) => void;
  onReactivateWallet?: (walletId: string) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

function formatAmountValue(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '0.00';
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const CustomerWalletTable: React.FC<CustomerWalletTableProps> = ({
  wallets,
  loading,
  error,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  onSuspendWallet,
  onReactivateWallet,
  onRetry,
  hasActiveFilters,
  onClearFilters,
}) => {
  // Action Modals State
  const [suspendModalWallet, setSuspendModalWallet] = useState<CustomerWalletRecord | null>(null);
  const [reactivateModalWallet, setReactivateModalWallet] = useState<CustomerWalletRecord | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Sort icon renderer
  const renderSortIcon = (field: CustomerWalletSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          size={11}
          className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0"
        />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={11} className="text-[#0D93AA] shrink-0" />
    ) : (
      <ArrowDown size={11} className="text-[#0D93AA] shrink-0" />
    );
  };

  const handleOpenSuspend = (wallet: CustomerWalletRecord) => {
    setSuspendModalWallet(wallet);
    setSuspendReason('');
    setActionError(null);
  };

  const handleConfirmSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendReason.trim()) {
      setActionError('Please provide a reason for suspending this customer wallet.');
      return;
    }
    if (suspendModalWallet && onSuspendWallet) {
      onSuspendWallet(suspendModalWallet.walletId, suspendReason.trim());
      setSuspendModalWallet(null);
    }
  };

  const handleOpenReactivate = (wallet: CustomerWalletRecord) => {
    setReactivateModalWallet(wallet);
  };

  const handleConfirmReactivate = () => {
    if (reactivateModalWallet && onReactivateWallet) {
      onReactivateWallet(reactivateModalWallet.walletId);
      setReactivateModalWallet(null);
    }
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="flex-1 min-h-0 p-6 space-y-3 bg-white">
        <div className="h-5 bg-slate-100 rounded w-1/4 animate-pulse mb-4" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
          >
            <div className="space-y-1 w-1/4">
              <div className="h-3.5 bg-slate-200 rounded w-3/4 animate-pulse" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2 animate-pulse" />
            </div>
            <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-20 animate-pulse" />
            <div className="h-6 bg-slate-100 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 min-h-0 p-8 flex flex-col items-center justify-center text-center bg-white">
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
      <div className="flex-1 min-h-0 p-12 flex flex-col items-center justify-center text-center bg-white">
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
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b788b] hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        tabIndex={0}
        role="region"
        aria-label="Customer wallets listing"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-auto focus:outline-none focus:ring-1 focus:ring-[#0D93AA]/30"
      >
        <table className="w-full text-left border-collapse min-w-[780px] lg:min-w-full">
          {/* Exact columns in required order:
              1. Customer
              2. Balance (ZMW)
              3. Available (ZMW)
              4. Reserved (ZMW)
              5. Pending Withdrawal (ZMW)
              6. Action
          */}
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-gray-200 text-[10.5px] sm:text-[11px] font-semibold text-slate-600 uppercase tracking-wider select-none shadow-[0_1px_0_0_#E5E7EB]">
            <tr>
              {/* 1. Customer */}
              <th scope="col" className="py-3 pl-4 pr-3 text-left w-[26%] min-w-[200px]">
                <button
                  type="button"
                  onClick={() => onSort('customer')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Customer</span>
                  {renderSortIcon('customer')}
                </button>
              </th>

              {/* 2. Balance (ZMW) */}
              <th scope="col" className="py-3 px-3 text-left w-[18%] min-w-[140px]">
                <button
                  type="button"
                  onClick={() => onSort('walletBalance')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Balance (ZMW)</span>
                  {renderSortIcon('walletBalance')}
                </button>
              </th>

              {/* 3. Available (ZMW) */}
              <th scope="col" className="py-3 px-3 text-left w-[18%] min-w-[140px]">
                <button
                  type="button"
                  onClick={() => onSort('availableBalance')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Available (ZMW)</span>
                  {renderSortIcon('availableBalance')}
                </button>
              </th>

              {/* 4. Reserved (ZMW) */}
              <th scope="col" className="py-3 px-3 text-left w-[16%] min-w-[125px]">
                <button
                  type="button"
                  onClick={() => onSort('reservedFunds')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Reserved (ZMW)</span>
                  {renderSortIcon('reservedFunds')}
                </button>
              </th>

              {/* 5. Pending Withdrawal (ZMW) */}
              <th scope="col" className="py-3 px-3 text-left w-[18%] min-w-[140px]">
                <button
                  type="button"
                  onClick={() => onSort('pendingWithdrawal')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Pending Withdrawal (ZMW)</span>
                  {renderSortIcon('pendingWithdrawal')}
                </button>
              </th>

              {/* 6. Action */}
              <th scope="col" className="py-3 pl-3 pr-4 text-left w-[10%] min-w-[90px]">
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {wallets.map((wallet, index) => {
              const isSuspended = wallet.walletState === 'Suspended';
              const hasPendingWithdrawal =
                wallet.pendingWithdrawalAmount !== null && wallet.pendingWithdrawalAmount > 0;

              return (
                <tr
                  key={`${wallet.walletId}-${wallet.customerId || index}`}
                  className="group hover:bg-slate-50/70 transition-colors"
                >
                  {/* 1. Customer: Full Name on line 1, Wallet ID on line 2 */}
                  <td className="py-2.5 sm:py-3 pl-4 pr-3 text-left align-middle">
                    <div className="flex flex-col">
                      <span
                        className="font-semibold text-gray-900 leading-tight block truncate max-w-[220px]"
                        title={wallet.customerName}
                      >
                        {wallet.customerName}
                      </span>
                      <span
                        className="text-[11px] text-slate-500 font-mono leading-normal mt-0.5"
                        title={`Wallet ID: ${wallet.walletId}`}
                      >
                        {wallet.walletId}
                      </span>
                    </div>
                  </td>

                  {/* 2. Balance (ZMW): Left-aligned, no ZMW symbol */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle whitespace-nowrap">
                    <span className="font-semibold text-gray-900 font-mono text-[12.5px]">
                      {formatAmountValue(wallet.walletBalance)}
                    </span>
                  </td>

                  {/* 3. Available (ZMW): Left-aligned, green for > 0, 0.00 grey for 0 */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle whitespace-nowrap">
                    {wallet.availableBalance > 0 ? (
                      <span className="font-semibold text-emerald-700 font-mono text-[12.5px]">
                        {formatAmountValue(wallet.availableBalance)}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-400 font-mono text-[12.5px]">0.00</span>
                    )}
                  </td>

                  {/* 4. Reserved (ZMW): Left-aligned, amber for > 0, 0.00 grey for 0 */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle whitespace-nowrap">
                    {wallet.reservedFunds > 0 ? (
                      <span className="font-semibold text-amber-700 font-mono text-[12.5px]">
                        {formatAmountValue(wallet.reservedFunds)}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-400 font-mono text-[12.5px]">0.00</span>
                    )}
                  </td>

                  {/* 5. Pending Withdrawal (ZMW): Left-aligned, purple/warning when > 0, '—' for none */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle whitespace-nowrap">
                    {hasPendingWithdrawal ? (
                      <span className="font-semibold text-purple-700 font-mono text-[12.5px]">
                        {formatAmountValue(wallet.pendingWithdrawalAmount)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">—</span>
                    )}
                  </td>

                  {/* 6. Action: Compact left-aligned icon buttons */}
                  <td className="py-2.5 sm:py-3 pl-3 pr-4 text-left align-middle whitespace-nowrap">
                    <div className="flex items-center justify-start gap-1.5">
                      {/* View Icon */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(wallet.walletId)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-[#0D93AA] hover:bg-[#0D93AA]/10 active:bg-[#0D93AA]/20 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA] cursor-pointer"
                        title="View Wallet"
                        aria-label={`View Wallet for ${wallet.customerName}`}
                      >
                        <Eye size={15} />
                      </button>

                      {/* Conditional Suspend / Reactivate Icons */}
                      {!isSuspended ? (
                        <button
                          type="button"
                          onClick={() => handleOpenSuspend(wallet)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 cursor-pointer"
                          title="Suspend Wallet"
                          aria-label={`Suspend Wallet for ${wallet.customerName}`}
                        >
                          <PauseCircle size={15} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenReactivate(wallet)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 cursor-pointer"
                          title="Reactivate Wallet"
                          aria-label={`Reactivate Wallet for ${wallet.customerName}`}
                        >
                          <PlayCircle size={15} />
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

      {/* Suspend Confirmation Modal */}
      {suspendModalWallet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Suspend Customer Wallet?
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {suspendModalWallet.walletId} • {suspendModalWallet.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuspendModalWallet(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to suspend the wallet belonging to{' '}
              <strong className="text-gray-900">{suspendModalWallet.customerName}</strong>?
              The customer will temporarily be unable to initiate wallet transactions or withdrawals.
              The wallet balance and transaction history will remain preserved.
            </p>

            <form onSubmit={handleConfirmSuspend}>
              <div className="mb-4">
                <label
                  htmlFor="suspend-reason"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Reason for suspension <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="suspend-reason"
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => {
                    setSuspendReason(e.target.value);
                    if (actionError) setActionError(null);
                  }}
                  placeholder="Provide an administrative reason for suspending this wallet..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900 placeholder:text-slate-400"
                  required
                />
                {actionError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {actionError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSuspendModalWallet(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reactivate Confirmation Modal */}
      {reactivateModalWallet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Reactivate Customer Wallet?
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {reactivateModalWallet.walletId} • {reactivateModalWallet.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReactivateModalWallet(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              This will restore active wallet privileges for{' '}
              <strong className="text-gray-900">{reactivateModalWallet.customerName}</strong>. The
              customer will immediately be able to perform transactions, deposits, and withdrawal requests.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReactivateModalWallet(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReactivate}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Reactivate Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
