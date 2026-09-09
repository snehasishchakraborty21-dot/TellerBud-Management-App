import {
  CustomerWalletReservation,
  CustomerWalletLedgerEntry,
  CustomerWalletAddFundsRecord,
  CustomerWalletWithdrawalRecord,
  CustomerWithdrawalStatus,
  WalletReservationType,
} from '../types/customerWallet';
import { getCustomerWalletById } from './mockCustomerWalletData';
import { MOCK_CUSTOMER_WITHDRAWALS } from './mockWithdrawalData';

// ----------------------------------------------------------------------------
// Dedicated Data Sets for Key Canonical Customer Wallets
// ----------------------------------------------------------------------------

/**
 * Mwamba Mulenga (TB-WAL-1052 / TB-CUS-1052):
 * Posted Ledger Balance: ZMW 18,450.00
 * Available Balance: ZMW 15,950.00
 * Reserved Funds: ZMW 2,500.00
 * - Withdrawal Reservation: ZMW 2,250.00 (TB-WDR-8807, Airtel Money)
 * - Customer Pickup Request Reservation: ZMW 250.00 (TB-REQ-1052, Cash Pickup)
 * Total Reserved = ZMW 2,500.00. 15,950.00 + 2,500.00 = 18,450.00.
 */
const MWAMBA_RESERVATIONS: CustomerWalletReservation[] = [
  {
    id: 'RES-1052-01',
    reference: 'TB-RES-1052-01',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    reservationType: 'Customer Withdrawal',
    relatedReference: 'TB-WDR-8807',
    originalAmount: 2250.0,
    remainingAmount: 2250.0,
    status: 'Active',
    createdAt: '31 Aug 2026, 05:15 AM',
    createdAtTimestamp: '2026-08-31T05:15:00Z',
    notes: 'Withdrawal pre-authorization hold for TB-WDR-8807 (Airtel Money)',
  },
  {
    id: 'RES-1052-02',
    reference: 'TB-RES-1052-02',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    reservationType: 'Customer Pickup Request',
    relatedReference: 'TB-REQ-1052',
    originalAmount: 250.0,
    remainingAmount: 250.0,
    status: 'Active',
    createdAt: '08 Sep 2026, 09:30 AM',
    createdAtTimestamp: '2026-09-08T09:30:00Z',
    notes: 'Customer scheduled cash pickup reservation at Lusaka Central Point',
  },
  {
    id: 'RES-1052-03',
    reference: 'TB-RES-1052-03',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    reservationType: 'Customer Withdrawal',
    relatedReference: 'TB-WDR-7640',
    originalAmount: 6500.0,
    remainingAmount: 0.0,
    status: 'Consumed',
    createdAt: '15 May 2025, 11:00 AM',
    createdAtTimestamp: '2025-05-15T11:00:00Z',
    releasedOrConsumedAt: '15 May 2025, 11:30 AM',
    notes: 'Reservation consumed upon atomic payout settlement',
  },
  {
    id: 'RES-1052-04',
    reference: 'TB-RES-1052-04',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    reservationType: 'Customer Pickup Request',
    relatedReference: 'TB-REQ-1011',
    originalAmount: 1200.0,
    remainingAmount: 0.0,
    status: 'Released',
    createdAt: '10 Apr 2025, 08:20 AM',
    createdAtTimestamp: '2025-04-10T08:20:00Z',
    releasedOrConsumedAt: '10 Apr 2025, 08:45 AM',
    notes: 'Reservation released: customer cancelled pickup prior to agent acceptance',
  },
];

