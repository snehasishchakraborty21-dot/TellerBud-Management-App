import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { businessOnboardingService } from '../services/businessOnboardingService';

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

export const WebsiteBusinessSignUpPage: React.FC = () => {
  const navigate = useNavigate();

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

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      if (selectedCities.length === 1) return;
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
      if (selectedProviders.length === 1) return;
      setSelectedProviders(selectedProviders.filter((p) => p !== provider));
    } else {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    // Mandatory checks
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
      setErrorMessage('Please select at least one mobile money or banking provider.');
      return;
    }

    setIsSubmitting(true);

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
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Failed to submit application.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Website Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0D93AA] text-white font-black flex items-center justify-center text-sm shadow-xs">
              TB
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">TellerBud Zambia</span>
              <p className="text-[11px] text-slate-500">Financial Agency & Merchant Network</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Portal Login
          </button>
        </div>
      </header>

      {/* Main Registration Section */}
      <main className="max-w-3xl mx-auto w-full p-4 sm:p-8 flex-1">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0D93AA] text-xs font-bold mb-2 border border-teal-200">
              <Globe size={13} />
              <span>Official Website Registration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Business Owner Registration
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Register your business to join the TellerBud national liquidity and mobile money agency network.
            </p>
          </div>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h2 className="text-lg font-bold text-slate-900">Application Submitted!</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your business registration request for <strong>{businessName}</strong> has been received by the TellerBud Onboarding team.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Business Name:</span>
                  <span className="font-semibold text-slate-900">{businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-900">{ownerFullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Pending Review
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login?portal=admin')}
                  className="px-5 py-2.5 rounded-xl bg-[#0D93AA] text-white text-xs font-bold hover:bg-[#0b8296] transition-colors shadow-xs"
                >
                  Go to Management App (Admin View)
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Owner and Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Business Owner Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={ownerFullName}
                    onChange={(e) => setOwnerFullName(e.target.value)}
                    placeholder="e.g. Kabwe Mumba"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Registered Business Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Commercial Distribution Ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Phone Number <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+260 97 781 2940"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-mono font-medium focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kabwe.mumba@apexcommercial.co.zm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>
              </div>

              {/* Operating Cities */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Select Operating City or Cities <span className="text-rose-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CITIES.map((city) => {
                    const isSelected = selectedCities.includes(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleCity(city)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0D93AA] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location for each selected city */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="block font-bold text-slate-800 text-xs">
                  Business Location Addresses for Selected Cities <span className="text-rose-500">*</span>
                </span>
                {selectedCities.map((city) => (
                  <div key={city} className="space-y-1">
                    <label className="text-[11.5px] font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin size={12} className="text-[#0D93AA]" />
                      <span>{city} Branch Address:</span>
                    </label>
                    <input
                      type="text"
                      value={cityLocations[city] || ''}
                      onChange={(e) => handleLocationChange(city, e.target.value)}
                      placeholder={`e.g. Plot/Shop number, Commercial Street, ${city}`}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-[#0D93AA]"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Number of agents & providers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Proposed Number of Agents <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={numberOfAgents}
                    onChange={(e) => setNumberOfAgents(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Service Providers <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SERVICE_PROVIDERS.map((provider) => {
                      const isSelected = selectedProviders.includes(provider);
                      return (
                        <button
                          key={provider}
                          type="button"
                          onClick={() => toggleProvider(provider)}
                          className={`flex items-center gap-1.5 p-2 rounded-xl border text-[11px] text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? <CheckSquare size={13} className="text-[#0D93AA]" /> : <Square size={13} className="text-slate-300" />}
                          <span className="truncate">{provider}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Additional notes */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Additional Information</label>
                <textarea
                  rows={2}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Provide any additional agency details or questions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-[#0D93AA] hover:bg-[#0b8296] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
