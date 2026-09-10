export type BusinessWalletState = 'Active' | 'Pending' | 'Suspended';

export type BusinessWalletHealth =
  | 'Healthy'
  | 'Low Balance'
  | 'Funds Reserved'
  | 'Needs Review';

export interface BusinessGlobalWallet {
  id: string; // Internal id
  businessId: string; // e.g. 'BIZ-CHI-001'
  businessName: string; // e.g. 'Chipata Eastern Financial Agency'
  businessInitials: string; // e.g. 'CE'
  walletId: string; // e.g. 'TB-BWL-1001'
  ownerName: string; // e.g. 'Aliness Phiri'
  ownerId: string; // e.g. 'USR-BO-007'
  postedBalance: number; // e.g. 0.00
  availableBalance: number; // e.g. 0.00
  reservedFunds: number; // e.g. 0.00
  health: BusinessWalletHealth;
  state: BusinessWalletState;
  updatedAt: string; // ISO timestamp
}

export type BalanceRangeFilter =
  | 'ALL'
  | '0-10000'
  | '10001-50000'
  | '50001-100000'
  | 'above-100000';

export interface BusinessWalletFilters {
  search: string;
  state: BusinessWalletState | 'ALL';
  health: BusinessWalletHealth | 'ALL';
  balanceRange: BalanceRangeFilter;
  updatedFrom: string;
  updatedTo: string;
  kpiFilter: 'ALL' | 'TOTAL_BALANCE' | 'AVAILABLE' | 'RESERVED' | 'NEEDS_REVIEW';
}

export type BusinessWalletSortField =
  | 'businessName'
  | 'ownerName'
  | 'postedBalance'
  | 'availableBalance'
  | 'reservedFunds'
  | 'health'
  | 'state'
  | 'updatedAt';

export type BusinessWalletSortDirection = 'asc' | 'desc';

export interface BusinessWalletSummary {
  totalWallets: number;
  totalWalletBalance: number;
  totalAvailableBalance: number;
  totalReservedFunds: number;
  walletsNeedingReview: number;
}
