import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Calendar, Building2, Phone, Clock, UserCheck, Shield } from 'lucide-react';
import { AttendanceRecord } from '../../types/attendance';
import { AttendanceBadge, AssignmentBadge } from './AttendanceTable';
import { LifecycleTimeline } from './LifecycleTimeline';

interface AttendanceSummaryModalProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceSummaryModal: React.FC<AttendanceSummaryModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !record) return null;

  const handleOpenFullDetails = () => {
    onClose();
    navigate(`/business-owner/attendance-end-of-day/attendance/${record.agentId}/${record.date}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900">Attendance Summary</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Agent Identification Bar */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-100 text-[#0D93AA] font-bold text-sm flex items-center justify-center shrink-0 border border-cyan-200">
                {record.avatarInitials}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">
                  {record.agentName}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-gray-500 font-mono text-[11px]">
                  <span>{record.agentId}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {record.agentPhone}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <AttendanceBadge status={record.status} />
              <AssignmentBadge assignment={record.assignment} />
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Business Centre
              </span>
              <div className="flex items-start gap-1.5 font-semibold text-gray-800 leading-snug">
                <Building2 className="w-3.5 h-3.5 text-[#0D93AA] shrink-0 mt-0.5" />
                <span>{record.businessCentre}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Attendance Date
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-gray-800 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#0D93AA] shrink-0" />
                <span>{record.date}</span>
              </div>
            </div>
          </div>

          {/* Check-In Details Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-cyan-50/20 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Check In
              </span>
              <div className="font-semibold text-gray-900 font-mono text-xs">
                {record.checkInTime || '—'}
              </div>
            </div>

            <div className="p-3 bg-cyan-50/20 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Check Out
              </span>
              <div className="font-semibold text-gray-900 font-mono text-xs">
                {record.checkOutTime || '—'}
              </div>
            </div>

            <div className="p-3 bg-cyan-50/20 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Checked-In Duration
              </span>
              <div className="font-semibold text-gray-900 text-xs">
                {record.totalHours || record.checkedInDuration || (record.status === 'Checked In' ? 'In Progress' : '—')}
              </div>
            </div>
          </div>

          {/* Activity & Last Active */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Current Activity
              </span>
              <div className="font-semibold text-gray-800">
                {record.assignment === 'Pickup' ? 'Pickup' : '—'}
              </div>
            </div>

            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Last Active
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-gray-800 font-mono">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{record.lastActive}</span>
              </div>
            </div>
          </div>

          {/* Lifecycle Timeline */}
          {record.timeline && record.timeline.length > 0 && (
            <div className="p-4 bg-gray-50/30 rounded-xl border border-gray-100">
              <LifecycleTimeline events={record.timeline} title="Attendance Events" />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleOpenFullDetails}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Full Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
