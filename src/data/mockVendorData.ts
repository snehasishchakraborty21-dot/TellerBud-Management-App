import { VendorRecord, VendorSummaryMetrics, VendorFilters, VendorSortField, SortDirection } from '../types/vendor';

export const MOCK_VENDOR_RECORDS: VendorRecord[] = [
  {
    id: 'TB-VND-MTN-001',
    name: 'MTN Mobile Money',
    type: 'Mobile Money',
    services: ['Cash Pickup', 'Wallet Funding', 'Customer Withdrawal'],
    integrationMode: 'Direct REST API',
    status: 'Active',
    lastUpdated: 'Today, 11:48 AM',
    lastUpdatedTimestamp: new Date('2026-09-11T11:48:00').getTime(),
    logo: '/assets/vendors/mtn.svg',
    historicalTransactionsCount: 28450,
  },
  {
    id: 'TB-VND-ATL-002',
    name: 'Airtel Money',
    type: 'Mobile Money',
    services: ['Cash Pickup', 'Wallet Funding', 'Customer Withdrawal'],
    integrationMode: 'Merchant REST API',
    status: 'Active',
    lastUpdated: 'Today, 11:42 AM',
    lastUpdatedTimestamp: new Date('2026-09-11T11:42:00').getTime(),
    logo: '/assets/vendors/airtel.svg',
    historicalTransactionsCount: 31200,
  },
  {
    id: 'TB-VND-ZMT-003',
    name: 'Zamtel',
    type: 'Mobile Money',
    services: ['Cash Pickup'],
    integrationMode: 'Manual Settlement',
    status: 'Inactive',
    lastUpdated: '10 Sep 2026, 4:30 PM',
    lastUpdatedTimestamp: new Date('2026-09-10T16:30:00').getTime(),
    logo: '/assets/vendors/zamtel.svg',
    historicalTransactionsCount: 4210,
  },
  {
    id: 'TB-VND-ZNC-004',
    name: 'Zanaco',
    type: 'Bank',
    services: ['Cash Pickup', 'Walk-In Transaction'],
    integrationMode: 'Bank Integration',
    status: 'Active',
    lastUpdated: 'Today, 10:35 AM',
    lastUpdatedTimestamp: new Date('2026-09-11T10:35:00').getTime(),
    logo: '/assets/vendors/zanaco.svg',
    historicalTransactionsCount: 18900,
  },
  {
    id: 'TB-VND-FNB-005',
    name: 'FNB',
    type: 'Bank',
    services: ['Cash Pickup', 'Walk-In Transaction'],
    integrationMode: 'Bank Integration',
    status: 'Active',
    lastUpdated: 'Today, 10:20 AM',
    lastUpdatedTimestamp: new Date('2026-09-11T10:20:00').getTime(),
    logo: '/assets/vendors/fnb.svg',
    historicalTransactionsCount: 15420,
  },
  {
    id: 'TB-VND-IND-006',
    name: 'INDO Zambia Bank',
    type: 'Bank',
    services: ['Cash Pickup', 'Walk-In Transaction'],
    integrationMode: 'Bank Integration',
    status: 'Active',
    lastUpdated: 'Today, 9:55 AM',
    lastUpdatedTimestamp: new Date('2026-09-11T09:55:00').getTime(),
    logo: '/assets/vendors/indo.svg',
    historicalTransactionsCount: 9850,
  },
  {
    id: 'TB-VND-STB-007',
    name: 'Stanbic Bank',
    type: 'Bank',
    services: ['Cash Pickup', 'Walk-In Transaction'],
    integrationMode: 'Bank Integration',
    status: 'Active',
    lastUpdated: 'Today, 9:40 AM',
    lastUpdatedTimestamp: new Date('2026-09-11T09:40:00').getTime(),
    logo: '/assets/vendors/stanbic.svg',
    historicalTransactionsCount: 12400,
  },
  {
    id: 'TB-VND-ACS-008',
    name: 'Access Bank',
    type: 'Bank',
    services: ['Cash Pickup', 'Walk-In Transaction'],
    integrationMode: 'Bank Integration',
    status: 'Active',
    lastUpdated: 'Today, 9:25 AM',
    lastUpdatedTimestamp: new Date('2026-09-11T09:25:00').getTime(),
    logo: '/assets/vendors/access.svg',
    historicalTransactionsCount: 8150,
  },
];

export const MOCK_VENDOR_SUMMARY: VendorSummaryMetrics = {
  totalVendors: 8,
  activeVendors: 7,
  mobileMoneyProviders: 3,
  bankingProviders: 5,
  inactiveVendors: 1,
};

export function filterAndSortVendors(
  vendors: VendorRecord[],
  filters: VendorFilters,
  sort: { field: VendorSortField; direction: SortDirection }
): VendorRecord[] {
  let result = [...vendors];

  // 1. Search filter: by name or vendor ID
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
    );
  }

  // 2. Vendor Type filter
  if (filters.type !== 'All') {
    result = result.filter((v) => v.type === filters.type);
  }

  // 3. Status filter
  if (filters.status !== 'All') {
    result = result.filter((v) => v.status === filters.status);
  }

  // 4. Supported Service filter
  if (filters.service !== 'All') {
    result = result.filter((v) => v.services.includes(filters.service as any));
  }

  // 5. Sorting
  result.sort((a, b) => {
    let cmp = 0;
    switch (sort.field) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'id':
        cmp = a.id.localeCompare(b.id);
        break;
      case 'type':
        cmp = a.type.localeCompare(b.type);
        break;
      case 'integrationMode':
        cmp = a.integrationMode.localeCompare(b.integrationMode);
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
      case 'lastUpdated':
        cmp = a.lastUpdatedTimestamp - b.lastUpdatedTimestamp;
        break;
      default:
        cmp = 0;
    }
    return sort.direction === 'asc' ? cmp : -cmp;
  });

  return result;
}
