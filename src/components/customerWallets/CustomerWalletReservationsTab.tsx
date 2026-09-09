import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ArrowUpDown,
  Lock,
  CheckCircle2,
  Eye,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  CustomerWalletReservation,
  WalletReservationStatus,
  WalletReservationType,
} from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';

interface CustomerWalletReservationsTabProps {
  reservations: CustomerWalletReservation[];
  onSelectReservation: (res: CustomerWalletReservation) => void;
}

export const CustomerWalletReservationsTab: React.FC<CustomerWalletReservationsTabProps> = ({
  reservations,
  onSelectReservation,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<'date' | 'reference' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter !== 'ALL' || typeFilter !== 'ALL' || dateFrom || dateTo
  );

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
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

  const filteredReservations = useMemo(() => {
    let result = [...reservations];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.reference.toLowerCase().includes(q) ||
          r.relatedReference.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      result = result.filter((r) => r.reservationType === typeFilter);
    }

    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      result = result.filter((r) => new Date(r.createdAtTimestamp).getTime() >= fromTime);
    }

    if (dateTo) {
      const toTime = new Date(`${dateTo}T23:59:59.999Z`).getTime();
      result = result.filter((r) => new Date(r.createdAtTimestamp).getTime() <= toTime);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.createdAtTimestamp).getTime() - new Date(b.createdAtTimestamp).getTime();
      } else if (sortField === 'reference') {
        cmp = a.reference.localeCompare(b.reference);
      } else if (sortField === 'amount') {
        cmp = a.remainingAmount - b.remainingAmount;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [reservations, search, statusFilter, typeFilter, dateFrom, dateTo, sortField, sortDirection]);

  // Pagination
  const totalItems = filteredReservations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReservations.slice(start, start + pageSize);
  }, [filteredReservations, currentPage, pageSize]);

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
              placeholder="Search reservation reference, related reference..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active (Held)</option>
              <option value="Consumed">Consumed (Settled)</option>
              <option value="Released">Released (Cancelled)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-full sm:w-52">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            >
              <option value="ALL">All Reservation Types</option>
              <option value="Customer Withdrawal">Customer Withdrawal</option>
              <option value="Customer Pickup Request">Customer Pickup Request</option>
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
              title="Refresh reservations"
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
                    <span>Reservation Ref</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1">
                    <span>Created</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4">Reservation Type</th>
                <th className="py-3 px-4">Related Reference</th>
                <th className="py-3 px-4 text-right">Original Amount</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Remaining Hold</span>
                    <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Released or Consumed</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedReservations.length > 0 ? (
                paginatedReservations.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* 1. Reservation Ref */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {res.reference}
                    </td>

                    {/* 2. Created */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap">
                      {res.createdAt}
                    </td>

                    {/* 3. Reservation Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {res.reservationType}
                      </span>
                    </td>

                    {/* 4. Related Reference */}
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {res.relatedReference}
                    </td>

                    {/* 5. Original Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-700 font-semibold">
                      {formatZMW(res.originalAmount)}
                    </td>

                    {/* 6. Remaining Hold */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-black text-amber-700">
                      {formatZMW(res.remainingAmount)}
                    </td>

                    {/* 7. Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          res.status === 'Active'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : res.status === 'Consumed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {res.status === 'Active' && <Lock size={11} />}
                        {res.status === 'Consumed' && <CheckCircle2 size={11} />}
                        {res.status}
                      </span>
                    </td>

                    {/* 8. Released or Consumed */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                      {res.releasedOrConsumedAt || '— (Active Hold)'}
                    </td>

                    {/* 9. Action */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectReservation(res)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#0D93AA] text-slate-700 hover:text-white transition-colors"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold text-slate-700">No reservations found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters ? 'Try adjusting search or filter parameters' : 'No reservations recorded for this wallet'}
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
            <span className="font-semibold text-slate-700">{totalItems}</span> reservations
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
