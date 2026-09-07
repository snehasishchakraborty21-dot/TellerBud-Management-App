import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import { AgentRecord } from '../types/admin';
import { AgentAvailabilityBadge } from '../components/agents/AgentAvailabilityBadge';
import { AgentAssignmentBadge } from '../components/agents/AgentAssignmentBadge';
import { AgentAttendanceBadge } from '../components/agents/AgentAttendanceBadge';
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
  MessageSquare,
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

  const formatZMW = (val: number) => {
    return `ZMW ${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#0D93AA]/30 border-t-[#0D93AA] rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-500">
          Loading agent details...
        </p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs max-w-lg mx-auto mt-8">
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
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link
            to="/business-owner/agents"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-[#0D93AA] font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Agents Directory</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-mono text-gray-800 font-bold">{agent.id}</span>
        </div>
      </div>

      {/* Main Agent Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
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

          {/* Operational Badges & Direct 1:1 Chat */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
            <div className="flex items-center gap-2">
              <AgentAvailabilityBadge status={agent.availability} size="md" />
              <AgentAssignmentBadge assignment={agent.assignment} size="md" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">
                Last active: <span className="text-gray-800 font-semibold">{agent.lastActive}</span>
              </span>
              <button
                type="button"
                id={`btn-chat-agent-${agent.id}`}
                onClick={() => navigate(`/business-owner/communication/chats?agentId=${agent.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7F93] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>Chat with Agent</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Permitted Wallet Positions (Clearly labeled Cash Position & Float Position) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Cash Position
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-[#0D93AA]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
            {formatZMW(agent.cashPosition)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Physical counter and vault currency assigned to this agent
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Float Position
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
            {formatZMW(agent.floatPosition)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Aggregated digital float balances across authorized MNO and Bank channels
          </p>
        </div>
      </div>

      {/* Operational Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Attendance Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3">
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
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3">
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
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3">
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

      {/* Recent Operational History Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0D93AA]" />
          Recent Operational History
        </h3>

        {agent.recentActivity && agent.recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {agent.recentActivity.map((act) => (
              <div
                key={act.id}
                className="py-3.5 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{act.type}</span>
                    {act.reference && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {act.reference}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{act.description}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{act.timestamp}</span>
                  </div>
                </div>

                {act.amount !== undefined && (
                  <div className="text-right shrink-0">
                    <span className="font-bold text-gray-900 block font-mono text-sm">
                      {formatZMW(act.amount)}
                    </span>
                    {act.status && (
                      <span className="text-[10px] font-semibold text-emerald-600">
                        {act.status}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-500">
            No historical transactions logged for this agent in the current shift.
          </div>
        )}
      </div>
    </div>
  );
};
