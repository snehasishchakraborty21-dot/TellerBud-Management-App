import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  Building2,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRightLeft,
  XCircle,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import { Device, DeviceType, DeviceStatus } from '../../types/organization';

export const AdminDeviceAllocationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DeviceStatus>('All');
  const [businessFilter, setBusinessFilter] = useState<string>('All');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    deviceName: '',
    deviceType: 'POS Terminal' as DeviceType,
    serialNumber: '',
    businessId: 'BIZ-LUS-001',
  });

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [targetBusinessId, setTargetBusinessId] = useState('BIZ-LUS-001');

  // Decommission Modal
  const [showDecommissionModal, setShowDecommissionModal] = useState(false);
  const [selectedDeviceForDecommission, setSelectedDeviceForDecommission] = useState<Device | null>(null);
  const [decommissionReason, setDecommissionReason] = useState('');
  const [isDecommissioning, setIsDecommissioning] = useState(false);

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

  const registeredBusinesses = [
    { id: 'BIZ-LUS-001', name: 'Lusaka Central Express Agency' },
    { id: 'BIZ-COP-002', name: 'Ndola Broadway Branch' },
    { id: 'BIZ-LIV-003', name: 'Livingstone Victoria Falls Agency' },
    { id: 'UNALLOCATED', name: 'Platform Inventory (Depot)' },
  ];

  // KPIs
  const totalHardware = devices.length;
  const allocatedCount = devices.filter(
    (d) => d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED' && d.status !== 'Decommissioned'
  ).length;
  const depotCount = devices.filter(
    (d) => (!d.allocatedBusinessId || d.allocatedBusinessId === 'UNALLOCATED') && d.status !== 'Decommissioned'
  ).length;
  const decommissionedCount = devices.filter((d) => d.status === 'Decommissioned').length;

  const filteredDevices = devices.filter((d) => {
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    if (businessFilter !== 'All') {
      if (businessFilter === 'UNALLOCATED' && d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED') return false;
      if (businessFilter !== 'UNALLOCATED' && d.allocatedBusinessId !== businessFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = d.deviceName.toLowerCase().includes(q);
      const matchSerial = d.serialNumber.toLowerCase().includes(q);
      const matchId = d.id.toLowerCase().includes(q);
      if (!matchName && !matchSerial && !matchId) return false;
    }
    return true;
  });

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const newDev: Device = {
      id: `DEV-${Date.now()}`,
      deviceId: `DEV-POS-${Math.floor(1000 + Math.random() * 9000)}`,
      allocatedBusinessId: registerForm.businessId === 'UNALLOCATED' ? null : registerForm.businessId,
      deviceName: registerForm.deviceName,
      deviceType: registerForm.deviceType,
      serialNumber: registerForm.serialNumber,
      status: 'Available',
      registeredAt: new Date().toISOString(),
      registeredBy: currentUser?.fullName || 'Super Admin',
    };

    organizationService.registerGlobalDevice(newDev);
    setFeedback({
      type: 'success',
      message: `Hardware unit ${registerForm.deviceName} (${registerForm.serialNumber}) enrolled into platform repository.`,
    });
    setShowRegisterModal(false);
    setRegisterForm({
      deviceName: '',
      deviceType: 'POS Terminal',
      serialNumber: '',
      businessId: 'BIZ-LUS-001',
    });
  };

  const openAllocate = (dev: Device) => {
    setSelectedDevice(dev);
    setTargetBusinessId(dev.allocatedBusinessId || 'BIZ-LUS-001');
    setShowAllocateModal(true);
  };

  const handleConfirmAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice || !currentUser) return;
    setFeedback(null);

    const bId = targetBusinessId === 'UNALLOCATED' ? null : targetBusinessId;
    organizationService.allocateDeviceToBusiness(currentUser, selectedDevice.id, bId, 'Platform configuration update');

    const bName = registeredBusinesses.find((b) => b.id === targetBusinessId)?.name;
    setFeedback({
      type: 'success',
      message: `Device ${selectedDevice.deviceName} allocated to ${bName}.`,
    });
    setShowAllocateModal(false);
  };

  const openDecommissionModal = (dev: Device) => {
    setSelectedDeviceForDecommission(dev);
    setDecommissionReason('');
    setShowDecommissionModal(true);
  };

  const handleConfirmDecommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceForDecommission || !currentUser) return;
    if (!decommissionReason.trim()) {
      setFeedback({ type: 'error', message: 'Decommission reason is required.' });
      return;
    }

    setIsDecommissioning(true);
    setFeedback(null);

    const res = organizationService.decommissionDevice(
      currentUser,
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
      message: `Device ${selectedDeviceForDecommission.deviceName} (${selectedDeviceForDecommission.serialNumber}) has been decommissioned and recorded in the audit trail.`,
    });
    setShowDecommissionModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Cpu className="w-3.5 h-3.5" />
            <span>Platform Configuration</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Global Hardware Repository</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Device Allocation</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Register and allocate authorized POS terminals, mPOS card readers, and biometric hardware across agency businesses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-register-device"
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Enroll Hardware Unit
          </button>
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
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Global Enrolled Hardware</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalHardware}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">In TellerBud ecosystem</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Allocated to Businesses</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700 mt-2">{allocatedCount}</div>
          <div className="text-xs text-teal-600 font-medium mt-1">Distributed to merchant agencies</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Central Depot Inventory</span>
            <Package className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-cyan-700 mt-2">{depotCount}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Available for allocation</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Decommissioned Hardware</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{decommissionedCount}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Permanently retired</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search serial number, device name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Allocations</option>
            {registeredBusinesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
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
        </div>

        <div className="text-xs font-semibold text-slate-500 shrink-0">
          Showing {filteredDevices.length} of {devices.length} hardware units
        </div>
      </div>

      {/* Global Device Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Hardware Unit</th>
                <th className="py-3 px-4">Type & Serial</th>
                <th className="py-3 px-4">Allocated Business</th>
                <th className="py-3 px-4">Device Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 italic">
                    No hardware units found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => {
                  const b = registeredBusinesses.find((biz) => biz.id === d.allocatedBusinessId);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{d.deviceName}</div>
                        <span className="text-slate-400 font-mono text-[11px]">{d.deviceId || d.id}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{d.deviceType}</div>
                        <span className="text-slate-400 font-mono text-[11px]">{d.serialNumber}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {b && d.allocatedBusinessId && d.allocatedBusinessId !== 'UNALLOCATED' ? (
                          <div>
                            <div className="font-semibold text-slate-900">{b.name}</div>
                            <span className="text-slate-400 font-mono text-[10px]">{d.allocatedBusinessId}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Depot Inventory</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] border ${
                            d.status === 'Assigned'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : d.status === 'Available' || d.status === 'Unmapped'
                              ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                              : d.status === 'Decommissioned'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {d.status !== 'Decommissioned' ? (
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openAllocate(d)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                              title="Reallocate hardware unit to another business or central depot"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              Reallocate
                            </button>

                            <button
                              type="button"
                              onClick={() => openDecommissionModal(d)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-md transition-colors cursor-pointer"
                              title="Decommission hardware unit"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Decommission
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-medium">Decommissioned (Read-Only)</span>
                        )}
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
      {/* MODAL: ENROLL NEW HARDWARE */}
      {/* ========================================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Enroll New Hardware Unit</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDevice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Device Model Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunmi V2 Pro Terminal #4"
                  value={registerForm.deviceName}
                  onChange={(e) => setRegisterForm({ ...registerForm, deviceName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Hardware Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={registerForm.deviceType}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, deviceType: e.target.value as DeviceType })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="POS Terminal">POS Terminal</option>
                  <option value="mPOS">mPOS Card Reader</option>
                  <option value="Biometric Scanner">Biometric Scanner</option>
                  <option value="PIN Pad">PIN Pad</option>
                  <option value="Smartphone Terminal">Smartphone Terminal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Serial Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SN-SUNMI-88921"
                  value={registerForm.serialNumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Initial Business Allocation
                </label>
                <select
                  value={registerForm.businessId}
                  onChange={(e) => setRegisterForm({ ...registerForm, businessId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {registeredBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-xs"
                >
                  Enroll Hardware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: REALLOCATE HARDWARE */}
      {/* ========================================== */}
      {showAllocateModal && selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Reallocate Hardware Unit</h3>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAllocation} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-slate-900">{selectedDevice.deviceName}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {selectedDevice.deviceType} • {selectedDevice.serialNumber}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Business Allocation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetBusinessId}
                  onChange={(e) => setTargetBusinessId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {registeredBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-xs"
                >
                  Save Allocation
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-lg">Decommission Device</h3>
                <p className="text-xs text-slate-500 truncate">
                  {selectedDeviceForDecommission.deviceName} ({selectedDeviceForDecommission.serialNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDecommissionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Device Details Summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Device Name:</span>
                <span className="font-semibold text-slate-900">{selectedDeviceForDecommission.deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Device ID:</span>
                <span className="font-mono text-slate-700">{selectedDeviceForDecommission.deviceId || selectedDeviceForDecommission.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Serial Number:</span>
                <span className="font-mono text-slate-700">{selectedDeviceForDecommission.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Assigned Business:</span>
                <span className="font-semibold text-slate-800">
                  {registeredBusinesses.find((b) => b.id === selectedDeviceForDecommission.allocatedBusinessId)?.name || 'Platform Inventory (Depot)'}
                </span>
              </div>
            </div>

            {/* Permanent Warning */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Warning:</strong> Decommissioning permanently marks this device as retired or returned for warranty/repair. It will be unmapped from any active station, store, and business, and permanently barred from transacting on the network.
              </p>
            </div>

            <form onSubmit={handleConfirmDecommission} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Decommission Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Touchscreen failure, battery swelling, hardware returned to vendor under warranty..."
                  value={decommissionReason}
                  onChange={(e) => setDecommissionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDecommissionModal(false)}
                  disabled={isDecommissioning}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!decommissionReason.trim() || isDecommissioning}
                  className="px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isDecommissioning ? 'Decommissioning...' : 'Confirm Decommission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
