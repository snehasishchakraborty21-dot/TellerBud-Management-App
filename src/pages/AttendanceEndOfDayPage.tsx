import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import { AttendanceMetricCards } from '../components/attendance/AttendanceMetricCards';
import { EndOfDayMetricCards } from '../components/attendance/EndOfDayMetricCards';
import { AttendanceFilterBar } from '../components/attendance/AttendanceFilterBar';
import { EndOfDayFilterBar } from '../components/attendance/EndOfDayFilterBar';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import { EndOfDayTable } from '../components/attendance/EndOfDayTable';
import { AttendanceSummaryModal } from '../components/attendance/AttendanceSummaryModal';
import { EndOfDaySummaryModal } from '../components/attendance/EndOfDaySummaryModal';
import { ChevronLeft, ChevronRight, CalendarCheck, FileCheck2 } from 'lucide-react';

export const AttendanceEndOfDayPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Business Owner Scoping Rule
  const businessIdScope = currentUser?.businessId || 'BIZ-LUS-001';

  // Primary Tab state: 'Attendance' or 'End-of-Day'
  const tabParam = searchParams.get('tab')?.toLowerCase();
  const initialTab =
    tabParam === 'eod' || tabParam === 'end-of-day' ? 'End-of-Day' : 'Attendance';
  const [activeTab, setActiveTab] = useState<'Attendance' | 'End-of-Day'>(initialTab);

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
  const [attendanceFilters, setAttendanceFilters] = useState<AttendanceFilters>({
    search: '',
    date: TODAY_DATE,
    status: 'ALL',
    assignment: 'ALL',
  });
  const [isAttendanceLoading, setIsAttendanceLoading] = useState<boolean>(true);
  const [isAttendanceRefreshing, setIsAttendanceRefreshing] = useState<boolean>(false);
  const [attendancePage, setAttendancePage] = useState<number>(1);
  const [attendancePageSize, setAttendancePageSize] = useState<number>(10);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [isAttendanceSummaryOpen, setIsAttendanceSummaryOpen] = useState<boolean>(false);

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

  const handleClearAttendanceFilters = () => {
    setAttendanceFilters({
      search: '',
      date: TODAY_DATE,
      status: 'ALL',
      assignment: 'ALL',
    });
    setAttendancePage(1);
  };

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
  const [eodFilters, setEodFilters] = useState<EndOfDayFilters>({
    search: '',
    businessDate: TODAY_DATE,
    status: 'ALL',
    availability: 'ALL',
  });
  const [isEodLoading, setIsEodLoading] = useState<boolean>(true);
  const [isEodRefreshing, setIsEodRefreshing] = useState<boolean>(false);
  const [eodPage, setEodPage] = useState<number>(1);
  const [eodPageSize, setEodPageSize] = useState<number>(10);
  const [selectedEod, setSelectedEod] = useState<EndOfDayRecord | null>(null);
  const [isEodSummaryOpen, setIsEodSummaryOpen] = useState<boolean>(false);

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

  const handleClearEodFilters = () => {
    setEodFilters({
      search: '',
      businessDate: TODAY_DATE,
      status: 'ALL',
      availability: 'ALL',
    });
    setEodPage(1);
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
    <div className="space-y-6 pb-12">
      {/* Top-Level Primary Tabs */}
      <div className="flex items-center justify-start gap-4">
        <div className="flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-200/80 shrink-0">
          <button
            type="button"
            onClick={() => handleTabSelect('Attendance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Attendance'
                ? 'bg-white text-[#0D93AA] shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Attendance</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'Attendance'
                  ? 'bg-cyan-50 text-[#0D93AA]'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {attendanceMetrics.totalAgents}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect('End-of-Day')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'End-of-Day'
                ? 'bg-white text-[#0D93AA] shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>End-of-Day</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'End-of-Day'
                  ? 'bg-cyan-50 text-[#0D93AA]'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {eodMetrics.pendingReview > 0 ? eodMetrics.pendingReview : eodMetrics.totalAgents}
            </span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* Tab 1: ATTENDANCE                                                    */}
      {/* ===================================================================== */}
      {activeTab === 'Attendance' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* 1. Metric Cards */}
          <AttendanceMetricCards
            metrics={attendanceMetrics}
            isCurrentDate={!attendanceFilters.date || attendanceFilters.date === TODAY_DATE}
          />

          {/* 2. Filter Bar */}
          <AttendanceFilterBar
            filters={attendanceFilters}
            onFilterChange={(f) => {
              setAttendanceFilters(f);
              setAttendancePage(1);
            }}
            onClear={handleClearAttendanceFilters}
            onRefresh={handleRefreshAttendance}
            isRefreshing={isAttendanceRefreshing}
            isCurrentDate={!attendanceFilters.date || attendanceFilters.date === TODAY_DATE}
          />

          {/* 3. Table */}
          <AttendanceTable
            records={paginatedAttendance}
            isLoading={isAttendanceLoading}
            onView={(record) => {
              setSelectedAttendance(record);
              setIsAttendanceSummaryOpen(true);
            }}
          />

          {/* 4. Pagination */}
          {attendanceRecords.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 pt-2 px-1">
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
                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
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
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
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
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* Tab 2: END-OF-DAY                                                    */}
      {/* ===================================================================== */}
      {activeTab === 'End-of-Day' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* 1. Metric Cards */}
          <EndOfDayMetricCards metrics={eodMetrics} />

          {/* 2. Filter Bar */}
          <EndOfDayFilterBar
            filters={eodFilters}
            onFilterChange={(f) => {
              setEodFilters(f);
              setEodPage(1);
            }}
            onClear={handleClearEodFilters}
            onRefresh={handleRefreshEndOfDay}
            isRefreshing={isEodRefreshing}
          />

          {/* 3. Table */}
          <EndOfDayTable
            records={paginatedEod}
            isLoading={isEodLoading}
            onView={(record) => {
              setSelectedEod(record);
              setIsEodSummaryOpen(true);
            }}
          />

          {/* 4. Pagination */}
          {eodRecords.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 pt-2 px-1">
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
                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
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
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
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
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
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
