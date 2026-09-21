import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  X,
  Eye,
  Radio,
  Clock,
  CheckCircle2,
  Zap,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Receipt,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import { PickupRequest } from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { useAuth } from '../context/AuthContext';
import { formatZMW } from '../config/appConfig';
import { StatusChip } from '../components/shared/StatusChip';
import { LiveRequestDetailsDrawer } from '../components/admin/LiveRequestDetailsDrawer';

export const LiveOperationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  // Business-level data isolation: Resolve strictly from authenticated session
  const authenticatedBusinessId = currentUser?.businessId || 'BIZ-LUS-001';
  const authenticatedBusinessName = currentUser?.businessName || 'Lusaka Central Express Agency';

  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [unauthorizedAccessError, setUnauthorizedAccessError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Live Operations - Customer Requests | TellerBud';
  }, []);

  // Search & Filters (Inappropriate filters removed: All Businesses, All Service Times, All Vendors)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected request for details modal
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);

  // Load live operations from service scoped strictly to authenticated business
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Server-side query: WHERE business_id = :authenticatedBusinessId
      const data = await adminService.getLivePickupOperations(authenticatedBusinessId);
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch live pickup operations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = adminService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [authenticatedBusinessId]);

  // Protect request-details endpoint: Manually entering another request ID returns unauthorized
  useEffect(() => {
    const idParam = searchParams.get('ref') || searchParams.get('id');
    if (idParam) {
      adminService.getLiveRequestById(idParam, authenticatedBusinessId).then((result) => {
        if (result.success && result.data) {
          setSelectedRequest(result.data);
          setUnauthorizedAccessError(null);
        } else if (result.error === 'unauthorized') {
          setSelectedRequest(null);
          setUnauthorizedAccessError(
            `Access Denied: Request ${idParam} belongs to another business and cannot be accessed.`
          );
        } else {
          setSelectedRequest(null);
          setUnauthorizedAccessError(`Request ${idParam} was not found.`);
        }
      });
    }
  }, [searchParams, authenticatedBusinessId]);

  // All active live requests belonging strictly to this business
  const activeRequests = useMemo(() => {
    return requests
      .filter(
        (r) =>
          r.businessId === authenticatedBusinessId &&
          r.status !== 'Completed' &&
          r.status !== 'Cancelled'
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [requests, authenticatedBusinessId]);

  // Summary Metrics calculated strictly from the authenticated business's records
  const summaryMetrics = useMemo(() => {
    const totalLive = activeRequests.length;
    const findingAgent = activeRequests.filter((r) => r.status === 'Finding an Agent').length;
    const agentConfirmed = activeRequests.filter((r) => r.status === 'Agent Confirmed').length;
    const activeService = activeRequests.filter((r) => r.status === 'Active Service').length;
    const pendingConfirmation = activeRequests.filter((r) => r.status === 'Pending Confirmation').length;

    return {
      totalLive,
      findingAgent,
      agentConfirmed,
      activeService,
      pendingConfirmation,
    };
  }, [activeRequests]);

  // Filtered dataset within authenticated business scope
  const filteredRequests = useMemo(() => {
    return activeRequests.filter((item) => {
      // 1. Search filter: reference, customer name, customer ID, assigned agent name, or agent ID
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRef = item.id.toLowerCase().includes(query);
        const matchesCustomer = item.customerName.toLowerCase().includes(query);
        const matchesCustomerId = !!item.customerId && item.customerId.toLowerCase().includes(query);
        const matchesAgent = !!item.agentName && item.agentName.toLowerCase().includes(query);
        const matchesAgentId = !!item.agentId && item.agentId.toLowerCase().includes(query);
        if (!matchesRef && !matchesCustomer && !matchesCustomerId && !matchesAgent && !matchesAgentId) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== 'ALL') {
        if (item.status !== selectedStatus) {
          return false;
        }
      }

      // 3. Transaction Type filter
      if (selectedType !== 'ALL') {
        if (item.type !== selectedType) {
          return false;
        }
      }

      return true;
    });
  }, [activeRequests, searchQuery, selectedStatus, selectedType]);

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedType !== 'ALL';

  // Reset all filters to default
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setCurrentPage(1);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  // Refresh handler: restores newest-first default state
  const handleRefresh = async () => {
    handleClearFilters();
    await loadData(true);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRequests.length);
  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(startIndex, endIndex);
  }, [filteredRequests, startIndex, endIndex]);

  // Reset to page 1 if current page becomes invalid due to filtering
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 max-w-[1720px] w-full mx-auto">
      {/* Unauthorized access alert notification */}
      {unauthorizedAccessError && (
        <div className="shrink-0 flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-red-600 shrink-0" />
            <span>{unauthorizedAccessError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUnauthorizedAccessError(null)}
            className="text-red-500 hover:text-red-700 p-1 cursor-pointer rounded"
            title="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. LIVE OPERATION SUMMARY: 5 single-line horizontal KPI cards */}
      <div className="shrink-0">
        <div className="live-operations-kpi-grid">
          {/* Card 1: ALL LIVE REQUESTS */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('ALL');
              setCurrentPage(1);
            }}
            className={`kpi-card bg-white border rounded-xl shadow-xs transition-all text-left cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-[#0D93AA]/5'
                : 'border-gray-200/80 hover:border-[#0D93AA]/50'
            }`}
          >
            <div className="kpi-inline-content">
              <span className="kpi-label text-gray-600">ALL LIVE REQUESTS</span>
              <strong className="kpi-value text-[#0D93AA] font-mono font-bold tracking-tight">
                {summaryMetrics.totalLive}
              </strong>
            </div>
            <div className="kpi-icon w-8 h-8 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
              <Radio size={15} />
            </div>
          </button>

          {/* Card 2: FINDING AN AGENT */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('Finding an Agent');
              setCurrentPage(1);
            }}
            className={`kpi-card bg-white border rounded-xl shadow-xs transition-all text-left cursor-pointer ${
              selectedStatus === 'Finding an Agent'
                ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
                : 'border-gray-200/80 hover:border-orange-300'
            }`}
          >
            <div className="kpi-inline-content">
              <span className="kpi-label text-gray-600">FINDING AN AGENT</span>
              <strong className="kpi-value text-orange-600 font-mono font-bold tracking-tight">
                {summaryMetrics.findingAgent}
              </strong>
            </div>
            <div className="kpi-icon w-8 h-8 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
              <Clock size={15} />
            </div>
          </button>

          {/* Card 3: AGENT CONFIRMED */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('Agent Confirmed');
              setCurrentPage(1);
            }}
            className={`kpi-card bg-white border rounded-xl shadow-xs transition-all text-left cursor-pointer ${
              selectedStatus === 'Agent Confirmed'
                ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/20'
                : 'border-gray-200/80 hover:border-cyan-300'
            }`}
          >
            <div className="kpi-inline-content">
              <span className="kpi-label text-gray-600">AGENT CONFIRMED</span>
              <strong className="kpi-value text-cyan-700 font-mono font-bold tracking-tight">
                {summaryMetrics.agentConfirmed}
              </strong>
            </div>
            <div className="kpi-icon w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} />
            </div>
          </button>

          {/* Card 4: ACTIVE SERVICE */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('Active Service');
              setCurrentPage(1);
            }}
            className={`kpi-card bg-white border rounded-xl shadow-xs transition-all text-left cursor-pointer ${
              selectedStatus === 'Active Service'
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                : 'border-gray-200/80 hover:border-blue-300'
            }`}
          >
            <div className="kpi-inline-content">
              <span className="kpi-label text-gray-600">ACTIVE SERVICE</span>
              <strong className="kpi-value text-blue-700 font-mono font-bold tracking-tight">
                {summaryMetrics.activeService}
              </strong>
            </div>
            <div className="kpi-icon w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
              <Zap size={15} />
            </div>
          </button>

          {/* Card 5: PENDING CONFIRMATION */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('Pending Confirmation');
              setCurrentPage(1);
            }}
            className={`kpi-card bg-white border rounded-xl shadow-xs transition-all text-left cursor-pointer ${
              selectedStatus === 'Pending Confirmation'
                ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
                : 'border-gray-200/80 hover:border-purple-300'
            }`}
          >
            <div className="kpi-inline-content">
              <span className="kpi-label text-gray-600">PENDING CONFIRMATION</span>
              <strong className="kpi-value text-purple-700 font-mono font-bold tracking-tight">
                {summaryMetrics.pendingConfirmation}
              </strong>
            </div>
            <div className="kpi-icon w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
              <AlertCircle size={15} />
            </div>
          </button>
        </div>
      </div>

      {/* 2. FILTER SECTION: Clean single horizontal row */}
      <div className="shrink-0 bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-xs">
        <div className="live-request-filters">
          {/* 1. Search (reference, customer or agent) */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, customer or agent..."
              className="w-full h-9 pl-9 pr-8 text-xs bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* 2. All Live Statuses */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
              aria-label="Filter by Status"
            >
              <option value="ALL">All Live Statuses</option>
              <option value="Finding an Agent">Finding an Agent</option>
              <option value="Agent Confirmed">Agent Confirmed</option>
              <option value="Active Service">Active Service</option>
              <option value="Pending Confirmation">Pending Confirmation</option>
            </select>
          </div>

          {/* 3. All Transaction Types */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
              aria-label="Filter by Transaction Type"
            >
              <option value="ALL">All Transaction Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Purchase">Purchase</option>
            </select>
          </div>

          {/* 4. Clear Filters */}
          <div>
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className={`h-9 px-4 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                hasActiveFilters
                  ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer shadow-2xs'
                  : 'bg-gray-100 text-gray-400 border-gray-200/80 cursor-not-allowed opacity-60'
              }`}
              title="Clear all filters"
            >
              <X size={13} />
              <span>Clear</span>
            </button>
          </div>

          {/* 5. Refresh */}
          <div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-4 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60 whitespace-nowrap"
              title="Restore newest-first default state"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-gray-500'}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. TABLE CARD (Flexible container with Sticky Header, Scrollable Rows, and Fixed Pagination) */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden">
        {/* Scrollable Transaction Listing Table Container */}
        <div
          ref={tableContainerRef}
          tabIndex={0}
          role="region"
          aria-label="Live Operations Customer Requests List"
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-auto live-operations-table-scroll focus:outline-none [scrollbar-gutter:stable]"
        >
          <table className="w-full text-left text-xs border-collapse table-fixed min-w-[1050px]">
            <colgroup>
              <col style={{ width: '11.29%', minWidth: '125px' }} />
              <col style={{ width: '10.22%', minWidth: '115px' }} />
              <col style={{ width: '10.75%', minWidth: '125px' }} />
              <col style={{ width: '8.60%', minWidth: '95px' }} />
              <col style={{ width: '11.29%', minWidth: '135px' }} />
              <col style={{ width: '13.44%', minWidth: '155px' }} />
              <col style={{ width: '16.67%', minWidth: '190px' }} />
              <col style={{ width: '10.75%', minWidth: '130px' }} />
              <col style={{ width: '6.99%', minWidth: '80px' }} />
            </colgroup>
            <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
              <tr className="border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[11px] leading-[1.2] bg-[#F9FAFB] select-none">
                {/* 1. Reference / Created (two lines) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 text-left min-w-[125px]"
                >
                  <div>REFERENCE /</div>
                  <div>CREATED</div>
                </th>

                {/* 2. Customer (one line) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 text-left min-w-[115px]"
                >
                  <span className="whitespace-nowrap">CUSTOMER</span>
                </th>

                {/* 3. Transaction / Vendor (two lines) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 text-left min-w-[125px]"
                >
                  <div>TRANSACTION /</div>
                  <div>VENDOR</div>
                </th>

                {/* 4. Amount (one line) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 text-right min-w-[95px]"
                >
                  <span className="whitespace-nowrap">AMOUNT</span>
                </th>

                {/* 5. Requested Service Time (two lines) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 text-left min-w-[135px]"
                >
                  <div>REQUESTED SERVICE</div>
                  <div>TIME</div>
                </th>

                {/* 6. Pickup Location (one line) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 text-left min-w-[155px]"
                >
                  <span className="whitespace-nowrap">PICKUP LOCATION</span>
                </th>

                {/* 7. Auto-Matched Agent / Business (two lines) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 text-left min-w-[190px]"
                >
                  <div>AUTO-MATCHED AGENT /</div>
                  <div>BUSINESS</div>
                </th>

                {/* 8. Status (one line) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2.5 text-left min-w-[130px]"
                >
                  <span className="whitespace-nowrap">STATUS</span>
                </th>

                {/* 9. Action (one line) */}
                <th
                  scope="col"
                  className="table-heading sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-200 py-2.5 px-2 text-center min-w-[80px]"
                >
                  <span className="whitespace-nowrap">ACTION</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2 text-xs font-medium">
                    <RefreshCw size={14} className="animate-spin text-[#0D93AA]" />
                    <span>Loading live operations...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center">
                  <div className="max-w-md mx-auto space-y-2">
                    <Radio size={22} className="text-gray-400 mx-auto" />
                    <div className="text-xs font-bold text-gray-800">
                      {hasActiveFilters
                        ? 'No live customer requests matching your filter criteria'
                        : 'No live customer requests found for your business'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {hasActiveFilters
                        ? 'Try clearing your search query or adjusting status and transaction type filters.'
                        : 'Live customer pickup, deposit, and withdrawal requests will appear here in real time.'}
                    </div>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <X size={12} />
                        <span>Clear all filters</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* 1. REFERENCE / CREATED */}
                  <td className="py-2.5 px-2 align-middle">
                    <div className="font-mono font-bold text-gray-900 text-xs truncate" title={req.id}>
                      {req.id}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium truncate" title={req.createdAt}>
                      {req.createdAt}
                    </div>
                  </td>

                  {/* 2. CUSTOMER */}
                  <td className="py-2.5 px-2 align-middle">
                    <div
                      className="font-semibold text-gray-900 text-xs truncate"
                      title={req.customerName}
                    >
                      {req.customerName}
                    </div>
                    <div
                      className="text-[11px] font-mono text-gray-500 truncate"
                      title={req.customerId || `TB-CUS-${req.id.replace('TB-REQ-', '')}`}
                    >
                      {req.customerId || `TB-CUS-${req.id.replace('TB-REQ-', '')}`}
                    </div>
                  </td>

                  {/* 3. TRANSACTION / VENDOR */}
                  <td className="py-2.5 px-2 align-middle">
                    <div className="font-semibold text-gray-900 text-xs truncate" title={req.type}>
                      {req.type}
                    </div>
                    <div className="text-[11px] text-gray-600 font-medium truncate" title={req.vendor}>
                      {req.vendor}
                    </div>
                  </td>

                  {/* 4. AMOUNT: ZMW only, bold dark typography, single line */}
                  <td className="py-2.5 px-2 text-right align-middle whitespace-nowrap">
                    <div className="font-mono font-bold text-gray-900 text-xs whitespace-nowrap">
                      {formatZMW(req.amount)}
                    </div>
                  </td>

                  {/* 5. REQUESTED SERVICE TIME */}
                  <td className="py-2.5 px-2 align-middle">
                    {req.serviceTime === 'Now' || (!req.isScheduled && !req.serviceTime?.includes(':')) ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 text-xs whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Now
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-700 text-xs min-w-0" title={req.serviceTime}>
                        <Clock size={12} className="text-gray-400 shrink-0" />
                        <span className="font-medium truncate">{req.serviceTime}</span>
                      </div>
                    )}
                  </td>

                  {/* 6. PICKUP LOCATION: Concise, truncated with tooltip */}
                  <td className="py-2.5 px-2 align-middle">
                    <div
                      className="relative group/loc flex items-center gap-1 text-xs text-gray-700 min-w-0"
                      title={req.pickupLocation}
                    >
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate block flex-1">{req.pickupLocation}</span>
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/loc:block z-30 pointer-events-none">
                        <div className="bg-gray-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap max-w-xs border border-gray-700">
                          {req.pickupLocation}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 7. AUTO-MATCHED AGENT / BUSINESS */}
                  <td className="py-2.5 px-2 align-middle">
                    {req.agentName ? (
                      <div className="space-y-0.5 min-w-0">
                        {/* Line 1: Agent name and ID */}
                        <div className="flex items-center gap-1 text-xs min-w-0" title={`${req.agentName} (${req.agentId})`}>
                          <span className="font-semibold text-gray-900 truncate">{req.agentName}</span>
                          {req.agentId && (
                            <span className="text-[10px] font-mono text-gray-500 shrink-0 font-medium">
                              ({req.agentId})
                            </span>
                          )}
                        </div>

                        {/* Line 2: Auto-Matched compact badge */}
                        <div>
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
                            Auto-Matched
                          </span>
                        </div>

                        {/* Line 3: Business name with tooltip */}
                        <div
                          className="relative group/biz text-[11px] text-gray-500 min-w-0"
                          title={authenticatedBusinessName}
                        >
                          <span className="truncate block font-normal">
                            {authenticatedBusinessName}
                          </span>
                          <div className="absolute left-0 bottom-full mb-1 hidden group-hover/biz:block z-30 pointer-events-none">
                            <div className="bg-gray-900 text-white text-[11px] font-medium py-1 px-2 rounded shadow-md whitespace-nowrap max-w-xs border border-gray-700">
                              {authenticatedBusinessName}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
                        Not yet matched
                      </div>
                    )}
                  </td>

                  {/* 8. STATUS: Specific text and colour badges (Single line, separated column) */}
                  <td className="py-2.5 px-2.5 align-middle whitespace-nowrap">
                    {req.status === 'Finding an Agent' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Finding an Agent
                      </span>
                    ) : req.status === 'Agent Confirmed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                        Agent Confirmed
                      </span>
                    ) : req.status === 'Active Service' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        Active Service
                      </span>
                    ) : req.status === 'Pending Confirmation' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                        Pending Confirmation
                      </span>
                    ) : (
                      <span className="inline-block whitespace-nowrap">
                        <StatusChip status={req.status} size="sm" />
                      </span>
                    )}
                  </td>

                  {/* 9. ACTION: View button only (Single line, fully visible) */}
                  <td className="py-2.5 px-2 text-center align-middle whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/80 hover:bg-cyan-100 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      title="View request details"
                    >
                      <Eye size={12} className="shrink-0" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* 4. Fixed Pagination Area at Bottom */}
        <div className="shrink-0 px-4 py-3 border-t border-gray-200/80 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-700">
          {/* Left: Showing X to Y of Z live requests */}
          <div className="font-medium text-gray-600">
            {filteredRequests.length === 0 ? (
              'Showing 0 live requests'
            ) : (
              <>
                Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-gray-900">{endIndex}</span> of{' '}
                <span className="font-bold text-gray-900">{filteredRequests.length}</span> live requests
              </>
            )}
          </div>

          {/* Right: Rows & Pagination Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Rows per page selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-medium">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                  if (tableContainerRef.current) {
                    tableContainerRef.current.scrollTop = 0;
                  }
                }}
                className="h-8 px-2 text-xs font-semibold bg-white border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
                aria-label="Rows per page"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Prev / Page X of Y / Next */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  if (tableContainerRef.current) {
                    tableContainerRef.current.scrollTop = 0;
                  }
                }}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>

              <span className="text-xs font-semibold text-gray-700 px-1">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  if (tableContainerRef.current) {
                    tableContainerRef.current.scrollTop = 0;
                  }
                }}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE REQUEST DETAILS DRAWER */}
      <LiveRequestDetailsDrawer
        request={selectedRequest}
        sourcePage="live-operations"
        title="Live Request Details"
        onClose={() => {
          setSelectedRequest(null);
          if (searchParams.get('id')) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('id');
            setSearchParams(newParams);
          }
        }}
      />
    </div>
  );
};
