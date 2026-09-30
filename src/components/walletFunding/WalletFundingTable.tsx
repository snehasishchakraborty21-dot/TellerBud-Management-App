import React from 'react';
import {
  WalletFundingRecord,
  FundingStatus,
  WalletFundingSortField,
  WalletFundingSortDirection,
} from '../../types/walletFunding';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  XCircle,
} from 'lucide-react';

interface WalletFundingTableProps {
  records: WalletFundingRecord[];
  sortField: WalletFundingSortField;
  sortDirection: WalletFundingSortDirection;
  onSort: (field: WalletFundingSortField) => void;
  onViewDetails: (reference: string) => void;
}

function formatAmountValue(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '0.00';
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const WalletFundingTable: React.FC<WalletFundingTableProps> = ({
  records,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
}) => {
  const renderSortIcon = (field: WalletFundingSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          size={12}
          className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0"
        />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-[#0D93AA] shrink-0" />
    ) : (
      <ArrowDown size={12} className="text-[#0D93AA] shrink-0" />
    );
  };

  const renderStatusBadge = (status: FundingStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            <CheckCircle2 size={11} className="shrink-0 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            <Clock size={11} className="shrink-0 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'Initiated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
            <Clock size={11} className="shrink-0 text-blue-600" />
            <span>Initiated</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
            <XCircle size={11} className="shrink-0 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap">
            <XCircle size={11} className="shrink-0 text-slate-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/80 whitespace-nowrap">
            <AlertTriangle size={11} className="shrink-0 text-slate-400" />
            <span>Expired</span>
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap">
            <RotateCcw size={11} className="shrink-0 text-purple-600" />
            <span>Reversed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const renderWalletCredit = (record: WalletFundingRecord) => {
    switch (record.status) {
      case 'Completed':
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <CheckCircle2 size={10} className="text-emerald-600 shrink-0" />
              <span>Credited</span>
            </span>
            {record.walletCreditReference && (
              <span className="font-mono text-[10.5px] text-slate-500">
                {record.walletCreditReference}
              </span>
            )}
          </div>
        );
      case 'Pending':
      case 'Initiated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70 whitespace-nowrap">
            <Clock size={10} className="text-amber-600 shrink-0" />
            <span>Awaiting Confirmation</span>
          </span>
        );
      case 'Reversed':
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
              <RotateCcw size={10} className="text-purple-600 shrink-0" />
              <span>Reversed</span>
            </span>
            {record.reversalCreditReference && (
              <span className="font-mono text-[10.5px] text-purple-600/80">
                {record.reversalCreditReference}
              </span>
            )}
          </div>
        );
      case 'Failed':
      case 'Cancelled':
      case 'Expired':
      default:
        return <span className="text-slate-400 font-medium text-xs">—</span>;
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl p-12 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-700">
          No wallet funding records found
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Try adjusting your search query, vendor, status, or date range filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden pb-2.5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[960px]">
          {/* Exact columns in required order:
              1. Funding Ref / Initiated
              2. Customer
              3. Phone #
              4. Vendor
              5. Amount (ZMW)
              6. Status
              7. Wallet Credit
              8. Action
          */}
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold text-slate-600 select-none">
            <tr>
              {/* 1. Funding Ref / Initiated */}
              <th scope="col" className="py-3 pl-4 pr-3 text-left w-[17%] min-w-[145px]">
                <button
                  type="button"
                  onClick={() => onSort('reference')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer text-left"
                >
                  <span className="leading-tight">Funding Ref /<br className="hidden sm:inline" /> Initiated</span>
                  {renderSortIcon('reference')}
                </button>
              </th>

              {/* 2. Customer */}
              <th scope="col" className="py-3 px-3 text-left w-[17%] min-w-[145px]">
                <button
                  type="button"
                  onClick={() => onSort('customer')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Customer</span>
                  {renderSortIcon('customer')}
                </button>
              </th>

              {/* 3. Phone # */}
              <th scope="col" className="py-3 px-3 text-left w-[15%] min-w-[130px]">
                <span>Phone #</span>
              </th>

              {/* 4. Vendor (Updated from Provider) */}
              <th scope="col" className="py-3 px-3 text-left w-[15%] min-w-[135px]">
                <button
                  type="button"
                  onClick={() => onSort('provider')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Vendor</span>
                  {renderSortIcon('provider')}
                </button>
              </th>

              {/* 5. Amount (ZMW) */}
              <th scope="col" className="py-3 px-3 text-left w-[13%] min-w-[115px]">
                <button
                  type="button"
                  onClick={() => onSort('amount')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Amount (ZMW)</span>
                  {renderSortIcon('amount')}
                </button>
              </th>

              {/* 6. Status */}
              <th scope="col" className="py-3 px-3 text-left w-[11%] min-w-[100px]">
                <button
                  type="button"
                  onClick={() => onSort('status')}
                  className="group inline-flex items-center gap-1 text-slate-600 hover:text-[#0D93AA] focus:outline-none cursor-pointer"
                >
                  <span>Status</span>
                  {renderSortIcon('status')}
                </button>
              </th>

              {/* 7. Wallet Credit */}
              <th scope="col" className="py-3 px-3 text-left w-[15%] min-w-[125px]">
                <span className="leading-tight">Wallet Credit</span>
              </th>

              {/* 8. Action */}
              <th scope="col" className="py-3 pl-3 pr-4 text-center w-[7%] min-w-[65px]">
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {records.map((record) => {
              const fullCustomerPhone = record.customerMobileNumber || record.maskedMobileNumber;

              return (
                <tr
                  key={record.id}
                  className="group hover:bg-slate-50/70 transition-colors"
                >
                  {/* 1. Funding Ref / Initiated: Line 1 Funding ID, Line 2 Date */}
                  <td className="py-2.5 sm:py-3 pl-4 pr-3 text-left align-middle">
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => onViewDetails(record.fundingReference)}
                        className="font-mono font-bold text-slate-900 hover:text-[#0D93AA] hover:underline focus:outline-none text-xs text-left cursor-pointer truncate block"
                        title={`View funding ${record.fundingReference}`}
                      >
                        {record.fundingReference}
                      </button>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 leading-normal">
                        {record.initiatedAt}
                      </span>
                    </div>
                  </td>

                  {/* 2. Customer: 2 lines - Name on line 1, Customer ID on line 2 */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle">
                    <div className="flex flex-col">
                      <span
                        className="font-semibold text-slate-900 leading-tight block truncate"
                        title={record.customerName}
                      >
                        {record.customerName}
                      </span>
                      <span
                        className="text-[11px] text-slate-500 font-mono mt-0.5"
                        title={`Customer ID: ${record.customerId}`}
                      >
                        {record.customerId}
                      </span>
                    </div>
                  </td>

                  {/* 3. Phone #: Complete unmasked Zambian phone number on one line */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle whitespace-nowrap">
                    <span
                      className="text-xs text-slate-800 font-mono select-all"
                      title={`Phone: ${fullCustomerPhone}`}
                    >
                      {fullCustomerPhone}
                    </span>
                  </td>

                  {/* 4. Vendor: Text-only complete vendor name (no logos/images) */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle whitespace-nowrap">
                    <span className="text-xs font-medium text-slate-800">
                      {record.provider}
                    </span>
                  </td>

                  {/* 5. Amount (ZMW): Left-aligned, thousands separators and 2 decimals, no ZMW prefix */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle whitespace-nowrap">
                    <span className="font-semibold font-mono text-slate-900 text-xs">
                      {formatAmountValue(record.amount)}
                    </span>
                  </td>

                  {/* 6. Status: Left-aligned badge */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle whitespace-nowrap">
                    {renderStatusBadge(record.status)}
                  </td>

                  {/* 7. Wallet Credit: Left-aligned */}
                  <td className="py-2.5 sm:py-3 px-3 text-left align-middle">
                    {renderWalletCredit(record)}
                  </td>

                  {/* 8. Action: Centre-aligned compact eye icon button */}
                  <td className="py-2.5 sm:py-3 pl-3 pr-4 text-center align-middle whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetails(record.fundingReference)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#0D93AA] hover:bg-[#0D93AA]/10 active:bg-[#0D93AA]/20 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D93AA] cursor-pointer inline-flex items-center justify-center"
                      title="View Funding Details"
                      aria-label={`View Funding Details for ${record.fundingReference}`}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
