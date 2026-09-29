import {
  AgentRecord,
  WalkInTransaction,
  PickupRequest,
  CashFloatRequest,
  AgentToAgentRequest,
} from '../types/admin';
import { MOCK_WALK_IN_TRANSACTIONS } from '../data/mockWalkInData';
import { MOCK_CASH_FLOAT_REQUESTS } from '../data/mockCashFloatData';
import { MOCK_AGENT_LIQUIDITY_REQUESTS } from '../data/mockAgentLiquidityData';
import { MOCK_LIVE_PICKUP_OPERATIONS } from '../data/mockAdminData';

export interface AgentOperationalRecord {
  id: string;
  type: string;
  reference: string;
  description: string;
  amount: number;
  formattedDateTime: string;
  rawTimestamp: number;
  status: string;
  serviceCategory?: string;
}

/**
 * Format timestamp / ISO string / Date into "28 Sep 2026, 11:15 AM"
 */
export function formatAgentDateTime(input: string | number | Date): string {
  if (!input) return '28 Sep 2026, 08:00 AM';

  if (typeof input === 'string') {
    // If it contains "Today, 11:15 AM", convert to "28 Sep 2026, 11:15 AM"
    if (input.includes('Today')) {
      const timePart = input.replace('Today,', '').trim();
      return `28 Sep 2026, ${timePart}`;
    }
    if (input.includes('Yesterday')) {
      const timePart = input.replace('Yesterday,', '').trim();
      return `27 Sep 2026, ${timePart}`;
    }
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) {
    return typeof input === 'string' ? input : '28 Sep 2026, 08:00 AM';
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = hours.toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Helper to generate deterministic historical records for an agent spanning their tenure.
 */
function generateHistoricalRecordsForAgent(agent: AgentRecord): AgentOperationalRecord[] {
  const records: AgentOperationalRecord[] = [];
  const agentId = agent.id;
  const idNum = parseInt(agentId.replace(/\D/g, ''), 10) || 1024;
  const baseDate = new Date(agent.joinedDate || '2025-11-10');
  const now = new Date('2026-09-28T11:45:00+02:00');

  // Activity templates
  const templates = [
    {
      type: 'Pickup Fulfillment',
      desc: (name: string, cust: string) => `Completed customer cash withdrawal pickup for ${cust}`,
      statuses: ['Completed', 'Completed', 'Completed', 'In Progress'],
      amounts: [1200, 2500, 3500, 5000, 1800, 4200, 7500],
      customers: ['Ruth Banda', 'Chileshe Mulenga', 'Grace Tembo', 'Davies Mwape', 'Faith Bwalya', 'Joseph Kangwa', 'Memory Phiri'],
      refPrefix: 'TB-REQ',
    },
    {
      type: 'Walk-In Deposit',
      desc: (name: string, cust: string) => `Processed cash deposit for ${cust} via Zanaco`,
      statuses: ['Completed', 'Completed', 'Completed'],
      amounts: [800, 1500, 3200, 6000, 12000, 4500],
      customers: ['Peter Mumba', 'Brian Chisenga', 'Agnes Kunda', 'David Lungu', 'Esther Chilufya'],
      refPrefix: 'TB-WLK',
    },
    {
      type: 'Walk-In Withdrawal',
      desc: (name: string, cust: string) => `Processed MTN Mobile Money cash-out for ${cust}`,
      statuses: ['Completed', 'Completed', 'Completed'],
      amounts: [500, 1200, 2800, 4000, 1900, 850],
      customers: ['John Zimba', 'Miriam Sampa', 'Patrick Chanda', 'Bessy Mwewa', 'Loveness Zulu'],
      refPrefix: 'TB-WLK',
    },
    {
      type: 'Cash / Float Request',
      desc: (name: string) => `Float replenishment request from Business Owner`,
      statuses: ['Approved', 'Approved', 'Completed', 'Pending Review'],
      amounts: [5000, 8000, 10000, 15000, 6000],
      customers: ['Internal Till'],
      refPrefix: 'TB-CFR',
    },
    {
      type: 'Agent-to-Agent Liquidity',
      desc: (name: string) => `Counter cash balancing transfer with peer agent`,
      statuses: ['Completed', 'Completed', 'Approved'],
      amounts: [3000, 5000, 7500, 4000],
      customers: ['Counter Till 2'],
      refPrefix: 'TB-ATL',
    },
    {
      type: 'Walk-In Purchase',
      desc: (name: string, cust: string) => `Processed ZESCO prepaid electricity token purchase for ${cust}`,
      statuses: ['Completed', 'Completed'],
      amounts: [350, 650, 1200, 950, 400],
      customers: ['Eunice Bwalya', 'Moffat Phiri', 'Bright Tembo', 'Catherine Mwila'],
      refPrefix: 'TB-WLK',
    },
  ];

  // Generate 25 - 35 chronological records across historical timeline
  const count = 28 + (idNum % 10);
  const timeSpan = now.getTime() - baseDate.getTime();
  
  for (let i = 0; i < count; i++) {
    const tplIdx = (i + idNum) % templates.length;
    const tpl = templates[tplIdx];
    const custIdx = (i * 3 + idNum) % tpl.customers.length;
    const cust = tpl.customers[custIdx];
    const amtIdx = (i * 2 + idNum) % tpl.amounts.length;
    const amount = tpl.amounts[amtIdx];
    const statusIdx = (i + idNum) % tpl.statuses.length;
    const status = i === 0 && tpl.type === 'Pickup Fulfillment' ? 'In Progress' : tpl.statuses[statusIdx];

    // Compute progress ratio (i = 0 is closest to now, i = count - 1 is near baseDate)
    const ratio = i / count;
    // Add jitter so not strictly linear
    const jitter = ((i * 7) % 5) * 3600 * 1000;
    const itemTimeMs = now.getTime() - Math.floor(ratio * timeSpan) - jitter;
    const itemDate = new Date(Math.max(baseDate.getTime(), Math.min(now.getTime(), itemTimeMs)));

    // Set reasonable business hours (08:00 - 17:30)
    const hour = 8 + ((i * 3 + idNum) % 9);
    const minute = ((i * 13 + idNum) % 12) * 5;
    itemDate.setHours(hour, minute, 0, 0);

    const refNum = 1000 + ((idNum * 13 + i * 29) % 8999);
    const reference = `${tpl.refPrefix}-${refNum}`;

    records.push({
      id: `HIST-${agentId}-${i + 1}`,
      type: tpl.type,
      reference,
      description: tpl.desc(agent.name, cust),
      amount,
      formattedDateTime: formatAgentDateTime(itemDate),
      rawTimestamp: itemDate.getTime(),
      status,
    });
  }

  return records;
}

/**
 * Aggregates all operational history records for a given agent across datasets,
 * sorted newest to oldest.
 */
export function getAgentOperationalHistory(agent: AgentRecord): AgentOperationalRecord[] {
  const aggregated: AgentOperationalRecord[] = [];
  const seenRefs = new Set<string>();

  const cleanAgentId = agent.id.trim().toLowerCase();
  const cleanAgentName = agent.name.trim().toLowerCase();

  // 1. Direct agent recentActivity entries (convert formats)
  if (agent.recentActivity && Array.isArray(agent.recentActivity)) {
    agent.recentActivity.forEach((act, idx) => {
      const ref = act.reference || `TB-ACT-${idx + 100}`;
      if (!seenRefs.has(ref)) {
        seenRefs.add(ref);
        const timestampStr = formatAgentDateTime(act.timestamp || '28 Sep 2026, 11:15 AM');
        aggregated.push({
          id: act.id || `REC-${idx}`,
          type: act.type,
          reference: ref,
          description: act.description,
          amount: act.amount ?? 0,
          formattedDateTime: timestampStr,
          rawTimestamp: new Date('2026-09-28T11:15:00+02:00').getTime() - idx * 3600000,
          status: act.status || 'Completed',
        });
      }
    });
  }

  // 2. Walk-in transactions
  MOCK_WALK_IN_TRANSACTIONS.forEach((w: WalkInTransaction) => {
    const matches =
      (w.agentId && w.agentId.toLowerCase() === cleanAgentId) ||
      (w.agentName && w.agentName.toLowerCase().includes(cleanAgentName));

    if (matches && !seenRefs.has(w.reference)) {
      seenRefs.add(w.reference);
      const rawDate = w.transactionTime || '2026-09-28T10:00:00+02:00';
      const d = new Date(rawDate);
      const rawTimestamp = isNaN(d.getTime()) ? Date.now() : d.getTime();

      aggregated.push({
        id: w.id || w.reference,
        type: `Walk-In ${w.transactionType || 'Transaction'}`,
        reference: w.reference,
        description: `Walk-in ${w.transactionType} for customer (${w.customerPhone}) via ${w.vendor || 'Agency'}`,
        amount: w.amount,
        formattedDateTime: formatAgentDateTime(rawDate),
        rawTimestamp,
        status: w.status || 'Completed',
      });
    }
  });

  // 3. Live Pickup operations
  MOCK_LIVE_PICKUP_OPERATIONS.forEach((p: PickupRequest) => {
    const matches =
      (p.agentId && p.agentId.toLowerCase() === cleanAgentId) ||
      (p.agentName && p.agentName.toLowerCase().includes(cleanAgentName));

    if (matches && !seenRefs.has(p.id)) {
      seenRefs.add(p.id);
      const rawDate = p.timestamp || p.createdAt || '2026-09-28T11:00:00+02:00';
      const d = new Date(rawDate);
      const rawTimestamp = isNaN(d.getTime()) ? Date.now() : d.getTime();

      aggregated.push({
        id: p.id,
        type: 'Pickup Fulfillment',
        reference: p.id,
        description: `Cash withdrawal pickup request for ${p.customerName || 'Customer'}`,
        amount: p.amount,
        formattedDateTime: formatAgentDateTime(rawDate),
        rawTimestamp,
        status: p.status || 'In Progress',
      });
    }
  });

  // 4. Cash / Float Requests
  MOCK_CASH_FLOAT_REQUESTS.forEach((c: CashFloatRequest) => {
    const matches =
      (c.agentId && c.agentId.toLowerCase() === cleanAgentId) ||
      (c.agentName && c.agentName.toLowerCase().includes(cleanAgentName));

    if (matches && !seenRefs.has(c.reference)) {
      seenRefs.add(c.reference);
      const rawDate = c.requestedAt || '2026-09-28T09:45:00+02:00';
      const d = new Date(rawDate);
      const rawTimestamp = isNaN(d.getTime()) ? Date.now() : d.getTime();

      aggregated.push({
        id: c.id || c.reference,
        type: 'Cash / Float Request',
        reference: c.reference,
        description: `${c.requestType || 'Float'} request (${c.reason || 'Operational float'})`,
        amount: c.amount,
        formattedDateTime: formatAgentDateTime(rawDate),
        rawTimestamp,
        status: c.status || 'Approved',
      });
    }
  });

  // 5. Agent to Agent Liquidity
  MOCK_AGENT_LIQUIDITY_REQUESTS.forEach((a: AgentToAgentRequest) => {
    const matches =
      (a.requestingAgentId && a.requestingAgentId.toLowerCase() === cleanAgentId) ||
      (a.matchedAgent && a.matchedAgent.id && a.matchedAgent.id.toLowerCase() === cleanAgentId) ||
      (a.requestingAgentName && a.requestingAgentName.toLowerCase().includes(cleanAgentName));

    if (matches && !seenRefs.has(a.reference)) {
      seenRefs.add(a.reference);
      const rawDate = a.requestedAt || '2026-09-28T08:30:00+02:00';
      const d = new Date(rawDate);
      const rawTimestamp = isNaN(d.getTime()) ? Date.now() : d.getTime();

      aggregated.push({
        id: a.id || a.reference,
        type: 'Agent-to-Agent Liquidity',
        reference: a.reference,
        description: `Liquidity rebalance request (${a.requestType})`,
        amount: a.amount,
        formattedDateTime: formatAgentDateTime(rawDate),
        rawTimestamp,
        status: a.status || 'Completed',
      });
    }
  });

  // 6. Fill with chronological historical tenure records
  const generatedHistory = generateHistoricalRecordsForAgent(agent);
  generatedHistory.forEach((item) => {
    if (!seenRefs.has(item.reference)) {
      seenRefs.add(item.reference);
      aggregated.push(item);
    }
  });

  // Sort newest to oldest
  aggregated.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

  return aggregated;
}
