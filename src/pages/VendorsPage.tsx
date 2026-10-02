import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pageSize = 10;

  // Restore scroll position when returning from details
  useEffect(() => {
    if (scrollPosition > 0) {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' as ScrollBehavior });
    }
  }, [scrollPosition]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
      setToastMessage('Vendor list refreshed.');
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
      setToastMessage(`Vendor "${newVendor.name}" added successfully.`);
    },
    [addNewVendor]
  );

  // Helper date for filename
  const getExportDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to build CSV/Excel data rows
  const buildExportRows = useCallback((targetVendors: VendorRecord[]) => {
    return targetVendors.map((v) => [
      v.name,
      v.id,
      v.type,
      v.services.join(', '),
      v.integrationMode,
      v.status,
      v.lastUpdated,
    ]);
  }, []);

  // Trigger file download helper
  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export CSV Handler
  const handleExportCSV = useCallback(() => {
    try {
      const hasActiveFilters =
        filters.type !== 'All' ||
        filters.status !== 'All' ||
        filters.service !== 'All';

      const targetVendors = hasActiveFilters ? filteredVendors : vendors;
      const headers = [
        'Vendor Name',
        'Vendor ID',
        'Vendor Type',
        'Supported Services',
        'Integration Mode',
        'Status',
        'Last Updated',
      ];

      const rows = buildExportRows(targetVendors);
      const csvContent = [
        headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\r\n');

      const filename = `TellerBud_Vendors_${getExportDateStr()}.csv`;
      triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
      setToastMessage('Vendor list exported as CSV.');
    } catch (err) {
      console.error('Export CSV error:', err);
      setToastMessage('Failed to export CSV. Please try again.');
    }
  }, [filteredVendors, vendors, filters, buildExportRows]);

  // Export Excel Handler (XML Spreadsheet format compatible with Excel)
  const handleExportExcel = useCallback(() => {
    try {
      const hasActiveFilters =
        filters.type !== 'All' ||
        filters.status !== 'All' ||
        filters.service !== 'All';

      const targetVendors = hasActiveFilters ? filteredVendors : vendors;
      const headers = [
        'Vendor Name',
        'Vendor ID',
        'Vendor Type',
        'Supported Services',
        'Integration Mode',
        'Status',
        'Last Updated',
      ];

      const rows = buildExportRows(targetVendors);
      const excelHeader =
        '<?xml version="1.0"?>\r\n' +
        '<?mso-application progid="Excel.Sheet"?>\r\n' +
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\r\n' +
        ' xmlns:o="urn:schemas-microsoft-com:office:office"\r\n' +
        ' xmlns:x="urn:schemas-microsoft-com:office:excel"\r\n' +
        ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\r\n' +
        '<Styles>\r\n' +
        ' <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/></Style>\r\n' +
        '</Styles>\r\n' +
        '<Worksheet ss:Name="Vendors">\r\n' +
        '<Table>\r\n';

      const excelHeaderRow =
        ' <Row ss:StyleID="Header">\r\n' +
        headers
          .map((h) => `  <Cell><Data ss:Type="String">${h}</Data></Cell>\r\n`)
          .join('') +
        ' </Row>\r\n';

      const excelDataRows = rows
        .map(
          (row) =>
            ' <Row>\r\n' +
            row
              .map(
                (cell) =>
                  `  <Cell><Data ss:Type="String">${String(cell)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')}</Data></Cell>\r\n`
              )
              .join('') +
            ' </Row>\r\n'
        )
        .join('');

      const excelFooter = '</Table>\r\n</Worksheet>\r\n</Workbook>';
      const excelContent = excelHeader + excelHeaderRow + excelDataRows + excelFooter;
      const filename = `TellerBud_Vendors_${getExportDateStr()}.xlsx`;
      triggerDownload(
        excelContent,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
      );
      setToastMessage('Vendor list exported as Excel.');
    } catch (err) {
      console.error('Export Excel error:', err);
      setToastMessage('Failed to export Excel. Please try again.');
    }
  }, [filteredVendors, vendors, filters, buildExportRows]);

  return (
    <div
      id="vendors-page-container"
      className="w-full flex-1 flex flex-col min-h-0 h-full gap-2.5 sm:gap-3 px-3 sm:px-6 pt-1 pb-3 sm:pb-4 overflow-hidden"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-[13px] font-medium leading-[18px] rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP FROZEN SECTION: 5 KPI Cards + Add Button + Filter Bar */}
      <div
        id="frozen-vendors-kpi-filter-section"
        className="shrink-0 bg-[#FAFAFA] space-y-2.5 transition-all"
      >
        {/* Five Compact Summary Cards + Add Button in 1 Desktop Row */}
        <VendorSummaryCards
          summary={summaryMetrics}
          onFilterClick={handleSummaryFilter}
          onAddClick={() => setIsAddModalOpen(true)}
        />

        {/* Compact Filter Row with Export Dropdown */}
        <VendorFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* FULL-WIDTH VENDOR TABLE WITH FROZEN THEAD & INTERNAL VERTICAL SCROLL */}
      <section
        aria-label="Vendor Records Table"
        className="flex-1 min-h-0 flex flex-col"
      >
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
