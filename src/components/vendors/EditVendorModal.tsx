import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertCircle,
  Lock,
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  VendorDetailData,
  SupportedService,
  VendorType,
  ServiceEligibilityItem,
} from '../../types/vendor';

interface EditVendorModalProps {
  isOpen: boolean;
  vendor: VendorDetailData;
  onClose: () => void;
  onSave: (
    updatedFields: Partial<VendorDetailData>,
    changeNotes: Array<{ event: string; previousValue: string; newValue: string }>
  ) => void;
}

const ALL_POSSIBLE_SERVICES: Array<{
  name: SupportedService;
  description: string;
  defaultBankingOnly?: boolean;
}> = [
  {
    name: 'Cash Pickup',
    description: 'Real-time over-the-counter cash reservation and collection at agent locations',
  },
  {
    name: 'Wallet Funding',
    description: 'Direct customer wallet loading from mobile money or bank accounts',
  },
  {
    name: 'Customer Withdrawal',
    description: 'Disbursement from customer wallet directly into provider account',
  },
  {
    name: 'Walk-In Transaction',
    description: 'Direct teller and counter deposits at physical agent branch locations',
    defaultBankingOnly: true,
  },
  {
    name: 'Agent-to-Agent Liquidity',
    description: 'Inter-agent float rebalancing and cash management routing',
  },
];

