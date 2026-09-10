import {
  CustomerRecord,
  CustomerSummary,
  CustomerFilters,
  CustomerSortField,
  CustomerSortDirection,
} from '../types/customer';

export const MOCK_REGISTERED_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'TB-CUS-1052',
    name: 'Mwamba Mulenga',
    phone: '+260 97 778 9012',
    avatarInitials: 'MM',
    accountStatus: 'Active',
    walletBalance: 18450.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: 'Today, 11:52 AM',
    lastActivityTimestamp: '2026-09-08T11:52:00Z',
    registeredDate: '14 Jan 2025',
    registeredDateIso: '2025-01-14',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1049',
    name: 'Chileshe Mumba',
    phone: '+260 95 334 5678',
    avatarInitials: 'CM',
    accountStatus: 'Active',
    walletBalance: 12800.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: 'Today, 11:50 AM',
    lastActivityTimestamp: '2026-09-08T11:50:00Z',
    registeredDate: '03 Feb 2025',
    registeredDateIso: '2025-02-03',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1048',
    name: 'Ruth Banda',
    phone: '+260 97 654 3210',
    avatarInitials: 'RB',
    accountStatus: 'Active',
    walletBalance: 24150.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: 'Today, 11:42 AM',
    lastActivityTimestamp: '2026-09-08T11:42:00Z',
    registeredDate: '20 Nov 2024',
    registeredDateIso: '2024-11-20',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1050',
    name: 'Grace Tembo',
    phone: '+260 97 345 1050',
    avatarInitials: 'GT',
    accountStatus: 'Active',
    walletBalance: 9620.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: 'Today, 11:35 AM',
    lastActivityTimestamp: '2026-09-08T11:35:00Z',
    registeredDate: '12 Mar 2025',
    registeredDateIso: '2025-03-12',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1046',
    name: 'Lombe Kasonde',
    phone: '+260 96 612 9901',
    avatarInitials: 'LK',
    accountStatus: 'Active',
    walletBalance: 15450.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: 'Today, 11:28 AM',
    lastActivityTimestamp: '2026-09-08T11:28:00Z',
    registeredDate: '05 Oct 2024',
    registeredDateIso: '2024-10-05',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1045',
    name: 'Bwalya Mwansa',
    phone: '+260 97 245 1045',
    avatarInitials: 'BM',
    accountStatus: 'Active',
    walletBalance: 31900.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 11:20 AM',
    lastActivityTimestamp: '2026-09-08T11:20:00Z',
    registeredDate: '18 Sep 2024',
    registeredDateIso: '2024-09-18',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1044',
    name: 'Kondwani Phiri',
    phone: '+260 95 443 2190',
    avatarInitials: 'KP',
    accountStatus: 'Active',
    walletBalance: 8750.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 11:15 AM',
    lastActivityTimestamp: '2026-09-08T11:15:00Z',
    registeredDate: '01 Apr 2025',
    registeredDateIso: '2025-04-01',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1042',
    name: 'Mabvuto Sakala',
    phone: '+260 97 334 8871',
    avatarInitials: 'MS',
    accountStatus: 'Active',
    walletBalance: 14200.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: true,
    recoveryCaseTitle: 'SIM Swap & Mobile Credential Verification',
    lastActivity: 'Today, 11:05 AM',
    lastActivityTimestamp: '2026-09-08T11:05:00Z',
    registeredDate: '11 Dec 2024',
    registeredDateIso: '2024-12-11',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1040',
    name: 'Chilufya Chewe',
    phone: '+260 96 771 2234',
    avatarInitials: 'CC',
    accountStatus: 'Pending',
    walletBalance: 6000.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 10:55 AM',
    lastActivityTimestamp: '2026-09-08T10:55:00Z',
    registeredDate: '28 Aug 2025',
    registeredDateIso: '2025-08-28',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1038',
    name: 'Njavwa Sinyangwe',
    phone: '+260 97 552 1109',
    avatarInitials: 'NS',
    accountStatus: 'Active',
    walletBalance: 11350.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 10:48 AM',
    lastActivityTimestamp: '2026-09-08T10:48:00Z',
    registeredDate: '29 Jan 2025',
    registeredDateIso: '2025-01-29',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1036',
    name: 'Subilo Mukuka',
    phone: '+260 95 221 4455',
    avatarInitials: 'SM',
    accountStatus: 'Active',
    walletBalance: 19500.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 10:40 AM',
    lastActivityTimestamp: '2026-09-08T10:40:00Z',
    registeredDate: '15 Aug 2024',
    registeredDateIso: '2024-08-15',
    city: 'Kitwe',
  },
  {
    id: 'TB-CUS-1034',
    name: 'Taonga Zulu',
    phone: '+260 97 665 4321',
    avatarInitials: 'TZ',
    accountStatus: 'Active',
    walletBalance: 5400.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: true,
    recoveryCaseTitle: 'Lost Device Access Recovery',
    lastActivity: 'Today, 10:32 AM',
    lastActivityTimestamp: '2026-09-08T10:32:00Z',
    registeredDate: '19 May 2025',
    registeredDateIso: '2025-05-19',
    city: 'Kitwe',
  },
  {
    id: 'TB-CUS-1031',
    name: 'Mutinta Haimbe',
    phone: '+260 96 998 7766',
    avatarInitials: 'MH',
    accountStatus: 'Active',
    walletBalance: 16700.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 10:25 AM',
    lastActivityTimestamp: '2026-09-08T10:25:00Z',
    registeredDate: '22 Jul 2024',
    registeredDateIso: '2024-07-22',
    city: 'Ndola',
  },
  {
    id: 'TB-CUS-1029',
    name: 'Chanda Sikazwe',
    phone: '+260 97 441 3322',
    avatarInitials: 'CS',
    accountStatus: 'Active',
    walletBalance: 28250.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 10:18 AM',
    lastActivityTimestamp: '2026-09-08T10:18:00Z',
    registeredDate: '10 Jun 2024',
    registeredDateIso: '2024-06-10',
    city: 'Ndola',
  },
  {
    id: 'TB-CUS-1026',
    name: 'Thandiwe Lungu',
    phone: '+260 95 667 8899',
    avatarInitials: 'TL',
    accountStatus: 'Active',
    walletBalance: 7100.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 10:12 AM',
    lastActivityTimestamp: '2026-09-08T10:12:00Z',
    registeredDate: '14 Feb 2025',
    registeredDateIso: '2025-02-14',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1024',
    name: 'Mundia Situmbeko',
    phone: '+260 97 119 4433',
    avatarInitials: 'MS',
    accountStatus: 'Active',
    walletBalance: 13800.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: true,
    recoveryCaseTitle: 'NRC Identity Document Re-verification',
    lastActivity: 'Today, 10:05 AM',
    lastActivityTimestamp: '2026-09-08T10:05:00Z',
    registeredDate: '04 Nov 2024',
    registeredDateIso: '2024-11-04',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1021',
    name: 'Bupe Chileshe',
    phone: '+260 96 223 5588',
    avatarInitials: 'BC',
    accountStatus: 'Pending',
    walletBalance: 4300.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Today, 09:55 AM',
    lastActivityTimestamp: '2026-09-08T09:55:00Z',
    registeredDate: '30 Aug 2025',
    registeredDateIso: '2025-08-30',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1018',
    name: 'Sipho Daka',
    phone: '+260 97 881 2244',
    avatarInitials: 'SD',
    accountStatus: 'Suspended',
    walletBalance: 21000.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: 'Yesterday, 04:20 PM',
    lastActivityTimestamp: '2026-09-07T16:20:00Z',
    registeredDate: '12 May 2024',
    registeredDateIso: '2024-05-12',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1015',
    name: 'Brian Lungu',
    phone: '+260 97 998 1234',
    avatarInitials: 'BL',
    accountStatus: 'Active',
    walletBalance: 17650.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: true,
    recoveryCaseTitle: 'Passcode Lockout Assistance Case',
    lastActivity: 'Yesterday, 02:40 PM',
    lastActivityTimestamp: '2026-09-07T14:40:00Z',
    registeredDate: '18 Apr 2024',
    registeredDateIso: '2024-04-18',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1014',
    name: 'Taonga Phiri',
    phone: '+260 96 443 8901',
    avatarInitials: 'TP',
    accountStatus: 'Active',
    walletBalance: 9200.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: 'Yesterday, 01:15 PM',
    lastActivityTimestamp: '2026-09-07T13:15:00Z',
    registeredDate: '30 Oct 2024',
    registeredDateIso: '2024-10-30',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1012',
    name: 'Mutale Silwamba',
    phone: '+260 97 332 5678',
    avatarInitials: 'MS',
    accountStatus: 'Active',
    walletBalance: 12400.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: 'Yesterday, 11:30 AM',
    lastActivityTimestamp: '2026-09-07T11:30:00Z',
    registeredDate: '05 Mar 2025',
    registeredDateIso: '2025-03-05',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1010',
    name: 'Kunda Chisanga',
    phone: '+260 95 776 3421',
    avatarInitials: 'KC',
    accountStatus: 'Active',
    walletBalance: 6800.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: 'Yesterday, 09:10 AM',
    lastActivityTimestamp: '2026-09-07T09:10:00Z',
    registeredDate: '02 Sep 2024',
    registeredDateIso: '2024-09-02',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1008',
    name: 'Precious Mwale',
    phone: '+260 97 889 4433',
    avatarInitials: 'PM',
    accountStatus: 'Active',
    walletBalance: 23500.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: '06 Sep 2026, 03:45 PM',
    lastActivityTimestamp: '2026-09-06T15:45:00Z',
    registeredDate: '15 Mar 2024',
    registeredDateIso: '2024-03-15',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1006',
    name: 'Musonda Chanda',
    phone: '+260 96 112 7788',
    avatarInitials: 'MC',
    accountStatus: 'Active',
    walletBalance: 14900.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: '06 Sep 2026, 01:20 PM',
    lastActivityTimestamp: '2026-09-06T13:20:00Z',
    registeredDate: '08 Aug 2024',
    registeredDateIso: '2024-08-08',
    city: 'Kitwe',
  },
  {
    id: 'TB-CUS-1005',
    name: 'Kelvin Phiri',
    phone: '+260 97 554 9900',
    avatarInitials: 'KP',
    accountStatus: 'Active',
    walletBalance: 10750.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: '05 Sep 2026, 04:10 PM',
    lastActivityTimestamp: '2026-09-05T16:10:00Z',
    registeredDate: '04 Jul 2024',
    registeredDateIso: '2024-07-04',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1004',
    name: 'Monde Lisulo',
    phone: '+260 95 887 1122',
    avatarInitials: 'ML',
    accountStatus: 'Active',
    walletBalance: 8300.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 1,
    hasRecoverySupport: false,
    lastActivity: '05 Sep 2026, 11:25 AM',
    lastActivityTimestamp: '2026-09-05T11:25:00Z',
    registeredDate: '28 Dec 2024',
    registeredDateIso: '2024-12-28',
    city: 'Ndola',
  },
  {
    id: 'TB-CUS-1002',
    name: 'Natasha Mwaba',
    phone: '+260 97 223 8899',
    avatarInitials: 'NM',
    accountStatus: 'Active',
    walletBalance: 5600.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '04 Sep 2026, 02:15 PM',
    lastActivityTimestamp: '2026-09-04T14:15:00Z',
    registeredDate: '18 Feb 2025',
    registeredDateIso: '2025-02-18',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1001',
    name: 'Kondwani Banda',
    phone: '+260 96 334 5566',
    avatarInitials: 'KB',
    accountStatus: 'Active',
    walletBalance: 3400.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '03 Sep 2026, 10:45 AM',
    lastActivityTimestamp: '2026-09-03T10:45:00Z',
    registeredDate: '10 Feb 2024',
    registeredDateIso: '2024-02-10',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1033',
    name: 'Kondwani Banda',
    phone: '+260 96 345 6789',
    avatarInitials: 'KB',
    accountStatus: 'Active',
    walletBalance: 7800.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '12 Sep 2026, 09:30 AM',
    lastActivityTimestamp: '2026-09-12T09:30:00Z',
    registeredDate: '15 Mar 2024',
    registeredDateIso: '2024-03-15',
    city: 'Ndola',
  },
  {
    id: 'TB-CUS-1035',
    name: 'Natasha Tembo',
    phone: '+260 97 556 7890',
    avatarInitials: 'NT',
    accountStatus: 'Active',
    walletBalance: 11200.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '14 Sep 2026, 11:20 AM',
    lastActivityTimestamp: '2026-09-14T11:20:00Z',
    registeredDate: '22 Apr 2024',
    registeredDateIso: '2024-04-22',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1041',
    name: 'Mutale Mwape',
    phone: '+260 96 123 9900',
    avatarInitials: 'MM',
    accountStatus: 'Active',
    walletBalance: 15400.0,
    activeRequestsCount: 1,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '14 Sep 2026, 02:40 PM',
    lastActivityTimestamp: '2026-09-14T14:40:00Z',
    registeredDate: '08 Jan 2024',
    registeredDateIso: '2024-01-08',
    city: 'Kitwe',
  },
  {
    id: 'TB-CUS-1025',
    name: 'Kabwe Musonda',
    phone: '+260 95 667 8899',
    avatarInitials: 'KM',
    accountStatus: 'Active',
    walletBalance: 9800.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '10 Sep 2026, 04:15 PM',
    lastActivityTimestamp: '2026-09-10T16:15:00Z',
    registeredDate: '19 Nov 2023',
    registeredDateIso: '2023-11-19',
    city: 'Livingstone',
  },
  {
    id: 'TB-CUS-1043',
    name: 'Sibeso Mutale',
    phone: '+260 97 555 6677',
    avatarInitials: 'SM',
    accountStatus: 'Active',
    walletBalance: 6300.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '11 Sep 2026, 01:10 PM',
    lastActivityTimestamp: '2026-09-11T13:10:00Z',
    registeredDate: '04 May 2024',
    registeredDateIso: '2024-05-04',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1038',
    name: 'Chilufya Bwalya',
    phone: '+260 97 334 5566',
    avatarInitials: 'CB',
    accountStatus: 'Active',
    walletBalance: 8400.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '13 Sep 2026, 10:15 AM',
    lastActivityTimestamp: '2026-09-13T10:15:00Z',
    registeredDate: '27 Feb 2024',
    registeredDateIso: '2024-02-27',
    city: 'Ndola',
  },
  {
    id: 'TB-CUS-1029',
    name: 'Dalitso Zulu',
    phone: '+260 95 222 3344',
    avatarInitials: 'DZ',
    accountStatus: 'Active',
    walletBalance: 12500.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '12 Sep 2026, 03:20 PM',
    lastActivityTimestamp: '2026-09-12T15:20:00Z',
    registeredDate: '14 Jan 2024',
    registeredDateIso: '2024-01-14',
    city: 'Lusaka',
  },
  {
    id: 'TB-CUS-1031',
    name: 'Mapalo Kangwa',
    phone: '+260 96 998 7766',
    avatarInitials: 'MK',
    accountStatus: 'Active',
    walletBalance: 14800.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '11 Sep 2026, 11:05 AM',
    lastActivityTimestamp: '2026-09-11T11:05:00Z',
    registeredDate: '05 Apr 2024',
    registeredDateIso: '2024-04-05',
    city: 'Kabwe',
  },
  {
    id: 'TB-CUS-1040',
    name: 'Precious Chisamba',
    phone: '+260 95 889 0011',
    avatarInitials: 'PC',
    accountStatus: 'Active',
    walletBalance: 4200.0,
    activeRequestsCount: 0,
    pendingWithdrawalsCount: 0,
    hasRecoverySupport: false,
    lastActivity: '09 Sep 2026, 04:50 PM',
    lastActivityTimestamp: '2026-09-09T16:50:00Z',
    registeredDate: '19 Jan 2024',
    registeredDateIso: '2024-01-19',
    city: 'Lusaka',
  },
];

