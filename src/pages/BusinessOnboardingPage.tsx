import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BusinessOnboardingApplication,
  BusinessOnboardingFilters,
  OnboardingApplicationStatus,
} from '../types/businessOnboarding';
import { businessOnboardingService } from '../services/businessOnboardingService';
import { BusinessOnboardingKPICards } from '../components/business-onboarding/BusinessOnboardingKPICards';
import { BusinessOnboardingFilterBar } from '../components/business-onboarding/BusinessOnboardingFilterBar';
import { BusinessOnboardingTable } from '../components/business-onboarding/BusinessOnboardingTable';
import { ApproveApplicationModal } from '../components/business-onboarding/ApproveApplicationModal';
import { AssignExecutiveModal } from '../components/business-onboarding/AssignExecutiveModal';
import { RequestMoreInfoModal } from '../components/business-onboarding/RequestMoreInfoModal';
import { RejectApplicationModal } from '../components/business-onboarding/RejectApplicationModal';
import { ActivateBusinessModal } from '../components/business-onboarding/ActivateBusinessModal';
import { ReturnForCorrectionModal } from '../components/business-onboarding/ReturnForCorrectionModal';
import { ActivationEmailPreviewModal } from '../components/business-onboarding/ActivationEmailPreviewModal';
import { WebsiteBusinessOwnerSignUpModal } from '../components/website/WebsiteBusinessOwnerSignUpModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DEFAULT_FILTERS: BusinessOnboardingFilters = {
  status: 'ALL',
  submittedFrom: '',
  submittedTo: '',
  search: '',
};

export const BusinessOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [applications, setApplications] = useState<BusinessOnboardingApplication[]>(() =>
    businessOnboardingService.getApplications()
  );
  const [filters, setFilters] = useState<BusinessOnboardingFilters>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Modals state
  const [selectedApp, setSelectedApp] = useState<BusinessOnboardingApplication | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [showWebsiteSignUpModal, setShowWebsiteSignUpModal] = useState(false);

  // Subscribe to real-time onboarding data changes
  useEffect(() => {
    const update = () => {
      setApplications(businessOnboardingService.getApplications());
    };
    const unsub = businessOnboardingService.subscribe(update);
    return () => unsub();
  }, []);

  const summary = useMemo(() => {
    return businessOnboardingService.getSummary();
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return businessOnboardingService.filterAndSortApplications(filters, 'desc');
  }, [applications, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'ALL' ||
      Boolean(filters.submittedFrom) ||
      Boolean(filters.submittedTo)
    );
  }, [filters]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter actions
  const handleFilterChange = useCallback(
    <K extends keyof BusinessOnboardingFilters>(key: K, value: BusinessOnboardingFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setApplications(businessOnboardingService.getApplications());
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Onboarding applications refreshed.', 'info');
    }, 400);
  }, []);

  // Card click filter
  const handleSelectStatus = (status: 'ALL' | OnboardingApplicationStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? 'ALL' : status,
    }));
  };

  // Navigation to full-width detail page
  const handleViewDetails = (app: BusinessOnboardingApplication) => {
    navigate(`/super-admin/people/business-onboarding/${app.id}`, {
      state: { from: location.pathname },
    });
  };

  // State actions
  const handleReviewApplication = (app: BusinessOnboardingApplication) => {
    setSelectedApp(app);
    setShowApproveModal(true);
  };

  const handleStartTabletOnboarding = (app: BusinessOnboardingApplication) => {
    // If not yet assigned, prompt assign modal first, otherwise navigate to tablet onboarding
    if (!app.executiveAssignment && app.status === 'Approved – Onboarding Pending') {
      setSelectedApp(app);
      setShowAssignModal(true);
    } else {
      navigate(`/super-admin/people/business-onboarding/${app.id}/tablet-onboarding`);
    }
  };

  const handleActivateApplication = (app: BusinessOnboardingApplication) => {
    setSelectedApp(app);
    setShowActivateModal(true);
  };

  // Modal Handlers
  const handleConfirmApprove = () => {
    if (!selectedApp) return;
    const res = businessOnboardingService.approveApplication(selectedApp.id);
    if (res.success) {
      setShowApproveModal(false);
      showToast(
        `Application approved. Generated Business ID ${res.businessId} & Owner ID ${res.businessOwnerId}. Ready for Executive assignment.`
      );
      // Open executive assignment immediately for convenience
      const updated = businessOnboardingService.getApplicationById(selectedApp.id);
      if (updated) {
        setSelectedApp(updated);
        setShowAssignModal(true);
      }
    }
  };

  const handleConfirmAssign = (data: {
    executiveId: string;
    executiveName: string;
    scheduledOnboardingDate: string;
    appointmentNotes?: string;
  }) => {
    if (!selectedApp) return;
    const res = businessOnboardingService.assignExecutive(selectedApp.id, data);
    if (res.success) {
      setShowAssignModal(false);
      showToast(`Assigned to ${data.executiveName}. Status is now Onboarding in Progress.`);
    }
  };

  const handleConfirmActivate = () => {
    if (!selectedApp) return;
    const res = businessOnboardingService.activateBusiness(selectedApp.id);
    if (res.success) {
      setShowActivateModal(false);
      showToast(`Business ${selectedApp.websiteData.businessName} is now ACTIVE. Activation email dispatched.`);
      const updated = businessOnboardingService.getApplicationById(selectedApp.id);
      if (updated) {
        setSelectedApp(updated);
        setShowEmailPreviewModal(true);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto pb-16 w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-700 animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 size={15} className="text-teal-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Top KPI Summary Section (Compact, equal width/height, 1 horizontal row) */}
      <section aria-label="Business Onboarding Metrics Summary">
        <BusinessOnboardingKPICards
          summary={summary}
          selectedStatus={filters.status}
          onSelectStatus={handleSelectStatus}
        />
      </section>

      {/* 2. Filter Bar Section (Single compact horizontal line) */}
      <section aria-label="Business Onboarding Filters">
        <BusinessOnboardingFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          isFiltered={hasActiveFilters}
          isRefreshing={isRefreshing}
          applicationsToExport={filteredApplications}
          onOpenWebsiteSignUp={() => setShowWebsiteSignUpModal(true)}
        />
      </section>

      {/* 3. Onboarding Table Section (8 standard columns with state-based actions) */}
      <section aria-label="Business Onboarding Table">
        <BusinessOnboardingTable
          applications={filteredApplications}
          onViewDetails={handleViewDetails}
          onReviewApplication={handleReviewApplication}
          onStartTabletOnboarding={handleStartTabletOnboarding}
          onActivateApplication={handleActivateApplication}
          onResetFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </section>

      {/* Action Modals */}
      {selectedApp && (
        <>
          <ApproveApplicationModal
            application={selectedApp}
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={handleConfirmApprove}
          />
          <AssignExecutiveModal
            application={selectedApp}
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            onAssign={handleConfirmAssign}
          />
          <ActivateBusinessModal
            application={selectedApp}
            isOpen={showActivateModal}
            onClose={() => setShowActivateModal(false)}
            onConfirm={handleConfirmActivate}
          />
          <ActivationEmailPreviewModal
            application={selectedApp}
            isOpen={showEmailPreviewModal}
            onClose={() => setShowEmailPreviewModal(false)}
          />
        </>
      )}

      {/* Website Registration Modal */}
      <WebsiteBusinessOwnerSignUpModal
        isOpen={showWebsiteSignUpModal}
        onClose={() => setShowWebsiteSignUpModal(false)}
        onSuccess={(appId) => {
          showToast('New application submitted from Website and added to Onboarding list.');
        }}
      />
    </div>
  );
};
