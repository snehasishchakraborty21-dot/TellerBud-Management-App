import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { MobileMoneyTransaction } from '../../../types/mobileMoney';
import { formatZMW } from '../../../utils/formatters';

interface CustomerTransactionsTabProps {
  transactions: MobileMoneyTransaction[];
  onViewTransaction: (transaction: MobileMoneyTransaction) => void;
}

export const CustomerTransactionsTab: React.FC<CustomerTransactionsTabProps> = ({
  transactions,
  onViewTransaction,
}) => {
  const [search, setSearch] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter out any Delivery transactions strictly (Pickup and Walk-In only)
  const pickupAndWalkInOnly = useMemo(() => {
    return transactions.filter(
      (t) => t.serviceChannel === 'Pickup' || t.serviceChannel === 'Walk-In'
    );
  }, [transactions]);

  const filtered = useMemo(() => {
    return pickupAndWalkInOnly.filter((t) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchRef = t.reference.toLowerCase().includes(query);
        const matchSrc = t.sourceReference?.toLowerCase().includes(query);
        if (!matchRef && !matchSrc) return false;
      }

      // Service Channel
      if (channelFilter !== 'ALL' && t.serviceChannel !== channelFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'ALL' && t.transactionType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [pickupAndWalkInOnly, search, channelFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const isFiltered = Boolean(search.trim() || channelFilter !== 'ALL' || typeFilter !== 'ALL');

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by transaction reference (e.g. TB-TXN-1048)..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Service Channel */}
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium"
            >
              <option value="ALL">All Service Channels</option>
              <option value="Pickup">Pickup</option>
              <option value="Walk-In">Walk-In</option>
            </select>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium"
            >
              <option value="ALL">All Transaction Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Purchase">Purchase</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setChannelFilter('ALL');
                  setTypeFilter('ALL');
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unified Transactions Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th scope="col" className="py-3.5 px-4">Reference / Date</th>
                <th scope="col" className="py-3.5 px-4">Service Channel</th>
                <th scope="col" className="py-3.5 px-4">Transaction Type</th>
                <th scope="col" className="py-3.5 px-4 text-right">Amount</th>
                <th scope="col" className="py-3.5 px-4 text-right">Charges</th>
                <th scope="col" className="py-3.5 px-4 text-right">Customer Total</th>
                <th scope="col" className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No transactions found for this customer matching the filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((txn) => {
                  const charges = txn.reservationCharge + (txn.otherCharges || 0);
                  const isWalkIn = txn.serviceChannel === 'Walk-In';

                  return (
                    <tr key={txn.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* 1. Reference / Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-gray-900">{txn.reference}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{txn.formattedDate}</div>
                      </td>

                      {/* 2. Service Channel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isWalkIn
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {txn.serviceChannel}
                        </span>
                      </td>

                      {/* 3. Transaction Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-gray-800">
                        {txn.transactionType}
                      </td>

                      {/* 4. Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-gray-900">
                        {formatZMW(txn.amount)}
                      </td>

                      {/* 5. Charges */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right text-gray-600">
                        {charges > 0 ? formatZMW(charges) : <span className="text-gray-400">ZMW 0.00</span>}
                      </td>

                      {/* 6. Customer Total */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-[#0D93AA]">
                        {formatZMW(txn.customerTotal || txn.amount + charges)}
                      </td>

                      {/* 7. Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => onViewTransaction(txn)}
                          className="inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] text-xs font-semibold text-[#0D93AA] bg-cyan-50/80 hover:bg-[#0D93AA] hover:text-white border border-cyan-200/60 rounded-lg transition-colors cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                        >
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} transactions
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
