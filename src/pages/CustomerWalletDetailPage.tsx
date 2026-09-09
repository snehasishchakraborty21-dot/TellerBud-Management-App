import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Wallet,
  FileText,
  Lock,
  PlusCircle,
  TrendingDown,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { getCustomerWalletById } from '../data/mockCustomerWalletData';
import {
  getCustomerWalletReservations,
  getCustomerWalletLedger,
  getCustomerWalletAddFunds,
  getCustomerWalletWithdrawals,
} from '../data/mockCustomerWalletDetailsData';
import {
  CustomerWalletReservation,
  CustomerWalletLedgerEntry,
  CustomerWalletAddFundsRecord,
} from '../types/customerWallet';
import { CustomerWalletHeader } from '../components/customerWallets/CustomerWalletHeader';
import { CustomerWalletBalanceCards } from '../components/customerWallets/CustomerWalletBalanceCards';
import { CustomerWalletOverviewTab } from '../components/customerWallets/CustomerWalletOverviewTab';
import { CustomerWalletLedgerTab } from '../components/customerWallets/CustomerWalletLedgerTab';
import { CustomerWalletReservationsTab } from '../components/customerWallets/CustomerWalletReservationsTab';
import { CustomerWalletAddFundsTab } from '../components/customerWallets/CustomerWalletAddFundsTab';
import { CustomerWalletWithdrawalsTab } from '../components/customerWallets/CustomerWalletWithdrawalsTab';
import { FundingTimelineModal } from '../components/customerWallets/FundingTimelineModal';
import { LedgerAuditModal } from '../components/customerWallets/LedgerAuditModal';
import { ReservationDetailModal } from '../components/customerWallets/ReservationDetailModal';

type DetailTab = 'overview' | 'ledger' | 'reservations' | 'add-funds' | 'withdrawals';

