import { PickupRequest } from '../types/admin';
import { MOCK_LIVE_PICKUP_OPERATIONS } from './mockAdminData';

/**
 * Deterministic generation of 230 realistic Zambian historical Customer Request records:
 * - 216 Completed
 * - 8 Cancelled
 * - 6 No Agent Available
 *
 * Combined with the 18 active requests in MOCK_LIVE_PICKUP_OPERATIONS:
 * 18 Active + 216 Completed + 8 Cancelled + 6 No Agent Available = 248 Total Requests.
 */

interface AgentTemplate {
  name: string;
  id: string;
  phone: string;
  businessName: string;
  businessId: string;
}

const HISTORICAL_AGENTS: AgentTemplate[] = [
  {
    name: 'Kelvin Phiri',
    id: 'TB-AGT-1024',
    phone: '+260 97 234 5678',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
  },
  {
    name: 'Natasha Zulu',
    id: 'TB-AGT-1062',
    phone: '+260 97 556 7890',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
  },
  {
    name: 'Brian Chanda',
    id: 'TB-AGT-1088',
    phone: '+260 96 112 3344',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
  },
  {
    name: 'Faith Mwewa',
    id: 'TB-AGT-1050',
    phone: '+260 97 456 7890',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
  },
  {
    name: 'Mutale Musonda',
    id: 'TB-AGT-1044',
    phone: '+260 97 990 1234',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
  },
  {
    name: 'Blessings Banda',
    id: 'TB-AGT-1092',
    phone: '+260 97 887 6543',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
  },
  {
    name: 'Chanda Mulenga',
    id: 'TB-AGT-1077',
    phone: '+260 97 334 5566',
    businessName: 'Kabwata Market Agency',
    businessId: 'BIZ-KAB-001',
  },
  {
    name: 'Peter Mwila',
    id: 'TB-AGT-1081',
    phone: '+260 96 445 6677',
    businessName: 'Kabwata Market Agency',
    businessId: 'BIZ-KAB-001',
  },
  {
    name: 'Joseph Mwale',
    id: 'TB-AGT-1015',
    phone: '+260 97 123 9988',
    businessName: 'Copperbelt Financial Services',
    businessId: 'BIZ-COP-002',
  },
  {
    name: 'Taonga Phiri',
    id: 'TB-AGT-1033',
    phone: '+260 96 332 1100',
    businessName: 'Copperbelt Financial Services',
    businessId: 'BIZ-COP-002',
  },
  {
    name: 'Monde Lungu',
    id: 'TB-AGT-1095',
    phone: '+260 97 776 5544',
    businessName: 'Ndola Express Hub',
    businessId: 'BIZ-NDO-003',
  },
  {
    name: 'Davies Sakala',
    id: 'TB-AGT-1098',
    phone: '+260 95 889 0011',
    businessName: 'Ndola Express Hub',
    businessId: 'BIZ-NDO-003',
  },
];

const CUSTOMER_NAMES = [
  'Mulenga Chilufya', 'Kabaso Kangwa', 'Sipho Zulu', 'Mubanga Tembo',
  'Chileshe Musonda', 'Mwape Mwansa', 'Njavwa Banda', 'Bupe Sakala',
  'Kondwani Phiri', 'Lombe Sinyangwe', 'Chibwe Chewe', 'Mapalo Mukuka',
  'Thandiwe Mwale', 'Subilo Chanda', 'Bwalya Mutale', 'Taonga Lungu',
  'Mwamba Situmbeko', 'Mundia Daka', 'Chisomo Phiri', 'Chilombo Tembo',
  'Grace Miti', 'Moses Mwamba', 'Precious Simukonda', 'Dalitso Kaunda',
  'Wezi Nyirenda', 'Natasha Bwalya', 'Gift Silungwe', 'Catherine Mvula',
  'Kennedy Kasonde', 'Rachael Chirwa', 'Samuel Nkhoma', 'Doreen Kaluba',
  'Patrick Mwape', 'Esther Zimba', 'Andrew Mwanza', 'Jacqueline Mwila',
  'Emanuel Chola', 'Agnes Kasongo', 'Davies Malama', 'Christine Mumba'
];