export const EditVendorModal: React.FC<EditVendorModalProps> = ({
  isOpen,
  vendor,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(vendor.name);
  const [type, setType] = useState<VendorType>(vendor.type);
  const [country, setCountry] = useState(vendor.country || 'Zambia');
  const [currency, setCurrency] = useState(vendor.currency || 'ZMW');
  const [integrationMode, setIntegrationMode] = useState(vendor.integrationMode);
  const [minAmount, setMinAmount] = useState(vendor.minTransactionAmount);
  const [maxAmount, setMaxAmount] = useState(vendor.maxTransactionAmount);
  const [settlementMethod, setSettlementMethod] = useState(vendor.settlementMethod);
  const [reconciliationEnabled, setReconciliationEnabled] = useState(
    vendor.reconciliationEnabled ?? true
  );
  const [callbackVerification, setCallbackVerification] = useState(
    vendor.automaticCallbackVerification ?? true
  );

  // Supported services selection
  const [selectedServices, setSelectedServices] = useState<SupportedService[]>(vendor.services);

  // Warning dialog for disabling a service with active transactions
  const [pendingDisableService, setPendingDisableService] = useState<SupportedService | null>(null);

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(vendor.name);
      setType(vendor.type);
      setCountry(vendor.country || 'Zambia');
      setCurrency(vendor.currency || 'ZMW');
      setIntegrationMode(vendor.integrationMode);
      setMinAmount(vendor.minTransactionAmount);
      setMaxAmount(vendor.maxTransactionAmount);
      setSettlementMethod(vendor.settlementMethod);
      setReconciliationEnabled(vendor.reconciliationEnabled ?? true);
      setCallbackVerification(vendor.automaticCallbackVerification ?? true);
      setSelectedServices(vendor.services);
      setErrorMessage('');
      setPendingDisableService(null);
    }
  }, [isOpen, vendor]);

  if (!isOpen) return null;

  // Check if a service has active/pending transactions
  const checkServiceHasActiveTransactions = (service: SupportedService): boolean => {
    // If vendor has historical transactions and the service is currently enabled in vendor.services
    if (vendor.services.includes(service) && (vendor.historicalTransactionsCount > 0 || (vendor.recentActivities && vendor.recentActivities.length > 0))) {
      return true;
    }
    return false;
  };

  const handleToggleService = (service: SupportedService) => {
    const isCurrentlySelected = selectedServices.includes(service);

    if (isCurrentlySelected) {
      // Trying to disable service: check if active transactions exist
      if (checkServiceHasActiveTransactions(service)) {
        setPendingDisableService(service);
        return;
      }
      setSelectedServices((prev) => prev.filter((s) => s !== service));
    } else {
      // Enabling service
      setSelectedServices((prev) => [...prev, service]);
    }
  };

  const confirmDisableService = () => {
    if (pendingDisableService) {
      setSelectedServices((prev) => prev.filter((s) => s !== pendingDisableService));
      setPendingDisableService(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Vendor Name cannot be empty.');
      return;
    }
    if (minAmount < 0 || maxAmount <= 0 || minAmount > maxAmount) {
      setErrorMessage('Please specify valid transaction minimum and maximum limits (Max must be >= Min).');
      return;
    }
    if (selectedServices.length === 0) {
      setErrorMessage('At least one supported service must be selected.');
      return;
    }

    // Build granular change notes for audit log
    const changeNotes: Array<{ event: string; previousValue: string; newValue: string }> = [];

    // 1. General vendor information changes
    const infoChanges: string[] = [];
    if (name !== vendor.name) infoChanges.push(`Name: ${vendor.name} → ${name}`);
    if (type !== vendor.type) infoChanges.push(`Type: ${vendor.type} → ${type}`);
    if (country !== vendor.country) infoChanges.push(`Country: ${vendor.country} → ${country}`);
    if (currency !== vendor.currency) infoChanges.push(`Currency: ${vendor.currency} → ${currency}`);
    if (integrationMode !== vendor.integrationMode)
      infoChanges.push(`Mode: ${vendor.integrationMode} → ${integrationMode}`);
    if (minAmount !== vendor.minTransactionAmount)
      infoChanges.push(`Min: ZMW ${vendor.minTransactionAmount} → ZMW ${minAmount}`);
    if (maxAmount !== vendor.maxTransactionAmount)
      infoChanges.push(`Max: ZMW ${vendor.maxTransactionAmount} → ZMW ${maxAmount}`);
    if (settlementMethod !== vendor.settlementMethod)
      infoChanges.push(`Settlement: ${settlementMethod}`);
    if (reconciliationEnabled !== vendor.reconciliationEnabled)
      infoChanges.push(`Reconciliation: ${reconciliationEnabled ? 'Enabled' : 'Disabled'}`);
    if (callbackVerification !== vendor.automaticCallbackVerification)
      infoChanges.push(`Callback Verification: ${callbackVerification ? 'Enabled' : 'Disabled'}`);

    if (infoChanges.length > 0) {
      changeNotes.push({
        event: 'Vendor information changes',
        previousValue: `Mode: ${vendor.integrationMode} | Min: ZMW ${vendor.minTransactionAmount} | Max: ZMW ${vendor.maxTransactionAmount}`,
        newValue: infoChanges.join(' | '),
      });
    }

    // 2. Services enabled
    const enabledServices = selectedServices.filter((s) => !vendor.services.includes(s));
    if (enabledServices.length > 0) {
      enabledServices.forEach((srv) => {
        changeNotes.push({
          event: 'Services enabled',
          previousValue: `Disabled: ${srv}`,
          newValue: `Enabled: ${srv}`,
        });
      });
    }

    // 3. Services disabled
    const disabledServices = vendor.services.filter((s) => !selectedServices.includes(s));
    if (disabledServices.length > 0) {
      disabledServices.forEach((srv) => {
        changeNotes.push({
          event: 'Services disabled',
          previousValue: `Enabled: ${srv}`,
          newValue: `Disabled: ${srv}`,
        });
      });
    }

    // Prepare updated service eligibilities
    const updatedServiceEligibilities: ServiceEligibilityItem[] = ALL_POSSIBLE_SERVICES.map((s) => {
      const isSelected = selectedServices.includes(s.name);
      return {
        name: s.name,
        enabled: isSelected,
        notes: isSelected
          ? `Channel active and configured for ${name}`
          : 'Service routing currently disabled for this provider',
      };
    });

    onSave(
      {
        name,
        type,
        country,
        currency,
        integrationMode,
        minTransactionAmount: minAmount,
        maxTransactionAmount: maxAmount,
        settlementMethod,
        reconciliationEnabled,
        automaticCallbackVerification: callbackVerification,
        services: selectedServices,
        serviceEligibilities: updatedServiceEligibilities,
      },
      changeNotes
    );
    onClose();
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-vendor-modal-title"
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      >
        <div className="relative bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
            <div>
              <h3 id="edit-vendor-modal-title" className="text-lg font-bold text-slate-900">
                Edit Vendor Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update operational attributes, governance limits, and supported services for {vendor.name}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close edit dialog"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Error banner */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium shrink-0">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Scrollable Form Body */}
          <form id="edit-vendor-form" onSubmit={handleSubmit} className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1">
            {/* Section 1: Identification */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Vendor Identification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Vendor Name */}
                <div>
                  <label htmlFor="edit-vendor-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Vendor Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="edit-vendor-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
                    required
                  />
                </div>

                {/* Vendor ID (Immutable) */}
                <div>
                  <label htmlFor="edit-vendor-id" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Vendor ID</span>
                    <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                      <Lock size={10} /> Immutable
                    </span>
                  </label>
                  <input
                    id="edit-vendor-id"
                    type="text"
                    value={vendor.id}
                    disabled
                    readOnly
                    title="Vendor ID cannot be modified after creation"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed select-all"
                  />
                </div>

                {/* Vendor Type */}
                <div>
                  <label htmlFor="edit-vendor-type" className="block text-xs font-semibold text-slate-700 mb-1">
                    Vendor Type
                  </label>
                  <select
                    id="edit-vendor-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as VendorType)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
                  >
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>

                {/* Country & Currency */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="edit-vendor-country" className="block text-xs font-semibold text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      id="edit-vendor-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-vendor-currency" className="block text-xs font-semibold text-slate-700 mb-1">
                      Currency
                    </label>
                    <input
                      id="edit-vendor-currency"
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Supported Services */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Supported Services
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select the service channels enabled for this vendor. Changes sync immediately with Vendor Eligibility.
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E6F6F8] text-[#0D93AA] border border-[#0D93AA]/20">
                  {selectedServices.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALL_POSSIBLE_SERVICES.map((srv) => {
                  const isChecked = selectedServices.includes(srv.name);
                  return (
                    <div
                      key={srv.name}
                      onClick={() => handleToggleService(srv.name)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                        isChecked
                          ? 'bg-[#0D93AA]/5 border-[#0D93AA]/40 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 text-[#0D93AA]">
                        {isChecked ? (
                          <CheckSquare size={18} className="text-[#0D93AA]" />
                        ) : (
                          <Square size={18} className="text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-semibold ${
                              isChecked ? 'text-slate-900' : 'text-slate-600'
                            }`}
                          >
                            {srv.name}
                          </span>
                          {srv.name === 'Walk-In Transaction' && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">
                              Bank Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                          {srv.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Integration & Limits */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Integration &amp; Limits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Integration Mode */}
                <div>
                  <label htmlFor="edit-integration-mode" className="block text-xs font-semibold text-slate-700 mb-1">
                    Integration Mode
                  </label>
                  <select
                    id="edit-integration-mode"
                    value={integrationMode}
                    onChange={(e) => setIntegrationMode(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
                  >
                    <option value="Direct REST API">Direct REST API</option>
                    <option value="Merchant REST API">Merchant REST API</option>
                    <option value="Bank Integration">Bank Integration</option>
                    <option value="Manual Settlement">Manual Settlement</option>
                  </select>
                </div>

                {/* Settlement Method */}
                <div>
                  <label htmlFor="edit-settlement-method" className="block text-xs font-semibold text-slate-700 mb-1">
                    Settlement Method
                  </label>
                  <select
                    id="edit-settlement-method"
                    value={settlementMethod}
                    onChange={(e) => setSettlementMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors cursor-pointer"
                  >
                    <option value="Real-Time Gross Settlement (RTGS)">
                      Real-Time Gross Settlement (RTGS)
                    </option>
                    <option value="Direct Mobile Network Settlement">
                      Direct Mobile Network Settlement
                    </option>
                    <option value="Net End-of-Day Batch (BoZ)">Net End-of-Day Batch (BoZ)</option>
                    <option value="Bi-Daily Escrow Batch Clearance">
                      Bi-Daily Escrow Batch Clearance
                    </option>
                  </select>
                </div>

                {/* Min Amount */}
                <div>
                  <label htmlFor="edit-min-amount" className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Transaction Amount (ZMW)
                  </label>
                  <input
                    id="edit-min-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
                    required
                  />
                </div>

                {/* Max Amount */}
                <div>
                  <label htmlFor="edit-max-amount" className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Transaction Amount (ZMW)
                  </label>
                  <input
                    id="edit-max-amount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Security & Automation Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Automation &amp; Security Controls
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Automated Reconciliation */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reconciliationEnabled}
                    onChange={(e) => setReconciliationEnabled(e.target.checked)}
                    className="mt-0.5 rounded text-[#0D93AA] focus:ring-[#0D93AA]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Automated Reconciliation
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Enable hourly automated ledger synchronization and dispute matching
                    </span>
                  </div>
                </label>

                {/* Callback Signature Verification */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={callbackVerification}
                    onChange={(e) => setCallbackVerification(e.target.checked)}
                    className="mt-0.5 rounded text-[#0D93AA] focus:ring-[#0D93AA]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Callback Signature Verification
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Enforce HMAC-SHA256 signature verification on inbound webhooks
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-vendor-form"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA] focus:ring-offset-1"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Warning Dialog when disabling service with active transactions */}
      {pendingDisableService && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Warning: Service Has Active Transactions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm service disablement
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
              <p className="leading-relaxed">
                The service <strong className="text-slate-900">{pendingDisableService}</strong> currently has active transaction routing and recorded customer operations under <strong className="text-slate-900">{vendor.name}</strong>.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                Disabling this service will immediately prevent new customer requests and reservations from routing through this vendor. Active requests may fail or require manual intervention.
              </div>
              <p>Are you sure you want to disable this service?</p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDisableService(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Keep Enabled
              </button>
              <button
                type="button"
                onClick={confirmDisableService}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Disable Service
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
