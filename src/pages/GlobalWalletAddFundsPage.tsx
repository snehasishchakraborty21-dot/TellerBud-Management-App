import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wallet,
  Phone,
  Banknote,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { MtnLogo, AirtelLogo } from '../components/wallet/ProviderLogos';
import { GlobalWalletActivity, BusinessWallet } from '../types/admin';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { formatZMW } from '../utils/formatters';

export const GlobalWalletAddFundsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [wallet, setWallet] = useState<BusinessWallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  // Form State
  const [provider, setProvider] = useState<'MTN Mobile Money' | 'Airtel Money'>('MTN Mobile Money');
  const [amountStr, setAmountStr] = useState<string>('');
  const [phoneDigits, setPhoneDigits] = useState<string>(''); // 9 digits
  const [amountTouched, setAmountTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedActivity, setSubmittedActivity] = useState<GlobalWalletActivity | null>(null);
  const [isVerifyingWebhook, setIsVerifyingWebhook] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Load wallet data
  useEffect(() => {
    let isMounted = true;
    const loadWalletData = async () => {
      try {
        const businessId = currentUser?.businessId || 'BIZ-LUS-001';
        const w = await adminService.getBusinessWallet(businessId);
        if (isMounted) {
          setWallet(w);
          setIsLoadingWallet(false);
        }
      } catch (err) {
        console.error('Failed to load global wallet data:', err);
        if (isMounted) {
          setIsLoadingWallet(false);
        }
      }
    };

    loadWalletData();
    const unsubscribe = adminService.subscribe(loadWalletData);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser]);

  // Focus phone input on initial mount
  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  const availableBalance = wallet?.currentBalance ?? 164350.0;
  const amountVal = parseFloat(amountStr) || 0;
  const isAmountValid = amountStr.trim() !== '' && !isNaN(amountVal) && amountVal > 0;
  const isPhoneValid = /^\d{9}$/.test(phoneDigits);
  const canProceed = Boolean(provider) && isAmountValid && isPhoneValid && !isSubmitting;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhoneDigits(clean);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setAmountStr(val);
    }
  };

  const handlePresetAmount = (preset: number) => {
    setAmountStr(preset.toFixed(2));
    setAmountTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (!canProceed) return;

    setIsSubmitting(true);
    try {
      const res = await adminService.submitGlobalWalletFunding({
        provider,
        phoneNumber: `+260${phoneDigits}`,
        amount: amountVal,
        actorName: currentUser?.fullName || 'Chileshe Mwamba',
      });

      if (res.success && res.activity) {
        setSubmittedActivity(res.activity);
      }
    } catch (err) {
      console.error('Failed to submit funding request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!submittedActivity) return;
    setIsVerifyingWebhook(true);
    try {
      const res = await adminService.verifyFundingWebhook(submittedActivity.reference);
      if (res.success && res.activity) {
        setSubmittedActivity(res.activity);
      }
    } catch (err) {
      console.error('Failed to verify webhook:', err);
    } finally {
      setIsVerifyingWebhook(false);
    }
  };

  const projectedNewBalance = availableBalance + (isAmountValid ? amountVal : 0);

  return (
    <div id="global-wallet-add-funds-page" className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn pb-16">
      {/* 1. Top Navigation & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/business-owner/global-wallet"
            id="back-to-global-wallet-link"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-sky-800 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors shadow-2xs group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-sky-800 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Global Wallet</span>
          </Link>
          <div className="h-4 w-px bg-slate-300 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Global Wallet</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">Add Funds</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <Building2 className="w-3.5 h-3.5 text-slate-600" />
          <span>{wallet?.businessName || currentUser?.businessName || 'Lusaka Central Express Agency'} (TB-BIZ-000001)</span>
        </div>
      </div>

      {/* 2. Main Page Content: Submission Confirmed State OR Full Form */}
      {submittedActivity ? (
        /* CONFIRMATION / WEBHOOK VERIFICATION STATE */
        <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Status Header Banner */}
          <div
            className={`p-5 rounded-2xl border flex items-start gap-4 ${
              submittedActivity.status === 'Completed'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {submittedActivity.status === 'Completed' ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {submittedActivity.status === 'Completed'
                    ? 'Payment Confirmed & Funds Credited!'
                    : 'Funding Request Submitted — Awaiting Payment'}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    submittedActivity.status === 'Completed'
                      ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-200/80 text-amber-950 border border-amber-300'
                  }`}
                >
                  {submittedActivity.status === 'Completed' ? 'Credited' : 'Pending Webhook'}
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-1.5 leading-relaxed text-slate-700">
                {submittedActivity.status === 'Completed'
                  ? 'The Mobile Money payment has been successfully verified. Your Global Wallet Available Balance has been credited.'
                  : 'An authorization prompt was dispatched to the subscriber phone. Once approved, the Mobile Money provider sends a webhook confirmation to credit your wallet.'}
              </p>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Transaction Reference</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {submittedActivity.reference}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Funding Amount</span>
                <span className="font-mono font-bold text-base text-sky-800">
                  +{formatZMW(submittedActivity.credit || amountVal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Current Balance</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatZMW(submittedActivity.balanceAfter || availableBalance)}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Provider</span>
                <div className="flex items-center gap-2">
                  {submittedActivity.externalProvider === 'MTN Mobile Money' ? (
                    <MtnLogo className="w-5 h-5" />
                  ) : (
                    <AirtelLogo className="w-5 h-5" />
                  )}
                  <span className="font-semibold text-slate-900">{submittedActivity.externalProvider}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Phone Number</span>
                <span className="font-mono font-bold text-slate-900">{submittedActivity.mobileMoneyNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Initiated By</span>
                <span className="font-medium text-slate-800">
                  {submittedActivity.initiatedBy?.name || 'Chileshe Mwamba'} (Business Owner)
                </span>
              </div>
            </div>
          </div>

          {/* Webhook Simulator for Testing / Demo */}
          {submittedActivity.status === 'Pending' && (
            <div className="p-5 bg-sky-50 border border-sky-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-sky-700" />
                <h4 className="text-sm font-bold text-sky-950">Test Provider Webhook Simulator</h4>
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                In real live operations, MTN or Airtel sends an instant webhook notification when the account owner enters their PIN. You can simulate that verified webhook right now to immediately credit this wallet.
              </p>
              <button
                id="simulate-provider-webhook-btn"
                type="button"
                onClick={handleSimulateWebhook}
                disabled={isVerifyingWebhook}
                className="w-full sm:w-auto px-6 py-2.5 bg-sky-800 hover:bg-sky-900 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:bg-slate-400"
              >
                {isVerifyingWebhook ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with Provider...</span>
                  </>
                ) : (
                  <>
                    <span>Simulate Verified Provider Webhook</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmittedActivity(null);
                setAmountStr('');
                setPhoneDigits('');
                setAmountTouched(false);
                setPhoneTouched(false);
                setFormSubmitted(false);
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Add More Funds
            </button>

            <Link
              to="/business-owner/global-wallet"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Return to Global Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* FULL-WIDTH ADD FUNDS FORM */
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="p-5 sm:p-6 lg:p-7 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30 shrink-0">
                <PlusCircle className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Add Funds to Global Wallet</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Top up your central business balance directly via MTN Mobile Money or Airtel Money
                </p>
              </div>
            </div>

            {/* Current Balance Tag */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl self-start md:self-auto shrink-0">
              <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider block">Current Balance</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white">
                {formatZMW(availableBalance)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 lg:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column (Inputs) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Mobile Money Provider Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                    1. Select Mobile Money Provider <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <button
                      id="select-mtn-provider-btn"
                      type="button"
                      onClick={() => setProvider('MTN Mobile Money')}
                      className={`p-4 rounded-xl border flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                        provider === 'MTN Mobile Money'
                          ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/30 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <MtnLogo className="w-10 h-10 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">MTN Mobile Money</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Zambia (+260 96 / 76)</div>
                      </div>
                    </button>

                    <button
                      id="select-airtel-provider-btn"
                      type="button"
                      onClick={() => setProvider('Airtel Money')}
                      className={`p-4 rounded-xl border flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                        provider === 'Airtel Money'
                          ? 'bg-red-50/70 border-red-500 ring-2 ring-red-400/30 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <AirtelLogo className="w-10 h-10 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Airtel Money</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Zambia (+260 97 / 77)</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Mobile Money Subscriber Phone Number */}
                <div>
                  <label htmlFor="add-funds-phone-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    2. Payer Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex rounded-xl shadow-2xs border border-slate-300 focus-within:ring-2 focus-within:ring-sky-600 focus-within:border-sky-600 overflow-hidden bg-white">
                    <span className="inline-flex items-center px-4 text-xs font-mono font-bold bg-slate-100 text-slate-700 border-r border-slate-300 select-none">
                      +260
                    </span>
                    <input
                      id="add-funds-phone-input"
                      type="tel"
                      ref={phoneInputRef}
                      value={phoneDigits}
                      onChange={handlePhoneChange}
                      onBlur={() => setPhoneTouched(true)}
                      maxLength={9}
                      placeholder="e.g. 961234567 or 971234567"
                      className="w-full px-4 py-3 text-sm font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    {isPhoneValid && (
                      <span className="inline-flex items-center px-3.5 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-slate-500">
                      Enter the 9-digit local phone number without leading 0
                    </span>
                    <span className={`text-[11px] font-mono ${isPhoneValid ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      {phoneDigits.length}/9 digits
                    </span>
                  </div>
                  {(phoneTouched || formSubmitted) && !isPhoneValid && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Please enter a valid 9-digit local phone number.</span>
                    </p>
                  )}
                </div>

                {/* 3. Funding Deposit Amount */}
                <div>
                  <label htmlFor="add-funds-amount-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    3. Deposit Amount <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex rounded-xl shadow-2xs border border-slate-300 focus-within:ring-2 focus-within:ring-sky-600 focus-within:border-sky-600 overflow-hidden bg-white">
                    <span className="inline-flex items-center px-4 text-xs font-mono font-bold bg-slate-100 text-slate-700 border-r border-slate-300 select-none">
                      ZMW
                    </span>
                    <input
                      id="add-funds-amount-input"
                      type="text"
                      inputMode="decimal"
                      value={amountStr}
                      onChange={handleAmountChange}
                      onBlur={() => setAmountTouched(true)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 text-base sm:text-lg font-mono font-extrabold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1">Quick Select:</span>
                    {[500, 1000, 2500, 5000, 10000, 25000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetAmount(preset)}
                        className="px-2.5 py-1 text-xs font-semibold font-mono bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200 hover:border-sky-300 rounded-lg transition-colors cursor-pointer"
                      >
                        +{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {(amountTouched || formSubmitted) && !isAmountValid && (
                    <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Please enter a valid deposit amount greater than 0.00.</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column (Transaction Summary & Security) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Projected Calculation Card */}
                <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-sky-800" />
                    <span>Deposit Calculation</span>
                  </h3>

                  <div className="space-y-3 text-xs divide-y divide-slate-200/60">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 font-medium">Current Available Balance</span>
                      <span className="font-mono font-bold text-slate-800">{formatZMW(availableBalance)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-slate-500 font-medium">Deposit Amount</span>
                      <span className="font-mono font-bold text-emerald-700">
                        +{isAmountValid ? formatZMW(amountVal) : 'ZMW 0.00'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-slate-500 font-medium">Processing Fee</span>
                      <span className="font-mono font-bold text-slate-800">ZMW 0.00 (Free)</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                          Projected Balance
                        </span>
                        <span className="text-[10px] text-slate-500">Upon webhook confirmation</span>
                      </div>
                      <span className="font-mono font-extrabold text-base text-sky-950">
                        {formatZMW(projectedNewBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security and Notice Card */}
                <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sky-950">
                    <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>Secure MNO Network Authorization</span>
                  </div>
                  <p className="text-[11px] text-sky-900 leading-relaxed">
                    Authorization takes place directly on the subscriber handset via USSD prompt. TellerBud never stores your mobile money PIN or credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons Bar */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                to="/business-owner/global-wallet"
                id="cancel-add-funds-btn"
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs text-center order-2 sm:order-1"
              >
                Cancel & Return
              </Link>

              <button
                id="submit-add-funds-btn"
                type="submit"
                disabled={!canProceed}
                className="px-7 py-3 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2.5 cursor-pointer order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Initiating Deposit Request...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Add {isAmountValid ? formatZMW(amountVal) : 'Funds'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
