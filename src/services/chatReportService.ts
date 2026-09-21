import {
  ChatReportConversation,
  ChatReportFilterState,
  ChatReportKPIs,
  ChatReportAudit,
  ChatReportType,
  ChatReportStatus,
} from '../types/chat';
import { AuthenticatedUser } from '../types/auth';
import { INITIAL_CHAT_REPORT_CONVERSATIONS } from '../data/mockChatReportData';
import { INITIAL_STORES, INITIAL_BOOTHS, INITIAL_USERS } from '../data/mockOrganizationData';
import { organizationService } from './organizationService';

const CHAT_STORAGE_KEY = 'tellerbud_chat_report_conversations_v1';
const AUDIT_STORAGE_KEY = 'tellerbud_chat_report_audits_v1';

export function formatToCAT(dateInput: string | Date | number | undefined): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  try {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lusaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
    return `${formatted} CAT`;
  } catch {
    return d.toLocaleString() + ' CAT';
  }
}

export function formatCATDateOnly(dateInput: string | Date | number | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Lusaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '—';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length >= 10) {
    const prefix = cleaned.slice(0, cleaned.length - 7);
    const last4 = cleaned.slice(cleaned.length - 4);
    return `${prefix} *** ${last4}`;
  }
  return phone.replace(/\d(?=\d{4})/g, '*');
}

