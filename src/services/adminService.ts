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
} from '../types/admin';

export interface IAdminService {
  getOperationalMetrics(): Promise<OperationalMetrics>;
  getRequiresAttentionItems(): Promise<RequiresAttentionItem[]>;
  getLivePickupOperations(): Promise<PickupRequest[]>;
  getCustomerRequests(): Promise<PickupRequest[]>;
  getCustomerRequestByReference(reference: string): Promise<PickupRequest | null>;
  getAgentAvailability(): Promise<AgentAvailabilitySummary>;
  getRecentFinancialActivity(): Promise<FinancialActivityRecord[]>;
  getNotifications(businessName?: string): Promise<AdminNotification[]>;
  getUserProfile(): Promise<AdminUserProfile>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(businessName?: string): Promise<void>;
  getCustomerWithdrawals(
    filters?: Partial<WithdrawalFilters>,
    sort?: { field: WithdrawalSortField; direction: WithdrawalSortDirection }
  ): Promise<{ items: CustomerWithdrawal[]; total: number; summary: WithdrawalStatusSummary }>;
  getCustomerWithdrawalByReference(reference: string): Promise<CustomerWithdrawal | null>;
  getWithdrawalStatusSummary(): Promise<WithdrawalStatusSummary>;
  getWithdrawalWalletPosition(reference: string): Promise<import('../types/admin').CustomerWalletPosition | null>;
  updateWithdrawalStatus(
    reference: string,
    newStatus: import('../types/admin').WithdrawalStatus,
    actor: string,
    expectedCurrentStatus?: import('../types/admin').WithdrawalStatus,
    reason?: string
  ): Promise<{ success: boolean; withdrawal: CustomerWithdrawal; error?: string }>;
  getCashFloatRequests(
    filters?: Partial<import('../types/admin').CashFloatFilters>,
    sort?: { field: import('../types/admin').CashFloatSortField; direction: import('../types/admin').CashFloatSortDirection },
    businessName?: string
  ): Promise<{ items: import('../types/admin').CashFloatRequest[]; total: number; summary: import('../types/admin').CashFloatStatusSummary }>;
  getCashFloatRequestByReference(reference: string): Promise<import('../types/admin').CashFloatRequest | null>;
  getCashFloatStatusSummary(businessName?: string): Promise<import('../types/admin').CashFloatStatusSummary>;
  updateCashFloatStatus(
    reference: string,
    newStatus: import('../types/admin').CashFloatStatus,
    actor: string,
    payload?: {
      reason?: string;
      manualReference?: string;
      internalNote?: string;
    }
  ): Promise<{ success: boolean; request: import('../types/admin').CashFloatRequest; error?: string }>;
  getAgentLiquidityRequests(
    filters?: Partial<import('../types/admin').AgentToAgentFilters>,
    sort?: { field: import('../types/admin').AgentToAgentSortField; direction: import('../types/admin').AgentToAgentSortDirection },
    businessName?: string
  ): Promise<{ items: import('../types/admin').AgentToAgentRequest[]; total: number; summary: import('../types/admin').AgentToAgentStatusSummary }>;
  getAgentLiquidityRequestByReference(reference: string): Promise<import('../types/admin').AgentToAgentRequest | null>;
  getAgentLiquidityStatusSummary(businessName?: string): Promise<import('../types/admin').AgentToAgentStatusSummary>;
  getWalkInTransactions(
    filters?: Partial<import('../types/admin').WalkInFilters>,
    sort?: { field: import('../types/admin').WalkInSortField; direction: import('../types/admin').WalkInSortDirection },
    businessIdOrName?: string
  ): Promise<{ items: import('../types/admin').WalkInTransaction[]; total: number; summary: import('../types/admin').WalkInStatusSummary }>;
  getWalkInTransactionByReference(reference: string): Promise<import('../types/admin').WalkInTransaction | null>;
  getWalkInStatusSummary(businessIdOrName?: string): Promise<import('../types/admin').WalkInStatusSummary>;
  getMobileMoneyTransactions(
    filters?: Partial<import('../types/mobileMoney').MobileMoneyFilters>,
    sort?: { field: import('../types/mobileMoney').MobileMoneySortField; direction: import('../types/mobileMoney').MobileMoneySortDirection },
    businessScope?: string
  ): Promise<{ items: import('../types/mobileMoney').MobileMoneyTransaction[]; total: number; summary: import('../types/mobileMoney').MobileMoneySummary }>;
  getMobileMoneyTransactionByReference(reference: string): Promise<import('../types/mobileMoney').MobileMoneyTransaction | null>;
  getAgents(
    filters?: Partial<import('../types/admin').AgentFilters>,
    sort?: { field: import('../types/admin').AgentSortField; direction: import('../types/admin').AgentSortDirection },
    businessIdOrName?: string
  ): Promise<{ items: import('../types/admin').AgentRecord[]; total: number; summary: import('../types/admin').AgentStatusSummary }>;
  getAgentById(id: string, businessIdOrName?: string): Promise<import('../types/admin').AgentRecord | null>;
  getAgentStatusSummary(businessIdOrName?: string): Promise<import('../types/admin').AgentStatusSummary>;
  getAttendanceRecords(
    filters?: Partial<import('../types/attendance').AttendanceFilters>,
    businessId?: string
  ): Promise<{ items: import('../types/attendance').AttendanceRecord[]; total: number; metrics: import('../types/attendance').AttendanceMetrics }>;
  getAttendanceRecordById(id: string, businessId?: string): Promise<import('../types/attendance').AttendanceRecord | null>;
  getAttendanceMetrics(businessId?: string, date?: string): Promise<import('../types/attendance').AttendanceMetrics>;
  checkInAgent(agentId: string, checkInTime?: string): Promise<{ success: boolean; record?: import('../types/attendance').AttendanceRecord }>;
  getEndOfDayRecords(
    filters?: Partial<import('../types/attendance').EndOfDayFilters>,
    businessId?: string
  ): Promise<{ items: import('../types/attendance').EndOfDayRecord[]; total: number; metrics: import('../types/attendance').EndOfDayMetrics }>;
  getEndOfDayRecordByReference(reference: string, businessId?: string): Promise<import('../types/attendance').EndOfDayRecord | null>;
  getEndOfDayMetrics(businessId?: string, date?: string): Promise<import('../types/attendance').EndOfDayMetrics>;
  getBusinessProfile(businessId?: string): Promise<import('../types/businessProfile').BusinessProfile | null>;
  updateBusinessProfile(
    businessId: string,
    updates: import('../types/businessProfile').EditableBusinessProfileFields
  ): Promise<{ success: boolean; profile?: import('../types/businessProfile').BusinessProfile; error?: string }>;
  getBusinessWallet(businessId?: string): Promise<import('../types/admin').BusinessWallet>;
  getBusinessWalletLedger(businessId?: string): Promise<import('../types/admin').BusinessWalletLedgerEntry[]>;
  getGlobalWalletLedgerRecords(businessId?: string): Promise<import('../types/admin').GlobalWalletLedgerRecord[]>;
  getGlobalWalletActivities(businessId?: string): Promise<import('../types/admin').GlobalWalletActivity[]>;
  getGlobalWalletActivityById(idOrRef: string, businessId?: string): Promise<import('../types/admin').GlobalWalletActivity | null>;
  addFundsToGlobalWallet(params: {
    provider: 'MTN Mobile Money' | 'Airtel Money';
    phoneNumber: string;
    amount: number;
    reference: string;
    actorName?: string;
    businessId?: string;
  }): Promise<{ success: boolean; error?: string; wallet?: import('../types/admin').BusinessWallet; activity?: import('../types/admin').GlobalWalletActivity }>;
  submitGlobalWalletFunding(params: {
    provider: 'MTN Mobile Money' | 'Airtel Money';
    phoneNumber: string;
    amount: number;
    actorName?: string;
    businessId?: string;
  }): Promise<{ success: boolean; error?: string; activity?: import('../types/admin').GlobalWalletActivity }>;
  verifyFundingWebhook(reference: string): Promise<{ success: boolean; error?: string; wallet?: import('../types/admin').BusinessWallet; activity?: import('../types/admin').GlobalWalletActivity }>;
  requestGlobalWalletWithdrawal(params: {
    provider: 'MTN Mobile Money' | 'Airtel Money';
    destinationNumber: string;
    amount: number;
    actorName?: string;
    businessId?: string;
  }): Promise<{ success: boolean; error?: string; withdrawalReference?: string }>;
  submitGlobalWalletWithdrawal(params: {
    provider: 'MTN Mobile Money' | 'Airtel Money';
    destinationNumber: string;
    amount: number;
    actorName?: string;
    businessId?: string;
  }): Promise<{ success: boolean; error?: string; activity?: import('../types/admin').GlobalWalletActivity }>;
  markWithdrawalAsPaid(reference: string): Promise<{ success: boolean; error?: string; wallet?: import('../types/admin').BusinessWallet; activity?: import('../types/admin').GlobalWalletActivity }>;
  getAuthorisedAgentsCount(businessId?: string): Promise<number>;
  getBusinessTransactions(
    filters?: Partial<import('../types/admin').BusinessTransactionFilters>,
    businessId?: string
  ): Promise<{
    items: import('../types/admin').BusinessTransactionRecord[];
    total: number;
    summary: import('../types/admin').BusinessTransactionStatusCounts;
    totalValue: number;
  }>;
  getBusinessTransactionByReference(
    reference: string,
    businessId?: string
  ): Promise<import('../types/admin').BusinessTransactionRecord | null>;
  getChargesAndCommissions(
    filters?: Partial<import('../types/chargesCommissions').ChargeCommissionFilters>,
    businessId?: string
  ): Promise<{
    items: import('../types/chargesCommissions').ChargeCommissionRecord[];
    total: number;
    summary: import('../types/chargesCommissions').ChargeCommissionSummary;
    tabCounts: import('../types/chargesCommissions').ChargeCommissionTabCounts;
  }>;
  getChargeOrCommissionByReference(
    reference: string,
    businessId?: string
  ): Promise<import('../types/chargesCommissions').ChargeCommissionRecord | null>;
  subscribe(listener: () => void): () => void;
}

export { adminService } from './mockAdminService';

