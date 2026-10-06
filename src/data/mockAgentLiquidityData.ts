import {
  AgentToAgentRequest,
  AgentToAgentStatus,
  AgentToAgentStatusSummary,
} from '../types/admin';

// Target design sample data for 06 October 2026 as required by TellerBud specifications:
export const DESIGN_SAMPLE_BIZ_CONFIG: Array<{
  businessId: string;
  businessName: string;
  city: string;
  matching: number;
  agentMatched: number; // Internally mapped, aggregated into In Progress
  inProgress: number;
  completed: number;
  noAgent: number;
  expired: number;
  cancelled: number;
}> = [
  {
    businessId: 'TB-BIZ-000001',
    businessName: 'Lusaka Central Express Agency',
    city: 'Lusaka',
    matching: 2,
    agentMatched: 1,
    inProgress: 2,
    completed: 6,
    noAgent: 1,
    expired: 1,
    cancelled: 1,
  },
  {
    businessId: 'TB-BIZ-000002',
    businessName: 'Kabwata Market Agency',
    city: 'Lusaka',
    matching: 1,
    agentMatched: 1,
    inProgress: 1,
    completed: 4,
    noAgent: 1,
    expired: 0,
    cancelled: 1,
  },
  {
    businessId: 'TB-BIZ-000003',
    businessName: 'Copperbelt Financial Services',
    city: 'Kitwe',
    matching: 2,
    agentMatched: 0,
    inProgress: 2,
    completed: 6,
    noAgent: 1,
    expired: 1,
    cancelled: 0,
  },
  {
    businessId: 'TB-BIZ-000004',
    businessName: 'Copperbelt Liquidity Hub',
    city: 'Kitwe',
    matching: 1,
    agentMatched: 0,
    inProgress: 1,
    completed: 3,
    noAgent: 1,
    expired: 0,
    cancelled: 1,
  },
  {
    businessId: 'TB-BIZ-000005',
    businessName: 'Ndola Copperbelt Agency',
    city: 'Ndola',
    matching: 1,
    agentMatched: 1,
    inProgress: 1,
    completed: 5,
    noAgent: 0,
    expired: 1,
    cancelled: 1,
  },
  {
    businessId: 'TB-BIZ-000006',
    businessName: 'Livingstone Tourist Kiosk Agency',
    city: 'Livingstone',
    matching: 0,
    agentMatched: 0,
    inProgress: 1,
    completed: 4,
    noAgent: 0,
    expired: 1,
    cancelled: 0,
  },
  {
    businessId: 'TB-BIZ-000007',
    businessName: 'Chipata Eastern Financial Agency',
    city: 'Chipata',
    matching: 1,
    agentMatched: 0,
    inProgress: 1,
    completed: 4,
    noAgent: 1,
    expired: 0,
    cancelled: 1,
  },
  {
    businessId: 'TB-BIZ-000008',
    businessName: 'Kabwe Central Agency',
    city: 'Kabwe',
    matching: 1,
    agentMatched: 0,
    inProgress: 1,
    completed: 2,
    noAgent: 0,
    expired: 0,
    cancelled: 1,
  },
];

const AGENT_NAMES = [
  'Natasha Zulu',
  'Kelvin Phiri',
  'Brian Lungu',
  'Faith Mwewa',
  'Joseph Kaunda',
  'Mwamba Musonda',
  'Kondwani Banda',
  'Alice Tembo',
  'Patrick Mwanza',
  'Memory Chanda',
  'Bupe Chisanga',
  'Peter Daka',
  'Chilufya Mumba',
  'Ruth Bwalya',
  'Elijah Sakala',
];

