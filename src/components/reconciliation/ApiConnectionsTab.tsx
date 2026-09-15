import React from 'react';
import {
  CheckCircle2,
  Globe,
  Radio,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { ApiConnection } from '../../types/reconciliation';
import { MtnLogo, AirtelLogo } from '../wallet/ProviderLogos';

interface ApiConnectionsTabProps {
  connections: ApiConnection[];
}

export const ApiConnectionsTab: React.FC<ApiConnectionsTabProps> = ({ connections }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-xs space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {conn.provider === 'MTN Mobile Money' ? (
                  <MtnLogo className="w-10 h-10 rounded-lg shrink-0" />
                ) : (
                  <AirtelLogo className="w-10 h-10 rounded-lg shrink-0" />
                )}
                <div>
                  <h3 className="text-base font-bold text-[#102025]">
                    {conn.provider}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Radio size={12} className="text-emerald-500 animate-pulse" />
                    <span>{conn.protocol}</span>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {conn.status}
              </span>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Avg Latency
                </span>
                <span className="text-sm font-bold text-[#102025] font-mono mt-0.5 block">
                  {conn.avgResponseTimeMs}ms
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Success Rate
                </span>
                <span className="text-sm font-bold text-emerald-600 font-mono mt-0.5 block">
                  {conn.successRate}%
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Target Uptime
                </span>
                <span className="text-sm font-bold text-[#102025] font-mono mt-0.5 block">
                  {conn.uptime}
                </span>
              </div>
            </div>

            {/* Endpoints & Status */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Zap size={13} className="text-[#0D93AA]" />
                    <span>Collections API (Deposit)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {conn.collectionsEndpoint}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} />
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Globe size={13} className="text-[#0D93AA]" />
                    <span>Payout API (Disbursement)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {conn.payoutEndpoint}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} />
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Shield size={13} className="text-[#0D93AA]" />
                    <span>Callback Webhook Receiver</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {conn.callbackEndpoint}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} />
                  Operational
                </span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Last Request: {conn.lastSuccessfulRequest}</span>
              </div>
              <div>
                <span>Last Callback: {conn.lastSuccessfulCallback}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
