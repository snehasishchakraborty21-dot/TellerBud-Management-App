import { ChatAgent, ChatConversation, ChatMessage } from '../types/chat';
import { AUTHORISED_AGENTS, INITIAL_CHAT_CONVERSATIONS } from '../data/mockChatData';

const STORAGE_KEY = 'tellerbud_bo_chats_v5';

function formatCurrentTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
  return `${hours}:${minutesStr} ${ampm}`;
}

function sanitizeConversations(convs: ChatConversation[]): ChatConversation[] {
  return convs.map((c) => {
    // Sanitize Joseph Kaunda's preview and text if any legacy shift text exists
    if (c.agent.id === 'TB-AGT-1064' || c.id === 'conv-1064') {
      if (c.lastMessagePreview.toLowerCase().includes('shift')) {
        c.lastMessagePreview = 'Checked out and counter registers reconciled.';
      }
      c.messages = c.messages.map((m) => {
        if (m.text.toLowerCase().includes('shift')) {
          return { ...m, text: 'Checked out and counter registers reconciled.' };
        }
        return m;
      });
    }

    // Sanitize Kelvin Phiri's first message if legacy text exists
    if (c.agent.id === 'TB-AGT-1024' || c.id === 'conv-1024') {
      c.messages = c.messages.map((m) => {
        if (m.id === 'msg-kp-1' || m.text.includes('Cash withdrawal pickup automatically matched')) {
          return {
            ...m,
            text: 'Good morning Kelvin. The withdrawal pickup request for Ruth Banda at Woodlands Shopping Centre was automatically matched to you.',
          };
        }
        return m;
      });
    }

    // Sanitize Brian Lungu and Thandiwe Phiri messages if legacy text exists
    c.messages = c.messages.map((m) => {
      if (m.text.includes('shift')) {
        return {
          ...m,
          text: m.text.replace(/shift/gi, 'operations'),
        };
      }
      return m;
    });

    return c;
  });
}

function loadConversations(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeConversations(parsed);
      }
    }
  } catch (e) {
    console.error('Failed to load chat conversations from localStorage', e);
  }
  return sanitizeConversations(JSON.parse(JSON.stringify(INITIAL_CHAT_CONVERSATIONS)));
}

function saveConversations(conversations: ChatConversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save chat conversations to localStorage', e);
  }
}

class ChatService {
  private conversations: ChatConversation[] = loadConversations();
  private listeners: Set<() => void> = new Set();

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in chat listener', err);
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getAuthorisedAgents(): ChatAgent[] {
    return [...AUTHORISED_AGENTS];
  }

  getConversations(): ChatConversation[] {
    // Return conversations sorted by lastMessageTimestamp descending
    return [...this.conversations].sort((a, b) => {
      const timeA = new Date(a.lastMessageTimestamp).getTime() || 0;
      const timeB = new Date(b.lastMessageTimestamp).getTime() || 0;
      return timeB - timeA;
    });
  }

  getConversationById(id: string): ChatConversation | undefined {
    return this.conversations.find((c) => c.id === id);
  }

  getConversationByAgentId(agentId: string): ChatConversation | undefined {
    return this.conversations.find((c) => c.agent.id === agentId);
  }

  markConversationAsRead(id: string): void {
    const conversation = this.conversations.find((c) => c.id === id);
    if (!conversation) return;

    if (conversation.unreadCount > 0 || conversation.messages.some((m) => m.status !== 'Read')) {
      conversation.unreadCount = 0;
      conversation.messages = conversation.messages.map((m) => ({
        ...m,
        status: 'Read',
      }));
      saveConversations(this.conversations);
      this.notify();
    }
  }

  sendMessage(conversationId: string, text: string): ChatMessage | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const conversation = this.conversations.find((c) => c.id === conversationId);
    if (!conversation) return null;

    const now = new Date();
    const timestamp = now.toISOString();
    const timeFormatted = formatCurrentTime();

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      conversationId,
      senderType: 'business_owner',
      senderId: 'business_owner',
      senderName: 'Business Owner',
      text: trimmed,
      timestamp,
      timeFormatted,
      dateLabel: 'Today',
      status: 'Delivered',
    };

    conversation.messages.push(newMessage);
    conversation.lastMessagePreview = trimmed;
    conversation.lastMessageTimestamp = timestamp;
    conversation.lastMessageTimeFormatted = timeFormatted;

    saveConversations(this.conversations);
    this.notify();
    return newMessage;
  }

  createConversation(agentId: string): ChatConversation {
    const existing = this.getConversationByAgentId(agentId);
    if (existing) {
      return existing;
    }

    const agent = AUTHORISED_AGENTS.find((a) => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} is not an authorised agent of Lusaka Central Express Agency.`);
    }

    const now = new Date();
    const newConv: ChatConversation = {
      id: `conv-${agent.id.replace('TB-AGT-', '')}`,
      agent,
      messages: [],
      unreadCount: 0,
      lastMessagePreview: '',
      lastMessageTimestamp: now.toISOString(),
      lastMessageTimeFormatted: 'Just now',
      createdAt: now.toISOString(),
    };

    this.conversations.unshift(newConv);
    saveConversations(this.conversations);
    this.notify();
    return newConv;
  }

  getUnreadConversationsCount(): number {
    return this.conversations.filter((c) => c.unreadCount > 0).length;
  }

  getTotalUnreadCount(): number {
    return this.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }

  resetData(): void {
    this.conversations = JSON.parse(JSON.stringify(INITIAL_CHAT_CONVERSATIONS));
    saveConversations(this.conversations);
    this.notify();
  }
}

export const chatService = new ChatService();
