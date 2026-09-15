import React, { useState, useMemo, useCallback } from 'react';
import {
  MOCK_RECONCILIATION_RECORDS,
  MOCK_CALLBACK_EVENTS,
  MOCK_API_CONNECTIONS,
} from '../data/mockReconciliationData';
import {
  ReconciliationFilterState,
  ReconciliationFilterToolbar,
} from '../components/reconciliation/ReconciliationFilterToolbar';
import { ReconciliationSummaryCards } from '../components/reconciliation/ReconciliationSummaryCards';
import { ProviderApiStatusCards } from '../components/reconciliation/ProviderApiStatusCards';
import { ReconciliationTable } from '../components/reconciliation/ReconciliationTable';
import { CallbackEventsTable } from '../components/reconciliation/CallbackEventsTable';
import { ApiConnectionsTab } from '../components/reconciliation/ApiConnectionsTab';
import { CheckCheck, Radio, Webhook } from 'lucide-react';

export const ApiLedgerReconciliationPage: React.FC = () => {
  // 1. Active Tab: 'reconciliation' | 'callbacks' | 'connections'
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'callbacks' | 'connections'>(
    'reconciliation'
  );

  // 2. Filters
  const [filters, setFilters] = useState<ReconciliationFilterState>({
    search: '',
    provider: 'ALL',
    transactionType: 'ALL',
    providerStatus: 'ALL',
    reconciliationStatus: 'ALL',
    dateFrom: '',
    dateTo: '',
  });

  // 3. Refreshing state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleFilterChange = useCallback((newFilters: Partial<ReconciliationFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      provider: 'ALL',
      transactionType: 'ALL',
      providerStatus: 'ALL',
      reconciliationStatus: 'ALL',
      dateFrom: '',
      dateTo: '',
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return MOCK_RECONCILIATION_RECORDS.filter((rec) => {
      // 1. Search: reconciliation ref, transaction ref, wallet ID, or holder name
      if (filters.search.trim() !== '') {
        const q = filters.search.toLowerCase().trim();
        const matchesRef = rec.reconciliationRef.toLowerCase().includes(q);
        const matchesTx = rec.transactionRef.toLowerCase().includes(q);
        const matchesWallet = rec.walletId.toLowerCase().includes(q);
        const matchesHolder = rec.holderName.toLowerCase().includes(q);
        if (!matchesRef && !matchesTx && !matchesWallet && !matchesHolder) {
          return false;
        }
      }

      // 2. Provider
      if (filters.provider !== 'ALL' && rec.provider !== filters.provider) {
        return false;
      }

      // 3. Transaction Type
      if (
        filters.transactionType !== 'ALL' &&
        rec.transactionType !== filters.transactionType
      ) {
        return false;
      }

      // 4. Provider Status
      if (
        filters.providerStatus !== 'ALL' &&
        rec.providerResponse !== filters.providerStatus
      ) {
        return false;
      }

      // 5. Reconciliation Status
      if (
        filters.reconciliationStatus !== 'ALL' &&
        rec.reconciliation !== filters.reconciliationStatus
      ) {
        return false;
      }

      // 6. Date From
      if (filters.dateFrom) {
        const itemTime = new Date(rec.rawDate).getTime();
        const fromTime = new Date(filters.dateFrom).getTime();
        if (itemTime < fromTime) {
          return false;
        }
      }

      // 7. Date To
      if (filters.dateTo) {
        const itemTime = new Date(rec.rawDate).getTime();
        const toTime = new Date(filters.dateTo).getTime() + 86400000;
        if (itemTime > toTime) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Export records (strictly the currently filtered dataset)
  const handleExport = useCallback(() => {
    const headers = [
      'Reconciliation Reference',
      'Created At',
      'Transaction Reference',
      'Transaction Type',
      'Holder Name',
      'Wallet ID',
      'Wallet Type',
      'Provider',
      'Amount (ZMW)',
      'Provider Response',
      'Ledger Result',
      'Reconciliation Status',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.reconciliationRef}"`,
      `"${r.createdAt}"`,
      `"${r.transactionRef}"`,
      `"${r.transactionType}"`,
      `"${r.holderName.replace(/"/g, '""')}"`,
      `"${r.walletId}"`,
      `"${r.walletType}"`,
      `"${r.provider}"`,
      r.amount.toFixed(2),
      `"${r.providerResponse}"`,
      `"${r.ledgerResult}"`,
      `"${r.reconciliation}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `tellerbud-reconciliation-records-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredRecords]);

  return (
    <div className="w-full max-w-[1536px] mx-auto p-4 sm:p-5 space-y-4 pb-28">
      {/* 1. Summary Cards (One row, 5 cards, label/value/icon only) */}
      <ReconciliationSummaryCards
        providerApis={2}
        operationalApis={2}
        pendingResponses={4}
        reconciledToday={26}
        reconciliationExceptions={2}
      />

      {/* 2. Provider API Status (Two compact cards: MTN & Airtel) */}
      <ProviderApiStatusCards />

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'reconciliation'
              ? 'border-[#0D93AA] text-[#0D93AA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCheck size={14} />
          <span>Reconciliation Records</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'reconciliation'
                ? 'bg-[#0D93AA]/10 text-[#0D93AA]'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {MOCK_RECONCILIATION_RECORDS.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('callbacks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'callbacks'
              ? 'border-[#0D93AA] text-[#0D93AA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Webhook size={14} />
          <span>Callback Events</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'callbacks'
                ? 'bg-[#0D93AA]/10 text-[#0D93AA]'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {MOCK_CALLBACK_EVENTS.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'connections'
              ? 'border-[#0D93AA] text-[#0D93AA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio size={14} />
          <span>API Connections</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'connections'
                ? 'bg-[#0D93AA]/10 text-[#0D93AA]'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {MOCK_API_CONNECTIONS.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-4">
          {/* 4. Filters Toolbar */}
          <ReconciliationFilterToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onRefresh={handleRefresh}
            onExport={handleExport}
            isRefreshing={isRefreshing}
            filteredCount={filteredRecords.length}
            totalCount={MOCK_RECONCILIATION_RECORDS.length}
          />

          {/* 5. Reconciliation Table with Pagination */}
          <ReconciliationTable
            records={filteredRecords}
            totalRecordsCount={MOCK_RECONCILIATION_RECORDS.length}
          />
        </div>
      )}

      {activeTab === 'callbacks' && (
        <div className="space-y-4">
          <CallbackEventsTable events={MOCK_CALLBACK_EVENTS} />
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="space-y-4">
          <ApiConnectionsTab connections={MOCK_API_CONNECTIONS} />
        </div>
      )}
    </div>
  );
};
