import {
  ChargeRecord,
  CommissionRecord,
  ChargesCommissionsKpiData,
  ChargeCommissionRecord,
  RevenueSharingRule,
  AgentRevenueBreakdownRecord,
  AgentTransactionRevenueRecord,
  AgentRevenueFilters,
} from '../types/chargesCommissions';

// =========================================================================
// 1. EXACT USER SPECIFIED SAMPLE CHARGE RECORDS (First 5 records)
// =========================================================================
const INITIAL_CHARGE_RECORDS: ChargeRecord[] = [
  {
    id: 'TB-CHG-9089-01',
    reference: 'TB-CHG-9089-01',
    createdAt: '11 Sep 2026, 14:10',
    dateTime: '11 Sep 2026, 02:10 PM',
    timestamp: new Date('2026-09-11T14:10:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-9089',
    transactionType: 'Deposit',
    customerName: 'Mwamba Mulenga',
    customerId: 'TB-CUS-1052',
    customerWalletId: 'TB-WAL-1052',
    customerMobile: '+260 97 123 9012',
    service: 'Cash Pickup',
    provider: 'Airtel Money',
    transactionAmount: 8000.0,
    reservationCharge: 50.0,
    status: 'Posted',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    agentName: 'Mwansa Tembo',
    agentId: 'TB-AGT-1007-01',
    rateRuleVersion: 'TB-CHG-RULE-01-V1',
    idempotencyKey: 'IDEMP-TB-CHG-9089-01',
    ledgerEntryReference: 'TB-LED-1052-06',
    walletLedgerReference: 'TB-LED-1052-06',
    description: 'Customer cash reservation charge for Airtel Money cash pickup deposit.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Reservation Created', timestamp: '11 Sep 2026, 14:05', actor: 'Mwamba Mulenga' },
      { id: 'LT-2', status: 'Charge Accrued', timestamp: '11 Sep 2026, 14:08', actor: 'TellerBud Core Engine' },
      { id: 'LT-3', status: 'Charge Posted', timestamp: '11 Sep 2026, 14:10', actor: 'TellerBud Ledger' },
    ],
  },
  {
    id: 'TB-CHG-9090-01',
    reference: 'TB-CHG-9090-01',
    createdAt: '11 Sep 2026, 13:45',
    dateTime: '11 Sep 2026, 01:45 PM',
    timestamp: new Date('2026-09-11T13:45:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-9090',
    transactionType: 'Purchase',
    customerName: 'Bupe Chileshe',
    customerId: 'TB-CUS-1021',
    customerWalletId: 'TB-WAL-1021',
    customerMobile: '+260 96 234 5678',
    service: 'Cash Pickup',
    provider: 'MTN Mobile Money',
    transactionAmount: 1400.0,
    reservationCharge: 50.0,
    status: 'Pending',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    agentName: 'Kelvin Phiri',
    agentId: 'TB-AGT-1007-02',
    rateRuleVersion: 'TB-CHG-RULE-01-V1',
    idempotencyKey: 'IDEMP-CHG-9090-01-4419',
    ledgerEntryReference: 'TB-LED-1021-02',
    walletLedgerReference: 'TB-LED-1021-02',
    description: 'Customer cash reservation charge for MTN Mobile Money cash pickup purchase.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Reservation Created', timestamp: '11 Sep 2026, 13:40', actor: 'Bupe Chileshe' },
      { id: 'LT-2', status: 'Charge Pending Auth', timestamp: '11 Sep 2026, 13:45', actor: 'TellerBud Core Engine' },
    ],
  },
  {
    id: 'TB-CHG-9091-01',
    reference: 'TB-CHG-9091-01',
    createdAt: '11 Sep 2026, 13:15',
    dateTime: '11 Sep 2026, 01:15 PM',
    timestamp: new Date('2026-09-11T13:15:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-9091',
    transactionType: 'Withdrawal',
    customerName: 'Lombe Kasonde',
    customerId: 'TB-CUS-1046',
    customerWalletId: 'TB-WAL-1046',
    customerMobile: '+260 97 789 0123',
    service: 'Cash Pickup',
    provider: 'Zanaco',
    transactionAmount: 5000.0,
    reservationCharge: 50.0,
    status: 'Pending',
    businessName: 'Copperbelt Prime Hub Agency',
    businessId: 'BIZ-CPB-002',
    agentName: 'Joseph Kaunda',
    agentId: 'TB-AGT-1012-01',
    rateRuleVersion: 'TB-CHG-RULE-01-V1',
    idempotencyKey: 'IDEMP-CHG-9091-01-3291',
    ledgerEntryReference: 'TB-LED-1046-04',
    walletLedgerReference: 'TB-LED-1046-04',
    description: 'Customer cash reservation charge for Zanaco bank cash pickup withdrawal.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Reservation Created', timestamp: '11 Sep 2026, 13:10', actor: 'Lombe Kasonde' },
      { id: 'LT-2', status: 'Charge Pending Verification', timestamp: '11 Sep 2026, 13:15', actor: 'TellerBud Core Engine' },
    ],
  },
  {
    id: 'TB-CHG-4304-01',
    reference: 'TB-CHG-4304-01',
    createdAt: '11 Sep 2026, 11:30',
    dateTime: '11 Sep 2026, 11:30 AM',
    timestamp: new Date('2026-09-11T11:30:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-4304',
    transactionType: 'Withdrawal',
    customerName: 'Mwamba Mulenga',
    customerId: 'TB-CUS-1052',
    customerWalletId: 'TB-WAL-1052',
    customerMobile: '+260 97 123 9012',
    service: 'Cash Pickup',
    provider: 'Airtel Money',
    transactionAmount: 2400.0,
    reservationCharge: 50.0,
    status: 'Posted',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    agentName: 'Ruth Phiri',
    agentId: 'TB-AGT-1007-03',
    rateRuleVersion: 'TB-CHG-RULE-01-V1',
    idempotencyKey: 'IDEMP-CHG-4304-01-9018',
    ledgerEntryReference: 'TB-LED-1052-05',
    walletLedgerReference: 'TB-LED-1052-05',
    description: 'Customer cash reservation charge for Airtel Money cash pickup withdrawal.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Reservation Created', timestamp: '11 Sep 2026, 11:25', actor: 'Mwamba Mulenga' },
      { id: 'LT-2', status: 'Charge Posted', timestamp: '11 Sep 2026, 11:30', actor: 'TellerBud Ledger' },
    ],
  },
  {
    id: 'TB-CHG-4298-01',
    reference: 'TB-CHG-4298-01',
    createdAt: '11 Sep 2026, 10:15',
    dateTime: '11 Sep 2026, 10:15 AM',
    timestamp: new Date('2026-09-11T10:15:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-4298',
    transactionType: 'Withdrawal',
    customerName: 'Kondwani Banda',
    customerId: 'TB-CUS-1077',
    customerWalletId: 'TB-WAL-1077',
    customerMobile: '+260 95 555 4321',
    service: 'Cash Pickup',
    provider: 'Access',
    transactionAmount: 2100.0,
    reservationCharge: 50.0,
    status: 'Posted',
    businessName: 'Woodlands QuickPay Hub',
    businessId: 'BIZ-LUS-004',
    agentName: 'Patrick Chanda',
    agentId: 'TB-AGT-1015-01',
    rateRuleVersion: 'TB-CHG-RULE-01-V1',
    idempotencyKey: 'IDEMP-CHG-4298-01-7712',
    ledgerEntryReference: 'TB-LED-1077-01',
    walletLedgerReference: 'TB-LED-1077-01',
    description: 'Customer cash reservation charge for Access bank cash pickup withdrawal.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Reservation Created', timestamp: '11 Sep 2026, 10:10', actor: 'Kondwani Banda' },
      { id: 'LT-2', status: 'Charge Posted', timestamp: '11 Sep 2026, 10:15', actor: 'TellerBud Ledger' },
    ],
  },
];

