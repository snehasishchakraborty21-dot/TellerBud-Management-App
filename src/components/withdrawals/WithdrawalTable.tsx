import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Ban,
} from 'lucide-react';
import { CustomerWithdrawal, WithdrawalStatus } from '../../types/admin';
import {
  formatZmwListingAmount,
  formatWithdrawalDate,
  formatZambianMobileNumber,
  formatCustomerId,
  formatWithdrawalId,
} from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export type CustomerWithdrawalSortField =
  | 'requestedAt'
  | 'customer'
  | 'provider'
  | 'amount'
  | 'status';
export type CustomerWithdrawalSortDirection = 'asc' | 'desc';

interface WithdrawalTableProps {
  withdrawals: CustomerWithdrawal[];
  sortField: CustomerWithdrawalSortField;
  sortDirection: CustomerWithdrawalSortDirection;
  onSort: (field: CustomerWithdrawalSortField) => void;
}

export const WithdrawalTable: React.FC<WithdrawalTableProps> = ({
  withdrawals,
  sortField,
  sortDirection,
  onSort,
}) => {
  const { currentUser } = useAuth();
  const isAuthorizedAdmin = !!currentUser;

  const renderSortIcon = (field: CustomerWithdrawalSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 group-hover:opacity-100 shrink-0" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA] shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA] shrink-0" />
    );
  };

  const renderStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70 whitespace-nowrap">
            <Clock size={12} className="shrink-0" />
            <span>Pending Review</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 whitespace-nowrap">
            <CheckCircle2 size={12} className="shrink-0" />
            <span>Approved</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/70 whitespace-nowrap">
            <RotateCcw size={12} className="shrink-0" />
            <span>Processing</span>
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap">
            <CheckCircle2 size={12} className="shrink-0" />
            <span>Paid</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70 whitespace-nowrap">
            <XCircle size={12} className="shrink-0" />
            <span>Rejected</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 whitespace-nowrap">
            <Ban size={12} className="shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
            <span>{status}</span>
          </span>
        );
    }
  };

  if (withdrawals.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl p-12 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-600">No customer withdrawal requests found.</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto max-h-[calc(100vh-270px)] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs shadow-2xs">
            <tr className="border-b border-gray-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
              {/* 1. Withdrawal ID */}
              <th scope="col" className="py-3 px-4 min-w-[170px]">
                <button
                  type="button"
                  onClick={() => onSort('requestedAt')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Withdrawal ID</span>
                  {renderSortIcon('requestedAt')}
                </button>
              </th>

              {/* 2. Customer */}
              <th scope="col" className="py-3 px-4 min-w-[190px]">
                <button
                  type="button"
                  onClick={() => onSort('customer')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Customer</span>
                  {renderSortIcon('customer')}
                </button>
              </th>

              {/* 3. Vendor */}
              <th scope="col" className="py-3 px-4 min-w-[150px]">
                <button
                  type="button"
                  onClick={() => onSort('provider')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Vendor</span>
                  {renderSortIcon('provider')}
                </button>
              </th>

              {/* 4. Amount (ZMW) */}
              <th scope="col" className="py-3 px-4 text-left min-w-[130px] amount-heading">
                <button
                  type="button"
                  onClick={() => onSort('amount')}
                  className="group inline-flex items-center justify-start gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Amount (ZMW)</span>
                  {renderSortIcon('amount')}
                </button>
              </th>

              {/* 5. Phone Number */}
              <th scope="col" className="py-3 px-4 min-w-[150px] text-left">
                Phone Number
              </th>

              {/* 6. Reserved (ZMW) */}
              <th scope="col" className="py-3 px-4 text-left min-w-[130px] amount-heading">
                Reserved (ZMW)
              </th>

              {/* 7. Status */}
              <th scope="col" className="py-3 px-4 min-w-[145px]">
                <button
                  type="button"
                  onClick={() => onSort('status')}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-[#0D93AA] focus:outline-none transition-colors"
                >
                  <span>Status</span>
                  {renderSortIcon('status')}
                </button>
              </th>

              {/* 8. Action */}
              <th scope="col" className="py-3 px-3 text-center min-w-[80px] sm:min-w-[90px] sticky right-0 bg-slate-50/95 backdrop-blur-xs z-10">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {withdrawals.map((record) => {
              const fullMobile = isAuthorizedAdmin
                ? formatZambianMobileNumber(record.payoutNumber || record.customerPhone)
                : 'Access Restricted';

              const isReservationActive =
                record.status === 'Pending Review' ||
                record.status === 'Approved' ||
                record.status === 'Processing';

              const reservedAmount = isReservationActive
                ? (record.reservedFunds ?? record.amount)
                : null;

              const withdrawalId = formatWithdrawalId(record.reference);
              const customerId = formatCustomerId(record.customerId || 'TB-CUS-001052');

              return (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* 1. Withdrawal ID */}
                  <td className="py-3 px-4 align-middle">
                    <Link
                      to={`/super-admin/wallets/customer-withdrawals/${record.reference}`}
                      className="font-mono font-bold text-slate-900 hover:text-[#0D93AA] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 text-xs block whitespace-nowrap"
                    >
                      {withdrawalId}
                    </Link>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 whitespace-nowrap">
                      {formatWithdrawalDate(record.requestedAt)}
                    </div>
                  </td>

                  {/* 2. Customer: Name on 1st line, Customer ID on 2nd line */}
                  <td className="py-3 px-4 align-middle">
                    <Link
                      to={`/super-admin/people/customers/${customerId}`}
                      className="font-semibold text-slate-900 hover:text-[#0D93AA] transition-colors block leading-tight whitespace-nowrap"
                    >
                      {record.customerName}
                    </Link>
                    <div className="mt-0.5 font-mono text-[11px]">
                      <Link
                        to={`/super-admin/people/customers/${customerId}`}
                        className="text-[#0D93AA] hover:underline font-semibold"
                        title={`Customer ID: ${customerId}`}
                      >
                        {customerId}
                      </Link>
                    </div>
                  </td>

                  {/* 3. Vendor (Text Only, No Logos) */}
                  <td className="py-3 px-4 align-middle">
                    <span className="font-medium text-slate-800 text-xs whitespace-nowrap block text-left">
                      {record.network}
                    </span>
                  </td>

                  {/* 4. Amount (ZMW) (Left-aligned) */}
                  <td className="py-3 px-4 align-middle text-left font-mono font-bold text-slate-900 text-xs amount-cell whitespace-nowrap">
                    {formatZmwListingAmount(record.amount)}
                  </td>

                  {/* 5. Phone Number (Complete, Unmasked Zambian Format on one line) */}
                  <td className="py-3 px-4 align-middle text-left">
                    <span className="font-mono text-slate-800 font-medium select-all text-xs whitespace-nowrap">
                      {fullMobile}
                    </span>
                  </td>

                  {/* 6. Reserved (ZMW) (Left-aligned, Em Dash when inactive) */}
                  <td className="py-3 px-4 align-middle text-left font-mono text-xs amount-cell whitespace-nowrap">
                    {reservedAmount !== null ? (
                      <span className="font-bold text-slate-900">
                        {formatZmwListingAmount(reservedAmount)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold" title="Reservation Released">
                        —
                      </span>
                    )}
                  </td>

                  {/* 7. Status Badge */}
                  <td className="py-3 px-4 align-middle whitespace-nowrap">
                    {renderStatusBadge(record.status)}
                  </td>

                  {/* 8. Action: Small Eye Icon */}
                  <td className="py-3 px-3 align-middle text-center sticky right-0 bg-white/95 group-hover:bg-slate-50/95 transition-colors z-10 whitespace-nowrap">
                    <Link
                      to={`/super-admin/wallets/customer-withdrawals/${record.reference}`}
                      title="View Withdrawal Details"
                      aria-label="View Withdrawal Details"
                      className="inline-flex items-center justify-center p-2 text-slate-600 hover:text-[#0D93AA] hover:bg-[#0D93AA]/10 rounded-lg transition-colors border border-transparent hover:border-[#0D93AA]/20 shrink-0 cursor-pointer shadow-2xs"
                    >
                      <Eye size={16} className="shrink-0" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="h-2 bg-transparent" />
    </div>
  );
};
