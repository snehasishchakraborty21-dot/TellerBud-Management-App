import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';
import { ServiceModeRecord, ServiceModeFilters } from '../types/serviceMode';
import { getStoredServiceModes } from '../data/mockServiceModes';
import { ServiceModesSummaryCards } from '../components/serviceModes/ServiceModesSummaryCards';
import { ServiceModesFilterBar } from '../components/serviceModes/ServiceModesFilterBar';
import { ServiceModesTable } from '../components/serviceModes/ServiceModesTable';

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
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<ServiceModeFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      sessionStorage.setItem('tellerbud_sm_filters', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    sessionStorage.removeItem('tellerbud_sm_filters');
  }, []);

  // Refresh service modes while preserving active filters
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setServiceModes(getStoredServiceModes());
      setIsRefreshing(false);
      setToastMessage('Service modes reloaded.');
    }, 450);
  }, []);

  // Filter and sort service records
  const filteredServices = useMemo(() => {
    return serviceModes
      .filter((service) => {
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

  // Helper date for filename
  const getExportDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to build CSV/Excel data rows
  const buildExportRows = useCallback((targetServices: ServiceModeRecord[]) => {
    return targetServices.map((s) => [
      s.name,
      s.id,
      s.audience,
      s.availability,
      s.transactionTypes.join(', '),
      s.isInternalLedger ? 'TellerBud Ledger' : `${s.eligibleProvidersCount} Providers`,
      s.scheduling,
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
    if (isExporting) return;
    setIsExporting(true);

    try {
      const headers = [
        'Service Mode',
        'Service Mode ID',
        'Audience',
        'Availability',
        'Transaction Types',
        'Eligible Providers',
        'Scheduling',
      ];

      const rows = buildExportRows(filteredServices);
      const csvContent = [
        headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\r\n');

      const filename = `TellerBud_Service_Modes_${getExportDateStr()}.csv`;
      triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
      setToastMessage('Service modes exported as CSV.');
    } catch (err) {
      console.error('Export CSV error:', err);
      setToastMessage('Failed to export CSV. Please try again.');
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  }, [filteredServices, isExporting, buildExportRows]);

  // Export Excel Handler (XML Spreadsheet format compatible with Excel)
  const handleExportExcel = useCallback(() => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const headers = [
        'Service Mode',
        'Service Mode ID',
        'Audience',
        'Availability',
        'Transaction Types',
        'Eligible Providers',
        'Scheduling',
      ];

      const rows = buildExportRows(filteredServices);
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
        '<Worksheet ss:Name="ServiceModes">\r\n' +
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
      const filename = `TellerBud_Service_Modes_${getExportDateStr()}.xlsx`;
      triggerDownload(
        excelContent,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
      );
      setToastMessage('Service modes exported as Excel.');
    } catch (err) {
      console.error('Export Excel error:', err);
      setToastMessage('Failed to export Excel. Please try again.');
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  }, [filteredServices, isExporting, buildExportRows]);

  // View Details navigation: pass ID, navigate to /service-modes/:serviceId, preserve state
  const handleViewDetails = useCallback((service: ServiceModeRecord) => {
    sessionStorage.setItem('tellerbud_sm_filters', JSON.stringify(filters));

    navigate(`/service-modes/${service.id}`, {
      state: {
        from: location.pathname,
        serviceId: service.id,
        filters,
      },
    });
  }, [filters, navigate, location.pathname]);

  return (
    <div
      id="service-modes-page-container"
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

      {/* TOP FROZEN SECTION: 5 KPI Cards + Filter Bar */}
      <div
        id="frozen-service-modes-kpi-filter-section"
        className="shrink-0 bg-[#FAFAFA] space-y-2 sm:space-y-2.5 transition-all"
      >
        {/* 1. Summary Cards: 5 compact cards, icon + label + number in 1 horizontal line */}
        <ServiceModesSummaryCards serviceModes={serviceModes} />

        {/* 2. Compact Filter Row: 3 Dropdowns + Export + Clear Filters + Refresh */}
        <ServiceModesFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          isRefreshing={isRefreshing}
          isExporting={isExporting}
        />
      </div>

      {/* 3. MAIN TABLE SECTION WITH FROZEN THEAD & INTERNAL VERTICAL SCROLL */}
      <section
        aria-label="Service Modes Table"
        className="flex-1 min-h-0 flex flex-col"
      >
        <ServiceModesTable
          serviceModes={filteredServices}
          totalServiceModesCount={serviceModes.length}
          onViewDetails={handleViewDetails}
        />
      </section>
    </div>
  );
};

export default ServiceModesPage;
