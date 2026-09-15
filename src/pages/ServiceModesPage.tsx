import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ServiceModeRecord, ServiceModeFilters } from '../types/serviceMode';
import { INITIAL_SERVICE_MODES, getStoredServiceModes } from '../data/mockServiceModes';
import { ServiceModesSummaryCards } from '../components/serviceModes/ServiceModesSummaryCards';
import { ServiceModesFilterBar } from '../components/serviceModes/ServiceModesFilterBar';
import { ServiceModesTable } from '../components/serviceModes/ServiceModesTable';
import { ServiceModesPagination } from '../components/serviceModes/ServiceModesPagination';

const DEFAULT_FILTERS: ServiceModeFilters = {
  search: '',
  availability: 'all',
  audience: 'all',
  transactionType: 'all',
};

// Exact predefined display order
const EXACT_SERVICE_ORDER = [
  'TB-SVC-CP-001', // 1. Cash Pickup
  'TB-SVC-CD-002', // 2. Cash Delivery
  'TB-SVC-WI-003', // 3. Walk-In Transaction
  'TB-SVC-A2A-004', // 4. Agent-to-Agent Liquidity
];

export const ServiceModesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Load initial filters from state or sessionStorage to preserve on return
  const [filters, setFilters] = useState<ServiceModeFilters>(() => {
    const locFilters = location.state?.filters;
    if (locFilters) return locFilters;

    const saved = sessionStorage.getItem('tellerbud_sm_filters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_FILTERS;
      }
    }
    return DEFAULT_FILTERS;
  });

  const [serviceModes, setServiceModes] = useState<ServiceModeRecord[]>(() => getStoredServiceModes());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync service modes if updated externally or when returning
  useEffect(() => {
    setServiceModes(getStoredServiceModes());
    const handleUpdate = () => {
      setServiceModes(getStoredServiceModes());
    };
    window.addEventListener('tellerbud_service_modes_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('tellerbud_service_modes_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Restore scroll position when returning from details
  useEffect(() => {
    const locScroll = location.state?.scrollPosition;
    const savedScroll = locScroll ?? sessionStorage.getItem('tellerbud_sm_scroll');

    if (savedScroll) {
      const y = Number(savedScroll);
      if (!isNaN(y) && y > 0) {
        // Allow DOM to paint before restoring scroll
        const timer = setTimeout(() => {
          window.scrollTo({ top: y, behavior: 'instant' });
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [location.state]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ServiceModeFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      sessionStorage.setItem('tellerbud_sm_filters', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    sessionStorage.removeItem('tellerbud_sm_filters');
  };

  // Refresh service modes while preserving active filters
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  }, []);

  // Filter and sort service records
  const filteredServices = useMemo(() => {
    return serviceModes
      .filter((service) => {
        // Search filter: service name or service ID
        if (filters.search.trim() !== '') {
          const query = filters.search.toLowerCase().trim();
          const matchName = service.name.toLowerCase().includes(query);
          const matchId = service.id.toLowerCase().includes(query);
          if (!matchName && !matchId) return false;
        }

        // Availability filter
        if (filters.availability !== 'all') {
          if (service.availability !== filters.availability) {
            return false;
          }
        }

        // Audience filter
        if (filters.audience !== 'all') {
          if (filters.audience === 'Customer App') {
            if (
              service.audience !== 'Customer App' &&
              service.audience !== 'Customer and Agent'
            ) {
              return false;
            }
          } else if (filters.audience === 'Agent App') {
            if (
              service.audience !== 'Agent App' &&
              service.audience !== 'Customer and Agent'
            ) {
              return false;
            }
          } else if (filters.audience === 'Customer and Agent') {
            if (service.audience !== 'Customer and Agent') {
              return false;
            }
          }
        }

        // Transaction Type filter
        if (filters.transactionType !== 'all') {
          if (!service.transactionTypes.includes(filters.transactionType as any)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Preserve exact required order:
        // 1. Cash Pickup, 2. Cash Delivery, 3. Walk-In Transaction, 4. Agent-to-Agent Liquidity
        const indexA = EXACT_SERVICE_ORDER.indexOf(a.id);
        const indexB = EXACT_SERVICE_ORDER.indexOf(b.id);
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        return a.name.localeCompare(b.name);
      });
  }, [serviceModes, filters]);

  // View Details navigation: pass ID, navigate to /service-modes/:serviceId, preserve state & scroll
  const handleViewDetails = (service: ServiceModeRecord) => {
    const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
    sessionStorage.setItem('tellerbud_sm_filters', JSON.stringify(filters));
    sessionStorage.setItem('tellerbud_sm_scroll', String(scrollPos));

    navigate(`/service-modes/${service.id}`, {
      state: {
        from: location.pathname,
        serviceId: service.id,
        filters,
        scrollPosition: scrollPos,
      },
    });
  };

  return (
    <div
      id="service-modes-page-container"
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-5 pb-6"
    >
      {/* 
        Note on Page Title:
        "Display the page title 'Service Modes' only once. Do not add supporting text beneath the title."
        The single page title "Service Modes" is rendered in the fixed top navigation AdminHeader.
        No duplicate <h1> or supporting text is placed here.
      */}

      {/* 1. Summary Cards: 5 compact cards, no descriptions beneath values */}
      <ServiceModesSummaryCards serviceModes={serviceModes} />

      {/* 2. Compact Filter Row */}
      <ServiceModesFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 3. Main Semantic Table: Headings before every service record, exact required order */}
      <ServiceModesTable
        serviceModes={filteredServices}
        onViewDetails={handleViewDetails}
      />

      {/* 4. Compact Pagination: Showing 1 to 4 of 4 service modes, Rows per page: 10, Page 1 of 1 */}
      <ServiceModesPagination
        totalCount={serviceModes.length}
        filteredCount={filteredServices.length}
        currentPage={1}
        totalPages={1}
        rowsPerPage={10}
      />
    </div>
  );
};
