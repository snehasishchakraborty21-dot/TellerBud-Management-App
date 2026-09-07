import {
  AttendanceRecord,
  AttendanceMetrics,
  AttendanceFilters,
  AttendanceStatusType,
  EndOfDayRecord,
  EndOfDayMetrics,
  EndOfDayFilters,
} from '../types/attendance';

export const TODAY_DATE = '01-09-2026';

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'ATT-20260901-1024',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    avatarInitials: 'KP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '01-09-2026',
    checkInTime: '07:45 AM',
    checkOutTime: undefined,
    checkedInDuration: 'In Progress',
    totalHours: 'In Progress',
    status: 'Checked In',
    assignment: 'Pickup',
    lastActive: 'Today, 11:15 AM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:45 AM' },
    ],
  },
  {
    id: 'ATT-20260901-1062',
    agentId: 'TB-AGT-1062',
    agentName: 'Natasha Zulu',
    agentPhone: '+260 97 556 7890',
    avatarInitials: 'NZ',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '01-09-2026',
    checkInTime: '07:50 AM',
    checkOutTime: undefined,
    checkedInDuration: 'In Progress',
    totalHours: 'In Progress',
    status: 'Checked In',
    assignment: 'Pickup',
    lastActive: 'Today, 11:15 AM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:50 AM' },
    ],
  },
  {
    id: 'ATT-20260901-1050',
    agentId: 'TB-AGT-1050',
    agentName: 'Faith Mwewa',
    agentPhone: '+260 97 456 7890',
    avatarInitials: 'FM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '01-09-2026',
    checkInTime: '07:55 AM',
    checkOutTime: undefined,
    checkedInDuration: 'In Progress',
    totalHours: 'In Progress',
    status: 'Checked In',
    assignment: 'None',
    lastActive: 'Today, 10:48 AM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:55 AM' },
    ],
  },
  {
    id: 'ATT-20260901-1055',
    agentId: 'TB-AGT-1055',
    agentName: 'Brian Lungu',
    agentPhone: '+260 97 678 9012',
    avatarInitials: 'BL',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '01-09-2026',
    checkInTime: '08:00 AM',
    checkOutTime: undefined,
    checkedInDuration: 'In Progress',
    totalHours: 'In Progress',
    status: 'Checked In',
    assignment: 'None',
    lastActive: 'Today, 10:30 AM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '08:00 AM' },
    ],
  },
  {
    id: 'ATT-20260901-1064',
    agentId: 'TB-AGT-1064',
    agentName: 'Joseph Kaunda',
    agentPhone: '+260 97 123 4567',
    avatarInitials: 'JK',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '01-09-2026',
    checkInTime: '07:40 AM',
    checkOutTime: undefined,
    checkedInDuration: 'In Progress',
    totalHours: 'In Progress',
    status: 'Checked In',
    assignment: 'None',
    lastActive: 'Today, 10:15 AM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:40 AM' },
    ],
  },
  {
    id: 'ATT-20260901-1070',
    agentId: 'TB-AGT-1070',
    agentName: 'Mwamba Musonda',
    agentPhone: '+260 97 889 0123',
    avatarInitials: 'MM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '01-09-2026',
    checkInTime: '08:45 AM',
    checkOutTime: undefined,
    checkedInDuration: 'In Progress',
    totalHours: 'In Progress',
    status: 'Checked In',
    assignment: 'None',
    lastActive: 'Today, 09:50 AM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '08:45 AM' },
    ],
  },
  {
    id: 'ATT-20260901-1078',
    agentId: 'TB-AGT-1078',
    agentName: 'Kondwani Banda',
    agentPhone: '+260 96 334 5678',
    avatarInitials: 'KB',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '01-09-2026',
    checkInTime: undefined,
    checkOutTime: undefined,
    checkedInDuration: undefined,
    totalHours: undefined,
    status: 'Not Checked In',
    assignment: 'None',
    lastActive: 'Yesterday, 05:30 PM',
    timeline: [],
  },
  {
    id: 'ATT-20260901-1082',
    agentId: 'TB-AGT-1082',
    agentName: 'Thandiwe Phiri',
    agentPhone: '+260 95 445 6789',
    avatarInitials: 'TP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '01-09-2026',
    checkInTime: undefined,
    checkOutTime: undefined,
    checkedInDuration: undefined,
    totalHours: undefined,
    status: 'Not Checked In',
    assignment: 'None',
    lastActive: 'Yesterday, 05:45 PM',
    timeline: [],
  },
  // Yesterday's records (31-08-2026) - Lusaka Central Express Agency
  {
    id: 'ATT-20260831-1024',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    avatarInitials: 'KP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '31-08-2026',
    checkInTime: '07:50 AM',
    checkOutTime: '05:15 PM',
    checkedInDuration: '9 hrs 25 mins',
    totalHours: '9 hrs 25 mins',
    status: 'Checked Out',
    assignment: 'Pickup',
    lastActive: 'Yesterday, 05:15 PM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:50 AM' },
      { id: 'ev-2', event: 'Checked Out', timestamp: '05:15 PM' },
    ],
  },
  {
    id: 'ATT-20260831-1062',
    agentId: 'TB-AGT-1062',
    agentName: 'Natasha Zulu',
    agentPhone: '+260 97 556 7890',
    avatarInitials: 'NZ',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '31-08-2026',
    checkInTime: '07:45 AM',
    checkOutTime: '05:10 PM',
    checkedInDuration: '9 hrs 25 mins',
    totalHours: '9 hrs 25 mins',
    status: 'Checked Out',
    assignment: 'Pickup',
    lastActive: 'Yesterday, 05:10 PM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:45 AM' },
      { id: 'ev-2', event: 'Checked Out', timestamp: '05:10 PM' },
    ],
  },
  {
    id: 'ATT-20260831-1050',
    agentId: 'TB-AGT-1050',
    agentName: 'Faith Mwewa',
    agentPhone: '+260 97 789 0123',
    avatarInitials: 'FM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '31-08-2026',
    checkInTime: '08:00 AM',
    checkOutTime: '05:05 PM',
    checkedInDuration: '9 hrs 5 mins',
    totalHours: '9 hrs 5 mins',
    status: 'Checked Out',
    assignment: 'Pickup',
    lastActive: 'Yesterday, 05:05 PM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '08:00 AM' },
      { id: 'ev-2', event: 'Checked Out', timestamp: '05:05 PM' },
    ],
  },
  {
    id: 'ATT-20260831-1055',
    agentId: 'TB-AGT-1055',
    agentName: 'Brian Lungu',
    agentPhone: '+260 95 123 4567',
    avatarInitials: 'BL',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '31-08-2026',
    checkInTime: '07:55 AM',
    checkOutTime: '05:20 PM',
    checkedInDuration: '9 hrs 25 mins',
    totalHours: '9 hrs 25 mins',
    status: 'Checked Out',
    assignment: 'Pickup',
    lastActive: 'Yesterday, 05:20 PM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:55 AM' },
      { id: 'ev-2', event: 'Checked Out', timestamp: '05:20 PM' },
    ],
  },
  {
    id: 'ATT-20260831-1064',
    agentId: 'TB-AGT-1064',
    agentName: 'Joseph Kaunda',
    agentPhone: '+260 97 890 1234',
    avatarInitials: 'JK',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '31-08-2026',
    checkInTime: '07:40 AM',
    checkOutTime: '05:00 PM',
    checkedInDuration: '9 hrs 20 mins',
    totalHours: '9 hrs 20 mins',
    status: 'Checked Out',
    assignment: 'Pickup',
    lastActive: 'Yesterday, 05:00 PM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:40 AM' },
      { id: 'ev-2', event: 'Checked Out', timestamp: '05:00 PM' },
    ],
  },
  {
    id: 'ATT-20260831-1070',
    agentId: 'TB-AGT-1070',
    agentName: 'Mwamba Musonda',
    agentPhone: '+260 96 223 3445',
    avatarInitials: 'MM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '31-08-2026',
    checkInTime: '08:30 AM',
    checkOutTime: '05:30 PM',
    checkedInDuration: '9 hrs',
    totalHours: '9 hrs',
    status: 'Checked Out',
    assignment: 'None',
    lastActive: 'Yesterday, 05:30 PM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '08:30 AM' },
      { id: 'ev-2', event: 'Checked Out', timestamp: '05:30 PM' },
    ],
  },
  {
    id: 'ATT-20260831-1078',
    agentId: 'TB-AGT-1078',
    agentName: 'Kondwani Banda',
    agentPhone: '+260 96 334 5678',
    avatarInitials: 'KB',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '31-08-2026',
    checkInTime: undefined,
    checkOutTime: undefined,
    checkedInDuration: undefined,
    totalHours: undefined,
    status: 'No Attendance Record',
    assignment: 'None',
    lastActive: 'Yesterday, 05:30 PM',
    timeline: [],
  },
  {
    id: 'ATT-20260831-1082',
    agentId: 'TB-AGT-1082',
    agentName: 'Thandiwe Phiri',
    agentPhone: '+260 95 445 6789',
    avatarInitials: 'TP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    date: '31-08-2026',
    checkInTime: undefined,
    checkOutTime: undefined,
    checkedInDuration: undefined,
    totalHours: undefined,
    status: 'No Attendance Record',
    assignment: 'None',
    lastActive: 'Yesterday, 05:45 PM',
    timeline: [],
  },
  // Copperbelt Agency (BIZ-COP-002) - for data isolation
  {
    id: 'ATT-20260901-2010',
    agentId: 'TB-AGT-2010',
    agentName: 'Emmanuel Chanda',
    agentPhone: '+260 97 111 2233',
    avatarInitials: 'EC',
    businessId: 'BIZ-COP-002',
    businessName: 'Copperbelt Prime Kiosk Network',
    businessCentre: 'Kitwe Central Agency',
    date: '01-09-2026',
    checkInTime: '07:55 AM',
    checkOutTime: undefined,
    checkedInDuration: 'In Progress',
    totalHours: 'In Progress',
    status: 'Checked In',
    assignment: 'None',
    lastActive: 'Today, 11:00 AM',
    timeline: [
      { id: 'ev-1', event: 'Checked In', timestamp: '07:55 AM' },
    ],
  },
];