/**
 * Derives dynamic summary counts from existing customer data.
 */
export const getCustomerSummary = (
  customers: CustomerRecord[] = MOCK_REGISTERED_CUSTOMERS
): CustomerSummary => {
  return {
    totalCustomers: customers.length,
    activeAccounts: customers.filter((c) => c.accountStatus === 'Active').length,
    activeRequests: customers.filter((c) => c.activeRequestsCount > 0).length,
    pendingWithdrawals: customers.filter((c) => c.pendingWithdrawalsCount > 0).length,
    recoverySupport: customers.filter((c) => c.hasRecoverySupport).length,
  };
};

/**
 * Retrieves a customer by their unique ID.
 */
export const getCustomerById = (id: string): CustomerRecord | undefined => {
  return MOCK_REGISTERED_CUSTOMERS.find((c) => c.id === id);
};

/**
 * Retrieves a customer by their full name.
 */
export const getCustomerByName = (name: string): CustomerRecord | undefined => {
  const q = name.toLowerCase().trim();
  return MOCK_REGISTERED_CUSTOMERS.find((c) => c.name.toLowerCase() === q);
};

/**
 * Formats or validates Zambian mobile number to canonical "+260 96 123 9900" style.
 * Displays all digits with no asterisks, bullets, or hidden digits.
 */
