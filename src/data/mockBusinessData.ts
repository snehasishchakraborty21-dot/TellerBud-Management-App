import {
  BusinessRecord,
  BusinessSummary,
  BusinessFilters,
  BusinessSortField,
  BusinessSortDirection,
} from '../types/business';

/**
 * Masks Zambian mobile number to protect user privacy.
 * Retains country code / network dial prefix and last 4 digits:
 * e.g. "+260 97 712 3456" -> "+260 97 ••• 3456"
 */
export function maskZambianPhoneNumber(phone: string): string {
  if (!phone) return '—';
  const clean = phone.replace(/[\s\-()]/g, '');

  // Handle +260 or 260 or 0
  let dialPrefix = '+260 97';
  let last4 = '0000';

  if (clean.startsWith('+260')) {
    dialPrefix = `+260 ${clean.slice(4, 6)}`;
    last4 = clean.slice(-4);
  } else if (clean.startsWith('260')) {
    dialPrefix = `+260 ${clean.slice(3, 5)}`;
    last4 = clean.slice(-4);
  } else if (clean.startsWith('0')) {
    dialPrefix = `+260 ${clean.slice(1, 3)}`;
    last4 = clean.slice(-4);
  } else {
    last4 = clean.slice(-4);
  }

  return `${dialPrefix} ••• ${last4}`;
}

