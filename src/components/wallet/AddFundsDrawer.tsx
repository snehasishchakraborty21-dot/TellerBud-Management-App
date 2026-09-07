import React, { useState, useEffect, useRef } from 'react';
import { X, PlusCircle, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { MtnLogo, AirtelLogo } from './ProviderLogos';
import { GlobalWalletActivity } from '../../types/admin';
import { adminService } from '../../services/adminService';

interface AddFundsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onViewActivityDetails?: (activity: GlobalWalletActivity) => void;
  triggerButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const AddFundsDrawer: React.FC<AddFundsDrawerProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onViewActivityDetails,
  triggerButtonRef,
}) => {
  const [provider, setProvider] = useState<'MTN Mobile Money' | 'Airtel Money'>('MTN Mobile Money');
  const [amountStr, setAmountStr] = useState<string>('');
  const [phoneDigits, setPhoneDigits] = useState<string>(''); // 9 digits
  const [amountTouched, setAmountTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedActivity, setSubmittedActivity] = useState<GlobalWalletActivity | null>(null);
  const [isVerifyingWebhook, setIsVerifyingWebhook] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  // Format currency
  const formatZMW = (val: number) =>
    `ZMW ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setProvider('MTN Mobile Money');
      setAmountStr('');
      setPhoneDigits('');
      setAmountTouched(false);
      setPhoneTouched(false);
      setFormSubmitted(false);
      setIsSubmitting(false);
      setSubmittedActivity(null);
      setIsVerifyingWebhook(false);
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 100);
    } else {
      if (triggerButtonRef?.current) {
        triggerButtonRef.current.focus();
      }
    }
  }, [isOpen, triggerButtonRef]);

  // Keyboard accessibility: Escape to close, Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!drawerRef.current) return;
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Validation
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
    // Allow numbers and one decimal point
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setAmountStr(val);
    }
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
        actorName: 'Chileshe Mwamba',
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

  if (!isOpen) return null;

  return (
    <div
      id="add-funds-drawer-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-funds-drawer-title"
    >
      <div
        ref={drawerRef}
        id="add-funds-drawer-content"
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 shadow-xs border border-sky-200/60">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-funds-drawer-title" className="text-base font-bold text-slate-900">
                {submittedActivity ? 'Funding Request Submitted' : 'Add Funds to Global Wallet'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {submittedActivity
                  ? 'Pending provider payment confirmation'
                  : 'Top up your central Global Wallet via Mobile Money'}
              </p>
            </div>
          </div>
          <button
            id="close-add-funds-drawer-btn"
            type="button"
            onClick={onClose}
            aria-label="Close Add Funds Drawer"
            className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-600">
          {/* STATE 2: CONFIRMATION / PENDING STATE */}
          {submittedActivity ? (
            <div className="space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  submittedActivity.status === 'Completed'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {submittedActivity.status === 'Completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wide">
                      Status: {submittedActivity.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        submittedActivity.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-200/80 text-amber-900'
                      }`}
                    >
                      {submittedActivity.status === 'Completed' ? 'Credited' : 'Awaiting Confirmation'}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed">
                    {submittedActivity.status === 'Completed'
                      ? 'Payment verified! Available Balance has been credited successfully.'
                      : 'Your Global Wallet will be credited after the Mobile Money provider confirms the payment.'}
                  </p>
                </div>
              </div>

              {/* Notice that Available balance is unaffected while Pending */}
              {submittedActivity.status !== 'Completed' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                  <span className="text-[11px]">
                    <strong>Note:</strong> Pending funding requests do not alter your Available Balance until verified.
                  </span>
                </div>
              )}

              {/* Request Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Funding Reference</span>
                  <span className="text-xs font-mono font-bold text-slate-900">{submittedActivity.reference}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Amount</span>
                  <span className="text-sm font-mono font-bold text-sky-900">
                    +{formatZMW(submittedActivity.credit || amountVal)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Mobile Money Provider</span>
                  <div className="flex items-center gap-2">
                    {submittedActivity.externalProvider === 'MTN Mobile Money' ? (
                      <MtnLogo className="w-6 h-6" />
                    ) : (
                      <AirtelLogo className="w-6 h-6" />
                    )}
                    <span className="text-xs font-semibold text-slate-900">{submittedActivity.externalProvider}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Mobile Money Number</span>
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    {submittedActivity.mobileMoneyNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Initiated By</span>
                  <span className="text-xs font-semibold text-slate-900">Chileshe Mwamba (Business Owner)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Submitted Timestamp</span>
                  <span className="text-xs text-slate-700">{submittedActivity.createdTimestamp || 'Today, Just now'}</span>
                </div>
              </div>

              {/* Simulation Box */}
              {submittedActivity.status === 'Pending' && (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sky-700" />
                    <span className="text-xs font-bold text-sky-950">Test Provider Webhook Simulation</span>
                  </div>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    In live operations, the provider sends an asynchronous webhook once the subscriber authorizes payment.
                    Simulate the verified webhook callback below to instantly credit the Available Balance.
                  </p>
                  <button
                    id="simulate-provider-webhook-btn"
                    type="button"
                    onClick={handleSimulateWebhook}
                    disabled={isVerifyingWebhook}
                    className="w-full py-2.5 px-4 bg-sky-800 hover:bg-sky-900 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isVerifyingWebhook ? 'Verifying with Provider...' : 'Simulate Verified Provider Webhook'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STATE 1: ENTRY FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Available Balance Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Available Balance
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                  {formatZMW(availableBalance)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Central business wallet shared across Lusaka Central Express Agency
                </span>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Mobile Money Provider <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="select-mtn-provider-btn"
                    type="button"
                    onClick={() => setProvider('MTN Mobile Money')}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      provider === 'MTN Mobile Money'
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <MtnLogo className="w-8 h-8" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">MTN Mobile Money</div>
                      <div className="text-[10px] text-slate-500">Zambia</div>
                    </div>
                  </button>

                  <button
                    id="select-airtel-provider-btn"
                    type="button"
                    onClick={() => setProvider('Airtel Money')}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      provider === 'Airtel Money'
                        ? 'bg-red-50/70 border-red-400 ring-2 ring-red-400/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <AirtelLogo className="w-8 h-8" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Airtel Money</div>
                      <div className="text-[10px] text-slate-500">Zambia</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile Money Number */}
              <div>
                <label htmlFor="add-funds-phone-input" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Mobile Money Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex rounded-lg shadow-xs border border-slate-300 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 overflow-hidden bg-white">
                  <span className="inline-flex items-center px-3 text-xs font-mono font-bold bg-slate-100 text-slate-700 border-r border-slate-300 select-none">
                    +260
                  </span>
                  <input
                    id="add-funds-phone-input"
                    type="tel"
                    ref={initialFocusRef}
                    value={phoneDigits}
                    onChange={handlePhoneChange}
                    onBlur={() => setPhoneTouched(true)}
                    maxLength={9}
                    placeholder="e.g. 961234567"
                    className="w-full px-3 py-2.5 text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                  {isPhoneValid && (
                    <span className="inline-flex items-center px-2.5 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-slate-400">
                    Enter the 9-digit local phone number (e.g. 96XXXXXXX or 97XXXXXXX)
                  </span>
                  <span className={`text-[11px] font-mono ${isPhoneValid ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {phoneDigits.length}/9
                  </span>
                </div>
                {(phoneTouched || formSubmitted) && !isPhoneValid && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Please enter exactly 9 local digits.
                  </p>
                )}
              </div>

              {/* Funding Amount */}
              <div>
                <label htmlFor="add-funds-amount-input" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Funding Amount <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex rounded-lg shadow-xs border border-slate-300 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 overflow-hidden bg-white">
                  <span className="inline-flex items-center px-3 text-xs font-mono font-bold bg-slate-100 text-slate-700 border-r border-slate-300 select-none">
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
                    className="w-full px-3 py-2.5 text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>
                {(amountTouched || formSubmitted) && !isAmountValid && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Amount must be greater than 0.00.
                  </p>
                )}
              </div>

              {/* Secure Mobile Money Authorization Notice */}
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sky-950">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  <span>Secure Mobile Money Authorization</span>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  Provider authorization happens outside TellerBud. Never enter an MNO PIN, OTP or USSD code here.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          {submittedActivity ? (
            <>
              {onViewActivityDetails && (
                <button
                  id="view-funding-details-btn"
                  type="button"
                  onClick={() => {
                    onViewActivityDetails(submittedActivity);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-sky-900 bg-white border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors shadow-xs cursor-pointer"
                >
                  View Funding Details
                </button>
              )}
              <button
                id="close-funding-confirmation-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                id="cancel-add-funds-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-add-funds-btn"
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed}
                className="px-4.5 py-2 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Proceed to Add Funds'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
