import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, Phone, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import { EndOfDayRecord } from '../types/attendance';
import { EndOfDayBadge, formatZMW, formatVariance } from '../components/attendance/EndOfDayTable';
import { LifecycleTimeline } from '../components/attendance/LifecycleTimeline';

export const EndOfDayDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const businessIdScope = currentUser?.businessId || 'BIZ-LUS-001';

  const [record, setRecord] = useState<EndOfDayRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!reference) return;
      try {
        const found = await adminService.getEndOfDayRecordByReference(reference, businessIdScope);
        setRecord(found);
      } catch (err) {
        console.error('Error fetching End-of-Day record:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [reference, businessIdScope]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-[#0D93AA]" />
        <p className="mt-3 text-xs text-gray-500 font-medium">Loading End-of-Day details...</p>
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
          <h3 className="text-sm font-bold text-gray-900">End-of-Day Record Not Found</h3>
          <p className="text-xs text-gray-500 mt-1">
            The requested End-of-Day record could not be found or does not belong to your business centre.
          </p>
        </div>
      </div>
    );
  }

  const hasDeclaredCash = record.declaredCash !== undefined;

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button and Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/business-owner/attendance-end-of-day?tab=eod')}
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
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-gray-900">{record.agentName}</h1>
                <span className="font-mono text-xs font-bold text-[#0D93AA] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {record.reference}
                </span>
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
            <EndOfDayBadge status={record.status} />
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Financial Reconciliations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business & Session Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Session Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  Business Date
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 font-mono text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#0D93AA]" />
                  <span>{record.businessDate}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Submission Timestamp
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{record.submittedTimestamp || 'Pending'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Position Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Cash Position
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/30">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Expected Cash
                </span>
                <div className="text-sm font-bold text-gray-900">
                  {formatZMW(record.expectedCash)}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/30">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Declared Cash
                </span>
                <div className="text-sm font-bold text-gray-900">
                  {hasDeclaredCash ? formatZMW(record.declaredCash!) : '—'}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  record.cashVariance !== 0 && hasDeclaredCash
                    ? 'border-rose-200 bg-rose-50/30 text-rose-700'
                    : 'border-cyan-100 bg-cyan-50/30 text-gray-800'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-70">
                  Cash Variance
                </span>
                <div className="text-sm font-bold">
                  {formatVariance(record.cashVariance, hasDeclaredCash)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lifecycle Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Lifecycle Timeline
            </h2>
            <LifecycleTimeline events={record.timeline} title="Reconciliation Events" />
          </div>
        </div>
      </div>
    </div>
  );
};
