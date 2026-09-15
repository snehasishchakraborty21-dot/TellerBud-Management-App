import {
  ReconciliationRecord,
  CallbackEvent,
  ApiConnection,
} from '../types/reconciliation';

export const MOCK_RECONCILIATION_RECORDS: ReconciliationRecord[] = [
  // 1. TB-REC-1041-02 (Awaiting confirmation / Pending)
  {
    id: 'TB-REC-1041-02',
    reconciliationRef: 'TB-REC-1041-02',
    createdAt: '11 Sep 2026, 11:35 AM',
    rawDate: '2026-09-11T11:35:00Z',
    updatedAt: '11 Sep 2026, 11:35:18 AM',
    transactionRef: 'TB-FND-1041-02',
    transactionType: 'Wallet Funding',
    holderName: 'Mutale Mwape',
    customerId: 'TB-CUS-1041',
    customerPhone: '+260 96 1234567',
    walletId: 'TB-WAL-1041',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 2200.0,
    providerResponse: 'Processing',
    ledgerResult: 'Not Posted',
    reconciliation: 'Pending',
    providerTransactionId: 'MTN-COLL-948102',
    channel: 'Direct REST API (TLS 1.3)',
    apiOperation: 'Collection',
    callbackStatus: 'Awaiting Provider Callback',
    callbackReceivedAt: '—',
    verificationAttempts: '1',
    lastProviderResponseTime: '11 Sep 2026, 11:35:18 AM',
    ledgerEntryRef: '—',
    postingStatus: 'Awaiting Verified Provider Confirmation',
    postedAmount: 0.0,
    balanceBefore: 14500.0,
    balanceAfter: 14500.0,
    balanceChange: 0.0,
    reservationRef: '—',
    reversalRef: '—',
    expectedAmount: 2200.0,
    providerConfirmedAmount: 'Awaiting Confirmation',
    ledgerPostedAmount: 0.0,
    amountVariance: 'Pending',
    signatureVerification: 'Awaiting Callback',
    duplicateCallbackStatus: 'No Duplicate Detected',
    reconciliationDate: '—',
    exceptionReason: '—',
  },

  // 2. TB-REC-1049-02
  {
    id: 'TB-REC-1049-02',
    reconciliationRef: 'TB-REC-1049-02',
    createdAt: 'Today, 11:15 AM',
    rawDate: '2026-09-11T11:15:00Z',
    transactionRef: 'TB-FND-1049-02',
    transactionType: 'Wallet Funding',
    holderName: 'Chileshe Mumba',
    walletId: 'TB-WAL-1049',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 3500.0,
    providerResponse: 'Awaiting Callback',
    ledgerResult: 'Not Posted',
    reconciliation: 'Pending',
    providerTransactionId: 'MTN-COLL-948011',
    channel: 'Direct REST API (TLS 1.3)',
  },

  // 3. TB-REC-1035-02
  {
    id: 'TB-REC-1035-02',
    reconciliationRef: 'TB-REC-1035-02',
    createdAt: 'Today, 11:04 AM',
    rawDate: '2026-09-11T11:04:00Z',
    transactionRef: 'TB-FND-1035-02',
    transactionType: 'Wallet Funding',
    holderName: 'Natasha Tembo',
    walletId: 'TB-WAL-1035',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 2500.0,
    providerResponse: 'Processing',
    ledgerResult: 'Not Posted',
    reconciliation: 'Pending',
    providerTransactionId: 'AIR-COLL-729014',
    channel: 'Airtel B2B Collection Gateway',
  },

  // 4. TB-REC-1052-01
  {
    id: 'TB-REC-1052-01',
    reconciliationRef: 'TB-REC-1052-01',
    createdAt: 'Today, 10:48 AM',
    rawDate: '2026-09-11T10:48:00Z',
    transactionRef: 'TB-FND-1052-01',
    transactionType: 'Wallet Funding',
    holderName: 'Mwamba Mulenga',
    walletId: 'TB-WAL-1052',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 10000.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-947881',
    channel: 'Direct REST API (TLS 1.3)',
  },

  // 5. TB-REC-8798-01
  {
    id: 'TB-REC-8798-01',
    reconciliationRef: 'TB-REC-8798-01',
    createdAt: 'Today, 10:25 AM',
    rawDate: '2026-09-11T10:25:00Z',
    transactionRef: 'TB-WDR-8798',
    transactionType: 'Customer Withdrawal',
    holderName: 'Taonga Phiri',
    walletId: 'TB-WAL-1040',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 3000.0,
    providerResponse: 'Successful',
    ledgerResult: 'Debited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-PAY-882910',
    channel: 'MTN B2C Payout Engine',
  },

  // 6. TB-REC-8812-01
  {
    id: 'TB-REC-8812-01',
    reconciliationRef: 'TB-REC-8812-01',
    createdAt: 'Today, 10:18 AM',
    rawDate: '2026-09-11T10:18:00Z',
    transactionRef: 'TB-WDR-8812',
    transactionType: 'Customer Withdrawal',
    holderName: 'Lombe Kasonde',
    walletId: 'TB-WAL-1046',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 7200.0,
    providerResponse: 'Awaiting Callback',
    ledgerResult: 'Hold Created',
    reconciliation: 'Pending',
    providerTransactionId: 'MTN-PAY-882855',
    channel: 'MTN B2C Payout Engine',
  },

  // 7. TB-REC-1038-02
  {
    id: 'TB-REC-1038-02',
    reconciliationRef: 'TB-REC-1038-02',
    createdAt: 'Today, 09:50 AM',
    rawDate: '2026-09-11T09:50:00Z',
    transactionRef: 'TB-FND-1038-02',
    transactionType: 'Wallet Funding',
    holderName: 'Chilufya Bwalya',
    walletId: 'TB-WAL-1038',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 1800.0,
    providerResponse: 'Failed',
    ledgerResult: 'Not Posted',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-947701',
    channel: 'Direct REST API (TLS 1.3)',
  },

  // 8. TB-REC-EXC-1001
  {
    id: 'TB-REC-EXC-1001',
    reconciliationRef: 'TB-REC-EXC-1001',
    createdAt: 'Today, 09:30 AM',
    rawDate: '2026-09-11T09:30:00Z',
    transactionRef: 'TB-FND-1046-01',
    transactionType: 'Wallet Funding',
    holderName: 'Kondwani Sakala',
    walletId: 'TB-WAL-1046',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 5000.0,
    providerResponse: 'Successful',
    ledgerResult: 'Not Posted',
    reconciliation: 'Exception',
    providerTransactionId: 'AIR-COLL-728990',
    channel: 'Airtel B2B Collection Gateway',
    exceptionReason: 'Callback received successful status but transaction ledger posting pipeline timed out.',
  },

  // 9. TB-REC-EXC-1002
  {
    id: 'TB-REC-EXC-1002',
    reconciliationRef: 'TB-REC-EXC-1002',
    createdAt: 'Today, 09:12 AM',
    rawDate: '2026-09-11T09:12:00Z',
    transactionRef: 'TB-TXN-4255',
    transactionType: 'Business Wallet Transaction',
    holderName: 'Kabwe Central Agency',
    walletId: 'TB-BWL-1005',
    walletType: 'Business Global Wallet',
    provider: 'TellerBud Ledger',
    amount: 1200.0,
    providerResponse: 'Reversed',
    ledgerResult: 'Reversal Posted',
    reconciliation: 'Exception',
    channel: 'Internal Core Journal',
    exceptionReason: 'Discrepancy in double-entry offset reference requires secondary compliance verification.',
  },

  // 10. TB-REC-REV-1003
  {
    id: 'TB-REC-REV-1003',
    reconciliationRef: 'TB-REC-REV-1003',
    createdAt: 'Today, 08:45 AM',
    rawDate: '2026-09-11T08:45:00Z',
    transactionRef: 'TB-FND-1052-04',
    transactionType: 'Reversal',
    holderName: 'Mwamba Mulenga',
    walletId: 'TB-WAL-1052',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 2000.0,
    providerResponse: 'Reversed',
    ledgerResult: 'Reversal Posted',
    reconciliation: 'Reversed',
    providerTransactionId: 'AIR-REV-728100',
    channel: 'Airtel B2B Collection Gateway',
  },

  // Records 11 to 26 (Reconciled Today - Matched)
  {
    id: 'TB-REC-1048-01',
    reconciliationRef: 'TB-REC-1048-01',
    createdAt: 'Today, 08:30 AM',
    rawDate: '2026-09-11T08:30:00Z',
    transactionRef: 'TB-FND-1048-01',
    transactionType: 'Wallet Funding',
    holderName: 'Kabaso Chanda',
    walletId: 'TB-WAL-1048',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 4500.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-947612',
    channel: 'Direct REST API (TLS 1.3)',
  },
  {
    id: 'TB-REC-8790-01',
    reconciliationRef: 'TB-REC-8790-01',
    createdAt: 'Today, 08:22 AM',
    rawDate: '2026-09-11T08:22:00Z',
    transactionRef: 'TB-WDR-8790',
    transactionType: 'Customer Withdrawal',
    holderName: 'Bupe Musonda',
    walletId: 'TB-WAL-1032',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 1500.0,
    providerResponse: 'Successful',
    ledgerResult: 'Debited',
    reconciliation: 'Matched',
    providerTransactionId: 'AIR-PAY-728091',
    channel: 'Airtel Payout Gateway',
  },
  {
    id: 'TB-REC-BWL-1007-01',
    reconciliationRef: 'TB-REC-BWL-1007-01',
    createdAt: 'Today, 08:15 AM',
    rawDate: '2026-09-11T08:15:00Z',
    transactionRef: 'TB-TXN-4310',
    transactionType: 'Business Wallet Transaction',
    holderName: 'Lusaka Central Express Agency',
    walletId: 'TB-BWL-1007',
    walletType: 'Business Global Wallet',
    provider: 'MTN Mobile Money',
    amount: 3500.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-947540',
    channel: 'Direct REST API (TLS 1.3)',
  },
  {
    id: 'TB-REC-1033-01',
    reconciliationRef: 'TB-REC-1033-01',
    createdAt: 'Today, 08:05 AM',
    rawDate: '2026-09-11T08:05:00Z',
    transactionRef: 'TB-FND-1033-01',
    transactionType: 'Wallet Funding',
    holderName: 'Chileshe Mulenga',
    walletId: 'TB-WAL-1033',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 1200.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-947501',
    channel: 'Direct REST API (TLS 1.3)',
  },
  {
    id: 'TB-REC-1029-01',
    reconciliationRef: 'TB-REC-1029-01',
    createdAt: 'Today, 07:55 AM',
    rawDate: '2026-09-11T07:55:00Z',
    transactionRef: 'TB-FND-1029-01',
    transactionType: 'Wallet Funding',
    holderName: 'Moses Banda',
    walletId: 'TB-WAL-1029',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 2800.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'AIR-COLL-727914',
    channel: 'Airtel B2B Collection Gateway',
  },
  {
    id: 'TB-REC-8785-01',
    reconciliationRef: 'TB-REC-8785-01',
    createdAt: 'Today, 07:42 AM',
    rawDate: '2026-09-11T07:42:00Z',
    transactionRef: 'TB-WDR-8785',
    transactionType: 'Customer Withdrawal',
    holderName: 'Faith Zulu',
    walletId: 'TB-WAL-1025',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 1000.0,
    providerResponse: 'Successful',
    ledgerResult: 'Debited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-PAY-882701',
    channel: 'MTN B2C Payout Engine',
  },
  {
    id: 'TB-REC-1024-02',
    reconciliationRef: 'TB-REC-1024-02',
    createdAt: 'Today, 07:30 AM',
    rawDate: '2026-09-11T07:30:00Z',
    transactionRef: 'TB-FND-1024-02',
    transactionType: 'Wallet Funding',
    holderName: 'Peter Lungu',
    walletId: 'TB-WAL-1024',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 3200.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'AIR-COLL-727820',
    channel: 'Airtel B2B Collection Gateway',
  },
  {
    id: 'TB-REC-BWL-1002-01',
    reconciliationRef: 'TB-REC-BWL-1002-01',
    createdAt: 'Today, 07:18 AM',
    rawDate: '2026-09-11T07:18:00Z',
    transactionRef: 'TB-TXN-4211',
    transactionType: 'Business Wallet Transaction',
    holderName: 'Kitwe Hub Central Limited',
    walletId: 'TB-BWL-1002',
    walletType: 'Business Global Wallet',
    provider: 'TellerBud Ledger',
    amount: 6000.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    channel: 'Internal Core Journal',
  },
  {
    id: 'TB-REC-1021-01',
    reconciliationRef: 'TB-REC-1021-01',
    createdAt: 'Today, 07:05 AM',
    rawDate: '2026-09-11T07:05:00Z',
    transactionRef: 'TB-FND-1021-01',
    transactionType: 'Wallet Funding',
    holderName: 'Grace Chilufya',
    walletId: 'TB-WAL-1021',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 1900.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-947320',
    channel: 'Direct REST API (TLS 1.3)',
  },
  {
    id: 'TB-REC-8772-01',
    reconciliationRef: 'TB-REC-8772-01',
    createdAt: 'Today, 06:50 AM',
    rawDate: '2026-09-11T06:50:00Z',
    transactionRef: 'TB-WDR-8772',
    transactionType: 'Customer Withdrawal',
    holderName: 'Enoch Mwila',
    walletId: 'TB-WAL-1018',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 2500.0,
    providerResponse: 'Successful',
    ledgerResult: 'Debited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-PAY-882619',
    channel: 'MTN B2C Payout Engine',
  },
  // Records 21-30 (covering full page 1 & beginning of page 2)
  {
    id: 'TB-REC-1016-01',
    reconciliationRef: 'TB-REC-1016-01',
    createdAt: 'Today, 06:35 AM',
    rawDate: '2026-09-11T06:35:00Z',
    transactionRef: 'TB-FND-1016-01',
    transactionType: 'Wallet Funding',
    holderName: 'Agnes Mwanza',
    walletId: 'TB-WAL-1016',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 1400.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'AIR-COLL-727710',
    channel: 'Airtel B2B Collection Gateway',
  },
  {
    id: 'TB-REC-1014-01',
    reconciliationRef: 'TB-REC-1014-01',
    createdAt: 'Today, 06:20 AM',
    rawDate: '2026-09-11T06:20:00Z',
    transactionRef: 'TB-FND-1014-01',
    transactionType: 'Wallet Funding',
    holderName: 'Samuel Kalaba',
    walletId: 'TB-WAL-1014',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 2100.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-947211',
    channel: 'Direct REST API (TLS 1.3)',
  },
  {
    id: 'TB-REC-8761-01',
    reconciliationRef: 'TB-REC-8761-01',
    createdAt: 'Today, 06:05 AM',
    rawDate: '2026-09-11T06:05:00Z',
    transactionRef: 'TB-WDR-8761',
    transactionType: 'Customer Withdrawal',
    holderName: 'Veronica Kangwa',
    walletId: 'TB-WAL-1011',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 800.0,
    providerResponse: 'Successful',
    ledgerResult: 'Debited',
    reconciliation: 'Matched',
    providerTransactionId: 'AIR-PAY-727650',
    channel: 'Airtel Payout Gateway',
  },
  {
    id: 'TB-REC-1009-01',
    reconciliationRef: 'TB-REC-1009-01',
    createdAt: 'Today, 05:50 AM',
    rawDate: '2026-09-11T05:50:00Z',
    transactionRef: 'TB-FND-1009-01',
    transactionType: 'Wallet Funding',
    holderName: 'Josephine Musonda',
    walletId: 'TB-WAL-1009',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 3100.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-947109',
    channel: 'Direct REST API (TLS 1.3)',
  },
  {
    id: 'TB-REC-BWL-1001-01',
    reconciliationRef: 'TB-REC-BWL-1001-01',
    createdAt: 'Today, 05:30 AM',
    rawDate: '2026-09-11T05:30:00Z',
    transactionRef: 'TB-TXN-4190',
    transactionType: 'Business Wallet Transaction',
    holderName: 'Ndola Main Distribution Hub',
    walletId: 'TB-BWL-1001',
    walletType: 'Business Global Wallet',
    provider: 'TellerBud Ledger',
    amount: 4500.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    channel: 'Internal Core Journal',
  },
  {
    id: 'TB-REC-1005-01',
    reconciliationRef: 'TB-REC-1005-01',
    createdAt: 'Today, 05:15 AM',
    rawDate: '2026-09-11T05:15:00Z',
    transactionRef: 'TB-FND-1005-01',
    transactionType: 'Wallet Funding',
    holderName: 'Chanda Bwalya',
    walletId: 'TB-WAL-1005',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 1750.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'AIR-COLL-727500',
    channel: 'Airtel B2B Collection Gateway',
  },
  {
    id: 'TB-REC-8750-01',
    reconciliationRef: 'TB-REC-8750-01',
    createdAt: 'Today, 04:50 AM',
    rawDate: '2026-09-11T04:50:00Z',
    transactionRef: 'TB-WDR-8750',
    transactionType: 'Customer Withdrawal',
    holderName: 'Derrick Chibwe',
    walletId: 'TB-WAL-1003',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 1600.0,
    providerResponse: 'Successful',
    ledgerResult: 'Debited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-PAY-882500',
    channel: 'MTN B2C Payout Engine',
  },
  {
    id: 'TB-REC-1002-01',
    reconciliationRef: 'TB-REC-1002-01',
    createdAt: 'Today, 04:20 AM',
    rawDate: '2026-09-11T04:20:00Z',
    transactionRef: 'TB-FND-1002-01',
    transactionType: 'Wallet Funding',
    holderName: 'Miriam Kaunda',
    walletId: 'TB-WAL-1002',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 2900.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-COLL-946980',
    channel: 'Direct REST API (TLS 1.3)',
  },
  {
    id: 'TB-REC-1001-01',
    reconciliationRef: 'TB-REC-1001-01',
    createdAt: 'Today, 03:40 AM',
    rawDate: '2026-09-11T03:40:00Z',
    transactionRef: 'TB-FND-1001-01',
    transactionType: 'Wallet Funding',
    holderName: 'Godfrey Mwape',
    walletId: 'TB-WAL-1001',
    walletType: 'Customer Wallet',
    provider: 'Airtel Money',
    amount: 5000.0,
    providerResponse: 'Successful',
    ledgerResult: 'Credited',
    reconciliation: 'Matched',
    providerTransactionId: 'AIR-COLL-727411',
    channel: 'Airtel B2B Collection Gateway',
  },
  {
    id: 'TB-REC-8740-01',
    reconciliationRef: 'TB-REC-8740-01',
    createdAt: 'Today, 03:10 AM',
    rawDate: '2026-09-11T03:10:00Z',
    transactionRef: 'TB-WDR-8740',
    transactionType: 'Customer Withdrawal',
    holderName: 'Mercy Chilando',
    walletId: 'TB-WAL-1000',
    walletType: 'Customer Wallet',
    provider: 'MTN Mobile Money',
    amount: 2200.0,
    providerResponse: 'Successful',
    ledgerResult: 'Debited',
    reconciliation: 'Matched',
    providerTransactionId: 'MTN-PAY-882410',
    channel: 'MTN B2C Payout Engine',
  },
  // Additional historical records to total 64 records exactly
  ...Array.from({ length: 34 }).map((_, index) => {
    const num = index + 31;
    const isMtn = num % 2 === 0;
    const isFunding = num % 3 !== 0;
    const isReversal = num === 45 || num === 58;
    const isException = false; // Only 2 exceptions exist for total system KPI accuracy
    const amount = 500 + ((num * 173) % 4500);

    const txType: ReconciliationRecord['transactionType'] = isReversal
      ? 'Reversal'
      : isFunding
      ? 'Wallet Funding'
      : 'Customer Withdrawal';

    const provider: ReconciliationRecord['provider'] = isMtn
      ? 'MTN Mobile Money'
      : num % 5 === 0
      ? 'TellerBud Ledger'
      : 'Airtel Money';

    const providerResp: ReconciliationRecord['providerResponse'] = isReversal
      ? 'Reversed'
      : 'Successful';

    const ledgerRes: ReconciliationRecord['ledgerResult'] = isReversal
      ? 'Reversal Posted'
      : isFunding
      ? 'Credited'
      : 'Debited';

    const reconciliationStatus: ReconciliationRecord['reconciliation'] = isReversal
      ? 'Reversed'
      : 'Matched';

    const day = Math.min(10, Math.max(1, 10 - Math.floor(index / 5)));
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const hour = (num * 3) % 12 || 12;
    const minute = (num * 7) % 60;
    const formattedMinute = minute < 10 ? `0${minute}` : `${minute}`;
    const ampm = num % 2 === 0 ? 'AM' : 'PM';

    return {
      id: `TB-REC-HIST-${1000 + num}`,
      reconciliationRef: `TB-REC-HIST-${1000 + num}`,
      createdAt: `${formattedDay} Sep 2026, ${hour}:${formattedMinute} ${ampm}`,
      rawDate: `2026-09-${formattedDay}T${hour < 10 ? '0' + hour : hour}:${formattedMinute}:00Z`,
      transactionRef: `TB-${isFunding ? 'FND' : isReversal ? 'REV' : 'WDR'}-${5000 + num}`,
      transactionType: txType,
      holderName: [
        'Mwansa Mulenga',
        'Kelvin Phiri',
        'Beatrice Mwila',
        'Chileshe Musonda',
        'Patrick Chilufya',
        'Gift Tembo',
        'Inonge Lubinda',
        'Brian Chanda',
        'Lillian Sitali',
      ][num % 9],
      walletId: `TB-WAL-${1000 + (num % 50)}`,
      walletType: num % 7 === 0 ? 'Business Global Wallet' : 'Customer Wallet',
      provider,
      amount: Math.round(amount * 100) / 100,
      providerResponse: providerResp,
      ledgerResult: ledgerRes,
      reconciliation: reconciliationStatus,
      providerTransactionId: `${isMtn ? 'MTN' : 'AIR'}-HIST-${900000 + num}`,
      channel: isMtn ? 'Direct REST API (TLS 1.3)' : 'Airtel B2B Collection Gateway',
    } as ReconciliationRecord;
  }),
];

