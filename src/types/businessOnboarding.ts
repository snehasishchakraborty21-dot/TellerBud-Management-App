export type OnboardingApplicationStatus =
  | 'Pending Review'
  | 'Under Review'
  | 'More Information Required'
  | 'Rejected'
  | 'Approved – Onboarding Pending'
  | 'Onboarding in Progress'
  | 'Submitted for Activation'
  | 'Returned for Correction'
  | 'Active';

export type BusinessLegalType =
  | 'Sole Proprietorship'
  | 'Private Limited Company (PLC)'
  | 'Public Limited Company'
  | 'Partnership'
  | 'Cooperative'
  | 'Registered Society / NGO';

export interface CityLocationDetail {
  city: string;
  address: string;
}

export interface FieldCorrectionAudit {
  fieldName: string;
  originalValue: string;
  updatedValue: string;
  correctedByExecutiveId: string;
  correctedByExecutiveName: string;
  timestamp: string;
}

export interface OnboardingAuditLog {
  id: string;
  action: string;
  previousStatus: OnboardingApplicationStatus | 'None';
  newStatus: OnboardingApplicationStatus;
  actorId: string; // e.g. 'TB-ADM-000001', 'TB-EMP-000002', 'SYSTEM'
  actorName: string;
  timestamp: string;
  notes?: string;
}

export interface DocumentAttachment {
  id: string;
  type: 'NRC_FRONT' | 'NRC_BACK' | 'PACRA_CERTIFICATE' | 'SUPPORTING_REGISTRATION_DOC' | 'OWNER_LIVE_PHOTO';
  title: string;
  dataUrl: string; // Base64 or image data
  capturedAt: string;
  capturedByExecutiveId?: string;
  verified: boolean;
}

export interface ExecutiveAssignment {
  executiveId: string; // e.g. 'TB-EMP-000001'
  executiveName: string;
  assignedAt: string;
  scheduledOnboardingDate: string; // ISO date/time or formatted
  appointmentNotes?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Pending Reschedule';
}

export interface WebsiteSubmissionData {
  ownerFullName: string;
  businessName: string;
  email: string;
  phone: string;
  operatingCities: string[];
  cityLocations: Record<string, string>; // city -> specific address
  numberOfAgents: number;
  selectedProviders: string[]; // e.g. 'Airtel Money', 'MTN Mobile Money', 'Zamtel', 'FNB', 'Zanaco', 'INDO'
  additionalInformation?: string;
  submittedAt: string; // ISO timestamp
}

export interface DigitalOnboardingDraft {
  currentStep: number; // 1 to 7
  lastSavedAt: string;
  
  // Step 1: Corrected info from prefill
  correctedWebsiteData?: Partial<WebsiteSubmissionData>;
  fieldCorrections: FieldCorrectionAudit[];

  // Step 2: Extended Business Info
  legalBusinessName: string;
  tradingName: string;
  pacraRegistrationNumber: string;
  businessRegistrationDate: string;
  businessType: BusinessLegalType;
  primaryBusinessAddress: string;
  operatingCities: string[];
  cityLocations: Record<string, string>;
  numberOfAgents: number;
  selectedProviders: string[];
  businessContactPhone: string;
  businessEmailAddress: string;

  // Step 3: Extended Business Owner Info
  ownerFullLegalName: string;
  ownerNrcNumber: string; // Format: 123456/00/1
  ownerDateOfBirth: string;
  ownerResidentialAddress: string;
  ownerPhone: string;
  ownerEmail: string; // Mandatory before submission
  ownerPosition: string;

  // Step 4: NRC and Documents Capture
  nrcFrontImage?: string;
  nrcFrontCapturedAt?: string;
  nrcBackImage?: string;
  nrcBackCapturedAt?: string;
  supportingBusinessDoc?: string;
  supportingBusinessDocCapturedAt?: string;
  pacraDocument?: string;
  pacraDocumentCapturedAt?: string;

  // Step 5: Live Photo
  ownerLivePhoto?: string;
  ownerLivePhotoCapturedAt?: string;

  // Step 6: Account and Operational Setup
  proposedStoresCount: number;
  proposedBoothsCount: number;
  operationalNotes?: string;

  // Step 7: Consent & E-Signature
  confirmedAccuracy: boolean;
  acceptedOnboardingTerms: boolean;
  eSignatureData?: string; // Canvas base64 URL
  eSignatureTimestamp?: string;
  executiveSignatureConfirmed?: boolean;
}

export interface BusinessOnboardingApplication {
  id: string; // Internal unique database ID (e.g. 'app_biz_onb_001') - hidden from user
  
  // Website submission base
  websiteData: WebsiteSubmissionData;

  // Status Lifecycle
  status: OnboardingApplicationStatus;
  statusHistory: Array<{
    status: OnboardingApplicationStatus;
    timestamp: string;
    changedBy: string;
    reason?: string;
  }>;

  // Approved public IDs (Assigned ONLY upon Admin approval)
  businessId: string | null; // e.g. 'TB-BIZ-000009'
  businessOwnerId: string | null; // e.g. 'TB-BOO-000009'

  // Admin Review Notes / Rejection / Info Request
  adminReviewNotes?: string;
  moreInfoRequestReason?: string;
  rejectionReason?: string;
  approvedAt?: string;
  approvedByAdminId?: string;

  // Assignment to TellerBud Executive
  executiveAssignment?: ExecutiveAssignment;

  // Digital Physical Onboarding Data (completed on tablet)
  digitalOnboarding?: DigitalOnboardingDraft;

  // Returned for correction metadata
  correctionNotes?: string;
  returnedAt?: string;
  returnedByAdminId?: string;

  // Final Activation Details
  activatedAt?: string;
  activatedByAdminId?: string; // e.g. 'TB-ADM-000001'
  activationEmailSentAt?: string;
  activationEmailRecipient?: string;
  securePasscodeSetupLink?: string;
  securePasscodeLinkExpiresAt?: string;

  // Complete Audit Trail
  auditLogs: OnboardingAuditLog[];

  // Sensitive Document Access Log
  documentAccessLogs: Array<{
    id: string;
    documentType: string;
    viewedBy: string;
    viewedAt: string;
  }>;
}

export interface BusinessOnboardingFilters {
  status: 'ALL' | OnboardingApplicationStatus;
  submittedFrom: string;
  submittedTo: string;
  search?: string;
}

export interface BusinessOnboardingSummary {
  totalApplications: number;
  pendingReview: number;
  approvedOnboardingPending: number;
  onboardingInProgress: number;
  readyForActivation: number;
  activated: number;
  moreInfoRequired: number;
  rejected: number;
  returnedForCorrection: number;
  attentionCount: number; // Pending Review + Ready for Activation + Returned
}
