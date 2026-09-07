import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  User,
  MapPin,
  Clock,
  Receipt,
  Eye,
  RefreshCw,
  Radio,
  ShieldCheck,
  Sparkles,
  Phone,
} from 'lucide-react';
import { PickupRequest } from '../../types/admin';
import { formatZMW } from '../../config/appConfig';
import { StatusChip } from '../shared/StatusChip';

interface LivePickupOperationsTableProps {
  requests: PickupRequest[];
  onViewAll?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const LivePickupOperationsTable: React.FC<LivePickupOperationsTableProps> = ({
  requests,
  onViewAll,
  onRefresh,
  isRefreshing = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);

  // Status options per specification
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'Finding an Agent', label: 'Finding an Agent' },
    { value: 'Agent Confirmed', label: 'Agent Confirmed' },
    { value: 'Active Service', label: 'Active Service' },
  ];

  // Distinct vendors
  const vendors = useMemo(() => {
    const list = new Set<string>();
    requests.forEach((r) => {
      if (r.vendor) list.add(r.vendor);
    });
    return Array.from(list);
  }, [requests]);

  // Distinct transaction types
  const types = useMemo(() => {
    const list = new Set<string>();
    requests.forEach((r) => {
      if (r.type) list.add(r.type);
    });
    return Array.from(list);
  }, [requests]);

  // Filtered dataset (Active operational requests only)
  const filteredRequests = useMemo(() => {
    return requests
      .filter((item) => item.status !== 'Completed' && item.status !== 'Cancelled')
      .filter((item) => {
        // Search term filter (by reference or agent)
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchesQuery =
            item.id.toLowerCase().includes(query) ||
            item.customerName.toLowerCase().includes(query) ||
            (item.agentName && item.agentName.toLowerCase().includes(query)) ||
            (item.pickupLocation && item.pickupLocation.toLowerCase().includes(query));

          if (!matchesQuery) return false;
        }

        // Status filter
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'Finding an Agent') {
            if (item.status !== 'Finding an Agent' && item.status !== 'Matching' && !!item.agentName) {
              return false;
            }
          } else if (item.status !== statusFilter) {
            return false;
          }
        }

        // Type filter
        if (typeFilter !== 'ALL' && item.type !== typeFilter) {
          return false;
        }

        // Vendor filter
        if (vendorFilter !== 'ALL' && item.vendor !== vendorFilter) {
          return false;
        }

        return true;
      });
  }, [requests, searchTerm, statusFilter, typeFilter, vendorFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setVendorFilter('ALL');
    if (onRefresh) onRefresh();
  };

  const hasActiveFilters =
    searchTerm !== '' || statusFilter !== 'ALL' || typeFilter !== 'ALL' || vendorFilter !== 'ALL';

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-5 flex flex-col shadow-sm">
      {/* Table Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-base text-gray-900">
            Live Operations
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] text-xs font-bold border border-[#0D93AA]/20">
            {filteredRequests.length} Active
          </span>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Search Field */}
          <div className="relative w-48 sm:w-56">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference or Agent..."
              className="w-full h-8 pl-8 pr-7 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            aria-label="Filter by status"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            aria-label="Filter by transaction type"
          >
            <option value="ALL">All Transaction Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Vendor Filter */}
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="h-8 px-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
            aria-label="Filter by vendor"
          >
            <option value="ALL">All Vendors</option>
            {vendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 px-2.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors flex items-center gap-1.5"
              title="Refresh live operations"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-gray-500'} />
              <span>Refresh</span>
            </button>
          )}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-8 px-2 text-xs font-bold text-gray-500 hover:text-red-600 rounded transition-colors"
              title="Clear all filters"
            >
              Clear
            </button>
          )}

          {/* View All Button */}
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="h-8 px-3 text-xs font-bold text-[#0D93AA] hover:bg-[#0D93AA]/10 rounded-md transition-colors"
            >
              View All
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-gray-50/90 text-gray-600 font-semibold uppercase text-[11px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3.5 font-bold">Reference</th>
              <th className="py-3 px-3.5 font-bold">Created</th>
              <th className="py-3 px-3.5 font-bold">Transaction Type</th>
              <th className="py-3 px-3.5 font-bold">Vendor</th>
              <th className="py-3 px-3.5 font-bold text-right">Amount</th>
              <th className="py-3 px-3.5 font-bold">Requested Service Time</th>
              <th className="py-3 px-3.5 font-bold">Pickup Location</th>
              <th className="py-3 px-3.5 font-bold">Automatically Matched Agent</th>
              <th className="py-3 px-3.5 font-bold">Status</th>
              <th className="py-3 px-3.5 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-1.5">
                    <Radio size={20} className="text-gray-400 mx-auto" />
                    <div className="text-xs font-bold text-gray-800">No live operations</div>
                    <div className="text-[11px] text-gray-500">
                      {hasActiveFilters
                        ? 'No active customer requests match your current filters.'
                        : 'There are currently no active customer requests.'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="hover:bg-gray-50/90 transition-colors cursor-pointer group"
                >
                  {/* Reference */}
                  <td className="py-3 px-3.5 font-mono text-xs text-gray-900 font-bold whitespace-nowrap">
                    {req.id}
                  </td>

                  {/* Created */}
                  <td className="py-3 px-3.5 text-gray-700 whitespace-nowrap font-medium">
                    {req.createdAt || '02 Sep 2026, 03:00 PM'}
                  </td>

                  {/* Transaction Type */}
                  <td className="py-3 px-3.5 font-semibold text-gray-900">
                    {req.type}
                  </td>

                  {/* Vendor */}
                  <td className="py-3 px-3.5 text-xs font-semibold text-gray-800 whitespace-nowrap">
                    {req.vendor}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                    {formatZMW(req.amount)}
                  </td>

                  {/* Requested Service Time */}
                  <td className="py-3 px-3.5 text-gray-700 whitespace-nowrap font-medium">
                    {req.serviceTime || 'Now'}
                  </td>

                  {/* Pickup Location */}
                  <td className="py-3 px-3.5 text-gray-800">
                    <div className="relative group/loc inline-flex items-center gap-1 font-medium max-w-[160px]">
                      <span className="truncate">{req.pickupLocation || 'Lusaka Central'}</span>
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/loc:block z-20 pointer-events-none">
                        <div className="bg-gray-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap max-w-xs border border-gray-700">
                          {req.pickupLocation}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Automatically Matched Agent */}
                  <td className="py-3 px-3.5 text-gray-700">
                    {req.agentName ? (
                      <div>
                        <div className="font-bold text-gray-900 text-xs">{req.agentName}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Auto-Matched
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-medium">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <StatusChip status={req.status} size="sm" />
                  </td>

                  {/* Action: View button */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-md transition-colors"
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal for Selected Request (Read-Only) */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <div>
                <span className="text-xs font-mono font-bold text-[#0D93AA]">
                  {selectedRequest.id}
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Customer Pickup Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 border border-gray-200/80 rounded-lg">
                <div>
                  <span className="text-gray-500 font-medium block">Amount</span>
                  <span className="text-base font-mono font-bold text-gray-900">
                    {formatZMW(selectedRequest.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Current Status</span>
                  <div className="mt-1">
                    <StatusChip status={selectedRequest.status} size="sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-gray-800">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 font-medium w-28">Customer:</span>
                  <span className="font-bold text-gray-900">
                    {selectedRequest.customerName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 font-medium w-28">Customer Phone:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {selectedRequest.customerPhone}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Receipt size={14} className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 font-medium w-28">Transaction:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedRequest.type} via {selectedRequest.vendor}
                  </span>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                  <User size={14} className="text-gray-500 mt-1 shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-500 font-medium text-xs block mb-1">
                      Automatically Matched Agent:
                    </span>
                    {selectedRequest.agentName ? (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-xs">
                            {selectedRequest.agentName}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck size={11} />
                            System-Matched
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700 pt-1">
                          <div>
                            <span className="text-gray-500">Agent ID: </span>
                            <span className="font-mono font-medium text-gray-900">
                              {selectedRequest.agentId || 'TB-AGT-1024'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone: </span>
                            <span className="font-mono font-medium text-gray-900">
                              {selectedRequest.agentPhone || '+260 97 234 5678'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status: </span>
                            <span className="font-semibold text-emerald-700">On Active Request</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        <div>
                          <span className="font-bold">Finding an Agent</span>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            TellerBud is searching for an available eligible Agent in this business area.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRequest.pickupLocation && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-500 mt-0.5 shrink-0" />
                    <span className="text-gray-500 font-medium w-28">Pickup Location:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedRequest.pickupLocation}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 font-medium w-28">Requested Service Time:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedRequest.serviceTime || 'Now'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-500 shrink-0" />
                  <span className="text-gray-500 font-medium w-28">Created At:</span>
                  <span className="font-mono text-xs text-gray-700">
                    {selectedRequest.createdAt || '02 Sep 2026, 03:00 PM'}
                  </span>
                </div>

                {/* System Note */}
                <div className="p-2.5 bg-cyan-50/70 border border-cyan-200/80 rounded-lg flex items-start gap-2">
                  <Sparkles size={14} className="text-cyan-700 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-cyan-900 font-medium leading-relaxed">
                    {selectedRequest.agentName
                      ? 'This customer request was automatically matched to an eligible Agent by TellerBud.'
                      : 'TellerBud is searching for an available eligible Agent.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
