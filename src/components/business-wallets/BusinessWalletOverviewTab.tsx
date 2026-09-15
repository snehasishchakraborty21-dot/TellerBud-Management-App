import React from 'react';
import {
  ShieldCheck,
  Lock,
  Users,
  Inbox,
  ArrowRight,
  Eye,
  CheckCircle2,
  Circle,
  FileText,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  BusinessGlobalWallet,
  BusinessWalletReservation,
  BusinessWalletLedgerEntry,
  BusinessAgentRecord,
  BusinessAgentFundingRequest,
  BusinessWalletActivity,
  BusinessWalletDetailTab,
} from '../../types/businessWallet';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface BusinessWalletOverviewTabProps {
  wallet: BusinessGlobalWallet;
  activeReservations: BusinessWalletReservation[];
  agents: BusinessAgentRecord[];
  pendingFundingRequest?: BusinessAgentFundingRequest;
  recentLedger: BusinessWalletLedgerEntry[];
  lastActivity: BusinessWalletActivity;
  onSwitchTab: (tab: BusinessWalletDetailTab) => void;
  onViewFundingRequest: (req: BusinessAgentFundingRequest) => void;
}

export const BusinessWalletOverviewTab: React.FC<BusinessWalletOverviewTabProps> = ({
  wallet,
  activeReservations,
  agents,
  pendingFundingRequest,
  recentLedger,
  lastActivity,
  onSwitchTab,
  onViewFundingRequest,
}) => {
  const onlineAgentsCount = agents.filter((a) => a.status === 'Online').length;
  const offlineAgentsCount = agents.filter((a) => a.status === 'Offline').length;
  const recentThreeAgents = agents.slice(0, 3);
  const latestFiveLedger = recentLedger.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* =========================================================================
          ROW 1 — TWO EQUAL COLUMNS
          Left: Wallet Summary
          Right: Agent Overview
          Both cards begin and end at approximately the same vertical position
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* ROW 1 LEFT: WALLET SUMMARY */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#102025]">
                  Wallet Summary
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {wallet.state}
              </span>
            </div>

            <div className="divide-y divide-gray-100 text-xs mt-1">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Business Wallet ID</span>
                <span className="font-mono font-bold text-slate-800">
                  {wallet.walletId}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Business ID</span>
                <span className="font-mono font-bold text-slate-800">
                  {wallet.businessId}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Currency</span>
                <span className="font-semibold text-slate-800">
                  ZMW (Zambian Kwacha)
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Wallet State</span>
                <span className="font-semibold text-emerald-700">
                  {wallet.state}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Wallet Created Date</span>
                <span className="font-medium text-slate-700">14 Jan 2023</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Last Wallet Activity</span>
                <span className="font-medium text-slate-700">
                  {lastActivity.lastActivityTime}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Reconciliation Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 size={13} />
                  Automated Core Reconciled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 1 RIGHT: AGENT OVERVIEW */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#102025]">
                  Agent Overview
                </h2>
              </div>
            </div>

            {/* Four Compact Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              <div className="bg-slate-50 p-2 rounded-lg border border-gray-200/70 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Total Agents</div>
                <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
                  {agents.length}
                </div>
              </div>

              <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-200/60 text-center">
                <div className="text-[10px] text-emerald-700 font-medium">Online</div>
                <div className="text-sm sm:text-base font-bold font-mono text-emerald-700 mt-0.5">
                  {onlineAgentsCount}
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-gray-200/70 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Offline</div>
                <div className="text-sm sm:text-base font-bold font-mono text-slate-600 mt-0.5">
                  {offlineAgentsCount}
                </div>
              </div>

              <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-200/60 text-center">
                <div className="text-[10px] text-amber-800 font-medium leading-tight">
                  Pending Funding Requests
                </div>
                <div className="text-sm sm:text-base font-bold font-mono text-amber-700 mt-0.5">
                  {pendingFundingRequest ? 1 : 0}
                </div>
              </div>
            </div>

            {/* Recently Active Agents List */}
            <div className="space-y-1.5 mt-3 pt-2.5 border-t border-gray-100">
              <div className="text-[11px] font-semibold text-slate-500">
                Recently Active Agents
              </div>
              {recentThreeAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-2 bg-slate-50/70 rounded-lg border border-gray-200/60 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-[11px] flex items-center justify-center shrink-0">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {agent.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Agent ID: {agent.agentId}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {agent.status === 'Online' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <Circle size={7} className="text-slate-400" />
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2.5 mt-2.5 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => onSwitchTab('agents')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors cursor-pointer group"
            >
              <span>View All Agents</span>
              <ArrowRight
                size={13}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2 — TWO COLUMNS
          Left, ~60% width: Active Reservations
          Right, ~40% width: Pending Agent Funding Requests
          Both cards compact
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* ROW 2 LEFT (~60% width = lg:col-span-7): ACTIVE RESERVATIONS */}
        <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Lock size={15} />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#102025]">
                  Active Reservations
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 font-medium mr-1.5">
                  Total Reserved:
                </span>
                <span className="font-mono font-bold text-amber-700 text-xs sm:text-sm">
                  {formatZMW(wallet.reservedFunds)}
                </span>
              </div>
            </div>

            {/* Three Compact Reservation Records */}
            <div className="space-y-2 mt-3">
              {activeReservations.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  className="p-2.5 bg-slate-50/80 rounded-lg border border-gray-200/70 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {res.reference}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        {res.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 truncate">
                      {res.purpose}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                      {formatZMW(res.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2.5 mt-2.5 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => onSwitchTab('reservations')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors cursor-pointer group"
            >
              <span>View All Reservations</span>
              <ArrowRight
                size={13}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* ROW 2 RIGHT (~40% width = lg:col-span-5): PENDING AGENT FUNDING REQUESTS */}
        <div className="lg:col-span-5 bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Inbox size={15} />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-[#102025]">
                  Pending Agent Funding Requests
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                1 Pending
              </span>
            </div>

            {pendingFundingRequest ? (
              <div className="p-3 bg-slate-50/80 rounded-lg border border-gray-200/70 mt-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {pendingFundingRequest.reference}
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    {pendingFundingRequest.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  Agent: <span className="font-semibold text-slate-800">{pendingFundingRequest.agentName}</span>
                  <span className="font-mono text-slate-500 ml-1">({pendingFundingRequest.agentId})</span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Submitted: {pendingFundingRequest.submittedAt}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 mt-2">
                No pending agent funding requests at this time.
              </div>
            )}
          </div>

          {pendingFundingRequest && (
            <div className="pt-2.5 mt-2.5 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => onViewFundingRequest(pendingFundingRequest)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
              >
                <Eye size={13} />
                <span>View Request</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          ROW 3 — FULL WIDTH: RECENT LEDGER ACTIVITY
          Display the five recent ledger records across the full content width.
          Compact rows:
          - Left: Ledger reference and entry type
          - Centre: Description and timestamp
          - Right: Amount and resulting balance aligned on the right
          - Top-right: "View Full Ledger"
      ========================================================================= */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
              <FileText size={15} />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-[#102025]">
              Recent Ledger Activity
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab('ledger')}
            className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors cursor-pointer"
          >
            View Full Ledger
          </button>
        </div>

        {/* Five Recent Ledger Records Across Full Width */}
        <div className="divide-y divide-gray-100 text-xs mt-1">
          {latestFiveLedger.map((item) => {
            const isCredit = item.type === 'Credit';
            const isDebit = item.type === 'Debit';
            const isHold = item.type === 'Hold Memo';

            return (
              <div
                key={item.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 rounded-md px-1 transition-colors"
              >
                {/* Left: Ledger reference and entry type */}
                <div className="flex items-center gap-2 sm:w-56 shrink-0">
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {item.reference}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 whitespace-nowrap ${
                      isCredit
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isDebit
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isCredit && <ArrowDownLeft size={10} />}
                    {isDebit && <ArrowUpRight size={10} />}
                    {isHold && <Lock size={9} />}
                    {item.type}
                  </span>
                </div>

                {/* Centre: Description and timestamp */}
                <div className="flex-1 min-w-0 sm:px-3">
                  <div className="font-medium text-slate-800 truncate">
                    {item.description}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.date} • Counterparty: {item.counterparty}
                  </div>
                </div>

                {/* Right: Amount and resulting balance aligned on the right */}
                <div className="text-left sm:text-right sm:w-48 shrink-0">
                  <div
                    className={`font-mono font-bold text-xs sm:text-[13px] ${
                      isCredit
                        ? 'text-emerald-700'
                        : isDebit
                        ? 'text-rose-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {isCredit && '+'}
                    {isDebit && '-'}
                    {formatZMW(item.amount)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Resulting Bal: {formatZMW(item.resultingBalance)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ROW 4 — FULL WIDTH COMPACT CARD: LAST ACTIVITY
          Display information in one horizontal row:
          - Last Activity
          - Activity Type
          - Transaction Reference
          - Acting User
          - Acting User ID
          Not a tall card.
      ========================================================================= */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 text-xs">
          {/* 1. Last Activity */}
          <div className="sm:pr-3">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <Activity size={12} className="text-[#0D93AA]" />
              <span>Last Activity</span>
            </div>
            <div className="font-semibold text-slate-800 mt-1 truncate">
              {lastActivity.lastActivityTime}
            </div>
          </div>

          {/* 2. Activity Type */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-slate-500 font-medium">
              Activity Type
            </div>
            <div className="font-medium text-slate-700 mt-1 truncate">
              {lastActivity.activityType}
            </div>
          </div>

          {/* 3. Transaction Reference */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-slate-500 font-medium">
              Transaction Reference
            </div>
            <div className="font-mono font-bold text-slate-800 mt-1 truncate">
              {lastActivity.transactionReference}
            </div>
          </div>

          {/* 4. Acting User */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-slate-500 font-medium">
              Acting User
            </div>
            <div className="font-semibold text-slate-800 mt-1 truncate">
              {lastActivity.actingUser}
            </div>
          </div>

          {/* 5. Acting User ID */}
          <div className="pt-2 sm:pt-0 sm:pl-3">
            <div className="text-[11px] text-slate-500 font-medium">
              Acting User ID
            </div>
            <div className="font-mono text-slate-600 mt-1 truncate">
              {lastActivity.actingUserId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
