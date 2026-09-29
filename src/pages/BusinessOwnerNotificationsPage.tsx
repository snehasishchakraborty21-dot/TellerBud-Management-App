import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  ChevronLeft,
  ChevronRight,
  Banknote,
  UserCheck,
  ArrowLeftRight,
  Users,
  FileCheck2,
  Wallet,
  Percent,
  ShieldCheck,
  CheckCheck,
  Activity,
} from 'lucide-react';
import {
  BONotification,
  NotificationCategory,
  NotificationPriority,
  NotificationTabCounts,
} from '../types/notifications';
import { boNotificationService } from '../services/notificationService';
import { NotificationDetailsModal } from '../components/notifications/NotificationDetailsModal';

const ITEMS_PER_PAGE = 10;

export const BusinessOwnerNotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [notifications, setNotifications] = useState<BONotification[]>([]);
  const [counts, setCounts] = useState<NotificationTabCounts>({
    all: 0,
    unread: 0,
    actionRequired: 0,
    read: 0,
  });

  // Active Tab: 'All' | 'Unread' | 'Action Required' | 'Read'
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Action Required' | 'Read'>('All');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedReadStatus, setSelectedReadStatus] = useState<'All' | 'Read' | 'Unread'>('All');
  const [selectedPriority, setSelectedPriority] = useState<'All' | NotificationPriority>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [selectedNotification, setSelectedNotification] = useState<BONotification | null>(null);

  // Load and subscribe to notification state
  const reloadData = () => {
    const list = boNotificationService.getBONotifications();
    setNotifications(list);
    setCounts(boNotificationService.getCounts());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = boNotificationService.subscribe(() => {
      reloadData();
    });
    return () => unsubscribe();
  }, []);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === 'Unread' && item.read) return false;
      if (activeTab === 'Read' && !item.read) return false;
      if (activeTab === 'Action Required' && !item.actionRequired) return false;

      // Category filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Charges & Revenue' || selectedCategory === 'Charges & Commissions') {
          if (item.category !== 'Charges & Revenue' && item.category !== 'Charges & Commissions') {
            return false;
          }
        } else if (item.category !== selectedCategory) {
          return false;
        }
      }

      // Read status filter
      if (selectedReadStatus === 'Read' && !item.read) return false;
      if (selectedReadStatus === 'Unread' && item.read) return false;

      // Priority filter
      if (selectedPriority !== 'All' && item.priority !== selectedPriority) {
        return false;
      }

      // Date range filter
      if (fromDate && item.rawDate < fromDate) return false;
      if (toDate && item.rawDate > toDate) return false;

      // Search query filter (title, reference, agent name/id, message)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchMessage = item.message.toLowerCase().includes(query);
        const matchRef = item.relatedReference?.toLowerCase().includes(query);
        const matchAgent =
          item.agent?.name.toLowerCase().includes(query) ||
          item.agent?.id?.toLowerCase().includes(query);
        const matchCategory = item.category.toLowerCase().includes(query);

        if (!matchTitle && !matchMessage && !matchRef && !matchAgent && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [
    notifications,
    activeTab,
    selectedCategory,
    selectedReadStatus,
    selectedPriority,
    fromDate,
    toDate,
    searchQuery,
  ]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    selectedCategory,
    selectedReadStatus,
    selectedPriority,
    fromDate,
    toDate,
    searchQuery,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE) || 1;
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredNotifications, currentPage]);

  // Handlers
  const handleMarkAllRead = () => {
    // Marks every visible notification as read
    const visibleIds = filteredNotifications.filter((n) => !n.read).map((n) => n.id);
    boNotificationService.markAllAsRead(visibleIds.length > 0 ? visibleIds : undefined);
  };

  const handleOpenNotification = (notification: BONotification) => {
    if (!notification.read) {
      boNotificationService.markAsRead(notification.id);
    }
    const updated = boNotificationService.getNotificationById(notification.id);
    setSelectedNotification(updated || notification);
  };

  const handleToggleReadRow = (e: React.MouseEvent, notification: BONotification) => {
    e.stopPropagation();
    boNotificationService.toggleRead(notification.id);
  };

  const handleActionClick = (e: React.MouseEvent, notification: BONotification) => {
    e.stopPropagation();
    if (!notification.read) {
      boNotificationService.markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedReadStatus('All');
    setSelectedPriority('All');
    setFromDate('');
    setToDate('');
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Cash / Float Requests':
        return <Banknote size={16} className="text-sky-700" />;
      case 'Live Operations':
        return <Activity size={16} className="text-teal-700" />;
      case 'Agents':
        return <UserCheck size={16} className="text-teal-700" />;
      case 'Agent-to-Agent Liquidity':
        return <ArrowLeftRight size={16} className="text-indigo-700" />;
      case 'Walk-In Transactions':
        return <Users size={16} className="text-blue-700" />;
      case 'Attendance':
        return <Clock size={16} className="text-amber-700" />;
      case 'End-of-Day':
        return <FileCheck2 size={16} className="text-emerald-700" />;
      case 'Global Wallet':
        return <Wallet size={16} className="text-sky-800" />;
      case 'Charges & Revenue':
      case 'Charges & Commissions':
        return <Percent size={16} className="text-purple-700" />;
      case 'System':
      default:
        return <ShieldCheck size={16} className="text-slate-700" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Urgent
          </span>
        );
      case 'Important':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Important
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-3.5 max-w-[1600px] w-full mx-auto select-none">
      {/* Top Action Bar (Frozen upper section) */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Overview
        </span>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={counts.unread === 0}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-xs ${
            counts.unread === 0
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-white text-[#0D93AA] border border-[#0D93AA]/30 hover:bg-[#0D93AA]/5 hover:border-[#0D93AA] cursor-pointer'
          }`}
        >
          <CheckCheck size={15} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* 1. SUMMARY CARDS (Frozen upper section) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 shrink-0">
        {/* All Notifications Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              All Notifications
            </span>
            <span className="text-2xl font-bold text-slate-900 leading-tight">
              {counts.all}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Bell size={20} />
          </div>
        </div>

        {/* Unread Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Unread
            </span>
            <span className="text-2xl font-bold text-[#0D93AA] leading-tight">
              {counts.unread}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0D93AA]">
            <Eye size={20} />
          </div>
        </div>

        {/* Action Required Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Action Required
            </span>
            <span className="text-2xl font-bold text-amber-600 leading-tight">
              {counts.actionRequired}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* 2. NOTIFICATION TABS (Frozen upper section) */}
      <div className="border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl shrink-0 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'All', label: 'All', count: counts.all },
          { id: 'Unread', label: 'Unread', count: counts.unread },
          { id: 'Action Required', label: 'Action Required', count: counts.actionRequired },
          { id: 'Read', label: 'Read', count: counts.read },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#0D93AA] text-[#0D93AA]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                  isActive
                    ? 'bg-[#0D93AA]/10 text-[#0D93AA]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. SEARCH AND FILTERS (Frozen upper section) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-sm space-y-2.5 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search
              size={15}
              className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, ref, or Agent..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white transition-all cursor-pointer truncate"
            >
              <option value="All">All Categories</option>
              <option value="Cash / Float Requests">Cash / Float Requests</option>
              <option value="Live Operations">Live Operations</option>
              <option value="Agents">Agents</option>
              <option value="Agent-to-Agent Liquidity">Agent-to-Agent Liquidity</option>
              <option value="Walk-In Transactions">Walk-In Transactions</option>
              <option value="Attendance">Attendance</option>
              <option value="End-of-Day">End-of-Day</option>
              <option value="Global Wallet">Global Wallet</option>
              <option value="Charges & Revenue">Charges & Revenue</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Read Status Filter */}
          <div>
            <select
              value={selectedReadStatus}
              onChange={(e) => setSelectedReadStatus(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white transition-all cursor-pointer truncate"
            >
              <option value="All">All Read Statuses</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white transition-all cursor-pointer truncate"
            >
              <option value="All">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="Important">Important</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Second row: From Date, To Date, Clear, Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={reloadData}
              className="px-3 py-1 text-xs font-medium text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. NOTIFICATION LIST (Flexible container with Sticky Header, Scrollable Records, and Fixed Pagination) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Pinned Notification Listing Heading */}
        <div className="shrink-0 bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider shadow-[0_1px_0_0_#E2E8F0]">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-[#0D93AA]" />
            <span>Notification Listing</span>
          </div>
          <span className="text-[11px] font-normal lowercase tracking-normal text-slate-500 font-sans">
            Showing {filteredNotifications.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)} of {filteredNotifications.length} items
          </span>
        </div>

        {/* Scrollable Notifications Records Container */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {paginatedNotifications.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Bell size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                No notifications found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                There are no notifications matching your current filters or selected tab.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedNotifications.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenNotification(item)}
                    className={`p-3.5 sm:p-4 transition-colors cursor-pointer hover:bg-slate-50/80 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      item.read
                        ? 'bg-white'
                        : 'bg-sky-50/40 border-l-4 border-l-[#0D93AA]'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenNotification(item);
                      }
                    }}
                  >
                    {/* Left Column: Icon + Core details */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Category Icon */}
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-slate-900">
                            {item.title}
                          </span>
                          {getPriorityBadge(item.priority)}
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.2 rounded">
                            {item.category}
                          </span>
                          {!item.read && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0D93AA]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA]" />
                              Unread
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-1.5">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          {item.relatedReference && (
                            <span className="font-mono text-slate-600 font-semibold">
                              Ref: {item.relatedReference}
                            </span>
                          )}
                          {item.agent && (
                            <span>
                              Agent:{' '}
                              <strong className="text-slate-600 font-medium">
                                {item.agent.name}
                              </strong>
                            </span>
                          )}
                          {!item.agent && item.businessName && (
                            <span>
                              Entity:{' '}
                              <strong className="text-slate-600 font-medium">
                                {item.businessName}
                              </strong>
                            </span>
                          )}
                          <span>•</span>
                          <span>{item.createdAt}</span>
                          <span className="text-slate-500">({item.timeAgo})</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0">
                      {/* Toggle Read/Unread Icon Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleReadRow(e, item)}
                        title={item.read ? 'Mark as Unread' : 'Mark as Read'}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        aria-label={item.read ? 'Mark as Unread' : 'Mark as Read'}
                      >
                        {item.read ? <EyeOff size={15} /> : <Eye size={15} className="text-[#0D93AA]" />}
                      </button>

                      {/* Contextual Action Button */}
                      <button
                        type="button"
                        onClick={(e) => handleActionClick(e, item)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{item.actionType}</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Fixed Pagination Controls at bottom (Shrink-0) */}
        {filteredNotifications.length > 0 && (
          <div className="shrink-0 p-3 sm:px-4 sm:py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4 flex-wrap text-xs">
            <span className="text-slate-500">
              Showing{' '}
              <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{' '}
              <strong>
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)}
              </strong>{' '}
              of <strong>{filteredNotifications.length}</strong> notifications
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                const isSelected = num === currentPage;
                // Only show a limited window if lots of pages
                if (
                  num === 1 ||
                  num === totalPages ||
                  (num >= currentPage - 1 && num <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={`min-w-[28px] h-7 px-2 rounded font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#0D93AA] text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {num}
                    </button>
                  );
                }
                if (num === currentPage - 2 || num === currentPage + 2) {
                  return (
                    <span key={num} className="px-1 text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          isOpen={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          onToggleRead={(id) => {
            boNotificationService.toggleRead(id);
            const updated = boNotificationService.getNotificationById(id);
            if (updated) setSelectedNotification(updated);
          }}
        />
      )}
    </div>
  );
};