const LOCATIONS = [
  'Manda Hill Shopping Mall, Great East Rd, Lusaka',
  'East Park Mall, Great East Rd, Lusaka',
  'Levy Junction Mall, Church Rd, Lusaka',
  'Arcades Shopping Mall, Lusaka',
  'Cosmopolitan Mall, Kafue Rd, Lusaka',
  'Kabulonga Centro Mall, Lusaka',
  'Crossroads Shopping Mall, Leopard Hill Rd, Lusaka',
  'Woodlands Shopping Mall, Lusaka',
  'Pinnacle Mall, Woodlands Extension, Lusaka',
  'Waterfalls Mall, Great East Rd, Lusaka',
  'Novare Great North Mall, Lusaka',
  'Embassy Mall, Chawama Rd, Lusaka',
  'Kabwata Market Commercial Plaza, Lusaka',
  'Kitwe City Square, Independence Ave, Kitwe',
  'ECL Mall, Freedom Ave, Kitwe',
  'Ndola City Centre, President Ave, Ndola',
  'Kafubu Mall, Broadway, Ndola',
  'Chilenje South Market, Lusaka',
  'Matero North Market, Commonwealth Ave, Lusaka',
  'Garden Compound Commercial Point, Lusaka',
];

const VENDORS: Array<PickupRequest['vendor']> = [
  'MTN', 'Airtel', 'Zamtel', 'Zanaco', 'FNB', 'INDO', 'Stanbic', 'Access',
];

const TYPES: Array<PickupRequest['type']> = ['Deposit', 'Withdrawal', 'Purchase'];

const AMOUNTS = [
  450, 750, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000,
  4500, 5000, 6000, 7500, 8000, 9500, 10000, 12000, 15000,
];

// Explicit indices for the 8 Cancelled and 6 No Agent Available requests
// out of the 230 historical records (0 to 229)
const CANCELLED_INDICES = new Set([12, 38, 71, 104, 137, 169, 195, 221]);
const NO_AGENT_INDICES = new Set([5, 45, 88, 125, 178, 212]);

function formatHistoricalDate(date: Date): { createdAt: string; timestamp: string } {
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const year = date.getFullYear();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthStr = monthNames[date.getMonth()];
  const day = pad(date.getDate());
  
  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = pad(hours);

  // ISO timestamp
  const iso = date.toISOString();
  // Human formatted date e.g. "03 Sep 2026, 04:20 PM"
  const createdAt = `${day} ${monthStr} ${year}, ${hourStr}:${minutes} ${ampm}`;

  return { createdAt, timestamp: iso };
}