export const MOCK_EOD_RECORDS: EndOfDayRecord[] = [
  {
    id: 'EOD-20260901-1024',
    reference: 'TB-EOD-801',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    avatarInitials: 'KP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    businessDate: '01-09-2026',
    availability: 'Assigned',
    expectedCash: 12400.0,
    declaredCash: 12400.0,
    cashVariance: 0.0,
    submittedTimestamp: '05:15 PM',
    status: 'Pending Review',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:00 AM' },
      { id: 'ev-2', event: 'Submitted', timestamp: '05:15 PM' },
      { id: 'ev-3', event: 'Pending Review', timestamp: '05:15 PM' },
    ],
  },
  {
    id: 'EOD-20260901-1062',
    reference: 'TB-EOD-802',
    agentId: 'TB-AGT-1062',
    agentName: 'Natasha Zulu',
    agentPhone: '+260 97 556 7890',
    avatarInitials: 'NZ',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    businessDate: '01-09-2026',
    availability: 'Assigned',
    expectedCash: 8900.0,
    declaredCash: 8900.0,
    cashVariance: 0.0,
    submittedTimestamp: '05:10 PM',
    status: 'Pending Review',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:00 AM' },
      { id: 'ev-2', event: 'Submitted', timestamp: '05:10 PM' },
      { id: 'ev-3', event: 'Pending Review', timestamp: '05:10 PM' },
    ],
  },
  {
    id: 'EOD-20260901-1050',
    reference: 'TB-EOD-803',
    agentId: 'TB-AGT-1050',
    agentName: 'Faith Mwewa',
    agentPhone: '+260 97 456 7890',
    avatarInitials: 'FM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    businessDate: '01-09-2026',
    availability: 'Available',
    expectedCash: 15200.0,
    declaredCash: 15200.0,
    cashVariance: 0.0,
    submittedTimestamp: '04:50 PM',
    status: 'Reconciled',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:00 AM' },
      { id: 'ev-2', event: 'Submitted', timestamp: '04:50 PM' },
      { id: 'ev-3', event: 'Pending Review', timestamp: '04:52 PM' },
      { id: 'ev-4', event: 'Reconciled', timestamp: '05:00 PM' },
    ],
  },
  {
    id: 'EOD-20260901-1055',
    reference: 'TB-EOD-804',
    agentId: 'TB-AGT-1055',
    agentName: 'Brian Lungu',
    agentPhone: '+260 97 678 9012',
    avatarInitials: 'BL',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    businessDate: '01-09-2026',
    availability: 'Available',
    expectedCash: 9500.0,
    declaredCash: 9150.0,
    cashVariance: -350.0,
    submittedTimestamp: '05:20 PM',
    status: 'Exception',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:00 AM' },
      { id: 'ev-2', event: 'Submitted', timestamp: '05:20 PM' },
      { id: 'ev-3', event: 'Pending Review', timestamp: '05:22 PM' },
      { id: 'ev-4', event: 'Exception Flagged', timestamp: '05:25 PM' },
    ],
  },
  {
    id: 'EOD-20260901-1064',
    reference: 'TB-EOD-805',
    agentId: 'TB-AGT-1064',
    agentName: 'Joseph Kaunda',
    agentPhone: '+260 97 123 4567',
    avatarInitials: 'JK',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    businessDate: '01-09-2026',
    availability: 'Available',
    expectedCash: 18000.0,
    declaredCash: undefined,
    cashVariance: 0.0,
    submittedTimestamp: undefined,
    status: 'Pending Submission',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:00 AM' },
    ],
  },
  {
    id: 'EOD-20260901-1070',
    reference: 'TB-EOD-806',
    agentId: 'TB-AGT-1070',
    agentName: 'Mwamba Musonda',
    agentPhone: '+260 97 889 0123',
    avatarInitials: 'MM',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    businessDate: '01-09-2026',
    availability: 'Available',
    expectedCash: 6400.0,
    declaredCash: undefined,
    cashVariance: 0.0,
    submittedTimestamp: undefined,
    status: 'Pending Submission',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:45 AM' },
    ],
  },
  {
    id: 'EOD-20260901-1078',
    reference: 'TB-EOD-807',
    agentId: 'TB-AGT-1078',
    agentName: 'Kondwani Banda',
    agentPhone: '+260 96 334 5678',
    avatarInitials: 'KB',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    businessDate: '01-09-2026',
    availability: 'Offline',
    expectedCash: 0.0,
    declaredCash: undefined,
    cashVariance: 0.0,
    submittedTimestamp: undefined,
    status: 'Pending Submission',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:00 AM' },
    ],
  },
  {
    id: 'EOD-20260901-1082',
    reference: 'TB-EOD-808',
    agentId: 'TB-AGT-1082',
    agentName: 'Thandiwe Phiri',
    agentPhone: '+260 95 445 6789',
    avatarInitials: 'TP',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessCentre: 'Lusaka Central Express Agency',
    businessDate: '01-09-2026',
    availability: 'Offline',
    expectedCash: 0.0,
    declaredCash: undefined,
    cashVariance: 0.0,
    submittedTimestamp: undefined,
    status: 'Pending Submission',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:00 AM' },
    ],
  },
  // Copperbelt record for data scoping
  {
    id: 'EOD-20260901-2010',
    reference: 'TB-EOD-901',
    agentId: 'TB-AGT-2010',
    agentName: 'Emmanuel Chanda',
    agentPhone: '+260 97 111 2233',
    avatarInitials: 'EC',
    businessId: 'BIZ-COP-002',
    businessName: 'Copperbelt Prime Kiosk Network',
    businessCentre: 'Kitwe Central Agency',
    businessDate: '01-09-2026',
    availability: 'Available',
    expectedCash: 5000.0,
    declaredCash: 5000.0,
    cashVariance: 0.0,
    submittedTimestamp: '05:00 PM',
    status: 'Pending Review',
    timeline: [
      { id: 'ev-1', event: 'Submission Pending', timestamp: '08:00 AM' },
      { id: 'ev-2', event: 'Submitted', timestamp: '05:00 PM' },
    ],
  },
];

