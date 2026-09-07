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