function generateDateRecords(dateIso: string, isDesignTarget = false): AgentToAgentRequest[] {
  const records: AgentToAgentRequest[] = [];
  let reqSeq = 100;

  DESIGN_SAMPLE_BIZ_CONFIG.forEach((biz, bizIdx) => {
    // Generate counts based on configuration
    const statusCounts: Record<AgentToAgentStatus, number> = isDesignTarget
      ? {
          Matching: biz.matching,
          'Agent Matched': biz.agentMatched,
          'In Progress': biz.inProgress,
          Completed: biz.completed,
          'No Agent Available': biz.noAgent,
          Expired: biz.expired,
          Cancelled: biz.cancelled,
        }
      : {
          Matching: Math.max(0, biz.matching - (bizIdx % 2)),
          'Agent Matched': 0,
          'In Progress': Math.max(1, biz.inProgress),
          Completed: Math.max(2, biz.completed - (bizIdx % 3)),
          'No Agent Available': bizIdx % 2 === 0 ? 1 : 0,
          Expired: bizIdx % 3 === 0 ? 1 : 0,
          Cancelled: bizIdx % 4 === 0 ? 1 : 0,
        };

    const statuses = Object.keys(statusCounts) as AgentToAgentStatus[];

    statuses.forEach((st) => {
      const count = statusCounts[st];
      for (let i = 0; i < count; i++) {
        reqSeq++;
        const id = `ATL-${dateIso.replace(/-/g, '')}-${biz.businessId.slice(-3)}-${reqSeq}`;
        const ref = `TB-ATL-${dateIso.replace(/-/g, '').slice(2)}${reqSeq}`;
        const agentName = AGENT_NAMES[(bizIdx * 3 + i) % AGENT_NAMES.length];
        const agentId = `TB-AGT-${1000 + bizIdx * 10 + (i % 6)}`;
        const hour = 8 + ((i * 2 + bizIdx) % 10);
        const minute = (i * 13 + bizIdx * 7) % 60;
        const timeStr = `${dateIso}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+02:00`;
        const isCash = (i + bizIdx) % 2 === 0;
        const amount = 1500 + ((i * 750 + bizIdx * 1200) % 8500);

        const offeredAgent = {
          id: `TB-AGT-${1050 + ((bizIdx + i) % 20)}`,
          name: AGENT_NAMES[(bizIdx + i + 2) % AGENT_NAMES.length],
          business: biz.businessName,
          phone: `+260 97 ${100 + i * 15} ${1000 + i * 20}`,
        };

        const item: AgentToAgentRequest = {
          id,
          reference: ref,
          requestingAgentName: agentName,
          requestingAgentId: agentId,
          requestingAgentPhone: `+260 97 ${200 + bizIdx * 20} ${2000 + i * 30}`,
          requestingAgentBusiness: biz.businessName,
          businessId: biz.businessId,
          requestedFrom: 'Another Agent',
          requestType: isCash ? 'Cash' : 'Float',
          amount,
          requestedAt: timeStr,
          status: st,
          notes: `${isCash ? 'Cash rebalance' : 'Float transfer'} for customer service support`,
          ...(st === 'Matching'
            ? {
                currentOfferedAgent: offeredAgent,
                activeOffer: {
                  offerId: `OFFER-${ref}-1`,
                  requestId: id,
                  offeredAgentId: offeredAgent.id,
                  offeredAgentName: offeredAgent.name,
                  offeredAgentBusiness: offeredAgent.business,
                  offeredAgentPhone: offeredAgent.phone,
                  offerSentAt: timeStr,
                  offerExpiresAt: `${dateIso}T${String(hour).padStart(2, '0')}:${String(minute + 1).padStart(2, '0')}:00+02:00`,
                  responseStatus: 'Awaiting Response',
                },
              }
            : {}),
          ...(st === 'Agent Matched' || st === 'In Progress' || st === 'Completed'
            ? {
                matchedAgent: {
                  id: offeredAgent.id,
                  name: offeredAgent.name,
                  business: offeredAgent.business,
                  phone: offeredAgent.phone,
                  matchedAt: timeStr,
                },
              }
            : {}),
          timeline: [
            {
              id: `TL-${ref}-1`,
              status: 'Request Submitted',
              timestamp: timeStr,
            },
            ...(st !== 'Matching'
              ? [
                  {
                    id: `TL-${ref}-2`,
                    status: st === 'Cancelled' ? 'Cancelled' : st === 'No Agent Available' ? 'No Agent Found' : 'Matched',
                    timestamp: timeStr,
                  },
                ]
              : []),
          ],
        };

        records.push(item);
      }
    });
  });

  return records;
}

// Generate full seed dataset for 2026-10-06 (design target) and historical dates
export const MOCK_AGENT_LIQUIDITY_REQUESTS: AgentToAgentRequest[] = [
  ...generateDateRecords('2026-10-06', true), // Exact 71 records matching requirement specifications
  ...generateDateRecords('2026-10-05', false),
  ...generateDateRecords('2026-10-04', false),
  ...generateDateRecords('2026-10-03', false),
  ...generateDateRecords('2026-10-02', false),
  ...generateDateRecords('2026-10-01', false),
  ...generateDateRecords('2026-09-30', false),
  ...generateDateRecords('2026-09-29', false),
];

/**
 * Derives status summary across Agent-to-Agent requests.
 * Internally aggregates Agent Matched into inProgress when displayed in revised UI.
 */
export function deriveAgentLiquidityStatusSummary(
  items: AgentToAgentRequest[]
): AgentToAgentStatusSummary {
  const summary: AgentToAgentStatusSummary = {
    all: items.length,
    matching: 0,
    agentMatched: 0,
    inProgress: 0,
    completed: 0,
    noAgentAvailable: 0,
    expired: 0,
    cancelled: 0,
  };

  for (const item of items) {
    switch (item.status) {
      case 'Matching':
        summary.matching++;
        break;
      case 'Agent Matched':
        summary.agentMatched++;
        break;
      case 'In Progress':
        summary.inProgress++;
        break;
      case 'Completed':
        summary.completed++;
        break;
      case 'No Agent Available':
        summary.noAgentAvailable++;
        break;
      case 'Expired':
        summary.expired++;
        break;
      case 'Cancelled':
        summary.cancelled++;
        break;
    }
  }

  return summary;
}
