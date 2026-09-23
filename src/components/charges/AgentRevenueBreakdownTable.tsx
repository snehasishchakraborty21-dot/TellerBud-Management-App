import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Eye,
  Building2,
  RotateCcw,
  Calendar,
  Filter,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  AgentRevenueBreakdownRecord,
  AgentRevenueFilters,
  AgentTransactionRevenueRecord,
} from '../../types/chargesCommissions';
import {
  formatCurrencyAmount,
  BusinessAgentRevenueConfig,
} from '../../data/mockChargesCommissionsData';

interface StoreOption {
  id: string;
  name: string;
}

interface BoothOption {
  id: string;
  name: string;
  storeId: string;
}

interface AgentRevenueBreakdownTableProps {
  breakdown: AgentRevenueBreakdownRecord[];
  allTransactions: AgentTransactionRevenueRecord[];
  filters: AgentRevenueFilters;
  onFilterChange: (filters: AgentRevenueFilters) => void;
  stores: StoreOption[];
  booths: BoothOption[];
  agents: BusinessAgentRevenueConfig[];
  onResetFilters: () => void;
}

export const AgentRevenueBreakdownTable: React.FC<AgentRevenueBreakdownTableProps> = ({
  breakdown,
  allTransactions,
  filters,
  onFilterChange,
  stores,
  booths,
  agents,
  onResetFilters,
}) => {
  const navigate = useNavigate();
  const [navigatingAgentId, setNavigatingAgentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleViewAgent = (agentId: string) => {
    setNavigatingAgentId(agentId);
    navigate(`/business-owner/charges-revenue/agents/${encodeURIComponent(agentId)}`, {
      state: {
        returnTab: 'agent-breakdown',
        filters,
        currentPage,
      },
    });
  };

  // Filter booths based on selected store
  const availableBooths = useMemo(() => {
    if (!filters.storeId || filters.storeId === 'All') {
      return booths;
    }
    return booths.filter((b) => b.storeId === filters.storeId);
  }, [booths, filters.storeId]);

  // Calculate totals across all filtered agents in the listing (not just pagination)
  const listingTotals = useMemo(() => {
    return breakdown.reduce(
      (acc, item) => ({
        completedTransactions: acc.completedTransactions + item.completedTransactions,
        reservationCharges: Math.round((acc.reservationCharges + item.reservationCharges) * 100) / 100,
        tellerBudCharges: Math.round((acc.tellerBudCharges + item.tellerBudCharges) * 100) / 100,
        revenueGenerated: Math.round((acc.revenueGenerated + item.revenueGenerated) * 100) / 100,
      }),
      {
        completedTransactions: 0,
        reservationCharges: 0,
        tellerBudCharges: 0,
        revenueGenerated: 0,
      }
    );
  }, [breakdown]);

  // Pagination
  const totalPages = Math.ceil(breakdown.length / pageSize) || 1;
  const paginatedBreakdown = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return breakdown.slice(start, start + pageSize);
  }, [breakdown, currentPage, pageSize]);

  // Check if any filter is active
  const hasActiveFilters =
    filters.fromDate !== '' ||
    filters.toDate !== '' ||
    filters.storeId !== 'All' ||
    filters.boothId !== 'All' ||
    filters.agentId !== 'All';

  // Export report to CSV
  const handleExport = () => {
    const headers = [
      'Agent',
      'Agent ID',
      'Store',
      'Completed Transactions',
      'Reservation Charges (ZMW)',
      'TellerBud Charges (ZMW)',
      'Revenue Generated (ZMW)',
      'Status',
    ];

    const rows = breakdown.map((item) => [
      `"${item.agentName}"`,
      item.agentId,
      `"${item.storeName}"`,
      item.completedTransactions,
      formatCurrencyAmount(item.reservationCharges),
      formatCurrencyAmount(item.tellerBudCharges),
      formatCurrencyAmount(item.revenueGenerated),
      item.status,
    ]);

    // Add totals row
    rows.push([
      '"Total"',
      '""',
      '""',
      listingTotals.completedTransactions,
      formatCurrencyAmount(listingTotals.reservationCharges),
      formatCurrencyAmount(listingTotals.tellerBudCharges),
      formatCurrencyAmount(listingTotals.revenueGenerated),
      '""',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `tellerbud_agent_revenue_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 1. FILTERS BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Agent Revenue Listing</span>
              {hasActiveFilters && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Filtered
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filters
                </button>
              )}
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Report
              </button>
            </div>
          </div>

          {/* Filter Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
            {/* From Date */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">From Date</label>
              <div className="relative">
                <Calendar className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => {
                    onFilterChange({ ...filters, fromDate: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">To Date</label>
              <div className="relative">
                <Calendar className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => {
                    onFilterChange({ ...filters, toDate: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Store Filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Store</label>
              <select
                value={filters.storeId}
                onChange={(e) => {
                  onFilterChange({ ...filters, storeId: e.target.value, boothId: 'All' });
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="All">All Stores</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Booth Filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Booth</label>
              <select
                value={filters.boothId}
                onChange={(e) => {
                  onFilterChange({ ...filters, boothId: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="All">All Booths</option>
                {availableBooths.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Agent Filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Agent</label>
              <select
                value={filters.agentId}
                onChange={(e) => {
                  onFilterChange({ ...filters, agentId: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="All">All Agents</option>
                {agents.map((a) => (
                  <option key={a.agentId} value={a.agentId}>
                    {a.agentName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AGENT REVENUE BREAKDOWN TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3.5 text-left">Agent</th>
                <th className="px-4 py-3.5 text-left">Agent ID</th>
                <th className="px-4 py-3.5 text-left">Store</th>
                <th className="px-4 py-3.5 text-left">Completed Transactions</th>
                <th className="px-4 py-3.5 text-left">Reservation Charges (ZMW)</th>
                <th className="px-4 py-3.5 text-left">TellerBud Charges (ZMW)</th>
                <th className="px-4 py-3.5 text-left">Revenue Generated (ZMW)</th>
                <th className="px-4 py-3.5 text-left">Status</th>
                <th className="px-4 py-3.5 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-medium text-slate-700 text-sm">No agents match criteria</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Try broadening your filters or date range.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBreakdown.map((item) => (
                  <tr key={item.agentId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Agent Column: Full name and avatar initials */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {item.avatarInitials}
                        </div>
                        <div className="font-semibold text-slate-900 whitespace-nowrap">
                          {item.agentName}
                        </div>
                      </div>
                    </td>

                    {/* Agent ID */}
                    <td className="px-4 py-3.5 text-left font-mono font-medium text-slate-600 whitespace-nowrap">
                      {item.agentId}
                    </td>

                    {/* Store */}
                    <td className="px-4 py-3.5 text-left text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.storeName}</span>
                      </div>
                    </td>

                    {/* Completed Transactions */}
                    <td className="px-4 py-3.5 text-left font-semibold text-slate-900">
                      {item.completedTransactions}
                    </td>

                    {/* Reservation Charges (ZMW) - No ZMW prefix inside amount */}
                    <td className="px-4 py-3.5 text-left font-mono font-semibold text-slate-900">
                      {formatCurrencyAmount(item.reservationCharges)}
                    </td>

                    {/* TellerBud Charges (ZMW) - No ZMW prefix inside amount */}
                    <td className="px-4 py-3.5 text-left font-mono font-medium text-slate-700">
                      {formatCurrencyAmount(item.tellerBudCharges)}
                    </td>

                    {/* Revenue Generated (ZMW) - No ZMW prefix inside amount */}
                    <td className="px-4 py-3.5 text-left font-mono font-bold text-emerald-700">
                      {formatCurrencyAmount(item.revenueGenerated)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-left whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {item.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-left whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleViewAgent(item.agentId)}
                        disabled={navigatingAgentId === item.agentId}
                        aria-label={`View revenue details for ${item.agentName} (${item.agentId})`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                        title="View Agent Revenue Details"
                      >
                        {navigatingAgentId === item.agentId ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0D93AA]" />
                            <span>Opening...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer: Exact Reconciliation Summary */}
            {breakdown.length > 0 && (
              <tfoot className="bg-slate-50/95 border-t-2 border-slate-200 text-xs font-bold text-slate-900">
                <tr>
                  <td className="px-4 py-3.5 text-left" colSpan={3}>
                    Total ({breakdown.length} Filtered Agents)
                  </td>
                  <td className="px-4 py-3.5 text-left">
                    {listingTotals.completedTransactions}
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono text-slate-900">
                    {formatCurrencyAmount(listingTotals.reservationCharges)}
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono text-slate-700">
                    {formatCurrencyAmount(listingTotals.tellerBudCharges)}
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono text-emerald-700">
                    {formatCurrencyAmount(listingTotals.revenueGenerated)}
                  </td>
                  <td className="px-4 py-3.5 text-left" colSpan={2}>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      Reconciled with KPIs
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {breakdown.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * pageSize, breakdown.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{breakdown.length}</span> agents
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