export const MOCK_CALLBACK_EVENTS: CallbackEvent[] = [
  {
    id: 'CB-MTN-948102',
    provider: 'MTN Mobile Money',
    transactionRef: 'TB-FND-1041-02',
    eventType: 'Payment Initiated',
    receivedAt: 'Today, 11:35 AM',
    rawDate: '2026-09-11T11:35:00Z',
    signatureVerified: true,
    processingResult: 'Processed',
    duplicateStatus: 'Original',
    endpoint: '/api/v1/callbacks/mtn',
    httpStatus: 200,
    ipAddress: '196.201.214.33',
  },
  {
    id: 'CB-MTN-948011',
    provider: 'MTN Mobile Money',
    transactionRef: 'TB-FND-1049-02',
    eventType: 'Payment Awaiting Handshake',
    receivedAt: 'Today, 11:15 AM',
    rawDate: '2026-09-11T11:15:00Z',
    signatureVerified: true,
    processingResult: 'Processed',
    duplicateStatus: 'Original',
    endpoint: '/api/v1/callbacks/mtn',
    httpStatus: 200,
    ipAddress: '196.201.214.34',
  },
  {
    id: 'CB-MTN-948011-DUP',
    provider: 'MTN Mobile Money',
    transactionRef: 'TB-FND-1049-02',
    eventType: 'Payment Awaiting Handshake (Retransmit)',
    receivedAt: 'Today, 11:16 AM',
    rawDate: '2026-09-11T11:16:00Z',
    signatureVerified: true,
    processingResult: 'Discarded',
    duplicateStatus: 'Duplicate Discarded',
    endpoint: '/api/v1/callbacks/mtn',
    httpStatus: 200,
    ipAddress: '196.201.214.34',
  },
  {
    id: 'CB-AIR-729014',
    provider: 'Airtel Money',
    transactionRef: 'TB-FND-1035-02',
    eventType: 'USSD Push Dispatched',
    receivedAt: 'Today, 11:04 AM',
    rawDate: '2026-09-11T11:04:00Z',
    signatureVerified: true,
    processingResult: 'Processed',
    duplicateStatus: 'Original',
    endpoint: '/api/v1/callbacks/airtel',
    httpStatus: 200,
    ipAddress: '41.223.118.12',
  },
  {
    id: 'CB-MTN-947881',
    provider: 'MTN Mobile Money',
    transactionRef: 'TB-FND-1052-01',
    eventType: 'Payment Completed Succeeded',
    receivedAt: 'Today, 10:48 AM',
    rawDate: '2026-09-11T10:48:00Z',
    signatureVerified: true,
    processingResult: 'Processed',
    duplicateStatus: 'Original',
    endpoint: '/api/v1/callbacks/mtn',
    httpStatus: 200,
    ipAddress: '196.201.214.33',
  },
  {
    id: 'CB-MTN-947881-DUP',
    provider: 'MTN Mobile Money',
    transactionRef: 'TB-FND-1052-01',
    eventType: 'Payment Completed Succeeded',
    receivedAt: 'Today, 10:49 AM',
    rawDate: '2026-09-11T10:49:00Z',
    signatureVerified: true,
    processingResult: 'Discarded',
    duplicateStatus: 'Duplicate Discarded',
    endpoint: '/api/v1/callbacks/mtn',
    httpStatus: 200,
    ipAddress: '196.201.214.33',
  },
  {
    id: 'CB-MTN-882910',
    provider: 'MTN Mobile Money',
    transactionRef: 'TB-WDR-8798',
    eventType: 'Disbursement Paid',
    receivedAt: 'Today, 10:25 AM',
    rawDate: '2026-09-11T10:25:00Z',
    signatureVerified: true,
    processingResult: 'Processed',
    duplicateStatus: 'Original',
    endpoint: '/api/v1/callbacks/mtn',
    httpStatus: 200,
    ipAddress: '196.201.214.38',
  },
  {
    id: 'CB-AIR-728990',
    provider: 'Airtel Money',
    transactionRef: 'TB-FND-1046-01',
    eventType: 'Payment Completed Succeeded',
    receivedAt: 'Today, 09:30 AM',
    rawDate: '2026-09-11T09:30:00Z',
    signatureVerified: true,
    processingResult: 'Processed',
    duplicateStatus: 'Original',
    endpoint: '/api/v1/callbacks/airtel',
    httpStatus: 200,
    ipAddress: '41.223.118.12',
  },
  {
    id: 'CB-AIR-728990-DUP',
    provider: 'Airtel Money',
    transactionRef: 'TB-FND-1046-01',
    eventType: 'Payment Completed Succeeded (Retry)',
    receivedAt: 'Today, 09:31 AM',
    rawDate: '2026-09-11T09:31:00Z',
    signatureVerified: true,
    processingResult: 'Discarded',
    duplicateStatus: 'Duplicate Discarded',
    endpoint: '/api/v1/callbacks/airtel',
    httpStatus: 200,
    ipAddress: '41.223.118.12',
  },
];

