import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Send,
  Check,
  CheckCheck,
  User,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ChatConversation, ChatFilterTab, ChatMessage } from '../types/chat';
import { chatService } from '../services/chatService';
import { NewChatModal } from '../components/chat/NewChatModal';

export const BusinessOwnerChatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryAgentId = searchParams.get('agentId');

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<ChatFilterTab>('all');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load and subscribe to chat updates
  useEffect(() => {
    const updateConversations = () => {
      const convs = chatService.getConversations();
      setConversations(convs);
    };

    updateConversations();
    const unsubscribe = chatService.subscribe(updateConversations);
    return () => unsubscribe();
  }, []);

  // Handle agentId query parameter or default selection
  useEffect(() => {
    if (queryAgentId && conversations.length > 0) {
      let targetConv = conversations.find((c) => c.agent.id === queryAgentId);
      if (!targetConv) {
        targetConv = chatService.createConversation(queryAgentId);
      }
      setActiveConversationId(targetConv.id);
      setShowMobileChat(true);
      if (targetConv.unreadCount > 0) {
        chatService.markConversationAsRead(targetConv.id);
      }
    } else if (!activeConversationId && conversations.length > 0 && window.innerWidth >= 768) {
      const firstConv = conversations[0];
      setActiveConversationId(firstConv.id);
      if (firstConv.unreadCount > 0) {
        chatService.markConversationAsRead(firstConv.id);
      }
    }
  }, [conversations, activeConversationId, queryAgentId]);

  // Current active conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setShowMobileChat(true);
    chatService.markConversationAsRead(conversationId);
  };

  // Scroll to bottom whenever active conversation or messages change
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (activeConversation) {
      // Auto-scroll on conversation change
      scrollToBottom('auto');
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversation?.messages?.length) {
      scrollToBottom('smooth');
    }
  }, [activeConversation?.messages?.length]);

  // Filter conversations based on search and tab filter
  const filteredConversations = useMemo(() => {
    let result = conversations;

    if (activeFilter === 'unread') {
      result = result.filter((c) => c.unreadCount > 0);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (c) =>
          c.agent.name.toLowerCase().includes(query) ||
          c.agent.id.toLowerCase().includes(query) ||
          c.lastMessagePreview.toLowerCase().includes(query) ||
          c.messages.some((m) => m.text.toLowerCase().includes(query))
      );
    }

    return result;
  }, [conversations, activeFilter, searchQuery]);

  // Count unread conversations
  const unreadCount = useMemo(() => {
    return conversations.filter((c) => c.unreadCount > 0).length;
  }, [conversations]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!activeConversationId || !messageInput.trim()) return;

    const trimmed = messageInput.trim();
    chatService.sendMessage(activeConversationId, trimmed);
    setMessageInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle keypress inside message textarea: Enter sends, Shift+Enter new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle auto-expanding textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  // Handle starting a new chat with an agent
  const handleSelectAgentForNewChat = (agentId: string) => {
    const conv = chatService.createConversation(agentId);
    setIsNewChatModalOpen(false);
    setActiveConversationId(conv.id);
    setShowMobileChat(true);
    chatService.markConversationAsRead(conv.id);
  };

  // Navigate to View Agent page
  const handleViewAgent = (agentId: string) => {
    navigate(`/business-owner/agents/${agentId}`);
  };

  // Helper for availability badge color
  const getAvailabilityBadge = (status: 'Available' | 'On Active Request' | 'Offline' | string) => {
    switch (status) {
      case 'On Active Request':
        return {
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          dotClass: 'bg-amber-500',
        };
      case 'Available':
        return {
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500',
        };
      case 'Offline':
      default:
        return {
          badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
          dotClass: 'bg-slate-400',
        };
    }
  };

  // Group messages by date for date separators
  const groupedMessages = useMemo(() => {
    if (!activeConversation?.messages) return [];

    const groups: { dateLabel: string; messages: ChatMessage[] }[] = [];
    let currentLabel = '';

    activeConversation.messages.forEach((msg) => {
      const label = msg.dateLabel || 'Today';
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ dateLabel: label, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [activeConversation?.messages]);

  return (
    <div className="p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto h-[calc(100vh-4.25rem)] min-h-[600px] flex flex-col">
      {/* Main Two-Panel Chat Container */}
      <div
        id="chats-module-container"
        className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row relative"
      >
        {/* ========================================================================= */}
        {/* LEFT PANEL: CONVERSATIONS LIST */}
        {/* ========================================================================= */}
        <div
          id="chats-left-panel"
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/40 ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Actions: Search & New Chat */}
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  id="input-search-conversations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Agent or conversation..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0D93AA] focus:ring-2 focus:ring-[#0D93AA]/20 transition-all"
                />
              </div>

              {/* New Chat Button */}
              <button
                type="button"
                id="btn-new-chat"
                onClick={() => setIsNewChatModalOpen(true)}
                title="Start New Chat"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0D93AA] hover:bg-[#0B7F93] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex-shrink-0"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>

            {/* Filter Tabs: All & Unread */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
              <button
                type="button"
                id="tab-chats-all"
                onClick={() => setActiveFilter('all')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All</span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200/70 text-slate-700">
                  {conversations.length}
                </span>
              </button>

              <button
                type="button"
                id="tab-chats-unread"
                onClick={() => setActiveFilter('unread')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                  activeFilter === 'unread'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#0D93AA] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Scrollable Conversation List */}
          <div
            id="chats-conversation-list"
            className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white"
          >
            {filteredConversations.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <MessageSquare size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {activeFilter === 'unread' ? 'No unread conversations' : 'No conversations found'}
                </p>
                {activeFilter === 'unread' ? (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    All agent messages have been read
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Try searching for another agent or click New Chat
                  </p>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConversationId;
                const { badgeClass } = getAvailabilityBadge(conv.agent.availability);

                return (
                  <div
                    key={conv.id}
                    id={`conversation-item-${conv.agent.id}`}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`p-3 sm:p-3.5 cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-[#0D93AA]/5 border-l-4 border-l-[#0D93AA]'
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar with status indicator */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#0D93AA]/10 border border-[#0D93AA]/20 flex items-center justify-center text-[#0D93AA] font-bold text-xs">
                          {conv.agent.avatarInitials}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                            conv.agent.availability === 'On Active Request'
                              ? 'bg-amber-500'
                              : conv.agent.availability === 'Available'
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                        />
                      </div>

                      {/* Conversation details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`text-xs font-semibold truncate ${
                                isSelected ? 'text-[#0D93AA]' : 'text-slate-900'
                              }`}
                            >
                              {conv.agent.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                              {conv.agent.id}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {conv.lastMessageTimeFormatted}
                          </span>
                        </div>

                        {/* Availability Pill */}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${badgeClass}`}
                          >
                            {conv.agent.availability}
                          </span>

                          {/* Unread message badge */}
                          {conv.unreadCount > 0 && (
                            <span
                              id={`badge-unread-conv-${conv.agent.id}`}
                              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0D93AA] text-white flex-shrink-0"
                            >
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        {/* Message preview */}
                        <p className="text-xs text-slate-500 truncate mt-1 leading-relaxed">
                          {conv.lastMessagePreview || (
                            <span className="italic text-slate-400">No messages yet</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: ACTIVE CONVERSATION */}
        {/* ========================================================================= */}
        <div
          id="chats-right-panel"
          className={`flex-1 flex flex-col bg-white overflow-hidden ${
            !showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Conversation Header */}
              <div
                id="active-conversation-header"
                className="h-16 px-4 sm:px-6 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0 shadow-2xs z-10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    id="btn-chat-mobile-back"
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  {/* Agent Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#0D93AA]/10 border border-[#0D93AA]/20 flex items-center justify-center text-[#0D93AA] font-bold text-xs">
                      {activeConversation.agent.avatarInitials}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        activeConversation.agent.availability === 'On Active Request'
                          ? 'bg-amber-500'
                          : activeConversation.agent.availability === 'Available'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  {/* Agent Name, ID, Availability */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        {activeConversation.agent.name}
                      </h2>
                      <span className="text-xs font-mono text-slate-500">
                        {activeConversation.agent.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          getAvailabilityBadge(activeConversation.agent.availability).badgeClass
                        }`}
                      >
                        {activeConversation.agent.availability}
                      </span>
                      {activeConversation.agent.activeRequestType &&
                        activeConversation.agent.activeRequestType !== 'None' && (
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            • Active Request: {activeConversation.agent.activeRequestType}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* View Agent Button (Note: Agent wallet balance is NOT displayed) */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    id={`btn-view-agent-${activeConversation.agent.id}`}
                    onClick={() => handleViewAgent(activeConversation.agent.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/5 hover:bg-[#0D93AA]/10 border border-[#0D93AA]/20 rounded-xl transition-all cursor-pointer"
                  >
                    <span>View Agent</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>

              {/* Message History Area */}
              <div
                id="active-conversation-messages"
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50"
              >
                {activeConversation.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center mb-3">
                      <MessageSquare size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No messages yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Start the conversation with this Agent.
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-3">
                      {/* Date Separator */}
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[11px] font-medium rounded-full shadow-2xs">
                          {group.dateLabel}
                        </span>
                      </div>

                      {/* Messages within this date group */}
                      {group.messages.map((msg) => {
                        const isOwner = msg.senderType === 'business_owner';

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${
                              isOwner ? 'items-end' : 'items-start'
                            }`}
                          >
                            {/* Bubble */}
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-2xs ${
                                isOwner
                                  ? 'bg-[#0D93AA] text-white rounded-br-xs'
                                  : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200/50'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>

                            {/* Timestamp and Delivery/Read Indicator */}
                            <div className="flex items-center gap-1.5 mt-1 px-1">
                              <span className="text-[10px] text-slate-400">
                                {msg.timeFormatted}
                              </span>
                              {isOwner && (
                                <span className="inline-flex items-center text-slate-400">
                                  {msg.status === 'Read' ? (
                                    <CheckCheck size={13} className="text-[#0D93AA]" />
                                  ) : (
                                    <Check size={13} className="text-slate-400" />
                                  )}
                                  <span className="text-[10px] text-slate-400 ml-0.5">
                                    {msg.status}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div
                id="active-conversation-composer"
                className="p-3 sm:p-4 border-t border-slate-200 bg-white flex-shrink-0"
              >
                <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-[#0D93AA] focus-within:ring-2 focus-within:ring-[#0D93AA]/20 transition-all">
                  <textarea
                    ref={textareaRef}
                    id="input-chat-message"
                    rows={1}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 max-h-28 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-hidden leading-relaxed"
                  />

                  <button
                    type="button"
                    id="btn-send-chat-message"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    aria-label="Send message"
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      messageInput.trim()
                        ? 'bg-[#0D93AA] hover:bg-[#0B7F93] text-white shadow-xs cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5 px-2 text-[10px] text-slate-400">
                  <span>Press Enter to send, Shift + Enter for new line</span>
                  <span>Operational agent pickup dispatch only</span>
                </div>
              </div>
            </>
          ) : (
            /* Empty State when no conversation selected */
            <div
              id="chat-no-conversation-selected"
              className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/40"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800">Select a conversation</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Choose an Agent conversation to view and send messages.
              </p>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0D93AA] hover:bg-[#0B7F93] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Start New Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectAgent={handleSelectAgentForNewChat}
      />
    </div>
  );
};
