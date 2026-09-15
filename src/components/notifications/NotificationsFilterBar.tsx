import React from 'react';
import { Search, RotateCcw, FilterX, Calendar } from 'lucide-react';
import {
  NotificationFiltersState,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
} from '../../types/notificationsPage';

interface NotificationsFilterBarProps {
  filters: NotificationFiltersState;
  onChange: (filters: NotificationFiltersState) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const CATEGORIES: ('All' | NotificationCategory)[] = [
  'All',
  'Withdrawal',
  'Transaction',
  'Provider/API',
  'Reconciliation',
  'Vendor Eligibility',
  'System',
];

const PRIORITIES: ('All' | NotificationPriority)[] = [
  'All',
  'Critical',
  'High',
  'Medium',
  'Low',
];

const STATUSES: ('All' | NotificationStatus)[] = [
  'All',
  'Unread',
  'Read',
  'Resolved',
];

export const NotificationsFilterBar: React.FC<NotificationsFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}) => {
  const isFiltered =
    Boolean(filters.search.trim()) ||
    filters.category !== 'All' ||
    filters.priority !== 'All' ||
    filters.status !== 'All' ||
    Boolean(filters.fromDate) ||
    Boolean(filters.toDate);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-3 shadow-2xs">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            id="input-search-notifications"
            type="text"
            placeholder="Search notification, reference or message..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-[#0D93AA] focus:bg-white transition-colors"
          />
        </div>

        {/* Dropdowns & Date Pickers & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            id="select-category-filter"
            value={filters.category}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value as 'All' | NotificationCategory,
              })
            }
            className="text-xs font-medium bg-[#F8FAFC] border border-gray-200 text-gray-700 py-1.5 px-2.5 rounded-lg focus:outline-hidden focus:border-[#0D93AA] focus:bg-white cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            id="select-priority-filter"
            value={filters.priority}
            onChange={(e) =>
              onChange({
                ...filters,
                priority: e.target.value as 'All' | NotificationPriority,
              })
            }
            className="text-xs font-medium bg-[#F8FAFC] border border-gray-200 text-gray-700 py-1.5 px-2.5 rounded-lg focus:outline-hidden focus:border-[#0D93AA] focus:bg-white cursor-pointer"
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.filter((p) => p !== 'All').map((pri) => (
              <option key={pri} value={pri}>
                {pri}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            id="select-status-filter"
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as 'All' | NotificationStatus,
              })
            }
            className="text-xs font-medium bg-[#F8FAFC] border border-gray-200 text-gray-700 py-1.5 px-2.5 rounded-lg focus:outline-hidden focus:border-[#0D93AA] focus:bg-white cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {STATUSES.filter((s) => s !== 'All').map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Date range inputs */}
          <div className="flex items-center gap-1">
            <input
              id="input-from-date"
              type="date"
              value={filters.fromDate}
              onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
              title="From date"
              aria-label="From date"
              className="text-xs font-medium bg-[#F8FAFC] border border-gray-200 text-gray-700 py-1.5 px-2 rounded-lg focus:outline-hidden focus:border-[#0D93AA] focus:bg-white cursor-pointer"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              id="input-to-date"
              type="date"
              value={filters.toDate}
              onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
              title="To date"
              aria-label="To date"
              className="text-xs font-medium bg-[#F8FAFC] border border-gray-200 text-gray-700 py-1.5 px-2 rounded-lg focus:outline-hidden focus:border-[#0D93AA] focus:bg-white cursor-pointer"
            />
          </div>

          {/* Action buttons: Clear Filters before Refresh */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              id="btn-clear-filters"
              onClick={onReset}
              disabled={!isFiltered}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shrink-0"
              title={isFiltered ? 'Clear all applied filters' : 'No filters currently applied'}
            >
              <FilterX size={13} />
              <span>Clear Filters</span>
            </button>

            <button
              type="button"
              id="btn-refresh-notifications"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title="Refresh notifications"
            >
              <RotateCcw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