export const MOCK_API_CONNECTIONS: ApiConnection[] = [
  {
    id: 'CONN-MTN-01',
    provider: 'MTN Mobile Money',
    collectionsApiStatus: 'Operational',
    payoutApiStatus: 'Operational',
    callbackEndpointStatus: 'Operational',
    collectionsEndpoint: 'https://proxy.tellerbud.internal/momo/v1_0/requesttopay',
    payoutEndpoint: 'https://proxy.tellerbud.internal/momo/v1_0/disbursement',
    callbackEndpoint: '/api/v1/callbacks/mtn',
    lastSuccessfulRequest: 'Today, 11:49 AM',
    lastSuccessfulCallback: 'Today, 11:48 AM',
    avgResponseTimeMs: 214,
    successRate: 99.4,
    status: 'Connected',
    protocol: 'REST / TLS 1.3 Strict Mutual Auth',
    uptime: '99.98%',
  },
  {
    id: 'CONN-AIR-01',
    provider: 'Airtel Money',
    collectionsApiStatus: 'Operational',
    payoutApiStatus: 'Operational',
    callbackEndpointStatus: 'Operational',
    collectionsEndpoint: 'https://proxy.tellerbud.internal/airtel/merchant/v1/payments',
    payoutEndpoint: 'https://proxy.tellerbud.internal/airtel/standard/v1/disbursements',
    callbackEndpoint: '/api/v1/callbacks/airtel',
    lastSuccessfulRequest: 'Today, 11:43 AM',
    lastSuccessfulCallback: 'Today, 11:42 AM',
    avgResponseTimeMs: 242,
    successRate: 98.9,
    status: 'Connected',
    protocol: 'REST / OAuth2 Direct Gateway',
    uptime: '99.92%',
  },
];

