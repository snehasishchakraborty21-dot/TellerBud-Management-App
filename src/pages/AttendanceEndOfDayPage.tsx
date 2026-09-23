import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBusinessOwnerDate } from '../context/BusinessOwnerDateContext';
import { adminService } from '../services/mockAdminService';
import {
  AttendanceRecord,
  AttendanceMetrics,
  AttendanceFilters,
  EndOfDayRecord,
  EndOfDayMetrics,
  EndOfDayFilters,
} from '../types/attendance';
import { TODAY_DATE } from '../data/mockAttendanceData';
import { toDisplayDate } from '../utils/dateUtils';
import { AttendanceMetricCards } from '../components/attendance/AttendanceMetricCards';
import { EndOfDayMetricCards } from '../components/attendance/EndOfDayMetricCards';
import { AttendanceFilterBar } from '../components/attendance/AttendanceFilterBar';
import { EndOfDayFilterBar } from '../components/attendance/EndOfDayFilterBar';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import { EndOfDayTable } from '../components/attendance/EndOfDayTable';
import { AttendanceSummaryModal } from '../components/attendance/AttendanceSummaryModal';
import { EndOfDaySummaryModal } from '../components/attendance/EndOfDaySummaryModal';
import { exportAttendanceToCsv, exportEndOfDayToCsv } from '../utils/attendanceExport';
import { ChevronLeft, ChevronRight, CalendarCheck, FileCheck2 } from 'lucide-react';

