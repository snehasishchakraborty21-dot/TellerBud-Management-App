import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import { AgentRecord } from '../types/admin';
import { AgentAvailabilityBadge } from '../components/agents/AgentAvailabilityBadge';
import { AgentAssignmentBadge } from '../components/agents/AgentAssignmentBadge';
import { AgentAttendanceBadge } from '../components/agents/AgentAttendanceBadge';
import {
  getAgentOperationalHistory,
  AgentOperationalRecord,
} from '../utils/agentHistoryUtils';
import {
  ArrowLeft,
  Building2,
  Phone,
  Clock,
  Banknote,
  Wallet,
  Activity,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Repeat,
  Store,
  ChevronRight,
  ChevronLeft,
  History,
} from 'lucide-react';

export const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const businessScope =
    currentUser?.businessName || 'Lusaka Central Express Agency';
  const businessIdScope = currentUser?.businessId || 'BIZ-LUS-001';

  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Operational History Pagination State
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyPageSize, setHistoryPageSize] = useState<number>(10);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;
      try {
        const found = await adminService.getAgentById(id, businessIdScope);
        setAgent(found);
      } catch (err) {
        console.error('Failed to fetch agent details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, businessIdScope]);

  // Retrieve complete historical records dynamically
  const operationalHistory = useMemo<AgentOperationalRecord[]>(() => {
    if (!agent) return [];
    return getAgentOperationalHistory(agent);
  }, [agent]);

  // Paginated slice of operational records
  const paginatedHistory = useMemo(() => {
    const startIndex = (historyPage - 1) * historyPageSize;
    return operationalHistory.slice(startIndex, startIndex + historyPageSize);
  }, [operationalHistory, historyPage, historyPageSize]);

  const totalHistoryPages = Math.ceil(
    (operationalHistory.length || 1) / historyPageSize
  );

  const formatZMW = (val: number) => {
    return `ZMW ${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (
      s.includes('complete') ||
      s.includes('approved') ||
      s.includes('settled') ||
      s.includes('paid')
    ) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (
      s.includes('progress') ||
      s.includes('active') ||
      s.includes('process') ||
      s.includes('ready')
    ) {
      return 'bg-cyan-50 text-[#0D93AA] border-cyan-200';
    }
    if (
      s.includes('pending') ||
      s.includes('review') ||
      s.includes('finding')
    ) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (
      s.includes('fail') ||
      s.includes('cancel') ||
      s.includes('reject')
    ) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="w-full max-w-none box-border px-4 sm:px-5 lg:px-6 py-16 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#0D93AA]/30 border-t-[#0D93AA] rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-500">
          Loading agent details...
        </p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="w-full max-w-none box-border px-4 sm:px-5 lg:px-6 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs max-w-lg mx-auto">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            Agent Not Found
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            The requested agent does not exist or does not belong to your business.
          </p>
          <button
            type="button"
            onClick={() => navigate('/business-owner/agents')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7A8D] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Agents</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none box-border px-4 sm:px-5 lg:px-6 space-y-5 pb-16">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link
            to="/business-owner/agents"
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-[#0D93AA] font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-[#0D93AA] transition-colors" />
            <span>Back to Agents</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-mono text-gray-800 font-bold">{agent.id}</span>
        </div>
      </div>

      {/* Main Agent Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {agent.avatarUrl ? (
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-[#0D93AA]/30 text-[#0D93AA] font-bold text-xl flex items-center justify-center shrink-0 shadow-2xs">
                {agent.avatarInitials}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {agent.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {agent.accountStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="font-mono font-bold text-gray-900">
                  {agent.id}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {agent.phone}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#0D93AA]" />
                  {agent.businessCentre}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Badges */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
            <div className="flex items-center gap-2">
              <AgentAvailabilityBadge status={agent.availability} size="md" />
              <AgentAssignmentBadge assignment={agent.assignment} size="md" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">
                Last active: <span className="text-gray-800 font-semibold">{agent.lastActive}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Compact Cash Position & Float Position Cards (Single horizontal line, 64-72px height) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Position Card */}
        <div className="bg-white rounded-xl border border-gray-200/90 px-4 py-3 shadow-2xs h-[66px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-[#0D93AA] shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-[13px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Cash Position
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900 font-mono tracking-tight shrink-0">
            {formatZMW(agent.cashPosition)}
          </span>
        </div>

        {/* Float Position Card */}
        <div className="bg-white rounded-xl border border-gray-200/90 px-4 py-3 shadow-2xs h-[66px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-[13px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
              Float Position
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900 font-mono tracking-tight shrink-0">
            {formatZMW(agent.floatPosition)}
          </span>
        </div>
      </div>

      {/* Operational Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Attendance Info */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#0D93AA]" />
            Attendance Information
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Status Today:</span>
              <AgentAttendanceBadge
                status={agent.attendance}
                checkInTime={agent.checkInTime}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Check-In Time:</span>
              <span className="font-semibold text-gray-800">
                {agent.checkInTime || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Registered Date:</span>
              <span className="font-semibold text-gray-800">
                {agent.joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Operations & Assignment Overview */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#0D93AA]" />
            Operations Overview
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Current Activity:</span>
              <AgentAssignmentBadge assignment={agent.assignment} size="sm" />
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Walk-In Handled:</span>
              <span className="font-bold text-gray-900">
                {agent.walkInTransactionCount} transactions
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Cash/Float Requests:</span>
              <span className="font-bold text-gray-900">
                {agent.cashFloatRequestCount} today
              </span>
            </div>
          </div>
        </div>

        {/* 3. Operational Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-[#0D93AA]" />
            Connected Modules
          </h3>
          <div className="space-y-1.5 text-xs">
            <Link
              to="/business-owner/walk-in-transactions"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold transition-colors group"
            >
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#0D93AA]" />
                Walk-In Transactions
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0D93AA]" />
            </Link>
            <Link
              to="/business-owner/operations/cash-float-requests"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold transition-colors group"
            >
              <span className="flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-[#0D93AA]" />
                Cash / Float Requests
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0D93AA]" />
            </Link>
            <Link
              to="/business-owner/operations/agent-to-agent-liquidity"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold transition-colors group"
            >
              <span className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-[#0D93AA]" />
                Agent-to-Agent Liquidity
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0D93AA]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2 & 3. OPERATIONAL HISTORY Section (Full Width, Complete Historical Log, Pagination) */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center text-[#0D93AA]">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              OPERATIONAL HISTORY
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 font-mono">
              {operationalHistory.length} records
            </span>
          </div>

          {/* Page size selector */}
          {operationalHistory.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">Show:</span>
              <select
                value={historyPageSize}
                onChange={(e) => {
                  setHistoryPageSize(Number(e.target.value));
                  setHistoryPage(1);
                }}
                className="h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          )}
        </div>

        {/* Operational Records List */}
        {paginatedHistory.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {paginatedHistory.map((record) => (
              <div
                key={record.id}
                className="p-4 sm:px-6 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Left details */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-900 text-[13px]">
                      {record.type}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold border border-gray-200/70">
                      {record.reference}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-gray-500 font-medium">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{record.formattedDateTime}</span>
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    {record.description}
                  </p>
                </div>

                {/* Right details: Amount & Status Chip */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  <span className="font-bold text-gray-900 font-mono text-sm sm:text-base">
                    {formatZMW(record.amount)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${getStatusBadgeClass(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500 space-y-2">
            <History className="w-8 h-8 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-700 text-sm">No Operational History Found</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              No historical transactions or activities are currently logged for this agent.
            </p>
          </div>
        )}

        {/* Card Footer: Pagination Controls */}
        {operationalHistory.length > 0 && (
          <div className="p-4 sm:px-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-gray-500 font-medium">
              Showing{' '}
              <span className="font-bold text-gray-900">
                {(historyPage - 1) * historyPageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-gray-900">
                {Math.min(historyPage * historyPageSize, operationalHistory.length)}
              </span>{' '}
              of{' '}
              <span className="font-bold text-gray-900">
                {operationalHistory.length}
              </span>{' '}
              operational records
            </span>

            {totalHistoryPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalHistoryPages }, (_, idx) => idx + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalHistoryPages ||
                        Math.abs(p - historyPage) <= 1
                    )
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-1 text-gray-400 font-mono">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setHistoryPage(page)}
                            className={`min-w-[30px] h-[30px] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${
                              historyPage === page
                                ? 'bg-[#0D93AA] text-white shadow-2xs'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))
                  }
                  disabled={historyPage === totalHistoryPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