export const CustomerWalletDetailPage: React.FC = () => {
  const { walletId } = useParams<{ walletId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state synchronized with URL query parameter (e.g. ?tab=ledger)
  const initialTab = (searchParams.get('tab') as DetailTab) || 'overview';
  const [activeTab, setActiveTab] = useState<DetailTab>(
    ['overview', 'ledger', 'reservations', 'add-funds', 'withdrawals'].includes(initialTab)
      ? initialTab
      : 'overview'
  );

  // Sync tab changes with URL query parameter without full app reloads
  const handleTabChange = (newTab: DetailTab) => {
    setActiveTab(newTab);
    const newParams = new URLSearchParams(searchParams);
    if (newTab === 'overview') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', newTab);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Find wallet record
  const wallet = useMemo(() => {
    return walletId ? getCustomerWalletById(walletId) : undefined;
  }, [walletId]);

  // Tab details data
  const reservations = useMemo(() => {
    return wallet ? getCustomerWalletReservations(wallet.walletId) : [];
  }, [wallet]);

  const ledger = useMemo(() => {
    return wallet ? getCustomerWalletLedger(wallet.walletId) : [];
  }, [wallet]);

  const addFunds = useMemo(() => {
    return wallet ? getCustomerWalletAddFunds(wallet.walletId) : [];
  }, [wallet]);

  const withdrawals = useMemo(() => {
    return wallet ? getCustomerWalletWithdrawals(wallet.walletId) : [];
  }, [wallet]);

  // Modal states
  const [selectedFundingRecord, setSelectedFundingRecord] = useState<CustomerWalletAddFundsRecord | null>(null);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<CustomerWalletLedgerEntry | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<CustomerWalletReservation | null>(null);

  // Back button preserves previous filters/search/sort state
  const handleBack = () => {
    const fromSearch = (location.state as { fromSearch?: string } | null)?.fromSearch || '';
    navigate(`/super-admin/wallets/customers${fromSearch}`);
  };

  if (!wallet) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="bg-white border border-gray-200/80 rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Wallet size={22} />
          </div>
          <h2 className="text-base font-bold text-[#102025] mb-1">
            Wallet Record Not Found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Could not find a customer wallet for ID: <span className="font-mono font-bold text-slate-700">{walletId}</span>.
          </p>
          <button
            type="button"
            onClick={() => navigate('/super-admin/wallets/customers')}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0D93AA] text-white hover:bg-[#0b788b] transition-colors"
          >
            Return to Customer Wallets
          </button>
        </div>
      </div>
    );
  }

  const tabItems: { id: DetailTab; label: string; icon: React.FC<{ size?: number; className?: string }>; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ledger', label: 'Ledger', icon: FileText, count: ledger.length },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: Lock,
      count: reservations.filter((r) => r.status === 'Active').length || undefined,
    },
    { id: 'add-funds', label: 'Add Funds', icon: PlusCircle, count: addFunds.length },
    {
      id: 'withdrawals',
      label: 'Withdrawals',
      icon: TrendingDown,
      count: withdrawals.filter((w) => w.status === 'Pending Review' || w.status === 'Approved' || w.status === 'Processing').length || undefined,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header (Identity, IDs, Status badges, Health, "View Customer Profile" internal link) */}
      <CustomerWalletHeader wallet={wallet} onBack={handleBack} />

      {/* 2. Balance Cards (Posted Ledger Balance, Available Balance, Reserved Funds — no captions) */}
      <CustomerWalletBalanceCards
        walletBalance={wallet.walletBalance}
        availableBalance={wallet.availableBalance}
        reservedFunds={wallet.reservedFunds}
      />

      {/* 3. Five Full-Width Navigation Tabs (Does not reload page) */}
      <div className="border-b border-gray-200/80 bg-white rounded-t-xl px-4 pt-1 shadow-2xs">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar" aria-label="Wallet Detail Tabs">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-3.5 px-3.5 inline-flex items-center gap-2 border-b-2 text-xs font-semibold transition-colors whitespace-nowrap group ${
                  isActive
                    ? 'border-[#0D93AA] text-[#0D93AA]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon
                  size={15}
                  className={`transition-colors ${
                    isActive ? 'text-[#0D93AA]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-[#0D93AA]/10 text-[#0D93AA]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Active Tab Content Pane */}
      <div className="transition-opacity duration-150">
        {activeTab === 'overview' && (
          <CustomerWalletOverviewTab
            wallet={wallet}
            reservations={reservations}
            ledger={ledger}
            addFunds={addFunds}
            withdrawals={withdrawals}
            onSwitchTab={handleTabChange}
            onSelectAddFunds={(rec) => setSelectedFundingRecord(rec)}
            onSelectLedger={(ent) => setSelectedLedgerEntry(ent)}
            onSelectReservation={(res) => setSelectedReservation(res)}
          />
        )}

        {activeTab === 'ledger' && (
          <CustomerWalletLedgerTab
            ledger={ledger}
            onSelectEntry={(ent) => setSelectedLedgerEntry(ent)}
          />
        )}

        {activeTab === 'reservations' && (
          <CustomerWalletReservationsTab
            reservations={reservations}
            onSelectReservation={(res) => setSelectedReservation(res)}
          />
        )}

        {activeTab === 'add-funds' && (
          <CustomerWalletAddFundsTab
            addFunds={addFunds}
            onSelectRecord={(rec) => setSelectedFundingRecord(rec)}
          />
        )}

        {activeTab === 'withdrawals' && (
          <CustomerWalletWithdrawalsTab
            withdrawals={withdrawals}
          />
        )}
      </div>

      {/* Modals */}
      {selectedFundingRecord && (
        <FundingTimelineModal
          record={selectedFundingRecord}
          onClose={() => setSelectedFundingRecord(null)}
          onNavigateToLedger={() => {
            setSelectedFundingRecord(null);
            handleTabChange('ledger');
          }}
        />
      )}

      {selectedLedgerEntry && (
        <LedgerAuditModal
          entry={selectedLedgerEntry}
          onClose={() => setSelectedLedgerEntry(null)}
        />
      )}

      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};