export const MOCK_BUSINESSES: BusinessRecord[] = [
  {
    id: 'BIZ-LUS-001',
    name: 'Lusaka Central Express Agency',
    registrationNumber: 'PACRA-2023-884920',
    businessType: 'Agency Banking & Financial Services',
    logoInitials: 'LC',
    ownerName: 'Chileshe Mwamba',
    ownerId: 'USR-BO-001',
    ownerPhone: '+260 97 712 3456',
    ownerPhoneMasked: maskZambianPhoneNumber('+260 97 712 3456'),
    ownerEmail: 'chileshe.mwamba@tellerbud.co.zm',
    ownerAccountStatus: 'Active',
    city: 'Lusaka',
    province: 'Lusaka Province',
    country: 'Zambia',
    streetAddress: 'Plot 4821, Cairo Road, Central Business District',
    associatedAgents: 8,
    agentsOnline: 6,
    agentsOffline: 2,
    agentsAssigned: 2,
    agentsAvailable: 4,
    contextualAgents: [
      { id: 'TB-AGT-1024', name: 'Kelvin Phiri', availability: 'Assigned', assignment: 'Pickup' },
      { id: 'TB-AGT-1025', name: 'Natasha Tembo', availability: 'Assigned', assignment: 'Pickup' },
      { id: 'TB-AGT-1026', name: 'Bright Mwape', availability: 'Available' },
      { id: 'TB-AGT-1027', name: 'Martha Lungu', availability: 'Available' },
      { id: 'TB-AGT-1028', name: 'Gift Zulu', availability: 'Available' },
      { id: 'TB-AGT-1031', name: 'Memory Banda', availability: 'Available' },
      { id: 'TB-AGT-1032', name: 'Patrick Musonda', availability: 'Offline' },
      { id: 'TB-AGT-1034', name: 'Chipo Mwansa', availability: 'Offline' },
    ],
    sharedWalletBalance: 164350.0,
    availableBalance: 142350.0,
    reservedFunds: 22000.0,
    walletState: 'Active',
    lastWalletActivity: 'Today, 11:15 AM',
    pendingTopUps: 1,
    pendingTopUpRequests: [
      {
        id: 'TB-TOP-4011',
        reference: 'TB-TOP-4011',
        agentName: 'Kelvin Phiri',
        agentId: 'TB-AGT-1024',
        submittedAt: 'Today, 10:45 AM',
        status: 'Pending Review',
        standardMessage: 'Please top up the wallet to allow for transactions.',
      },
    ],
    lastActivity: 'Today, 11:20 AM',
    lastActivityIso: '2026-09-04T11:20:00Z',
    recentActivity: {
      lastActivity: 'Today, 11:20 AM',
      reference: 'TXN-ZM-99021',
      activityType: 'Customer Withdrawal Pickup',
      actor: 'Kelvin Phiri',
      timestamp: 'Today, 11:20 AM',
    },
    registeredDate: '14 Jan 2023',
    registeredDateIso: '2023-01-14',
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    status: 'Active',
  },
  {
    id: 'BIZ-KAB-001',
    name: 'Kabwata Market Agency',
    registrationNumber: 'PACRA-2023-912401',
    businessType: 'Mobile Money & Cash Distribution',
    logoInitials: 'KM',
    ownerName: 'Taonga Banda',
    ownerId: 'USR-BO-002',
    ownerPhone: '+260 96 445 6677',
    ownerPhoneMasked: maskZambianPhoneNumber('+260 96 445 6677'),
    ownerEmail: 'taonga.banda@kabwata-agency.co.zm',
    ownerAccountStatus: 'Active',
    city: 'Lusaka',
    province: 'Lusaka Province',
    country: 'Zambia',
    streetAddress: 'Shop 14, Kabwata Market Commercial Plaza, Burma Road',
    associatedAgents: 5,
    agentsOnline: 4,
    agentsOffline: 1,
    agentsAssigned: 1,
    agentsAvailable: 3,
    contextualAgents: [
      { id: 'TB-AGT-2001', name: 'James Sampa', availability: 'Assigned', assignment: 'Float Delivery' },
      { id: 'TB-AGT-2002', name: 'Catherine Mwila', availability: 'Available' },
      { id: 'TB-AGT-2003', name: 'Peter Bwalya', availability: 'Available' },
      { id: 'TB-AGT-2004', name: 'Eunice Kangwa', availability: 'Available' },
      { id: 'TB-AGT-2005', name: 'Abel Silwamba', availability: 'Offline' },
    ],
    sharedWalletBalance: 89400.0,
    availableBalance: 75400.0,
    reservedFunds: 14000.0,
    walletState: 'Active',
    lastWalletActivity: 'Today, 11:05 AM',
    pendingTopUps: 0,
    pendingTopUpRequests: [],
    lastActivity: 'Today, 11:05 AM',
    lastActivityIso: '2026-09-04T11:05:00Z',
    recentActivity: {
      lastActivity: 'Today, 11:05 AM',
      reference: 'TXN-ZM-98845',
      activityType: 'Float Settlement Credit',
      actor: 'System Bot',
      timestamp: 'Today, 11:05 AM',
    },
    registeredDate: '02 Mar 2023',
    registeredDateIso: '2023-03-02',
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    status: 'Active',
  },
  {
    id: 'BIZ-COP-002',
    name: 'Copperbelt Financial Services',
    registrationNumber: 'PACRA-2022-773412',
    businessType: 'Micro-Banking & Agent Liquidity Hub',
    logoInitials: 'CF',
    ownerName: 'Joseph Mwale',
    ownerId: 'USR-BO-003',
    ownerPhone: '+260 97 123 9988',
    ownerPhoneMasked: maskZambianPhoneNumber('+260 97 123 9988'),
    ownerEmail: 'joseph.mwale@copperbelt-fin.co.zm',
    ownerAccountStatus: 'Active',
    city: 'Kitwe',
    province: 'Copperbelt Province',
    country: 'Zambia',
    streetAddress: 'Plot 102, Independence Avenue, City Square',
    associatedAgents: 6,
    agentsOnline: 5,
    agentsOffline: 1,
    agentsAssigned: 2,
    agentsAvailable: 3,
    contextualAgents: [
      { id: 'TB-AGT-3001', name: 'Davies Tembo', availability: 'Assigned', assignment: 'Pickup' },
      { id: 'TB-AGT-3002', name: 'Agnes Mumba', availability: 'Assigned', assignment: 'Pickup' },
      { id: 'TB-AGT-3003', name: 'Emmanuel Chola', availability: 'Available' },
      { id: 'TB-AGT-3004', name: 'Grace Chisenga', availability: 'Available' },
      { id: 'TB-AGT-3005', name: 'Besa Chilufya', availability: 'Available' },
      { id: 'TB-AGT-3006', name: 'Lombe Kunda', availability: 'Offline' },
    ],
    sharedWalletBalance: 142600.0,
    availableBalance: 124600.0,
    reservedFunds: 18000.0,
    walletState: 'Active',
    lastWalletActivity: 'Today, 10:40 AM',
    pendingTopUps: 2,
    pendingTopUpRequests: [
      {
        id: 'TB-TOP-4018',
        reference: 'TB-TOP-4018',
        agentName: 'Davies Tembo',
        agentId: 'TB-AGT-3001',
        submittedAt: 'Today, 09:20 AM',
        status: 'Pending Review',
        standardMessage: 'Please top up the wallet to allow for transactions.',
      },
      {
        id: 'TB-TOP-4019',
        reference: 'TB-TOP-4019',
        agentName: 'Agnes Mumba',
        agentId: 'TB-AGT-3002',
        submittedAt: 'Today, 10:15 AM',
        status: 'Pending Review',
        standardMessage: 'Please top up the wallet to allow for transactions.',
      },
    ],
    lastActivity: 'Today, 10:40 AM',
    lastActivityIso: '2026-09-04T10:40:00Z',
    recentActivity: {
      lastActivity: 'Today, 10:40 AM',
      reference: 'TXN-ZM-97712',
      activityType: 'Agent Cash Liquidity Dispatch',
      actor: 'Joseph Mwale',
      timestamp: 'Today, 10:40 AM',
    },
    registeredDate: '20 Nov 2022',
    registeredDateIso: '2022-11-20',
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    status: 'Active',
  },
  {
    id: 'BIZ-COP-003',
    name: 'Copperbelt Liquidity Hub',
    registrationNumber: 'PACRA-2023-948102',
    businessType: 'Wholesale Liquidity & Agency Banking',
    logoInitials: 'CL',
    ownerName: 'Mulenga Chanda',
    ownerId: 'USR-BO-004',
    ownerPhone: '+260 95 332 1100',
    ownerPhoneMasked: maskZambianPhoneNumber('+260 95 332 1100'),
    ownerEmail: 'm.chanda@copperbeltliquidity.co.zm',
    ownerAccountStatus: 'Active',
    city: 'Ndola',
    province: 'Copperbelt Province',
    country: 'Zambia',
    streetAddress: 'Stand 45, President Avenue Commercial Zone',
    associatedAgents: 4,
    agentsOnline: 3,
    agentsOffline: 1,
    agentsAssigned: 1,
    agentsAvailable: 2,
    contextualAgents: [
      { id: 'TB-AGT-4001', name: 'Mwelwa Kapembwa', availability: 'Assigned', assignment: 'Pickup' },
      { id: 'TB-AGT-4002', name: 'Chanda Bwembya', availability: 'Available' },
      { id: 'TB-AGT-4003', name: 'Dorothy Mulenga', availability: 'Available' },
      { id: 'TB-AGT-4004', name: 'Sydney Chipimo', availability: 'Offline' },
    ],
    sharedWalletBalance: 18200.0,
    availableBalance: 15200.0,
    reservedFunds: 3000.0,
    walletState: 'Low Balance',
    lastWalletActivity: 'Today, 09:15 AM',
    pendingTopUps: 1,
    pendingTopUpRequests: [
      {
        id: 'TB-TOP-4024',
        reference: 'TB-TOP-4024',
        agentName: 'Mwelwa Kapembwa',
        agentId: 'TB-AGT-4001',
        submittedAt: 'Today, 08:50 AM',
        status: 'Pending Review',
        standardMessage: 'Please top up the wallet to allow for transactions.',
      },
    ],
    lastActivity: 'Today, 09:15 AM',
    lastActivityIso: '2026-09-04T09:15:00Z',
    recentActivity: {
      lastActivity: 'Today, 09:15 AM',
      reference: 'TXN-ZM-96541',
      activityType: 'Mobile Money Float Transfer',
      actor: 'Mulenga Chanda',
      timestamp: 'Today, 09:15 AM',
    },
    registeredDate: '15 Jul 2023',
    registeredDateIso: '2023-07-15',
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    status: 'Active',
  },
  {
    id: 'BIZ-NDO-001',
    name: 'Ndola Copperbelt Agency',
    registrationNumber: 'PACRA-2023-956201',
    businessType: 'Retail Cash & Utility Payment Services',
    logoInitials: 'NC',
    ownerName: 'Kasonde Musonda',
    ownerId: 'USR-BO-005',
    ownerPhone: '+260 96 771 8822',
    ownerPhoneMasked: maskZambianPhoneNumber('+260 96 771 8822'),
    ownerEmail: 'kasonde.musonda@ndola-agency.co.zm',
    ownerAccountStatus: 'Active',
    city: 'Ndola',
    province: 'Copperbelt Province',
    country: 'Zambia',
    streetAddress: 'Plot 18, Broadway Commercial Center',
    associatedAgents: 3,
    agentsOnline: 0,
    agentsOffline: 3,
    agentsAssigned: 0,
    agentsAvailable: 0,
    contextualAgents: [
      { id: 'TB-AGT-5001', name: 'Kunda Musonda', availability: 'Offline' },
      { id: 'TB-AGT-5002', name: 'Florence Chewe', availability: 'Offline' },
      { id: 'TB-AGT-5003', name: 'Brian Mwansa', availability: 'Offline' },
    ],
    sharedWalletBalance: 52800.0,
    availableBalance: 48800.0,
    reservedFunds: 4000.0,
    walletState: 'Active',
    lastWalletActivity: 'Yesterday, 04:30 PM',
    pendingTopUps: 0,
    pendingTopUpRequests: [],
    lastActivity: 'Yesterday, 04:30 PM',
    lastActivityIso: '2026-09-03T16:30:00Z',
    recentActivity: {
      lastActivity: 'Yesterday, 04:30 PM',
      reference: 'TXN-ZM-95412',
      activityType: 'End-of-Day Settlement Batch',
      actor: 'System Bot',
      timestamp: 'Yesterday, 04:30 PM',
    },
    registeredDate: '10 Aug 2023',
    registeredDateIso: '2023-08-10',
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    status: 'Active',
  },
  {
    id: 'BIZ-LIV-001',
    name: 'Livingstone Tourist Kiosk Agency',
    registrationNumber: 'PACRA-2024-102948',
    businessType: 'Cross-Border Exchange & Kiosk Operations',
    logoInitials: 'LT',
    ownerName: 'Lubinda Mwanawasa',
    ownerId: 'USR-BO-006',
    ownerPhone: '+260 97 882 3344',
    ownerPhoneMasked: maskZambianPhoneNumber('+260 97 882 3344'),
    ownerEmail: 'lubinda.m@livingstone-kiosk.co.zm',
    ownerAccountStatus: 'Active',
    city: 'Livingstone',
    province: 'Southern Province',
    country: 'Zambia',
    streetAddress: 'Mosi-oa-Tunya Road, Curio Market Front',
    associatedAgents: 2,
    agentsOnline: 1,
    agentsOffline: 1,
    agentsAssigned: 0,
    agentsAvailable: 1,
    contextualAgents: [
      { id: 'TB-AGT-6001', name: 'Simasiku Mukelabai', availability: 'Available' },
      { id: 'TB-AGT-6002', name: 'Namakau Siyoto', availability: 'Offline' },
    ],
    sharedWalletBalance: 35900.0,
    availableBalance: 30900.0,
    reservedFunds: 5000.0,
    walletState: 'Active',
    lastWalletActivity: 'Today, 08:20 AM',
    pendingTopUps: 0,
    pendingTopUpRequests: [],
    lastActivity: 'Today, 08:20 AM',
    lastActivityIso: '2026-09-04T08:20:00Z',
    recentActivity: {
      lastActivity: 'Today, 08:20 AM',
      reference: 'TXN-ZM-94301',
      activityType: 'Tourist Cash Exchange Fulfillment',
      actor: 'Simasiku Mukelabai',
      timestamp: 'Today, 08:20 AM',
    },
    registeredDate: '05 May 2024',
    registeredDateIso: '2024-05-05',
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    status: 'Active',
  },
  {
    id: 'BIZ-CHI-001',
    name: 'Chipata Eastern Financial Agency',
    registrationNumber: 'PACRA-2026-118204',
    businessType: 'Agricultural Pay-Out & Agency Banking',
    logoInitials: 'CP',
    ownerName: 'Aliness Phiri',
    ownerId: 'USR-BO-007',
    ownerPhone: '+260 97 445 9900',
    ownerPhoneMasked: maskZambianPhoneNumber('+260 97 445 9900'),
    ownerEmail: 'aliness.phiri@chipata-fin.co.zm',
    ownerAccountStatus: 'Active',
    city: 'Chipata',
    province: 'Eastern Province',
    country: 'Zambia',
    streetAddress: 'Great East Road, Down Town Market',
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
    lastWalletActivity: '28 Aug 2026',
    pendingTopUps: 0,
    pendingTopUpRequests: [],
    lastActivity: '28 Aug 2026',
    lastActivityIso: '2026-08-28T14:00:00Z',
    recentActivity: {
      lastActivity: '28 Aug 2026',
      reference: 'SYS-REG-0014',
      activityType: 'Business Account Registration',
      actor: 'Aliness Phiri',
      timestamp: '28 Aug 2026, 02:00 PM',
    },
    registeredDate: '28 Aug 2026',
    registeredDateIso: '2026-08-28',
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    status: 'Pending',
  },
  {
    id: 'BIZ-KBW-001',
    name: 'Kabwe Central Agency',
    registrationNumber: 'PACRA-2023-899432',
    businessType: 'Express Cash Points & Float Kiosk',
    logoInitials: 'KC',
    ownerName: 'Given Chilufya',
    ownerId: 'USR-BO-008',
    ownerPhone: '+260 95 112 7788',
    ownerPhoneMasked: maskZambianPhoneNumber('+260 95 112 7788'),
    ownerEmail: 'given.c@kabwe-central.co.zm',
    ownerAccountStatus: 'Active',
    city: 'Kabwe',
    province: 'Central Province',
    country: 'Zambia',
    streetAddress: 'Plot 55, Independence Way, Industrial Area',
    associatedAgents: 3,
    agentsOnline: 0,
    agentsOffline: 3,
    agentsAssigned: 0,
    agentsAvailable: 0,
    contextualAgents: [
      { id: 'TB-AGT-8001', name: 'Moffat Phiri', availability: 'Offline' },
      { id: 'TB-AGT-8002', name: 'Bupe Mutale', availability: 'Offline' },
      { id: 'TB-AGT-8003', name: 'Sitali Mundia', availability: 'Offline' },
    ],
    sharedWalletBalance: 4100.0,
    availableBalance: 4100.0,
    reservedFunds: 0.0,
    walletState: 'Suspended',
    lastWalletActivity: '12 Aug 2026',
    pendingTopUps: 0,
    pendingTopUpRequests: [],
    lastActivity: '12 Aug 2026',
    lastActivityIso: '2026-08-12T10:00:00Z',
    recentActivity: {
      lastActivity: '12 Aug 2026',
      reference: 'SEC-ACT-0089',
      activityType: 'Account Freeze - Compliance Hold',
      actor: 'Compliance Officer',
      timestamp: '12 Aug 2026, 10:00 AM',
    },
    registeredDate: '18 Feb 2023',
    registeredDateIso: '2023-02-18',
    operatingCurrency: 'ZMW',
    timeZone: 'Africa/Lusaka (CAT)',
    status: 'Suspended',
  },
];

