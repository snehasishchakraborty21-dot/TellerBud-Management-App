export interface BusinessProfile {
  // 1. Business Identity
  businessName: string;
  businessId: string;
  accountStatus: 'Active' | 'Suspended' | 'Pending';
  businessType: string;
  registrationNumber: string;
  dateRegistered: string;
  logoInitials: string;
  logoUrl?: string;

  // 2. Business Contact Details (Editable fields)
  primaryContactPerson: string;
  businessPhone: string;
  businessEmail: string;
  alternativePhone?: string;

  // 3. Business Address (Editable fields except country)
  streetAddress: string;
  area: string;
  city: string;
  province: string;
  country: string;

  // 4. Business Owner Information
  ownerName: string;
  ownerId: string;
  ownerPhone: string;
  ownerEmail: string;
  accountRole: string;

  // 5. Operational Information
  operatingCurrency: string;
  timeZone: string;
  registeredAgents: number;
  agentsOnline?: number;
  activeAgents?: number;
  accountCreationDate: string;
}

export type EditableBusinessProfileFields = Pick<
  BusinessProfile,
  | 'primaryContactPerson'
  | 'businessPhone'
  | 'businessEmail'
  | 'alternativePhone'
  | 'streetAddress'
  | 'area'
  | 'city'
  | 'province'
> & {
  logoUrl?: string;
};

export interface BusinessProfileValidationErrors {
  primaryContactPerson?: string;
  businessPhone?: string;
  businessEmail?: string;
  alternativePhone?: string;
  streetAddress?: string;
  area?: string;
  city?: string;
  province?: string;
  logo?: string;
}
