import { WalkInTransaction, WalkInStatusSummary } from '../types/admin';

export const MOCK_WALK_IN_TRANSACTIONS: WalkInTransaction[] = [
  {
    id: 'WLK-001',
    reference: 'TB-WLK-3301',
    agentName: 'Natasha Zulu',
    agentId: 'TB-AGT-1062',
    agentPhone: '+260 97 556 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 97 112 3456',
    transactionType: 'Deposit',
    vendor: 'MTN',
    amount: 3200.0,
    transactionTime: '2026-08-31T11:15:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-MTN-771902',
    terminalId: 'POS-LUS-04',
    timeline: [
      {
        id: 'TL-WLK-3301-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T11:13:00+02:00',
      },
      {
        id: 'TL-WLK-3301-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T11:13:45+02:00',
      },
      {
        id: 'TL-WLK-3301-3',
        status: 'Vendor Processing',
        timestamp: '2026-08-31T11:14:15+02:00',
      },
      {
        id: 'TL-WLK-3301-4',
        status: 'Completed',
        timestamp: '2026-08-31T11:15:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-002',
    reference: 'TB-WLK-3302',
    agentName: 'Kelvin Phiri',
    agentId: 'TB-AGT-1024',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 97 445 6789',
    transactionType: 'Withdrawal',
    vendor: 'MTN',
    amount: 1800.0,
    transactionTime: '2026-08-31T11:05:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-MTN-88201',
    terminalId: 'POS-LUS-01',
    timeline: [
      {
        id: 'TL-WLK-3302-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T11:03:10+02:00',
      },
      {
        id: 'TL-WLK-3302-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T11:04:00+02:00',
      },
      {
        id: 'TL-WLK-3302-3',
        status: 'Vendor Processing',
        timestamp: '2026-08-31T11:04:30+02:00',
      },
      {
        id: 'TL-WLK-3302-4',
        status: 'Completed',
        timestamp: '2026-08-31T11:05:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-003',
    reference: 'TB-WLK-3303',
    agentName: 'Faith Mwewa',
    agentId: 'TB-AGT-1050',
    agentPhone: '+260 97 456 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 96 667 8901',
    transactionType: 'Purchase',
    vendor: 'Airtel',
    amount: 950.0,
    transactionTime: '2026-08-31T10:48:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-AIR-44109',
    terminalId: 'POS-LUS-03',
    timeline: [
      {
        id: 'TL-WLK-3303-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T10:46:00+02:00',
      },
      {
        id: 'TL-WLK-3303-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T10:47:00+02:00',
      },
      {
        id: 'TL-WLK-3303-3',
        status: 'Vendor Processing',
        timestamp: '2026-08-31T10:47:30+02:00',
      },
      {
        id: 'TL-WLK-3303-4',
        status: 'Completed',
        timestamp: '2026-08-31T10:48:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-004',
    reference: 'TB-WLK-3304',
    agentName: 'Patricia Chanda',
    agentId: 'TB-AGT-1049',
    agentPhone: '+260 97 888 1234',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 95 334 5678',
    transactionType: 'Deposit',
    vendor: 'Airtel',
    amount: 5000.0,
    transactionTime: '2026-08-31T10:30:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-AIR-99031',
    terminalId: 'POS-LUS-02',
    timeline: [
      {
        id: 'TL-WLK-3304-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T10:28:00+02:00',
      },
      {
        id: 'TL-WLK-3304-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T10:28:50+02:00',
      },
      {
        id: 'TL-WLK-3304-3',
        status: 'Vendor Processing',
        timestamp: '2026-08-31T10:29:20+02:00',
      },
      {
        id: 'TL-WLK-3304-4',
        status: 'Completed',
        timestamp: '2026-08-31T10:30:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-005',
    reference: 'TB-WLK-3305',
    agentName: 'Joseph Kaunda',
    agentId: 'TB-AGT-1033',
    agentPhone: '+260 95 889 0123',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 97 778 9012',
    transactionType: 'Withdrawal',
    vendor: 'Zamtel',
    amount: 750.0,
    transactionTime: '2026-08-31T10:15:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-ZAM-10492',
    terminalId: 'POS-LUS-05',
    timeline: [
      {
        id: 'TL-WLK-3305-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T10:13:30+02:00',
      },
      {
        id: 'TL-WLK-3305-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T10:14:10+02:00',
      },
      {
        id: 'TL-WLK-3305-3',
        status: 'Vendor Processing',
        timestamp: '2026-08-31T10:14:35+02:00',
      },
      {
        id: 'TL-WLK-3305-4',
        status: 'Completed',
        timestamp: '2026-08-31T10:15:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-006',
    reference: 'TB-WLK-3306',
    agentName: 'Natasha Zulu',
    agentId: 'TB-AGT-1062',
    agentPhone: '+260 97 556 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 96 990 1234',
    transactionType: 'Purchase',
    vendor: 'MTN',
    amount: 2200.0,
    transactionTime: '2026-08-31T09:55:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-MTN-33104',
    terminalId: 'POS-LUS-04',
    timeline: [
      {
        id: 'TL-WLK-3306-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T09:53:00+02:00',
      },
      {
        id: 'TL-WLK-3306-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T09:53:50+02:00',
      },
      {
        id: 'TL-WLK-3306-3',
        status: 'Vendor Processing',
        timestamp: '2026-08-31T09:54:20+02:00',
      },
      {
        id: 'TL-WLK-3306-4',
        status: 'Completed',
        timestamp: '2026-08-31T09:55:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-007',
    reference: 'TB-WLK-3307',
    agentName: 'Kelvin Phiri',
    agentId: 'TB-AGT-1024',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 95 112 2334',
    transactionType: 'Deposit',
    vendor: 'Zamtel',
    amount: 4100.0,
    transactionTime: '2026-08-31T09:35:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-ZAM-88912',
    terminalId: 'POS-LUS-01',
    timeline: [
      {
        id: 'TL-WLK-3307-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T09:33:00+02:00',
      },
      {
        id: 'TL-WLK-3307-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T09:33:45+02:00',
      },
      {
        id: 'TL-WLK-3307-3',
        status: 'Vendor Processing',
        timestamp: '2026-08-31T09:34:15+02:00',
      },
      {
        id: 'TL-WLK-3307-4',
        status: 'Completed',
        timestamp: '2026-08-31T09:35:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-008',
    reference: 'TB-WLK-3308',
    agentName: 'Faith Mwewa',
    agentId: 'TB-AGT-1050',
    agentPhone: '+260 97 456 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 97 334 4556',
    transactionType: 'Withdrawal',
    vendor: 'Airtel',
    amount: 1250.0,
    transactionTime: '2026-08-31T09:10:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-AIR-55210',
    terminalId: 'POS-LUS-03',
    timeline: [
      {
        id: 'TL-WLK-3308-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T09:08:00+02:00',
      },
      {
        id: 'TL-WLK-3308-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T09:08:45+02:00',
      },
      {
        id: 'TL-WLK-3308-3',
        status: 'Vendor Processing',
        timestamp: '2026-08-31T09:09:20+02:00',
      },
      {
        id: 'TL-WLK-3308-4',
        status: 'Completed',
        timestamp: '2026-08-31T09:10:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-009',
    reference: 'TB-WLK-3309',
    agentName: 'Patricia Chanda',
    agentId: 'TB-AGT-1049',
    agentPhone: '+260 97 888 1234',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 97 889 0123',
    transactionType: 'Deposit',
    vendor: 'MTN',
    amount: 6000.0,
    transactionTime: '2026-08-31T08:50:00+02:00',
    status: 'Processing',
    terminalId: 'POS-LUS-02',
    timeline: [
      {
        id: 'TL-WLK-3309-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T08:48:00+02:00',
      },
      {
        id: 'TL-WLK-3309-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T08:48:40+02:00',
      },
      {
        id: 'TL-WLK-3309-3',
        status: 'Processing',
        timestamp: '2026-08-31T08:50:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-010',
    reference: 'TB-WLK-3310',
    agentName: 'Natasha Zulu',
    agentId: 'TB-AGT-1062',
    agentPhone: '+260 97 556 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 96 223 4567',
    transactionType: 'Withdrawal',
    vendor: 'Airtel',
    amount: 1500.0,
    transactionTime: '2026-08-31T08:30:00+02:00',
    status: 'Pending',
    terminalId: 'POS-LUS-04',
    timeline: [
      {
        id: 'TL-WLK-3310-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T08:29:10+02:00',
      },
      {
        id: 'TL-WLK-3310-2',
        status: 'Pending',
        timestamp: '2026-08-31T08:30:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-011',
    reference: 'TB-WLK-3311',
    agentName: 'Joseph Kaunda',
    agentId: 'TB-AGT-1033',
    agentPhone: '+260 95 889 0123',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 95 556 7890',
    transactionType: 'Purchase',
    vendor: 'Zamtel',
    amount: 800.0,
    transactionTime: '2026-08-31T08:15:00+02:00',
    status: 'Failed',
    terminalId: 'POS-LUS-05',
    timeline: [
      {
        id: 'TL-WLK-3311-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T08:14:00+02:00',
      },
      {
        id: 'TL-WLK-3311-2',
        status: 'Customer Verified',
        timestamp: '2026-08-31T08:14:30+02:00',
      },
      {
        id: 'TL-WLK-3311-3',
        status: 'Failed',
        timestamp: '2026-08-31T08:15:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-012',
    reference: 'TB-WLK-3312',
    agentName: 'Kelvin Phiri',
    agentId: 'TB-AGT-1024',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    customerPhone: '+260 97 667 8901',
    transactionType: 'Deposit',
    vendor: 'Airtel',
    amount: 2500.0,
    transactionTime: '2026-08-31T08:00:00+02:00',
    status: 'Cancelled',
    terminalId: 'POS-LUS-01',
    timeline: [
      {
        id: 'TL-WLK-3312-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T07:59:00+02:00',
      },
      {
        id: 'TL-WLK-3312-2',
        status: 'Cancelled',
        timestamp: '2026-08-31T08:00:00+02:00',
      },
    ],
  },

  // Other Business Agencies (For verifying scoping)
  {
    id: 'WLK-013',
    reference: 'TB-WLK-3313',
    agentName: 'Mary Bwalya',
    agentId: 'TB-AGT-1025',
    agentPhone: '+260 97 001 2345',
    businessId: 'BIZ-NDL-002',
    businessName: 'Ndola Copperbelt Agency',
    customerPhone: '+260 97 222 3344',
    transactionType: 'Deposit',
    vendor: 'MTN',
    amount: 1400.0,
    transactionTime: '2026-08-31T11:20:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-MTN-99104',
    terminalId: 'POS-NDL-01',
    timeline: [
      {
        id: 'TL-WLK-3313-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T11:18:00+02:00',
      },
      {
        id: 'TL-WLK-3313-2',
        status: 'Completed',
        timestamp: '2026-08-31T11:20:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-014',
    reference: 'TB-WLK-3314',
    agentName: 'Brian Lungu',
    agentId: 'TB-AGT-1038',
    agentPhone: '+260 96 667 8901',
    businessId: 'BIZ-KTW-003',
    businessName: 'Kitwe Central Hub',
    customerPhone: '+260 96 444 5566',
    transactionType: 'Withdrawal',
    vendor: 'Airtel',
    amount: 3500.0,
    transactionTime: '2026-08-31T10:50:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-AIR-77201',
    terminalId: 'POS-KTW-02',
    timeline: [
      {
        id: 'TL-WLK-3314-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T10:48:00+02:00',
      },
      {
        id: 'TL-WLK-3314-2',
        status: 'Completed',
        timestamp: '2026-08-31T10:50:00+02:00',
      },
    ],
  },
  {
    id: 'WLK-015',
    reference: 'TB-WLK-3315',
    agentName: 'Mwamba Mulenga',
    agentId: 'TB-AGT-1041',
    agentPhone: '+260 97 778 9012',
    businessId: 'BIZ-LIV-004',
    businessName: 'Livingstone Victoria Agency',
    customerPhone: '+260 95 666 7788',
    transactionType: 'Purchase',
    vendor: 'MTN',
    amount: 2100.0,
    transactionTime: '2026-08-31T09:40:00+02:00',
    status: 'Completed',
    receiptNumber: 'REC-MTN-55109',
    terminalId: 'POS-LIV-01',
    timeline: [
      {
        id: 'TL-WLK-3315-1',
        status: 'Transaction Initiated',
        timestamp: '2026-08-31T09:38:00+02:00',
      },
      {
        id: 'TL-WLK-3315-2',
        status: 'Completed',
        timestamp: '2026-08-31T09:40:00+02:00',
      },
    ],
  },
];

export function deriveWalkInStatusSummary(
  transactions: WalkInTransaction[]
): WalkInStatusSummary {
  const summary: WalkInStatusSummary = {
    all: transactions.length,
    completed: 0,
    processing: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
  };

  transactions.forEach((tx) => {
    switch (tx.status) {
      case 'Completed':
        summary.completed++;
        break;
      case 'Processing':
        summary.processing++;
        break;
      case 'Pending':
        summary.pending++;
        break;
      case 'Failed':
        summary.failed++;
        break;
      case 'Cancelled':
        summary.cancelled++;
        break;
    }
  });

  return summary;
}
