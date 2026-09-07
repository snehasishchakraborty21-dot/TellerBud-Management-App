import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import {
  AgentRecord,
  AgentFilters,
  AgentStatusSummary,
  AgentSortField,
  AgentSortDirection,
} from '../types/admin';
import { AgentMetricCards } from '../components/agents/AgentMetricCards';
import { AgentStatusTabs } from '../components/agents/AgentStatusTabs';
import { AgentFilterBar } from '../components/agents/AgentFilterBar';
import { AgentTable } from '../components/agents/AgentTable';
import { AgentPagination } from '../components/agents/AgentPagination';
import { AgentSummaryModal } from '../components/agents/AgentSummaryModal';

export const AgentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Business Owner scoping rule
  const businessScope =
    currentUser?.businessName || 'Lusaka Central Express Agency';
  const businessIdScope = currentUser?.businessId || 'BIZ-LUS-001';

  // Core Data State
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [statusSummary, setStatusSummary] = useState<AgentStatusSummary>({
    all: 8,
    online: 6,
    available: 4,
    assigned: 2,
    offline: 2,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Tab and Filters State from URL or defaults
  const activeTab = searchParams.get('tab') || 'ALL';

  const [filters, setFilters] = useState<AgentFilters>({
    search: searchParams.get('search') || '',
    availability: (searchParams.get('availability') as any) || 'ALL',
    assignment: (searchParams.get('assignment') as any) || 'ALL',
    attendance: (searchParams.get('attendance') as any) || 'ALL',
  });

  // Sorting and Pagination State
  const [sortField] = useState<AgentSortField>('operationalPriority');
  const [sortDirection] = useState<AgentSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Selected Agent for Summary Modal
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);

  // Load Agents data with business scoping
  const loadData = async () => {
    try {
      // Effective availability query filter combined with status tab
      let effectiveAvailability = filters.availability;
      if (activeTab !== 'ALL' && filters.availability === 'ALL') {
        effectiveAvailability = activeTab as any;
      }

      const res = await adminService.getAgents(
        {
          ...filters,
          availability: effectiveAvailability,
        },
        { field: sortField, direction: sortDirection },
        businessIdScope
      );

      setAgents(res.items);
      setStatusSummary(res.summary);
    } catch (err) {
      console.error('Failed to load agents data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = adminService.subscribe(loadData);
    return () => unsub();
  }, [businessIdScope, activeTab, filters, sortField, sortDirection]);

  // Tab change handler
  const handleTabChange = (tabId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (tabId === 'ALL') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', tabId);
    }
    setSearchParams(newParams);

    // Reset pagination to page 1
    setCurrentPage(1);
  };

  // Filter change handler
  const handleFilterChange = (newFilters: AgentFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);

    const newParams = new URLSearchParams(searchParams);
    if (newFilters.search) newParams.set('search', newFilters.search);
    else newParams.delete('search');

    if (newFilters.availability !== 'ALL')
      newParams.set('availability', newFilters.availability);
    else newParams.delete('availability');

    if (newFilters.assignment !== 'ALL')
      newParams.set('assignment', newFilters.assignment);
    else newParams.delete('assignment');

    if (newFilters.attendance !== 'ALL')
      newParams.set('attendance', newFilters.attendance);
    else newParams.delete('attendance');

    setSearchParams(newParams);
  };

  // Clear all filters & search & tabs
  const handleClearFilters = () => {
    const emptyFilters: AgentFilters = {
      search: '',
      availability: 'ALL',
      assignment: 'ALL',
      attendance: 'ALL',
    };
    setFilters(emptyFilters);
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Filter active check
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.availability !== 'ALL' ||
    filters.assignment !== 'ALL' ||
    filters.attendance !== 'ALL' ||
    activeTab !== 'ALL';

  // Client-side pagination slice for display
  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return agents.slice(startIndex, startIndex + pageSize);
  }, [agents, currentPage, pageSize]);

  // Modal handlers
  const handleOpenSummary = (agent: AgentRecord) => {
    setSelectedAgent(agent);
    setIsSummaryOpen(true);
  };

  const handleCloseSummary = () => {
    setIsSummaryOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Compact 5 Metric Cards */}
      <AgentMetricCards summary={statusSummary} />

      {/* 2. Main Content Container */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <AgentStatusTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          summary={statusSummary}
        />

        {/* Filter Bar */}
        <AgentFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isFiltered={isFiltered}
        />

        {/* Agents Table */}
        <AgentTable
          agents={paginatedAgents}
          onSelectAgent={handleOpenSummary}
          loading={loading}
        />

        {/* Pagination */}
        {agents.length > 0 && (
          <AgentPagination
            currentPage={currentPage}
            totalItems={agents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* 4. Agent Summary Modal */}
      <AgentSummaryModal
        agent={selectedAgent}
        isOpen={isSummaryOpen}
        onClose={handleCloseSummary}
      />
    </div>
  );
};
