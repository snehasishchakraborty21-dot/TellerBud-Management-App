import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { AgentFilterBar } from '../components/agents/AgentFilterBar';
import { AgentTable } from '../components/agents/AgentTable';
import { AgentPagination } from '../components/agents/AgentPagination';

export const AgentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);

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

  const [filters, setFilters] = useState<AgentFilters>({
    search: '',
    availability: (searchParams.get('availability') as any) || 'ALL',
    assignment: (searchParams.get('assignment') as any) || 'ALL',
    attendance: (searchParams.get('attendance') as any) || 'ALL',
  });

  // Sorting and Pagination State
  const [sortField] = useState<AgentSortField>('operationalPriority');
  const [sortDirection] = useState<AgentSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Load Agents data with business scoping
  const loadData = async () => {
    try {
      const res = await adminService.getAgents(
        filters,
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
  }, [businessIdScope, filters, sortField, sortDirection]);

  // Filter change handler
  const handleFilterChange = (newFilters: AgentFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);

    const newParams = new URLSearchParams(searchParams);
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

  // Clear all filters
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
    filters.availability !== 'ALL' ||
    filters.assignment !== 'ALL' ||
    filters.attendance !== 'ALL';

  // Client-side pagination slice for display
  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return agents.slice(startIndex, startIndex + pageSize);
  }, [agents, currentPage, pageSize]);

  // Direct page navigation handler on View or row select
  const handleSelectAgent = (agent: AgentRecord) => {
    navigate(`/business-owner/agents/${agent.id}`);
  };

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4">
      {/* 1. Five compact KPI cards (Frozen upper section) */}
      <div className="shrink-0">
        <AgentMetricCards summary={statusSummary} />
      </div>

      {/* 2. Filter Bar: Dropdowns & Action Buttons (Frozen upper section) */}
      <div className="shrink-0">
        <AgentFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isFiltered={isFiltered}
        />
      </div>

      {/* 3. Table Card: Flexible container with Sticky Header, Scrollable Rows, and Fixed Pagination */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Scrollable Agent Listing Table */}
        <AgentTable
          agents={paginatedAgents}
          onSelectAgent={handleSelectAgent}
          loading={loading}
          containerRef={tableContainerRef}
        />

        {/* 4. Fixed Pagination Area at Bottom */}
        {agents.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-3 sm:px-4 py-2.5">
            <AgentPagination
              currentPage={currentPage}
              totalItems={agents.length}
              pageSize={pageSize}
              onPageChange={(page) => {
                setCurrentPage(page);
                if (tableContainerRef.current) {
                  tableContainerRef.current.scrollTop = 0;
                }
              }}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
                if (tableContainerRef.current) {
                  tableContainerRef.current.scrollTop = 0;
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};


