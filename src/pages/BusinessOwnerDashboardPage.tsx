import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  UserCheck,
  Banknote,
  Repeat,
  Store,
  Clock,
  CalendarCheck,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  CircleDot,
  Radio,
  Coins,
} from 'lucide-react';
import { adminService } from '../services/mockAdminService';
import { useAuth } from '../context/AuthContext';
import { formatZMW, formatWithdrawalDate } from '../utils/formatters';
import { CashFloatRequest, AgentToAgentRequest } from '../types/admin';
import { AttendanceRecord } from '../types/attendance';
import { TODAY_DATE } from '../data/mockAttendanceData';
import { CashFloatSummaryModal } from '../components/cash-float/CashFloatSummaryModal';
import { AgentLiquiditySummaryModal } from '../components/agent-liquidity/AgentLiquiditySummaryModal';

interface BusinessMetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accentColor?: string;
  iconBgColor?: string;
  onClick: () => void;
}

const BusinessMetricCard: React.FC<BusinessMetricCardProps> = ({
  label,
  value,
  icon: Icon,
  accentColor = 'text-[#0D93AA]',
  iconBgColor = 'bg-cyan-50 text-[#0D93AA]',
  onClick,
}) => {
  const isCurrency = typeof value === 'string' && value.includes('ZMW');

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="bg-white border border-gray-100 hover:border-[#0D93AA]/30 rounded-xl p-4 sm:p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[116px]"
    >
      {/* Top Row: Metric Label & Icon */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider line-clamp-2 leading-snug">
          {label}
        </span>
        <div className={`p-2 rounded-lg transition-transform group-hover:scale-105 shrink-0 ${iconBgColor}`}>
          <Icon size={17} />
        </div>
      </div>

      {/* Bottom Row: Full Unclipped Value & Far-Right Navigation Arrow */}
      <div className="flex items-baseline justify-between gap-1.5 mt-auto pt-1 w-full">
        <span
          className={`font-bold tracking-tight whitespace-nowrap ${
            isCurrency
              ? 'text-[15px] sm:text-base lg:text-[14.5px] xl:text-base'
              : 'text-xl sm:text-2xl'
          } ${accentColor}`}
        >
          {value}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0D93AA] group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
      </div>
    </div>
  );
};

