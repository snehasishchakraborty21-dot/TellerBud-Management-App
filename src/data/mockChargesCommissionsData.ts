import {
  ChargeRecord,
  CommissionRecord,
  ChargesCommissionsKpiData,
  ChargeCommissionRecord,
} from '../types/chargesCommissions';

// Exact KPI Card Values Specified by User
export const MOCK_CHARGES_COMMISSIONS_KPIS: ChargesCommissionsKpiData = {
  reservationChargesCollected: 18450.0,
  agentCommissions: 10250.0,
  businessCommissions: 4900.0,
  tellerBudRevenue: 3300.0,
  pendingSettlements: 1200.0,
};

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
    'Refunded',
    'Reversed',
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
    calculationBasis: 'ZMW 1,200.00 × 1.00%',
    rateRuleVersion: 'Rule: TB-COM-RULE-03-V2',
    transactionAmount: 1200.0,
    commissionAmount: 12.0,
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
    'Reversed',
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
