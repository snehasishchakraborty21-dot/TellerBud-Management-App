import React, { useState, useMemo } from 'react';
import { ChevronDown, TrendingUp, Calendar } from 'lucide-react';
import { formatZMW } from '../../utils/formatters';
import { MOCK_BUSINESS_TRANSACTIONS } from '../../data/mockBusinessTransactionsData';

interface MonthData {
  monthIndex: number;
  monthName: string;
  shortName: string;
  amount: number;
  count: number;
}

// Base seed volumes by year to combine with dynamic live completed transactions
const BASE_YEAR_DATA: Record<number, number[]> = {
  2026: [
    342500, // Jan
    418200, // Feb
    520000, // Mar
    485300, // Apr
    612400, // May
    589100, // Jun
    695800, // Jul
    842650, // Aug
    725400, // Sep (current month in demo)
    0,      // Oct
    0,      // Nov
    0,      // Dec
  ],
  2025: [
    180000, 210000, 245000, 290000, 310000, 340000,
    380000, 420000, 450000, 490000, 510000, 560000,
  ],
  2024: [
    85000, 95000, 110000, 125000, 140000, 160000,
    175000, 190000, 210000, 225000, 240000, 260000,
  ],
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORTS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface MonthlyBusinessTransactionChartProps {
  initialYear?: number;
}

export const MonthlyBusinessTransactionChart: React.FC<MonthlyBusinessTransactionChartProps> = ({
  initialYear = 2026,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const availableYears = [2026, 2025, 2024];

  // Dynamically aggregate completed business transactions for the selected year
  const monthlyData: MonthData[] = useMemo(() => {
    const baseAmounts = BASE_YEAR_DATA[selectedYear] || Array(12).fill(0);
    const amounts = [...baseAmounts];
    const counts = [
      48, 56, 68, 62, 79, 74, 88, 104, 92, 0, 0, 0,
    ];

    // Compute additional completed transactions dynamically from records
    MOCK_BUSINESS_TRANSACTIONS.forEach((txn) => {
      if (txn.status === 'Completed') {
        const dateStr = txn.rawDate || txn.createdAt || '';
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime()) && date.getFullYear() === selectedYear) {
            const m = date.getMonth();
            if (m >= 0 && m < 12) {
              // Add to transaction count
              counts[m] += 1;
            }
          }
        }
      }
    });

    return MONTH_NAMES.map((name, idx) => ({
      monthIndex: idx,
      monthName: name,
      shortName: MONTH_SHORTS[idx],
      amount: amounts[idx] || 0,
      count: amounts[idx] > 0 ? counts[idx] : 0,
    }));
  }, [selectedYear]);

  // Calculate maximum value for chart scale
  const maxAmount = useMemo(() => {
    const maxVal = Math.max(...monthlyData.map((d) => d.amount), 100000);
    // Round up to a clean multiple
    return Math.ceil(maxVal / 100000) * 100000;
  }, [monthlyData]);

  // Calculate annual total
  const annualTotal = useMemo(() => {
    return monthlyData.reduce((sum, d) => sum + d.amount, 0);
  }, [monthlyData]);

  // Grid steps for Y-axis
  const yAxisTicks = useMemo(() => {
    const steps = 4;
    const stepValue = maxAmount / steps;
    return Array.from({ length: steps + 1 }, (_, i) => maxAmount - i * stepValue);
  }, [maxAmount]);

  const formatShortZMW = (val: number): string => {
    if (val === 0) return 'ZMW 0';
    if (val >= 1000000) return `ZMW ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `ZMW ${(val / 1000).toFixed(0)}k`;
    return `ZMW ${val}`;
  };

  const activeHoveredData = hoveredIndex !== null ? monthlyData[hoveredIndex] : null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col space-y-5 w-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base sm:text-lg text-[#102025]">
              Monthly Business Transaction Amount
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Total completed transaction volume processed across all registered business agencies
          </p>
        </div>

        {/* Right Header Controls: Year Selector & Annual Total */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Year Total Badge */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {selectedYear} Total:
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#0D93AA]">
              {formatZMW(annualTotal)}
            </span>
          </div>

          {/* Year Selector Dropdown */}
          <div className="relative inline-block">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:border-[#0D93AA] focus-within:ring-2 focus-within:ring-[#0D93AA]/20 transition-all">
              <Calendar size={13} className="text-[#0D93AA]" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="text-gray-400 absolute right-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Hover Readout Banner (Stable, non-jittering secondary indicator) */}
      <div className="h-6 flex items-center justify-between px-1">
        {activeHoveredData ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-600">
              {activeHoveredData.monthName} {selectedYear}:
            </span>
            <span className="font-bold font-mono text-[#0D93AA] text-sm">
              {formatZMW(activeHoveredData.amount)}
            </span>
            {activeHoveredData.amount > 0 ? (
              <span className="text-[11px] text-gray-400">
                ({activeHoveredData.count} completed transactions)
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 italic">
                (Zero transactions)
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-gray-400" />
            <span>Hover over any monthly bar for detailed transaction amount</span>
          </div>
        )}
      </div>

      {/* Bar Chart Area */}
      <div className="relative w-full h-[280px] sm:h-[320px] flex pt-2">
        {/* Y-Axis Labels */}
        <div className="w-16 sm:w-20 shrink-0 flex flex-col justify-between text-right pr-2.5 sm:pr-3 text-[10px] sm:text-[11px] font-mono font-medium text-gray-400 select-none pb-7">
          {yAxisTicks.map((tickVal, idx) => (
            <span key={idx} className="leading-none transform -translate-y-1/2 truncate">
              {formatShortZMW(tickVal)}
            </span>
          ))}
        </div>

        {/* Main Chart Grid & Bars */}
        <div className="relative flex-1 flex flex-col h-full">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 bottom-7 flex flex-col justify-between pointer-events-none">
            {yAxisTicks.map((_, idx) => (
              <div
                key={idx}
                className={`w-full border-b ${
                  idx === yAxisTicks.length - 1
                    ? 'border-gray-300'
                    : 'border-gray-100'
                }`}
              />
            ))}
          </div>

          {/* Bars Container */}
          <div className="relative z-10 flex-1 grid grid-cols-12 gap-1 sm:gap-2.5 items-end px-1 sm:px-2 pb-7">
            {monthlyData.map((data, idx) => {
              const isHovered = hoveredIndex === idx;
              const hasAmount = data.amount > 0;
              const heightPercent = hasAmount
                ? Math.max(4, Math.min(100, (data.amount / maxAmount) * 100))
                : 0;

              return (
                <div
                  key={data.monthIndex}
                  className="relative h-full flex flex-col justify-end items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Floating Tooltip (Stable & Pointer-events-none) */}
                  {isHovered && (
                    <div
                      className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap bg-[#102025] text-white text-[11px] py-1.5 px-2.5 rounded-md shadow-lg flex flex-col items-center animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="font-semibold text-gray-200">
                        {data.monthName} {selectedYear}
                      </div>
                      <div className="font-bold font-mono text-[#0D93AA] text-xs">
                        {formatZMW(data.amount)}
                      </div>
                      {/* Tooltip Triangle Arrow */}
                      <div className="w-2 h-2 bg-[#102025] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                    </div>
                  )}

                  {/* Vertical Bar */}
                  {hasAmount ? (
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] rounded-t-md transition-all duration-200 ${
                        isHovered
                          ? 'bg-[#0B7C90] shadow-md shadow-[#0D93AA]/20 scale-y-[1.01]'
                          : 'bg-[#0D93AA] hover:bg-[#0B7C90]'
                      }`}
                    />
                  ) : (
                    /* Zero Value State */
                    <div className="w-full max-w-[42px] flex flex-col items-center">
                      <div
                        className={`w-full h-[3px] rounded-full transition-colors ${
                          isHovered ? 'bg-[#0D93AA]' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}

                  {/* X-Axis Month Label */}
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-center w-full">
                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold transition-colors truncate block ${
                        isHovered
                          ? 'text-[#0D93AA] font-bold'
                          : hasAmount
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <span className="hidden sm:inline">{data.shortName}</span>
                      <span className="sm:hidden">{data.shortName.slice(0, 1)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
