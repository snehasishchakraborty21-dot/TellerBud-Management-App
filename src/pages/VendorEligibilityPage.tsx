import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sliders, Save, X, CheckCircle } from 'lucide-react';
import {
  EligibilityFilters,
  MatrixEligibleService,
  SupportedService,
  EligibilityChangeLogEntry,
} from '../types/vendor';
import { useVendor } from '../context/VendorContext';
import { EligibilitySummaryCards } from '../components/vendorEligibility/EligibilitySummaryCards';
import { EligibilityFilterBar } from '../components/vendorEligibility/EligibilityFilterBar';
import { EligibilityMatrixTable } from '../components/vendorEligibility/EligibilityMatrixTable';
import {
  EligibilityConfirmModal,
  PendingEligibilityChange,
} from '../components/vendorEligibility/EligibilityConfirmModal';
import { EligibilityDiscardModal } from '../components/vendorEligibility/EligibilityDiscardModal';
import { RecentEligibilityChangesTable } from '../components/vendorEligibility/RecentEligibilityChangesTable';
import { EligibilityHistoryModal } from '../components/vendorEligibility/EligibilityHistoryModal';

const DEFAULT_FILTERS: EligibilityFilters = {
  search: '',
  type: 'All',
  status: 'All',
  service: 'All',
};

const MATRIX_SERVICES: MatrixEligibleService[] = [
  'Cash Pickup',
  'Wallet Funding',
  'Customer Withdrawal',
  'Walk-In Transaction',
];

// In-flight active requests mapping for impact analysis
const VENDOR_SERVICE_PENDING_REQUESTS: Record<string, Record<string, number>> = {
  'TB-VND-MTN-001': {
    'Cash Pickup': 8,
    'Wallet Funding': 4,
    'Customer Withdrawal': 2,
    'Walk-In Transaction': 0,
  },
  'TB-VND-ATL-002': {
    'Cash Pickup': 10,
    'Wallet Funding': 5,
    'Customer Withdrawal': 3,
    'Walk-In Transaction': 0,
  },
  'TB-VND-ZMT-003': {
    'Cash Pickup': 0,
    'Wallet Funding': 0,
    'Customer Withdrawal': 0,
    'Walk-In Transaction': 0,
  },
  'TB-VND-ZNC-004': {
    'Cash Pickup': 4,
    'Wallet Funding': 0,
    'Customer Withdrawal': 0,
    'Walk-In Transaction': 3,
  },
  'TB-VND-FNB-005': {
    'Cash Pickup': 3,
    'Wallet Funding': 0,
    'Customer Withdrawal': 0,
    'Walk-In Transaction': 2,
  },
  'TB-VND-IND-006': {
    'Cash Pickup': 2,
    'Wallet Funding': 0,
    'Customer Withdrawal': 0,
    'Walk-In Transaction': 2,
  },
  'TB-VND-STB-007': {
    'Cash Pickup': 4,
    'Wallet Funding': 0,
    'Customer Withdrawal': 0,
    'Walk-In Transaction': 2,
  },
  'TB-VND-ACS-008': {
    'Cash Pickup': 2,
    'Wallet Funding': 0,
    'Customer Withdrawal': 0,
    'Walk-In Transaction': 1,
  },
};