const MWAMBA_LEDGER: CustomerWalletLedgerEntry[] = [
  {
    id: 'LED-1052-01',
    reference: 'TB-LED-1052-01',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    dateTime: '14 Jan 2025, 10:00 AM',
    timestamp: '2025-01-14T10:00:00Z',
    entryType: 'Add Funds Credit',
    source: 'MTN MoMo Gateway',
    credit: 10000.0,
    debit: null,
    balanceAfter: 10000.0,
    relatedReference: 'TB-FND-1052-01',
    status: 'Posted',
    description: 'Initial customer wallet funding via MTN Mobile Money direct push',
  },
  {
    id: 'LED-1052-02',
    reference: 'TB-LED-1052-02',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    dateTime: '20 Feb 2025, 03:15 PM',
    timestamp: '2025-02-20T15:15:00Z',
    entryType: 'Add Funds Credit',
    source: 'Airtel Money Gateway',
    credit: 15000.0,
    debit: null,
    balanceAfter: 25000.0,
    relatedReference: 'TB-FND-1052-02',
    status: 'Posted',
    description: 'Wallet top-up via Airtel Money API callback validation',
  },
  {
    id: 'LED-1052-03',
    reference: 'TB-LED-1052-03',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    dateTime: '15 May 2025, 11:30 AM',
    timestamp: '2025-05-15T11:30:00Z',
    entryType: 'Withdrawal Debit',
    source: 'Customer Withdrawal Core',
    credit: null,
    debit: 6500.0,
    balanceAfter: 18500.0,
    relatedReference: 'TB-WDR-7640',
    status: 'Posted',
    description: 'Atomic payout settlement to Airtel Money (+260 96 ••• 0123)',
  },
  {
    id: 'LED-1052-04',
    reference: 'TB-LED-1052-04',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    dateTime: '15 May 2025, 11:30 AM',
    timestamp: '2025-05-15T11:30:00Z',
    entryType: 'Transaction Charge',
    source: 'TellerBud Fee Engine',
    credit: null,
    debit: 50.0,
    balanceAfter: 18450.0,
    relatedReference: 'TB-TXN-1052-4',
    status: 'Posted',
    description: 'Automated withdrawal service fee for TB-WDR-7640',
  },
  {
    id: 'LED-1052-05',
    reference: 'TB-LED-1052-05',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    dateTime: '31 Aug 2026, 05:15 AM',
    timestamp: '2026-08-31T05:15:00Z',
    entryType: 'Reservation Created',
    source: 'Customer Withdrawal Core',
    credit: null,
    debit: null,
    balanceAfter: 18450.0,
    relatedReference: 'TB-WDR-8807',
    status: 'Posted',
    description: 'Pre-authorization memo: ZMW 2,250.00 held under TB-RES-1052-01',
  },
  {
    id: 'LED-1052-06',
    reference: 'TB-LED-1052-06',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    dateTime: '08 Sep 2026, 09:30 AM',
    timestamp: '2026-09-08T09:30:00Z',
    entryType: 'Reservation Created',
    source: 'Pickup Point Core',
    credit: null,
    debit: null,
    balanceAfter: 18450.0,
    relatedReference: 'TB-REQ-1052',
    status: 'Posted',
    description: 'Pre-authorization memo: ZMW 250.00 held under TB-RES-1052-02',
  },
];

