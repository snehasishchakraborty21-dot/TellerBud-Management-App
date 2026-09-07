export type AttendanceStatusType = 'Checked In' | 'Checked Out' | 'Not Checked In' | 'No Attendance Record';
export type AssignmentType = 'Pickup' | 'Walk-In' | 'None' | 'Unassigned';

export type EndOfDayStatusType = 'Pending Submission' | 'Pending Review' | 'Reconciled' | 'Exception';
export type AgentAvailabilityType = 'Available' | 'Assigned' | 'Offline';

export interface LifecycleEvent {
  id: string;
  event: string;
  timestamp: string; // formatted with AM/PM e.g. '07:45 AM' or 'Today, 05:15 PM'
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  avatarInitials: string;
  businessId: string;
  businessName: string;
  businessCentre: string;
  date: string; // 'dd-mm-yyyy', e.g. '01-09-2026'
  checkInTime?: string; // e.g. '07:45 AM' or undefined (displays as '—')
  checkOutTime?: string; // e.g. '05:10 PM' or undefined (displays as '—')
  checkedInDuration?: string; // e.g. '9 hrs 25 mins' or 'In Progress'
  totalHours?: string; // alias for checkedInDuration
  status: AttendanceStatusType;
  assignment: AssignmentType;
  lastActive: string; // e.g. 'Today, 11:15 AM'
  timeline: LifecycleEvent[];
}

export interface AttendanceMetrics {
  totalAgents: number; // 8
  checkedIn: number; // 6
  checkedOut: number; // 0
  notCheckedIn: number; // 1
  noAttendanceRecord: number; // 1
}

export interface AttendanceFilters {
  search: string;
  date: string; // 'dd-mm-yyyy'
  status: AttendanceStatusType | 'ALL';
  assignment: AssignmentType | 'ALL';
}

export interface EndOfDayRecord {
  id: string;
  reference: string; // e.g. 'TB-EOD-801'
  agentId: string;
  agentName: string;
  agentPhone: string;
  avatarInitials: string;
  businessId: string;
  businessName: string;
  businessCentre: string;
  businessDate: string; // 'dd-mm-yyyy', e.g. '01-09-2026'
  availability: AgentAvailabilityType;
  expectedCash: number; // in ZMW
  declaredCash?: number; // in ZMW
  cashVariance: number; // Declared Cash - Expected Cash
  submittedTimestamp?: string; // e.g. '05:15 PM' or undefined
  status: EndOfDayStatusType;
  timeline: LifecycleEvent[];
}

export interface EndOfDayMetrics {
  totalAgents: number; // 8
  pendingSubmission: number; // 4
  pendingReview: number; // 2
  reconciled: number; // 1
  exceptions: number; // 1
}

export interface EndOfDayFilters {
  search: string;
  businessDate: string; // 'dd-mm-yyyy'
  status: EndOfDayStatusType | 'ALL';
  availability: AgentAvailabilityType | 'ALL';
}