export const VendorEligibilityPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialVendorParam = searchParams.get('vendorId');

  const {
    vendors,
    eligibilityAuditLog,
    saveEligibilityBatch,
  } = useVendor();

  // Filters state
  const [filters, setFilters] = useState<EligibilityFilters>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftEligibilities, setDraftEligibilities] = useState<Record<string, SupportedService[]>>({});

  // Modals & Feedback
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Highlight vendor if passed via query param
  const [highlightVendorId, setHighlightVendorId] = useState<string | null>(initialVendorParam);

  useEffect(() => {
    if (initialVendorParam) {
      setHighlightVendorId(initialVendorParam);
      const timer = setTimeout(() => {
        setHighlightVendorId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [initialVendorParam]);

  // Sync draft state whenever entering edit mode
  useEffect(() => {
    if (isEditing) {
      const initialDraft: Record<string, SupportedService[]> = {};
      vendors.forEach((v) => {
        initialDraft[v.id] = [...v.services];
      });
      setDraftEligibilities(initialDraft);
    } else {
      setDraftEligibilities({});
    }
  }, [isEditing, vendors]);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Filtered vendors list
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = vendor.name.toLowerCase().includes(query);
        const matchesId = vendor.id.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return false;
      }

      // Vendor Type
      if (filters.type !== 'All' && vendor.type !== filters.type) {
        return false;
      }

      // Vendor Status
      if (filters.status !== 'All' && vendor.status !== filters.status) {
        return false;
      }

      // Service Filter (checks currently effective services)
      if (filters.service !== 'All') {
        const currentServices = isEditing
          ? draftEligibilities[vendor.id] ?? vendor.services
          : vendor.services;
        if (!currentServices.includes(filters.service)) {
          return false;
        }
      }

      return true;
    });
  }, [vendors, filters, isEditing, draftEligibilities]);

  // Toggle a service for an active vendor in draft state
  const handleToggleService = useCallback(
    (vendorId: string, service: MatrixEligibleService) => {
      const targetVendor = vendors.find((v) => v.id === vendorId);
      // Inactive vendor safeguard: cannot edit inactive vendor eligibility
      if (!targetVendor || targetVendor.status === 'Inactive') {
        return;
      }

      setDraftEligibilities((prev) => {
        const current = prev[vendorId] ?? targetVendor.services;
        const exists = current.includes(service);
        const updated = exists
          ? current.filter((s) => s !== service)
          : [...current, service];

        return {
          ...prev,
          [vendorId]: updated,
        };
      });
    },
    [vendors]
  );

  // Compute pending changes compared to original state
  const pendingChanges = useMemo<PendingEligibilityChange[]>(() => {
    if (!isEditing) return [];

    const changes: PendingEligibilityChange[] = [];

    vendors.forEach((vendor) => {
      const draft = draftEligibilities[vendor.id];
      if (!draft) return;

      MATRIX_SERVICES.forEach((service) => {
        const wasEnabled = vendor.services.includes(service);
        const isNowEnabled = draft.includes(service);

        if (wasEnabled !== isNowEnabled) {
          const pendingReqs =
            VENDOR_SERVICE_PENDING_REQUESTS[vendor.id]?.[service] ?? 0;

          changes.push({
            vendorId: vendor.id,
            vendorName: vendor.name,
            vendorLogo: vendor.logo,
            service,
            previousValue: wasEnabled ? 'Enabled' : 'Disabled',
            newValue: isNowEnabled ? 'Enabled' : 'Disabled',
            activeRequestsCount: pendingReqs,
          });
        }
      });
    });

    return changes;
  }, [isEditing, vendors, draftEligibilities]);

  const hasUnsavedChanges = pendingChanges.length > 0;

  // Safeguard check: Cannot disable the last active eligible vendor for a required service
  const { isSafeguardViolated, safeguardViolations } = useMemo(() => {
    if (!isEditing || !hasUnsavedChanges) {
      return { isSafeguardViolated: false, safeguardViolations: [] };
    }

    const violations: string[] = [];

    MATRIX_SERVICES.forEach((service) => {
      const remainingActiveCount = vendors.filter((v) => {
        if (v.status !== 'Active') return false;
        const vServices = draftEligibilities[v.id] ?? v.services;
        return vServices.includes(service);
      }).length;

      if (remainingActiveCount === 0) {
        violations.push(
          `Disabling this would leave 0 active vendors for "${service}". Transaction routing requires at least one active provider.`
        );
      }
    });

    return {
      isSafeguardViolated: violations.length > 0,
      safeguardViolations: violations,
    };
  }, [isEditing, hasUnsavedChanges, vendors, draftEligibilities]);

  // Cancel edit mode and revert draft changes
  const handleCancelEdit = useCallback(() => {
    setDraftEligibilities({});
    setIsEditing(false);
    setIsDiscardDialogOpen(false);
  }, []);

  // Cancel button click logic
  const handleCancelClick = useCallback(() => {
    if (pendingChanges.length === 0) {
      // Exit edit mode immediately
      handleCancelEdit();
    } else {
      // Display confirmation dialog
      setIsDiscardDialogOpen(true);
    }
  }, [pendingChanges.length, handleCancelEdit]);

  // Save changes handler
  const handleOpenSaveModal = useCallback(() => {
    if (!hasUnsavedChanges) return;
    setIsConfirmModalOpen(true);
  }, [hasUnsavedChanges]);

  const handleConfirmSave = useCallback(() => {
    if (isSafeguardViolated) return;

    // Group pending changes by vendor
    const updatesByVendor: Record<
      string,
      {
        vendorId: string;
        services: SupportedService[];
        changeNotes: Array<{ event: string; previousValue: string; newValue: string }>;
      }
    > = {};

    pendingChanges.forEach((change) => {
      if (!updatesByVendor[change.vendorId]) {
        updatesByVendor[change.vendorId] = {
          vendorId: change.vendorId,
          services: draftEligibilities[change.vendorId],
          changeNotes: [],
        };
      }

      updatesByVendor[change.vendorId].changeNotes.push({
        event: 'Vendor eligibility updated',
        previousValue: `${change.service}: ${change.previousValue}`,
        newValue: `${change.service}: ${change.newValue}`,
      });
    });

    // Build audit log entries with Sililo Lubinda as changedBy
    const nowTimeStr =
      'Today, ' +
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) +
      ' CAT';

    const auditEntries: EligibilityChangeLogEntry[] = pendingChanges.map((change, idx) => ({
      id: `ELIG-AUD-${Date.now()}-${idx}`,
      vendorId: change.vendorId,
      vendorName: change.vendorName,
      vendorLogo: change.vendorLogo,
      service: change.service,
      previousStatus: change.previousValue,
      newStatus: change.newValue,
      changedBy: 'Sililo Lubinda',
      dateTime: nowTimeStr,
    }));

    // Apply batch save to context
    saveEligibilityBatch(Object.values(updatesByVendor), auditEntries);

    // Close modal, exit edit mode, show success toast
    setIsConfirmModalOpen(false);
    setIsEditing(false);
    setDraftEligibilities({});
    setToastMessage('Vendor eligibility updated successfully.');
  }, [
    isSafeguardViolated,
    pendingChanges,
    draftEligibilities,
    saveEligibilityBatch,
  ]);

  // Filter actions
  const handleFilterChange = useCallback((updates: Partial<EligibilityFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage('Vendor eligibility status refreshed.');
    }, 400);
  }, []);

  return (
    <div
      id="vendor-eligibility-page-container"
      className="w-full flex flex-col gap-4 sm:gap-5 px-3 sm:px-6 pt-1 pb-6 min-h-0 h-auto"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Page Header: Second title removed; Edit Eligibility / Edit Action Bar in normal document flow */}
      {isEditing ? (
        /* Edit action bar: In normal document flow, no sticky/fixed/absolute positioning */
        <div
          id="edit-action-bar"
          className="w-full min-h-[56px] h-14 bg-white border border-slate-200/90 shadow-xs rounded-xl px-4 py-2 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0D93AA] animate-pulse" />
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Editing Eligibility
              </span>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                hasUnsavedChanges
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              Unsaved Changes: {pendingChanges.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-eligibility"
              type="button"
              onClick={handleCancelClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>Cancel</span>
            </button>

            <button
              id="btn-save-eligibility"
              type="button"
              disabled={!hasUnsavedChanges}
              onClick={handleOpenSaveModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] active:bg-[#09697a] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      ) : (
        /* Read-only: Edit Eligibility button at the top-right of page header (no duplicate title) */
        <div className="flex items-center justify-end py-0.5">
          <button
            id="btn-edit-eligibility"
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] active:bg-[#09697a] rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Enter editing mode to configure service eligibility"
          >
            <Sliders className="w-4 h-4" />
            <span>Edit Eligibility</span>
          </button>
        </div>
      )}

      {/* Five Compact Summary Cards: No descriptions beneath values; Customer Withdrawal wrapping */}
      <EligibilitySummaryCards vendors={vendors} />

      {/* Filter Row: Complete Clear Filters button, disabled when no filters, editing conflict prevention */}
      <EligibilityFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isEditing={isEditing}
      />

      {/* Main Full-Width Eligibility Table with Sticky Header */}
      <EligibilityMatrixTable
        vendors={filteredVendors}
        isEditing={isEditing}
        draftEligibilities={draftEligibilities}
        onToggleService={handleToggleService}
        highlightVendorId={highlightVendorId}
      />

      {/* Recent Eligibility Changes Compact Table (Latest 5) with Sililo Lubinda / Super Admin */}
      <RecentEligibilityChangesTable
        entries={eligibilityAuditLog}
        onViewFullHistory={() => setIsHistoryModalOpen(true)}
      />

      {/* Confirmation Dialog on Save */}
      <EligibilityConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        changes={pendingChanges}
        isSafeguardViolated={isSafeguardViolated}
        safeguardViolations={safeguardViolations}
      />

      {/* Discard Confirmation Dialog on Cancel with Unsaved Changes */}
      <EligibilityDiscardModal
        isOpen={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        onDiscard={handleCancelEdit}
        unsavedCount={pendingChanges.length}
      />

      {/* Full History Modal */}
      <EligibilityHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        entries={eligibilityAuditLog}
      />
    </div>
  );
};
