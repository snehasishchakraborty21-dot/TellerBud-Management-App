export type AgentAvailabilityStatus = 'Available' | 'On Active Request' | 'Offline';

export interface ChatAgent {
  id: string; // e.g. 'TB-AGT-1024'
  name: string; // e.g. 'Kelvin Phiri'
  avatarInitials: string; // e.g. 'KP'
  availability: AgentAvailabilityStatus;
  phone?: string;
  activeRequestType?: string; // 'Pickup' | 'Walk-In' | 'None'
  businessId: string; // 'BIZ-LUS-001'
  businessName: string; // 'Lusaka Central Express Agency'
}

export type MessageSenderType = 'business_owner' | 'agent';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderId: string; // 'business_owner' or agentId
  senderName: string;
  text: string;
  timestamp: string; // ISO or formatted date string for sorting
  timeFormatted: string; // e.g. '10:28 AM'
  dateLabel: string; // e.g. 'Today', 'Yesterday', 'Aug 30, 2026'
  status: 'Delivered' | 'Read';
}

export interface ChatConversation {
  id: string;
  agent: ChatAgent;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageTimestamp: string; // For sorting descending
  lastMessageTimeFormatted: string; // e.g. '10:28 AM' or 'Yesterday'
  createdAt: string;
}

export type ChatFilterTab = 'all' | 'unread';

// ==========================================
// CHAT REPORT MODULE TYPES (Read-Only Operational View)
// ==========================================

export type ChatReportType = 'customer_agent' | 'agent_agent';
export type ChatReportStatus = 'Active' | 'Closed' | 'Resolved';
export type ChatRelatedEntityType = 'customer_request' | 'transaction' | 'agent_liquidity';
export type ChatParticipantRole = 'customer' | 'agent';

export interface ChatParticipant {
  conversationId: string;
  userId: string;
  userRole: ChatParticipantRole;
  businessId?: string;
  businessName?: string;
  name: string;
  tellerBudId: string;
  phone?: string;
  maskedPhone?: string;
  storeId?: string;
  storeName?: string;
  boothId?: string;
  boothName?: string;
  isCrossBusiness?: boolean;
  joinedAt: string;
}

export interface ChatReportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ChatParticipantRole;
  senderName: string;
  messageContent: string;
  attachmentReference?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'document' | 'receipt';
  deliveryStatus?: 'Sent' | 'Delivered' | 'Read';
  readAt?: string;
  createdAt: string; // ISO 8601
}

export interface ChatReportConversation {
  id: string;
  chatReference: string; // e.g. 'TB-CHAT-1001'
  chatType: ChatReportType; // 'customer_agent' | 'agent_agent'
  relatedEntityType: ChatRelatedEntityType;
  relatedEntityId: string; // e.g. 'REQ-2026-0801', 'TB-ATL-7001'
  relatedEntityTitle?: string;
  relatedEntityService?: string;
  relatedEntityStatus?: string;
  relatedEntityDate?: string;
  businessIds: string[];
  status: ChatReportStatus;
  startedAt: string; // ISO 8601
  lastActivityAt: string; // ISO 8601
  storeId?: string;
  storeName?: string;
  boothId?: string;
  boothName?: string;
  primaryAgentId?: string;
  primaryAgentName?: string;
  participants: ChatParticipant[];
  messages: ChatReportMessage[];
}

export interface ChatReportAudit {
  id: string;
  businessId: string;
  conversationId?: string;
  chatReference?: string;
  action: 'view_conversation' | 'export_report' | 'open_related_record' | 'export_transcript';
  performedBy: string;
  performerRole: string;
  filtersUsed?: Record<string, any>;
  createdAt: string;
}

export interface ChatReportFilterState {
  chatType: 'ALL' | ChatReportType;
  status: 'ALL' | ChatReportStatus;
  storeId: string;
  boothId: string;
  agentId: string;
  fromDate?: string;
  toDate?: string;
  searchQuery?: string;
}

export interface ChatReportKPIs {
  totalConversations: number;
  customerToAgentChats: number;
  agentToAgentChats: number;
  messagesToday: number;
}
