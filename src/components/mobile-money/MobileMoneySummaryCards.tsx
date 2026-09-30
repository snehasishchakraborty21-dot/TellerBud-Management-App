import React from 'react';
import { Clock } from 'lucide-react';
import { MobileMoneyKPIPeriods } from '../../types/mobileMoney';
import { isToday } from '../../utils/dateUtils';

interface MobileMoneySummaryCardsProps {
  kpis: MobileMoneyKPIPeriods;
  isLoading?: boolean;
  selectedDate?: string;
}

export const MobileMoneySummaryCards: React.FC<MobileMoneySummaryCardsProps> = ({
  kpis,
  isLoading = false,
  selectedDate,
}) => {
  const isHistorical = Boolean(selectedDate && !isToday(selectedDate));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
      {/* 1. TODAY'S / SELECTED DATE'S TRANSACTIONS */}
      <div
        id="kpi-card-todays-transactions"
        className="bg-white rounded-xl border border-gray-200/90 px-3.5 sm:px-4 py-3 shadow-2xs h-[66px] flex items-center justify-between gap-2"
      >
        <span className="text-[11px] sm:text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider truncate">
          {isHistorical ? 'Selected Date Transactions' : 'Today’s Transactions'}
        </span>
        <span className="text-[18px] sm:text-[20px] font-bold font-mono tracking-tight text-gray-900 leading-none shrink-0">
          {isLoading ? '...' : (kpis?.todayCount ?? 0).toLocaleString()}
        </span>
      </div>

      {/* 2. WEEK TO DATE */}
      <div
        id="kpi-card-week-to-date"
        className="bg-white rounded-xl border border-gray-200/90 px-3.5 sm:px-4 py-2.5 shadow-2xs h-[66px] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-[11px] sm:text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider truncate">
            Week to Date
          </span>
          <span className="text-[18px] sm:text-[20px] font-bold font-mono tracking-tight text-gray-900 leading-none shrink-0">
            {isLoading ? '...' : (kpis?.weekToDateCount ?? 0).toLocaleString()}
          </span>
        </div>
        <span className="text-[9.5px] sm:text-[10px] text-gray-400 font-normal leading-none tracking-tight">
          Week starts Monday
        </span>
      </div>

      {/* 3. MONTH TO DATE */}
      <div
        id="kpi-card-month-to-date"
        className="bg-white rounded-xl border border-gray-200/90 px-3.5 sm:px-4 py-3 shadow-2xs h-[66px] flex items-center justify-between gap-2"
      >
        <span className="text-[11px] sm:text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider truncate">
          Month to Date
        </span>
        <span className="text-[18px] sm:text-[20px] font-bold font-mono tracking-tight text-gray-900 leading-none shrink-0">
          {isLoading ? '...' : (kpis?.monthToDateCount ?? 0).toLocaleString()}
        </span>
      </div>

      {/* 4. YEAR TO DATE */}
      <div
        id="kpi-card-year-to-date"
        className="bg-white rounded-xl border border-gray-200/90 px-3.5 sm:px-4 py-3 shadow-2xs h-[66px] flex items-center justify-between gap-2"
      >
        <span className="text-[11px] sm:text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider truncate">
          Year to Date
        </span>
        <span className="text-[18px] sm:text-[20px] font-bold font-mono tracking-tight text-gray-900 leading-none shrink-0">
          {isLoading ? '...' : (kpis?.yearToDateCount ?? 0).toLocaleString()}
        </span>
      </div>

      {/* 5. MONTH TO DATE COMMISSION */}
      <div
        id="kpi-card-mtd-commission"
        aria-disabled="true"
        className="bg-amber-50/40 rounded-xl border border-amber-200/80 px-3.5 sm:px-4 py-2.5 shadow-2xs h-[66px] flex flex-col justify-center items-start gap-1 select-none"
      >
        <span className="text-[10.5px] sm:text-[11px] font-semibold text-amber-900/80 uppercase tracking-wider leading-tight whitespace-nowrap">
          Month to Date Commission
        </span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[9.5px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
          <Clock size={10} className="shrink-0 text-amber-700" />
          Coming Soon
        </span>
      </div>
    </div>
  );
};
