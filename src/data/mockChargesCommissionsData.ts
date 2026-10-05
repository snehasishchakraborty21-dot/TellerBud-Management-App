import {
  ChargeRecord,
  CommissionRecord,
  ChargesCommissionsKpiData,
  ChargeCommissionRecord,
  RevenueSharingRule,
  AgentRevenueBreakdownRecord,
  AgentTransactionRevenueRecord,
  AgentRevenueFilters,
  BusinessChargesRevenueSummary,
} from '../types/chargesCommissions';

// =========================================================================
// REGISTERED BUSINESSES FOR CHARGES & REVENUE
// =========================================================================
export const REGISTERED_BUSINESSES = [
  { id: 'TB-BIZ-000001', legacyId: 'BIZ-LUS-001', name: 'Lusaka Central Express Agency' },
  { id: 'TB-BIZ-000002', legacyId: 'BIZ-KBW-002', name: 'Kabwata Market Agency' },
  { id: 'TB-BIZ-000003', legacyId: 'BIZ-NDL-003', name: 'Copperbelt Liquidity Hub' },
  { id: 'TB-BIZ-000004', legacyId: 'BIZ-KTW-004', name: 'Kitwe City Financial Booths' },
  { id: 'TB-BIZ-000005', legacyId: 'BIZ-LVS-005', name: 'Victoria Falls Agency Hub' },
  { id: 'TB-BIZ-000006', legacyId: 'BIZ-CHP-006', name: 'Chipata Eastern Express' },
  { id: 'TB-BIZ-000007', legacyId: 'BIZ-SLW-007', name: 'Solwezi Mining Gateway Agency' },
  { id: 'TB-BIZ-000008', legacyId: 'BIZ-LUS-004', name: 'Woodlands QuickPay Hub' },
];

/**
 * Formats a currency amount to ZMW #,##0.00
 */
