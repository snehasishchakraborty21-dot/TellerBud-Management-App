import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Lock,
  Ban,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { MOCK_BUSINESS_WALLETS, formatZMW } from '../data/mockBusinessWalletData';
import {
  MOCK_ACTIVE_RESERVATIONS,
  MOCK_BUSINESS_AGENTS,
  MOCK_AGENT_FUNDING_REQUESTS,
  INITIAL_LEDGER_ENTRIES,
  MOCK_WALLET_LAST_ACTIVITY,
} from '../data/mockBusinessWalletDetailsData';
import {
  BusinessGlobalWallet,
  BusinessWalletDetailTab,
  BusinessWalletLedgerEntry,
  BusinessAgentFundingRequest,
  BusinessWalletReservation,
} from '../types/businessWallet';
import { BusinessWalletTabs } from '../components/business-wallets/BusinessWalletTabs';
import { BusinessWalletOverviewTab } from '../components/business-wallets/BusinessWalletOverviewTab';
import { BusinessWalletLedgerTab } from '../components/business-wallets/BusinessWalletLedgerTab';
import { BusinessWalletReservationsTab } from '../components/business-wallets/BusinessWalletReservationsTab';
import { BusinessWalletFundingRequestsTab } from '../components/business-wallets/BusinessWalletFundingRequestsTab';
import { BusinessWalletAgentsTab } from '../components/business-wallets/BusinessWalletAgentsTab';
import { FundBusinessWalletModal } from '../components/business-wallets/FundBusinessWalletModal';
import { AgentFundingRequestModal } from '../components/business-wallets/AgentFundingRequestModal';

