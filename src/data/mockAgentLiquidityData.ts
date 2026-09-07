import {
  AgentToAgentRequest,
  AgentToAgentStatusSummary,
} from '../types/admin';

export const MOCK_AGENT_LIQUIDITY_REQUESTS: AgentToAgentRequest[] = [
  // ==========================================
  // 1. MATCHING (4 items)
  // ==========================================
  {
    id: 'ATL-001',
    reference: 'TB-ATL-7001',
    requestingAgentName: 'Natasha Zulu',
    requestingAgentId: 'TB-AGT-1062',
    requestingAgentPhone: '+260 97 556 7890',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 6500.0,
    requestedAt: '2026-08-31T12:05:00+02:00',
    status: 'Matching',
    notes: 'Float required for afternoon customer transactions',
    currentOfferedAgent: {
      id: 'TB-AGT-1064', name: 'Joseph Kaunda',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 123 4567',
    },
    activeOffer: {
      offerId: 'OFFER-ATL-7001-1',
      requestId: 'ATL-001',
      offeredAgentId: 'TB-AGT-1064', offeredAgentName: 'Joseph Kaunda',
      offeredAgentBusiness: 'Lusaka Central Express Agency',
      offeredAgentPhone: '+260 97 123 4567',
      offerSentAt: '2026-08-31T12:05:05+02:00',
      offerExpiresAt: '2026-08-31T12:05:35+02:00',
      responseStatus: 'Awaiting Response',
    },
    timeline: [
      {
        id: 'TL-ATL-7001-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T12:05:00+02:00',
      },
      {
        id: 'TL-ATL-7001-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T12:05:02+02:00',
      },
      {
        id: 'TL-ATL-7001-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T12:05:05+02:00',
      },
    ],
  },
  {
    id: 'ATL-015',
    reference: 'TB-ATL-7015',
    requestingAgentName: 'Kelvin Phiri',
    requestingAgentId: 'TB-AGT-1024',
    requestingAgentPhone: '+260 97 234 5678',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 4000.0,
    requestedAt: '2026-08-31T11:30:00+02:00',
    status: 'Agent Matched',
    notes: 'Cash exchange for mobile float with nearby merchant agent',
    matchedAgent: {
      id: 'TB-AGT-1050', name: 'Faith Mwewa',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 890 2345',
      matchedAt: '2026-08-31T11:30:24+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7015-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:30:00+02:00',
      },
      {
        id: 'TL-ATL-7015-2',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:30:24+02:00',
        note: 'Accepted by Faith Mwewa',
      },
    ],
  },
  {
    id: 'ATL-016',
    reference: 'TB-ATL-7016',
    requestingAgentName: 'Brian Lungu',
    requestingAgentId: 'TB-AGT-1055',
    requestingAgentPhone: '+260 97 678 9012',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 8500.0,
    requestedAt: '2026-08-31T10:15:00+02:00',
    status: 'Completed',
    notes: 'Peer float rebalance successfully verified and completed',
    matchedAgent: {
      id: 'TB-AGT-1070', name: 'Mwamba Musonda',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 555 4321',
      matchedAt: '2026-08-31T10:15:20+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7016-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T10:15:00+02:00',
      },
      {
        id: 'TL-ATL-7016-2',
        status: 'Agent Matched',
        timestamp: '2026-08-31T10:15:20+02:00',
      },
      {
        id: 'TL-ATL-7016-3',
        status: 'In Progress',
        timestamp: '2026-08-31T10:16:00+02:00',
      },
      {
        id: 'TL-ATL-7016-4',
        status: 'Completed',
        timestamp: '2026-08-31T10:22:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-017',
    reference: 'TB-ATL-7017',
    requestingAgentName: 'Kondwani Banda',
    requestingAgentId: 'TB-AGT-1078',
    requestingAgentPhone: '+260 97 890 1234',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 5000.0,
    requestedAt: '2026-08-31T09:40:00+02:00',
    status: 'In Progress',
    notes: 'Peer float transfer initiated and in transit',
    matchedAgent: {
      id: 'TB-AGT-1070', name: 'Mwamba Musonda',
      business: 'Lusaka Central Express Agency',
      phone: '+260 96 789 0123',
      matchedAt: '2026-08-31T09:40:18+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7017-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T09:40:00+02:00',
      },
      {
        id: 'TL-ATL-7017-2',
        status: 'Agent Matched',
        timestamp: '2026-08-31T09:40:18+02:00',
      },
      {
        id: 'TL-ATL-7017-3',
        status: 'In Progress',
        timestamp: '2026-08-31T09:41:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-002',
    reference: 'TB-ATL-7002',
    requestingAgentName: 'Thandiwe Phiri',
    requestingAgentId: 'TB-AGT-1082',
    requestingAgentPhone: '+260 97 901 2345',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 4200.0,
    requestedAt: '2026-08-31T12:08:00+02:00',
    status: 'Matching',
    notes: 'Physical cash needed for urgent walk-in customer payout',
    currentOfferedAgent: {
      id: 'TB-AGT-1055', name: 'Brian Lungu',
      business: 'Lusaka Central Express Agency',
      phone: '+260 96 999 1122',
    },
    activeOffer: {
      offerId: 'OFFER-ATL-7002-1',
      requestId: 'ATL-002',
      offeredAgentId: 'TB-AGT-1055', offeredAgentName: 'Brian Lungu',
      offeredAgentBusiness: 'Lusaka Central Express Agency',
      offeredAgentPhone: '+260 96 999 1122',
      offerSentAt: '2026-08-31T12:08:04+02:00',
      offerExpiresAt: '2026-08-31T12:08:34+02:00',
      responseStatus: 'Awaiting Response',
    },
    timeline: [
      {
        id: 'TL-ATL-7002-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T12:08:00+02:00',
      },
      {
        id: 'TL-ATL-7002-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T12:08:02+02:00',
      },
      {
        id: 'TL-ATL-7002-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T12:08:04+02:00',
      },
    ],
  },
  {
    id: 'ATL-003',
    reference: 'TB-ATL-7003',
    requestingAgentName: 'Mwamba Musonda',
    requestingAgentId: 'TB-AGT-1070',
    requestingAgentPhone: '+260 97 789 0123',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 12000.0,
    requestedAt: '2026-08-31T12:12:00+02:00',
    status: 'Matching',
    notes: 'High-volume float demand from market traders',
    timeline: [
      {
        id: 'TL-ATL-7003-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T12:12:00+02:00',
      },
      {
        id: 'TL-ATL-7003-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T12:12:03+02:00',
      },
    ],
  },
  {
    id: 'ATL-004',
    reference: 'TB-ATL-7004',
    requestingAgentName: 'Faith Mwewa',
    requestingAgentId: 'TB-AGT-1050',
    requestingAgentPhone: '+260 97 456 7890',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 3500.0,
    requestedAt: '2026-08-31T12:15:00+02:00',
    status: 'Matching',
    notes: 'Physical cash replenishment for lunch hour withdrawals',
    currentOfferedAgent: {
      id: 'TB-AGT-1070', name: 'Mwamba Musonda',
      business: 'Lusaka Central Express Agency',
      phone: '+260 95 111 2233',
    },
    activeOffer: {
      offerId: 'OFFER-ATL-7004-1',
      requestId: 'ATL-004',
      offeredAgentId: 'TB-AGT-1070', offeredAgentName: 'Mwamba Musonda',
      offeredAgentBusiness: 'Lusaka Central Express Agency',
      offeredAgentPhone: '+260 95 111 2233',
      offerSentAt: '2026-08-31T12:15:04+02:00',
      offerExpiresAt: '2026-08-31T12:15:34+02:00',
      responseStatus: 'Awaiting Response',
    },
    timeline: [
      {
        id: 'TL-ATL-7004-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T12:15:00+02:00',
      },
      {
        id: 'TL-ATL-7004-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T12:15:02+02:00',
      },
      {
        id: 'TL-ATL-7004-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T12:15:04+02:00',
      },
    ],
  },

  // ==========================================
  // 2. AGENT MATCHED (3 items)
  // ==========================================
  {
    id: 'ATL-005',
    reference: 'TB-ATL-7005',
    requestingAgentName: 'Kelvin Phiri',
    requestingAgentId: 'TB-AGT-1024',
    requestingAgentPhone: '+260 97 234 5678',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 7500.0,
    requestedAt: '2026-08-31T11:45:00+02:00',
    status: 'Agent Matched',
    notes: 'Mobile money float exchange',
    matchedAgent: {
      id: 'TB-AGT-1062', name: 'Natasha Zulu',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 666 7788',
      matchedAt: '2026-08-31T11:45:22+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7005-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:45:00+02:00',
      },
      {
        id: 'TL-ATL-7005-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:45:02+02:00',
      },
      {
        id: 'TL-ATL-7005-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:45:05+02:00',
      },
      {
        id: 'TL-ATL-7005-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:45:22+02:00',
      },
    ],
  },
  {
    id: 'ATL-006',
    reference: 'TB-ATL-7006',
    requestingAgentName: 'Faith Mwewa',
    requestingAgentId: 'TB-AGT-1050',
    requestingAgentPhone: '+260 97 456 7890',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 5000.0,
    requestedAt: '2026-08-31T11:50:00+02:00',
    status: 'Agent Matched',
    notes: 'Cash needed for customer remittance payout',
    matchedAgent: {
      id: 'TB-AGT-1064', name: 'Joseph Kaunda',
      business: 'Lusaka Central Express Agency',
      phone: '+260 96 222 3344',
      matchedAt: '2026-08-31T11:50:18+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7006-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:50:00+02:00',
      },
      {
        id: 'TL-ATL-7006-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:50:02+02:00',
      },
      {
        id: 'TL-ATL-7006-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:50:05+02:00',
      },
      {
        id: 'TL-ATL-7006-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:50:18+02:00',
      },
    ],
  },
  {
    id: 'ATL-007',
    reference: 'TB-ATL-7007',
    requestingAgentName: 'Brian Lungu',
    requestingAgentId: 'TB-AGT-1055',
    requestingAgentPhone: '+260 97 678 9012',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 9000.0,
    requestedAt: '2026-08-31T11:55:00+02:00',
    status: 'Agent Matched',
    notes: 'Float swap for pending bulk customer airtime & bill pay',
    matchedAgent: {
      id: 'TB-AGT-1078', name: 'Kondwani Banda',
      business: 'Lusaka Central Express Agency',
      phone: '+260 95 444 5566',
      matchedAt: '2026-08-31T11:55:25+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7007-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:55:00+02:00',
      },
      {
        id: 'TL-ATL-7007-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:55:02+02:00',
      },
      {
        id: 'TL-ATL-7007-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:55:06+02:00',
      },
      {
        id: 'TL-ATL-7007-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:55:25+02:00',
      },
    ],
  },

  // ==========================================
  // 3. IN PROGRESS (3 items)
  // ==========================================
  {
    id: 'ATL-008',
    reference: 'TB-ATL-7008',
    requestingAgentName: 'Thandiwe Phiri',
    requestingAgentId: 'TB-AGT-1082',
    requestingAgentPhone: '+260 97 901 2345',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 10000.0,
    requestedAt: '2026-08-31T11:30:00+02:00',
    status: 'In Progress',
    notes: 'Float transfer in progress between peer agent terminals',
    matchedAgent: {
      id: 'TB-AGT-1070', name: 'Mwamba Musonda',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 888 3322',
      matchedAt: '2026-08-31T11:30:20+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7008-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:30:00+02:00',
      },
      {
        id: 'TL-ATL-7008-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:30:03+02:00',
      },
      {
        id: 'TL-ATL-7008-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:30:05+02:00',
      },
      {
        id: 'TL-ATL-7008-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:30:20+02:00',
      },
      {
        id: 'TL-ATL-7008-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T11:31:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-009',
    reference: 'TB-ATL-7009',
    requestingAgentName: 'Kelvin Phiri',
    requestingAgentId: 'TB-AGT-1024',
    requestingAgentPhone: '+260 97 234 5678',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 8500.0,
    requestedAt: '2026-08-31T11:35:00+02:00',
    status: 'In Progress',
    notes: 'Physical cash exchange at designated secure meeting zone',
    matchedAgent: {
      id: 'TB-AGT-1062', name: 'Natasha Zulu',
      business: 'Lusaka Central Express Agency',
      phone: '+260 95 999 4433',
      matchedAt: '2026-08-31T11:35:28+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7009-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:35:00+02:00',
      },
      {
        id: 'TL-ATL-7009-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:35:03+02:00',
      },
      {
        id: 'TL-ATL-7009-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:35:06+02:00',
      },
      {
        id: 'TL-ATL-7009-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:35:28+02:00',
      },
      {
        id: 'TL-ATL-7009-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T11:36:15+02:00',
      },
    ],
  },
  {
    id: 'ATL-010',
    reference: 'TB-ATL-7010',
    requestingAgentName: 'Thandiwe Phiri',
    requestingAgentId: 'TB-AGT-1082',
    requestingAgentPhone: '+260 97 901 2345',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 4800.0,
    requestedAt: '2026-08-31T11:40:00+02:00',
    status: 'In Progress',
    notes: 'Peer float transfer underway',
    matchedAgent: {
      id: 'TB-AGT-1078', name: 'Kondwani Banda',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 111 5566',
      matchedAt: '2026-08-31T11:40:15+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7010-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:40:00+02:00',
      },
      {
        id: 'TL-ATL-7010-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:40:02+02:00',
      },
      {
        id: 'TL-ATL-7010-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:40:04+02:00',
      },
      {
        id: 'TL-ATL-7010-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:40:15+02:00',
      },
      {
        id: 'TL-ATL-7010-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T11:41:00+02:00',
      },
    ],
  },

  // ==========================================
  // 4. COMPLETED (8 items)
  // ==========================================
  {
    id: 'ATL-011',
    reference: 'TB-ATL-7011',
    requestingAgentName: 'Kelvin Phiri',
    requestingAgentId: 'TB-AGT-1024',
    requestingAgentPhone: '+260 97 234 5678',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 15000.0,
    requestedAt: '2026-08-31T10:15:00+02:00',
    status: 'Completed',
    notes: 'Morning liquidity exchange fulfilled via Woodlands agent',
    matchedAgent: {
      id: 'TB-AGT-1062', name: 'Natasha Zulu',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 345 6789',
      matchedAt: '2026-08-31T10:15:19+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7011-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T10:15:00+02:00',
      },
      {
        id: 'TL-ATL-7011-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T10:15:02+02:00',
      },
      {
        id: 'TL-ATL-7011-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T10:15:05+02:00',
      },
      {
        id: 'TL-ATL-7011-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T10:15:19+02:00',
      },
      {
        id: 'TL-ATL-7011-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T10:16:00+02:00',
      },
      {
        id: 'TL-ATL-7011-6',
        status: 'Completed',
        timestamp: '2026-08-31T10:22:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-012',
    reference: 'TB-ATL-7012',
    requestingAgentName: 'Joseph Kaunda',
    requestingAgentId: 'TB-AGT-1064',
    requestingAgentPhone: '+260 97 123 4567',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 6000.0,
    requestedAt: '2026-08-31T10:30:00+02:00',
    status: 'Completed',
    notes: 'Physical cash handover verified',
    matchedAgent: {
      id: 'TB-AGT-1082', name: 'Thandiwe Phiri',
      business: 'Lusaka Central Express Agency',
      phone: '+260 96 456 7890',
      matchedAt: '2026-08-31T10:30:15+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7012-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T10:30:00+02:00',
      },
      {
        id: 'TL-ATL-7012-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T10:30:02+02:00',
      },
      {
        id: 'TL-ATL-7012-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T10:30:04+02:00',
      },
      {
        id: 'TL-ATL-7012-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T10:30:15+02:00',
      },
      {
        id: 'TL-ATL-7012-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T10:31:00+02:00',
      },
      {
        id: 'TL-ATL-7012-6',
        status: 'Completed',
        timestamp: '2026-08-31T10:42:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-013',
    reference: 'TB-ATL-7013',
    requestingAgentName: 'Brian Lungu',
    requestingAgentId: 'TB-AGT-1055',
    requestingAgentPhone: '+260 97 678 9012',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 8000.0,
    requestedAt: '2026-08-31T10:40:00+02:00',
    status: 'Completed',
    notes: 'Peer float confirmed received',
    matchedAgent: {
      id: 'TB-AGT-1024', name: 'Kelvin Phiri',
      business: 'Lusaka Central Express Agency',
      phone: '+260 96 333 4455',
      matchedAt: '2026-08-31T10:40:24+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7013-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T10:40:00+02:00',
      },
      {
        id: 'TL-ATL-7013-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T10:40:03+02:00',
      },
      {
        id: 'TL-ATL-7013-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T10:40:05+02:00',
      },
      {
        id: 'TL-ATL-7013-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T10:40:24+02:00',
      },
      {
        id: 'TL-ATL-7013-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T10:41:00+02:00',
      },
      {
        id: 'TL-ATL-7013-6',
        status: 'Completed',
        timestamp: '2026-08-31T10:48:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-014',
    reference: 'TB-ATL-7014',
    requestingAgentName: 'Mwamba Musonda',
    requestingAgentId: 'TB-AGT-1070',
    requestingAgentPhone: '+260 97 789 0123',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 2500.0,
    requestedAt: '2026-08-31T10:50:00+02:00',
    status: 'Completed',
    notes: 'Physical cash exchange completed',
    matchedAgent: {
      id: 'TB-AGT-1050', name: 'Faith Mwewa',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 890 2345',
      matchedAt: '2026-08-31T10:50:16+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7014-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T10:50:00+02:00',
      },
      {
        id: 'TL-ATL-7014-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T10:50:02+02:00',
      },
      {
        id: 'TL-ATL-7014-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T10:50:05+02:00',
      },
      {
        id: 'TL-ATL-7014-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T10:50:16+02:00',
      },
      {
        id: 'TL-ATL-7014-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T10:51:00+02:00',
      },
      {
        id: 'TL-ATL-7014-6',
        status: 'Completed',
        timestamp: '2026-08-31T11:00:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-015',
    reference: 'TB-ATL-7015',
    requestingAgentName: 'Natasha Zulu',
    requestingAgentId: 'TB-AGT-1062',
    requestingAgentPhone: '+260 97 556 7890',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 11500.0,
    requestedAt: '2026-08-31T11:00:00+02:00',
    status: 'Completed',
    notes: 'Float exchange successful',
    matchedAgent: {
      id: 'TB-AGT-1055', name: 'Brian Lungu',
      business: 'Lusaka Central Express Agency',
      phone: '+260 95 222 3344',
      matchedAt: '2026-08-31T11:00:20+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7015-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:00:00+02:00',
      },
      {
        id: 'TL-ATL-7015-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:00:02+02:00',
      },
      {
        id: 'TL-ATL-7015-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:00:05+02:00',
      },
      {
        id: 'TL-ATL-7015-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:00:20+02:00',
      },
      {
        id: 'TL-ATL-7015-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T11:01:00+02:00',
      },
      {
        id: 'TL-ATL-7015-6',
        status: 'Completed',
        timestamp: '2026-08-31T11:09:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-016',
    reference: 'TB-ATL-7016',
    requestingAgentName: 'Joseph Kaunda',
    requestingAgentId: 'TB-AGT-1064',
    requestingAgentPhone: '+260 97 123 4567',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 4000.0,
    requestedAt: '2026-08-31T11:05:00+02:00',
    status: 'Completed',
    notes: 'Direct cash handover concluded',
    matchedAgent: {
      id: 'TB-AGT-1050', name: 'Faith Mwewa',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 444 5566',
      matchedAt: '2026-08-31T11:05:14+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7016-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:05:00+02:00',
      },
      {
        id: 'TL-ATL-7016-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:05:02+02:00',
      },
      {
        id: 'TL-ATL-7016-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:05:04+02:00',
      },
      {
        id: 'TL-ATL-7016-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:05:14+02:00',
      },
      {
        id: 'TL-ATL-7016-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T11:06:00+02:00',
      },
      {
        id: 'TL-ATL-7016-6',
        status: 'Completed',
        timestamp: '2026-08-31T11:15:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-017',
    reference: 'TB-ATL-7017',
    requestingAgentName: 'Kondwani Banda',
    requestingAgentId: 'TB-AGT-1078',
    requestingAgentPhone: '+260 97 890 1234',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 7200.0,
    requestedAt: '2026-08-31T11:10:00+02:00',
    status: 'Completed',
    notes: 'Float received from Olympia agent',
    matchedAgent: {
      id: 'TB-AGT-1082', name: 'Thandiwe Phiri',
      business: 'Lusaka Central Express Agency',
      phone: '+260 97 555 6677',
      matchedAt: '2026-08-31T11:10:22+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7017-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:10:00+02:00',
      },
      {
        id: 'TL-ATL-7017-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:10:02+02:00',
      },
      {
        id: 'TL-ATL-7017-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:10:05+02:00',
      },
      {
        id: 'TL-ATL-7017-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:10:22+02:00',
      },
      {
        id: 'TL-ATL-7017-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T11:11:00+02:00',
      },
      {
        id: 'TL-ATL-7017-6',
        status: 'Completed',
        timestamp: '2026-08-31T11:18:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-018',
    reference: 'TB-ATL-7018',
    requestingAgentName: 'Mwamba Musonda',
    requestingAgentId: 'TB-AGT-1070',
    requestingAgentPhone: '+260 97 789 0123',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 5500.0,
    requestedAt: '2026-08-31T11:15:00+02:00',
    status: 'Completed',
    notes: 'Cash swap confirmed at Mandevu hub',
    matchedAgent: {
      id: 'TB-AGT-1024', name: 'Kelvin Phiri',
      business: 'Lusaka Central Express Agency',
      phone: '+260 96 777 8899',
      matchedAt: '2026-08-31T11:15:18+02:00',
    },
    timeline: [
      {
        id: 'TL-ATL-7018-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T11:15:00+02:00',
      },
      {
        id: 'TL-ATL-7018-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T11:15:02+02:00',
      },
      {
        id: 'TL-ATL-7018-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T11:15:04+02:00',
      },
      {
        id: 'TL-ATL-7018-4',
        status: 'Agent Matched',
        timestamp: '2026-08-31T11:15:18+02:00',
      },
      {
        id: 'TL-ATL-7018-5',
        status: 'Exchange Started',
        timestamp: '2026-08-31T11:16:00+02:00',
      },
      {
        id: 'TL-ATL-7018-6',
        status: 'Completed',
        timestamp: '2026-08-31T11:24:00+02:00',
      },
    ],
  },

  // ==========================================
  // 5. NO AGENT AVAILABLE (2 items)
  // ==========================================
  {
    id: 'ATL-019',
    reference: 'TB-ATL-7019',
    requestingAgentName: 'Faith Mwewa',
    requestingAgentId: 'TB-AGT-1050',
    requestingAgentPhone: '+260 97 456 7890',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 20000.0,
    requestedAt: '2026-08-31T09:40:00+02:00',
    status: 'No Agent Available',
    notes: 'Large float request exhausted 4 eligible radius candidates without acceptance',
    timeline: [
      {
        id: 'TL-ATL-7019-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T09:40:00+02:00',
      },
      {
        id: 'TL-ATL-7019-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T09:40:02+02:00',
      },
      {
        id: 'TL-ATL-7019-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T09:40:05+02:00',
      },
      {
        id: 'TL-ATL-7019-4',
        status: 'No Agent Available',
        timestamp: '2026-08-31T09:42:30+02:00',
      },
    ],
  },
  {
    id: 'ATL-020',
    reference: 'TB-ATL-7020',
    requestingAgentName: 'Brian Lungu',
    requestingAgentId: 'TB-AGT-1055',
    requestingAgentPhone: '+260 97 678 9012',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 18000.0,
    requestedAt: '2026-08-31T09:55:00+02:00',
    status: 'No Agent Available',
    notes: 'All 3 nearby cash agents declined due to existing low till balance',
    timeline: [
      {
        id: 'TL-ATL-7020-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T09:55:00+02:00',
      },
      {
        id: 'TL-ATL-7020-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T09:55:02+02:00',
      },
      {
        id: 'TL-ATL-7020-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T09:55:05+02:00',
      },
      {
        id: 'TL-ATL-7020-4',
        status: 'No Agent Available',
        timestamp: '2026-08-31T09:57:00+02:00',
      },
    ],
  },

  // ==========================================
  // 6. EXPIRED (2 items)
  // ==========================================
  {
    id: 'ATL-021',
    reference: 'TB-ATL-7021',
    requestingAgentName: 'Joseph Kaunda',
    requestingAgentId: 'TB-AGT-1064',
    requestingAgentPhone: '+260 97 123 4567',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 14000.0,
    requestedAt: '2026-08-31T09:10:00+02:00',
    status: 'Expired',
    notes: 'Request timed out after overall 10-minute discovery lifecycle window',
    timeline: [
      {
        id: 'TL-ATL-7021-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T09:10:00+02:00',
      },
      {
        id: 'TL-ATL-7021-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T09:10:02+02:00',
      },
      {
        id: 'TL-ATL-7021-3',
        status: 'Request Expired',
        timestamp: '2026-08-31T09:20:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-022',
    reference: 'TB-ATL-7022',
    requestingAgentName: 'Mwamba Musonda',
    requestingAgentId: 'TB-AGT-1070',
    requestingAgentPhone: '+260 97 789 0123',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 9500.0,
    requestedAt: '2026-08-31T09:25:00+02:00',
    status: 'Expired',
    notes: 'Request expired prior to exchange confirmation',
    timeline: [
      {
        id: 'TL-ATL-7022-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T09:25:00+02:00',
      },
      {
        id: 'TL-ATL-7022-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T09:25:03+02:00',
      },
      {
        id: 'TL-ATL-7022-3',
        status: 'Request Expired',
        timestamp: '2026-08-31T09:35:00+02:00',
      },
    ],
  },

  // ==========================================
  // 7. CANCELLED (2 items)
  // ==========================================
  {
    id: 'ATL-023',
    reference: 'TB-ATL-7023',
    requestingAgentName: 'Kondwani Banda',
    requestingAgentId: 'TB-AGT-1078',
    requestingAgentPhone: '+260 97 890 1234',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 3000.0,
    requestedAt: '2026-08-31T08:50:00+02:00',
    status: 'Cancelled',
    notes: 'Agent self-cancelled request after customer changed deposit amount',
    timeline: [
      {
        id: 'TL-ATL-7023-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T08:50:00+02:00',
      },
      {
        id: 'TL-ATL-7023-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T08:50:02+02:00',
      },
      {
        id: 'TL-ATL-7023-3',
        status: 'Cancelled',
        timestamp: '2026-08-31T08:51:15+02:00',
      },
    ],
  },
  {
    id: 'ATL-024',
    reference: 'TB-ATL-7024',
    requestingAgentName: 'Thandiwe Phiri',
    requestingAgentId: 'TB-AGT-1082',
    requestingAgentPhone: '+260 97 901 2345',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 6200.0,
    requestedAt: '2026-08-31T09:00:00+02:00',
    status: 'Cancelled',
    notes: 'Cancelled by agent before offer acceptance',
    timeline: [
      {
        id: 'TL-ATL-7024-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T09:00:00+02:00',
      },
      {
        id: 'TL-ATL-7024-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T09:00:03+02:00',
      },
      {
        id: 'TL-ATL-7024-3',
        status: 'Cancelled',
        timestamp: '2026-08-31T09:01:40+02:00',
      },
    ],
  },
  {
    id: 'ATL-025',
    reference: 'TB-ATL-7025',
    requestingAgentName: 'Faith Mwewa',
    requestingAgentId: 'TB-AGT-1050',
    requestingAgentPhone: '+260 97 456 7890',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Float',
    amount: 11000.0,
    requestedAt: '2026-08-31T08:35:00+02:00',
    status: 'No Agent Available',
    notes: 'No regional peer agents available with sufficient float capacity in search radius',
    timeline: [
      {
        id: 'TL-ATL-7025-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T08:35:00+02:00',
      },
      {
        id: 'TL-ATL-7025-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T08:35:02+02:00',
      },
      {
        id: 'TL-ATL-7025-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T08:35:05+02:00',
      },
      {
        id: 'TL-ATL-7025-4',
        status: 'No Agent Available',
        timestamp: '2026-08-31T08:37:30+02:00',
      },
    ],
  },
  {
    id: 'ATL-026',
    reference: 'TB-ATL-7026',
    requestingAgentName: 'Faith Mwewa',
    requestingAgentId: 'TB-AGT-1050',
    requestingAgentPhone: '+260 97 456 7890',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 5500.0,
    requestedAt: '2026-08-31T08:20:00+02:00',
    status: 'Expired',
    notes: 'Cash liquidity offer expired before peer agent confirmation',
    timeline: [
      {
        id: 'TL-ATL-7026-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T08:20:00+02:00',
      },
      {
        id: 'TL-ATL-7026-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T08:20:02+02:00',
      },
      {
        id: 'TL-ATL-7026-3',
        status: 'Offer Sent',
        timestamp: '2026-08-31T08:20:05+02:00',
      },
      {
        id: 'TL-ATL-7026-4',
        status: 'Expired',
        timestamp: '2026-08-31T08:30:00+02:00',
      },
    ],
  },
  {
    id: 'ATL-027',
    reference: 'TB-ATL-7027',
    requestingAgentName: 'Kelvin Phiri',
    requestingAgentId: 'TB-AGT-1024',
    requestingAgentPhone: '+260 97 234 5678',
    requestingAgentBusiness: 'Lusaka Central Express Agency',
    requestedFrom: 'Another Agent',
    requestType: 'Cash',
    amount: 2500.0,
    requestedAt: '2026-08-31T08:05:00+02:00',
    status: 'Cancelled',
    notes: 'Cancelled by requesting agent as float resolved via cash customer deposit',
    timeline: [
      {
        id: 'TL-ATL-7027-1',
        status: 'Request Submitted',
        timestamp: '2026-08-31T08:05:00+02:00',
      },
      {
        id: 'TL-ATL-7027-2',
        status: 'Matching Started',
        timestamp: '2026-08-31T08:05:02+02:00',
      },
      {
        id: 'TL-ATL-7027-3',
        status: 'Cancelled',
        timestamp: '2026-08-31T08:06:12+02:00',
      },
    ],
  },
];

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
