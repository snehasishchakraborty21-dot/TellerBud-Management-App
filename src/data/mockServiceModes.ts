import { ServiceModeRecord, ServiceModeChangeLog } from '../types/serviceMode';

export const INITIAL_SERVICE_MODES: ServiceModeRecord[] = [
  {
    id: 'TB-SVC-CP-001',
    name: 'Cash Pickup',
    audience: 'Customer and Agent',
    availability: 'Active',
    transactionTypes: ['Deposit', 'Withdrawal', 'Purchase'],
    eligibleProvidersCount: 7,
    scheduling: 'Now or Later',
    completionConfirmation: [
      'Customer Confirmation Required',
      'Agent Confirmation Required',
    ],
    reservationCharge: 'ZMW 50.00',
    lastUpdated: 'Today, 10:45 AM',
    canActivateInPhase1: true,
  },
  {
    id: 'TB-SVC-CD-002',
    name: 'Cash Delivery',
    audience: 'Customer and Agent',
    availability: 'Coming Soon',
    displayLabel: 'SOON',
    transactionTypes: ['Deposit', 'Withdrawal', 'Purchase'],
    eligibleProvidersCount: 0,
    scheduling: 'Unavailable',
    reservationCharge: 'Not Applicable',
    lastUpdated: '10 Sep 2026, 3:30 PM',
    canActivateInPhase1: false,
  },
  {
    id: 'TB-SVC-WI-003',
    name: 'Walk-In Transaction',
    audience: 'Agent App',
    availability: 'Active',
    transactionTypes: ['Deposit', 'Withdrawal', 'Purchase'],
    eligibleProvidersCount: 5,
    scheduling: 'Immediate',
    reservationCharge: 'Not Applicable',
    lastUpdated: 'Today, 9:55 AM',
    canActivateInPhase1: true,
  },
  {
    id: 'TB-SVC-A2A-004',
    name: 'Agent-to-Agent Liquidity',
    audience: 'Agent App',
    availability: 'Active',
    transactionTypes: ['Liquidity Transfer'],
    eligibleProvidersCount: 0,
    isInternalLedger: true,
    providerDisplay: 'TellerBud Ledger',
    scheduling: 'Immediate',
    reservationCharge: 'Not Applicable',
    lastUpdated: 'Today, 9:30 AM',
    canActivateInPhase1: true,
  },
];

export const INITIAL_CHANGE_HISTORY: ServiceModeChangeLog[] = [
  {
    id: 'LOG-SM-001',
    serviceId: 'TB-SVC-CP-001',
    serviceName: 'Cash Pickup',
    fieldChanged: 'Reservation Charge',
    previousValue: 'ZMW 40.00',
    newValue: 'ZMW 50.00',
    updatedBy: 'Sililo Lubinda (Super Admin)',
    timestamp: 'Today, 10:45 AM',
  },
  {
    id: 'LOG-SM-002',
    serviceId: 'TB-SVC-WI-003',
    serviceName: 'Walk-In Transaction',
    fieldChanged: 'Eligible Providers',
    previousValue: '4 Providers',
    newValue: '5 Providers',
    updatedBy: 'Sililo Lubinda (Super Admin)',
    timestamp: 'Today, 09:55 AM',
  },
  {
    id: 'LOG-SM-003',
    serviceId: 'TB-SVC-A2A-004',
    serviceName: 'Agent-to-Agent Liquidity',
    fieldChanged: 'Availability',
    previousValue: 'Maintenance',
    newValue: 'Active',
    updatedBy: 'System Automation',
    timestamp: 'Today, 09:30 AM',
  },
  {
    id: 'LOG-SM-004',
    serviceId: 'TB-SVC-CD-002',
    serviceName: 'Cash Delivery',
    fieldChanged: 'Roadmap Milestone',
    previousValue: 'Draft Spec',
    newValue: 'Coming Soon (Phase 2)',
    updatedBy: 'Product Operations',
    timestamp: '10 Sep 2026, 3:30 PM',
  },
];

const STORAGE_KEY_SERVICE_MODES = 'tellerbud_service_modes_v2';
const STORAGE_KEY_CHANGE_HISTORY = 'tellerbud_service_modes_history_v2';

export function getStoredServiceModes(): ServiceModeRecord[] {
  if (typeof window === 'undefined') return INITIAL_SERVICE_MODES;
  try {
    const data = localStorage.getItem(STORAGE_KEY_SERVICE_MODES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_SERVICE_MODES, JSON.stringify(INITIAL_SERVICE_MODES));
      return INITIAL_SERVICE_MODES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SERVICE_MODES;
  }
}

export function getStoredServiceModeById(id: string): ServiceModeRecord | undefined {
  const modes = getStoredServiceModes();
  return modes.find((s) => s.id.toLowerCase() === id.toLowerCase());
}

export function getServiceModeHistory(serviceId?: string): ServiceModeChangeLog[] {
  if (typeof window === 'undefined') return INITIAL_CHANGE_HISTORY;
  try {
    const data = localStorage.getItem(STORAGE_KEY_CHANGE_HISTORY);
    let history: ServiceModeChangeLog[];
    if (!data) {
      localStorage.setItem(STORAGE_KEY_CHANGE_HISTORY, JSON.stringify(INITIAL_CHANGE_HISTORY));
      history = INITIAL_CHANGE_HISTORY;
    } else {
      history = JSON.parse(data);
    }
    if (serviceId) {
      return history.filter((h) => h.serviceId.toLowerCase() === serviceId.toLowerCase());
    }
    return history;
  } catch {
    return serviceId
      ? INITIAL_CHANGE_HISTORY.filter((h) => h.serviceId.toLowerCase() === serviceId.toLowerCase())
      : INITIAL_CHANGE_HISTORY;
  }
}

export function saveServiceModeRecord(
  updatedRecord: ServiceModeRecord,
  changeLogs?: Array<Omit<ServiceModeChangeLog, 'id' | 'timestamp'>>
): { record: ServiceModeRecord; history: ServiceModeChangeLog[] } {
  const modes = getStoredServiceModes();
  const index = modes.findIndex((m) => m.id.toLowerCase() === updatedRecord.id.toLowerCase());
  
  const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const finalRecord: ServiceModeRecord = {
    ...updatedRecord,
    lastUpdated: nowStr,
  };

  if (index >= 0) {
    modes[index] = finalRecord;
  } else {
    modes.push(finalRecord);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SERVICE_MODES, JSON.stringify(modes));
  }

  const existingHistory = getServiceModeHistory();
  const newLogs: ServiceModeChangeLog[] = (changeLogs || []).map((log, idx) => ({
    ...log,
    id: `LOG-SM-${Date.now()}-${idx}`,
    timestamp: nowStr,
  }));

  const updatedHistory = [...newLogs, ...existingHistory];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CHANGE_HISTORY, JSON.stringify(updatedHistory));
  }

  // Dispatch custom storage event so other components can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tellerbud_service_modes_updated', { detail: finalRecord }));
  }

  return { record: finalRecord, history: updatedHistory };
}

