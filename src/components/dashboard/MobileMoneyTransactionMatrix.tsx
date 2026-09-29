import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/mockAdminService';
import { useAuth } from '../../context/AuthContext';
import { MobileMoneyTransaction } from '../../types/mobileMoney';
import { formatZMW } from '../../utils/formatters';
import { getLusakaDateString } from '../../utils/dateUtils';

interface MobileMoneyTransactionMatrixProps {
  year?: number;
  className?: string;
}

interface CellData {
  dateStr: string;
  day: number;
  monthIndex: number;
  isValid: boolean;
  count: number;
  totalValue: number;
  isToday: boolean;
}

const MONTH_NAMES = [
  { full: 'January', short: 'Jan' },
  { full: 'February', short: 'Feb' },
  { full: 'March', short: 'Mar' },
  { full: 'April', short: 'Apr' },
  { full: 'May', short: 'May' },
  { full: 'June', short: 'Jun' },
  { full: 'July', short: 'Jul' },
  { full: 'August', short: 'Aug' },
  { full: 'September', short: 'Sep' },
  { full: 'October', short: 'Oct' },
  { full: 'November', short: 'Nov' },
  { full: 'December', short: 'Dec' },
];

/**
 * Returns whether a given day is valid for the specified year and month (0-indexed).
 * Handles leap years dynamically (e.g. 2028 is leap year, 2026 is non-leap year).
 */
function isValidDayForMonth(year: number, monthIndex: number, day: number): boolean {
  if (day < 1 || day > 31) return false;
  // Get days in specified month
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return day <= daysInMonth;
}

