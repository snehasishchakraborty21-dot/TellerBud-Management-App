import {
  BusinessGlobalWallet,
  BusinessWalletFilters,
  BusinessWalletSummary,
  BusinessWalletSortField,
  BusinessWalletSortDirection,
  BusinessWalletState,
} from '../types/businessWallet';

export interface BusinessWalletAuditLogEntry {
  id: string;
  walletId: string;
  businessId: string;
  businessName: string;
  action: 'SUSPEND' | 'REACTIVATE';
  previousState: BusinessWalletState;
  newState: BusinessWalletState;
  adminUser: string;
  timestamp: string; // ISO timestamp
  reason: string;
}

export const MOCK_BUSINESS_WALLET_AUDIT_LOGS: BusinessWalletAuditLogEntry[] = [
  {
    id: 'WAL-AUD-001',
    walletId: 'TB-BWL-000003',
    businessId: 'TB-BIZ-000008',
    businessName: 'Kabwe Central Agency',
    action: 'SUSPEND',
    previousState: 'Active',
    newState: 'Suspended',
    adminUser: 'Admin User (Operations Lead)',
    timestamp: '2026-08-25T11:00:00Z',
    reason: 'Compliance audit hold pending documentation verification',
  },
];

export const MOCK_BUSINESS_WALLETS: BusinessGlobalWallet[] = [
  {
    id: 'bwl-007',
    businessId: 'TB-BIZ-000001',
    businessName: 'Lusaka Central Express Agency',
    businessInitials: 'LC',
    walletId: 'TB-BWL-000002',
    ownerName: 'Chileshe Mwamba',
    ownerId: 'USR-BO-001',
    postedBalance: 164350.0,
    availableBalance: 145900.0,
    reservedFunds: 18450.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T11:20:00Z',
    createdAt: '2023-01-14T09:00:00.000Z',
    registeredDateIso: '2023-01-14',
  },
  {
    id: 'bwl-004',
    businessId: 'TB-BIZ-000002',
    businessName: 'Kabwata Market Agency',
    businessInitials: 'KM',
    walletId: 'TB-BWL-000004',
    ownerName: 'Taonga Banda',
    ownerId: 'USR-BO-002',
    postedBalance: 89400.0,
    availableBalance: 82000.0,
    reservedFunds: 7400.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T10:10:00Z',
    createdAt: '2023-03-02T11:05:00.000Z',
    registeredDateIso: '2023-03-02',
  },
  {
    id: 'bwl-002',
    businessId: 'TB-BIZ-000003',
    businessName: 'Copperbelt Financial Services',
    businessInitials: 'CF',
    walletId: 'TB-BWL-000001',
    ownerName: 'Joseph Mwale',
    ownerId: 'USR-BO-003',
    postedBalance: 142600.0,
    availableBalance: 129800.0,
    reservedFunds: 12800.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T09:15:00Z',
    createdAt: '2022-11-20T10:40:00.000Z',
    registeredDateIso: '2022-11-20',
  },
  {
    id: 'bwl-003',
    businessId: 'TB-BIZ-000004',
    businessName: 'Copperbelt Liquidity Hub',
    businessInitials: 'CL',
    walletId: 'TB-BWL-000005',
    ownerName: 'Mulenga Chanda',
    ownerId: 'USR-BO-004',
    postedBalance: 18200.0,
    availableBalance: 12200.0,
    reservedFunds: 6000.0,
    health: 'Low Balance',
    state: 'Active',
    updatedAt: '2026-08-30T16:45:00Z',
    createdAt: '2023-07-15T09:15:00.000Z',
    registeredDateIso: '2023-07-15',
  },
  {
    id: 'bwl-008',
    businessId: 'TB-BIZ-000005',
    businessName: 'Ndola Copperbelt Agency',
    businessInitials: 'NC',
    walletId: 'TB-BWL-000006',
    ownerName: 'Kasonde Musonda',
    ownerId: 'USR-BO-005',
    postedBalance: 52800.0,
    availableBalance: 48950.0,
    reservedFunds: 3850.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T07:45:00Z',
    createdAt: '2023-08-10T16:30:00.000Z',
    registeredDateIso: '2023-08-10',
  },
  {
    id: 'bwl-006',
    businessId: 'TB-BIZ-000006',
    businessName: 'Livingstone Tourist Kiosk Agency',
    businessInitials: 'LT',
    walletId: 'TB-BWL-000007',
    ownerName: 'Lubinda Mwanawasa',
    ownerId: 'USR-BO-006',
    postedBalance: 35900.0,
    availableBalance: 33400.0,
    reservedFunds: 2500.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T08:30:00Z',
    createdAt: '2024-05-05T08:20:00.000Z',
    registeredDateIso: '2024-05-05',
  },
  {
    id: 'bwl-001',
    businessId: 'TB-BIZ-000007',
    businessName: 'Chipata Eastern Financial Agency',
    businessInitials: 'CE',
    walletId: 'TB-BWL-000008',
    ownerName: 'Aliness Phiri',
    ownerId: 'USR-BO-007',
    postedBalance: 0.0,
    availableBalance: 0.0,
    reservedFunds: 0.0,
    health: 'Needs Review',
    state: 'Pending',
    updatedAt: '2026-08-28T14:20:00Z',
    createdAt: '2026-08-28T14:00:00.000Z',
    registeredDateIso: '2026-08-28',
  },
  {
    id: 'bwl-005',
    businessId: 'TB-BIZ-000008',
    businessName: 'Kabwe Central Agency',
    businessInitials: 'KC',
    walletId: 'TB-BWL-000003',
    ownerName: 'Given Chilufya',
    ownerId: 'USR-BO-008',
    postedBalance: 4100.0,
    availableBalance: 4100.0,
    reservedFunds: 0.0,
    health: 'Needs Review',
    state: 'Suspended',
    updatedAt: '2026-08-25T11:00:00Z',
    createdAt: '2023-02-18T10:00:00.000Z',
    registeredDateIso: '2023-02-18',
  },
];

