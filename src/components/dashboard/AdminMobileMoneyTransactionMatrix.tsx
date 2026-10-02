import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  ExternalLink,
  X,
  Search,
  Building2,
  UserCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
  Filter,
} from 'lucide-react';
import { adminService } from '../../services/mockAdminService';
import { MobileMoneyTransaction } from '../../types/mobileMoney';
import {
  formatZMW,
  formatDepositTransactionId,
  formatWithdrawalId,
  formatPurchaseTransactionId,
  formatBusinessId,
  formatAgentId,
  formatCustomerId,
  formatWithdrawalDate,
} from '../../utils/formatters';
import { getLusakaDateString } from '../../utils/dateUtils';

interface AdminMobileMoneyTransactionMatrixProps {
  initialYear?: number;
  className?: string;
}

interface CellData {
  dateStr: string;
  day: number;
  monthIndex: number;
  isValid: boolean;
  count: number;
  totalVolume: number;
  businessesRepresented: number;
  transactions: MobileMoneyTransaction[];
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
 * Accurately handles leap years for February 29th.
 */
function isValidDayForMonth(year: number, monthIndex: number, day: number): boolean {
  if (day < 1 || day > 31) return false;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Helper to get the approved Transaction ID according to type
 */
function getApprovedTransactionId(txn: MobileMoneyTransaction): string {
  const ref = txn.reference || txn.id;
  if (txn.transactionType === 'Deposit') {
    return formatDepositTransactionId(ref);
  }
  if (txn.transactionType === 'Withdrawal') {
    return formatWithdrawalId(ref);
  }
  return formatPurchaseTransactionId(ref);
}

export const AdminMobileMoneyTransactionMatrix: React.FC<AdminMobileMoneyTransactionMatrixProps> = ({
  initialYear = 2026,
  className = '',
}) => {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Available years: starting strictly from 2026 and dynamic
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const maxYear = Math.max(2026, currentYear);

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
    return initialYear && initialYear >= 2026 ? initialYear : 2026;
  });

  // Cell Inspection Modal State
  const [inspectingCell, setInspectingCell] = useState<CellData | null>(null);
  const [inspectionSearch, setInspectionSearch] = useState<string>('');
  const [inspectionTypeFilter, setInspectionTypeFilter] = useState<string>('ALL');

