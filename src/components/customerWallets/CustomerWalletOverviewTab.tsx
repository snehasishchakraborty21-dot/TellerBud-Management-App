import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  CustomerWalletRecord,
  CustomerWalletReservation,
  CustomerWalletLedgerEntry,
  CustomerWalletAddFundsRecord,
  CustomerWalletWithdrawalRecord,
} from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';
import { MtnLogo, AirtelLogo } from '../wallet/ProviderLogos';

interface CustomerWalletOverviewTabProps {
  wallet: CustomerWalletRecord;
  reservations: CustomerWalletReservation[];
  ledger: CustomerWalletLedgerEntry[];
  addFunds: CustomerWalletAddFundsRecord[];
  withdrawals: CustomerWalletWithdrawalRecord[];
  onSwitchTab: (tab: 'overview' | 'ledger' | 'reservations' | 'add-funds' | 'withdrawals') => void;
  onSelectAddFunds: (record: CustomerWalletAddFundsRecord) => void;
  onSelectLedger: (entry: CustomerWalletLedgerEntry) => void;
  onSelectReservation: (res: CustomerWalletReservation) => void;
}

export const CustomerWalletOverviewTab: React.FC<CustomerWalletOverviewTabProps> = ({
  wallet,
  reservations,
  ledger,
  addFunds,
  withdrawals,
  onSwitchTab,
  onSelectAddFunds,
  onSelectLedger,
  onSelectReservation,
}) => {
  const navigate = useNavigate();

  // Active reservations only
  const activeReservations = reservations.filter((r) => r.status === 'Active');

  // Pending withdrawal
  const pendingWithdrawal = withdrawals.find(
    (w) => w.status === 'Pending Review' || w.status === 'Approved' || w.status === 'Processing'
  );

  // Latest 5 ledger entries
  const recentLedger = ledger.slice(0, 5);

  // Latest 3 add funds
  const recentAddFunds = addFunds.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* FIRST ROW: Wallet Summary (Left) & Pending Withdrawal Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Wallet Summary Card */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#102025] flex items-center gap-2">
                <Wallet size={16} className="text-[#0D93AA]" />
                <span>Wallet Summary</span>
              </h2>
            </div>

            <dl className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-slate-500 font-medium">Wallet ID</dt>
                <dd className="font-mono font-bold text-slate-900">{wallet.walletId}</dd>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-slate-500 font-medium">Customer ID</dt>
                <dd className="font-mono font-bold text-slate-900">{wallet.customerId}</dd>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-slate-500 font-medium">Wallet Currency</dt>
                <dd className="font-bold text-slate-900">ZMW (Zambian Kwacha)</dd>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-slate-500 font-medium">Wallet State</dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      wallet.walletState === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : wallet.walletState === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {wallet.walletState}
                  </span>
                </dd>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-slate-500 font-medium">Wallet Created Date</dt>
                <dd className="font-medium text-slate-700 font-mono">14 Jan 2025</dd>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-slate-500 font-medium">Last Wallet Activity</dt>
                <dd className="font-medium text-slate-700 font-mono">{wallet.lastUpdated}</dd>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <dt className="text-slate-500 font-medium">Reconciliation Status</dt>
                <dd className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Reconciled</span>
                </dd>
              </div>

              <div className="flex items-center justify-between pt-1">
                <dt className="text-slate-500 font-medium">Wallet Health</dt>
                <dd>
                  {wallet.walletHealth === 'Healthy' && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      Healthy
                    </span>
                  )}
                  {wallet.walletHealth === 'Funds Reserved' && (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                      <Lock size={13} />
                      Funds Reserved
                    </span>
                  )}
                  {wallet.walletHealth === 'Review Required' && (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-700 cursor-help" title={wallet.reviewReason}>
                      <AlertTriangle size={13} />
                      Review Required
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* C. Pending Withdrawal Summary */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-[#102025]">
                  Pending Withdrawal Summary
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onSwitchTab('withdrawals')}
                className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b788b] flex items-center gap-1"
              >
                <span>Withdrawals History</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {pendingWithdrawal ? (
              <div className="p-4 rounded-xl bg-slate-50/90 border border-gray-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {pendingWithdrawal.mno === 'MTN Mobile Money' ? (
                      <MtnLogo className="w-9 h-9" />
                    ) : (
                      <AirtelLogo className="w-9 h-9" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {pendingWithdrawal.withdrawalReference}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {pendingWithdrawal.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        {pendingWithdrawal.mno} • {pendingWithdrawal.maskedPayoutNumber}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block">Requested Amount</span>
                    <span className="text-base font-black text-slate-900">
                      {formatZMW(pendingWithdrawal.amount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Submitted</span>
                    <span className="font-mono text-slate-700 font-medium">{pendingWithdrawal.requestedAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Matched Hold Ref</span>
                    <span className="font-mono text-slate-800 font-semibold">{pendingWithdrawal.reservationReference}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reserved Amount</span>
                    <span className="font-semibold text-amber-800 font-mono">{formatZMW(pendingWithdrawal.reservedAmount)}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/super-admin/wallets/customer-withdrawals/${pendingWithdrawal.withdrawalReference}`)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0D93AA] text-white hover:bg-[#0b788b] transition-colors shadow-2xs"
                  >
                    <span>View Withdrawal</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50/70 border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[160px]">
                <CheckCircle2 size={24} className="text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No pending withdrawals currently active</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">All customer withdrawal requests have been processed or settled</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECOND ROW: Active Reservations (Left) & Recent Ledger Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* B. Active Reservations Card */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-[#102025] flex items-center gap-2">
                  <Lock size={16} className="text-amber-600" />
                  <span>Active Reservations</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Total Held: <span className="font-bold text-amber-800">{formatZMW(wallet.reservedFunds)}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSwitchTab('reservations')}
                className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b788b] flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {activeReservations.length > 0 ? (
              <div className="space-y-2.5">
                {activeReservations.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-3 rounded-xl bg-amber-50/40 hover:bg-amber-50/70 border border-amber-200/60 transition-colors cursor-pointer group flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-[#0D93AA] transition-colors">
                          {res.reference}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {res.reservationType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Ref: <span className="font-mono font-medium text-slate-700">{res.relatedReference}</span> • {res.createdAt}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs text-amber-800 block">
                        {formatZMW(res.remainingAmount)}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 inline-flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50/80 border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[140px]">
                <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No active reservations</p>
                <p className="text-[11px] text-slate-400 mt-1">All customer funds are unencumbered</p>
              </div>
            )}
          </div>
        </div>

        {/* D. Recent Ledger Activity */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0D93AA]" />
                <h2 className="text-sm font-bold text-[#102025]">
                  Recent Ledger Activity
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onSwitchTab('ledger')}
                className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b788b] flex items-center gap-1"
              >
                <span>View Full Ledger</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentLedger.map((entry) => {
                const isCredit = entry.credit !== null && entry.credit > 0;
                const isDebit = entry.debit !== null && entry.debit > 0;

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectLedger(entry)}
                    className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCredit
                            ? 'bg-emerald-50 text-emerald-600'
                            : isDebit
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCredit && <ArrowDownLeft size={14} />}
                        {isDebit && <ArrowUpRight size={14} />}
                        {!isCredit && !isDebit && <Lock size={12} />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-[#0D93AA] transition-colors">
                            {entry.reference}
                          </span>
                          <span className="text-[11px] text-slate-500">• {entry.entryType}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          {entry.dateTime} • Ref: {entry.relatedReference}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isCredit && (
                        <span className="font-black text-xs text-emerald-600 block">
                          + {formatZMW(entry.credit)}
                        </span>
                      )}
                      {isDebit && (
                        <span className="font-black text-xs text-rose-600 block">
                          - {formatZMW(entry.debit)}
                        </span>
                      )}
                      {!isCredit && !isDebit && (
                        <span className="font-semibold text-xs text-slate-400 font-mono block">
                          Hold Memo
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        Bal: {formatZMW(entry.balanceAfter)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* THIRD ROW: Recent Add Funds Activity (Full Width) */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PlusCircle size={16} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-[#102025]">
              Recent Add Funds Activity
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onSwitchTab('add-funds')}
            className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b788b] flex items-center gap-1"
          >
            <span>View All Add Funds</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {recentAddFunds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {recentAddFunds.map((af) => (
              <div
                key={af.id}
                onClick={() => onSelectAddFunds(af)}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-gray-200/70 transition-colors cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="shrink-0 mt-0.5">
                    {af.mno === 'MTN Mobile Money' ? (
                      <MtnLogo className="w-7 h-7" />
                    ) : (
                      <AirtelLogo className="w-7 h-7" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-[#0D93AA] transition-colors">
                        {af.fundingReference}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          af.providerStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : af.providerStatus === 'Failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {af.providerStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {af.mno} ({af.maskedMobileNumber})
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {af.initiatedAt}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-xs text-slate-900 block">
                    {formatZMW(af.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5" title={af.providerReference}>
                    {af.providerReference}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-slate-50/70 border border-dashed border-gray-200">
            <CheckCircle2 size={22} className="text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">No recent Add Funds activity recorded</p>
          </div>
        )}
      </div>
    </div>
  );
};