export const AttendanceEndOfDayPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedDate } = useBusinessOwnerDate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentHeaderDate = toDisplayDate(selectedDate) || TODAY_DATE;

  // Business Owner Scoping Rule - Never cross business data
  const businessIdScope = currentUser?.businessId || 'BIZ-LUS-001';

  // Primary Tab state: 'Attendance' or 'End-of-Day'
  const tabParam = searchParams.get('tab')?.toLowerCase();
  const initialTab =
    tabParam === 'eod' || tabParam === 'end-of-day' ? 'End-of-Day' : 'Attendance';
  const [activeTab, setActiveTab] = useState<'Attendance' | 'End-of-Day'>(initialTab);

  // Dedicated scroll container refs to ensure independent scrolling
  const attendanceScrollRef = useRef<HTMLDivElement>(null);
  const eodScrollRef = useRef<HTMLDivElement>(null);

  // Sync tab with URL searchParams if URL changes
  useEffect(() => {
    if (tabParam === 'eod' || tabParam === 'end-of-day') {
      setActiveTab('End-of-Day');
    } else if (tabParam === 'attendance') {
      setActiveTab('Attendance');
    }
  }, [tabParam]);

  // Tab switcher
  const handleTabSelect = (tab: 'Attendance' | 'End-of-Day') => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'End-of-Day') {
      newParams.set('tab', 'eod');
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams);
  };

  // Shared Date Range state (defaults to current header date)
  const [dateRange, setDateRange] = useState<{ dateFrom?: string; dateTo?: string }>({
    dateFrom: currentHeaderDate,
    dateTo: currentHeaderDate,
  });

  // Track header date changes to sync filter date fields
  const lastHeaderDateRef = useRef<string>(selectedDate);

  // =========================================================================
  // 1. Attendance Tab State
  // =========================================================================
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceMetrics, setAttendanceMetrics] = useState<AttendanceMetrics>({
    totalAgents: 8,
    checkedIn: 6,
    checkedOut: 0,
    notCheckedIn: 1,
    noAttendanceRecord: 1,
  });
  // Default both fields to current business date
  const [attendanceFilters, setAttendanceFilters] = useState<AttendanceFilters>({
    dateFrom: currentHeaderDate,
    dateTo: currentHeaderDate,
    date: currentHeaderDate,
    status: 'ALL',
    assignment: 'ALL',
  });
  const [isAttendanceLoading, setIsAttendanceLoading] = useState<boolean>(true);
  const [isAttendanceRefreshing, setIsAttendanceRefreshing] = useState<boolean>(false);
  const [attendancePage, setAttendancePage] = useState<number>(1);
  const [attendancePageSize, setAttendancePageSize] = useState<number>(10);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [isAttendanceSummaryOpen, setIsAttendanceSummaryOpen] = useState<boolean>(false);

  // =========================================================================
  // 2. End-of-Day Tab State
  // =========================================================================
  const [eodRecords, setEodRecords] = useState<EndOfDayRecord[]>([]);
  const [eodMetrics, setEodMetrics] = useState<EndOfDayMetrics>({
    totalAgents: 8,
    pendingSubmission: 4,
    pendingReview: 2,
    reconciled: 1,
    exceptions: 1,
  });
  // Default both fields to current business date
  const [eodFilters, setEodFilters] = useState<EndOfDayFilters>({
    dateFrom: currentHeaderDate,
    dateTo: currentHeaderDate,
    businessDate: currentHeaderDate,
    status: 'ALL',
    availability: 'ALL',
  });
  const [isEodLoading, setIsEodLoading] = useState<boolean>(true);
  const [isEodRefreshing, setIsEodRefreshing] = useState<boolean>(false);
  const [eodPage, setEodPage] = useState<number>(1);
  const [eodPageSize, setEodPageSize] = useState<number>(10);
  const [selectedEod, setSelectedEod] = useState<EndOfDayRecord | null>(null);
  const [isEodSummaryOpen, setIsEodSummaryOpen] = useState<boolean>(false);

  // Sync date range whenever header date changes
  useEffect(() => {
    if (selectedDate !== lastHeaderDateRef.current) {
      lastHeaderDateRef.current = selectedDate;
      const newDisplayDate = toDisplayDate(selectedDate) || TODAY_DATE;
      setDateRange({ dateFrom: newDisplayDate, dateTo: newDisplayDate });
      setAttendanceFilters((prev) => ({
        ...prev,
        dateFrom: newDisplayDate,
        dateTo: newDisplayDate,
        date: newDisplayDate,
      }));
      setEodFilters((prev) => ({
        ...prev,
        dateFrom: newDisplayDate,
        dateTo: newDisplayDate,
        businessDate: newDisplayDate,
      }));
      setAttendancePage(1);
      setEodPage(1);
    }
  }, [selectedDate]);

  // Load Attendance Data
  const loadAttendance = async () => {
    try {
      const res = await adminService.getAttendanceRecords(attendanceFilters, businessIdScope);
      setAttendanceRecords(res.items);
      setAttendanceMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setIsAttendanceLoading(false);
      setIsAttendanceRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [businessIdScope, attendanceFilters]);

  const handleRefreshAttendance = () => {
    setIsAttendanceRefreshing(true);
    loadAttendance();
  };

  const handleAttendanceFilterChange = (newFilters: AttendanceFilters) => {
    setAttendanceFilters(newFilters);
    if (newFilters.dateFrom !== dateRange.dateFrom || newFilters.dateTo !== dateRange.dateTo) {
      setDateRange({ dateFrom: newFilters.dateFrom, dateTo: newFilters.dateTo });
      setEodFilters((prev) => ({
        ...prev,
        dateFrom: newFilters.dateFrom,
        dateTo: newFilters.dateTo,
        businessDate: newFilters.dateFrom,
      }));
    }
    setAttendancePage(1);
  };

  const handleClearAttendanceDateRange = () => {
    setDateRange({ dateFrom: undefined, dateTo: undefined });
    setAttendanceFilters((prev) => ({
      ...prev,
      dateFrom: undefined,
      dateTo: undefined,
      date: undefined,
    }));
    setEodFilters((prev) => ({
      ...prev,
      dateFrom: undefined,
      dateTo: undefined,
      businessDate: undefined,
    }));
    setAttendancePage(1);
  };

  const handleExportAttendance = () => {
    if (attendanceRecords.length === 0) return;
    exportAttendanceToCsv(
      attendanceRecords,
      attendanceFilters.dateFrom,
      attendanceFilters.dateTo
    );
  };

  // Load End-of-Day Data
  const loadEndOfDay = async () => {
    try {
      const res = await adminService.getEndOfDayRecords(eodFilters, businessIdScope);
      setEodRecords(res.items);
      setEodMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load End-of-Day records:', err);
    } finally {
      setIsEodLoading(false);
      setIsEodRefreshing(false);
    }
  };

  useEffect(() => {
    loadEndOfDay();
  }, [businessIdScope, eodFilters]);

  const handleRefreshEndOfDay = () => {
    setIsEodRefreshing(true);
    loadEndOfDay();
  };

  const handleEodFilterChange = (newFilters: EndOfDayFilters) => {
    setEodFilters(newFilters);
    if (newFilters.dateFrom !== dateRange.dateFrom || newFilters.dateTo !== dateRange.dateTo) {
      setDateRange({ dateFrom: newFilters.dateFrom, dateTo: newFilters.dateTo });
      setAttendanceFilters((prev) => ({
        ...prev,
        dateFrom: newFilters.dateFrom,
        dateTo: newFilters.dateTo,
        date: newFilters.dateFrom,
      }));
    }
    setEodPage(1);
  };

  const handleClearEodDateRange = () => {
    setDateRange({ dateFrom: undefined, dateTo: undefined });
    setAttendanceFilters((prev) => ({
      ...prev,
      dateFrom: undefined,
      dateTo: undefined,
      date: undefined,
    }));
    setEodFilters((prev) => ({
      ...prev,
      dateFrom: undefined,
      dateTo: undefined,
      businessDate: undefined,
    }));
    setEodPage(1);
  };

  const handleExportEndOfDay = () => {
    if (eodRecords.length === 0) return;
    exportEndOfDayToCsv(
      eodRecords,
      eodFilters.dateFrom,
      eodFilters.dateTo
    );
  };

  // Pagination slicing
  const paginatedAttendance = attendanceRecords.slice(
    (attendancePage - 1) * attendancePageSize,
    attendancePage * attendancePageSize
  );
  const totalAttendancePages = Math.ceil(attendanceRecords.length / attendancePageSize) || 1;

  const paginatedEod = eodRecords.slice(
    (eodPage - 1) * eodPageSize,
    eodPage * eodPageSize
  );
  const totalEodPages = Math.ceil(eodRecords.length / eodPageSize) || 1;

  return (
    <div className="attendance-page h-full flex flex-col min-h-0 p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 overflow-hidden">
      {/* 1. FROZEN AREA: Tabs, KPI Cards, Filter Bars */}
      <div className="attendance-fixed-content shrink-0 bg-[#FAFAFA] z-10 flex flex-col gap-3 sm:gap-4">
        {/* Tab Selector - Left Aligned above KPI Cards */}
        <div className="flex items-center justify-start">
          <div className="inline-flex items-center p-1 bg-gray-200/70 rounded-xl border border-gray-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleTabSelect('Attendance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Attendance'
                  ? 'bg-white text-[#0D93AA] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Attendance</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'Attendance'
                    ? 'bg-cyan-50 text-[#0D93AA]'
                    : 'bg-gray-300/70 text-gray-700'
                }`}
              >
                {attendanceMetrics.totalAgents}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSelect('End-of-Day')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'End-of-Day'
                  ? 'bg-white text-[#0D93AA] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
              <span>End-of-Day</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'End-of-Day'
                    ? 'bg-cyan-50 text-[#0D93AA]'
                    : 'bg-gray-300/70 text-gray-700'
                }`}
              >
                {eodMetrics.pendingReview > 0 ? eodMetrics.pendingReview : eodMetrics.totalAgents}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Attendance KPI Cards & Filter Bar */}
        {activeTab === 'Attendance' && (
          <>
            <AttendanceMetricCards
              metrics={attendanceMetrics}
            />

            <AttendanceFilterBar
              filters={attendanceFilters}
              onFilterChange={handleAttendanceFilterChange}
              onExport={handleExportAttendance}
              onClearDateRange={handleClearAttendanceDateRange}
              onRefresh={handleRefreshAttendance}
              isRefreshing={isAttendanceRefreshing}
              isExportDisabled={attendanceRecords.length === 0}
            />
          </>
        )}

        {/* Tab 2: End-of-Day KPI Cards & Filter Bar */}
        {activeTab === 'End-of-Day' && (
          <>
            <EndOfDayMetricCards metrics={eodMetrics} />

            <EndOfDayFilterBar
              filters={eodFilters}
              onFilterChange={handleEodFilterChange}
              onExport={handleExportEndOfDay}
              onClearDateRange={handleClearEodDateRange}
              onRefresh={handleRefreshEndOfDay}
              isRefreshing={isEodRefreshing}
              isExportDisabled={eodRecords.length === 0}
            />
          </>
        )}
      </div>

      {/* 2. SCROLLABLE LISTING CONTAINER with Sticky Table Header & Fixed Pagination */}
      <div className="attendance-table flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {activeTab === 'Attendance' ? (
          <>
            <AttendanceTable
              records={paginatedAttendance}
              isLoading={isAttendanceLoading}
              onView={(record) => {
                setSelectedAttendance(record);
                setIsAttendanceSummaryOpen(true);
              }}
              containerRef={attendanceScrollRef}
            />

            {/* Fixed Pagination at bottom of listing container */}
            {attendanceRecords.length > 0 && (
              <div className="shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>
                    Showing{' '}
                    <strong className="text-gray-800">
                      {(attendancePage - 1) * attendancePageSize + 1}
                    </strong>{' '}
                    to{' '}
                    <strong className="text-gray-800">
                      {Math.min(attendancePage * attendancePageSize, attendanceRecords.length)}
                    </strong>{' '}
                    of <strong className="text-gray-800">{attendanceRecords.length}</strong> records
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Rows:</span>
                    <select
                      value={attendancePageSize}
                      onChange={(e) => {
                        setAttendancePageSize(Number(e.target.value));
                        setAttendancePage(1);
                      }}
                      aria-label="Attendance rows per page"
                      className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
                    >
                      <option value={8}>8</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAttendancePage((p) => Math.max(1, p - 1))}
                    disabled={attendancePage <= 1}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalAttendancePages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAttendancePage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          attendancePage === p
                            ? 'bg-[#0D93AA] text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAttendancePage((p) => Math.min(totalAttendancePages, p + 1))}
                    disabled={attendancePage >= totalAttendancePages}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <EndOfDayTable
              records={paginatedEod}
              isLoading={isEodLoading}
              onView={(record) => {
                setSelectedEod(record);
                setIsEodSummaryOpen(true);
              }}
              containerRef={eodScrollRef}
            />

            {/* Fixed Pagination at bottom of listing container */}
            {eodRecords.length > 0 && (
              <div className="shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>
                    Showing{' '}
                    <strong className="text-gray-800">
                      {(eodPage - 1) * eodPageSize + 1}
                    </strong>{' '}
                    to{' '}
                    <strong className="text-gray-800">
                      {Math.min(eodPage * eodPageSize, eodRecords.length)}
                    </strong>{' '}
                    of <strong className="text-gray-800">{eodRecords.length}</strong> records
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Rows:</span>
                    <select
                      value={eodPageSize}
                      onChange={(e) => {
                        setEodPageSize(Number(e.target.value));
                        setEodPage(1);
                      }}
                      aria-label="End-of-day rows per page"
                      className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
                    >
                      <option value={8}>8</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEodPage((p) => Math.max(1, p - 1))}
                    disabled={eodPage <= 1}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalEodPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEodPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          eodPage === p
                            ? 'bg-[#0D93AA] text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setEodPage((p) => Math.min(totalEodPages, p + 1))}
                    disabled={eodPage >= totalEodPages}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Modals */}
      <AttendanceSummaryModal
        record={selectedAttendance}
        isOpen={isAttendanceSummaryOpen}
        onClose={() => setIsAttendanceSummaryOpen(false)}
      />

      <EndOfDaySummaryModal
        record={selectedEod}
        isOpen={isEodSummaryOpen}
        onClose={() => setIsEodSummaryOpen(false)}
      />
    </div>
  );
};
