import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Smartphone,
  Search,
  Filter,
  ArrowRightLeft,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  History,
  Store,
  Layers,
  Users,
  QrCode,
  Wifi,
  BatteryCharging,
  Cpu,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import {
  DeviceWithDetails,
  StoreWithStats,
  BoothWithDetails,
  OrgUser,
  DeviceStatus,
  DeviceType,
} from '../../types/organization';

export const DeviceManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [booths, setBooths] = useState<BoothWithDetails[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);

  // Parse initial status from search params if provided
  const parseStatusParam = (param: string | null): 'All' | DeviceStatus => {
    if (!param) return 'All';
    const lower = param.toLowerCase();
    if (lower.includes('avail') || lower.includes('unmap')) return 'Available';
    if (lower.includes('assign')) return 'Assigned';
    return 'All';
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | DeviceStatus>(() =>
    parseStatusParam(searchParams.get('status'))
  );
  const [storeFilter, setStoreFilter] = useState<string>('All');
  const [boothFilter, setBoothFilter] = useState<string>('All');

  // Sync if searchParams changes
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(parseStatusParam(status));
    }
  }, [searchParams]);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetDevice, setTargetDevice] = useState<DeviceWithDetails | null>(null);
  const [assignForm, setAssignForm] = useState({
    storeId: '',
    boothId: '',
    assignedStaffUserId: '',
    reason: '',
  });

  const [showUnmapModal, setShowUnmapModal] = useState(false);
  const [isUnmapping, setIsUnmapping] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    if (!currentUser) return;
    setDevices(organizationService.getDevices(currentUser).filter((d) => d.status !== 'Decommissioned'));
    setStores(organizationService.getStores(currentUser));
    setBooths(organizationService.getBooths(currentUser));
    setUsers(organizationService.getUsers(currentUser));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = organizationService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Operational Devices (strictly excludes decommissioned)
  const operationalDevices = devices.filter((d) => d.status !== 'Decommissioned');

  // KPIs: Total Devices = Stationed & Active + Available / Unmapped (5 + 3 = 8)
  const assignedDevices = operationalDevices.filter((d) => d.status === 'Assigned' && !!d.boothId).length;
  const availableDevices = operationalDevices.filter(
    (d) => d.status === 'Available' || d.status === 'Unmapped' || !d.boothId
  ).length;
  const totalDevices = assignedDevices + availableDevices;

  // Filtered
  const filteredDevices = operationalDevices.filter((d) => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Available' || statusFilter === 'Unmapped') {
        if (d.status !== 'Available' && d.status !== 'Unmapped' && d.boothId) {
          return false;
        }
      } else if (d.status !== statusFilter) {
        return false;
      }
    }
    if (storeFilter !== 'All' && d.storeId !== storeFilter) return false;
    if (boothFilter !== 'All' && d.boothId !== boothFilter) return false;
    return true;
  });

  const availableBoothsForFilter =
    storeFilter !== 'All'
      ? booths.filter((b) => b.storeId === storeFilter && b.status === 'Active')
      : booths.filter((b) => b.status === 'Active');

  // Assign or Move Handlers
  const openAssignOrMove = (device: DeviceWithDetails) => {
    setTargetDevice(device);
    setAssignForm({
      storeId: device.storeId || stores[0]?.id || '',
      boothId: device.boothId || '',
      assignedStaffUserId: device.assignedStaffId || '',
      reason: '',
    });
    setShowAssignModal(true);
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !targetDevice) return;
    setFeedback(null);

    const isMove = !!targetDevice.boothId;

    let res;
    if (isMove) {
      res = organizationService.moveDevice(currentUser, {
        deviceId: targetDevice.id,
        newStoreId: assignForm.storeId,
        newBoothId: assignForm.boothId,
        reason: assignForm.reason || 'Relocated to branch counter booth',
      });
    } else {
      res = organizationService.assignDevice(currentUser, {
        deviceId: targetDevice.id,
        storeId: assignForm.storeId,
        boothId: assignForm.boothId,
        staffUserId: assignForm.assignedStaffUserId || '',
        reason: assignForm.reason || 'Device mapped to service booth',
      });
    }

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to map device.' });
      return;
    }

    loadData();
    setFeedback({
      type: 'success',
      message: `Device ${targetDevice.deviceName} (${targetDevice.serialNumber}) successfully mapped.`,
    });
    setShowAssignModal(false);
  };

  const openUnmap = (device: DeviceWithDetails) => {
    if (!device.boothId || device.status !== 'Assigned') {
      setFeedback({ type: 'error', message: 'This device is already unmapped.' });
      return;
    }
    setTargetDevice(device);
    setShowUnmapModal(true);
  };

  const handleConfirmUnmap = () => {
    if (!currentUser || !targetDevice) return;
    if (!targetDevice.boothId || targetDevice.status !== 'Assigned') {
      setShowUnmapModal(false);
      setFeedback({ type: 'error', message: 'This device is already unmapped.' });
      return;
    }

    setIsUnmapping(true);
    setFeedback(null);

    try {
      const res = organizationService.unmapDevice(
        currentUser,
        targetDevice.id,
        'Device unmapped by Business Owner'
      );

      if (!res.success) {
        setFeedback({ type: 'error', message: 'Unable to unmap the device. Please try again.' });
        setIsUnmapping(false);
        return;
      }

      loadData();
      setFeedback({
        type: 'success',
        message: 'Device unmapped successfully and is now available for reassignment.',
      });
      setShowUnmapModal(false);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Unable to unmap the device. Please try again.' });
    } finally {
      setIsUnmapping(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-3.5 max-w-[1720px] w-full mx-auto">
      {/* 1. FROZEN TOP SECTION: Breadcrumb, Feedback, KPI Cards, Filter Bar */}
      <div className="shrink-0 flex flex-col gap-3 sm:gap-3.5">
        {/* Page Header / Breadcrumb Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Organization Management</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Devices & Terminals</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs font-medium self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tenant Device Pool (BIZ-LUS-001)</span>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`flex items-start justify-between p-4 rounded-xl border text-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <p className="font-medium">{feedback.message}</p>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Cards: 3 Equal-Width Columns (Total Devices, Stationed & Active, Available / Unmapped) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Devices */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 min-h-[66px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title="Total Devices">
                Total Devices
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 shrink-0">
              {totalDevices}
            </div>
          </div>

          {/* Stationed & Active */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 min-h-[66px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100/60 text-teal-600 flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title="Stationed & Active">
                Stationed & Active
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-teal-700 shrink-0">
              {assignedDevices}
            </div>
          </div>

          {/* Available / Unmapped */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 min-h-[66px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100/60 text-cyan-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title="Available / Unmapped">
                Available / Unmapped
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-cyan-700 shrink-0">
              {availableDevices}
            </div>
          </div>
        </div>

        {/* Filter Bar: Single Horizontal Line (All Statuses | All Stores | All Booths) */}
        <div className="bg-white rounded-xl border border-slate-200/90 px-3.5 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* 1. All Statuses */}
            <select
              id="select-devicestatus-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[34px] min-w-[130px] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="Available">Available / Unmapped</option>
            </select>

            {/* 2. All Stores */}
            <select
              id="select-devicestore-filter"
              value={storeFilter}
              onChange={(e) => {
                setStoreFilter(e.target.value);
                setBoothFilter('All');
              }}
              className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[34px] min-w-[150px] cursor-pointer"
            >
              <option value="All">All Stores</option>
              {stores
                .filter((s) => s.status === 'Active')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.storeName} ({s.storeNumber})
                  </option>
                ))}
            </select>

            {/* 3. All Booths */}
            <select
              id="select-devicebooth-filter"
              value={boothFilter}
              onChange={(e) => setBoothFilter(e.target.value)}
              className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[34px] min-w-[150px] cursor-pointer"
            >
              <option value="All">All Booths</option>
              {availableBoothsForFilter.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.boothName} ({b.boothNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-500 shrink-0 text-right whitespace-nowrap self-end sm:self-auto">
            Showing <span className="text-slate-800 font-bold">{filteredDevices.length}</span> of <span className="text-slate-800 font-bold">{operationalDevices.length}</span> devices
          </div>
        </div>
      </div>

      {/* 2. DEVICES TABLE CARD (Flex-1 min-h-0 with sticky header & scrollable records) */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
        <div
          tabIndex={0}
          role="region"
          aria-label="Device Management Table"
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-auto device-table-scroll focus:outline-none"
        >
          <table className="w-full text-left text-xs text-slate-600 table-fixed min-w-[960px] border-collapse">
            <colgroup>
              <col style={{ width: '19%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%', minWidth: '150px' }} />
              <col style={{ width: '17%', minWidth: '170px' }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#F9FAFB] shadow-[0_1px_0_0_#E2E8F0]">
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] bg-[#F9FAFB] h-[44px]">
                <th scope="col" style={{ width: '19%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Device</th>
                <th scope="col" style={{ width: '14%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Type & Serial</th>
                <th scope="col" style={{ width: '22%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Current Station</th>
                <th scope="col" style={{ width: '14%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Assigned Operator</th>
                <th scope="col" style={{ width: '14%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3.5 pr-4 font-semibold whitespace-nowrap text-left align-middle min-w-[150px]">Status</th>
                <th scope="col" style={{ width: '17%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 pl-4 pr-3.5 font-semibold whitespace-nowrap text-left align-middle min-w-[170px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No devices found for the selected filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting or adjusting your filter selection.</p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* 1. Device (19%) */}
                    <td className="py-3 px-3.5 align-middle text-left">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-slate-900 text-xs truncate" title={d.deviceName}>
                          {d.deviceName}
                        </div>
                        <span className="text-slate-400 font-mono text-[11px] block whitespace-nowrap">
                          {d.id}
                        </span>
                      </div>
                    </td>

                    {/* 2. Type & Serial (14%) */}
                    <td className="py-3 px-3.5 align-middle text-left">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-medium text-slate-800 text-xs truncate" title={d.deviceType}>
                          {d.deviceType}
                        </div>
                        <span className="text-slate-400 font-mono text-[11px] block whitespace-nowrap">
                          {d.serialNumber}
                        </span>
                      </div>
                    </td>

                    {/* 3. Current Station (22%) */}
                    <td className="py-3 px-3.5 align-middle text-left">
                      {d.storeName && d.boothName ? (
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-900 text-xs truncate" title={d.boothName}>
                            {d.boothName}
                          </div>
                          <div className="text-slate-400 text-[11px] truncate" title={d.storeName}>
                            {d.storeName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Not Assigned</span>
                      )}
                    </td>

                    {/* 4. Assigned Operator (14%) */}
                    <td className="py-3 px-3.5 align-middle text-left">
                      {d.assignedStaffName ? (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium text-[11px] truncate max-w-full" title={d.assignedStaffName}>
                          {d.assignedStaffName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </td>

                    {/* 5. Status (14%, min-w 150px) */}
                    <td className="py-3 px-3.5 pr-4 align-middle text-left whitespace-nowrap min-w-[150px]">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap border ${
                          d.status === 'Assigned'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-cyan-100 text-cyan-800 border-cyan-200'
                        }`}
                      >
                        {d.status === 'Assigned' ? 'Assigned' : 'Available / Unmapped'}
                      </span>
                    </td>

                    {/* 6. Actions (17%, min-w 170px) */}
                    <td className="py-3 pl-4 pr-3.5 align-middle text-left whitespace-nowrap min-w-[170px]">
                      <div className="flex items-center justify-start gap-2 flex-nowrap">
                        {d.status === 'Assigned' && d.boothId ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openAssignOrMove(d)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
                              title="Relocate device to another station"
                            >
                              Relocate
                            </button>

                            <button
                              type="button"
                              onClick={() => openUnmap(d)}
                              className="px-2 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
                              title="Unmap device from current station"
                            >
                              Unmap
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAssignOrMove(d)}
                            className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
                            title="Assign device to a station"
                          >
                            Assign Device
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: UNMAP DEVICE CONFIRMATION */}
      {/* ========================================== */}
      {showUnmapModal && targetDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-lg">Unmap Device</h3>
                <p className="text-xs text-slate-500 truncate">
                  {targetDevice.deviceName} ({targetDevice.serialNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUnmapModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to unmap <strong className="text-slate-900 font-semibold">{targetDevice.deviceName}</strong> from its current booth and assigned operator? The device will remain available for reassignment.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUnmapModal(false)}
                disabled={isUnmapping}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnmap}
                disabled={isUnmapping}
                className="px-4 py-2 text-xs text-white bg-[#0D93AA] hover:bg-[#0b7e92] disabled:opacity-50 rounded-lg font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                {isUnmapping ? 'Unmapping...' : 'Confirm Unmap'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: MAP / RELOCATE DEVICE */}
      {/* ========================================== */}
      {showAssignModal && targetDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {targetDevice.boothId ? 'Relocate Device' : 'Assign Device to Station'}
                </h3>
                <p className="text-xs text-slate-500">
                  {targetDevice.deviceName} ({targetDevice.serialNumber})
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Branch Store <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignForm.storeId}
                  onChange={(e) => {
                    const nextStoreBooths = booths.filter(
                      (b) => b.storeId === e.target.value && b.status === 'Active'
                    );
                    setAssignForm({
                      ...assignForm,
                      storeId: e.target.value,
                      boothId: nextStoreBooths[0]?.id || '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {stores
                    .filter((s) => s.status === 'Active')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.storeName} ({s.storeNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Service Counter Booth <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignForm.boothId}
                  onChange={(e) => setAssignForm({ ...assignForm, boothId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select booth --</option>
                  {booths
                    .filter((b) => b.storeId === assignForm.storeId && b.status === 'Active')
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.boothName} ({b.boothNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assigned Operator Staff (Optional)
                </label>
                <select
                  value={assignForm.assignedStaffUserId}
                  onChange={(e) => setAssignForm({ ...assignForm, assignedStaffUserId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- No specific staff pinned --</option>
                  {users
                    .filter((u) => u.status === 'Active' && u.role === 'agent')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.username})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Deployment Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Assigned to new cash-out till, replaced damaged POS..."
                  value={assignForm.reason}
                  onChange={(e) => setAssignForm({ ...assignForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!assignForm.storeId || !assignForm.boothId}
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-semibold shadow-xs"
                >
                  Confirm Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
