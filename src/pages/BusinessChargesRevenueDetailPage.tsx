import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Coins,
  Landmark,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import {
  MOCK_CHARGE_RECORDS,
  REGISTERED_BUSINESSES,
} from '../data/mockChargesCommissionsData';
import { MOCK_BUSINESSES } from '../data/mockBusinessData';
import { ChargeRecord, ChargeStatus } from '../types/chargesCommissions';
import { formatZmwListingAmount, formatZMW } from '../utils/formatters';
import { sanitizeDateParam, getZambiaTodayString } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

const SERVICES_OPTIONS = [
  'All Services',
  'Cash Pickup',
  'Walk-In Transaction',
  'Agent-to-Agent Liquidity',
  'Customer Withdrawal',
  'Business Wallet Transaction',
];

const PROVIDERS_OPTIONS = [
  'All Providers',
  'MTN Mobile Money',
  'Airtel Money',
  'Zamtel',
  'Zanaco',
  'FNB',
  'INDO',
  'Stanbic',
  'Access',
];

const STATUSES_OPTIONS = [
  'All Statuses',
  'Posted',
  'Pending',
  'Cancelled',
];

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const day = String(d).padStart(2, '0');
  const month = dateObj.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  const year = y;
  return `${day} ${month} ${year}`;
}

