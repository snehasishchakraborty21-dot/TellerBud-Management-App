import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { SystemSettingsState } from '../../types/settings';
import { LockedBadge } from './LockedBadge';
import { ToggleSwitch } from './ToggleSwitch';

interface AuthSessionSecuritySectionProps {
  settings: SystemSettingsState;
  isEditing: boolean;
  draftSettings: SystemSettingsState;
  onUpdateDraft: <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => void;
  isFieldModified?: (key: keyof SystemSettingsState) => boolean;
}

export const AuthSessionSecuritySection: React.FC<AuthSessionSecuritySectionProps> = ({
  settings,
  isEditing,
  draftSettings,
  onUpdateDraft,
  isFieldModified = () => false,
}) => {
  const current = isEditing ? draftSettings : settings;

  return (
    <div
      id="section-authentication-session-security"
      className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Authentication & Session Security
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Customer Authentication - Locked (NO "Password") */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Customer Authentication</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold text-gray-900">{settings.customerAuthMethod}</p>
        </div>

        {/* 2. Mandatory Security Questions - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Mandatory Security Questions</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold text-gray-900">{settings.mandatorySecurityQuestions}</p>
        </div>

        {/* 3. Maximum Failed Sign-In Attempts - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('maxFailedSignInAttempts')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-max-failed-attempts" className="text-xs font-semibold text-gray-700">
              Maximum Failed Sign-In Attempts
            </label>
            {isEditing && (
              isFieldModified('maxFailedSignInAttempts') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <select
              id="setting-max-failed-attempts"
              value={current.maxFailedSignInAttempts}
              onChange={(e) => onUpdateDraft('maxFailedSignInAttempts', Number(e.target.value))}
              className="w-full h-9 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-900 focus:border-[#0D93AA] focus:ring-1 focus:ring-[#0D93AA] focus:outline-none"
            >
              <option value={3}>3 attempts</option>
              <option value={5}>5 attempts (Recommended)</option>
              <option value={10}>10 attempts</option>
            </select>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{settings.maxFailedSignInAttempts} attempts</p>
          )}
          <p className="text-[11px] text-gray-500">Threshold before temporary passcode lockout.</p>
        </div>

        {/* 4. Temporary Account Lock Duration - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('tempAccountLockDurationMinutes')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-account-lock-duration" className="text-xs font-semibold text-gray-700">
              Temporary Account Lock Duration
            </label>
            {isEditing && (
              isFieldModified('tempAccountLockDurationMinutes') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <select
              id="setting-account-lock-duration"
              value={current.tempAccountLockDurationMinutes}
              onChange={(e) => onUpdateDraft('tempAccountLockDurationMinutes', Number(e.target.value))}
              className="w-full h-9 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-900 focus:border-[#0D93AA] focus:ring-1 focus:ring-[#0D93AA] focus:outline-none"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes (Standard)</option>
              <option value={60}>60 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{settings.tempAccountLockDurationMinutes} minutes</p>
          )}
          <p className="text-[11px] text-gray-500">Brute-force lockout cooldown interval.</p>
        </div>

        {/* 5. Admin Session Timeout - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('adminSessionTimeoutMinutes')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-admin-session-timeout" className="text-xs font-semibold text-gray-700">
              Admin Session Timeout
            </label>
            {isEditing && (
              isFieldModified('adminSessionTimeoutMinutes') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <select
              id="setting-admin-session-timeout"
              value={current.adminSessionTimeoutMinutes}
              onChange={(e) => onUpdateDraft('adminSessionTimeoutMinutes', Number(e.target.value))}
              className="w-full h-9 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-900 focus:border-[#0D93AA] focus:ring-1 focus:ring-[#0D93AA] focus:outline-none"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{settings.adminSessionTimeoutMinutes} minutes</p>
          )}
          <p className="text-[11px] text-gray-500">Idle duration before re-prompting admin credentials.</p>
        </div>

        {/* 6. Re-authentication for Critical Actions - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('reauthForCriticalActions')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-reauth-critical-actions" className="text-xs font-semibold text-gray-700">
              Re-authentication for Critical Actions
            </label>
            {isEditing && (
              isFieldModified('reauthForCriticalActions') ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D93AA]/15 text-[#0D93AA] border border-[#0D93AA]/30">
                  Changed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#0D93AA] uppercase tracking-wider">
                  Editable
                </span>
              )
            )}
          </div>
          {isEditing ? (
            <div className="pt-1.5">
              <ToggleSwitch
                id="setting-reauth-critical-actions"
                checked={current.reauthForCriticalActions}
                onChange={(checked) => onUpdateDraft('reauthForCriticalActions', checked)}
                label={current.reauthForCriticalActions ? 'Enabled' : 'Disabled'}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`w-2 h-2 rounded-full ${settings.reauthForCriticalActions ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <p className="text-sm font-semibold text-gray-900">
                {settings.reauthForCriticalActions ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-500">Requires Super Admin re-authentication before critical administrative actions.</p>
        </div>
      </div>
    </div>
  );
};
