import React from 'react';
import { MtnLogo, AirtelLogo } from '../wallet/ProviderLogos';
import { CheckCircle2, Radio, Activity } from 'lucide-react';

export const ProviderApiStatusCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* MTN Mobile Money */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <MtnLogo className="w-9 h-9 rounded-lg shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-[#102025]">MTN Mobile Money</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                <Radio size={11} className="text-emerald-500 animate-pulse" />
                <span>Direct B2B Gateway</span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3.5 text-xs">
          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Collections API</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              <span>Operational</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Payout API</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              <span>Operational</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Callback Endpoint</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              <span>Operational</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Last Callback</span>
            <span className="mt-1 block font-semibold text-slate-800">
              Today, 11:48 AM
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Success Rate</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
              <Activity size={13} />
              <span>99.4%</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Integration Mode</span>
            <span className="mt-1 block font-semibold text-slate-800">
              Direct REST API
            </span>
          </div>
        </div>
      </div>

      {/* Airtel Money */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <AirtelLogo className="w-9 h-9 rounded-lg shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-[#102025]">Airtel Money</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                <Radio size={11} className="text-emerald-500 animate-pulse" />
                <span>Direct Merchant Gateway</span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3.5 text-xs">
          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Collections API</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              <span>Operational</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Payout API</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              <span>Operational</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Callback Endpoint</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              <span>Operational</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Last Callback</span>
            <span className="mt-1 block font-semibold text-slate-800">
              Today, 11:42 AM
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Success Rate</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
              <Activity size={13} />
              <span>98.9%</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Integration Mode</span>
            <span className="mt-1 block font-semibold text-slate-800">
              Merchant REST API
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
