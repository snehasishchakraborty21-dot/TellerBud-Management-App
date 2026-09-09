import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { businessService } from '../services/businessService';
import { BusinessRecord } from '../types/business';

const PROVINCES = [
  'Central',
  'Copperbelt',
  'Eastern',
  'Luapula',
  'Lusaka',
  'Muchinga',
  'Northern',
  'North-Western',
  'Southern',
  'Western',
];

const BUSINESS_TYPES = [
  'Agency',
  'Retail Store',
  'Supermarket',
  'Pharmacy',
  'Hardware',
  'General Dealer',
  'Other',
];

export const AddBusinessPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step: 1, 2, 3, 4, or 5 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Business Information
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Agency');
  const [pacraNumber, setPacraNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('Lusaka');
  const country = 'Zambia';
  const operatingCurrency = 'ZMW';
  const timeZone = 'Africa/Lusaka';

  // Step 2: Business Owner
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('+260');
  const [emailAddress, setEmailAddress] = useState('');

  // Step 3: Login Credentials
  const [username, setUsername] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors and Submission
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBusiness, setCreatedBusiness] = useState<BusinessRecord | null>(null);

  // Validation Helpers
  const validateZambianPhone = (phone: string): boolean => {
    // Normalization: clean spaces and hyphens
    const clean = phone.replace(/[\s-]/g, '');
    return /^\+260[79]\d{8}$/.test(clean);
  };

  const validatePasswordComplexity = (pwd: string) => {
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const passwordValidation = validatePasswordComplexity(temporaryPassword);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!businessName.trim()) {
      errors.businessName = 'Business Name is required.';
    } else if (!businessService.isBusinessNameUnique(businessName.trim())) {
      errors.businessName = 'A business with this name already exists.';
    }

    if (!pacraNumber.trim()) {
      errors.pacraNumber = 'PACRA Registration Number is required.';
    } else if (!businessService.isPacraUnique(pacraNumber.trim())) {
      errors.pacraNumber = 'This PACRA Registration Number is already registered.';
    }

    if (!streetAddress.trim()) {
      errors.streetAddress = 'Street Address is required.';
    }

    if (!city.trim()) {
      errors.city = 'City is required.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) {
      errors.firstName = 'First Name is required.';
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last Name is required.';
    }

    const cleanPhone = mobileNumber.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone === '+260') {
      errors.mobileNumber = 'Mobile Number is required.';
    } else if (!validateZambianPhone(cleanPhone)) {
      errors.mobileNumber = 'Mobile number must follow Zambian format (+260 followed by 9 digits, e.g. +260971234567).';
    } else if (!businessService.isPhoneUnique(cleanPhone)) {
      errors.mobileNumber = 'This mobile number is already assigned to an existing Business Owner.';
    }

    if (emailAddress.trim()) {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim());
      if (!isValidEmail) {
        errors.emailAddress = 'Please provide a valid email address.';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      errors.username = 'Username is required.';
    } else if (cleanUsername.length < 4 || cleanUsername.length > 20) {
      errors.username = 'Username must be between 4 and 20 characters.';
    } else if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      errors.username = 'Username may only contain lowercase letters, numbers, dots, underscores or hyphens.';
    } else if (!businessService.isUsernameUnique(cleanUsername)) {
      errors.username = 'This username is already taken by another Business Owner.';
    }

    if (!temporaryPassword) {
      errors.temporaryPassword = 'Temporary Password is required.';
    } else if (!isPasswordValid) {
      errors.temporaryPassword = 'Password does not meet the complexity requirements.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmation Password is required.';
    } else if (confirmPassword !== temporaryPassword) {
      errors.confirmPassword = 'Passwords do not match exactly.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setStepErrors({});
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setStepErrors({});
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setStepErrors({});
        setCurrentStep(4);
      }
    }
  };

  const handleBack = () => {
    setStepErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate('/super-admin/people/businesses');
    }
  };

  const handleCreateBusiness = async () => {
    setIsSubmitting(true);
    try {
      const cleanPhone = mobileNumber.replace(/[\s-]/g, '');
      const newBiz = businessService.createBusiness({
        name: businessName.trim(),
        businessType,
        registrationNumber: pacraNumber.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        province,
        country,
        operatingCurrency,
        timeZone,
        ownerFirstName: firstName.trim(),
        ownerLastName: lastName.trim(),
        ownerPhone: cleanPhone,
        ownerEmail: emailAddress.trim() || undefined,
        ownerUsername: username.trim().toLowerCase(),
        temporaryPassword,
        requirePasswordChange,
      });

      setCreatedBusiness(newBiz);
      setCurrentStep(5); // Success step
    } catch (err: any) {
      setStepErrors({ submit: err.message || 'An error occurred while creating the business.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STEP RENDERING
  if (currentStep === 5 && createdBusiness) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] pb-16 pt-4 sm:pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-inner">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Business Created Successfully
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            The business entity and owner credentials have been established in the TellerBud registry.
          </p>

          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-5 text-left text-xs sm:text-sm space-y-3 mb-6">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Business Name</span>
              <span className="font-bold text-gray-900">{createdBusiness.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Business ID</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {createdBusiness.id}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Business Owner ID</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {createdBusiness.ownerId}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Owner Username</span>
              <span className="font-mono font-bold text-gray-900">{createdBusiness.ownerUsername}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Shared Wallet Initial Balance</span>
              <span className="font-mono font-bold text-emerald-700">ZMW 0.00</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Initial Account Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {createdBusiness.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/super-admin/people/businesses/${createdBusiness.id}`)}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0D93AA] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#0B7D91] transition-colors cursor-pointer shadow-sm"
            >
              View Business Details
            </button>
            <button
              type="button"
              onClick={() => navigate('/super-admin/people/businesses')}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Return to Businesses List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-16 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0D93AA] transition-colors cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            <span>{currentStep === 1 ? 'Cancel & Return' : 'Back to Previous Step'}</span>
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { step: 1, label: 'Business Information', icon: Building2 },
              { step: 2, label: 'Business Owner', icon: User },
              { step: 3, label: 'Login Credentials', icon: KeyRound },
              { step: 4, label: 'Review & Create', icon: ShieldCheck },
            ].map(({ step, label, icon: StepIcon }) => {
              const isPassed = currentStep > step;
              const isCurrent = currentStep === step;

              return (
                <div key={step} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-colors mb-2 ${
                      isPassed
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-[#0D93AA] text-white shadow-sm ring-4 ring-[#0D93AA]/15'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check size={16} /> : <StepIcon size={16} />}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold leading-tight hidden sm:block ${
                      isCurrent
                        ? 'text-slate-900'
                        : isPassed
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Error Banner */}
        {stepErrors.submit && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{stepErrors.submit}</span>
          </div>
        )}

        {/* Step Container */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* ========================================================= */}
          {/* STEP 1: BUSINESS INFORMATION                              */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Step 1: Business Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter registered company and location details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Lusaka Central Express Agency"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.businessName
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  {stepErrors.businessName && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.businessName}</p>
                  )}
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Business Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] bg-white cursor-pointer"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PACRA Registration Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    PACRA Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pacraNumber}
                    onChange={(e) => setPacraNumber(e.target.value)}
                    placeholder="e.g. 120230048123"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.pacraNumber
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  {stepErrors.pacraNumber && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.pacraNumber}</p>
                  )}
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. Plot 412 Cairo Road"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.streetAddress
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  {stepErrors.streetAddress && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.streetAddress}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lusaka"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.city
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  {stepErrors.city && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.city}</p>
                  )}
                </div>

                {/* Province */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Province <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] bg-white cursor-pointer"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country (Fixed Zambia) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-slate-100/80 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                  />
                </div>

                {/* Operating Currency (Fixed ZMW) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Operating Currency
                  </label>
                  <input
                    type="text"
                    value={operatingCurrency}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-slate-100/80 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                  />
                </div>

                {/* Time Zone (Fixed Africa/Lusaka) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Time Zone
                  </label>
                  <input
                    type="text"
                    value={timeZone}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-slate-100/80 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: BUSINESS OWNER                                    */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Step 2: Business Owner
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Designate the primary owner managing this agency account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Chileshe"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.firstName
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  {stepErrors.firstName && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Mwamba"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.lastName
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  {stepErrors.lastName && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.lastName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mobile Number (Zambian Format) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+260971234567"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.mobileNumber
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Format: +260 followed by 9 digits (e.g., +260971234567 or +260761234567). Must be unique.
                  </p>
                  {stepErrors.mobileNumber && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.mobileNumber}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="e.g. owner@business.zm"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.emailAddress
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  {stepErrors.emailAddress && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.emailAddress}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: LOGIN CREDENTIALS                                 */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Step 3: Login Credentials
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure the owner's authentication handle and secure temporary password.
                </p>
              </div>

              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="e.g. chileshe.mwamba"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                      stepErrors.username
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 focus:border-[#0D93AA]'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    4–20 characters. Lowercase letters, numbers, dot, underscore or hyphen only. Must be unique.
                  </p>
                  {stepErrors.username && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.username}</p>
                  )}
                </div>

                {/* Temporary Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={temporaryPassword}
                      onChange={(e) => setTemporaryPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                        stepErrors.temporaryPassword
                          ? 'border-rose-300 bg-rose-50/50'
                          : 'border-slate-200 focus:border-[#0D93AA]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {stepErrors.temporaryPassword && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.temporaryPassword}</p>
                  )}

                  {/* Password Checklist */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${passwordValidation.minLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check size={13} className={passwordValidation.minLength ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check size={13} className={passwordValidation.hasUpper ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>1 uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check size={13} className={passwordValidation.hasLower ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>1 lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check size={13} className={passwordValidation.hasNumber ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>1 number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check size={13} className={passwordValidation.hasSpecial ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>1 special character (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Temporary Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Confirm Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 ${
                        stepErrors.confirmPassword
                          ? 'border-rose-300 bg-rose-50/50'
                          : 'border-slate-200 focus:border-[#0D93AA]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {stepErrors.confirmPassword && (
                    <p className="text-rose-600 text-xs mt-1">{stepErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Require Password Change Checkbox */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requirePasswordChange}
                      onChange={(e) => setRequirePasswordChange(e.target.checked)}
                      className="w-4 h-4 text-[#0D93AA] rounded border-slate-300 focus:ring-[#0D93AA]"
                    />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Require password change on first login (Recommended)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: REVIEW & CREATE                                   */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Step 4: Review & Create
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify business specifications before generating account credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                
                {/* Business Details Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 font-bold text-slate-900">
                    <Building2 size={16} className="text-[#0D93AA]" />
                    <span>Business Information</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Business Name</span>
                    <span className="font-semibold text-slate-900">{businessName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Business Type</span>
                    <span className="font-semibold text-slate-900">{businessType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">PACRA Registration</span>
                    <span className="font-mono font-semibold text-slate-900">{pacraNumber}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Address</span>
                    <span className="font-semibold text-slate-900">{streetAddress}, {city}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Province & Country</span>
                    <span className="font-semibold text-slate-900">{province}, {country}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Currency</span>
                    <span className="font-semibold text-slate-900">{operatingCurrency}</span>
                  </div>
                </div>

                {/* Owner & Credentials Details Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 font-bold text-slate-900">
                    <User size={16} className="text-[#0D93AA]" />
                    <span>Business Owner & Access</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-semibold text-slate-900">{firstName} {lastName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Mobile Number</span>
                    <span className="font-mono font-semibold text-slate-900">{mobileNumber}</span>
                  </div>
                  {emailAddress && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Email Address</span>
                      <span className="font-semibold text-slate-900">{emailAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Username</span>
                    <span className="font-mono font-bold text-slate-900">{username}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Password Change on First Login</span>
                    <span className={`font-semibold ${requirePasswordChange ? 'text-amber-600' : 'text-slate-600'}`}>
                      {requirePasswordChange ? 'Required' : 'Not Required'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Initial Shared Wallet</span>
                    <span className="font-mono font-semibold text-emerald-700">ZMW 0.00</span>
                  </div>
                </div>

              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-800">
                <p>
                  <strong>Security Note:</strong> Passwords are cryptographically salted and hashed upon creation. They will never be stored in plaintext or accessible in system logs.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {currentStep === 1 ? 'Cancel' : 'Previous Step'}
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#0D93AA] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#0B7D91] transition-colors cursor-pointer shadow-sm"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateBusiness}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{isSubmitting ? 'Creating Business...' : 'Create Business'}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
