import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Check,
  MapPin,
  Clock,
  User,
  UserCheck,
  Building2,
  Compass,
  ExternalLink,
  ShieldCheck,
  Receipt,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { PickupRequest } from '../../types/admin';

interface CompletedRequestDetailsDrawerProps {
  request: PickupRequest;
  onClose: () => void;
}

export const CompletedRequestDetailsDrawer: React.FC<CompletedRequestDetailsDrawerProps> = ({
  request,
  onClose,
}) => {
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Read-only modal preview states for linked records
  const [activeModal, setActiveModal] = useState<
    'customer' | 'agent' | 'business' | 'matching' | 'transaction' | null
  >(null);

  // Trap focus and lock background scrolling
  useEffect(() => {
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the first close button or container on mount
    const timer = setTimeout(() => {
      const closeBtn = drawerRef.current?.querySelector<HTMLElement>('#completed-drawer-close-btn');
      if (closeBtn) {
        closeBtn.focus();
      } else {
        drawerRef.current?.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else {
          onClose();
        }
        return;
      }

      // Trap focus within drawer when modal is not active
      if (e.key === 'Tab' && drawerRef.current && !activeModal) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [onClose, activeModal]);

  // Record values - canonically populated for TB-REQ-1028 with resilient fallbacks
  const reference = request.id || 'TB-REQ-1028';
  const customerId = request.customerId || 'TB-CUS-1028';
  const customerName = request.customerName || 'Thomas Banda';
  const customerPhone = request.customerPhone || '+260 97 328 1028';
  const transactionType = request.type || 'Withdrawal';
  const vendor = request.vendor || 'Zanaco';
  const serviceMode = 'Cash Pickup';
  const transactionAmount = request.amount || 8000.0;
  const reservationCharge = 25.0;
  const customerTotal = transactionAmount + reservationCharge;
  const requestedServiceTime = request.serviceTime === 'Now' ? 'Now' : '31 Aug 2026, 11:30 AM';
  const createdTime = '31 Aug 2026, 09:05 AM';
  const completedTime = '31 Aug 2026, 11:50 AM';

  const pickupLocation = request.pickupLocation || 'Cairo Road Shopping Centre, Lusaka';
  const agentName = request.agentName || 'Joseph Kaunda';
  const agentId = request.agentId || 'TB-AGT-1064';
  const agentPhone = request.agentPhone || '+260 97 123 4567';
  const agentInitials = 'JK';
  const businessName = request.businessName || 'Lusaka Central Express Agency';
  const businessId = request.businessId || 'BIZ-LUS-001';

  const matchingRef = 'TB-MAT-1028';
  const transactionRef = 'TB-TXN-3308';

  const formatZMW = (val: number) =>
    `ZMW ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div
      id="completed-request-details-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completed-drawer-title"
    >
      {/* Dimmed Page Background Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div
          ref={drawerRef}
          tabIndex={-1}
          className="w-screen max-w-full sm:w-[540px] md:w-[560px] lg:w-[580px] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 border-l border-gray-200 outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================================================================= */}
          {/* DRAWER HEADER (Fixed, Sticky) */}
          {/* ================================================================= */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h2
                  id="completed-drawer-title"
                  className="text-base font-bold text-gray-900 tracking-tight"
                >
                  Customer Request Details
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs font-bold text-gray-700">{reference}</span>
                  <span className="text-gray-300">&bull;</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Check size={12} className="text-emerald-700" />
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Close X Button */}
            <button
              id="completed-drawer-close-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ================================================================= */}
          {/* SCROLLABLE BODY */}
          {/* ================================================================= */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* 1. REQUEST SUMMARY */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Request Summary
              </h3>
              <div className="p-4 bg-gray-50 border border-gray-200/90 rounded-xl space-y-3">
                {/* Transaction Amount */}
                <div className="border-b border-gray-200/70 pb-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Transaction Amount
                  </span>
                  <div className="text-xl font-mono font-bold text-gray-900 mt-0.5">
                    {formatZMW(transactionAmount)}
                  </div>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-2 gap-3 pt-0.5">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Transaction Type
                    </span>
                    <span className="text-xs font-semibold text-gray-900 mt-0.5 block">
                      {transactionType}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Vendor
                    </span>
                    <span className="text-xs font-semibold text-gray-900 mt-0.5 block">
                      {vendor}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Service Mode
                    </span>
                    <span className="text-xs font-semibold text-gray-900 mt-0.5 block">
                      {serviceMode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Requested Service Time
                    </span>
                    <div className="flex items-center gap-1 mt-0.5 text-xs font-semibold text-gray-900">
                      <Clock size={12} className="text-gray-400 shrink-0" />
                      <span>{requestedServiceTime}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200/60 pt-2.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Created
                    </span>
                    <span className="font-mono text-xs font-medium text-gray-700 mt-0.5 block">
                      {createdTime}
                    </span>
                  </div>

                  <div className="border-t border-gray-200/60 pt-2.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Completed
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-800 mt-0.5 block">
                      {completedTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER INFORMATION */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Customer Information
                </h3>
                {/* View Customer Button */}
                <button
                  type="button"
                  onClick={() => setActiveModal('customer')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                  title="View Customer Profile"
                >
                  <User size={12} />
                  <span>View Customer</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Customer Name:</span>
                  <span className="font-semibold text-gray-900">{customerName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Customer ID:</span>
                  <span className="font-mono font-semibold text-gray-900">{customerId}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Mobile Number:</span>
                  <span className="font-mono font-semibold text-gray-900">{customerPhone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Account Status:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* 3. PICKUP INFORMATION */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Pickup Information
              </h3>
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-[#0D93AA] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 font-medium block text-[11px]">
                      Pickup Location:
                    </span>
                    <span className="font-semibold text-gray-900 text-xs mt-0.5 block leading-relaxed">
                      {pickupLocation}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100">
                  <div>
                    <span className="text-gray-500 block text-[11px]">City:</span>
                    <span className="font-semibold text-gray-900">Lusaka</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Province:</span>
                    <span className="font-semibold text-gray-900">Lusaka Province</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Country:</span>
                    <span className="font-semibold text-gray-900">Zambia</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Location Source:</span>
                  <span className="font-medium text-gray-800">Customer-selected location</span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 font-medium">Agent Arrival:</span>
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check size={11} />
                      Confirmed
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Arrival Time:</span>
                    <span className="ml-1.5 font-mono font-medium text-gray-800">
                      31 Aug 2026, 11:32 AM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. TRANSACTION INFORMATION */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Transaction Information
              </h3>
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-gray-100">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Transaction Type:</span>
                    <span className="font-semibold text-gray-900">{transactionType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Vendor:</span>
                    <span className="font-semibold text-gray-900">{vendor}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Service Mode:</span>
                    <span className="font-semibold text-gray-900">{serviceMode}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Principal Processing:</span>
                    <span className="font-semibold text-gray-900">External through USSD</span>
                  </div>
                </div>

                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Transaction Amount:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {formatZMW(transactionAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Reservation Charge:</span>
                    <span className="font-mono font-medium text-gray-700">
                      {formatZMW(reservationCharge)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Customer Total:
                    </span>
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {formatZMW(customerTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">Operational Result:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check size={11} />
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. RELATED TRANSACTION */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Related Transaction
                </h3>
                {/* View Transaction Button */}
                <button
                  type="button"
                  onClick={() => setActiveModal('transaction')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                  title="Open corresponding read-only record in All Transactions"
                >
                  <Receipt size={12} />
                  <span>View Transaction</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Transaction Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{transactionRef}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Transaction Status:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Check size={11} />
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {/* 6. AUTOMATED MATCHING */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Automated Matching
                </h3>
                {/* View Matching Activity Button */}
                <button
                  type="button"
                  onClick={() => setActiveModal('matching')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                  title="View Matching Activity"
                >
                  <Compass size={12} />
                  <span>View Matching Activity</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Matching Reference
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-xs mt-0.5 block">
                      {matchingRef}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Check size={12} />
                    Matched
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-0.5 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Matching Method:</span>
                    <span className="font-semibold text-gray-900 mt-0.5 block">Automated</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Matching Round:</span>
                    <span className="font-mono font-bold text-gray-900 mt-0.5 block">1</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Matched At:</span>
                    <span className="font-mono font-semibold text-gray-800 mt-0.5 block">
                      31 Aug 2026, 09:08 AM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. CONFIRMED AGENT */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Confirmed Agent
                </h3>
                {/* View Agent Button */}
                <button
                  type="button"
                  onClick={() => setActiveModal('agent')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                  title="View Agent Profile"
                >
                  <UserCheck size={12} />
                  <span>View Agent</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-3 text-xs">
                {/* Agent Avatar & Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D93AA] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {agentInitials}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{agentName}</div>
                    <div className="font-mono text-xs font-semibold text-gray-500">{agentId}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Mobile Number:</span>
                    <span className="font-mono font-semibold text-gray-900">{agentPhone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Attendance:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Checked In
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Agent Confirmation:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check size={11} />
                      Confirmed
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Agent Confirmed At:</span>
                    <span className="font-mono font-medium text-gray-800">
                      31 Aug 2026, 11:49 AM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. MATCHED BUSINESS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Matched Business
                </h3>
                {/* View Business Button */}
                <button
                  type="button"
                  onClick={() => setActiveModal('business')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                  title="View Business Profile"
                >
                  <Building2 size={12} />
                  <span>View Business</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Business Name:</span>
                  <span className="font-semibold text-gray-900">{businessName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Business ID:</span>
                  <span className="font-mono font-semibold text-gray-900">{businessId}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Business Status:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* 9. COMPLETION CONFIRMATION */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Completion Confirmation
              </h3>
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600 font-medium">Customer Confirmation:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check size={11} />
                        Confirmed
                      </span>
                    </div>
                    <span className="font-mono text-gray-700 font-medium text-[11px]">
                      31 Aug 2026, 11:48 AM
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600 font-medium">Agent Confirmation:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check size={11} />
                        Confirmed
                      </span>
                    </div>
                    <span className="font-mono text-gray-700 font-medium text-[11px]">
                      31 Aug 2026, 11:49 AM
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/80">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-950 font-bold">System Completion:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600 text-white shadow-2xs">
                        <Check size={11} />
                        Completed
                      </span>
                    </div>
                    <span className="font-mono text-emerald-900 font-bold text-[11px]">
                      31 Aug 2026, 11:50 AM
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
                  The Completed status exists only because both Customer and Agent confirmations
                  were received.
                </div>
              </div>
            </div>

            {/* 10. REQUEST LIFECYCLE (9-Step Timeline with Step 9 highlighted in green) */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Request Lifecycle
              </h3>
              <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs">
                <div className="relative pl-6 space-y-6">
                  {/* Vertical Timeline Guide Line */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-200 -translate-x-1/2" />

                  {/* Step 1: Request Created */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">1. Request Created</span>
                        <span className="font-mono text-[11px] text-gray-500">
                          31 Aug 2026, 09:05 AM
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Actor: Thomas Banda — Customer
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Cash Pickup withdrawal request created.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Matching Started */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">2. Matching Started</span>
                        <span className="font-mono text-[11px] text-gray-500">
                          31 Aug 2026, 09:05 AM
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Actor: TellerBud Matching Engine
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Automated matching started.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Agent Accepted */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">3. Agent Accepted</span>
                        <span className="font-mono text-[11px] text-gray-500">
                          31 Aug 2026, 09:08 AM
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Actor: Joseph Kaunda — Agent
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Agent accepted the request.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Agent Confirmed */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">4. Agent Confirmed</span>
                        <span className="font-mono text-[11px] text-gray-500">
                          31 Aug 2026, 09:08 AM
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Actor: TellerBud Matching Engine
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Joseph Kaunda confirmed as the automatically matched agent.
                      </p>
                    </div>
                  </div>

                  {/* Step 5: Agent Arrived */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">5. Agent Arrived</span>
                        <span className="font-mono text-[11px] text-gray-500">
                          31 Aug 2026, 11:32 AM
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Actor: Joseph Kaunda — Agent
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Agent confirmed arrival at the pickup location.
                      </p>
                    </div>
                  </div>

                  {/* Step 6: Active Service */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">6. Active Service</span>
                        <span className="font-mono text-[11px] text-gray-500">
                          31 Aug 2026, 11:33 AM
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Actor: TellerBud Operations System
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Cash Pickup transaction started.
                      </p>
                    </div>
                  </div>

                  {/* Step 7: Customer Confirmation Received */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">
                          7. Customer Confirmation Received
                        </span>
                        <span className="font-mono text-[11px] text-gray-500">
                          31 Aug 2026, 11:48 AM
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Actor: Thomas Banda — Customer
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Customer confirmed completion.
                      </p>
                    </div>
                  </div>

                  {/* Step 8: Agent Confirmation Received */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">
                          8. Agent Confirmation Received
                        </span>
                        <span className="font-mono text-[11px] text-gray-500">
                          31 Aug 2026, 11:49 AM
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Actor: Joseph Kaunda — Agent
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Agent confirmed completion.
                      </p>
                    </div>
                  </div>

                  {/* Step 9: Request Completed (Final Completed Step - Green styling) */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-emerald-100">
                      <Check size={12} className="text-white" />
                    </div>
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-900">
                          9. Request Completed
                        </span>
                        <span className="font-semibold text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          Completed
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-medium">
                        Actor: TellerBud Operations System &bull; 31 Aug 2026, 11:50 AM
                      </div>
                      <p className="text-[11px] text-emerald-950 mt-0.5 font-medium">
                        Both required confirmations were received.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 11. SYSTEM INFORMATION */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                System Information
              </h3>
              <div className="p-3.5 bg-gray-50/80 border border-gray-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Request Source:</span>
                  <span className="font-medium text-gray-900">TellerBud Customer Mobile App</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Matching Method:</span>
                  <span className="font-medium text-gray-900">Automated</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Last Updated:</span>
                  <span className="font-mono font-medium text-gray-700">31 Aug 2026, 11:50 AM</span>
                </div>
              </div>
            </div>

            {/* 12. AUDIT NOTE */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2.5 text-xs text-gray-600">
              <ShieldCheck size={16} className="text-[#0D93AA] mt-0.5 shrink-0" />
              <div className="leading-relaxed">
                <span className="font-semibold text-gray-900">Audit Note: </span>
                Completed request record. Customer and Agent confirmations are preserved in the
                operational audit history.
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* DRAWER FOOTER (Fixed, Sticky) */}
          {/* ================================================================= */}
          <div className="sticky bottom-0 z-20 flex items-center justify-between px-5 sm:px-6 py-3.5 bg-gray-50/95 backdrop-blur-xs border-t border-gray-200">
            {/* Left: Customer ID • Request Reference */}
            <div className="font-mono text-xs font-semibold text-gray-500">
              {customerId} &bull; {reference}
            </div>

            {/* Right: Close Button */}
            <button
              id="completed-drawer-footer-close-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* LINKED RECORD READ-ONLY MODALS */}
      {/* ===================================================================== */}

      {/* 1. VIEW CUSTOMER MODAL */}
      {activeModal === 'customer' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-customer-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/70">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#0D93AA]" />
                <h4 id="modal-customer-title" className="text-sm font-bold text-gray-900">
                  Customer Details &bull; {customerId}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Customer Name:</span>
                <span className="font-semibold text-gray-900">{customerName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Customer ID:</span>
                <span className="font-mono font-semibold text-gray-900">{customerId}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Mobile Number:</span>
                <span className="font-mono font-semibold text-gray-900">{customerPhone}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Account Status:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Registered Location:</span>
                <span className="font-medium text-gray-800">Lusaka, Lusaka Province</span>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-700" />
                <span>
                  Customer NRC number, passcode, and personal security answers remain protected and
                  are not accessible in this operational view.
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onClose();
                  navigate(`/super-admin/people/customers?id=${customerId}`);
                }}
                className="text-xs font-semibold text-[#0D93AA] hover:text-[#0D788B] transition-colors inline-flex items-center gap-1"
              >
                <span>Go to Customers Module</span>
                <ExternalLink size={12} />
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW AGENT MODAL */}
      {activeModal === 'agent' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-agent-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/70">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-[#0D93AA]" />
                <h4 id="modal-agent-title" className="text-sm font-bold text-gray-900">
                  Agent Details &bull; {agentId}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#0D93AA] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {agentInitials}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">{agentName}</div>
                  <div className="font-mono text-xs font-semibold text-gray-500">{agentId}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Mobile Number:</span>
                <span className="font-mono font-semibold text-gray-900">{agentPhone}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Attendance:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Checked In
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Assigned Business:</span>
                <span className="font-semibold text-gray-900">{businessName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Agent Confirmation:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check size={11} />
                  Confirmed at 31 Aug 2026, 11:49 AM
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onClose();
                  navigate(`/super-admin/people/agents?id=${agentId}`);
                }}
                className="text-xs font-semibold text-[#0D93AA] hover:text-[#0D788B] transition-colors inline-flex items-center gap-1"
              >
                <span>Go to Agents Module</span>
                <ExternalLink size={12} />
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW BUSINESS MODAL */}
      {activeModal === 'business' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-business-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/70">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#0D93AA]" />
                <h4 id="modal-business-title" className="text-sm font-bold text-gray-900">
                  Business Details &bull; {businessId}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Business Name:</span>
                <span className="font-semibold text-gray-900">{businessName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Business ID:</span>
                <span className="font-mono font-semibold text-gray-900">{businessId}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Business Status:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Operating Hub:</span>
                <span className="font-medium text-gray-800">Lusaka Central Region</span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onClose();
                  navigate('/super-admin/people/businesses?id=BIZ-LUS-001');
                }}
                className="text-xs font-semibold text-[#0D93AA] hover:text-[#0D788B] transition-colors inline-flex items-center gap-1"
              >
                <span>Go to Businesses Module</span>
                <ExternalLink size={12} />
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW MATCHING ACTIVITY MODAL */}
      {activeModal === 'matching' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-matching-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/70">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[#0D93AA]" />
                <h4 id="modal-matching-title" className="text-sm font-bold text-gray-900">
                  Matching Activity &bull; {matchingRef}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Matching Reference:</span>
                <span className="font-mono font-bold text-gray-900">{matchingRef}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Matching Status:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Check size={11} />
                  Matched
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Matching Method:</span>
                <span className="font-semibold text-gray-900">Automated</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Matching Round:</span>
                <span className="font-mono font-bold text-gray-900">1</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Matched At:</span>
                <span className="font-mono font-medium text-gray-800">31 Aug 2026, 09:08 AM</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Matched Agent:</span>
                <span className="font-semibold text-gray-900">{agentName} (TB-AGT-1064)</span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onClose();
                  navigate(`/super-admin/operations/matching?request=${reference}`);
                }}
                className="text-xs font-semibold text-[#0D93AA] hover:text-[#0D788B] transition-colors inline-flex items-center gap-1"
              >
                <span>Go to Matching &amp; Offers</span>
                <ExternalLink size={12} />
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW TRANSACTION (ALL TRANSACTIONS) MODAL */}
      {activeModal === 'transaction' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-transaction-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/70">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-[#0D93AA]" />
                <h4 id="modal-transaction-title" className="text-sm font-bold text-gray-900">
                  All Transactions &bull; {transactionRef}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Transaction Reference:</span>
                <span className="font-mono font-bold text-gray-900">{transactionRef}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Transaction Status:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Check size={11} />
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Transaction Type:</span>
                <span className="font-semibold text-gray-900">{transactionType}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Vendor:</span>
                <span className="font-semibold text-gray-900">{vendor}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Principal Amount:</span>
                <span className="font-mono font-bold text-gray-900">
                  {formatZMW(transactionAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Reservation Charge:</span>
                <span className="font-mono font-medium text-gray-700">
                  {formatZMW(reservationCharge)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Customer Total:</span>
                <span className="font-mono font-bold text-gray-900">{formatZMW(customerTotal)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Principal Processing:</span>
                <span className="font-medium text-gray-900">External through USSD</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Completed At:</span>
                <span className="font-mono font-medium text-gray-800">{completedTime}</span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onClose();
                  navigate(`/super-admin/transactions/all?ref=${transactionRef}`);
                }}
                className="text-xs font-semibold text-[#0D93AA] hover:text-[#0D788B] transition-colors inline-flex items-center gap-1"
              >
                <span>Open in All Transactions</span>
                <ExternalLink size={12} />
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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
