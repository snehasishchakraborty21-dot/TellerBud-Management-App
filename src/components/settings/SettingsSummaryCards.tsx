import React from 'react';
import { Activity, Globe, Coins, Clock } from 'lucide-react';

interface SettingsSummaryCardsProps {
  platformStatus?: string;
  launchMarket?: string;
  defaultCurrency?: string;
  timeZoneName?: string;
  timeZoneAbbr?: string;
}

export const SettingsSummaryCards: React.FC<SettingsSummaryCardsProps> = ({
  platformStatus = 'Operational',
  launchMarket = 'Zambia',
  defaultCurrency = 'ZMW',
  timeZoneName = 'Africa/Lusaka',
  timeZoneAbbr = 'CAT',
}) => {
  return (
    <div
      id="system-settings-summary-cards"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full"
    >
      {/* 1. Platform Status */}
      <div
        id="card-platform-status"
        className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 transition-all"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Platform Status</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {platformStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Launch Market */}
      <div
        id="card-launch-market"
        className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 transition-all"
      >
        <div className="w-11 h-11 rounded-xl bg-[#0D93AA]/10 border border-[#0D93AA]/25 flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5 text-[#0D93AA]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Launch Market</p>
          <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
            {launchMarket}
          </p>
        </div>
      </div>

      {/* 3. Default Currency */}
      <div
        id="card-default-currency"
        className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 transition-all"
      >
        <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
          <Coins className="w-5 h-5 text-[#0D93AA]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Default Currency</p>
          <p className="text-base sm:text-lg font-bold text-gray-900 font-mono truncate">
            {defaultCurrency}
          </p>
        </div>
      </div>

      {/* 4. Time Zone */}
      <div
        id="card-timezone"
        className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 transition-all"
      >
        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-slate-700" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Time Zone</p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {timeZoneName}
            </span>
            <span className="text-xs font-bold text-gray-500 font-mono">
              ({timeZoneAbbr})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