/**
 * Derives Attendance metrics for a given businessId and date
 */
export function deriveAttendanceMetrics(
  records: AttendanceRecord[],
  businessId?: string,
  date?: string
): AttendanceMetrics {
  const isToday = !date || date === TODAY_DATE;
  let filtered = records;
  if (businessId) {
    filtered = filtered.filter((r) => r.businessId === businessId);
  }
  if (date) {
    filtered = filtered.filter((r) => r.date === date);
  }

  const totalAgents = filtered.length;
  // Current date: Checked In, Checked Out, Not Checked In. Never "No Attendance Record".
  // Previous date: Checked Out, No Attendance Record. Never "Not Checked In" or active "Checked In".
  const checkedIn = isToday
    ? filtered.filter((r) => r.status === 'Checked In').length
    : 0;
  const checkedOut = filtered.filter((r) => r.status === 'Checked Out').length;
  const notCheckedIn = isToday
    ? filtered.filter((r) => r.status === 'Not Checked In').length
    : 0;
  const noAttendanceRecord = isToday
    ? 0
    : filtered.filter((r) => r.status === 'No Attendance Record').length;

  return {
    totalAgents,
    checkedIn,
    checkedOut,
    notCheckedIn,
    noAttendanceRecord,
  };
}

/**
 * Derives End-of-Day metrics for a given businessId and date
 */
