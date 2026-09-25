import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  UserCheck,
  Banknote,
  Wallet,
  Coins,
  Award,
  ChevronRight,
  AlertTriangle,
  ArrowLeftRight,
} from 'lucide-react';
import { adminService } from '../services/mockAdminService';
import { useAuth } from '../context/AuthContext';
import { useBusinessOwnerDate } from '../context/BusinessOwnerDateContext';
import { toDisplayDate, getZambiaTodayString } from '../utils/dateUtils';
import { formatZMW } from '../utils/formatters';
import { AttendanceRecord } from '../types/attendance';
import { BusinessProfile } from '../types/businessProfile';
import { MonthlyRevenueOverviewChart } from '../components/dashboard/MonthlyRevenueOverviewChart';

interface BusinessMetricCardProps {
  label: string;
  value?: string | number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accentColor?: string;
  iconBgColor?: string;
  isBadge?: boolean;
  onClick: () => void;
}

const BusinessMetricCard: React.FC<BusinessMetricCardProps> = ({
  label,
  value,
  icon: Icon,
  accentColor = 'text-[#0D93AA]',
  iconBgColor = 'bg-cyan-50 text-[#0D93AA]',
  isBadge = false,
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
      className="bg-white border border-gray-100 hover:border-[#0D93AA]/30 rounded-xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[114px] h-full"
    >
      {/* Top Row: Metric Label (Uniform 2-line height container) & Icon */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="text-[11px] font-bold text-gray-500 uppercase tracking-wider line-clamp-2 leading-snug h-[30px] flex items-center"
          title={label}
        >
          {label}
        </span>
        <div className={`p-1.5 sm:p-2 rounded-lg transition-transform group-hover:scale-105 shrink-0 ${iconBgColor}`}>
          <Icon size={16} />
        </div>
      </div>

      {/* Bottom Row: Full Value / Badge & Far-Right Navigation Arrow */}
      <div className="flex items-baseline justify-between gap-1 mt-auto pt-1 w-full">
        {isBadge ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            Coming Soon
          </span>
        ) : (
          <span
            className={`font-bold tracking-tight whitespace-nowrap ${
              isCurrency
                ? 'text-[13.5px] sm:text-[14px] lg:text-[13px] xl:text-[14.5px] font-mono'
                : 'text-xl sm:text-2xl font-mono'
            } ${accentColor}`}
          >
            {value}
          </span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#0D93AA] group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
      </div>
    </div>
  );
};

export const BusinessOwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { selectedDate } = useBusinessOwnerDate();

  const businessId = currentUser?.businessId || 'BIZ-LUS-001';
  const selectedYear = parseInt(selectedDate.split('-')[0], 10) || 2026;

  // Profile and Data states
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [logoLoadFailed, setLogoLoadFailed] = useState<boolean>(false);
  const [pendingCashFloatCount, setPendingCashFloatCount] = useState<number>(1);
  const [approvedCashFloatCount, setApprovedCashFloatCount] = useState<number>(1);
  const [notCheckedInAgents, setNotCheckedInAgents] = useState<AttendanceRecord[]>([]);
  const [globalWalletBalance, setGlobalWalletBalance] = useState<string>('ZMW 145,900.00');
  const [todaysTransactionsCount, setTodaysTransactionsCount] = useState<number>(28);
  const [activeTradingCapital, setActiveTradingCapital] = useState<string>('ZMW 145,900.00');
  const [serviceChargesEarnings, setServiceChargesEarnings] = useState<string>('ZMW 24,850.00');
  const [agentsLoggedInCount, setAgentsLoggedInCount] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);

  const businessName =
    businessProfile?.businessName ||
    currentUser?.businessName ||
    'Lusaka Central Express Agency';
  const logoUrl = businessProfile?.logoUrl;

  // Dynamic Height Synchronization for Requires Attention card matching Agent Availability card
  const agentAvailabilityRef = React.useRef<HTMLDivElement>(null);
  const [maxAttentionHeight, setMaxAttentionHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const updateHeight = () => {
      if (agentAvailabilityRef.current) {
        if (window.innerWidth >= 1024) {
          const height = agentAvailabilityRef.current.offsetHeight;
          if (height > 0) {
            setMaxAttentionHeight(height);
          }
        } else {
          // On stacked tablet/mobile viewports, retain a sensible maximum height with internal scrolling
          setMaxAttentionHeight(450);
        }
      }
    };

    updateHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && agentAvailabilityRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(agentAvailabilityRef.current);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // 0. Business Profile
      const prof = await adminService.getBusinessProfile(businessId);
      if (prof) {
        setBusinessProfile(prof);
        setLogoLoadFailed(false);
      }

      // 1. Scoped Cash / Float request status counts
      const cfRes = await adminService.getCashFloatRequests({}, undefined, businessName);
      setPendingCashFloatCount(cfRes.summary.pendingReview);
      setApprovedCashFloatCount(cfRes.summary.approved);

      // 2. Scoped Attendance data for selected date (DD-MM-YYYY)
      const attRes = await adminService.getAttendanceRecords({ date: toDisplayDate(selectedDate) }, businessId);
      const notCheckedIn = attRes.items.filter((rec) => rec.status === 'Not Checked In');
      setNotCheckedInAgents(notCheckedIn);

      // 3. Global Wallet data for the business
      const walletData = await adminService.getBusinessWallet(businessId);
      if (walletData) {
        setGlobalWalletBalance(formatZMW(walletData.availableBalance || 145900));
        setActiveTradingCapital(formatZMW(walletData.availableBalance || 145900));
      }

      // 4. Mobile Money Transactions for selected date
      const mmRes = await adminService.getMobileMoneyTransactions(
        { dateFrom: selectedDate, dateTo: selectedDate },
        undefined,
        businessName
      );
      if (mmRes.items.length > 0) {
        setTodaysTransactionsCount(mmRes.items.length + 12);
      }
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
  }, [businessName, businessId, selectedDate]);

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
          {/* Business Logo Container: 48px x 48px */}
          <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {logoUrl && !logoLoadFailed ? (
              <img
                src={logoUrl}
                alt={`${businessName} logo`}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={() => setLogoLoadFailed(true)}
              />
            ) : (
              <div
                className="w-full h-full rounded-lg bg-cyan-50 border border-[#0D93AA]/15 text-[#0D93AA] flex items-center justify-center"
                title={`${businessName} placeholder logo`}
              >
                <Building2 className="w-5 h-5 text-[#0D93AA]" aria-hidden="true" />
              </div>
            )}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Today’s Transactions */}
        <BusinessMetricCard
          label="Today’s Transactions"
          value={todaysTransactionsCount}
          icon={ArrowLeftRight}
          iconBgColor="bg-cyan-50 text-[#0D93AA]"
          accentColor="text-[#102025]"
          onClick={() => navigate('/business-owner/transactions/all')}
        />

        {/* 2. Agents Logged In */}
        <BusinessMetricCard
          label="Agents Logged In"
          value={agentsLoggedInCount}
          icon={UserCheck}
          iconBgColor="bg-emerald-50 text-emerald-600"
          accentColor="text-emerald-700"
          onClick={() => navigate('/business-owner/people/agents')}
        />

        {/* 3. Active Trading Capital */}
        <BusinessMetricCard
          label="Active Trading Capital"
          value={activeTradingCapital}
          icon={Banknote}
          iconBgColor="bg-teal-50 text-teal-600"
          accentColor="text-teal-700"
          onClick={() => navigate('/business-owner/operations/agent-to-agent-liquidity')}
        />

        {/* 4. Global Wallet Balance */}
        <BusinessMetricCard
          label="Global Wallet Balance"
          value={globalWalletBalance}
          icon={Wallet}
          iconBgColor="bg-cyan-50 text-[#0D93AA]"
          accentColor="text-[#0D93AA]"
          onClick={() => navigate('/business-owner/global-wallet')}
        />

        {/* 5. Service Charges & Earnings */}
        <BusinessMetricCard
          label="Service Charges & Earnings"
          value={serviceChargesEarnings}
          icon={Coins}
          iconBgColor="bg-indigo-50 text-indigo-600"
          accentColor="text-indigo-700"
          onClick={() => navigate('/business-owner/transactions/commissions')}
        />

        {/* 6. Commissions Earned (Coming Soon) */}
        <BusinessMetricCard
          label="Commissions Earned"
          isBadge={true}
          icon={Award}
          iconBgColor="bg-amber-50 text-amber-600"
          accentColor="text-amber-700"
          onClick={() => navigate('/business-owner/transactions/commissions')}
        />
      </div>

      {/* 3. Two-Column Middle Grid: Requires Attention & Agent Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Requires Attention (Dynamic Height up to Agent Availability + Internal Scrolling) */}
        <div
          style={{
            maxHeight: maxAttentionHeight ? `${maxAttentionHeight}px` : undefined,
          }}
          className="lg:col-span-6 bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col min-h-0"
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
            <h3 className="text-sm font-bold text-[#102025] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Requires Attention</span>
            </h3>
          </div>

          {/* Internal Scrollable Records Area */}
          <div className="space-y-2.5 overflow-y-auto pr-1 -mr-1 pt-3 min-h-0 flex-1 attention-records-scroll">
            {/* Cash/Float Awaiting Review */}
            <div
              onClick={() => navigate('/business-owner/operations/cash-float-requests?status=Pending Review')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/business-owner/operations/cash-float-requests?status=Pending Review');
                }
              }}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/business-owner/operations/cash-float-requests?status=Approved');
                }
              }}
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

            {/* 1. Agents have not submitted End-of-Day reports */}
            <div
              onClick={() => navigate('/business-owner/people/attendance?tab=eod')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/business-owner/people/attendance?tab=eod');
                }
              }}
              className="p-3 bg-amber-50/70 hover:bg-amber-50 border border-amber-200/80 hover:border-amber-300 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-amber-900 transition-colors">
                    3 Agents have not submitted End-of-Day reports
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Kelvin Phiri, Natasha Zulu and Mwansa Tembo
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            {/* 2. Devices available but not assigned */}
            <div
              onClick={() => navigate('/business-owner/organization/devices?status=Available')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/business-owner/organization/devices?status=Available');
                }
              }}
              className="p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 hover:border-blue-300 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    2 Devices are available but not assigned
                  </div>
                  <div className="text-[11px] text-gray-600">
                    PAX A920 Smart POS B2 and Samsung Galaxy XCover Pro
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            {/* 3. Booth has no assigned Agent */}
            <div
              onClick={() => navigate('/business-owner/organization/stores?tab=booths&search=Booth%203')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/business-owner/organization/stores?tab=booths&search=Booth%203');
                }
              }}
              className="p-3 bg-amber-50/70 hover:bg-amber-50 border border-amber-200/80 hover:border-amber-300 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-amber-900 transition-colors">
                    1 Booth has no assigned Agent
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Booth 3 – Express Walk-in Desk
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            {/* 4. Transactions awaiting confirmation */}
            <div
              onClick={() => navigate('/business-owner/transactions/all?status=Pending%20Confirmation')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/business-owner/transactions/all?status=Pending%20Confirmation');
                }
              }}
              className="p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 hover:border-blue-300 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    3 Transactions are awaiting confirmation
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Total transaction value: ZMW 12,500.00
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            {/* Attendance Status Alert */}
            {notCheckedInAgents.length > 0 && (
              <div
                onClick={() => navigate('/business-owner/people/attendance?tab=attendance')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/business-owner/people/attendance?tab=attendance');
                  }
                }}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/business-owner/operations/live');
                }
              }}
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
        <div ref={agentAvailabilityRef} className="lg:col-span-6 bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0D93AA]" />
              <h3 className="text-sm font-bold text-[#102025]">Agent Availability</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/business-owner/people/agents')}
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

      {/* 4. Full-Width Monthly Revenue Overview Line Graph */}
      <MonthlyRevenueOverviewChart year={selectedYear} />
    </div>
  );
};
