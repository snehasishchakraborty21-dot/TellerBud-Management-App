import React, { useState } from 'react';
import {
  Globe,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  CheckSquare,
  Square,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { businessOnboardingService } from '../../services/businessOnboardingService';

interface WebsiteBusinessOwnerSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (appId: string) => void;
}

const AVAILABLE_CITIES = [
  'Lusaka',
  'Kitwe',
  'Ndola',
  'Livingstone',
  'Chipata',
  'Kabwe',
  'Solwezi',
  'Kasama',
  'Mansa',
  'Mongu',
  'Choma',
  'Mazabuka',
];

const SERVICE_PROVIDERS = [
  'Airtel Money',
  'MTN Mobile Money',
  'Zamtel',
  'FNB',
  'Zanaco',
  'INDO',
];

export const WebsiteBusinessOwnerSignUpModal: React.FC<WebsiteBusinessOwnerSignUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [ownerFullName, setOwnerFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+260 97 ');
  const [selectedCities, setSelectedCities] = useState<string[]>(['Lusaka']);
  const [cityLocations, setCityLocations] = useState<Record<string, string>>({
    Lusaka: '',
  });
  const [numberOfAgents, setNumberOfAgents] = useState<number>(5);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    'Airtel Money',
    'MTN Mobile Money',
    'Zanaco',
  ]);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      if (selectedCities.length === 1) return; // keep at least 1
      const updated = selectedCities.filter((c) => c !== city);
      setSelectedCities(updated);
      const newLocs = { ...cityLocations };
      delete newLocs[city];
      setCityLocations(newLocs);
    } else {
      setSelectedCities([...selectedCities, city]);
      setCityLocations({ ...cityLocations, [city]: '' });
    }
  };

  const handleLocationChange = (city: string, address: string) => {
    setCityLocations((prev) => ({
      ...prev,
      [city]: address,
    }));
  };

  const toggleProvider = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      if (selectedProviders.length === 1) return; // keep at least 1
      setSelectedProviders(selectedProviders.filter((p) => p !== provider));
    } else {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate clicks

    setErrorMessage(null);

    // Validate mandatory fields
    if (!ownerFullName.trim()) {
      setErrorMessage('Please enter the Business Owner’s full name.');
      return;
    }
    if (!businessName.trim()) {
      setErrorMessage('Please enter the registered Business name.');
      return;
    }
    if (!phone.trim() || phone.trim() === '+260 97') {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (selectedCities.length === 0) {
      setErrorMessage('Please select at least one operating city.');
      return;
    }
    for (const city of selectedCities) {
      if (!cityLocations[city]?.trim()) {
        setErrorMessage(`Please provide the business location address for ${city}.`);
        return;
      }
    }
    if (!numberOfAgents || numberOfAgents < 1) {
      setErrorMessage('Please specify at least 1 agent.');
      return;
    }
    if (selectedProviders.length === 0) {
      setErrorMessage('Please select at least one mobile money or banking service provider.');
      return;
    }

    setIsSubmitting(true);

    // Submit to shared unified service
    const result = businessOnboardingService.submitWebsiteApplication({
      ownerFullName: ownerFullName.trim(),
      businessName: businessName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      operatingCities: selectedCities,
      cityLocations,
      numberOfAgents: Number(numberOfAgents),
      selectedProviders,
      additionalInformation: additionalInfo.trim(),
      submittedAt: new Date().toISOString(),
    });

    if (result.success && result.applicationId) {
      setIsSubmitted(true);
      setSubmittedAppId(result.applicationId);
      setIsSubmitting(false);
      if (onSuccess) onSuccess(result.applicationId);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Failed to submit application. Please try again.');
    }
  };

  const handleResetAndNew = () => {
    setOwnerFullName('');
    setBusinessName('');
    setEmail('');
    setPhone('+260 97 ');
    setSelectedCities(['Lusaka']);
    setCityLocations({ Lusaka: '' });
    setNumberOfAgents(5);
    setSelectedProviders(['Airtel Money', 'MTN Mobile Money', 'Zanaco']);
    setAdditionalInfo('');
    setIsSubmitted(false);
    setSubmittedAppId(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header (Website Style Branding) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-[#0D93AA] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-xs">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">TellerBud Public Website</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">Business Owner Portal</span>
              </div>
              <h3 className="text-sm font-bold text-white">Business Owner Registration</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {isSubmitted ? (
            /* Success View */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-bold text-slate-900">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thank you for submitting your business registration request. Your application has been transmitted directly to the TellerBud Management team for compliance verification.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Business Name:</span>
                  <span className="font-semibold text-slate-900">{businessName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-900">{ownerFullName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Initial Status:</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Pending Review
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Next Step:</span>
                  <span className="text-slate-700 font-medium">TellerBud Admin Review & Field Executive Scheduling</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndNew}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Submit Another Request
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#0D93AA] text-white text-xs font-semibold hover:bg-[#0b8296] transition-colors cursor-pointer shadow-xs"
                >
                  View in Admin Onboarding Tab
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Basic Owner & Business Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" />
                    <span>Business Owner Full Name <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={ownerFullName}
                    onChange={(e) => setOwnerFullName(e.target.value)}
                    placeholder="e.g. Kabwe Mumba"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-400" />
                    <span>Registered Business Name <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Commercial Distribution Ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* 2. Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <span>Phone Number <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+260 97 781 2940"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kabwe.mumba@apexcommercial.co.zm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent"
                  />
                </div>
              </div>

              {/* 3. Operating Cities */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400" />
                  <span>Operating City or Cities <span className="text-rose-500">*</span></span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_CITIES.map((city) => {
                    const isSelected = selectedCities.includes(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleCity(city)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0D93AA] text-white shadow-2xs font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Business Location for Every Selected City */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="block font-semibold text-slate-800 text-[11.5px]">
                  Business Location Addresses for Selected Cities <span className="text-rose-500">*</span>
                </span>
                {selectedCities.map((city) => (
                  <div key={city} className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                      <MapPin size={11} className="text-[#0D93AA]" />
                      <span>{city} Location Address:</span>
                    </label>
                    <input
                      type="text"
                      value={cityLocations[city] || ''}
                      onChange={(e) => handleLocationChange(city, e.target.value)}
                      placeholder={`e.g. Plot/Shop number, Street name, Commercial Area in ${city}`}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1.5 focus:ring-[#0D93AA] focus:border-transparent"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* 5. Number of Agents */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400" />
                  <span>Proposed Number of Agents <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={numberOfAgents}
                  onChange={(e) => setNumberOfAgents(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  required
                />
              </div>

              {/* 6. Selected Service Providers */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Select Mobile Money & Banking Service Providers <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICE_PROVIDERS.map((provider) => {
                    const isSelected = selectedProviders.includes(provider);
                    return (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => toggleProvider(provider)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare size={14} className="text-[#0D93AA] shrink-0" />
                        ) : (
                          <Square size={14} className="text-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{provider}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Additional Information */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Additional Information or Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Provide any additional context on your trading volume, current agency operations, or questions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0D93AA] hover:bg-[#0b8296] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
