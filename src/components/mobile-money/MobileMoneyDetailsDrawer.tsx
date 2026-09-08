import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  MapPin,
  Store,
  User,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Radio,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  History,
  Info,
} from 'lucide-react';
import {
  MobileMoneyTransaction,
  ServiceChannel,
  MobileMoneyStatus,
} from '../../types/mobileMoney';
import { formatZMW } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface MobileMoneyDetailsDrawerProps {
  transaction: MobileMoneyTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMoneyDetailsDrawer: React.FC<MobileMoneyDetailsDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus and Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const renderStatusBadge = (status: MobileMoneyStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'Pending Confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            <span>Pending Confirmation</span>
          </span>
        );
      case 'Active Service':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Radio size={12} className="text-cyan-600 animate-pulse" />
            <span>Active Service</span>
          </span>
        );
      case 'Agent Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 size={12} className="text-blue-600" />
            <span>Agent Confirmed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <XCircle size={12} className="text-gray-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle size={12} className="text-rose-600" />
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
          <MapPin size={11} className="text-teal-600" />
          <span>Pickup</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
        <Store size={11} className="text-indigo-600" />
        <span>Walk-In</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className="relative w-screen max-w-full sm:w-[540px] md:w-[600px] lg:w-[640px] bg-white shadow-2xl flex flex-col h-full overflow-hidden border-l border-gray-200 z-10 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-mobile-money-title"
      >
        {/* ================================================================= */}
        {/* STICKY HEADER */}
        {/* ================================================================= */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
              {transaction.serviceChannel === 'Pickup' ? (
                <MapPin size={18} />
              ) : (
                <Store size={18} />
              )}
            </div>
            <div>
              <h2
                id="drawer-mobile-money-title"
                className="text-base font-bold text-gray-900"
              >
                Mobile Money Transaction Details
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-bold text-[#0D93AA]">
                  {transaction.reference}
                </span>
                {transaction.sourceReference && (
                  <span className="text-[11px] text-gray-500 font-mono">
                    ({transaction.serviceChannel === 'Pickup' ? 'Req: ' : 'Source: '}
                    {transaction.sourceReference})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {renderChannelBadge(transaction.serviceChannel)}
            {renderStatusBadge(transaction.status)}
            <button
              ref={closeButtonRef}
              type="button"
              id="drawer-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-1"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SCROLLABLE BODY */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-gray-700">
          {/* A1. DUAL REFERENCES CARD */}
          <div className="bg-gray-50/90 rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Transaction References
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <span className="text-[11px] text-gray-500 block mb-0.5 font-medium">
                  Transaction Reference
                </span>
                <span className="font-mono text-sm font-bold text-gray-900 block">
                  {transaction.reference}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Primary Mobile Money identifier
                </span>
              </div>

              {transaction.serviceChannel === 'Pickup' ? (
                <div className="bg-white p-3 rounded-lg border border-teal-200 bg-teal-50/20 shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-teal-800 block mb-0.5 font-medium">
                      Source Request Reference
                    </span>
                    <span className="font-mono text-sm font-bold text-gray-900 block">
                      {transaction.sourceReference || transaction.reference.replace('TB-TXN-', 'TB-REQ-')}
                    </span>
                    <span className="text-[10px] text-teal-600 block mt-0.5">
                      Customer Request Record
                    </span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-teal-100">
                    <button
                      type="button"
                      id="btn-view-related-request"
                      onClick={() => {
                        const reqRef =
                          transaction.sourceReference ||
                          transaction.reference.replace('TB-TXN-', 'TB-REQ-');
                        if (isSuperAdmin) {
                          navigate(`/super-admin/operations/requests?ref=${reqRef}`);
                        } else {
                          navigate(`/business-owner/operations/live?ref=${reqRef}`);
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                    >
                      <span>View Related Request</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-indigo-200 bg-indigo-50/20 shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-indigo-800 block mb-0.5 font-medium">
                      Walk-In Source Reference
                    </span>
                    <span className="font-mono text-sm font-bold text-gray-900 block">
                      {transaction.sourceReference || transaction.reference.replace('TB-TXN-', 'TB-WLK-')}
                    </span>
                    <span className="text-[10px] text-indigo-600 block mt-0.5">
                      Direct In-Store Transaction
                    </span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center gap-1.5 text-[11px] text-indigo-700 font-medium">
                    <Store size={12} />
                    <span>Counter Walk-In Service</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* A2. FINANCIAL SUMMARY CARD */}
          <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Financial Summary
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1 pb-2 border-b border-gray-200">
              <div>
                <span className="text-[11px] text-gray-500 block">Transaction Amount</span>
                <span className="font-mono text-sm font-bold text-gray-900">
                  {formatZMW(transaction.amount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block">Customer Charges</span>
                <span className="font-mono text-sm font-semibold text-gray-700">
                  {transaction.reservationCharge > 0
                    ? formatZMW(transaction.reservationCharge)
                    : 'ZMW 0.00'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block">Customer Total</span>
                <span className="font-mono text-sm font-bold text-[#0D93AA]">
                  {formatZMW(transaction.customerTotal)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-gray-500 block text-[11px]">Channel</span>
                <span className="font-semibold text-gray-900">
                  {transaction.serviceChannel}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Type</span>
                <span className="font-semibold text-gray-900">
                  {transaction.transactionType}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Vendor</span>
                <span className="font-semibold text-gray-900">
                  {transaction.vendor}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Posted</span>
                <span className="text-gray-900">{transaction.formattedDate}</span>
              </div>
            </div>
          </div>

          {/* B. CUSTOMER INFORMATION */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-[#0D93AA]" />
                Customer Information
              </div>
              {transaction.isRegisteredCustomer && transaction.customerId && (
                <button
                  type="button"
                  onClick={() => {
                    if (isSuperAdmin) {
                      navigate(`/super-admin/people/customers?id=${transaction.customerId}`);
                    }
                  }}
                  className="text-[11px] font-semibold text-[#0D93AA] hover:underline inline-flex items-center gap-1"
                >
                  <span>View Customer</span>
                  <ExternalLink size={10} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">Customer Name</span>
                <span className="font-semibold text-gray-900">
                  {transaction.customerName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Customer Identifier</span>
                {transaction.isRegisteredCustomer && transaction.customerId ? (
                  <span className="font-mono font-semibold text-gray-900">
                    {transaction.customerId}
                  </span>
                ) : (
                  <span className="text-gray-600 italic">
                    Walk-In Customer (Unregistered)
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Mobile Number</span>
                <span className="font-mono text-gray-900">
                  {transaction.customerPhone}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Account Status</span>
                <span className="inline-flex items-center gap-1 text-gray-800">
                  <ShieldCheck size={12} className="text-teal-600" />
                  {transaction.customerAccountStatus || 'Standard Account'}
                </span>
              </div>
            </div>
          </div>

          {/* C. AGENT AND BUSINESS */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={13} className="text-[#0D93AA]" />
                Agent & Business
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (isSuperAdmin) {
                      navigate(`/super-admin/people/agents/${transaction.agentId}`);
                    } else {
                      navigate(`/business-owner/agents/${transaction.agentId}`);
                    }
                  }}
                  className="text-[11px] font-semibold text-[#0D93AA] hover:underline inline-flex items-center gap-1"
                >
                  <span>View Agent</span>
                  <ExternalLink size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isSuperAdmin) {
                      navigate(`/super-admin/people/businesses?id=${transaction.businessId}`);
                    } else {
                      navigate(`/business-owner/business-profile`);
                    }
                  }}
                  className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                >
                  <span>View Business</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">Agent Name</span>
                <span className="font-semibold text-gray-900">
                  {transaction.agentName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Agent ID</span>
                <span className="font-mono text-gray-900 font-medium">
                  {transaction.agentId}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Agent Phone</span>
                <span className="font-mono text-gray-900">{transaction.agentPhone}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Associated Business</span>
                <span className="font-semibold text-gray-900">
                  {transaction.businessName}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  ID: {transaction.businessId}
                </span>
              </div>
            </div>
          </div>

          {/* D. SERVICE INFORMATION */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-[#0D93AA]" />
              Service Information ({transaction.serviceChannel})
            </div>

            {transaction.serviceChannel === 'Pickup' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">Pickup Location</span>
                  <span className="text-gray-900 font-medium">
                    {transaction.pickupLocation || 'Customer Specified Address'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Requested Service Time</span>
                  <span className="text-gray-900 font-medium">
                    {transaction.requestedServiceTime || 'Immediate'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Assignment Method</span>
                  <span className="text-gray-900">
                    {transaction.assignmentMethod || 'Automated Geospatial Dispatch'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Assigned Timestamp</span>
                  <span className="text-gray-900">
                    {transaction.assignedTimestamp || transaction.formattedDate}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">Walk-In Counter Location</span>
                  <span className="text-gray-900 font-medium">
                    {transaction.walkInLocation || `${transaction.businessName} Counter`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Processing Agent</span>
                  <span className="text-gray-900 font-medium">
                    {transaction.processingAgent || transaction.agentName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Terminal ID & Receipt</span>
                  <span className="font-mono text-gray-900">
                    {transaction.terminalId || 'POS-MAIN'} • {transaction.receiptNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Initiation Timestamp</span>
                  <span className="text-gray-900">
                    {transaction.initiationTimestamp || transaction.formattedDate}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* E. TRANSACTION INFORMATION */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={13} className="text-[#0D93AA]" />
              Transaction & Settlement Information
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">Channel</span>
                <span className="font-medium text-gray-900">
                  {transaction.serviceChannel}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Transaction Type</span>
                <span className="font-medium text-gray-900">
                  {transaction.transactionType}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Vendor / Rail</span>
                <span className="font-medium text-gray-900">
                  {transaction.vendor} ({transaction.vendorType})
                </span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-gray-500 block text-[11px]">
                  Principal Processing Method
                </span>
                <span className="font-medium text-gray-900">
                  {transaction.principalProcessingMethod}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-600">Principal Amount:</span>
              <span className="font-mono font-semibold text-gray-900">
                {formatZMW(transaction.amount)}
              </span>
            </div>
            {transaction.reservationCharge > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Pickup Reservation Charge:</span>
                <span className="font-mono font-semibold text-gray-900">
                  {formatZMW(transaction.reservationCharge)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-bold">
              <span className="text-gray-900">Customer Total Settled:</span>
              <span className="font-mono text-sm text-[#0D93AA]">
                {formatZMW(transaction.customerTotal)}
              </span>
            </div>
          </div>

          {/* F. CONFIRMATION STATUS */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#0D93AA]" />
              Confirmation Status
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">Customer Confirmation</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {transaction.customerConfirmationStatus}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  {transaction.customerConfirmationMethod || 'In-App Secure Verification'}
                </div>
                {transaction.customerConfirmationTimestamp && (
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    Confirmed: {transaction.customerConfirmationTimestamp}
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">Agent Confirmation</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {transaction.agentConfirmationStatus}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  {transaction.agentConfirmationMethod || 'Agent Terminal Authorization'}
                </div>
                {transaction.agentConfirmationTimestamp && (
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    Confirmed: {transaction.agentConfirmationTimestamp}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-gray-500 italic bg-amber-50/60 border border-amber-200/60 rounded-lg p-2 flex items-start gap-1.5">
              <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Verification note: Transaction completion is recorded strictly through authorized digital confirmation protocols. Completion is never inferred from USSD or dialler activity.
              </span>
            </div>
          </div>

          {/* G. LIFECYCLE TIMELINE */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <History size={13} className="text-[#0D93AA]" />
              Lifecycle Timeline
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {transaction.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-white border-2 border-[#0D93AA]" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 text-xs">
                      {event.eventName}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {event.actor}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{event.result}</p>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {event.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* H. SYSTEM INFORMATION */}
          <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              System Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 text-[11px] block">Record Source</span>
                <span className="font-medium text-gray-800">
                  {transaction.recordSource}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-[11px] block">Last Updated</span>
                <span className="font-medium text-gray-800">
                  {transaction.lastUpdated}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* STICKY FOOTER */}
        {/* ================================================================= */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between px-5 sm:px-6 py-3.5 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-600 font-mono flex items-center gap-2">
            <span>Ref: <strong className="text-gray-900">{transaction.reference}</strong></span>
            {transaction.sourceReference && (
              <span className="text-gray-400 font-normal">
                ({transaction.sourceReference})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {transaction.serviceChannel === 'Pickup' && (
              <button
                type="button"
                onClick={() => {
                  const reqRef =
                    transaction.sourceReference ||
                    transaction.reference.replace('TB-TXN-', 'TB-REQ-');
                  if (isSuperAdmin) {
                    navigate(`/super-admin/operations/requests?ref=${reqRef}`);
                  } else {
                    navigate(`/business-owner/operations/live?ref=${reqRef}`);
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Request</span>
                <ExternalLink size={12} />
              </button>
            )}
            <button
              type="button"
              id="drawer-footer-close-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