export const formatZambianFullPhone = (phone: string): string => {
  if (!phone) return '+260 96 123 9900';
  const cleanDigits = phone.replace(/\D/g, '');
  if (cleanDigits.startsWith('260') && cleanDigits.length === 12) {
    const net = cleanDigits.slice(3, 5);
    const mid = cleanDigits.slice(5, 8);
    const last = cleanDigits.slice(8, 12);
    return `+260 ${net} ${mid} ${last}`;
  }
  if (cleanDigits.length === 9) {
    const net = cleanDigits.slice(0, 2);
    const mid = cleanDigits.slice(2, 5);
    const last = cleanDigits.slice(5, 9);
    return `+260 ${net} ${mid} ${last}`;
  }
  return phone;
};

/**
 * Retrieves the unmasked, complete registered mobile number for a customer.
 * Adheres strictly to format "+260 96 123 9900" with zero masked characters.
 */
export const getCustomerRegisteredPhone = (
  customerId: string,
  customerName?: string
): string => {
  const customer = getCustomerById(customerId) || (customerName ? getCustomerByName(customerName) : undefined);
  if (customer && customer.phone) {
    return formatZambianFullPhone(customer.phone);
  }
  return '+260 96 123 9900';
};

/**
 * Filters and sorts customer records based on criteria.
 */
