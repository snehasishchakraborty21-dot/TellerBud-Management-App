import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tablet,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Camera,
  RotateCcw,
  Upload,
  User,
  Building2,
  FileText,
  ShieldCheck,
  MapPin,
  Lock,
  Sparkles,
  AlertCircle,
  Eye,
  PenTool,
  Scale,
  Calendar,
  Check,
  FileCheck2,
} from 'lucide-react';
import {
  BusinessOnboardingApplication,
  BusinessLegalType,
  DigitalOnboardingDraft,
  FieldCorrectionAudit,
} from '../types/businessOnboarding';
import { businessOnboardingService } from '../services/businessOnboardingService';
import {
  formatZambianNrc,
  normalizeNrcDigits,
  isValidZambianNrc,
} from '../utils/formatters';
import {
  ACTIVE_TERMS_CONFIG,
  createTermsAcceptanceRecord,
  formatLusakaDateTime,
} from '../data/termsAndConditionsData';

const LEGAL_STRUCTURES: BusinessLegalType[] = [
  'Sole Proprietorship',
  'Private Limited Company (PLC)',
  'Public Limited Company',
  'Partnership',
  'Cooperative',
  'Registered Society / NGO',
];

export const TabletPhysicalOnboardingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<BusinessOnboardingApplication | null>(() =>
    id ? businessOnboardingService.getApplicationById(id) || null : null
  );

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [executiveId] = useState<string>('TB-EMP-000001');
  const [executiveName] = useState<string>('Grace Tembo (Senior Onboarding Executive)');

  // Form states initialized from prefilled data or existing draft
  const [draft, setDraft] = useState<DigitalOnboardingDraft>(() => {
    if (application?.digitalOnboarding) {
      return {
        ...application.digitalOnboarding,
        ownerNrcNumber: formatZambianNrc(application.digitalOnboarding.ownerNrcNumber),
      };
    }
    return {
      currentStep: 1,
      lastSavedAt: new Date().toISOString(),
      fieldCorrections: [],
      legalBusinessName: application?.websiteData.businessName || '',
      tradingName: application?.websiteData.businessName || '',
      pacraRegistrationNumber: '',
      businessRegistrationDate: '2023-05-10',
      businessType: 'Private Limited Company (PLC)',
      primaryBusinessAddress:
        application?.websiteData.cityLocations?.[application?.websiteData.operatingCities[0] || ''] || '',
      operatingCities: application?.websiteData.operatingCities || ['Lusaka'],
      cityLocations: application?.websiteData.cityLocations || { Lusaka: '' },
      numberOfAgents: application?.websiteData.numberOfAgents || 5,
      selectedProviders: application?.websiteData.selectedProviders || ['Airtel Money', 'MTN Mobile Money'],
      businessContactPhone: application?.websiteData.phone || '',
      businessEmailAddress: application?.websiteData.email || '',
      ownerFullLegalName: application?.websiteData.ownerFullName || '',
      ownerNrcNumber: '',
      ownerDateOfBirth: '1985-07-15',
      ownerResidentialAddress: '',
      ownerPhone: application?.websiteData.phone || '',
      ownerEmail: application?.websiteData.email || '',
      ownerPosition: 'Managing Director',
      proposedStoresCount: application?.websiteData.operatingCities.length || 1,
      proposedBoothsCount: application?.websiteData.numberOfAgents || 5,
      confirmedAccuracy: false,
      acceptedOnboardingTerms: false,
    };
  });

  const [error, setError] = useState<string | null>(null);
  const [nrcError, setNrcError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Camera capture simulation / state
  const [cameraActive, setCameraActive] = useState<string | null>(null); // 'nrc_front' | 'nrc_back' | 'photo' | 'pacra'
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // E-Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (application?.digitalOnboarding?.currentStep) {
      setCurrentStep(application.digitalOnboarding.currentStep);
    }
    if (application?.digitalOnboarding?.ownerNrcNumber) {
      const formatted = formatZambianNrc(application.digitalOnboarding.ownerNrcNumber);
      setDraft((prev) => {
        if (prev.ownerNrcNumber !== formatted) {
          return { ...prev, ownerNrcNumber: formatted };
        }
        return prev;
      });
      if (isValidZambianNrc(formatted)) {
        setNrcError(null);
        setError((prev) => (prev === 'Please enter the complete 9-digit NRC number.' ? null : prev));
      }
    }
    if (application?.digitalOnboarding?.eSignatureData) {
      setHasSignature(true);
    }
  }, [application]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Progressive NRC Input Handler
  const handleNrcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatZambianNrc(rawVal);

    setDraft((prev) => ({
      ...prev,
      ownerNrcNumber: formatted,
    }));

    if (isValidZambianNrc(formatted)) {
      setNrcError(null);
      if (error === 'Please enter the complete 9-digit NRC number.') {
        setError(null);
      }
    }
  };

  // Backspace keydown handler: natural digit deletion across slashes
  const handleNrcKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const { selectionStart, selectionEnd, value } = input;

    if (e.key === 'Backspace' && selectionStart === selectionEnd && selectionStart !== null) {
      if (value[selectionStart - 1] === '/') {
        e.preventDefault();
        const before = value.slice(0, selectionStart - 1);
        const after = value.slice(selectionStart);
        const newBeforeDigits = before.replace(/\D/g, '').slice(0, -1);
        const afterDigits = after.replace(/\D/g, '');
        const formatted = formatZambianNrc(newBeforeDigits + afterDigits);
        setDraft((prev) => ({ ...prev, ownerNrcNumber: formatted }));
      }
    }
  };

  // Paste handler
  const handleNrcPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const formatted = formatZambianNrc(pastedText);

    setDraft((prev) => ({
      ...prev,
      ownerNrcNumber: formatted,
    }));

    if (isValidZambianNrc(formatted)) {
      setNrcError(null);
      if (error === 'Please enter the complete 9-digit NRC number.') {
        setError(null);
      }
    }
  };

  // Blur validation
  const handleNrcBlur = () => {
    const digits = normalizeNrcDigits(draft.ownerNrcNumber);
    if (digits.length > 0 && digits.length < 9) {
      setNrcError('Please enter the complete 9-digit NRC number.');
    } else {
      setNrcError(null);
    }
  };

  // Auto save draft whenever step or critical state changes
  const handleSaveDraft = () => {
    if (!application) return;
    const updated = {
      ...draft,
      currentStep,
      lastSavedAt: new Date().toISOString(),
    };
    businessOnboardingService.saveOnboardingDraft(application.id, updated, executiveId, executiveName);
    showToast('Draft auto-saved successfully.');
  };

  // Camera Handling
  const startCamera = async (targetDoc: string) => {
    setCameraActive(targetDoc);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Live camera stream not accessible, using tablet photo simulator:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(null);
  };

  const capturePhoto = (targetDoc: string) => {
    const timestamp = new Date().toISOString();
    let dataUrl = '';

    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    // High fidelity SVG fallback if camera video is simulated
    if (!dataUrl) {
      if (targetDoc === 'nrc_front') {
        dataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23e2e8f0" rx="12"/><text x="20" y="40" font-family="sans-serif" font-size="13" font-weight="bold" fill="%231e293b">REPUBLIC OF ZAMBIA - NRC</text><rect x="20" y="60" width="80" height="100" fill="%2394a3b8" rx="6"/><text x="120" y="80" font-family="sans-serif" font-size="12" fill="%231e293b">NRC: ${draft.ownerNrcNumber || '619283/21/1'}</text><text x="120" y="105" font-family="sans-serif" font-size="12" fill="%231e293b">Name: ${draft.ownerFullLegalName.toUpperCase()}</text><text x="120" y="130" font-family="sans-serif" font-size="12" fill="%231e293b">DOB: ${draft.ownerDateOfBirth}</text><text x="120" y="155" font-family="sans-serif" font-size="11" fill="%230284c7">TABLET VERIFIED ORIGINAL</text></svg>`;
      } else if (targetDoc === 'nrc_back') {
        dataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23e2e8f0" rx="12"/><text x="20" y="40" font-family="sans-serif" font-size="13" font-weight="bold" fill="%231e293b">NRC REVERSE (THUMBPRINT)</text><rect x="20" y="70" width="100" height="80" fill="%23cbd5e1" rx="4"/><text x="140" y="100" font-family="sans-serif" font-size="12" fill="%231e293b">Registrar Seal Verified</text></svg>`;
      } else if (targetDoc === 'photo') {
        dataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23f1f5f9" rx="16"/><circle cx="150" cy="110" r="50" fill="%230d9488"/><circle cx="150" cy="240" r="85" fill="%230d9488"/><text x="70" y="285" font-family="sans-serif" font-size="12" font-weight="bold" fill="%230f766e">LIVE TABLET CAPTURE</text></svg>`;
      } else {
        dataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23f8fafc" stroke="%23cbd5e1" rx="8"/><text x="30" y="40" font-family="sans-serif" font-size="13" font-weight="bold" fill="%230f172a">PACRA CERTIFICATE OF REGISTRATION</text><text x="30" y="80" font-family="sans-serif" font-size="12" fill="%23334155">No: ${draft.pacraRegistrationNumber || 'PACRA-ZM-8820'}</text><text x="30" y="110" font-family="sans-serif" font-size="12" fill="%23334155">Company: ${draft.legalBusinessName}</text></svg>`;
      }
    }

    if (targetDoc === 'nrc_front') {
      setDraft((prev) => ({ ...prev, nrcFrontImage: dataUrl, nrcFrontCapturedAt: timestamp }));
    } else if (targetDoc === 'nrc_back') {
      setDraft((prev) => ({ ...prev, nrcBackImage: dataUrl, nrcBackCapturedAt: timestamp }));
    } else if (targetDoc === 'photo') {
      setDraft((prev) => ({ ...prev, ownerLivePhoto: dataUrl, ownerLivePhotoCapturedAt: timestamp }));
    } else if (targetDoc === 'pacra') {
      setDraft((prev) => ({
        ...prev,
        supportingBusinessDoc: dataUrl,
        supportingBusinessDocCapturedAt: timestamp,
        pacraDocument: dataUrl,
        pacraDocumentCapturedAt: timestamp,
      }));
    }

    stopCamera();
    showToast('Photo captured successfully.');
  };

  // Canvas E-Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setDraft((prev) => ({
        ...prev,
        eSignatureData: dataUrl,
        eSignatureTimestamp: new Date().toISOString(),
      }));
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setDraft((prev) => ({
      ...prev,
      eSignatureData: undefined,
      eSignatureTimestamp: undefined,
    }));
  };

  // Step Validation & Progression
  const handleNextStep = () => {
    setError(null);

    // Step-specific validations
    if (currentStep === 1) {
      if (!draft.ownerFullLegalName.trim()) {
        setError('Please enter the Business Owner full name.');
        return;
      }
      if (!draft.legalBusinessName.trim()) {
        setError('Please enter the Business name.');
        return;
      }
    } else if (currentStep === 2) {
      if (!draft.pacraRegistrationNumber.trim()) {
        setError('Please enter the official PACRA registration number.');
        return;
      }
      if (!draft.primaryBusinessAddress.trim()) {
        setError('Please provide the primary business address.');
        return;
      }
    } else if (currentStep === 3) {
      if (!draft.ownerFullLegalName.trim()) {
        setError('Please enter the Business Owner full legal name.');
        return;
      }
      const nrcDigits = normalizeNrcDigits(draft.ownerNrcNumber);
      if (nrcDigits.length < 9 || !isValidZambianNrc(draft.ownerNrcNumber)) {
        setError('Please enter the complete 9-digit NRC number.');
        setNrcError('Please enter the complete 9-digit NRC number.');
        return;
      }

      // Check duplicate NRC across other registered businesses
      const allApps = businessOnboardingService.getApplications();
      const duplicate = allApps.find(
        (a) =>
          a.id !== application?.id &&
          a.digitalOnboarding?.ownerNrcNumber &&
          normalizeNrcDigits(a.digitalOnboarding.ownerNrcNumber) === nrcDigits
      );
      if (duplicate) {
        setError(
          `This NRC number is already registered under ${duplicate.websiteData.businessName} (${duplicate.websiteData.ownerFullName}).`
        );
        setNrcError('This NRC number is already registered to another Business Owner.');
        return;
      }

      if (!draft.ownerEmail.trim()) {
        setError('Business Owner email is mandatory before digital onboarding can be submitted.');
        return;
      }
    } else if (currentStep === 4) {
      if (!draft.nrcFrontImage) {
        setError('Please capture the NRC Front image.');
        return;
      }
      if (!draft.nrcBackImage) {
        setError('Please capture the NRC Back image.');
        return;
      }
    } else if (currentStep === 5) {
      if (!draft.ownerLivePhoto) {
        setError('Please capture the live photograph of the Business Owner.');
        return;
      }
    } else if (currentStep === 6) {
      // Step 6: Operational setup
      if (draft.proposedStoresCount < 1) {
        setError('Proposed stores count must be at least 1.');
        return;
      }
    } else if (currentStep === 7) {
      // Step 7: Terms & Conditions Acceptance
      if (!draft.acceptedOnboardingTerms) {
        setError('The Business Owner must read and accept the Terms & Conditions before continuing to signature.');
        return;
      }

      // Record verified Terms Acceptance metadata
      const ts = new Date().toISOString();
      const termsRecord = createTermsAcceptanceRecord({
        ownerFullName: draft.ownerFullLegalName || application?.websiteData.ownerFullName || '',
        ownerId: application?.businessOwnerId || 'TB-BOO-Pending',
        businessName: draft.legalBusinessName || application?.websiteData.businessName || '',
        businessId: application?.businessId || 'TB-BIZ-Pending',
        onboardingReference: application?.id || '',
        executiveId,
        executiveName,
        timestamp: ts,
      });

      setDraft((prev) => ({
        ...prev,
        acceptedOnboardingTerms: true,
        termsVersionAccepted: ACTIVE_TERMS_CONFIG.version,
        termsAcceptedTimestamp: ts,
        termsAcceptanceRecord: termsRecord,
      }));
    }

    handleSaveDraft();
    setCurrentStep((prev) => Math.min(8, prev + 1));
  };

  const handlePrevStep = () => {
    setError(null);
    handleSaveDraft();
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Final Submit for Activation (from Step 8 E-Signature)
  const handleSubmitForActivation = () => {
    if (!application) return;
    setError(null);

    if (!draft.acceptedOnboardingTerms) {
      setError('Terms & Conditions must be accepted prior to submission.');
      setCurrentStep(7);
      return;
    }

    if (!draft.eSignatureData && !hasSignature) {
      setError('Handwritten signature on tablet is required. Please sign inside the signature box.');
      return;
    }

    const res = businessOnboardingService.submitOnboardingForActivation(
      application.id,
      draft,
      executiveId,
      executiveName
    );

    if (res.success) {
      showToast('Onboarding completed & submitted for TellerBud Admin activation!');
      setTimeout(() => {
        navigate(`/super-admin/people/business-onboarding/${application.id}`);
      }, 1200);
    } else {
      setError(res.error || 'Failed to submit onboarding record.');
    }
  };

  if (!application) return null;

  const STEPS = [
    { num: 1, label: 'Prefilled Info' },
    { num: 2, label: 'Business Details' },
    { num: 3, label: 'Owner Details' },
    { num: 4, label: 'NRC & Documents' },
    { num: 5, label: 'Live Photo' },
    { num: 6, label: 'Account Setup' },
    { num: 7, label: 'Terms & Conditions' },
    { num: 8, label: 'Business Owner E-Sign' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-xs pb-12 select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-top-2">
          <CheckCircle2 size={15} className="text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Tablet Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/super-admin/people/business-onboarding/${application.id}`)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Exit Tablet Mode"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <Tablet size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">TELLERBUD EXECUTIVE TABLET</span>
                <span className="px-2 py-0.2 rounded-full bg-teal-500/30 text-teal-300 font-mono text-[10.5px]">
                  {executiveId}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {application.websiteData.businessName} • {application.businessId || 'TB-BIZ-Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Save Draft */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={13} />
            <span>Save Draft</span>
          </button>
        </div>
      </header>

      {/* 8-Step Horizontal Progress Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 overflow-x-auto shrink-0 shadow-2xs">
        <div className="flex items-center justify-between min-w-[840px] max-w-6xl mx-auto gap-2">
          {STEPS.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num <= currentStep || isDone) {
                    setCurrentStep(s.num);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0D93AA] text-white shadow-xs'
                    : isDone
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-white text-[#0D93AA]'
                      : isDone
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={12} /> : s.num}
                </div>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tablet Content Area (Full width, spacious touch fields) */}
      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-2.5 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Prefilled Application Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0D93AA] text-white text-xs flex items-center justify-center">
                    1
                  </span>
                  <span>Prefilled Website Application Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify website-submitted data with the Business Owner. Any correction is recorded in the compliance audit trail.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Business Name</label>
                  <input
                    type="text"
                    value={draft.legalBusinessName}
                    onChange={(e) => setDraft({ ...draft, legalBusinessName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Business Owner Full Name</label>
                  <input
                    type="text"
                    value={draft.ownerFullLegalName}
                    onChange={(e) => setDraft({ ...draft, ownerFullLegalName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Contact Phone Number</label>
                  <input
                    type="text"
                    value={draft.ownerPhone}
                    onChange={(e) => setDraft({ ...draft, ownerPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Contact Email</label>
                  <input
                    type="email"
                    value={draft.ownerEmail}
                    onChange={(e) => setDraft({ ...draft, ownerEmail: e.target.value })}
                    placeholder="Mandatory for activation confirmation"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Operating Cities</label>
                  <input
                    type="text"
                    value={draft.operatingCities.join(', ')}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Agents Count</label>
                  <input
                    type="number"
                    value={draft.numberOfAgents}
                    onChange={(e) => setDraft({ ...draft, numberOfAgents: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business Information */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0D93AA] text-white text-xs flex items-center justify-center">
                    2
                  </span>
                  <span>Registered Business Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Capture statutory PACRA registration details and operating structure.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Trading Name (if different)</label>
                  <input
                    type="text"
                    value={draft.tradingName}
                    onChange={(e) => setDraft({ ...draft, tradingName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    PACRA Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.pacraRegistrationNumber}
                    onChange={(e) => setDraft({ ...draft, pacraRegistrationNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. PACRA-12023-884910"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    Legal Business Structure <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={draft.businessType}
                    onChange={(e) => setDraft({ ...draft, businessType: e.target.value as BusinessLegalType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA] cursor-pointer"
                  >
                    {LEGAL_STRUCTURES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Business Registration Date</label>
                  <input
                    type="date"
                    value={draft.businessRegistrationDate}
                    onChange={(e) => setDraft({ ...draft, businessRegistrationDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    Primary Business Operating Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.primaryBusinessAddress}
                    onChange={(e) => setDraft({ ...draft, primaryBusinessAddress: e.target.value })}
                    placeholder="e.g. Plot 4180, Lumumba Road, Light Industrial Area, Lusaka"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Business Owner Information */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0D93AA] text-white text-xs flex items-center justify-center">
                    3
                  </span>
                  <span>Business Owner Identity Details</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Capture National Registration Card (NRC) and residential identity verification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    Full Legal Name (as per NRC) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.ownerFullLegalName}
                    onChange={(e) => setDraft({ ...draft, ownerFullLegalName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    NRC Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      value={draft.ownerNrcNumber}
                      onChange={handleNrcChange}
                      onKeyDown={handleNrcKeyDown}
                      onPaste={handleNrcPaste}
                      onBlur={handleNrcBlur}
                      placeholder="123456/00/1"
                      className={`w-full bg-slate-50 border ${
                        nrcError ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-300' : 'border-slate-200'
                      } rounded-xl px-4 py-3 text-sm text-slate-900 font-mono font-bold tracking-wider focus:bg-white focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent transition-all`}
                      required
                    />
                  </div>
                  {nrcError ? (
                    <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{nrcError}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Enter 9 digits. The NRC format will be applied automatically.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={draft.ownerDateOfBirth}
                    onChange={(e) => setDraft({ ...draft, ownerDateOfBirth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    Position / Role in Business <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.ownerPosition}
                    onChange={(e) => setDraft({ ...draft, ownerPosition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    Mandatory Activation Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={draft.ownerEmail}
                    onChange={(e) => setDraft({ ...draft, ownerEmail: e.target.value })}
                    placeholder="Required for activation passcode dispatch"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Residential Address</label>
                  <input
                    type="text"
                    value={draft.ownerResidentialAddress}
                    onChange={(e) => setDraft({ ...draft, ownerResidentialAddress: e.target.value })}
                    placeholder="e.g. Stand 891, Woodlands Extension, Lusaka"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: NRC and Document Capture (Tablet Camera) */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0D93AA] text-white text-xs flex items-center justify-center">
                    4
                  </span>
                  <span>Tablet Camera Document Capture</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Position documents flat under good light. Take clear captures of NRC Front, Reverse, and PACRA certificate.
                </p>
              </div>

              {/* Active Camera Preview Box */}
              {cameraActive && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      Live Tablet Camera Stream • {cameraActive.replace('_', ' ').toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-semibold hover:bg-white/30 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[300px] flex items-center justify-center border border-slate-700">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <div className="absolute inset-4 border-2 border-dashed border-teal-400/70 rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="bg-slate-900/80 px-3 py-1 rounded-full text-[11px] text-teal-300 font-medium">
                        Align Document inside Border
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => capturePhoto(cameraActive)}
                      className="px-6 py-3 rounded-2xl bg-[#0D93AA] hover:bg-[#0b8296] text-white font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Camera size={18} />
                      <span>Take Photo & Confirm</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Document Capture Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* NRC Front */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
                  <div className="font-bold text-slate-800 text-xs flex items-center justify-center gap-1.5">
                    <FileText size={14} className="text-[#0D93AA]" />
                    <span>NRC Front Document</span>
                  </div>
                  <div className="h-40 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                    {draft.nrcFrontImage ? (
                      <img src={draft.nrcFrontImage} alt="NRC Front" className="h-full object-contain" />
                    ) : (
                      <div className="text-slate-400 text-xs italic">No capture yet</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera('nrc_front')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera size={14} />
                    <span>{draft.nrcFrontImage ? 'Retake NRC Front' : 'Capture NRC Front'}</span>
                  </button>
                </div>

                {/* NRC Back */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
                  <div className="font-bold text-slate-800 text-xs flex items-center justify-center gap-1.5">
                    <FileText size={14} className="text-[#0D93AA]" />
                    <span>NRC Reverse Side</span>
                  </div>
                  <div className="h-40 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                    {draft.nrcBackImage ? (
                      <img src={draft.nrcBackImage} alt="NRC Back" className="h-full object-contain" />
                    ) : (
                      <div className="text-slate-400 text-xs italic">No capture yet</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera('nrc_back')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera size={14} />
                    <span>{draft.nrcBackImage ? 'Retake NRC Back' : 'Capture NRC Back'}</span>
                  </button>
                </div>

                {/* PACRA Certificate */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
                  <div className="font-bold text-slate-800 text-xs flex items-center justify-center gap-1.5">
                    <Building2 size={14} className="text-[#0D93AA]" />
                    <span>PACRA Certificate</span>
                  </div>
                  <div className="h-40 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                    {draft.supportingBusinessDoc || draft.pacraDocument ? (
                      <img
                        src={draft.supportingBusinessDoc || draft.pacraDocument}
                        alt="PACRA"
                        className="h-full object-contain"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs italic">No capture yet</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera('pacra')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera size={14} />
                    <span>{draft.supportingBusinessDoc ? 'Retake PACRA' : 'Capture PACRA'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Business Owner Live Photograph */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0D93AA] text-white text-xs flex items-center justify-center">
                    5
                  </span>
                  <span>Live Business Owner Photograph</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Capture a clear live facial portrait of {draft.ownerFullLegalName} using the tablet camera.
                </p>
              </div>

              {cameraActive === 'photo' ? (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-sm mx-auto flex items-center justify-center border border-slate-700">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <div className="absolute inset-8 border-2 border-teal-400 rounded-full pointer-events-none opacity-80" />
                  </div>
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => capturePhoto('photo')}
                      className="px-6 py-3 rounded-2xl bg-[#0D93AA] hover:bg-[#0b8296] text-white font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Camera size={18} />
                      <span>Take Portrait Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-48 h-48 rounded-2xl bg-white border-2 border-dashed border-slate-300 mx-auto overflow-hidden flex items-center justify-center p-2">
                    {draft.ownerLivePhoto ? (
                      <img
                        src={draft.ownerLivePhoto}
                        alt="Live Portrait"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs italic">Live photo not captured yet</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera('photo')}
                    className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-xs"
                  >
                    <Camera size={16} />
                    <span>{draft.ownerLivePhoto ? 'Retake Live Portrait' : 'Start Live Camera & Capture'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Account and Operational Setup */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0D93AA] text-white text-xs flex items-center justify-center">
                    6
                  </span>
                  <span>Operational Structure & Account Setup</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm the initial agent, store, and liquidity configurations for this business.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-slate-500 font-medium">Assigned Business ID:</span>
                  <div className="text-base font-mono font-bold text-[#0D93AA]">
                    {application.businessId || 'TB-BIZ-000001'}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-slate-500 font-medium">Assigned Business Owner ID:</span>
                  <div className="text-base font-mono font-bold text-[#0D93AA]">
                    {application.businessOwnerId || 'TB-BOO-000001'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Proposed Stores Count</label>
                  <input
                    type="number"
                    value={draft.proposedStoresCount}
                    onChange={(e) => setDraft({ ...draft, proposedStoresCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Proposed Booths Count</label>
                  <input
                    type="number"
                    value={draft.proposedBoothsCount}
                    onChange={(e) => setDraft({ ...draft, proposedBoothsCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#0D93AA]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Business Owner Terms & Conditions (Strictly NO Signature Pad here) */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Step Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0D93AA] text-white text-xs flex items-center justify-center">
                      7
                    </span>
                    <span>{ACTIVE_TERMS_CONFIG.title}</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold">
                      Version {ACTIVE_TERMS_CONFIG.version}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                      Effective Date: {ACTIVE_TERMS_CONFIG.effectiveDate}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Please review the complete Terms & Conditions with Business Owner <strong>{draft.ownerFullLegalName}</strong>. Manual acceptance is required before proceeding to the signature pad.
                </p>
              </div>

              {/* Complete, Unabridged Terms & Conditions Document Viewer */}
              <div className="border border-slate-200 rounded-2xl bg-slate-50/60 p-5 sm:p-7 max-h-[460px] overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-[13px] leading-relaxed select-text shadow-inner">
                {/* Header Info */}
                <div className="border-b border-slate-200 pb-4">
                  <h1 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                    {ACTIVE_TERMS_CONFIG.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600 font-medium mt-1.5">
                    <div>
                      <strong>Effective Date:</strong> {ACTIVE_TERMS_CONFIG.effectiveDate}
                    </div>
                    <div>
                      <strong>Version:</strong> {ACTIVE_TERMS_CONFIG.version}
                    </div>
                  </div>
                  <p className="mt-3 text-slate-700 font-medium italic">
                    {ACTIVE_TERMS_CONFIG.intro}
                  </p>
                </div>

                {/* 13 Numbered Sections */}
                {ACTIVE_TERMS_CONFIG.sections.map((section) => (
                  <div key={section.id} className="space-y-2.5">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide">
                      {section.title}
                    </h2>

                    {section.paragraphs?.map((p, idx) => (
                      <p key={idx} className="text-slate-700">
                        {p}
                      </p>
                    ))}

                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <ul className="list-disc list-outside pl-5 space-y-1.5 text-slate-700">
                        {section.bulletPoints.map((bp, idx) => {
                          // Bold prefix if starts with term like "Setup Fee:", "Monthly Subscription:", etc.
                          const colonIdx = bp.indexOf(':');
                          if (colonIdx !== -1 && colonIdx < 30 && !bp.startsWith('Take good care')) {
                            const prefix = bp.slice(0, colonIdx + 1);
                            const rest = bp.slice(colonIdx + 1);
                            return (
                              <li key={idx}>
                                <strong className="text-slate-900">{prefix}</strong>
                                {rest}
                              </li>
                            );
                          }
                          return <li key={idx}>{bp}</li>;
                        })}
                      </ul>
                    )}

                    {section.subparagraphs?.map((sp, idx) => (
                      <p key={idx} className="text-slate-700">
                        {sp}
                      </p>
                    ))}
                  </div>
                ))}

                {/* Footer of Document */}
                <div className="border-t border-slate-200 pt-4 mt-6 text-slate-500 text-[11px] flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{ACTIVE_TERMS_CONFIG.footerTitle}</span>
                  <span>Version: {ACTIVE_TERMS_CONFIG.footerVersion}</span>
                </div>
              </div>

              {/* Acceptance Section */}
              <div className="space-y-3 pt-2">
                <div className="bg-teal-50/80 border-2 border-teal-300/80 rounded-2xl p-4 sm:p-5">
                  <label className="flex items-start gap-3.5 cursor-pointer select-none">
                    <input
                      id="checkbox-accept-terms-v1"
                      type="checkbox"
                      checked={draft.acceptedOnboardingTerms}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const ts = new Date().toISOString();
                        const termsRecord = checked
                          ? createTermsAcceptanceRecord({
                              ownerFullName: draft.ownerFullLegalName || application.websiteData.ownerFullName,
                              ownerId: application.businessOwnerId || 'TB-BOO-Pending',
                              businessName: draft.legalBusinessName || application.websiteData.businessName,
                              businessId: application.businessId || 'TB-BIZ-Pending',
                              onboardingReference: application.id,
                              executiveId,
                              executiveName,
                              timestamp: ts,
                            })
                          : undefined;

                        setDraft((prev) => ({
                          ...prev,
                          acceptedOnboardingTerms: checked,
                          termsVersionAccepted: checked ? ACTIVE_TERMS_CONFIG.version : undefined,
                          termsAcceptedTimestamp: checked ? ts : undefined,
                          termsAcceptanceRecord: termsRecord,
                        }));
                      }}
                      className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#0D93AA] focus:ring-[#0D93AA] cursor-pointer shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-xs sm:text-[13px] text-slate-900 font-semibold leading-snug block">
                        {ACTIVE_TERMS_CONFIG.acceptanceStatement}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        By checking this box, the acceptance record is stamped with Africa/Lusaka timestamp, Business Owner ID, and executive reference.
                      </p>
                    </div>
                  </label>
                </div>

                {draft.acceptedOnboardingTerms && draft.termsAcceptanceRecord && (
                  <div className="p-3 bg-white border border-teal-200 rounded-xl flex items-center justify-between text-[11px] text-teal-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-teal-600 shrink-0" />
                      <span>
                        Accepted Version <strong>{draft.termsAcceptanceRecord.version}</strong> on{' '}
                        <strong>{draft.termsAcceptanceRecord.acceptedAtFormattedLusaka}</strong>
                      </span>
                    </div>
                    <span className="font-mono text-[10.5px] text-teal-700">
                      Ref: {application.id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: Separate Full-Width Business Owner E-Signature Step */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0D93AA] text-white text-xs flex items-center justify-center">
                    8
                  </span>
                  <span>Business Owner E-Signature Capture</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Capture the handwritten stylus or touch signature of Business Owner <strong>{draft.ownerFullLegalName}</strong> on the tablet.
                </p>
              </div>

              {/* Verified Terms Acceptance Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={16} className="text-teal-600 shrink-0" />
                    <span className="font-bold text-slate-900">Verified Application & Terms Summary</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10.5px]">
                    Terms Version 1.0 Accepted
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Business Name:</span>
                    <strong className="text-slate-900">{draft.legalBusinessName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Business ID:</span>
                    <strong className="font-mono text-[#0D93AA]">{application.businessId || 'TB-BIZ-Pending'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Business Owner:</span>
                    <strong className="text-slate-900">{draft.ownerFullLegalName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Business Owner ID:</span>
                    <strong className="font-mono text-[#0D93AA]">{application.businessOwnerId || 'TB-BOO-Pending'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">NRC Number:</span>
                    <strong className="font-mono">{draft.ownerNrcNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Executive ID:</span>
                    <strong className="font-mono text-slate-700">{executiveId}</strong>
                  </div>
                </div>

                {draft.termsAcceptanceRecord && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                    <span>
                      Terms Acceptance Timestamp: <strong>{draft.termsAcceptanceRecord.acceptedAtFormattedLusaka}</strong>
                    </span>
                    <span className="font-mono">Timezone: Africa/Lusaka</span>
                  </div>
                )}
              </div>

              {/* Accuracy Confirmation Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={draft.confirmedAccuracy}
                  onChange={(e) => setDraft({ ...draft, confirmedAccuracy: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0D93AA] focus:ring-[#0D93AA] cursor-pointer"
                />
                <span className="text-xs text-slate-800 font-medium">
                  I confirm that all business details, NRC credentials, and operating locations provided above are accurate and true.
                </span>
              </label>

              {/* Full-Width Interactive Tablet Signature Pad */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                    <PenTool size={15} className="text-[#0D93AA]" />
                    <span>
                      Business Owner Handwritten Signature (Touch / Stylus) <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                  >
                    Clear Signature
                  </button>
                </div>

                <div className="border-2 border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner touch-none">
                  <canvas
                    ref={canvasRef}
                    width={900}
                    height={220}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-48 bg-white cursor-crosshair"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sign directly inside the signature box using your finger or stylus pen.</span>
                  {hasSignature && <span className="text-teal-600 font-semibold">Signature captured ✓</span>}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Tablet Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>{currentStep === 8 ? 'Back to Terms' : 'Back'}</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 7 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-2xl bg-[#0D93AA] hover:bg-[#0b8296] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight size={16} />
              </button>
            )}

            {currentStep === 7 && (
              <button
                id="btn-continue-to-signature"
                type="button"
                onClick={handleNextStep}
                disabled={!draft.acceptedOnboardingTerms}
                className="px-6 py-3 rounded-2xl bg-[#0D93AA] hover:bg-[#0b8296] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Continue to Signature</span>
                <ArrowRight size={16} />
              </button>
            )}

            {currentStep === 8 && (
              <button
                id="btn-lock-submit-activation"
                type="button"
                onClick={handleSubmitForActivation}
                disabled={!draft.acceptedOnboardingTerms || (!draft.eSignatureData && !hasSignature)}
                className="px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck size={18} />
                <span>Lock & Submit for Activation</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
