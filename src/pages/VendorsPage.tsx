import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Printer } from 'lucide-react';
import { filterAndSortVendors } from '../data/mockVendorData';
import {
  VendorRecord,
  VendorFilters,
  VendorSortField,
  VendorSummaryMetrics,
} from '../types/vendor';
import { useVendor } from '../context/VendorContext';
import { VendorSummaryCards } from '../components/vendors/VendorSummaryCards';
import { VendorFilterBar } from '../components/vendors/VendorFilterBar';
import { VendorTable } from '../components/vendors/VendorTable';
import { AddVendorModal } from '../components/vendors/AddVendorModal';

const DEFAULT_FILTERS: VendorFilters = {
  search: '',
  type: 'All',
  status: 'All',
  service: 'All',
};

export const VendorsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    vendors,
    addNewVendor,
    filters,
    setFilters,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    scrollPosition,
    setScrollPosition,
    resetFilters,
  } = useVendor();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const pageSize = 10;

  // Restore scroll position when returning from details
  useEffect(() => {
    if (scrollPosition > 0) {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' as ScrollBehavior });
    }
  }, [scrollPosition]);

  // Filtered & Sorted Vendors
  const filteredVendors = useMemo(() => {
    return filterAndSortVendors(vendors, filters, {
      field: sortField,
      direction: sortDirection,
    });
  }, [vendors, filters, sortField, sortDirection]);

  // Dynamic summary counts matching requirement
  const summaryMetrics: VendorSummaryMetrics = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((v) => v.status === 'Active').length;
    const mm = vendors.filter((v) => v.type === 'Mobile Money').length;
    const bank = vendors.filter((v) => v.type === 'Bank').length;
    const inactive = vendors.filter((v) => v.status === 'Inactive').length;

    return {
      totalVendors: total,
      activeVendors: active,
      mobileMoneyProviders: mm,
      bankingProviders: bank,
      inactiveVendors: inactive,
    };
  }, [vendors]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: VendorFilters) => {
      setFilters(newFilters);
      setCurrentPage(1);
    },
    [setFilters, setCurrentPage]
  );

  // Clear filters
  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  // Refresh preserves current filters
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  }, []);

  // Handle column sorting
  const handleSort = useCallback(
    (field: VendorSortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField, setSortDirection, setSortField]
  );

  // Navigate to full-width Vendor Details page, saving current scroll position
  const handleViewDetails = useCallback(
    (vendor: VendorRecord) => {
      setScrollPosition(window.scrollY);
      navigate(`/super-admin/configuration/vendors/${vendor.id}`);
    },
    [navigate, setScrollPosition]
  );

  // Summary card quick filter
  const handleSummaryFilter = useCallback(
    (filterKey: 'all' | 'active' | 'mobile_money' | 'banking' | 'inactive') => {
      if (filterKey === 'all') {
        setFilters(DEFAULT_FILTERS);
      } else if (filterKey === 'active') {
        setFilters({ ...DEFAULT_FILTERS, status: 'Active' });
      } else if (filterKey === 'inactive') {
        setFilters({ ...DEFAULT_FILTERS, status: 'Inactive' });
      } else if (filterKey === 'mobile_money') {
        setFilters({ ...DEFAULT_FILTERS, type: 'Mobile Money' });
      } else if (filterKey === 'banking') {
        setFilters({ ...DEFAULT_FILTERS, type: 'Bank' });
      }
      setCurrentPage(1);
    },
    [setFilters, setCurrentPage]
  );

  // Add new vendor
  const handleAddVendor = useCallback(
    (newVendor: VendorRecord) => {
      addNewVendor(newVendor);
    },
    [addNewVendor]
  );

  // Export PDF / Print handler
  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  return (
    <div
      id="vendors-page-container"
      className="w-full space-y-4 px-3 sm:px-6 pt-2 pb-28 sm:pb-32"
    >
      {/* Top Bar: Action at Top-Right only (No redundant page title or subtitle) */}
      <div className="flex items-center justify-end">
        <button
          id="add-vendor-btn"
          onClick={() => setIsAddModalOpen(true)}
          aria-label="Add Vendor"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0D93AA] hover:bg-[#0b8094] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          title="Register a new vendor"
        >
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* 1. Summary Cards (Five Compact Cards, No Supporting Descriptions) */}
      <section aria-label="Vendor Metrics">
        <VendorSummaryCards
          summary={summaryMetrics}
          onFilterClick={handleSummaryFilter}
        />
      </section>

      {/* 2. Compact Filter Section */}
      <section aria-label="Vendor Filters">
        <VendorFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          totalFiltered={filteredVendors.length}
          totalCount={vendors.length}
        />
      </section>

      {/* 3. Full-Width Vendor Table */}
      <section aria-label="Vendor Records Table">
        <VendorTable
          vendors={filteredVendors}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewDetails={handleViewDetails}
          currentPage={currentPage}
          totalVendorsCount={filteredVendors.length}
          pageSize={pageSize}
        />
      </section>

      {/* Floating Export PDF Button with Bottom-Right Safety Clearance */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 print:hidden">
        <button
          id="export-vendors-pdf-btn"
          onClick={handleExportPdf}
          aria-label="Export Vendors PDF Report"
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-white bg-[#0D93AA] hover:bg-[#0b8094] shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#0D93AA] focus:ring-offset-2"
          title="Export Vendors List to PDF"
        >
          <Printer size={15} />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Add Vendor Modal Dialog */}
      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddVendor={handleAddVendor}
      />
    </div>
  );
};

export default VendorsPage;
