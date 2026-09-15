import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  AuthoritativeLedgerRecord,
  ReconciliationState,
  WalletType,
} from '../../types/walletLedger';
import { formatZMW } from '../../data/mockBusinessWalletData';

type SortField = 'date' | 'debit' | 'credit' | 'balance';
type SortOrder = 'asc' | 'desc';

interface WalletLedgerTableProps {
  records: AuthoritativeLedgerRecord[];
  totalEntriesCount?: number;
}

export const WalletLedgerTable: React.FC<WalletLedgerTableProps> = ({
  records,
  totalEntriesCount = 1248,
}) => {
  const navigate = useNavigate();

  // Sorting state: default newest first (by rawDate desc)
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state: default 20 per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const sortedRecords = useMemo(() => {
    const list = [...records];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
      } else if (sortField === 'debit') {
        const valA = a.debit ?? 0;
        const valB = b.debit ?? 0;
        comparison = valA - valB;
      } else if (sortField === 'credit') {
        const valA = a.credit ?? 0;
        const valB = b.credit ?? 0;
        comparison = valA - valB;
      } else if (sortField === 'balance') {
        comparison = a.balanceAfter - b.balanceAfter;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [records, sortField, sortOrder]);

  // Pagination calculations
  const isFiltered = records.length < 23;
  const totalLedgerCount = isFiltered ? records.length : totalEntriesCount;
  const totalPages = Math.max(1, Math.ceil(totalLedgerCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalLedgerCount);

  // Paginated display records
  const paginatedRecords = useMemo(() => {
    if (sortedRecords.length === 0) return [];
    if (startIndex >= sortedRecords.length) {
      const offset = startIndex % sortedRecords.length;
      return sortedRecords.slice(offset, offset + pageSize);
    }
    return sortedRecords.slice(startIndex, Math.min(startIndex + pageSize, sortedRecords.length));
  }, [sortedRecords, startIndex, pageSize]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-400 ml-1 shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} className="text-[#0D93AA] ml-1 shrink-0" />
    ) : (
      <ArrowDown size={12} className="text-[#0D93AA] ml-1 shrink-0" />
    );
  };

  const getReconciliationBadge = (state: ReconciliationState) => {
    switch (state) {
      case 'Matched':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Matched
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'Exception':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Exception
          </span>
        );
      default:
        return null;
    }
  };

  const getWalletTypeBadge = (type: WalletType) => {
    if (type === 'Customer Wallet') {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-100">
          Customer Wallet
        </span>
      );
    }
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
        Business Global Wallet
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200 text-[11.5px] font-semibold text-slate-600 tracking-wider">
              {/* 1. Ledger Entry */}
              <th
                scope="col"
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
              >
                <div className="flex items-center">
                  <span>Ledger Entry</span>
                  {renderSortIcon('date')}
                </div>
              </th>

              {/* 2. Wallet */}
              <th scope="col" className="py-3 px-4">
                <span>Wallet</span>
              </th>

              {/* 3. Entry Details */}
              <th scope="col" className="py-3 px-4">
                <span>Entry Details</span>
              </th>

              {/* 4. Debit */}
              <th
                scope="col"
                onClick={() => handleSort('debit')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
              >
                <div className="flex items-center justify-end">
                  <span>Debit</span>
                  {renderSortIcon('debit')}
                </div>
              </th>

              {/* 5. Credit */}
              <th
                scope="col"
                onClick={() => handleSort('credit')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
              >
                <div className="flex items-center justify-end">
                  <span>Credit</span>
                  {renderSortIcon('credit')}
                </div>
              </th>

              {/* 6. Balance After */}
              <th
                scope="col"
                onClick={() => handleSort('balance')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
              >
                <div className="flex items-center justify-end">
                  <span>Balance After</span>
                  {renderSortIcon('balance')}
                </div>
              </th>

              {/* 7. Reconciliation */}
              <th scope="col" className="py-3 px-4 text-center">
                <span>Reconciliation</span>
              </th>

              {/* 8. Action */}
              <th scope="col" className="py-3 px-4 text-center">
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <AlertCircle size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No ledger entries match your filter criteria.</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting filters or searching with different keywords.</p>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* 1. Ledger Entry */}
                  <td className="py-3 px-4 align-top">
                    <div className="font-mono font-bold text-[#102025] group-hover:text-[#0D93AA] transition-colors">
                      {item.ledgerEntry}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock size={11} className="text-slate-400 shrink-0" />
                      <span>{item.timestamp}</span>
                    </div>
                  </td>

                  {/* 2. Wallet */}
                  <td className="py-3 px-4 align-top">
                    <div className="font-semibold text-slate-800 leading-tight">
                      {item.holderName}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                      {item.walletId}
                    </div>
                    <div className="mt-1">
                      {getWalletTypeBadge(item.walletType)}
                    </div>
                  </td>

                  {/* 3. Entry Details */}
                  <td className="py-3 px-4 align-top">
                    <div className="font-medium text-slate-800 leading-tight">
                      {item.entryType}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Source: {item.sourceReference}
                    </div>
                    {item.originalLedgerReference && (
                      <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                        (Reversal of {item.originalLedgerReference})
                      </div>
                    )}
                    {item.direction === 'Hold Memo' && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Hold Memo
                      </span>
                    )}
                  </td>

                  {/* 4. Debit */}
                  <td className="py-3 px-4 text-right font-mono align-top whitespace-nowrap">
                    {item.debit !== null && item.direction !== 'Hold Memo' ? (
                      <span className="font-bold text-rose-700">
                        {formatZMW(item.debit)}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-medium">—</span>
                    )}
                  </td>

                  {/* 5. Credit */}
                  <td className="py-3 px-4 text-right font-mono align-top whitespace-nowrap">
                    {item.credit !== null && item.direction !== 'Hold Memo' ? (
                      <span className="font-bold text-emerald-700">
                        {formatZMW(item.credit)}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-medium">—</span>
                    )}
                  </td>

                  {/* 6. Balance After */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#102025] align-top whitespace-nowrap">
                    {formatZMW(item.balanceAfter)}
                  </td>

                  {/* 7. Reconciliation */}
                  <td className="py-3 px-4 text-center align-top whitespace-nowrap">
                    {getReconciliationBadge(item.reconciliation)}
                  </td>

                  {/* 8. Action */}
                  <td className="py-3 px-4 text-center align-top whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/wallet-ledger/${item.ledgerEntry}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      title={`View Details for ${item.ledgerEntry}`}
                    >
                      <Eye size={13} className="shrink-0" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:px-4 bg-slate-50/70 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-800">{totalLedgerCount === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong className="text-slate-800">{endIndex}</strong> of{' '}
            <strong className="text-slate-800">{totalLedgerCount.toLocaleString()}</strong> ledger entries
          </span>
          {records.length > 0 && (
            <span className="hidden sm:inline text-slate-400">• Read-only</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="p-1.5 rounded border border-gray-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="px-2 text-xs font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded border border-gray-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
