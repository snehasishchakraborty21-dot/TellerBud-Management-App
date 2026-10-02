import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Power,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Printer,
  Smartphone,
  Landmark,
  Calendar,
  User,
  AlertCircle,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { useVendor } from '../context/VendorContext';
import { EditVendorModal } from '../components/vendors/EditVendorModal';
import { DeactivateVendorDialog } from '../components/vendors/DeactivateVendorDialog';
import { DeleteVendorModal } from '../components/vendors/DeleteVendorModal';
import { VendorDetailData } from '../types/vendor';

export const VendorDetailsPage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const {
    getVendor,
    updateVendor,
    toggleVendorStatus,
    archiveVendor,
    deleteVendor,
  } = useVendor();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Retrieve vendor from context
  const vendor = useMemo(() => {
    return vendorId ? getVendor(vendorId) : undefined;
  }, [vendorId, getVendor]);

  // Click outside and escape handler for More Actions menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setIsMoreActionsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMoreActionsOpen(false);
      }
    };

    if (isMoreActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreActionsOpen]);

  // Toast handler
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Copy helper
  const handleCopy = useCallback((text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  }, []);

  // Navigation back to vendors list (preserves state in context)
  const handleBackToVendors = useCallback(() => {
    navigate('/super-admin/configuration/vendors');
  }, [navigate]);

  // Navigate to Vendor Eligibility page with preselected vendor
  const handleManageEligibility = useCallback(() => {
    if (vendor) {
      navigate(`/super-admin/configuration/vendor-eligibility?vendorId=${encodeURIComponent(vendor.id)}`);
    }
  }, [navigate, vendor]);

  // Activate handler
  const handleActivateVendor = useCallback(() => {
    if (!vendor) return;
    toggleVendorStatus(vendor.id, 'Active');
    showToast(`${vendor.name} has been activated successfully.`);
  }, [vendor, toggleVendorStatus, showToast]);

  // Confirm deactivation handler
  const handleConfirmDeactivate = useCallback(() => {
    if (!vendor) return;
    toggleVendorStatus(vendor.id, 'Inactive');
    showToast(`${vendor.name} has been deactivated.`);
  }, [vendor, toggleVendorStatus, showToast]);

  // Permanent delete handler (for unused vendors)
  const handlePermanentDelete = useCallback(
    (id: string) => {
      if (!vendor) return;
      deleteVendor(id);
      showToast(`Vendor ${vendor.name} has been permanently deleted.`);
      navigate('/super-admin/configuration/vendors');
    },
    [vendor, deleteVendor, showToast, navigate]
  );

  // Archive handler (for vendors with historical records)
  const handleArchiveVendor = useCallback(
    (id: string) => {
      if (!vendor) return;
      archiveVendor(id);
      showToast(`Vendor ${vendor.name} has been archived successfully.`);
    },
    [vendor, archiveVendor, showToast]
  );

  // Save edit handler
  const handleSaveEdit = useCallback(
    (
      updatedFields: Partial<VendorDetailData>,
      changeNotes: Array<{ event: string; previousValue: string; newValue: string }>
    ) => {
      if (!vendor) return;
      updateVendor(vendor.id, updatedFields, changeNotes);
      showToast('Vendor information updated successfully.');
    },
    [vendor, updateVendor, showToast]
  );

  // 1. INVALID VENDOR STATE
  if (!vendor) {
    return (
      <div
        id="vendor-not-found-container"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12"
      >
        {/* Back to Vendors link */}
        <div className="mb-6">
          <button
            onClick={handleBackToVendors}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8094] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Vendors</span>
          </button>
        </div>

        {/* Not Found Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center shadow-xs max-w-md mx-auto">
          <div className="w-14 h-14 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Vendor Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            The requested vendor record could not be found or has been removed from the registry.
          </p>
          <button
            onClick={handleBackToVendors}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D93AA] hover:bg-[#0b8094] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Back to Vendors</span>
          </button>
        </div>
      </div>
    );
  }

  const isActive = vendor.status === 'Active';

  return (
    <div
      id="vendor-details-page-container"
      className="w-full h-auto min-h-0 space-y-3.5 px-3 sm:px-6 pt-1 pb-6"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION ROW: Single Back to Vendors Button (Duplicate header removed) */}
      <div className="flex items-center py-0.5">
        <button
          id="back-to-vendors-btn"
          onClick={handleBackToVendors}
          aria-label="Back to Vendors"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/90 transition-colors cursor-pointer border border-slate-200/80 bg-white shadow-2xs"
        >
          <ArrowLeft size={14} className="text-slate-500" />
          <span>Back to Vendors</span>
        </button>
      </div>

      {/* UPPER VENDOR IDENTITY BANNER WITH ACTIONS */}
      <div
        id="vendor-identity-banner"
        className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Vendor Details (Left-aligned, text-only without logo) */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {vendor.name}
              </h2>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                  vendor.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : vendor.status === 'Archived'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    vendor.status === 'Active'
                      ? 'bg-emerald-500'
                      : vendor.status === 'Archived'
                      ? 'bg-purple-500'
                      : 'bg-slate-400'
                  }`}
                />
                {vendor.status}
              </span>

              {/* Vendor Type Badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {vendor.type === 'Mobile Money' ? (
                  <Smartphone size={12} className="text-slate-500" />
                ) : (
                  <Landmark size={12} className="text-slate-500" />
                )}
                <span>{vendor.type}</span>
              </span>
            </div>

            {/* Vendor ID with quick copy & Country/Currency */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-semibold">
                {vendor.id}
              </span>
              <button
                onClick={() => handleCopy(vendor.id, 'vendorId')}
                title="Copy Vendor ID"
                aria-label="Copy Vendor ID"
                className="p-1 hover:text-slate-900 text-slate-400 rounded transition-colors cursor-pointer"
              >
                {copiedField === 'vendorId' ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-700">
                {vendor.country || 'Zambia'} ({vendor.currency || 'ZMW'})
              </span>
            </div>
          </div>

          {/* Action Buttons: Export PDF, Edit Vendor, Deactivate/Activate, More Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap self-end sm:self-auto shrink-0">
            {/* 1. Export PDF */}
            <button
              id="vendor-export-pdf-btn"
              type="button"
              onClick={() => window.print()}
              aria-label="Export PDF"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
              title="Export vendor details as PDF"
            >
              <Printer size={14} className="text-slate-500" />
              <span>Export PDF</span>
            </button>

            {/* 2. Edit Vendor */}
            <button
              id="vendor-edit-btn"
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Edit Vendor"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
              title="Edit vendor configuration and services"
            >
              <Edit size={14} className="text-slate-500" />
              <span>Edit Vendor</span>
            </button>

            {/* 3. Deactivate Vendor or Activate Vendor */}
            {isActive ? (
              <button
                id="vendor-deactivate-btn"
                type="button"
                onClick={() => setIsDeactivateDialogOpen(true)}
                aria-label="Deactivate Vendor"
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                title="Deactivate transaction routing for this vendor"
              >
                <Power size={14} />
                <span>Deactivate Vendor</span>
              </button>
            ) : (
              <button
                id="vendor-activate-btn"
                type="button"
                onClick={handleActivateVendor}
                aria-label="Activate Vendor"
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                title="Activate vendor transaction routing"
              >
                <Power size={14} />
                <span>Activate Vendor</span>
              </button>
            )}

            {/* 4. More Actions Menu */}
            <div className="relative" ref={moreActionsRef}>
              <button
                id="vendor-more-actions-btn"
                type="button"
                onClick={() => setIsMoreActionsOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isMoreActionsOpen}
                aria-label="More Actions"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
                title="More actions"
              >
                <span>More Actions</span>
                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform duration-150 ${
                    isMoreActionsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isMoreActionsOpen && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="vendor-more-actions-btn"
                  className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-40 animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    id="vendor-delete-action-btn"
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setIsMoreActionsOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left focus:outline-none focus:bg-rose-50"
                  >
                    <Trash2 size={14} className="text-rose-600" />
                    <span>Delete Vendor</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOUR COMPACT KPI CARDS (Single horizontal line per card) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Vendor Status */}
        <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider truncate mr-2">
            Vendor Status
          </span>
          <span className="flex items-center gap-1.5 shrink-0 text-xs sm:text-sm font-bold text-slate-900">
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{vendor.status}</span>
          </span>
        </div>

        {/* 2. Integration Mode */}
        <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider truncate mr-2">
            Integration Mode
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 shrink-0">
            {vendor.integrationMode || 'External'}
          </span>
        </div>

        {/* 3. Supported Services */}
        <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider truncate mr-2">
            Supported Services
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono text-[#0D93AA] shrink-0">
            {vendor.services.length} Enabled
          </span>
        </div>

        {/* 4. Last Updated */}
        <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider truncate mr-2">
            Last Updated
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 shrink-0 truncate max-w-[140px]">
            {vendor.lastUpdated}
          </span>
        </div>
      </div>

      {/* SECTION 1: VENDOR INFORMATION & SECTION 2: SUPPORTED SERVICES (Matched Height & Compact) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Section 1: Vendor Information */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-2.5 border-b border-slate-100 mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Vendor Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
            <div>
              <span className="text-slate-600 block text-[11px] font-medium mb-0.5">Vendor Name</span>
              <span className="font-semibold text-slate-900">{vendor.name}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-medium mb-0.5">Vendor ID</span>
              <span className="font-mono font-semibold text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                {vendor.id}
              </span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-medium mb-0.5">Vendor Type</span>
              <span className="font-semibold text-slate-900">{vendor.type}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-medium mb-0.5">Country & Currency</span>
              <span className="font-semibold text-slate-900">
                {vendor.country} ({vendor.currency})
              </span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-medium mb-0.5">Integration Mode</span>
              <span className="font-semibold text-slate-900">{vendor.integrationMode || 'External'}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-medium mb-0.5">Added Date</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                {vendor.addedDate}
              </span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-medium mb-0.5">Last Updated</span>
              <span className="font-semibold text-slate-900">{vendor.lastUpdated}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-medium mb-0.5">Updated By</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                {vendor.updatedBy}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Supported Services (Matching Height with Internal Scrollable List) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Supported Services
              </h2>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-full">
                {vendor.services.length} Enabled
              </span>
            </div>
            <button
              onClick={handleManageEligibility}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8094] transition-colors cursor-pointer"
            >
              <span>Manage Vendor Eligibility</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Internal Scrollable List of Services */}
          <div className="flex-1 min-h-0 overflow-y-auto max-h-[190px] sm:max-h-[210px] pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {vendor.serviceEligibilities.map((srv) => (
              <div
                key={srv.name}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                  srv.enabled
                    ? 'bg-slate-50/70 border-slate-200/90'
                    : 'bg-white border-slate-200/60 opacity-60'
                }`}
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{srv.name}</span>
                    {srv.enabled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} />
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <XCircle size={10} />
                        Disabled
                      </span>
                    )}
                  </div>
                  {srv.notes && (
                    <p className="text-[11px] text-slate-600 leading-normal">{srv.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: EXTERNAL SETTLEMENT DETAILS */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs h-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              External Settlement Details
            </h2>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                vendor.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {vendor.status}
            </span>
          </div>
        </div>

        {/* Phase 1 External Settlement Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* 1. Settlement Method */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-600 block mb-1">
              Settlement Method
            </span>
            <p className="text-xs font-semibold text-slate-900">
              External Settlement
            </p>
          </div>

          {/* 2. Processing Window */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-600 block mb-1">
              Processing Window
            </span>
            <p className="text-xs font-semibold text-slate-900">
              Vendor-Dependent
            </p>
          </div>

          {/* 3. Processing Channel */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-600 block mb-1">
              Processing Channel
            </span>
            <p className="text-xs font-semibold text-slate-900">
              External Vendor Channel
            </p>
          </div>

          {/* 4. Settlement Management */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-600 block mb-1">
              Settlement Management
            </span>
            <p className="text-xs font-semibold text-slate-900">
              Managed Externally
            </p>
          </div>

          {/* 5. Last Updated */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-600 block mb-1">
              Last Updated
            </span>
            <p className="text-xs font-semibold text-slate-900">
              {vendor.lastUpdated}
            </p>
          </div>

          {/* 6. Vendor Status */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-600 block mb-1">
              Vendor Status
            </span>
            <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              <span>{vendor.status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: CONFIGURATION */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs h-auto">
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
          {/* 1. Minimum Amount */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-600 block text-[11px] font-medium mb-1">
              Minimum Transaction Amount
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              ZMW {vendor.minTransactionAmount.toFixed(2)}
            </span>
          </div>

          {/* 2. Maximum Amount */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-600 block text-[11px] font-medium mb-1">
              Maximum Transaction Amount
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              ZMW {vendor.maxTransactionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* 3. Reservation Charge Eligibility */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-600 block text-[11px] font-medium mb-1">
              Reservation Charge Eligibility
            </span>
            <span className="font-semibold text-slate-900">
              {vendor.reservationChargeEligibility}
            </span>
          </div>

          {/* 4. Settlement Method */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-600 block text-[11px] font-medium mb-1">
              Settlement Method
            </span>
            <span className="font-semibold text-slate-900">External Settlement</span>
          </div>

          {/* 5. Reconciliation Method */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 sm:col-span-2 lg:col-span-2">
            <span className="text-slate-600 block text-[11px] font-medium mb-1">
              Reconciliation Method
            </span>
            <span className="font-semibold text-slate-900">Manual / External</span>
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT VENDOR ACTIVITY */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs h-auto">
        <div className="pb-3 border-b border-slate-100 mb-3 flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Vendor Activity
          </h2>
          <span className="text-[11px] font-medium text-slate-500">(Latest 5 Events)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendor.recentActivities.length > 0 ? (
                vendor.recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{act.event}</td>
                    <td className="py-2.5 px-3 text-slate-700">{act.service}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {act.reference === '—' ? (
                        <span className="text-slate-400 font-sans">—</span>
                      ) : (
                        act.reference
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          act.status === 'Completed' || act.status === 'Successful'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {act.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-medium whitespace-nowrap">
                      {act.dateTime}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                    No recent vendor activity logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: CHANGE HISTORY */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs h-auto">
        <div className="pb-3 border-b border-slate-100 mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Change History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Previous Value</th>
                <th className="py-2.5 px-3">New Value</th>
                <th className="py-2.5 px-3">Changed By</th>
                <th className="py-2.5 px-3 text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendor.changeHistory && vendor.changeHistory.length > 0 ? (
                vendor.changeHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.event}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate" title={item.previousValue}>
                      {item.previousValue}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[260px] truncate" title={item.newValue}>
                      {item.newValue}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{item.changedBy}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-medium whitespace-nowrap">
                      {item.dateTime}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                    No administrative changes recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <EditVendorModal
        isOpen={isEditModalOpen}
        vendor={vendor}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      <DeactivateVendorDialog
        isOpen={isDeactivateDialogOpen}
        vendor={vendor}
        onClose={() => setIsDeactivateDialogOpen(false)}
        onConfirm={handleConfirmDeactivate}
      />

      <DeleteVendorModal
        isOpen={isDeleteModalOpen}
        vendor={vendor}
        onClose={() => setIsDeleteModalOpen(false)}
        onPermanentDelete={handlePermanentDelete}
        onArchive={handleArchiveVendor}
      />
    </div>
  );
};
export default VendorDetailsPage;
