import {
  BusinessRecord,
  BusinessAccountStatus,
  BusinessWalletState,
  ContextualAgent,
  WalletTopUpItem,
  WalletLedgerEntry,
  BusinessActivityLog,
} from '../types/business';
import { MOCK_BUSINESSES, maskZambianPhoneNumber } from '../data/mockBusinessData';

const STORAGE_KEY = 'tellerbud_admin_businesses_v1';
const OWNERS_CREDENTIALS_STORAGE_KEY = 'tellerbud_registered_business_owners_v1';

export interface RegisteredBusinessOwnerCredential {
  businessId: string;
  businessName: string;
  ownerId: string;
  ownerFullName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string; // Simulated secure hash
  firstLoginPasswordChangeRequired: boolean;
  status: BusinessAccountStatus;
}

// Simple deterministic hash simulation (never plaintext)
function simulatedSecureHash(plaintext: string): string {
  let hash = 0;
  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `$2b$12$secure.${Math.abs(hash).toString(16).padStart(8, '0')}.tellerbud`;
}

// Generate unique sequential reference
let refCounter = 2000;
function generateRef(prefix: string): string {
  refCounter++;
  return `${prefix}-${Date.now().toString().slice(-4)}${refCounter.toString().slice(-3)}`;
}

// Seed mock businesses with detailed tab data if missing
function enrichMockBusiness(b: BusinessRecord, index: number): BusinessRecord {
  const username =
    b.ownerUsername ||
    b.ownerEmail.split('@')[0] ||
    b.ownerName.toLowerCase().replace(/\s+/g, '.');

  const contextualAgents: ContextualAgent[] = (b.contextualAgents || []).map((agt, i) => ({
    id: agt.id || `TB-AGT-${1000 + index * 10 + i}`,
    name: agt.name,
    phoneMasked: agt.phoneMasked || maskZambianPhoneNumber(`+260 97 ${100 + i * 15} ${1000 + i * 20}`),
    availability: agt.availability || 'Available',
    assignment: agt.assignment || (agt.availability === 'Assigned' ? 'Pickup' : 'Unassigned'),
    lastActivity: agt.lastActivity || 'Today, 11:15 AM',
    totalCompletedTransactions: 42 + i * 14,
  }));

  const recentLedgerEntries: WalletLedgerEntry[] = [
    {
      id: `LED-${b.id}-01`,
      reference: `LED-ZM-${8810 + index * 12}`,
      timestamp: 'Today, 11:15 AM',
      transactionType: 'Customer Withdrawal Settlement',
      amount: -1250.0,
      runningBalance: b.sharedWalletBalance,
      status: 'Completed',
    },
    {
      id: `LED-${b.id}-02`,
      reference: `LED-ZM-${8809 + index * 12}`,
      timestamp: 'Today, 09:30 AM',
      transactionType: 'Wallet Float Allocation',
      amount: 25000.0,
      runningBalance: b.sharedWalletBalance + 1250.0,
      status: 'Completed',
    },
    {
      id: `LED-${b.id}-03`,
      reference: `LED-ZM-${8805 + index * 12}`,
      timestamp: 'Yesterday, 04:20 PM',
      transactionType: 'Float Cash Return',
      amount: 14200.0,
      runningBalance: b.sharedWalletBalance - 23750.0,
      status: 'Completed',
    },
  ];

  const walletTopUpsList: WalletTopUpItem[] = (b.pendingTopUpRequests || []).map((pt, i) => ({
    id: pt.id || `TB-TOP-${4000 + index * 20 + i}`,
    reference: pt.reference || `TB-TOP-${4000 + index * 20 + i}`,
    agentName: pt.agentName,
    agentId: pt.agentId,
    submittedAt: pt.submittedAt || 'Today, 10:45 AM',
    updatedAt: 'Today, 10:45 AM',
    status: 'Pending Review' as const,
    standardMessage: 'Please top up the wallet to allow for transactions.',
  }));

  // Add a couple of historical top-ups for realistic display
  walletTopUpsList.push({
    id: `TB-TOP-HIST-${b.id}-1`,
    reference: `TB-TOP-${3800 + index * 10}`,
    agentName: contextualAgents[0]?.name || 'Kelvin Phiri',
    agentId: contextualAgents[0]?.id || 'TB-AGT-1024',
    submittedAt: 'Yesterday, 08:30 AM',
    updatedAt: 'Yesterday, 09:15 AM',
    status: 'Approved',
    standardMessage: 'Please top up the wallet to allow for transactions.',
  });

  const activityLogs: BusinessActivityLog[] = [
    {
      id: `ACT-${b.id}-01`,
      reference: `ACT-ZM-${7000 + index * 50 + 1}`,
      activityType: 'Business Profile Viewed & Verified',
      actor: 'Sililo Lubinda (Admin)',
      timestamp: 'Today, 10:15 AM',
      result: 'Logged',
      relatedRecord: b.id,
      details: 'Super Admin reviewed business operational details.',
    },
    {
      id: `ACT-${b.id}-02`,
      reference: `ACT-ZM-${7000 + index * 50 + 2}`,
      activityType: 'Wallet Ledger Reconciliation',
      actor: 'System Bot',
      timestamp: 'Today, 06:00 AM',
      result: 'Success',
      relatedRecord: `WAL-${b.id}`,
      details: 'Automated start-of-day ledger balance verification passed.',
    },
    {
      id: `ACT-${b.id}-03`,
      reference: `ACT-ZM-${7000 + index * 50 + 3}`,
      activityType: 'Account Registered & Activated',
      actor: 'Sililo Lubinda (Admin)',
      timestamp: b.registeredDate,
      result: 'Approved',
      relatedRecord: b.ownerId,
      details: 'Initial PACRA validation and business owner credential issuance.',
    },
  ];

  return {
    ...b,
    ownerUsername: username,
    ownerAccountStatus: b.ownerAccountStatus || 'Active',
    lastSignIn: b.status === 'Active' ? 'Today, 09:42 AM' : 'Pending First Sign-In',
    firstLoginPasswordChangeStatus: b.status === 'Active' ? 'Completed' : 'Pending First Sign-In',
    temporaryPasswordStatus:
      b.status === 'Active'
        ? 'Permanent Password Active'
        : 'Temporary Password Issued - Change Required on First Login',
    passwordChangeRequired: b.status !== 'Active',
    accountCreatedAt: b.registeredDate,
    lastAccountUpdate: b.lastActivity,
    contextualAgents,
    recentLedgerEntries,
    walletTopUpsList,
    activityLogs,
  };
}

