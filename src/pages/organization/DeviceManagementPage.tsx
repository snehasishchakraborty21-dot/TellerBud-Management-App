import React, { useState, useEffect } from 'react';
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
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [booths, setBooths] = useState<BoothWithDetails[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | DeviceStatus>('All');
  const [storeFilter, setStoreFilter] = useState<string>('All');
  const [boothFilter, setBoothFilter] = useState<string>('All');

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

  const [showDecommissionModal, setShowDecommissionModal] = useState(false);
  const [decommissionReason, setDecommissionReason] = useState('');

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    if (!currentUser) return;
    setDevices(organizationService.getDevices(currentUser));
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

  // KPIs
  const totalDevices = devices.length;
  const assignedDevices = devices.filter((d) => d.status === 'Assigned' && !!d.boothId).length;
  const availableDevices = devices.filter(
    (d) => d.status === 'Available' || d.status === 'Unmapped' || (!d.boothId && d.status !== 'Decommissioned')
  ).length;
  const decommissionedDevices = devices.filter((d) => d.status === 'Decommissioned').length;

  // Filtered
  const filteredDevices = devices.filter((d) => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Available' || statusFilter === 'Unmapped') {
        if (d.status !== 'Available' && d.status !== 'Unmapped' && (d.boothId || d.status === 'Decommissioned')) {
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

  const openDecommission = (device: DeviceWithDetails) => {
    setTargetDevice(device);
    setDecommissionReason('');
    setShowDecommissionModal(true);
  };

  const handleConfirmDecommission = () => {
    if (!currentUser || !targetDevice) return;
    setFeedback(null);

    const res = organizationService.decommissionDevice(
      currentUser,
      targetDevice.id,
      decommissionReason
    );

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to decommission device.' });
      return;
    }

    loadData();
    setFeedback({
      type: 'success',
      message: `Device ${targetDevice.deviceName} has been decommissioned and recorded in the audit trail.`,
    });
    setShowDecommissionModal(false);
  };

  return (
    <div className="space-y-3.5 pb-12">
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

      {/* KPI Cards: Single Horizontal Line (Icon, Label, Value) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

        {/* Decommissioned */}
        <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 min-h-[66px] h-[68px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-500 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title="Decommissioned">
              Decommissioned
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-700 shrink-0">
            {decommissionedDevices}
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
            className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[34px] min-w-[130px]"
          >
            <option value="All">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Available">Available / Unmapped</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>

          {/* 2. All Stores */}
          <select
            id="select-devicestore-filter"
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setBoothFilter('All');
            }}
            className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[34px] min-w-[150px]"
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
            className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[34px] min-w-[150px]"
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
          Showing <span className="text-slate-800 font-bold">{filteredDevices.length}</span> of <span className="text-slate-800 font-bold">{devices.length}</span> devices
        </div>
      </div>

      {/* Devices Table Card */}
      <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 table-fixed min-w-[850px]">
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '18%' }} />
            </colgroup>
            <thead className="bg-[#F9FAFB] text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px] h-[44px]">
              <tr>
                <th scope="col" style={{ width: '20%' }} className="py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Device</th>
                <th scope="col" style={{ width: '15%' }} className="py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Type & Serial</th>
                <th scope="col" style={{ width: '22%' }} className="py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Current Station</th>
                <th scope="col" style={{ width: '15%' }} className="py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Assigned Operator</th>
                <th scope="col" style={{ width: '10%' }} className="py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Status</th>
                <th scope="col" style={{ width: '18%' }} className="py-3 px-3.5 font-semibold whitespace-nowrap text-left align-middle">Actions</th>
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
                    {/* 1. Device (20%) */}
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

                    {/* 2. Type & Serial (15%) */}
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

                    {/* 4. Assigned Operator (15%) */}
                    <td className="py-3 px-3.5 align-middle text-left">
                      {d.assignedStaffName ? (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium text-[11px] truncate max-w-full" title={d.assignedStaffName}>
                          {d.assignedStaffName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </td>

                    {/* 5. Status (10%) */}
                    <td className="py-3 px-3.5 align-middle text-left whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] border ${
                          d.status === 'Assigned'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : d.status === 'Available' || d.status === 'Unmapped'
                            ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {d.status === 'Assigned'
                          ? 'Assigned'
                          : d.status === 'Available' || d.status === 'Unmapped'
                          ? 'Available / Unmapped'
                          : d.status}
                      </span>
                    </td>

                    {/* 6. Actions (18%) */}
                    <td className="py-3 px-3.5 align-middle text-left whitespace-nowrap">
                      <div className="flex items-center justify-start gap-1.5 flex-wrap">
                        {d.status !== 'Decommissioned' ? (
                          <>
                            {d.status === 'Assigned' && d.boothId ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openAssignOrMove(d)}
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                                  title="Relocate device to another station"
                                >
                                  Relocate
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openUnmap(d)}
                                  className="px-2 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                                  title="Unmap device from current station"
                                >
                                  Unmap
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openAssignOrMove(d)}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                                title="Assign device to a station"
                              >
                                Assign Device
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => openDecommission(d)}
                              className="px-2 py-1 text-xs font-medium text-rose-700 bg-rose-50/70 hover:bg-rose-100 hover:text-rose-800 border border-rose-200/60 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                              title="Decommission device"
                            >
                              Decommission
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Archived</span>
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

      {/* ========================================== */}
      {/* MODAL: DECOMMISSION DEVICE */}
      {/* ========================================== */}
      {showDecommissionModal && targetDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Decommission Device</h3>
                <p className="text-xs text-slate-500">
                  {targetDevice.deviceName} ({targetDevice.serialNumber})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Decommissioning permanently marks this device as retired or returned for warranty/repair. It will be unmapped from any booth and prevented from authenticating to transaction APIs.
            </p>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Decommission Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Touchscreen failure, battery swelling, returned to vendor under warranty..."
                value={decommissionReason}
                onChange={(e) => setDecommissionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDecommissionModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecommission}
                disabled={!decommissionReason.trim()}
                className="px-4 py-2 text-xs text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg font-semibold shadow-xs"
              >
                Confirm Decommission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