export const filterAndSortCustomers = (
  customers: CustomerRecord[],
  filters: CustomerFilters,
  sort: { field: CustomerSortField; direction: CustomerSortDirection }
): CustomerRecord[] => {
  let result = [...customers];

  // 1. Quick Filter from Summary Cards
  if (filters.quickFilter === 'ACTIVE_ACCOUNTS') {
    result = result.filter((c) => c.accountStatus === 'Active');
  } else if (filters.quickFilter === 'ACTIVE_REQUESTS') {
    result = result.filter((c) => c.activeRequestsCount > 0);
  } else if (filters.quickFilter === 'PENDING_WITHDRAWALS') {
    result = result.filter((c) => c.pendingWithdrawalsCount > 0);
  } else if (filters.quickFilter === 'RECOVERY_SUPPORT') {
    result = result.filter((c) => c.hasRecoverySupport);
  }

  // 2. Search query: Customer name, Customer ID, or mobile number (digits or text)
  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim().toLowerCase();
    const cleanDigits = term.replace(/\D/g, '');
    result = result.filter((c) => {
      const matchName = c.name.toLowerCase().includes(term);
      const matchId = c.id.toLowerCase().includes(term);
      const matchPhoneText = c.phone.toLowerCase().includes(term);
      const matchPhoneDigits =
        cleanDigits.length >= 3 &&
        c.phone.replace(/\D/g, '').includes(cleanDigits);
      return matchName || matchId || matchPhoneText || matchPhoneDigits;
    });
  }

  // 3. Account Status
  if (filters.accountStatus !== 'ALL') {
    result = result.filter((c) => c.accountStatus === filters.accountStatus);
  }

  // 4. Request State
  if (filters.requestState === 'HAS_ACTIVE') {
    result = result.filter((c) => c.activeRequestsCount > 0);
  } else if (filters.requestState === 'NO_ACTIVE') {
    result = result.filter((c) => c.activeRequestsCount === 0);
  }

  // 5. Withdrawal State
  if (filters.withdrawalState === 'HAS_PENDING') {
    result = result.filter((c) => c.pendingWithdrawalsCount > 0);
  } else if (filters.withdrawalState === 'NO_PENDING') {
    result = result.filter((c) => c.pendingWithdrawalsCount === 0);
  }

  // 6. Registration Date Range
  if (filters.fromDate) {
    result = result.filter((c) => c.registeredDateIso >= filters.fromDate);
  }
  if (filters.toDate) {
    result = result.filter((c) => c.registeredDateIso <= filters.toDate);
  }

  // 7. Sorting
  result.sort((a, b) => {
    let comparison = 0;
    switch (sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'walletBalance':
        comparison = a.walletBalance - b.walletBalance;
        break;
      case 'activeRequestsCount':
        comparison = a.activeRequestsCount - b.activeRequestsCount;
        break;
      case 'pendingWithdrawalsCount':
        comparison = a.pendingWithdrawalsCount - b.pendingWithdrawalsCount;
        break;
      case 'lastActivityTimestamp':
        comparison = a.lastActivityTimestamp.localeCompare(b.lastActivityTimestamp);
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
};
