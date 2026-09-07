import { BusinessProfile } from '../types/businessProfile';

export const MOCK_BUSINESS_PROFILES: Record<string, BusinessProfile> = {
  'BIZ-LUS-001': {
    // 1. Business Identity
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    accountStatus: 'Active',
    businessType: 'Agency Banking & Financial Services',
    registrationNumber: 'PACRA-2023-884920',
    dateRegistered: '14 Jan 2023',
    logoInitials: 'LC',

    // 2. Business Contact Details
    primaryContactPerson: 'Chileshe Mwamba',
    businessPhone: '+260 97 123 4567',
    businessEmail: 'info@lusakacentralagency.co.zm',
    alternativePhone: '+260 96 789 0123',

    // 3. Business Address
    streetAddress: 'Plot 4821, Cairo Road',
    area: 'Central Business District',
    city: 'Lusaka',
    province: 'Lusaka Province',
    country: 'Zambia',

    // 4. Business Owner Information
    ownerName: 'Chileshe Mwamba',
    ownerId: 'USR-BO-001',
    ownerPhone: '+260 97 712 3456',
    ownerEmail: 'chileshe.mwamba@tellerbud.co.zm',
    accountRole: 'Business Owner',

    // 5. Operational Information
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    registeredAgents: 8,
    agentsOnline: 6,
    activeAgents: 6,
    accountCreationDate: '15 Jan 2023',
  },
};

/**
 * Validates a Zambian phone number string.
 * Supports standard formats:
 * - +260 97 123 4567 / +260 96 1234567 / +260 77 1234567 / +260 76 1234567 / +260 95...
 * - 0971234567 / 0961234567 / 0771234567
 * - +260971234567
 */
export function isValidZambianPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  // Strip spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Matches:
  // +260 followed by (95|96|97|75|76|77|98|78) and 7 digits
  // 0 followed by (95|96|97|75|76|77|98|78) and 7 digits
  // 260 followed by (95|96|97|75|76|77|98|78) and 7 digits
  const zambiaRegex = /^(?:\+?260|0)[79][5-8]\d{7}$/;
  return zambiaRegex.test(cleaned);
}

/**
 * Validates standard email address format.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