function generateHistoricalRequests(): PickupRequest[] {
  const records: PickupRequest[] = [];
  const baseDate = new Date('2026-09-04T09:30:00Z'); // Just before the oldest active request (09:45 AM)

  // Track all IDs from active operations so historical requests never collide
  const activeIds = new Set(MOCK_LIVE_PICKUP_OPERATIONS.map((r) => r.id));
  activeIds.add('TB-REQ-1028');

  let nextNum = 1017;

  for (let i = 0; i < 230; i++) {
    // Index 0 is dedicated to the canonical Completed request TB-REQ-1028
    if (i === 0) {
      records.push({
        id: 'TB-REQ-1028',
        customerId: 'TB-CUS-1028',
        customerName: 'Thomas Banda',
        customerPhone: '+260 97 328 1028',
        type: 'Withdrawal',
        vendor: 'Zanaco',
        amount: 8000.0,
        status: 'Completed',
        agentName: 'Joseph Kaunda',
        agentId: 'TB-AGT-1064',
        agentPhone: '+260 97 123 4567',
        businessName: 'Lusaka Central Express Agency',
        businessId: 'BIZ-LUS-001',
        serviceTime: '31 Aug 2026, 11:30 AM',
        isScheduled: true,
        pickupLocation: 'Cairo Road Shopping Centre, Lusaka',
        createdAt: '31 Aug 2026, 09:05 AM',
        timestamp: '2026-08-31T09:05:00Z',
        notes: 'Completed request record. Customer and Agent confirmations are preserved in the operational audit history.',
      });
      continue;
    }

    while (activeIds.has(`TB-REQ-${nextNum}`)) {
      nextNum--;
    }
    const refNum = nextNum;
    const reqId = `TB-REQ-${refNum}`;
    const cusId = `TB-CUS-${refNum}`;
    nextNum--;
    
    // Decrement time: roughly 1.5 to 3 hours step backwards
    const minutesBack = 90 + (i * 105) % 180;
    baseDate.setMinutes(baseDate.getMinutes() - minutesBack);
    const { createdAt, timestamp } = formatHistoricalDate(baseDate);

    const customerName = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];
    const customerPhone = `+260 9${(i % 3 === 0 ? '7' : i % 3 === 1 ? '6' : '5')} ${100 + (i * 17) % 900} ${1000 + (i * 31) % 9000}`;
    const type = TYPES[i % TYPES.length];
    const vendor = VENDORS[(i * 3) % VENDORS.length];
    const amount = AMOUNTS[(i * 7) % AMOUNTS.length];
    const location = LOCATIONS[(i * 5) % LOCATIONS.length];

    const isScheduled = i % 4 === 0;
    const serviceTime = isScheduled ? 'Scheduled' : 'Now';

    let status: PickupRequest['status'] = 'Completed';
    let agentName: string | null = null;
    let agentId: string | undefined = undefined;
    let agentPhone: string | undefined = undefined;
    let businessName: string | undefined = undefined;
    let businessId: string | undefined = undefined;
    let notes: string | undefined = 'Standard Cash Pickup transaction fulfilled.';

    if (NO_AGENT_INDICES.has(i)) {
      status = 'No Agent Available';
      agentName = null;
      notes = 'Matching engine broadcast completed without eligible agent acceptance.';
    } else if (CANCELLED_INDICES.has(i)) {
      status = 'Cancelled';
      if (i % 2 === 0) {
        const ag = HISTORICAL_AGENTS[i % HISTORICAL_AGENTS.length];
        agentName = ag.name;
        agentId = ag.id;
        agentPhone = ag.phone;
        businessName = ag.businessName;
        businessId = ag.businessId;
      }
      notes = 'Customer cancelled request prior to service completion.';
    } else {
      // Completed (216 requests)
      status = 'Completed';
      const ag = HISTORICAL_AGENTS[i % HISTORICAL_AGENTS.length];
      agentName = ag.name;
      agentId = ag.id;
      agentPhone = ag.phone;
      businessName = ag.businessName;
      businessId = ag.businessId;
    }

    records.push({
      id: reqId,
      customerId: cusId,
      customerName,
      customerPhone,
      type,
      vendor,
      amount,
      status,
      agentName,
      agentId,
      agentPhone,
      businessName,
      businessId,
      serviceTime,
      isScheduled,
      pickupLocation: location,
      createdAt,
      timestamp,
      notes,
    });
  }

  return records;
}

export const MOCK_HISTORICAL_CUSTOMER_REQUESTS: PickupRequest[] = generateHistoricalRequests();

/**
 * Returns the complete dataset of 248 Customer Requests:
 * The 18 active requests from Live Operations + 230 historical records,
 * sorted newest-first by timestamp.
 */
export function getAllCustomerRequests(activeRequests: PickupRequest[] = MOCK_LIVE_PICKUP_OPERATIONS): PickupRequest[] {
  // Sort active requests first, then historical
  const sortedActive = [...activeRequests].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const seenIds = new Set(sortedActive.map((r) => r.id));
  const uniqueHistorical = MOCK_HISTORICAL_CUSTOMER_REQUESTS.filter((r) => !seenIds.has(r.id));

  return [...sortedActive, ...uniqueHistorical];
}

/**
 * Summary metrics for Customer Requests:
 * Total: 248
 * Active: 18 (Finding an Agent, Agent Confirmed, Active Service, Pending Confirmation)
 * Completed: 216
 * Cancelled: 8
 * No Agent Available: 6
 * Reconciled: 18 + 216 + 8 + 6 = 248.
 */
export function getCustomerRequestsSummary(requests: PickupRequest[]) {
  const activeStatuses = new Set([
    'Finding an Agent',
    'Agent Confirmed',
    'Active Service',
    'Pending Confirmation',
  ]);

  let active = 0;
  let completed = 0;
  let cancelled = 0;
  let noAgentAvailable = 0;

  for (const r of requests) {
    if (activeStatuses.has(r.status)) {
      active++;
    } else if (r.status === 'Completed') {
      completed++;
    } else if (r.status === 'Cancelled') {
      cancelled++;
    } else if (r.status === 'No Agent Available') {
      noAgentAvailable++;
    }
  }

  return {
    total: requests.length,
    active,
    completed,
    cancelled,
    noAgentAvailable,
  };
}
