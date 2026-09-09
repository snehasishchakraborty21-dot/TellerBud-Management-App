import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  Calendar,
  Lock,
  Filter,
} from 'lucide-react';
import { CustomerWalletLedgerEntry, WalletLedgerEntryType } from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';

interface CustomerWalletLedgerTabProps {
  ledger: CustomerWalletLedgerEntry[];
  onSelectEntry: (entry: CustomerWalletLedgerEntry) => void;
}

export const CustomerWalletLedgerTab: React.FC<CustomerWalletLedgerTabProps> = ({
  ledger,
  onSelectEntry,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<'date' | 'reference' | 'balance'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasActiveFilters = Boolean(
    search.trim() || typeFilter !== 'ALL' || dateFrom || dateTo
  );

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleSort = (field: 'date' | 'reference' | 'balance') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter & sort
  const filteredEntries = useMemo(() => {
    let result = [...ledger];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.reference.toLowerCase().includes(q) ||
          e.relatedReference.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'ALL') {
      result = result.filter((e) => e.entryType === typeFilter);
    }

    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      result = result.filter((e) => new Date(e.timestamp).getTime() >= fromTime);
    }

    if (dateTo) {
      const toTime = new Date(`${dateTo}T23:59:59.999Z`).getTime();
      result = result.filter((e) => new Date(e.timestamp).getTime() <= toTime);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === 'reference') {
        cmp = a.reference.localeCompare(b.reference);
      } else if (sortField === 'balance') {
        cmp = a.balanceAfter - b.balanceAfter;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [ledger, search, typeFilter, dateFrom, dateTo, sortField, sortDirection]);

  // Pagination
  const totalItems = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search ledger reference, related ref, source, notes..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
            />
          </div>

          {/* Entry Type Filter */}
          <div className="w-full sm:w-56">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            >
              <option value="ALL">All Entry Types</option>
              <option value="Add Funds Credit">Add Funds Credit</option>
              <option value="Withdrawal Debit">Withdrawal Debit</option>
              <option value="Reservation Created">Reservation Created</option>
              <option value="Reservation Released">Reservation Released</option>
              <option value="Transaction Charge">Transaction Charge</option>
              <option value="Reversal Credit">Reversal Credit</option>
              <option value="Compensating Entry">Compensating Entry</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              title="From date"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              title="To date"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'border-gray-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
                  : 'border-gray-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              }`}
            >
              Clear Filters
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh ledger records"
              className="p-2 rounded-lg border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={14} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
                <th
                  onClick={() => handleSort('reference')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1">
                    <span>Ledger Entry</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1">
                    <span>Date and Time</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4">Entry Type</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Credit</th>
                <th className="py-3 px-4 text-right">Debit</th>
                <th
                  onClick={() => handleSort('balance')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Balance After</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4">Related Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry) => {
                  const isCredit = entry.credit !== null && entry.credit > 0;
                  const isDebit = entry.debit !== null && entry.debit > 0;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* 1. Ledger Entry */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {entry.reference}
                      </td>

                      {/* 2. Date and Time */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap">
                        {entry.dateTime}
                      </td>

                      {/* 3. Entry Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {entry.entryType}
                        </span>
                      </td>

                      {/* 4. Source */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {entry.source}
                      </td>

                      {/* 5. Credit */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-emerald-600">
                        {isCredit ? `+ ${formatZMW(entry.credit)}` : '—'}
                      </td>

                      {/* 6. Debit */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-rose-600">
                        {isDebit ? `- ${formatZMW(entry.debit)}` : '—'}
                      </td>

                      {/* 7. Balance After */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-black text-slate-900">
                        {formatZMW(entry.balanceAfter)}
                      </td>

                      {/* 8. Related Reference */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {entry.relatedReference}
                      </td>

                      {/* 9. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck size={11} />
                          {entry.status}
                        </span>
                      </td>

                      {/* 10. Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectEntry(entry)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#0D93AA] text-slate-700 hover:text-white transition-colors"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold text-slate-700">No ledger entries found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters ? 'Try adjusting search or filter parameters' : 'No activity recorded yet'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & pagination */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
          <div>
            Showing <span className="font-semibold text-slate-700">{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min(totalItems, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalItems}</span> immutable entries
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-gray-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
              >
                Previous
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded border border-gray-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
