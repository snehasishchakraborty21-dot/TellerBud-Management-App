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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1.15fr] gap-3 sm:gap-3.5 xl:gap-4">
      {/* 1. TODAY'S / SELECTED DATE'S TRANSACTIONS */}
      <div
        id="kpi-card-todays-transactions"
        className="bg-white rounded-xl border border-gray-200/90 p-[14px] shadow-2xs h-[86px] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">
            {isHistorical ? 'Selected Date Transactions' : 'Today’s Transactions'}
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold font-mono tracking-tight text-gray-900 leading-none shrink-0">
            {isLoading ? '...' : (kpis?.todayCount ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] sm:text-[10.5px] text-gray-500 font-normal leading-tight truncate">
          {isHistorical ? 'Recorded on selected date (CAT)' : 'Created today (CAT)'}
        </div>
      </div>

      {/* 2. WEEK TO DATE */}
      <div
        id="kpi-card-week-to-date"
        className="bg-white rounded-xl border border-gray-200/90 p-[14px] shadow-2xs h-[86px] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">
            Week to Date
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold font-mono tracking-tight text-gray-900 leading-none shrink-0">
            {isLoading ? '...' : (kpis?.weekToDateCount ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] sm:text-[10.5px] text-gray-500 font-normal leading-tight truncate">
          {isHistorical ? 'Monday through selected date' : 'Monday through today'}
        </div>
      </div>

      {/* 3. MONTH TO DATE */}
      <div
        id="kpi-card-month-to-date"
        className="bg-white rounded-xl border border-gray-200/90 p-[14px] shadow-2xs h-[86px] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">
            Month to Date
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold font-mono tracking-tight text-gray-900 leading-none shrink-0">
            {isLoading ? '...' : (kpis?.monthToDateCount ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] sm:text-[10.5px] text-gray-500 font-normal leading-tight truncate">
          {isHistorical ? '1st of month through selected date' : '1st of month through today'}
        </div>
      </div>

      {/* 4. YEAR TO DATE */}
      <div
        id="kpi-card-year-to-date"
        className="bg-white rounded-xl border border-gray-200/90 p-[14px] shadow-2xs h-[86px] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">
            Year to Date
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold font-mono tracking-tight text-gray-900 leading-none shrink-0">
            {isLoading ? '...' : (kpis?.yearToDateCount ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] sm:text-[10.5px] text-gray-500 font-normal leading-tight truncate">
          {isHistorical ? '1 Jan through selected date' : '1 Jan through today'}
        </div>
      </div>

      {/* 5. MONTH TO DATE COMMISSION */}
      <div
        id="kpi-card-mtd-commission"
        aria-disabled="true"
        className="bg-amber-50/40 rounded-xl border border-amber-200/80 p-[14px] shadow-2xs h-[86px] flex flex-col justify-center items-start cursor-not-allowed select-none"
      >
        <span className="text-[10px] sm:text-[10.5px] font-semibold text-amber-900/80 uppercase tracking-tight whitespace-nowrap leading-tight">
          Month to Date Commission
        </span>
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[9.5px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <Clock size={10} className="shrink-0 text-amber-700" />
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
};