const MWAMBA_ADD_FUNDS: CustomerWalletAddFundsRecord[] = [
  {
    id: 'FND-1052-01',
    fundingReference: 'TB-FND-1052-01',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    initiatedAt: '14 Jan 2025, 09:58 AM',
    initiatedTimestamp: '2025-01-14T09:58:00Z',
    mno: 'MTN Mobile Money',
    maskedMobileNumber: '+260 97 ••• 9012',
    amount: 10000.0,
    providerReference: 'MTN-TXN-4910284',
    providerStatus: 'Completed',
    walletCreditReference: 'TB-LED-1052-01',
    lastUpdated: '14 Jan 2025, 10:00 AM',
    lastUpdatedTimestamp: '2025-01-14T10:00:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer requested wallet top-up of ZMW 10,000.00 from MTN Mobile Money.',
        timestamp: '14 Jan 2025, 09:58:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'MTN API Handshake Acknowledged',
        description: 'Direct TLS API call to MTN MoMo collection endpoint succeeded (HTTP 202 Accepted).',
        timestamp: '14 Jan 2025, 09:58:04 AM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Customer USSD Push Prompt Confirmed',
        description: 'Customer authorized collection prompt on Zambian handset.',
        timestamp: '14 Jan 2025, 09:59:12 AM',
        status: 'completed',
      },
      {
        step: '4',
        title: 'MTN Webhook Callback Verified',
        description: 'Direct provider webhook received with verified digital signature (Status: SUCCESSFUL).',
        timestamp: '14 Jan 2025, 09:59:58 AM',
        status: 'completed',
      },
      {
        step: '5',
        title: 'Wallet Ledger Credited',
        description: 'Posted immutable ledger credit TB-LED-1052-01 for ZMW 10,000.00.',
        timestamp: '14 Jan 2025, 10:00:00 AM',
        status: 'completed',
      },
    ],
  },
  {
    id: 'FND-1052-02',
    fundingReference: 'TB-FND-1052-02',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    initiatedAt: '20 Feb 2025, 03:12 PM',
    initiatedTimestamp: '2025-02-20T13:12:00Z',
    mno: 'Airtel Money',
    maskedMobileNumber: '+260 96 ••• 0123',
    amount: 15000.0,
    providerReference: 'AIR-TXN-8201948',
    providerStatus: 'Completed',
    walletCreditReference: 'TB-LED-1052-02',
    lastUpdated: '20 Feb 2025, 03:15 PM',
    lastUpdatedTimestamp: '2025-02-20T13:15:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer initiated Airtel Money collection for ZMW 15,000.00.',
        timestamp: '20 Feb 2025, 03:12:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Airtel Gateway Push Dispatched',
        description: 'Airtel B2B collection push dispatched to subscriber.',
        timestamp: '20 Feb 2025, 03:12:03 PM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Handset Approval Received',
        description: 'Customer approved payment dialog on Airtel SIM.',
        timestamp: '20 Feb 2025, 03:13:40 PM',
        status: 'completed',
      },
      {
        step: '4',
        title: 'Airtel Callback Verified',
        description: 'Airtel transaction reference AIR-TXN-8201948 confirmed by webhook callback.',
        timestamp: '20 Feb 2025, 03:14:55 PM',
        status: 'completed',
      },
      {
        step: '5',
        title: 'Wallet Ledger Credited',
        description: 'Posted immutable ledger credit TB-LED-1052-02 for ZMW 15,000.00.',
        timestamp: '20 Feb 2025, 03:15:00 PM',
        status: 'completed',
      },
    ],
  },
  {
    id: 'FND-1052-03',
    fundingReference: 'TB-FND-1052-03',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    initiatedAt: '02 Sep 2026, 04:22 PM',
    initiatedTimestamp: '2026-09-02T14:22:00Z',
    mno: 'MTN Mobile Money',
    maskedMobileNumber: '+260 97 ••• 9012',
    amount: 2000.0,
    providerReference: 'MTN-TXN-9941021',
    providerStatus: 'Failed',
    walletCreditReference: null,
    lastUpdated: '02 Sep 2026, 04:24 PM',
    lastUpdatedTimestamp: '2026-09-02T14:24:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer requested top-up of ZMW 2,000.00.',
        timestamp: '02 Sep 2026, 04:22:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'MTN Collection Dispatched',
        description: 'USSD prompt dispatched to customer terminal.',
        timestamp: '02 Sep 2026, 04:22:04 PM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Customer Prompt Rejected',
        description: 'Subscriber cancelled authorization prompt on handset (Code: USER_CANCELLED).',
        timestamp: '02 Sep 2026, 04:23:45 PM',
        status: 'failed',
      },
      {
        step: '4',
        title: 'No Wallet Credit Posted',
        description: 'Transaction marked failed; ledger balance unchanged.',
        timestamp: '02 Sep 2026, 04:24:00 PM',
        status: 'failed',
      },
    ],
  },
];

const MWAMBA_WITHDRAWALS: CustomerWalletWithdrawalRecord[] = [
  {
    id: 'WDR-1052-01',
    withdrawalReference: 'TB-WDR-8807',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    requestedAt: '31 Aug 2026, 05:15 AM',
    requestedTimestamp: '2026-08-31T05:15:00Z',
    amount: 2250.0,
    mno: 'Airtel Money',
    maskedPayoutNumber: '+260 96 ••• 0123',
    reservationReference: 'TB-RES-1052-01',
    reservedAmount: 2250.0,
    status: 'Pending Review',
    lastUpdated: '31 Aug 2026, 05:15 AM',
    lastUpdatedTimestamp: '2026-08-31T05:15:00Z',
  },
  {
    id: 'WDR-1052-02',
    withdrawalReference: 'TB-WDR-7640',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    requestedAt: '15 May 2025, 11:00 AM',
    requestedTimestamp: '2025-05-15T11:00:00Z',
    amount: 6500.0,
    mno: 'Airtel Money',
    maskedPayoutNumber: '+260 96 ••• 0123',
    reservationReference: 'TB-RES-1052-03',
    reservedAmount: 6500.0,
    status: 'Paid',
    lastUpdated: '15 May 2025, 11:30 AM',
    lastUpdatedTimestamp: '2025-05-15T11:30:00Z',
  },
];

