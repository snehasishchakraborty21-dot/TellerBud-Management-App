import {
  WalletFundingRecord,
  WalletFundingSummary,
  WalletFundingFilters,
  WalletFundingSortField,
  WalletFundingSortDirection,
} from '../types/walletFunding';

export const MOCK_WALLET_FUNDING_RECORDS: WalletFundingRecord[] = [
  // 1. Mwamba Mulenga - Canonical Record 1
  {
    id: 'FND-1052-01',
    fundingReference: 'TB-FND-1052-01',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    customerName: 'Mwamba Mulenga',
    maskedMobileNumber: '+260 97 ••• 9012',
    provider: 'MTN Mobile Money',
    amount: 10000.0,
    providerReference: 'MTN-TXN-4910284',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1052-01',
    initiatedAt: '14 Jan 2025, 09:58 AM',
    initiatedTimestamp: '2025-01-14T09:58:00Z',
    lastUpdated: '14 Jan 2025, 10:00 AM',
    lastUpdatedTimestamp: '2025-01-14T10:00:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer initiated wallet top-up of ZMW 10,000.00 via MTN Mobile Money.',
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
        description: 'Customer authorized collection prompt on registered Zambian SIM handset.',
        timestamp: '14 Jan 2025, 09:59:12 AM',
        status: 'completed',
      },
      {
        step: '4',
        title: 'MTN Webhook Callback Verified',
        description: 'Direct provider webhook received with HMAC-SHA256 signature (Status: SUCCESSFUL).',
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

  // 2. Mwamba Mulenga - Canonical Record 2
  {
    id: 'FND-1052-02',
    fundingReference: 'TB-FND-1052-02',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    customerName: 'Mwamba Mulenga',
    maskedMobileNumber: '+260 96 ••• 0123',
    provider: 'Airtel Money',
    amount: 15000.0,
    providerReference: 'AIR-TXN-8201948',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1052-02',
    initiatedAt: '20 Feb 2025, 03:12 PM',
    initiatedTimestamp: '2025-02-20T13:12:00Z',
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
        description: 'Direct B2B collection push dispatched to subscriber +260 96 ••• 0123.',
        timestamp: '20 Feb 2025, 03:12:03 PM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Handset Approval Received',
        description: 'Customer entered PIN authorization dialog on Airtel SIM handset.',
        timestamp: '20 Feb 2025, 03:13:40 PM',
        status: 'completed',
      },
      {
        step: '4',
        title: 'Airtel Callback Verified',
        description: 'Webhook callback reference AIR-TXN-8201948 confirmed by webhook signature.',
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

  // 3. Mwamba Mulenga - Canonical Record 3
  {
    id: 'FND-1052-03',
    fundingReference: 'TB-FND-1052-03',
    walletId: 'TB-WAL-1052',
    customerId: 'TB-CUS-1052',
    customerName: 'Mwamba Mulenga',
    maskedMobileNumber: '+260 97 ••• 9012',
    provider: 'MTN Mobile Money',
    amount: 2000.0,
    providerReference: 'MTN-TXN-9941021',
    status: 'Failed',
    walletCreditReference: null,
    initiatedAt: '02 Sept 2026, 04:22 PM',
    initiatedTimestamp: '2026-09-02T14:22:00Z',
    lastUpdated: '02 Sept 2026, 04:24 PM',
    lastUpdatedTimestamp: '2026-09-02T14:24:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer requested top-up of ZMW 2,000.00 via MTN MoMo.',
        timestamp: '02 Sep 2026, 04:22:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'MTN Collection Push Dispatched',
        description: 'Direct USSD collection prompt dispatched to customer terminal.',
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

  // 4. Bupe Chileshe - Completed
  {
    id: 'FND-1021-01',
    fundingReference: 'TB-FND-1021-01',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    customerName: 'Bupe Chileshe',
    maskedMobileNumber: '+260 96 ••• 5588',
    provider: 'MTN Mobile Money',
    amount: 6100.0,
    providerReference: 'MTN-TXN-2819041',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1021-01',
    initiatedAt: '10 Jan 2025, 08:58 AM',
    initiatedTimestamp: '2025-01-10T08:58:00Z',
    lastUpdated: '10 Jan 2025, 09:00 AM',
    lastUpdatedTimestamp: '2025-01-10T09:00:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer requested wallet top-up of ZMW 6,100.00.',
        timestamp: '10 Jan 2025, 08:58:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'MTN Direct Push Dispatched',
        description: 'API request validated and dispatched to MTN core gateway.',
        timestamp: '10 Jan 2025, 08:58:03 AM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Customer Handset Authorization',
        description: 'Customer entered PIN authorization on handset.',
        timestamp: '10 Jan 2025, 08:59:15 AM',
        status: 'completed',
      },
      {
        step: '4',
        title: 'Webhook Settlement Verified',
        description: 'Provider callback received and verified with HMAC-SHA256.',
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

  // 5. Bupe Chileshe - Pending Verification
  {
    id: 'FND-1021-02',
    fundingReference: 'TB-FND-1021-02',
    walletId: 'TB-WAL-1021',
    customerId: 'TB-CUS-1021',
    customerName: 'Bupe Chileshe',
    maskedMobileNumber: '+260 96 ••• 5588',
    provider: 'Airtel Money',
    amount: 1500.0,
    providerReference: 'AIR-TXN-3910291',
    status: 'Pending',
    walletCreditReference: null,
    initiatedAt: '09 Sep 2026, 08:15 AM',
    initiatedTimestamp: '2026-09-09T06:15:00Z',
    lastUpdated: '09 Sep 2026, 08:16 AM',
    lastUpdatedTimestamp: '2026-09-09T06:16:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer initiated top-up of ZMW 1,500.00 via Airtel Money.',
        timestamp: '09 Sep 2026, 08:15:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Airtel Gateway Push Dispatched',
        description: 'B2B payment request dispatched to subscriber phone.',
        timestamp: '09 Sep 2026, 08:15:04 AM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Awaiting Subscriber PIN & Webhook Confirmation',
        description: 'Handset prompt active; awaiting provider completion callback.',
        timestamp: '09 Sep 2026, 08:15:05 AM',
        status: 'in_progress',
      },
    ],
  },

  // 6. Chileshe Mumba - Completed
  {
    id: 'FND-1049-01',
    fundingReference: 'TB-FND-1049-01',
    walletId: 'TB-WAL-1049',
    customerId: 'TB-CUS-1049',
    customerName: 'Chileshe Mumba',
    maskedMobileNumber: '+260 95 ••• 5678',
    provider: 'Airtel Money',
    amount: 14000.0,
    providerReference: 'AIR-TXN-5521901',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1049-01',
    initiatedAt: '05 Feb 2025, 11:20 AM',
    initiatedTimestamp: '2025-02-05T09:20:00Z',
    lastUpdated: '05 Feb 2025, 11:22 AM',
    lastUpdatedTimestamp: '2025-02-05T09:22:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer initiated wallet top-up of ZMW 14,000.00 via Airtel Money.',
        timestamp: '05 Feb 2025, 11:20:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Provider Webhook Verified',
        description: 'Airtel callback received with status SUCCESSFUL.',
        timestamp: '05 Feb 2025, 11:21:40 AM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1049-01 for ZMW 14,000.00.',
        timestamp: '05 Feb 2025, 11:22:00 AM',
        status: 'completed',
      },
    ],
  },

  // 7. Chileshe Mumba - Initiated
  {
    id: 'FND-1049-02',
    fundingReference: 'TB-FND-1049-02',
    walletId: 'TB-WAL-1049',
    customerId: 'TB-CUS-1049',
    customerName: 'Chileshe Mumba',
    maskedMobileNumber: '+260 95 ••• 5678',
    provider: 'MTN Mobile Money',
    amount: 3500.0,
    providerReference: 'MTN-TXN-7712390',
    status: 'Initiated',
    walletCreditReference: null,
    initiatedAt: '09 Sep 2026, 09:45 AM',
    initiatedTimestamp: '2026-09-09T07:45:00Z',
    lastUpdated: '09 Sep 2026, 09:45 AM',
    lastUpdatedTimestamp: '2026-09-09T07:45:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'API request generated for ZMW 3,500.00 top-up via MTN.',
        timestamp: '09 Sep 2026, 09:45:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Dispatching to MNO Endpoint',
        description: 'Connecting to MTN MoMo Gateway API.',
        timestamp: '09 Sep 2026, 09:45:02 AM',
        status: 'in_progress',
      },
    ],
  },

  // 8. Ruth Banda - Completed
  {
    id: 'FND-1048-01',
    fundingReference: 'TB-FND-1048-01',
    walletId: 'TB-WAL-1048',
    customerId: 'TB-CUS-1048',
    customerName: 'Ruth Banda',
    maskedMobileNumber: '+260 97 ••• 3210',
    provider: 'MTN Mobile Money',
    amount: 25000.0,
    providerReference: 'MTN-TXN-1123904',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1048-01',
    initiatedAt: '22 Nov 2024, 02:10 PM',
    initiatedTimestamp: '2024-11-22T12:10:00Z',
    lastUpdated: '22 Nov 2024, 02:12 PM',
    lastUpdatedTimestamp: '2024-11-22T12:12:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer top-up of ZMW 25,000.00 initiated.',
        timestamp: '22 Nov 2024, 02:10:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Webhook Settlement Verified',
        description: 'MTN transaction confirmed by verified provider signature.',
        timestamp: '22 Nov 2024, 02:11:35 PM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Wallet Ledger Credited',
        description: 'Posted ledger credit TB-LED-1048-01 for ZMW 25,000.00.',
        timestamp: '22 Nov 2024, 02:12:00 PM',
        status: 'completed',
      },
    ],
  },

  // 9. Ruth Banda - Reversed
  {
    id: 'FND-1048-02',
    fundingReference: 'TB-FND-1048-02',
    walletId: 'TB-WAL-1048',
    customerId: 'TB-CUS-1048',
    customerName: 'Ruth Banda',
    maskedMobileNumber: '+260 97 ••• 3210',
    provider: 'Airtel Money',
    amount: 5000.0,
    providerReference: 'AIR-TXN-9021844',
    status: 'Reversed',
    walletCreditReference: 'TB-LED-1048-02',
    reversalCreditReference: 'TB-LED-1048-REV',
    initiatedAt: '15 Jun 2025, 10:30 AM',
    initiatedTimestamp: '2025-06-15T08:30:00Z',
    lastUpdated: '15 Jun 2025, 11:15 AM',
    lastUpdatedTimestamp: '2025-06-15T09:15:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer initiated top-up of ZMW 5,000.00.',
        timestamp: '15 Jun 2025, 10:30:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Initial Credit Posted',
        description: 'Credit entry TB-LED-1048-02 posted on initial callback.',
        timestamp: '15 Jun 2025, 10:32:00 AM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Provider Reversal Notice Received',
        description: 'Airtel dispute engine flagged duplicate charge; reversal webhook received.',
        timestamp: '15 Jun 2025, 11:14:20 AM',
        status: 'completed',
      },
      {
        step: '4',
        title: 'Compensating Reversal Entry Posted',
        description: 'Posted compensating ledger reversal TB-LED-1048-REV without deleting original credit.',
        timestamp: '15 Jun 2025, 11:15:00 AM',
        status: 'completed',
      },
    ],
  },

  // 10. Grace Tembo - Completed
  {
    id: 'FND-1050-01',
    fundingReference: 'TB-FND-1050-01',
    walletId: 'TB-WAL-1050',
    customerId: 'TB-CUS-1050',
    customerName: 'Grace Tembo',
    maskedMobileNumber: '+260 97 ••• 0123',
    provider: 'MTN Mobile Money',
    amount: 8000.0,
    providerReference: 'MTN-TXN-6612903',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1050-01',
    initiatedAt: '18 Jan 2025, 04:45 PM',
    initiatedTimestamp: '2025-01-18T14:45:00Z',
    lastUpdated: '18 Jan 2025, 04:47 PM',
    lastUpdatedTimestamp: '2025-01-18T14:47:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer top-up of ZMW 8,000.00 initiated.',
        timestamp: '18 Jan 2025, 04:45:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Webhook Settlement Verified',
        description: 'MTN transaction confirmed by provider.',
        timestamp: '18 Jan 2025, 04:46:30 PM',
        status: 'completed',
      },
      {
        step: '3',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1050-01 for ZMW 8,000.00.',
        timestamp: '18 Jan 2025, 04:47:00 PM',
        status: 'completed',
      },
    ],
  },

  // 11. Grace Tembo - Cancelled
  {
    id: 'FND-1050-02',
    fundingReference: 'TB-FND-1050-02',
    walletId: 'TB-WAL-1050',
    customerId: 'TB-CUS-1050',
    customerName: 'Grace Tembo',
    maskedMobileNumber: '+260 97 ••• 0123',
    provider: 'Airtel Money',
    amount: 1200.0,
    providerReference: 'AIR-TXN-4412091',
    status: 'Cancelled',
    walletCreditReference: null,
    initiatedAt: '28 Aug 2026, 12:15 PM',
    initiatedTimestamp: '2026-08-28T10:15:00Z',
    lastUpdated: '28 Aug 2026, 12:17 PM',
    lastUpdatedTimestamp: '2026-08-28T10:17:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer top-up of ZMW 1,200.00 initiated.',
        timestamp: '28 Aug 2026, 12:15:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Customer Aborted Request',
        description: 'User dismissed the push authorization prompt.',
        timestamp: '28 Aug 2026, 12:16:30 PM',
        status: 'failed',
      },
      {
        step: '3',
        title: 'Funding Session Cancelled',
        description: 'Request marked cancelled; no wallet credit posted.',
        timestamp: '28 Aug 2026, 12:17:00 PM',
        status: 'failed',
      },
    ],
  },

  // 12. Kondwani Banda - Completed
  {
    id: 'FND-1033-01',
    fundingReference: 'TB-FND-1033-01',
    walletId: 'TB-WAL-1033',
    customerId: 'TB-CUS-1033',
    customerName: 'Kondwani Banda',
    maskedMobileNumber: '+260 96 ••• 6789',
    provider: 'Airtel Money',
    amount: 18500.0,
    providerReference: 'AIR-TXN-7729103',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1033-01',
    initiatedAt: '12 Mar 2025, 10:05 AM',
    initiatedTimestamp: '2025-03-12T08:05:00Z',
    lastUpdated: '12 Mar 2025, 10:07 AM',
    lastUpdatedTimestamp: '2025-03-12T08:07:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer top-up of ZMW 18,500.00 initiated.',
        timestamp: '12 Mar 2025, 10:05:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1033-01 for ZMW 18,500.00.',
        timestamp: '12 Mar 2025, 10:07:00 AM',
        status: 'completed',
      },
    ],
  },

  // 13. Kondwani Banda - Expired
  {
    id: 'FND-1033-02',
    fundingReference: 'TB-FND-1033-02',
    walletId: 'TB-WAL-1033',
    customerId: 'TB-CUS-1033',
    customerName: 'Kondwani Banda',
    maskedMobileNumber: '+260 96 ••• 6789',
    provider: 'MTN Mobile Money',
    amount: 4000.0,
    providerReference: 'MTN-TXN-3381902',
    status: 'Expired',
    walletCreditReference: null,
    initiatedAt: '01 Sep 2026, 03:30 PM',
    initiatedTimestamp: '2026-09-01T13:30:00Z',
    lastUpdated: '01 Sep 2026, 03:35 PM',
    lastUpdatedTimestamp: '2026-09-01T13:35:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Customer top-up of ZMW 4,000.00 initiated.',
        timestamp: '01 Sep 2026, 03:30:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'USSD Session Timeout',
        description: 'Subscriber did not respond to USSD prompt within 120s.',
        timestamp: '01 Sep 2026, 03:32:00 PM',
        status: 'failed',
      },
      {
        step: '3',
        title: 'Session Expired',
        description: 'Provider callback returned STATUS_EXPIRED; no ledger credit created.',
        timestamp: '01 Sep 2026, 03:35:00 PM',
        status: 'failed',
      },
    ],
  },

  // 14. Natasha Tembo - Completed
  {
    id: 'FND-1035-01',
    fundingReference: 'TB-FND-1035-01',
    walletId: 'TB-WAL-1035',
    customerId: 'TB-CUS-1035',
    customerName: 'Natasha Tembo',
    maskedMobileNumber: '+260 97 ••• 7890',
    provider: 'MTN Mobile Money',
    amount: 9200.0,
    providerReference: 'MTN-TXN-8812905',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1035-01',
    initiatedAt: '19 Apr 2025, 08:40 AM',
    initiatedTimestamp: '2025-04-19T06:40:00Z',
    lastUpdated: '19 Apr 2025, 08:42 AM',
    lastUpdatedTimestamp: '2025-04-19T06:42:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 9,200.00 initiated via MTN MoMo.',
        timestamp: '19 Apr 2025, 08:40:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1035-01 for ZMW 9,200.00.',
        timestamp: '19 Apr 2025, 08:42:00 AM',
        status: 'completed',
      },
    ],
  },

  // 15. Natasha Tembo - Pending
  {
    id: 'FND-1035-02',
    fundingReference: 'TB-FND-1035-02',
    walletId: 'TB-WAL-1035',
    customerId: 'TB-CUS-1035',
    customerName: 'Natasha Tembo',
    maskedMobileNumber: '+260 97 ••• 7890',
    provider: 'Airtel Money',
    amount: 2500.0,
    providerReference: 'AIR-TXN-1192840',
    status: 'Pending',
    walletCreditReference: null,
    initiatedAt: '09 Sep 2026, 09:12 AM',
    initiatedTimestamp: '2026-09-09T07:12:00Z',
    lastUpdated: '09 Sep 2026, 09:13 AM',
    lastUpdatedTimestamp: '2026-09-09T07:13:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 2,500.00 initiated via Airtel Money.',
        timestamp: '09 Sep 2026, 09:12:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Awaiting Provider Settlement Callback',
        description: 'Payment authorized on handset; awaiting provider callback verification.',
        timestamp: '09 Sep 2026, 09:12:35 AM',
        status: 'in_progress',
      },
    ],
  },

  // 16. Brian Lungu - Completed
  {
    id: 'FND-1044-01',
    fundingReference: 'TB-FND-1044-01',
    walletId: 'TB-WAL-1044',
    customerId: 'TB-CUS-1044',
    customerName: 'Brian Lungu',
    maskedMobileNumber: '+260 97 ••• 4455',
    provider: 'Airtel Money',
    amount: 32000.0,
    providerReference: 'AIR-TXN-6619024',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1044-01',
    initiatedAt: '02 Feb 2025, 01:50 PM',
    initiatedTimestamp: '2025-02-02T11:50:00Z',
    lastUpdated: '02 Feb 2025, 01:52 PM',
    lastUpdatedTimestamp: '2025-02-02T11:52:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 32,000.00 initiated via Airtel Money.',
        timestamp: '02 Feb 2025, 01:50:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1044-01 for ZMW 32,000.00.',
        timestamp: '02 Feb 2025, 01:52:00 PM',
        status: 'completed',
      },
    ],
  },

  // 17. Brian Lungu - Failed
  {
    id: 'FND-1044-02',
    fundingReference: 'TB-FND-1044-02',
    walletId: 'TB-WAL-1044',
    customerId: 'TB-CUS-1044',
    customerName: 'Brian Lungu',
    maskedMobileNumber: '+260 97 ••• 4455',
    provider: 'MTN Mobile Money',
    amount: 5000.0,
    providerReference: 'MTN-TXN-4491023',
    status: 'Failed',
    walletCreditReference: null,
    initiatedAt: '05 Sep 2026, 05:02 PM',
    initiatedTimestamp: '2026-09-05T15:02:00Z',
    lastUpdated: '05 Sep 2026, 05:04 PM',
    lastUpdatedTimestamp: '2026-09-05T15:04:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 5,000.00 initiated.',
        timestamp: '05 Sep 2026, 05:02:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Insufficient Subscriber Funds',
        description: 'MTN core returned error: INSUFFICIENT_BALANCE.',
        timestamp: '05 Sep 2026, 05:03:30 PM',
        status: 'failed',
      },
    ],
  },

  // 18. Lombe Kasonde - Completed
  {
    id: 'FND-1001-01',
    fundingReference: 'TB-FND-1001-01',
    walletId: 'TB-WAL-1001',
    customerId: 'TB-CUS-1001',
    customerName: 'Lombe Kasonde',
    maskedMobileNumber: '+260 97 ••• 4567',
    provider: 'MTN Mobile Money',
    amount: 22500.0,
    providerReference: 'MTN-TXN-3319082',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1001-01',
    initiatedAt: '11 Jan 2025, 10:15 AM',
    initiatedTimestamp: '2025-01-11T08:15:00Z',
    lastUpdated: '11 Jan 2025, 10:17 AM',
    lastUpdatedTimestamp: '2025-01-11T08:17:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 22,500.00 initiated.',
        timestamp: '11 Jan 2025, 10:15:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1001-01 for ZMW 22,500.00.',
        timestamp: '11 Jan 2025, 10:17:00 AM',
        status: 'completed',
      },
    ],
  },

  // 19. Lombe Kasonde - Reversed
  {
    id: 'FND-1001-02',
    fundingReference: 'TB-FND-1001-02',
    walletId: 'TB-WAL-1001',
    customerId: 'TB-CUS-1001',
    customerName: 'Lombe Kasonde',
    maskedMobileNumber: '+260 97 ••• 4567',
    provider: 'Airtel Money',
    amount: 3000.0,
    providerReference: 'AIR-TXN-2219085',
    status: 'Reversed',
    walletCreditReference: 'TB-LED-1001-02',
    reversalCreditReference: 'TB-LED-1001-REV',
    initiatedAt: '14 Aug 2026, 11:00 AM',
    initiatedTimestamp: '2026-08-14T09:00:00Z',
    lastUpdated: '14 Aug 2026, 11:45 AM',
    lastUpdatedTimestamp: '2026-08-14T09:45:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 3,000.00 initiated.',
        timestamp: '14 Aug 2026, 11:00:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Compensating Reversal Entry Posted',
        description: 'Posted compensating ledger reversal TB-LED-1001-REV on provider reversal notice.',
        timestamp: '14 Aug 2026, 11:45:00 AM',
        status: 'completed',
      },
    ],
  },

  // 20. Mutale Mwape - Completed
  {
    id: 'FND-1041-01',
    fundingReference: 'TB-FND-1041-01',
    walletId: 'TB-WAL-1041',
    customerId: 'TB-CUS-1041',
    customerName: 'Mutale Mwape',
    maskedMobileNumber: '+260 96 ••• 9900',
    provider: 'Airtel Money',
    amount: 16000.0,
    providerReference: 'AIR-TXN-9912048',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1041-01',
    initiatedAt: '25 Jan 2025, 03:25 PM',
    initiatedTimestamp: '2025-01-25T13:25:00Z',
    lastUpdated: '25 Jan 2025, 03:27 PM',
    lastUpdatedTimestamp: '2025-01-25T13:27:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 16,000.00 initiated.',
        timestamp: '25 Jan 2025, 03:25:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1041-01 for ZMW 16,000.00.',
        timestamp: '25 Jan 2025, 03:27:00 PM',
        status: 'completed',
      },
    ],
  },

  // 21. Mutale Mwape - Initiated
  {
    id: 'FND-1041-02',
    fundingReference: 'TB-FND-1041-02',
    walletId: 'TB-WAL-1041',
    customerId: 'TB-CUS-1041',
    customerName: 'Mutale Mwape',
    maskedMobileNumber: '+260 96 ••• 9900',
    provider: 'MTN Mobile Money',
    amount: 2200.0,
    providerReference: 'MTN-TXN-1190245',
    status: 'Initiated',
    walletCreditReference: null,
    initiatedAt: '09 Sep 2026, 10:02 AM',
    initiatedTimestamp: '2026-09-09T08:02:00Z',
    lastUpdated: '09 Sep 2026, 10:02 AM',
    lastUpdatedTimestamp: '2026-09-09T08:02:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Direct API request dispatched to MTN MoMo collection endpoint.',
        timestamp: '09 Sep 2026, 10:02:00 AM',
        status: 'completed',
      },
    ],
  },

  // 22. Kabwe Musonda - Completed
  {
    id: 'FND-1025-01',
    fundingReference: 'TB-FND-1025-01',
    walletId: 'TB-WAL-1025',
    customerId: 'TB-CUS-1025',
    customerName: 'Kabwe Musonda',
    maskedMobileNumber: '+260 95 ••• 8899',
    provider: 'MTN Mobile Money',
    amount: 11400.0,
    providerReference: 'MTN-TXN-5581903',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1025-01',
    initiatedAt: '04 Mar 2025, 02:35 PM',
    initiatedTimestamp: '2025-03-04T12:35:00Z',
    lastUpdated: '04 Mar 2025, 02:37 PM',
    lastUpdatedTimestamp: '2025-03-04T12:37:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 11,400.00 initiated.',
        timestamp: '04 Mar 2025, 02:35:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1025-01 for ZMW 11,400.00.',
        timestamp: '04 Mar 2025, 02:37:00 PM',
        status: 'completed',
      },
    ],
  },

  // 23. Kabwe Musonda - Expired
  {
    id: 'FND-1025-02',
    fundingReference: 'TB-FND-1025-02',
    walletId: 'TB-WAL-1025',
    customerId: 'TB-CUS-1025',
    customerName: 'Kabwe Musonda',
    maskedMobileNumber: '+260 95 ••• 8899',
    provider: 'Airtel Money',
    amount: 4500.0,
    providerReference: 'AIR-TXN-7738192',
    status: 'Expired',
    walletCreditReference: null,
    initiatedAt: '03 Sep 2026, 09:20 AM',
    initiatedTimestamp: '2026-09-03T07:20:00Z',
    lastUpdated: '03 Sep 2026, 09:25 AM',
    lastUpdatedTimestamp: '2026-09-03T07:25:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 4,500.00 initiated.',
        timestamp: '03 Sep 2026, 09:20:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Prompt Timeout on Handset',
        description: 'Airtel B2B payment request timed out with no response.',
        timestamp: '03 Sep 2026, 09:25:00 AM',
        status: 'failed',
      },
    ],
  },

  // 24. Chilufya Bwalya - Completed
  {
    id: 'FND-1038-01',
    fundingReference: 'TB-FND-1038-01',
    walletId: 'TB-WAL-1038',
    customerId: 'TB-CUS-1038',
    customerName: 'Chilufya Bwalya',
    maskedMobileNumber: '+260 97 ••• 5566',
    provider: 'Airtel Money',
    amount: 19000.0,
    providerReference: 'AIR-TXN-8829104',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1038-01',
    initiatedAt: '17 Feb 2025, 11:50 AM',
    initiatedTimestamp: '2025-02-17T09:50:00Z',
    lastUpdated: '17 Feb 2025, 11:52 AM',
    lastUpdatedTimestamp: '2025-02-17T09:52:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 19,000.00 initiated.',
        timestamp: '17 Feb 2025, 11:50:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1038-01 for ZMW 19,000.00.',
        timestamp: '17 Feb 2025, 11:52:00 AM',
        status: 'completed',
      },
    ],
  },

  // 25. Chilufya Bwalya - Cancelled
  {
    id: 'FND-1038-02',
    fundingReference: 'TB-FND-1038-02',
    walletId: 'TB-WAL-1038',
    customerId: 'TB-CUS-1038',
    customerName: 'Chilufya Bwalya',
    maskedMobileNumber: '+260 97 ••• 5566',
    provider: 'MTN Mobile Money',
    amount: 1800.0,
    providerReference: 'MTN-TXN-9928103',
    status: 'Cancelled',
    walletCreditReference: null,
    initiatedAt: '07 Sep 2026, 04:40 PM',
    initiatedTimestamp: '2026-09-07T14:40:00Z',
    lastUpdated: '07 Sep 2026, 04:42 PM',
    lastUpdatedTimestamp: '2026-09-07T14:42:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 1,800.00 initiated.',
        timestamp: '07 Sep 2026, 04:40:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Customer Aborted Payment',
        description: 'Subscriber pressed Cancel on handset dialog.',
        timestamp: '07 Sep 2026, 04:41:30 PM',
        status: 'failed',
      },
    ],
  },

  // 26. Thandiwe Phiri - Completed
  {
    id: 'FND-1046-01',
    fundingReference: 'TB-FND-1046-01',
    walletId: 'TB-WAL-1046',
    customerId: 'TB-CUS-1046',
    customerName: 'Thandiwe Phiri',
    maskedMobileNumber: '+260 96 ••• 1122',
    provider: 'MTN Mobile Money',
    amount: 13500.0,
    providerReference: 'MTN-TXN-4481029',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1046-01',
    initiatedAt: '28 Feb 2025, 04:10 PM',
    initiatedTimestamp: '2025-02-28T14:10:00Z',
    lastUpdated: '28 Feb 2025, 04:12 PM',
    lastUpdatedTimestamp: '2025-02-28T14:12:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 13,500.00 initiated.',
        timestamp: '28 Feb 2025, 04:10:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1046-01 for ZMW 13,500.00.',
        timestamp: '28 Feb 2025, 04:12:00 PM',
        status: 'completed',
      },
    ],
  },

  // 27. Thandiwe Phiri - Completed
  {
    id: 'FND-1046-02',
    fundingReference: 'TB-FND-1046-02',
    walletId: 'TB-WAL-1046',
    customerId: 'TB-CUS-1046',
    customerName: 'Thandiwe Phiri',
    maskedMobileNumber: '+260 96 ••• 1122',
    provider: 'Airtel Money',
    amount: 7000.0,
    providerReference: 'AIR-TXN-3381904',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1046-02',
    initiatedAt: '01 Sep 2026, 10:20 AM',
    initiatedTimestamp: '2026-09-01T08:20:00Z',
    lastUpdated: '01 Sep 2026, 10:22 AM',
    lastUpdatedTimestamp: '2026-09-01T08:22:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 7,000.00 initiated.',
        timestamp: '01 Sep 2026, 10:20:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1046-02 for ZMW 7,000.00.',
        timestamp: '01 Sep 2026, 10:22:00 AM',
        status: 'completed',
      },
    ],
  },

  // 28. Dalitso Zulu - Completed
  {
    id: 'FND-1029-01',
    fundingReference: 'TB-FND-1029-01',
    walletId: 'TB-WAL-1029',
    customerId: 'TB-CUS-1029',
    customerName: 'Dalitso Zulu',
    maskedMobileNumber: '+260 95 ••• 3344',
    provider: 'Airtel Money',
    amount: 21000.0,
    providerReference: 'AIR-TXN-1120938',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1029-01',
    initiatedAt: '08 Mar 2025, 09:30 AM',
    initiatedTimestamp: '2025-03-08T07:30:00Z',
    lastUpdated: '08 Mar 2025, 09:32 AM',
    lastUpdatedTimestamp: '2025-03-08T07:32:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 21,000.00 initiated.',
        timestamp: '08 Mar 2025, 09:30:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1029-01 for ZMW 21,000.00.',
        timestamp: '08 Mar 2025, 09:32:00 AM',
        status: 'completed',
      },
    ],
  },

  // 29. Sibeso Mutale - Completed
  {
    id: 'FND-1043-01',
    fundingReference: 'TB-FND-1043-01',
    walletId: 'TB-WAL-1043',
    customerId: 'TB-CUS-1043',
    customerName: 'Sibeso Mutale',
    maskedMobileNumber: '+260 97 ••• 6677',
    provider: 'MTN Mobile Money',
    amount: 8500.0,
    providerReference: 'MTN-TXN-7738190',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1043-01',
    initiatedAt: '15 Mar 2025, 01:15 PM',
    initiatedTimestamp: '2025-03-15T11:15:00Z',
    lastUpdated: '15 Mar 2025, 01:17 PM',
    lastUpdatedTimestamp: '2025-03-15T11:17:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 8,500.00 initiated.',
        timestamp: '15 Mar 2025, 01:15:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1043-01 for ZMW 8,500.00.',
        timestamp: '15 Mar 2025, 01:17:00 PM',
        status: 'completed',
      },
    ],
  },

  // 30. Sibeso Mutale - Failed
  {
    id: 'FND-1043-02',
    fundingReference: 'TB-FND-1043-02',
    walletId: 'TB-WAL-1043',
    customerId: 'TB-CUS-1043',
    customerName: 'Sibeso Mutale',
    maskedMobileNumber: '+260 97 ••• 6677',
    provider: 'MTN Mobile Money',
    amount: 3200.0,
    providerReference: 'MTN-TXN-6628190',
    status: 'Failed',
    walletCreditReference: null,
    initiatedAt: '06 Sep 2026, 02:10 PM',
    initiatedTimestamp: '2026-09-06T12:10:00Z',
    lastUpdated: '06 Sep 2026, 02:12 PM',
    lastUpdatedTimestamp: '2026-09-06T12:12:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 3,200.00 initiated.',
        timestamp: '06 Sep 2026, 02:10:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Provider Network Timeout',
        description: 'MTN gateway connectivity interrupted during handshake.',
        timestamp: '06 Sep 2026, 02:11:45 PM',
        status: 'failed',
      },
    ],
  },

  // 31. Mapalo Kangwa - Completed
  {
    id: 'FND-1031-01',
    fundingReference: 'TB-FND-1031-01',
    walletId: 'TB-WAL-1031',
    customerId: 'TB-CUS-1031',
    customerName: 'Mapalo Kangwa',
    maskedMobileNumber: '+260 96 ••• 5566',
    provider: 'Airtel Money',
    amount: 17200.0,
    providerReference: 'AIR-TXN-5591028',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1031-01',
    initiatedAt: '22 Mar 2025, 12:40 PM',
    initiatedTimestamp: '2025-03-22T10:40:00Z',
    lastUpdated: '22 Mar 2025, 12:42 PM',
    lastUpdatedTimestamp: '2025-03-22T10:42:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 17,200.00 initiated.',
        timestamp: '22 Mar 2025, 12:40:00 PM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1031-01 for ZMW 17,200.00.',
        timestamp: '22 Mar 2025, 12:42:00 PM',
        status: 'completed',
      },
    ],
  },

  // 32. Precious Chisamba - Completed
  {
    id: 'FND-1040-01',
    fundingReference: 'TB-FND-1040-01',
    walletId: 'TB-WAL-1040',
    customerId: 'TB-CUS-1040',
    customerName: 'Precious Chisamba',
    maskedMobileNumber: '+260 95 ••• 0011',
    provider: 'MTN Mobile Money',
    amount: 14800.0,
    providerReference: 'MTN-TXN-2281904',
    status: 'Completed',
    walletCreditReference: 'TB-LED-1040-01',
    initiatedAt: '05 Apr 2025, 11:05 AM',
    initiatedTimestamp: '2025-04-05T09:05:00Z',
    lastUpdated: '05 Apr 2025, 11:07 AM',
    lastUpdatedTimestamp: '2025-04-05T09:07:00Z',
    timeline: [
      {
        step: '1',
        title: 'Funding Request Initiated',
        description: 'Top-up of ZMW 14,800.00 initiated.',
        timestamp: '05 Apr 2025, 11:05:00 AM',
        status: 'completed',
      },
      {
        step: '2',
        title: 'Wallet Ledger Credited',
        description: 'Posted credit TB-LED-1040-01 for ZMW 14,800.00.',
        timestamp: '05 Apr 2025, 11:07:00 AM',
        status: 'completed',
      },
    ],
  },
];

