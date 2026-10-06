import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Tablet,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Calendar,
  CreditCard,
  FileText,
  Eye,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  BusinessOnboardingApplication,
  OnboardingApplicationStatus,
} from '../types/businessOnboarding';
import { businessOnboardingService } from '../services/businessOnboardingService';
import { ApproveApplicationModal } from '../components/business-onboarding/ApproveApplicationModal';
import { AssignExecutiveModal } from '../components/business-onboarding/AssignExecutiveModal';
import { RequestMoreInfoModal } from '../components/business-onboarding/RequestMoreInfoModal';
import { RejectApplicationModal } from '../components/business-onboarding/RejectApplicationModal';
import { ActivateBusinessModal } from '../components/business-onboarding/ActivateBusinessModal';
import { ReturnForCorrectionModal } from '../components/business-onboarding/ReturnForCorrectionModal';
import { ActivationEmailPreviewModal } from '../components/business-onboarding/ActivationEmailPreviewModal';

export const BusinessOnboardingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [application, setApplication] = useState<BusinessOnboardingApplication | null>(() =>
    id ? businessOnboardingService.getApplicationById(id) || null : null
  );

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

  // Active subtab in detail page
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'tablet_draft' | 'audit_trail'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to updates
  useEffect(() => {
    if (!id) return;
    const update = () => {
      const app = businessOnboardingService.getApplicationById(id);
      if (app) setApplication(app);
    };
    const unsub = businessOnboardingService.subscribe(update);
    return () => unsub();
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!application) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-4">
        <h2 className="text-base font-bold text-slate-900">Application Not Found</h2>
        <p className="text-xs text-slate-500">The requested onboarding record could not be found.</p>
        <button
          type="button"
          onClick={() => navigate('/super-admin/people/business-onboarding')}
          className="px-4 py-2 bg-[#0D93AA] text-white rounded-xl text-xs font-semibold"
        >
          Back to Onboarding Directory
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    const res = businessOnboardingService.approveApplication(application.id);
    if (res.success) {
      setShowApproveModal(false);
      showToast(`Approved! Generated Business ID ${res.businessId} & Owner ID ${res.businessOwnerId}.`);
      setShowAssignModal(true);
    }
  };

  const handleAssign = (data: {
    executiveId: string;
    executiveName: string;
    scheduledOnboardingDate: string;
    appointmentNotes?: string;
  }) => {
    const res = businessOnboardingService.assignExecutive(application.id, data);
    if (res.success) {
      setShowAssignModal(false);
      showToast(`Assigned to ${data.executiveName}. Onboarding in progress.`);
    }
  };

  const handleRequestInfo = (reason: string) => {
    const res = businessOnboardingService.requestMoreInformation(application.id, reason);
    if (res.success) {
      setShowRequestInfoModal(false);
      showToast('Information request dispatched.');
    }
  };

  const handleReject = (reason: string) => {
    const res = businessOnboardingService.rejectApplication(application.id, reason);
    if (res.success) {
      setShowRejectModal(false);
      showToast('Application rejected.');
    }
  };

  const handleActivate = () => {
    const res = businessOnboardingService.activateBusiness(application.id);
    if (res.success) {
      setShowActivateModal(false);
      showToast(`Business ${application.websiteData.businessName} is now ACTIVE!`);
      setShowEmailPreviewModal(true);
    }
  };

  const handleReturn = (reason: string) => {
    const res = businessOnboardingService.returnForCorrection(application.id, reason);
    if (res.success) {
      setShowReturnModal(false);
      showToast('Returned for Executive correction.');
    }
  };

  const submittedDate = new Date(application.websiteData.submittedAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto pb-20 w-full text-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-700 animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 size={15} className="text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/super-admin/people/business-onboarding')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Back to Business Onboarding directory"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                Business Onboarding Application
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-mono text-slate-500">
                Submitted {submittedDate}
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <h1 className="text-lg font-bold text-slate-900">{application.websiteData.businessName}</h1>
              {application.businessId ? (
                <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-mono font-bold text-xs">
                  {application.businessId}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] italic">
                  Pending ID assignment
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Action Buttons (State-based) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* If Pending / Under Review / More Info */}
          {(application.status === 'Pending Review' ||
            application.status === 'Under Review' ||
            application.status === 'More Information Required') && (
            <>
              <button
                type="button"
                onClick={() => setShowRequestInfoModal(true)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Request More Info
              </button>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => setShowApproveModal(true)}
                className="px-4 py-2 rounded-xl bg-[#0D93AA] hover:bg-[#0b8296] text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Approve Application</span>
              </button>
            </>
          )}

          {/* If Approved – Onboarding Pending */}
          {application.status === 'Approved – Onboarding Pending' && (
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <User size={14} />
              <span>Assign TellerBud Executive</span>
            </button>
          )}

          {/* If Onboarding in Progress or Returned */}
          {(application.status === 'Onboarding in Progress' ||
            application.status === 'Returned for Correction') && (
            <button
              type="button"
              onClick={() =>
                navigate(`/super-admin/people/business-onboarding/${application.id}/tablet-onboarding`)
              }
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Tablet size={14} />
              <span>Launch Tablet Onboarding Form</span>
            </button>
          )}

          {/* If Submitted for Activation */}
          {application.status === 'Submitted for Activation' && (
            <>
              <button
                type="button"
                onClick={() => setShowReturnModal(true)}
                className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={13} />
                <span>Return for Correction</span>
              </button>
              <button
                type="button"
                onClick={() => setShowActivateModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <ShieldCheck size={14} />
                <span>Activate Business Account</span>
              </button>
            </>
          )}

          {/* If Active */}
          {application.status === 'Active' && (
            <button
              type="button"
              onClick={() => setShowEmailPreviewModal(true)}
              className="px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 font-semibold hover:bg-teal-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Mail size={13} />
              <span>View Activation Email</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#0D93AA] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Application Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-[#0D93AA] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          NRC & Captured Documents {application.digitalOnboarding?.nrcFrontImage ? '(Available)' : ''}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tablet_draft')}
          className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'tablet_draft'
              ? 'bg-[#0D93AA] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Executive Physical Onboarding Data
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit_trail')}
          className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'audit_trail'
              ? 'bg-[#0D93AA] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit History ({application.auditLogs.length})
        </button>
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main 2 Cols: Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Website Submission Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 size={16} className="text-[#0D93AA]" />
                  <span>Website Application Submission</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Recorded: {submittedDate}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-medium text-[11px]">Business Name:</span>
                  <div className="text-slate-900 font-semibold text-sm mt-0.5">
                    {application.websiteData.businessName}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium text-[11px]">Business Owner Full Name:</span>
                  <div className="text-slate-900 font-semibold text-sm mt-0.5">
                    {application.websiteData.ownerFullName}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium text-[11px]">Contact Phone Number:</span>
                  <div className="text-slate-900 font-mono font-medium text-xs mt-0.5">
                    {application.websiteData.phone}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium text-[11px]">Contact Email Address:</span>
                  <div className="text-slate-900 font-medium text-xs mt-0.5">
                    {application.websiteData.email || <span className="text-slate-400 italic">Not Provided on website</span>}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium text-[11px]">Proposed Number of Agents:</span>
                  <div className="text-slate-900 font-bold text-xs mt-0.5">
                    {application.websiteData.numberOfAgents} Agents
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium text-[11px]">Operating Cities:</span>
                  <div className="text-slate-900 font-semibold text-xs mt-0.5">
                    {application.websiteData.operatingCities.join(', ')}
                  </div>
                </div>
              </div>

              {/* City Locations */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-slate-500 font-medium text-[11px] block">
                  Operating Locations per City:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(application.websiteData.cityLocations || {}).map(([city, addr]) => (
                    <div key={city} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                      <MapPin size={13} className="text-[#0D93AA] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">{city}:</span>{' '}
                        <span className="text-slate-600">{addr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Providers */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-slate-500 font-medium text-[11px] block">
                  Selected Service Providers:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {application.websiteData.selectedProviders.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-semibold text-[11.5px]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              {application.websiteData.additionalInformation && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-slate-500 font-medium text-[11px] block">
                    Applicant Message / Additional Notes:
                  </span>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 italic">
                    “{application.websiteData.additionalInformation}”
                  </div>
                </div>
              )}
            </div>

            {/* If Reason Notes Exist */}
            {application.moreInfoRequestReason && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-1">
                <div className="font-bold text-orange-900 text-xs flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-orange-600" />
                  <span>Information Request Details</span>
                </div>
                <p className="text-orange-800 leading-relaxed text-[11.5px]">
                  {application.moreInfoRequestReason}
                </p>
              </div>
            )}

            {application.correctionNotes && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-1">
                <div className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                  <RotateCcw size={14} className="text-rose-600" />
                  <span>Correction Instructions from Admin</span>
                </div>
                <p className="text-rose-800 leading-relaxed text-[11.5px]">
                  {application.correctionNotes}
                </p>
              </div>
            )}

            {application.rejectionReason && (
              <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 space-y-1">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-slate-600" />
                  <span>Rejection Reason</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">
                  {application.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Right 1 Col: Status, Executive Assignment, Account Meta */}
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                Application Status
              </h4>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold inline-block bg-slate-100 text-slate-800 border border-slate-200">
                  {application.status}
                </span>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100 text-[11.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Business ID:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {application.businessId || 'Pending Approval'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Owner ID:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {application.businessOwnerId || 'Pending Approval'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Access:</span>
                  <span className="font-semibold text-slate-700">
                    {application.status === 'Active' ? 'Active / Enabled' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Assignment Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Assigned Executive
                </h4>
                {application.executiveAssignment && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    {application.executiveAssignment.status}
                  </span>
                )}
              </div>

              {application.executiveAssignment ? (
                <div className="space-y-2 text-[11.5px]">
                  <div>
                    <span className="text-slate-500">Executive Name:</span>
                    <div className="font-bold text-slate-900">
                      {application.executiveAssignment.executiveName}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Employee ID:</span>
                    <div className="font-mono font-bold text-indigo-700">
                      {application.executiveAssignment.executiveId}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Scheduled Date:</span>
                    <div className="font-semibold text-slate-800">
                      {new Date(application.executiveAssignment.scheduledOnboardingDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  {application.executiveAssignment.appointmentNotes && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-500 text-[11px]">Appointment Notes:</span>
                      <p className="text-slate-700 italic text-[11px] mt-0.5">
                        {application.executiveAssignment.appointmentNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 italic py-2">
                  No TellerBud Executive assigned yet.{' '}
                  {application.status === 'Approved – Onboarding Pending' && (
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(true)}
                      className="text-[#0D93AA] font-bold underline ml-1 cursor-pointer"
                    >
                      Assign Executive now
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Tablet Launch Card */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0D93AA] rounded-2xl p-5 text-white space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Tablet size={18} className="text-teal-300" />
                <h4 className="font-bold text-sm">Tablet Onboarding Mode</h4>
              </div>
              <p className="text-white/80 text-[11.5px] leading-relaxed">
                Open the dedicated touch-screen digital physical onboarding form designed for TellerBud Executives.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate(`/super-admin/people/business-onboarding/${application.id}/tablet-onboarding`)
                }
                className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
              >
                Open Tablet Onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NRC & Captured Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Compliance & Identity Documents</h3>
                <p className="text-slate-500 text-xs">Captured on tablet by TellerBud Field Executive</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Lock size={12} className="text-slate-400" />
                <span>Restricted Access & Audit Logged</span>
              </div>
            </div>

            {application.digitalOnboarding?.nrcFrontImage ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NRC Front */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">National Registration Card (NRC Front)</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Captured: {application.digitalOnboarding.nrcFrontCapturedAt ? new Date(application.digitalOnboarding.nrcFrontCapturedAt).toLocaleDateString() : 'Yes'}
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center min-h-[180px]">
                    <img
                      src={application.digitalOnboarding.nrcFrontImage}
                      alt="NRC Front"
                      className="max-h-56 object-contain rounded-md"
                    />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    NRC Number:{' '}
                    <strong className="font-mono text-slate-900">
                      {application.digitalOnboarding.ownerNrcNumber || '123456/00/1'}
                    </strong>
                  </div>
                </div>

                {/* NRC Back */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">NRC Reverse Side (Thumbprint / Seal)</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Captured: {application.digitalOnboarding.nrcBackCapturedAt ? new Date(application.digitalOnboarding.nrcBackCapturedAt).toLocaleDateString() : 'Yes'}
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center min-h-[180px]">
                    {application.digitalOnboarding.nrcBackImage ? (
                      <img
                        src={application.digitalOnboarding.nrcBackImage}
                        alt="NRC Back"
                        className="max-h-56 object-contain rounded-md"
                      />
                    ) : (
                      <div className="text-slate-400 italic text-xs">Pending Capture</div>
                    )}
                  </div>
                </div>

                {/* Live Photo */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">Live Business Owner Photograph</span>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold border border-teal-200">
                      Live Tablet Capture
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center min-h-[180px]">
                    {application.digitalOnboarding.ownerLivePhoto ? (
                      <img
                        src={application.digitalOnboarding.ownerLivePhoto}
                        alt="Live Photo"
                        className="max-h-56 object-contain rounded-md"
                      />
                    ) : (
                      <div className="text-slate-400 italic text-xs">Pending Live Capture</div>
                    )}
                  </div>
                </div>

                {/* PACRA Document */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">PACRA Registration Certificate</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      PACRA: {application.digitalOnboarding.pacraRegistrationNumber || 'Verified'}
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center min-h-[180px]">
                    {application.digitalOnboarding.supportingBusinessDoc || application.digitalOnboarding.pacraDocument ? (
                      <img
                        src={application.digitalOnboarding.supportingBusinessDoc || application.digitalOnboarding.pacraDocument}
                        alt="PACRA Certificate"
                        className="max-h-56 object-contain rounded-md"
                      />
                    ) : (
                      <div className="text-slate-400 italic text-xs">Pending Document Scan</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <FileText size={32} className="mx-auto text-slate-300" />
                <div className="font-semibold text-slate-700">No Documents Captured Yet</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Documents will be captured directly via tablet camera during the physical onboarding meeting with the Business Owner.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Executive Physical Onboarding Data */}
      {activeTab === 'tablet_draft' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Field Executive Digital Onboarding Form</h3>
              <p className="text-slate-500 text-xs">Captured via Tablet Application during physical meeting</p>
            </div>
            {application.digitalOnboarding && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
                Current Step: {application.digitalOnboarding.currentStep} of 7
              </span>
            )}
          </div>

          {application.digitalOnboarding ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 font-medium">Legal Registered Name:</span>
                <div className="font-semibold text-slate-900">{application.digitalOnboarding.legalBusinessName || '-'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Trading Name:</span>
                <div className="font-semibold text-slate-900">{application.digitalOnboarding.tradingName || '-'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">PACRA Registration Number:</span>
                <div className="font-mono font-bold text-slate-900">{application.digitalOnboarding.pacraRegistrationNumber || 'Pending'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Business Legal Structure:</span>
                <div className="font-semibold text-slate-900">{application.digitalOnboarding.businessType || '-'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Owner Full Legal Name:</span>
                <div className="font-semibold text-slate-900">{application.digitalOnboarding.ownerFullLegalName || '-'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">NRC Number:</span>
                <div className="font-mono font-bold text-slate-900">{application.digitalOnboarding.ownerNrcNumber || 'Pending'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Verified Email:</span>
                <div className="font-medium text-slate-900">{application.digitalOnboarding.ownerEmail || 'Pending verification'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Verified Phone:</span>
                <div className="font-mono font-medium text-slate-900">{application.digitalOnboarding.ownerPhone || '-'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Proposed Stores Count:</span>
                <div className="font-bold text-slate-900">{application.digitalOnboarding.proposedStoresCount || 0} Stores</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Proposed Booths Count:</span>
                <div className="font-bold text-slate-900">{application.digitalOnboarding.proposedBoothsCount || 0} Booths</div>
              </div>

              {/* Terms & Conditions Acceptance Record */}
              <div className="sm:col-span-2 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-slate-500 font-medium block">
                  Terms & Conditions Acceptance Record:
                </span>
                {application.digitalOnboarding.acceptedOnboardingTerms ? (
                  <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                        <span className="font-bold text-teal-900 text-xs sm:text-sm">
                          {application.digitalOnboarding.termsAcceptanceRecord?.termsTitle || 'TellerBud Business Owner Terms & Conditions'}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-200 text-teal-900 text-[10.5px] font-bold">
                        Version {application.digitalOnboarding.termsVersionAccepted || '1.0'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-teal-950 pt-1">
                      <div>
                        <span className="text-teal-700">Effective Date:</span>{' '}
                        <strong>{application.digitalOnboarding.termsAcceptanceRecord?.effectiveDate || 'To be configured by TellerBud Admin'}</strong>
                      </div>
                      <div>
                        <span className="text-teal-700">Accepted At:</span>{' '}
                        <strong>
                          {application.digitalOnboarding.termsAcceptanceRecord?.acceptedAtFormattedLusaka ||
                            (application.digitalOnboarding.termsAcceptedTimestamp
                              ? new Date(application.digitalOnboarding.termsAcceptedTimestamp).toLocaleString('en-GB') + ' CAT'
                              : '24 September 2026 at 16:05:00 CAT')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-teal-700">Signatory:</span>{' '}
                        <strong>{application.digitalOnboarding.ownerFullLegalName}</strong> ({application.businessOwnerId || 'TB-BOO-000011'})
                      </div>
                      <div>
                        <span className="text-teal-700">Timezone:</span> <strong>Africa/Lusaka</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    Terms & Conditions acceptance pending.
                  </div>
                )}
              </div>

              {/* Tablet E-Signature */}
              {application.digitalOnboarding.eSignatureData && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-slate-500 font-medium block">
                    Business Owner Tablet E-Signature:
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <img
                      src={application.digitalOnboarding.eSignatureData}
                      alt="E-Signature"
                      className="max-h-20 object-contain"
                    />
                    <div className="text-right text-[11px] text-slate-500">
                      <div>
                        Signed:{' '}
                        {application.digitalOnboarding.eSignatureTimestamp
                          ? new Date(application.digitalOnboarding.eSignatureTimestamp).toLocaleString()
                          : 'Yes'}
                      </div>
                      <div className="text-emerald-700 font-semibold">Consent & Terms v1.0 Bound</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              Onboarding draft not initiated yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Audit History */}
      {activeTab === 'audit_trail' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Permanent Compliance Audit Trail</h3>
            <p className="text-slate-500 text-xs">Immutable system log of all administrative and executive actions</p>
          </div>

          <div className="divide-y divide-slate-100">
            {application.auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 text-xs">{log.action}</div>
                  <div className="text-slate-500 text-[11.5px]">
                    By: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorId})
                  </div>
                  {log.notes && (
                    <div className="text-slate-600 text-[11px] pt-0.5 italic">
                      “{log.notes}”
                    </div>
                  )}
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ApproveApplicationModal
        application={application}
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
      />
      <AssignExecutiveModal
        application={application}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
      />
      <RequestMoreInfoModal
        application={application}
        isOpen={showRequestInfoModal}
        onClose={() => setShowRequestInfoModal(false)}
        onSubmit={handleRequestInfo}
      />
      <RejectApplicationModal
        application={application}
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onReject={handleReject}
      />
      <ActivateBusinessModal
        application={application}
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={handleActivate}
      />
      <ReturnForCorrectionModal
        application={application}
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onSubmit={handleReturn}
      />
      <ActivationEmailPreviewModal
        application={application}
        isOpen={showEmailPreviewModal}
        onClose={() => setShowEmailPreviewModal(false)}
      />
    </div>
  );
};
