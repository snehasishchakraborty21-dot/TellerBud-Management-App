import React from 'react';
import {
  Calendar,
  CalendarRange,
  CalendarDays,
  CalendarCheck,
  Percent,
  Clock,
} from 'lucide-react';
import { MobileMoneyKPIPeriods } from '../../types/mobileMoney';

interface MobileMoneySummaryCardsProps {
  kpis: MobileMoneyKPIPeriods;
  isLoading?: boolean;
}

export const MobileMoneySummaryCards: React.FC<MobileMoneySummaryCardsProps> = ({
  kpis,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. TODAY'S TRANSACTIONS */}
      <div
        id="kpi-card-todays-transactions"
        className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Today’s Transactions
          </span>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-gray-900">
            {isLoading ? '...' : (kpis?.todayCount ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            Created today (CAT)
          </div>
        </div>
      </div>

      {/* 2. WEEK TO DATE */}
      <div
        id="kpi-card-week-to-date"
        className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Week to Date
          </span>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarRange size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-gray-900">
            {isLoading ? '...' : (kpis?.weekToDateCount ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            Monday through today
          </div>
        </div>
      </div>

      {/* 3. MONTH TO DATE */}
      <div
        id="kpi-card-month-to-date"
        className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Month to Date
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarDays size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-gray-900">
            {isLoading ? '...' : (kpis?.monthToDateCount ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            1st of month through today
          </div>
        </div>
      </div>

      {/* 4. YEAR TO DATE */}
      <div
        id="kpi-card-year-to-date"
        className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Year to Date
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-gray-900">
            {isLoading ? '...' : (kpis?.yearToDateCount ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            1 Jan through today
          </div>
        </div>
      </div>

      {/* 5. MONTH TO DATE COMMISSION */}
      <div
        id="kpi-card-mtd-commission"
        aria-disabled="true"
        className="bg-amber-50/40 rounded-xl border border-amber-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between cursor-not-allowed select-none"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-amber-900/80 uppercase tracking-wider">
            Month to Date Commission
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Percent size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              <Clock size={12} className="shrink-0 text-amber-700" />
              Coming Soon
            </span>
          </div>
          <div className="text-[11px] text-amber-800/80 font-medium mt-2">
            MNO commissions — Phase 2.
          </div>
        </div>
      </div>
    </div>
  );
};
