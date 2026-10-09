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
  Wrench,
  RotateCcw,
  Clock,
  Calendar,
  History,
  Info,
  Building2,
  ShieldCheck,
  Check,
  Smartphone,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import { businessService } from '../../services/businessService';
import {
  Device,
  DeviceType,
  DeviceStatus,
  MaintenanceReason,
  DeviceMaintenanceRecord,
} from '../../types/organization';
import { getZambiaTodayString } from '../../utils/dateUtils';

const MAINTENANCE_REASONS: MaintenanceReason[] = [
  'Hardware Fault',
  'Software Issue',
  'Network or Connectivity Issue',
  'Battery or Power Issue',
  'Physical Damage',
  'Scheduled Maintenance',
  'Security Inspection',
  'Other',
];

export const AdminDeviceAllocationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DeviceStatus>('All');
  const [businessFilter, setBusinessFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state (default: 10 rows per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);

  // Maintenance Modals
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedDeviceForMaintenance, setSelectedDeviceForMaintenance] = useState<Device | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState<MaintenanceReason | string>('Hardware Fault');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false);

  // Return to Service Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedDeviceForReturn, setSelectedDeviceForReturn] = useState<Device | null>(null);
  const [returnResolutionNotes, setReturnResolutionNotes] = useState('');
  const [returnOption, setReturnOption] = useState<'AVAILABLE_DEPOT' | 'RESTORE_PREVIOUS'>('AVAILABLE_DEPOT');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Decommission Modal
  const [showDecommissionModal, setShowDecommissionModal] = useState(false);
  const [selectedDeviceForDecommission, setSelectedDeviceForDecommission] = useState<Device | null>(null);
  const [decommissionReason, setDecommissionReason] = useState('');
  const [isDecommissioning, setIsDecommissioning] = useState(false);

  // View Details & Maintenance History Modal
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);
  const [viewingDeviceHistory, setViewingDeviceHistory] = useState<DeviceMaintenanceRecord[]>([]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const hasAdminPermission =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'business_admin';

  const isProcessingAction =
    isSubmittingAllocation ||
    isSubmittingMaintenance ||
    isSubmittingReturn ||
    isDecommissioning;

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

  // Registered Businesses from businessService
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
  const totalDevices = devices.length;
  const allocatedCount = devices.filter(
    (d) => d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED' && d.status !== 'Decommissioned' && d.status !== 'Under Maintenance'
  ).length;
  const depotCount = devices.filter(
    (d) => (!d.allocatedBusinessId || d.allocatedBusinessId === 'UNALLOCATED') && d.status !== 'Decommissioned' && d.status !== 'Under Maintenance'
  ).length;
  const maintenanceCount = devices.filter((d) => d.status === 'Under Maintenance').length;
  const decommissionedCount = devices.filter((d) => d.status === 'Decommissioned').length;

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'All' || businessFilter !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setBusinessFilter('All');
    setCurrentPage(1);
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
        const mntReason = (d.maintenanceReason || '').toLowerCase();

        const match =
          devName.includes(q) ||
          devId.includes(q) ||
          devType.includes(q) ||
          serial.includes(q) ||
          bizName.includes(q) ||
          bizId.includes(q) ||
          mntReason.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [devices, statusFilter, businessFilter, searchQuery, registeredBusinesses]);

  // Derived Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / rowsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedDevices = useMemo(() => {
    return filteredDevices.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredDevices, startIndex, rowsPerPage]);
  const startItem = filteredDevices.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + rowsPerPage, filteredDevices.length);

  // Export handlers
  const prepareExportData = () => {
    return filteredDevices.map((d) => {
      const bizName = getBusinessName(d.allocatedBusinessId);
      const mntHistory = organizationService.getDeviceMaintenanceHistory(d.id);
      const latestMnt = mntHistory[0];
      return {
        'Device': d.deviceName,
        'Device ID': d.deviceId || d.id,
        'Device Type': d.deviceType,
        'Serial Number': d.serialNumber,
        'Allocated Business': bizName || 'Central Depot Inventory',
        'Business ID': d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED' ? d.allocatedBusinessId : '—',
        'Device Status': d.status,
        'Maintenance Status': d.status === 'Under Maintenance' ? 'In Progress' : (latestMnt ? 'Completed' : 'None'),
        'Maintenance Reason': (d.maintenanceReason === 'Hardware Fault' ? 'Device Fault' : d.maintenanceReason) || (latestMnt?.reason === 'Hardware Fault' ? 'Device Fault' : latestMnt?.reason) || '—',
        'Expected Return Date': d.expectedReturnDate || latestMnt?.expectedReturnDate || '—',
        'Resolution Notes': latestMnt?.resolutionNotes || '—',
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
      { wch: 28 }, // Device
      { wch: 18 }, // Device ID
      { wch: 20 }, // Device Type
      { wch: 22 }, // Serial Number
      { wch: 32 }, // Allocated Business
      { wch: 18 }, // Business ID
      { wch: 18 }, // Device Status
      { wch: 18 }, // Maintenance Status
      { wch: 24 }, // Maintenance Reason
      { wch: 20 }, // Expected Return Date
      { wch: 36 }, // Resolution Notes
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
    const user = currentUser || ({ uid: 'ADM-001', fullName: 'Sililo Lubinda (Admin)', role: 'super_admin' } as any);
    const res = organizationService.registerDevice(user, {
      deviceName: registerForm.deviceName.trim(),
      deviceType: registerForm.deviceType,
      serialNumber: registerForm.serialNumber.trim(),
      allocatedBusinessId: assignedBiz,
    });

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to enroll device.' });
      return;
    }

    loadData();
    const enrolledDevId = res.device?.deviceId || res.device?.id;
    setFeedback({
      type: 'success',
      message: `Device ${registerForm.deviceName} enrolled successfully with ID ${enrolledDevId}.`,
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
    setIsSubmittingAllocation(true);

    const bId = targetBusinessId === 'UNALLOCATED' ? null : targetBusinessId;
    const user = currentUser || ({ uid: 'ADM-001', fullName: 'Sililo Lubinda (Admin)', role: 'super_admin' } as any);

    const res = organizationService.allocateDeviceToBusiness(
      user,
      selectedDevice.id,
      bId,
      allocationReason.trim() || 'Device allocation updated by TellerBud Admin'
    );

    setIsSubmittingAllocation(false);

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

  // Open Mark Under Maintenance Modal
  const openMaintenanceModal = (dev: Device) => {
    setSelectedDeviceForMaintenance(dev);
    setMaintenanceReason('Hardware Fault');
    setMaintenanceNotes('');
    setExpectedReturnDate('');
    setShowMaintenanceModal(true);
  };

  const handleConfirmMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceForMaintenance) return;
    setFeedback(null);

    if (maintenanceReason === 'Other' && (!maintenanceNotes || maintenanceNotes.trim().length < 5)) {
      setFeedback({
        type: 'error',
        message: 'Maintenance notes (minimum 5 characters) are mandatory when reason is "Other".',
      });
      return;
    }

    setIsSubmittingMaintenance(true);
    const user = currentUser || ({ uid: 'ADM-001', fullName: 'Sililo Lubinda (Admin)', role: 'super_admin' } as any);

    const res = organizationService.markDeviceUnderMaintenance(user, {
      deviceId: selectedDeviceForMaintenance.id,
      reason: maintenanceReason,
      notes: maintenanceNotes.trim() || undefined,
      expectedReturnDate: expectedReturnDate.trim() || undefined,
    });

    setIsSubmittingMaintenance(false);

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to place device under maintenance.' });
      return;
    }

    loadData();
    setFeedback({
      type: 'success',
      message: `Device ${selectedDeviceForMaintenance.deviceName} (${selectedDeviceForMaintenance.deviceId || selectedDeviceForMaintenance.id}) is now Under Maintenance.`,
    });
    setShowMaintenanceModal(false);
  };

  // Open Return to Service Modal
  const openReturnModal = (dev: Device) => {
    setSelectedDeviceForReturn(dev);
    setReturnResolutionNotes('');
    const hasPreviousBiz = Boolean(dev.previousAllocationBeforeMaintenance?.businessId);
    setReturnOption(hasPreviousBiz ? 'RESTORE_PREVIOUS' : 'AVAILABLE_DEPOT');
    setShowReturnModal(true);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceForReturn) return;
    setFeedback(null);

    if (!returnResolutionNotes.trim()) {
      setFeedback({ type: 'error', message: 'Resolution or work completed notes are required.' });
      return;
    }

    setIsSubmittingReturn(true);
    const user = currentUser || ({ uid: 'ADM-001', fullName: 'Sililo Lubinda (Admin)', role: 'super_admin' } as any);

    const res = organizationService.returnDeviceToService(user, {
      deviceId: selectedDeviceForReturn.id,
      resolutionNotes: returnResolutionNotes.trim(),
      returnOption,
    });

    setIsSubmittingReturn(false);

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to return device to service.' });
      return;
    }

    loadData();
    setFeedback({
      type: 'success',
      message: `Device ${selectedDeviceForReturn.deviceName} returned to service (${returnOption === 'RESTORE_PREVIOUS' ? 'Restored Previous Allocation' : 'Central Depot Inventory'}).`,
    });
    setShowReturnModal(false);
  };

  // Open View Details & Maintenance History
  const openViewDetails = (dev: Device) => {
    setViewingDevice(dev);
    const history = organizationService.getDeviceMaintenanceHistory(dev.id);
    setViewingDeviceHistory(history);
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
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
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
      {/* 1. Breadcrumb and Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0D93AA]">
          <Cpu className="w-3.5 h-3.5" />
          <span>Platform Configuration</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">Global Device Repository</span>
        </div>

        {hasAdminPermission && (
          <button
            id="btn-register-device"
            type="button"
            onClick={openEnrollModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0B7C90] rounded-lg shadow-2xs transition-all cursor-pointer w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Enroll Device</span>
          </button>
        )}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full">
          {/* Global Enrolled Devices */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-gray-200/80 shadow-2xs h-[52px] sm:h-[54px]">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-600 truncate">
              Enrolled Devices
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-[#0D93AA] shrink-0">
              {totalDevices}
            </span>
          </div>

          {/* Allocated to Businesses */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-gray-200/80 shadow-2xs h-[52px] sm:h-[54px]">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-600 truncate">
              Allocated Active
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-emerald-700 shrink-0">
              {allocatedCount}
            </span>
          </div>

          {/* Central Depot Inventory */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-gray-200/80 shadow-2xs h-[52px] sm:h-[54px]">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-600 truncate">
              Depot Inventory
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-cyan-700 shrink-0">
              {depotCount}
            </span>
          </div>

          {/* Under Maintenance */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-amber-200/90 shadow-2xs h-[52px] sm:h-[54px] bg-amber-50/30">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-amber-800 truncate">
              Under Maintenance
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-amber-700 shrink-0">
              {maintenanceCount}
            </span>
          </div>

          {/* Decommissioned Devices */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 rounded-xl border bg-white border-gray-200/80 shadow-2xs h-[52px] sm:h-[54px]">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-600 truncate">
              Decommissioned
            </span>
            <span className="text-[18px] sm:text-[19px] font-bold font-mono tracking-tight leading-none text-rose-700 shrink-0">
              {decommissionedCount}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Filter & Action Row */}
      <section aria-label="Device Filters">
        <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 sm:p-3 shadow-xs">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
            {/* Search, Allocation Status, Device Status */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
              {/* Search Devices */}
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

              {/* Device Status (Including Under Maintenance) */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus-within:ring-1 focus-within:ring-[#0D93AA] focus-within:border-[#0D93AA] focus-within:bg-white transition-all h-9 shrink-0">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
                  Status:
                </span>
                <select
                  id="select-status-filter"
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
                <strong className="text-gray-800">{devices.length}</strong> devices
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
                title="Refresh device allocations"
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
                  title="Export device records"
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

      {/* 4. Global Device Table */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs overflow-hidden w-full mb-1 flex flex-col">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto pb-2.5">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs">
              <tr className="border-b border-gray-200 text-[10.5px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none text-left">
                {/* 1. Device */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[210px] sm:min-w-[230px]">
                  <span>DEVICE</span>
                </th>

                {/* 2. Type & Serial */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[160px] sm:min-w-[180px]">
                  <span>Type & Serial</span>
                </th>

                {/* 3. Allocated Business */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[210px] sm:min-w-[240px]">
                  <span>Allocated Business</span>
                </th>

                {/* 4. Device Status */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[140px] sm:min-w-[150px]">
                  <span>Device Status</span>
                </th>

                {/* 5. Actions */}
                <th className="py-3 px-3.5 text-left align-middle min-w-[160px] sm:min-w-[170px]">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 align-middle">
                    <Cpu size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600 text-sm">No devices found</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {hasActiveFilters
                        ? 'No devices match your current filter and search query.'
                        : 'No enrolled devices currently in the repository.'}
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
                paginatedDevices.map((d) => {
                  const bName = getBusinessName(d.allocatedBusinessId);
                  const devId = d.deviceId || d.id;

                  return (
                    <tr
                      key={`device-row-${d.id}`}
                      className="hover:bg-gray-50/70 transition-colors text-left align-middle"
                    >
                      {/* 1. Device: Device Name (Line 1) & Device ID (Line 2) */}
                      <td className="py-3 px-3.5 text-left align-middle">
                        <div className="flex flex-col items-start justify-center text-left">
                          <div
                            className="font-semibold text-gray-900 text-xs sm:text-[13px] whitespace-nowrap truncate max-w-[220px]"
                            title={d.deviceName}
                          >
                            {d.deviceName}
                          </div>
                          <div className="text-[10.5px] sm:text-[11px] font-mono text-gray-400 mt-0.5 whitespace-nowrap">
                            {devId}
                          </div>
                        </div>
                      </td>

                      {/* 2. Type & Serial: Device Type (Line 1) & Serial Number (Line 2) */}
                      <td className="py-3 px-3.5 text-left align-middle">
                        <div className="flex flex-col items-start justify-center text-left">
                          <div
                            className="font-semibold text-gray-800 text-xs whitespace-nowrap truncate max-w-[170px]"
                            title={d.deviceType}
                          >
                            {d.deviceType}
                          </div>
                          <div className="text-[10.5px] sm:text-[11px] font-mono text-gray-400 mt-0.5 whitespace-nowrap">
                            {d.serialNumber}
                          </div>
                        </div>
                      </td>

                      {/* 3. Allocated Business: Business Name (Line 1) & Business ID (Line 2) */}
                      <td className="py-3 px-3.5 text-left align-middle">
                        <div className="flex flex-col items-start justify-center text-left">
                          {bName && d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED' && d.status !== 'Decommissioned' ? (
                            <>
                              <div
                                className="font-semibold text-gray-900 text-xs sm:text-[12.5px] whitespace-nowrap truncate max-w-[230px]"
                                title={bName}
                              >
                                {bName}
                              </div>
                              <div className="text-[10.5px] sm:text-[11px] font-mono text-gray-400 mt-0.5 whitespace-nowrap">
                                {d.allocatedBusinessId}
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className="font-medium text-gray-600 text-xs whitespace-nowrap truncate max-w-[230px]"
                                title="Central Depot Inventory"
                              >
                                Central Depot Inventory
                              </div>
                              <div className="text-[10.5px] text-gray-400 mt-0.5 whitespace-nowrap italic">
                                Unallocated
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* 4. Device Status: Left-aligned status badge */}
                      <td className="py-3 px-3.5 text-left align-middle whitespace-nowrap">
                        <div className="flex items-center justify-start text-left">
                          {getStatusBadge(d.status)}
                        </div>
                      </td>

                      {/* 5. Actions: Left-aligned, single horizontal line, uniform 32x32 icon buttons */}
                      <td className="py-3 px-3.5 text-left align-middle whitespace-nowrap">
                        <div className="flex items-center justify-start gap-1.5 flex-nowrap text-left">
                          {/* Under Maintenance Device Actions: Return to Service, View, Decommission */}
                          {(d.status === 'Under Maintenance' || d.status === 'Inactive') && (
                            <>
                              {hasAdminPermission && (
                                <button
                                  type="button"
                                  id={`btn-return-service-${d.id}`}
                                  onClick={() => openReturnModal(d)}
                                  disabled={isProcessingAction}
                                  className="w-8 h-8 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Return to Service"
                                  aria-label="Return to Service"
                                >
                                  <RotateCcw size={15} />
                                </button>
                              )}

                              <button
                                type="button"
                                id={`btn-view-${d.id}`}
                                onClick={() => openViewDetails(d)}
                                disabled={isProcessingAction}
                                className="w-8 h-8 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="View Device"
                                aria-label="View Device"
                              >
                                <Eye size={15} />
                              </button>

                              {hasAdminPermission && (
                                <button
                                  type="button"
                                  id={`btn-decommission-${d.id}`}
                                  onClick={() => openDecommissionModal(d)}
                                  disabled={isProcessingAction}
                                  className="w-8 h-8 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Decommission Device"
                                  aria-label="Decommission Device"
                                >
                                  <XCircle size={15} />
                                </button>
                              )}
                            </>
                          )}

                          {/* Assigned or Allocated Device Actions: Reallocate, Mark Under Maintenance, View, Decommission */}
                          {d.status === 'Assigned' && (
                            <>
                              {hasAdminPermission && (
                                <button
                                  type="button"
                                  id={`btn-reallocate-${d.id}`}
                                  onClick={() => openAllocate(d)}
                                  disabled={isProcessingAction}
                                  className="w-8 h-8 rounded-lg text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA]/20 border border-[#0D93AA]/25 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Reallocate Device"
                                  aria-label="Reallocate Device"
                                >
                                  <ArrowRightLeft size={15} />
                                </button>
                              )}

                              {hasAdminPermission && (
                                <button
                                  type="button"
                                  id={`btn-mark-maintenance-${d.id}`}
                                  onClick={() => openMaintenanceModal(d)}
                                  disabled={isProcessingAction}
                                  className="w-8 h-8 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Mark Under Maintenance"
                                  aria-label="Mark Under Maintenance"
                                >
                                  <Wrench size={15} />
                                </button>
                              )}

                              <button
                                type="button"
                                id={`btn-view-${d.id}`}
                                onClick={() => openViewDetails(d)}
                                disabled={isProcessingAction}
                                className="w-8 h-8 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="View Device"
                                aria-label="View Device"
                              >
                                <Eye size={15} />
                              </button>

                              {hasAdminPermission && (
                                <button
                                  type="button"
                                  id={`btn-decommission-${d.id}`}
                                  onClick={() => openDecommissionModal(d)}
                                  disabled={isProcessingAction}
                                  className="w-8 h-8 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Decommission Device"
                                  aria-label="Decommission Device"
                                >
                                  <XCircle size={15} />
                                </button>
                              )}
                            </>
                          )}

                          {/* Available or Unmapped Device Actions: Allocate, Mark Under Maintenance, View, Decommission */}
                          {(d.status === 'Available' || d.status === 'Unmapped') && (
                            <>
                              {hasAdminPermission && (
                                <button
                                  type="button"
                                  id={`btn-allocate-${d.id}`}
                                  onClick={() => openAllocate(d)}
                                  disabled={isProcessingAction}
                                  className="w-8 h-8 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Allocate Device"
                                  aria-label="Allocate Device"
                                >
                                  <Plus size={15} />
                                </button>
                              )}

                              {hasAdminPermission && (
                                <button
                                  type="button"
                                  id={`btn-mark-maintenance-${d.id}`}
                                  onClick={() => openMaintenanceModal(d)}
                                  disabled={isProcessingAction}
                                  className="w-8 h-8 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Mark Under Maintenance"
                                  aria-label="Mark Under Maintenance"
                                >
                                  <Wrench size={15} />
                                </button>
                              )}

                              <button
                                type="button"
                                id={`btn-view-${d.id}`}
                                onClick={() => openViewDetails(d)}
                                disabled={isProcessingAction}
                                className="w-8 h-8 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="View Device"
                                aria-label="View Device"
                              >
                                <Eye size={15} />
                              </button>

                              {hasAdminPermission && (
                                <button
                                  type="button"
                                  id={`btn-decommission-${d.id}`}
                                  onClick={() => openDecommissionModal(d)}
                                  disabled={isProcessingAction}
                                  className="w-8 h-8 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Decommission Device"
                                  aria-label="Decommission Device"
                                >
                                  <XCircle size={15} />
                                </button>
                              )}
                            </>
                          )}

                          {/* Decommissioned Device Actions: View Device only */}
                          {d.status === 'Decommissioned' && (
                            <button
                              type="button"
                              id={`btn-view-${d.id}`}
                              onClick={() => openViewDetails(d)}
                              disabled={isProcessingAction}
                              className="w-8 h-8 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
                              title="View Device"
                              aria-label="View Device"
                            >
                              <Eye size={15} />
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

        {/* Pagination Footer - Always Visible */}
        <div
          id="device-allocation-pagination"
          className="shrink-0 px-4 py-3 bg-slate-50/80 border-t border-gray-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        >
          {/* Left Side: Summary text & Rows per page selector */}
          <div className="flex flex-wrap items-center gap-3 text-slate-700">
            <span>
              Showing <strong className="font-semibold text-slate-900">{startItem}</strong> to{' '}
              <strong className="font-semibold text-slate-900">{endItem}</strong> of{' '}
              <strong className="font-semibold text-slate-900">{filteredDevices.length}</strong> devices
            </span>

            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-slate-300">|</span>
              <label htmlFor="select-rows-per-page" className="text-slate-600 font-medium">
                Rows per page:
              </label>
              <select
                id="select-rows-per-page"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 px-2 py-0.5 text-xs bg-white border border-gray-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA] cursor-pointer"
                aria-label="Rows per page"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right Side: Page info, Previous, Page-number buttons, Next */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium mr-1">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1" role="navigation" aria-label="Device pagination">
              {/* Previous button */}
              <button
                type="button"
                id="btn-pagination-prev"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                aria-label="Previous page"
                title="Previous page"
                className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-gray-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
              >
                Previous
              </button>

              {/* Page-number buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  id={`btn-pagination-page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={safeCurrentPage === pageNum ? 'page' : undefined}
                  className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    safeCurrentPage === pageNum
                      ? 'bg-[#0D93AA] text-white shadow-2xs'
                      : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next button */}
              <button
                type="button"
                id="btn-pagination-next"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                aria-label="Next page"
                title="Next page"
                className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-gray-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL 1: MARK UNDER MAINTENANCE */}
      {/* ========================================== */}
      {showMaintenanceModal && selectedDeviceForMaintenance && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  <Wrench size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Mark Device Under Maintenance</h3>
                  <p className="text-xs text-gray-500">
                    Place device into repair/maintenance workflow.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Device Summary Card */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-gray-900 text-sm block">
                    {selectedDeviceForMaintenance.deviceName}
                  </span>
                  <span className="font-mono text-[11px] text-gray-500">
                    {selectedDeviceForMaintenance.deviceId || selectedDeviceForMaintenance.id} • {selectedDeviceForMaintenance.deviceType}
                  </span>
                </div>
                <div>{getStatusBadge(selectedDeviceForMaintenance.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60 text-[11.5px]">
                <div>
                  <span className="text-gray-500 block text-[10.5px]">Serial Number:</span>
                  <span className="font-mono font-semibold text-gray-800">
                    {selectedDeviceForMaintenance.serialNumber}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10.5px]">Allocated Business:</span>
                  <span className="font-semibold text-gray-800 truncate block">
                    {getBusinessName(selectedDeviceForMaintenance.allocatedBusinessId) || 'Central Depot Inventory'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmMaintenance} className="space-y-3.5 text-xs">
              {/* Maintenance Reason */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Maintenance Reason <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-maintenance-reason"
                  required
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer bg-white"
                >
                  {MAINTENANCE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r === 'Hardware Fault' ? 'Device Fault' : r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Maintenance Notes */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-700 font-semibold">
                    Maintenance Notes {maintenanceReason === 'Other' && <span className="text-red-500">* (Mandatory for Other)</span>}
                  </label>
                  <span className="text-[10.5px] text-gray-400">
                    {maintenanceReason === 'Other' ? 'Min 5 chars' : 'Optional'}
                  </span>
                </div>
                <textarea
                  id="textarea-maintenance-notes"
                  rows={2}
                  required={maintenanceReason === 'Other'}
                  placeholder="Describe the issue, defect symptoms, diagnostic observations, or service request details..."
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none"
                />
              </div>

              {/* Expected Return Date & Auto Start Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Expected Return Date <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="input-expected-return-date"
                    type="date"
                    min={todayStr}
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Maintenance Start Time
                  </label>
                  <div className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-mono text-[11.5px] flex items-center gap-1.5 select-none">
                    <Clock size={13} className="text-gray-400" />
                    <span>Now ({todayStr})</span>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-amber-900">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11.5px] leading-relaxed">
                  <strong>Notice:</strong> This device will become unavailable for operational use until it is returned to service. Active station mappings will be safely preserved for restoration.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  disabled={isSubmittingMaintenance}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-maintenance"
                  disabled={isSubmittingMaintenance}
                  className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold shadow-2xs cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  <Wrench size={13} />
                  <span>{isSubmittingMaintenance ? 'Updating...' : 'Confirm Maintenance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: RETURN TO SERVICE */}
      {/* ========================================== */}
      {showReturnModal && selectedDeviceForReturn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Return Device to Service</h3>
                  <p className="text-xs text-gray-500">
                    Complete maintenance record and restore device availability.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Maintenance Info */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-gray-900 text-sm block">
                    {selectedDeviceForReturn.deviceName}
                  </span>
                  <span className="font-mono text-[11px] text-gray-500">
                    {selectedDeviceForReturn.deviceId || selectedDeviceForReturn.id} • {selectedDeviceForReturn.serialNumber}
                  </span>
                </div>
                <div>{getStatusBadge(selectedDeviceForReturn.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60 text-[11.5px]">
                <div>
                  <span className="text-gray-500 block text-[10.5px]">Maintenance Reason:</span>
                  <span className="font-semibold text-amber-800">
                    {selectedDeviceForReturn.maintenanceReason === 'Hardware Fault'
                      ? 'Device Fault'
                      : selectedDeviceForReturn.maintenanceReason || 'Device / Power Diagnostics'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10.5px]">Maintenance Started:</span>
                  <span className="text-gray-700">
                    {selectedDeviceForReturn.maintenanceStartDate
                      ? new Date(selectedDeviceForReturn.maintenanceStartDate).toLocaleDateString()
                      : 'Active'}
                  </span>
                </div>
              </div>

              {selectedDeviceForReturn.maintenanceNotes && (
                <div className="text-[11px] text-gray-600 italic bg-white p-2 rounded border border-gray-200/60">
                  &ldquo;{selectedDeviceForReturn.maintenanceNotes}&rdquo;
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-3.5 text-xs">
              {/* Resolution Notes */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Resolution or Work Completed <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="textarea-return-resolution"
                  rows={2}
                  required
                  placeholder="e.g. Replaced internal battery, cleaned thermal printer head and verified successful diagnostic test transactions..."
                  value={returnResolutionNotes}
                  onChange={(e) => setReturnResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Return Destination Options */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  Resulting Device Destination & Status <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      returnOption === 'RESTORE_PREVIOUS'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    } ${
                      !selectedDeviceForReturn.previousAllocationBeforeMaintenance?.businessId
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnOption"
                      value="RESTORE_PREVIOUS"
                      checked={returnOption === 'RESTORE_PREVIOUS'}
                      disabled={!selectedDeviceForReturn.previousAllocationBeforeMaintenance?.businessId}
                      onChange={() => setReturnOption('RESTORE_PREVIOUS')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <span>Restore Previous Allocation</span>
                        <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Assigned
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Restore to:{' '}
                        <strong>
                          {selectedDeviceForReturn.previousAllocationBeforeMaintenance?.businessName ||
                            selectedDeviceForReturn.previousAllocationBeforeMaintenance?.businessId ||
                            'Assigned Business'}
                        </strong>
                        {selectedDeviceForReturn.previousAllocationBeforeMaintenance?.storeName &&
                          ` (${selectedDeviceForReturn.previousAllocationBeforeMaintenance.storeName} > ${
                            selectedDeviceForReturn.previousAllocationBeforeMaintenance.boothName || 'Booth'
                          })`}
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      returnOption === 'AVAILABLE_DEPOT'
                        ? 'border-cyan-500 bg-cyan-50/50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnOption"
                      value="AVAILABLE_DEPOT"
                      checked={returnOption === 'AVAILABLE_DEPOT'}
                      onChange={() => setReturnOption('AVAILABLE_DEPOT')}
                      className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <span>Available / Central Depot Inventory</span>
                        <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-bold">
                          Available
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Return device to unallocated central platform pool ready for future assignment.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  disabled={isSubmittingReturn}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-return"
                  disabled={isSubmittingReturn || !returnResolutionNotes.trim()}
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-semibold shadow-2xs cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  <Check size={13} />
                  <span>{isSubmittingReturn ? 'Completing...' : 'Confirm Return to Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: VIEW DETAILS & MAINTENANCE HISTORY */}
      {/* ========================================== */}
      {viewingDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Cpu className="text-[#0D93AA]" size={20} />
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Device & Maintenance Audit</h3>
                  <span className="font-mono text-xs text-gray-500">
                    {viewingDevice.deviceId || viewingDevice.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDevice(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable details and history */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Device Overview Card */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{viewingDevice.deviceName}</h4>
                    <span className="text-gray-500">{viewingDevice.deviceType}</span>
                  </div>
                  <div>{getStatusBadge(viewingDevice.status)}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-200/60 text-[11.5px]">
                  <div>
                    <span className="text-gray-500 block text-[10.5px]">Serial Number:</span>
                    <span className="font-mono font-bold text-gray-800">{viewingDevice.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10.5px]">Allocated Business:</span>
                    <span className="font-semibold text-gray-800 truncate block">
                      {getBusinessName(viewingDevice.allocatedBusinessId) || 'Central Depot Inventory'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10.5px]">Registered:</span>
                    <span className="text-gray-700">
                      {new Date(viewingDevice.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Maintenance Banner if under maintenance */}
              {viewingDevice.status === 'Under Maintenance' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Wrench size={14} className="text-amber-700" />
                    <span>Current Active Maintenance In Progress</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11.5px] text-amber-900">
                    <div>
                      <span className="text-amber-700/80 block text-[10.5px]">Reason:</span>
                      <strong>
                        {viewingDevice.maintenanceReason === 'Hardware Fault'
                          ? 'Device Fault'
                          : viewingDevice.maintenanceReason || 'Device / Diagnostic Work'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-amber-700/80 block text-[10.5px]">Expected Return:</span>
                      <strong>{viewingDevice.expectedReturnDate || 'Not specified'}</strong>
                    </div>
                  </div>
                  {viewingDevice.maintenanceNotes && (
                    <p className="text-[11px] text-amber-900/90 italic bg-amber-100/60 p-2 rounded">
                      &ldquo;{viewingDevice.maintenanceNotes}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Decommission Notice if retired */}
              {viewingDevice.status === 'Decommissioned' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-red-900 font-bold text-xs">
                    <XCircle size={14} className="text-red-600" />
                    <span>Device Permanently Decommissioned</span>
                  </div>
                  <p className="text-[11.5px] text-red-800">{viewingDevice.decommissionReason}</p>
                  {viewingDevice.decommissionedAt && (
                    <span className="text-[10.5px] text-red-600 font-mono block">
                      Retired: {new Date(viewingDevice.decommissionedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Maintenance History Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs">
                    <History size={14} className="text-[#0D93AA]" />
                    <span>Maintenance & Repair History</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {viewingDeviceHistory.length} records
                  </span>
                </div>

                {viewingDeviceHistory.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 border border-gray-200 rounded-xl text-gray-400">
                    <Wrench size={20} className="mx-auto mb-1 text-gray-300" />
                    <p className="font-semibold text-gray-600 text-xs">No maintenance records</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      This unit has not undergone any recorded maintenance events.
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {viewingDeviceHistory.map((m) => (
                      <div key={m.id} className="p-3 bg-white hover:bg-gray-50/70 transition-colors space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-800 text-[11px]">{m.id}</span>
                            <span
                              className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                m.maintenanceStatus === 'In Progress'
                                  ? 'bg-amber-100 text-amber-800'
                                  : m.maintenanceStatus === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {m.maintenanceStatus}
                            </span>
                          </div>
                          <span className="text-[10.5px] text-gray-500">
                            {new Date(m.startDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-gray-400 block text-[10px]">Reason:</span>
                            <span className="font-semibold text-gray-800">
                              {m.reason === 'Hardware Fault' ? 'Device Fault' : m.reason}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Performed By:</span>
                            <span className="text-gray-700">{m.performedBy}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Completion:</span>
                            <span className="text-gray-700">
                              {m.completionDate ? new Date(m.completionDate).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </div>

                        {m.notes && (
                          <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                            <strong className="text-gray-700">Notes: </strong>
                            {m.notes}
                          </div>
                        )}

                        {m.resolutionNotes && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-100">
                            <strong className="text-emerald-900">Resolution: </strong>
                            {m.resolutionNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 shrink-0">
              <div>
                {viewingDevice.status === 'Under Maintenance' && hasAdminPermission && (
                  <button
                    type="button"
                    onClick={() => {
                      const dev = viewingDevice;
                      setViewingDevice(null);
                      openReturnModal(dev);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RotateCcw size={12} />
                    <span>Return to Service</span>
                  </button>
                )}
              </div>

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

      {/* ========================================== */}
      {/* MODAL: ENROLL NEW DEVICE */}
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
                <h3 className="font-bold text-gray-900 text-base">Enroll Device</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assign official system identifier and catalog device.
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

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Device Model Name <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Device Type <span className="text-red-500">*</span>
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
                  Enroll Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ALLOCATE / REALLOCATE DEVICE */}
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
                {selectedDevice.status === 'Assigned' ? 'Reallocate Device' : 'Allocate Device'}
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
      {/* MODAL: DECOMMISSION DEVICE */}
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
                <h3 className="font-bold text-gray-900 text-base">Decommission Device?</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Are you sure you want to permanently decommission <strong className="text-gray-900">{selectedDeviceForDecommission.deviceName}</strong>? This device will be removed from active allocation and cannot be assigned to a business again.
                </p>
              </div>
            </div>

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
                  placeholder="e.g. Touchscreen failure, battery swelling, device returned for warranty repair..."
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
                  {isDecommissioning ? 'Decommissioning...' : 'Decommission Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeviceAllocationPage;