// ----------------------------------------------------------------------------
// Bupe Chileshe (TB-WAL-1021 / TB-CUS-1021):
// Posted Ledger: ZMW 4,300.00
// Available: ZMW 3,655.00
// Reserved: ZMW 645.00 (TB-RES-1021-01, Customer Pickup Request TB-REQ-1021)
// ----------------------------------------------------------------------------
const BUPE_RESERVATIONS: CustomerWalletReservation[] = [
  {
    id: 'RES-1021-01',
    reference: 'TB-RES-1021-01',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    reservationType: 'Customer Pickup Request',
    relatedReference: 'TB-REQ-1021',
    originalAmount: 645.0,
    remainingAmount: 645.0,
    status: 'Active',
    createdAt: '08 Sep 2026, 09:55 AM',
    createdAtTimestamp: '2026-09-08T09:55:00Z',
    notes: 'Pre-authorization hold for cash pickup at Embassy Mall Agency Point',
  },
  {
    id: 'RES-1021-02',
    reference: 'TB-RES-1021-02',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    reservationType: 'Customer Withdrawal',
    relatedReference: 'TB-WDR-6912',
    originalAmount: 1800.0,
    remainingAmount: 0.0,
    status: 'Consumed',
    createdAt: '12 Aug 2025, 02:10 PM',
    createdAtTimestamp: '2025-08-12T14:10:00Z',
    releasedOrConsumedAt: '12 Aug 2025, 02:40 PM',
    notes: 'Atomic payout completed to MTN Mobile Money',
  },
];

const BUPE_LEDGER: CustomerWalletLedgerEntry[] = [
  {
    id: 'LED-1021-01',
    reference: 'TB-LED-1021-01',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    dateTime: '10 Jan 2025, 09:00 AM',
    timestamp: '2025-01-10T09:00:00Z',
    entryType: 'Add Funds Credit',
    source: 'MTN MoMo Gateway',
    credit: 6100.0,
    debit: null,
    balanceAfter: 6100.0,
    relatedReference: 'TB-FND-1021-01',
    status: 'Posted',
    description: 'Direct MTN Mobile Money collection credit',
  },
  {
    id: 'LED-1021-02',
    reference: 'TB-LED-1021-02',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    dateTime: '12 Aug 2025, 02:40 PM',
    timestamp: '2025-08-12T14:40:00Z',
    entryType: 'Withdrawal Debit',
    source: 'Customer Withdrawal Core',
    credit: null,
    debit: 1800.0,
    balanceAfter: 4300.0,
    relatedReference: 'TB-WDR-6912',
    status: 'Posted',
    description: 'Atomic payout settlement to MTN MoMo (+260 96 ••• 5588)',
  },
  {
    id: 'LED-1021-03',
    reference: 'TB-LED-1021-03',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    dateTime: '08 Sep 2026, 09:55 AM',
    timestamp: '2026-09-08T09:55:00Z',
    entryType: 'Reservation Created',
    source: 'Pickup Point Core',
    credit: null,
    debit: null,
    balanceAfter: 4300.0,
    relatedReference: 'TB-REQ-1021',
    status: 'Posted',
    description: 'Pre-authorization hold: ZMW 645.00 reserved under TB-RES-1021-01',
  },
];