export function updateBusinessWalletState(
  walletId: string,
  newState: BusinessWalletState,
  adminUser = 'Admin User',
  reason = ''
): BusinessGlobalWallet | null {
  const wallet = MOCK_BUSINESS_WALLETS.find((w) => w.walletId === walletId || w.id === walletId);
  if (!wallet) return null;

  const previousState = wallet.state;
  wallet.state = newState;
  wallet.updatedAt = new Date().toISOString();

  // Record audit log
  MOCK_BUSINESS_WALLET_AUDIT_LOGS.unshift({
    id: `WAL-AUD-${Date.now().toString().slice(-6)}`,
    walletId: wallet.walletId,
    businessId: wallet.businessId,
    businessName: wallet.businessName,
    action: newState === 'Suspended' ? 'SUSPEND' : 'REACTIVATE',
    previousState,
    newState,
    adminUser,
    timestamp: new Date().toISOString(),
    reason: reason || (newState === 'Suspended' ? 'Suspended by admin' : 'Reactivated by admin'),
  });

  return { ...wallet };
}

export function formatZMW(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateBusinessWalletSummary(
  wallets: BusinessGlobalWallet[]
): BusinessWalletSummary {
  const totalWallets = wallets.length;
  let totalWalletBalance = 0;
  let totalAvailableBalance = 0;
  let totalReservedFunds = 0;
  let walletsNeedingReview = 0;

  for (const w of wallets) {
    totalWalletBalance += w.postedBalance;
    totalAvailableBalance += w.availableBalance;
    totalReservedFunds += w.reservedFunds;
    if (w.health === 'Needs Review' || w.state === 'Suspended') {
      walletsNeedingReview += 1;
    }
  }

  return {
    totalWallets,
    totalWalletBalance,
    totalAvailableBalance,
    totalReservedFunds,
    walletsNeedingReview,
  };
}

export function filterAndSortBusinessWallets(
  wallets: BusinessGlobalWallet[],
  filters: BusinessWalletFilters,
  sort: { field: BusinessWalletSortField; direction: BusinessWalletSortDirection }
): BusinessGlobalWallet[] {
  let result = [...wallets];

  // Search filter (if provided)
  if (filters.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (w) =>
        w.businessName.toLowerCase().includes(q) ||
        w.businessId.toLowerCase().includes(q) ||
        w.ownerName.toLowerCase().includes(q) ||
        w.ownerId.toLowerCase().includes(q) ||
        w.walletId.toLowerCase().includes(q)
    );
  }

  // Wallet State filter
  if (filters.state && filters.state !== 'ALL') {
    result = result.filter((w) => w.state === filters.state);
  }

  // Balance Range filter
  if (filters.balanceRange && filters.balanceRange !== 'ALL') {
    switch (filters.balanceRange) {
      case '0-10000':
        result = result.filter((w) => w.postedBalance >= 0 && w.postedBalance <= 10000);
        break;
      case '10001-50000':
        result = result.filter((w) => w.postedBalance > 10000 && w.postedBalance <= 50000);
        break;
      case '50001-100000':
        result = result.filter((w) => w.postedBalance > 50000 && w.postedBalance <= 100000);
        break;
      case 'above-100000':
        result = result.filter((w) => w.postedBalance > 100000);
        break;
    }
  }

  // Updated From date
  if (filters.updatedFrom) {
    const fromTime = new Date(filters.updatedFrom).getTime();
    if (!isNaN(fromTime)) {
      result = result.filter((w) => new Date(w.updatedAt).getTime() >= fromTime);
    }
  }

  // Updated To date
  if (filters.updatedTo) {
    // End of day
    const toDate = new Date(filters.updatedTo);
    toDate.setHours(23, 59, 59, 999);
    const toTime = toDate.getTime();
    if (!isNaN(toTime)) {
      result = result.filter((w) => new Date(w.updatedAt).getTime() <= toTime);
    }
  }

  // KPI filter
  if (filters.kpiFilter && filters.kpiFilter !== 'ALL') {
    switch (filters.kpiFilter) {
      case 'NEEDS_REVIEW':
        result = result.filter((w) => w.health === 'Needs Review' || w.state === 'Suspended');
        break;
      case 'RESERVED':
        result = result.filter((w) => w.reservedFunds > 0);
        break;
      case 'AVAILABLE':
        result = result.filter((w) => w.availableBalance > 0);
        break;
      case 'TOTAL_BALANCE':
        result = result.filter((w) => w.postedBalance > 0);
        break;
    }
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0;

    if (sort.field === 'registeredDateIso' || sort.field === 'createdAt') {
      const timeA = new Date(a.createdAt || a.registeredDateIso || 0).getTime();
      const timeB = new Date(b.createdAt || b.registeredDateIso || 0).getTime();
      comparison = timeA - timeB;
    } else if (sort.field === 'postedBalance') {
      comparison = a.postedBalance - b.postedBalance;
    } else if (sort.field === 'availableBalance') {
      comparison = a.availableBalance - b.availableBalance;
    } else if (sort.field === 'reservedFunds') {
      comparison = a.reservedFunds - b.reservedFunds;
    } else if (sort.field === 'businessName') {
      comparison = a.businessName.localeCompare(b.businessName);
    } else if (sort.field === 'businessId') {
      comparison = a.businessId.localeCompare(b.businessId);
    } else if (sort.field === 'ownerName') {
      comparison = a.ownerName.localeCompare(b.ownerName);
    } else if (sort.field === 'walletId') {
      comparison = a.walletId.localeCompare(b.walletId);
    } else if (sort.field === 'state') {
      comparison = a.state.localeCompare(b.state);
    } else if (sort.field === 'updatedAt') {
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    } else {
      let aVal: any = (a as any)[sort.field];
      let bVal: any = (b as any)[sort.field];
      if (typeof aVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else {
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
    }

    // Stable tie breaker by businessId
    if (comparison === 0) {
      comparison = a.businessId.localeCompare(b.businessId);
    }

    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return result;
}
