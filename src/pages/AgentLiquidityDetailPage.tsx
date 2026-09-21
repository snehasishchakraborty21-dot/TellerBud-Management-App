import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AgentToAgentRequest,
  AgentOffer,
} from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { AgentLiquidityStatusBadge } from '../components/agent-liquidity/AgentLiquidityStatusBadge';
import { AgentLiquidityTypeBadge } from '../components/agent-liquidity/AgentLiquidityTypeBadge';
import { formatZMW, formatWithdrawalDate } from '../utils/formatters';
import { formatZambianPhone } from '../utils/customerUtils';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
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
  AlertTriangle,
  FileText,
  Activity,
  History,
  ShieldCheck,
  MapPin,
  Users,
} from 'lucide-react';

export const AgentLiquidityDetailPage: React.FC = () => {
  const { reference, requestId } = useParams<{ reference?: string; requestId?: string }>();
  const lookupKey = reference || requestId || '';
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [request, setRequest] = useState<AgentToAgentRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadRequest = async () => {
      if (!lookupKey) {
        setError('No request reference or ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const businessScope =
          currentUser?.role === 'business_owner' ? currentUser.businessName : undefined;

        const data = await adminService.getAgentLiquidityRequestByReference(
          lookupKey,
          businessScope
        );

        if (!isMounted) return;

        if (!data) {
          setError(
            currentUser?.role === 'business_owner'
              ? 'Agent-to-Agent Liquidity request not found or does not belong to your authorized business scope.'
              : 'Agent-to-Agent Liquidity request not found.'
          );
        } else {
          setRequest(data);
        }
      } catch (err) {
        console.error('Error fetching liquidity request details:', err);
        if (isMounted) setError('Failed to load request details. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRequest();
    return () => {
      isMounted = false;
    };
  }, [lookupKey, currentUser?.role, currentUser?.businessName]);

  const handleBack = () => {
    const basePath =
      currentUser?.role === 'business_owner'
        ? '/business-owner/operations/agent-to-agent-liquidity'
        : '/super-admin/operations/agent-to-agent-liquidity';
    navigate(basePath);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center max-w-5xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D93AA]" />
        <p className="mt-3 text-sm text-gray-500 font-medium">
          Loading Agent-to-Agent Liquidity request details...
        </p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Access Denied or Not Found</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
            {error || 'The requested liquidity record could not be loaded.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] text-white font-semibold rounded-lg text-xs hover:bg-[#0B7A8D] transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Agent-to-Agent Liquidity</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Derive key lifecycle milestones
  const completedEvent = request.timeline?.find((e) =>
    e.status.toLowerCase().includes('completed')
  );
  const cancelledEvent = request.timeline?.find((e) =>
    e.status.toLowerCase().includes('cancelled')
  );
  const expiredEvent = request.timeline?.find((e) =>
    e.status.toLowerCase().includes('expired')
  );

  // Derive offer history list (combines active offer, previous offers, and matched agent offer)
  const offerHistoryList: {
    agentName: string;
    agentId: string;
    agentBusiness: string;
    agentPhone?: string;
    offerSentAt: string;
    offerExpiresAt: string;
    responseStatus: string;
    respondedAt?: string;
    outcome: string;
  }[] = [];

  if (request.offers && request.offers.length > 0) {
    request.offers.forEach((o) => {
      let outcome = 'Timed Out';
      if (o.responseStatus === 'Accepted') outcome = 'Accepted / Matched';
      else if (o.responseStatus === 'Declined') outcome = 'Rejected';
      else if (o.responseStatus === 'Expired') outcome = 'Expired';
      else if (o.responseStatus === 'Awaiting Response') outcome = 'Awaiting Response';

      offerHistoryList.push({
        agentName: o.offeredAgentName,
        agentId: o.offeredAgentId,
        agentBusiness: o.offeredAgentBusiness,
        agentPhone: o.offeredAgentPhone,
        offerSentAt: o.offerSentAt,
        offerExpiresAt: o.offerExpiresAt,
        responseStatus: o.responseStatus,
        respondedAt: o.respondedAt,
        outcome,
      });
    });
  } else if (request.activeOffer) {
    offerHistoryList.push({
      agentName: request.activeOffer.offeredAgentName,
      agentId: request.activeOffer.offeredAgentId,
      agentBusiness: request.activeOffer.offeredAgentBusiness,
      agentPhone: request.activeOffer.offeredAgentPhone,
      offerSentAt: request.activeOffer.offerSentAt,
      offerExpiresAt: request.activeOffer.offerExpiresAt,
      responseStatus: request.activeOffer.responseStatus,
      outcome:
        request.activeOffer.responseStatus === 'Awaiting Response'
          ? 'Active (30s Window)'
          : request.activeOffer.responseStatus,
    });
  } else if (request.matchedAgent) {
    offerHistoryList.push({
      agentName: request.matchedAgent.name,
      agentId: request.matchedAgent.id,
      agentBusiness: request.matchedAgent.business,
      agentPhone: request.matchedAgent.phone,
      offerSentAt: request.requestedAt,
      offerExpiresAt: request.matchedAgent.matchedAt || request.requestedAt,
      responseStatus: 'Accepted',
      respondedAt: request.matchedAgent.matchedAt,
      outcome: 'Matched',
    });
  }

  // Lifecycle stage evaluation
  const lifecycleStages = [
    { id: 1, label: 'Request Created' },
    { id: 2, label: 'Matching Started' },
    { id: 3, label: 'Agent Offered' },
    { id: 4, label: 'Agent Matched' },
    { id: 5, label: 'In Progress' },
    { id: 6, label: 'Completed' },
  ];

  const getStageState = (stageId: number) => {
    const s = request.status;

    if (s === 'Completed') {
      return 'completed';
    }

    if (s === 'In Progress') {
      if (stageId <= 4) return 'completed';
      if (stageId === 5) return 'current';
      return 'pending';
    }

    if (s === 'Agent Matched') {
      if (stageId <= 3) return 'completed';
      if (stageId === 4) return 'current';
      return 'pending';
    }

    if (s === 'Matching') {
      if (stageId <= 2) return 'completed';
      if (stageId === 3) return request.currentOfferedAgent ? 'current' : 'searching';
      return 'pending';
    }

    if (s === 'No Agent Available') {
      if (stageId <= 2) return 'completed';
      if (stageId === 3) return 'failed';
      return 'skipped';
    }

    if (s === 'Expired') {
      if (stageId <= 2) return 'completed';
      if (stageId === 3) return 'expired';
      return 'skipped';
    }

    if (s === 'Cancelled') {
      if (stageId === 1) return 'completed';
      if (stageId === 2) return 'cancelled';
      return 'skipped';
    }

    return 'pending';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* 1. Top Navigation Bar: Back button and Page Title */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0D93AA] hover:text-[#0B7A8D] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA]/30 rounded-md px-1 py-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agent-to-Agent Liquidity</span>
        </button>
      </div>

      {/* 2. Top Summary Card (Header card) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0D93AA] flex items-center justify-center shrink-0">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-lg sm:text-xl font-extrabold text-gray-900 font-mono tracking-tight">
                  {request.reference}
                </span>
                <AgentLiquidityStatusBadge status={request.status} />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Requested on {formatWithdrawalDate(request.requestedAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:text-right">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Requested Amount
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">
                {formatZMW(request.amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100">
          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Request Type
            </span>
            <div className="mt-1">
              <AgentLiquidityTypeBadge requestType={request.requestType} size="sm" />
            </div>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Requested From
            </span>
            <span className="text-xs font-bold text-[#0D93AA] bg-cyan-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 border border-[#0D93AA]/20">
              <Users className="w-3 h-3 text-[#0D93AA]" />
              <span>{request.requestedFrom}</span>
            </span>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Response Window
            </span>
            <span className="text-xs font-semibold text-gray-800 mt-1 block font-mono">
              30 Seconds
            </span>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Lifecycle State
            </span>
            <span className="text-xs font-semibold text-gray-800 mt-1 block">
              {request.status}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Request Information Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <FileText className="w-4 h-4 text-[#0D93AA]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Request Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Request Reference
            </span>
            <span className="font-mono font-bold text-gray-900 text-sm mt-0.5 block">
              {request.reference}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Request Type
            </span>
            <div className="mt-1">
              <AgentLiquidityTypeBadge requestType={request.requestType} />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Requested From
            </span>
            <span className="font-semibold text-gray-800 mt-1 inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0D93AA]" />
              <span>{request.requestedFrom}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Requested Amount
            </span>
            <span className="font-mono font-extrabold text-gray-900 text-sm mt-0.5 block">
              {formatZMW(request.amount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Current Status
            </span>
            <div className="mt-1">
              <AgentLiquidityStatusBadge status={request.status} />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Created Date & Time
            </span>
            <span className="font-mono text-gray-800 mt-0.5 block">
              {formatWithdrawalDate(request.requestedAt)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              Response-Window Duration
            </span>
            <span className="text-gray-800 font-semibold mt-0.5 block">
              30 Seconds
            </span>
          </div>

          {completedEvent && (
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                Completion Date & Time
              </span>
              <span className="font-mono text-emerald-900 font-semibold mt-0.5 block">
                {formatWithdrawalDate(completedEvent.timestamp)}
              </span>
            </div>
          )}

          {expiredEvent && (
            <div>
              <span className="text-[10px] font-bold text-stone-600 uppercase block">
                Expiry Date & Time
              </span>
              <span className="font-mono text-stone-800 font-semibold mt-0.5 block">
                {formatWithdrawalDate(expiredEvent.timestamp)}
              </span>
            </div>
          )}

          {cancelledEvent && (
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase block">
                Cancellation Date & Time
              </span>
              <span className="font-mono text-rose-900 font-semibold mt-0.5 block">
                {formatWithdrawalDate(cancelledEvent.timestamp)}
              </span>
            </div>
          )}

          {request.notes && (
            <div className="sm:col-span-2 lg:col-span-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                Operational Notes / Reason
              </span>
              <p className="text-xs text-gray-700 mt-0.5">{request.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Requesting Agent Details & Offered / Matched Agent Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Requesting Agent Details Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <User className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Requesting Agent Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Agent Full Name</span>
              <span className="font-bold text-gray-900 text-sm block mt-0.5">
                {request.requestingAgentName}
              </span>
              <span className="text-gray-500 font-mono block text-[11px] mt-0.5">
                Agent ID: {request.requestingAgentId}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Complete Phone Number</span>
              <span className="font-mono font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#0D93AA]" />
                {formatZambianPhone(request.requestingAgentPhone)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Business Agency</span>
              <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {request.requestingAgentBusiness}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px]">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Operating Status</span>
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Branch Location</span>
                <span className="text-gray-700 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  Lusaka Region
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Offered / Matched Agent Details Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Repeat className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              {request.status === 'Matching'
                ? 'Offered Candidate Agent'
                : request.matchedAgent
                ? 'Matched Peer Agent'
                : 'Peer Candidate Status'}
            </h3>
          </div>

          {request.status === 'Matching' && request.currentOfferedAgent ? (
            <div className="space-y-3">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-amber-900">
                      Active Offer: {request.currentOfferedAgent.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    30-Second Response Window
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs text-amber-950">
                  <div>
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">TellerBud Agent ID</span>
                    <span className="font-mono font-semibold">{request.currentOfferedAgent.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">Phone Number</span>
                    <span className="font-mono">
                      {request.currentOfferedAgent.phone
                        ? formatZambianPhone(request.currentOfferedAgent.phone)
                        : '—'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">Business Agency</span>
                    <span>{request.currentOfferedAgent.business}</span>
                  </div>
                </div>

                {request.activeOffer && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200/60 grid grid-cols-2 gap-2 text-[11px] text-amber-900 font-mono">
                    <div>
                      <span className="text-[10px] text-amber-700 font-bold uppercase block">Offer Sent</span>
                      <span>{formatWithdrawalDate(request.activeOffer.offerSentAt)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 font-bold uppercase block">Expires At</span>
                      <span>{formatWithdrawalDate(request.activeOffer.offerExpiresAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : request.matchedAgent ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Matched Agent Name</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {request.matchedAgent.name}
                </span>
                <span className="text-gray-500 font-mono block text-[11px] mt-0.5">
                  Agent ID: {request.matchedAgent.id}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Phone Number</span>
                <span className="font-mono font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#0D93AA]" />
                  {request.matchedAgent.phone
                    ? formatZambianPhone(request.matchedAgent.phone)
                    : '—'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Business Agency</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {request.matchedAgent.business}
                </span>
              </div>

              {request.matchedAgent.matchedAt && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Accepted & matched on {formatWithdrawalDate(request.matchedAgent.matchedAt)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 space-y-2">
              {request.status === 'Matching' && (
                <div className="flex items-start gap-2 text-amber-800">
                  <Timer className="w-4 h-4 text-amber-600 animate-spin shrink-0 mt-0.5" />
                  <span>
                    The TellerBud matching engine is discovering online peer agents within your operating radius.
                  </span>
                </div>
              )}
              {request.status === 'No Agent Available' && (
                <div className="flex items-start gap-2 text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    No available peer agent within the regional proximity accepted the request during the discovery window.
                  </span>
                </div>
              )}
              {request.status === 'Expired' && (
                <div className="flex items-start gap-2 text-stone-700">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <span>
                    The request lifecycle expired before a peer agent completed the exchange.
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
      </div>

      {/* 5. Liquidity Request Lifecycle Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Liquidity Request Lifecycle
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">
            Current: {request.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {lifecycleStages.map((stage) => {
            const state = getStageState(stage.id);

            let bgClass = 'bg-gray-50 border-gray-200 text-gray-400';
            let icon = <Clock className="w-3.5 h-3.5 text-gray-400" />;
            let stateLabel = 'Pending';

            if (state === 'completed') {
              bgClass = 'bg-emerald-50/80 border-emerald-200 text-emerald-900';
              icon = <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />;
              stateLabel = 'Completed';
            } else if (state === 'current') {
              bgClass = 'bg-cyan-50 border-[#0D93AA] text-[#0D93AA] ring-2 ring-[#0D93AA]/20';
              icon = <Timer className="w-3.5 h-3.5 text-[#0D93AA] animate-pulse" />;
              stateLabel = 'In Progress';
            } else if (state === 'searching') {
              bgClass = 'bg-amber-50 border-amber-200 text-amber-900';
              icon = <Timer className="w-3.5 h-3.5 text-amber-600 animate-spin" />;
              stateLabel = 'Searching...';
            } else if (state === 'failed') {
              bgClass = 'bg-rose-50 border-rose-200 text-rose-900';
              icon = <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
              stateLabel = 'Ended';
            } else if (state === 'expired') {
              bgClass = 'bg-stone-50 border-stone-200 text-stone-800';
              icon = <Clock className="w-3.5 h-3.5 text-stone-600" />;
              stateLabel = 'Expired';
            } else if (state === 'cancelled') {
              bgClass = 'bg-gray-100 border-gray-300 text-gray-700';
              icon = <Info className="w-3.5 h-3.5 text-gray-500" />;
              stateLabel = 'Cancelled';
            } else if (state === 'skipped') {
              bgClass = 'bg-gray-50/50 border-gray-100 text-gray-300';
              icon = <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />;
              stateLabel = 'Not Reached';
            }

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all ${bgClass}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold font-mono">Stage {stage.id}</span>
                  {icon}
                </div>
                <div className="font-bold text-xs leading-snug">{stage.label}</div>
                <div className="text-[10px] font-semibold mt-1 opacity-80">{stateLabel}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Offer and Matching History Section */}
      {offerHistoryList.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <History className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Offer & Matching History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Offered Agent</th>
                  <th className="py-2.5 px-3">Agent ID</th>
                  <th className="py-2.5 px-3">Business Agency</th>
                  <th className="py-2.5 px-3">Offer Time</th>
                  <th className="py-2.5 px-3">Expiry Time</th>
                  <th className="py-2.5 px-3">Response</th>
                  <th className="py-2.5 px-3 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {offerHistoryList.map((item, idx) => (
                  <tr key={`offer-hist-${idx}`} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {item.agentName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">{item.agentId}</td>
                    <td className="py-2.5 px-3 text-gray-600">{item.agentBusiness}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">
                      {formatWithdrawalDate(item.offerSentAt)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">
                      {formatWithdrawalDate(item.offerExpiresAt)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">
                        {item.responseStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.outcome.includes('Matched') || item.outcome.includes('Accepted')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.outcome.includes('Active')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-50 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {item.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Activity & Audit History Section */}
      {request.timeline && request.timeline.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Calendar className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Activity & Audit History
            </h3>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {request.timeline.map((event, idx) => {
              // Derive actor
              let actor = 'TellerBud System Engine';
              if (event.status.toLowerCase().includes('submitted') || event.status.toLowerCase().includes('created')) {
                actor = `${request.requestingAgentName} (Requesting Agent)`;
              } else if (event.status.toLowerCase().includes('cancelled')) {
                actor = `${request.requestingAgentName} (Requesting Agent)`;
              } else if (event.status.toLowerCase().includes('accepted') && request.matchedAgent) {
                actor = `${request.matchedAgent.name} (Matched Agent)`;
              }

              return (
                <div key={event.id || `tl-${idx}`} className="relative text-xs">
                  <div className="absolute -left-6 w-4 h-4 rounded-full bg-[#0D93AA] text-white flex items-center justify-center ring-4 ring-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-gray-900 text-sm">{event.status}</span>
                    <span className="text-gray-500 font-mono text-xs">
                      {formatWithdrawalDate(event.timestamp)}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Actor:</span>
                    <span>{actor}</span>
                  </div>
                  {event.note && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 mt-1.5">
                      {event.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