class BusinessService {
  private businesses: BusinessRecord[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seenIds = new Set<string>();
          const seenNames = new Set<string>();
          const valid: BusinessRecord[] = [];

          parsed.forEach((b: BusinessRecord, i: number) => {
            const rawId = b.id || `TB-BIZ-${String(i + 1).padStart(6, '0')}`;
            const stdId = rawId.startsWith('TB-BIZ-')
              ? rawId
              : `TB-BIZ-${String(i + 1).padStart(6, '0')}`;
            const normName = (b.name || '').trim().toLowerCase();

            if (!seenIds.has(stdId) && (!normName || !seenNames.has(normName))) {
              seenIds.add(stdId);
              if (normName) seenNames.add(normName);
              valid.push({
                ...b,
                id: stdId,
              });
            }
          });

          if (valid.length > 0) {
            this.businesses = valid.map((b, i) => enrichMockBusiness(b, i));
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to read businesses from storage:', e);
    }

    // Default to seeded mock businesses
    const seenIds = new Set<string>();
    const uniqueMocks: BusinessRecord[] = [];
    MOCK_BUSINESSES.forEach((b, i) => {
      const stdId = b.id?.startsWith('TB-BIZ-')
        ? b.id
        : `TB-BIZ-${String(i + 1).padStart(6, '0')}`;
      if (!seenIds.has(stdId)) {
        seenIds.add(stdId);
        uniqueMocks.push({ ...b, id: stdId });
      }
    });

    this.businesses = uniqueMocks.map((b, i) => enrichMockBusiness(b, i));
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.businesses));
    } catch (e) {
      console.warn('Failed to save businesses to storage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  public getBusinesses(): BusinessRecord[] {
    return [...this.businesses];
  }

  public getBusinessById(id: string): BusinessRecord | undefined {
    const cleanId = (id || '').trim().toUpperCase();
    return this.businesses.find((b) => b.id.toUpperCase() === cleanId);
  }

  public isBusinessNameTaken(name: string, excludeId?: string): boolean {
    const clean = name.trim().toLowerCase();
    return this.businesses.some(
      (b) => b.name.trim().toLowerCase() === clean && b.id !== excludeId
    );
  }

  public isPacraTaken(pacra: string, excludeId?: string): boolean {
    const clean = pacra.trim().toUpperCase().replace(/\s+/g, '');
    return this.businesses.some(
      (b) => b.registrationNumber.trim().toUpperCase().replace(/\s+/g, '') === clean && b.id !== excludeId
    );
  }

  public isPhoneTaken(phone: string, excludeId?: string): boolean {
    const clean = phone.replace(/[\s\-()]/g, '');
    return this.businesses.some((b) => {
      if (b.id === excludeId) return false;
      const bPhoneClean = b.ownerPhone.replace(/[\s\-()]/g, '');
      return bPhoneClean === clean || bPhoneClean.endsWith(clean.slice(-9));
    });
  }

  public isUsernameTaken(username: string, excludeId?: string): boolean {
    const clean = username.trim().toLowerCase();
    const matchInBusinesses = this.businesses.some(
      (b) => b.ownerUsername.toLowerCase() === clean && b.id !== excludeId
    );
    if (matchInBusinesses) return true;

    // Check registered credentials
    try {
      const creds = this.getRegisteredOwnerCredentials();
      return creds.some((c) => c.username.toLowerCase() === clean && c.businessId !== excludeId);
    } catch {
      return false;
    }
  }

  public getRegisteredOwnerCredentials(): RegisteredBusinessOwnerCredential[] {
    try {
      const saved = localStorage.getItem(OWNERS_CREDENTIALS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read owner credentials:', e);
    }
    return [];
  }

  private saveRegisteredOwnerCredential(cred: RegisteredBusinessOwnerCredential) {
    try {
      const list = this.getRegisteredOwnerCredentials();
      const existingIdx = list.findIndex((c) => c.businessId === cred.businessId || c.username === cred.username);
      if (existingIdx >= 0) {
        list[existingIdx] = cred;
      } else {
        list.push(cred);
      }
      localStorage.setItem(OWNERS_CREDENTIALS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save owner credential:', e);
    }
  }

  public createBusiness(params: {
    name: string;
    businessType: string;
    registrationNumber: string;
    businessPhone?: string;
    streetAddress: string;
    city: string;
    province: string;
    ownerFirstName: string;
    ownerLastName: string;
    ownerPhone: string;
    ownerEmail?: string;
    ownerUsername: string;
    temporaryPasswordPlain?: string;
    temporaryPassword?: string;
    requirePasswordChange?: boolean;
    initialStatus?: BusinessAccountStatus;
    country?: string;
    operatingCurrency?: string;
    timeZone?: string;
  }): BusinessRecord {
    // Generate IDs
    const businessId = `TB-BIZ-${String(this.businesses.length + 1).padStart(6, '0')}`;
    const ownerId = `USR-BO-${String(this.businesses.length + 1).padStart(3, '0')}`;

    const ownerFullName = `${params.ownerFirstName.trim()} ${params.ownerLastName.trim()}`;
    const initials = params.name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'TB';

    const cleanUsername = params.ownerUsername.trim().toLowerCase();
    const email = params.ownerEmail?.trim() || `${cleanUsername}@tellerbud.co.zm`;
    const rawPassword = params.temporaryPasswordPlain || params.temporaryPassword || '';
    const passwordHash = simulatedSecureHash(rawPassword);
    const status: BusinessAccountStatus = params.initialStatus || 'Active';

    const requireChange = params.requirePasswordChange !== false;

    // Store secure credential for login
    this.saveRegisteredOwnerCredential({
      businessId,
      businessName: params.name.trim(),
      ownerId,
      ownerFullName,
      username: cleanUsername,
      email,
      phone: params.ownerPhone,
      passwordHash,
      firstLoginPasswordChangeRequired: requireChange,
      status,
    });

    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
    const dateIso = now.toISOString().split('T')[0];

    const newBusiness: BusinessRecord = {
      id: businessId,
      name: params.name.trim(),
      registrationNumber: params.registrationNumber.trim().toUpperCase(),
      businessType: params.businessType,
      logoInitials: initials,

      ownerName: ownerFullName,
      ownerId,
      ownerPhone: params.ownerPhone.trim(),
      ownerPhoneMasked: maskZambianPhoneNumber(params.ownerPhone.trim()),
      ownerEmail: email,
      ownerUsername: cleanUsername,
      ownerAccountStatus: status,
      lastSignIn: 'Pending First Sign-In',
      firstLoginPasswordChangeStatus: requireChange ? 'Pending First Sign-In' : 'Completed',
      temporaryPasswordStatus: requireChange
        ? 'Temporary Password Issued - Change Required on First Login'
        : 'Permanent Password Active',
      passwordChangeRequired: requireChange,
      accountCreatedAt: formattedDate,
      lastAccountUpdate: 'Just now',

      city: params.city.trim(),
      province: params.province.trim(),
      country: 'Zambia',
      streetAddress: params.streetAddress.trim(),

      associatedAgents: 0,
      agentsOnline: 0,
      agentsOffline: 0,
      agentsAssigned: 0,
      agentsAvailable: 0,
      contextualAgents: [],

      sharedWalletBalance: 0.0,
      availableBalance: 0.0,
      reservedFunds: 0.0,
      walletState: 'Active',
      lastWalletActivity: 'Account initialized',
      recentLedgerEntries: [],

      pendingTopUps: 0,
      pendingTopUpRequests: [],
      walletTopUpsList: [],

      lastActivity: 'Just now',
      lastActivityIso: now.toISOString(),
      recentActivity: {
        lastActivity: 'Just now',
        reference: generateRef('TXN-ZM'),
        activityType: 'Business Account Created',
        actor: 'Sililo Lubinda (Admin)',
        timestamp: 'Just now',
      },
      activityLogs: [
        {
          id: generateRef('ACT'),
          reference: generateRef('ACT-ZM'),
          activityType: 'Business Account Created',
          actor: 'Sililo Lubinda (Admin)',
          timestamp: 'Just now',
          result: 'Success',
          relatedRecord: businessId,
          details: `Business ${params.name} onboarded with owner ${ownerFullName}. Temporary credentials generated.`,
        },
      ],

      registeredDate: formattedDate,
      registeredDateIso: dateIso,
      createdAt: now.toISOString(),
      operatingCurrency: 'ZMW',
      timeZone: 'Africa/Lusaka (CAT)',
      status,
    };

    this.businesses.unshift(newBusiness);
    this.notify();
    return newBusiness;
  }

  public updateBusinessStatus(
    businessId: string,
    newStatus: BusinessAccountStatus,
    reason: string,
    actingAdmin: string = 'Sililo Lubinda (Admin)'
  ): boolean {
    const business = this.getBusinessById(businessId);
    if (!business) return false;

    business.status = newStatus;
    business.ownerAccountStatus = newStatus;
    business.lastAccountUpdate = 'Just now';
    business.lastActivity = 'Just now';
    business.lastActivityIso = new Date().toISOString();

    business.activityLogs.unshift({
      id: generateRef('ACT'),
      reference: generateRef('ACT-ZM'),
      activityType: `Status Changed to ${newStatus}`,
      actor: actingAdmin,
      timestamp: 'Just now',
      result: 'Updated',
      relatedRecord: business.id,
      details: reason ? `Administrative reason: ${reason}` : `Account status updated to ${newStatus}.`,
    });

    this.notify();
    return true;
  }

  public resetOwnerPassword(
    businessId: string,
    reason: string,
    actingAdmin: string = 'Sililo Lubinda (Admin)'
  ): boolean {
    const business = this.getBusinessById(businessId);
    if (!business) return false;

    business.temporaryPasswordStatus = 'Temporary Password Issued - Change Required on First Login';
    business.passwordChangeRequired = true;
    business.firstLoginPasswordChangeStatus = 'Pending First Sign-In';
    business.lastAccountUpdate = 'Just now';

    business.activityLogs.unshift({
      id: generateRef('ACT'),
      reference: generateRef('ACT-ZM'),
      activityType: 'Administrative Password Reset Requested',
      actor: actingAdmin,
      timestamp: 'Just now',
      result: 'Approved',
      relatedRecord: business.ownerId,
      details: reason ? `Administrative reason: ${reason}` : 'Password reset flag set. Temporary password issued.',
    });

    this.notify();
    return true;
  }

  public addActivatedBusiness(params: {
    id: string;
    businessId: string;
    name: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerUsername?: string;
    status: BusinessAccountStatus;
    walletState?: BusinessWalletState;
    province: string;
    associatedAgents: number;
    sharedWalletBalance?: number;
    availableBalance?: number;
    reservedBalance?: number;
    registeredDate: string;
    registeredDateIso: string;
    onboardingApplicationId?: string;
  }): BusinessRecord {
    const initials = params.name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'TB';

    const cleanUsername = (params.ownerUsername || params.ownerEmail.split('@')[0] || params.ownerName.toLowerCase().replace(/\s+/g, '.')).trim().toLowerCase();
    const now = new Date();

    const newBusiness: BusinessRecord = {
      id: params.businessId,
      name: params.name.trim(),
      registrationNumber: `PACRA-${params.businessId.replace('TB-BIZ-', 'REG-')}`,
      businessType: 'Private Limited Company (PLC)',
      logoInitials: initials,

      ownerName: params.ownerName.trim(),
      ownerId: params.businessId.replace('TB-BIZ-', 'TB-BOO-'),
      ownerPhone: params.ownerPhone.trim(),
      ownerPhoneMasked: maskZambianPhoneNumber(params.ownerPhone.trim()),
      ownerEmail: params.ownerEmail.trim(),
      ownerUsername: cleanUsername,
      ownerAccountStatus: params.status,
      lastSignIn: 'Pending First Sign-In',
      firstLoginPasswordChangeStatus: 'Completed',
      temporaryPasswordStatus: 'Permanent Password Active',
      passwordChangeRequired: false,
      accountCreatedAt: params.registeredDate,
      lastAccountUpdate: 'Just now',

      city: params.province,
      province: params.province,
      country: 'Zambia',
      streetAddress: `${params.province} Central Commercial Area`,

      associatedAgents: params.associatedAgents || 5,
      agentsOnline: Math.max(1, Math.floor((params.associatedAgents || 5) * 0.7)),
      agentsOffline: Math.max(0, Math.floor((params.associatedAgents || 5) * 0.3)),
      agentsAssigned: 2,
      agentsAvailable: Math.max(1, (params.associatedAgents || 5) - 2),
      contextualAgents: [],

      sharedWalletBalance: params.sharedWalletBalance ?? 25000.0,
      availableBalance: params.availableBalance ?? 22500.0,
      reservedFunds: params.reservedBalance ?? 2500.0,
      walletState: params.walletState || 'Active',
      lastWalletActivity: 'Activated via Onboarding',
      recentLedgerEntries: [],

      pendingTopUps: 0,
      pendingTopUpRequests: [],
      walletTopUpsList: [],

      lastActivity: 'Just now',
      lastActivityIso: now.toISOString(),
      recentActivity: {
        lastActivity: 'Just now',
        reference: generateRef('TXN-ZM'),
        activityType: 'Business Account Activated',
        actor: 'TellerBud Admin',
        timestamp: 'Just now',
      },
      activityLogs: [
        {
          id: generateRef('ACT'),
          reference: generateRef('ACT-ZM'),
          activityType: 'Business Account Activated',
          actor: 'TellerBud Admin',
          timestamp: 'Just now',
          result: 'Success',
          relatedRecord: params.businessId,
          details: `Business successfully activated from digital onboarding.`,
        },
      ],

      registeredDate: params.registeredDate,
      registeredDateIso: params.registeredDateIso,
      createdAt: now.toISOString(),
      operatingCurrency: 'ZMW',
      timeZone: 'Africa/Lusaka (CAT)',
      status: params.status,
    };

    this.businesses.unshift(newBusiness);
    this.notify();
    return newBusiness;
  }

  public isBusinessNameUnique(name: string): boolean {
    const clean = name.trim().toLowerCase();
    return !this.businesses.some((b) => b.name.trim().toLowerCase() === clean);
  }

  public isPacraUnique(pacra: string): boolean {
    const clean = pacra.trim().toUpperCase();
    return !this.businesses.some((b) => b.registrationNumber.trim().toUpperCase() === clean);
  }

  public isPhoneUnique(phone: string): boolean {
    const clean = phone.replace(/[\s-]/g, '');
    const inBiz = this.businesses.some((b) => b.ownerPhone.replace(/[\s-]/g, '') === clean);
    const inCreds = this.getRegisteredOwnerCredentials().some((c) => c.phone.replace(/[\s-]/g, '') === clean);
    return !inBiz && !inCreds;
  }

  public isUsernameUnique(username: string): boolean {
    const clean = username.trim().toLowerCase();
    const inBiz = this.businesses.some((b) => (b.ownerUsername || '').trim().toLowerCase() === clean);
    const inCreds = this.getRegisteredOwnerCredentials().some((c) => c.username.trim().toLowerCase() === clean);
    return !inBiz && !inCreds;
  }
}

export const businessService = new BusinessService();