/**
 * Calculates summary metrics for KPI cards.
 */
export function getBusinessSummary(businesses: BusinessRecord[]): BusinessSummary {
  const totalBusinesses = businesses.length;
  const activeBusinesses = businesses.filter((b) => b.status === 'Active').length;
  const associatedAgents = businesses.reduce((acc, b) => acc + b.associatedAgents, 0);
  const agentsOnline = businesses.reduce((acc, b) => acc + b.agentsOnline, 0);
  const pendingTopUps = businesses.reduce((acc, b) => acc + b.pendingTopUps, 0);

  return {
    totalBusinesses,
    activeBusinesses,
    associatedAgents,
    agentsOnline,
    pendingTopUps,
  };
}

/**
 * Filter and sort businesses based on user criteria.
 */
export function filterAndSortBusinesses(
  businesses: BusinessRecord[],
  filters: BusinessFilters,
  sort: { field: BusinessSortField; direction: BusinessSortDirection }
): BusinessRecord[] {
  let result = [...businesses];

  // 1. Quick Filter from KPI cards
  if (filters.quickFilter === 'ACTIVE') {
    result = result.filter((b) => b.status === 'Active');
  } else if (filters.quickFilter === 'AGENTS') {
    result = result.filter((b) => b.associatedAgents > 0);
  } else if (filters.quickFilter === 'ONLINE') {
    result = result.filter((b) => b.agentsOnline > 0);
  } else if (filters.quickFilter === 'PENDING_TOPUPS') {
    result = result.filter((b) => b.pendingTopUps > 0);
  }

  // 2. Status Filter
  if (filters.status !== 'ALL') {
    result = result.filter((b) => b.status === filters.status);
  }

  // 3. Province Filter
  if (filters.province !== 'ALL') {
    result = result.filter((b) => b.province === filters.province);
  }

  // 4. Wallet State Filter
  if (filters.walletState !== 'ALL') {
    result = result.filter((b) => b.walletState === filters.walletState);
  }

  // 5. Date Range Filter
  if (filters.fromDate) {
    result = result.filter((b) => b.registeredDateIso >= filters.fromDate);
  }
  if (filters.toDate) {
    result = result.filter((b) => b.registeredDateIso <= filters.toDate);
  }

  // 6. Search Query (business name, ID, owner name, owner phone masked/raw, city)
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter((b) => {
      return (
        b.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.ownerName.toLowerCase().includes(q) ||
        b.ownerId.toLowerCase().includes(q) ||
        b.ownerPhoneMasked.toLowerCase().includes(q) ||
        b.ownerPhone.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
        b.city.toLowerCase().includes(q) ||
        b.province.toLowerCase().includes(q)
      );
    });
  }

  // 7. Sorting
  result.sort((a, b) => {
    let comparison = 0;
    switch (sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'associatedAgents':
        comparison = a.associatedAgents - b.associatedAgents;
        break;
      case 'sharedWalletBalance':
        comparison = a.sharedWalletBalance - b.sharedWalletBalance;
        break;
      case 'registeredDateIso':
        comparison = a.registeredDateIso.localeCompare(b.registeredDateIso);
        break;
      default:
        comparison = 0;
    }
    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return result;
}
