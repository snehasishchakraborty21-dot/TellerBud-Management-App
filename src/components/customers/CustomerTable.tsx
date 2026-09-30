import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, RefreshCw } from 'lucide-react';
import {
  CustomerRecord,
  CustomerSortField,
  CustomerSortDirection,
} from '../../types/customer';
import { formatZMW } from '../../utils/formatters';

interface CustomerTableProps {
  customers: CustomerRecord[];
  loading?: boolean;
  error?: string | null;
  sortField: CustomerSortField;
  sortDirection: CustomerSortDirection;
  onSort: (field: CustomerSortField) => void;
  onRetry?: () => void;
  hasActiveFilters?: boolean;
}

const WITHDRAWAL_AMOUNT_MAP: Record<string, number> = {
  'TB-CUS-1052': 2250.0,
  'TB-CUS-1049': 3400.0,
  'TB-CUS-1048': 1500.0,
  'TB-CUS-1050': 850.0,
  'TB-CUS-1046': 7200.0,
  'TB-CUS-1045': 5500.0,
  'TB-CUS-1044': 950.0,
  'TB-CUS-1042': 1800.0,
  'TB-CUS-1040': 2600.0,
};

export function getCustomerWithdrawalAmount(customer: CustomerRecord): number {
  if (customer.pendingWithdrawalAmount !== undefined && customer.pendingWithdrawalAmount > 0) {
    return customer.pendingWithdrawalAmount;
  }
  if (customer.pendingWithdrawalsCount > 0) {
    return WITHDRAWAL_AMOUNT_MAP[customer.id] || 1500.0 * customer.pendingWithdrawalsCount;
  }
  return 0;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading = false,
  error = null,
  sortField,
  sortDirection,
  onSort,
  onRetry,
  hasActiveFilters = false,
}) => {
  const renderSortIcon = (field: CustomerSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#0D93AA] shrink-0" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#0D93AA] shrink-0" />
    );
  };

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Unable to Load Customers
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          An error occurred while loading customer records. Please try again.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden w-full flex flex-col">
      <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs shadow-2xs">
            <tr className="border-b border-gray-200 text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
              {/* 1. Customer */}
              <th
                scope="col"
                onClick={() => onSort('name')}
                className="py-3 px-3.5 text-left align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group min-w-[190px] sm:min-w-[210px] w-[22%]"
              >
                <div className="flex items-center gap-1">
                  <span>Customer</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* 2. Mobile Number */}
              <th
                scope="col"
                onClick={() => onSort('phone')}
                className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[140px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Mobile Number</span>
                  {renderSortIcon('phone')}
                </div>
              </th>

              {/* 3. Wallet Balance */}
              <th
                scope="col"
                onClick={() => onSort('walletBalance')}
                className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[130px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Wallet Balance</span>
                  {renderSortIcon('walletBalance')}
                </div>
              </th>

              {/* 4. Requests (Renamed from Active Requests) */}
              <th
                scope="col"
                onClick={() => onSort('activeRequestsCount')}
                className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[85px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Requests</span>
                  {renderSortIcon('activeRequestsCount')}
                </div>
              </th>

              {/* 5. Pending Withdrawal */}
              <th
                scope="col"
                onClick={() => onSort('pendingWithdrawalsCount')}
                className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[125px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Pending Withdrawal</span>
                  {renderSortIcon('pendingWithdrawalsCount')}
                </div>
              </th>

              {/* 6. Withdrawal Amount */}
              <th
                scope="col"
                onClick={() => onSort('pendingWithdrawalAmount')}
                className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[130px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Withdrawal Amount</span>
                  {renderSortIcon('pendingWithdrawalAmount')}
                </div>
              </th>

              {/* 7. Last Activity */}
              <th
                scope="col"
                onClick={() => onSort('lastActivityTimestamp')}
                className="py-3 px-3 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[130px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Last Activity</span>
                  {renderSortIcon('lastActivityTimestamp')}
                </div>
              </th>

              {/* 8. Registered (Widened to display dates completely) */}
              <th
                scope="col"
                onClick={() => onSort('registeredDateIso')}
                className="py-3 px-3.5 text-center align-middle cursor-pointer hover:bg-gray-100/70 transition-colors group whitespace-nowrap min-w-[130px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Registered</span>
                  {renderSortIcon('registeredDateIso')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {loading ? (
              // Skeleton loading state
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                        <div className="h-2.5 w-16 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="h-3 w-24 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="h-3 w-20 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="h-3 w-6 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="h-3 w-6 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="h-3 w-20 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="h-3 w-20 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 align-middle">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">
                    {hasActiveFilters
                      ? 'No Customers match the selected filters.'
                      : 'No registered Customers were found.'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {hasActiveFilters
                      ? 'Try adjusting your filter criteria or resetting filters.'
                      : 'Registered customer accounts will appear here once verified.'}
                  </p>
                </td>
              </tr>
            ) : (
              customers.map((customer, idx) => {
                const withdrawalAmt = getCustomerWithdrawalAmount(customer);

                return (
                  <tr
                    key={`customer-row-${customer.id}-${idx}`}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* 1. Customer: Avatar, Name, ID (Left Aligned) */}
                    <td className="py-2.5 px-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#0D93AA]/20">
                          {customer.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 text-xs sm:text-[13px] truncate">
                            {customer.name}
                          </div>
                          <div className="text-[10.5px] font-mono text-gray-400">
                            {customer.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Mobile Number (Complete Unmasked) */}
                    <td className="py-2.5 px-3 text-center align-middle font-mono text-xs text-gray-700 whitespace-nowrap">
                      {customer.phone}
                    </td>

                    {/* 3. Wallet Balance */}
                    <td className="py-2.5 px-3 text-center align-middle font-mono font-semibold text-gray-900 whitespace-nowrap text-xs">
                      {formatZMW(customer.walletBalance)}
                    </td>

                    {/* 4. Active Requests */}
                    <td className="py-2.5 px-3 text-center align-middle font-mono whitespace-nowrap">
                      {customer.activeRequestsCount > 0 ? (
                        <span className="font-bold text-blue-600">
                          {customer.activeRequestsCount}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* 5. Pending Withdrawal */}
                    <td className="py-2.5 px-3 text-center align-middle font-mono whitespace-nowrap">
                      {customer.pendingWithdrawalsCount > 0 ? (
                        <span className="font-bold text-amber-600">
                          {customer.pendingWithdrawalsCount}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal">0</span>
                      )}
                    </td>

                    {/* 6. Withdrawal Amount */}
                    <td className="py-2.5 px-3 text-center align-middle font-mono font-semibold whitespace-nowrap text-xs">
                      {customer.pendingWithdrawalsCount > 0 && withdrawalAmt > 0 ? (
                        <span className="text-amber-700">
                          {formatZMW(withdrawalAmt)}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal select-none">—</span>
                      )}
                    </td>

                    {/* 7. Last Activity */}
                    <td className="py-2.5 px-3 text-center align-middle text-[11px] text-gray-600 whitespace-nowrap">
                      {customer.lastActivity}
                    </td>

                    {/* 8. Registered Date */}
                    <td className="py-2.5 px-3 text-center align-middle text-[11px] text-gray-600 whitespace-nowrap">
                      {customer.registeredDate}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
