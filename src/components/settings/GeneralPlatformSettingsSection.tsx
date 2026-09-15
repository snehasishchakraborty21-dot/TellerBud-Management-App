import React from 'react';
import { Globe } from 'lucide-react';
import { SystemSettingsState } from '../../types/settings';
import { LockedBadge } from './LockedBadge';

interface GeneralPlatformSettingsSectionProps {
  settings: SystemSettingsState;
  isEditing: boolean;
  draftSettings: SystemSettingsState;
  onUpdateDraft: <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => void;
  isFieldModified?: (key: keyof SystemSettingsState) => boolean;
}

export const GeneralPlatformSettingsSection: React.FC<GeneralPlatformSettingsSectionProps> = ({
  settings,
  isEditing,
  draftSettings,
  onUpdateDraft,
  isFieldModified = () => false,
}) => {
  const current = isEditing ? draftSettings : settings;

  return (
    <div
      id="section-general-platform-settings"
      className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA]">
            <Globe className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            General Platform Settings
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Platform Name - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Platform Name</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold text-gray-900">{settings.platformName}</p>
        </div>

        {/* 2. Launch Market - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Launch Market</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold text-gray-900">{settings.launchMarket}</p>
        </div>

        {/* 3. Country Calling Code - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Country Calling Code</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold font-mono text-gray-900">{settings.countryCallingCode}</p>
        </div>

        {/* 4. Default Currency - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Default Currency</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold font-mono text-gray-900">{settings.defaultCurrency}</p>
        </div>

        {/* 5. Time Zone - Locked */}
        <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Time Zone</span>
            <LockedBadge />
          </div>
          <p className="text-sm font-bold text-gray-900">{settings.timeZone}</p>
        </div>

        {/* 6. Default Language - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('defaultLanguage')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-default-language" className="text-xs font-semibold text-gray-700">
              Default Language
            </label>
            {isEditing && (
              isFieldModified('defaultLanguage') ? (
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
              id="setting-default-language"
              value={current.defaultLanguage}
              onChange={(e) => onUpdateDraft('defaultLanguage', e.target.value)}
              className="w-full h-9 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-900 focus:border-[#0D93AA] focus:ring-1 focus:ring-[#0D93AA] focus:outline-none"
            >
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Swahili">Swahili</option>
            </select>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{settings.defaultLanguage}</p>
          )}
        </div>

        {/* 7. Date Format - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('dateFormat')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-date-format" className="text-xs font-semibold text-gray-700">
              Date Format
            </label>
            {isEditing && (
              isFieldModified('dateFormat') ? (
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
              id="setting-date-format"
              value={current.dateFormat}
              onChange={(e) => onUpdateDraft('dateFormat', e.target.value)}
              className="w-full h-9 text-xs sm:text-sm font-mono font-medium rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-900 focus:border-[#0D93AA] focus:ring-1 focus:ring-[#0D93AA] focus:outline-none"
            >
              <option value="DD MMM YYYY">DD MMM YYYY (e.g. 13 Sep 2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-13)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 13/09/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/13/2026)</option>
            </select>
          ) : (
            <p className="text-sm font-semibold font-mono text-gray-900">{settings.dateFormat}</p>
          )}
        </div>

        {/* 8. Time Format - Editable */}
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isEditing
            ? isFieldModified('timeFormat')
              ? 'border-[#0D93AA] bg-[#0D93AA]/5 ring-2 ring-[#0D93AA]/20'
              : 'border-[#0D93AA]/40 bg-white ring-1 ring-[#0D93AA]/20'
            : 'border-gray-200/70 bg-white'
        } space-y-1.5`}>
          <div className="flex items-center justify-between gap-1.5">
            <label htmlFor="setting-time-format" className="text-xs font-semibold text-gray-700">
              Time Format
            </label>
            {isEditing && (
              isFieldModified('timeFormat') ? (
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
              id="setting-time-format"
              value={current.timeFormat}
              onChange={(e) => onUpdateDraft('timeFormat', e.target.value)}
              className="w-full h-9 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-900 focus:border-[#0D93AA] focus:ring-1 focus:ring-[#0D93AA] focus:outline-none"
            >
              <option value="12-hour">12-hour (e.g. 11:55 AM)</option>
              <option value="24-hour">24-hour (e.g. 23:55)</option>
            </select>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{settings.timeFormat}</p>
          )}
        </div>
      </div>
    </div>
  );
};
