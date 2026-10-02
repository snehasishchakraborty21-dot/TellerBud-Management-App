import React, { useState } from 'react';
import { UserCheck, Calendar, FileText, X, AlertCircle } from 'lucide-react';
import { BusinessOnboardingApplication } from '../../types/businessOnboarding';
import { AVAILABLE_TELLERBUD_EXECUTIVES, AvailableExecutive } from '../../services/businessOnboardingService';

interface AssignExecutiveModalProps {
  application: BusinessOnboardingApplication;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: {
    executiveId: string;
    executiveName: string;
    scheduledOnboardingDate: string;
    appointmentNotes?: string;
  }) => void;
  isSubmitting?: boolean;
}

export const AssignExecutiveModal: React.FC<AssignExecutiveModalProps> = ({
  application,
  isOpen,
  onClose,
  onAssign,
  isSubmitting = false,
}) => {
  const [selectedExecId, setSelectedExecId] = useState<string>(
    AVAILABLE_TELLERBUD_EXECUTIVES[0]?.id || 'TB-EMP-000001'
  );
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 16); // format YYYY-MM-DDTHH:mm
  });
  const [appointmentNotes, setAppointmentNotes] = useState<string>(
    'Physical meeting with Business Owner for PACRA verification, NRC scan, live photograph, and tablet e-signature.'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exec = AVAILABLE_TELLERBUD_EXECUTIVES.find((e) => e.id === selectedExecId);
    if (!exec) {
      setError('Please select a valid TellerBud Executive.');
      return;
    }
    if (!scheduledDate) {
      setError('Please specify the scheduled onboarding appointment date and time.');
      return;
    }

    onAssign({
      executiveId: exec.id,
      executiveName: `${exec.name} (${exec.role})`,
      scheduledOnboardingDate: scheduledDate,
      appointmentNotes: appointmentNotes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assign TellerBud Executive</h3>
              <p className="text-xs text-slate-500">Physical Tablet Onboarding Assignment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1 text-slate-600">
            <div className="font-semibold text-slate-900">{application.websiteData.businessName}</div>
            <div className="text-[11.5px]">Owner: {application.websiteData.ownerFullName} • {application.websiteData.phone}</div>
            <div className="text-[11px] font-mono text-[#0D93AA]">Business ID: {application.businessId || 'Pending'}</div>
          </div>

          {/* Executive Selection */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">Select TellerBud Executive</label>
            <select
              value={selectedExecId}
              onChange={(e) => setSelectedExecId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent cursor-pointer"
            >
              {AVAILABLE_TELLERBUD_EXECUTIVES.map((exec) => (
                <option key={exec.id} value={exec.id}>
                  {exec.name} ({exec.id}) — {exec.role} [{exec.region}]
                </option>
              ))}
            </select>
          </div>

          {/* Scheduled Date */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>Scheduled Onboarding Date & Time</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent"
            />
          </div>

          {/* Appointment Notes */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              <span>Appointment Instructions & Notes</span>
            </label>
            <textarea
              rows={3}
              value={appointmentNotes}
              onChange={(e) => setAppointmentNotes(e.target.value)}
              placeholder="Enter meeting venue, contact instructions, or verification guidance..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Executive & Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
