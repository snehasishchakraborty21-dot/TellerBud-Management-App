import { ApprovedMNO, ApprovedBank, ApprovedVendor } from '../types/admin';

export const APP_CONFIG = {
  appName: 'TellerBud Management Web Application',
  shortName: 'TellerBud',
  adminRoleLabel: 'Admin',
  country: 'Zambia',
  countryCode: 'ZM',
  phonePrefix: '+260',
  currency: 'ZMW',
  phase: 'Phase 1 - Customer Pickup Only',
} as const;

export const APPROVED_MNOS: readonly ApprovedMNO[] = ['MTN', 'Airtel', 'Zamtel'] as const;

export const APPROVED_BANKS: readonly ApprovedBank[] = [
  'Zanaco',
  'FNB',
  'INDO',
  'Stanbic',
  'Access',
] as const;

export const ALL_APPROVED_VENDORS: readonly ApprovedVendor[] = [
  ...APPROVED_MNOS,
  ...APPROVED_BANKS,
] as const;

/**
 * Strict currency formatter for Zambia (ZMW)
 * Output example: ZMW 1,250.00
 */
export function formatZMW(amount: number): string {
  const formattedNumber = new Intl.NumberFormat('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `ZMW ${formattedNumber}`;
}

export const SUPER_ADMIN_PROFILE = {
  id: 'USR-ADM-001',
  name: 'Sililo Lubinda',
  role: 'TellerBud Admin',
  country: 'Zambia',
  countryCode: 'ZM',
  phonePrefix: '+260',
  avatarInitials: 'SL',
} as const;

export const DEMO_ACCOUNTS = {
  superAdmin: {
    uid: 'USR-ADM-001',
    fullName: 'Sililo Lubinda',
    email: 'sililo.lubinda@tellerbud.co.zm',
    password: 'password123',
    role: 'super_admin' as const,
    roleLabel: 'TellerBud Admin',
    initials: 'SL',
    accountStatus: 'Active' as const,
  },
  businessOwner: {
    uid: 'USR-BO-001',
    fullName: 'Chileshe Mwamba',
    email: 'chileshe.mwamba@lusakaagency.zm',
    password: 'password123',
    role: 'business_owner' as const,
    roleLabel: 'Business Owner',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    initials: 'CM',
    accountStatus: 'Active' as const,
  },
} as const;

