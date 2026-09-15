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
} from 'lucide-react';
import {
  ServiceModeRecord,
  ServiceAudience,
  ServiceTransactionType,
  ServiceAvailability,
} from '../../types/serviceMode';
import { PendingOperationalChange } from './ConfirmOperationalChangesModal';

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
  
  // Numeric reservation charge parsing for Cash Pickup
  const parseReservationAmount = (val: string) => {
    const matched = val.match(/[\d.]+/);
    return matched ? matched[0] : '50.00';
  };
  const [reservationAmount, setReservationAmount] = useState(
    parseReservationAmount(service.reservationCharge)
  );

  const [formErrors, setFormErrors] = useState<{ audience?: string; txTypes?: string }>({});

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
    setReservationAmount(parseReservationAmount(service.reservationCharge));
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

    // Build completion confirmations
    const newConfirmations: string[] = [];
    if (requireCustomerConfirm) newConfirmations.push('Customer Confirmation Required');
    if (requireAgentConfirm) newConfirmations.push('Agent Confirmation Required');

    // Build reservation charge
    const newReservationCharge =
      service.id === 'TB-SVC-CP-001'
        ? `ZMW ${parseFloat(reservationAmount || '0').toFixed(2)}`
        : 'Not Applicable';

    const updatedRecord: ServiceModeRecord = {
      ...service,
      name: formName.trim(),
      audience: computedAudience,
      availability: service.id === 'TB-SVC-CD-002' ? 'Coming Soon' : formAvailability,
      transactionTypes: formTxTypes,
      scheduling: service.id === 'TB-SVC-CD-002' ? 'Unavailable' : formScheduling,
      completionConfirmation: newConfirmations,
      reservationCharge: newReservationCharge,
    };

    // Calculate changes list
    const changes: PendingOperationalChange[] = [];

    if (service.name !== updatedRecord.name) {
      changes.push({
        field: 'Service Name Updated',
        previousValue: service.name,
        newValue: updatedRecord.name,
      });
    }

    if (service.audience !== updatedRecord.audience) {
      changes.push({
        field: 'Audience Updated',
        previousValue: service.audience === 'Customer and Agent' ? 'Customer and Agent' : service.audience,
        newValue: updatedRecord.audience === 'Customer and Agent' ? 'Customer and Agent' : updatedRecord.audience,
      });
    }

    if (service.availability !== updatedRecord.availability) {
      changes.push({
        field: updatedRecord.availability === 'Active' ? 'Service Mode Activated' : 'Service Mode Deactivated',
        previousValue: service.availability,
        newValue: updatedRecord.availability,
      });
    }

    const prevTxSorted = [...service.transactionTypes].sort().join(', ');
    const newTxSorted = [...updatedRecord.transactionTypes].sort().join(', ');
    if (prevTxSorted !== newTxSorted) {
      changes.push({
        field: 'Transaction Type Enabled or Disabled',
        previousValue: prevTxSorted,
        newValue: newTxSorted,
      });
    }

    if (service.scheduling !== updatedRecord.scheduling) {
      changes.push({
        field: 'Scheduling Method Updated',
        previousValue: service.scheduling,
        newValue: updatedRecord.scheduling,
      });
    }

    const prevConf = (service.completionConfirmation || []).join(', ') || 'None';
    const newConf = newConfirmations.join(', ') || 'None';
    if (prevConf !== newConf) {
      changes.push({
        field: 'Confirmation Requirement Updated',
        previousValue: prevConf,
        newValue: newConf,
      });
    }

    if (service.reservationCharge !== updatedRecord.reservationCharge) {
      changes.push({
        field: 'Reservation Charge Updated',
        previousValue: service.reservationCharge,
        newValue: updatedRecord.reservationCharge,
      });
    }

    onRequestSave(updatedRecord, changes);
  };

  const isCustomerRequired =
    service.completionConfirmation?.some((c) => c.toLowerCase().includes('customer')) ?? false;
  const isAgentRequired =
    service.completionConfirmation?.some((c) => c.toLowerCase().includes('agent')) ?? false;

  return (
    <section
      id="section-service-configuration"
      aria-labelledby="heading-service-configuration"
      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-[#0D93AA]">
            <Layers className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3
              id="heading-service-configuration"
              className="text-sm sm:text-base font-bold text-slate-900 tracking-tight"
            >
              Service Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Core operational routing parameters, verification rules, and financial constraints.
            </p>
          </div>
        </div>
      </div>

      {/* Cash Delivery Phase 1 Notice if applicable */}
      {service.id === 'TB-SVC-CD-002' && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold">Release Phase Notice:</span> Cash Delivery is scheduled
            for Phase 2 rollout and is locked against activation and operational scheduling in the
            current release phase.
          </div>
        </div>
      )}

      {/* View Mode Layout */}
      {!isEditing ? (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Attributes Grid */}
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

            {/* 6. Reservation Charge */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Reservation Charge Status & Amount
              </span>
              <div className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-900">
                  {service.reservationCharge}
                </span>
                {service.id === 'TB-SVC-CP-001' && (
                  <span className="text-[11px] text-slate-500 font-normal">
                    (Customer-facing reservation fee)
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
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-hidden transition-all"
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
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-hidden transition-all"
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
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-hidden transition-all"
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

            {/* Reservation Charge */}
            <div className="md:col-span-2">
              <label
                htmlFor="input-reservation-charge"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Reservation Charge
              </label>
              {service.id === 'TB-SVC-CP-001' ? (
                <div className="max-w-xs">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono font-semibold text-slate-500">
                      ZMW
                    </span>
                    <input
                      id="input-reservation-charge"
                      type="number"
                      step="5"
                      min="0"
                      max="1000"
                      value={reservationAmount}
                      onChange={(e) => setReservationAmount(e.target.value)}
                      className="w-full pl-13 pr-3 py-2 text-xs font-mono font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-hidden transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Customer-facing reservation fee. Applies only to Cash Pickup.
                  </span>
                </div>
              ) : (
                <div>
                  <input
                    id="input-reservation-charge"
                    type="text"
                    value="Not Applicable"
                    disabled
                    readOnly
                    className="max-w-xs w-full px-3 py-2 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Reservation charge is only applicable to Cash Pickup service mode.
                  </span>
                </div>
              )}
            </div>

            {/* Supported Transaction Types */}
            <div className="md:col-span-2">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Supported Transaction Types (Multi-select) <span className="text-rose-500">*</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {ALL_TRANSACTION_TYPES.map((type) => {
                  const isSelected = formTxTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#0D93AA]/10 text-[#096e80] border-[#0D93AA]/30'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
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

            {/* Confirmation Protocols */}
            <div className="md:col-span-2 space-y-3 pt-2 border-t border-slate-100">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Completion Confirmation Requirements
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={requireCustomerConfirm}
                    onChange={(e) => setRequireCustomerConfirm(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#0D93AA] border-slate-300 rounded focus:ring-[#0D93AA]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Customer Confirmation Requirement
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">
                      Customer must confirm the transaction is completed.
                    </span>
                  </div>
                </label>

                <label className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={requireAgentConfirm}
                    onChange={(e) => setRequireAgentConfirm(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#0D93AA] border-slate-300 rounded focus:ring-[#0D93AA]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Agent Confirmation Requirement
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">
                      Agent must confirm the transaction is completed.
                    </span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-slate-500 italic">
                The transaction should be marked completed only after both confirmations have been received.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              id="btn-save-service-mode"
              onClick={handleSaveClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0a7587] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
