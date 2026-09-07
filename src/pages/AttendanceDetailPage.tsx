import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, Phone, Clock, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import { AttendanceRecord } from '../types/attendance';
import { AttendanceBadge, AssignmentBadge } from '../components/attendance/AttendanceTable';
import { LifecycleTimeline } from '../components/attendance/LifecycleTimeline';

export const AttendanceDetailPage: React.FC = () => {
  const { agentId, date } = useParams<{ agentId: string; date: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const businessIdScope = currentUser?.businessId || 'BIZ-LUS-001';

  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!agentId) return;
      try {
        const found = await adminService.getAttendanceRecordById(agentId, businessIdScope);
        setRecord(found);
      } catch (err) {
        console.error('Error fetching attendance record:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [agentId, businessIdScope]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-[#0D93AA]" />
        <p className="mt-3 text-xs text-gray-500 font-medium">Loading attendance details...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/business-owner/attendance-end-of-day')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Attendance & End-of-Day</span>
        </button>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <h3 className="text-sm font-bold text-gray-900">Attendance Record Not Found</h3>
          <p className="text-xs text-gray-500 mt-1">
            The requested attendance record could not be found or does not belong to your business centre.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button and Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/business-owner/attendance-end-of-day?tab=attendance')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0D93AA] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Attendance & End-of-Day</span>
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-cyan-100 text-[#0D93AA] font-bold text-lg flex items-center justify-center shrink-0 border border-cyan-200">
              {record.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">{record.agentName}</h1>
                <AttendanceBadge status={record.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 font-mono">
                <span>{record.agentId}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {record.agentPhone}
                </span>
                <span>•</span>
                <span>{record.businessCentre}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <AssignmentBadge assignment={record.assignment} />
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attendance Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Attendance Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Business Centre
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#0D93AA]" />
                  <span>{record.businessCentre}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Attendance Date
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 font-mono text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#0D93AA]" />
                  <span>{record.date}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Check In Time
                </span>
                <div className="font-semibold text-gray-900 font-mono text-xs">
                  {record.checkInTime || '—'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Check Out Time
                </span>
                <div className="font-semibold text-gray-900 font-mono text-xs">
                  {record.checkOutTime || '—'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Checked-In Duration
                </span>
                <div className="font-semibold text-gray-900 text-xs">
                  {record.checkedInDuration || record.totalHours || (record.status === 'Checked In' ? 'In Progress' : '—')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Current Activity
                </span>
                <div className="font-semibold text-gray-900 text-xs">
                  {record.assignment === 'Pickup' ? 'Pickup' : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Events */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Attendance Events
            </h2>
            <LifecycleTimeline events={record.timeline} title="Attendance Events" />
          </div>
        </div>
      </div>
    </div>
  );
};
