import React, { useState, useEffect } from 'react';
import {
  Lock,
  CheckCircle2,
  Clock,
  Receipt,
  Users,
  AlertCircle,
  X,
  Check,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';
import {
  ServiceModeRecord,
  ServiceAudience,
  ServiceTransactionType,
  ServiceAvailability,
} from '../../types/serviceMode';
import { PendingOperationalChange } from './ConfirmOperationalChangesModal';
import { isServiceModeEligibleForReservationFee } from '../../utils/reservationFeeUtils';

interface ServiceConfigurationSectionProps {
  service: ServiceModeRecord;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onRequestSave: (
    updatedRecord: ServiceModeRecord,
    pendingChanges: PendingOperationalChange[]
  ) => void;
}

const ALL_TRANSACTION_TYPES: ServiceTransactionType[] = [
  'Deposit',
  'Withdrawal',
  'Purchase',
  'Liquidity Transfer',
];

export const ServiceConfigurationSection: React.FC<ServiceConfigurationSectionProps> = ({
  service,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onRequestSave,
}) => {
  // Edit form states
  const [formName, setFormName] = useState(service.name);
  const [isCustomerAudience, setIsCustomerAudience] = useState(
    service.audience === 'Customer App' || service.audience === 'Customer and Agent'
  );
  const [isAgentAudience, setIsAgentAudience] = useState(
    service.audience === 'Agent App' || service.audience === 'Customer and Agent'
  );
  const [formAvailability, setFormAvailability] = useState<ServiceAvailability>(
    service.availability
  );
  const [formTxTypes, setFormTxTypes] = useState<ServiceTransactionType[]>(
    service.transactionTypes
  );
  const [formScheduling, setFormScheduling] = useState(service.scheduling);
  const [requireCustomerConfirm, setRequireCustomerConfirm] = useState(
    service.completionConfirmation?.some((c) => c.toLowerCase().includes('customer')) ?? false
  );
  const [requireAgentConfirm, setRequireAgentConfirm] = useState(
    service.completionConfirmation?.some((c) => c.toLowerCase().includes('agent')) ?? false
  );

  const [formErrors, setFormErrors] = useState<{ audience?: string; txTypes?: string }>({});

  const hasDynamicFee = isServiceModeEligibleForReservationFee(service.id);

  // Reset form when service or edit mode changes
  useEffect(() => {
    setFormName(service.name);
    setIsCustomerAudience(
      service.audience === 'Customer App' || service.audience === 'Customer and Agent'
    );
    setIsAgentAudience(
      service.audience === 'Agent App' || service.audience === 'Customer and Agent'
    );
    setFormAvailability(service.availability);
    setFormTxTypes(service.transactionTypes);
    setFormScheduling(service.scheduling);
    setRequireCustomerConfirm(
      service.completionConfirmation?.some((c) => c.toLowerCase().includes('customer')) ?? false
    );
    setRequireAgentConfirm(
      service.completionConfirmation?.some((c) => c.toLowerCase().includes('agent')) ?? false
    );
    setFormErrors({});
  }, [service, isEditing]);

  const toggleTxType = (type: ServiceTransactionType) => {
    if (formTxTypes.includes(type)) {
      if (formTxTypes.length === 1) {
        setFormErrors((prev) => ({
          ...prev,
          txTypes: 'At least one transaction type must remain selected.',
        }));
        return;
      }
      setFormTxTypes(formTxTypes.filter((t) => t !== type));
    } else {
      setFormTxTypes([...formTxTypes, type]);
    }
    setFormErrors((prev) => ({ ...prev, txTypes: undefined }));
  };

  const computeAudienceString = (): ServiceAudience | null => {
    if (isCustomerAudience && isAgentAudience) return 'Customer and Agent';
    if (isCustomerAudience) return 'Customer App';
    if (isAgentAudience) return 'Agent App';
    return null;
  };

  const handleAudienceToggle = (type: 'customer' | 'agent') => {
    let nextCustomer = isCustomerAudience;
    let nextAgent = isAgentAudience;

    if (type === 'customer') {
      nextCustomer = !isCustomerAudience;
      setIsCustomerAudience(nextCustomer);
    } else {
      nextAgent = !isAgentAudience;
      setIsAgentAudience(nextAgent);
    }

    if (!nextCustomer && !nextAgent) {
      setFormErrors((prev) => ({
        ...prev,
        audience: 'Audience requires at least one selection (Customer App or Agent App).',
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, audience: undefined }));
    }
  };

  const handleSaveClick = () => {
    const computedAudience = computeAudienceString();
    if (!computedAudience) {
      setFormErrors((prev) => ({
        ...prev,
        audience: 'Audience requires at least one selection.',
      }));
      return;
    }

    if (formTxTypes.length === 0) {
      setFormErrors((prev) => ({
        ...prev,
        txTypes: 'At least one transaction type must be selected.',
      }));
      return;
    }

    // Build operational changes list
    const changes: PendingOperationalChange[] = [];

    if (formName.trim() !== service.name) {
      changes.push({
        field: 'Service Name',
        previousValue: service.name,
        newValue: formName.trim(),
      });
    }

    if (computedAudience !== service.audience) {
      changes.push({
        field: 'Audience',
        previousValue: service.audience,
        newValue: computedAudience,
      });
    }

    if (formAvailability !== service.availability) {
      changes.push({
        field: 'Availability',
        previousValue: service.availability,
        newValue: formAvailability,
      });
    }

    const prevTxSorted = [...service.transactionTypes].sort().join(', ');
    const nextTxSorted = [...formTxTypes].sort().join(', ');
    if (prevTxSorted !== nextTxSorted) {
      changes.push({
        field: 'Supported Transaction Types',
        previousValue: prevTxSorted,
        newValue: nextTxSorted,
      });
    }

    if (formScheduling !== service.scheduling) {
      changes.push({
        field: 'Scheduling Method',
        previousValue: service.scheduling,
        newValue: formScheduling,
      });
    }

    const currentCustomerConfirm =
      service.completionConfirmation?.some((c) => c.toLowerCase().includes('customer')) ?? false;
    const currentAgentConfirm =
      service.completionConfirmation?.some((c) => c.toLowerCase().includes('agent')) ?? false;

    if (requireCustomerConfirm !== currentCustomerConfirm) {
      changes.push({
        field: 'Customer Confirmation Requirement',
        previousValue: currentCustomerConfirm ? 'Required' : 'Not Required',
        newValue: requireCustomerConfirm ? 'Required' : 'Not Required',
      });
    }

    if (requireAgentConfirm !== currentAgentConfirm) {
      changes.push({
        field: 'Agent Confirmation Requirement',
        previousValue: currentAgentConfirm ? 'Required' : 'Not Required',
        newValue: requireAgentConfirm ? 'Required' : 'Not Required',
      });
    }

    if (changes.length === 0) {
      onCancelEdit();
      return;
    }

    const nextConfirmations: string[] = [];
    if (requireCustomerConfirm) nextConfirmations.push('Customer Confirmation Required');
    if (requireAgentConfirm) nextConfirmations.push('Agent Confirmation Required');

    const updatedRecord: ServiceModeRecord = {
      ...service,
      name: formName.trim(),
      audience: computedAudience,
      availability: formAvailability,
      transactionTypes: formTxTypes,
      scheduling: formScheduling,
      completionConfirmation: nextConfirmations.length > 0 ? nextConfirmations : undefined,
      reservationCharge: hasDynamicFee ? 'Dynamic' : 'Not Applicable',
      hasReservationFee: hasDynamicFee,
    };

    onRequestSave(updatedRecord, changes);
  };

  const isCustomerRequired =
    service.completionConfirmation?.some((c) => c.toLowerCase().includes('customer')) ?? false;
  const isAgentRequired =
    service.completionConfirmation?.some((c) => c.toLowerCase().includes('agent')) ?? false;

  return (
    <div
      id="service-configuration-section"
      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Operational Parameters & Rules
          </h3>
          <p className="text-xs text-slate-500">
            Platform dispatch configurations, audiences, and confirmation protocols
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            id="btn-edit-parameters"
            onClick={onStartEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0a7587] hover:bg-slate-100 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <span>Edit Parameters</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-edit-parameters"
              onClick={onCancelEdit}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              id="btn-save-parameters"
              onClick={handleSaveClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* View Mode Layout */}
      {!isEditing ? (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6">
            {/* 1. Service Name */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Service Name
              </span>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                {service.name}
              </p>
            </div>

            {/* 2. Locked Service ID */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Locked Service ID
              </span>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold">
                <Lock className="w-3 h-3 text-slate-500" aria-hidden="true" />
                <span>{service.id}</span>
                <span className="ml-1 text-[10px] text-slate-400 font-sans font-normal">
                  (System Record)
                </span>
              </div>
            </div>

            {/* 3. Audience */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Audience
              </span>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>
                  {service.audience === 'Customer and Agent'
                    ? 'Customer and Agent'
                    : service.audience}
                </span>
              </p>
            </div>

            {/* 4. Availability */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Availability
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
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
                {service.displayLabel && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 rounded">
                    {service.displayLabel}
                  </span>
                )}
              </div>
            </div>

            {/* 5. Scheduling Method */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Scheduling Method
              </span>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{service.scheduling}</span>
              </p>
            </div>

            {/* 6. Reservation Fee */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Reservation Fee Model
              </span>
              <div className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-900">
                  {hasDynamicFee ? 'Dynamic Fee Active' : 'Not Applicable'}
                </span>
                {hasDynamicFee && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    (1.2% + ZMW 0.10/min + ZMW 20)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            {/* 7. Supported Transaction Types */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Supported Transaction Types
              </span>
              <div className="flex flex-wrap gap-2">
                {service.transactionTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* 8. Confirmation Requirements */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Completion Confirmation Requirements
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isCustomerRequired ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Customer Confirmation Requirement
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">
                      {isCustomerRequired
                        ? 'Customer must confirm the transaction is completed.'
                        : 'Not Required'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isAgentRequired ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Agent Confirmation Requirement
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">
                      {isAgentRequired
                        ? 'Agent must confirm the transaction is completed.'
                        : 'Not Required'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                The transaction should be marked completed only after both confirmations have been received.
              </p>
            </div>

            {/* 9. Last Updated */}
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>
                Last Updated: <strong className="font-semibold text-slate-700">{service.lastUpdated}</strong> by{' '}
                <strong className="font-semibold text-slate-700">Sililo Lubinda (Super Admin)</strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode Layout */
        <div className="p-4 sm:p-6 space-y-6">
          <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs text-[#0D93AA]">
            <span>
              <strong>Editing Operational Mode:</strong> Update service parameters below and click Save Changes to review differences before applying.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Service Name */}
            <div>
              <label
                htmlFor="input-service-name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Service Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-service-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Locked Service ID */}
            <div>
              <label
                htmlFor="input-locked-id"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Service ID (Locked)
              </label>
              <div className="relative">
                <input
                  id="input-locked-id"
                  type="text"
                  value={service.id}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 pl-8 text-xs font-mono font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed select-none"
                />
                <Lock
                  className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
                  aria-hidden="true"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                System-defined immutable identifier. Cannot be modified.
              </span>
            </div>

            {/* Audience Multi-selection */}
            <div className="md:col-span-2">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Audience (Select at least one) <span className="text-rose-500">*</span>
              </span>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={isCustomerAudience}
                    onChange={() => handleAudienceToggle('customer')}
                    className="w-4 h-4 text-[#0D93AA] border-slate-300 rounded focus:ring-[#0D93AA]"
                  />
                  <span>Customer App (Customer Facing)</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={isAgentAudience}
                    onChange={() => handleAudienceToggle('agent')}
                    className="w-4 h-4 text-[#0D93AA] border-slate-300 rounded focus:ring-[#0D93AA]"
                  />
                  <span>Agent App (Agent Operational)</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Audience Setting:{' '}
                <strong className="text-slate-800">
                  {isCustomerAudience && isAgentAudience
                    ? 'Customer and Agent'
                    : isCustomerAudience
                    ? 'Customer App'
                    : isAgentAudience
                    ? 'Agent App'
                    : 'None'}
                </strong>
              </p>
              {formErrors.audience && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.audience}
                </p>
              )}
            </div>

            {/* Availability */}
            <div>
              <label
                htmlFor="select-availability"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Availability
              </label>
              {service.id === 'TB-SVC-CD-002' ? (
                <div>
                  <input
                    id="select-availability"
                    type="text"
                    value="Coming Soon (Phase 2 Locked)"
                    disabled
                    readOnly
                    className="w-full px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg cursor-not-allowed"
                  />
                  <span className="text-[11px] text-amber-700 mt-1 block">
                    Cash Delivery activation is locked until Phase 2 launch.
                  </span>
                </div>
              ) : (
                <select
                  id="select-availability"
                  value={formAvailability}
                  onChange={(e) => setFormAvailability(e.target.value as ServiceAvailability)}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-none transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              )}
            </div>

            {/* Scheduling Method */}
            <div>
              <label
                htmlFor="select-scheduling"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Scheduling Method
              </label>
              {service.id === 'TB-SVC-CD-002' ? (
                <div>
                  <input
                    id="select-scheduling"
                    type="text"
                    value="Unavailable (Locked for Phase 1)"
                    disabled
                    readOnly
                    className="w-full px-3 py-2 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Operational scheduling is unavailable in the current release phase.
                  </span>
                </div>
              ) : service.id === 'TB-SVC-CP-001' ? (
                <select
                  id="select-scheduling"
                  value={formScheduling}
                  onChange={(e) => setFormScheduling(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-none transition-all"
                >
                  <option value="Now or Later">Now or Later (Immediate pickup or advance reservation)</option>
                  <option value="Now">Now Only (Immediate pickup on dispatch)</option>
                  <option value="Later">Later Only (Advance scheduled reservation)</option>
                </select>
              ) : (
                <div>
                  <input
                    id="select-scheduling"
                    type="text"
                    value={formScheduling}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Walk-In & Liquidity modes only support Immediate on-demand clearing.
                  </span>
                </div>
              )}
            </div>

            {/* Reservation Fee Model (Formula Locked) */}
            <div className="md:col-span-2">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Reservation Fee Configuration
              </span>
              {hasDynamicFee ? (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span>Dynamic Reservation Fee Engine Active</span>
                  </div>
                  <p className="text-amber-800 font-mono text-[11px] mt-1 font-semibold">
                    Formula: (1.2% × Reservation Amount) + (ZMW 0.10 × Minutes) + ZMW 20.00 Penalty Reserve
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Customer / Requester sees 100%, Fulfilling Agent sees 80%. Fixed ZMW 20.00 is held separately as penalty reserve.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <span>Not Applicable for {service.name}. Zero reservation fee is applied.</span>
                </div>
              )}
            </div>

            {/* Supported Transaction Types */}
            <div className="md:col-span-2">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Supported Transaction Types <span className="text-rose-500">*</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ALL_TRANSACTION_TYPES.map((type) => {
                  const isChecked = formTxTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#0D93AA]/10 border-[#0D93AA]/40 text-[#0D93AA]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTxType(type)}
                        className="w-4 h-4 text-[#0D93AA] border-slate-300 rounded focus:ring-[#0D93AA]"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
              {formErrors.txTypes && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.txTypes}
                </p>
              )}
            </div>

            {/* Completion Confirmation Requirements */}
            <div className="md:col-span-2 space-y-3 border-t border-slate-200 pt-4">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Completion Confirmation Requirements
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={requireCustomerConfirm}
                    onChange={(e) => setRequireCustomerConfirm(e.target.checked)}
                    className="w-4 h-4 text-[#0D93AA] border-slate-300 rounded focus:ring-[#0D93AA] mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Require Customer Confirmation
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Customer must tap confirm in their app upon receiving/handing over cash.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={requireAgentConfirm}
                    onChange={(e) => setRequireAgentConfirm(e.target.checked)}
                    className="w-4 h-4 text-[#0D93AA] border-slate-300 rounded focus:ring-[#0D93AA] mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Require Agent Confirmation
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Agent must confirm the transaction completion in their POS terminal or app.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
