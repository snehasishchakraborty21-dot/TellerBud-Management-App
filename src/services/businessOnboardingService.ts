import {
  BusinessOnboardingApplication,
  BusinessOnboardingFilters,
  BusinessOnboardingSummary,
  DigitalOnboardingDraft,
  ExecutiveAssignment,
  OnboardingApplicationStatus,
  WebsiteSubmissionData,
} from '../types/businessOnboarding';
import { INITIAL_MOCK_ONBOARDING_APPLICATIONS } from '../data/mockBusinessOnboardingData';
import { createTermsAcceptanceRecord, ACTIVE_TERMS_CONFIG } from '../data/termsAndConditionsData';
import { sequenceService } from './sequenceService';
import { businessService } from './businessService';
import { MOCK_BUSINESS_WALLETS } from '../data/mockBusinessWalletData';

const ONBOARDING_STORAGE_KEY = 'tellerbud_business_onboarding_apps_v5';

export interface AvailableExecutive {
  id: string; // TB-EMP-000000
  name: string;
  role: string;
  phone: string;
  region: string;
}

export const AVAILABLE_TELLERBUD_EXECUTIVES: AvailableExecutive[] = [
  {
    id: 'TB-EMP-000001',
    name: 'Grace Tembo',
    role: 'Senior Field Onboarding Executive',
    phone: '+260 97 711 0022',
    region: 'Lusaka & Central Province',
  },
  {
    id: 'TB-EMP-000002',
    name: 'John Phiri',
    role: 'Field Operations & Compliance Officer',
    phone: '+260 96 522 9911',
    region: 'Copperbelt & North-Western Province',
  },
  {
    id: 'TB-EMP-000003',
    name: 'Chanda Mulenga',
    role: 'Merchant Liquidity Field Executive',
    phone: '+260 95 433 8800',
    region: 'Southern & Western Province',
  },
  {
    id: 'TB-EMP-000004',
    name: 'Aliness Banda',
    role: 'Regional Agency Onboarding Specialist',
    phone: '+260 97 844 7733',
    region: 'Eastern & Northern Province',
  },
];

class BusinessOnboardingService {
  private applications: BusinessOnboardingApplication[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadApplications();
  }

