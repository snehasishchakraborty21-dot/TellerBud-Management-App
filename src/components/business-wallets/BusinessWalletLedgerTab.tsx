import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { BusinessWalletLedgerEntry } from '../../types/businessWallet';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface BusinessWalletLedgerTabProps {
  ledgerEntries: BusinessWalletLedgerEntry[];
}

export const BusinessWalletLedgerTab: React.FC<BusinessWalletLedgerTabProps> = ({
  ledgerEntries,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Credit' | 'Debit' | 'Hold Memo'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.actor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [ledgerEntries, searchTerm, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, description, counterparty..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={13} />
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
          >
            <option value="ALL">All Entries ({ledgerEntries.length})</option>
            <option value="Credit">Credits Only</option>
            <option value="Debit">Debits Only</option>
            <option value="Hold Memo">Hold Memos Only</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto border border-gray-200/80 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200 text-slate-600 font-semibold">
              <th className="py-2.5 px-3.5 whitespace-nowrap">Reference</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Date & Time</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Type</th>
              <th className="py-2.5 px-3.5">Description & Counterparty</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Amount</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Resulting Balance</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No ledger entries match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedEntries.map((item) => {
                const isCredit = item.type === 'Credit';
                const isDebit = item.type === 'Debit';
                const isHold = item.type === 'Hold Memo';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.reference}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                          isCredit
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDebit
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isCredit && <ArrowDownLeft size={11} />}
                        {isDebit && <ArrowUpRight size={11} />}
                        {isHold && <Lock size={10} />}
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 min-w-[200px]">
                      <div className="font-medium text-slate-800">
                        {item.description}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Counterparty: {item.counterparty}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          isCredit
                            ? 'text-emerald-700'
                            : isDebit
                            ? 'text-rose-700'
                            : 'text-slate-600'
                        }
                      >
                        {isCredit && '+'}
                        {isDebit && '-'}
                        {formatZMW(item.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                      {formatZMW(item.resultingBalance)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{item.actor}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.actorId}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <div>
          Showing {paginatedEntries.length} of {filteredEntries.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