export function deriveEndOfDayMetrics(
  records: EndOfDayRecord[],
  businessId?: string,
  date?: string
): EndOfDayMetrics {
  let filtered = records;
  if (businessId) {
    filtered = filtered.filter((r) => r.businessId === businessId);
  }
  if (date) {
    filtered = filtered.filter((r) => r.businessDate === date);
  }

  const totalAgents = filtered.length;
  const pendingSubmission = filtered.filter((r) => r.status === 'Pending Submission').length;
  const pendingReview = filtered.filter((r) => r.status === 'Pending Review').length;
  const reconciled = filtered.filter((r) => r.status === 'Reconciled').length;
  const exceptions = filtered.filter((r) => r.status === 'Exception').length;

  return {
    totalAgents,
    pendingSubmission,
    pendingReview,
    reconciled,
    exceptions,
  };
}

export function filterAttendanceRecords(
  records: AttendanceRecord[],
  filters: AttendanceFilters,
  businessId?: string
): AttendanceRecord[] {
  const isToday = !filters.date || filters.date === TODAY_DATE;

  return records
    .filter((rec) => {
      if (businessId && rec.businessId !== businessId) return false;
      if (filters.date && rec.date !== filters.date) return false;

      const effectiveStatus: AttendanceStatusType =
        !isToday && rec.status === 'Not Checked In'
          ? 'No Attendance Record'
          : !isToday && rec.status === 'Checked In'
          ? 'Checked Out'
          : rec.status;

      if (filters.status !== 'ALL' && effectiveStatus !== filters.status) return false;
      if (filters.assignment !== 'ALL' && rec.assignment !== filters.assignment) return false;

      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchName = rec.agentName.toLowerCase().includes(q);
        const matchId = rec.agentId.toLowerCase().includes(q);
        const matchPhone = rec.agentPhone.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchPhone) return false;
      }

      return true;
    })
    .map((rec) => {
      if (!isToday && rec.status === 'Not Checked In') {
        return { ...rec, status: 'No Attendance Record' as const };
      }
      if (!isToday && rec.status === 'Checked In') {
        return {
          ...rec,
          status: 'Checked Out' as const,
          checkOutTime: rec.checkOutTime || '05:00 PM',
          checkedInDuration: rec.checkedInDuration === 'In Progress' ? '9 hrs' : rec.checkedInDuration,
          totalHours: rec.totalHours === 'In Progress' ? '9 hrs' : rec.totalHours,
        };
      }
      return rec;
    });
}

export function filterEndOfDayRecords(
  records: EndOfDayRecord[],
  filters: EndOfDayFilters,
  businessId?: string
): EndOfDayRecord[] {
  return records.filter((rec) => {
    if (businessId && rec.businessId !== businessId) return false;
    if (filters.businessDate && rec.businessDate !== filters.businessDate) return false;

    if (filters.status !== 'ALL' && rec.status !== filters.status) return false;
    if (filters.availability !== 'ALL' && rec.availability !== filters.availability) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const matchName = rec.agentName.toLowerCase().includes(q);
      const matchId = rec.agentId.toLowerCase().includes(q);
      const matchRef = rec.reference.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchRef) return false;
    }

    return true;
  });
}
