import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CustomerWalletAddFundsRecord, AddFundsStatus } from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';
import { MtnLogo, AirtelLogo } from '../wallet/ProviderLogos';

interface CustomerWalletAddFundsTabProps {
  addFunds: CustomerWalletAddFundsRecord[];
  onSelectRecord: (record: CustomerWalletAddFundsRecord) => void;
}

export const CustomerWalletAddFundsTab: React.FC<CustomerWalletAddFundsTabProps> = ({
  addFunds,
  onSelectRecord,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [mnoFilter, setMnoFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<'date' | 'reference' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter !== 'ALL' || mnoFilter !== 'ALL' || dateFrom || dateTo
  );

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setMnoFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleSort = (field: 'date' | 'reference' | 'amount') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredRecords = useMemo(() => {
    let result = [...addFunds];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.fundingReference.toLowerCase().includes(q) ||
          r.providerReference.toLowerCase().includes(q) ||
          r.maskedMobileNumber.toLowerCase().includes(q) ||
          (r.walletCreditReference && r.walletCreditReference.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.providerStatus === statusFilter);
    }

    if (mnoFilter !== 'ALL') {
      result = result.filter((r) => r.mno === mnoFilter);
    }

    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      result = result.filter((r) => new Date(r.initiatedTimestamp).getTime() >= fromTime);
    }

    if (dateTo) {
      const toTime = new Date(`${dateTo}T23:59:59.999Z`).getTime();
      result = result.filter((r) => new Date(r.initiatedTimestamp).getTime() <= toTime);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.initiatedTimestamp).getTime() - new Date(b.initiatedTimestamp).getTime();
      } else if (sortField === 'reference') {
        cmp = a.fundingReference.localeCompare(b.fundingReference);
      } else if (sortField === 'amount') {
        cmp = a.amount - b.amount;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [addFunds, search, statusFilter, mnoFilter, dateFrom, dateTo, sortField, sortDirection]);

  // Pagination
  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

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
              placeholder="Search funding ref, provider ref, phone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
            />
          </div>

          {/* Provider Status Filter */}
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            >
              <option value="ALL">All Provider Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Initiated">Initiated</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          {/* MNO Filter */}
          <div className="w-full sm:w-48">
            <select
              value={mnoFilter}
              onChange={(e) => {
                setMnoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            >
              <option value="ALL">All Providers</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
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
              title="Refresh Add Funds records"
              className="p-2 rounded-lg border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={14} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
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
                    <span>Funding Ref</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1">
                    <span>Initiated</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4">MNO Provider</th>
                <th className="py-3 px-4">Masked Mobile</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4">Provider Reference</th>
                <th className="py-3 px-4">Provider Status</th>
                <th className="py-3 px-4">Wallet Credit Ref</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => {
                  const isMtn = record.mno === 'MTN Mobile Money';

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* 1. Funding Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {record.fundingReference}
                      </td>

                      {/* 2. Initiated */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap">
                        {record.initiatedAt}
                      </td>

                      {/* 3. MNO */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isMtn ? <MtnLogo className="w-6 h-6" /> : <AirtelLogo className="w-6 h-6" />}
                          <span className="font-semibold text-slate-800">{record.mno}</span>
                        </div>
                      </td>

                      {/* 4. Masked Mobile */}
                      <td className="py-3.5 px-4 font-sans text-slate-700 whitespace-nowrap">
                        {record.maskedMobileNumber}
                      </td>

                      {/* 5. Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-black text-slate-900">
                        {formatZMW(record.amount)}
                      </td>

                      {/* 6. Provider Reference */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {record.providerReference}
                      </td>

                      {/* 7. Provider Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            record.providerStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : record.providerStatus === 'Failed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {record.providerStatus}
                        </span>
                      </td>

                      {/* 8. Wallet Credit Ref */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {record.walletCreditReference ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            {record.walletCreditReference}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* 9. Last Updated */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {record.lastUpdated}
                      </td>

                      {/* 10. Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectRecord(record)}
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
                    <p className="text-sm font-semibold text-slate-700">No Add Funds records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters ? 'Try adjusting search or filter parameters' : 'No funding activity recorded yet'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
          <div>
            Showing <span className="font-semibold text-slate-700">{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min(totalItems, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalItems}</span> funding records
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