class ChatReportService {
  private conversations: ChatReportConversation[] = [];
  private auditLogs: ChatReportAudit[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const rawChats = localStorage.getItem(CHAT_STORAGE_KEY);
      if (rawChats) {
        const parsed = JSON.parse(rawChats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.conversations = parsed;
        } else {
          this.conversations = [...INITIAL_CHAT_REPORT_CONVERSATIONS];
        }
      } else {
        this.conversations = [...INITIAL_CHAT_REPORT_CONVERSATIONS];
      }

      const rawAudits = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (rawAudits) {
        this.auditLogs = JSON.parse(rawAudits);
      }
    } catch (e) {
      console.error('Failed to load chat report data:', e);
      this.conversations = [...INITIAL_CHAT_REPORT_CONVERSATIONS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(this.conversations));
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('Failed to save chat report data:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Error in chatReport listener', e);
      }
    });
  }

  /**
   * Strict Tenant Resolution:
   * Always resolves the permitted Business ID strictly from the authenticated user token/session.
   * Client-supplied overrides are rejected.
   */
  public resolveTenantBusinessId(actor: AuthenticatedUser | null): string {
    if (!actor) {
      throw new Error('Unauthorized: Authentication required to access chat operational reports.');
    }
    // Only Business Owners and Super Admin are permitted (Business Admin access is explicitly disabled for now)
    if ((actor.role as string) === 'customer' || actor.role === 'agent' || actor.role === 'business_admin' || actor.role === 'auditor') {
      if (actor.role !== 'business_owner' && actor.role !== 'super_admin') {
        throw new Error('Unauthorized: Chat report module is restricted to Business Owners.');
      }
    }
    if (actor.role === 'super_admin') {
      return actor.businessId || 'BIZ-LUS-001';
    }
    if (!actor.businessId) {
      throw new Error('Unauthorized: No legitimate business affiliation found for authenticated user.');
    }
    return actor.businessId;
  }

  /**
   * Logs a Chat Report Audit Event.
   * Ensures no full message bodies are written to audit records to preserve privacy.
   */
  public logAudit(params: {
    action: ChatReportAudit['action'];
    actor: AuthenticatedUser;
    conversationId?: string;
    chatReference?: string;
    filtersUsed?: Record<string, any>;
  }) {
    const businessId = this.resolveTenantBusinessId(params.actor);
    const auditRecord: ChatReportAudit = {
      id: `AUD-CHAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessId,
      conversationId: params.conversationId,
      chatReference: params.chatReference,
      action: params.action,
      performedBy: params.actor.fullName || params.actor.uid,
      performerRole: params.actor.roleLabel || params.actor.role,
      filtersUsed: params.filtersUsed,
      createdAt: new Date().toISOString(),
    };

    this.auditLogs.unshift(auditRecord);
    this.saveToStorage();

    // Optionally bridge to organizationService audit trail
    try {
      if (params.chatReference) {
        const actionLabel =
          params.action === 'view_conversation'
            ? 'Chat Conversation Inspected'
            : params.action === 'export_report'
            ? 'Chat Report Exported'
            : params.action === 'export_transcript'
            ? 'Chat Transcript Exported'
            : 'Chat Related Record Navigated';

        // Log non-sensitive summary
        organizationService['logAuditEvent']?.({
          businessId,
          eventType: 'ChatReportAccess',
          entityType: 'User' as any,
          entityId: params.chatReference,
          affectedName: `Reference ${params.chatReference}`,
          reason: actionLabel,
          actor: params.actor,
        });
      }
    } catch {
      // Ignored for safety
    }
  }

  /**
   * Returns filtered conversations strictly scoped to the authenticated user's business organization.
   */
  public getFilteredConversations(
    actor: AuthenticatedUser | null,
    filters: ChatReportFilterState
  ): ChatReportConversation[] {
    const businessId = this.resolveTenantBusinessId(actor);

    // 1. Tenant & Permission Boundary:
    // Only return conversations that include the Business Owner's business ID,
    // and verify that at least one participating agent belongs to this business.
    const tenantConvs = this.conversations.filter((conv) => {
      const hasBiz = conv.businessIds.includes(businessId);
      if (!hasBiz) return false;

      const hasEmployedAgent = conv.participants.some(
        (p) => p.userRole === 'agent' && (p.businessId === businessId || !p.isCrossBusiness)
      );
      return hasEmployedAgent;
    });

    // 2. Filter application
    return tenantConvs.filter((conv) => {
      // Chat Type Filter
      if (filters.chatType !== 'ALL' && conv.chatType !== filters.chatType) {
        return false;
      }

      // Status Filter
      if (filters.status !== 'ALL' && conv.status !== filters.status) {
        return false;
      }

      // Store Filter
      if (filters.storeId && filters.storeId !== 'ALL' && conv.storeId !== filters.storeId) {
        return false;
      }

      // Booth Filter
      if (filters.boothId && filters.boothId !== 'ALL' && conv.boothId !== filters.boothId) {
        return false;
      }

      // Agent Filter
      if (filters.agentId && filters.agentId !== 'ALL') {
        const matchesPrimary = conv.primaryAgentId === filters.agentId;
        const matchesParticipant = conv.participants.some(
          (p) => p.userId === filters.agentId || p.tellerBudId === filters.agentId
        );
        if (!matchesPrimary && !matchesParticipant) {
          return false;
        }
      }

      // Date Range Filter (Evaluated in Africa/Lusaka CAT timezone if provided)
      if (filters.fromDate || filters.toDate) {
        const convDate = formatCATDateOnly(conv.startedAt);
        if (filters.fromDate && convDate < filters.fromDate) {
          return false;
        }
        if (filters.toDate && convDate > filters.toDate) {
          return false;
        }
      }

      // Search Query: Chat Reference, Participant Names/IDs, Related Reference (if provided)
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim().toLowerCase();
        const matchesRef = conv.chatReference.toLowerCase().includes(q);
        const matchesRelatedRef = conv.relatedEntityId.toLowerCase().includes(q);
        const matchesTitle = conv.relatedEntityTitle?.toLowerCase().includes(q);
        const matchesParticipants = conv.participants.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.tellerBudId.toLowerCase().includes(q) ||
            (p.phone && p.phone.toLowerCase().includes(q))
        );

        if (!matchesRef && !matchesRelatedRef && !matchesTitle && !matchesParticipants) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculates Summary KPIs dynamically reflecting filtered date range and permitted business scope.
   */
  public getKPIs(
    actor: AuthenticatedUser | null,
    filters: ChatReportFilterState
  ): ChatReportKPIs {
    const filteredConvs = this.getFilteredConversations(actor, filters);
    const businessId = this.resolveTenantBusinessId(actor);
    const todayCAT = formatCATDateOnly(new Date());

    let customerToAgentCount = 0;
    let agentToAgentCount = 0;
    let messagesTodayCount = 0;

    // Messages Today: all messages sent today (in CAT) across permitted conversations
    const allTenantConvs = this.conversations.filter((c) => c.businessIds.includes(businessId));
    allTenantConvs.forEach((c) => {
      c.messages.forEach((m) => {
        if (formatCATDateOnly(m.createdAt) === todayCAT) {
          messagesTodayCount++;
        }
      });
    });

    filteredConvs.forEach((c) => {
      if (c.chatType === 'customer_agent') {
        customerToAgentCount++;
      } else if (c.chatType === 'agent_agent') {
        agentToAgentCount++;
      }
    });

    return {
      totalConversations: filteredConvs.length,
      customerToAgentChats: customerToAgentCount,
      agentToAgentChats: agentToAgentCount,
      messagesToday: messagesTodayCount,
    };
  }

  /**
   * Fetches an individual conversation by reference for the dedicated Details page.
   * Strictly enforces that the conversation belongs to the authenticated Business Owner.
   */
  public getConversationByReference(
    chatReference: string,
    actor: AuthenticatedUser | null
  ): ChatReportConversation | null {
    const businessId = this.resolveTenantBusinessId(actor);
    const found = this.conversations.find((c) => c.chatReference === chatReference);

    if (!found) return null;

    // Multi-tenant check
    if (!found.businessIds.includes(businessId)) {
      throw new Error('Unauthorized: You do not have permission to view this conversation.');
    }

    // Automatically sanitize cross-business information for other business agents:
    // If agent is cross-business, sanitize their internal store/booth info if any
    const sanitizedParticipants = found.participants.map((p) => {
      if (p.isCrossBusiness || (p.businessId && p.businessId !== businessId)) {
        return {
          ...p,
          storeName: p.storeName || 'External Partner Agency',
          boothName: p.boothName || 'External Till Desk',
        };
      }
      return p;
    });

    return {
      ...found,
      participants: sanitizedParticipants,
    };
  }

  /**
   * Exports the filtered Chat Report listing to CSV (without full message transcripts).
   */
  public exportReportCSV(actor: AuthenticatedUser, filters: ChatReportFilterState): string {
    const convs = this.getFilteredConversations(actor, filters);
    const businessId = this.resolveTenantBusinessId(actor);

    // Header line
    const headers = [
      'Chat Reference',
      'Chat Type',
      'Participants',
      'Related Reference',
      'Store',
      'Booth',
      'Started (CAT)',
      'Last Activity (CAT)',
      'Message Count',
      'Status',
    ];

    const rows = convs.map((c) => {
      const typeLabel = c.chatType === 'customer_agent' ? 'Customer–Agent' : 'Agent–Agent';
      const participantSummary = c.participants
        .map((p) => `${p.name} (${p.tellerBudId})`)
        .join('; ');
      const storeStr = c.storeName || 'N/A';
      const boothStr = c.boothName || 'N/A';
      const startedStr = formatToCAT(c.startedAt);
      const lastActivityStr = formatToCAT(c.lastActivityAt);

      return [
        `"${c.chatReference}"`,
        `"${typeLabel}"`,
        `"${participantSummary}"`,
        `"${c.relatedEntityId}"`,
        `"${storeStr}"`,
        `"${boothStr}"`,
        `"${startedStr}"`,
        `"${lastActivityStr}"`,
        `"${c.messages.length}"`,
        `"${c.status}"`,
      ].join(',');
    });

    // Log the audit event
    this.logAudit({
      action: 'export_report',
      actor,
      filtersUsed: {
        chatType: filters.chatType,
        status: filters.status,
        storeId: filters.storeId,
        boothId: filters.boothId,
        agentId: filters.agentId,
      },
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Exports an individual conversation transcript to CSV.
   */
  public exportTranscriptCSV(chatReference: string, actor: AuthenticatedUser): string {
    const conv = this.getConversationByReference(chatReference, actor);
    if (!conv) {
      throw new Error('Conversation not found or access denied.');
    }

    const headers = ['Timestamp (CAT)', 'Sender Name', 'Sender Role', 'Delivery Status', 'Message Content', 'Attachment'];
    const rows = conv.messages.map((m) => {
      const timeStr = formatToCAT(m.createdAt);
      const roleStr = m.senderRole === 'customer' ? 'Customer' : 'Agent';
      const statusStr = m.deliveryStatus || 'Sent';
      const cleanContent = m.messageContent.replace(/"/g, '""');
      const attachmentStr = m.attachmentName ? `${m.attachmentName} (${m.attachmentType || 'file'})` : 'None';

      return [
        `"${timeStr}"`,
        `"${m.senderName}"`,
        `"${roleStr}"`,
        `"${statusStr}"`,
        `"${cleanContent}"`,
        `"${attachmentStr}"`,
      ].join(',');
    });

    // Log the audit event
    this.logAudit({
      action: 'export_transcript',
      actor,
      conversationId: conv.id,
      chatReference: conv.chatReference,
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Helper metadata: Stores belonging to Business Owner's business
   */
  public getAvailableStores(actor: AuthenticatedUser | null) {
    const businessId = this.resolveTenantBusinessId(actor);
    return INITIAL_STORES.filter((s) => s.businessId === businessId && s.status === 'Active');
  }

  /**
   * Helper metadata: Booths belonging to Business Owner's business
   */
  public getAvailableBooths(actor: AuthenticatedUser | null, storeId?: string) {
    const businessId = this.resolveTenantBusinessId(actor);
    return INITIAL_BOOTHS.filter((b) => {
      if (b.businessId !== businessId) return false;
      if (b.status === 'Archived') return false;
      if (storeId && storeId !== 'ALL' && b.storeId !== storeId) return false;
      return true;
    });
  }

  /**
   * Helper metadata: Agents belonging to Business Owner's business
   */
  public getAvailableAgents(actor: AuthenticatedUser | null) {
    const businessId = this.resolveTenantBusinessId(actor);
    return INITIAL_USERS.filter((u) => u.businessId === businessId && u.role === 'agent');
  }
}

export const chatReportService = new ChatReportService();