/**
 * Calculates summary metrics derived from the funding dataset
 */
export function calculateWalletFundingSummary(records: WalletFundingRecord[]): WalletFundingSummary {
  let totalAttempts = records.length;
  let completedAmount = 0;
  let pendingVerificationCount = 0;
  let failedExpiredCount = 0;
  let reversedCount = 0;

  records.forEach((r) => {
    if (r.status === 'Completed') {
      completedAmount += r.amount;
    } else if (r.status === 'Pending' || r.status === 'Initiated') {
      pendingVerificationCount += 1;
    } else if (r.status === 'Failed' || r.status === 'Expired') {
      failedExpiredCount += 1;
    } else if (r.status === 'Reversed') {
      reversedCount += 1;
    }
  });

  return {
    totalAttempts,
    completedAmount: Math.round(completedAmount * 100) / 100,
    pendingVerificationCount,
    failedExpiredCount,
    reversedCount,
  };
}

/**
 * Filters and sorts Wallet Funding records
 */
export function filterAndSortWalletFunding(
  records: WalletFundingRecord[],
  filters: WalletFundingFilters,
  sort: { field: WalletFundingSortField; direction: WalletFundingSortDirection }
): WalletFundingRecord[] {
  let result = [...records];

  // 1. KPI Filter
  if (filters.kpiFilter && filters.kpiFilter !== 'ALL') {
    switch (filters.kpiFilter) {
      case 'COMPLETED':
        result = result.filter((r) => r.status === 'Completed');
        break;
      case 'PENDING_VERIFICATION':
        result = result.filter((r) => r.status === 'Pending' || r.status === 'Initiated');
        break;
      case 'FAILED_EXPIRED':
        result = result.filter((r) => r.status === 'Failed' || r.status === 'Expired');
        break;
      case 'REVERSED':
        result = result.filter((r) => r.status === 'Reversed');
        break;
    }
  }

  // 2. Search filter: Reference, customer name, customer ID, mobile number, provider reference
  if (filters.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.fundingReference.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerId.toLowerCase().includes(q) ||
        r.maskedMobileNumber.toLowerCase().includes(q) ||
        r.providerReference.toLowerCase().includes(q) ||
        (r.walletCreditReference && r.walletCreditReference.toLowerCase().includes(q))
    );
  }

  // 3. Provider filter
  if (filters.provider && filters.provider !== 'ALL') {
    result = result.filter((r) => r.provider === filters.provider);
  }

  // 4. Status filter
  if (filters.status && filters.status !== 'ALL') {
    result = result.filter((r) => r.status === filters.status);
  }

  // 5. Date From
  if (filters.initiatedFrom && filters.initiatedFrom.trim() !== '') {
    const fromTime = new Date(`${filters.initiatedFrom}T00:00:00.000Z`).getTime();
    result = result.filter((r) => new Date(r.initiatedTimestamp).getTime() >= fromTime);
  }

  // 6. Date To
  if (filters.initiatedTo && filters.initiatedTo.trim() !== '') {
    const toTime = new Date(`${filters.initiatedTo}T23:59:59.999Z`).getTime();
    result = result.filter((r) => new Date(r.initiatedTimestamp).getTime() <= toTime);
  }

  // 7. Sorting
  result.sort((a, b) => {
    let cmp = 0;
    switch (sort.field) {
      case 'initiated':
        cmp = new Date(a.initiatedTimestamp).getTime() - new Date(b.initiatedTimestamp).getTime();
        break;
      case 'reference':
        cmp = a.fundingReference.localeCompare(b.fundingReference);
        break;
      case 'amount':
        cmp = a.amount - b.amount;
        break;
      case 'customer':
        cmp = a.customerName.localeCompare(b.customerName);
        break;
      case 'provider':
        cmp = a.provider.localeCompare(b.provider);
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
      default:
        cmp = new Date(a.initiatedTimestamp).getTime() - new Date(b.initiatedTimestamp).getTime();
    }
    return sort.direction === 'asc' ? cmp : -cmp;
  });

  return result;
}

/**
 * Lookup single funding record by reference or id
 */
export function getWalletFundingByReference(ref: string): WalletFundingRecord | undefined {
  const clean = ref.trim().toUpperCase();
  return MOCK_WALLET_FUNDING_RECORDS.find(
    (r) => r.fundingReference.toUpperCase() === clean || r.id.toUpperCase() === clean
  );
}

/**
 * Format currency with ZMW prefix and standard 2 decimal places
 */
export function formatZMW(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
