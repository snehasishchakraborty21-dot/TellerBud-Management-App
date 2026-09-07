import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { PickupRequest } from '../types/admin';
import { adminService } from '../services/mockAdminService';
import { formatZMW } from '../config/appConfig';
import { StatusChip } from '../components/shared/StatusChip';
import { LiveRequestDetailsDrawer } from '../components/admin/LiveRequestDetailsDrawer';

export const LiveOperationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [selectedBusiness, setSelectedBusiness] = useState<string>('ALL');
  const [selectedServiceTime, setSelectedServiceTime] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected request for details modal
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);

  // Load live operations from service
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await adminService.getLivePickupOperations();
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
  }, []);

  // Handle URL param ?id=... to auto-open details
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam && requests.length > 0) {
      const found = requests.find((r) => r.id === idParam);
      if (found) {
        setSelectedRequest(found);
      }
    }
  }, [searchParams, requests]);

  // All active live requests (excluding completed and cancelled)
  const activeRequests = useMemo(() => {
    return requests
      .filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [requests]);

  // Summary Metrics: Exactly 18 total: 2 finding, 6 confirmed, 4 active service, 6 pending confirmation
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

  // Distinct businesses from active records
  const registeredBusinesses = useMemo(() => {
    const businesses = new Set<string>();
    activeRequests.forEach((r) => {
      if (r.businessName) businesses.add(r.businessName);
    });
    return Array.from(businesses);
  }, [activeRequests]);

  // Filtered dataset
  const filteredRequests = useMemo(() => {
    return activeRequests.filter((item) => {
      // 1. Search filter: reference, customer name, customer ID, or agent name
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRef = item.id.toLowerCase().includes(query);
        const matchesCustomer = item.customerName.toLowerCase().includes(query);
        const matchesCustomerId = !!item.customerId && item.customerId.toLowerCase().includes(query);
        const matchesAgent = !!item.agentName && item.agentName.toLowerCase().includes(query);
        if (!matchesRef && !matchesCustomer && !matchesCustomerId && !matchesAgent) {
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

      // 4. Vendor filter
      if (selectedVendor !== 'ALL') {
        if (item.vendor !== selectedVendor) {
          return false;
        }
      }

      // 5. Business filter
      if (selectedBusiness !== 'ALL') {
        if (selectedBusiness === 'Unmatched') {
          if (item.agentName || item.businessName || item.status !== 'Finding an Agent') {
            return false;
          }
        } else if (item.businessName !== selectedBusiness) {
          return false;
        }
      }

      // 6. Service Time filter
      if (selectedServiceTime !== 'ALL') {
        if (selectedServiceTime === 'Now') {
          if (item.serviceTime !== 'Now' && item.isScheduled) {
            return false;
          }
        } else if (selectedServiceTime === 'Scheduled') {
          if (item.serviceTime === 'Now' && !item.isScheduled) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    activeRequests,
    searchQuery,
    selectedStatus,
    selectedType,
    selectedVendor,
    selectedBusiness,
    selectedServiceTime,
  ]);

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedType !== 'ALL' ||
    selectedVendor !== 'ALL' ||
    selectedBusiness !== 'ALL' ||
    selectedServiceTime !== 'ALL';

  // Reset all filters to default
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setSelectedVendor('ALL');
    setSelectedBusiness('ALL');
    setSelectedServiceTime('ALL');
    setCurrentPage(1);
  };

  // Refresh handler: restores newest-first default state
  const handleRefresh = async () => {
    handleClearFilters();
    await loadData(true);
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
    <div className="p-4 sm:p-6 space-y-4 pb-12">
      {/* LIVE OPERATION SUMMARY: 5 compact horizontal cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: ALL LIVE REQUESTS */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('ALL');
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'ALL'
              ? 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-[#0D93AA]/5'
              : 'border-gray-200/80 hover:border-[#0D93AA]/50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
              ALL LIVE REQUESTS
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
              <Radio size={14} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0D93AA] font-mono tracking-tight">
            {summaryMetrics.totalLive}
          </div>
        </button>

        {/* Card 2: FINDING AN AGENT */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('Finding an Agent');
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'Finding an Agent'
              ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
              : 'border-gray-200/80 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
              FINDING AN AGENT
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-600 font-mono tracking-tight">
            {summaryMetrics.findingAgent}
          </div>
        </button>

        {/* Card 3: AGENT CONFIRMED */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('Agent Confirmed');
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'Agent Confirmed'
              ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/20'
              : 'border-gray-200/80 hover:border-cyan-300'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
              AGENT CONFIRMED
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-700 font-mono tracking-tight">
            {summaryMetrics.agentConfirmed}
          </div>
        </button>

        {/* Card 4: ACTIVE SERVICE */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('Active Service');
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'Active Service'
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-gray-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
              ACTIVE SERVICE
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
              <Zap size={14} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700 font-mono tracking-tight">
            {summaryMetrics.activeService}
          </div>
        </button>

        {/* Card 5: PENDING CONFIRMATION */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('Pending Confirmation');
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all text-left cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'Pending Confirmation'
              ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
              : 'border-gray-200/80 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
              PENDING CONFIRMATION
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-700 font-mono tracking-tight">
            {summaryMetrics.pendingConfirmation}
          </div>
        </button>
      </div>

      {/* FILTER PANEL: Compact filter controls capable of wrapping into two rows */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-xs space-y-3">
        {/* Filter Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 1. Search */}
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

          {/* 2. Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
              aria-label="Filter by Status"
            >
              <option value="ALL">All Live Statuses</option>
              <option value="Finding an Agent">Finding an Agent</option>
              <option value="Agent Confirmed">Agent Confirmed</option>
              <option value="Active Service">Active Service</option>
              <option value="Pending Confirmation">Pending Confirmation</option>
            </select>
          </div>

          {/* 3. Transaction Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
              aria-label="Filter by Transaction Type"
            >
              <option value="ALL">All Transaction Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Purchase">Purchase</option>
            </select>
          </div>

          {/* 4. Vendor */}
          <div>
            <select
              value={selectedVendor}
              onChange={(e) => {
                setSelectedVendor(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
              aria-label="Filter by Vendor"
            >
              <option value="ALL">All Vendors</option>
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
              <option value="Zamtel">Zamtel</option>
              <option value="Zanaco">Zanaco</option>
              <option value="FNB">FNB</option>
              <option value="INDO">INDO</option>
              <option value="Stanbic">Stanbic</option>
              <option value="Access">Access</option>
            </select>
          </div>
        </div>

        {/* Filter Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-center">
          {/* 5. Business */}
          <div>
            <select
              value={selectedBusiness}
              onChange={(e) => {
                setSelectedBusiness(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
              aria-label="Filter by Business"
            >
              <option value="ALL">All Businesses</option>
              <option value="Lusaka Central Express Agency">Lusaka Central Express Agency</option>
              {registeredBusinesses
                .filter((b) => b !== 'Lusaka Central Express Agency')
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              <option value="Unmatched">Unmatched</option>
            </select>
          </div>

          {/* 6. Service Time */}
          <div>
            <select
              value={selectedServiceTime}
              onChange={(e) => {
                setSelectedServiceTime(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs font-medium bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
              aria-label="Filter by Service Time"
            >
              <option value="ALL">All Service Times</option>
              <option value="Now">Now</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          {/* 7. Clear button & 8. Refresh button */}
          <div className="flex items-center gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className={`h-9 px-4 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                hasActiveFilters
                  ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer shadow-2xs'
                  : 'bg-gray-100 text-gray-400 border-gray-200/80 cursor-not-allowed opacity-60'
              }`}
              title="Clear all filters"
            >
              <X size={13} />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-4 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
              title="Restore newest-first default state"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? 'animate-spin text-[#0D93AA]' : 'text-gray-500'}
              />
              <span>Refresh</span>
            </button>

            {hasActiveFilters && (
              <span className="text-[11px] text-[#0D93AA] font-semibold ml-auto hidden md:inline">
                Filtered: {filteredRequests.length} of {activeRequests.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* LIVE OPERATIONS TABLE CONTAINER */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs">
        <table className="w-full text-left text-xs border-collapse table-fixed rounded-t-xl">
          <colgroup>
            <col style={{ width: '11%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '8.5%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '14.5%' }} />
            <col style={{ width: '17.5%' }} />
            <col style={{ width: '11.5%' }} />
            <col style={{ width: '6%' }} />
          </colgroup>
          <thead className="sticky top-0 z-20 bg-white text-gray-600 font-semibold uppercase text-[10px] xl:text-[11px] border-b border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <tr>
              <th className="py-2.5 px-2 font-bold bg-white rounded-tl-xl leading-tight">REFERENCE / CREATED</th>
              <th className="py-2.5 px-2 font-bold bg-white leading-tight">CUSTOMER</th>
              <th className="py-2.5 px-2 font-bold bg-white leading-tight">TRANSACTION / VENDOR</th>
              <th className="py-2.5 px-2 font-bold text-right bg-white leading-tight">AMOUNT</th>
              <th className="py-2.5 px-2 font-bold bg-white leading-tight">REQUESTED SERVICE TIME</th>
              <th className="py-2.5 px-2 font-bold bg-white leading-tight">PICKUP LOCATION</th>
              <th className="py-2.5 px-2 font-bold bg-white leading-tight">AUTO-MATCHED AGENT / BUSINESS</th>
              <th className="py-2.5 px-1.5 font-bold bg-white leading-tight">STATUS</th>
              <th className="py-2.5 px-1 font-bold text-center bg-white rounded-tr-xl leading-tight">ACTION</th>
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
                  <div className="max-w-xs mx-auto space-y-2">
                    <Radio size={22} className="text-gray-400 mx-auto" />
                    <div className="text-xs font-bold text-gray-800">No live operations found</div>
                    <div className="text-[11px] text-gray-500">
                      {hasActiveFilters
                        ? 'No active customer requests match your current filters.'
                        : 'There are currently no active customer requests.'}
                    </div>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-2 text-xs font-semibold text-[#0D93AA] hover:underline cursor-pointer"
                      >
                        Clear all filters
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
                  <td className="py-2.5 px-2 align-middle overflow-hidden">
                    <div className="font-mono font-bold text-gray-900 text-xs truncate">{req.id}</div>
                    <div className="text-[11px] text-gray-500 font-medium truncate">{req.createdAt}</div>
                  </td>

                  {/* 2. CUSTOMER */}
                  <td className="py-2.5 px-2 align-middle overflow-hidden">
                    <div
                      className="font-semibold text-gray-900 text-xs truncate"
                      title={req.customerName}
                    >
                      {req.customerName}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500 truncate">
                      {req.customerId || `TB-CUS-${req.id.replace('TB-REQ-', '')}`}
                    </div>
                  </td>

                  {/* 3. TRANSACTION / VENDOR */}
                  <td className="py-2.5 px-2 align-middle overflow-hidden">
                    <div className="font-semibold text-gray-900 text-xs truncate">{req.type}</div>
                    <div className="text-[11px] text-gray-600 font-medium truncate">{req.vendor}</div>
                  </td>

                  {/* 4. AMOUNT: ZMW only, bold dark typography */}
                  <td className="py-2.5 px-2 text-right align-middle overflow-hidden">
                    <div className="font-mono font-bold text-gray-900 text-xs whitespace-nowrap">
                      {formatZMW(req.amount)}
                    </div>
                  </td>

                  {/* 5. REQUESTED SERVICE TIME */}
                  <td className="py-2.5 px-2 align-middle overflow-hidden">
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
                  <td className="py-2.5 px-2 align-middle overflow-hidden">
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
                  <td className="py-2.5 px-2 align-middle overflow-hidden">
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
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Auto-Matched
                          </span>
                        </div>

                        {/* Line 3: Business name with tooltip */}
                        <div
                          className="relative group/biz text-[11px] text-gray-500 min-w-0"
                          title={req.businessName || 'Lusaka Central Express Agency'}
                        >
                          <span className="truncate block font-normal">
                            {req.businessName || 'Lusaka Central Express Agency'}
                          </span>
                          <div className="absolute left-0 bottom-full mb-1 hidden group-hover/biz:block z-30 pointer-events-none">
                            <div className="bg-gray-900 text-white text-[11px] font-medium py-1 px-2 rounded shadow-md whitespace-nowrap max-w-xs border border-gray-700">
                              {req.businessName || 'Lusaka Central Express Agency'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 font-medium">
                        Not yet matched
                      </div>
                    )}
                  </td>

                  {/* 8. STATUS: Specific text and colour badges */}
                  <td className="py-2.5 px-1.5 align-middle overflow-hidden">
                    {req.status === 'Finding an Agent' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Finding an Agent
                      </span>
                    ) : req.status === 'Agent Confirmed' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                        Agent Confirmed
                      </span>
                    ) : req.status === 'Active Service' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        Active Service
                      </span>
                    ) : req.status === 'Pending Confirmation' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                        Pending Confirmation
                      </span>
                    ) : (
                      <StatusChip status={req.status} size="sm" />
                    )}
                  </td>

                  {/* 9. ACTION: View button only */}
                  <td className="py-2.5 px-1 text-center align-middle overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold text-[#0D93AA] bg-cyan-50/80 hover:bg-cyan-100 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
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

        {/* PAGINATION: At the bottom */}
        <div className="px-4 py-3 border-t border-gray-200/80 bg-gray-50/50 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-700">
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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
