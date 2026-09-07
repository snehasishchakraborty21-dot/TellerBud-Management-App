import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Repeat,
  Building2,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  ShieldAlert,
  Info,
  Timer,
  Check,
  Users,
} from 'lucide-react';
import { adminService } from '../services/mockAdminService';
import { AgentToAgentRequest } from '../types/admin';
import { AgentLiquidityStatusBadge } from '../components/agent-liquidity/AgentLiquidityStatusBadge';
import { AgentLiquidityTypeBadge } from '../components/agent-liquidity/AgentLiquidityTypeBadge';
import { formatZMW, formatWithdrawalDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const AgentLiquidityDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [request, setRequest] = useState<AgentToAgentRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  const loadRequestData = useCallback(async () => {
    if (!reference) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const data = await adminService.getAgentLiquidityRequestByReference(reference);
      if (!data) {
        setNotFound(true);
        setRequest(null);
      } else {
        setNotFound(false);
        setRequest(data);
      }
    } catch (err) {
      console.error('Failed to load agent-to-agent liquidity details:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    loadRequestData();
    const unsubscribe = adminService.subscribe(loadRequestData);
    return () => unsubscribe();
  }, [loadRequestData]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const fallback =
        currentUser?.role === 'business_owner'
          ? '/business-owner/operations/agent-to-agent-liquidity'
          : '/super-admin/operations/agent-to-agent-liquidity';
      navigate(fallback);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-6 w-56 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (notFound || !request) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto py-10">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded-md px-1 py-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Agent-to-Agent Liquidity</span>
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#102025] mb-2">
            Liquidity request not found
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            {reference
              ? `The reference "${reference}" does not exist in the system.`
              : 'No request reference was provided.'}
          </p>
          <button
            type="button"
            onClick={() => {
              const fallback =
                currentUser?.role === 'business_owner'
                  ? '/business-owner/operations/agent-to-agent-liquidity'
                  : '/super-admin/operations/agent-to-agent-liquidity';
              navigate(fallback);
            }}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#0D93AA] text-white text-sm font-semibold rounded-lg hover:bg-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 cursor-pointer"
          >
            Back to Agent-to-Agent Liquidity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Back Action */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded-md px-1 py-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agent-to-Agent Liquidity</span>
        </button>
      </div>

      {/* 2. Top Summary Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0D93AA] flex items-center justify-center">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900 font-mono">
                  {request.reference}
                </span>
                <AgentLiquidityStatusBadge status={request.status} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Requested on {formatWithdrawalDate(request.requestedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Requested Amount
              </span>
              <span className="text-xl font-extrabold text-gray-900 font-mono">
                {formatZMW(request.amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Request Type
            </span>
            <div className="mt-1">
              <AgentLiquidityTypeBadge requestType={request.requestType} size="sm" />
            </div>
          </div>

          <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Requested From
            </span>
            <span className="text-xs font-bold text-[#0D93AA] bg-cyan-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 border border-[#0D93AA]/20">
              <Users className="w-3 h-3 text-[#0D93AA]" />
              <span>{request.requestedFrom}</span>
            </span>
          </div>

          <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Request State
            </span>
            <span className="text-xs font-semibold text-gray-800 mt-1 block">
              {request.status}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Requesting Agent Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <User className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Requesting Agent Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-gray-400 block">Agent Name</span>
              <span className="font-semibold text-gray-900 text-sm">
                {request.requestingAgentName}
              </span>
              <span className="text-gray-500 font-mono block text-[11px] mt-0.5">
                ID: {request.requestingAgentId}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-gray-400 block">Phone Number</span>
              <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {request.requestingAgentPhone}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-gray-400 block">Business Center</span>
              <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {request.requestingAgentBusiness}
              </span>
            </div>
          </div>
        </div>

        {/* Matched or Candidate Agent Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Repeat className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              {request.status === 'Matching'
                ? 'Offered Candidate Agent (30s Window)'
                : request.matchedAgent
                ? 'Matched Peer Agent'
                : 'Peer Candidate Status'}
            </h3>
          </div>

          {request.status === 'Matching' && request.currentOfferedAgent ? (
            <div className="space-y-3">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span className="text-xs font-bold text-amber-900">
                      Active Offer: {request.currentOfferedAgent.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full">
                    30-Second Response Window
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 text-xs text-amber-950">
                  <div>
                    <span className="text-[10px] text-amber-700 font-medium block">Agent ID</span>
                    <span className="font-mono font-semibold">{request.currentOfferedAgent.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-700 font-medium block">Phone</span>
                    <span>{request.currentOfferedAgent.phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-amber-700 font-medium block">Business Agency</span>
                    <span>{request.currentOfferedAgent.business}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : request.matchedAgent ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Matched Agent</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {request.matchedAgent.name}
                </span>
                <span className="text-gray-500 font-mono block text-[11px] mt-0.5">
                  ID: {request.matchedAgent.id}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Phone Number</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {request.matchedAgent.phone}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Business Agency</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {request.matchedAgent.business}
                </span>
              </div>

              {request.matchedAgent.matchedAt && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Accepted & matched on {formatWithdrawalDate(request.matchedAgent.matchedAt)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600">
              {request.status === 'No Agent Available' && (
                <div className="flex items-start gap-2 text-red-700">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    No available peer agent within the regional proximity accepted the request during the discovery window.
                  </span>
                </div>
              )}
              {request.status === 'Expired' && (
                <div className="flex items-start gap-2 text-stone-700">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <span>
                    The request lifecycle expired before a peer agent accepted and completed the transfer.
                  </span>
                </div>
              )}
              {request.status === 'Cancelled' && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span>
                    This peer liquidity request was cancelled by the requesting agent.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lifecycle Timeline Card */}
        {request.timeline && request.timeline.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Calendar className="w-4 h-4 text-[#0D93AA]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Lifecycle Timeline
              </h3>
            </div>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {request.timeline.map((event) => (
                <div key={event.id} className="relative flex items-center justify-between text-xs">
                  <div className="absolute -left-6 w-4 h-4 rounded-full bg-[#0D93AA] text-white flex items-center justify-center ring-4 ring-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{event.status}</span>
                  <span className="text-gray-500 font-mono text-xs">
                    {formatWithdrawalDate(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