export interface TimelineStepItem {
  step: number;
  title: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  timestamp?: string;
  detail?: string;
}

export interface ReconciliationAuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  result: string;
  details?: string;
}

export function resolveReconciliationDetails(record: ReconciliationRecord): ReconciliationRecord & {
  resolvedTimeline: TimelineStepItem[];
  auditHistory: ReconciliationAuditEvent[];
} {
  const isBusiness = record.walletType === 'Business Global Wallet';
  const isPending = record.reconciliation === 'Pending';
  const isException = record.reconciliation === 'Exception';
  const isMatched = record.reconciliation === 'Matched';
  const isReversed = record.reconciliation === 'Reversed';

  // Customer attributes
  const customerId =
    record.customerId ||
    `TB-CUS-${record.walletId.replace(/[^0-9]/g, '') || '1041'}`;
  const customerPhone = record.customerPhone || '+260 96 1234567';

  // Business attributes
  const businessId =
    record.businessId ||
    `BIZ-${record.walletId.replace(/[^0-9]/g, '') || '82019'}`;
  const businessOwner = record.businessOwner || 'Chileshe Mwila';
  const ownerPhone = record.ownerPhone || '+260 97 8492011';

  // Operation
  const apiOperation =
    record.apiOperation ||
    (record.transactionType.includes('Withdrawal') ? 'Payout' : 'Collection');

  const updatedAt = record.updatedAt || record.createdAt;
  const lastProviderResponseTime = record.lastProviderResponseTime || record.createdAt;

  // Ledger fields
  let ledgerEntryRef = record.ledgerEntryRef;
  if (!ledgerEntryRef) {
    if (record.ledgerResult === 'Not Posted') {
      ledgerEntryRef = '—';
    } else {
      ledgerEntryRef = `LED-2026-${record.walletId.slice(-4)}-${record.reconciliationRef.slice(-4)}`;
    }
  }

  let postingStatus = record.postingStatus;
  if (!postingStatus) {
    if (record.ledgerResult === 'Not Posted') {
      postingStatus = isPending
        ? 'Awaiting Verified Provider Confirmation'
        : 'Not Eligible for Posting';
    } else if (record.ledgerResult === 'Credited') {
      postingStatus = 'Posted & Balanced';
    } else if (record.ledgerResult === 'Debited') {
      postingStatus = 'Debited & Confirmed';
    } else if (record.ledgerResult === 'Hold Created') {
      postingStatus = 'Held in Escrow';
    } else if (record.ledgerResult === 'Hold Released') {
      postingStatus = 'Hold Released';
    } else if (record.ledgerResult === 'Reversal Posted') {
      postingStatus = 'Reversal Applied';
    } else {
      postingStatus = 'Settled';
    }
  }

  const postedAmount =
    record.postedAmount !== undefined
      ? record.postedAmount
      : record.ledgerResult === 'Not Posted'
      ? 0
      : record.amount;

  const balanceBefore =
    record.balanceBefore !== undefined
      ? record.balanceBefore
      : 14500.0;

  const balanceChange =
    record.balanceChange !== undefined
      ? record.balanceChange
      : record.ledgerResult === 'Credited'
      ? record.amount
      : record.ledgerResult === 'Debited'
      ? -record.amount
      : 0;

  const balanceAfter =
    record.balanceAfter !== undefined
      ? record.balanceAfter
      : balanceBefore + balanceChange;

  const reservationRef =
    record.reservationRef ||
    (record.ledgerResult === 'Hold Created'
      ? `RES-${record.transactionRef.slice(-4)}-HLD`
      : '—');

  const reversalRef =
    record.reversalRef ||
    (isReversed || record.ledgerResult === 'Reversal Posted'
      ? `REV-${record.transactionRef.slice(-4)}`
      : '—');

  // Reconciliation fields
  const expectedAmount =
    record.expectedAmount !== undefined ? record.expectedAmount : record.amount;

  const providerConfirmedAmount =
    record.providerConfirmedAmount ||
    (isPending
      ? 'Awaiting Confirmation'
      : `ZMW ${record.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

  const ledgerPostedAmount =
    record.ledgerPostedAmount !== undefined ? record.ledgerPostedAmount : postedAmount;

  let amountVariance = record.amountVariance;
  if (!amountVariance) {
    if (isPending) amountVariance = 'Pending';
    else if (isMatched) amountVariance = 'ZMW 0.00 (Exact Match)';
    else if (isException) amountVariance = 'Variance Flagged';
    else amountVariance = 'ZMW 0.00 (Reversed)';
  }

  const signatureVerification =
    record.signatureVerification ||
    (isPending
      ? 'Awaiting Callback'
      : isException
      ? 'Signature Mismatch (HMAC Discrepancy)'
      : 'Verified (HMAC-SHA256)');

  const duplicateCallbackStatus =
    record.duplicateCallbackStatus || 'No Duplicate Detected';

  const reconciliationDate =
    record.reconciliationDate ||
    (isPending ? '—' : record.createdAt);

  const callbackStatus =
    record.callbackStatus ||
    (isPending ? 'Awaiting Provider Callback' : 'Callback Received & Verified');

  const callbackReceivedAt =
    record.callbackReceivedAt ||
    (isPending ? '—' : record.createdAt);

  const verificationAttempts =
    record.verificationAttempts ||
    (isPending ? '1' : '1');

  const exceptionReason = record.exceptionReason || '—';

  // Build 7-step Processing Timeline
  let resolvedTimeline: TimelineStepItem[] = [];

  if (record.id === 'TB-REC-1041-02' || isPending) {
    resolvedTimeline = [
      {
        step: 1,
        title: 'Transaction Created',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Client transaction ${record.transactionRef} registered in platform memory.`,
      },
      {
        step: 2,
        title: 'API Request Submitted',
        status: 'completed',
        timestamp: 'Today, 11:35:02 AM',
        detail: `Dispatched ${apiOperation} to ${record.provider} REST Gateway (TLS 1.3).`,
      },
      {
        step: 3,
        title: 'Provider Processing',
        status: 'current',
        timestamp: lastProviderResponseTime,
        detail: `Provider response: ${record.providerResponse}. External ID: ${record.providerTransactionId || 'Pending'}.`,
      },
      {
        step: 4,
        title: 'Callback Received',
        status: 'pending',
        detail: 'Awaiting inbound asynchronous signed webhook event.',
      },
      {
        step: 5,
        title: 'Backend Verification',
        status: 'pending',
        detail: 'Awaiting cryptographic signature verification & payload integrity check.',
      },
      {
        step: 6,
        title: 'Ledger Posting',
        status: 'pending',
        detail: 'Awaiting verified provider response before double-entry posting.',
      },
      {
        step: 7,
        title: 'Reconciliation Completed',
        status: 'pending',
        detail: 'Automated matching engine pending final ledger reconciliation.',
      },
    ];
  } else if (isException) {
    resolvedTimeline = [
      {
        step: 1,
        title: 'Transaction Created',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Transaction ${record.transactionRef} registered.`,
      },
      {
        step: 2,
        title: 'API Request Submitted',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Dispatched to ${record.provider}.`,
      },
      {
        step: 3,
        title: 'Provider Processing',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Status confirmed: ${record.providerResponse}.`,
      },
      {
        step: 4,
        title: 'Callback Received',
        status: 'completed',
        timestamp: record.createdAt,
        detail: 'Webhook payload received at internal endpoint.',
      },
      {
        step: 5,
        title: 'Backend Verification',
        status: 'failed',
        timestamp: record.createdAt,
        detail: record.exceptionReason || 'Discrepancy detected during validation.',
      },
      {
        step: 6,
        title: 'Ledger Posting',
        status: 'pending',
        detail: 'Posting halted pending exception resolution.',
      },
      {
        step: 7,
        title: 'Reconciliation Completed',
        status: 'pending',
        detail: 'Flagged as reconciliation exception.',
      },
    ];
  } else {
    // Matched or Reversed
    resolvedTimeline = [
      {
        step: 1,
        title: 'Transaction Created',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Transaction ${record.transactionRef} initiated.`,
      },
      {
        step: 2,
        title: 'API Request Submitted',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Payload sent to ${record.provider} gateway.`,
      },
      {
        step: 3,
        title: 'Provider Processing',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Confirmed by provider. ID: ${record.providerTransactionId || 'N/A'}.`,
      },
      {
        step: 4,
        title: 'Callback Received',
        status: 'completed',
        timestamp: record.createdAt,
        detail: 'Callback successfully ingested.',
      },
      {
        step: 5,
        title: 'Backend Verification',
        status: 'completed',
        timestamp: record.createdAt,
        detail: 'HMAC-SHA256 signature verified and nonce authenticated.',
      },
      {
        step: 6,
        title: 'Ledger Posting',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Ledger entry ${ledgerEntryRef} balanced.`,
      },
      {
        step: 7,
        title: 'Reconciliation Completed',
        status: 'completed',
        timestamp: record.createdAt,
        detail: `Three-way match confirmed: Status ${record.reconciliation}.`,
      },
    ];
  }

  // Audit history initial records
  const auditHistory: ReconciliationAuditEvent[] = [
    {
      id: `AUD-REC-${record.id.slice(-4)}-1`,
      timestamp: '11 Sep 2026, 11:40 AM',
      actor: 'Super Admin (Console)',
      action: 'Provider Status Refreshed',
      result: 'Provider Still Processing',
      details: `Direct API query to ${record.provider} gateway returned status: Processing.`,
    },
    {
      id: `AUD-REC-${record.id.slice(-4)}-2`,
      timestamp: '11 Sep 2026, 11:35 AM',
      actor: 'Automated System Scheduler',
      action: 'Reconciliation Initiated',
      result: 'Reconciliation Record Created',
      details: `Reconciliation tracking record initialized for transaction ${record.transactionRef}.`,
    },
    {
      id: `AUD-REC-${record.id.slice(-4)}-3`,
      timestamp: '11 Sep 2026, 11:35:18 AM',
      actor: `${record.provider} API Gateway`,
      action: 'Provider Request Submitted',
      result: 'Processing',
      details: `Dispatched ${apiOperation} request to ${record.provider} REST gateway.`,
    },
  ];

  return {
    ...record,
    customerId,
    customerPhone,
    businessId,
    businessOwner,
    ownerPhone,
    apiOperation,
    updatedAt,
    lastProviderResponseTime,
    ledgerEntryRef,
    postingStatus,
    postedAmount,
    balanceBefore,
    balanceAfter,
    balanceChange,
    reservationRef,
    reversalRef,
    expectedAmount,
    providerConfirmedAmount,
    ledgerPostedAmount,
    amountVariance,
    signatureVerification,
    duplicateCallbackStatus,
    reconciliationDate,
    exceptionReason,
    callbackStatus,
    callbackReceivedAt,
    verificationAttempts,
    resolvedTimeline,
    auditHistory,
  };
}
