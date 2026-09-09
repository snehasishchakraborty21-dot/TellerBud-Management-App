import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Phone,
  MapPin,
  User,
  Globe2,
  CheckCircle2,
  Edit3,
  X,
  Save,
  AlertCircle,
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
import {
  BusinessProfile,
  EditableBusinessProfileFields,
  BusinessProfileValidationErrors,
} from '../types/businessProfile';
import {
  isValidZambianPhoneNumber,
  isValidEmail,
} from '../data/mockBusinessProfileData';

export const BusinessProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<BusinessProfileValidationErrors>({});

  // Accessibility refs for Edit Drawer
  const editButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Editable Form State
  const [formData, setFormData] = useState<EditableBusinessProfileFields>({
    primaryContactPerson: 'Chileshe Mwamba',
    businessPhone: '',
    businessEmail: '',
    alternativePhone: '',
    streetAddress: '',
    area: '',
    city: '',
    province: '',
  });

  // Track pristine copy for detecting changes
  const [pristineData, setPristineData] = useState<EditableBusinessProfileFields>({
    primaryContactPerson: 'Chileshe Mwamba',
    businessPhone: '',
    businessEmail: '',
    alternativePhone: '',
    streetAddress: '',
    area: '',
    city: '',
    province: '',
  });

  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id?: string }>();
  const businessId = paramId || currentUser?.businessId || 'BIZ-LUS-001';

  // Role behaviour check
  // Business Owner: Can view and edit permitted fields for their own business
  // Admin / Super Admin: Can view only
  const isBusinessOwner = currentUser?.role === 'business_owner';
  const canEditProfile = isBusinessOwner && (!paramId || paramId === currentUser?.businessId);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await adminService.getBusinessProfile(businessId);
        if (isMounted && data) {
          setProfile(data);
          const currentFields: EditableBusinessProfileFields = {
            primaryContactPerson: data.primaryContactPerson || 'Chileshe Mwamba',
            businessPhone: data.businessPhone,
            businessEmail: data.businessEmail,
            alternativePhone: data.alternativePhone || '',
            streetAddress: data.streetAddress,
            area: data.area,
            city: data.city,
            province: data.province,
          };
          setFormData(currentFields);
          setPristineData(currentFields);
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

  // Trap focus & handle Escape key for Edit Profile Drawer
  useEffect(() => {
    if (!isEditing) return;

    // Focus initial input when opened
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      // Return focus to the Edit Profile trigger button upon closing
      editButtonRef.current?.focus();
    };
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!profile || !canEditProfile) return;
    const currentFields: EditableBusinessProfileFields = {
      primaryContactPerson: profile.primaryContactPerson || 'Chileshe Mwamba',
      businessPhone: profile.businessPhone,
      businessEmail: profile.businessEmail,
      alternativePhone: profile.alternativePhone || '',
      streetAddress: profile.streetAddress,
      area: profile.area,
      city: profile.city,
      province: profile.province,
    };
    setFormData(currentFields);
    setPristineData(currentFields);
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(pristineData);
    setErrors({});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof EditableBusinessProfileFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Determine if any field has actually changed
  const hasFormChanged = (): boolean => {
    return (
      formData.primaryContactPerson.trim() !== pristineData.primaryContactPerson.trim() ||
      formData.businessPhone.trim() !== pristineData.businessPhone.trim() ||
      formData.businessEmail.trim() !== pristineData.businessEmail.trim() ||
      (formData.alternativePhone || '').trim() !== (pristineData.alternativePhone || '').trim() ||
      formData.streetAddress.trim() !== pristineData.streetAddress.trim() ||
      formData.area.trim() !== pristineData.area.trim() ||
      formData.city.trim() !== pristineData.city.trim() ||
      formData.province.trim() !== pristineData.province.trim()
    );
  };

  const validateForm = (): boolean => {
    const newErrors: BusinessProfileValidationErrors = {};

    // Primary Contact Person (Required)
    if (!formData.primaryContactPerson.trim()) {
      newErrors.primaryContactPerson = 'Primary contact person is required.';
    }

    // Business Phone (Required, Zambian format)
    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = 'Business phone number is required.';
    } else if (!isValidZambianPhoneNumber(formData.businessPhone)) {
      newErrors.businessPhone = 'Enter a valid Zambia phone number with +260 (e.g. +260 97 123 4567).';
    }

    // Business Email (Required, valid email)
    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Business email address is required.';
    } else if (!isValidEmail(formData.businessEmail)) {
      newErrors.businessEmail = 'Enter a valid email address.';
    }

    // Alternative Phone (Optional, but if entered must be valid Zambian phone)
    if (formData.alternativePhone && formData.alternativePhone.trim()) {
      if (!isValidZambianPhoneNumber(formData.alternativePhone)) {
        newErrors.alternativePhone = 'Enter a valid Zambia phone number with +260 (e.g. +260 96 789 0123).';
      }
    }

    // Street Address (Required)
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required.';
    }

    // Area or District (Required)
    if (!formData.area.trim()) {
      newErrors.area = 'Area or district is required.';
    }

    // City (Required)
    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    // Province (Required)
    if (!formData.province.trim()) {
      newErrors.province = 'Province is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !profile || !canEditProfile || !hasFormChanged()) return;

    setIsSaving(true);
    try {
      const res = await adminService.updateBusinessProfile(profile.businessId, {
        primaryContactPerson: formData.primaryContactPerson.trim(),
        businessPhone: formData.businessPhone.trim(),
        businessEmail: formData.businessEmail.trim(),
        alternativePhone: formData.alternativePhone ? formData.alternativePhone.trim() : '',
        streetAddress: formData.streetAddress.trim(),
        area: formData.area.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
      });
      if (res.success && res.profile) {
        setProfile(res.profile);
        const updatedFields: EditableBusinessProfileFields = {
          primaryContactPerson: res.profile.primaryContactPerson,
          businessPhone: res.profile.businessPhone,
          businessEmail: res.profile.businessEmail,
          alternativePhone: res.profile.alternativePhone || '',
          streetAddress: res.profile.streetAddress,
          area: res.profile.area,
          city: res.profile.city,
          province: res.profile.province,
        };
        setFormData(updatedFields);
        setPristineData(updatedFields);
        setIsEditing(false);
        setSuccessMessage('Business profile updated successfully.');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setErrors((prev) => ({
          ...prev,
          businessPhone: res.error || 'Failed to update business profile.',
        }));
      }
    } catch (err) {
      console.error('Error saving business profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="space-y-2">
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

          {/* Edit Profile Action Button */}
          {canEditProfile ? (
            <div className="shrink-0 pt-2 sm:pt-0">
              <button
                ref={editButtonRef}
                type="button"
                id="btn-edit-business-profile"
                onClick={handleStartEdit}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D93AA] hover:bg-[#0B8296] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
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

      {/* 8. Edit Profile Drawer / Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-end sm:justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="w-full sm:max-w-lg lg:max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
          >
            {/* Modal / Drawer Header */}
            <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#0D93AA] flex items-center justify-center font-bold">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 id="edit-profile-title" className="text-base font-bold text-[#102025]">
                    Edit Business Profile
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Update authorized contact and address details
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-edit-drawer"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close edit business profile drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal / Drawer Form Content */}
            <form onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Contact Details Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#102025] uppercase tracking-wider border-b border-gray-100 pb-1.5">
                  Contact Information
                </h4>

                {/* Primary Contact Person */}
                <div>
                  <label htmlFor="edit-primaryContactPerson" className="block text-xs font-semibold text-gray-700 mb-1">
                    Primary Contact Person <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    id="edit-primaryContactPerson"
                    value={formData.primaryContactPerson}
                    onChange={(e) => handleInputChange('primaryContactPerson', e.target.value)}
                    placeholder="Chileshe Mwamba"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                      errors.primaryContactPerson
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                    } focus:outline-none focus:ring-1 text-[#102025]`}
                  />
                  {errors.primaryContactPerson && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.primaryContactPerson}
                    </p>
                  )}
                </div>

                {/* Business Phone Number */}
                <div>
                  <label htmlFor="edit-businessPhone" className="block text-xs font-semibold text-gray-700 mb-1">
                    Business Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-businessPhone"
                    value={formData.businessPhone}
                    onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    placeholder="+260 97 123 4567"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border ${
                      errors.businessPhone
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                    } focus:outline-none focus:ring-1 text-[#102025]`}
                  />
                  {errors.businessPhone && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.businessPhone}
                    </p>
                  )}
                </div>

                {/* Business Email Address */}
                <div>
                  <label htmlFor="edit-businessEmail" className="block text-xs font-semibold text-gray-700 mb-1">
                    Business Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="edit-businessEmail"
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    placeholder="info@lusakacentralagency.co.zm"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                      errors.businessEmail
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                    } focus:outline-none focus:ring-1 text-[#102025]`}
                  />
                  {errors.businessEmail && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.businessEmail}
                    </p>
                  )}
                </div>

                {/* Alternative Phone Number */}
                <div>
                  <label htmlFor="edit-alternativePhone" className="block text-xs font-semibold text-gray-700 mb-1">
                    Alternative Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="edit-alternativePhone"
                    value={formData.alternativePhone || ''}
                    onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
                    placeholder="+260 96 789 0123"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border ${
                      errors.alternativePhone
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                    } focus:outline-none focus:ring-1 text-[#102025]`}
                  />
                  {errors.alternativePhone && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.alternativePhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-[#102025] uppercase tracking-wider border-b border-gray-100 pb-1.5">
                  Business Address
                </h4>

                {/* Street Address */}
                <div>
                  <label htmlFor="edit-streetAddress" className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    placeholder="Plot 4820, Cairo Road"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                      errors.streetAddress
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                    } focus:outline-none focus:ring-1 text-[#102025]`}
                  />
                  {errors.streetAddress && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.streetAddress}
                    </p>
                  )}
                </div>

                {/* Area or District */}
                <div>
                  <label htmlFor="edit-area" className="block text-xs font-semibold text-gray-700 mb-1">
                    Area or District <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-area"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder="Central Business District"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                      errors.area
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                    } focus:outline-none focus:ring-1 text-[#102025]`}
                  />
                  {errors.area && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.area}
                    </p>
                  )}
                </div>

                {/* City & Province in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-city" className="block text-xs font-semibold text-gray-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Lusaka"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                        errors.city
                          ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                          : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                      } focus:outline-none focus:ring-1 text-[#102025]`}
                    />
                    {errors.city && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="edit-province" className="block text-xs font-semibold text-gray-700 mb-1">
                      Province <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      placeholder="Lusaka Province"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                        errors.province
                          ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                          : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                      } focus:outline-none focus:ring-1 text-[#102025]`}
                    />
                    {errors.province && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.province}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country (Read-only notice) */}
                <div className="pt-1">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600">
                    <span className="font-medium">Country</span>
                    <span className="font-bold text-[#102025]">Zambia (ZM) · Read-only</span>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal / Drawer Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                id="btn-cancel-drawer"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-save-profile-drawer"
                onClick={handleSaveChanges}
                disabled={isSaving || !hasFormChanged()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0D93AA] hover:bg-[#0B8296] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProfilePage;
