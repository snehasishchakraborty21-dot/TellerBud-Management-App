import {
  CustomerWithdrawal,
  WithdrawalStatusSummary,
  WithdrawalStatus,
  WithdrawalFundsState,
} from '../types/admin';

export const getFundsStateForStatus = (status: WithdrawalStatus): WithdrawalFundsState => {
  switch (status) {
    case 'Pending Review':
    case 'Approved':
    case 'Processing':
      return 'Reserved';
    case 'Paid':
      return 'Debited';
    case 'Rejected':
      return 'Released';
    case 'Cancelled':
      return 'Cancelled';
  }
};

/**
 * Canonical TellerBud Customer Withdrawals Dataset
 * Strictly 9 demo records aligned with the sidebar badge count (9).
 * Preserves references, customers, and wallet reservations from Customer Wallets.
 */
export const MOCK_CUSTOMER_WITHDRAWALS: CustomerWithdrawal[] = [
  {
    id: 'WDR-001',
    reference: 'TB-WDR-8812',
    customerName: 'Lombe Kasonde',
    customerId: 'TB-CUS-1046',
    walletId: 'TB-WAL-1046',
    customerPhone: '+260 96 612 9901',
    amount: 7200.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 96 612 9901',
    requestedAt: '2026-08-31T10:51:00+02:00',
    fundsState: 'Reserved',
    status: 'Pending Review',
    reservedFunds: 7200.0,
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
    customerId: 'TB-CUS-1048',
    walletId: 'TB-WAL-1048',
    customerPhone: '+260 97 654 3210',
    amount: 1500.0,
    network: 'Airtel Money',
    payoutNumber: '+260 97 654 3210',
    requestedAt: '2026-08-31T10:04:00+02:00',
    fundsState: 'Reserved',
    status: 'Pending Review',
    reservedFunds: 1500.0,
    initialPostedBalance: 24150.0,
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
    customerId: 'TB-CUS-1049',
    walletId: 'TB-WAL-1049',
    customerPhone: '+260 95 334 5678',
    amount: 3400.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 95 334 5678',
    requestedAt: '2026-08-31T09:45:00+02:00',
    fundsState: 'Reserved',
    status: 'Pending Review',
    reservedFunds: 3400.0,
    initialPostedBalance: 12800.0,
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
    customerId: 'TB-CUS-1050',
    walletId: 'TB-WAL-1050',
    customerPhone: '+260 97 345 1050',
    amount: 850.0,
    network: 'Airtel Money',
    payoutNumber: '+260 97 345 1050',
    requestedAt: '2026-08-31T06:12:00+02:00',
    fundsState: 'Reserved',
    status: 'Pending Review',
    reservedFunds: 850.0,
    initialPostedBalance: 9620.0,
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
    reference: 'TB-WDR-8807',
    customerName: 'Mwamba Mulenga',
    customerId: 'TB-CUS-1052',
    walletId: 'TB-WAL-1052',
    customerPhone: '+260 96 123 9900',
    amount: 2250.0,
    network: 'Airtel Money',
    payoutNumber: '+260 96 123 9900',
    requestedAt: '2026-08-31T05:15:00+02:00',
    fundsState: 'Reserved',
    status: 'Pending Review',
    reservedFunds: 2250.0,
    initialPostedBalance: 18450.0,
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
    id: 'WDR-006',
    reference: 'TB-WDR-8803',
    customerName: 'Bwalya Mwansa',
    customerId: 'TB-CUS-1045',
    walletId: 'TB-WAL-1045',
    customerPhone: '+260 97 245 1045',
    amount: 5500.0,
    network: 'Airtel Money',
    payoutNumber: '+260 97 245 1045',
    requestedAt: '2026-08-31T00:45:00+02:00',
    fundsState: 'Reserved',
    status: 'Approved',
    reservedFunds: 5500.0,
    initialPostedBalance: 31900.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8803-1',
        status: 'Withdrawal Requested',
        actor: 'Bwalya Mwansa',
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
    id: 'WDR-007',
    reference: 'TB-WDR-8801',
    customerName: 'Kondwani Phiri',
    customerId: 'TB-CUS-1044',
    walletId: 'TB-WAL-1044',
    customerPhone: '+260 95 443 2190',
    amount: 950.0,
    network: 'Airtel Money',
    payoutNumber: '+260 95 443 2190',
    requestedAt: '2026-08-30T21:25:00+02:00',
    fundsState: 'Reserved',
    status: 'Processing',
    reservedFunds: 950.0,
    initialPostedBalance: 8750.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8801-1',
        status: 'Withdrawal Requested',
        actor: 'Kondwani Phiri',
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
    id: 'WDR-008',
    reference: 'TB-WDR-8798',
    customerName: 'Taonga Phiri',
    customerId: 'TB-CUS-1040',
    walletId: 'TB-WAL-1040',
    customerPhone: '+260 97 445 1040',
    amount: 3000.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 445 1040',
    requestedAt: '2026-08-29T14:40:00+02:00',
    fundsState: 'Debited',
    status: 'Paid',
    reservedFunds: 0,
    initialPostedBalance: 16500.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8798-1',
        status: 'Withdrawal Requested',
        actor: 'Taonga Phiri',
        timestamp: '2026-08-29T14:40:00+02:00',
      },
      {
        id: 'HIST-8798-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-29T14:40:00+02:00',
      },
      {
        id: 'HIST-8798-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-29T14:40:00+02:00',
      },
      {
        id: 'HIST-8798-4',
        status: 'Approved',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-29T14:55:00+02:00',
      },
      {
        id: 'HIST-8798-5',
        status: 'Processing',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-29T15:10:00+02:00',
      },
      {
        id: 'HIST-8798-6',
        status: 'Paid',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-29T15:25:00+02:00',
      },
    ],
  },
  {
    id: 'WDR-009',
    reference: 'TB-WDR-8796',
    customerName: 'Mabvuto Sakala',
    customerId: 'TB-CUS-1042',
    walletId: 'TB-WAL-1042',
    customerPhone: '+260 97 334 8871',
    amount: 1200.0,
    network: 'MTN Mobile Money',
    payoutNumber: '+260 97 334 8871',
    requestedAt: '2026-08-28T11:20:00+02:00',
    fundsState: 'Released',
    status: 'Rejected',
    reservedFunds: 0,
    initialPostedBalance: 14200.0,
    walletStatus: 'Active',
    history: [
      {
        id: 'HIST-8796-1',
        status: 'Withdrawal Requested',
        actor: 'Mabvuto Sakala',
        timestamp: '2026-08-28T11:20:00+02:00',
      },
      {
        id: 'HIST-8796-2',
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: '2026-08-28T11:20:00+02:00',
      },
      {
        id: 'HIST-8796-3',
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: '2026-08-28T11:20:00+02:00',
      },
      {
        id: 'HIST-8796-4',
        status: 'Rejected',
        actor: 'Sililo Lubinda',
        timestamp: '2026-08-28T11:45:00+02:00',
        reason: 'Customer requested cancellation via call center',
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

  // Pending Review, Approved, Processing:
  // Posted remains initialPosted, Active Reserved Funds = amount,
  // Available Balance = Posted Ledger Balance - Active Reserved Funds.
  // No ledger debit exists.
  if (status === 'Pending Review' || status === 'Approved' || status === 'Processing') {
    return {
      postedBalance: initialPosted,
      availableBalance: initialPosted - amount,
      reservedFunds: amount,
      withdrawalAmount: amount,
      fundsState: 'Reserved',
    };
  }

  // Paid:
  // One withdrawal ledger debit created.
  // Posted balance becomes initialPosted - amount.
  // Available balance remains initialPosted - amount.
  // Reserved funds become 0.
  if (status === 'Paid') {
    const debitedBalance = initialPosted - amount;
    return {
      postedBalance: debitedBalance,
      availableBalance: debitedBalance,
      reservedFunds: 0,
      withdrawalAmount: amount,
      fundsState: 'Debited',
    };
  }

  if (status === 'Cancelled') {
    return {
      postedBalance: initialPosted,
      availableBalance: initialPosted,
      reservedFunds: 0,
      withdrawalAmount: amount,
      fundsState: 'Cancelled',
    };
  }

  // Rejected:
  // No debit. Released reservation. Available balance restored to initialPosted.
  return {
    postedBalance: initialPosted,
    availableBalance: initialPosted,
    reservedFunds: 0,
    withdrawalAmount: amount,
    fundsState: 'Released',
  };
};

export const MOCK_WITHDRAWAL_STATUS_SUMMARY: WithdrawalStatusSummary =
  deriveWithdrawalStatusSummary(MOCK_CUSTOMER_WITHDRAWALS);