  // Load transactions across ALL businesses for Admin scope
  const loadTransactions = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // Admin queries without businessScope to aggregate across all businesses
      const res = await adminService.getMobileMoneyTransactions(
        {},
        { field: 'postedAt', direction: 'desc' }
      );
      setAllTransactions(res.items);
    } catch (err) {
      console.error('Failed to load mobile money transactions for admin matrix:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    const unsubscribe = adminService.subscribe(loadTransactions);
    return () => {
      unsubscribe();
    };
  }, [loadTransactions]);

  // Today Lusaka date for current month highlighting
  const todayLusaka = useMemo(() => getLusakaDateString(), []);
  const [todayY, todayM, todayD] = useMemo(() => {
    const parts = todayLusaka.split('-').map(Number);
    return [parts[0] || 2026, (parts[1] || 1) - 1, parts[2] || 1];
  }, [todayLusaka]);

  // Active matrix calculation across ALL Businesses for selectedYear
  const {
    matrixData,
    monthlyTotals,
    yearTotalCount,
    yearTotalVolume,
    distinctBusinessesRepresented,
  } = useMemo(() => {
    // 1. Transaction Eligibility:
    // - Count only successfully completed Mobile Money Transactions (Deposit, Withdrawal, Purchase)
    // - With valid completion timestamp in selected year
    // - Connected to valid Business
    // - Exclude pending, processing, failed, cancelled, reversed, voided, duplicate records
    const relevantTxns = allTransactions.filter((t) => {
      if (t.status !== 'Completed') return false;
      if (!['Deposit', 'Withdrawal', 'Purchase'].includes(t.transactionType)) return false;
      const tDateStr = getLusakaDateString(t.postedAt) || t.postedAt.slice(0, 10);
      const tYear = parseInt(tDateStr.split('-')[0], 10);
      return tYear === selectedYear;
    });

    // Track distinct businesses for the entire year
    const yearBusinessIds = new Set<string>();

    // 2. Group transactions by date key: YYYY-MM-DD
    const txnsByDate = new Map<
      string,
      { count: number; totalVolume: number; businesses: Set<string>; list: MobileMoneyTransaction[] }
    >();

    relevantTxns.forEach((t) => {
      const dateKey = getLusakaDateString(t.postedAt) || t.postedAt.slice(0, 10);
      const bizIdKey = (t.businessId || t.businessName || 'BIZ-UNKNOWN').trim().toLowerCase();
      yearBusinessIds.add(bizIdKey);

      const existing = txnsByDate.get(dateKey) || {
        count: 0,
        totalVolume: 0,
        businesses: new Set<string>(),
        list: [],
      };
      existing.count += 1;
      existing.totalVolume += t.amount || 0;
      existing.businesses.add(bizIdKey);
      existing.list.push(t);
      txnsByDate.set(dateKey, existing);
    });

    // 3. Construct 31 x 12 grid (Day 1..31 across Jan..Dec)
    const grid: CellData[][] = [];
    const mTotals = Array(12)
      .fill(0)
      .map(() => ({ count: 0, totalVolume: 0 }));
    let yTotalCount = 0;
    let yTotalVolume = 0;

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
            totalVolume: 0,
            businessesRepresented: 0,
            transactions: [],
            isToday: false,
          });
        } else {
          const stats = txnsByDate.get(dateStr) || {
            count: 0,
            totalVolume: 0,
            businesses: new Set<string>(),
            list: [],
          };
          row.push({
            dateStr,
            day,
            monthIndex,
            isValid: true,
            count: stats.count,
            totalVolume: stats.totalVolume,
            businessesRepresented: stats.businesses.size,
            transactions: stats.list,
            isToday,
          });

          mTotals[monthIndex].count += stats.count;
          mTotals[monthIndex].totalVolume += stats.totalVolume;
          yTotalCount += stats.count;
          yTotalVolume += stats.totalVolume;
        }
      }
      grid.push(row);
    }

    return {
      matrixData: grid,
      monthlyTotals: mTotals,
      yearTotalCount: yTotalCount,
      yearTotalVolume: yTotalVolume,
      distinctBusinessesRepresented: yearBusinessIds.size,
    };
  }, [allTransactions, selectedYear, todayY, todayM, todayD]);

  // Decoupled Tooltip state rendered via portal outside table DOM to prevent table layout jitter & re-renders
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
    const tooltipWidth = 240;
    const tooltipHeight = 100;

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

  // Cell click opens full-width inspection view
  const handleCellClick = (cell: CellData) => {
    if (!cell.isValid || cell.count === 0) return;
    setInspectionSearch('');
    setInspectionTypeFilter('ALL');
    setInspectingCell(cell);
  };

  // Formatted date helper for tooltip and modal header
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

  // Filtered transactions for the Inspection View
  const filteredInspectionTransactions = useMemo(() => {
    if (!inspectingCell) return [];
    let list = inspectingCell.transactions;

    if (inspectionTypeFilter !== 'ALL') {
      list = list.filter((t) => t.transactionType === inspectionTypeFilter);
    }

    if (inspectionSearch.trim()) {
      const q = inspectionSearch.toLowerCase().trim();
      list = list.filter(
        (t) =>
          (t.reference && t.reference.toLowerCase().includes(q)) ||
          (t.businessName && t.businessName.toLowerCase().includes(q)) ||
          (t.businessId && t.businessId.toLowerCase().includes(q)) ||
          (t.agentName && t.agentName.toLowerCase().includes(q)) ||
          (t.agentId && t.agentId.toLowerCase().includes(q)) ||
          (t.customerName && t.customerName.toLowerCase().includes(q)) ||
          (t.customerId && t.customerId.toLowerCase().includes(q)) ||
          (t.vendor && t.vendor.toLowerCase().includes(q))
      );
    }

    return list;
  }, [inspectingCell, inspectionSearch, inspectionTypeFilter]);

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 w-full max-w-none box-border select-none ${className}`}
    >
      {/* 1. Section Heading and Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <ArrowLeftRight size={18} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Mobile Money Transactions
          </h3>
        </div>

        {/* Right Controls: Compact Year Selector */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {isRefreshing && (
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#0D93AA] animate-ping inline-block" />
              Updating...
            </span>
          )}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <label
              htmlFor="admin-mm-matrix-year-select"
              className="text-xs font-bold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap"
            >
              YEAR:
            </label>
            <select
              id="admin-mm-matrix-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
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

      {/* 2. Compact Horizontal Summary Strip (4 items) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
        {/* Total Transactions */}
        <div className="px-2">
          <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
            TOTAL {selectedYear} TRANSACTIONS
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
            {yearTotalCount.toLocaleString()}
          </div>
        </div>

        {/* Completed Volume */}
        <div className="px-2 border-l border-slate-200">
          <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
            COMPLETED VOLUME (ZMW)
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-[#0D93AA] mt-0.5">
            {formatZMW(yearTotalVolume)}
          </div>
        </div>

        {/* Businesses Represented */}
        <div className="px-2 border-l border-slate-200">
          <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
            BUSINESSES REPRESENTED
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-800 mt-0.5 flex items-center gap-1.5">
            <Building2 size={16} className="text-[#0D93AA]" />
            <span>{distinctBusinessesRepresented} Businesses</span>
          </div>
        </div>

        {/* Channels Included */}
        <div className="px-2 border-l border-slate-200">
          <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
            CHANNELS INCLUDED
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1 truncate">
            MTN · Airtel · Zamtel · Banks
          </div>
        </div>
      </div>

      {/* 3. Year-based Cross-Business Transaction Matrix Table */}
      <div className="w-full relative rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        {/* Scrollable Container with sticky headers and sticky Day column */}
        <div className="overflow-x-auto overflow-y-auto max-h-[460px] relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <table className="w-full border-collapse text-xs table-fixed min-w-[780px]">
            {/* Locked Column Width Allocations */}
            <colgroup>
              <col style={{ width: '84px' }} />
              {MONTH_NAMES.map((m) => (
                <col key={m.short} style={{ width: '7.63%' }} />
              ))}
            </colgroup>

            {/* Sticky Table Header: Month Columns */}
            <thead className="sticky top-0 z-30 bg-slate-50 shadow-[0_1px_0_0_#E2E8F0]">
              <tr>
                {/* Frozen Top-Left Corner: "Day" heading */}
                <th className="sticky left-0 z-40 bg-slate-100 text-left px-3 py-2.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider border-r border-b border-slate-200 shadow-[1px_0_0_0_#E2E8F0]">
                  Day
                </th>
                {MONTH_NAMES.map((m, idx) => {
                  const isCurrentMonth = selectedYear === todayY && idx === todayM;
                  return (
                    <th
                      key={m.short}
                      className={`px-1.5 py-2.5 text-center font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 ${
                        isCurrentMonth
                          ? 'bg-[#0D93AA]/10 text-[#0D93AA] font-extrabold border-b-2 border-b-[#0D93AA]'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span>{m.short}</span>
                        {isCurrentMonth && (
                          <span className="text-[9px] font-semibold text-[#0D93AA] lowercase -mt-0.5 opacity-90">
                            Current
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Matrix Data Rows: Day 1 through Day 31 */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {matrixData.map((row, rowIdx) => {
                const dayNum = rowIdx + 1;
                const isEvenRow = rowIdx % 2 === 0;

                return (
                  <tr
                    key={`day-${dayNum}`}
                    className={`transition-colors ${isEvenRow ? 'bg-white' : 'bg-slate-50/40'}`}
                  >
                    {/* Frozen Left Column: Day Label only (e.g. Day 1, Day 2, ..., Day 31) */}
                    <td className="sticky left-0 z-20 bg-slate-50 text-left px-3 py-1.5 font-bold text-slate-700 text-[11px] border-r border-slate-200 whitespace-nowrap shadow-[1px_0_0_0_#E2E8F0]">
                      Day {dayNum}
                    </td>

                    {/* 12 Month Cells */}
                    {row.map((cell) => {
                      const isCurrentMonth = selectedYear === todayY && cell.monthIndex === todayM;

                      // Invalid Date (e.g. Feb 30, Apr 31, etc.)
                      if (!cell.isValid) {
                        return (
                          <td
                            key={cell.dateStr}
                            className={`p-0.5 text-center select-none ${
                              isCurrentMonth ? 'bg-[#0D93AA]/5' : 'bg-slate-50/70'
                            }`}
                          >
                            <div className="w-full h-7 flex items-center justify-center text-slate-300 font-mono text-xs select-none">
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
                              isCurrentMonth ? 'bg-[#0D93AA]/5' : ''
                            }`}
                          >
                            <div className="w-full h-7 flex items-center justify-center text-slate-400 font-mono text-xs">
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
                            isCurrentMonth ? 'bg-[#0D93AA]/10' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCellClick(cell)}
                            title={`Inspect ${cell.count} cross-business transactions`}
                            className={`w-full h-7 px-1 rounded-md font-mono font-bold text-xs transition-all duration-150 cursor-pointer flex items-center justify-center border ${
                              cell.isToday
                                ? 'bg-[#0D93AA] text-white border-[#0D93AA] shadow-xs'
                                : cell.count >= 25
                                ? 'bg-teal-100 text-teal-900 hover:bg-[#0D93AA] hover:text-white border-teal-200'
                                : cell.count >= 10
                                ? 'bg-cyan-50 text-[#0B7285] hover:bg-[#0D93AA] hover:text-white border-cyan-200'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border-emerald-200'
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

            {/* Sticky Footer: Total Row */}
            <tfoot className="sticky bottom-0 z-30 bg-slate-100 border-t-2 border-slate-300 shadow-[0_-1px_0_0_#CBD5E1]">
              <tr>
                {/* Frozen Left Summary Label */}
                <td className="sticky left-0 z-40 bg-slate-200 text-left px-3 py-2 font-bold text-slate-900 text-[11px] uppercase tracking-wider border-r border-slate-300 shadow-[1px_0_0_0_#CBD5E1] whitespace-nowrap">
                  Total
                </td>

                {/* 12 Month Totals */}
                {monthlyTotals.map((mTotal, idx) => {
                  const isCurrentMonth = selectedYear === todayY && idx === todayM;
                  return (
                    <td
                      key={`total-${idx}`}
                      className={`px-1.5 py-2 text-center font-mono font-bold text-xs ${
                        isCurrentMonth
                          ? 'bg-[#0D93AA]/15 text-[#0D93AA] border-t-2 border-t-[#0D93AA]'
                          : 'text-slate-900'
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
              transform:
                tooltip.placement === 'bottom'
                  ? 'translate(-50%, 0)'
                  : 'translate(-50%, -100%)',
              pointerEvents: 'none',
              zIndex: 99999,
              opacity: tooltip.visible ? 1 : 0,
              visibility: tooltip.visible ? 'visible' : 'hidden',
              transition: 'opacity 120ms ease-out, visibility 120ms ease-out',
            }}
            className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs w-[240px] box-border"
          >
            {tooltip.cell && (
              <>
                <div className="font-bold text-slate-100 pb-1.5 border-b border-slate-700/80 mb-2 flex items-center justify-between gap-2">
                  <span>{formatCellDate(tooltip.cell.dateStr)}</span>
                  <span className="text-[10px] font-mono text-[#0D93AA] bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-800/60">
                    {tooltip.cell.dateStr}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-3 text-slate-300">
                    <span>Completed Txns:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {tooltip.cell.count} txns
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-300">
                    <span>Completed Volume:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {formatZMW(tooltip.cell.totalVolume)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-300">
                    <span>Businesses Represented:</span>
                    <span className="font-semibold text-amber-300">
                      {tooltip.cell.businessesRepresented} Businesses
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-700/60 text-[10px] text-slate-400 flex items-center gap-1">
                  <ExternalLink size={10} className="text-[#0D93AA]" />
                  <span>Click cell to inspect all transactions</span>
                </div>
              </>
            )}
          </div>,
          document.body
        )}

      {/* 4. Full-Width Cross-Business Cell Inspection Modal */}
      {inspectingCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-[#0D93AA]/10 text-[#0D93AA]">
                    <Calendar size={16} />
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Cross-Business Mobile Money Transactions —{' '}
                    {formatCellDate(inspectingCell.dateStr)}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px]">
                    {inspectingCell.dateStr}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="font-semibold">
                    Total Completed: <strong className="text-slate-900">{inspectingCell.count}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-semibold">
                    Volume: <strong className="text-[#0D93AA] font-mono">{formatZMW(inspectingCell.totalVolume)}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-semibold">
                    Businesses Represented:{' '}
                    <strong className="text-slate-900">{inspectingCell.businessesRepresented}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/super-admin/mobile-money-transactions?date=${inspectingCell.dateStr}`)
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Open in full Mobile Money Registry"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Open Full Registry</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingCell(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  aria-label="Close Inspection Modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Filters */}
            <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search business, agent, customer, ID..."
                  value={inspectionSearch}
                  onChange={(e) => setInspectionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                  <Filter size={12} />
                  <span>Type:</span>
                </div>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px]">
                  {['ALL', 'Deposit', 'Withdrawal', 'Purchase'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setInspectionTypeFilter(t)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        inspectionTypeFilter === t
                          ? 'bg-white text-[#0D93AA] shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-auto">
              {filteredInspectionTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-600">No matching transactions found</p>
                  <p className="text-[11px]">Try adjusting your search query or type filter.</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold text-[10.5px] uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">Transaction ID</th>
                      <th className="px-3 py-2.5">Date & Time</th>
                      <th className="px-3 py-2.5">Business</th>
                      <th className="px-3 py-2.5">Agent</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Vendor</th>
                      <th className="px-3 py-2.5">Customer</th>
                      <th className="px-3.5 py-2.5 text-right">Amount</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredInspectionTransactions.map((t) => {
                      const approvedTxnId = getApprovedTransactionId(t);
                      const formattedBizId = formatBusinessId(t.businessId);
                      const formattedAgtId = formatAgentId(t.agentId);
                      const formattedCustId = formatCustomerId(t.customerId);

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Transaction ID */}
                          <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {approvedTxnId}
                            </span>
                          </td>

                          {/* Date & Time */}
                          <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                            {formatWithdrawalDate(t.postedAt)}
                          </td>

                          {/* Business */}
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-slate-900 truncate max-w-[160px]">
                              {t.businessName}
                            </div>
                            <div className="font-mono text-[10.5px] text-slate-500">
                              {formattedBizId}
                            </div>
                          </td>

                          {/* Agent */}
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-slate-800 truncate max-w-[140px]">
                              {t.agentName}
                            </div>
                            <div className="font-mono text-[10.5px] text-slate-500">
                              {formattedAgtId}
                            </div>
                          </td>

                          {/* Transaction Type */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                                t.transactionType === 'Deposit'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : t.transactionType === 'Withdrawal'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {t.transactionType}
                            </span>
                          </td>

                          {/* Vendor */}
                          <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-700">
                            {t.vendor}
                          </td>

                          {/* Customer */}
                          <td className="px-3 py-2.5">
                            <div className="font-medium text-slate-900 truncate max-w-[140px]">
                              {t.customerName || 'Walk-In Customer'}
                            </div>
                            {formattedCustId && (
                              <div className="font-mono text-[10px] text-slate-400">
                                {formattedCustId}
                              </div>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            {formatZMW(t.amount)}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                              <CheckCircle2 size={11} />
                              <span>{t.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-slate-500 text-[11px]">
                Showing {filteredInspectionTransactions.length} of {inspectingCell.count} completed records
              </span>
              <button
                type="button"
                onClick={() => setInspectingCell(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
