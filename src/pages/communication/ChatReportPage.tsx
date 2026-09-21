import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCw,
  RotateCcw,
  Download,
  Receipt,
  MessageSquare,
  Users,
  Repeat,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  Store,
  Shield,
  AlertCircle,
  FileText,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ChatReportConversation,
  ChatReportFilterState,
  ChatReportKPIs,
  ChatReportType,
  ChatReportStatus,
} from '../../types/chat';
import {
  chatReportService,
  formatToCAT,
  maskPhoneNumber,
} from '../../services/chatReportService';

export const ChatReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Loading, Error, and Refresh States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters State (Search and Date-range controls removed)
  const [filters, setFilters] = useState<ChatReportFilterState>({
    chatType: 'ALL',
    status: 'ALL',
    storeId: 'ALL',
    boothId: 'ALL',
    agentId: 'ALL',
  });

  // Export Feedback State
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  // Dropdown Metadata (Scoped strictly to Business Owner's business)
  const availableStores = useMemo(() => {
    try {
      return chatReportService.getAvailableStores(currentUser);
    } catch {
      return [];
    }
  }, [currentUser]);

  const availableBooths = useMemo(() => {
    try {
      return chatReportService.getAvailableBooths(currentUser, filters.storeId);
    } catch {
      return [];
    }
  }, [currentUser, filters.storeId]);

  const availableAgents = useMemo(() => {
    try {
      return chatReportService.getAvailableAgents(currentUser);
    } catch {
      return [];
    }
  }, [currentUser]);

  // Primary Data Fetching
  const [conversations, setConversations] = useState<ChatReportConversation[]>([]);
  const [kpis, setKpis] = useState<ChatReportKPIs>({
    totalConversations: 0,
    customerToAgentChats: 0,
    agentToAgentChats: 0,
    messagesToday: 0,
  });

  const loadData = useCallback(() => {
    try {
      setLoadError(null);
      const filtered = chatReportService.getFilteredConversations(currentUser, filters);
      const calculatedKpis = chatReportService.getKPIs(currentUser, filters);
      setConversations(filtered);
      setKpis(calculatedKpis);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading chat report data:', err);
      setLoadError(err.message || 'Chat conversations could not be loaded. Please try again.');
      setIsLoading(false);
    }
  }, [currentUser, filters]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      loadData();
    }, 120);

    const unsubscribe = chatReportService.subscribe(() => {
      loadData();
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [loadData]);

  // Refresh Action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      tableContainerRef.current?.scrollTo({ top: 0 });
    }, 350);
  };

  // Clear Filters Action
  const handleClearFilters = () => {
    setFilters({
      chatType: 'ALL',
      status: 'ALL',
      storeId: 'ALL',
      boothId: 'ALL',
      agentId: 'ALL',
    });
    setCurrentPage(1);
    tableContainerRef.current?.scrollTo({ top: 0 });
  };

  // Export Action (Audited)
  const handleExportReport = () => {
    if (!currentUser) return;
    try {
      const csvContent = chatReportService.exportReportCSV(currentUser, filters);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `TellerBud_Chat_Report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice('Chat Report exported successfully. Logged in audit trail.');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (e: any) {
      console.error('Export failed:', e);
      alert('Failed to export chat report. ' + (e.message || ''));
    }
  };

  // Click on related reference
  const handleRelatedReferenceClick = (conv: ChatReportConversation) => {
    if (!currentUser) return;

    chatReportService.logAudit({
      action: 'open_related_record',
      actor: currentUser,
      conversationId: conv.id,
      chatReference: conv.chatReference,
    });

    if (conv.relatedEntityType === 'agent_liquidity') {
      navigate(`/business-owner/operations/agent-to-agent-liquidity/${conv.relatedEntityId}`);
    } else if (conv.relatedEntityType === 'customer_request') {
      navigate('/business-owner/operations/live');
    } else if (conv.relatedEntityType === 'transaction') {
      navigate(`/business-owner/transactions/${conv.relatedEntityId}`);
    } else {
      navigate(`/business-owner/transactions/all`);
    }
  };

  // Pagination Math
  const totalFilteredCount = conversations.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedConversations = useMemo(() => {
    const start = (validCurrentPage - 1) * rowsPerPage;
    return conversations.slice(start, start + rowsPerPage);
  }, [conversations, validCurrentPage, rowsPerPage]);

  const startIndex = totalFilteredCount === 0 ? 0 : (validCurrentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(validCurrentPage * rowsPerPage, totalFilteredCount);

  // Status Badge Helper
  const renderStatusBadge = (status: ChatReportStatus) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>
      );
    }
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <CheckCircle2 size={11} className="text-sky-600" />
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        Closed
      </span>
    );
  };

  // Chat Type Badge Helper
  const renderTypeBadge = (type: ChatReportType) => {
    if (type === 'customer_agent') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-[#0D93AA] border border-cyan-200 whitespace-nowrap">
          <Users size={11} />
          Customer–Agent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
        <Repeat size={11} />
        Agent–Agent
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 max-w-[1720px] w-full mx-auto font-sans">
      {/* Export feedback toast */}
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

      {/* 1. COMPACT SUMMARY KPI CARDS (Single-line layout, 64-68px height) */}
      <div className="shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Total Conversations */}
          <div className="bg-white border border-gray-200/90 rounded-xl px-4 py-3 sm:py-3.5 h-[66px] shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 mr-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Total Conversations
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 whitespace-nowrap shrink-0">
                {isLoading ? '...' : kpis.totalConversations}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA] shrink-0">
              <MessageSquare size={18} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Card 2: Customer-to-Agent Chats */}
          <div className="bg-white border border-gray-200/90 rounded-xl px-4 py-3 sm:py-3.5 h-[66px] shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 mr-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Customer-to-Agent Chats
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 whitespace-nowrap shrink-0">
                {isLoading ? '...' : kpis.customerToAgentChats}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center text-[#0D93AA] shrink-0 border border-cyan-100">
              <Users size={18} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Card 3: Agent-to-Agent Chats */}
          <div className="bg-white border border-gray-200/90 rounded-xl px-4 py-3 sm:py-3.5 h-[66px] shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 mr-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Agent-to-Agent Chats
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 whitespace-nowrap shrink-0">
                {isLoading ? '...' : kpis.agentToAgentChats}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-100">
              <Repeat size={18} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Card 4: Messages Today */}
          <div className="bg-white border border-gray-200/90 rounded-xl px-4 py-3 sm:py-3.5 h-[66px] shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 mr-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Messages Today
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 whitespace-nowrap shrink-0">
                {isLoading ? '...' : kpis.messagesToday}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
              <Clock size={18} className="stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER AND ACTION SECTION */}
      <div className="shrink-0 bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          {/* 1. All Chat Types (approx 170px) */}
          <div className="w-full sm:w-[170px] shrink-0">
            <select
              value={filters.chatType}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, chatType: e.target.value as any }));
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium"
            >
              <option value="ALL">All Chat Types</option>
              <option value="customer_agent">Customer-to-Agent</option>
              <option value="agent_agent">Agent-to-Agent</option>
            </select>
          </div>

          {/* 2. All Statuses (approx 140px) */}
          <div className="w-full sm:w-[140px] shrink-0">
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, status: e.target.value as any }));
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* 3. All Stores (approx 170px) */}
          <div className="w-full sm:w-[170px] shrink-0">
            <select
              value={filters.storeId}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, storeId: e.target.value, boothId: 'ALL' }));
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium truncate"
            >
              <option value="ALL">All Stores</option>
              {availableStores.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.storeName}
                </option>
              ))}
            </select>
          </div>

          {/* 4. All Booths (approx 140px) */}
          <div className="w-full sm:w-[140px] shrink-0">
            <select
              value={filters.boothId}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, boothId: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium truncate"
            >
              <option value="ALL">All Booths</option>
              {availableBooths.map((bth) => (
                <option key={bth.id} value={bth.id}>
                  {bth.boothName}
                </option>
              ))}
            </select>
          </div>

          {/* 5. All Agents (approx 150px) */}
          <div className="w-full sm:w-[150px] shrink-0">
            <select
              value={filters.agentId}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, agentId: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] text-slate-700 font-medium truncate"
            >
              <option value="ALL">All Agents</option>
              {availableAgents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.firstName} {ag.lastName} ({ag.username})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons: Clear Filters, Refresh, Export Report */}
          <div className="flex items-center gap-3 sm:ml-auto shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
            {/* 6. Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Clear Filters</span>
            </button>

            {/* 7. Refresh */}
            <button
              onClick={handleRefresh}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Refresh chat conversations"
            >
              <RotateCw size={13} className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''} />
              <span>Refresh</span>
            </button>

            {/* 8. Export Report */}
            <button
              onClick={handleExportReport}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              title="Export filtered conversation report to CSV"
            >
              <Download size={13} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CHAT REPORT TABLE CARD (Fixed headings, scrollable rows, bottom pagination) */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
        {/* Error State */}
        {loadError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-3 border border-rose-100">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800 max-w-md">
              {loadError}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Please verify your credentials or network connection.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b7e92] rounded-lg cursor-pointer transition-colors shadow-2xs"
            >
              <RotateCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          /* Table Container with sticky header */
          <div
            ref={tableContainerRef}
            tabIndex={0}
            role="region"
            aria-label="Chat report listing"
            className="flex-1 min-h-0 overflow-auto focus:outline-none"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-xs">
                <tr className="text-slate-600 font-semibold text-[11px] uppercase tracking-wider select-none">
                  <th scope="col" className="py-3 px-3.5">Chat Reference</th>
                  <th scope="col" className="py-3 px-3">Chat Type</th>
                  <th scope="col" className="py-3 px-3 min-w-[220px]">Participants</th>
                  <th scope="col" className="py-3 px-3">Related Reference</th>
                  <th scope="col" className="py-3 px-3 min-w-[180px]">Store / Booth</th>
                  <th scope="col" className="py-3 px-3 min-w-[130px]">Started</th>
                  <th scope="col" className="py-3 px-3 min-w-[130px]">Last Activity</th>
                  <th scope="col" className="py-3 px-3 text-center">Messages</th>
                  <th scope="col" className="py-3 px-3">Status</th>
                  <th scope="col" className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                {isLoading ? (
                  // Loading Skeletons
                  Array.from({ length: 7 }).map((_, idx) => (
                    <tr key={`skel-${idx}`} className="animate-pulse">
                      <td className="py-3.5 px-3.5">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-5 bg-slate-200 rounded-md w-28"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 rounded w-36 mb-1"></div>
                        <div className="h-3 bg-slate-100 rounded w-28"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-slate-100 rounded w-24"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-3 bg-slate-200 rounded w-28"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-3 bg-slate-200 rounded w-28"></div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="h-4 bg-slate-200 rounded-full w-8 mx-auto"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="h-7 bg-slate-200 rounded-lg w-20 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : paginatedConversations.length === 0 ? (
                  // Empty State
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <MessageSquare size={22} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          No chat conversations were found for the selected filters.
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Try resetting the filters or changing your Store, Booth, or Agent selection.
                        </p>
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          <span>Reset Filters</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Data Rows
                  paginatedConversations.map((conv) => {
                    const customerParticipant = conv.participants.find(
                      (p) => p.userRole === 'customer'
                    );
                    const agentParticipants = conv.participants.filter(
                      (p) => p.userRole === 'agent'
                    );

                    return (
                      <tr
                        key={conv.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* 1. Chat Reference */}
                        <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                          <span className="font-mono text-xs text-[#0D93AA] group-hover:underline">
                            {conv.chatReference}
                          </span>
                        </td>

                        {/* 2. Chat Type */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderTypeBadge(conv.chatType)}
                        </td>

                        {/* 3. Participants */}
                        <td className="py-3 px-3">
                          {conv.chatType === 'customer_agent' ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-medium text-slate-900">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Cust:
                                </span>
                                <span>{customerParticipant?.name || 'Customer'}</span>
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                                  {customerParticipant?.tellerBudId}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D93AA]">
                                  Agent:
                                </span>
                                <span>{conv.primaryAgentName || agentParticipants[0]?.name}</span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  ({conv.primaryAgentId || agentParticipants[0]?.tellerBudId})
                                </span>
                              </div>
                              {customerParticipant?.maskedPhone && (
                                <div className="text-[10px] text-slate-400">
                                  Tel: {customerParticipant.maskedPhone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-medium text-slate-900">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                                  Ag 1:
                                </span>
                                <span>{agentParticipants[0]?.name}</span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  ({agentParticipants[0]?.tellerBudId})
                                </span>
                              </div>
                              {agentParticipants[1] && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                                    Ag 2:
                                  </span>
                                  <span>{agentParticipants[1]?.name}</span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    ({agentParticipants[1]?.tellerBudId})
                                  </span>
                                  {agentParticipants[1]?.isCrossBusiness && (
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
                                      External Partner
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 4. Related Reference */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <button
                            onClick={() => handleRelatedReferenceClick(conv)}
                            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-800 hover:text-[#0D93AA] bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 px-2 py-1 rounded transition-colors cursor-pointer"
                            title={`Open details for ${conv.relatedEntityId}`}
                          >
                            <span>{conv.relatedEntityId}</span>
                            <ExternalLink size={11} className="text-slate-400 group-hover:text-[#0D93AA]" />
                          </button>
                        </td>

                        {/* 5. Store / Booth */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-800 truncate max-w-[190px]" title={conv.storeName}>
                              {conv.storeName || '—'}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[190px]" title={conv.boothName}>
                              {conv.boothName || '—'}
                            </div>
                          </div>
                        </td>

                        {/* 6. Started */}
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {formatToCAT(conv.startedAt)}
                        </td>

                        {/* 7. Last Activity */}
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {formatToCAT(conv.lastActivityAt)}
                        </td>

                        {/* 8. Messages */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {conv.messages.length}
                          </span>
                        </td>

                        {/* 9. Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStatusBadge(conv.status)}
                        </td>

                        {/* 10. Action: View Chat */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/business-owner/communication/chat-report/${conv.chatReference}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] hover:text-white bg-[#0D93AA]/10 hover:bg-[#0D93AA] rounded-lg transition-colors cursor-pointer"
                            title="View full conversation transcript and details"
                          >
                            <Eye size={13} />
                            <span>View Chat</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. FIXED PAGINATION CONTROLS (At Bottom) */}
        <div className="shrink-0 border-t border-slate-200 px-4 py-3 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-slate-600">
            Showing <span className="font-semibold text-slate-900">{startIndex}</span> to{' '}
            <span className="font-semibold text-slate-900">{endIndex}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalFilteredCount}</span> conversations
          </div>

          <div className="flex items-center gap-3">
            {/* Rows Per Page */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0D93AA] text-slate-700"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Previous / Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={validCurrentPage <= 1 || isLoading}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  tableContainerRef.current?.scrollTo({ top: 0 });
                }}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="text-xs font-semibold px-2 text-slate-700">
                Page {validCurrentPage} of {totalPages}
              </span>

              <button
                disabled={validCurrentPage >= totalPages || isLoading}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  tableContainerRef.current?.scrollTo({ top: 0 });
                }}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
