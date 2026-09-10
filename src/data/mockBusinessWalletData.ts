import {
  BusinessGlobalWallet,
  BusinessWalletFilters,
  BusinessWalletSummary,
  BusinessWalletSortField,
  BusinessWalletSortDirection,
} from '../types/businessWallet';

export const MOCK_BUSINESS_WALLETS: BusinessGlobalWallet[] = [
  {
    id: 'bwl-001',
    businessId: 'BIZ-CHI-001',
    businessName: 'Chipata Eastern Financial Agency',
    businessInitials: 'CE',
    walletId: 'TB-BWL-1001',
    ownerName: 'Aliness Phiri',
    ownerId: 'USR-BO-007',
    postedBalance: 0.0,
    availableBalance: 0.0,
    reservedFunds: 0.0,
    health: 'Needs Review',
    state: 'Pending',
    updatedAt: '2026-08-28T14:20:00Z',
  },
  {
    id: 'bwl-002',
    businessId: 'BIZ-COP-002',
    businessName: 'Copperbelt Financial Services',
    businessInitials: 'CF',
    walletId: 'TB-BWL-1002',
    ownerName: 'Joseph Mwale',
    ownerId: 'USR-BO-003',
    postedBalance: 142600.0,
    availableBalance: 129800.0,
    reservedFunds: 12800.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T09:15:00Z',
  },
  {
    id: 'bwl-003',
    businessId: 'BIZ-COP-003',
    businessName: 'Copperbelt Liquidity Hub',
    businessInitials: 'CL',
    walletId: 'TB-BWL-1003',
    ownerName: 'Mulenga Chanda',
    ownerId: 'USR-BO-004',
    postedBalance: 18200.0,
    availableBalance: 12200.0,
    reservedFunds: 6000.0,
    health: 'Low Balance',
    state: 'Active',
    updatedAt: '2026-08-30T16:45:00Z',
  },
  {
    id: 'bwl-004',
    businessId: 'BIZ-KAB-001',
    businessName: 'Kabwata Market Agency',
    businessInitials: 'KM',
    walletId: 'TB-BWL-1004',
    ownerName: 'Taonga Banda',
    ownerId: 'USR-BO-002',
    postedBalance: 89400.0,
    availableBalance: 82000.0,
    reservedFunds: 7400.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T10:10:00Z',
  },
  {
    id: 'bwl-005',
    businessId: 'BIZ-KBW-001',
    businessName: 'Kabwe Central Agency',
    businessInitials: 'KC',
    walletId: 'TB-BWL-1005',
    ownerName: 'Given Chilufya',
    ownerId: 'USR-BO-008',
    postedBalance: 4100.0,
    availableBalance: 4100.0,
    reservedFunds: 0.0,
    health: 'Needs Review',
    state: 'Suspended',
    updatedAt: '2026-08-25T11:00:00Z',
  },
  {
    id: 'bwl-006',
    businessId: 'BIZ-LIV-001',
    businessName: 'Livingstone Tourist Kiosk Agency',
    businessInitials: 'LT',
    walletId: 'TB-BWL-1006',
    ownerName: 'Lubinda Mwanawasa',
    ownerId: 'USR-BO-006',
    postedBalance: 35900.0,
    availableBalance: 33400.0,
    reservedFunds: 2500.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T08:30:00Z',
  },
  {
    id: 'bwl-007',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessInitials: 'LC',
    walletId: 'TB-BWL-1007',
    ownerName: 'Chileshe Mwamba',
    ownerId: 'USR-BO-001',
    postedBalance: 164350.0,
    availableBalance: 145900.0,
    reservedFunds: 18450.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T11:20:00Z',
  },
  {
    id: 'bwl-008',
    businessId: 'BIZ-NDO-001',
    businessName: 'Ndola Copperbelt Agency',
    businessInitials: 'NC',
    walletId: 'TB-BWL-1008',
    ownerName: 'Kasonde Musonda',
    ownerId: 'USR-BO-005',
    postedBalance: 52800.0,
    availableBalance: 48950.0,
    reservedFunds: 3850.0,
    health: 'Funds Reserved',
    state: 'Active',
    updatedAt: '2026-08-31T07:45:00Z',
  },
];

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
    if (w.health === 'Needs Review') {
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

  // Search filter: business name, Business ID, owner name, owner ID, or Wallet ID
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

  // Wallet Health filter
  if (filters.health && filters.health !== 'ALL') {
    result = result.filter((w) => w.health === filters.health);
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
        result = result.filter((w) => w.health === 'Needs Review');
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
    let aVal: any = a[sort.field];
    let bVal: any = b[sort.field];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
}
