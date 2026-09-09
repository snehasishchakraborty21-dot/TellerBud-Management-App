import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  MoreVertical,
  Activity,
  FileText,
  User,
  MapPin,
  Globe,
  ExternalLink,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  X,
  Send,
  AlertTriangle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { businessService } from '../services/businessService';
import {
  BusinessRecord,
  BusinessAccountStatus,
  ContextualAgent,
  WalletTopUpItem,
  WalletLedgerEntry,
  BusinessActivityLog,
} from '../types/business';

type TabKey =
  | 'overview'
  | 'agents'
  | 'wallet'
  | 'topups'
  | 'activity'
  | 'account';

function formatZMW(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const BusinessDetailsPage: React.FC = () => {
  const { id, businessId } = useParams<{ id?: string; businessId?: string }>();
  const activeId = id || businessId || '';
  const navigate = useNavigate();
  const location = useLocation();

  const [business, setBusiness] = useState<BusinessRecord | undefined>(() =>
    businessService.getBusinessById(activeId)
  );
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Modals & Action States
  const [selectedAgent, setSelectedAgent] = useState<ContextualAgent | null>(null);
  const [selectedTopUp, setSelectedTopUp] = useState<WalletTopUpItem | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<BusinessActivityLog | null>(null);

  // Administrative Action Dialog
  const [adminActionType, setAdminActionType] = useState<
    'suspend' | 'activate' | 'reset-password' | null
  >(null);
  const [adminReason, setAdminReason] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const b = businessService.getBusinessById(activeId);
      setBusiness(b);
    };
    update();
    const unsub = businessService.subscribe(update);
    return () => unsub();
  }, [activeId]);

  const handleBack = () => {
    // Preserve any state passed in from the list view (filters, sorting, pagination)
    if (location.state && (location.state as any).from) {
      navigate((location.state as any).from, { state: location.state });
    } else {
      navigate('/super-admin/people/businesses', { state: location.state });
    }
  };

  const handleExecuteAdminAction = () => {
    if (!business || !adminActionType) return;

    if (adminActionType === 'suspend') {
      businessService.updateBusinessStatus(business.id, 'Suspended', adminReason);
      setActionSuccessMsg('Business account has been suspended.');
    } else if (adminActionType === 'activate') {
      businessService.updateBusinessStatus(business.id, 'Active', adminReason);
      setActionSuccessMsg('Business account has been activated.');
    } else if (adminActionType === 'reset-password') {
      businessService.resetOwnerPassword(business.id, adminReason);
      setActionSuccessMsg('Temporary password flag set. Business Owner must reset credentials on next sign-in.');
    }

    setAdminActionType(null);
    setAdminReason('');
    setIsActionsMenuOpen(false);

    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 5000);
  };

  // If business is not found
  if (!business) {
    return (
      <div className="w-full min-h-[600px] flex flex-col items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <Building2 size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">
            The business with ID <span className="font-mono font-semibold text-gray-800">{activeId}</span> could not be located in the system records.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0D93AA] text-white text-sm font-semibold rounded-xl hover:bg-[#0B7D91] transition-colors cursor-pointer w-full"
          >
            <ArrowLeft size={16} />
            Back to Businesses
          </button>
        </div>
      </div>
    );
  }

  const statusBadgeColor =
    business.status === 'Active'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : business.status === 'Pending'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-16">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-medium border border-emerald-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-300" />
          <span>{actionSuccessMsg}</span>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="ml-2 text-emerald-300 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Page Container: Full Available Width */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* Navigation Bar: Back button */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0D93AA] transition-colors cursor-pointer py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            <span>Back to Businesses</span>
          </button>
        </div>

        {/* Business Header Banner Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Identity & Badges */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-xl flex items-center justify-center shrink-0 border border-[#0D93AA]/25 shadow-inner">
                {business.logoInitials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#102025] tracking-tight">
                    {business.name}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusBadgeColor}`}
                  >
                    {business.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-500 mt-1">
                  <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-xs">
                    {business.id}
                  </span>
                  <span>•</span>
                  <span>PACRA: {business.registrationNumber}</span>
                  <span>•</span>
                  <span>Registered: {business.registeredDate}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions Dropdown Menu */}
            <div className="relative self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={() => setIsActionsMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
              >
                <span>Account Actions</span>
                <MoreVertical size={16} className="text-slate-500" />
              </button>

              {isActionsMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsActionsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-xs sm:text-sm divide-y divide-slate-100">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          setAdminActionType('reset-password');
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <KeyRound size={15} className="text-amber-600" />
                        <span>Reset Owner Password</span>
                      </button>
                    </div>
                    <div className="py-1">
                      {business.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsActionsMenuOpen(false);
                            setAdminActionType('suspend');
                          }}
                          className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <AlertTriangle size={15} className="text-rose-600" />
                          <span>Suspend Business</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsActionsMenuOpen(false);
                            setAdminActionType('activate');
                          }}
                          className="w-full text-left px-4 py-2 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          <span>Activate Business</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Full-width Horizontal Tabs */}
          <div className="mt-6 pt-2 border-t border-slate-100 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#0D93AA] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('agents')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'agents'
                  ? 'bg-[#0D93AA] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Associated Agents</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'agents'
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {business.associatedAgents}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-[#0D93AA] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Shared Wallet
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('topups')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'topups'
                  ? 'bg-[#0D93AA] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Wallet Top-Ups</span>
              {business.pendingTopUps > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                  {business.pendingTopUps}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-[#0D93AA] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Activity
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-[#0D93AA] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Account & Access
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW TAB                                       */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Compact KPI Cards (Exact Values Matching List) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Associated Agents
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {business.associatedAgents}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Agents Online
                </div>
                <div className="text-xl font-extrabold text-emerald-600">
                  {business.agentsOnline}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Shared Wallet
                </div>
                <div className="text-base sm:text-lg font-mono font-extrabold text-slate-900 truncate">
                  {formatZMW(business.sharedWalletBalance)}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Available Balance
                </div>
                <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-700 truncate">
                  {formatZMW(business.availableBalance)}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Reserved Funds
                </div>
                <div className="text-base sm:text-lg font-mono font-extrabold text-amber-700 truncate">
                  {formatZMW(business.reservedFunds)}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pending Top-Ups
                </div>
                <div className="text-xl font-extrabold text-amber-600">
                  {business.pendingTopUps}
                </div>
              </div>
            </div>

            {/* Responsive Main Information Cards (Two-Column Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Business Information Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <Building2 size={18} className="text-[#0D93AA]" />
                  <h3 className="font-bold text-base text-gray-900">Business Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">Business Name</span>
                    <span className="font-semibold text-gray-900">{business.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">Business ID</span>
                    <span className="font-mono font-semibold text-gray-900">{business.id}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">Business Type</span>
                    <span className="font-semibold text-gray-900">{business.businessType}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">PACRA Registration</span>
                    <span className="font-mono font-semibold text-gray-900">{business.registrationNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">Registration Date</span>
                    <span className="font-semibold text-gray-900">{business.registeredDate}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">Account Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${statusBadgeColor}`}>
                      {business.status}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block text-xs mb-0.5">Street Address</span>
                    <span className="font-semibold text-gray-900">{business.streetAddress}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">City</span>
                    <span className="font-semibold text-gray-900">{business.city}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">Province</span>
                    <span className="font-semibold text-gray-900">{business.province}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">Country</span>
                    <span className="font-semibold text-gray-900">{business.country}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs mb-0.5">Operating Currency</span>
                    <span className="font-semibold text-gray-900">{business.operatingCurrency}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block text-xs mb-0.5">Time Zone</span>
                    <span className="font-semibold text-gray-900">{business.timeZone}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Business Owner & Operational Summary */}
              <div className="space-y-6">
                
                {/* Business Owner Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                    <User size={18} className="text-[#0D93AA]" />
                    <h3 className="font-bold text-base text-gray-900">Business Owner</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Owner Full Name</span>
                      <span className="font-semibold text-gray-900">{business.ownerName}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Business Owner ID</span>
                      <span className="font-mono font-semibold text-gray-900">{business.ownerId}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Mobile Number (Protected)</span>
                      <span className="font-mono font-semibold text-gray-900">{business.ownerPhoneMasked}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Username</span>
                      <span className="font-mono font-semibold text-gray-900">{business.ownerUsername}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Owner Account Status</span>
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {business.ownerAccountStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">Last Successful Sign-In</span>
                      <span className="font-semibold text-gray-900">{business.lastSignIn}</span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block text-xs mb-0.5">First-Login Password Status</span>
                      <span className="font-semibold text-gray-800">
                        {business.firstLoginPasswordChangeStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operational Summary Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                    <Activity size={18} className="text-[#0D93AA]" />
                    <h3 className="font-bold text-base text-gray-900">Operational Summary</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block text-[11px] font-bold uppercase">Total Agents</span>
                      <span className="text-base font-bold text-gray-900">{business.associatedAgents}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block text-[11px] font-bold uppercase">Online</span>
                      <span className="text-base font-bold text-emerald-600">{business.agentsOnline}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block text-[11px] font-bold uppercase">Offline</span>
                      <span className="text-base font-bold text-slate-600">{business.agentsOffline}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block text-[11px] font-bold uppercase">Assigned</span>
                      <span className="text-base font-bold text-blue-600">{business.agentsAssigned}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block text-[11px] font-bold uppercase">Available</span>
                      <span className="text-base font-bold text-emerald-600">{business.agentsAvailable}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block text-[11px] font-bold uppercase">Last Activity</span>
                      <span className="text-xs font-semibold text-gray-900 truncate block mt-0.5">{business.lastActivity}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ASSOCIATED AGENTS TAB                              */}
        {/* ========================================================= */}
        {activeTab === 'agents' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">Associated Agents</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contextual agency workforce operating under {business.name}.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {business.associatedAgents} Registered
              </span>
            </div>

            {business.contextualAgents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No agents currently associated with this business account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 text-slate-600 border-b border-gray-100 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Agent</th>
                      <th className="py-3 px-4">Agent ID</th>
                      <th className="py-3 px-4">Masked Mobile</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4">Assignment State</th>
                      <th className="py-3 px-4">Last Activity</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {business.contextualAgents.map((agt) => {
                      const availColor =
                        agt.availability === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : agt.availability === 'Assigned'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200';

                      return (
                        <tr key={agt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-gray-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                                {agt.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <span>{agt.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                            {agt.id}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {agt.phoneMasked}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full border ${availColor}`}>
                              {agt.availability}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {agt.assignment || 'Unassigned'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs">
                            {agt.lastActivity}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedAgent(agt)}
                              className="px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
                            >
                              View Agent Info
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SHARED WALLET TAB                                  */}
        {/* ========================================================= */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Top Balance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Shared Wallet Balance
                  </span>
                  <Wallet size={18} className="text-[#0D93AA]" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-slate-900">
                  {formatZMW(business.sharedWalletBalance)}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-600">{business.walletState}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Available Balance
                  </span>
                  <ArrowDownLeft size={18} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-emerald-700">
                  {formatZMW(business.availableBalance)}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span>Last Wallet Activity:</span>
                  <span className="font-medium text-slate-600">{business.lastWalletActivity}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Reserved Funds
                  </span>
                  <Lock size={18} className="text-amber-600" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-amber-700">
                  {formatZMW(business.reservedFunds)}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span>Formula verified:</span>
                  <span className="font-mono text-[11px] text-slate-600">Available + Reserved = Total</span>
                </div>
              </div>
            </div>

            {/* Recent Ledger Entries */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Recent Ledger Entries</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable financial transaction ledger for {business.name}.
                  </p>
                </div>
              </div>

              {business.recentLedgerEntries.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No ledger entries recorded for this wallet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50/80 text-slate-600 border-b border-gray-100 font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Transaction Type</th>
                        <th className="py-3 px-4 text-right">Amount (ZMW)</th>
                        <th className="py-3 px-4 text-right">Running Balance</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {business.recentLedgerEntries.map((led) => {
                        const isPositive = led.amount > 0;
                        return (
                          <tr key={led.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-600">
                              {led.timestamp}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                              {led.reference}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              {led.transactionType}
                            </td>
                            <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                              isPositive ? 'text-emerald-600' : 'text-slate-800'
                            }`}>
                              {isPositive ? `+${formatZMW(led.amount)}` : formatZMW(led.amount)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                              {formatZMW(led.runningBalance)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {led.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: WALLET TOP-UPS TAB                                 */}
        {/* ========================================================= */}
        {activeTab === 'topups' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">Agent Wallet Top-Up Requests</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top-up requests submitted by registered agents for this business.
                </p>
              </div>
              <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                {business.pendingTopUps} Pending Review
              </div>
            </div>

            {business.walletTopUpsList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No wallet top-up requests on record.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 text-slate-600 border-b border-gray-100 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Requesting Agent</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4">Updated</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {business.walletTopUpsList.map((top) => {
                      const isPending = top.status === 'Pending Review';
                      return (
                        <tr key={top.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {top.reference}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900">{top.agentName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{top.agentId}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">
                            {top.submittedAt}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">
                            {top.updatedAt}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full border ${
                                isPending
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {top.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedTopUp(top)}
                              className="px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
                            >
                              {isPending ? 'Review Request' : 'View Request'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ACTIVITY TAB                                       */}
        {/* ========================================================= */}
        {activeTab === 'activity' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">Activity Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audited events and operational actions recorded for {business.name}.
                </p>
              </div>
            </div>

            {business.activityLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No activity records available for this business.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 text-slate-600 border-b border-gray-100 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Activity Reference</th>
                      <th className="py-3 px-4">Activity Type</th>
                      <th className="py-3 px-4">Acting Actor</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Related Record</th>
                      <th className="py-3 px-4 text-right">View Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {business.activityLogs.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {act.reference}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          {act.activityType}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {act.actor}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {act.timestamp}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {act.result}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                          {act.relatedRecord}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedActivity(act)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ACCOUNT & ACCESS TAB                               */}
        {/* ========================================================= */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-6">
                <Shield size={20} className="text-[#0D93AA]" />
                <div>
                  <h3 className="font-bold text-base text-gray-900">Account Credentials & Access Control</h3>
                  <p className="text-xs text-slate-500">
                    Security status, login parameters and administrative management.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-xs font-bold uppercase mb-1">
                    Business Account Status
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${statusBadgeColor}`}>
                    {business.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-xs font-bold uppercase mb-1">
                    Business Owner Account Status
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {business.ownerAccountStatus}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-xs font-bold uppercase mb-1">
                    Username
                  </span>
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    {business.ownerUsername}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-xs font-bold uppercase mb-1">
                    Last Successful Sign-In
                  </span>
                  <span className="font-semibold text-gray-900">
                    {business.lastSignIn}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-xs font-bold uppercase mb-1">
                    Temporary Password Status
                  </span>
                  <span className="font-semibold text-gray-900">
                    {business.temporaryPasswordStatus}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-xs font-bold uppercase mb-1">
                    Password Change Required
                  </span>
                  <span className={`font-bold ${business.passwordChangeRequired ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {business.passwordChangeRequired ? 'Yes (First Login)' : 'No'}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-xs font-bold uppercase mb-1">
                    Account Creation Date
                  </span>
                  <span className="font-semibold text-gray-900">
                    {business.accountCreatedAt}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-slate-500 block text-xs font-bold uppercase mb-1">
                    Last Account Update
                  </span>
                  <span className="font-semibold text-gray-900">
                    {business.lastAccountUpdate}
                  </span>
                </div>
              </div>

              {/* Administrative Action Triggers */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Sensitive Administrative Controls
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setAdminActionType('reset-password')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <KeyRound size={15} />
                    <span>Issue Temporary Password Reset</span>
                  </button>

                  {business.status === 'Active' ? (
                    <button
                      type="button"
                      onClick={() => setAdminActionType('suspend')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <AlertTriangle size={15} />
                      <span>Suspend Business Account</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAdminActionType('activate')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={15} />
                      <span>Activate Business Account</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* CONTEXTUAL AGENT INFO MODAL                               */}
      {/* ========================================================= */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-xs flex items-center justify-center">
                  {selectedAgent.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    {selectedAgent.name}
                  </h3>
                  <span className="font-mono text-xs text-slate-500">
                    {selectedAgent.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Protected Mobile</span>
                <span className="font-mono font-semibold text-slate-900">{selectedAgent.phoneMasked}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Availability</span>
                <span className="font-bold text-emerald-700">{selectedAgent.availability}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Assignment State</span>
                <span className="font-semibold text-slate-900">{selectedAgent.assignment || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Last Activity</span>
                <span className="font-semibold text-slate-900">{selectedAgent.lastActivity}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Associated Agency</span>
                <span className="font-semibold text-slate-900">{business.name}</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* WALLET TOP-UP REVIEW MODAL                                */}
      {/* ========================================================= */}
      {selectedTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-[#0D93AA]" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Agent Top-Up Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTopUp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono font-bold text-slate-900">{selectedTopUp.reference}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Requesting Agent</span>
                <span className="font-semibold text-slate-900">{selectedTopUp.agentName} ({selectedTopUp.agentId})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Submitted</span>
                <span className="font-semibold text-slate-900">{selectedTopUp.submittedAt}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-amber-600">{selectedTopUp.status}</span>
              </div>

              {/* Standard Message Only (No amount or custom text) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mt-2">
                <span className="text-slate-400 block text-[11px] font-bold uppercase mb-1">
                  Request Detail
                </span>
                <p className="text-xs text-slate-700 italic">
                  "{selectedTopUp.standardMessage}"
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTopUp(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTIVITY DETAIL MODAL                                     */}
      {/* ========================================================= */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#0D93AA]" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Activity Record Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Activity Reference</span>
                <span className="font-mono font-bold text-slate-900">{selectedActivity.reference}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Activity Type</span>
                <span className="font-semibold text-slate-900">{selectedActivity.activityType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Actor</span>
                <span className="font-semibold text-slate-900">{selectedActivity.actor}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Timestamp</span>
                <span className="font-semibold text-slate-900">{selectedActivity.timestamp}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Result</span>
                <span className="font-bold text-emerald-700">{selectedActivity.result}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Related Record</span>
                <span className="font-mono font-semibold text-slate-900">{selectedActivity.relatedRecord}</span>
              </div>

              {selectedActivity.details && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mt-2">
                  <span className="text-slate-400 block text-[11px] font-bold uppercase mb-1">
                    Audit Description
                  </span>
                  <p className="text-xs text-slate-700">
                    {selectedActivity.details}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADMINISTRATIVE ACTION CONFIRMATION DIALOG                 */}
      {/* ========================================================= */}
      {adminActionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-[#0D93AA]" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  {adminActionType === 'reset-password'
                    ? 'Issue Temporary Password Reset'
                    : adminActionType === 'suspend'
                    ? 'Confirm Account Suspension'
                    : 'Confirm Account Activation'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminActionType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              {adminActionType === 'reset-password'
                ? `You are about to flag ${business.ownerName}'s account (${business.ownerUsername}) for a temporary password reset. The owner will be required to configure new credentials upon sign-in.`
                : adminActionType === 'suspend'
                ? `Suspending ${business.name} will freeze agency operational wallet transactions and prevent agent activities until reactivated.`
                : `Activating ${business.name} will restore normal operational status and wallet capabilities.`}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Administrative Reason (Required for Audit Trail)
              </label>
              <textarea
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                placeholder="Enter regulatory, operational or support justification..."
                rows={3}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdminActionType(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAdminAction}
                disabled={!adminReason.trim()}
                className={`px-5 py-2 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer ${
                  adminActionType === 'suspend'
                    ? 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50'
                    : 'bg-[#0D93AA] hover:bg-[#0B7D91] disabled:opacity-50'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