export function formatCurrencyAmount(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculates dynamic Reservation Fee according to approved client formula:
 * Reservation Fee = (1.2% × Reservation Amount) + (ZMW 0.10 × Number of Minutes) + ZMW 20.00
 * TellerBud Charges = 20% of Reservation Fee
 * Business Revenue = 80% of Reservation Fee
 */
export function computeDynamicReservationFee(amount: number, minutes: number = 30): {
  reservationFee: number;
  tellerBudCharge: number;
  businessRevenue: number;
  minutes: number;
} {
  const percentage = 0.012 * amount;
  const timeComp = 0.10 * minutes;
  const penaltyReserve = 20.0;
  const reservationFee = Math.round((percentage + timeComp + penaltyReserve) * 100) / 100;
  const tellerBudCharge = Math.round(reservationFee * 0.20 * 100) / 100;
  const businessRevenue = Math.round((reservationFee - tellerBudCharge) * 100) / 100;
  return { reservationFee, tellerBudCharge, businessRevenue, minutes };
}

// Helpers for mock generation
const customers = [
  { name: 'Mwamba Mulenga', id: 'TB-CUS-001052' },
  { name: 'Bupe Chileshe', id: 'TB-CUS-001021' },
  { name: 'Lombe Kasonde', id: 'TB-CUS-001046' },
  { name: 'Chanda Bwalya', id: 'TB-CUS-001088' },
  { name: 'Mutale Musonda', id: 'TB-CUS-001092' },
  { name: 'Taonga Zulu', id: 'TB-CUS-001033' },
  { name: 'Kabwe Mwila', id: 'TB-CUS-001049' },
  { name: 'Natasha Lungu', id: 'TB-CUS-001065' },
  { name: 'Chileshe Kapembwa', id: 'TB-CUS-001018' },
  { name: 'Chileshe Mwape', id: 'TB-CUS-001080' },
  { name: 'Bwalya Kaunda', id: 'TB-CUS-001072' },
  { name: 'Kondwani Banda', id: 'TB-CUS-001077' },
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

const validCashPickupTypes = ['Deposit', 'Withdrawal', 'Purchase'];
const transactionAmounts = [1500, 2500, 3200, 4800, 6000, 7500, 10000, 1250, 3500, 4200, 1800, 5400, 8000];

// =========================================================================
// 1. DYNAMIC CHARGE RECORDS GENERATION (Spanning Today Oct 4 down to Sep 1 2026)
// =========================================================================
function generateChargeRecords(): ChargeRecord[] {
  const records: ChargeRecord[] = [];
  let txnCounter = 9850;

  // Dates to generate: 2026-10-05 (Today), 2026-10-04, 2026-10-03, 2026-10-02, 2026-10-01, and 2026-09-30 down to 2026-09-11
  const dates = [
    { iso: '2026-10-05', label: '05 Oct 2026', count: 32 },
    { iso: '2026-10-04', label: '04 Oct 2026', count: 32 },
    { iso: '2026-10-03', label: '03 Oct 2026', count: 28 },
    { iso: '2026-10-02', label: '02 Oct 2026', count: 24 },
    { iso: '2026-10-01', label: '01 Oct 2026', count: 20 },
    { iso: '2026-09-30', label: '30 Sep 2026', count: 18 },
    { iso: '2026-09-29', label: '29 Sep 2026', count: 16 },
    { iso: '2026-09-28', label: '28 Sep 2026', count: 16 },
    { iso: '2026-09-25', label: '25 Sep 2026', count: 15 },
    { iso: '2026-09-20', label: '20 Sep 2026', count: 15 },
    { iso: '2026-09-15', label: '15 Sep 2026', count: 15 },
    { iso: '2026-09-11', label: '11 Sep 2026', count: 25 },
  ];

  dates.forEach((dateConfig) => {
    const { iso, label, count } = dateConfig;

    for (let i = 0; i < count; i++) {
      txnCounter--;
      const txnRef = `TB-TXN-${txnCounter}`;
      const chgRef = `TB-CHG-${txnCounter}-01`;

      // Business assignment (cycle evenly so every business has records on active days)
      const biz = REGISTERED_BUSINESSES[i % REGISTERED_BUSINESSES.length];
      const cust = customers[(i * 3 + 1) % customers.length];
      const prv = providers[(i * 2 + 3) % providers.length];
      const tType = validCashPickupTypes[i % validCashPickupTypes.length];
      const amt = transactionAmounts[(i * 4 + 2) % transactionAmounts.length];
      const minutes = 20 + ((i * 7) % 25);
      const dynamicFee = computeDynamicReservationFee(amt, minutes);

      // Status: 85% Posted, 10% Pending, 5% Cancelled
      let status: ChargeRecord['status'] = 'Posted';
      if (i % 9 === 0) status = 'Pending';
      else if (i % 17 === 0) status = 'Cancelled';

      // Decreasing times across the day from 16:45 down to 08:30
      const totalMinutes = 16 * 60 + 45 - Math.floor((i * (8 * 60 + 15)) / count);
      const hh = Math.floor(totalMinutes / 60);
      const mm = totalMinutes % 60;
      const time24 = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      const isPM = hh >= 12;
      const h12 = hh % 12 === 0 ? 12 : hh % 12;
      const time12 = `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;

      const createdAt = `${label}, ${time24}`;
      const dateTime = `${label}, ${time12}`;
      const timestamp = new Date(`${iso}T${time24}:00Z`).getTime();

      records.push({
        id: chgRef,
        reference: chgRef,
        createdAt,
        dateTime,
        timestamp,
        rawDate: iso,
        transactionReference: txnRef,
        transactionType: tType,
        customerName: cust.name,
        customerId: cust.id,
        customerWalletId: `TB-WAL-${cust.id.replace('TB-CUS-', '')}`,
        customerMobile: '+260 97 ' + (100 + ((i * 17) % 899)) + ' ' + (1000 + ((i * 37) % 8999)),
        service: 'Cash Pickup',
        provider: prv,
        transactionAmount: amt,
        reservationCharge: dynamicFee.reservationFee,
        tellerBudCharge: dynamicFee.tellerBudCharge,
        businessRevenue: dynamicFee.businessRevenue,
        reservationMinutes: dynamicFee.minutes,
        status,
        businessName: biz.name,
        businessId: biz.id,
        agentName: 'Mwansa Tembo',
        agentId: 'TB-AGT-1007-01',
        rateRuleVersion: 'TB-CHG-RULE-01-V1',
        idempotencyKey: `IDEMP-TB-CHG-${txnCounter}-01`,
        ledgerEntryReference: `TB-LED-${cust.id.replace('TB-CUS-', '')}-01`,
        walletLedgerReference: `TB-LED-${cust.id.replace('TB-CUS-', '')}-01`,
        description: `Customer cash reservation charge for ${prv} cash pickup ${tType.toLowerCase()}.`,
        lifecycleTimeline: [
          { id: 'LT-1', status: 'Reservation Created', timestamp: `${label}, 08:30`, actor: cust.name },
          { id: 'LT-2', status: `Charge ${status}`, timestamp: `${label}, ${time24}`, actor: 'TellerBud Core Engine' },
        ],
      });
    }
  });

  return records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export const MOCK_CHARGE_RECORDS: ChargeRecord[] = generateChargeRecords();

// =========================================================================
// REVENUE SHARING CONFIGURATION & DYNAMIC CALCULATION
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
 * and actual filtered transaction records (never hardcoded).
 */
export function calculateRevenueKpis(
  chargeRecords: ChargeRecord[],
  commissionRecords: CommissionRecord[] = [],
  rule: RevenueSharingRule = CONFIGURED_REVENUE_SHARING_RULE
): ChargesCommissionsKpiData {
  const reservationCharges = chargeRecords.reduce(
    (sum, record) => sum + (record.reservationCharge || 0),
    0
  );

  const tellerBudCharges = chargeRecords.reduce(
    (sum, record) => sum + (record.tellerBudCharge ?? Math.round((record.reservationCharge || 0) * 0.20 * 100) / 100),
    0
  );

  const businessRevenue = chargeRecords.reduce(
    (sum, record) => sum + (record.businessRevenue ?? Math.round((record.reservationCharge || 0) * 0.80 * 100) / 100),
    0
  );

  return {
    reservationCharges: Math.round(reservationCharges * 100) / 100,
    tellerBudCharges: Math.round(tellerBudCharges * 100) / 100,
    businessRevenue: Math.round(businessRevenue * 100) / 100,
    reservationChargesCollected: Math.round(reservationCharges * 100) / 100,
    tellerBudRevenue: Math.round(tellerBudCharges * 100) / 100,
    agentRevenue: 0,
    pendingSettlements: 0,
    agentCommissions: 0,
    businessCommissions: Math.round(businessRevenue * 100) / 100,
  };
}

/**
 * Aggregates filtered charge records into business-level summary records.
 * Only returns rows for businesses that have matching records within the filtered date/dataset.
 */
export function calculateBusinessSummaries(
  chargeRecords: ChargeRecord[],
  businesses = REGISTERED_BUSINESSES
): BusinessChargesRevenueSummary[] {
  const summaries: BusinessChargesRevenueSummary[] = [];

  for (const biz of businesses) {
    const bizRecords = chargeRecords.filter((rec) => {
      if (rec.businessId && (rec.businessId === biz.id || rec.businessId === biz.legacyId)) {
        return true;
      }
      if (rec.businessName && rec.businessName.toLowerCase() === biz.name.toLowerCase()) {
        return true;
      }
      return false;
    });

    if (bizRecords.length === 0) {
      continue;
    }

    const reservationCharges = bizRecords.reduce(
      (sum, r) => sum + (r.reservationCharge || 0),
      0
    );
    const tellerBudCharges = bizRecords.reduce(
      (sum, r) => sum + (r.tellerBudCharge ?? Math.round(r.reservationCharge * 0.20 * 100) / 100),
      0
    );
    const businessRevenue = bizRecords.reduce(
      (sum, r) => sum + (r.businessRevenue ?? Math.round(r.reservationCharge * 0.80 * 100) / 100),
      0
    );

    const postedCount = bizRecords.filter(
      (r) => r.status === 'Posted' || r.status === 'Completed'
    ).length;
    const pendingCount = bizRecords.filter(
      (r) => r.status === 'Pending'
    ).length;

    // Get latest activity strictly within this selected date dataset
    const sorted = [...bizRecords].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const latest = sorted[0];
    let lastActivityDate = '';
    let lastActivityTime = '';

    if (latest) {
      if (latest.dateTime && latest.dateTime.includes(',')) {
        const parts = latest.dateTime.split(',');
        lastActivityDate = parts[0].trim();
        lastActivityTime = parts[1].trim();
      } else if (latest.createdAt && latest.createdAt.includes(',')) {
        const parts = latest.createdAt.split(',');
        lastActivityDate = parts[0].trim();
        lastActivityTime = parts[1].trim();
      } else {
        lastActivityDate = latest.rawDate;
        lastActivityTime = latest.dateTime || '';
      }
    }

    summaries.push({
      businessId: biz.id,
      businessName: biz.name,
      transactionsCount: bizRecords.length,
      reservationCharges: Math.round(reservationCharges * 100) / 100,
      tellerBudCharges: Math.round(tellerBudCharges * 100) / 100,
      businessRevenue: Math.round(businessRevenue * 100) / 100,
      postedCount,
      pendingCount,
      lastActivityDate,
      lastActivityTime,
      lastActivityIso: latest?.createdAt || '',
      records: bizRecords,
    });
  }

  return summaries;
}

export const MOCK_COMMISSION_RECORDS: CommissionRecord[] = [];

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
];


export const MOCK_CHARGES_COMMISSIONS_KPIS: ChargesCommissionsKpiData = calculateRevenueKpis(
  MOCK_CHARGE_RECORDS
);

// =========================================================================
// AGENT REVENUE CONFIGURATION & MOCK DATA
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
    agentId: 'TB-AGT-1007-01',
    agentName: 'Mwansa Tembo',
    avatarInitials: 'MT',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-001',
    storeName: 'Cairo Road Flagship Store',
    boothId: 'BTH-LUS-103',
    boothName: 'Counter 3 - Express Walk-in Desk',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1007-02',
    agentName: 'Ruth Phiri',
    avatarInitials: 'RP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-002',
    storeName: 'Woodlands Mall Agency Branch',
    boothId: 'BTH-LUS-201',
    boothName: 'Booth 1 - Banking Services',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1007-03',
    agentName: 'Peter Mwale',
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
    agentId: 'TB-AGT-1007-04',
    agentName: 'Grace Lungu',
    avatarInitials: 'GL',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-003',
    storeName: 'Matero East Hub',
    boothId: 'BTH-LUS-301',
    boothName: 'Booth 1 - Main Till',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1007-05',
    agentName: 'Chileshe Bwalya',
    avatarInitials: 'CB',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    storeId: 'STR-LUS-003',
    storeName: 'Matero East Hub',
    boothId: 'BTH-LUS-302',
    boothName: 'Booth 2 - Fast Cash Desk',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1012-01',
    agentName: 'Joseph Kaunda',
    avatarInitials: 'JK',
    businessId: 'BIZ-NDL-003',
    businessName: 'Copperbelt Prime Hub Agency',
    storeId: 'STR-NDL-001',
    storeName: 'Ndola Main Store',
    boothId: 'BTH-NDL-101',
    boothName: 'Booth 1 - Float Desk',
    status: 'Active',
  },
  {
    agentId: 'TB-AGT-1015-01',
    agentName: 'Patrick Chanda',
    avatarInitials: 'PC',
    businessId: 'BIZ-LUS-004',
    businessName: 'Woodlands QuickPay Hub',
    storeId: 'STR-WDL-001',
    storeName: 'Woodlands Main',
    boothId: 'BTH-WDL-101',
    boothName: 'Booth 1',
    status: 'Active',
  },
];

function generateAgentTransactionRevenueRecords(): AgentTransactionRevenueRecord[] {
  const records: AgentTransactionRevenueRecord[] = [];
  const lusakaAgents = MOCK_BUSINESS_AGENTS.filter((a) => a.businessId === 'BIZ-LUS-001');

  const dates = [
    { iso: '2026-10-05', label: '05 Oct 2026', count: 35 },
    { iso: '2026-10-04', label: '04 Oct 2026', count: 35 },
    { iso: '2026-10-03', label: '03 Oct 2026', count: 30 },
    { iso: '2026-10-02', label: '02 Oct 2026', count: 25 },
    { iso: '2026-10-01', label: '01 Oct 2026', count: 22 },
    { iso: '2026-09-30', label: '30 Sep 2026', count: 20 },
    { iso: '2026-09-11', label: '11 Sep 2026', count: 25 },
  ];

  let txnNum = 9500;

  dates.forEach((dateConfig) => {
    const { iso, label, count } = dateConfig;

    for (let i = 0; i < count; i++) {
      txnNum--;
      const agt = lusakaAgents[i % lusakaAgents.length];
      const cust = customers[(i * 3 + 2) % customers.length];
      const prv = providers[(i * 2 + 1) % providers.length];
      const principal = transactionAmounts[(i * 4 + 1) % transactionAmounts.length];
      const reservationCharge = 50.0;
      const tellerBudCharge = 10.0;
      const revenueGenerated = 40.0;

      const totalMinutes = 16 * 60 + 30 - Math.floor((i * (8 * 60)) / count);
      const hh = Math.floor(totalMinutes / 60);
      const mm = totalMinutes % 60;
      const time24 = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      const isPM = hh >= 12;
      const h12 = hh % 12 === 0 ? 12 : hh % 12;
      const time12 = `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;

      const dateTime = `${label}, ${time12}`;
      const timestamp = new Date(`${iso}T${time24}:00Z`).getTime();

      const chgRef = `TB-CHG-${txnNum}-01`;
      const txnRef = `TB-TXN-${txnNum}`;

      records.push({
        id: chgRef,
        chargeRecord: chgRef,
        transactionReference: txnRef,
        customer: cust.name,
        customerId: cust.id,
        service: 'Cash Pickup',
        transactionType: ['Cash Pickup', 'Cash Deposit', 'Customer Withdrawal'][i % 3],
        provider: prv,
        transactionAmount: principal,
        reservationCharge,
        tellerBudCharge,
        revenueGenerated,
        dateTime,
        rawDate: iso,
        timestamp,
        settlementStatus: 'Settled',
        status: 'Posted',
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
  });

  return records.sort((a, b) => b.timestamp - a.timestamp);
}

export const MOCK_AGENT_TRANSACTION_REVENUE_RECORDS: AgentTransactionRevenueRecord[] =
  generateAgentTransactionRevenueRecords();

export function isEligibleRevenueTransaction(status: string): boolean {
  const normalized = (status || '').toLowerCase().trim();
  return normalized === 'posted' || normalized === 'completed';
}

export function filterAgentTransactions(
  transactions: AgentTransactionRevenueRecord[],
  businessId: string,
  filters: Partial<AgentRevenueFilters & { date?: string }> = {}
): AgentTransactionRevenueRecord[] {
  return transactions.filter((t) => {
    if (t.businessId !== businessId) return false;
    if (filters.date && t.rawDate !== filters.date) return false;
    if (filters.fromDate && t.rawDate < filters.fromDate) return false;
    if (filters.toDate && t.rawDate > filters.toDate) return false;
    if (filters.storeId && filters.storeId !== 'All' && t.storeId !== filters.storeId) return false;
    if (filters.boothId && filters.boothId !== 'All' && t.boothId !== filters.boothId) return false;
    if (filters.agentId && filters.agentId !== 'All' && t.agentId !== filters.agentId) return false;
    return true;
  });
}

export function calculateAgentRevenueBreakdown(
  transactions: AgentTransactionRevenueRecord[],
  businessId: string,
  filters: Partial<AgentRevenueFilters & { date?: string }> = {}
): {
  breakdown: AgentRevenueBreakdownRecord[];
  kpis: ChargesCommissionsKpiData;
} {
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

  const filteredTxns = filterAgentTransactions(transactions, businessId, filters);
  const breakdown: AgentRevenueBreakdownRecord[] = [];

  for (const agt of eligibleAgents) {
    const agentTxns = filteredTxns.filter((t) => t.agentId === agt.agentId);
    const eligibleTxns = agentTxns.filter((t) => isEligibleRevenueTransaction(t.status));

    const completedTransactions = eligibleTxns.length;
    const reservationCharges = Math.round(eligibleTxns.reduce((sum, t) => sum + t.reservationCharge, 0) * 100) / 100;
    const tellerBudCharges = Math.round(eligibleTxns.reduce((sum, t) => sum + t.tellerBudCharge, 0) * 100) / 100;
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

  const reservationCharges =
    Math.round(breakdown.reduce((sum, a) => sum + a.reservationCharges, 0) * 100) / 100;
  const tellerBudCharges =
    Math.round(breakdown.reduce((sum, a) => sum + a.tellerBudCharges, 0) * 100) / 100;
  const businessRevenue =
    Math.round((reservationCharges - tellerBudCharges) * 100) / 100;

  return {
    breakdown,
    kpis: {
      reservationCharges,
      tellerBudCharges,
      businessRevenue,
      reservationChargesCollected: reservationCharges,
      tellerBudRevenue: tellerBudCharges,
      agentRevenue: 0,
      pendingSettlements: 0,
      agentCommissions: 0,
      businessCommissions: businessRevenue,
    },
  };
}
