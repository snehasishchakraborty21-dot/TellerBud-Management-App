import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  Lock,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  KeyRound,
  CreditCard,
  CheckCircle2,
  Download,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { CustomerProfileData, CustomerProfileTab } from '../../../types/customerProfile';
import { PickupRequest } from '../../../types/admin';
import { MobileMoneyTransaction } from '../../../types/mobileMoney';
import { formatZMW } from '../../../utils/formatters';
import { maskZambianPhone } from '../../../utils/customerUtils';
import { CustomerStatusBadge } from '../CustomerStatusBadge';

interface CustomerOverviewTabProps {
  data: CustomerProfileData;
  isIdentityRevealed: boolean;
  onOpenProtectedIdentityModal: () => void;
  onHideProtectedIdentity: () => void;
  recentRequests: PickupRequest[];
  recentTransactions: MobileMoneyTransaction[];
  onSelectTab: (tab: CustomerProfileTab) => void;
  onViewRequest: (request: PickupRequest) => void;
  onViewTransaction: (transaction: MobileMoneyTransaction) => void;
}

export const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({
  data,
  isIdentityRevealed,
  onOpenProtectedIdentityModal,
  onHideProtectedIdentity,
  recentRequests,
  recentTransactions,
  onSelectTab,
  onViewRequest,
  onViewTransaction,
}) => {
  const { customer, financials, nrcMasked, nrcFull, identityVerificationStatus, lastSignIn, locations, security } = data;
  const defaultLocation = locations.find((l) => l.isDefault) || locations[0];

  const [downloadNoticeOpen, setDownloadNoticeOpen] = useState(false);

  const isPendingReview = customer.accountStatus === 'Pending' || identityVerificationStatus.toLowerCase().includes('pending');

  return (
    <div className="space-y-6">
      {/* Direct Download Disabled Security Policy Modal */}
      {downloadNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setDownloadNoticeOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                aria-label="Close download notice dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Direct Export & Download Disabled
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                In compliance with the Republic of Zambia Data Protection Act and TellerBud internal security policy, direct export and file download of protected customer identification assets (NRC documents and biometric selfies) are disabled.
              </p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                All customer identity audits must be conducted through the authenticated on-screen inspection process and logged to the administrative audit trail.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDownloadNoticeOpen(false)}
                className="px-4 py-2.5 min-h-[40px] bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Compact Financial & Operational KPI Cards (No supporting captions) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Wallet Balance */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Wallet Balance
            </span>
            <Wallet className="w-4 h-4 text-[#0D93AA]" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {formatZMW(financials.walletBalance)}
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Available Balance
            </span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight">
            {formatZMW(financials.availableBalance)}
          </div>
        </div>

        {/* Reserved Funds */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Reserved Funds
            </span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {formatZMW(financials.reservedFunds)}
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Active Requests
            </span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {financials.activeRequestsCount}
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Pending Withdrawals
            </span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {financials.pendingWithdrawalsCount > 0
              ? formatZMW(financials.pendingWithdrawalAmount)
              : 'ZMW 0.00'}
          </div>
        </div>
      </div>

      {/* 2. Identity & Account Information Card with Data Protection */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Identity & Account Information
            </h2>
          </div>

          <div>
            {isIdentityRevealed ? (
              <button
                type="button"
                onClick={onHideProtectedIdentity}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
              >
                <EyeOff className="w-4 h-4" />
                <span>Mask Protected Identity</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenProtectedIdentityModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
              >
                <Eye className="w-4 h-4 text-amber-700" />
                <span>View Protected Identity</span>
              </button>
            )}
          </div>
        </div>

        {/* Identity Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-gray-500 font-medium block mb-0.5">Customer Name</span>
              <span className="font-semibold text-gray-900 text-sm">{customer.name}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block mb-0.5">Customer ID</span>
              <span className="font-mono font-semibold text-gray-900">{customer.id}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block mb-0.5">Masked Mobile Number</span>
              <span className="font-mono font-semibold text-gray-900">{maskZambianPhone(customer.phone)}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block mb-0.5">Country</span>
              <span className="font-semibold text-gray-900">Zambia</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-gray-500 font-medium block mb-0.5">National Registration Card (NRC)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {isIdentityRevealed ? nrcFull : nrcMasked}
                </span>
                {isIdentityRevealed ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Unmasked (Audit Active)
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                    Masked by default
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-500 font-medium block mb-0.5">Identity Verification Status</span>
              {isPendingReview ? (
                <div className="space-y-0.5">
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Identity Verification Status: Pending Review
                  </span>
                  <p className="text-[11px] text-gray-600">
                    Submitted (Zambia NRC + Selfie) — Pending Verification
                  </p>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {identityVerificationStatus}
                </span>
              )}
            </div>
            <div>
              <span className="text-gray-500 font-medium block mb-0.5">Account Lifecycle Status</span>
              <div>
                <CustomerStatusBadge status={customer.accountStatus} />
              </div>
            </div>
            <div>
              <span className="text-gray-500 font-medium block mb-0.5">Registration Date</span>
              <span className="font-medium text-gray-800">{customer.registeredDate}</span>
            </div>
          </div>

          {/* Customer Selfie & Sign-in state (No unsupported biometric scores) */}
          <div className="space-y-3.5 text-xs bg-gray-50/70 border border-gray-100 rounded-xl p-4">
            <div>
              <span className="text-gray-700 font-semibold block mb-2">Customer Selfie</span>
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-cyan-50 flex items-center justify-center shrink-0">
                  {isIdentityRevealed ? (
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-100 to-teal-50 flex flex-col items-center justify-center text-cyan-800 font-bold text-base">
                      <span>{customer.avatarInitials}</span>
                      <span className="text-[9px] text-cyan-700 font-medium">Selfie</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200/80 text-gray-600">
                      <Lock className="w-5 h-5 text-gray-500 mb-0.5" />
                      <span className="text-[9px] font-semibold">Protected</span>
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-gray-600 leading-normal space-y-0.5">
                  <div>
                    <span className="text-gray-500 font-medium">Customer Selfie: </span>
                    <span className="font-semibold text-gray-800">Submitted</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Capture Source: </span>
                    <span className="text-gray-700">Customer registration</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Access: </span>
                    <span className={isIdentityRevealed ? 'text-amber-800 font-semibold' : 'text-gray-700'}>
                      {isIdentityRevealed ? 'Unmasked (Audited)' : 'Protected'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-gray-500 font-medium">Direct Download: </span>
                    <span className="text-gray-700 font-medium">Disabled</span>
                    <button
                      type="button"
                      onClick={() => setDownloadNoticeOpen(true)}
                      className="p-1 min-h-[32px] min-w-[32px] inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 rounded cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                      aria-label="View direct download policy information"
                      title="Direct download disabled by security policy"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60">
              <span className="text-gray-500 block mb-0.5 font-medium">Last Activity</span>
              <span className="font-medium text-gray-800">{customer.lastActivity}</span>
            </div>

            <div>
              <span className="text-gray-500 block mb-0.5 font-medium">Last Successful Sign-In</span>
              <span className="font-medium text-gray-800 font-mono text-[11px]">{lastSignIn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Mini-Sections: Recent Requests (3 items) & Recent Transactions (3 items) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0D93AA]" />
              <h3 className="text-sm font-bold text-gray-900">Recent Requests</h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('requests')}
              className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] inline-flex items-center gap-1 min-h-[40px] px-2 py-1 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {recentRequests.slice(0, 3).map((req) => (
              <div key={req.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-gray-900">{req.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {req.type}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium text-gray-600">{req.vendor}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {req.createdAt} • {req.pickupLocation}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-gray-900">{formatZMW(req.amount)}</div>
                  <button
                    type="button"
                    onClick={() => onViewRequest(req)}
                    className="text-[11px] text-[#0D93AA] hover:underline font-semibold cursor-pointer mt-0.5 min-h-[32px] px-2 py-1 inline-flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Mobile Money Transactions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0D93AA]" />
              <h3 className="text-sm font-bold text-gray-900">Recent Mobile Money Transactions</h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('transactions')}
              className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] inline-flex items-center gap-1 min-h-[40px] px-2 py-1 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {recentTransactions.slice(0, 3).map((txn) => (
              <div key={txn.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-gray-900">{txn.reference}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        txn.serviceChannel === 'Pickup'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {txn.serviceChannel}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium text-gray-600">{txn.transactionType}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {txn.formattedDate}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-gray-900">{formatZMW(txn.amount)}</div>
                  <button
                    type="button"
                    onClick={() => onViewTransaction(txn)}
                    className="text-[11px] text-[#0D93AA] hover:underline font-semibold cursor-pointer mt-0.5 min-h-[32px] px-2 py-1 inline-flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Summaries Grid: Locations, Wallet & Security & Recovery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Saved Locations Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0D93AA]" />
              Saved Locations
            </span>
            <button
              type="button"
              onClick={() => onSelectTab('locations')}
              className="text-[11px] font-semibold text-[#0D93AA] hover:underline cursor-pointer min-h-[40px] px-2 py-1 inline-flex items-center focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            >
              View {locations.length} Locations
            </button>
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between font-semibold text-gray-900">
              <span>{defaultLocation?.name}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                Default
              </span>
            </div>
            <p className="text-gray-600 text-[11px] truncate">{defaultLocation?.street}</p>
            <p className="text-gray-500 text-[10px]">{defaultLocation?.city}, {defaultLocation?.country}</p>
          </div>
        </div>

        {/* Wallet Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#0D93AA]" />
              Wallet Overview
            </span>
            <button
              type="button"
              onClick={() => onSelectTab('wallet')}
              className="text-[11px] font-semibold text-[#0D93AA] hover:underline cursor-pointer min-h-[40px] px-2 py-1 inline-flex items-center focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            >
              Full Ledger
            </button>
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Available:</span>
              <span className="font-bold text-emerald-700">{formatZMW(financials.availableBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reserved:</span>
              <span className="font-medium text-gray-800">{formatZMW(financials.reservedFunds)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200/60 pt-1">
              <span className="font-semibold text-gray-700">Total Balance:</span>
              <span className="font-bold text-gray-900">{formatZMW(financials.walletBalance)}</span>
            </div>
          </div>
        </div>

        {/* Security & Recovery Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#0D93AA]" />
              Security & Recovery
            </span>
            <button
              type="button"
              onClick={() => onSelectTab('security')}
              className="text-[11px] font-semibold text-[#0D93AA] hover:underline cursor-pointer min-h-[40px] px-2 py-1 inline-flex items-center focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            >
              Security Details
            </button>
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Recovery Status:</span>
              <span className="font-semibold text-gray-800">{security.recoveryStatusText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">4-Digit Passcode:</span>
              <span className="font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Configured
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Auth Health:</span>
              <span className="text-gray-700">Normal (0 Lockouts)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
