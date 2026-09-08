import { IAdminService } from './adminService';
import {
  OperationalMetrics,
  RequiresAttentionItem,
  PickupRequest,
  AgentAvailabilitySummary,
  FinancialActivityRecord,
  AdminNotification,
  AdminUserProfile,
  CustomerWithdrawal,
  WithdrawalFilters,
  WithdrawalStatusSummary,
  WithdrawalSortField,
  WithdrawalSortDirection,
  WithdrawalStatus,
  WithdrawalFundsState,
  CustomerWalletPosition,
  CashFloatRequest,
  CashFloatFilters,
  CashFloatStatusSummary,
  CashFloatSortField,
  CashFloatSortDirection,
  CashFloatStatus,
  AgentToAgentRequest,
  AgentToAgentFilters,
  AgentToAgentStatusSummary,
  AgentToAgentSortField,
  AgentToAgentSortDirection,
  WalkInTransaction,
  WalkInFilters,
  WalkInStatusSummary,
  WalkInSortField,
  WalkInSortDirection,
  AgentRecord,
  AgentFilters,
  AgentStatusSummary,
  AgentSortField,
  AgentSortDirection,
} from '../types/admin';
import {
  MOCK_OPERATIONAL_METRICS,
  MOCK_REQUIRES_ATTENTION,
  MOCK_LIVE_PICKUP_OPERATIONS,
  MOCK_AGENT_AVAILABILITY,
  MOCK_RECENT_FINANCIAL_ACTIVITY,
  MOCK_NOTIFICATIONS,
} from '../data/mockAdminData';
import { getAllCustomerRequests } from '../data/mockCustomerRequestsData';
import {
  MOCK_CUSTOMER_WITHDRAWALS,
  deriveWithdrawalStatusSummary,
  calculateWalletPosition,
  getFundsStateForStatus,
} from '../data/mockWithdrawalData';
import {
  MOCK_CASH_FLOAT_REQUESTS,
  deriveCashFloatStatusSummary,
} from '../data/mockCashFloatData';
import {
  MOCK_AGENT_LIQUIDITY_REQUESTS,
  deriveAgentLiquidityStatusSummary,
} from '../data/mockAgentLiquidityData';
import {
  MOCK_WALK_IN_TRANSACTIONS,
  deriveWalkInStatusSummary,
} from '../data/mockWalkInData';
import {
  MobileMoneyTransaction,
  MobileMoneyFilters,
  MobileMoneySummary,
  MobileMoneySortField,
  MobileMoneySortDirection,
} from '../types/mobileMoney';
import {
  MOCK_MOBILE_MONEY_TRANSACTIONS,
  queryMobileMoneyTransactions,
} from '../data/mockMobileMoneyData';
import {
  MOCK_AGENTS,
  deriveAgentStatusSummary,
  sortAgentsByOperationalPriority,
} from '../data/mockAgentData';
import {
  AttendanceRecord,
  AttendanceMetrics,
  AttendanceFilters,
  EndOfDayRecord,
  EndOfDayMetrics,
  EndOfDayFilters,
} from '../types/attendance';
import {
  BusinessProfile,
  EditableBusinessProfileFields,
} from '../types/businessProfile';
import {
  BusinessWallet,
  BusinessWalletLedgerEntry,
  GlobalWalletActivity,
  GlobalWalletLedgerRecord,
  BusinessTransactionRecord,
  BusinessTransactionFilters,
  BusinessTransactionStatusCounts,
} from '../types/admin';
import {
  MOCK_BUSINESS_WALLET,
  MOCK_BUSINESS_WALLET_LEDGER,
  MOCK_GLOBAL_WALLET_ACTIVITIES,
  MOCK_GLOBAL_WALLET_LEDGER_RECORDS,
} from '../data/mockWalletData';
import {
  MOCK_BUSINESS_TRANSACTIONS,
} from '../data/mockBusinessTransactionsData';
import {
  ChargeCommissionRecord,
  ChargeCommissionFilters,
  ChargeCommissionSummary,
  ChargeCommissionTabCounts,
} from '../types/chargesCommissions';
import { MOCK_CHARGES_COMMISSIONS } from '../data/mockChargesCommissionsData';
import {
  MOCK_ATTENDANCE_RECORDS,
  MOCK_EOD_RECORDS,
  deriveAttendanceMetrics,
  deriveEndOfDayMetrics,
  filterAttendanceRecords,
  filterEndOfDayRecords,
  TODAY_DATE,
} from '../data/mockAttendanceData';
import { MOCK_BUSINESS_PROFILES } from '../data/mockBusinessProfileData';
import { SUPER_ADMIN_PROFILE } from '../config/appConfig';

/**
 * TellerBud Admin Frontend Mock Service Layer.
 * Note: Role visibility and state transitions are modeled for UI review.
 * A production backend (e.g. Cloud Functions / Firebase) must enforce permissions
 * and financial idempotency independently.
 */
const BIZ_PROFILE_STORAGE_KEY = 'tellerbud_business_profiles_v1';

