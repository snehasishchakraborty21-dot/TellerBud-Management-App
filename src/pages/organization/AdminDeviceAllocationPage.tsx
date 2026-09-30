import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRightLeft,
  XCircle,
  RefreshCw,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Eye,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import { businessService } from '../../services/businessService';
import { Device, DeviceType, DeviceStatus } from '../../types/organization';
import { getZambiaTodayString } from '../../utils/dateUtils';

export const AdminDeviceAllocationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DeviceStatus>('All');
  const [businessFilter, setBusinessFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Export menu
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const todayStr = getZambiaTodayString() || new Date().toISOString().split('T')[0];

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    deviceName: '',
    deviceType: 'POS Terminal' as DeviceType,
    serialNumber: '',
    businessId: 'UNALLOCATED',
  });
  const [nextGeneratedDevId, setNextGeneratedDevId] = useState('');

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [targetBusinessId, setTargetBusinessId] = useState('UNALLOCATED');
  const [allocationReason, setAllocationReason] = useState('');

  // Decommission Modal
  const [showDecommissionModal, setShowDecommissionModal] = useState(false);
  const [selectedDeviceForDecommission, setSelectedDeviceForDecommission] = useState<Device | null>(null);
  const [decommissionReason, setDecommissionReason] = useState('');
  const [isDecommissioning, setIsDecommissioning] = useState(false);

  // View Details Modal (for Decommissioned or inspection)
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    setDevices(organizationService.getAllGlobalDevices());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = organizationService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Registered Businesses from businessService (normalized TB-BIZ-000001 format)
  const registeredBusinesses = useMemo(() => {
    const fromBizService = businessService.getBusinesses();
    if (fromBizService && fromBizService.length > 0) {
      return fromBizService.map((b) => ({
        id: b.id,
        name: b.name,
      }));
    }
    return [
      { id: 'TB-BIZ-000001', name: 'Lusaka Central Express Agency' },
      { id: 'TB-BIZ-000002', name: 'Kabwata Market Agency' },
      { id: 'TB-BIZ-000003', name: 'Copperbelt Financial Services' },
      { id: 'TB-BIZ-000004', name: 'Copperbelt Liquidity Hub' },
      { id: 'TB-BIZ-000005', name: 'Livingstone Victoria Falls Agency' },
      { id: 'TB-BIZ-000006', name: 'Chipata Eastern Gateway' },
      { id: 'TB-BIZ-000007', name: 'Ndola Broadway Financial Branch' },
      { id: 'TB-BIZ-000008', name: 'Solwezi Mining District Agency' },
    ];
  }, []);

  const getBusinessName = (bizId: string | null | undefined) => {
    if (!bizId || bizId === 'UNALLOCATED') return null;
    const found = registeredBusinesses.find((b) => b.id === bizId);
    return found ? found.name : bizId;
  };

  // KPIs
  const totalHardware = devices.length;
  const allocatedCount = devices.filter(
    (d) => d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED' && d.status !== 'Decommissioned'
  ).length;
  const depotCount = devices.filter(
    (d) => (!d.allocatedBusinessId || d.allocatedBusinessId === 'UNALLOCATED') && d.status !== 'Decommissioned'
  ).length;
  const decommissionedCount = devices.filter((d) => d.status === 'Decommissioned').length;

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'All' || businessFilter !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setBusinessFilter('All');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setFeedback(null);
    loadData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      // 1. Status Filter
      if (statusFilter !== 'All' && d.status !== statusFilter) return false;

      // 2. Business Allocation Filter
      if (businessFilter !== 'All') {
        if (businessFilter === 'UNALLOCATED') {
          if (d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED') return false;
        } else {
          if (d.allocatedBusinessId !== businessFilter) return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const bizName = (getBusinessName(d.allocatedBusinessId) || '').toLowerCase();
        const bizId = (d.allocatedBusinessId || '').toLowerCase();
        const devName = (d.deviceName || '').toLowerCase();
        const devId = (d.deviceId || d.id || '').toLowerCase();
        const devType = (d.deviceType || '').toLowerCase();
        const serial = (d.serialNumber || '').toLowerCase();

        const match =
          devName.includes(q) ||
          devId.includes(q) ||
          devType.includes(q) ||
          serial.includes(q) ||
          bizName.includes(q) ||
          bizId.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [devices, statusFilter, businessFilter, searchQuery, registeredBusinesses]);

  // Export handlers
  const prepareExportData = () => {
    return filteredDevices.map((d) => {
      const bizName = getBusinessName(d.allocatedBusinessId);
      return {
        'Hardware Unit': d.deviceName,
        'Device ID': d.deviceId || d.id,
        'Device Type': d.deviceType,
        'Serial Number': d.serialNumber,
        'Allocated Business': bizName || 'Central Depot Inventory',
        'Business ID': d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED' ? d.allocatedBusinessId : '—',
        'Device Status': d.status,
      };
    });
  };

  const handleExportCSV = () => {
    setShowExportMenu(false);
    const data = prepareExportData();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const val = (row as Record<string, string | number>)[header];
            const escaped = String(val ?? '').replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      ),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `TellerBud_Device_Allocation_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    const data = prepareExportData();
    if (data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 28 }, // Hardware Unit
      { wch: 18 }, // Device ID
      { wch: 20 }, // Device Type
      { wch: 22 }, // Serial Number
      { wch: 32 }, // Allocated Business
      { wch: 18 }, // Business ID
      { wch: 16 }, // Device Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Device Allocation');
    XLSX.writeFile(wb, `TellerBud_Device_Allocation_${todayStr}.xlsx`);
  };

  // Open Enroll modal
  const openEnrollModal = () => {
    const nextSeq = devices.length + 1;
    const previewId = `TB-DEV-${String(nextSeq).padStart(6, '0')}`;
    setNextGeneratedDevId(previewId);
    setRegisterForm({
      deviceName: '',
      deviceType: 'POS Terminal',
      serialNumber: '',
      businessId: 'UNALLOCATED',
    });
    setShowRegisterModal(true);
  };

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate unique serial number
    const dupSerial = devices.some(
      (d) => d.serialNumber.trim().toLowerCase() === registerForm.serialNumber.trim().toLowerCase()
    );
    if (dupSerial) {
      setFeedback({
        type: 'error',
        message: `Serial Number "${registerForm.serialNumber}" is already enrolled on the platform.`,
      });
      return;
    }

    const assignedBiz = registerForm.businessId === 'UNALLOCATED' ? null : registerForm.businessId;
    const res = organizationService.registerDevice(currentUser || ({ uid: 'ADM-001', fullName: 'Sililo Lubinda (Admin)', role: 'super_admin' } as any), {
      deviceName: registerForm.deviceName.trim(),
      deviceType: registerForm.deviceType,
      serialNumber: registerForm.serialNumber.trim(),
      allocatedBusinessId: assignedBiz,
    });

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to enroll hardware unit.' });
      return;
    }

    loadData();
    const enrolledDevId = res.device?.deviceId || res.device?.id;
    setFeedback({
      type: 'success',
      message: `Hardware unit ${registerForm.deviceName} enrolled successfully with ID ${enrolledDevId}.`,
    });
    setShowRegisterModal(false);
  };

  // Open Reallocate / Allocate modal
  const openAllocate = (dev: Device) => {
    setSelectedDevice(dev);
    setTargetBusinessId(dev.allocatedBusinessId || 'UNALLOCATED');
    setAllocationReason('');
    setShowAllocateModal(true);
  };

  const handleConfirmAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    setFeedback(null);

    const bId = targetBusinessId === 'UNALLOCATED' ? null : targetBusinessId;
    const user = currentUser || ({ uid: 'ADM-001', fullName: 'Sililo Lubinda (Admin)', role: 'super_admin' } as any);

    const res = organizationService.allocateDeviceToBusiness(
      user,
      selectedDevice.id,
      bId,
      allocationReason.trim() || 'Device allocation updated by TellerBud Admin'
    );

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to allocate device.' });
      return;
    }

    loadData();
    const bName = bId ? getBusinessName(bId) : 'Central Depot Inventory';
    setFeedback({
      type: 'success',
      message: `Device ${selectedDevice.deviceName} (${selectedDevice.deviceId || selectedDevice.id}) allocated to ${bName}.`,
    });
    setShowAllocateModal(false);
  };

  // Decommission modal
  const openDecommissionModal = (dev: Device) => {
    setSelectedDeviceForDecommission(dev);
    setDecommissionReason('');
    setShowDecommissionModal(true);
  };

  const handleConfirmDecommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceForDecommission) return;
    if (!decommissionReason.trim()) {
      setFeedback({ type: 'error', message: 'Reason for decommissioning is required.' });
      return;
    }

    setIsDecommissioning(true);
    setFeedback(null);

    const user = currentUser || ({ uid: 'ADM-001', fullName: 'Sililo Lubinda (Admin)', role: 'super_admin' } as any);
    const res = organizationService.decommissionDevice(
      user,
      selectedDeviceForDecommission.id,
      decommissionReason.trim()
    );

    setIsDecommissioning(false);

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to decommission device.' });
      return;
    }

    loadData();
    setFeedback({
      type: 'success',
      message: `Device ${selectedDeviceForDecommission.deviceName} (${selectedDeviceForDecommission.deviceId || selectedDeviceForDecommission.id}) permanently decommissioned.`,
    });
    setShowDecommissionModal(false);
  };

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'Assigned':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Assigned
          </span>
        );
      case 'Available':
      case 'Unmapped':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
            Available
          </span>
        );
      case 'Under Maintenance':
      case 'Inactive':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Under Maintenance
          </span>
        );
      case 'Decommissioned':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            Decommissioned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto pb-6 sm:pb-8 w-full">
      {/* 1. Breadcrumb and Action Row (No duplicate page title or sentence) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0D93AA]">
          <Cpu className="w-3.5 h-3.5" />
          <span>Platform Configuration</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">Global Hardware Repository</span>
        </div>

        <button
          id="btn-register-device"
          type="button"
          onClick={openEnrollModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all cursor-pointer w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Enroll Hardware Unit</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-start justify-between p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Compact KPI Cards in One Single Row */}
      <section aria-label="Device Allocation Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
          {/* Global Enrolled Hardware */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-gray-200/80 shadow-2xs h-[52px] sm:h-[54px]">
            <span className="text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-600 truncate">
              Global Enrolled Hardware
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-[#0D93AA] shrink-0">
              {totalHardware}
            </span>
          </div>

          {/* Allocated to Businesses */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-gray-200/80 shadow-2xs h-[52px] sm:h-[54px]">
            <span className="text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-600 truncate">
              Allocated to Businesses
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-emerald-700 shrink-0">
              {allocatedCount}
            </span>
          </div>

          {/* Central Depot Inventory */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-gray-200/80 shadow-2xs h-[52px] sm:h-[54px]">
            <span className="text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-600 truncate">
              Central Depot Inventory
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-cyan-700 shrink-0">
              {depotCount}
            </span>
          </div>

          {/* Decommissioned Hardware */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-gray-200/80 shadow-2xs h-[52px] sm:h-[54px]">
            <span className="text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-600 truncate">
              Decommissioned Hardware
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-rose-700 shrink-0">
              {decommissionedCount}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Compact Filter & Action Row */}
      <section aria-label="Device Filters">
        <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 sm:p-3 shadow-xs">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
            {/* Search, Allocation Status, Device Status */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
              {/* Search Hardware */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search
                  size={13}
                  className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search device, ID, serial number or business…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-8.5 pr-7 text-xs bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Allocation Status */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-1 focus-within:ring-[#0D93AA] focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                  Allocation:
                </span>
                <select
                  value={businessFilter}
                  onChange={(e) => setBusinessFilter(e.target.value)}
                  className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1 max-w-[150px] sm:max-w-[180px] truncate"
                  aria-label="Filter by Allocation"
                >
                  <option value="All">All Allocations</option>
                  <option value="UNALLOCATED">Central Depot Inventory</option>
                  {registeredBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Device Status */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-1 focus-within:ring-[#0D93AA] focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer pr-1"
                  aria-label="Filter by Status"
                >
                  <option value="All">All Statuses</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Decommissioned">Decommissioned</option>
                </select>
              </div>
            </div>

            {/* Clear, Refresh, Export, Count */}
            <div className="flex items-center gap-2 sm:gap-2.5 ml-auto shrink-0">
              <span className="text-xs text-gray-500 font-medium hidden xl:inline-block">
                Showing <strong className="text-gray-800">{filteredDevices.length}</strong> of{' '}
                <strong className="text-gray-800">{devices.length}</strong> units
              </span>

              {/* Clear Filters */}
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                  hasActiveFilters
                    ? 'text-gray-700 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 cursor-pointer'
                    : 'text-gray-400 bg-transparent border-gray-200/60 opacity-50 cursor-not-allowed'
                }`}
                title={hasActiveFilters ? 'Clear all active filters' : 'No filters active'}
              >
                <X size={13} />
                <span>Clear Filters</span>
              </button>

              {/* Refresh */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-9 px-3.5 text-xs font-semibold text-gray-700 hover:text-[#0D93AA] hover:bg-[#0D93AA]/5 rounded-lg border border-gray-200 hover:border-[#0D93AA]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Refresh hardware allocations"
              >
                <RefreshCw
                  size={13}
                  className={isRefreshing ? 'animate-spin text-[#0D93AA]' : ''}
                />
                <span>Refresh</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  id="btn-export-devices"
                  onClick={() => setShowExportMenu((prev) => !prev)}
                  className="h-9 px-3.5 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Export hardware records"
                >
                  <Download size={13} />
                  <span>Export</span>
                  <ChevronDown
                    size={12}
                    className={showExportMenu ? 'rotate-180 transition-transform' : 'transition-transform'}
                  />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>Export as Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText size={14} className="text-blue-600" />
                      <span>Export as CSV (.csv)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Global Device Table (Exact 5 columns ordered per requirement) */}
      {/* 1. Hardware Unit | 2. Type & Serial | 3. Allocated Business | 4. Device Status | 5. Actions */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden w-full mb-1">
        <div className="overflow-x-auto max-h-[calc(100vh-270px)] overflow-y-auto pb-2.5">
          <table className="w-full text-center border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs">
              <tr className="border-b border-gray-200 text-[10.5px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none">
                {/* 1. Hardware Unit */}
                <th className="py-3 px-3 text-center align-middle min-w-[200px] sm:min-w-[220px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Hardware Unit</span>
                  </div>
                </th>

                {/* 2. Type & Serial */}
                <th className="py-3 px-3 text-center align-middle min-w-[180px] sm:min-w-[200px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Type & Serial</span>
                  </div>
                </th>

                {/* 3. Allocated Business */}
                <th className="py-3 px-3 text-center align-middle min-w-[200px] sm:min-w-[230px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Allocated Business</span>
                  </div>
                </th>

                {/* 4. Device Status */}
                <th className="py-3 px-3 text-center align-middle min-w-[120px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Device Status</span>
                  </div>
                </th>

                {/* 5. Actions */}
                <th className="py-3 px-3 text-center align-middle min-w-[150px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 align-middle">
                    <Cpu size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600 text-sm">No hardware units found</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {hasActiveFilters
                        ? 'No devices match your current filter and search query.'
                        : 'No enrolled hardware units currently in the repository.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => {
                  const bName = getBusinessName(d.allocatedBusinessId);
                  const devId = d.deviceId || d.id;

                  return (
                    <tr
                      key={`device-row-${d.id}`}
                      className="hover:bg-gray-50/70 transition-colors text-center align-middle"
                    >
                      {/* 1. Hardware Unit: Name on line 1, Device ID on line 2 */}
                      <td className="py-3 px-3 text-center align-middle">
                        <div className="flex flex-col items-center justify-center text-center mx-auto">
                          <div className="font-semibold text-gray-900 text-xs sm:text-[13px] whitespace-nowrap">
                            {d.deviceName}
                          </div>
                          <div className="text-[10.5px] sm:text-[11px] font-mono text-gray-400 mt-0.5 whitespace-nowrap">
                            {devId}
                          </div>
                        </div>
                      </td>

                      {/* 2. Type & Serial: Type on line 1, Serial on line 2 */}
                      <td className="py-3 px-3 text-center align-middle">
                        <div className="flex flex-col items-center justify-center text-center mx-auto">
                          <div className="font-semibold text-gray-800 text-xs whitespace-nowrap">
                            {d.deviceType}
                          </div>
                          <div className="text-[10.5px] sm:text-[11px] font-mono text-gray-400 mt-0.5 whitespace-nowrap">
                            {d.serialNumber}
                          </div>
                        </div>
                      </td>

                      {/* 3. Allocated Business: Name on line 1, Business ID on line 2 (or Depot Inventory) */}
                      <td className="py-3 px-3 text-center align-middle">
                        <div className="flex flex-col items-center justify-center text-center mx-auto">
                          {bName && d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED' && d.status !== 'Decommissioned' ? (
                            <>
                              <div className="font-semibold text-gray-900 text-xs sm:text-[12.5px] whitespace-nowrap">
                                {bName}
                              </div>
                              <div className="text-[10.5px] sm:text-[11px] font-mono text-gray-400 mt-0.5 whitespace-nowrap">
                                {d.allocatedBusinessId}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium text-gray-600 text-xs whitespace-nowrap">
                                Central Depot Inventory
                              </div>
                              <div className="text-[10.5px] text-gray-400 mt-0.5 whitespace-nowrap italic">
                                Unallocated
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* 4. Device Status */}
                      <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                        {getStatusBadge(d.status)}
                      </td>

                      {/* 5. Actions: Compact, centre-aligned */}
                      <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 mx-auto">
                          {/* Assigned Devices: Reallocate + Decommission */}
                          {d.status === 'Assigned' && (
                            <>
                              <button
                                type="button"
                                onClick={() => openAllocate(d)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 border border-[#0D93AA]/30 rounded-lg transition-colors cursor-pointer"
                                title="Reallocate hardware unit to another business"
                              >
                                <ArrowRightLeft size={12} />
                                <span>Reallocate</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openDecommissionModal(d)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                title="Decommission hardware unit"
                              >
                                <XCircle size={12} />
                                <span>Decommission</span>
                              </button>
                            </>
                          )}

                          {/* Available Devices: Allocate + Decommission */}
                          {(d.status === 'Available' || d.status === 'Unmapped') && (
                            <>
                              <button
                                type="button"
                                onClick={() => openAllocate(d)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                                title="Allocate hardware unit to a business"
                              >
                                <Plus size={12} />
                                <span>Allocate</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openDecommissionModal(d)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                title="Decommission hardware unit"
                              >
                                <XCircle size={12} />
                                <span>Decommission</span>
                              </button>
                            </>
                          )}

                          {/* Under Maintenance / Inactive */}
                          {(d.status === 'Under Maintenance' || d.status === 'Inactive') && (
                            <>
                              <button
                                type="button"
                                onClick={() => openAllocate(d)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 border border-[#0D93AA]/30 rounded-lg transition-colors cursor-pointer"
                                title="Reallocate hardware unit"
                              >
                                <ArrowRightLeft size={12} />
                                <span>Reallocate</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openDecommissionModal(d)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                title="Decommission hardware unit"
                              >
                                <XCircle size={12} />
                                <span>Decommission</span>
                              </button>
                            </>
                          )}

                          {/* Decommissioned: View Only */}
                          {d.status === 'Decommissioned' && (
                            <button
                              type="button"
                              onClick={() => setViewingDevice(d)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                              title="View decommission record and details"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: ENROLL NEW HARDWARE UNIT */}
      {/* ========================================== */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Enroll Hardware Unit</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assign official system identifier and catalog hardware unit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterDevice} className="space-y-3.5 text-xs">
              {/* System Generated Device ID */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Device ID (System Generated)
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={nextGeneratedDevId}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-mono font-bold cursor-not-allowed"
                />
              </div>

              {/* Device Model Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Hardware Model Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verifone P400 Terminal A1"
                  value={registerForm.deviceName}
                  onChange={(e) => setRegisterForm({ ...registerForm, deviceName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
                />
              </div>

              {/* Hardware Type */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Hardware Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={registerForm.deviceType}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, deviceType: e.target.value as DeviceType })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
                >
                  <option value="POS Terminal">POS Terminal</option>
                  <option value="mPOS">mPOS Card Reader</option>
                  <option value="Biometric Scanner">Biometric Scanner</option>
                  <option value="PIN Pad">PIN Pad</option>
                  <option value="Smartphone Terminal">Smartphone Terminal</option>
                </select>
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SN-VERIFONE-990022"
                  value={registerForm.serialNumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
                />
              </div>

              {/* Initial Business Allocation */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Initial Business Allocation
                </label>
                <select
                  value={registerForm.businessId}
                  onChange={(e) => setRegisterForm({ ...registerForm, businessId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
                >
                  <option value="UNALLOCATED">Central Depot Inventory (Unallocated)</option>
                  {registeredBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg font-semibold shadow-2xs cursor-pointer transition-all"
                >
                  Enroll Hardware Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ALLOCATE / REALLOCATE HARDWARE */}
      {/* ========================================== */}
      {showAllocateModal && selectedDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {selectedDevice.status === 'Assigned' ? 'Reallocate Hardware Unit' : 'Allocate Hardware Unit'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAllocation} className="space-y-3.5 text-xs">
              {/* Device Summary Card */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <div className="font-bold text-gray-900 text-sm">{selectedDevice.deviceName}</div>
                <div className="text-gray-500 font-mono text-[11px] flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{selectedDevice.deviceId || selectedDevice.id}</span>
                  <span>•</span>
                  <span>{selectedDevice.deviceType}</span>
                  <span>•</span>
                  <span>{selectedDevice.serialNumber}</span>
                </div>
                <div className="text-[11px] text-gray-600 mt-1">
                  Current: <strong className="text-gray-800">{getBusinessName(selectedDevice.allocatedBusinessId) || 'Central Depot Inventory'}</strong>
                </div>
              </div>

              {/* Target Business Selection */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Target Business Assignment <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetBusinessId}
                  onChange={(e) => setTargetBusinessId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
                >
                  <option value="UNALLOCATED">Central Depot Inventory (Unallocated)</option>
                  {registeredBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Reallocation Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deployment for agency counter expansion"
                  value={allocationReason}
                  onChange={(e) => setAllocationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg font-semibold shadow-2xs cursor-pointer transition-all"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: DECOMMISSION HARDWARE */}
      {/* ========================================== */}
      {showDecommissionModal && selectedDeviceForDecommission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 shrink-0">
                <XCircle size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base">Decommission Hardware Unit?</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Are you sure you want to permanently decommission <strong className="text-gray-900">{selectedDeviceForDecommission.deviceName}</strong>? This device will be removed from active allocation and cannot be assigned to a business again.
                </p>
              </div>
            </div>

            {/* Device Info */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Device ID:</span>
                <span className="font-mono font-bold text-gray-800">{selectedDeviceForDecommission.deviceId || selectedDeviceForDecommission.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Serial Number:</span>
                <span className="font-mono text-gray-700">{selectedDeviceForDecommission.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Previous Assignment:</span>
                <span className="font-semibold text-gray-800">
                  {getBusinessName(selectedDeviceForDecommission.allocatedBusinessId) || 'Central Depot Inventory'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmDecommission} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Reason for decommissioning <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Touchscreen failure, battery swelling, hardware returned for warranty repair..."
                  value={decommissionReason}
                  onChange={(e) => setDecommissionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDecommissionModal(false)}
                  disabled={isDecommissioning}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!decommissionReason.trim() || isDecommissioning}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg font-semibold shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isDecommissioning ? 'Decommissioning...' : 'Decommission Hardware'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: VIEW DECOMMISSIONED / DETAILS */}
      {/* ========================================== */}
      {viewingDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Hardware Unit Details</h3>
              <button
                type="button"
                onClick={() => setViewingDevice(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Hardware Model:</span>
                <span className="font-bold text-gray-900">{viewingDevice.deviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Device ID:</span>
                <span className="font-mono font-bold text-gray-800">{viewingDevice.deviceId || viewingDevice.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Device Type:</span>
                <span className="font-semibold text-gray-700">{viewingDevice.deviceType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Serial Number:</span>
                <span className="font-mono text-gray-700">{viewingDevice.serialNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Status:</span>
                <span>{getStatusBadge(viewingDevice.status)}</span>
              </div>
              {viewingDevice.decommissionReason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1">
                  <span className="font-bold text-red-900 block">Decommission Record:</span>
                  <p className="text-red-700">{viewingDevice.decommissionReason}</p>
                  {viewingDevice.decommissionedAt && (
                    <span className="text-[10px] text-red-500 block font-mono">
                      Retired: {new Date(viewingDevice.decommissionedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewingDevice(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