export const BusinessChargesRevenueDetailPage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const isBusinessOwner =
    currentUser?.role === 'business_owner' ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/business-owner'));

  // Authoritative single date from top header (URL parameter)
  const dateParam = searchParams.get('date');
  const selectedDate = useMemo(() => sanitizeDateParam(dateParam), [dateParam]);

  useEffect(() => {
    document.title = 'Business Charges & Revenue Details | TellerBud Admin';
  }, []);

  // Find business details for internal scoped data retrieval
  const business = useMemo(() => {
    if (!businessId) return MOCK_BUSINESSES[0];
    const found = MOCK_BUSINESSES.find(
      (b) =>
        b.id.toLowerCase() === businessId.toLowerCase() ||
        b.name.toLowerCase() === businessId.toLowerCase() ||
        (b.id.includes('TB-BIZ-') && businessId.toUpperCase().includes(b.id.replace('TB-BIZ-', '')))
    );
    if (found) return found;

    const regFound = REGISTERED_BUSINESSES.find(
      (b) =>
        b.id.toLowerCase() === businessId.toLowerCase() ||
        b.legacyId.toLowerCase() === businessId.toLowerCase() ||
        b.name.toLowerCase() === businessId.toLowerCase()
    );
    if (regFound) {
      return {
        id: regFound.id,
        name: regFound.name,
        ownerName: 'Chileshe Mwamba',
        ownerPhone: '+260 97 712 3456',
        city: 'Lusaka',
        province: 'Lusaka Province',
        associatedAgents: 8,
        agentsOnline: 6,
      };
    }
    return MOCK_BUSINESSES[0];
  }, [businessId]);

  // Filter charge records belonging strictly to this business and selected date
  const businessChargeRecords = useMemo(() => {
    return MOCK_CHARGE_RECORDS.filter((rec) => {
      // 1. Authoritative Date Filter
      if (rec.rawDate !== selectedDate) {
        return false;
      }

      // 2. Business Filter
      if (rec.businessId && (rec.businessId === business.id || rec.businessId === (business as any).legacyId)) {
        return true;
      }
      if (rec.businessName && rec.businessName.toLowerCase() === business.name.toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [business, selectedDate]);

  // Filter States inside Detail Page (Service, Provider, Status only; Date from top header)
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRecords = useMemo(() => {
    return businessChargeRecords.filter((rec) => {
      if (selectedService !== 'All Services' && rec.service !== selectedService) return false;
      if (selectedProvider !== 'All Providers' && rec.provider !== selectedProvider) return false;
      if (selectedStatus !== 'All Statuses' && rec.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      return true;
    });
  }, [businessChargeRecords, selectedService, selectedProvider, selectedStatus]);

  // Key business metrics scoped strictly to selected business and filters
  const totalReservationCharges = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (r.reservationCharge || 0), 0);
  }, [filteredRecords]);

  const tellerBudCharges = useMemo(() => {
    return filteredRecords.reduce(
      (sum, r) => sum + (r.tellerBudCharge ?? Math.round((r.reservationCharge || 0) * 0.20 * 100) / 100),
      0
    );
  }, [filteredRecords]);

  const businessRevenue = useMemo(() => {
    return filteredRecords.reduce(
      (sum, r) => sum + (r.businessRevenue ?? Math.round((r.reservationCharge || 0) * 0.80 * 100) / 100),
      0
    );
  }, [filteredRecords]);

  const postedCount = useMemo(() => {
    return filteredRecords.filter((r) => r.status === 'Posted' || r.status === 'Completed').length;
  }, [filteredRecords]);

  const pendingCount = useMemo(() => {
    return filteredRecords.filter((r) => r.status === 'Pending').length;
  }, [filteredRecords]);

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (validCurrentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, validCurrentPage, rowsPerPage]);

  const handleClearFilters = () => {
    setSelectedService('All Services');
    setSelectedProvider('All Providers');
    setSelectedStatus('All Statuses');
    setCurrentPage(1);
  };

  const isFilterActive =
    selectedService !== 'All Services' ||
    selectedProvider !== 'All Providers' ||
    selectedStatus !== 'All Statuses';

  const handleExport = useCallback(() => {
    const headers = [
      'Charge ID',
      'Transaction ID',
      'Date & Time',
      'Customer Name',
      'Customer ID',
      'Service',
      'Vendor',
      'Transaction Amount (ZMW)',
      'Reservation Fee (ZMW)',
      'TellerBud Allocation (ZMW)',
      'Business Allocation (ZMW)',
      'Status',
    ];

    const rows = filteredRecords.map((r) => [
      r.reference,
      r.transactionReference,
      r.dateTime || r.createdAt,
      `"${r.customerName}"`,
      r.customerId,
      r.service,
      r.provider,
      r.transactionAmount.toFixed(2),
      r.reservationCharge.toFixed(2),
      (r.tellerBudCharge ?? (r.reservationCharge * 0.20)).toFixed(2),
      (r.businessRevenue ?? (r.reservationCharge * 0.80)).toFixed(2),
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TellerBud_${business.id}_Charges_Revenue_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredRecords, business.id, selectedDate]);

  const renderStatusBadge = (status: ChargeStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      case 'Posted':
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Posted
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-4 max-w-[1720px] w-full mx-auto">
      {/* 1. SUMMARY KPI CARDS (5 Compact Cards in 1 horizontal row directly below main page heading) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0">
        {/* Card 1: Total Reservation Charges */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
              Reservation Charges
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1 whitespace-nowrap">
              {formatZMW(totalReservationCharges)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Coins size={18} />
          </div>
        </div>

        {/* Card 2: TellerBud Charges */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
              TellerBud Charges
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-[#0D93AA] mt-1 whitespace-nowrap">
              {formatZMW(tellerBudCharges)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-50 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Landmark size={18} />
          </div>
        </div>

        {/* Card 3: Business Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
              Business Revenue
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 mt-1 whitespace-nowrap">
              {formatZMW(businessRevenue)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
        </div>

        {/* Card 4: Posted Count */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
              Posted Records
            </span>
            <div className="text-base sm:text-lg font-bold text-emerald-700 mt-1 whitespace-nowrap">
              {postedCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Card 5: Pending Count */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">
              Pending Records
            </span>
            <div className="text-base sm:text-lg font-bold text-amber-700 mt-1 whitespace-nowrap">
              {pendingCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* 2. FILTER BAR AND EXPORT (Single line: All Services, All Providers, All Statuses, Clear, Export) */}
      <div className="shrink-0 bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 min-w-0">
            {/* Service */}
            <div className="w-full sm:w-auto min-w-[140px] flex-1">
              <select
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[32px] px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer truncate"
              >
                {SERVICES_OPTIONS.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider */}
            <div className="w-full sm:w-auto min-w-[140px] flex-1">
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[32px] px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer truncate"
              >
                {PROVIDERS_OPTIONS.map((prv) => (
                  <option key={prv} value={prv}>
                    {prv}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="w-full sm:w-auto min-w-[130px] flex-1">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[32px] px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer truncate"
              >
                {STATUSES_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              onClick={handleClearFilters}
              disabled={!isFilterActive}
              className="inline-flex items-center gap-1 h-[32px] px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 disabled:opacity-45 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw size={13} />
              <span>Clear Filters</span>
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-[32px] px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. INDIVIDUAL CHARGE AND REVENUE RECORDS LISTING */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto transaction-table-scroll focus:outline-none">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-[#F9FAFB] shadow-[0_1px_0_0_#E5E7EB]">
              <tr className="border-b border-gray-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] bg-[#F9FAFB] h-[44px]">
                <th className="py-3 px-3">Charge ID</th>
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Service & Vendor</th>
                <th className="py-3 px-3">Transaction Amt</th>
                <th className="py-3 px-3">Reservation Fee</th>
                <th className="py-3 px-3">TellerBud (20%)</th>
                <th className="py-3 px-3">Business (80%)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <Receipt size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm text-slate-700">
                      No charges or revenue records found for {formatDisplayDate(selectedDate)}.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try selecting another date from the header calendar or adjusting your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#0D93AA] whitespace-nowrap">
                      {rec.reference}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {rec.transactionReference}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {rec.dateTime || rec.createdAt}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 truncate">{rec.customerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{rec.customerId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{rec.service}</div>
                      <div className="text-[11px] text-slate-500">{rec.provider}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {formatZmwListingAmount(rec.transactionAmount)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatZmwListingAmount(rec.reservationCharge)}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-[#0D93AA] whitespace-nowrap">
                      {formatZmwListingAmount(rec.tellerBudCharge ?? (rec.reservationCharge * 0.20))}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-emerald-700 whitespace-nowrap">
                      {formatZmwListingAmount(rec.businessRevenue ?? (rec.reservationCharge * 0.80))}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderStatusBadge(rec.status)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (isBusinessOwner) {
                            navigate(`/business-owner/transactions/commissions/${rec.id}?date=${selectedDate}`);
                          } else {
                            navigate(`/super-admin/transactions/commissions/${rec.id}?date=${selectedDate}`);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0D93AA] hover:text-white hover:bg-[#0D93AA] bg-cyan-50/60 border border-[#0D93AA]/30 rounded-lg transition-all cursor-pointer"
                        title="View Charge Record Details"
                      >
                        <Eye size={12} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. FOOTER PAGINATION */}
        <div className="shrink-0 border-t border-slate-200 bg-slate-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-700">
              Showing <span className="font-bold text-slate-900">{totalCount === 0 ? 0 : (validCurrentPage - 1) * rowsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(validCurrentPage * rowsPerPage, totalCount)}</span> of{' '}
              <span className="font-bold text-slate-900">{totalCount}</span> records
            </span>

            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Page <strong className="text-slate-800">{validCurrentPage}</strong> of{' '}
              <strong className="text-slate-800">{totalPages}</strong>
            </span>

            <div className="inline-flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessChargesRevenueDetailPage;
