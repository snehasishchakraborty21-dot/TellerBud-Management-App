import {
  CustomerWithdrawal,
  WithdrawalStatusSummary,
  WithdrawalStatus,
  WithdrawalFundsState,
} from '../types/admin';

export const getFundsStateForStatus = (status: WithdrawalStatus): WithdrawalFundsState => {
  switch (status) {
    case 'Pending Review':
      return 'Pending';
    case 'Approved':
    case 'Processing':
    case 'Paid':
      return 'Debited';
    case 'Rejected':
      return 'Released';
    case 'Cancelled':
      return 'Cancelled';
  }
};

export const MOCK_CUSTOMER_WITHDRAWALS: CustomerWithdrawal[] = [
  {
    id: 'WDR-001',
    reference: 'TB-WDR-8812',
    customerName: 'Lombe Kasonde',
    customerPhone: '+260 97 123 4567',
    amount: 7200.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 123 4567',
    requestedAt: '2026-08-31T10:51:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 15450.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8812-1',
        status: 'Withdrawal Requested',
        actor: 'Lombe Kasonde',
        timestamp: '2026-08-31T10:51:00+02:00',
      },
      {
        id: 'HIST-8812-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T10:51:00+02:00',
      },
      {
        id: 'HIST-8812-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T10:51:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-002',
    reference: 'TB-WDR-8811',
    customerName: 'Ruth Banda',
    customerPhone: '+260 96 234 5678',
    amount: 1500.0,
    network: 'Airtel Money',
    payoutNumber: '+260 97 345 6789',
    requestedAt: '2026-08-31T10:04:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 4800.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8811-1',
        status: 'Withdrawal Requested',
        actor: 'Ruth Banda',
        timestamp: '2026-08-31T10:04:00+02:00',
      },
      {
        id: 'HIST-8811-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T10:04:00+02:00',
      },
      {
        id: 'HIST-8811-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T10:04:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-003',
    reference: 'TB-WDR-8810',
    customerName: 'Chileshe Mumba',
    customerPhone: '+260 97 456 7890',
    amount: 3400.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 456 7890',
    requestedAt: '2026-08-31T09:45:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 8500.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8810-1',
        status: 'Withdrawal Requested',
        actor: 'Chileshe Mumba',
        timestamp: '2026-08-31T09:45:00+02:00',
      },
      {
        id: 'HIST-8810-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T09:45:00+02:00',
      },
      {
        id: 'HIST-8810-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T09:45:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-004',
    reference: 'TB-WDR-8809',
    customerName: 'Grace Tembo',
    customerPhone: '+260 96 567 8901',
    amount: 850.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 567 8901',
    requestedAt: '2026-08-31T06:12:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 3200.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8809-1',
        status: 'Withdrawal Requested',
        actor: 'Grace Tembo',
        timestamp: '2026-08-31T06:12:00+02:00',
      },
      {
        id: 'HIST-8809-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T06:12:00+02:00',
      },
      {
        id: 'HIST-8809-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T06:12:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-005',
    reference: 'TB-WDR-8808',
    customerName: 'Brian Lungu',
    customerPhone: '+260 97 678 9012',
    amount: 12000.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 678 9012',
    requestedAt: '2026-08-31T05:50:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 28000.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8808-1',
        status: 'Withdrawal Requested',
        actor: 'Brian Lungu',
        timestamp: '2026-08-31T05:50:00+02:00',
      },
      {
        id: 'HIST-8808-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T05:50:00+02:00',
      },
      {
        id: 'HIST-8808-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T05:50:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-006',
    reference: 'TB-WDR-8807',
    customerName: 'Mwamba Mulenga',
    customerPhone: '+260 96 789 0123',
    amount: 2250.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 789 0123',
    requestedAt: '2026-08-31T05:15:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 6100.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8807-1',
        status: 'Withdrawal Requested',
        actor: 'Mwamba Mulenga',
        timestamp: '2026-08-31T05:15:00+02:00',
      },
      {
        id: 'HIST-8807-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T05:15:00+02:00',
      },
      {
        id: 'HIST-8807-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T05:15:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-007',
    reference: 'TB-WDR-8806',
    customerName: 'Taonga Phiri',
    customerPhone: '+260 97 890 1234',
    amount: 4600.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 890 1234',
    requestedAt: '2026-08-31T04:40:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 11200.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8806-1',
        status: 'Withdrawal Requested',
        actor: 'Taonga Phiri',
        timestamp: '2026-08-31T04:40:00+02:00',
      },
      {
        id: 'HIST-8806-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T04:40:00+02:00',
      },
      {
        id: 'HIST-8806-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T04:40:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-008',
    reference: 'TB-WDR-8805',
    customerName: 'Mutale Silwamba',
    customerPhone: '+260 96 901 2345',
    amount: 6000.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 901 2345',
    requestedAt: '2026-08-31T04:10:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 14500.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8805-1',
        status: 'Withdrawal Requested',
        actor: 'Mutale Silwamba',
        timestamp: '2026-08-31T04:10:00+02:00',
      },
      {
        id: 'HIST-8805-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T04:10:00+02:00',
      },
      {
        id: 'HIST-8805-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T04:10:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-009',
    reference: 'TB-WDR-8804',
    customerName: 'Kunda Chisanga',
    customerPhone: '+260 97 012 3456',
    amount: 1800.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 012 3456',
    requestedAt: '2026-08-31T03:30:00+02:00',
    fundsState: 'Pending',
    status: 'Pending Review',
    initialPostedBalance: 5200.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8804-1',
        status: 'Withdrawal Requested',
        actor: 'Kunda Chisanga',
        timestamp: '2026-08-31T03:30:00+02:00',
      },
      {
        id: 'HIST-8804-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T03:30:00+02:00',
      },
      {
        id: 'HIST-8804-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T03:30:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-010',
    reference: 'TB-WDR-8803',
    customerName: 'Precious Mwale',
    customerPhone: '+260 96 123 4567',
    amount: 5500.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 123 4567',
    requestedAt: '2026-08-31T00:45:00+02:00',
    fundsState: 'Pending',
    status: 'Approved',
    initialPostedBalance: 12800.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8803-1',
        status: 'Withdrawal Requested',
        actor: 'Precious Mwale',
        timestamp: '2026-08-31T00:45:00+02:00',
      },
      {
        id: 'HIST-8803-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T00:45:00+02:00',
      },
      {
        id: 'HIST-8803-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-31T00:45:00+02:00',
      },
      {
        id: 'HIST-8803-4',
        status: 'Approved',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-31T01:05:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-011',
    reference: 'TB-WDR-8802',
    customerName: 'Musonda Chanda',
    customerPhone: '+260 97 234 5678',
    amount: 3200.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 234 5678',
    requestedAt: '2026-08-30T23:10:00+02:00',
    fundsState: 'Pending',
    status: 'Approved',
    initialPostedBalance: 7800.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8802-1',
        status: 'Withdrawal Requested',
        actor: 'Musonda Chanda',
        timestamp: '2026-08-30T23:10:00+02:00',
      },
      {
        id: 'HIST-8802-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-30T23:10:00+02:00',
      },
      {
        id: 'HIST-8802-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-30T23:10:00+02:00',
      },
      {
        id: 'HIST-8802-4',
        status: 'Approved',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-30T23:25:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-012',
    reference: 'TB-WDR-8801',
    customerName: 'Kelvin Phiri',
    customerPhone: '+260 96 345 6789',
    amount: 950.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 345 6789',
    requestedAt: '2026-08-30T21:25:00+02:00',
    fundsState: 'Pending',
    status: 'Processing',
    initialPostedBalance: 3400.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8801-1',
        status: 'Withdrawal Requested',
        actor: 'Kelvin Phiri',
        timestamp: '2026-08-30T21:25:00+02:00',
      },
      {
        id: 'HIST-8801-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-30T21:25:00+02:00',
      },
      {
        id: 'HIST-8801-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-30T21:25:00+02:00',
      },
      {
        id: 'HIST-8801-4',
        status: 'Approved',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-30T21:40:00+02:00',
      },
      {
        id: 'HIST-8801-5',
        status: 'Processing',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-30T21:55:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-013',
    reference: 'TB-WDR-8800',
    customerName: 'Monde Lisulo',
    customerPhone: '+260 97 456 7891',
    amount: 4100.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 456 7891',
    requestedAt: '2026-08-30T18:40:00+02:00',
    fundsState: 'Pending',
    status: 'Processing',
    initialPostedBalance: 9600.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8800-1',
        status: 'Withdrawal Requested',
        actor: 'Monde Lisulo',
        timestamp: '2026-08-30T18:40:00+02:00',
      },
      {
        id: 'HIST-8800-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-30T18:40:00+02:00',
      },
      {
        id: 'HIST-8800-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-30T18:40:00+02:00',
      },
      {
        id: 'HIST-8800-4',
        status: 'Approved',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-30T18:55:00+02:00',
      },
      {
        id: 'HIST-8800-5',
        status: 'Processing',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-30T19:10:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-014',
    reference: 'TB-WDR-8799',
    customerName: 'Natasha Mwaba',
    customerPhone: '+260 96 567 8902',
    amount: 1250.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 567 8902',
    requestedAt: '2026-08-30T16:15:00+02:00',
    fundsState: 'Debited',
    status: 'Paid',
    initialPostedBalance: 15450.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8799-1',
        status: 'Withdrawal Requested',
        actor: 'Natasha Mwaba',
        timestamp: '2026-08-30T16:15:00+02:00',
      },
      {
        id: 'HIST-8799-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-30T16:15:00+02:00',
      },
      {
        id: 'HIST-8799-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-30T16:15:00+02:00',
      },
      {
        id: 'HIST-8799-4',
        status: 'Approved',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-30T16:30:00+02:00',
      },
      {
        id: 'HIST-8799-5',
        status: 'Processing',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-30T16:45:00+02:00',
      },
      {
        id: 'HIST-8799-6',
        status: 'Paid',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-30T17:00:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-015',
    reference: 'TB-WDR-8798',
    customerName: 'Kondwani Banda',
    customerPhone: '+260 97 678 9013',
    amount: 2800.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 678 9013',
    requestedAt: '2026-08-29T20:30:00+02:00',
    fundsState: 'Debited',
    status: 'Paid',
    initialPostedBalance: 8900.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8798-1',
        status: 'Withdrawal Requested',
        actor: 'Kondwani Banda',
        timestamp: '2026-08-29T20:30:00+02:00',
      },
      {
        id: 'HIST-8798-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-29T20:30:00+02:00',
      },
      {
        id: 'HIST-8798-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-29T20:30:00+02:00',
      },
      {
        id: 'HIST-8798-4',
        status: 'Approved',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-29T20:45:00+02:00',
      },
      {
        id: 'HIST-8798-5',
        status: 'Processing',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-29T21:00:00+02:00',
      },
      {
        id: 'HIST-8798-6',
        status: 'Paid',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-29T21:15:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-016',
    reference: 'TB-WDR-8797',
    customerName: 'Sipho Zulu',
    customerPhone: '+260 96 789 0124',
    amount: 8000.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 789 0124',
    requestedAt: '2026-08-29T13:20:00+02:00',
    fundsState: 'Released',
    status: 'Rejected',
    initialPostedBalance: 16500.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8797-1',
        status: 'Withdrawal Requested',
        actor: 'Sipho Zulu',
        timestamp: '2026-08-29T13:20:00+02:00',
      },
      {
        id: 'HIST-8797-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-29T13:20:00+02:00',
      },
      {
        id: 'HIST-8797-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-29T13:20:00+02:00',
      },
      {
        id: 'HIST-8797-4',
        status: 'Rejected',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-29T13:35:00+02:00',
        reason: 'Payout mobile money account verification failed',
      },
    ],
  },
  {
    id: 'WDR-017',
    reference: 'TB-WDR-8796',
    customerName: 'Kabwe Musonda',
    customerPhone: '+260 97 890 1235',
    amount: 1950.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 890 1235',
    requestedAt: '2026-08-28T11:45:00+02:00',
    fundsState: 'Released',
    status: 'Rejected',
    initialPostedBalance: 4900.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8796-1',
        status: 'Withdrawal Requested',
        actor: 'Kabwe Musonda',
        timestamp: '2026-08-28T11:45:00+02:00',
      },
      {
        id: 'HIST-8796-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-28T11:45:00+02:00',
      },
      {
        id: 'HIST-8796-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-28T11:45:00+02:00',
      },
      {
        id: 'HIST-8796-4',
        status: 'Rejected',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-28T12:00:00+02:00',
        reason: 'Suspected duplicate withdrawal request',
      },
    ],
  },
  {
    id: 'WDR-018',
    reference: 'TB-WDR-8795',
    customerName: 'Lubinda Mubita',
    customerPhone: '+260 96 901 2346',
    amount: 6500.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 901 2346',
    requestedAt: '2026-08-27T17:10:00+02:00',
    fundsState: 'Released',
    status: 'Cancelled',
    initialPostedBalance: 12000.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8795-1',
        status: 'Withdrawal Requested',
        actor: 'Lubinda Mubita',
        timestamp: '2026-08-27T17:10:00+02:00',
      },
      {
        id: 'HIST-8795-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-27T17:10:00+02:00',
      },
      {
        id: 'HIST-8795-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-27T17:10:00+02:00',
      },
      {
        id: 'HIST-8795-4',
        status: 'Cancelled',
        actor: 'Lubinda Mubita',
        timestamp: '2026-08-27T17:25:00+02:00',
        reason: 'Customer requested cancellation prior to admin review',
      },
    ],
  },
];

export const deriveWithdrawalStatusSummary = (
  withdrawals: CustomerWithdrawal[]
): WithdrawalStatusSummary => {
  return {
    all: withdrawals.length,
    pendingReview: withdrawals.filter((w) => w.status === 'Pending Review').length,
    approved: withdrawals.filter((w) => w.status === 'Approved').length,
    processing: withdrawals.filter((w) => w.status === 'Processing').length,
    paid: withdrawals.filter((w) => w.status === 'Paid').length,
    rejected: withdrawals.filter((w) => w.status === 'Rejected').length,
    cancelled: withdrawals.filter((w) => w.status === 'Cancelled').length,
  };
};

export const calculateWalletPosition = (
  withdrawal: CustomerWithdrawal
): import('../types/admin').CustomerWalletPosition => {
  const initialPosted =
    withdrawal.initialPostedBalance ?? Math.max(15450, withdrawal.amount * 2.2);
  const amount = withdrawal.amount;
  const status = withdrawal.status;

  if (status === 'Pending Review') {
    return {
      postedBalance: initialPosted,
      availableBalance: initialPosted,
      withdrawalAmount: amount,
      fundsState: 'Pending',
    };
  }

  if (status === 'Approved' || status === 'Processing' || status === 'Paid') {
    const finalBalance = initialPosted - amount;
    return {
      postedBalance: initialPosted,
      availableBalance: finalBalance,
      withdrawalAmount: amount,
      fundsState: 'Debited',
    };
  }

  if (status === 'Cancelled') {
    return {
      postedBalance: initialPosted,
      availableBalance: initialPosted,
      withdrawalAmount: amount,
      fundsState: 'Cancelled',
    };
  }

  // Rejected
  return {
    postedBalance: initialPosted,
    availableBalance: initialPosted,
    withdrawalAmount: amount,
    fundsState: 'Released',
  };
};

export const MOCK_WITHDRAWAL_STATUS_SUMMARY: WithdrawalStatusSummary =
  deriveWithdrawalStatusSummary(MOCK_CUSTOMER_WITHDRAWALS);
