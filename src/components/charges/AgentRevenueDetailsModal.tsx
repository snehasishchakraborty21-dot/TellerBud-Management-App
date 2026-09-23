import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Building2,
  Store as StoreIcon,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Search,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import {
  AgentRevenueBreakdownRecord,
  AgentTransactionRevenueRecord,
} from '../../types/chargesCommissions';
import {
  formatCurrencyAmount,
  isEligibleRevenueTransaction,
} from '../../data/mockChargesCommissionsData';

interface AgentRevenueDetailsModalProps {
  agent: AgentRevenueBreakdownRecord | null;
  transactions: AgentTransactionRevenueRecord[];
  onClose: () => void;
}

export const AgentRevenueDetailsModal: React.FC<AgentRevenueDetailsModalProps> = ({
  agent,
  transactions,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  if (!agent) return null;

  // Filter transactions belonging to this agent
  const agentTransactions = useMemo(() => {
    return transactions.filter((t) => t.agentId === agent.agentId);
  }, [transactions, agent.agentId]);

  // Search filtered
  const filteredRecords = useMemo(() => {
    if (!search.trim()) return agentTransactions;
    const q = search.toLowerCase().trim();
    return agentTransactions.filter(
      (r) =>
        r.chargeRecord.toLowerCase().includes(q) ||
        r.transactionReference.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [agentTransactions, search]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleExportAgentTransactions = () => {
    const headers = [
      'Charge Reference',
      'Transaction Reference',
      'Customer',
      'Service',
      'Reservation Charge (ZMW)',
      'TellerBud Charge (ZMW)',
      'Revenue Generated (ZMW)',
      'Date and Time',
      'Status',
    ];

    const rows = filteredRecords.map((t) => [
      t.chargeRecord,
      t.transactionReference,
      `"${t.customer}"`,
      `"${t.service}"`,
      formatCurrencyAmount(t.reservationCharge),
      formatCurrencyAmount(t.tellerBudCharge),
      formatCurrencyAmount(t.revenueGenerated),
      `"${t.dateTime}"`,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `tellerbud_agent_${agent.agentId}_revenue_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xl flex items-center justify-center shadow-sm shrink-0">
              {agent.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {agent.agentName}
                </h2>
                <span className="font-mono text-xs font-semibold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                  {agent.agentId}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {agent.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {agent.storeName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <StoreIcon className="w-3.5 h-3.5 text-slate-400" />
                  {agent.boothName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{agent.businessName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Completed Transactions
              </div>
              <div className="text-xl font-bold text-slate-900">
                {agent.completedTransactions}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Recognized transactions</div>
            </div>

            <div className="bg-teal-50/50 border border-teal-200/80 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider mb-1">
                Total Reservation Charges
              </div>
              <div className="text-xl font-bold text-teal-950 font-mono">
                {formatCurrencyAmount(agent.reservationCharges)}
              </div>
              <div className="text-[11px] text-teal-700 mt-0.5">ZMW collected</div>
            </div>

            <div className="bg-sky-50/50 border border-sky-200/80 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider mb-1">
                Total TellerBud Charges
              </div>
              <div className="text-xl font-bold text-sky-950 font-mono">
                {formatCurrencyAmount(agent.tellerBudCharges)}
              </div>
              <div className="text-[11px] text-sky-700 mt-0.5">ZMW retained by platform</div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                Total Revenue Generated
              </div>
              <div className="text-xl font-bold text-emerald-950 font-mono">
                {formatCurrencyAmount(agent.revenueGenerated)}
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">ZMW net business revenue</div>
            </div>
          </div>

          {/* Section: Transaction-Level Revenue Records */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Transaction-Level Revenue Records
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed ledger of eligible completed transactions attributed to this agent.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800 w-44 sm:w-56"
                  />
                </div>
                <button
                  onClick={handleExportAgentTransactions}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Charge Reference</th>
                      <th className="px-4 py-3 text-left">Transaction Reference</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Service</th>
                      <th className="px-4 py-3 text-left">Reservation Charge (ZMW)</th>
                      <th className="px-4 py-3 text-left">TellerBud Charge (ZMW)</th>
                      <th className="px-4 py-3 text-left">Revenue Generated (ZMW)</th>
                      <th className="px-4 py-3 text-left">Date and Time</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                          No revenue records found for this agent matching your search.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((txn) => {
                        const isEligible = isEligibleRevenueTransaction(txn.status);
                        return (
                          <tr
                            key={txn.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              !isEligible ? 'opacity-55 bg-slate-50/40' : ''
                            }`}
                          >
                            <td className="px-4 py-3 text-left font-mono font-medium text-slate-900">
                              {txn.chargeRecord}
                            </td>
                            <td className="px-4 py-3 text-left font-mono text-slate-600">
                              {txn.transactionReference}
                            </td>
                            <td className="px-4 py-3 text-left font-medium text-slate-800">
                              {txn.customer}
                            </td>
                            <td className="px-4 py-3 text-left text-slate-600">
                              {txn.service}
                            </td>
                            <td className="px-4 py-3 text-left font-mono font-semibold text-slate-900">
                              {formatCurrencyAmount(txn.reservationCharge)}
                            </td>
                            <td className="px-4 py-3 text-left font-mono font-medium text-slate-700">
                              {formatCurrencyAmount(txn.tellerBudCharge)}
                            </td>
                            <td className="px-4 py-3 text-left font-mono font-bold text-emerald-700">
                              {formatCurrencyAmount(txn.revenueGenerated)}
                            </td>
                            <td className="px-4 py-3 text-left text-slate-500 whitespace-nowrap">
                              {txn.dateTime}
                            </td>
                            <td className="px-4 py-3 text-left whitespace-nowrap">
                              {isEligible ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  {txn.status}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                  {txn.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-600">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-slate-800">
                    {filteredRecords.length === 0
                      ? 0
                      : (currentPage - 1) * pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * pageSize, filteredRecords.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-800">
                    {filteredRecords.length}
                  </span>{' '}
                  records
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
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