export const MobileMoneyTransactionMatrix: React.FC<MobileMoneyTransactionMatrixProps> = ({
  year = 2026,
  className = '',
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const businessScope =
    currentUser?.role === 'super_admin'
      ? undefined
      : currentUser?.businessName || currentUser?.businessId || 'Lusaka Central Express Agency';

  const [allTransactions, setAllTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [, setIsLoading] = useState<boolean>(true);

  // Available years: starting strictly from 2026 (TellerBud launch year) and detecting future years
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const maxYear = Math.max(2026, currentYear);

    // Also scan transactions for any future years
    let txnMaxYear = 2026;
    allTransactions.forEach((t) => {
      const y = parseInt(t.postedAt.split('-')[0], 10);
      if (!isNaN(y) && y > txnMaxYear) {
        txnMaxYear = y;
      }
    });

    const topYear = Math.max(maxYear, txnMaxYear);
    const years: number[] = [];
    for (let y = topYear; y >= 2026; y--) {
      years.push(y);
    }
    return years;
  }, [allTransactions]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return year && year >= 2026 ? year : 2026;
  });

  // Sync if parent year prop changes
  useEffect(() => {
    if (year && year >= 2026 && year !== selectedYear) {
      setSelectedYear(year);
    }
  }, [year]);

  // Load transactions for business scope
  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const res = await adminService.getMobileMoneyTransactions(
          {},
          { field: 'postedAt', direction: 'desc' },
          businessScope
        );
        if (isMounted) {
          setAllTransactions(res.items);
        }
      } catch (err) {
        console.error('Failed to load mobile money transactions for matrix:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();
    return () => {
      isMounted = false;
    };
  }, [businessScope]);

  // Today Lusaka date for current month highlighting
  const todayLusaka = useMemo(() => getLusakaDateString(), []);
  const [todayY, todayM, todayD] = useMemo(() => {
    const parts = todayLusaka.split('-').map(Number);
    return [parts[0] || 2026, (parts[1] || 9) - 1, parts[2] || 8];
  }, [todayLusaka]);

  // Active matrix calculation for selectedYear
  const { matrixData, monthlyTotals, yearTotalCount, yearTotalValue } = useMemo(() => {
    // Filter completed Mobile Money transactions (Deposit, Withdrawal, Purchase) for the selected year
    const relevantTxns = allTransactions.filter((t) => {
      if (t.status !== 'Completed') return false;
      if (!['Deposit', 'Withdrawal', 'Purchase'].includes(t.transactionType)) return false;
      const tYear = parseInt(t.postedAt.split('-')[0], 10);
      return tYear === selectedYear;
    });

    // Group transactions by date key: YYYY-MM-DD
    const txnsByDate = new Map<string, { count: number; totalValue: number }>();
    relevantTxns.forEach((t) => {
      const dateKey = getLusakaDateString(t.postedAt) || t.postedAt.split('T')[0];
      const existing = txnsByDate.get(dateKey) || { count: 0, totalValue: 0 };
      existing.count += 1;
      existing.totalValue += t.amount;
      txnsByDate.set(dateKey, existing);
    });

    // Construct 31 x 12 grid (Day 1..31 across Jan..Dec)
    const grid: CellData[][] = [];
    const mTotals = Array(12)
      .fill(0)
      .map(() => ({ count: 0, totalValue: 0 }));
    let yTotalCount = 0;
    let yTotalValue = 0;

    for (let day = 1; day <= 31; day++) {
      const row: CellData[] = [];
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const isValid = isValidDayForMonth(selectedYear, monthIndex, day);
        const monthStr = String(monthIndex + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
        const isToday = selectedYear === todayY && monthIndex === todayM && day === todayD;

        if (!isValid) {
          row.push({
            dateStr,
            day,
            monthIndex,
            isValid: false,
            count: 0,
            totalValue: 0,
            isToday: false,
          });
        } else {
          const stats = txnsByDate.get(dateStr) || { count: 0, totalValue: 0 };
          row.push({
            dateStr,
            day,
            monthIndex,
            isValid: true,
            count: stats.count,
            totalValue: stats.totalValue,
            isToday,
          });

          mTotals[monthIndex].count += stats.count;
          mTotals[monthIndex].totalValue += stats.totalValue;
          yTotalCount += stats.count;
          yTotalValue += stats.totalValue;
        }
      }
      grid.push(row);
    }

    return {
      matrixData: grid,
      monthlyTotals: mTotals,
      yearTotalCount: yTotalCount,
      yearTotalValue: yTotalValue,
    };
  }, [allTransactions, selectedYear, todayY, todayM, todayD]);

  // Decoupled Tooltip state rendered via portal to prevent table layout jitter & re-renders
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    placement: 'top' | 'bottom';
    cell: CellData | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    placement: 'top',
    cell: null,
  });

  const handleCellMouseEnter = (e: React.MouseEvent<HTMLElement>, cell: CellData) => {
    if (!cell.isValid || cell.count === 0) {
      setTooltip((prev) => (prev.visible ? { ...prev, visible: false, cell: null } : prev));
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 220;
    const tooltipHeight = 85;

    // Horizontally center over cell, clamp within window bounds
    let x = rect.left + rect.width / 2;
    x = Math.max(tooltipWidth / 2 + 10, Math.min(window.innerWidth - tooltipWidth / 2 - 10, x));

    // Determine placement (top vs bottom)
    const showBelow = rect.top < tooltipHeight + 15;
    const y = showBelow ? rect.bottom + 6 : rect.top - 6;

    setTooltip({
      visible: true,
      x,
      y,
      placement: showBelow ? 'bottom' : 'top',
      cell,
    });
  };

  const handleCellMouseLeave = () => {
    setTooltip((prev) => (prev.visible ? { ...prev, visible: false, cell: null } : prev));
  };

  // Cell click navigation: Navigate to Mobile Money Transactions page filtered to that selected date
  const handleCellClick = (cell: CellData) => {
    if (!cell.isValid || cell.count === 0) return;
    const targetUrl =
      currentUser?.role === 'super_admin'
        ? `/super-admin/mobile-money-transactions?date=${cell.dateStr}`
        : `/business-owner/mobile-money-transactions?date=${cell.dateStr}`;
    navigate(targetUrl);
  };

  // Formatted date helper for tooltip
  const formatCellDate = (dateStr: string) => {
    try {
      const [yr, mo, da] = dateStr.split('-').map(Number);
      const d = new Date(yr, mo - 1, da);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-xs space-y-4 w-full max-w-none box-border select-none ${className}`}
    >
      {/* Top Header Row: Section Title and Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <ArrowLeftRight size={18} />
          </div>
          <h3 className="text-sm font-bold text-[#102025]">Mobile Money Transactions</h3>
        </div>

        {/* Right Controls: Year Selector */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1 rounded-lg border border-gray-200/80">
            <label
              htmlFor="mm-matrix-year-select"
              className="text-xs font-bold text-gray-600 uppercase tracking-wider text-[11px] whitespace-nowrap"
            >
              Year:
            </label>
            <select
              id="mm-matrix-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="text-xs font-bold text-gray-900 bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Year Summary Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-200/70">
        <div className="px-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Total {selectedYear} Transactions
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-[#102025]">
            {yearTotalCount.toLocaleString()}
          </div>
        </div>
        <div className="px-2 border-l border-gray-200">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Completed Volume (ZMW)
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-[#0D93AA]">
            {formatZMW(yearTotalValue)}
          </div>
        </div>
        <div className="px-2 border-l border-gray-200">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Active Year Status
          </div>
          <div className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Live MNO Settlement
          </div>
        </div>
        <div className="px-2 border-l border-gray-200">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Channels Included
          </div>
          <div className="text-xs sm:text-sm font-semibold text-gray-700 mt-0.5 truncate">
            MTN • Airtel • Zamtel • Banks
          </div>
        </div>
      </div>

      {/* Year-based Transaction Matrix Table Container */}
      <div className="w-full relative rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Scrollable Container with sticky headers and sticky Day column */}
        <div className="overflow-x-auto overflow-y-auto max-h-[440px] relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <table className="w-full border-collapse text-xs table-fixed min-w-[780px]">
            {/* Locked Column Width Allocations */}
            <colgroup><col style={{ width: '84px' }} />{MONTH_NAMES.map((m) => (<col key={m.short} style={{ width: '7.63%' }} />))}</colgroup>

            {/* Sticky Table Header: Month Columns */}
            <thead className="sticky top-0 z-30 bg-[#F9FAFB] shadow-[0_1px_0_0_#E2E8F0]">
              <tr>
                {/* Frozen Top-Left Corner: "Day" heading */}
                <th className="sticky left-0 z-40 bg-[#F1F5F9] text-left px-3 py-2.5 font-bold text-gray-800 text-[11px] uppercase tracking-wider border-r border-b border-gray-200 shadow-[1px_0_0_0_#E2E8F0]">
                  Day
                </th>
                {MONTH_NAMES.map((m, idx) => {
                  const isCurrentMonth = selectedYear === todayY && idx === todayM;
                  return (
                    <th
                      key={m.short}
                      className={`px-1.5 py-2.5 text-center font-bold text-[11px] uppercase tracking-wider border-b border-gray-200 ${
                        isCurrentMonth
                          ? 'bg-cyan-50/90 text-[#0D93AA] font-extrabold border-b-2 border-b-[#0D93AA]'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span>{m.short}</span>
                        {isCurrentMonth && (
                          <span className="text-[9px] font-semibold text-[#0D93AA] lowercase -mt-0.5 opacity-80">
                            current
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Matrix Data Rows: Day 1 through Day 31 */}
            <tbody className="divide-y divide-gray-100 bg-white">
              {matrixData.map((row, rowIdx) => {
                const dayNum = rowIdx + 1;
                const isEvenRow = rowIdx % 2 === 0;

                return (
                  <tr
                    key={`day-${dayNum}`}
                    className={`transition-colors ${isEvenRow ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    {/* Frozen Left Column: Day Label only (e.g. Day 1, Day 2, ..., Day 31) */}
                    <td className="sticky left-0 z-20 bg-[#F8FAFC] text-left px-3 py-1.5 font-bold text-gray-700 text-[11px] border-r border-gray-200 whitespace-nowrap shadow-[1px_0_0_0_#E2E8F0]">
                      Day {dayNum}
                    </td>

                    {/* 12 Month Cells */}
                    {row.map((cell) => {
                      const isCurrentMonth = selectedYear === todayY && cell.monthIndex === todayM;

                      // Invalid Date (e.g. Feb 30, Apr 31)
                      if (!cell.isValid) {
                        return (
                          <td
                            key={cell.dateStr}
                            className={`p-0.5 text-center select-none ${
                              isCurrentMonth ? 'bg-cyan-50/30' : 'bg-gray-50/60'
                            }`}
                          >
                            <div className="w-full h-7 flex items-center justify-center text-gray-300 font-mono text-xs select-none">
                              —
                            </div>
                          </td>
                        );
                      }

                      // Valid Date with 0 transactions
                      if (cell.count === 0) {
                        return (
                          <td
                            key={cell.dateStr}
                            className={`p-0.5 text-center ${
                              isCurrentMonth ? 'bg-cyan-50/20' : ''
                            }`}
                          >
                            <div className="w-full h-7 flex items-center justify-center text-gray-400 font-mono text-xs">
                              0
                            </div>
                          </td>
                        );
                      }

                      // Valid Date with Populated Transactions (count > 0)
                      return (
                        <td
                          key={cell.dateStr}
                          onMouseEnter={(e) => handleCellMouseEnter(e, cell)}
                          onMouseLeave={handleCellMouseLeave}
                          className={`p-0.5 text-center ${
                            isCurrentMonth ? 'bg-cyan-50/30' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCellClick(cell)}
                            className={`w-full h-7 px-1 rounded font-mono font-bold text-xs transition-colors duration-150 cursor-pointer flex items-center justify-center border ${
                              cell.isToday
                                ? 'bg-[#0D93AA] text-white border-[#0D93AA]'
                                : cell.count >= 20
                                ? 'bg-cyan-100 text-[#0B7285] hover:bg-[#0D93AA] hover:text-white border-cyan-200'
                                : cell.count >= 10
                                ? 'bg-cyan-50 text-[#0D93AA] hover:bg-[#0D93AA] hover:text-white border-cyan-100'
                                : 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-600 hover:text-white border-emerald-100'
                            }`}
                          >
                            <span>{cell.count}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* Sticky Footer: Monthly Total Row & Year Total */}
            <tfoot className="sticky bottom-0 z-30 bg-[#F1F5F9] border-t-2 border-gray-300 shadow-[0_-1px_0_0_#CBD5E1]">
              <tr>
                {/* Frozen Left Summary Label */}
                <td className="sticky left-0 z-40 bg-[#E2E8F0] text-left px-3 py-2 font-bold text-gray-900 text-[11px] uppercase tracking-wider border-r border-gray-300 shadow-[1px_0_0_0_#CBD5E1] whitespace-nowrap">
                  TOTAL
                </td>

                {/* 12 Month Totals */}
                {monthlyTotals.map((mTotal, idx) => {
                  const isCurrentMonth = selectedYear === todayY && idx === todayM;
                  return (
                    <td
                      key={`total-${idx}`}
                      className={`px-1.5 py-2 text-center font-mono font-bold text-xs ${
                        isCurrentMonth
                          ? 'bg-cyan-100/90 text-[#0D93AA] border-t-2 border-t-[#0D93AA]'
                          : 'text-gray-900'
                      }`}
                    >
                      {mTotal.count.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Floating Hover Tooltip Portal: completely isolated from table DOM flow */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: tooltip.placement === 'bottom' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
              pointerEvents: 'none',
              zIndex: 99999,
              opacity: tooltip.visible ? 1 : 0,
              visibility: tooltip.visible ? 'visible' : 'hidden',
              transition: 'opacity 120ms ease-out, visibility 120ms ease-out',
            }}
            className="bg-gray-900/95 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-700 text-xs w-[220px] box-border"
          >
            {tooltip.cell && (
              <>
                <div className="font-bold text-gray-100 pb-1 border-b border-gray-700/80 mb-1.5 flex items-center justify-between gap-2">
                  <span>{formatCellDate(tooltip.cell.dateStr)}</span>
                  <span className="text-[10px] font-mono text-[#0D93AA] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/50">
                    {tooltip.cell.dateStr}
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between gap-3 text-gray-300">
                    <span>Mobile Money Txns:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {tooltip.cell.count} completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-gray-300">
                    <span>Total Value:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {formatZMW(tooltip.cell.totalValue)}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 pt-1 border-t border-gray-700/60 text-[10px] text-gray-400 flex items-center gap-1">
                  <ExternalLink size={10} className="text-[#0D93AA]" />
                  <span>Click to view transactions list</span>
                </div>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
