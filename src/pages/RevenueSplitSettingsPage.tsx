import React, { useState, useEffect, useMemo } from 'react';
import {
  Percent,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  History,
  X,
  AlertCircle,
  Layers,
  Sliders,
  Check,
} from 'lucide-react';
import { revenueSplitService, RevenueSplitConfig } from '../services/revenueSplitService';
import { useAuth } from '../context/AuthContext';
import { getZambiaTodayString } from '../utils/dateUtils';

export const RevenueSplitSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<RevenueSplitConfig[]>(() => revenueSplitService.getHistory());
  const activeSplit = useMemo(() => revenueSplitService.getActiveSplit(), [history]);
  const scheduledSplit = useMemo(() => revenueSplitService.getScheduledSplit(), [history]);

  // Form State
  const [tellerBudInput, setTellerBudInput] = useState<string>('20.00');
  const [effectiveOption, setEffectiveOption] = useState<'immediately' | 'scheduled'>('immediately');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('00:00');
  const [reason, setReason] = useState<string>('');

  // Modals & UI State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelScheduledModalOpen, setIsCancelScheduledModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync with active split on load
  useEffect(() => {
    if (activeSplit) {
      setTellerBudInput(activeSplit.tellerBudShare.toFixed(2));
    }
  }, [activeSplit]);

  // Subscribe to service changes
  useEffect(() => {
    document.title = 'Revenue Split Settings | TellerBud Admin';
    const unsubscribe = revenueSplitService.subscribe(() => {
      setHistory(revenueSplitService.getHistory());
    });
    return unsubscribe;
  }, []);

  // Admin permission check (Super Admin & Business Admin have access)
  const hasPermission =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'business_admin';

  // Numeric parsing
  const numericTellerBud = parseFloat(tellerBudInput) || 0;
  const numericBusinessOwner = Math.max(0, Math.round((100 - numericTellerBud) * 100) / 100);

  // Validation
  const isPercentageChanged =
    Math.abs(numericTellerBud - activeSplit.tellerBudShare) > 0.001 ||
    effectiveOption === 'scheduled';

  const isPercentageValid =
    !isNaN(numericTellerBud) &&
    numericTellerBud >= 0 &&
    numericTellerBud <= 100 &&
    Math.round((numericTellerBud + numericBusinessOwner) * 100) / 100 === 100;

  const isReasonValid = reason.trim().length >= 10;

  const isScheduleValid =
    effectiveOption === 'immediately' ||
    (effectiveOption === 'scheduled' &&
      Boolean(scheduledDate) &&
      Boolean(scheduledTime) &&
      new Date(`${scheduledDate}T${scheduledTime}:00`).getTime() > Date.now());

  const isSaveEnabled =
    hasPermission &&
    isPercentageChanged &&
    isPercentageValid &&
    isReasonValid &&
    isScheduleValid;

  const handleTellerBudChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow typing numbers and single decimal point
    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
      const num = parseFloat(val);
      if (val === '' || (num >= 0 && num <= 100)) {
        setTellerBudInput(val);
      }
    }
  };

  const handleResetForm = () => {
    setTellerBudInput(activeSplit.tellerBudShare.toFixed(2));
    setEffectiveOption('immediately');
    setScheduledDate('');
    setScheduledTime('00:00');
    setReason('');
    setFeedback(null);
  };

  const handleConfirmSave = () => {
    setFeedback(null);
    const result = revenueSplitService.applyNewSplit({
      tellerBudShare: numericTellerBud,
      businessOwnerShare: numericBusinessOwner,
      reason,
      applyImmediately: effectiveOption === 'immediately',
      scheduledDate: effectiveOption === 'scheduled' ? scheduledDate : undefined,
      scheduledTime: effectiveOption === 'scheduled' ? scheduledTime : undefined,
      adminName: currentUser?.fullName || 'Sililo Lubinda',
      adminId: currentUser?.uid || 'TB-EMP-000001',
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setIsConfirmModalOpen(false);
      setReason('');
    } else {
      setFeedback({ type: 'error', message: result.message });
      setIsConfirmModalOpen(false);
    }
  };

  const handleConfirmCancelScheduled = () => {
    if (!scheduledSplit) return;
    const result = revenueSplitService.cancelScheduledSplit({
      splitId: scheduledSplit.id,
      reason: cancelReason,
      adminName: currentUser?.fullName || 'Sililo Lubinda',
      adminId: currentUser?.uid || 'TB-EMP-000001',
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setIsCancelScheduledModalOpen(false);
      setCancelReason('');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const todayStr = getZambiaTodayString();

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto px-3 sm:px-5 lg:px-6 pt-1 pb-4 sm:pb-6 gap-4 sm:gap-5 max-w-[1720px] w-full mx-auto">
      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium shrink-0 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 sm:space-y-5 pr-1">
        {/* 1. SCHEDULED REVENUE SPLIT BANNER (if future split is scheduled) */}
        {scheduledSplit && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 sm:p-4.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Scheduled Revenue Split
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-200/70 text-amber-900 font-mono">
                    {scheduledSplit.version}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>TellerBud: {scheduledSplit.tellerBudShare.toFixed(2)}%</span>
                  <span className="text-slate-300">•</span>
                  <span>Business Owner: {scheduledSplit.businessOwnerShare.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-amber-900/80">
                  Effective: <strong className="font-semibold">{scheduledSplit.effectiveFromDisplay}</strong> (Africa/Lusaka)
                </p>
                <p className="text-[11px] text-slate-600 italic">
                  Reason: &ldquo;{scheduledSplit.reason}&rdquo; — Scheduled by {scheduledSplit.changedBy}
                </p>
              </div>
            </div>

            {hasPermission && (
              <button
                type="button"
                id="btn-cancel-scheduled-split"
                onClick={() => setIsCancelScheduledModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <X size={13} />
                <span>Cancel Scheduled Change</span>
              </button>
            )}
          </div>
        )}

        {/* 2. REDESIGNED CURRENT ACTIVE REVENUE SPLIT CARD */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-[17px] font-semibold text-slate-900 leading-tight">
              Current Revenue Split
            </h2>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                Active
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">
                {activeSplit.version ? `v2.0 (${activeSplit.version})` : 'v2.0 (TB-REV-SPLIT-V2)'}
              </span>
            </div>
          </div>

          {/* Revenue Share Summary Blocks (Side by Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* TellerBud Share */}
            <div className="bg-[#0D93AA]/5 border border-[#0D93AA]/20 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
              <span className="text-xs sm:text-[13px] font-medium text-slate-600">
                TellerBud Share
              </span>
              <span className="text-2xl sm:text-[26px] font-bold font-mono tracking-tight text-[#0D93AA] mt-1">
                {activeSplit.tellerBudShare.toFixed(2)}%
              </span>
            </div>

            {/* Business Owner Share */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
              <span className="text-xs sm:text-[13px] font-medium text-slate-600">
                Business Owner Share
              </span>
              <span className="text-2xl sm:text-[26px] font-bold font-mono tracking-tight text-emerald-600 mt-1">
                {activeSplit.businessOwnerShare.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Segmented Revenue Allocation Bar */}
          <div className="space-y-2">
            <div className="w-full h-6 sm:h-7 bg-slate-100 rounded-lg sm:rounded-xl overflow-hidden flex border border-slate-200/80 shadow-2xs">
              <div
                style={{ width: `${activeSplit.tellerBudShare}%` }}
                className="h-full bg-[#0D93AA] flex items-center justify-center transition-all duration-300 text-white font-semibold text-[11px] sm:text-xs whitespace-nowrap px-1.5"
                title={`TellerBud: ${activeSplit.tellerBudShare.toFixed(2)}%`}
              >
                {activeSplit.tellerBudShare >= 15 ? `TellerBud ${activeSplit.tellerBudShare.toFixed(0)}%` : `${activeSplit.tellerBudShare.toFixed(0)}%`}
              </div>
              <div
                style={{ width: `${activeSplit.businessOwnerShare}%` }}
                className="h-full bg-emerald-600 flex items-center justify-center transition-all duration-300 text-white font-semibold text-[11px] sm:text-xs whitespace-nowrap px-1.5"
                title={`Business Owner: ${activeSplit.businessOwnerShare.toFixed(2)}%`}
              >
                {activeSplit.businessOwnerShare >= 15 ? `Business Owner ${activeSplit.businessOwnerShare.toFixed(0)}%` : `${activeSplit.businessOwnerShare.toFixed(0)}%`}
              </div>
            </div>

            {/* Compact Information Footer */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>
                Effective From: <strong className="font-semibold text-slate-700">{activeSplit.effectiveFromDisplay || '01 September 2026, 00:00 CAT'}</strong>
              </span>
              <span>
                Total Allocation: <strong className="font-semibold text-slate-800">100.00%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 3. EDITABLE SPLIT CONFIGURATION FORM */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#0D93AA]" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Modify Revenue Split</h2>
            </div>
            {!hasPermission && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded">
                <ShieldAlert size={12} />
                View Only
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field 1: TellerBud Share Input */}
            <div className="space-y-1.5">
              <label htmlFor="input-tellerbud-share" className="block text-xs font-semibold text-slate-700">
                TellerBud Share (%)
              </label>
              <div className="relative">
                <input
                  id="input-tellerbud-share"
                  type="text"
                  inputMode="decimal"
                  value={tellerBudInput}
                  onChange={handleTellerBudChange}
                  disabled={!hasPermission}
                  placeholder="20.00"
                  className="w-full h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500">
                Minimum: 0.00% • Maximum: 100.00% (Up to 2 decimal places)
              </p>
            </div>

            {/* Field 2: Business Owner Share (Auto-calculated, read-only) */}
            <div className="space-y-1.5">
              <label htmlFor="input-business-owner-share" className="block text-xs font-semibold text-slate-700">
                Business Owner Share (%) <span className="text-slate-400 font-normal">(Auto-calculated)</span>
              </label>
              <div className="relative">
                <input
                  id="input-business-owner-share"
                  type="text"
                  readOnly
                  value={`${numericBusinessOwner.toFixed(2)}%`}
                  className="w-full h-10 px-3 pr-8 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold font-mono text-emerald-700 cursor-not-allowed select-none"
                />
                <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500">
                Formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">100% − TellerBud Share</code>
              </p>
            </div>
          </div>

          {/* 4. APPLICABLE SERVICES SECTION */}
          <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Layers size={14} className="text-[#0D93AA]" />
              <span>Applicable Services</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-50 text-[#0D93AA] border border-[#0D93AA]/20">
                <Check size={12} />
                Cash Pickup
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-50 text-[#0D93AA] border border-[#0D93AA]/20">
                <Check size={12} />
                Agent-to-Agent Liquidity
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Note: This revenue split applies exclusively to reservation fees. It does not apply to Cash Delivery, Walk-In Transactions, Wallet Funding, or Customer Withdrawals.
            </p>
          </div>

          {/* 5. EFFECTIVE DATE & TIMING CONTROLS */}
          <div className="space-y-2.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700">
              Effective Timing
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                <input
                  type="radio"
                  name="effectiveOption"
                  checked={effectiveOption === 'immediately'}
                  onChange={() => setEffectiveOption('immediately')}
                  disabled={!hasPermission}
                  className="text-[#0D93AA] focus:ring-[#0D93AA]"
                />
                <span>Apply Immediately</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                <input
                  type="radio"
                  name="effectiveOption"
                  checked={effectiveOption === 'scheduled'}
                  onChange={() => setEffectiveOption('scheduled')}
                  disabled={!hasPermission}
                  className="text-[#0D93AA] focus:ring-[#0D93AA]"
                />
                <span>Schedule for Later</span>
              </label>
            </div>

            {/* Scheduled inputs */}
            {effectiveOption === 'scheduled' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 p-3 bg-amber-50/50 border border-amber-200/80 rounded-lg">
                <div>
                  <label htmlFor="input-scheduled-date" className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Effective Date (Africa/Lusaka)
                  </label>
                  <input
                    id="input-scheduled-date"
                    type="date"
                    min={todayStr}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    disabled={!hasPermission}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
                  />
                </div>
                <div>
                  <label htmlFor="input-scheduled-time" className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Effective Time
                  </label>
                  <input
                    id="input-scheduled-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={!hasPermission}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. REASON FOR CHANGE */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label htmlFor="textarea-reason" className="block text-xs font-semibold text-slate-700">
                Reason for Change <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${reason.trim().length >= 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {reason.trim().length}/10 chars minimum
              </span>
            </div>
            <textarea
              id="textarea-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={!hasPermission}
              placeholder="Explain why this revenue split modification is required (e.g. Approved standard rate revision Q4)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* 7. ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-revenue-split"
              onClick={handleResetForm}
              disabled={!hasPermission || (!isPercentageChanged && !reason)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="button"
              id="btn-save-revenue-split"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={!isSaveEnabled}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <Check size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* 4. REVENUE SPLIT HISTORY SECTION */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col space-y-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Revenue Split History</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {history.length} versions recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Version</th>
                  <th className="py-2.5 px-3 text-[#0D93AA]">TellerBud Share</th>
                  <th className="py-2.5 px-3 text-emerald-700">Business Owner Share</th>
                  <th className="py-2.5 px-3">Effective From</th>
                  <th className="py-2.5 px-3">Changed By</th>
                  <th className="py-2.5 px-3.5">Reason</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {record.version}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0D93AA] whitespace-nowrap">
                      {record.tellerBudShare.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {record.businessOwnerShare.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {record.effectiveFromDisplay}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 text-[11px] whitespace-nowrap">
                      {record.changedBy}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate" title={record.reason}>
                      {record.reason}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          record.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : record.status === 'Scheduled'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : record.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Confirm Revenue Split Change</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Split</span>
                  <p className="font-bold font-mono text-slate-800 text-sm mt-0.5">
                    {activeSplit.tellerBudShare.toFixed(0)}% / {activeSplit.businessOwnerShare.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">New Split</span>
                  <p className="font-bold font-mono text-[#0D93AA] text-sm mt-0.5">
                    {numericTellerBud.toFixed(2)}% / {numericBusinessOwner.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block">Effective Timing:</span>
                <p className="font-medium text-slate-800">
                  {effectiveOption === 'immediately'
                    ? 'Immediately upon confirmation'
                    : `Scheduled for ${scheduledDate}, ${scheduledTime} (Africa/Lusaka)`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block">Reason for Change:</span>
                <p className="text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-100">
                  &ldquo;{reason}&rdquo;
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-900">
                <Info size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <p className="text-[11px] leading-relaxed">
                  This change will apply to new eligible Reservation Charges only. Existing and completed charge records will not be recalculated.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-modal-confirm-change"
                onClick={handleConfirmSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL SCHEDULED CHANGE MODAL */}
      {isCancelScheduledModalOpen && scheduledSplit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-slate-900">Cancel Scheduled Split</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelScheduledModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                You are about to cancel the scheduled revenue split ({scheduledSplit.tellerBudShare}% / {scheduledSplit.businessOwnerShare}%) effective {scheduledSplit.effectiveFromDisplay}.
              </p>

              <div className="space-y-1">
                <label htmlFor="textarea-cancel-reason" className="block font-semibold text-slate-700">
                  Mandatory Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="textarea-cancel-reason"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explain why this scheduled change is being cancelled..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <span className={`text-[10px] font-mono ${cancelReason.trim().length >= 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {cancelReason.trim().length}/10 chars min
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCancelScheduledModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                id="btn-confirm-cancel-scheduled"
                disabled={cancelReason.trim().length < 10}
                onClick={handleConfirmCancelScheduled}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueSplitSettingsPage;
