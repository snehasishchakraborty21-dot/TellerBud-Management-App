import React, { useState, useMemo, useCallback } from 'react';
import {
  MOCK_AUTHORITATIVE_LEDGER,
  MOCK_LEDGER_KPIS,
} from '../data/mockWalletLedgerData';
import {
  AuthoritativeLedgerRecord,
  LedgerSummaryKPIs,
} from '../types/walletLedger';
import { WalletLedgerKPICards } from '../components/wallet-ledger/WalletLedgerKPICards';
import {
  WalletLedgerFilters,
  WalletLedgerFilterState,
} from '../components/wallet-ledger/WalletLedgerFilters';
import { WalletLedgerTable } from '../components/wallet-ledger/WalletLedgerTable';

export const WalletLedgerPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<WalletLedgerFilterState>({
    search: '',
    walletType: 'ALL',
    entryType: 'ALL',
    direction: 'ALL',
    reconciliation: 'ALL',
    dateFrom: '',
    dateTo: '',
  });

  // Loading / refreshing state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter handlers
  const handleFilterChange = useCallback(
    (newFilters: Partial<WalletLedgerFilterState>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      walletType: 'ALL',
      entryType: 'ALL',
      direction: 'ALL',
      reconciliation: 'ALL',
      dateFrom: '',
      dateTo: '',
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, []);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return MOCK_AUTHORITATIVE_LEDGER.filter((item) => {
      // 1. Search: ledger reference, wallet ID, holder or source reference
      if (filters.search.trim() !== '') {
        const query = filters.search.toLowerCase().trim();
        const matchesRef = item.ledgerEntry.toLowerCase().includes(query);
        const matchesWallet = item.walletId.toLowerCase().includes(query);
        const matchesHolder = item.holderName.toLowerCase().includes(query);
        const matchesSource = item.sourceReference.toLowerCase().includes(query);
        const matchesOrig = item.originalLedgerReference
          ? item.originalLedgerReference.toLowerCase().includes(query)
          : false;

        if (!matchesRef && !matchesWallet && !matchesHolder && !matchesSource && !matchesOrig) {
          return false;
        }
      }

      // 2. Wallet Type
      if (filters.walletType !== 'ALL') {
        if (item.walletType !== filters.walletType) {
          return false;
        }
      }

      // 3. Entry Type
      if (filters.entryType !== 'ALL') {
        if (item.entryType !== filters.entryType) {
          return false;
        }
      }

      // 4. Direction
      if (filters.direction !== 'ALL') {
        if (item.direction !== filters.direction) {
          return false;
        }
      }

      // 5. Reconciliation State
      if (filters.reconciliation !== 'ALL') {
        if (item.reconciliation !== filters.reconciliation) {
          return false;
        }
      }

      // 6. Date Range
      if (filters.dateFrom) {
        const itemTime = new Date(item.rawDate).getTime();
        const fromTime = new Date(filters.dateFrom).getTime();
        if (itemTime < fromTime) {
          return false;
        }
      }

      if (filters.dateTo) {
        const itemTime = new Date(item.rawDate).getTime();
        // End of the day
        const toTime = new Date(`${filters.dateTo}T23:59:59.999Z`).getTime();
        if (itemTime > toTime) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Export filtered records to CSV
  const handleExport = useCallback(() => {
    if (filteredRecords.length === 0) {
      return;
    }

    const headers = [
      'Ledger Entry Reference',
      'Timestamp',
      'Account Holder',
      'Wallet ID',
      'Wallet Type',
      'Entry Type',
      'Direction',
      'Source Reference',
      'Reversal Reference',
      'Debit (ZMW)',
      'Credit (ZMW)',
      'Balance After (ZMW)',
      'Reconciliation State',
      'Reconciliation Notes',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.ledgerEntry}"`,
      `"${r.timestamp}"`,
      `"${r.holderName.replace(/"/g, '""')}"`,
      `"${r.walletId}"`,
      `"${r.walletType}"`,
      `"${r.entryType}"`,
      `"${r.direction}"`,
      `"${r.sourceReference}"`,
      `"${r.originalLedgerReference || ''}"`,
      r.debit !== null && r.direction !== 'Hold Memo' ? r.debit.toFixed(2) : '—',
      r.credit !== null && r.direction !== 'Hold Memo' ? r.credit.toFixed(2) : '—',
      r.balanceAfter.toFixed(2),
      `"${r.reconciliation}"`,
      `"${(r.reconciliationNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `tellerbud-wallet-ledger-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredRecords]);

  return (
    <div className="max-w-[1536px] mx-auto p-4 sm:p-5 space-y-3.5 pb-20">
      {/* 1. Five compact KPI Cards */}
      <WalletLedgerKPICards kpis={MOCK_LEDGER_KPIS} />

      {/* 2. Compact Filter Section */}
      <WalletLedgerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isRefreshing={isRefreshing}
        filteredCount={filteredRecords.length}
      />

      {/* 3. Read-Only Ledger Table */}
      <WalletLedgerTable
        records={filteredRecords}
        totalEntriesCount={MOCK_LEDGER_KPIS.totalLedgerEntries}
      />
    </div>
  );
};
