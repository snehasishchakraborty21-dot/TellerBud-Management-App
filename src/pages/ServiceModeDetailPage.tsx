import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Banknote,
  Truck,
  Store,
  ArrowLeftRight,
  Layers,
  Edit2,
  Lock,
  PowerOff,
  Power,
} from 'lucide-react';
import { ServiceModeRecord, ServiceModeChangeLog } from '../types/serviceMode';
import {
  getStoredServiceModes,
  getStoredServiceModeById,
  saveServiceModeRecord,
  getServiceModeHistory,
  INITIAL_SERVICE_MODES,
} from '../data/mockServiceModes';
import { ServiceModeSummaryCards } from '../components/serviceModes/ServiceModeSummaryCards';
import { ServiceConfigurationSection } from '../components/serviceModes/ServiceConfigurationSection';
import { EligibleProvidersSection } from '../components/serviceModes/EligibleProvidersSection';
import { ChangeHistorySection } from '../components/serviceModes/ChangeHistorySection';
import {
  ConfirmOperationalChangesModal,
  PendingOperationalChange,
} from '../components/serviceModes/ConfirmOperationalChangesModal';
import { StatusToggleModal } from '../components/serviceModes/StatusToggleModal';
import { ToastNotification } from '../components/shared/ToastNotification';

