import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  KeyRound,
} from 'lucide-react';
import { CustomerRecord } from '../../../types/customer';
import { CustomerProfileTab } from '../../../types/customerProfile';
import { CustomerStatusBadge } from '../CustomerStatusBadge';
import { maskZambianPhone } from '../../../utils/customerUtils';

interface CustomerProfileHeaderProps {
  customer: CustomerRecord;
  activeTab: CustomerProfileTab;
  onSelectTab: (tab: CustomerProfileTab) => void;
  onBack: () => void;
  onOpenAccountAction: (actionType: 'suspend' | 'reactivate' | 'approve-kyc' | 'flag-kyc') => void;
  onOpenRecoverySupport: () => void;
  requestsCount: number;
  transactionsCount: number;
  locationsCount: number;
}

export const CustomerProfileHeader: React.FC<CustomerProfileHeaderProps> = ({
  customer,
  activeTab,
  onSelectTab,
  onBack,
  onOpenAccountAction,
  onOpenRecoverySupport,
  requestsCount,
  transactionsCount,
  locationsCount,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const tabs: { id: CustomerProfileTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: 'Requests', count: requestsCount },
    { id: 'transactions', label: 'Mobile Money Transactions', count: transactionsCount },
    { id: 'wallet', label: 'Wallet' },
    { id: 'locations', label: 'Locations', count: locationsCount },
    { id: 'security', label: 'Security & Recovery' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Back navigation button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 min-h-[40px] px-2.5 py-2 text-xs font-semibold text-gray-600 hover:text-[#0D93AA] rounded-lg transition-colors cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Customers</span>
        </button>
      </div>

      {/* 2. Primary Customer Header Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Avatar and Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-100 border border-cyan-200 text-[#0D93AA] font-bold text-xl flex items-center justify-center shadow-xs">
                {customer.avatarInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white block" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  {customer.name}
                </h1>
                <CustomerStatusBadge status={customer.accountStatus} />
                {customer.hasRecoverySupport && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <KeyRound className="w-3 h-3" />
                    Recovery Support Active
                  </span>
                )}
              </div>

              {/* Sub-details line */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500 font-mono">
                <span className="font-semibold text-gray-700">{customer.id}</span>
                <span className="text-gray-300">•</span>
                <span>{maskZambianPhone(customer.phone)}</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 font-sans text-gray-600">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {customer.city}, Zambia
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 font-sans text-gray-500">
                  <Clock className="w-3 h-3 text-gray-400" />
                  Activity: {customer.lastActivity}
                </span>
              </div>
            </div>
          </div>

          {/* Registration Date & Contextual Actions Menu */}
          <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100/80 border border-gray-200/70 rounded-md text-xs font-medium text-gray-600 select-none pointer-events-none">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>Registered: {customer.registeredDate}</span>
            </div>

            {/* Contextual Account Actions Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <span>Account Actions</span>
                <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl py-1.5 z-30 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Administrative Controls
                  </div>

                  {customer.accountStatus === 'Active' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAccountAction('suspend');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5 text-rose-600" />
                      <span>Suspend Account</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAccountAction('reactivate');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reactivate Account</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAccountAction('flag-kyc');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Flag Identity for Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAccountAction('approve-kyc');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Re-verify Identity Tier</span>
                  </button>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenRecoverySupport();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#0D93AA] font-semibold hover:bg-cyan-50/70 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#0D93AA]" />
                    <span>Initiate Recovery Support</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Horizontal Navigation Tabs */}
        <div className="mt-6 pt-2 border-t border-gray-100 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0D93AA] ${
                  isActive
                    ? 'bg-[#0D93AA] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200/80 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
