import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Search,
  Filter,
  Shield,
  KeyRound,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  X,
  Info,
  Building2,
  Store,
  Layers,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import { OrgUser, StoreWithStats, BoothWithDetails, OrgUserStatus } from '../../types/organization';
import { UserRole } from '../../types/auth';

export const UsersRolesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const isBusinessOwner = currentUser?.role === 'business_owner';
  const isBusinessAdmin = currentUser?.role === 'business_admin';

  const [users, setUsers] = useState<OrgUser[]>([]);
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [booths, setBooths] = useState<BoothWithDetails[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'business_admin' | 'agent'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Suspended'>('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    role: 'agent' as 'business_admin' | 'agent',
    passcode: '',
    storeId: '',
    boothId: '',
  });
  const [showPasscodeText, setShowPasscodeText] = useState(false);

  const [showResetPasscodeModal, setShowResetPasscodeModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<OrgUser | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [resetReason, setResetReason] = useState('');

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTargetUser, setStatusTargetUser] = useState<OrgUser | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<OrgUserStatus>('Inactive');
  const [statusReason, setStatusReason] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    if (!currentUser) return;
    setUsers(organizationService.getUsers(currentUser));
    setStores(organizationService.getStores(currentUser));
    setBooths(organizationService.getBooths(currentUser));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = organizationService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Filtering
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
      const matchUser = u.username.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchEmail && !matchId) return false;
    }
    return true;
  });

  // KPIs
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'business_admin').length;
  const agentCount = users.filter((u) => u.role === 'agent').length;
  const activeCount = users.filter((u) => u.status === 'Active').length;

  // Handlers
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFeedback(null);

    const res = organizationService.createUser(currentUser, {
      firstName: createForm.firstName,
      lastName: createForm.lastName,
      username: createForm.username,
      email: createForm.email,
      phone: createForm.phone,
      role: createForm.role,
      passcode: createForm.passcode,
      storeId: createForm.storeId || undefined,
      boothId: createForm.boothId || undefined,
      status: 'Active',
    });

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to create user.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `User ${createForm.firstName} ${createForm.lastName} (${createForm.username}) successfully created.`,
    });
    setShowCreateModal(false);
    setCreateForm({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      role: 'agent',
      passcode: '',
      storeId: '',
      boothId: '',
    });
  };

  const openResetPasscode = (u: OrgUser) => {
    setResetTargetUser(u);
    setNewPasscode('');
    setConfirmPasscode('');
    setResetReason('');
    setShowResetPasscodeModal(true);
  };

  const handleConfirmResetPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !resetTargetUser) return;
    setFeedback(null);

    if (newPasscode !== confirmPasscode) {
      setFeedback({ type: 'error', message: 'Passcodes do not match. Please re-enter.' });
      return;
    }

    const res = organizationService.resetPasscode(currentUser, {
      userId: resetTargetUser.id,
      newPasscode,
      reason: resetReason || 'Passcode reset requested via Users & Roles management console',
    });

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to reset passcode.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Passcode for ${resetTargetUser.firstName} ${resetTargetUser.lastName} successfully reset and hashed securely.`,
    });
    setShowResetPasscodeModal(false);
  };

  const openStatusModal = (u: OrgUser, nextStatus: OrgUserStatus) => {
    setStatusTargetUser(u);
    setNewStatusValue(nextStatus);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = () => {
    if (!currentUser || !statusTargetUser) return;
    setFeedback(null);

    const res = organizationService.setUserStatus(
      currentUser,
      statusTargetUser.id,
      newStatusValue,
      statusReason || `Status changed to ${newStatusValue}`
    );

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to update user status.' });
      return;
    }

    let extraWarning = '';
    if (res.activeDevicesToUnmap && res.activeDevicesToUnmap.length > 0) {
      extraWarning = ` Warning: ${res.activeDevicesToUnmap.length} hardware device(s) are currently mapped to this staff member and should be unmapped or reassigned.`;
    }

    setFeedback({
      type: 'success',
      message: `${statusTargetUser.firstName} ${statusTargetUser.lastName} is now ${newStatusValue}.${extraWarning}`,
    });
    setShowStatusModal(false);
  };

  // Helper check if actor can manage this target user
  const canManageUser = (target: OrgUser) => {
    if (isBusinessOwner) return true;
    if (isBusinessAdmin && target.role === 'agent') return true;
    return false;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <UserCog className="w-3.5 h-3.5" />
            <span>Organization Management</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Access & Personnel</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Users & Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Administer agency staff accounts, administrative permissions, station deployments, and secure passcodes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isBusinessOwner ? (
            <button
              id="btn-create-user-header"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create User
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg border border-slate-200">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Viewing as Business Admin (Agent delegation rights)</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Architecture / Governance Legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Role-Based Access Hierarchy & Permission Scope</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Tenant Isolated (BIZ-LUS-001)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900">Business Owner</span>
              <span className="text-[10px] bg-purple-200/80 text-purple-900 px-1.5 py-0.5 rounded font-semibold">
                Root Admin
              </span>
            </div>
            <p className="text-purple-700 text-[11px] mt-1 leading-relaxed">
              Full authority over infrastructure, balance adjustments, stores, booths, staff, and audit history.
            </p>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">Business Admin</span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
                Delegated
              </span>
            </div>
            <p className="text-emerald-700 text-[11px] mt-1 leading-relaxed">
              Manages agent status, resets agent passcodes, and operates assigned hardware devices.
            </p>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900">Agent</span>
              <span className="text-[10px] bg-blue-200/80 text-blue-900 px-1.5 py-0.5 rounded font-semibold">
                Till Operator
              </span>
            </div>
            <p className="text-blue-700 text-[11px] mt-1 leading-relaxed">
              Stationed at counters to process customer cash, withdrawals, liquidity transfers, and daily shifts.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-lg opacity-75">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Auditor</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                Future Role
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
              Reserved read-only compliance inspection role. Strictly non-selectable during current user creation.
            </p>
          </div>
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
            <span>Total Staff Accounts</span>
            <UserCog className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalUsers}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Across all agency branches</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Business Admins</span>
            <Shield className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{adminCount}</div>
          <div className="text-xs text-teal-700 font-medium mt-1">Branch supervisory managers</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Operational Agents</span>
            <UserCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{agentCount}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Active counter tellers</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active & Stationed</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{activeCount}</div>
          <div className="text-xs text-indigo-700 font-medium mt-1">Currently eligible to operate</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-users"
              type="text"
              placeholder="Search by name, username, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <select
            id="select-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Roles</option>
            <option value="business_admin">Business Admin</option>
            <option value="agent">Agent</option>
          </select>

          <select
            id="select-status-filter-users"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredUsers.length} of {users.length} accounts
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Stationed Booth</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Security Passcode</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const assignedStore = stores.find((s) => s.id === u.storeId);
                  const assignedBooth = booths.find((b) => b.id === u.boothId);
                  const canAct = canManageUser(u);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {u.firstName[0]}
                            {u.lastName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-slate-400 font-mono text-[11px]">
                              {u.username} • {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            u.role === 'business_owner'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : u.role === 'business_admin'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {u.role === 'business_owner'
                            ? 'Business Owner'
                            : u.role === 'business_admin'
                            ? 'Business Admin'
                            : 'Agent'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {assignedStore && assignedBooth ? (
                          <div>
                            <div className="font-medium text-slate-900">{assignedBooth.boothName}</div>
                            <div className="text-slate-400 text-[11px]">{assignedStore.storeName}</div>
                          </div>
                        ) : assignedStore ? (
                          <span className="text-slate-600">{assignedStore.storeName} (No Booth)</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div>{u.email}</div>
                        <div className="text-slate-400 text-[11px]">{u.phone || 'No phone'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                            u.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'Inactive'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Protected Hash</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {canAct && u.role !== 'business_owner' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openResetPasscode(u)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
                              title="Reset Passcode"
                            >
                              Reset PIN
                            </button>

                            {u.status === 'Active' ? (
                              <button
                                onClick={() => openStatusModal(u, 'Inactive')}
                                className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => openStatusModal(u, 'Active')}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No action</span>
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
      {/* MODAL: CREATE USER (Business Owner Only) */}
      {/* ========================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Create Organization User</h3>
                <p className="text-xs text-slate-500">Provision a new Business Admin or Agent account.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kelvin"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phiri"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kelvin.phiri"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +260 97 234 5678"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kelvin.phiri@lusakaagency.zm"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Assigned Organization Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: 'agent' })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      createForm.role === 'agent'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">Agent</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Counter till operator</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: 'business_admin' })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      createForm.role === 'business_admin'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">Business Admin</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Branch supervisor</div>
                  </button>

                  <div
                    title="Auditor is reserved for future release"
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Auditor</span>
                      <span className="text-[9px] bg-slate-200 px-1 py-0.2 rounded font-semibold text-slate-600">
                        Future
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5">Non-selectable</div>
                  </div>
                </div>
              </div>

              {/* Station Deployment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Branch Store (Optional)</label>
                  <select
                    value={createForm.storeId}
                    onChange={(e) => {
                      const nextStoreBooths = booths.filter(
                        (b) => b.storeId === e.target.value && b.status === 'Active'
                      );
                      setCreateForm({
                        ...createForm,
                        storeId: e.target.value,
                        boothId: nextStoreBooths[0]?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- No store assigned --</option>
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
                  <label className="block text-slate-700 font-semibold mb-1">Service Booth (Optional)</label>
                  <select
                    value={createForm.boothId}
                    onChange={(e) => setCreateForm({ ...createForm, boothId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- No booth assigned --</option>
                    {booths
                      .filter((b) => b.storeId === createForm.storeId && b.status === 'Active')
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.boothName} ({b.boothNumber})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Initial Passcode */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Initial Passcode (min 5 digits) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasscodeText ? 'text' : 'password'}
                    required
                    minLength={5}
                    placeholder="e.g. 12345"
                    value={createForm.passcode}
                    onChange={(e) => setCreateForm({ ...createForm, passcode: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscodeText(!showPasscodeText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Passcode is stored as an encrypted bcrypt hash ($2b$12$) and will not be visible in audit logs.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: RESET PASSCODE */}
      {/* ========================================== */}
      {showResetPasscodeModal && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Reset Passcode</h3>
                <p className="text-xs text-slate-500">
                  {resetTargetUser.firstName} {resetTargetUser.lastName} ({resetTargetUser.username})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmResetPasscode} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  New Passcode (min 5 digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={5}
                  placeholder="Enter new 5+ digit passcode"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Confirm New Passcode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={5}
                  placeholder="Re-enter new passcode"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Passcode Reset <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Agent forgot pin after leave, security rotation, credential compromise..."
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] leading-relaxed">
                Security Policy: The new passcode is converted immediately into an immutable salt-hashed hash. Plain-text passcodes are never transmitted, logged, or visible in the audit trail.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetPasscodeModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPasscode || !confirmPasscode || !resetReason.trim()}
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-semibold shadow-xs"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: STATUS CHANGE (Activate/Deactivate) */}
      {/* ========================================== */}
      {showStatusModal && statusTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div
                className={`p-2 rounded-xl ${
                  newStatusValue === 'Active'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {newStatusValue === 'Active' ? (
                  <UserCheck className="w-5 h-5" />
                ) : (
                  <UserX className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {newStatusValue === 'Active' ? 'Activate User Account' : 'Deactivate User Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {statusTargetUser.firstName} {statusTargetUser.lastName} ({statusTargetUser.username})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {newStatusValue === 'Active'
                ? 'Activating this user restores their counter till login, transaction processing privileges, and assigned booth functions.'
                : 'Deactivating this user will immediately revoke login capabilities and block all transaction processing on assigned terminals.'}
            </p>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Reason / Remarks <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. End of contract, leave of absence, disciplinary review, restored duties..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={!statusReason.trim()}
                className={`px-4 py-2 text-xs text-white rounded-lg font-semibold shadow-xs disabled:opacity-50 ${
                  newStatusValue === 'Active'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Confirm {newStatusValue === 'Active' ? 'Activation' : 'Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
