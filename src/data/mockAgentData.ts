import { AgentRecord, AgentStatusSummary, AgentSortField, AgentSortDirection } from '../types/admin';

export const MOCK_AGENTS: AgentRecord[] = [
  // =========================================================================
  // Lusaka Central Express Agency (BIZ-LUS-001) - 8 Agents
  // Breakdown:
  // - Total: 8
  // - Online: 6 (Assigned: 2, Available: 4)
  // - Offline: 2
  // - Attendance: Checked In: 5, Late: 1, Absent: 1, Not Checked In: 1
  // =========================================================================
  {
    id: 'TB-AGT-1024',
    name: 'Kelvin Phiri',
    phone: '+260 97 234 5678',
    avatarInitials: 'KP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    availability: 'Assigned',
    assignment: 'Pickup',
    attendance: 'Checked In',
    checkInTime: '07:45 AM',
    lastActive: 'Today, 11:15 AM',
    accountStatus: 'Active',
    cashPosition: 12400.0,
    floatPosition: 18500.0,
    cashFloatRequestCount: 4,
    walkInTransactionCount: 14,
    joinedDate: '2025-11-10',
    recentActivity: [
      {
        id: 'ACT-KP-1',
        type: 'Pickup Fulfillment',
        description: 'Completed customer cash withdrawal pickup for Ruth Banda',
        timestamp: 'Today, 11:15 AM',
        amount: 2500.0,
        reference: 'TB-REQ-1048',
        status: 'Completed',
      },
      {
        id: 'ACT-KP-2',
        type: 'Cash / Float Request',
        description: 'Requested mobile money float replenishment from Business Owner',
        timestamp: 'Today, 10:45 AM',
        amount: 8000.0,
        reference: 'TB-CFR-5001',
        status: 'Pending Review',
      },
      {
        id: 'ACT-KP-3',
        type: 'Walk-In Transaction',
        description: 'Processed MTN mobile money cash withdrawal',
        timestamp: 'Today, 09:30 AM',
        amount: 1800.0,
        reference: 'TB-WLK-3302',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TB-AGT-1062',
    name: 'Natasha Zulu',
    phone: '+260 97 556 7890',
    avatarInitials: 'NZ',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    availability: 'Assigned',
    assignment: 'Pickup',
    attendance: 'Checked In',
    checkInTime: '07:50 AM',
    lastActive: 'Today, 11:15 AM',
    accountStatus: 'Active',
    cashPosition: 8900.0,
    floatPosition: 14200.0,
    cashFloatRequestCount: 3,
    walkInTransactionCount: 22,
    joinedDate: '2025-12-05',
    recentActivity: [
      {
        id: 'ACT-NZ-1',
        type: 'Pickup Fulfillment',
        description: 'Assisting customer Grace Tembo on active service',
        timestamp: 'Today, 11:35 AM',
        amount: 3750.0,
        reference: 'TB-REQ-1050',
        status: 'In Progress',
      },
      {
        id: 'ACT-NZ-2',
        type: 'Cash / Float Request',
        description: 'Counter float cash approved by Business Owner',
        timestamp: 'Today, 09:45 AM',
        amount: 5000.0,
        reference: 'TB-CFR-5020',
        status: 'Approved',
      },
      {
        id: 'ACT-NZ-3',
        type: 'Walk-In Purchase',
        description: 'Processed Airtel utility bill purchase',
        timestamp: 'Today, 08:50 AM',
        amount: 650.0,
        reference: 'TB-WLK-3307',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TB-AGT-1050',
    name: 'Faith Mwewa',
    phone: '+260 97 456 7890',
    avatarInitials: 'FM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    availability: 'Available',
    assignment: 'None',
    attendance: 'Checked In',
    checkInTime: '07:55 AM',
    lastActive: 'Today, 10:48 AM',
    accountStatus: 'Active',
    cashPosition: 15200.0,
    floatPosition: 21000.0,
    cashFloatRequestCount: 2,
    walkInTransactionCount: 18,
    joinedDate: '2026-01-15',
    recentActivity: [
      {
        id: 'ACT-FM-1',
        type: 'Walk-In Purchase',
        description: 'Processed Airtel payment transaction',
        timestamp: 'Today, 10:48 AM',
        amount: 950.0,
        reference: 'TB-WLK-3303',
        status: 'Completed',
      },
      {
        id: 'ACT-FM-2',
        type: 'Agency Float Transfer',
        description: 'Agency float allocation confirmed',
        timestamp: 'Today, 10:05 AM',
        amount: 2500.0,
        reference: 'TB-LDG-9021',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TB-AGT-1055',
    name: 'Brian Lungu',
    phone: '+260 97 678 9012',
    avatarInitials: 'BL',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    availability: 'Available',
    assignment: 'None',
    attendance: 'Checked In',
    checkInTime: '08:00 AM',
    lastActive: 'Today, 10:30 AM',
    accountStatus: 'Active',
    cashPosition: 9500.0,
    floatPosition: 16800.0,
    cashFloatRequestCount: 1,
    walkInTransactionCount: 9,
    joinedDate: '2026-02-01',
    recentActivity: [
      {
        id: 'ACT-BL-1',
        type: 'Cash / Float Request',
        description: 'Float replenishment processing',
        timestamp: 'Today, 08:15 AM',
        amount: 12000.0,
        reference: 'TB-CFR-5021',
        status: 'Processing',
      },
      {
        id: 'ACT-BL-2',
        type: 'Commission Credit',
        description: 'Daily commission credited to agency account',
        timestamp: 'Today, 08:30 AM',
        amount: 420.0,
        reference: 'TB-COM-1102',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TB-AGT-1064',
    name: 'Joseph Kaunda',
    phone: '+260 97 123 4567',
    avatarInitials: 'JK',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    availability: 'Available',
    assignment: 'None',
    attendance: 'Checked In',
    checkInTime: '07:40 AM',
    lastActive: 'Today, 10:15 AM',
    accountStatus: 'Active',
    cashPosition: 18000.0,
    floatPosition: 25500.0,
    cashFloatRequestCount: 3,
    walkInTransactionCount: 16,
    joinedDate: '2025-10-20',
    recentActivity: [
      {
        id: 'ACT-JK-1',
        type: 'Agent-to-Agent Offer',
        description: 'Accepted float exchange offer for peer agent',
        timestamp: 'Today, 10:15 AM',
        amount: 6500.0,
        reference: 'TB-ATL-7001',
        status: 'Active',
      },
      {
        id: 'ACT-JK-2',
        type: 'Cash / Float Fulfilment',
        description: 'Manual cash float fulfilled by Business Owner',
        timestamp: 'Today, 07:20 AM',
        amount: 6500.0,
        reference: 'TB-CFR-5022',
        status: 'Fulfilled',
      },
    ],
  },
  {
    id: 'TB-AGT-1070',
    name: 'Mwamba Musonda',
    phone: '+260 97 889 0123',
    avatarInitials: 'MM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    availability: 'Available',
    assignment: 'None',
    attendance: 'Checked In',
    checkInTime: '08:45 AM',
    lastActive: 'Today, 09:50 AM',
    accountStatus: 'Active',
    cashPosition: 6400.0,
    floatPosition: 11000.0,
    cashFloatRequestCount: 1,
    walkInTransactionCount: 7,
    joinedDate: '2026-03-01',
    recentActivity: [
      {
        id: 'ACT-MM-1',
        type: 'Attendance Check-In',
        description: 'Checked in at Lusaka Central counter',
        timestamp: 'Today, 08:45 AM',
        status: 'Logged',
      },
      {
        id: 'ACT-MM-2',
        type: 'Walk-In Deposit',
        description: 'Processed FNB mobile cash deposit',
        timestamp: 'Today, 09:50 AM',
        amount: 1500.0,
        reference: 'TB-WLK-3309',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TB-AGT-1078',
    name: 'Kondwani Banda',
    phone: '+260 96 334 5678',
    avatarInitials: 'KB',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    availability: 'Offline',
    assignment: 'None',
    attendance: 'Not Checked In',
    checkInTime: undefined,
    lastActive: 'Yesterday, 05:30 PM',
    accountStatus: 'Active',
    cashPosition: 0.0,
    floatPosition: 0.0,
    cashFloatRequestCount: 0,
    walkInTransactionCount: 0,
    joinedDate: '2026-01-05',
    recentActivity: [
      {
        id: 'ACT-KB-1',
        type: 'Roster Schedule',
        description: 'No active attendance session recorded today',
        timestamp: 'Yesterday, 05:30 PM',
        status: 'Logged',
      },
    ],
  },
  {
    id: 'TB-AGT-1082',
    name: 'Thandiwe Phiri',
    phone: '+260 95 445 6789',
    avatarInitials: 'TP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    availability: 'Offline',
    assignment: 'None',
    attendance: 'Not Checked In',
    checkInTime: undefined,
    lastActive: 'Yesterday, 05:45 PM',
    accountStatus: 'Active',
    cashPosition: 0.0,
    floatPosition: 0.0,
    cashFloatRequestCount: 0,
    walkInTransactionCount: 0,
    joinedDate: '2026-02-15',
    recentActivity: [
      {
        id: 'ACT-TP-1',
        type: 'Check-Out',
        description: 'Checked out yesterday',
        timestamp: 'Yesterday, 05:45 PM',
        status: 'Logged',
      },
    ],
  },
];

/**
 * Calculates dynamic status counts from a filtered list of agents.
 * Data consistency rule:
 * - Online + Offline = Total Agents
 * - Available + Assigned = Online
 */
export function deriveAgentStatusSummary(agents: AgentRecord[]): AgentStatusSummary {
  const all = agents.length;
  const assigned = agents.filter((a) => a.availability === 'Assigned').length;
  const available = agents.filter((a) => a.availability === 'Available').length;
  const online = assigned + available;
  const offline = agents.filter((a) => a.availability === 'Offline').length;

  return {
    all,
    online,
    available,
    assigned,
    offline,
  };
}

/**
 * Sorts agents by operational priority:
 * 1. Assigned
 * 2. Available
 * 3. Offline
 * Within each group, sorts by most recent activity.
 */
export function sortAgentsByOperationalPriority(
  agents: AgentRecord[],
  sortField: AgentSortField = 'operationalPriority',
  sortDirection: AgentSortDirection = 'asc'
): AgentRecord[] {
  const priorityMap: Record<string, number> = {
    Assigned: 1,
    Available: 2,
    Offline: 3,
  };

  return [...agents].sort((a, b) => {
    if (sortField === 'operationalPriority') {
      const pA = priorityMap[a.availability] || 99;
      const pB = priorityMap[b.availability] || 99;
      if (pA !== pB) {
        return sortDirection === 'asc' ? pA - pB : pB - pA;
      }
      // Within same group, sort alphabetically or by active status
      return a.name.localeCompare(b.name);
    }

    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    return 0;
  });
}