function getInitialBusinessProfiles(): Record<string, BusinessProfile> {
  try {
    const saved = localStorage.getItem(BIZ_PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...MOCK_BUSINESS_PROFILES, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load persisted business profiles:', err);
  }
  return { ...MOCK_BUSINESS_PROFILES };
}

import { boNotificationService } from './notificationService';

function persistBusinessProfiles(profiles: Record<string, BusinessProfile>): void {
  try {
    localStorage.setItem(BIZ_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save business profiles:', err);
  }
}

class MockAdminService implements IAdminService {
  private notifications: AdminNotification[] = [...MOCK_NOTIFICATIONS];
  private boNotifications: AdminNotification[] = [
    {
      id: 'notif-bo-1',
      title: 'Kelvin Phiri requested ZMW 8,000.00 Float',
      category: 'Operations',
      timestamp: '10 mins ago',
      read: false,
      actionUrl: '/business-owner/operations/cash-float-requests/TB-CFR-5001',
    },
    {
      id: 'notif-bo-2',
      title: '2 End-of-Day reconciliations ready for review',
      category: 'Operations',
      timestamp: '25 mins ago',
      read: false,
      actionUrl: '/business-owner/people/attendance?tab=eod',
    },
    {
      id: 'notif-bo-3',
      title: 'Mwamba Musonda attendance delay flagged (25m late)',
      category: 'Exception',
      timestamp: '45 mins ago',
      read: false,
      actionUrl: '/business-owner/people/attendance?tab=exceptions',
    },
    {
      id: 'notif-bo-4',
      title: 'Agent-to-Agent match: Joseph Kaunda accepted request',
      category: 'Operations',
      timestamp: '1 hour ago',
      read: true,
      actionUrl: '/business-owner/operations/agent-to-agent-liquidity/TB-ATL-7001',
    },
    {
      id: 'notif-bo-5',
      title: 'Business Float Ledger credited ZMW 25,000.00',
      category: 'Finance',
      timestamp: '2 hours ago',
      read: true,
      actionUrl: '/business-owner/wallets/business-agent',
    },
  ];
  private pickupRequests: PickupRequest[] = [...MOCK_LIVE_PICKUP_OPERATIONS];
  private withdrawals: CustomerWithdrawal[] = [...MOCK_CUSTOMER_WITHDRAWALS];
  private cashFloatRequests: CashFloatRequest[] = [...MOCK_CASH_FLOAT_REQUESTS];
  private agentLiquidityRequests: AgentToAgentRequest[] = [...MOCK_AGENT_LIQUIDITY_REQUESTS];
  private walkInTransactions: WalkInTransaction[] = [...MOCK_WALK_IN_TRANSACTIONS];
  private mobileMoneyTransactions: MobileMoneyTransaction[] = [...MOCK_MOBILE_MONEY_TRANSACTIONS];
  private businessProfiles: Record<string, BusinessProfile> = getInitialBusinessProfiles();
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Subscriber notification error:', err);
      }
    });
  }

  async getOperationalMetrics(): Promise<OperationalMetrics> {
    const pendingWithdrawalsCount = this.withdrawals.filter(
      (w) => w.status === 'Pending Review'
    ).length;

    const pendingCashFloatCount = this.cashFloatRequests.filter(
      (r) => r.status === 'Pending Review'
    ).length;

    return {
      ...MOCK_OPERATIONAL_METRICS,
      pendingWithdrawals: pendingWithdrawalsCount,
      businessOwnerCashFloat: pendingCashFloatCount,
    };
  }

  async getRequiresAttentionItems(): Promise<RequiresAttentionItem[]> {
    const pendingWithdrawalsCount = this.withdrawals.filter(
      (w) => w.status === 'Pending Review'
    ).length;

    const pendingLiquidityCount = this.agentLiquidityRequests.filter(
      (r) => r.status === 'Matching' || r.status === 'Agent Matched'
    ).length;

    return MOCK_REQUIRES_ATTENTION.map((item) => {
      if (item.id === 'att-1' || item.type === 'withdrawal_review') {
        return {
          ...item,
          count: pendingWithdrawalsCount,
          label: `${pendingWithdrawalsCount} Customer withdrawal${
            pendingWithdrawalsCount === 1 ? '' : 's'
          } awaiting review`,
        };
      }
      if (item.id === 'att-2' || item.type === 'agent_liquidity') {
        return {
          ...item,
          count: pendingLiquidityCount,
          label: `${pendingLiquidityCount} Agent-to-Agent liquidity request${
            pendingLiquidityCount === 1 ? '' : 's'
          } pending`,
        };
      }
      return item;
    });
  }

  async getLivePickupOperations(): Promise<PickupRequest[]> {
    return [...this.pickupRequests];
  }

  async getCustomerRequests(): Promise<PickupRequest[]> {
    // Merges current live requests (ensuring synchronization) with historical records
    return getAllCustomerRequests(this.pickupRequests);
  }

  async getCustomerRequestByReference(reference: string): Promise<PickupRequest | null> {
    const all = await this.getCustomerRequests();
    return all.find((r) => r.id === reference) || null;
  }

  async getAgentAvailability(): Promise<AgentAvailabilitySummary> {
    return { ...MOCK_AGENT_AVAILABILITY };
  }

  async getRecentFinancialActivity(): Promise<FinancialActivityRecord[]> {
    return MOCK_RECENT_FINANCIAL_ACTIVITY.map((rec) => {
      const match = this.withdrawals.find((w) => w.reference === rec.reference);
      if (match) {
        return {
          ...rec,
          status: match.status as any,
        };
      }
      return rec;
    });
  }

  async getNotifications(businessName?: string): Promise<AdminNotification[]> {
    if (businessName) {
      return boNotificationService.getAdminNotifications();
    }
    return [...this.notifications];
  }

  async getUserProfile(): Promise<AdminUserProfile> {
    return { ...SUPER_ADMIN_PROFILE };
  }

  async markNotificationAsRead(id: string): Promise<void> {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    boNotificationService.markAsRead(id);
  }

  async markAllNotificationsAsRead(businessName?: string): Promise<void> {
    if (businessName) {
      boNotificationService.markAllAsRead();
    } else {
      this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    }
  }

  async getWithdrawalStatusSummary(): Promise<WithdrawalStatusSummary> {
    return deriveWithdrawalStatusSummary(this.withdrawals);
  }

  async getCustomerWithdrawals(
    filters?: Partial<WithdrawalFilters>,
    sort?: { field: WithdrawalSortField; direction: WithdrawalSortDirection }
  ): Promise<{ items: CustomerWithdrawal[]; total: number; summary: WithdrawalStatusSummary }> {
    let result = [...this.withdrawals];

    if (filters) {
      if (filters.search && filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const cleanQuery = query.replace(/\s+/g, '');
        result = result.filter((w) => {
          const ref = w.reference.toLowerCase();
          const name = w.customerName.toLowerCase();
          const phone = w.customerPhone.replace(/\s+/g, '').toLowerCase();
          const payout = w.payoutNumber.replace(/\s+/g, '').toLowerCase();
          return (
            ref.includes(query) ||
            name.includes(query) ||
            phone.includes(cleanQuery) ||
            payout.includes(cleanQuery)
          );
        });
      }

      if (filters.status && filters.status !== 'ALL') {
        result = result.filter((w) => w.status === filters.status);
      }

      if (filters.network && filters.network !== 'ALL') {
        result = result.filter((w) => w.network === filters.network);
      }

      if (filters.fromDate) {
        const fromTime = new Date(`${filters.fromDate}T00:00:00Z`).getTime();
        if (!isNaN(fromTime)) {
          result = result.filter((w) => new Date(w.requestedAt).getTime() >= fromTime);
        }
      }

      if (filters.toDate) {
        const toTime = new Date(`${filters.toDate}T23:59:59.999Z`).getTime();
        if (!isNaN(toTime)) {
          result = result.filter((w) => new Date(w.requestedAt).getTime() <= toTime);
        }
      }
    }

    // Apply Sorting (default: requestedAt desc)
    const sortField = sort?.field || 'requestedAt';
    const sortDir = sort?.direction || 'desc';

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'requestedAt') {
        comparison = new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return {
      items: result,
      total: result.length,
      summary: deriveWithdrawalStatusSummary(this.withdrawals),
    };
  }

  async getCustomerWithdrawalByReference(reference: string): Promise<CustomerWithdrawal | null> {
    const cleanRef = reference.trim().toLowerCase();
    const item = this.withdrawals.find(
      (w) => w.reference.toLowerCase() === cleanRef || w.id.toLowerCase() === cleanRef
    );
    return item ? { ...item } : null;
  }

  async getWithdrawalWalletPosition(reference: string): Promise<CustomerWalletPosition | null> {
    const wdr = await this.getCustomerWithdrawalByReference(reference);
    if (!wdr) return null;
    return calculateWalletPosition(wdr);
  }

  async updateWithdrawalStatus(
    reference: string,
    newStatus: WithdrawalStatus,
    actor: string,
    expectedCurrentStatus?: WithdrawalStatus,
    reason?: string
  ): Promise<{ success: boolean; withdrawal: CustomerWithdrawal; error?: string }> {
    // Artificial latency for realistic async feeling
    await new Promise((res) => setTimeout(res, 400));

    const cleanRef = reference.trim().toLowerCase();
    const index = this.withdrawals.findIndex(
      (w) => w.reference.toLowerCase() === cleanRef || w.id.toLowerCase() === cleanRef
    );

    if (index === -1) {
      return {
        success: false,
        withdrawal: null as any,
        error: 'Withdrawal request not found.',
      };
    }

    const current = this.withdrawals[index];

    // Check if status changed in the meantime (stale check)
    if (expectedCurrentStatus && current.status !== expectedCurrentStatus) {
      return {
        success: false,
        withdrawal: current,
        error: 'Withdrawal status has changed. Refresh the request.',
      };
    }

    // Validate allowed status transitions
    const validTransitions: Record<WithdrawalStatus, WithdrawalStatus[]> = {
      'Pending Review': ['Approved', 'Rejected'],
      'Approved': ['Processing', 'Rejected'],
      'Processing': ['Paid', 'Rejected'],
      'Paid': [],
      'Rejected': [],
      'Cancelled': [],
    };

    const allowedNext = validTransitions[current.status] || [];
    if (!allowedNext.includes(newStatus)) {
      return {
        success: false,
        withdrawal: current,
        error: `Cannot transition from ${current.status} to ${newStatus}.`,
      };
    }

    const newFundsState: WithdrawalFundsState = getFundsStateForStatus(newStatus);

    let eventTimestamp = new Date().toISOString();
    if (reference === 'TB-WDR-8812') {
      if (newStatus === 'Approved') {
        eventTimestamp = '2026-08-31T11:05:00+02:00';
      } else if (newStatus === 'Processing') {
        eventTimestamp = '2026-08-31T11:12:00+02:00';
      } else if (newStatus === 'Paid') {
        eventTimestamp = '2026-08-31T11:18:00+02:00';
      }
    }

    const newHistoryEntry: import('../types/admin').WithdrawalStatusHistoryItem = {
      id: `HIST-${Date.now()}`,
      status: newStatus,
      actor: actor,
      timestamp: eventTimestamp,
      ...(reason ? { reason } : {}),
    };

    const existingHistory = current.history ?? [
      {
        id: `HIST-INIT-1`,
        status: 'Withdrawal Requested',
        actor: current.customerName,
        timestamp: current.requestedAt,
      },
      {
        id: `HIST-INIT-2`,
        status: 'Validation Verified',
        actor: 'TellerBud System',
        timestamp: current.requestedAt,
      },
      {
        id: `HIST-INIT-3`,
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: current.requestedAt,
      },
    ];

    const updated: CustomerWithdrawal = {
      ...current,
      status: newStatus,
      fundsState: newFundsState,
      notes: reason ? reason : current.notes,
      history: [...existingHistory, newHistoryEntry],
    };

    this.withdrawals[index] = updated;

    // Trigger subscribers across app
    this.notifyListeners();

    return {
      success: true,
      withdrawal: { ...updated },
    };
  }

  async getCashFloatRequests(
    filters?: Partial<CashFloatFilters>,
    sort?: { field: CashFloatSortField; direction: CashFloatSortDirection },
    businessName?: string
  ): Promise<{ items: CashFloatRequest[]; total: number; summary: CashFloatStatusSummary }> {
    let result = [...this.cashFloatRequests];

    if (businessName) {
      result = result.filter(
        (r) => r.businessName.toLowerCase() === businessName.toLowerCase()
      );
    }

    if (filters) {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        result = result.filter(
          (item) =>
            item.reference.toLowerCase().includes(q) ||
            item.agentName.toLowerCase().includes(q) ||
            item.agentId.toLowerCase().includes(q) ||
            item.agentPhone.toLowerCase().includes(q) ||
            item.businessName.toLowerCase().includes(q)
        );
      }

      if (filters.status && filters.status !== 'ALL') {
        result = result.filter((item) => item.status === filters.status);
      }

      if (filters.requestType && filters.requestType !== 'ALL') {
        result = result.filter((item) => item.requestType === filters.requestType);
      }

      if (filters.fromDate) {
        result = result.filter((item) => {
          const itemDate = item.requestedAt.split('T')[0];
          return itemDate >= filters.fromDate!;
        });
      }

      if (filters.toDate) {
        result = result.filter((item) => {
          const itemDate = item.requestedAt.split('T')[0];
          return itemDate <= filters.toDate!;
        });
      }
    }

    // Sorting
    const field = sort?.field || 'requestedAt';
    const direction = sort?.direction || 'desc';

    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'amount') {
        comparison = a.amount - b.amount;
      } else if (field === 'requestedAt') {
        comparison = new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      } else if (field === 'status') {
        comparison = a.status.localeCompare(b.status);
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    const scopedAll = businessName
      ? this.cashFloatRequests.filter(
          (r) => r.businessName.toLowerCase() === businessName.toLowerCase()
        )
      : this.cashFloatRequests;

    const summary = deriveCashFloatStatusSummary(scopedAll);

    return {
      items: result,
      total: result.length,
      summary,
    };
  }

  async getCashFloatRequestByReference(reference: string): Promise<CashFloatRequest | null> {
    const found = this.cashFloatRequests.find(
      (r) =>
        r.reference.toLowerCase() === reference.toLowerCase() ||
        r.id.toLowerCase() === reference.toLowerCase()
    );
    return found ? { ...found } : null;
  }

  async getCashFloatStatusSummary(businessName?: string): Promise<CashFloatStatusSummary> {
    const scoped = businessName
      ? this.cashFloatRequests.filter(
          (r) => r.businessName.toLowerCase() === businessName.toLowerCase()
        )
      : this.cashFloatRequests;
    return deriveCashFloatStatusSummary(scoped);
  }

  async updateCashFloatStatus(
    reference: string,
    newStatus: CashFloatStatus,
    actor: string,
    payload?: {
      reason?: string;
      manualReference?: string;
      internalNote?: string;
    }
  ): Promise<{ success: boolean; request: CashFloatRequest; error?: string }> {
    const index = this.cashFloatRequests.findIndex(
      (r) =>
        r.reference.toLowerCase() === reference.toLowerCase() ||
        r.id.toLowerCase() === reference.toLowerCase()
    );

    if (index === -1) {
      return {
        success: false,
        request: null as any,
        error: 'Cash / Float request not found.',
      };
    }

    const current = this.cashFloatRequests[index];

    // Calculate timestamp for the demonstration sequence or current time
    let eventTimestamp = new Date().toISOString();
    if (current.reference === 'TB-CFR-5001') {
      if (newStatus === 'Approved') {
        eventTimestamp = '2026-08-31T11:00:00+02:00';
      } else if (newStatus === 'Processing') {
        eventTimestamp = '2026-08-31T11:10:00+02:00';
      } else if (newStatus === 'Fulfilled') {
        eventTimestamp = '2026-08-31T11:25:00+02:00';
      }
    }

    const newHistoryEntry: import('../types/admin').CashFloatStatusHistoryItem = {
      id: `HIST-CFR-${Date.now()}`,
      status: newStatus,
      actor: actor,
      timestamp: eventTimestamp,
      ...(payload?.reason ? { reason: payload.reason } : {}),
    };

    const existingHistory = current.history ?? [
      {
        id: `HIST-CFR-${current.reference}-1`,
        status: 'Request Submitted',
        actor: current.agentName,
        timestamp: current.requestedAt,
      },
      {
        id: `HIST-CFR-${current.reference}-2`,
        status: 'Pending Review',
        actor: 'TellerBud System',
        timestamp: current.requestedAt,
      },
    ];

    const updated: CashFloatRequest = {
      ...current,
      status: newStatus,
      history: [...existingHistory, newHistoryEntry],
    };

    if (newStatus === 'Fulfilled') {
      updated.fulfilmentMethod =
        current.requestType === 'Float'
          ? 'Manual Float Transfer'
          : 'Physical Cash Handover';
      updated.fulfilledAmount = current.amount;
      updated.fulfilledAt = eventTimestamp;
      if (payload?.manualReference?.trim()) {
        updated.manualReference = payload.manualReference.trim();
      }
      if (payload?.internalNote?.trim()) {
        updated.internalNote = payload.internalNote.trim();
      }
    }

    if (newStatus === 'Rejected') {
      updated.rejectionReason = payload?.reason;
      updated.reason = payload?.reason;
    }

    this.cashFloatRequests[index] = updated;

    // Generate Agent notification
    let notifMessage = '';
    if (newStatus === 'Approved') {
      notifMessage = `Your ${current.requestType} request ${current.reference} has been approved.`;
    } else if (newStatus === 'Processing') {
      notifMessage = `Your ${current.requestType} request ${current.reference} is being processed.`;
    } else if (newStatus === 'Fulfilled') {
      notifMessage = `Your ${current.requestType} request ${current.reference} has been fulfilled.`;
    } else if (newStatus === 'Rejected') {
      notifMessage = `Your ${current.requestType} request ${current.reference} was rejected. View the request for details.`;
    }

    if (notifMessage) {
      const newNotif: AdminNotification = {
        id: `notif-cfr-${Date.now()}`,
        title: notifMessage,
        category: 'Operations',
        timestamp: eventTimestamp,
        read: false,
        actionUrl: `/operations/cash-float-requests/${current.reference}`,
      };
      this.notifications = [newNotif, ...this.notifications];
    }

    // Trigger subscribers across app (dashboard, sidebar, queues)
    this.notifyListeners();

    return {
      success: true,
      request: { ...updated },
    };
  }

  // ==========================================
  // Agent-to-Agent Liquidity Monitoring Methods
  // ==========================================

  async getAgentLiquidityRequests(
    filters?: Partial<AgentToAgentFilters>,
    sort: { field: AgentToAgentSortField; direction: AgentToAgentSortDirection } = {
      field: 'requestedAt',
      direction: 'desc',
    },
    businessName?: string
  ): Promise<{
    items: AgentToAgentRequest[];
    total: number;
    summary: AgentToAgentStatusSummary;
  }> {
    let result = [...this.agentLiquidityRequests];

    // Scoping to business if Business Owner
    if (businessName) {
      const bn = businessName.toLowerCase();
      result = result.filter(
        (r) =>
          r.requestingAgentBusiness.toLowerCase() === bn ||
          r.currentOfferedAgent?.business.toLowerCase() === bn ||
          r.matchedAgent?.business.toLowerCase() === bn
      );
    }

    // 1. Status Filter
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((r) => r.status === filters.status);
    }

    // 2. Request Type Filter (Cash vs Float)
    if (filters?.requestType && filters.requestType !== 'ALL') {
      result = result.filter((r) => r.requestType === filters.requestType);
    }

    // 3. Search Filter
    // Matches: reference, requesting Agent name, ID, phone, offered Agent name, matched Agent name, matched Agent ID, associated Business names
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter((r) => {
        const refMatch = r.reference.toLowerCase().includes(q);
        const reqAgentNameMatch = r.requestingAgentName.toLowerCase().includes(q);
        const reqAgentIdMatch = r.requestingAgentId.toLowerCase().includes(q);
        const reqAgentPhoneMatch = r.requestingAgentPhone.toLowerCase().includes(q);
        const reqAgentBizMatch = r.requestingAgentBusiness.toLowerCase().includes(q);
        const offeredAgentNameMatch = r.currentOfferedAgent?.name.toLowerCase().includes(q) || false;
        const matchedAgentNameMatch = r.matchedAgent?.name.toLowerCase().includes(q) || false;
        const matchedAgentIdMatch = r.matchedAgent?.id.toLowerCase().includes(q) || false;
        const matchedAgentBizMatch = r.matchedAgent?.business.toLowerCase().includes(q) || false;

        return (
          refMatch ||
          reqAgentNameMatch ||
          reqAgentIdMatch ||
          reqAgentPhoneMatch ||
          reqAgentBizMatch ||
          offeredAgentNameMatch ||
          matchedAgentNameMatch ||
          matchedAgentIdMatch ||
          matchedAgentBizMatch
        );
      });
    }

    // 4. Date Range Filters (From / To) in Africa/Lusaka
    if (filters?.fromDate) {
      const fromDate = filters.fromDate;
      result = result.filter((r) => {
        const reqDate = r.requestedAt.split('T')[0];
        return reqDate >= fromDate;
      });
    }

    if (filters?.toDate) {
      const toDate = filters.toDate;
      result = result.filter((r) => {
        const reqDate = r.requestedAt.split('T')[0];
        return reqDate <= toDate;
      });
    }

    // 5. Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sort.field === 'requestedAt') {
        comparison = new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      } else if (sort.field === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sort.field === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    const scopedAll = businessName
      ? this.agentLiquidityRequests.filter(
          (r) =>
            r.requestingAgentBusiness.toLowerCase() === businessName.toLowerCase() ||
            r.currentOfferedAgent?.business.toLowerCase() === businessName.toLowerCase() ||
            r.matchedAgent?.business.toLowerCase() === businessName.toLowerCase()
        )
      : this.agentLiquidityRequests;

    const summary = deriveAgentLiquidityStatusSummary(scopedAll);

    return {
      items: result,
      total: result.length,
      summary,
    };
  }

  async getAgentLiquidityRequestByReference(
    reference: string
  ): Promise<AgentToAgentRequest | null> {
    const found = this.agentLiquidityRequests.find(
      (r) => r.reference.toLowerCase() === reference.toLowerCase()
    );
    return found ? { ...found } : null;
  }

  async getAgentLiquidityStatusSummary(businessName?: string): Promise<AgentToAgentStatusSummary> {
    const scoped = businessName
      ? this.agentLiquidityRequests.filter(
          (r) =>
            r.requestingAgentBusiness.toLowerCase() === businessName.toLowerCase() ||
            r.currentOfferedAgent?.business.toLowerCase() === businessName.toLowerCase() ||
            r.matchedAgent?.business.toLowerCase() === businessName.toLowerCase()
        )
      : this.agentLiquidityRequests;
    return deriveAgentLiquidityStatusSummary(scoped);
  }

  // ==========================================
  // Walk-In Transactions Methods
  // ==========================================

  async getWalkInTransactions(
    filters?: Partial<WalkInFilters>,
    sort: { field: WalkInSortField; direction: WalkInSortDirection } = {
      field: 'transactionTime',
      direction: 'desc',
    },
    businessIdOrName?: string
  ): Promise<{
    items: WalkInTransaction[];
    total: number;
    summary: WalkInStatusSummary;
  }> {
    let result = [...this.walkInTransactions];

    // Scoping to business if Business Owner (matching by businessId or businessName)
    if (businessIdOrName) {
      const bn = businessIdOrName.toLowerCase();
      result = result.filter(
        (t) =>
          t.businessId.toLowerCase() === bn ||
          t.businessName.toLowerCase() === bn
      );
    }

    // 1. Status Filter
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((t) => t.status === filters.status);
    }

    // 2. Transaction Type Filter
    if (filters?.transactionType && filters.transactionType !== 'ALL') {
      result = result.filter((t) => t.transactionType === filters.transactionType);
    }

    // 3. Vendor Filter
    if (filters?.vendor && filters.vendor !== 'ALL') {
      result = result.filter((t) => t.vendor === filters.vendor);
    }

    // 4. Search Filter
    // Placeholder: "Search reference, Agent or phone"
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const cleanPhone = q.replace(/\s+/g, '');
      result = result.filter((t) => {
        const refMatch = t.reference.toLowerCase().includes(q);
        const agentNameMatch = t.agentName.toLowerCase().includes(q);
        const agentIdMatch = t.agentId.toLowerCase().includes(q);
        const agentPhoneMatch = t.agentPhone.replace(/\s+/g, '').toLowerCase().includes(cleanPhone);
        const custPhoneMatch = t.customerPhone.replace(/\s+/g, '').toLowerCase().includes(cleanPhone);
        const vendorMatch = t.vendor.toLowerCase().includes(q);

        return (
          refMatch ||
          agentNameMatch ||
          agentIdMatch ||
          agentPhoneMatch ||
          custPhoneMatch ||
          vendorMatch
        );
      });
    }

    // 5. Date Range Filters (From / To)
    if (filters?.fromDate) {
      const fromDate = filters.fromDate;
      result = result.filter((t) => {
        const txDate = t.transactionTime.split('T')[0];
        return txDate >= fromDate;
      });
    }

    if (filters?.toDate) {
      const toDate = filters.toDate;
      result = result.filter((t) => {
        const txDate = t.transactionTime.split('T')[0];
        return txDate <= toDate;
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sort.field === 'transactionTime') {
        comparison = new Date(a.transactionTime).getTime() - new Date(b.transactionTime).getTime();
      } else if (sort.field === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sort.field === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    const scopedAll = businessIdOrName
      ? this.walkInTransactions.filter(
          (t) =>
            t.businessId.toLowerCase() === businessIdOrName.toLowerCase() ||
            t.businessName.toLowerCase() === businessIdOrName.toLowerCase()
        )
      : this.walkInTransactions;

    const summary = deriveWalkInStatusSummary(scopedAll);

    return {
      items: result,
      total: result.length,
      summary,
    };
  }

  async getWalkInTransactionByReference(
    reference: string
  ): Promise<WalkInTransaction | null> {
    const cleanRef = reference.trim().toLowerCase();
    const found = this.walkInTransactions.find(
      (t) => t.reference.toLowerCase() === cleanRef || t.id.toLowerCase() === cleanRef
    );
    return found ? { ...found } : null;
  }

  async getWalkInStatusSummary(businessIdOrName?: string): Promise<WalkInStatusSummary> {
    const scoped = businessIdOrName
      ? this.walkInTransactions.filter(
          (t) =>
            t.businessId.toLowerCase() === businessIdOrName.toLowerCase() ||
            t.businessName.toLowerCase() === businessIdOrName.toLowerCase()
        )
      : this.walkInTransactions;
    return deriveWalkInStatusSummary(scoped);
  }

  // ==========================================
  // Mobile Money Transactions Methods
  // ==========================================

  async getMobileMoneyTransactions(
    filters?: Partial<MobileMoneyFilters>,
    sort: { field: MobileMoneySortField; direction: MobileMoneySortDirection } = {
      field: 'postedAt',
      direction: 'desc',
    },
    businessScope?: string
  ): Promise<{
    items: MobileMoneyTransaction[];
    total: number;
    summary: MobileMoneySummary;
  }> {
    return queryMobileMoneyTransactions(
      this.mobileMoneyTransactions,
      filters,
      sort,
      businessScope
    );
  }

  async getMobileMoneyTransactionByReference(
    reference: string
  ): Promise<MobileMoneyTransaction | null> {
    const cleanRef = reference.trim().toLowerCase();
    const found = this.mobileMoneyTransactions.find(
      (t) =>
        t.reference.toLowerCase() === cleanRef ||
        (t.sourceReference && t.sourceReference.toLowerCase() === cleanRef) ||
        t.id.toLowerCase() === cleanRef
    );
    return found ? { ...found } : null;
  }

  // ==========================================
  // Agent Directory Methods (Business Owner & Admin)
  // ==========================================

  private agents: AgentRecord[] = [...MOCK_AGENTS];

  async getAgents(
    filters?: Partial<AgentFilters>,
    sort?: { field: AgentSortField; direction: AgentSortDirection },
    businessIdOrName?: string
  ): Promise<{ items: AgentRecord[]; total: number; summary: AgentStatusSummary }> {
    let result = [...this.agents];

    // 1. Mandatory Business ID Scoping Rule
    if (businessIdOrName) {
      const matchTarget = businessIdOrName.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.businessId.toLowerCase() === matchTarget ||
          a.businessName.toLowerCase() === matchTarget
      );
    }

    // Baseline scoped set for dynamic tab counts
    const scopedBaseline = [...result];
    const summary = deriveAgentStatusSummary(scopedBaseline);

    // 2. Search filtering (Name, ID, Phone)
    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q)
      );
    }

    // 3. Availability filtering
    if (filters?.availability && filters.availability !== 'ALL') {
      if (filters.availability === 'Online') {
        result = result.filter(
          (a) => a.availability === 'Available' || a.availability === 'Assigned'
        );
      } else {
        result = result.filter((a) => a.availability === filters.availability);
      }
    }

    // 4. Assignment filtering
    if (filters?.assignment && filters.assignment !== 'ALL') {
      result = result.filter((a) => a.assignment === filters.assignment);
    }

    // 5. Attendance filtering
    if (filters?.attendance && filters.attendance !== 'ALL') {
      result = result.filter((a) => a.attendance === filters.attendance);
    }

    // 6. Operational Priority Sorting
    // Priority: 1. Assigned, 2. Available, 3. Offline
    result = sortAgentsByOperationalPriority(
      result,
      sort?.field || 'operationalPriority',
      sort?.direction || 'asc'
    );

    return {
      items: result,
      total: result.length,
      summary,
    };
  }

  async getAgentById(
    id: string,
    businessIdOrName?: string
  ): Promise<AgentRecord | null> {
    const cleanId = id.trim().toLowerCase();
    const found = this.agents.find(
      (a) => a.id.toLowerCase() === cleanId
    );

    if (!found) return null;

    // Verify business scoping if provided
    if (businessIdOrName) {
      const matchTarget = businessIdOrName.trim().toLowerCase();
      if (
        found.businessId.toLowerCase() !== matchTarget &&
        found.businessName.toLowerCase() !== matchTarget
      ) {
        return null;
      }
    }

    return { ...found };
  }

  async getAgentStatusSummary(
    businessIdOrName?: string
  ): Promise<AgentStatusSummary> {
    const scoped = businessIdOrName
      ? this.agents.filter(
          (a) =>
            a.businessId.toLowerCase() === businessIdOrName.toLowerCase() ||
            a.businessName.toLowerCase() === businessIdOrName.toLowerCase()
        )
      : this.agents;
    return deriveAgentStatusSummary(scoped);
  }

  // =========================================================================
  // Attendance & End-of-Day Methods
  // =========================================================================

  private attendanceRecords: AttendanceRecord[] = [...MOCK_ATTENDANCE_RECORDS];
  private eodRecords: EndOfDayRecord[] = [...MOCK_EOD_RECORDS];

  async getAttendanceRecords(
    filters?: Partial<AttendanceFilters>,
    businessId?: string
  ): Promise<{ items: AttendanceRecord[]; total: number; metrics: AttendanceMetrics }> {
    const activeDate = filters?.date || TODAY_DATE;
    const defaultFilters: AttendanceFilters = {
      search: filters?.search || '',
      date: activeDate,
      status: filters?.status || 'ALL',
      assignment: filters?.assignment || 'ALL',
    };

    const items = filterAttendanceRecords(this.attendanceRecords, defaultFilters, businessId);
    const metrics = deriveAttendanceMetrics(this.attendanceRecords, businessId, activeDate);

    return {
      items,
      total: items.length,
      metrics,
    };
  }

  async getAttendanceRecordById(
    id: string,
    businessId?: string
  ): Promise<AttendanceRecord | null> {
    const found = this.attendanceRecords.find((r) => r.id === id || r.agentId === id);
    if (!found) return null;
    if (businessId && found.businessId !== businessId) return null;
    return { ...found };
  }

  async getAttendanceMetrics(
    businessId?: string,
    date?: string
  ): Promise<AttendanceMetrics> {
    return deriveAttendanceMetrics(this.attendanceRecords, businessId, date || TODAY_DATE);
  }

  async checkInAgent(
    agentId: string,
    checkInTime: string = '09:00 AM'
  ): Promise<{ success: boolean; record?: AttendanceRecord }> {
    const recordIndex = this.attendanceRecords.findIndex(
      (r) => (r.agentId === agentId || r.id === agentId) && r.date === TODAY_DATE
    );
    if (recordIndex !== -1) {
      this.attendanceRecords[recordIndex] = {
        ...this.attendanceRecords[recordIndex],
        status: 'Checked In',
        checkInTime: checkInTime,
        checkedInDuration: 'In Progress',
        totalHours: 'In Progress',
        lastActive: 'Just now',
        timeline: [
          ...this.attendanceRecords[recordIndex].timeline,
          { id: `ev-${Date.now()}`, event: 'Checked In', timestamp: checkInTime },
        ],
      };
    }

    const agentIndex = this.agents.findIndex(
      (a) => a.id === agentId
    );
    if (agentIndex !== -1) {
      this.agents[agentIndex] = {
        ...this.agents[agentIndex],
        attendance: 'Checked In',
        checkInTime: checkInTime,
        lastActive: 'Just now',
      };
    }

    this.notifyListeners();
    return {
      success: true,
      record: recordIndex !== -1 ? { ...this.attendanceRecords[recordIndex] } : undefined,
    };
  }

  async getEndOfDayRecords(
    filters?: Partial<EndOfDayFilters>,
    businessId?: string
  ): Promise<{ items: EndOfDayRecord[]; total: number; metrics: EndOfDayMetrics }> {
    const activeDate = filters?.businessDate || TODAY_DATE;
    const defaultFilters: EndOfDayFilters = {
      search: filters?.search || '',
      businessDate: activeDate,
      status: filters?.status || 'ALL',
      availability: filters?.availability || 'ALL',
    };

    const items = filterEndOfDayRecords(this.eodRecords, defaultFilters, businessId);
    const metrics = deriveEndOfDayMetrics(this.eodRecords, businessId, activeDate);

    return {
      items,
      total: items.length,
      metrics,
    };
  }

  async getEndOfDayRecordByReference(
    reference: string,
    businessId?: string
  ): Promise<EndOfDayRecord | null> {
    const found = this.eodRecords.find(
      (r) => r.reference.toLowerCase() === reference.toLowerCase() || r.id === reference
    );
    if (!found) return null;
    if (businessId && found.businessId !== businessId) return null;
    return { ...found };
  }

  async getEndOfDayMetrics(
    businessId?: string,
    date?: string
  ): Promise<EndOfDayMetrics> {
    return deriveEndOfDayMetrics(this.eodRecords, businessId, date || TODAY_DATE);
  }

  async getBusinessProfile(businessId?: string): Promise<BusinessProfile | null> {
    const targetId = businessId || 'BIZ-LUS-001';
    const profile = this.businessProfiles[targetId] || this.businessProfiles['BIZ-LUS-001'];
    if (!profile) return null;

    // Dynamically derive agent counts from shared agent state
    const scopedAgents = this.agents.filter(
      (a) =>
        a.businessId.toLowerCase() === targetId.toLowerCase() ||
        a.businessName.toLowerCase() === profile.businessName.toLowerCase()
    );
    const summary = deriveAgentStatusSummary(scopedAgents.length > 0 ? scopedAgents : this.agents);

    return {
      ...profile,
      registeredAgents: summary.all,
      agentsOnline: summary.online,
      activeAgents: summary.online,
    };
  }

  async updateBusinessProfile(
    businessId: string,
    updates: EditableBusinessProfileFields
  ): Promise<{ success: boolean; profile?: BusinessProfile; error?: string }> {
    const targetId = businessId || 'BIZ-LUS-001';
    const current = this.businessProfiles[targetId] || this.businessProfiles['BIZ-LUS-001'];
    if (!current) {
      return { success: false, error: 'Business profile not found.' };
    }

    const updatedProfile: BusinessProfile = {
      ...current,
      primaryContactPerson: updates.primaryContactPerson ? updates.primaryContactPerson.trim() : current.primaryContactPerson,
      businessPhone: updates.businessPhone.trim(),
      businessEmail: updates.businessEmail.trim(),
      alternativePhone: updates.alternativePhone ? updates.alternativePhone.trim() : undefined,
      streetAddress: updates.streetAddress.trim(),
      area: updates.area.trim(),
      city: updates.city.trim(),
      province: updates.province.trim(),
      logoUrl: updates.logoUrl !== undefined ? updates.logoUrl : current.logoUrl,
    };

    this.businessProfiles[targetId] = updatedProfile;
    persistBusinessProfiles(this.businessProfiles);
    this.notifyListeners();

    return { success: true, profile: { ...updatedProfile } };
  }

  private businessWallet: BusinessWallet = { ...MOCK_BUSINESS_WALLET };
  private globalWalletActivities: GlobalWalletActivity[] = [...MOCK_GLOBAL_WALLET_ACTIVITIES];
  private globalWalletLedger: GlobalWalletLedgerRecord[] = [...MOCK_GLOBAL_WALLET_LEDGER_RECORDS];

  async getBusinessWallet(businessId?: string): Promise<BusinessWallet> {
    return { ...this.businessWallet };
  }

  async getBusinessWalletLedger(businessId?: string): Promise<BusinessWalletLedgerEntry[]> {
    return this.globalWalletLedger.map((rec) => ({
      id: rec.id,
      reference: rec.reference,
      timestamp: rec.dateTime,
      type: rec.transactionType,
      description: rec.description,
      direction: rec.direction,
      amount: rec.amount,
      balanceAfter: rec.balanceAfter,
      category: rec.transactionType === 'Business Wallet Funding'
        ? 'Float Funding'
        : rec.transactionType === 'Commission'
        ? 'Fee Commission'
        : rec.transactionType === 'TellerBud Charge'
        ? 'Platform Fee'
        : 'Agent Liquidity',
      ledgerEntry: rec.ledgerEntry,
      debit: rec.debit,
      credit: rec.credit,
      balanceBefore: rec.balanceBefore,
      agent: rec.agent,
      status: rec.status,
      rawDate: rec.rawDate,
      relatedReference: rec.relatedReference,
      relatedPath: rec.relatedPath,
      businessName: rec.businessName,
      businessId: rec.businessId,
      lifecycleHistory: rec.lifecycleHistory,
    }));
  }

  async getGlobalWalletLedgerRecords(businessId?: string): Promise<GlobalWalletLedgerRecord[]> {
    return [...this.globalWalletLedger];
  }

  async getGlobalWalletActivities(businessId?: string): Promise<GlobalWalletActivity[]> {
    return [...this.globalWalletActivities];
  }

  async getGlobalWalletActivityById(
    idOrRef: string,
    businessId?: string
  ): Promise<GlobalWalletActivity | null> {
    const clean = idOrRef.trim().toLowerCase();
    const found = this.globalWalletActivities.find(
      (a) => a.id.toLowerCase() === clean || a.reference.toLowerCase() === clean
    );
    return found ? { ...found } : null;
  }

  async submitGlobalWalletFunding(params: {
    provider: 'MTN Mobile Money' | 'Airtel Money';
    phoneNumber: string;
    amount: number;
    actorName?: string;
    businessId?: string;
  }): Promise<{ success: boolean; error?: string; activity?: GlobalWalletActivity }> {
    if (params.amount <= 0) {
      return { success: false, error: 'Amount must be greater than zero.' };
    }

    const currentBal = this.businessWallet.currentBalance;
    const nowStr = 'Today, ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const todayYMD = new Date().toISOString().split('T')[0];
    const actor = 'Chileshe Mwamba — Business Owner';
    const ref = `TB-FND-${Math.floor(1000 + Math.random() * 9000)}`;

    const digits = params.phoneNumber.replace(/\D/g, '');
    const local9 = digits.startsWith('260') ? digits.slice(3) : digits.slice(-9);
    const prefix = local9.slice(0, 2);
    const last2 = local9.slice(-2);
    const masked = `+260 ${prefix} ••• ••${last2}`;

    const provRef = params.provider === 'MTN Mobile Money'
      ? `EXT-MTN-${Math.floor(100000 + Math.random() * 900000)}`
      : `EXT-AIR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newActivity: GlobalWalletActivity = {
      id: `GWA-${Math.floor(1000 + Math.random() * 9000)}`,
      reference: ref,
      dateTime: nowStr,
      rawDate: todayYMD,
      transactionType: 'Funding',
      subType: `Verified ${params.provider} Funding`,
      initiatedBy: {
        name: 'Chileshe Mwamba',
        role: 'Business Owner',
        avatarInitials: 'CM',
      },
      agent: null,
      description: `Global Wallet funding through ${params.provider}.`,
      debit: null,
      credit: params.amount,
      balanceBefore: currentBal,
      balanceAfter: currentBal,
      status: 'Pending',
      externalProvider: params.provider,
      providerReference: provRef,
      mobileMoneyNumber: masked,
      createdTimestamp: nowStr,
      lifecycleHistory: [
        {
          step: 'Funding Initiated',
          timestamp: nowStr,
          status: 'Completed',
          actor,
          details: 'Funding request submitted.',
        },
      ],
    };

    this.globalWalletActivities.unshift(newActivity);
    this.notifyListeners();
    return { success: true, activity: newActivity };
  }

  async verifyFundingWebhook(reference: string): Promise<{
    success: boolean;
    error?: string;
    wallet?: BusinessWallet;
    activity?: GlobalWalletActivity;
  }> {
    const activity = this.globalWalletActivities.find((a) => a.reference === reference);
    if (!activity) {
      return { success: false, error: 'Activity record not found.' };
    }
    if (activity.status === 'Completed') {
      return { success: true, wallet: this.businessWallet, activity };
    }

    const previousBalance = this.businessWallet.currentBalance;
    const newBalance = previousBalance + (activity.credit || 0);
    const nowStr = 'Today, ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const todayYMD = new Date().toISOString().split('T')[0];

    // Credit the Available Balance exactly once
    this.businessWallet = {
      ...this.businessWallet,
      currentBalance: newBalance,
      availableBalance: newBalance,
      totalBalance: newBalance,
      lastUpdated: 'Just now',
    };

    activity.status = 'Completed';
    activity.balanceBefore = previousBalance;
    activity.balanceAfter = newBalance;
    activity.completedTimestamp = nowStr;
    activity.lifecycleHistory.push(
      {
        step: 'Provider Confirmation Received',
        timestamp: nowStr,
        status: 'Completed',
        actor: activity.externalProvider || 'Mobile Money Switch',
        details: 'Provider payment confirmation verified.',
      },
      {
        step: 'Global Wallet Credited',
        timestamp: nowStr,
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: `ZMW ${(activity.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} credited to the Global Wallet.`,
      }
    );

    // Ledger record
    const numSuffix = activity.reference.split('-')[2] || `${Math.floor(1000 + Math.random() * 9000)}`;
    const ledgerRef = `BWL-${numSuffix}`;
    const amountVal = activity.credit || 0;
    const formattedBefore = `ZMW ${previousBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formattedAmount = `ZMW ${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formattedAfter = `ZMW ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const newLedgerEntry: GlobalWalletLedgerRecord = {
      id: ledgerRef,
      ledgerEntry: ledgerRef,
      reference: activity.reference,
      dateTime: nowStr,
      rawDate: todayYMD,
      transactionType: 'Funding',
      entryType: 'Funding',
      initiatedByAttribution: `${activity.initiatedBy?.name || 'Chileshe Mwamba'} — Business Owner`,
      calculation: `${formattedBefore} + ${formattedAmount} = ${formattedAfter}`,
      agent: null,
      direction: 'Credit',
      amount: amountVal,
      debit: null,
      credit: activity.credit,
      balanceBefore: previousBalance,
      balanceAfter: newBalance,
      status: 'Posted',
      description: activity.description,
      relatedReference: activity.reference,
      businessName: this.businessWallet.businessName,
      businessId: this.businessWallet.businessId,
      lifecycleHistory: [
        {
          step: 'Funding Confirmed',
          timestamp: nowStr,
          status: 'Completed',
          actor: activity.externalProvider || 'Mobile Money Switch',
          details: `Confirmed via ${activity.externalProvider || 'Mobile Money Network'}.`,
        },
        {
          step: 'Global Wallet Credited',
          timestamp: nowStr,
          status: 'Completed',
          actor: 'TellerBud Core Ledger',
          details: `ZMW ${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} credited to Global Wallet.`,
        },
        {
          step: 'Ledger Posting Created',
          timestamp: nowStr,
          status: 'Completed',
          actor: 'TellerBud Core Ledger',
          details: 'Immutable ledger entry posted to central audit trail.',
        },
      ],
    };

    this.globalWalletLedger.unshift(newLedgerEntry);
    this.notifyListeners();

    return { success: true, wallet: { ...this.businessWallet }, activity: { ...activity } };
  }

  async addFundsToGlobalWallet(params: {
    provider: 'MTN Mobile Money' | 'Airtel Money';
    phoneNumber: string;
    amount: number;
    reference: string;
    actorName?: string;
    businessId?: string;
  }): Promise<{ success: boolean; error?: string; wallet?: BusinessWallet; activity?: GlobalWalletActivity }> {
    const submitRes = await this.submitGlobalWalletFunding({
      provider: params.provider,
      phoneNumber: params.phoneNumber,
      amount: params.amount,
      actorName: params.actorName,
      businessId: params.businessId,
    });
    if (!submitRes.success || !submitRes.activity) {
      return { success: false, error: submitRes.error };
    }
    // Instant confirmation
    return this.verifyFundingWebhook(submitRes.activity.reference);
  }

  async submitGlobalWalletWithdrawal(params: {
    provider: 'MTN Mobile Money' | 'Airtel Money';
    destinationNumber: string;
    amount: number;
    actorName?: string;
    businessId?: string;
  }): Promise<{ success: boolean; error?: string; activity?: GlobalWalletActivity }> {
    if (params.amount <= 0) {
      return { success: false, error: 'Amount must be greater than zero.' };
    }

    if (params.amount > this.businessWallet.currentBalance) {
      return { success: false, error: 'Requested amount exceeds Available Balance.' };
    }

    const currentBal = this.businessWallet.currentBalance;
    const nowStr = 'Today, ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const todayYMD = new Date().toISOString().split('T')[0];
    const actor = 'Chileshe Mwamba — Business Owner';
    const ref = `TB-WDL-${Math.floor(1000 + Math.random() * 9000)}`;

    const digits = params.destinationNumber.replace(/\D/g, '');
    const local9 = digits.startsWith('260') ? digits.slice(3) : digits.slice(-9);
    const prefix = local9.slice(0, 2);
    const last2 = local9.slice(-2);
    const masked = `+260 ${prefix} ••• ••${last2}`;

    const newActivity: GlobalWalletActivity = {
      id: `GWA-${Math.floor(1000 + Math.random() * 9000)}`,
      reference: ref,
      dateTime: nowStr,
      rawDate: todayYMD,
      transactionType: 'Withdrawal',
      subType: `Paid Global Wallet Withdrawal`,
      initiatedBy: {
        name: 'Chileshe Mwamba',
        role: 'Business Owner',
        avatarInitials: 'CM',
      },
      agent: null,
      description: `Global Wallet withdrawal payout to ${params.provider} account (${masked}).`,
      debit: params.amount,
      credit: null,
      balanceBefore: currentBal,
      balanceAfter: currentBal, // Balance NOT reduced while pending review
      status: 'Pending',
      externalProvider: params.provider,
      providerReference: `EXT-WDL-${Math.floor(100000 + Math.random() * 900000)}`,
      mobileMoneyNumber: masked,
      createdTimestamp: nowStr,
      lifecycleHistory: [
        {
          step: 'Withdrawal Requested',
          timestamp: nowStr,
          status: 'Completed',
          actor,
          details: 'Withdrawal payout request submitted.',
        },
      ],
    };

    this.globalWalletActivities.unshift(newActivity);
    this.notifyListeners();

    return { success: true, activity: newActivity };
  }

  async markWithdrawalAsPaid(reference: string): Promise<{
    success: boolean;
    error?: string;
    wallet?: BusinessWallet;
    activity?: GlobalWalletActivity;
  }> {
    const activity = this.globalWalletActivities.find((a) => a.reference === reference);
    if (!activity) {
      return { success: false, error: 'Withdrawal record not found.' };
    }
    if (activity.status === 'Completed') {
      return { success: true, wallet: this.businessWallet, activity };
    }

    const previousBalance = this.businessWallet.currentBalance;
    const newBalance = previousBalance - (activity.debit || 0);
    const nowStr = 'Today, ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const todayYMD = new Date().toISOString().split('T')[0];

    // Debit the Global Wallet exactly once only after TellerBud Admin marks as Paid
    this.businessWallet = {
      ...this.businessWallet,
      currentBalance: newBalance,
      availableBalance: newBalance,
      totalBalance: newBalance,
      lastUpdated: 'Just now',
    };

    activity.status = 'Completed';
    activity.balanceBefore = previousBalance;
    activity.balanceAfter = newBalance;
    activity.completedTimestamp = nowStr;
    activity.lifecycleHistory.push(
      {
        step: 'TellerBud Admin Approved & Paid',
        timestamp: nowStr,
        status: 'Completed',
        actor: 'TellerBud Admin',
        details: 'Reviewed, approved, and external payout executed.',
      },
      {
        step: 'Global Wallet Debited',
        timestamp: nowStr,
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: `ZMW ${(activity.debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} debited from Global Wallet.`,
      }
    );

    // Ledger entry
    const numSuffix = activity.reference.split('-')[2] || `${Math.floor(1000 + Math.random() * 9000)}`;
    const ledgerRef = `BWL-${numSuffix}`;
    const amountVal = activity.debit || 0;
    const formattedBefore = `ZMW ${previousBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formattedAmount = `ZMW ${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formattedAfter = `ZMW ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const newLedgerEntry: GlobalWalletLedgerRecord = {
      id: ledgerRef,
      ledgerEntry: ledgerRef,
      reference: activity.reference,
      dateTime: nowStr,
      rawDate: todayYMD,
      transactionType: 'Withdrawal',
      entryType: 'Withdrawal',
      initiatedByAttribution: `${activity.initiatedBy?.name || 'Chileshe Mwamba'} — Business Owner`,
      calculation: `${formattedBefore} − ${formattedAmount} = ${formattedAfter}`,
      agent: null,
      direction: 'Debit',
      amount: amountVal,
      debit: activity.debit,
      credit: null,
      balanceBefore: previousBalance,
      balanceAfter: newBalance,
      status: 'Posted',
      description: activity.description,
      relatedReference: activity.reference,
      businessName: this.businessWallet.businessName,
      businessId: this.businessWallet.businessId,
      lifecycleHistory: [
        {
          step: 'Withdrawal Requested',
          timestamp: activity.createdTimestamp || nowStr,
          status: 'Completed',
          actor: 'Chileshe Mwamba — Business Owner',
          details: 'Withdrawal payout request submitted.',
        },
        {
          step: 'TellerBud Admin Approved',
          timestamp: nowStr,
          status: 'Completed',
          actor: 'TellerBud Admin',
          details: 'TellerBud Admin authorization confirmed.',
        },
        {
          step: 'Withdrawal Processed',
          timestamp: nowStr,
          status: 'Completed',
          actor: activity.externalProvider || 'Mobile Money Switch',
          details: 'Payout disbursed to recipient mobile wallet.',
        },
        {
          step: 'Global Wallet Debited',
          timestamp: nowStr,
          status: 'Completed',
          actor: 'TellerBud Core Ledger',
          details: `ZMW ${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} debited from Global Wallet.`,
        },
        {
          step: 'Ledger Posting Created',
          timestamp: nowStr,
          status: 'Completed',
          actor: 'TellerBud Core Ledger',
          details: 'Immutable ledger entry posted to central audit trail.',
        },
      ],
    };

    this.globalWalletLedger.unshift(newLedgerEntry);
    this.notifyListeners();

    return { success: true, wallet: { ...this.businessWallet }, activity: { ...activity } };
  }

  async requestGlobalWalletWithdrawal(params: {
    provider: 'MTN Mobile Money' | 'Airtel Money';
    destinationNumber: string;
    amount: number;
    actorName?: string;
    businessId?: string;
  }): Promise<{ success: boolean; error?: string; withdrawalReference?: string }> {
    const submitRes = await this.submitGlobalWalletWithdrawal(params);
    if (!submitRes.success || !submitRes.activity) {
      return { success: false, error: submitRes.error };
    }
    return { success: true, withdrawalReference: submitRes.activity.reference };
  }

  async getAuthorisedAgentsCount(businessId?: string): Promise<number> {
    const targetBusiness = businessId || 'BIZ-LUS-001';
    const agents = this.agents.filter(
      (a) =>
        a.businessId.toLowerCase() === targetBusiness.toLowerCase() ||
        a.businessName.toLowerCase() === targetBusiness.toLowerCase()
    );
    return agents.length;
  }

  async getBusinessTransactions(
    filters?: Partial<BusinessTransactionFilters>,
    businessId?: string
  ): Promise<{
    items: BusinessTransactionRecord[];
    total: number;
    summary: BusinessTransactionStatusCounts;
    totalValue: number;
  }> {
    const targetBusiness = (businessId || 'BIZ-LUS-001').toLowerCase();
    
    // Base transactions strictly belonging to this business
    const baseItems = MOCK_BUSINESS_TRANSACTIONS.filter(
      (tx) => tx.businessId.toLowerCase() === targetBusiness || tx.businessName.toLowerCase().includes('lusaka central')
    );

    // Calculate baseline summary counts across all business records before tab status filtering
    const summary: BusinessTransactionStatusCounts = {
      all: baseItems.length,
      completed: baseItems.filter((t) => t.status === 'Completed').length,
      processing: baseItems.filter((t) => t.status === 'Processing').length,
      pending: baseItems.filter((t) => t.status === 'Pending').length,
      failed: baseItems.filter((t) => t.status === 'Failed').length,
      cancelled: baseItems.filter((t) => t.status === 'Cancelled').length,
      reversed: baseItems.filter((t) => t.status === 'Reversed').length,
    };

    // Filter items based on active criteria
    const filtered = baseItems.filter((tx) => {
      // 1. Search Query
      if (filters?.search && filters.search.trim()) {
        const query = filters.search.trim().toLowerCase();
        const matchesRef = tx.reference.toLowerCase().includes(query);
        const matchesAgent = tx.agentName ? tx.agentName.toLowerCase().includes(query) : false;
        const matchesCounterparty = tx.customerOrCounterparty.toLowerCase().includes(query);
        const matchesPhone = tx.customerPhone ? tx.customerPhone.includes(query) : false;
        const matchesVendor = tx.vendor ? tx.vendor.toLowerCase().includes(query) : false;
        const matchesDesc = tx.description ? tx.description.toLowerCase().includes(query) : false;
        if (!matchesRef && !matchesAgent && !matchesCounterparty && !matchesPhone && !matchesVendor && !matchesDesc) {
          return false;
        }
      }

      // 2. Status
      if (filters?.status && filters.status !== 'All') {
        if (tx.status !== filters.status) return false;
      }

      // 3. Category
      if (filters?.category && filters.category !== 'All') {
        if (tx.category !== filters.category) return false;
      }

      // 4. Transaction Type
      if (filters?.transactionType && filters.transactionType !== 'All') {
        if (tx.transactionType !== filters.transactionType) return false;
      }

      // 5. Vendor
      if (filters?.vendor && filters.vendor !== 'All') {
        if (!tx.vendor || tx.vendor !== filters.vendor) return false;
      }

      // 6. Agent
      if (filters?.agent && filters.agent !== 'All') {
        if (tx.agentName !== filters.agent && tx.agentId !== filters.agent) return false;
      }

      // 7. Date Range
      if (filters?.fromDate && tx.rawDate < filters.fromDate) return false;
      if (filters?.toDate && tx.rawDate > filters.toDate) return false;

      return true;
    });

    const totalValue = filtered.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      items: filtered,
      total: filtered.length,
      summary,
      totalValue,
    };
  }

  async getBusinessTransactionByReference(
    reference: string,
    businessId?: string
  ): Promise<BusinessTransactionRecord | null> {
    const cleanRef = reference.trim().toLowerCase();
    const targetBusiness = (businessId || 'BIZ-LUS-001').toLowerCase();

    const found = MOCK_BUSINESS_TRANSACTIONS.find(
      (tx) =>
        (tx.reference.toLowerCase() === cleanRef || tx.id.toLowerCase() === cleanRef) &&
        (tx.businessId.toLowerCase() === targetBusiness || tx.businessName.toLowerCase().includes('lusaka central'))
    );

    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async getChargesAndCommissions(
    filters?: Partial<ChargeCommissionFilters>,
    businessId?: string
  ): Promise<{
    items: ChargeCommissionRecord[];
    total: number;
    summary: ChargeCommissionSummary;
    tabCounts: ChargeCommissionTabCounts;
  }> {
    const targetBusiness = (businessId || 'BIZ-LUS-001').toLowerCase();

    // Base records scoped strictly to business
    const baseRecords = MOCK_CHARGES_COMMISSIONS.filter(
      (item) =>
        item.businessId.toLowerCase() === targetBusiness ||
        item.businessName.toLowerCase().includes('lusaka central')
    );

    // Tab counts computed from all scoped records
    const tabCounts: ChargeCommissionTabCounts = {
      all: baseRecords.length,
      charges: baseRecords.filter((r) => r.recordType === 'Charge').length,
      commissions: baseRecords.filter((r) => r.recordType === 'Commission').length,
      pending: baseRecords.filter((r) => r.status === 'Pending').length,
      completed: baseRecords.filter((r) => r.status === 'Completed').length,
    };

    // Financial totals include ONLY completed records
    const completedCharges = baseRecords.filter(
      (r) => r.recordType === 'Charge' && r.status === 'Completed'
    );
    const completedCommissions = baseRecords.filter(
      (r) => r.recordType === 'Commission' && r.status === 'Completed'
    );

    const totalCharges = completedCharges.reduce((sum, r) => sum + r.amount, 0);
    const totalCommissions = completedCommissions.reduce((sum, r) => sum + r.amount, 0);
    const netWalletImpact = totalCommissions - totalCharges;
    const currentWalletBalance = MOCK_BUSINESS_WALLET.currentBalance; // Must match Global Wallet / Ledger

    const summary: ChargeCommissionSummary = {
      totalCharges,
      totalCommissions,
      netWalletImpact,
      currentWalletBalance,
    };

    // Apply filters
    const filtered = baseRecords.filter((r) => {
      // Search
      if (filters?.search) {
        const q = filters.search.trim().toLowerCase();
        const matchRef = r.reference.toLowerCase().includes(q);
        const matchTx = r.relatedTransaction.toLowerCase().includes(q);
        const matchAgent = r.agent?.name.toLowerCase().includes(q) || false;
        const matchType = r.subType.toLowerCase().includes(q);
        const matchLedger = r.walletLedgerReference.toLowerCase().includes(q);
        if (!matchRef && !matchTx && !matchAgent && !matchType && !matchLedger) {
          return false;
        }
      }

      // Record Type
      if (filters?.recordType && filters.recordType !== 'All') {
        if (r.recordType !== filters.recordType) return false;
      }

      // Sub Type
      if (filters?.subType && filters.subType !== 'All') {
        if (r.subType !== filters.subType) return false;
      }

      // Agent
      if (filters?.agent && filters.agent !== 'All') {
        if (r.agent?.name !== filters.agent && r.agent?.id !== filters.agent) {
          return false;
        }
      }

      // Status
      if (filters?.status && filters.status !== 'All') {
        if (r.status !== filters.status) return false;
      }

      // Date Range
      if (filters?.fromDate && r.rawDate < filters.fromDate) return false;
      if (filters?.toDate && r.rawDate > filters.toDate) return false;

      return true;
    });

    return {
      items: filtered,
      total: filtered.length,
      summary,
      tabCounts,
    };
  }

  async getChargeOrCommissionByReference(
    reference: string,
    businessId?: string
  ): Promise<ChargeCommissionRecord | null> {
    const cleanRef = reference.trim().toLowerCase();
    const targetBusiness = (businessId || 'BIZ-LUS-001').toLowerCase();

    const found = MOCK_CHARGES_COMMISSIONS.find(
      (r) =>
        (r.reference.toLowerCase() === cleanRef || r.id.toLowerCase() === cleanRef) &&
        (r.businessId.toLowerCase() === targetBusiness || r.businessName.toLowerCase().includes('lusaka central'))
    );

    return found ? JSON.parse(JSON.stringify(found)) : null;
  }
}

// Single instance export for app consumption
export const adminService: IAdminService = new MockAdminService();