export const ServiceModeDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Load service mode record from persistent store with fallback to INITIAL_SERVICE_MODES
  const [service, setService] = useState<ServiceModeRecord | undefined>(() => {
    if (!serviceId) return undefined;
    return (
      getStoredServiceModeById(serviceId) ||
      INITIAL_SERVICE_MODES.find(
        (s) => s.id.toLowerCase() === serviceId.toLowerCase()
      )
    );
  });

  // Change history state
  const [history, setHistory] = useState<ServiceModeChangeLog[]>(() =>
    getServiceModeHistory(serviceId)
  );

  // Edit and modal states
  const [isEditing, setIsEditing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingOperationalChange[]>([]);
  const [pendingUpdatedRecord, setPendingUpdatedRecord] = useState<ServiceModeRecord | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state if serviceId changes or storage event triggers
  useEffect(() => {
    if (!serviceId) return;
    const current =
      getStoredServiceModeById(serviceId) ||
      INITIAL_SERVICE_MODES.find(
        (s) => s.id.toLowerCase() === serviceId.toLowerCase()
      );
    setService(current);
    setHistory(getServiceModeHistory(serviceId));
  }, [serviceId]);

  const handleReturn = () => {
    // Preserve filters and scroll position when returning
    navigate('/super-admin/configuration/service-modes', {
      state: {
        filters: location.state?.filters,
        scrollPosition: location.state?.scrollPosition,
      },
    });
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'TB-SVC-CP-001':
        return <Banknote className="w-6 h-6 text-emerald-600" aria-hidden="true" />;
      case 'TB-SVC-CD-002':
        return <Truck className="w-6 h-6 text-amber-600" aria-hidden="true" />;
      case 'TB-SVC-WI-003':
        return <Store className="w-6 h-6 text-[#0D93AA]" aria-hidden="true" />;
      case 'TB-SVC-A2A-004':
        return <ArrowLeftRight className="w-6 h-6 text-indigo-600" aria-hidden="true" />;
      default:
        return <Layers className="w-6 h-6 text-slate-600" aria-hidden="true" />;
    }
  };

  // Called by ServiceConfigurationSection when user clicks "Save Changes"
  const handleRequestSave = useCallback(
    (updatedRecord: ServiceModeRecord, changes: PendingOperationalChange[]) => {
      setPendingUpdatedRecord(updatedRecord);
      setPendingChanges(changes);
      setIsConfirmModalOpen(true);
    },
    []
  );

  // Apply operational changes after modal confirmation
  const handleConfirmSave = () => {
    if (!pendingUpdatedRecord) return;

    const changeLogs = pendingChanges.map((c) => ({
      serviceId: pendingUpdatedRecord.id,
      serviceName: pendingUpdatedRecord.name,
      fieldChanged: c.field,
      previousValue: c.previousValue,
      newValue: c.newValue,
      updatedBy: 'Sililo Lubinda (Super Admin)',
    }));

    const result = saveServiceModeRecord(pendingUpdatedRecord, changeLogs);
    setService(result.record);
    setHistory(getServiceModeHistory(result.record.id));
    setIsConfirmModalOpen(false);
    setIsEditing(false);
    setToastMessage('Service mode configuration updated successfully.');
  };

  // Check if deactivating this service leaves the platform without any active customer-facing service
  const isCustomerFacing =
    service?.audience === 'Customer App' || service?.audience === 'Customer and Agent';
  const allModes = getStoredServiceModes();
  const otherActiveCustomerFacing = allModes.filter(
    (m) =>
      m.id.toLowerCase() !== service?.id.toLowerCase() &&
      m.availability === 'Active' &&
      (m.audience === 'Customer App' || m.audience === 'Customer and Agent')
  );
  const isDeactivationBlocked =
    service?.availability === 'Active' && isCustomerFacing && otherActiveCustomerFacing.length === 0;

  // Status toggle confirmation (Activate / Deactivate)
  const handleConfirmStatusToggle = () => {
    if (!service) return;
    const targetStatus = service.availability === 'Active' ? 'Inactive' : 'Active';
    const fieldChanged =
      targetStatus === 'Active' ? 'Service Mode Activated' : 'Service Mode Deactivated';
    const updatedRecord: ServiceModeRecord = {
      ...service,
      availability: targetStatus,
    };

    const changeLogs = [
      {
        serviceId: service.id,
        serviceName: service.name,
        fieldChanged,
        previousValue: service.availability,
        newValue: targetStatus,
        updatedBy: 'Sililo Lubinda (Super Admin)',
      },
    ];

    const result = saveServiceModeRecord(updatedRecord, changeLogs);
    setService(result.record);
    setHistory(getServiceModeHistory(result.record.id));
    setIsStatusModalOpen(false);
    setToastMessage(
      `${service.name} has been ${targetStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`
    );
  };

  if (!service) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
        <button
          type="button"
          onClick={handleReturn}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8094] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Service Modes
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
          <p className="text-base font-semibold text-slate-800">Service Mode Not Found</p>
          <p className="text-xs text-slate-500">
            No service mode matched the ID &quot;{serviceId}&quot;.
          </p>
        </div>
      </div>
    );
  }

  // Can activate/deactivate only when permitted (Cash Delivery is locked against activation)
  const canToggleStatus = service.canActivateInPhase1 && service.availability !== 'Coming Soon';

  return (
    <div
      id="service-mode-detail-container"
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 pb-6"
    >
      {/* Navigation Return Bar */}
      <div className="flex items-center justify-start">
        <button
          type="button"
          id="btn-back-service-modes"
          onClick={handleReturn}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#096e80] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/15 border border-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Back to Service Modes</span>
        </button>
      </div>

      {/* Main Service Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Service Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              {getServiceIcon(service.id)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {service.name}
                </h2>
                {service.displayLabel && (
                  <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 rounded">
                    {service.displayLabel}
                  </span>
                )}
              </div>
              {/* Service ID directly below the service name */}
              <p className="text-xs font-mono text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                <span>Service ID:</span>
                <span className="font-semibold text-slate-700">{service.id}</span>
              </p>
            </div>
          </div>

          {/* Right: Status badge, Edit button, Activate/Deactivate action */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                service.availability === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : service.availability === 'Coming Soon'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  service.availability === 'Active'
                    ? 'bg-emerald-500'
                    : service.availability === 'Coming Soon'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
                aria-hidden="true"
              />
              {service.availability}
            </span>

            {/* Edit Service Mode Button */}
            {!isEditing && (
              <button
                type="button"
                id="btn-edit-service-mode"
                onClick={() => setIsEditing(true)}
                aria-label={`Edit operational parameters for ${service.name}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] hover:text-white hover:bg-[#0D93AA] bg-white border border-[#0D93AA]/40 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Edit Service Mode</span>
              </button>
            )}

            {/* Activate / Deactivate Button (Only when permitted) */}
            {canToggleStatus && !isEditing && (
              <button
                type="button"
                id={`btn-toggle-status-${service.id}`}
                onClick={() => setIsStatusModalOpen(true)}
                aria-label={`${
                  service.availability === 'Active' ? 'Deactivate' : 'Activate'
                } ${service.name}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs border transition-colors cursor-pointer ${
                  service.availability === 'Active'
                    ? 'text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border-rose-200'
                    : 'text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border-emerald-200'
                }`}
              >
                {service.availability === 'Active' ? (
                  <>
                    <PowerOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <Power className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Activate</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Four Compact Summary Cards */}
      <ServiceModeSummaryCards service={service} />

      {/* 4 & 6. Service Configuration Section (View & Edit Mode) */}
      <ServiceConfigurationSection
        service={service}
        isEditing={isEditing}
        onStartEdit={() => setIsEditing(true)}
        onCancelEdit={() => setIsEditing(false)}
        onRequestSave={handleRequestSave}
      />

      {/* 5. Eligible Providers Section */}
      <EligibleProvidersSection service={service} />

      {/* 8. Change History Table */}
      <ChangeHistorySection history={history} serviceName={service.name} />

      {/* Confirmation Dialog for Operational Edits */}
      <ConfirmOperationalChangesModal
        isOpen={isConfirmModalOpen}
        serviceName={service.name}
        serviceId={service.id}
        changes={pendingChanges}
        onConfirm={handleConfirmSave}
        onClose={() => setIsConfirmModalOpen(false)}
      />

      {/* Status Toggle Modal (Activate / Deactivate with Deactivation Protection) */}
      <StatusToggleModal
        isOpen={isStatusModalOpen}
        serviceName={service.name}
        serviceId={service.id}
        currentAvailability={service.availability}
        activeRequestsCount={14}
        pendingRequestsCount={6}
        isDeactivationBlocked={isDeactivationBlocked}
        blockingReason={
          `${service.name} is currently the only active customer-facing service on the platform. Deactivation is blocked because the platform requires at least one active customer-facing service to remain operational.`
        }
        onConfirm={handleConfirmStatusToggle}
        onClose={() => setIsStatusModalOpen(false)}
      />

      {/* Success Notification Toast */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