export const BusinessOwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const businessName = currentUser?.businessName || 'Lusaka Central Express Agency';
  const businessId = currentUser?.businessId || 'BIZ-LUS-001';

  // Data states
  const [cashFloatRequests, setCashFloatRequests] = useState<CashFloatRequest[]>([]);
  const [pendingCashFloatCount, setPendingCashFloatCount] = useState<number>(1);
  const [approvedCashFloatCount, setApprovedCashFloatCount] = useState<number>(1);
  const [liquidityRequests, setLiquidityRequests] = useState<AgentToAgentRequest[]>([]);
  const [notCheckedInAgents, setNotCheckedInAgents] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal inspection states
  const [selectedCashFloat, setSelectedCashFloat] = useState<CashFloatRequest | null>(null);
  const [selectedLiquidity, setSelectedLiquidity] = useState<AgentToAgentRequest | null>(null);

  const loadDashboardData = async () => {
    try {
      // 1. Scoped Cash / Float requests
      const cfRes = await adminService.getCashFloatRequests({}, undefined, businessName);
      setCashFloatRequests(cfRes.items.slice(0, 5));
      setPendingCashFloatCount(cfRes.summary.pendingReview);
      setApprovedCashFloatCount(cfRes.summary.approved);

      // 2. Scoped Agent-to-Agent liquidity requests
      const atlRes = await adminService.getAgentLiquidityRequests({}, undefined, businessName);
      setLiquidityRequests(atlRes.items.slice(0, 5));

      // 3. Scoped Attendance data for current date (01-09-2026)
      const attRes = await adminService.getAttendanceRecords({ date: TODAY_DATE }, businessId);
      const notCheckedIn = attRes.items.filter((rec) => rec.status === 'Not Checked In');
      setNotCheckedInAgents(notCheckedIn);
    } catch (err) {
      console.error('Failed to load business owner dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const unsub = adminService.subscribe(loadDashboardData);
    return () => unsub();
  }, [businessName, businessId]);

  // Scoped Recent Business Activity records (sorted in descending chronological order)
  const recentBusinessActivity = [
    {
      id: 'ACT-004',
      reference: 'TB-WLK-3301',
      type: 'Walk-In Cash Deposit',
      actor: 'Natasha Zulu',
      timestamp: 'Today, 11:15 AM',
      amount: 3200.0,
      status: 'Completed',
      flow: 'in',
    },
    {
      id: 'ACT-006',
      reference: 'TB-LDG-9021',
      type: 'Agency Float Transfer',
      actor: 'Faith Mwewa',
      timestamp: 'Today, 10:05 AM',
      amount: 2500.0,
      status: 'Completed',
      flow: 'out',
    },
    {
      id: 'ACT-002',
      reference: 'TB-AGW-8819',
      type: 'Agent Float Top-Up',
      actor: 'Kelvin Phiri',
      timestamp: 'Today, 09:45 AM',
      amount: 5000.0,
      status: 'Completed',
      flow: 'out',
    },
    {
      id: 'ACT-001',
      reference: 'TB-WLT-7734',
      type: 'Business Wallet Funding',
      actor: businessName,
      timestamp: 'Today, 09:08 AM',
      amount: 25000.0,
      status: 'Completed',
      flow: 'in',
    },
    {
      id: 'ACT-005',
      reference: 'TB-COM-1102',
      type: 'Agent Commission Credit',
      actor: 'Brian Lungu',
      timestamp: 'Today, 08:30 AM',
      amount: 420.0,
      status: 'Completed',
      flow: 'in',
    },
    {
      id: 'ACT-003',
      reference: 'TB-CFR-5022',
      type: 'Cash / Float Fulfilment',
      actor: 'Joseph Kaunda',
      timestamp: 'Today, 07:20 AM',
      amount: 6500.0,
      status: 'Fulfilled',
      flow: 'out',
    },
  ];

  const formatNotCheckedInSubtitle = (agents: AttendanceRecord[]) => {
    const names = agents.map((a) => a.agentName);
    if (names.length === 0) return '';
    if (names.length === 1) {
      return `${names[0]} has not checked in.`;
    }
    if (names.length === 2) {
      return `${names[0]} and ${names[1]} have not checked in.`;
    }
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} have not checked in.`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Business Identification Bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-[#0D93AA]/15 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-[#102025]">{businessName}</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">
              Business ID: {businessId}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <BusinessMetricCard
          label="Agents Online"
          value="6"
          icon={Users}
          iconBgColor="bg-cyan-50 text-[#0D93AA]"
          accentColor="text-[#102025]"
          onClick={() => navigate('/business-owner/people/agents')}
        />
        <BusinessMetricCard
          label="Agents Available"
          value="4"
          icon={UserCheck}
          iconBgColor="bg-emerald-50 text-emerald-600"
          accentColor="text-emerald-700"
          onClick={() => navigate('/business-owner/people/agents?status=Available')}
        />
        <BusinessMetricCard
          label="Agents on Active Requests"
          value="2"
          icon={Activity}
          iconBgColor="bg-blue-50 text-blue-600"
          accentColor="text-blue-700"
          onClick={() => navigate('/business-owner/operations/live')}
        />
        <BusinessMetricCard
          label="Pending Cash / Float"
          value={pendingCashFloatCount}
          icon={Banknote}
          iconBgColor={pendingCashFloatCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-cyan-50 text-[#0D93AA]'}
          accentColor={pendingCashFloatCount > 0 ? 'text-amber-600' : 'text-[#102025]'}
          onClick={() => navigate('/business-owner/operations/cash-float-requests?status=Pending Review')}
        />
        <BusinessMetricCard
          label="End-of-Day Pending"
          value="2"
          icon={CalendarCheck}
          iconBgColor="bg-amber-50 text-amber-600"
          accentColor="text-amber-600"
          onClick={() => navigate('/business-owner/people/attendance?tab=eod')}
        />
        <BusinessMetricCard
          label="Today’s Mobile Money Value"
          value="ZMW 18,450.00"
          icon={Store}
          iconBgColor="bg-cyan-50 text-[#0D93AA]"
          accentColor="text-[#0D93AA]"
          onClick={() => navigate('/business-owner/mobile-money-transactions')}
        />
      </div>

      {/* 3. Two-Column Middle Grid: Requires Attention & Agent Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Requires Attention */}
        <div className="lg:col-span-6 bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#102025] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Requires Attention</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {/* Cash/Float Awaiting Review */}
            <div
              onClick={() => navigate('/business-owner/operations/cash-float-requests?status=Pending Review')}
              role="button"
              tabIndex={0}
              className="p-3 bg-amber-50/70 hover:bg-amber-50 border border-amber-200/80 hover:border-amber-300 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-amber-900 transition-colors">
                    {pendingCashFloatCount} Cash / Float request awaiting review
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Kelvin Phiri • ZMW 8,000.00 Float
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            {/* Approved Cash/Float Ready for Processing */}
            <div
              onClick={() => navigate('/business-owner/operations/cash-float-requests?status=Approved')}
              role="button"
              tabIndex={0}
              className="p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 hover:border-blue-300 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    {approvedCashFloatCount} Approved Cash / Float request ready for processing
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Natasha Zulu • ZMW 5,000.00 Cash
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            {/* End of Day Submissions */}
            <div
              onClick={() => navigate('/business-owner/people/attendance?tab=eod')}
              role="button"
              tabIndex={0}
              className="p-3 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-gray-950 transition-colors">
                    2 End-of-Day submissions awaiting review
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Brian Lungu, Faith Mwewa • Reconciliation pending
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            {/* Attendance Status Alert */}
            {notCheckedInAgents.length > 0 && (
              <div
                onClick={() => navigate('/business-owner/people/attendance?tab=attendance')}
                role="button"
                tabIndex={0}
                className="p-3 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-gray-900 group-hover:text-gray-950 transition-colors">
                      {notCheckedInAgents.length === 1
                        ? '1 Agent not checked in today'
                        : `${notCheckedInAgents.length} Agents not checked in today`}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {formatNotCheckedInSubtitle(notCheckedInAgents)}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            )}

            {/* Request Finding an Agent Alert */}
            <div
              onClick={() => navigate('/business-owner/operations/live')}
              role="button"
              tabIndex={0}
              className="p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 hover:border-blue-300 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    2 Requests Finding an Agent
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Chanda Mulenga, Lombe Kasonde • Automated matching in progress
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column: Agent Availability */}
        <div className="lg:col-span-6 bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0D93AA]" />
              <h3 className="text-sm font-bold text-[#102025]">Agent Availability</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/business-owner/agents')}
              className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] cursor-pointer flex items-center gap-1 transition-colors"
            >
              <span>View All Agents</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Mathematical Status Breakdown Summary */}
          <div className="p-3.5 bg-gray-50/70 border border-gray-200/70 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-600 uppercase tracking-wider text-[11px]">
                Total Agents
              </span>
              <span className="text-sm font-bold text-[#102025]">8</span>
            </div>

            {/* Segmented Distribution Bar (Total: 8 | Available: 4, On Active Request: 2, Offline: 2) */}
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: '50%' }}
                className="bg-emerald-500 h-full"
                title="Available: 4 (50%)"
              />
              <div
                style={{ width: '25%' }}
                className="bg-[#0D93AA] h-full"
                title="On Active Request: 2 (25%)"
              />
              <div
                style={{ width: '25%' }}
                className="bg-gray-400 h-full"
                title="Offline: 2 (25%)"
              />
            </div>

            {/* Stats Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 bg-white rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Online</div>
                <div className="text-sm font-bold text-[#102025]">6</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Available</div>
                <div className="text-sm font-bold text-emerald-700">4</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-cyan-100">
                <div className="text-[10px] font-bold text-[#0D93AA] uppercase">Active Request</div>
                <div className="text-sm font-bold text-[#0D93AA]">2</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-100">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Offline</div>
                <div className="text-sm font-bold text-gray-600">2</div>
              </div>
            </div>
          </div>

          {/* Quick Agent Roster List */}
          <div className="space-y-2">
            {[
              { id: 'TB-AGT-1024', name: 'Kelvin Phiri', status: 'On Active Request (Pickup)', badgeClass: 'bg-cyan-50 text-[#0D93AA] border-cyan-200' },
              { id: 'TB-AGT-1055', name: 'Brian Lungu', status: 'Available', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { id: 'TB-AGT-1062', name: 'Natasha Zulu', status: 'On Active Request (Pickup)', badgeClass: 'bg-cyan-50 text-[#0D93AA] border-cyan-200' },
              { id: 'TB-AGT-1064', name: 'Joseph Kaunda', status: 'Available', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            ].map((agent) => (
              <div
                key={agent.id}
                onClick={() => navigate(`/business-owner/agents/${agent.id}`)}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0D93AA]/10 text-[#0D93AA] font-bold text-xs flex items-center justify-center shrink-0">
                    {agent.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#102025]">{agent.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{agent.id}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${agent.badgeClass}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Cash / Float Requests Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-sm font-bold text-[#102025]">Cash / Float Requests</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate('/business-owner/operations/cash-float-requests')}
            className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-2.5 font-semibold">Reference</th>
                <th className="pb-2.5 font-semibold">Agent</th>
                <th className="pb-2.5 font-semibold">Agent ID</th>
                <th className="pb-2.5 font-semibold">Request Type</th>
                <th className="pb-2.5 font-semibold">Amount</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold">Requested</th>
                <th className="pb-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cashFloatRequests.map((req) => {
                const isPending = req.status === 'Pending Review';
                const isApproved = req.status === 'Approved';
                const isProcessing = req.status === 'Processing';
                const isFulfilled = req.status === 'Fulfilled';

                let statusBadge = 'bg-gray-100 text-gray-700 border-gray-200';
                if (isPending) statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                else if (isApproved) statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (isProcessing) statusBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                else if (isFulfilled) statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 font-bold font-mono text-gray-900">
                      <button
                        type="button"
                        onClick={() => navigate(`/business-owner/operations/cash-float-requests/${req.reference}`)}
                        className="hover:text-[#0D93AA] hover:underline cursor-pointer text-left"
                      >
                        {req.reference}
                      </button>
                    </td>
                    <td className="py-3 text-gray-800 font-semibold">{req.agentName}</td>
                    <td className="py-3 font-mono text-gray-500 text-[11px]">{req.agentId}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        {req.requestType}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-[#102025]">{formatZMW(req.amount)}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 font-mono text-[11px]">
                      {formatWithdrawalDate(req.requestedAt)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCashFloat(req)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#0D93AA] hover:bg-cyan-50 rounded-md border border-[#0D93AA]/20 hover:border-[#0D93AA] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Agent-to-Agent Liquidity Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-sm font-bold text-[#102025]">Agent-to-Agent Liquidity</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate('/business-owner/operations/agent-to-agent-liquidity')}
            className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-2.5 font-semibold">Reference</th>
                <th className="pb-2.5 font-semibold">Requesting Agent</th>
                <th className="pb-2.5 font-semibold">Type</th>
                <th className="pb-2.5 font-semibold">Amount</th>
                <th className="pb-2.5 font-semibold">Matched / Offered Agent</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold">Requested</th>
                <th className="pb-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {liquidityRequests.map((atl) => {
                const partnerName =
                  atl.matchedAgent?.name ||
                  atl.currentOfferedAgent?.name ||
                  'Matching Engine...';

                let statusBadge = 'bg-gray-100 text-gray-700 border-gray-200';
                if (atl.status === 'Matching') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                else if (atl.status === 'Agent Matched') statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (atl.status === 'In Progress') statusBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                else if (atl.status === 'Completed') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={atl.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 font-bold font-mono text-gray-900">
                      <button
                        type="button"
                        onClick={() => navigate(`/business-owner/operations/agent-to-agent-liquidity/${atl.reference}`)}
                        className="hover:text-[#0D93AA] hover:underline cursor-pointer text-left"
                      >
                        {atl.reference}
                      </button>
                    </td>
                    <td className="py-3 text-gray-800 font-semibold">{atl.requestingAgentName}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        {atl.requestType}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-[#102025]">{formatZMW(atl.amount)}</td>
                    <td className="py-3 text-gray-700">{partnerName}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {atl.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 font-mono text-[11px]">
                      {formatWithdrawalDate(atl.requestedAt)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLiquidity(atl)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#0D93AA] hover:bg-cyan-50 rounded-md border border-[#0D93AA]/20 hover:border-[#0D93AA] transition-colors cursor-pointer"
                      >
                        View Summary
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Recent Business Activity Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0D93AA]" />
            <h3 className="text-sm font-bold text-[#102025]">Recent Business Activity</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-2.5 font-semibold">Reference</th>
                <th className="pb-2.5 font-semibold">Activity Type</th>
                <th className="pb-2.5 font-semibold">Account / Agent</th>
                <th className="pb-2.5 font-semibold">Timestamp</th>
                <th className="pb-2.5 font-semibold">Amount</th>
                <th className="pb-2.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBusinessActivity.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 font-bold font-mono text-gray-900">{act.reference}</td>
                  <td className="py-3 font-semibold text-gray-800 flex items-center gap-2">
                    {act.flow === 'in' ? (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    )}
                    <span>{act.type}</span>
                  </td>
                  <td className="py-3 text-gray-700">{act.actor}</td>
                  <td className="py-3 text-gray-500 font-mono text-[11px]">{act.timestamp}</td>
                  <td className="py-3 font-bold text-[#102025]">{formatZMW(act.amount)}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Float Summary Inspection Modal */}
      {selectedCashFloat && (
        <CashFloatSummaryModal
          request={selectedCashFloat}
          onClose={() => setSelectedCashFloat(null)}
        />
      )}

      {/* Agent Liquidity Summary Modal */}
      {selectedLiquidity && (
        <AgentLiquiditySummaryModal
          request={selectedLiquidity}
          isOpen={Boolean(selectedLiquidity)}
          onClose={() => setSelectedLiquidity(null)}
        />
      )}
    </div>
  );
};
