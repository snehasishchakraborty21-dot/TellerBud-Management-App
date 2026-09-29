import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  RefreshCw,
  Banknote,
  DollarSign,
} from 'lucide-react';
import { MtnLogo, AirtelLogo } from '../components/wallet/ProviderLogos';
import { GlobalWalletActivity, BusinessWallet } from '../types/admin';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { formatZMW } from '../utils/formatters';

export const GlobalWalletRequestWithdrawalPage: React.FC = () => {
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
  const [isSimulatingPayout, setIsSimulatingPayout] = useState(false);

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
        console.error('Failed to load global wallet data for withdrawal:', err);
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

  // Focus on phone input on mount
  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  const availableBalance = wallet?.currentBalance ?? 164350.0;
  const amountVal = parseFloat(amountStr) || 0;
  const isAmountPositive = amountVal > 0;
  const isAmountWithinBalance = amountVal <= availableBalance;
  const isAmountValid = isAmountPositive && isAmountWithinBalance;
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

  const handlePresetPercentage = (pct: number) => {
    const val = (availableBalance * pct) / 100;
    setAmountStr(val.toFixed(2));
    setAmountTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (!canProceed) return;

    setIsSubmitting(true);
    try {
      const res = await adminService.submitGlobalWalletWithdrawal({
        provider,
        destinationNumber: `+260${phoneDigits}`,
        amount: amountVal,
        actorName: currentUser?.fullName || 'Chileshe Mwamba',
      });

      if (res.success && res.activity) {
        setSubmittedActivity(res.activity);
      }
    } catch (err) {
      console.error('Failed to submit withdrawal request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePayout = async () => {
    if (!submittedActivity) return;
    setIsSimulatingPayout(true);
    try {
      const res = await adminService.markWithdrawalAsPaid(submittedActivity.reference);
      if (res.success && res.activity) {
        setSubmittedActivity(res.activity);
      }
    } catch (err) {
      console.error('Failed to simulate payout:', err);
    } finally {
      setIsSimulatingPayout(false);
    }
  };

  const projectedRemainingBalance = Math.max(0, availableBalance - (isAmountValid ? amountVal : 0));

  return (
    <div id="global-wallet-request-withdrawal-page" className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn pb-16">
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
            <span className="font-semibold text-slate-800">Request Withdrawal</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <Building2 className="w-3.5 h-3.5 text-slate-600" />
          <span>{wallet?.businessName || currentUser?.businessName || 'Lusaka Central Express Agency'} (BIZ-LUS-001)</span>
        </div>
      </div>

      {/* 2. Main Page Content: Submission Confirmed State OR Full Form */}
      {submittedActivity ? (
        /* CONFIRMATION / PAYOUT SIMULATION STATE */
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
                    ? 'Withdrawal Payout Complete!'
                    : 'Withdrawal Request Submitted — Pending Payout'}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    submittedActivity.status === 'Completed'
                      ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-200/80 text-amber-950 border border-amber-300'
                  }`}
                >
                  {submittedActivity.status === 'Completed' ? 'Debited & Paid' : 'Pending Review'}
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-1.5 leading-relaxed text-slate-700">
                {submittedActivity.status === 'Completed'
                  ? 'Withdrawal payout marked as Paid by TellerBud Admin. Available Balance has been debited.'
                  : 'Withdrawal payout request submitted. In live production, TellerBud Admin reviews and authorizes external bank/MNO disbursement.'}
              </p>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Withdrawal Reference</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {submittedActivity.reference}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Withdrawal Amount</span>
                <span className="font-mono font-bold text-base text-rose-700">
                  -{formatZMW(submittedActivity.debit || amountVal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Balance After</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatZMW(submittedActivity.balanceAfter || availableBalance)}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Destination Provider</span>
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
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Destination Number</span>
                <span className="font-mono font-bold text-slate-900">{submittedActivity.mobileMoneyNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Requested By</span>
                <span className="font-medium text-slate-800">
                  {submittedActivity.initiatedBy?.name || 'Chileshe Mwamba'} (Business Owner)
                </span>
              </div>
            </div>
          </div>

          {/* Admin Payout Simulator */}
          {submittedActivity.status !== 'Completed' && (
            <div className="p-5 bg-sky-50 border border-sky-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-sky-700" />
                <h4 className="text-sm font-bold text-sky-950">TellerBud Admin Payout Simulator</h4>
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                TellerBud policy requires TellerBud Admin approval before executing external payouts. Simulate marking this withdrawal as Paid to debit the Global Wallet balance.
              </p>
              <button
                id="simulate-super-admin-payout-btn"
                type="button"
                onClick={handleSimulatePayout}
                disabled={isSimulatingPayout}
                className="w-full sm:w-auto px-6 py-2.5 bg-sky-800 hover:bg-sky-900 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:bg-slate-400"
              >
                {isSimulatingPayout ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Payout...</span>
                  </>
                ) : (
                  <>
                    <span>Mark as Paid by TellerBud Admin</span>
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
              New Withdrawal Request
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
        /* FULL-WIDTH REQUEST WITHDRAWAL FORM */
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="p-5 sm:p-6 lg:p-7 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shrink-0">
                <ArrowUpRight className="w-7 h-7 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Request Global Wallet Withdrawal</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Payout funds from your central business wallet to an authorized Mobile Money destination
                </p>
              </div>
            </div>

            {/* Current Balance Tag */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl self-start md:self-auto shrink-0">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">Available Balance</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white">
                {formatZMW(availableBalance)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 lg:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column (Inputs) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Destination Provider Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                    1. Destination Mobile Money Provider <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <button
                      id="withdrawal-select-mtn-btn"
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
                      id="withdrawal-select-airtel-btn"
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

                {/* 2. Destination Phone Number */}
                <div>
                  <label htmlFor="withdrawal-phone-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    2. Destination Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex rounded-xl shadow-2xs border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 overflow-hidden bg-white">
                    <span className="inline-flex items-center px-4 text-xs font-mono font-bold bg-slate-100 text-slate-700 border-r border-slate-300 select-none">
                      +260
                    </span>
                    <input
                      id="withdrawal-phone-input"
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
                      Destination account must belong to the selected mobile provider
                    </span>
                    <span className={`text-[11px] font-mono ${isPhoneValid ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      {phoneDigits.length}/9 digits
                    </span>
                  </div>
                  {(phoneTouched || formSubmitted) && !isPhoneValid && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Please enter a valid 9-digit destination phone number.</span>
                    </p>
                  )}
                </div>

                {/* 3. Withdrawal Amount */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="withdrawal-amount-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      3. Withdrawal Amount <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePresetPercentage(100)}
                      className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                    >
                      Max Available ({formatZMW(availableBalance)})
                    </button>
                  </div>
                  <div className="relative flex rounded-xl shadow-2xs border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 overflow-hidden bg-white">
                    <span className="inline-flex items-center px-4 text-xs font-mono font-bold bg-slate-100 text-slate-700 border-r border-slate-300 select-none">
                      ZMW
                    </span>
                    <input
                      id="withdrawal-amount-input"
                      type="text"
                      inputMode="decimal"
                      value={amountStr}
                      onChange={handleAmountChange}
                      onBlur={() => setAmountTouched(true)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 text-base sm:text-lg font-mono font-extrabold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Percentage Presets */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1">Quick Select:</span>
                    {[
                      { label: '25%', pct: 25 },
                      { label: '50%', pct: 50 },
                      { label: '75%', pct: 75 },
                      { label: 'Max (100%)', pct: 100 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handlePresetPercentage(item.pct)}
                        className="px-3 py-1 text-xs font-semibold font-mono bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {(amountTouched || formSubmitted) && !isAmountPositive && (
                    <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Amount must be greater than 0.00.</span>
                    </p>
                  )}

                  {(amountTouched || formSubmitted) && isAmountPositive && !isAmountWithinBalance && (
                    <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Requested withdrawal exceeds available balance ({formatZMW(availableBalance)}).</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column (Calculation & Settlement Lifecycle) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Projected Calculation Card */}
                <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-indigo-800" />
                    <span>Withdrawal Calculation</span>
                  </h3>

                  <div className="space-y-3 text-xs divide-y divide-slate-200/60">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 font-medium">Current Available Balance</span>
                      <span className="font-mono font-bold text-slate-800">{formatZMW(availableBalance)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-slate-500 font-medium">Withdrawal Amount</span>
                      <span className="font-mono font-bold text-rose-700">
                        -{isAmountValid ? formatZMW(amountVal) : 'ZMW 0.00'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-slate-500 font-medium">Payout Processing Fee</span>
                      <span className="font-mono font-bold text-slate-800">ZMW 0.00 (Standard)</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                          Projected Balance
                        </span>
                        <span className="text-[10px] text-slate-500">After payout execution</span>
                      </div>
                      <span className="font-mono font-extrabold text-base text-slate-900">
                        {formatZMW(projectedRemainingBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settlement Lifecycle Notice */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>Settlement Lifecycle & Review Policy</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Withdrawal requests are reviewed by TellerBud Admin. The balance is not debited while pending, and is debited exactly once upon successful payout execution.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons Bar */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                to="/business-owner/global-wallet"
                id="cancel-withdrawal-btn"
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs text-center order-2 sm:order-1"
              >
                Cancel & Return
              </Link>

              <button
                id="submit-withdrawal-btn"
                type="submit"
                disabled={!canProceed}
                className="px-7 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2.5 cursor-pointer order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Withdrawal...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Request for {isAmountValid ? formatZMW(amountVal) : 'Withdrawal'}</span>
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
