import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Coins,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Info,
  CheckCircle2,
  FileText,
  Clock,
  X,
} from 'lucide-react';
import { CustomerFinancialSummary, CustomerWalletActivity } from '../../../types/customerProfile';
import { CustomerRecord } from '../../../types/customer';
import { formatZMW } from '../../../utils/formatters';

interface CustomerWalletTabProps {
  customer: CustomerRecord;
  financials: CustomerFinancialSummary;
  activities: CustomerWalletActivity[];
}

export const CustomerWalletTab: React.FC<CustomerWalletTabProps> = ({
  customer,
  financials,
  activities,
}) => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<CustomerWalletActivity | null>(null);

  return (
    <div className="space-y-6">
      {/* Financial Consistency Banner */}
      <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#0D93AA]">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Ledger Balance Invariant: </span>
          <span>
            Available Balance ({formatZMW(financials.availableBalance)}) + Reserved Funds ({formatZMW(financials.reservedFunds)}) = Wallet Balance ({formatZMW(financials.walletBalance)}). Balances are automatically updated through posted ledger double-entry transactions and cannot be manually overridden.
          </span>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Wallet Balance */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Wallet Balance
            </span>
            <Wallet className="w-3.5 h-3.5 text-[#0D93AA]" />
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {formatZMW(financials.walletBalance)}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Total customer funds</span>
        </div>

        {/* 2. Available Balance */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Available Balance
            </span>
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-700">
            {formatZMW(financials.availableBalance)}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Disbursable funds</span>
        </div>

        {/* 3. Reserved Funds */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Reserved Funds
            </span>
            <Lock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {formatZMW(financials.reservedFunds)}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Active pickup holds</span>
        </div>

        {/* 4. Pending Withdrawal Amount */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Pending Withdrawal
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {formatZMW(financials.pendingWithdrawalAmount)}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">
            {financials.pendingWithdrawalsCount} pending settlement
          </span>
        </div>

        {/* 5. Total Funds Added */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Funds Added
            </span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {formatZMW(financials.totalFundsAdded)}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Lifetime deposit volume</span>
        </div>

        {/* 6. Total Funds Withdrawn */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Withdrawn
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {formatZMW(financials.totalFundsWithdrawn)}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Lifetime payout volume</span>
        </div>
      </div>

      {/* Navigation Links to System Financial Hubs */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-gray-700">
          Related System Ledgers & Operations:
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/super-admin/wallets/customer')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Customer Wallet Details</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/super-admin/ledgers/wallet')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Wallet Ledger</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/super-admin/wallets/customer-withdrawals')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Customer Withdrawals</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Customer Wallet Activity / Ledger */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Wallet Activity & Posted Entries</h3>
            <p className="text-xs text-gray-500">
              Audit log of double-entry credits, debits and pending balance reservations
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700">
            Account: {customer.id}-WAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th scope="col" className="py-3.5 px-4">Reference</th>
                <th scope="col" className="py-3.5 px-4">Date & Time</th>
                <th scope="col" className="py-3.5 px-4">Activity Type</th>
                <th scope="col" className="py-3.5 px-4">Description</th>
                <th scope="col" className="py-3.5 px-4 text-right">Credit</th>
                <th scope="col" className="py-3.5 px-4 text-right">Debit</th>
                <th scope="col" className="py-3.5 px-4 text-right">Resulting Balance</th>
                <th scope="col" className="py-3.5 px-4 text-center">Status</th>
                <th scope="col" className="py-3.5 px-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* Reference */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-gray-900 whitespace-nowrap">
                    {act.reference}
                  </td>

                  {/* Date & Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                    {act.dateTime}
                  </td>

                  {/* Activity Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        act.activityType === 'Funding'
                          ? 'bg-emerald-50 text-emerald-700'
                          : act.activityType === 'Withdrawal'
                          ? 'bg-rose-50 text-rose-700'
                          : act.activityType === 'Pickup Reservation'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {act.activityType}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 text-gray-700 max-w-[240px] truncate" title={act.description}>
                    {act.description}
                  </td>

                  {/* Credit */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-emerald-600">
                    {act.credit !== null ? `+ ${formatZMW(act.credit)}` : '—'}
                  </td>

                  {/* Debit */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-rose-600">
                    {act.debit !== null ? `- ${formatZMW(act.debit)}` : '—'}
                  </td>

                  {/* Resulting Balance */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-semibold text-gray-900">
                    {formatZMW(act.resultingBalance)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        act.status === 'Posted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {act.status}
                    </span>
                  </td>

                  {/* Details button */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedActivity(act)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0D93AA] hover:bg-cyan-50 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0D93AA]" />
                <h3 className="text-sm font-bold text-gray-900">Wallet Transaction Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-gray-900">{selectedActivity.reference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Related Order:</span>
                <span className="font-mono font-semibold text-gray-700">{selectedActivity.relatedReference || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Timestamp:</span>
                <span className="text-gray-800">{selectedActivity.dateTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Activity Type:</span>
                <span className="font-semibold text-gray-800">{selectedActivity.activityType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Amount Impact:</span>
                <span className={`font-bold ${selectedActivity.credit ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedActivity.credit ? `+ ${formatZMW(selectedActivity.credit)}` : `- ${formatZMW(selectedActivity.debit || 0)}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Resulting Ledger Balance:</span>
                <span className="font-bold text-gray-900">{formatZMW(selectedActivity.resultingBalance)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Posting Status:</span>
                <span className="font-semibold text-emerald-700">{selectedActivity.status}</span>
              </div>
              <div className="pt-2 text-gray-500">
                <span className="font-medium text-gray-700">Memo: </span>
                {selectedActivity.description}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
