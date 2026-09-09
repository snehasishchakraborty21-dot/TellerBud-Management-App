import React from 'react';
import {
  WalletFundingRecord,
  FundingStatus,
  WalletFundingSortField,
  WalletFundingSortDirection,
} from '../../types/walletFunding';
import { formatZMW } from '../../data/mockWalletFundingData';
import { MtnLogo, AirtelLogo } from '../wallet/ProviderLogos';
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

export const WalletFundingTable: React.FC<WalletFundingTableProps> = ({
  records,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
}) => {
  const renderSortIcon = (field: WalletFundingSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-400 shrink-0" />;
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} className="shrink-0" />
            <span>Completed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={11} className="shrink-0" />
            <span>Pending</span>
          </span>
        );
      case 'Initiated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock size={11} className="shrink-0" />
            <span>Initiated</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={11} className="shrink-0" />
            <span>Failed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle size={11} className="shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <AlertTriangle size={11} className="shrink-0" />
            <span>Expired</span>
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw size={11} className="shrink-0" />
            <span>Reversed</span>
          </span>
        );
    }
  };

  const renderWalletCredit = (record: WalletFundingRecord) => {
    switch (record.status) {
      case 'Completed':
        return (
          <span className="font-mono text-xs font-semibold text-emerald-700">
            {record.walletCreditReference || '—'}
          </span>
        );
      case 'Pending':
      case 'Initiated':
        return (
          <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <Clock size={12} className="text-amber-500 shrink-0" />
            <span>Awaiting Confirmation</span>
          </span>
        );
      case 'Reversed':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="line-through text-slate-400 font-mono text-[11px]">
              {record.walletCreditReference || '—'}
            </span>
            <span className="text-purple-700 font-mono text-xs font-semibold flex items-center gap-1">
              <RotateCcw size={10} className="shrink-0" />
              <span>
                {record.reversalCreditReference ||
                  `${record.walletCreditReference || 'TB-LED'}-REV`}
              </span>
            </span>
          </div>
        );
      case 'Failed':
      case 'Cancelled':
      case 'Expired':
      default:
        return <span className="text-slate-400 font-mono text-xs">—</span>;
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl p-12 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-700">
          No wallet funding records found
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Try adjusting your search query, provider, status, or date range filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              {/* 1. Funding Reference / Initiated */}
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:text-slate-700 select-none w-[180px]"
                onClick={() => onSort('reference')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Funding Ref / Initiated</span>
                  {renderSortIcon('reference')}
                </div>
              </th>

              {/* 2. Customer */}
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:text-slate-700 select-none w-[200px]"
                onClick={() => onSort('customer')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Customer</span>
                  {renderSortIcon('customer')}
                </div>
              </th>

              {/* 3. Provider */}
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:text-slate-700 select-none w-[160px]"
                onClick={() => onSort('provider')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Provider</span>
                  {renderSortIcon('provider')}
                </div>
              </th>

              {/* 4. Amount */}
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:text-slate-700 select-none text-right w-[140px]"
                onClick={() => onSort('amount')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </div>
              </th>

              {/* 5. Provider Reference */}
              <th scope="col" className="py-3 px-4 w-[160px]">
                Provider Ref
              </th>

              {/* 6. Status */}
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:text-slate-700 select-none w-[120px]"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* 7. Wallet Credit */}
              <th scope="col" className="py-3 px-4 w-[160px]">
                Wallet Credit
              </th>

              {/* 8. Action */}
              <th
                scope="col"
                className="py-3 px-4 text-center w-[120px] sticky right-0 bg-slate-50/80"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {/* 1. Funding Reference / Initiated */}
                <td className="py-3 px-4 align-middle">
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    {record.fundingReference}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {record.initiatedAt}
                  </div>
                </td>

                {/* 2. Customer */}
                <td className="py-3 px-4 align-middle">
                  <div className="font-semibold text-slate-900 leading-tight">
                    {record.customerName}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] text-[#0D93AA]">
                      {record.customerId}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {record.maskedMobileNumber}
                    </span>
                  </div>
                </td>

                {/* 3. Provider */}
                <td className="py-3 px-4 align-middle">
                  <div className="flex items-center gap-2">
                    {record.provider === 'MTN Mobile Money' ? (
                      <MtnLogo className="w-5 h-5 rounded-full shrink-0" />
                    ) : (
                      <AirtelLogo className="w-5 h-5 rounded-full shrink-0" />
                    )}
                    <span className="font-medium text-slate-800 text-xs whitespace-nowrap">
                      {record.provider}
                    </span>
                  </div>
                </td>

                {/* 4. Amount */}
                <td className="py-3 px-4 align-middle text-right font-mono font-bold text-slate-900 text-xs">
                  {formatZMW(record.amount)}
                </td>

                {/* 5. Provider Reference */}
                <td className="py-3 px-4 align-middle">
                  <span className="font-mono text-xs text-slate-700 select-all">
                    {record.providerReference}
                  </span>
                </td>

                {/* 6. Status */}
                <td className="py-3 px-4 align-middle whitespace-nowrap">
                  {renderStatusBadge(record.status)}
                </td>

                {/* 7. Wallet Credit */}
                <td className="py-3 px-4 align-middle">
                  {renderWalletCredit(record)}
                </td>

                {/* 8. Action */}
                <td className="py-3 px-4 align-middle text-center sticky right-0 bg-white group-hover:bg-slate-50/70">
                  <button
                    type="button"
                    onClick={() => onViewDetails(record.fundingReference)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#0D93AA] text-slate-700 hover:text-white transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