export const BusinessGlobalWalletDetailPage: React.FC = () => {
  const { walletId } = useParams<{ walletId: string }>();
  const navigate = useNavigate();

  // Find initial wallet record from registry (default to Lusaka Central Express Agency if matching or fallback)
  const initialWallet =
    MOCK_BUSINESS_WALLETS.find(
      (w) => w.walletId === walletId || w.id === walletId
    ) || MOCK_BUSINESS_WALLETS.find((w) => w.walletId === 'TB-BWL-1007') || MOCK_BUSINESS_WALLETS[6];

  // Local state for interactive wallet balance updates without reload
  const [wallet, setWallet] = useState<BusinessGlobalWallet>(initialWallet);
  const [activeTab, setActiveTab] = useState<BusinessWalletDetailTab>('overview');
  const [ledgerEntries, setLedgerEntries] = useState<BusinessWalletLedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [fundingRequests, setFundingRequests] = useState<BusinessAgentFundingRequest[]>(MOCK_AGENT_FUNDING_REQUESTS);
  const [reservations] = useState<BusinessWalletReservation[]>(MOCK_ACTIVE_RESERVATIONS);

  // Modals state
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [selectedFundingRequest, setSelectedFundingRequest] = useState<BusinessAgentFundingRequest | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!wallet) {
    return (
      <div className="max-w-[1536px] mx-auto p-4 sm:p-6 pb-28">
        <div className="bg-white border border-gray-200/90 rounded-xl p-8 text-center shadow-xs">
          <Building2 size={32} className="mx-auto text-slate-400 mb-2" />
          <h2 className="text-base font-semibold text-slate-800">
            Business Wallet Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            The requested business wallet ({walletId}) could not be located in the authoritative registry.
          </p>
          <Link
            to="/business-global-wallets"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Business Global Wallets
          </Link>
        </div>
      </div>
    );
  }

  // Handle funding completion from modal
  const handleFundSuccess = (newEntry: BusinessWalletLedgerEntry, fundedAmount: number) => {
    // 1. Maintain: Posted Ledger Balance = Available Balance + Reserved Funds
    setWallet((prev) => ({
      ...prev,
      postedBalance: prev.postedBalance + fundedAmount,
      availableBalance: prev.availableBalance + fundedAmount,
    }));

    // 2. Prepend immutable ledger entry
    setLedgerEntries((prev) => [newEntry, ...prev]);

    // 3. Close modal & show toast
    setIsFundModalOpen(false);
    setSuccessToast(`Successfully funded wallet with ${formatZMW(fundedAmount)}. Immutable ledger entry recorded.`);

    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);
  };

  // Handle approving an agent funding request
  const handleApproveRequest = (requestId: string) => {
    setFundingRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'Approved' } : req))
    );
    setSuccessToast('Agent funding request approved.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Handle dispatching float for an agent funding request
  const handleDispatchFloat = (requestId: string) => {
    setFundingRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'Dispatched' } : req))
    );
    setSuccessToast('Agent float dispatch recorded.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const pendingFundingCount = fundingRequests.filter((r) => r.status === 'Pending Review').length;
  const activeReservationsCount = reservations.filter((r) => r.status === 'Active').length;

  return (
    <div className="max-w-[1536px] mx-auto p-4 sm:p-5 space-y-4 pb-36 sm:pb-40">
      {/* PAGE NAVIGATION: Keep one "Back to Business Global Wallets" link below the page title */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/business-global-wallets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0D93AA] transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Business Global Wallets</span>
        </Link>

        {/* Optional quick status banner if wallet updated */}
        {successToast && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <span>{successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="p-0.5 text-emerald-600 hover:text-emerald-900 ml-1 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* BUSINESS HEADER
          Display:
          - Business: Lusaka Central Express Agency
          - Business initials: LC
          - Business ID: BIZ-LUS-001
          - Wallet ID: TB-BWL-1007
          - Owner: Chileshe Mwamba
          - Owner ID: USR-BO-001
          - Wallet State: Active
          Actions:
          - "View Business Profile" button
          - "Fund Business Wallet" primary button
          (Duplicate "Back to List" button removed)
      */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#0D93AA]/10 border border-[#0D93AA]/20 text-[#0D93AA] font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
            {wallet.businessInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[#102025] truncate">
                {wallet.businessName}
              </h1>
              {wallet.state === 'Active' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Active
                </span>
              )}
              {wallet.state === 'Pending' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  Pending
                </span>
              )}
              {wallet.state === 'Suspended' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 shrink-0">
                  <Ban size={11} className="text-slate-500" />
                  Suspended
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1 flex-wrap">
              <span>Business ID: {wallet.businessId}</span>
              <span>•</span>
              <span>Wallet ID: {wallet.walletId}</span>
              <span>•</span>
              <span>Owner: {wallet.ownerName} ({wallet.ownerId})</span>
            </div>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <Link
            to={`/super-admin/people/businesses/${wallet.businessId}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <ExternalLink size={13} className="text-slate-500" />
            <span>View Business Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsFundModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <PlusCircle size={14} />
            <span>Fund Business Wallet</span>
          </button>
        </div>
      </div>

      {/* BALANCE CARDS
          Three cards:
          1. Posted Ledger Balance: ZMW 164,350.00
          2. Available Balance: ZMW 145,900.00
          3. Reserved Funds: ZMW 18,450.00
          Supporting sentences below these amounts are removed.
          Maintains: Posted Ledger Balance = Available Balance + Reserved Funds
      */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Posted Ledger Balance
          </div>
          <div className="text-xl font-bold font-mono text-[#102025]">
            {formatZMW(wallet.postedBalance)}
          </div>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Available Balance
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {formatZMW(wallet.availableBalance)}
          </div>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Reserved Funds
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">
            {formatZMW(wallet.reservedFunds)}
          </div>
        </div>
      </div>

      {/* DETAIL TABS: Overview, Ledger, Reservations, Funding Requests, Agents */}
      <BusinessWalletTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        reservationsCount={activeReservationsCount}
        pendingFundingCount={pendingFundingCount}
        agentsCount={MOCK_BUSINESS_AGENTS.length}
      />

      {/* TAB CONTENTS (Placed immediately below tabs, full-width, no large blank space) */}
      <div className="transition-opacity duration-150">
        {activeTab === 'overview' && (
          <BusinessWalletOverviewTab
            wallet={wallet}
            activeReservations={reservations}
            agents={MOCK_BUSINESS_AGENTS}
            pendingFundingRequest={fundingRequests[0]}
            recentLedger={ledgerEntries}
            lastActivity={MOCK_WALLET_LAST_ACTIVITY}
            onSwitchTab={(tab) => setActiveTab(tab)}
            onViewFundingRequest={(req) => setSelectedFundingRequest(req)}
          />
        )}

        {activeTab === 'ledger' && (
          <BusinessWalletLedgerTab ledgerEntries={ledgerEntries} />
        )}

        {activeTab === 'reservations' && (
          <BusinessWalletReservationsTab reservations={reservations} />
        )}

        {activeTab === 'funding-requests' && (
          <BusinessWalletFundingRequestsTab
            requests={fundingRequests}
            onViewRequest={(req) => setSelectedFundingRequest(req)}
          />
        )}

        {activeTab === 'agents' && (
          <BusinessWalletAgentsTab agents={MOCK_BUSINESS_AGENTS} />
        )}
      </div>

      {/* Controlled Wallet Funding Modal */}
      {isFundModalOpen && (
        <FundBusinessWalletModal
          wallet={wallet}
          onClose={() => setIsFundModalOpen(false)}
          onSuccess={handleFundSuccess}
        />
      )}

      {/* View Agent Funding Request Modal */}
      {selectedFundingRequest && (
        <AgentFundingRequestModal
          request={selectedFundingRequest}
          onClose={() => setSelectedFundingRequest(null)}
          onApprove={handleApproveRequest}
          onDispatch={handleDispatchFloat}
        />
      )}
    </div>
  );
};
