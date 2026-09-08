import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Radio,
  X,
  MapPin,
  Clock,
  Compass,
  User,
  ExternalLink,
  Check,
  UserCheck,
  Building2,
} from 'lucide-react';
import { PickupRequest } from '../../types/admin';
import { formatZMW } from '../../utils/formatters';

interface LiveRequestDetailsDrawerProps {
  request: PickupRequest | null;
  onClose: () => void;
  title?: string;
  sourcePage?: 'customer-requests' | 'live-operations';
}

export const LiveRequestDetailsDrawer: React.FC<LiveRequestDetailsDrawerProps> = ({
  request,
  onClose,
  title,
  sourcePage,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Context-aware drawer title based on originating page
  const isCustomerPage =
    sourcePage === 'customer-requests' ||
    location.pathname.includes('/customer-requests');
  const drawerTitle =
    title || (isCustomerPage ? 'Customer Request Details' : 'Live Request Details');

  // Focus trap, Escape listener, and body scroll prevention
  useEffect(() => {
    if (!request) return;

    // Store the previously focused element to return focus upon closing
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

    // Prevent background scrolling while drawer is open
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button initially
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Keyboard focus trap inside drawer
      if (e.key === 'Tab' && drawerRef.current) {
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
      document.body.style.overflow = originalBodyOverflow;
      clearTimeout(focusTimer);
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [request, onClose]);

  if (!request) return null;

  // Identify specific states
  const isCompleted = request.status === 'Completed' || request.id === 'TB-REQ-1028';
  const isCancelled = request.status === 'Cancelled';
  const isNoAgent = request.status === 'No Agent Available';
  const isTB1045 = !isCompleted && !isCancelled && !isNoAgent && (request.id === 'TB-REQ-1045' || request.status === 'Pending Confirmation');
  const isTB1050 = !isCompleted && !isCancelled && !isNoAgent && !isTB1045 && (request.id === 'TB-REQ-1050' || request.status === 'Active Service');
  const isTB1048 = !isCompleted && !isCancelled && !isNoAgent && !isTB1045 && !isTB1050 && (request.id === 'TB-REQ-1048' || request.status === 'Agent Confirmed');
  const isFindingAgent = !isCompleted && !isCancelled && !isNoAgent && !isTB1045 && !isTB1050 && !isTB1048;
  const isTB1052 = isFindingAgent && request.id === 'TB-REQ-1052';

  // Request Reference
  const reference = isTB1045
    ? 'TB-REQ-1045'
    : isTB1050
    ? 'TB-REQ-1050'
    : isTB1048
    ? 'TB-REQ-1048'
    : isTB1052
    ? 'TB-REQ-1052'
    : request.id;

  // Status
  const status = isCompleted
    ? 'Completed'
    : isCancelled
    ? 'Cancelled'
    : isNoAgent
    ? 'No Agent Available'
    : isTB1045
    ? 'Pending Confirmation'
    : isTB1050
    ? 'Active Service'
    : isTB1048
    ? 'Agent Confirmed'
    : 'Finding an Agent';

  // Customer Data
  const customerId = isTB1045
    ? 'TB-CUS-1045'
    : isTB1050
    ? 'TB-CUS-1050'
    : isTB1048
    ? 'TB-CUS-1048'
    : isTB1052
    ? 'TB-CUS-1052'
    : isCompleted && request.id === 'TB-REQ-1028'
    ? 'TB-CUS-1028'
    : request.customerId || 'TB-CUS-1045';

  const customerName = isTB1045
    ? 'Bwalya Mwansa'
    : isTB1050
    ? 'Grace Tembo'
    : isTB1048
    ? 'Ruth Banda'
    : isTB1052
    ? 'Mwamba Mulenga'
    : isCompleted && request.id === 'TB-REQ-1028'
    ? 'Thomas Banda'
    : request.customerName;

  const customerMobile = isTB1045
    ? '+260 97 245 1045'
    : isTB1050
    ? '+260 97 345 1050'
    : isTB1048
    ? '+260 97 654 3210'
    : isTB1052
    ? '+260 97 245 6789'
    : isCompleted && request.id === 'TB-REQ-1028'
    ? '+260 97 328 1028'
    : request.customerPhone || '+260 97 245 1045';

  // Financial Data
  const transactionAmount = isTB1045
    ? 8500.0
    : isTB1050
    ? 3750.0
    : isTB1048
    ? 2500.0
    : isTB1052
    ? 5000.0
    : isCompleted && request.id === 'TB-REQ-1028'
    ? 8000.0
    : request.amount;

  const reservationCharge = (isCancelled || isNoAgent)
    ? 0.0
    : isTB1045
    ? 25.0
    : isTB1050
    ? 15.0
    : isTB1048
    ? 12.0
    : isCompleted && request.id === 'TB-REQ-1028'
    ? 25.0
    : 25.0;

  const customerTotal = transactionAmount + reservationCharge;

  const transactionType = isTB1045
    ? 'Deposit'
    : isTB1050
    ? 'Purchase'
    : isTB1048
    ? 'Withdrawal'
    : isTB1052
    ? 'Deposit'
    : isCompleted && request.id === 'TB-REQ-1028'
    ? 'Withdrawal'
    : request.type;

  const vendor = isTB1045
    ? 'Stanbic'
    : isTB1050
    ? 'Zanaco'
    : isTB1048
    ? 'MTN'
    : isTB1052
    ? 'FNB'
    : isCompleted && request.id === 'TB-REQ-1028'
    ? 'Zanaco'
    : request.vendor;

  const serviceMode = 'Cash Pickup';

  const requestedServiceTime = isTB1045
    ? 'Today, 03:00 PM'
    : isTB1050
    ? 'Now'
    : isTB1048
    ? 'Now'
    : isTB1052
    ? 'Today, 02:30 PM'
    : isCompleted && request.id === 'TB-REQ-1028'
    ? '31 Aug 2026, 11:30 AM'
    : request.serviceTime || 'Now';

  const createdTime = isTB1045
    ? 'Today, 11:20 AM'
    : isTB1050
    ? 'Today, 11:35 AM'
    : isTB1048
    ? 'Today, 11:42 AM'
    : isTB1052
    ? 'Today, 11:52 AM'
    : isCompleted && request.id === 'TB-REQ-1028'
    ? '31 Aug 2026, 09:05 AM'
    : request.createdAt || 'Today, 11:20 AM';

  const pickupLocation = isTB1045
    ? 'Crossroads Shopping Mall, Leopard Hill Road, Lusaka'
    : isTB1050
    ? 'Manda Hill Mall, Lusaka'
    : isTB1048
    ? 'Woodlands Shopping Mall, Lusaka'
    : isTB1052
    ? 'Arcades Shopping Centre, Great East Road, Lusaka'
    : isCompleted && request.id === 'TB-REQ-1028'
    ? 'Cairo Road Shopping Centre, Lusaka'
    : request.pickupLocation || 'Crossroads Shopping Mall, Leopard Hill Road, Lusaka';

  // Agent Info
  const hasAgent = isTB1045 || isTB1050 || isTB1048 || isCompleted || !!request.agentName;

  const agentName = isTB1045
    ? 'Faith Mwewa'
    : isTB1050
    ? 'Natasha Zulu'
    : isTB1048
    ? 'Kelvin Phiri'
    : isCompleted
    ? (request.agentName || 'Joseph Kaunda')
    : (request.agentName || 'Kelvin Phiri');

  const agentId = isTB1045
    ? 'TB-AGT-1050'
    : isTB1050
    ? 'TB-AGT-1062'
    : isTB1048
    ? 'TB-AGT-1024'
    : isCompleted
    ? (request.agentId || 'TB-AGT-1064')
    : (request.agentId || 'TB-AGT-1024');

  const agentInitials = agentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const agentMobile = isTB1045
    ? '+260 97 456 7890'
    : isTB1050
    ? '+260 97 556 7890'
    : isTB1048
    ? '+260 97 234 5678'
    : isCompleted
    ? (request.agentPhone || '+260 97 123 4567')
    : (request.agentPhone || '+260 97 234 5678');

  const businessName = isCompleted
    ? (request.businessName || 'Lusaka Central Express Agency')
    : (request.businessName || 'Lusaka Central Express Agency');

  const businessId = request.businessId || 'BIZ-LUS-001';

  // Navigation handlers
  const handleViewCustomer = () => {
    onClose();
    navigate(`/super-admin/people/customers?id=${customerId}`);
  };

  const handleViewAgent = () => {
    onClose();
    navigate(`/super-admin/people/agents?id=${agentId}`);
  };

  const handleViewBusiness = () => {
    onClose();
    navigate('/super-admin/people/businesses?id=BIZ-LUS-001');
  };

  return (
    <div
      id="live-request-details-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-live-request-title"
    >
      {/* Dimmed Page Background Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-full sm:w-[540px] md:w-[560px] lg:w-[580px] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 border-l border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================================================================= */}
          {/* DRAWER HEADER (Fixed, Sticky) */}
          {/* ================================================================= */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
                <Radio size={18} />
              </div>
              <div>
                <h2 id="drawer-live-request-title" className="text-base font-bold text-gray-900">
                  {drawerTitle}
                </h2>
                <div className="font-mono text-xs font-semibold text-gray-500 mt-0.5">
                  {reference}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Check size={12} className="text-emerald-700" />
                  Completed
                </span>
              ) : isCancelled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Cancelled
                </span>
              ) : isNoAgent ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  No Agent Available
                </span>
              ) : isTB1045 ? (
                /* Purple Pending Confirmation Badge */
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                  Pending Confirmation
                </span>
              ) : isTB1050 ? (
                /* Blue Active Service Badge */
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Active Service
                </span>
              ) : isTB1048 ? (
                /* Cyan Agent Confirmed Badge */
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA]" />
                  Agent Confirmed
                </span>
              ) : (
                /* Orange Finding an Agent Badge */
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Finding an Agent
                </span>
              )}

              {/* X Close Button */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* DRAWER BODY (Vertically Scrollable) */}
          {/* ================================================================= */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-gray-700">
            {/* ------------------------------------------------------------- */}
            {/* 1. REQUEST SUMMARY */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Request Summary
              </h3>
              <div className="p-4 bg-gray-50 border border-gray-200/90 rounded-xl space-y-3">
                {/* Transaction Amount (Operational transaction principal, not wallet debit/credit) */}
                <div className="border-b border-gray-200/70 pb-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Transaction Amount
                  </span>
                  <div className="text-xl font-mono font-bold text-gray-900 mt-0.5">
                    {formatZMW(transactionAmount)}
                  </div>
                </div>

                {/* 2-Column Summary Grid */}
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

                  <div className="col-span-2 border-t border-gray-200/60 pt-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Created
                    </span>
                    <span className="font-mono text-xs font-medium text-gray-700">
                      {createdTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 2. CUSTOMER INFORMATION */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Customer Information
                </h3>
                {/* Compact View Customer Button */}
                <button
                  type="button"
                  onClick={handleViewCustomer}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                  title="View Customer Profile"
                >
                  <User size={12} />
                  <span>View Customer</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5">
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
                  <span className="font-mono font-semibold text-gray-900">{customerMobile}</span>
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

            {/* ------------------------------------------------------------- */}
            {/* 3. PICKUP INFORMATION */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Pickup Information
              </h3>
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5">
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

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100 text-xs">
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

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Location Source:</span>
                  <span className="font-medium text-gray-800">Customer-selected location</span>
                </div>

                {isTB1045 && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
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
                        Today, 03:04 PM
                      </span>
                    </div>
                  </div>
                )}

                {isTB1050 && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
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
                        Today, 11:48 AM
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 4. TRANSACTION INFORMATION */}
            {/* ------------------------------------------------------------- */}
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
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 5. AUTOMATED MATCHING STATUS */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Automated Matching
              </h3>
              <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-3 text-xs">
                {isTB1045 || isTB1050 || isTB1048 ? (
                  /* Matched Status for Pending Confirmation, Active Service & Agent Confirmed */
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Matching Reference
                        </span>
                        <span className="font-mono font-bold text-gray-900 text-xs mt-0.5 block">
                          {isTB1045
                            ? 'TB-MAT-1045'
                            : isTB1050
                            ? 'TB-MAT-1050'
                            : 'TB-MAT-1048'}
                        </span>
                      </div>

                      {/* Green "Matched" Status Badge */}
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
                          {isTB1045
                            ? 'Today, 11:22 AM'
                            : isTB1050
                            ? 'Today, 11:36 AM'
                            : 'Today, 11:43 AM'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Searching Status for Finding an Agent */
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Matching Reference
                        </span>
                        <span className="font-mono font-bold text-gray-900 text-xs mt-0.5 block">
                          TB-MAT-1052
                        </span>
                      </div>

                      {/* Orange "Searching" Badge with subtle animated activity indicator */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        Searching
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-[11px] font-medium">
                        Eligible Agent Requirements:
                      </span>
                      <span className="font-semibold text-gray-800 mt-0.5 block leading-relaxed">
                        Checked In &bull; Available &bull; Vendor Eligible &bull; Within Service Area
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                      <div>
                        <span className="text-gray-500 block text-[11px]">Matched Agent:</span>
                        <span className="font-medium text-gray-600 mt-0.5 block">Not yet matched</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">Matched Business:</span>
                        <span className="font-medium text-gray-600 mt-0.5 block">Not yet matched</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-gray-500 font-medium">Current Matching Round:</span>
                      <span className="font-mono font-bold text-gray-900">1</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* AGENT & BUSINESS SECTIONS: CONFIRMED AGENT, MATCHED BUSINESS  */}
            {/* ------------------------------------------------------------- */}
            {(isTB1045 || isTB1050 || isTB1048) && (
              <>
                {/* 6. CONFIRMED AGENT */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Confirmed Agent
                    </h3>
                    {/* Compact View Agent Button */}
                    <button
                      type="button"
                      onClick={handleViewAgent}
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
                        <div className="font-mono text-xs font-semibold text-gray-500">
                          {agentId}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Mobile Number:</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {agentMobile}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Attendance:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Checked In
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Availability:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          On Active Request
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Current Activity:</span>
                        <span className="font-semibold text-gray-900">Pickup</span>
                      </div>

                      {isTB1045 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Agent Arrival:</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check size={11} />
                            Confirmed
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">
                            {isTB1050 ? 'Agent Confirmation:' : 'Confirmation:'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-[#0D93AA] border border-cyan-200">
                            <Check size={11} />
                            {isTB1050 ? 'Confirmed' : 'Accepted'}
                          </span>
                        </div>
                      )}

                      {!isTB1045 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Matched At:</span>
                          <span className="font-mono font-medium text-gray-700">
                            {isTB1050 ? 'Today, 11:36 AM' : 'Today, 11:43 AM'}
                          </span>
                        </div>
                      )}

                      {isTB1050 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Arrived At Pickup:</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check size={11} />
                            Today, 11:48 AM
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 7. MATCHED BUSINESS */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Matched Business
                    </h3>
                    {/* Compact View Business Button */}
                    <button
                      type="button"
                      onClick={handleViewBusiness}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/70 hover:bg-cyan-100/80 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                      title="View Business Profile"
                    >
                      <Building2 size={12} />
                      <span>View Business</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>

                  <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Business Name:</span>
                      <span className="font-semibold text-gray-900 text-right">
                        Lusaka Central Express Agency
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Business ID:</span>
                      <span className="font-mono font-semibold text-gray-900">BIZ-LUS-001</span>
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

                {/* 8. COMPLETION CONFIRMATION (for TB-REQ-1045) OR SERVICE PROGRESS (for TB-1050/1048) */}
                {isTB1045 ? (
                  /* Prominent Completion Confirmation Section for TB-REQ-1045 */
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Completion Confirmation
                    </h3>
                    <div className="p-3.5 bg-white border border-purple-200/80 rounded-xl space-y-3 text-xs shadow-2xs">
                      {/* Current Stage */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Current Stage:</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                          Pending Confirmation
                        </span>
                      </div>

                      {/* Agent Completion Confirmation */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">
                          Agent Completion Confirmation:
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check size={11} />
                          Confirmed
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Agent Confirmed At:</span>
                        <span className="font-mono font-medium text-gray-700">Today, 03:16 PM</span>
                      </div>

                      {/* Customer Completion Confirmation */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-500 font-medium">
                          Customer Completion Confirmation:
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending
                        </span>
                      </div>

                      {/* Transaction Completion */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Transaction Completion:</span>
                        <span className="font-semibold text-purple-900">
                          Waiting for Customer Confirmation
                        </span>
                      </div>

                      {/* Compact Current-State Notice */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="p-2.5 bg-purple-50/80 border border-purple-200/80 rounded-lg flex items-center gap-2 text-purple-900">
                          <Clock size={14} className="text-purple-600 shrink-0" />
                          <span className="font-semibold text-xs">
                            Waiting for customer confirmation
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Service Progress for TB-1050 and TB-1048 */
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Service Progress
                    </h3>
                    <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 text-xs">
                      {isTB1050 ? (
                        /* Active Service Progress Structure */
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Current Stage:</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                              Active Service
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Agent Arrival:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check size={11} />
                              Confirmed
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Agent Location:</span>
                            <span className="font-semibold text-gray-900">At Pickup Location</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Customer Present:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check size={11} />
                              Confirmed
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Agent Present:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check size={11} />
                              Confirmed
                            </span>
                          </div>

                          <div className="pt-2 border-t border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 font-medium">
                                Customer Completion Confirmation:
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Pending
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 font-medium">
                                Agent Completion Confirmation:
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Pending
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 font-medium">
                                Transaction Completion:
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Pending
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Agent Confirmed Progress Structure */
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Current Stage:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA]" />
                              Agent Confirmed
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Estimated Arrival:</span>
                            <span className="font-semibold text-gray-900">18 minutes</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Distance to Pickup:</span>
                            <span className="font-semibold text-gray-900">3.2 km</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Agent Location Updated:</span>
                            <span className="font-mono font-medium text-gray-700">Today, 11:45 AM</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Customer Confirmation:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Agent Confirmation:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check size={11} />
                              Confirmed
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ------------------------------------------------------------- */}
            {/* REQUEST LIFECYCLE */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Request Lifecycle
              </h3>
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                {isTB1045 ? (
                  /* 8-Step Lifecycle for Pending Confirmation */
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:20 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Bwalya Mwansa — Customer
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Cash Pickup deposit request created.
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:20 AM</span>
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:22 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Faith Mwewa — Agent
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:22 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Faith Mwewa confirmed as the automatically matched agent.
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 03:04 PM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Faith Mwewa — Agent
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 03:05 PM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: TellerBud Operations System
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Customer and Agent started the Cash Pickup transaction.
                        </p>
                      </div>
                    </div>

                    {/* Step 7: Agent Confirmation Received */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-slate-600" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">
                            7. Agent Confirmation Received
                          </span>
                          <span className="font-mono text-[11px] text-gray-500">Today, 03:16 PM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Faith Mwewa — Agent
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Agent confirmed completion from the Agent application.
                        </p>
                      </div>
                    </div>

                    {/* Step 8: Pending Customer Confirmation (Current Active Step - Purple styling) */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-purple-100">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      </div>
                      <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-lg space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-purple-900">
                            8. Pending Customer Confirmation
                          </span>
                          <span className="font-semibold text-[11px] text-purple-800 bg-purple-100/80 px-1.5 py-0.2 rounded">
                            Current
                          </span>
                        </div>
                        <div className="text-[11px] text-purple-800 font-medium">
                          Actor: TellerBud Operations System
                        </div>
                        <p className="text-[11px] text-purple-950 mt-0.5">
                          Waiting for Bwalya Mwansa to confirm completion.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isTB1050 ? (
                  /* 6-Step Lifecycle for Active Service */
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:35 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Grace Tembo — Customer
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Cash Pickup purchase request created.
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:35 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Automated search started for eligible nearby agents.
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:36 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Natasha Zulu — Agent
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Agent accepted the Cash Pickup request.
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:36 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Natasha Zulu confirmed as the automatically matched agent.
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:48 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Natasha Zulu — Agent
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Agent confirmed arrival at the pickup location.
                        </p>
                      </div>
                    </div>

                    {/* Step 6: Active Service (Current Active Step - Blue styling) */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-blue-100">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      </div>
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-blue-900">6. Active Service</span>
                          <span className="font-semibold text-[11px] text-blue-800 bg-blue-100/80 px-1.5 py-0.2 rounded">
                            Current
                          </span>
                        </div>
                        <div className="text-[11px] text-blue-800 font-medium">
                          Actor: TellerBud Operations System
                        </div>
                        <p className="text-[11px] text-blue-950 mt-0.5">
                          Customer and agent are completing the pickup transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isTB1048 ? (
                  /* 5-Step Lifecycle for Agent Confirmed */
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:42 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Ruth Banda — Customer
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:42 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Automated search started for eligible nearby agents.
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Eligible Agent Identified */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-slate-600" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">
                            3. Eligible Agent Identified
                          </span>
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:43 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Kelvin Phiri identified as an eligible checked-in agent.
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Agent Accepted */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-slate-600" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">4. Agent Accepted</span>
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:43 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Kelvin Phiri — Agent
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Agent accepted the Cash Pickup request.
                        </p>
                      </div>
                    </div>

                    {/* Step 5: Agent Confirmed (Current Active Step - Cyan styling) */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#0D93AA] text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-cyan-100">
                        <Check size={11} className="text-white" />
                      </div>
                      <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-lg space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#0D93AA]">5. Agent Confirmed</span>
                          <span className="font-semibold text-[11px] text-[#0D93AA] bg-cyan-100/80 px-1.5 py-0.2 rounded">
                            Current
                          </span>
                        </div>
                        <div className="text-[11px] text-cyan-900 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-cyan-950 mt-0.5">
                          Kelvin Phiri confirmed as the automatically matched agent.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 4-Step Lifecycle for Finding an Agent */
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:52 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: Mwamba Mulenga — Customer
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Cash Pickup deposit request created.
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
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:52 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Automated search started for eligible nearby agents.
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Eligible Agents Evaluated */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-slate-600" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">
                            3. Eligible Agents Evaluated
                          </span>
                          <span className="font-mono text-[11px] text-gray-500">Today, 11:53 AM</span>
                        </div>
                        <div className="text-[11px] text-gray-600 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Checked-in and eligible agents evaluated.
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Finding an Agent (Active Step - Orange current-state styling only) */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-amber-100">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      </div>
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-900">
                            4. Finding an Agent
                          </span>
                          <span className="font-semibold text-[11px] text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                            Current
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium">
                          Actor: TellerBud Matching Engine
                        </div>
                        <p className="text-[11px] text-amber-900 mt-0.5">
                          Waiting for an eligible agent to accept the request.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SYSTEM INFORMATION */}
            {/* ------------------------------------------------------------- */}
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
                  <span className="font-mono font-medium text-gray-700">
                    {isCompleted
                      ? '31 Aug 2026, 11:50 AM'
                      : isTB1045
                      ? 'Today, 03:16 PM'
                      : isTB1050
                      ? 'Today, 11:49 AM'
                      : isTB1048
                      ? 'Today, 11:45 AM'
                      : 'Today, 11:53 AM'}
                  </span>
                </div>
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
              id="drawer-footer-close-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
