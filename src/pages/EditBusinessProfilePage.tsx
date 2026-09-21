import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Upload,
  Trash2,
  AlertCircle,
  Save,
  Phone,
  MapPin,
  AlertTriangle,
  X,
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

export const EditBusinessProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams<{ id?: string }>();
  const businessId = paramId || currentUser?.businessId || 'BIZ-LUS-001';

  // Authorization check
  const isBusinessOwner = currentUser?.role === 'business_owner';
  const canEditProfile = isBusinessOwner && (!paramId || paramId === currentUser?.businessId);

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<BusinessProfileValidationErrors>({});
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<EditableBusinessProfileFields>({
    primaryContactPerson: '',
    businessPhone: '',
    businessEmail: '',
    alternativePhone: '',
    streetAddress: '',
    area: '',
    city: '',
    province: '',
    logoUrl: undefined,
  });

  // Pristine tracking to identify unsaved changes
  const [pristineData, setPristineData] = useState<EditableBusinessProfileFields>({
    primaryContactPerson: '',
    businessPhone: '',
    businessEmail: '',
    alternativePhone: '',
    streetAddress: '',
    area: '',
    city: '',
    province: '',
    logoUrl: undefined,
  });

  // Reference to first invalid input field for quick focus
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  // Return path calculation
  const getReturnPath = () => {
    if (location.pathname.includes('/people/business-profile')) {
      return '/business-owner/people/business-profile';
    }
    return '/business-owner/business-profile';
  };

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await adminService.getBusinessProfile(businessId);
        if (isMounted && data) {
          setProfile(data);
          const fields: EditableBusinessProfileFields = {
            primaryContactPerson: data.primaryContactPerson || '',
            businessPhone: data.businessPhone || '',
            businessEmail: data.businessEmail || '',
            alternativePhone: data.alternativePhone || '',
            streetAddress: data.streetAddress || '',
            area: data.area || '',
            city: data.city || '',
            province: data.province || '',
            logoUrl: data.logoUrl,
          };
          setFormData(fields);
          setPristineData(fields);
        }
      } catch (err) {
        console.error('Failed to load business profile for editing:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [businessId]);

  // Determine if any field has actually changed
  const hasFormChanged = (): boolean => {
    return (
      (formData.primaryContactPerson || '').trim() !== (pristineData.primaryContactPerson || '').trim() ||
      (formData.businessPhone || '').trim() !== (pristineData.businessPhone || '').trim() ||
      (formData.businessEmail || '').trim() !== (pristineData.businessEmail || '').trim() ||
      (formData.alternativePhone || '').trim() !== (pristineData.alternativePhone || '').trim() ||
      (formData.streetAddress || '').trim() !== (pristineData.streetAddress || '').trim() ||
      (formData.area || '').trim() !== (pristineData.area || '').trim() ||
      (formData.city || '').trim() !== (pristineData.city || '').trim() ||
      (formData.province || '').trim() !== (pristineData.province || '').trim() ||
      (formData.logoUrl || '') !== (pristineData.logoUrl || '')
    );
  };

  // Warn on browser unload if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormChanged()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  const handleInputChange = (
    field: keyof EditableBusinessProfileFields,
    value: string | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof BusinessProfileValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        logo: 'Please upload a valid image file (SVG, PNG, JPG, or WEBP).',
      }));
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: 'Logo file size must be less than 5MB.',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleInputChange('logoUrl', reader.result);
        setErrors((prev) => ({ ...prev, logo: undefined }));
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-select same file if desired
    e.target.value = '';
  };

  const validateForm = (): boolean => {
    const newErrors: BusinessProfileValidationErrors = {};

    // Primary Contact Person (Required)
    if (!formData.primaryContactPerson || !formData.primaryContactPerson.trim()) {
      newErrors.primaryContactPerson = 'Primary contact person is required.';
    }

    // Business Phone (Required, Zambian format)
    if (!formData.businessPhone || !formData.businessPhone.trim()) {
      newErrors.businessPhone = 'Business phone number is required.';
    } else if (!isValidZambianPhoneNumber(formData.businessPhone)) {
      newErrors.businessPhone =
        'Enter a valid Zambia phone number with +260 (e.g. +260 97 123 4567).';
    }

    // Business Email (Required, valid email)
    if (!formData.businessEmail || !formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Business email address is required.';
    } else if (!isValidEmail(formData.businessEmail)) {
      newErrors.businessEmail = 'Enter a valid email address.';
    }

    // Alternative Phone (Optional, but if entered must be valid Zambian phone)
    if (formData.alternativePhone && formData.alternativePhone.trim()) {
      if (!isValidZambianPhoneNumber(formData.alternativePhone)) {
        newErrors.alternativePhone =
          'Enter a valid Zambia phone number with +260 (e.g. +260 96 789 0123).';
      }
    }

    // Street Address (Required)
    if (!formData.streetAddress || !formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required.';
    }

    // Area or District (Required)
    if (!formData.area || !formData.area.trim()) {
      newErrors.area = 'Area or district is required.';
    }

    // City (Required)
    if (!formData.city || !formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    // Province (Required)
    if (!formData.province || !formData.province.trim()) {
      newErrors.province = 'Province is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBackClick = () => {
    if (hasFormChanged()) {
      setShowDiscardModal(true);
    } else {
      navigate(getReturnPath());
    }
  };

  const handleCancelClick = () => {
    if (hasFormChanged()) {
      setShowDiscardModal(true);
    } else {
      navigate(getReturnPath());
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    navigate(getReturnPath());
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm() || !profile || !canEditProfile || isSaving) return;

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
        logoUrl: formData.logoUrl,
      });

      if (res.success) {
        // Return to Business Profile page with success toast notification
        navigate(getReturnPath(), {
          state: {
            successMessage: 'Business profile updated successfully.',
          },
          replace: true,
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          businessPhone: res.error || 'Failed to update business profile.',
        }));
      }
    } catch (err) {
      console.error('Error saving business profile:', err);
      setErrors((prev) => ({
        ...prev,
        businessEmail: 'An unexpected error occurred while saving. Please try again.',
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-3 border-[#0D93AA] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-gray-600">Loading business profile...</span>
        </div>
      </div>
    );
  }

  if (!canEditProfile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
          <p className="text-sm text-gray-600">
            Only authorized Business Owners can edit authorized business profile details.
          </p>
          <button
            type="button"
            onClick={() => navigate(getReturnPath())}
            className="px-4 py-2 bg-[#0D93AA] text-white font-semibold text-xs rounded-xl hover:bg-[#0B8296] transition-colors cursor-pointer"
          >
            Return to Business Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full space-y-6 pb-20">
      {/* 1. Page Header with Title, Back Arrow, and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <button
            type="button"
            id="btn-back-to-profile"
            onClick={handleBackClick}
            className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-[#102025] hover:bg-gray-100 transition-colors cursor-pointer shrink-0 mt-0.5"
            aria-label="Back to Business Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#102025] tracking-tight">
              Edit Business Profile
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Update authorized contact and address details
            </p>
          </div>
        </div>

        {/* Cancel and Save Changes in Upper Right (wrap below title on small screens) */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            id="btn-cancel-edit-profile"
            onClick={handleCancelClick}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-save-profile"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0D93AA] hover:bg-[#0B8296] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
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

      {/* 2. Form Container using Portal's White Background, Rounded Corners, Subtle Borders */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-8">
        {/* SECTION 1: Business Logo */}
        <div className="space-y-4 pb-8 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-[#102025] uppercase tracking-wider">
              Section 1: Business Logo
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your company emblem and branding displayed across agent interfaces and receipts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
            {/* Current official business logo preview */}
            <div className="w-20 h-20 rounded-2xl border border-gray-200 bg-white p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Current official business logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                  <Building2 className="w-9 h-9 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="file-upload-logo"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-[#0D93AA]" />
                  <span>Upload Logo</span>
                  <input
                    id="file-upload-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('logoUrl', undefined)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>

              {/* Supported-format guidance */}
              <p className="text-xs text-gray-500">
                SVG, PNG, or JPG. Recommended square or landscape logo (max 5MB).
              </p>

              {errors.logo && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.logo}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Two-Column Layout on Desktop: Left = Contact Info, Right = Business Address */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* SECTION 2: Contact Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Phone className="w-4 h-4 text-[#0D93AA]" />
              <h2 className="text-sm font-bold text-[#102025] uppercase tracking-wider">
                Section 2: Contact Information
              </h2>
            </div>

            {/* Primary Contact Person */}
            <div>
              <label
                htmlFor="edit-primaryContactPerson"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Primary Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                ref={errors.primaryContactPerson ? firstErrorRef : undefined}
                type="text"
                id="edit-primaryContactPerson"
                value={formData.primaryContactPerson}
                onChange={(e) => handleInputChange('primaryContactPerson', e.target.value)}
                placeholder="e.g. Chileshe Mwamba"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.primaryContactPerson
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                } focus:outline-none focus:ring-1 text-[#102025] transition-colors`}
              />
              {errors.primaryContactPerson && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.primaryContactPerson}</span>
                </p>
              )}
            </div>

            {/* Business Phone Number */}
            <div>
              <label
                htmlFor="edit-businessPhone"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
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
                } focus:outline-none focus:ring-1 text-[#102025] transition-colors`}
              />
              <p className="text-[11px] text-gray-400 mt-1 font-mono">
                Standard Zambian format: +260 97 XXX XXXX or +260 96 XXX XXXX
              </p>
              {errors.businessPhone && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.businessPhone}</span>
                </p>
              )}
            </div>

            {/* Business Email Address */}
            <div>
              <label
                htmlFor="edit-businessEmail"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
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
                } focus:outline-none focus:ring-1 text-[#102025] transition-colors`}
              />
              {errors.businessEmail && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.businessEmail}</span>
                </p>
              )}
            </div>

            {/* Alternative Phone Number */}
            <div>
              <label
                htmlFor="edit-alternativePhone"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
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
                } focus:outline-none focus:ring-1 text-[#102025] transition-colors`}
              />
              {errors.alternativePhone && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.alternativePhone}</span>
                </p>
              )}
            </div>
          </div>

          {/* SECTION 3: Business Address */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-[#0D93AA]" />
              <h2 className="text-sm font-bold text-[#102025] uppercase tracking-wider">
                Section 3: Business Address
              </h2>
            </div>

            {/* Street Address */}
            <div>
              <label
                htmlFor="edit-streetAddress"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="edit-streetAddress"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                placeholder="Plot 4821, Cairo Road"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.streetAddress
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-gray-200 focus:ring-[#0D93AA] focus:border-[#0D93AA] bg-white'
                } focus:outline-none focus:ring-1 text-[#102025] transition-colors`}
              />
              {errors.streetAddress && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.streetAddress}</span>
                </p>
              )}
            </div>

            {/* Area or District */}
            <div>
              <label
                htmlFor="edit-area"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
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
                } focus:outline-none focus:ring-1 text-[#102025] transition-colors`}
              />
              {errors.area && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.area}</span>
                </p>
              )}
            </div>

            {/* City & Province in 2 Sub-Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-city"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
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
                  } focus:outline-none focus:ring-1 text-[#102025] transition-colors`}
                />
                {errors.city && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-province"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
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
                  } focus:outline-none focus:ring-1 text-[#102025] transition-colors`}
                />
                {errors.province && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.province}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Country (Read-only notice matching existing drawer) */}
            <div className="pt-1">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span className="font-semibold text-gray-700">Country</span>
                <span className="font-bold text-[#102025]">Zambia (ZM) · Read-only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons inside Container for convenient access on tall viewports */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-save-profile-bottom"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0D93AA] hover:bg-[#0B8296] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
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
      </form>

      {/* 3. Unsaved Changes Confirmation Modal */}
      {showDiscardModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-modal-title"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 id="discard-modal-title" className="text-base font-bold text-[#102025]">
                Discard Unsaved Changes?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                You have unsaved changes to your business profile details. If you leave now, any changes you made will be discarded.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                id="btn-keep-editing"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Keep Editing
              </button>

              <button
                type="button"
                id="btn-confirm-discard"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBusinessProfilePage;
