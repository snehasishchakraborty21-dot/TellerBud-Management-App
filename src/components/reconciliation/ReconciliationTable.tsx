import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Hourglass,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  ReconciliationRecord,
  ProviderResponseStatus,
} from '../../types/reconciliation';
import { MtnLogo, AirtelLogo } from '../wallet/ProviderLogos';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface ReconciliationTableProps {
  records: ReconciliationRecord[];
  totalRecordsCount: number;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  records,
  totalRecordsCount,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, records.length);
  const currentRecords = records.slice(startIndex, endIndex);

  const getProviderResponseBadge = (status: ProviderResponseStatus) => {
    switch (status) {
      case 'Successful':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} className="shrink-0" />
            Successful
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={11} className="shrink-0" />
            Processing
          </span>
        );
      case 'Awaiting Callback':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Hourglass size={11} className="shrink-0" />
            Awaiting Callback
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={11} className="shrink-0" />
            Failed
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw size={11} className="shrink-0" />
            Reversed
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock size={11} className="shrink-0" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl shadow-xs overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 whitespace-nowrap w-[18%]">Reconciliation Record</th>
              <th className="py-3 px-4 whitespace-nowrap w-[16%]">Transaction</th>
              <th className="py-3 px-4 whitespace-nowrap w-[24%]">Wallet Holder</th>
              <th className="py-3 px-4 whitespace-nowrap w-[15%]">Provider</th>
              <th className="py-3 px-4 whitespace-nowrap text-right w-[11%]">Amount</th>
              <th className="py-3 px-4 whitespace-nowrap text-center w-[14%]">Provider Response</th>
              <th className="py-3 px-4 whitespace-nowrap text-right w-[12%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 size={28} className="text-slate-300" />
                    <span className="text-sm font-medium text-slate-600">
                      No reconciliation records match your filters
                    </span>
                    <span className="text-xs text-slate-400">
                      Adjust your filter criteria or click "Clear Filters"
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              currentRecords.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* 1. Reconciliation Record */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono font-semibold text-[#102025]">
                      {item.reconciliationRef}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.createdAt}
                    </div>
                  </td>

                  {/* 2. Transaction */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono text-slate-700 font-medium">
                      {item.transactionRef}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.transactionType}
                    </div>
                  </td>

                  {/* 3. Wallet Holder (Expanded width for comfortable display) */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">
                      {item.holderName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.walletId}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium ${
                          item.walletType === 'Business Global Wallet'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.walletType === 'Business Global Wallet' ? 'Business' : 'Customer'}
                      </span>
                    </div>
                  </td>

                  {/* 4. Provider */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {item.provider === 'MTN Mobile Money' ? (
                        <MtnLogo className="w-5 h-5 rounded shrink-0" />
                      ) : item.provider === 'Airtel Money' ? (
                        <AirtelLogo className="w-5 h-5 rounded shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                          <BookOpen size={11} />
                        </div>
                      )}
                      <span className="font-medium text-slate-700 text-xs">
                        {item.provider}
                      </span>
                    </div>
                  </td>

                  {/* 5. Amount */}
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-[#102025]">
                    {formatZMW(item.amount)}
                  </td>

                  {/* 6. Provider Response */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    {getProviderResponseBadge(item.providerResponse)}
                  </td>

                  {/* 7. Action: Clearly visible single-line View Details button with eye icon */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => navigate(`/api-ledger-reconciliation/${item.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
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

      {/* Pagination Bar */}
      <div className="p-3.5 sm:px-4 bg-slate-50/70 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing{' '}
          <strong className="font-semibold text-slate-900">
            {records.length === 0 ? 0 : startIndex + 1}
          </strong>{' '}
          to{' '}
          <strong className="font-semibold text-slate-900">{endIndex}</strong> of{' '}
          <strong className="font-semibold text-slate-900">
            {records.length}
          </strong>{' '}
          reconciliation records
          {records.length !== totalRecordsCount && (
            <span className="text-slate-400 ml-1">
              (filtered from {totalRecordsCount})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium mr-2">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 border border-gray-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
              title="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-md font-semibold text-xs transition-colors ${
                    safeCurrentPage === pageNum
                      ? 'bg-[#0D93AA] text-white'
                      : 'border border-gray-200 hover:bg-white text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 border border-gray-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
              title="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

