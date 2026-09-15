import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  Receipt,
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Radio,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  History,
  Info,
  Copy,
  Check,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import {
  MobileMoneyTransaction,
  MobileMoneyStatus,
  ServiceChannel,
  MobileMoneyTransactionType,
} from '../types/mobileMoney';
import { formatZMW, calculateServiceFeeSplit } from '../utils/financialUtils';
import { VendorLogo } from '../components/walk-in/VendorLogo';
import { maskZambianPhone, getInitials } from '../utils/customerUtils';

export const BusinessOwnerMobileMoneyDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const businessScope =
    currentUser?.businessName || 'Lusaka Central Express Agency';

  const [transaction, setTransaction] = useState<MobileMoneyTransaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  useEffect(() => {
    if (!reference) return;

    setIsLoading(true);
    // Strict backend/service-level data isolation:
    // Only transactions belonging to the business owner's business are returned
    adminService
      .getMobileMoneyTransactionByReference(reference, businessScope)
      .then((tx) => {
        setTransaction(tx);
      })
      .catch((err) => {
        console.error('Failed to load transaction detail:', err);
        setTransaction(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [reference, businessScope]);

  const handleCopyReference = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleBack = () => {
    navigate('/business-owner/mobile-money-transactions');
  };

  const renderStatusBadge = (status: MobileMoneyStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'Pending Confirmation':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={13} className="text-amber-600" />
            <span>Pending Confirmation</span>
          </span>
        );
      case 'Active Service':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Radio size={13} className="text-cyan-600 animate-pulse" />
            <span>Active Service</span>
          </span>
        );
      case 'Agent Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 size={13} className="text-blue-600" />
            <span>Agent Confirmed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <XCircle size={13} className="text-gray-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle size={13} className="text-rose-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  const renderChannelBadge = (channel: ServiceChannel) => {
    if (channel === 'Pickup') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          <MapPin size={12} className="text-teal-600" />
          <span>Pickup</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
        <Store size={12} className="text-indigo-600" />
        <span>Walk-In</span>
      </span>
    );
  };

  const renderTypeBadge = (type: MobileMoneyTransactionType) => {
    switch (type) {
      case 'Deposit':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Deposit
          </span>
        );
      case 'Withdrawal':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Withdrawal
          </span>
        );
      case 'Purchase':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Purchase
          </span>
        );
      case 'Liquidity Transfer':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Liquidity Transfer
          </span>
        );
      default:
        return <span className="font-semibold text-gray-900">{type}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-2xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0D93AA] mb-4" />
          <p className="text-sm font-medium text-gray-600">
            Loading transaction details...
          </p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-2xs space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Transaction Not Accessible
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            The transaction reference <span className="font-mono font-bold text-gray-700">{reference}</span> could not be found or does not belong to your authorized agency scope. Business owners are restricted strictly to records associated with their registered business and linked agents.
          </p>
          <div className="pt-2">
            <button
              type="button"
              id="btn-return-from-error"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0D93AA] text-white rounded-lg text-xs font-semibold hover:bg-[#0B7A8D] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Transactions</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = transaction.status === 'Completed';
  const feeSplit = calculateServiceFeeSplit(isCompleted ? transaction.reservationCharge : 0);
  const isUnregistered = !transaction.isRegisteredCustomer || !transaction.customerId;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. Back Navigation & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          id="btn-back-to-transactions"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer w-fit"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1 text-gray-500" />
          <span>Back to Mobile Money Transactions</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopyReference(transaction.reference)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors shadow-2xs cursor-pointer"
          >
            {copiedRef ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Reference Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-gray-500" />
                <span>Copy Reference</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Primary Page Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-gray-900 tracking-tight">
                {transaction.reference}
              </h1>
              {renderStatusBadge(transaction.status)}
              {renderChannelBadge(transaction.serviceChannel)}
              {renderTypeBadge(transaction.transactionType)}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1 font-medium">
                <Calendar size={13} className="text-gray-400" />
                <span>{transaction.formattedDate}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="font-mono text-gray-600">
                Timestamp: {transaction.postedAt}
              </span>
            </div>
          </div>

          {/* Complete Vendor Brand Presentation */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/80 flex items-center gap-3 shrink-0">
            <VendorLogo vendor={transaction.vendor} size="detail" showName={true} />
            <div className="border-l border-gray-200 pl-3">
              <span className="text-[11px] text-gray-500 font-medium block">
                {transaction.vendorType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Core Financial & Balance Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Principal Amount */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Principal Amount
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-gray-900 block">
            {formatZMW(transaction.amount)}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Nominal transaction value
          </span>
        </div>

        {/* Card 2: Service Charges */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Service Charges
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-gray-800 block">
            {transaction.reservationCharge > 0 ? formatZMW(transaction.reservationCharge) : 'ZMW 0.00'}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">
            {transaction.serviceChannel === 'Pickup' ? 'Pickup reservation fee' : 'In-store counter fee'}
          </span>
        </div>

        {/* Card 3: Customer Total */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Customer Total
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#0D93AA] block">
            {formatZMW(transaction.customerTotal)}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Total settled with customer
          </span>
        </div>

        {/* Card 4: Balance Before */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Balance Before
          </span>
          <span className="font-mono text-base sm:text-lg font-semibold text-gray-700 block">
            {transaction.balanceBefore !== undefined ? formatZMW(transaction.balanceBefore) : '—'}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Agency float prior to txn
          </span>
        </div>

        {/* Card 5: Balance After */}
        <div className="bg-white rounded-xl border border-teal-200 bg-teal-50/10 p-4 shadow-2xs col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
            Balance After
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-teal-900 block">
            {formatZMW(transaction.balanceAfter)}
          </span>
          <span className="text-[10px] text-teal-600 mt-1 block">
            Stored post-txn float balance
          </span>
        </div>
      </div>

      {/* 4. Failure or Cancellation Reason Banner (if applicable) */}
      {(transaction.status === 'Failed' || transaction.status === 'Cancelled') && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 sm:p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-rose-900">
              {transaction.status === 'Failed' ? 'Transaction Failed' : 'Transaction Cancelled'}
            </h4>
            <p className="text-xs text-rose-700 leading-relaxed font-medium">
              {transaction.failureReason ||
                transaction.cancellationReason ||
                'This transaction did not reach completion. The vendor rail or customer cancelled the execution prior to authorization.'}
            </p>
          </div>
        </div>
      )}

      {/* 5. Main Information Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Business, Customer, Location & Financial Breakdown */}
        <div className="space-y-6">
          {/* Card A: Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <User size={15} className="text-[#0D93AA]" />
                <span>Customer Information</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {isUnregistered ? 'Unregistered' : 'Registered Customer'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px] mb-0.5">Customer Name</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {transaction.customerName}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] mb-0.5">TellerBud Customer ID</span>
                {isUnregistered ? (
                  <div>
                    <span className="font-medium text-gray-700 block">Walk-In Customer</span>
                    <span className="text-[11px] text-gray-400 font-mono">No TB ID</span>
                  </div>
                ) : (
                  <span className="font-mono font-bold text-gray-900">
                    {transaction.customerId}
                  </span>
                )}
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] mb-0.5">Customer Mobile Number</span>
                <span className="font-mono font-medium text-gray-900 text-sm">
                  {transaction.customerPhone}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] mb-0.5">Account & KYC Status</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                  <ShieldCheck size={14} className="text-teal-600" />
                  <span>{transaction.customerAccountStatus || 'Standard Account'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Agent & Business Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={15} className="text-[#0D93AA]" />
                <span>Agent & Business Information</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                Agency Scope: {transaction.businessId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px] mb-0.5">Agent Name</span>
                <span className="font-semibold text-gray-900">
                  {transaction.agentName}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] mb-0.5">Agent ID</span>
                <span className="font-mono text-gray-900 font-medium">
                  {transaction.agentId}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] mb-0.5">Agent Mobile Number</span>
                <span className="font-mono text-gray-900">
                  {transaction.agentPhone}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] mb-0.5">Associated Business</span>
                <span className="font-semibold text-gray-900">
                  {transaction.businessName}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono mt-0.5">
                  Location: {transaction.businessLocation}
                </span>
              </div>
            </div>
          </div>

          {/* Card C: Service Channel & Location Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={15} className="text-[#0D93AA]" />
                <span>Service Channel & Location ({transaction.serviceChannel})</span>
              </div>
            </div>

            {transaction.serviceChannel === 'Pickup' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <span className="text-gray-500 block text-[11px] mb-0.5">Pickup Location</span>
                  <span className="font-semibold text-gray-900 block">
                    {transaction.pickupLocation || 'Customer Specified Meeting Location'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Requested Service Time</span>
                  <span className="font-medium text-gray-800">
                    {transaction.requestedServiceTime || 'Immediate'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Assignment Method</span>
                  <span className="font-medium text-gray-800">
                    {transaction.assignmentMethod || 'Automated Geospatial Dispatch'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Assigned Timestamp</span>
                  <span className="font-mono text-gray-700">
                    {transaction.assignedTimestamp || transaction.formattedDate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Source Request Ref</span>
                  <span className="font-mono text-gray-700">
                    {transaction.sourceReference || transaction.reference.replace('TB-TXN-', 'TB-REQ-')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Walk-In Counter Location</span>
                  <span className="font-semibold text-gray-900 block">
                    {transaction.walkInLocation || `${transaction.businessName} Counter`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Processing Agent</span>
                  <span className="font-medium text-gray-800">
                    {transaction.processingAgent || transaction.agentName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Terminal ID</span>
                  <span className="font-mono text-gray-700">
                    {transaction.terminalId || 'POS-LUS-01'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Receipt Number</span>
                  <span className="font-mono text-gray-700">
                    {transaction.receiptNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Initiation Timestamp</span>
                  <span className="font-mono text-gray-700">
                    {transaction.initiationTimestamp || transaction.formattedDate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] mb-0.5">Source Walk-In Ref</span>
                  <span className="font-mono text-gray-700">
                    {transaction.sourceReference || transaction.reference.replace('TB-TXN-', 'TB-WLK-')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card D: Commission & Fee Split Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={15} className="text-[#0D93AA]" />
                <span>Commission & Service Charges</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Phase 1 Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-start gap-2.5">
                <Info size={16} className="text-[#0D93AA] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900 mb-0.5">MNO Commission Status</div>
                  <div className="text-gray-600 text-[11px] leading-relaxed">
                    MNO commission functionality belongs to Phase 2. During Phase 1, commission amounts are not computed or billed. TellerBud service charges are distinct and separate from telecom operator commissions.
                  </div>
                </div>
              </div>

              {transaction.reservationCharge > 0 && isCompleted && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200/80">
                    <span className="text-[11px] text-teal-800 block font-semibold">
                      Agency Service Earnings (80%)
                    </span>
                    <span className="font-mono text-base font-bold text-teal-900">
                      {formatZMW(feeSplit.serviceEarnings)}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-[11px] text-gray-600 block font-semibold">
                      TellerBud Platform Share (20%)
                    </span>
                    <span className="font-mono text-base font-bold text-gray-800">
                      {formatZMW(feeSplit.tellerBudShare)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Confirmations, Settlement, and Audit History */}
        <div className="space-y-6">
          {/* Card E: Confirmations & Completion Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#0D93AA]" />
                <span>Confirmations & Settlement</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-900">Customer Confirmation</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    transaction.customerConfirmationStatus === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : transaction.customerConfirmationStatus === 'Failed'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {transaction.customerConfirmationStatus}
                  </span>
                </div>
                <div className="text-[11px] text-gray-600">
                  {transaction.customerConfirmationMethod || 'Secure Verification Protocol'}
                </div>
                {transaction.customerConfirmationTimestamp && (
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    Timestamp: {transaction.customerConfirmationTimestamp}
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-900">Agent Confirmation</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    transaction.agentConfirmationStatus === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {transaction.agentConfirmationStatus}
                  </span>
                </div>
                <div className="text-[11px] text-gray-600">
                  {transaction.agentConfirmationMethod || 'Agent Terminal PIN'}
                </div>
                {transaction.agentConfirmationTimestamp && (
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    Timestamp: {transaction.agentConfirmationTimestamp}
                  </div>
                )}
              </div>
            </div>

            {transaction.completionInformation && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-700" />
                  <span>Completion & Settlement Note</span>
                </div>
                <div className="text-emerald-800 text-[11px] leading-relaxed">
                  {transaction.completionInformation}
                </div>
              </div>
            )}

            <div className="text-[11px] text-gray-500 italic bg-slate-50 border border-gray-200 rounded-lg p-2.5 flex items-start gap-2">
              <Info size={14} className="text-[#0D93AA] shrink-0 mt-0.5" />
              <span>
                Compliance note: Transaction completion is recorded strictly through authorized digital confirmation protocols. Completion is never inferred from third-party SMS or dialler activity.
              </span>
            </div>
          </div>

          {/* Card F: Transaction Activity & Audit History (Timeline) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <History size={15} className="text-[#0D93AA]" />
                <span>Activity & Audit History</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {transaction.timeline.length} Events Logged
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {transaction.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-white border-2 border-[#0D93AA]" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 text-xs">
                      {event.eventName}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {event.actor}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {event.result}
                  </p>
                  <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                    {event.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card G: System Metadata */}
          <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-4 space-y-2 text-xs text-gray-600">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              System Audit Metadata
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400 text-[11px] block">Record Engine</span>
                <span className="font-mono text-gray-800 font-medium">
                  {transaction.recordSource}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Principal Gateway</span>
                <span className="font-medium text-gray-800">
                  {transaction.principalProcessingMethod}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Last Synchronized</span>
                <span className="font-mono text-gray-800">
                  {transaction.lastUpdated}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[11px] block">Internal Record ID</span>
                <span className="font-mono text-gray-800">
                  {transaction.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
