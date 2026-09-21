import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Users,
  Repeat,
  Store,
  ExternalLink,
  ShieldAlert,
  Paperclip,
  Check,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Building,
  User,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ChatReportConversation,
  ChatReportMessage,
  ChatReportStatus,
  ChatReportType,
} from '../../types/chat';
import {
  chatReportService,
  formatToCAT,
  maskPhoneNumber,
} from '../../services/chatReportService';

export const ChatDetailPage: React.FC = () => {
  const { chatReference } = useParams<{ chatReference: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [conversation, setConversation] = useState<ChatReportConversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Load conversation & log audit view
  useEffect(() => {
    if (!chatReference) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const conv = chatReportService.getConversationByReference(chatReference, currentUser);
      if (!conv) {
        setErrorMessage('Conversation not found or access is restricted.');
        setConversation(null);
      } else {
        setConversation(conv);
        // Log view audit
        if (currentUser) {
          chatReportService.logAudit({
            action: 'view_conversation',
            actor: currentUser,
            conversationId: conv.id,
            chatReference: conv.chatReference,
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching conversation details:', err);
      setErrorMessage(err.message || 'Access denied. You do not have permission to view this conversation.');
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, [chatReference, currentUser]);

  // Export Transcript Action (Audited)
  const handleExportTranscript = () => {
    if (!conversation || !currentUser) return;
    try {
      const csv = chatReportService.exportTranscriptCSV(conversation.chatReference, currentUser);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `Transcript_${conversation.chatReference}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice('Transcript exported successfully. Recorded in audit log.');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (e: any) {
      alert('Failed to export transcript. ' + (e.message || ''));
    }
  };

  // Navigate to Related Details (Audited)
  const handleViewRelatedDetails = () => {
    if (!conversation || !currentUser) return;

    chatReportService.logAudit({
      action: 'open_related_record',
      actor: currentUser,
      conversationId: conversation.id,
      chatReference: conversation.chatReference,
    });

    if (conversation.relatedEntityType === 'agent_liquidity') {
      navigate(`/business-owner/operations/agent-to-agent-liquidity/${conversation.relatedEntityId}`);
    } else if (conversation.relatedEntityType === 'customer_request') {
      navigate('/business-owner/operations/live');
    } else if (conversation.relatedEntityType === 'transaction') {
      navigate(`/business-owner/transactions/${conversation.relatedEntityId}`);
    } else {
      navigate(`/business-owner/transactions/all`);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: ChatReportStatus) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>
      );
    }
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <CheckCircle2 size={13} className="text-sky-600" />
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        Closed
      </span>
    );
  };

  // Delivery status icon
  const renderDeliveryIcon = (status?: string) => {
    if (status === 'Read') {
      return (
        <span title="Read" className="inline-flex items-center">
          <CheckCheck size={13} className="text-[#0D93AA]" />
        </span>
      );
    }
    if (status === 'Delivered') {
      return (
        <span title="Delivered" className="inline-flex items-center">
          <CheckCheck size={13} className="text-slate-400" />
        </span>
      );
    }
    return (
      <span title="Sent" className="inline-flex items-center">
        <Check size={13} className="text-slate-400" />
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0D93AA] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading conversation transcript...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !conversation) {
    return (
      <div className="p-6 max-w-4xl mx-auto font-sans">
        <button
          onClick={() => navigate('/business-owner/communication/chat-report')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Chat Report</span>
        </button>

        <div className="bg-white border border-rose-200 rounded-xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto mb-3 border border-rose-100">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900">Access Restricted or Conversation Not Found</h2>
          <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
            {errorMessage || 'This conversation is not associated with your business or has been archived.'}
          </p>
          <button
            onClick={() => navigate('/business-owner/communication/chat-report')}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Chat Report</span>
          </button>
        </div>
      </div>
    );
  }

  const customerParticipant = conversation.participants.find((p) => p.userRole === 'customer');
  const agentParticipants = conversation.participants.filter((p) => p.userRole === 'agent');
  const primaryAgent = agentParticipants[0];
  const secondAgent = agentParticipants[1];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-6 gap-4 max-w-[1500px] w-full mx-auto font-sans">
      {/* Feedback Toast */}
      {exportNotice && (
        <div className="shrink-0 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span className="font-medium">{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP HEADER: Back Button + Reference + Status Badges + Export */}
      <div className="shrink-0 bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/business-owner/communication/chat-report')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to Chat Report"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight">
                {conversation.chatReference}
              </h1>

              {conversation.chatType === 'customer_agent' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-50 text-[#0D93AA] border border-cyan-200">
                  <Users size={12} />
                  Customer–Agent Chat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <Repeat size={12} />
                  Agent–Agent Chat
                </span>
              )}

              {renderStatusBadge(conversation.status)}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">Started:</span>
                <span>{formatToCAT(conversation.startedAt)}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">Last Activity:</span>
                <span>{formatToCAT(conversation.lastActivityAt)}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">Total Messages:</span>
                <span className="font-bold text-slate-700">{conversation.messages.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Export Transcript */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTranscript}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="Download full message transcript as CSV (audited)"
          >
            <Download size={14} className="text-[#0D93AA]" />
            <span>Export Transcript</span>
          </button>
        </div>
      </div>

      {/* SUMMARY GRID: Participants (A) & Related Record (B) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
        {/* SECTION A: PARTICIPANTS SUMMARY (Col 7) */}
        <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#0D93AA]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Conversation Participants
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              {conversation.chatType === 'customer_agent' ? 'Direct Service' : 'Internal Operation'}
            </span>
          </div>

          {conversation.chatType === 'customer_agent' ? (
            /* Customer-to-Agent Participants Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Box */}
              <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200/70 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Customer Information
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {customerParticipant?.name || 'Customer'}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="text-slate-400">ID:</span>
                  <span className="font-mono font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                    {customerParticipant?.tellerBudId || '—'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                  <Phone size={12} className="text-slate-400" />
                  <span className="font-mono text-slate-700">
                    {customerParticipant?.maskedPhone || maskPhoneNumber(customerParticipant?.phone)}
                  </span>
                </div>
              </div>

              {/* Agent Box */}
              <div className="p-3.5 rounded-lg bg-cyan-50/40 border border-cyan-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D93AA] block">
                  Handling Agent
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {conversation.primaryAgentName || primaryAgent?.name || 'Agent'}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="text-slate-400">Agent ID:</span>
                  <span className="font-mono font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-cyan-200 text-[11px]">
                    {conversation.primaryAgentId || primaryAgent?.tellerBudId || '—'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 pt-0.5 space-y-0.5">
                  <div className="flex items-center gap-1 font-medium text-slate-800">
                    <Store size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{conversation.storeName || primaryAgent?.storeName || '—'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-4 truncate">
                    {conversation.boothName || primaryAgent?.boothName || '—'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Agent-to-Agent Participants Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Requesting Agent */}
              <div className="p-3.5 rounded-lg bg-purple-50/40 border border-purple-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  Requesting Agent
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {primaryAgent?.name || 'Requesting Agent'}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="text-slate-400">Agent ID:</span>
                  <span className="font-mono font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-purple-200 text-[11px]">
                    {primaryAgent?.tellerBudId || '—'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 pt-0.5 space-y-0.5">
                  <div className="flex items-center gap-1 font-medium text-slate-800">
                    <Store size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{primaryAgent?.storeName || conversation.storeName || '—'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-4 truncate">
                    {primaryAgent?.boothName || conversation.boothName || '—'}
                  </div>
                </div>
              </div>

              {/* Matched / Offered Agent */}
              <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Matched / Counterpart Agent
                  </span>
                  {secondAgent?.isCrossBusiness && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      Partner Business
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {secondAgent?.name || 'Counterpart Agent'}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="text-slate-400">Agent ID:</span>
                  <span className="font-mono font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                    {secondAgent?.tellerBudId || '—'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 pt-0.5 space-y-0.5">
                  <div className="flex items-center gap-1 font-medium text-slate-800">
                    <Building size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {secondAgent?.businessName || (secondAgent?.isCrossBusiness ? 'External Partner' : 'Internal')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-4 truncate">
                    {secondAgent?.storeName || 'External Branch'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION B: RELATED RECORD SUMMARY (Col 5) */}
        <div className="lg:col-span-5 bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#0D93AA]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Related Record
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {conversation.relatedEntityType.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Reference Code:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {conversation.relatedEntityId}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Service Type:</span>
                <span className="font-semibold text-slate-800">
                  {conversation.relatedEntityService || 'Operational Service'}
                </span>
              </div>

              {conversation.relatedEntityTitle && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Description:</span>
                  <span className="font-medium text-slate-700 text-right truncate max-w-[200px]">
                    {conversation.relatedEntityTitle}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Record Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {conversation.relatedEntityStatus || 'Completed'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Recorded Date:</span>
                <span className="text-slate-700 font-mono text-[11px]">
                  {formatToCAT(conversation.relatedEntityDate || conversation.startedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100">
            <button
              onClick={handleViewRelatedDetails}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <span>View Related Details</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION C: CONVERSATION TRANSCRIPT (READ-ONLY) */}
      <div className="bg-white border border-gray-200/90 rounded-xl shadow-2xs flex flex-col flex-1 min-h-[480px] overflow-hidden">
        {/* Transcript Header */}
        <div className="shrink-0 px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#0D93AA]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Official Conversation Transcript
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
              Read-Only Audit Record
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-[#0D93AA]" />
            <span className="font-medium">All timestamps displayed in Central Africa Time (CAT)</span>
          </div>
        </div>

        {/* Transcript Messages Container (Chronological) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No message records found for this conversation.
            </div>
          ) : (
            conversation.messages.map((msg, index) => {
              const isEmployedAgent =
                msg.senderRole === 'agent' && msg.senderId === conversation.primaryAgentId;
              const isCustomer = msg.senderRole === 'customer';

              return (
                <div
                  key={msg.id || `msg-${index}`}
                  className={`flex flex-col ${
                    isEmployedAgent ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Name & Role & Timestamp Header */}
                  <div
                    className={`flex items-center gap-2 mb-1 px-1 text-[11px] ${
                      isEmployedAgent ? 'flex-row-reverse text-right' : 'flex-row text-left'
                    }`}
                  >
                    <span className="font-bold text-slate-800">{msg.senderName}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        isCustomer
                          ? 'bg-slate-200 text-slate-700'
                          : isEmployedAgent
                          ? 'bg-cyan-100 text-[#0D93AA]'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {isCustomer ? 'Customer' : 'Agent'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {formatToCAT(msg.createdAt)}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-xl px-4 py-3 shadow-2xs border ${
                      isEmployedAgent
                        ? 'bg-white border-[#0D93AA]/30 text-slate-800 rounded-tr-xs'
                        : 'bg-white border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap font-normal text-slate-800">
                      {msg.messageContent}
                    </p>

                    {/* Attachment Indicator if present */}
                    {msg.attachmentName && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 px-2.5 py-1.5 rounded-lg text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip size={13} className="text-[#0D93AA] shrink-0" />
                          <span className="font-medium text-slate-700 truncate text-[11px]">
                            {msg.attachmentName}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                          {msg.attachmentType || 'Attachment'}
                        </span>
                      </div>
                    )}

                    {/* Delivery / Read Status Footer */}
                    <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                      <span>{msg.deliveryStatus || 'Sent'}</span>
                      {renderDeliveryIcon(msg.deliveryStatus)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Read-Only Notice Bar (No reply or send inputs provided) */}
        <div className="shrink-0 px-4 py-3 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="font-medium">
              This operational transcript is archived in read-only mode for business compliance and quality monitoring.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Participant messaging disabled
          </span>
        </div>
      </div>
    </div>
  );
};