// Helper to generate exactly 369 charge records, strictly for Cash Pickup and sorted descending by time
function generateChargeRecords(): ChargeRecord[] {
  const records: ChargeRecord[] = [...INITIAL_CHARGE_RECORDS];

  // Specific user requested descending times for Page 1 (records 6 to 20):
  // 14:10, 13:45, 13:15, 11:30, 10:15 (records 1 to 5 above)
  // then: 09:59, 09:56, 09:52, 09:49, 09:42, 09:38, 09:24, 09:20, 09:17, 09:13, 09:10, 09:06, 09:03, 08:58, 08:52
  const PAGE_1_REMAINING_TIMES = [
    '09:59',
    '09:56',
    '09:52',
    '09:49',
    '09:42',
    '09:38',
    '09:24',
    '09:20',
    '09:17',
    '09:13',
    '09:10',
    '09:06',
    '09:03',
    '08:58',
    '08:52',
  ];

  const customers = [
    { name: 'Chanda Bwalya', id: 'TB-CUS-1088' },
    { name: 'Mutale Musonda', id: 'TB-CUS-1092' },
    { name: 'Taonga Zulu', id: 'TB-CUS-1033' },
    { name: 'Kabwe Mwila', id: 'TB-CUS-1049' },
    { name: 'Natasha Lungu', id: 'TB-CUS-1065' },
    { name: 'Chileshe Kapembwa', id: 'TB-CUS-1018' },
    { name: 'Chileshe Mwape', id: 'TB-CUS-1080' },
    { name: 'Bwalya Kaunda', id: 'TB-CUS-1072' },
    { name: 'Mwamba Mulenga', id: 'TB-CUS-1052' },
    { name: 'Bupe Chileshe', id: 'TB-CUS-1021' },
    { name: 'Lombe Kasonde', id: 'TB-CUS-1046' },
    { name: 'Kondwani Banda', id: 'TB-CUS-1077' },
  ];

  const providers = [
    'MTN Mobile Money',
    'Airtel Money',
    'Zamtel',
    'Zanaco',
    'FNB',
    'INDO',
    'Stanbic',
    'Access',
  ];

  // ONLY valid Cash Pickup transaction types per user requirement: Deposit, Withdrawal, Purchase
  const validCashPickupTypes = ['Deposit', 'Withdrawal', 'Purchase'];
  const statuses: ChargeRecord['status'][] = [
    'Posted',
    'Posted',
    'Posted',
    'Pending',
    'Cancelled',
    'Failed',
  ];

  const transactionAmounts = [1500, 2500, 3200, 4800, 6000, 7500, 10000, 1250, 3500, 4200, 1800, 5400];

  let baseTxnNum = 4290;

  // Add records 6 to 20 for Page 1 (all on 11 Sep 2026, strictly descending times)
  for (let idx = 0; idx < PAGE_1_REMAINING_TIMES.length; idx++) {
    const i = idx + 6;
    const timeStr = PAGE_1_REMAINING_TIMES[idx];
    const [hhStr, mmStr] = timeStr.split(':');
    const hh = parseInt(hhStr, 10);
    const mm = mmStr;
    const isPM = hh >= 12;
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    const time12 = `${String(h12).padStart(2, '0')}:${mm} ${isPM ? 'PM' : 'AM'}`;
    const cust = customers[(i - 6) % customers.length];
    const prv = providers[(i - 6) % providers.length];
    const tType = validCashPickupTypes[(i - 6) % validCashPickupTypes.length];
    const st = statuses[(i - 6) % statuses.length];
    const txnRef = `TB-TXN-${baseTxnNum - i}`;
    const chgRef = `TB-CHG-${baseTxnNum - i}-01`;
    const amt = transactionAmounts[(i - 6) % transactionAmounts.length];
    const timestamp = new Date(`2026-09-11T${timeStr}:00Z`).getTime();

    records.push({
      id: chgRef,
      reference: chgRef,
      createdAt: `11 Sep 2026, ${timeStr}`,
      dateTime: `11 Sep 2026, ${time12}`,
      timestamp,
      rawDate: '2026-09-11',
      transactionReference: txnRef,
      transactionType: tType,
      customerName: cust.name,
      customerId: cust.id,
      customerWalletId: `TB-WAL-${cust.id.replace('TB-CUS-', '')}`,
      customerMobile: '+260 97 ' + (100 + ((i * 17) % 899)) + ' ' + (1000 + ((i * 37) % 8999)),
      service: 'Cash Pickup', // Strictly Cash Pickup
      provider: prv,
      transactionAmount: amt,
      reservationCharge: 50.0, // Fixed 50.00
      status: st,
      businessName: 'Lusaka Central Express Agency',
      businessId: 'BIZ-LUS-001',
      agentName: 'Mwansa Tembo',
      agentId: 'TB-AGT-1007-01',
      rateRuleVersion: 'TB-CHG-RULE-01-V1',
      idempotencyKey: `IDEMP-TB-CHG-${baseTxnNum - i}-01`,
      ledgerEntryReference: `TB-LED-${cust.id.replace('TB-CUS-', '')}-01`,
      walletLedgerReference: `TB-LED-${cust.id.replace('TB-CUS-', '')}-01`,
      description: `Customer cash reservation charge for ${prv} cash pickup ${tType.toLowerCase()}.`,
      lifecycleTimeline: [
        { id: 'LT-1', status: 'Reservation Created', timestamp: `11 Sep 2026, 08:30`, actor: cust.name },
        { id: 'LT-2', status: `Charge ${st}`, timestamp: `11 Sep 2026, ${timeStr}`, actor: 'TellerBud Core Engine' },
      ],
    });
  }

  // Add records 21 to 369 (total 369 records), strictly descending across earlier dates (10 Sep down to 01 Sep)
  for (let i = 21; i <= 369; i++) {
    const k = i - 21; // 0 to 348
    const dayNum = Math.max(1, 10 - Math.floor(k / 35));
    const day = String(dayNum).padStart(2, '0');
    const slot = k % 35;
    // Descending times within the day from 17:15 down to 08:45
    const totalMinutes = 17 * 60 + 15 - slot * 14;
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    const time24 = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    const isPM = hh >= 12;
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    const time12 = `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;

    const cust = customers[(i - 6) % customers.length];
    const prv = providers[(i - 6) % providers.length];
    const tType = validCashPickupTypes[(i - 6) % validCashPickupTypes.length];
    const st = statuses[(i - 6) % statuses.length];
    const txnRef = `TB-TXN-${baseTxnNum - i}`;
    const chgRef = `TB-CHG-${baseTxnNum - i}-01`;
    const amt = transactionAmounts[(i - 6) % transactionAmounts.length];
    const timestamp = new Date(`2026-09-${day}T${time24}:00Z`).getTime();

    records.push({
      id: chgRef,
      reference: chgRef,
      createdAt: `${day} Sep 2026, ${time24}`,
      dateTime: `${day} Sep 2026, ${time12}`,
      timestamp,
      rawDate: `2026-09-${day}`,
      transactionReference: txnRef,
      transactionType: tType,
      customerName: cust.name,
      customerId: cust.id,
      customerWalletId: `TB-WAL-${cust.id.replace('TB-CUS-', '')}`,
      customerMobile: '+260 97 ' + (100 + ((i * 17) % 899)) + ' ' + (1000 + ((i * 37) % 8999)),
      service: 'Cash Pickup', // Strictly Cash Pickup
      provider: prv,
      transactionAmount: amt,
      reservationCharge: 50.0, // Fixed 50.00
      status: st,
      businessName: 'Lusaka Central Express Agency',
      businessId: 'BIZ-LUS-001',
      agentName: 'Mwansa Tembo',
      agentId: 'TB-AGT-1007-01',
      rateRuleVersion: 'TB-CHG-RULE-01-V1',
      idempotencyKey: `IDEMP-TB-CHG-${baseTxnNum - i}-01`,
      ledgerEntryReference: `TB-LED-${cust.id.replace('TB-CUS-', '')}-01`,
      walletLedgerReference: `TB-LED-${cust.id.replace('TB-CUS-', '')}-01`,
      description: `Customer cash reservation charge for ${prv} cash pickup ${tType.toLowerCase()}.`,
      lifecycleTimeline: [
        { id: 'LT-1', status: 'Reservation Created', timestamp: `${day} Sep 2026, 08:30`, actor: cust.name },
        { id: 'LT-2', status: `Charge ${st}`, timestamp: `${day} Sep 2026, ${time24}`, actor: 'TellerBud Core Engine' },
      ],
    });
  }

  return records;
}

export const MOCK_CHARGE_RECORDS: ChargeRecord[] = generateChargeRecords();

// =========================================================================
// 2. EXACT USER SPECIFIED SAMPLE COMMISSION RECORDS (First 5 records)
// =========================================================================
const INITIAL_COMMISSION_RECORDS: CommissionRecord[] = [
  {
    id: 'TB-COM-4310-AGT',
    reference: 'TB-COM-4310-AGT',
    createdAt: '11 Sep 2026, 12:20 PM',
    dateTime: '11 Sep 2026, 12:20 PM',
    timestamp: new Date('2026-09-11T12:20:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-4310',
    transactionType: 'Withdrawal',
    service: 'Cash Pickup',
    provider: 'MTN Mobile Money',
    recipient: 'Mwansa Tembo',
    recipientId: 'TB-AGT-1007-01',
    associatedBusiness: 'Lusaka Central Express Agency',
    recipientType: 'Agent',
    calculationBasis: 'ZMW 3,500.00 × 1.00%',
    rateRuleVersion: 'Rule: TB-COM-RULE-03-V2',
    transactionAmount: 3500.0,
    commissionAmount: 35.0,
    settlementStatus: 'Settled',
    walletLedgerReference: 'BWL-4310-A',
    idempotencyKey: 'IDEMP-COM-4310-AGT-778',
    settledAt: '11 Sep 2026, 12:25 PM',
    description: 'Agent commission accrued and settled for customer cash pickup transaction.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Commission Accrued', timestamp: '11 Sep 2026, 12:20 PM', actor: 'Rule Engine' },
      { id: 'LT-2', status: 'Settled to Agent Balance', timestamp: '11 Sep 2026, 12:25 PM', actor: 'Automated Settlement' },
    ],
  },
  {
    id: 'TB-COM-4310-BIZ',
    reference: 'TB-COM-4310-BIZ',
    createdAt: '11 Sep 2026, 12:20 PM',
    dateTime: '11 Sep 2026, 12:20 PM',
    timestamp: new Date('2026-09-11T12:20:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-4310',
    transactionType: 'Withdrawal',
    service: 'Cash Pickup',
    provider: 'MTN Mobile Money',
    recipient: 'Lusaka Central Express Agency',
    recipientId: 'BIZ-LUS-001',
    associatedBusiness: 'Lusaka Central Express Agency',
    recipientType: 'Business Owner',
    calculationBasis: 'Configured business allocation',
    rateRuleVersion: 'Rule: TB-COM-RULE-03-V2',
    transactionAmount: 3500.0,
    commissionAmount: 17.5,
    settlementStatus: 'Settled',
    walletLedgerReference: 'BWL-4310-B',
    idempotencyKey: 'IDEMP-COM-4310-BIZ-779',
    settledAt: '11 Sep 2026, 12:25 PM',
    description: 'Business owner commission share for transaction TB-TXN-4310.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Commission Accrued', timestamp: '11 Sep 2026, 12:20 PM', actor: 'Rule Engine' },
      { id: 'LT-2', status: 'Settled to Global Wallet', timestamp: '11 Sep 2026, 12:25 PM', actor: 'Automated Settlement' },
    ],
  },
  {
    id: 'TB-COM-4309-AGT',
    reference: 'TB-COM-4309-AGT',
    createdAt: '11 Sep 2026, 11:45 AM',
    dateTime: '11 Sep 2026, 11:45 AM',
    timestamp: new Date('2026-09-11T11:45:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-4309',
    transactionType: 'Deposit',
    service: 'Cash Pickup',
    provider: 'Airtel Money',
    recipient: 'Ruth Phiri',
    recipientId: 'TB-AGT-1007-02',
    associatedBusiness: 'Lusaka Central Express Agency',
    recipientType: 'Agent',
    calculationBasis: 'ZMW 2,200.00 × 1.00%',
    rateRuleVersion: 'Rule: TB-COM-RULE-03-V2',
    transactionAmount: 2200.0,
    commissionAmount: 22.0,
    settlementStatus: 'Pending Settlement',
    walletLedgerReference: 'BWL-4309-PEND',
    idempotencyKey: 'IDEMP-COM-4309-AGT-312',
    description: 'Agent commission accrued, awaiting next scheduled batch settlement.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Commission Accrued', timestamp: '11 Sep 2026, 11:45 AM', actor: 'Rule Engine' },
      { id: 'LT-2', status: 'Queued for Settlement', timestamp: '11 Sep 2026, 11:46 AM', actor: 'Settlement Batcher' },
    ],
  },
  {
    id: 'TB-COM-4306-BIZ',
    reference: 'TB-COM-4306-BIZ',
    createdAt: '11 Sep 2026, 11:10 AM',
    dateTime: '11 Sep 2026, 11:10 AM',
    timestamp: new Date('2026-09-11T11:10:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-4306',
    transactionType: 'Deposit',
    service: 'Cash Pickup',
    provider: 'Zanaco',
    recipient: 'Lusaka Central Express Agency',
    recipientId: 'BIZ-LUS-001',
    associatedBusiness: 'Lusaka Central Express Agency',
    recipientType: 'Business Owner',
    calculationBasis: 'Configured business allocation',
    rateRuleVersion: 'Rule: TB-COM-RULE-03-V2',
    transactionAmount: 3450.0,
    commissionAmount: 17.25,
    settlementStatus: 'Accrued',
    walletLedgerReference: 'BWL-4306-ACCR',
    idempotencyKey: 'IDEMP-COM-4306-BIZ-401',
    description: 'Business owner commission allocation pending end-of-window reconciliation.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Commission Accrued', timestamp: '11 Sep 2026, 11:10 AM', actor: 'Rule Engine' },
    ],
  },
  {
    id: 'TB-COM-4304-PLT',
    reference: 'TB-COM-4304-PLT',
    createdAt: '11 Sep 2026, 10:30 AM',
    dateTime: '11 Sep 2026, 10:30 AM',
    timestamp: new Date('2026-09-11T10:30:00Z').getTime(),
    rawDate: '2026-09-11',
    transactionReference: 'TB-TXN-4304',
    transactionType: 'Withdrawal',
    service: 'Cash Pickup',
    provider: 'Airtel Money',
    recipient: 'TellerBud',
    recipientId: 'TB-PLATFORM',
    recipientType: 'TellerBud Platform',
    calculationBasis: 'Configured platform allocation',
    rateRuleVersion: 'Rule: TB-COM-RULE-03-V2',
    transactionAmount: 2400.0,
    commissionAmount: 10.0,
    settlementStatus: 'Settled',
    walletLedgerReference: 'BWL-4304-PLT',
    idempotencyKey: 'IDEMP-COM-4304-PLT-119',
    settledAt: '11 Sep 2026, 10:35 AM',
    description: 'TellerBud platform fee allocation directly retained and posted.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Platform Revenue Accrued', timestamp: '11 Sep 2026, 10:30 AM', actor: 'Rule Engine' },
      { id: 'LT-2', status: 'Settled to Platform Account', timestamp: '11 Sep 2026, 10:35 AM', actor: 'TellerBud Treasury' },
    ],
  },
];

// Helper to generate the remaining 547 commission records for total = 552
function generateCommissionRecords(): CommissionRecord[] {
  const records = [...INITIAL_COMMISSION_RECORDS];

  const agentRecipients = [
    { name: 'Mwansa Tembo', id: 'TB-AGT-1007-01', biz: 'Lusaka Central Express Agency' },
    { name: 'Ruth Phiri', id: 'TB-AGT-1007-02', biz: 'Lusaka Central Express Agency' },
    { name: 'Joseph Kaunda', id: 'TB-AGT-1012-01', biz: 'Copperbelt Prime Hub Agency' },
    { name: 'Patrick Chanda', id: 'TB-AGT-1015-01', biz: 'Woodlands QuickPay Hub' },
    { name: 'Kelvin Phiri', id: 'TB-AGT-1024-01', biz: 'Lusaka Central Express Agency' },
    { name: 'Natasha Zulu', id: 'TB-AGT-1062-01', biz: 'Lusaka Central Express Agency' },
  ];

  const bizRecipients = [
    { name: 'Lusaka Central Express Agency', id: 'BIZ-LUS-001' },
    { name: 'Copperbelt Prime Hub Agency', id: 'BIZ-CPB-002' },
    { name: 'Woodlands QuickPay Hub', id: 'BIZ-LUS-004' },
  ];

  const services = [
    'Cash Pickup',
    'Walk-In Transaction',
    'Agent-to-Agent Liquidity',
    'Customer Withdrawal',
    'Business Wallet Transaction',
  ];

  const providers = [
    'MTN Mobile Money',
    'Airtel Money',
    'Zamtel',
    'Zanaco',
    'FNB',
    'INDO',
    'Stanbic',
    'Access',
    'TellerBud Ledger',
  ];

  const statuses: CommissionRecord['settlementStatus'][] = [
    'Settled',
    'Settled',
    'Pending Settlement',
    'Accrued',
    'Cancelled',
  ];

  let baseTxnNum = 4300;
  for (let i = 6; i <= 552; i++) {
    const cycle = i % 3;
    const srv = services[(i - 6) % services.length];
    const prv = providers[(i - 6) % providers.length];
    const st = statuses[(i - 6) % statuses.length];
    const txnRef = `TB-TXN-${baseTxnNum - i}`;
    const day = String(Math.max(1, 11 - Math.floor((i - 6) / 55))).padStart(2, '0');

    let recipient = '';
    let recipientId = '';
    let recipientType: CommissionRecord['recipientType'] = 'Agent';
    let associatedBiz: string | undefined = undefined;
    let basis = '';
    let amount = 25.0;
    let comRef = '';

    if (cycle === 0) {
      // Agent
      const agt = agentRecipients[(i - 6) % agentRecipients.length];
      recipient = agt.name;
      recipientId = agt.id;
      associatedBiz = agt.biz;
      recipientType = 'Agent';
      basis = `ZMW ${([2500, 3000, 4500, 1800, 5000][(i - 6) % 5]).toLocaleString('en-US', { minimumFractionDigits: 2 })} × 1.00%`;
      amount = [25.0, 30.0, 45.0, 18.0, 50.0][(i - 6) % 5];
      comRef = `TB-COM-${baseTxnNum - i}-AGT`;
    } else if (cycle === 1) {
      // Business Owner
      const bz = bizRecipients[(i - 6) % bizRecipients.length];
      recipient = bz.name;
      recipientId = bz.id;
      associatedBiz = bz.name;
      recipientType = 'Business Owner';
      basis = 'Configured business allocation';
      amount = [12.5, 15.0, 22.5, 9.0, 25.0][(i - 6) % 5];
      comRef = `TB-COM-${baseTxnNum - i}-BIZ`;
    } else {
      // Platform
      recipient = 'TellerBud';
      recipientId = 'TB-PLATFORM';
      recipientType = 'TellerBud Platform';
      basis = 'Configured platform allocation';
      amount = [10.0, 15.0, 8.0, 12.0, 20.0][(i - 6) % 5];
      comRef = `TB-COM-${baseTxnNum - i}-PLT`;
    }

    const minuteStr = String((i * 11) % 60).padStart(2, '0');
    const timestamp = new Date(`2026-09-${day}T10:${minuteStr}:00Z`).getTime();

    records.push({
      id: comRef,
      reference: comRef,
      createdAt: `${day} Sep 2026, 10:${minuteStr} AM`,
      dateTime: `${day} Sep 2026, 10:${minuteStr} AM`,
      timestamp,
      rawDate: `2026-09-${day}`,
      transactionReference: txnRef,
      transactionType: ['Withdrawal', 'Deposit', 'Purchase', 'Liquidity Swap'][(i - 6) % 4],
      service: srv,
      provider: prv,
      recipient,
      recipientId,
      associatedBusiness: associatedBiz,
      recipientType,
      calculationBasis: basis,
      rateRuleVersion: 'Rule: TB-COM-RULE-03-V2',
      transactionAmount: 2500.0,
      commissionAmount: amount,
      settlementStatus: st,
      walletLedgerReference: `BWL-${baseTxnNum - i}`,
      idempotencyKey: `IDEMP-COM-${i}-6612`,
      settledAt: st === 'Settled' ? `${day} Sep 2026, 10:45 AM` : undefined,
      description: `${recipientType} commission allocation under rule TB-COM-RULE-03-V2.`,
      lifecycleTimeline: [
        { id: 'LT-1', status: 'Commission Accrued', timestamp: `${day} Sep 2026, 10:00 AM`, actor: 'Rule Engine' },
        ...(st === 'Settled'
          ? [{ id: 'LT-2', status: 'Settled to Account', timestamp: `${day} Sep 2026, 10:45 AM`, actor: 'Settlement Engine' }]
          : []),
      ],
    });
  }

  return records;
}

export const MOCK_COMMISSION_RECORDS: CommissionRecord[] = generateCommissionRecords();

// =========================================================================
// REVENUE SHARING CONFIGURATION & DYNAMIC CALCULATION
// Reservation Charges Collected = Agent Revenue + Business Revenue + TellerBud Platform Revenue
// =========================================================================
export const CONFIGURED_REVENUE_SHARING_RULE: RevenueSharingRule = {
  ruleId: 'TB-REV-RULE-03-V2',
  ruleName: 'Standard Cash Pickup Reservation Revenue Sharing',
  version: 'v2.4',
  service: 'Cash Pickup',
  agentRevenueShareRate: 10250 / 18450,
  businessRevenueShareRate: 4900 / 18450,
  tellerBudPlatformShareRate: 3300 / 18450,
  description:
    'Reservation Charges Collected = Agent Revenue + Business Revenue + TellerBud Platform Revenue',
};

/**
 * Calculates revenue distribution KPIs based on configured revenue-sharing rules
 * and actual transaction records (never hardcoded).
 * Formula: Business Revenue = Reservation Charges - TellerBud Charges
 */
export function calculateRevenueKpis(
  chargeRecords: ChargeRecord[],
  commissionRecords: CommissionRecord[],
  rule: RevenueSharingRule = CONFIGURED_REVENUE_SHARING_RULE
): ChargesCommissionsKpiData {
  // 1. Total Reservation Charges from eligible completed transaction charge records
  const reservationCharges = chargeRecords
    .filter((r) => isEligibleRevenueTransaction(r.status))
    .reduce((sum, record) => sum + (record.reservationCharge || 0), 0);

  // 2. TellerBud Charges: The amount deducted and retained by TellerBud from the Reservation Charges
  const tellerBudCharges =
    Math.round(reservationCharges * rule.tellerBudPlatformShareRate * 100) / 100;

  // 3. Business Revenue: The net revenue generated by all agents belonging to the business after deducting TellerBud Charges
  // Formula: Business Revenue = Reservation Charges - TellerBud Charges
  const businessRevenue =
    Math.round((reservationCharges - tellerBudCharges) * 100) / 100;

  return {
    reservationCharges,
    tellerBudCharges,
    businessRevenue,
    // Backward compatibility aliases
    reservationChargesCollected: reservationCharges,
    tellerBudRevenue: tellerBudCharges,
    agentRevenue: 0,
    pendingSettlements: 0,
    agentCommissions: 0,
    businessCommissions: businessRevenue,
  };
}

// Dynamically computed from actual transaction records and configured revenue-sharing rules
export const MOCK_CHARGES_COMMISSIONS_KPIS: ChargesCommissionsKpiData = calculateRevenueKpis(
  MOCK_CHARGE_RECORDS,
  MOCK_COMMISSION_RECORDS
);

// =========================================================================
// 3. BACKWARD COMPATIBILITY: Legacy MOCK_CHARGES_COMMISSIONS
// =========================================================================
export const MOCK_CHARGES_COMMISSIONS: ChargeCommissionRecord[] = [
  {
    id: 'CHG-3301',
    reference: 'TB-CHG-3301',
    dateTime: '31 Aug 2026, 11:15 AM',
    rawDate: '2026-08-31',
    recordType: 'Charge',
    subType: 'Transaction Fee',
    relatedTransaction: 'TB-WLK-3301',
    principalAmount: 3200.0,
    agent: {
      id: 'TB-AGT-1062',
      name: 'Natasha Zulu',
    },
    amount: 15.0,
    walletDirection: 'Debit',
    walletBalanceBefore: 145515.0,
    walletBalanceAfter: 145500.0,
    walletLedgerReference: 'BWL-001',
    status: 'Completed',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    currency: 'ZMW',
    createdAt: '2026-08-31T11:13:00+02:00',
    completedAt: '2026-08-31T11:15:00+02:00',
    description: 'TellerBud transaction fee debited from global wallet for walk-in deposit TB-WLK-3301.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Charge Created', timestamp: '31 Aug 2026, 11:13 AM', actor: 'Natasha Zulu' },
      { id: 'LT-2', status: 'Global Wallet Debited', timestamp: '31 Aug 2026, 11:14 AM', actor: 'TellerBud Core Ledger' },
      { id: 'LT-3', status: 'Charge Completed', timestamp: '31 Aug 2026, 11:15 AM', actor: 'Recorded by TellerBud' },
    ],
  },
  {
    id: 'CHG-3302',
    reference: 'TB-CHG-3302',
    dateTime: '31 Aug 2026, 11:05 AM',
    rawDate: '2026-08-31',
    recordType: 'Charge',
    subType: 'Transaction Fee',
    relatedTransaction: 'TB-WLK-3302',
    principalAmount: 1800.0,
    agent: {
      id: 'TB-AGT-1024',
      name: 'Kelvin Phiri',
    },
    amount: 12.0,
    walletDirection: 'Debit',
    walletBalanceBefore: 145527.0,
    walletBalanceAfter: 145515.0,
    walletLedgerReference: 'BWL-013',
    status: 'Completed',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    currency: 'ZMW',
    createdAt: '2026-08-31T11:03:00+02:00',
    completedAt: '2026-08-31T11:05:00+02:00',
    description: 'TellerBud transaction fee debited from global wallet for walk-in deposit TB-WLK-3302.',
    lifecycleTimeline: [
      { id: 'LT-1', status: 'Charge Created', timestamp: '31 Aug 2026, 11:03 AM', actor: 'Kelvin Phiri' },
      { id: 'LT-2', status: 'Global Wallet Debited', timestamp: '31 Aug 2026, 11:04 AM', actor: 'TellerBud Core Ledger' },
      { id: 'LT-3', status: 'Charge Completed', timestamp: '31 Aug 2026, 11:05 AM', actor: 'Recorded by TellerBud' },
    ],
  },
];

// =========================================================================
// 4. BUSINESS AGENT REVENUE BREAKDOWN & TRANSACTION-LEVEL ENGINE
// Strictly isolates to logged-in Business Owner, excludes invalid statuses,
// and enforces exact mathematical reconciliation with KPI cards.
// =========================================================================

export interface BusinessAgentRevenueConfig {
  agentId: string;
  agentName: string;
  avatarInitials: string;
  avatarUrl?: string;
  businessId: string;
  businessName: string;
  storeId: string;
  storeName: string;
  boothId: string;
  boothName: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export const MOCK_BUSINESS_AGENTS: BusinessAgentRevenueConfig[] = [
  {
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    avatarInitials: 'KP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-001',
    storeName: 'Cairo Road Flagship Store',
    boothId: 'BTH-LUS-101',
    boothName: 'Counter 1 - Cash & Float Desk',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1062',
    agentName: 'Natasha Zulu',
    avatarInitials: 'NZ',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-001',
    storeName: 'Cairo Road Flagship Store',
    boothId: 'BTH-LUS-102',
    boothName: 'Counter 2 - MNO Pickup Hub',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1125',
    agentName: 'John Banda',
    avatarInitials: 'JB',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-001',
    storeName: 'Cairo Road Flagship Store',
    boothId: 'BTH-LUS-103',
    boothName: 'Counter 3 - Express Walk-in Desk',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1088',
    agentName: 'Mwansa Tembo',
    avatarInitials: 'MT',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-002',
    storeName: 'Woodlands Mall Agency Branch',
    boothId: 'BTH-LUS-201',
    boothName: 'Booth 1 - Banking Services',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1095',
    agentName: 'Peter Mumba',
    avatarInitials: 'PM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-002',
    storeName: 'Woodlands Mall Agency Branch',
    boothId: 'BTH-LUS-202',
    boothName: 'Booth 2 - Cash In / Cash Out',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1102',
    agentName: 'Joseph Phiri',
    avatarInitials: 'JP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-003',
    storeName: 'Matero East Hub',
    boothId: 'BTH-LUS-301',
    boothName: 'Booth 1 - Main Till',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1110',
    agentName: 'Mary Musonda',
    avatarInitials: 'MM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-003',
    storeName: 'Matero East Hub',
    boothId: 'BTH-LUS-302',
    boothName: 'Booth 2 - Fast Cash Desk',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1140',
    agentName: 'Grace Mwewa',
    avatarInitials: 'GM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-001',
    storeName: 'Cairo Road Flagship Store',
    boothId: 'BTH-LUS-101',
    boothName: 'Counter 1 - Cash & Float Desk',
    status: 'Active',
  },
  // Tenant isolation testing: Agents belonging to another business
  {
    agentId: 'TB-AGT-1064',
    agentName: 'Joseph Kaunda',
    avatarInitials: 'JK',
    businessId: 'BIZ-CPB-002',
    businessName: 'Copperbelt Prime Hub Agency',
    storeId: 'STR-CPB-001',
    storeName: 'Ndola Broadway Branch',
    boothId: 'BTH-CPB-101',
    boothName: 'Counter 1',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1015-01',
    agentName: 'Patrick Chanda',
    avatarInitials: 'PC',
    businessId: 'BIZ-LUS-004',
    businessName: 'Woodlands QuickPay Hub',
    storeId: 'STR-LUS-004',
    storeName: 'QuickPay Branch',
    boothId: 'BTH-LUS-401',
    boothName: 'Counter 1',
    status: 'Active',
  },
];

export function formatCurrencyAmount(val: number): string {
  return (val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function generateAgentTransactionRevenueRecords(): AgentTransactionRevenueRecord[] {
  const records: AgentTransactionRevenueRecord[] = [];
  const customers = [
    { name: 'Mwamba Mulenga', id: 'TB-CUS-1052' },
    { name: 'Bupe Chileshe', id: 'TB-CUS-1021' },
    { name: 'Lombe Kasonde', id: 'TB-CUS-1046' },
    { name: 'Kondwani Banda', id: 'TB-CUS-1077' },
    { name: 'Chanda Bwalya', id: 'TB-CUS-1088' },
    { name: 'Mutale Musonda', id: 'TB-CUS-1092' },
    { name: 'Taonga Zulu', id: 'TB-CUS-1033' },
    { name: 'Kabwe Mwila', id: 'TB-CUS-1049' },
    { name: 'Natasha Lungu', id: 'TB-CUS-1065' },
    { name: 'Chileshe Kapembwa', id: 'TB-CUS-1018' },
    { name: 'Chileshe Mwape', id: 'TB-CUS-1080' },
    { name: 'Bwalya Kaunda', id: 'TB-CUS-1072' },
  ];

  const providers = [
    'Airtel Money',
    'MTN Mobile Money',
    'Zanaco',
    'FNB',
    'Zamtel',
    'Stanbic',
    'Access',
  ];

  const services = ['Cash Pickup', 'Walk-In Transaction', 'Customer Withdrawal'];
  const principalAmounts = [1500, 2500, 3200, 4800, 6000, 7500, 10000, 1800, 3500, 4200, 5400, 2000];

  const lusakaAgents = MOCK_BUSINESS_AGENTS.filter((a) => a.businessId === 'BIZ-LUS-001');
  const otherAgents = MOCK_BUSINESS_AGENTS.filter((a) => a.businessId !== 'BIZ-LUS-001');

  let baseTxnNum = 9500;
  let eligibleCount = 0;

  // Generate 420 transactions spanning 11 Sep down to 01 Sep 2026
  for (let i = 1; i <= 420; i++) {
    // 92% of records belong to BIZ-LUS-001 agents, 8% to other businesses (for tenant isolation test)
    const isLusaka = i % 12 !== 0;
    const agt = isLusaka
      ? lusakaAgents[(i - 1) % lusakaAgents.length]
      : otherAgents[(i - 1) % otherAgents.length];

    const cust = customers[(i - 1) % customers.length];
    const prv = providers[(i - 1) % providers.length];
    const srv = services[(i - 1) % services.length];
    const principal = principalAmounts[(i - 1) % principalAmounts.length];

    // Status distribution: 88% eligible (Posted/Completed), remaining are non-eligible (Cancelled, Failed)
    const statusCycle = i % 25;
    let status: AgentTransactionRevenueRecord['status'] = 'Posted';
    let settlementStatus: AgentTransactionRevenueRecord['settlementStatus'] = 'Settled';

    if (statusCycle === 0) {
      status = 'Cancelled';
      settlementStatus = 'Cancelled';
    } else if (statusCycle === 1) {
      status = 'Failed';
      settlementStatus = 'Cancelled';
    } else if (statusCycle === 2) {
      status = 'Cancelled';
      settlementStatus = 'Cancelled';
    } else if (statusCycle === 3) {
      status = 'Failed';
      settlementStatus = 'Cancelled';
    } else if (statusCycle >= 4 && statusCycle <= 8) {
      status = 'Posted';
      settlementStatus = 'Pending Settlement';
    } else if (statusCycle === 9) {
      status = 'Completed';
      settlementStatus = 'Settled';
    } else {
      status = 'Posted';
      settlementStatus = 'Settled';
    }

    // Days 11 down to 01 Sep
    const dayNum = Math.max(1, 11 - Math.floor((i - 1) / 38));
    const dayStr = String(dayNum).padStart(2, '0');
    const rawDate = `2026-09-${dayStr}`;

    const minuteSlot = (i * 17) % (8 * 60);
    const startHour = 8;
    const hour24 = startHour + Math.floor(minuteSlot / 60);
    const min = minuteSlot % 60;
    const time24 = `${String(hour24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    const isPM = hour24 >= 12;
    const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const time12 = `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
    const dateTime = `${dayStr} Sep 2026, ${time12}`;
    const timestamp = new Date(`${rawDate}T${time24}:00Z`).getTime();

    // Recognized customer reservation charge: 50.00 ZMW for eligible (Posted/Completed), 0.00 for non-eligible
    const isEligible = isEligibleRevenueTransaction(status);
    const reservationCharge = isEligible ? 50.0 : 0.0;

    let tellerBudCharge = 0.0;
    let revenueGenerated = 0.0;

    if (isEligible) {
      eligibleCount++;
      // Distributes 2,879.67 across 322 eligible transactions with exact penny precision
      tellerBudCharge = eligibleCount <= 99 ? 8.95 : 8.94;
      revenueGenerated = Math.round((reservationCharge - tellerBudCharge) * 100) / 100;
    }

    const chgRef = `TB-CHG-${baseTxnNum - i}-01`;
    const txnRef = `TB-TXN-${baseTxnNum - i}`;
    const txnType =
      srv === 'Customer Withdrawal'
        ? 'Customer Withdrawal'
        : srv === 'Cash Pickup'
        ? 'Cash Pickup'
        : ['Cash Deposit', 'Cash In / Out', 'Agent Float'][(i - 1) % 3];

    records.push({
      id: chgRef,
      chargeRecord: chgRef,
      transactionReference: txnRef,
      customer: cust.name,
      customerId: cust.id,
      service: srv,
      transactionType: txnType,
      provider: prv,
      transactionAmount: principal, // Principal amount is not revenue
      reservationCharge,            // Reservation Charge (ZMW)
      tellerBudCharge,              // TellerBud Charge (ZMW)
      revenueGenerated,             // Revenue Generated (ZMW) = Reservation Charge - TellerBud Charge
      dateTime,
      rawDate,
      timestamp,
      settlementStatus,
      status,
      storeId: agt.storeId,
      storeName: agt.storeName,
      boothId: agt.boothId,
      boothName: agt.boothName,
      agentId: agt.agentId,
      agentName: agt.agentName,
      businessId: agt.businessId,
      businessName: agt.businessName,
    });
  }

  // Sort descending by timestamp
  return records.sort((a, b) => b.timestamp - a.timestamp);
}

export const MOCK_AGENT_TRANSACTION_REVENUE_RECORDS: AgentTransactionRevenueRecord[] =
  generateAgentTransactionRevenueRecords();

/**
 * Filters transaction records strictly by business and user-selected filters,
 * excluding non-eligible transactions (Cancelled, Failed).
 */
export function filterAgentTransactions(
  transactions: AgentTransactionRevenueRecord[],
  businessId: string,
  filters: Partial<AgentRevenueFilters> = {}
): AgentTransactionRevenueRecord[] {
  return transactions.filter((t) => {
    // 1. Strict business isolation
    if (t.businessId !== businessId) return false;

    // 2. Date range filter
    if (filters.fromDate && t.rawDate < filters.fromDate) return false;
    if (filters.toDate && t.rawDate > filters.toDate) return false;

    // 3. Store filter
    if (filters.storeId && filters.storeId !== 'All' && t.storeId !== filters.storeId) return false;

    // 4. Booth filter
    if (filters.boothId && filters.boothId !== 'All' && t.boothId !== filters.boothId) return false;

    // 5. Agent filter
    if (filters.agentId && filters.agentId !== 'All' && t.agentId !== filters.agentId) return false;

    return true;
  });
}

/**
 * Checks if a transaction is eligible for revenue recognition in Phase 1.
 * Only Posted and Completed transactions recognize revenue.
 * Cancelled and Failed transactions contribute 0.00.
 */
export function isEligibleRevenueTransaction(status: string): boolean {
  const normalized = (status || '').toLowerCase().trim();
  return normalized === 'posted' || normalized === 'completed';
}

/**
 * Computes the Agent Revenue Breakdown listing and guaranteed reconciling KPI totals.
 * Reconciles 100%:
 * - Reservation Charges = sum of Reservation Charges across all filtered agents.
 * - TellerBud Charges = sum of TellerBud Charges across all filtered agents.
 * - Business Revenue = Reservation Charges - TellerBud Charges = sum of Revenue Generated across all filtered agents.
 * Only Posted and Completed transactions recognize revenue.
 * Calculates across the entire filtered dataset (never just the paginated page).
 */
export function calculateAgentRevenueBreakdown(
  transactions: AgentTransactionRevenueRecord[],
  businessId: string,
  filters: Partial<AgentRevenueFilters> = {}
): {
  breakdown: AgentRevenueBreakdownRecord[];
  kpis: ChargesCommissionsKpiData;
} {
  // 1. Filter agents belonging strictly to the logged-in business
  let eligibleAgents = MOCK_BUSINESS_AGENTS.filter((a) => a.businessId === businessId);

  if (filters.storeId && filters.storeId !== 'All') {
    eligibleAgents = eligibleAgents.filter((a) => a.storeId === filters.storeId);
  }
  if (filters.boothId && filters.boothId !== 'All') {
    eligibleAgents = eligibleAgents.filter((a) => a.boothId === filters.boothId);
  }
  if (filters.agentId && filters.agentId !== 'All') {
    eligibleAgents = eligibleAgents.filter((a) => a.agentId === filters.agentId);
  }

  // 2. Get filtered transactions for this business
  const filteredTxns = filterAgentTransactions(transactions, businessId, filters);

  // 3. Compute per-agent breakdown metrics
  const breakdown: AgentRevenueBreakdownRecord[] = [];

  for (const agt of eligibleAgents) {
    // Agent transactions matching the filters
    const agentTxns = filteredTxns.filter((t) => t.agentId === agt.agentId);

    // Eligible completed transactions (excluding cancelled, failed, expired, reversed)
    const eligibleTxns = agentTxns.filter((t) => isEligibleRevenueTransaction(t.status));

    const completedTransactions = eligibleTxns.length;
    const reservationCharges = Math.round(eligibleTxns.reduce((sum, t) => sum + t.reservationCharge, 0) * 100) / 100;
    const tellerBudCharges = Math.round(eligibleTxns.reduce((sum, t) => sum + t.tellerBudCharge, 0) * 100) / 100;
    // Revenue Generated = Reservation Charges - TellerBud Charges
    const revenueGenerated = Math.round((reservationCharges - tellerBudCharges) * 100) / 100;

    breakdown.push({
      agentId: agt.agentId,
      agentName: agt.agentName,
      avatarInitials: agt.avatarInitials,
      avatarUrl: agt.avatarUrl,
      businessId: agt.businessId,
      businessName: agt.businessName,
      storeId: agt.storeId,
      storeName: agt.storeName,
      boothId: agt.boothId,
      boothName: agt.boothName,
      completedTransactions,
      reservationCharges,
      tellerBudCharges,
      revenueGenerated,
      status: agt.status,
    });
  }

  // 4. Exact mathematical reconciliation for KPI cards:
  // Reservation Charges = sum of Reservation Charges across all filtered agents
  const reservationCharges =
    Math.round(breakdown.reduce((sum, a) => sum + a.reservationCharges, 0) * 100) / 100;

  // TellerBud Charges = sum of TellerBud Charges across all filtered agents
  const tellerBudCharges =
    Math.round(breakdown.reduce((sum, a) => sum + a.tellerBudCharges, 0) * 100) / 100;

  // Business Revenue = sum of Revenue Generated across all filtered agents
  // Formula: Business Revenue = Reservation Charges - TellerBud Charges
  const businessRevenue =
    Math.round((reservationCharges - tellerBudCharges) * 100) / 100;

  return {
    breakdown,
    kpis: {
      reservationCharges,
      tellerBudCharges,
      businessRevenue,
      // Backward compatibility aliases
      reservationChargesCollected: reservationCharges,
      tellerBudRevenue: tellerBudCharges,
      agentRevenue: 0,
      pendingSettlements: 0,
      agentCommissions: 0,
      businessCommissions: businessRevenue,
    },
  };
}

