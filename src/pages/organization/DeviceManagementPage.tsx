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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DeviceStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | DeviceType>('All');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetDevice, setTargetDevice] = useState<DeviceWithDetails | null>(null);
  const [assignForm, setAssignForm] = useState({
    storeId: '',
    boothId: '',
    assignedStaffUserId: '',
    reason: '',
  });

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
  const assignedDevices = devices.filter((d) => d.status === 'Assigned').length;
  const availableDevices = devices.filter((d) => d.status === 'Available' || d.status === 'Unmapped').length;
  const decommissionedDevices = devices.filter((d) => d.status === 'Decommissioned').length;

  // Filtered
  const filteredDevices = devices.filter((d) => {
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    if (typeFilter !== 'All' && d.deviceType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = d.deviceName.toLowerCase().includes(q);
      const matchSerial = d.serialNumber.toLowerCase().includes(q);
      const matchStore = (d.storeName || '').toLowerCase().includes(q);
      const matchBooth = (d.boothName || '').toLowerCase().includes(q);
      const matchStaff = (d.assignedStaffName || '').toLowerCase().includes(q);
      if (!matchName && !matchSerial && !matchStore && !matchBooth && !matchStaff) return false;
    }
    return true;
  });

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
        reason: assignForm.reason || 'Hardware mapped to service booth',
      });
    }

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to map hardware.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Device ${targetDevice.deviceName} (${targetDevice.serialNumber}) successfully mapped.`,
    });
    setShowAssignModal(false);
  };

  const handleUnmapDevice = (device: DeviceWithDetails) => {
    if (!currentUser) return;
    if (!window.confirm(`Unmap ${device.deviceName} from ${device.boothName}? It will return to available inventory.`)) {
      return;
    }
    setFeedback(null);

    const res = organizationService.unmapDevice(
      currentUser,
      device.id,
      'Hardware unmapped by supervisor for maintenance / reassignment'
    );

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to unmap device.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Device ${device.deviceName} returned to available inventory.`,
    });
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
      setFeedback({ type: 'error', message: res.error || 'Failed to decommission hardware.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Device ${targetDevice.deviceName} has been decommissioned and recorded in the audit trail.`,
    });
    setShowDecommissionModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Organization Management</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Hardware & Terminals</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Device Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor and allocate POS terminals, mPOS units, and biometric scanners mapped to your branch counters.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-2xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tenant Hardware Pool (BIZ-LUS-001)</span>
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
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Hardware Units</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalDevices}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Allocated to business</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Stationed & Active</span>
            <Wifi className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700 mt-2">{assignedDevices}</div>
          <div className="text-xs text-teal-600 font-medium mt-1">Live at branch booths</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Available / Unmapped</span>
            <Smartphone className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-cyan-700 mt-2">{availableDevices}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Ready for deployment</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Decommissioned</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2">{decommissionedDevices}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Archived hardware units</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-devices"
              type="text"
              placeholder="Search serial number, device name, booth, staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <select
            id="select-devicestatus-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Available">Available</option>
            <option value="Unmapped">Unmapped</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>

          <select
            id="select-devicetype-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Hardware Types</option>
            <option value="POS Terminal">POS Terminal</option>
            <option value="mPOS">mPOS Card Reader</option>
            <option value="Biometric Scanner">Biometric Scanner</option>
            <option value="PIN Pad">PIN Pad</option>
            <option value="Smartphone Terminal">Smartphone Terminal</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredDevices.length} of {devices.length} units
        </div>
      </div>

      {/* Devices Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Hardware Unit</th>
                <th className="py-3 px-4">Type & Serial</th>
                <th className="py-3 px-4">Current Station</th>
                <th className="py-3 px-4">Assigned Operator</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No hardware devices found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{d.deviceName}</div>
                      <span className="text-slate-400 font-mono text-[11px]">{d.id}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{d.deviceType}</div>
                      <span className="text-slate-400 font-mono text-[11px]">{d.serialNumber}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {d.storeName && d.boothName ? (
                        <div>
                          <div className="font-semibold text-slate-900">{d.boothName}</div>
                          <div className="text-slate-400 text-[11px]">{d.storeName}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unmapped (In Depot)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {d.assignedStaffName ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium">
                          {d.assignedStaffName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No assigned staff</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                          d.status === 'Assigned'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Available' || d.status === 'Unmapped'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {d.status !== 'Decommissioned' && (
                          <>
                            <button
                              onClick={() => openAssignOrMove(d)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                            >
                              {d.boothId ? 'Relocate' : 'Deploy'}
                            </button>

                            {d.boothId && (
                              <button
                                onClick={() => handleUnmapDevice(d)}
                                className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Unmap from booth"
                              >
                                Unmap
                              </button>
                            )}

                            <button
                              onClick={() => openDecommission(d)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Decommission Hardware"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
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
      {/* MODAL: MAP / RELOCATE HARDWARE */}
      {/* ========================================== */}
      {showAssignModal && targetDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {targetDevice.boothId ? 'Relocate Hardware' : 'Deploy Hardware to Station'}
                </h3>
                <p className="text-xs text-slate-500">
                  {targetDevice.deviceName} ({targetDevice.serialNumber})
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
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
      {/* MODAL: DECOMMISSION HARDWARE */}
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
