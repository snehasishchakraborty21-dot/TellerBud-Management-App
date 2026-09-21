import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Phone,
  MapPin,
  User,
  Globe2,
  CheckCircle2,
  Edit3,
  X,
  ShieldCheck,
  Briefcase,
  FileText,
  Calendar,
  Layers,
  Lock,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import { BusinessProfile } from '../types/businessProfile';

export const BusinessProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams<{ id?: string }>();
  const businessId = paramId || currentUser?.businessId || 'BIZ-LUS-001';

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Role behaviour check
  // Business Owner: Can view and edit permitted fields for their own business
  // Admin / Super Admin: Can view only
  const isBusinessOwner = currentUser?.role === 'business_owner';
  const canEditProfile = isBusinessOwner && (!paramId || paramId === currentUser?.businessId);

  // Check if returning from edit page with a success message
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await adminService.getBusinessProfile(businessId);
        if (isMounted && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load business profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    const unsubscribe = adminService.subscribe(loadProfile);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [businessId]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-3 border-[#0D93AA] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-gray-600">Loading business profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back to Businesses for admin portal */}
      {currentUser?.role === 'super_admin' && (
        <div className="px-4 sm:px-6 lg:px-8 pt-4 -mb-2">
          <button
            type="button"
            onClick={() => navigate('/super-admin/people/businesses')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b7e92] transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            Back to Businesses
          </button>
        </div>
      )}

      {/* Toast Notification positioned below header, centered to prevent any overlap with action buttons */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-18 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] sm:w-auto bg-white border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs sm:text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Business Summary Card (Full-width clean card at top) */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Official Business Logo Container */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-gray-200 bg-white p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={`${profile.businessName} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center"
                  title={`${profile.businessName} logo placeholder`}
                >
                  <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#102025] tracking-tight">
                  {profile.businessName}
                </h2>
                {/* Green Active status badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {profile.accountStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-medium">Business ID:</span>
                  <span className="font-mono font-bold text-[#102025]">{profile.businessId}</span>
                </div>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-medium">Category:</span>
                  <span className="font-medium text-gray-700">{profile.businessType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          {canEditProfile ? (
            <div className="shrink-0 pt-2 sm:pt-0">
              <button
                type="button"
                id="btn-edit-business-profile"
                onClick={() => {
                  const editPath = location.pathname.includes('/people/business-profile')
                    ? '/business-owner/people/business-profile/edit'
                    : '/business-owner/business-profile/edit';
                  navigate(editPath);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D93AA] hover:bg-[#0B8296] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Business Profile</span>
              </button>
            </div>
          ) : (
            <div className="shrink-0 pt-2 sm:pt-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Read Only</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Information Layout on Desktop / Balanced Columns on Tablet / Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Business Registration Information & Business Address */}
        <div className="space-y-6">
          {/* 3. Business Registration Information (Read-only) */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0D93AA]" />
                <h3 className="text-sm sm:text-base font-bold text-[#102025]">
                  Business Registration Information
                </h3>
              </div>
              <span className="text-[11px] font-medium text-gray-400">System-controlled</span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Registered Business Name</span>
                <span className="font-bold text-[#102025] text-left sm:text-right">
                  {profile.businessName}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Business ID</span>
                <span className="font-mono font-bold text-[#102025] text-left sm:text-right">
                  {profile.businessId}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Business Category</span>
                <span className="font-semibold text-gray-900 text-left sm:text-right">
                  {profile.businessType}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Registration Number (PACRA)</span>
                <span className="font-mono font-bold text-[#102025] text-left sm:text-right">
                  {profile.registrationNumber}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Date Registered</span>
                <span className="font-semibold text-[#102025] text-left sm:text-right">
                  {profile.dateRegistered}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-1">
                <span className="text-gray-500 font-medium">Business Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {profile.accountStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Business Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0D93AA]" />
                <h3 className="text-sm sm:text-base font-bold text-[#102025]">
                  Business Address
                </h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Street Address</span>
                <span className="font-semibold text-[#102025] text-left sm:text-right">
                  {profile.streetAddress}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Area or District</span>
                <span className="font-semibold text-[#102025] text-left sm:text-right">
                  {profile.area}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">City</span>
                <span className="font-semibold text-[#102025] text-left sm:text-right">
                  {profile.city}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Province</span>
                <span className="font-semibold text-[#102025] text-left sm:text-right">
                  {profile.province}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium">Country</span>
                  <span className="text-[10px] text-gray-400 font-medium">(Read-only)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#102025]">{profile.country}</span>
                  <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                    ZM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Business Contact Details, Business Owner Info, & Operational Information */}
        <div className="space-y-6">
          {/* 4. Business Contact Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0D93AA]" />
                <h3 className="text-sm sm:text-base font-bold text-[#102025]">
                  Business Contact Details
                </h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Primary Contact Person</span>
                <span className="font-bold text-[#102025] text-left sm:text-right">
                  {profile.primaryContactPerson || 'Chileshe Mwamba'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Business Phone Number</span>
                <span className="font-mono font-bold text-[#102025] text-left sm:text-right">
                  {profile.businessPhone}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Business Email Address</span>
                <span className="font-semibold text-[#102025] text-left sm:text-right">
                  {profile.businessEmail}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-1">
                <span className="text-gray-500 font-medium">Alternative Phone Number</span>
                <span className="font-mono font-semibold text-gray-700 text-left sm:text-right">
                  {profile.alternativePhone && profile.alternativePhone.trim() ? profile.alternativePhone : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Business Owner Information (Read-only) */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0D93AA]" />
                <h3 className="text-sm sm:text-base font-bold text-[#102025]">
                  Business Owner Information
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-[#0D93AA] border border-cyan-100">
                <ShieldCheck className="w-3 h-3 text-[#0D93AA]" />
                {profile.accountRole}
              </span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Owner Name</span>
                <span className="font-bold text-[#102025] text-left sm:text-right">
                  {profile.ownerName}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Owner ID</span>
                <span className="font-mono font-bold text-[#102025] text-left sm:text-right">
                  {profile.ownerId}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Owner Phone Number</span>
                <span className="font-mono font-bold text-[#102025] text-left sm:text-right">
                  {profile.ownerPhone}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-50 gap-1">
                <span className="text-gray-500 font-medium">Owner Email Address</span>
                <span className="font-semibold text-[#102025] text-left sm:text-right">
                  {profile.ownerEmail}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-1">
                <span className="text-gray-500 font-medium">Account Role</span>
                <span className="font-semibold text-gray-900 text-left sm:text-right">
                  {profile.accountRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Operational Information (Read-only counts & configuration - Full Width) */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-sm sm:text-base font-bold text-[#102025]">
              Operational Information
            </h3>
          </div>
        </div>

        {/* Responsive Grid: 5 columns on desktop (1 row), 2-3 columns on tablet, 1 column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
          <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Operating Currency
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono text-[#102025]">
                {profile.operatingCurrency}
              </span>
              <span className="text-xs text-gray-500 font-medium">Zambian Kwacha</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Time Zone
            </span>
            <div className="text-xs sm:text-sm font-bold text-[#102025]">
              {profile.timeZone}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-50/40 border border-cyan-100/80">
            <span className="text-[11px] font-bold text-[#0D93AA] uppercase tracking-wider block mb-1">
              Registered Agents
            </span>
            <div className="text-lg font-bold font-mono text-[#0D93AA]">
              {profile.registeredAgents}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100/80">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Agents Online
            </span>
            <div className="text-lg font-bold font-mono text-emerald-700">
              {profile.agentsOnline ?? profile.activeAgents}
            </div>
          </div>

          <div className="sm:col-span-2 md:col-span-1 lg:col-span-1 p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1 leading-tight">
              Business Account Creation Date
            </span>
            <div className="text-xs sm:text-sm font-semibold text-[#102025]">
              {profile.accountCreationDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
