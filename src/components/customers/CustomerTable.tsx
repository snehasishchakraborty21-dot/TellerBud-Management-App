import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import {
  CustomerRecord,
  CustomerSortField,
  CustomerSortDirection,
} from '../../types/customer';
import { CustomerStatusBadge } from './CustomerStatusBadge';
import { maskZambianPhone } from '../../utils/customerUtils';
import { formatZMW } from '../../utils/formatters';

interface CustomerTableProps {
  customers: CustomerRecord[];
  loading?: boolean;
  error?: string | null;
  sortField: CustomerSortField;
  sortDirection: CustomerSortDirection;
  onSort: (field: CustomerSortField) => void;
  onViewProfile: (customerId: string) => void;
  onRetry?: () => void;
  hasActiveFilters?: boolean;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading = false,
  error = null,
  sortField,
  sortDirection,
  onSort,
  onViewProfile,
  onRetry,
  hasActiveFilters = false,
}) => {
  const renderSortIcon = (field: CustomerSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0D93AA] ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0D93AA] ml-1" />
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
              {/* 1. Customer */}
              <th scope="col" className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => onSort('name')}
                  className="group inline-flex items-center hover:text-gray-900 transition-colors focus:outline-none"
                >
                  <span>Customer</span>
                  {renderSortIcon('name')}
                </button>
              </th>

              {/* 2. Mobile Number */}
              <th scope="col" className="py-3.5 px-4">
                Mobile Number
              </th>

              {/* 3. Account Status */}
              <th scope="col" className="py-3.5 px-4">
                Account Status
              </th>

              {/* 4. Wallet Balance */}
              <th scope="col" className="py-3.5 px-4 text-right">
                <button
                  type="button"
                  onClick={() => onSort('walletBalance')}
                  className="group inline-flex items-center justify-end hover:text-gray-900 transition-colors focus:outline-none ml-auto"
                >
                  <span>Wallet Balance</span>
                  {renderSortIcon('walletBalance')}
                </button>
              </th>

              {/* 5. Active Requests */}
              <th scope="col" className="py-3.5 px-4 text-center">
                <button
                  type="button"
                  onClick={() => onSort('activeRequestsCount')}
                  className="group inline-flex items-center justify-center hover:text-gray-900 transition-colors focus:outline-none mx-auto"
                >
                  <span>Active Requests</span>
                  {renderSortIcon('activeRequestsCount')}
                </button>
              </th>

              {/* 6. Pending Withdrawal */}
              <th scope="col" className="py-3.5 px-4 text-center">
                <button
                  type="button"
                  onClick={() => onSort('pendingWithdrawalsCount')}
                  className="group inline-flex items-center justify-center hover:text-gray-900 transition-colors focus:outline-none mx-auto"
                >
                  <span>Pending Withdrawal</span>
                  {renderSortIcon('pendingWithdrawalsCount')}
                </button>
              </th>

              {/* 7. Last Activity */}
              <th scope="col" className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => onSort('lastActivityTimestamp')}
                  className="group inline-flex items-center hover:text-gray-900 transition-colors focus:outline-none"
                >
                  <span>Last Activity</span>
                  {renderSortIcon('lastActivityTimestamp')}
                </button>
              </th>

              {/* 8. Registered */}
              <th scope="col" className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => onSort('registeredDateIso')}
                  className="group inline-flex items-center hover:text-gray-900 transition-colors focus:outline-none"
                >
                  <span>Registered</span>
                  {renderSortIcon('registeredDateIso')}
                </button>
              </th>

              {/* 9. Action (Sticky Right) */}
              <th
                scope="col"
                className="py-3.5 px-4 text-center sticky right-0 bg-gray-50/95 backdrop-blur-xs shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10 w-28"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              // Skeleton loading state
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-3.5 w-28 bg-gray-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-3.5 w-24 bg-gray-200 rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-3.5 w-6 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-3.5 w-6 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-3.5 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-3.5 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="py-4 px-4 text-center sticky right-0 bg-white">
                    <div className="h-7 w-20 bg-gray-200 rounded-lg mx-auto" />
                  </td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    {hasActiveFilters
                      ? 'No Customers match the selected filters.'
                      : 'No registered Customers were found.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {hasActiveFilters
                      ? 'Try adjusting your search criteria or resetting filters.'
                      : 'Registered customer accounts will appear here once verified.'}
                  </p>
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50/70 transition-colors group"
                  >
                    {/* 1. Customer: Avatar, Name, ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-200">
                          {customer.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {customer.name}
                          </div>
                          <div className="text-xs font-mono text-gray-500">
                            {customer.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Mobile Number (Partially Masked) */}
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                      {maskZambianPhone(customer.phone)}
                    </td>

                    {/* 3. Account Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CustomerStatusBadge status={customer.accountStatus} />
                    </td>

                    {/* 4. Available Wallet Balance */}
                    <td className="py-3.5 px-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                      {formatZMW(customer.walletBalance)}
                    </td>

                    {/* 5. Active Requests Count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {customer.activeRequestsCount > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {customer.activeRequestsCount}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">
                          0
                        </span>
                      )}
                    </td>

                    {/* 6. Pending Withdrawal Count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {customer.pendingWithdrawalsCount > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {customer.pendingWithdrawalsCount}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium select-none">
                          —
                        </span>
                      )}
                    </td>

                    {/* 7. Last Activity */}
                    <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                      {customer.lastActivity}
                    </td>

                    {/* 8. Registered Date */}
                    <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                      {customer.registeredDate}
                    </td>

                    {/* 9. Action: View Profile Button (Sticky Right) */}
                    <td className="py-3.5 px-4 text-center sticky right-0 bg-white group-hover:bg-gray-50/90 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewProfile(customer.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0D93AA] bg-cyan-50/80 hover:bg-[#0D93AA] hover:text-white border border-cyan-200/60 hover:border-[#0D93AA] transition-all cursor-pointer shadow-2xs"
                        title={`View Profile for ${customer.name}`}
                      >
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
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