  private loadApplications(): void {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        this.applications = JSON.parse(stored);
      } else {
        this.applications = [...INITIAL_MOCK_ONBOARDING_APPLICATIONS];
        this.saveApplications();
      }
    } catch (e) {
      console.error('Failed to load business onboarding applications:', e);
      this.applications = [...INITIAL_MOCK_ONBOARDING_APPLICATIONS];
    }
  }

  private saveApplications(): void {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(this.applications));
    } catch (e) {
      console.error('Failed to save business onboarding applications:', e);
    }
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l());
  }

  public getApplications(): BusinessOnboardingApplication[] {
    return [...this.applications].sort((a, b) => {
      const dateA = new Date(a.websiteData.submittedAt).getTime();
      const dateB = new Date(b.websiteData.submittedAt).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });
  }

  public getApplicationById(id: string): BusinessOnboardingApplication | undefined {
    return this.applications.find((app) => app.id === id);
  }

  public getSummary(): BusinessOnboardingSummary {
    const apps = this.applications;
    const pendingReview = apps.filter((a) => a.status === 'Pending Review' || a.status === 'Under Review').length;
    const approvedOnboardingPending = apps.filter((a) => a.status === 'Approved – Onboarding Pending').length;
    const onboardingInProgress = apps.filter((a) => a.status === 'Onboarding in Progress').length;
    const readyForActivation = apps.filter((a) => a.status === 'Submitted for Activation').length;
    const activated = apps.filter((a) => a.status === 'Active').length;
    const moreInfoRequired = apps.filter((a) => a.status === 'More Information Required').length;
    const rejected = apps.filter((a) => a.status === 'Rejected').length;
    const returnedForCorrection = apps.filter((a) => a.status === 'Returned for Correction').length;

    // Attention count for navigation badge: applications needing admin action
    const attentionCount = pendingReview + readyForActivation + returnedForCorrection;

    return {
      totalApplications: apps.length,
      pendingReview,
      approvedOnboardingPending,
      onboardingInProgress,
      readyForActivation,
      activated,
      moreInfoRequired,
      rejected,
      returnedForCorrection,
      attentionCount,
    };
  }

  /**
   * 1. Submit Website Business Owner Registration
   * Website form is the sole starting point.
   * Does NOT generate public IDs (TB-BIZ-000000, TB-BOO-000000) or active account.
   */
  public submitWebsiteApplication(data: WebsiteSubmissionData): {
    success: boolean;
    applicationId?: string;
    error?: string;
  } {
    // Validation
    if (!data.ownerFullName?.trim()) {
      return { success: false, error: 'Business Owner full name is required.' };
    }
    if (!data.businessName?.trim()) {
      return { success: false, error: 'Business name is required.' };
    }
    if (!data.phone?.trim()) {
      return { success: false, error: 'Phone number is required.' };
    }
    if (!data.operatingCities || data.operatingCities.length === 0) {
      return { success: false, error: 'Please select at least one operating city.' };
    }
    for (const city of data.operatingCities) {
      if (!data.cityLocations?.[city]?.trim()) {
        return { success: false, error: `Please provide the business location address for ${city}.` };
      }
    }
    if (!data.numberOfAgents || data.numberOfAgents < 1) {
      return { success: false, error: 'Number of agents must be at least 1.' };
    }
    if (!data.selectedProviders || data.selectedProviders.length === 0) {
      return { success: false, error: 'Please select at least one service provider.' };
    }

    const timestamp = new Date().toISOString();
    const internalId = `app_biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newApp: BusinessOnboardingApplication = {
      id: internalId,
      status: 'Pending Review',
      websiteData: {
        ...data,
        submittedAt: timestamp,
      },
      businessId: null,
      businessOwnerId: null,
      statusHistory: [
        {
          status: 'Pending Review',
          timestamp,
          changedBy: 'TellerBud Website Business Owner Sign Up Form',
          reason: 'Initial website application submitted',
        },
      ],
      auditLogs: [
        {
          id: `aud_${Date.now()}_1`,
          action: 'Website Application Submitted',
          previousStatus: 'None',
          newStatus: 'Pending Review',
          actorId: 'WEBSITE_VISITOR',
          actorName: data.ownerFullName,
          timestamp,
          notes: `Registration request for "${data.businessName}" submitted across ${data.operatingCities.join(', ')}.`,
        },
      ],
      documentAccessLogs: [],
    };

    this.applications.unshift(newApp);
    this.saveApplications();

    return {
      success: true,
      applicationId: internalId,
    };
  }

  /**
   * 2. Admin Action: Approve Application
   * Generates public IDs:
   * - Business ID: TB-BIZ-000000
   * - Business Owner ID: TB-BOO-000000
   * Sets status to "Approved – Onboarding Pending"
   * Keeps account inactive.
   */
  public approveApplication(
    appId: string,
    adminId = 'TB-ADM-000001',
    adminName = 'Super Administrator'
  ): { success: boolean; error?: string; businessId?: string; businessOwnerId?: string } {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) {
      return { success: false, error: 'Application not found.' };
    }

    if (app.status !== 'Pending Review' && app.status !== 'Under Review' && app.status !== 'More Information Required') {
      return { success: false, error: `Application is already in "${app.status}" state.` };
    }

    // Generate atomic approved IDs
    const businessId = sequenceService.nextBusinessId();
    const businessOwnerId = sequenceService.nextBusinessOwnerId();
    const timestamp = new Date().toISOString();

    const prevStatus = app.status;
    app.status = 'Approved – Onboarding Pending';
    app.businessId = businessId;
    app.businessOwnerId = businessOwnerId;
    app.approvedAt = timestamp;
    app.approvedByAdminId = adminId;

    app.statusHistory.push({
      status: 'Approved – Onboarding Pending',
      timestamp,
      changedBy: `${adminId} (${adminName})`,
      reason: 'Application approved by Admin. Pending IDs assigned for physical onboarding.',
    });

    app.auditLogs.push({
      id: `aud_${Date.now()}_appr`,
      action: 'Application Approved & Pending IDs Generated',
      previousStatus: prevStatus,
      newStatus: 'Approved – Onboarding Pending',
      actorId: adminId,
      actorName: adminName,
      timestamp,
      notes: `Approved. Generated Business ID: ${businessId}, Business Owner ID: ${businessOwnerId}. Ready for Executive assignment.`,
    });

    // Initialize digital onboarding draft step 1 with prefilled data
    if (!app.digitalOnboarding) {
      app.digitalOnboarding = {
        currentStep: 1,
        lastSavedAt: timestamp,
        fieldCorrections: [],
        legalBusinessName: app.websiteData.businessName,
        tradingName: app.websiteData.businessName,
        pacraRegistrationNumber: '',
        businessRegistrationDate: '',
        businessType: 'Private Limited Company (PLC)',
        primaryBusinessAddress: app.websiteData.cityLocations[app.websiteData.operatingCities[0]] || '',
        operatingCities: [...app.websiteData.operatingCities],
        cityLocations: { ...app.websiteData.cityLocations },
        numberOfAgents: app.websiteData.numberOfAgents,
        selectedProviders: [...app.websiteData.selectedProviders],
        businessContactPhone: app.websiteData.phone,
        businessEmailAddress: app.websiteData.email || '',
        ownerFullLegalName: app.websiteData.ownerFullName,
        ownerNrcNumber: '',
        ownerDateOfBirth: '',
        ownerResidentialAddress: '',
        ownerPhone: app.websiteData.phone,
        ownerEmail: app.websiteData.email || '',
        ownerPosition: 'Business Owner / Director',
        proposedStoresCount: app.websiteData.operatingCities.length,
        proposedBoothsCount: app.websiteData.numberOfAgents,
        confirmedAccuracy: false,
        acceptedOnboardingTerms: false,
      };
    }

    this.saveApplications();

    return {
      success: true,
      businessId,
      businessOwnerId,
    };
  }

  /**
   * 3. Admin Action: Request More Information
   */
  public requestMoreInformation(
    appId: string,
    reason: string,
    adminId = 'TB-ADM-000001',
    adminName = 'Super Administrator'
  ): { success: boolean; error?: string } {
    if (!reason?.trim()) {
      return { success: false, error: 'Please enter the information request reason.' };
    }
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    const prevStatus = app.status;
    const timestamp = new Date().toISOString();

    app.status = 'More Information Required';
    app.moreInfoRequestReason = reason.trim();
    app.statusHistory.push({
      status: 'More Information Required',
      timestamp,
      changedBy: `${adminId} (${adminName})`,
      reason: reason.trim(),
    });

    app.auditLogs.push({
      id: `aud_${Date.now()}_more_info`,
      action: 'More Information Requested',
      previousStatus: prevStatus,
      newStatus: 'More Information Required',
      actorId: adminId,
      actorName: adminName,
      timestamp,
      notes: reason.trim(),
    });

    this.saveApplications();
    return { success: true };
  }

  /**
   * 4. Admin Action: Reject Application
   */
  public rejectApplication(
    appId: string,
    reason: string,
    adminId = 'TB-ADM-000001',
    adminName = 'Super Administrator'
  ): { success: boolean; error?: string } {
    if (!reason?.trim()) {
      return { success: false, error: 'Please enter the rejection reason.' };
    }
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    const prevStatus = app.status;
    const timestamp = new Date().toISOString();

    app.status = 'Rejected';
    app.rejectionReason = reason.trim();
    app.statusHistory.push({
      status: 'Rejected',
      timestamp,
      changedBy: `${adminId} (${adminName})`,
      reason: reason.trim(),
    });

    app.auditLogs.push({
      id: `aud_${Date.now()}_rej`,
      action: 'Application Rejected',
      previousStatus: prevStatus,
      newStatus: 'Rejected',
      actorId: adminId,
      actorName: adminName,
      timestamp,
      notes: reason.trim(),
    });

    this.saveApplications();
    return { success: true };
  }

  /**
   * 5. Admin Action: Assign TellerBud Executive
   */
  public assignExecutive(
    appId: string,
    assignment: {
      executiveId: string;
      executiveName: string;
      scheduledOnboardingDate: string;
      appointmentNotes?: string;
    },
    adminId = 'TB-ADM-000001',
    adminName = 'Super Administrator'
  ): { success: boolean; error?: string } {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    const prevStatus = app.status;
    const timestamp = new Date().toISOString();

    const execAssignment: ExecutiveAssignment = {
      executiveId: assignment.executiveId,
      executiveName: assignment.executiveName,
      assignedAt: timestamp,
      scheduledOnboardingDate: assignment.scheduledOnboardingDate,
      appointmentNotes: assignment.appointmentNotes,
      status: 'Scheduled',
    };

    app.executiveAssignment = execAssignment;
    app.status = 'Onboarding in Progress';

    app.statusHistory.push({
      status: 'Onboarding in Progress',
      timestamp,
      changedBy: `${adminId} (${adminName})`,
      reason: `Assigned to Executive ${assignment.executiveName} (${assignment.executiveId}). Scheduled: ${assignment.scheduledOnboardingDate}.`,
    });

    app.auditLogs.push({
      id: `aud_${Date.now()}_exec_assign`,
      action: 'Executive Assigned',
      previousStatus: prevStatus,
      newStatus: 'Onboarding in Progress',
      actorId: adminId,
      actorName: adminName,
      timestamp,
      notes: `Assigned to ${assignment.executiveName} (${assignment.executiveId}) for physical tablet onboarding on ${assignment.scheduledOnboardingDate}.`,
    });

    this.saveApplications();
    return { success: true };
  }

  /**
   * 6. Executive Action: Save Tablet Draft
   */
  public saveOnboardingDraft(
    appId: string,
    draftData: Partial<DigitalOnboardingDraft>,
    executiveId = 'TB-EMP-000001',
    executiveName = 'TellerBud Executive'
  ): { success: boolean; error?: string } {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    const timestamp = new Date().toISOString();

    app.digitalOnboarding = {
      ...(app.digitalOnboarding || ({} as DigitalOnboardingDraft)),
      ...draftData,
      lastSavedAt: timestamp,
    } as DigitalOnboardingDraft;

    app.auditLogs.push({
      id: `aud_${Date.now()}_draft`,
      action: `Digital Onboarding Draft Step ${draftData.currentStep || app.digitalOnboarding.currentStep} Saved`,
      previousStatus: app.status,
      newStatus: app.status,
      actorId: executiveId,
      actorName: executiveName,
      timestamp,
      notes: 'Tablet draft auto-saved.',
    });

    this.saveApplications();
    return { success: true };
  }

  /**
   * 7. Executive Action: Submit Completed Onboarding for Activation
   */
  public submitOnboardingForActivation(
    appId: string,
    completedDraft: DigitalOnboardingDraft,
    executiveId = 'TB-EMP-000001',
    executiveName = 'TellerBud Executive'
  ): { success: boolean; error?: string } {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    // Validation
    if (!completedDraft.ownerEmail?.trim()) {
      return { success: false, error: 'Mandatory Business Owner email is required before digital onboarding can be submitted.' };
    }
    if (!completedDraft.ownerNrcNumber?.trim()) {
      return { success: false, error: 'NRC Number is required (format: 123456/00/1).' };
    }
    if (!completedDraft.nrcFrontImage) {
      return { success: false, error: 'NRC Front image capture is required.' };
    }
    if (!completedDraft.nrcBackImage) {
      return { success: false, error: 'NRC Back image capture is required.' };
    }
    if (!completedDraft.ownerLivePhoto) {
      return { success: false, error: 'Business Owner live photograph capture is required.' };
    }
    if (!completedDraft.confirmedAccuracy || !completedDraft.acceptedOnboardingTerms) {
      return { success: false, error: 'Please confirm accuracy and accept onboarding terms.' };
    }
    if (!completedDraft.eSignatureData) {
      return { success: false, error: 'Handwritten e-signature on tablet is required.' };
    }

    const prevStatus = app.status;
    const timestamp = new Date().toISOString();

    const termsRecord =
      completedDraft.termsAcceptanceRecord ||
      createTermsAcceptanceRecord({
        ownerFullName: completedDraft.ownerFullLegalName || app.websiteData.ownerFullName,
        ownerId: app.businessOwnerId || 'TB-BOO-Pending',
        businessName: completedDraft.legalBusinessName || app.websiteData.businessName,
        businessId: app.businessId || 'TB-BIZ-Pending',
        onboardingReference: app.id,
        executiveId,
        executiveName,
        timestamp: completedDraft.termsAcceptedTimestamp || timestamp,
      });

    app.digitalOnboarding = {
      ...completedDraft,
      termsVersionAccepted: ACTIVE_TERMS_CONFIG.version,
      termsAcceptedTimestamp: completedDraft.termsAcceptedTimestamp || timestamp,
      termsAcceptanceRecord: termsRecord,
      lastSavedAt: timestamp,
      eSignatureTimestamp: timestamp,
      executiveSignatureConfirmed: true,
    };

    if (app.executiveAssignment) {
      app.executiveAssignment.status = 'Completed';
    }

    app.status = 'Submitted for Activation';

    app.statusHistory.push({
      status: 'Submitted for Activation',
      timestamp,
      changedBy: `${executiveId} (${executiveName})`,
      reason: 'Completed 8-step physical onboarding on tablet with Terms & Conditions acceptance (v1.0) and e-signature.',
    });

    app.auditLogs.push({
      id: `aud_${Date.now()}_submit_act`,
      action: 'Submitted for Activation',
      previousStatus: prevStatus,
      newStatus: 'Submitted for Activation',
      actorId: executiveId,
      actorName: executiveName,
      timestamp,
      notes: `Locked physical onboarding package and submitted for TellerBud Admin final activation review (Terms v1.0 accepted).`,
    });

    this.saveApplications();
    return { success: true };
  }

  /**
   * 8. Admin Action: Return for Correction
   */
  public returnForCorrection(
    appId: string,
    reason: string,
    adminId = 'TB-ADM-000001',
    adminName = 'Super Administrator'
  ): { success: boolean; error?: string } {
    if (!reason?.trim()) {
      return { success: false, error: 'Please enter the correction explanation.' };
    }
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    const prevStatus = app.status;
    const timestamp = new Date().toISOString();

    app.status = 'Returned for Correction';
    app.correctionNotes = reason.trim();
    app.returnedAt = timestamp;
    app.returnedByAdminId = adminId;

    if (app.executiveAssignment) {
      app.executiveAssignment.status = 'Pending Reschedule';
    }

    app.statusHistory.push({
      status: 'Returned for Correction',
      timestamp,
      changedBy: `${adminId} (${adminName})`,
      reason: reason.trim(),
    });

    app.auditLogs.push({
      id: `aud_${Date.now()}_returned`,
      action: 'Returned for Correction',
      previousStatus: prevStatus,
      newStatus: 'Returned for Correction',
      actorId: adminId,
      actorName: adminName,
      timestamp,
      notes: reason.trim(),
    });

    this.saveApplications();
    return { success: true };
  }

  /**
   * 9. Admin Action: Activate Business & Business Owner Account
   * - Sets Business to Active in All Businesses
   * - Sets Business Owner account to Active
   * - Generates single-use setup link
   * - Sends activation email
   * - Provisions Business Global Wallet
   */
  public activateBusiness(
    appId: string,
    adminId = 'TB-ADM-000001',
    adminName = 'Super Administrator'
  ): {
    success: boolean;
    error?: string;
    activationDetails?: {
      businessId: string;
      businessOwnerId: string;
      email: string;
      passcodeLink: string;
    };
  } {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    if (!app.businessId || !app.businessOwnerId) {
      return { success: false, error: 'Application is missing approved IDs.' };
    }

    const prevStatus = app.status;
    const timestamp = new Date().toISOString();
    const recipientEmail =
      app.digitalOnboarding?.ownerEmail || app.websiteData.email || 'business.owner@domain.zm';

    const token = `tb_act_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    const passcodeSetupLink = `https://tellerbud.com/portal/setup-passcode?token=${token}`;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h expiration

    app.status = 'Active';
    app.activatedAt = timestamp;
    app.activatedByAdminId = adminId;
    app.activationEmailSentAt = timestamp;
    app.activationEmailRecipient = recipientEmail;
    app.securePasscodeSetupLink = passcodeSetupLink;
    app.securePasscodeLinkExpiresAt = expiresAt;

    app.statusHistory.push({
      status: 'Active',
      timestamp,
      changedBy: `${adminId} (${adminName})`,
      reason: 'Final business activation completed by TellerBud Admin. Wallet provisioned and activation email dispatched.',
    });

    app.auditLogs.push(
      {
        id: `aud_${Date.now()}_act`,
        action: 'Business Account Activated',
        previousStatus: prevStatus,
        newStatus: 'Active',
        actorId: adminId,
        actorName: adminName,
        timestamp,
        notes: `Business account activated by Admin. Business ID: ${app.businessId}, Owner ID: ${app.businessOwnerId}.`,
      },
      {
        id: `aud_${Date.now()}_email`,
        action: 'Activation Email Dispatched',
        previousStatus: 'Active',
        newStatus: 'Active',
        actorId: 'SYSTEM',
        actorName: 'TellerBud Secure Mailer',
        timestamp,
        notes: `Single-use passcode setup link dispatched to ${recipientEmail}.`,
      }
    );

    // Synchronize with businessService so the business appears in All Businesses
    const businessName =
      app.digitalOnboarding?.tradingName || app.digitalOnboarding?.legalBusinessName || app.websiteData.businessName;
    const ownerName =
      app.digitalOnboarding?.ownerFullLegalName || app.websiteData.ownerFullName;
    const phone =
      app.digitalOnboarding?.ownerPhone || app.websiteData.phone;
    const province =
      app.websiteData.operatingCities[0] || 'Lusaka';

    const existingBiz = businessService.getBusinessById(app.businessId);
    if (!existingBiz) {
      businessService.addActivatedBusiness({
        id: app.businessId,
        businessId: app.businessId,
        name: businessName,
        ownerName: ownerName,
        ownerEmail: recipientEmail,
        ownerPhone: phone,
        ownerUsername: recipientEmail.split('@')[0],
        status: 'Active',
        walletState: 'Active',
        province: province,
        associatedAgents: app.digitalOnboarding?.numberOfAgents || app.websiteData.numberOfAgents || 5,
        sharedWalletBalance: 50000,
        availableBalance: 45000,
        reservedBalance: 5000,
        registeredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        registeredDateIso: new Date().toISOString().split('T')[0],
        onboardingApplicationId: app.id,
      });
    } else {
      businessService.updateBusinessStatus(app.businessId, 'Active', 'Activated from Onboarding');
    }

    this.saveApplications();

    return {
      success: true,
      activationDetails: {
        businessId: app.businessId,
        businessOwnerId: app.businessOwnerId,
        email: recipientEmail,
        passcodeLink: passcodeSetupLink,
      },
    };
  }

  /**
   * Log document view for audit trail
   */
  public logDocumentAccess(
    appId: string,
    documentType: string,
    viewerId = 'TB-ADM-000001'
  ): void {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return;

    app.documentAccessLogs.push({
      id: `doc_log_${Date.now()}`,
      documentType,
      viewedBy: viewerId,
      viewedAt: new Date().toISOString(),
    });
    this.saveApplications();
  }

  /**
   * Filter and Sort Applications
   */
  public filterAndSortApplications(
    filters: BusinessOnboardingFilters,
    sortDirection: 'asc' | 'desc' = 'desc'
  ): BusinessOnboardingApplication[] {
    let result = [...this.applications];

    // Filter status
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((app) => app.status === filters.status);
    }

    // Filter date from
    if (filters.submittedFrom) {
      result = result.filter((app) => {
        const appDate = app.websiteData.submittedAt.split('T')[0];
        return appDate >= filters.submittedFrom;
      });
    }

    // Filter date to
    if (filters.submittedTo) {
      result = result.filter((app) => {
        const appDate = app.websiteData.submittedAt.split('T')[0];
        return appDate <= filters.submittedTo;
      });
    }

    // Filter search text
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter((app) => {
        return (
          app.websiteData.businessName.toLowerCase().includes(q) ||
          app.websiteData.ownerFullName.toLowerCase().includes(q) ||
          app.websiteData.phone.toLowerCase().includes(q) ||
          (app.websiteData.email && app.websiteData.email.toLowerCase().includes(q)) ||
          (app.businessId && app.businessId.toLowerCase().includes(q)) ||
          (app.businessOwnerId && app.businessOwnerId.toLowerCase().includes(q))
        );
      });
    }

    // Default Sort by Submitted date & time (Newest First)
    result.sort((a, b) => {
      const dateA = new Date(a.websiteData.submittedAt).getTime();
      const dateB = new Date(b.websiteData.submittedAt).getTime();
      if (dateA !== dateB) {
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      }
      return b.id.localeCompare(a.id);
    });

    return result;
  }
}

export const businessOnboardingService = new BusinessOnboardingService();
