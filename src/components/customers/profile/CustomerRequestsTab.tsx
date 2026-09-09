import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, RefreshCw } from 'lucide-react';
import { PickupRequest } from '../../../types/admin';
import { formatZMW } from '../../../utils/formatters';

interface CustomerRequestsTabProps {
  requests: PickupRequest[];
  onViewRequest: (request: PickupRequest) => void;
}

export const CustomerRequestsTab: React.FC<CustomerRequestsTabProps> = ({
  requests,
  onViewRequest,
}) => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter requests
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchRef = r.id.toLowerCase().includes(query);
        const matchLoc = r.pickupLocation?.toLowerCase().includes(query);
        const matchAgent = r.agentName?.toLowerCase().includes(query);
        const matchBiz = r.businessName?.toLowerCase().includes(query);
        if (!matchRef && !matchLoc && !matchAgent && !matchBiz) return false;
      }

      // Status
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'ALL' && r.type !== typeFilter) {
        return false;
      }

      // Date range
      if (fromDate && r.timestamp < fromDate) return false;
      if (toDate && r.timestamp > `${toDate}T23:59:59Z`) return false;

      return true;
    });
  }, [requests, search, statusFilter, typeFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const isFiltered = Boolean(search.trim() || statusFilter !== 'ALL' || typeFilter !== 'ALL' || fromDate || toDate);

  const getStatusBadge = (status: PickupRequest['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Active Service':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Agent Confirmed':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Finding an Agent':
      case 'Pending Confirmation':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled':
      case 'No Agent Available':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
              placeholder="Search by request reference, location, or matched agent..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/20 focus:border-[#0D93AA]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status select */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Active Service">Active Service</option>
              <option value="Agent Confirmed">Agent Confirmed</option>
              <option value="Finding an Agent">Finding an Agent</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Agent Available">No Agent Available</option>
            </select>

            {/* Type select */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Deposit">Deposit</option>
              <option value="Purchase">Purchase</option>
            </select>

            {/* Date range inputs */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                title="From Date"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                title="To Date"
              />
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th scope="col" className="py-3.5 px-4">Reference / Created</th>
                <th scope="col" className="py-3.5 px-4">Transaction Type</th>
                <th scope="col" className="py-3.5 px-4">Vendor</th>
                <th scope="col" className="py-3.5 px-4 text-right">Amount</th>
                <th scope="col" className="py-3.5 px-4">Requested Service Time</th>
                <th scope="col" className="py-3.5 px-4">Pickup Location</th>
                <th scope="col" className="py-3.5 px-4">Matched Agent / Business</th>
                <th scope="col" className="py-3.5 px-4 text-center">Status</th>
                <th scope="col" className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No requests found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Reference / Created */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-gray-900">{req.id}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{req.createdAt}</div>
                    </td>

                    {/* Transaction Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">{req.type}</span>
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-gray-700">{req.vendor}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-gray-900">
                      {formatZMW(req.amount)}
                    </td>

                    {/* Service Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                      {req.serviceTime || 'Now'}
                    </td>

                    {/* Pickup Location */}
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-gray-600" title={req.pickupLocation}>
                      {req.pickupLocation || '—'}
                    </td>

                    {/* Matched Agent / Business */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.agentName ? (
                        <div>
                          <div className="font-semibold text-gray-900">{req.agentName}</div>
                          <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
                            {req.businessName || 'Lusaka Central Express'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned / System Pool</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => onViewRequest(req)}
                        className="inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] text-xs font-semibold text-[#0D93AA] bg-cyan-50/80 hover:bg-[#0D93AA] hover:text-white border border-cyan-200/60 rounded-lg transition-colors cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                      >
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} requests
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