const BUPE_ADD_FUNDS: CustomerWalletAddFundsRecord[] = [
  {
    id: 'FND-1021-01',
    fundingReference: 'TB-FND-1021-01',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    initiatedAt: '10 Jan 2025, 08:58 AM',
    initiatedTimestamp: '2025-01-10T08:58:00Z',
    mno: 'MTN Mobile Money',
    maskedMobileNumber: '+260 96 ••• 5588',
    amount: 6100.0,
    providerReference: 'MTN-TXN-2819041',
    providerStatus: 'Completed',
    walletCreditReference: 'TB-LED-1021-01',
    lastUpdated: '10 Jan 2025, 09:00 AM',
    lastUpdatedTimestamp: '2025-01-10T09:00:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer requested top-up of ZMW 6,100.00.',
        timestamp: '10 Jan 2025, 08:58:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'MTN Direct Push Dispatched',
        description: 'API request validated and dispatched to MTN core.',
        timestamp: '10 Jan 2025, 08:58:03 AM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Customer PIN Authorization Handset Entry',
        description: 'Customer authorized collection on registered SIM.',
        timestamp: '10 Jan 2025, 08:59:15 AM',
        status: 'completed',
      },
      {
        step: '4',
        title: 'Webhook Settlement Callback',
        description: 'Direct webhook received and verified with HMAC sha256.',
        timestamp: '10 Jan 2025, 08:59:55 AM',
        status: 'completed',
      },
      {
        step: '5',
        title: 'Wallet Balance Credited',
        description: 'Posted ledger entry TB-LED-1021-01 for ZMW 6,100.00.',
        timestamp: '10 Jan 2025, 09:00:00 AM',
        status: 'completed',
      },
    ],
  },
];

const BUPE_WITHDRAWALS: CustomerWalletWithdrawalRecord[] = [
  {
    id: 'WDR-1021-01',
    withdrawalReference: 'TB-WDR-6912',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    requestedAt: '12 Aug 2025, 02:10 PM',
    requestedTimestamp: '2025-08-12T14:10:00Z',
    amount: 1800.0,
    mno: 'MTN Mobile Money',
    maskedPayoutNumber: '+260 96 ••• 5588',
    reservationReference: 'TB-RES-1021-02',
    reservedAmount: 1800.0,
    status: 'Paid',
    lastUpdated: '12 Aug 2025, 02:40 PM',
    lastUpdatedTimestamp: '2025-08-12T14:40:00Z',
  },
];

// ----------------------------------------------------------------------------
// Generator for any other wallet in the TellerBud dataset
// ----------------------------------------------------------------------------

export function getCustomerWalletReservations(walletId: string): CustomerWalletReservation[] {
  const cleanId = walletId.trim().toUpperCase();
  if (cleanId === 'TB-WAL-1052') return MWAMBA_RESERVATIONS;
  if (cleanId === 'TB-WAL-1021') return BUPE_RESERVATIONS;

  const wallet = getCustomerWalletById(cleanId);
  if (!wallet) return [];

  const idNum = parseInt(wallet.customerId.replace(/\D/g, ''), 10) || 1000;
  const reservations: CustomerWalletReservation[] = [];

  // Match withdrawals from MOCK_CUSTOMER_WITHDRAWALS
  const matchingWithdrawals = MOCK_CUSTOMER_WITHDRAWALS.filter(
    (w) => w.customerName.toLowerCase() === wallet.customerName.toLowerCase()
  );

  matchingWithdrawals.forEach((w, idx) => {
    const isPending =
      w.status === 'Pending Review' || w.status === 'Approved' || w.status === 'Processing';
    const isPaid = w.status === 'Paid';

    let resStatus: 'Active' | 'Consumed' | 'Released' = 'Active';
    let remainingAmount = w.amount;
    let releasedOrConsumedAt: string | undefined = undefined;

    if (isPaid) {
      resStatus = 'Consumed';
      remainingAmount = 0;
      releasedOrConsumedAt = '01 Sep 2026, 12:00 PM';
    } else if (w.status === 'Rejected' || w.status === 'Cancelled') {
      resStatus = 'Released';
      remainingAmount = 0;
      releasedOrConsumedAt = '01 Sep 2026, 12:00 PM';
    }

    reservations.push({
      id: `RES-${idNum}-${idx + 1}`,
      reference: `TB-RES-${idNum}-0${idx + 1}`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      reservationType: 'Customer Withdrawal',
      relatedReference: w.reference,
      originalAmount: w.amount,
      remainingAmount,
      status: resStatus,
      createdAt: w.requestedAt ? new Date(w.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '31 Aug 2026, 10:00 AM',
      createdAtTimestamp: w.requestedAt || '2026-08-31T10:00:00Z',
      releasedOrConsumedAt,
      notes: `Pre-authorization hold for withdrawal ${w.reference} (${w.network})`,
    });
  });

  // If wallet has extra reservation hold for customer pickup request
  if (wallet.reservedFunds > (wallet.pendingWithdrawalAmount || 0)) {
    const holdAmount = wallet.reservedFunds - (wallet.pendingWithdrawalAmount || 0);
    reservations.unshift({
      id: `RES-${idNum}-REQ`,
      reference: `TB-RES-${idNum}-99`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      reservationType: 'Customer Pickup Request',
      relatedReference: `TB-REQ-${idNum}`,
      originalAmount: holdAmount,
      remainingAmount: holdAmount,
      status: 'Active',
      createdAt: wallet.lastUpdated,
      createdAtTimestamp: wallet.lastUpdatedTimestamp,
      notes: 'Customer scheduled cash pickup pre-authorization hold',
    });
  }

  return reservations;
}

export function getCustomerWalletLedger(walletId: string): CustomerWalletLedgerEntry[] {
  const cleanId = walletId.trim().toUpperCase();
  if (cleanId === 'TB-WAL-1052') return MWAMBA_LEDGER;
  if (cleanId === 'TB-WAL-1021') return BUPE_LEDGER;

  const wallet = getCustomerWalletById(cleanId);
  if (!wallet) return [];

  const idNum = parseInt(wallet.customerId.replace(/\D/g, ''), 10) || 1000;
  const balance = wallet.walletBalance;

  // Build a clean, mathematically reconciled chronological history ending at current balance
  const entries: CustomerWalletLedgerEntry[] = [
    {
      id: `LED-${idNum}-01`,
      reference: `TB-LED-${idNum}-01`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      dateTime: '15 Jan 2025, 08:30 AM',
      timestamp: '2025-01-15T08:30:00Z',
      entryType: 'Add Funds Credit',
      source: 'MTN MoMo Gateway',
      credit: Math.round((balance + 5000) * 100) / 100,
      debit: null,
      balanceAfter: Math.round((balance + 5000) * 100) / 100,
      relatedReference: `TB-FND-${idNum}-01`,
      status: 'Posted',
      description: 'Customer mobile money wallet funding via MTN MoMo direct push',
    },
    {
      id: `LED-${idNum}-02`,
      reference: `TB-LED-${idNum}-02`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      dateTime: '10 Mar 2025, 02:15 PM',
      timestamp: '2025-03-10T14:15:00Z',
      entryType: 'Withdrawal Debit',
      source: 'Customer Withdrawal Core',
      credit: null,
      debit: 4950.0,
      balanceAfter: Math.round((balance + 50) * 100) / 100,
      relatedReference: `TB-WDR-${idNum + 10}`,
      status: 'Posted',
      description: 'Completed mobile cash-out transfer to registered mobile wallet',
    },
    {
      id: `LED-${idNum}-03`,
      reference: `TB-LED-${idNum}-03`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      dateTime: '10 Mar 2025, 02:15 PM',
      timestamp: '2025-03-10T14:15:00Z',
      entryType: 'Transaction Charge',
      source: 'TellerBud Fee Engine',
      credit: null,
      debit: 50.0,
      balanceAfter: balance,
      relatedReference: `TB-TXN-${idNum + 11}`,
      status: 'Posted',
      description: 'Standard payout routing and settlement charge',
    },
  ];

  if (wallet.reservedFunds > 0) {
    entries.push({
      id: `LED-${idNum}-04`,
      reference: `TB-LED-${idNum}-04`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      dateTime: wallet.lastUpdated,
      timestamp: wallet.lastUpdatedTimestamp,
      entryType: 'Reservation Created',
      source: wallet.pendingWithdrawalReference ? 'Customer Withdrawal Core' : 'Pickup Point Core',
      credit: null,
      debit: null,
      balanceAfter: balance,
      relatedReference: wallet.pendingWithdrawalReference || `TB-REQ-${idNum}`,
      status: 'Posted',
      description: `Pre-authorization memo: ZMW ${wallet.reservedFunds.toLocaleString('en-US', { minimumFractionDigits: 2 })} held`,
    });
  }

  return entries;
}

export function getCustomerWalletAddFunds(walletId: string): CustomerWalletAddFundsRecord[] {
  const cleanId = walletId.trim().toUpperCase();
  if (cleanId === 'TB-WAL-1052') return MWAMBA_ADD_FUNDS;
  if (cleanId === 'TB-WAL-1021') return BUPE_ADD_FUNDS;

  const wallet = getCustomerWalletById(cleanId);
  if (!wallet) return [];

  const idNum = parseInt(wallet.customerId.replace(/\D/g, ''), 10) || 1000;
  const isAirtel = wallet.customerPhone.includes('97') ? false : true;
  const mno: 'MTN Mobile Money' | 'Airtel Money' = isAirtel ? 'Airtel Money' : 'MTN Mobile Money';

  return [
    {
      id: `FND-${idNum}-01`,
      fundingReference: `TB-FND-${idNum}-01`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      initiatedAt: '15 Jan 2025, 08:28 AM',
      initiatedTimestamp: '2025-01-15T08:28:00Z',
      mno,
      maskedMobileNumber: wallet.customerPhoneMasked,
      amount: Math.round((wallet.walletBalance + 5000) * 100) / 100,
      providerReference: `${isAirtel ? 'AIR' : 'MTN'}-TXN-${idNum * 812}`,
      providerStatus: 'Completed',
      walletCreditReference: `TB-LED-${idNum}-01`,
      lastUpdated: '15 Jan 2025, 08:30 AM',
      lastUpdatedTimestamp: '2025-01-15T08:30:00Z',
      timeline: [
        {
          step: '1',
          title: 'Funding Request Initiated',
          description: `Customer initiated wallet funding via ${mno}.`,
          timestamp: '15 Jan 2025, 08:28:00 AM',
          status: 'completed',
        },
        {
          step: '2',
          title: 'Direct API Handshake Acknowledged',
          description: `Direct provider collection request dispatched to ${mno} B2B endpoint.`,
          timestamp: '15 Jan 2025, 08:28:04 AM',
          status: 'completed',
        },
        {
          step: '3',
          title: 'Subscriber Authorization Handset Prompt',
          description: 'Customer authorized collection on registered Zambian SIM.',
          timestamp: '15 Jan 2025, 08:29:12 AM',
          status: 'completed',
        },
        {
          step: '4',
          title: 'Provider Webhook Settlement Verified',
          description: 'Direct TLS webhook received with confirmed provider reference.',
          timestamp: '15 Jan 2025, 08:29:55 AM',
          status: 'completed',
        },
        {
          step: '5',
          title: 'Wallet Ledger Credited',
          description: `Posted immutable ledger credit TB-LED-${idNum}-01.`,
          timestamp: '15 Jan 2025, 08:30:00 AM',
          status: 'completed',
        },
      ],
    },
  ];
}

export function getCustomerWalletWithdrawals(walletId: string): CustomerWalletWithdrawalRecord[] {
  const cleanId = walletId.trim().toUpperCase();
  if (cleanId === 'TB-WAL-1052') return MWAMBA_WITHDRAWALS;
  if (cleanId === 'TB-WAL-1021') return BUPE_WITHDRAWALS;

  const wallet = getCustomerWalletById(cleanId);
  if (!wallet) return [];

  const idNum = parseInt(wallet.customerId.replace(/\D/g, ''), 10) || 1000;

  // Find all matching withdrawals for this customer
  const matching = MOCK_CUSTOMER_WITHDRAWALS.filter(
    (w) => w.customerName.toLowerCase() === wallet.customerName.toLowerCase()
  );

  if (matching.length > 0) {
    return matching.map((w, idx) => ({
      id: `WDR-${idNum}-${idx + 1}`,
      withdrawalReference: w.reference,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      requestedAt: w.requestedAt ? new Date(w.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '31 Aug 2026, 10:00 AM',
      requestedTimestamp: w.requestedAt || '2026-08-31T10:00:00Z',
      amount: w.amount,
      mno: w.network.includes('Airtel') ? 'Airtel Money' : 'MTN Mobile Money',
      maskedPayoutNumber: w.payoutNumber ? w.payoutNumber.replace(/(\+260 \d{2}) (\d{3}) (\d{4})/, '$1 ••• $3') : wallet.customerPhoneMasked,
      reservationReference: `TB-RES-${idNum}-0${idx + 1}`,
      reservedAmount: w.amount,
      status: w.status as CustomerWithdrawalStatus,
      lastUpdated: w.requestedAt ? new Date(w.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '31 Aug 2026, 10:00 AM',
      lastUpdatedTimestamp: w.requestedAt || '2026-08-31T10:00:00Z',
    }));
  }

  return [];
}
