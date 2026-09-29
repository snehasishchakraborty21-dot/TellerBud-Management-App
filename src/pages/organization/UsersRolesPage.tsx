import React, { useState, useEffect, useRef } from 'react';
import {
  UserCog,
  Plus,
  Search,
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
  MoreVertical,
  Edit2,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  User as UserIcon,
  Trash2,
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

  // Roles & Permissions Info Modal
  const [showRolesInfoModal, setShowRolesInfoModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'business_admin' | 'agent'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Suspended'>('All');

  // Modals state
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
    status: 'Active' as OrgUserStatus,
  });
  const [showPasscodeText, setShowPasscodeText] = useState(false);

  // View User Modal
  const [viewTargetUser, setViewTargetUser] = useState<OrgUser | null>(null);

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetUser, setEditTargetUser] = useState<OrgUser | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'agent' as 'business_admin' | 'agent',
    storeId: '',
    boothId: '',
    status: 'Active' as OrgUserStatus,
  });
  const [showRoleChangeConfirmModal, setShowRoleChangeConfirmModal] = useState(false);

  // Delete User Modal (Business Owner only)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<OrgUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Assign / Change Booth Modal (Agents only)
  const [showAssignBoothModal, setShowAssignBoothModal] = useState(false);
  const [assignBoothTargetUser, setAssignBoothTargetUser] = useState<OrgUser | null>(null);
  const [assignBoothForm, setAssignBoothForm] = useState({
    storeId: '',
    boothId: '',
    reason: '',
  });

  // Reset Passcode Modal
  const [showResetPasscodeModal, setShowResetPasscodeModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<OrgUser | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [resetReason, setResetReason] = useState('');
  const [showResetPasscodeText, setShowResetPasscodeText] = useState(false);

  // Status Change Modal (Activate / Deactivate / Suspend)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTargetUser, setStatusTargetUser] = useState<OrgUser | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<OrgUserStatus>('Inactive');
  const [statusReason, setStatusReason] = useState('');

  // Dropdown action menu index
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close action menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showRolesInfoModal) setShowRolesInfoModal(false);
        if (showDeleteModal) setShowDeleteModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRolesInfoModal, showDeleteModal]);

  // Listen for open-roles-info-modal event from top header (i) button
  useEffect(() => {
    const handleOpenRolesInfo = () => {
      setShowRolesInfoModal(true);
    };
    window.addEventListener('open-roles-info-modal', handleOpenRolesInfo);
    return () => window.removeEventListener('open-roles-info-modal', handleOpenRolesInfo);
  }, []);

  // Reset scrollbar to top when filters change
  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }, [searchQuery, roleFilter, statusFilter]);

  // Filtering
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
      const matchUser = u.username.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchEmail && !matchPhone && !matchId) return false;
    }
    return true;
  });

  // KPIs
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'business_admin').length;
  const agentCount = users.filter((u) => u.role === 'agent').length;
  // Count only users with the Agent role who have an Active status and are assigned to both Store and Booth
  const activeAssignedAgentsCount = users.filter(
    (u) => u.role === 'agent' && u.status === 'Active' && Boolean(u.storeId) && Boolean(u.boothId)
  ).length;

  // Handlers
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFeedback(null);

    // Validation for agents: store & booth required
    if (createForm.role === 'agent' && (!createForm.storeId || !createForm.boothId)) {
      setFeedback({
        type: 'error',
        message: 'Store and Booth assignment are required for Operational Agents.',
      });
      return;
    }

    // Passcode minimum length check
    if (!createForm.passcode || createForm.passcode.length < 5) {
      setFeedback({
        type: 'error',
        message: 'Passcode must be at least 5 digits.',
      });
      return;
    }

    // Auto-generate username from name if not manually edited
    const resolvedUsername =
      createForm.username.trim() ||
      `${createForm.firstName.trim().toLowerCase()}.${createForm.lastName.trim().toLowerCase()}`;

    const res = organizationService.createUser(currentUser, {
      firstName: createForm.firstName,
      lastName: createForm.lastName,
      username: resolvedUsername,
      email: createForm.email,
      phone: createForm.phone,
      role: createForm.role,
      passcode: createForm.passcode,
      storeId: createForm.role === 'agent' ? createForm.storeId : undefined,
      boothId: createForm.role === 'agent' ? createForm.boothId : undefined,
      status: createForm.status || 'Active',
    });

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to create user.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `User ${createForm.firstName} ${createForm.lastName} (${resolvedUsername}) successfully created with encrypted security passcode.`,
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
      status: 'Active',
    });
  };

  const openEditUser = (u: OrgUser) => {
    setEditTargetUser(u);
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone || '',
      role: (u.role === 'business_admin' ? 'business_admin' : 'agent') as 'business_admin' | 'agent',
      storeId: u.storeId || '',
      boothId: u.boothId || '',
      status: u.status,
    });
    setOpenActionMenuId(null);
    setShowEditModal(true);
  };

  const handleConfirmEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editTargetUser) return;
    setFeedback(null);

    // If changing from agent to business_admin, trigger confirmation modal
    if (editTargetUser.role === 'agent' && editForm.role === 'business_admin') {
      setShowRoleChangeConfirmModal(true);
      return;
    }

    // If role is agent, validate store & booth
    if (editForm.role === 'agent' && (!editForm.storeId || !editForm.boothId)) {
      setFeedback({
        type: 'error',
        message: 'Store and Booth assignment are required for Operational Agents.',
      });
      return;
    }

    executeEditUserSave();
  };

  const executeEditUserSave = () => {
    if (!currentUser || !editTargetUser) return;

    const res = organizationService.updateUser(currentUser, {
      userId: editTargetUser.id,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      phone: editForm.phone,
      role: editForm.role,
      storeId: editForm.role === 'agent' ? editForm.storeId : undefined,
      boothId: editForm.role === 'agent' ? editForm.boothId : undefined,
      status: editForm.status,
    });

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to update user.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `User ${editForm.firstName} ${editForm.lastName} updated successfully.`,
    });
    setShowRoleChangeConfirmModal(false);
    setShowEditModal(false);
  };

  const openAssignBooth = (u: OrgUser) => {
    setAssignBoothTargetUser(u);
    setAssignBoothForm({
      storeId: u.storeId || stores[0]?.id || '',
      boothId: u.boothId || '',
      reason: '',
    });
    setOpenActionMenuId(null);
    setShowAssignBoothModal(true);
  };

  const handleConfirmAssignBooth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !assignBoothTargetUser) return;
    setFeedback(null);

    const res = organizationService.assignOrMoveStaff(currentUser, {
      userId: assignBoothTargetUser.id,
      newStoreId: assignBoothForm.storeId || null,
      newBoothId: assignBoothForm.boothId || null,
      reason: assignBoothForm.reason || 'Staff booth location updated by Business Owner',
    });

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to update booth assignment.' });
      return;
    }

    const assignedStore = stores.find((s) => s.id === assignBoothForm.storeId);
    const assignedBooth = booths.find((b) => b.id === assignBoothForm.boothId);

    setFeedback({
      type: 'success',
      message: `${assignBoothTargetUser.firstName} ${assignBoothTargetUser.lastName} assigned to ${assignedBooth?.boothName || 'Booth'} (${assignedStore?.storeName || 'Store'}).`,
    });
    setShowAssignBoothModal(false);
  };

  const openResetPasscode = (u: OrgUser) => {
    setResetTargetUser(u);
    setNewPasscode('');
    setConfirmPasscode('');
    setResetReason('');
    setOpenActionMenuId(null);
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

    if (newPasscode.length < 5) {
      setFeedback({ type: 'error', message: 'Passcode must be at least 5 digits.' });
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
      message: `Passcode for ${resetTargetUser.firstName} ${resetTargetUser.lastName} has been securely reset and encrypted.`,
    });
    setShowResetPasscodeModal(false);
  };

  const openStatusModal = (u: OrgUser, nextStatus: OrgUserStatus) => {
    setStatusTargetUser(u);
    setNewStatusValue(nextStatus);
    setStatusReason('');
    setOpenActionMenuId(null);
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
      extraWarning = ` Note: ${res.activeDevicesToUnmap.length} device(s) are assigned to this user.`;
    }

    setFeedback({
      type: 'success',
      message: `${statusTargetUser.firstName} ${statusTargetUser.lastName} status changed to ${newStatusValue}.${extraWarning}`,
    });
    setShowStatusModal(false);
  };

  // Delete user handlers (Business Owner only)
  const openDeleteModal = (u: OrgUser) => {
    if (u.role === 'business_owner') return;
    if (!isBusinessOwner) return;
    setDeleteTargetUser(u);
    setOpenActionMenuId(null);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteUser = () => {
    if (!currentUser || !deleteTargetUser) return;
    if (deleteTargetUser.role === 'business_owner') {
      setFeedback({ type: 'error', message: 'The primary Business Owner account cannot be deleted.' });
      setShowDeleteModal(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = organizationService.deleteUser(currentUser, deleteTargetUser.id);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `User ${deleteTargetUser.firstName} ${deleteTargetUser.lastName} (${deleteTargetUser.username}) has been successfully deleted.`,
        });
        setShowDeleteModal(false);
        setDeleteTargetUser(null);
        loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete user.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'An unexpected error occurred while deleting the user.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper check if actor can manage this target user
  const canManageUser = (target: OrgUser) => {
    if (target.role === 'business_owner') return false;
    if (isBusinessOwner) return true;
    if (isBusinessAdmin && target.role === 'agent') return true;
    return false;
  };

  // Safe Security Status Badge renderer
  const renderSecurityStatusBadge = (user: OrgUser) => {
    if (user.status === 'Suspended') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Reset Required
        </span>
      );
    }
    if (user.status === 'Inactive') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Reset Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Passcode Set
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0 md:overflow-hidden overflow-y-auto p-3 sm:p-4 lg:p-5 gap-3 sm:gap-3.5 w-full max-w-none box-border select-none">
      {/* 1. FROZEN TOP SECTION: Breadcrumb, Feedback, KPI Cards, Search & Filter Bar */}
      <div className="shrink-0 flex flex-col gap-3 sm:gap-3.5">
        {/* Breadcrumb Row with Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 py-1">
            <UserCog className="w-3.5 h-3.5" />
            <span>Organization Management</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Access & Personnel</span>
          </div>

          {/* Action Button: Create User (Available for Business Owner and Business Admin) */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              id="btn-create-user-header"
              onClick={() => {
                if (isBusinessAdmin) {
                  setCreateForm({
                    ...createForm,
                    role: 'agent',
                  });
                }
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create User
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`flex items-start justify-between p-3.5 rounded-xl border text-xs sm:text-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
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

        {/* 2. Compact KPI Cards: Single Row Layout (Icon, Label, Value) - Height ~68px */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Staff Accounts */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2.5 min-h-[64px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCog className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] 2xl:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                TOTAL STAFF ACCOUNTS
              </span>
            </div>
            <div className="text-lg xl:text-xl font-bold font-mono text-slate-900 shrink-0 text-right whitespace-nowrap">
              {totalUsers}
            </div>
          </div>

          {/* Business Admins */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2.5 min-h-[64px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100/60 text-teal-600 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] 2xl:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                BUSINESS ADMINS
              </span>
            </div>
            <div className="text-lg xl:text-xl font-bold font-mono text-teal-700 shrink-0 text-right whitespace-nowrap">
              {adminCount}
            </div>
          </div>

          {/* Operational Agents */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2.5 min-h-[64px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100/60 text-[#0D93AA] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] 2xl:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                OPERATIONAL AGENTS
              </span>
            </div>
            <div className="text-lg xl:text-xl font-bold font-mono text-[#0D93AA] shrink-0 text-right whitespace-nowrap">
              {agentCount}
            </div>
          </div>

          {/* Active & Assigned Agents */}
          <div className="bg-white rounded-xl px-3.5 py-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2.5 min-h-[64px] h-[68px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/60 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] 2xl:text-[11px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                ACTIVE & ASSIGNED AGENTS
              </span>
            </div>
            <div className="text-lg xl:text-xl font-bold font-mono text-indigo-700 shrink-0 text-right whitespace-nowrap">
              {activeAssignedAgentsCount}
            </div>
          </div>
        </div>

        {/* 4. Compact Search & Filter Section: Single Row */}
        <div className="bg-white rounded-xl border border-slate-200/90 px-3.5 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-search-users"
                type="text"
                placeholder="Search by name, username, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white h-8.5"
              />
            </div>

            <select
              id="select-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-8.5 cursor-pointer shrink-0"
            >
              <option value="All">All Roles</option>
              <option value="business_admin">Business Admin</option>
              <option value="agent">Agent</option>
            </select>

            <select
              id="select-status-filter-users"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-8.5 cursor-pointer shrink-0"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-500 shrink-0 self-end sm:self-auto">
            Showing {filteredUsers.length} of {users.length} accounts
          </div>
        </div>
      </div>

      {/* 2. USERS TABLE CARD (Flex-1 min-h-0 with sticky header & scrollable records) */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden w-full max-w-none box-border">
        <div
          ref={tableScrollRef}
          tabIndex={0}
          role="region"
          aria-label="Users & Roles Table"
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-auto focus:outline-none"
        >
          <table className="w-full text-left text-xs text-slate-600 table-fixed min-w-[980px] border-collapse">
            <colgroup>
              <col style={{ width: '19%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%', minWidth: '120px' }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#F9FAFB] shadow-[0_1px_0_0_#E2E8F0]">
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] bg-[#F9FAFB] h-[44px]">
                <th scope="col" style={{ width: '19%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-4 text-left font-semibold whitespace-nowrap align-middle">
                  User Details
                </th>
                <th scope="col" style={{ width: '11%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3 text-left font-semibold whitespace-nowrap align-middle">
                  Assigned Role
                </th>
                <th scope="col" style={{ width: '18%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3 text-left font-semibold whitespace-nowrap align-middle">
                  Access / Assigned Booth
                </th>
                <th scope="col" style={{ width: '18%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3 text-left font-semibold whitespace-nowrap align-middle">
                  Contact
                </th>
                <th scope="col" style={{ width: '10%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3 text-left font-semibold whitespace-nowrap align-middle">
                  Account Status
                </th>
                <th scope="col" style={{ width: '12%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 px-3 text-left font-semibold whitespace-nowrap align-middle">
                  Security Status
                </th>
                <th scope="col" style={{ width: '12%' }} className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-slate-200 py-3 pl-3 pr-4 text-left font-semibold whitespace-nowrap align-middle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No staff accounts found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const assignedStore = stores.find((s) => s.id === u.storeId);
                  const assignedBooth = booths.find((b) => b.id === u.boothId);
                  const isOwner = u.role === 'business_owner';
                  const isBA = u.role === 'business_admin';
                  const canAct = canManageUser(u);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. User Details (19%) */}
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center gap-2.5 pr-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {u.firstName?.[0] || 'U'}
                            {u.lastName?.[0] || ''}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-xs truncate leading-snug">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-slate-400 font-mono text-[10.5px] truncate">
                              {u.username} • {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Assigned Role (11%) */}
                      <td className="py-3 px-3 align-middle">
                        <div className="pr-2 min-w-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[11px] whitespace-nowrap ${
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
                        </div>
                      </td>

                      {/* 3. Access / Assigned Booth (18%) */}
                      <td className="py-3 px-3 align-middle">
                        <div className="pr-2 min-w-0">
                          {isOwner || isBA ? (
                            <span className="font-medium text-slate-800 text-xs whitespace-nowrap">All Stores & Booths</span>
                          ) : assignedStore && assignedBooth ? (
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 text-xs truncate">
                                {assignedBooth.boothName}
                              </div>
                              <div className="text-slate-400 text-[10.5px] truncate">
                                {assignedStore.storeName}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Not Assigned</span>
                          )}
                        </div>
                      </td>

                      {/* 4. Contact (18%) */}
                      <td className="py-3 px-3 align-middle">
                        <div className="pr-2 min-w-0">
                          <div className="text-slate-800 text-xs truncate" title={u.email}>
                            {u.email}
                          </div>
                          <div className="text-slate-400 text-[10.5px] font-mono truncate">
                            {u.phone || 'No phone recorded'}
                          </div>
                        </div>
                      </td>

                      {/* 5. Account Status (10%) */}
                      <td className="py-3 px-3 align-middle">
                        <div className="pr-2 min-w-0">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] whitespace-nowrap ${
                              u.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.status === 'Inactive'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </div>
                      </td>

                      {/* 6. Security Status (12%) */}
                      <td className="py-3 px-3 align-middle">
                        <div className="pr-2 min-w-0">
                          {renderSecurityStatusBadge(u)}
                        </div>
                      </td>

                      {/* 7. Actions (12%) */}
                      <td className="py-3 pl-3 pr-4 align-middle text-left whitespace-nowrap">
                        <div className="relative flex items-center justify-start min-w-0">
                          {isOwner ? (
                            <span className="text-slate-400 text-xs italic">No Action</span>
                          ) : isBusinessOwner ? (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openEditUser(u)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                                title="Edit User Details"
                              >
                                Edit
                              </button>

                              {/* Clearly visible Delete / Trash Icon */}
                              <button
                                type="button"
                                onClick={() => openDeleteModal(u)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-colors cursor-pointer"
                                title={`Delete ${u.firstName} ${u.lastName}`}
                                aria-label={`Delete ${u.firstName} ${u.lastName}`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-rose-700" />
                              </button>

                              {/* Quick Action menu trigger */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenActionMenuId(openActionMenuId === u.id ? null : u.id)}
                                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                  title="More Options"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openActionMenuId === u.id && (
                                  <div
                                    ref={actionMenuRef}
                                    className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
                                  >
                                    <div className="py-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setViewTargetUser(u);
                                          setOpenActionMenuId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                      >
                                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                        <span>View Details</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => openEditUser(u)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Edit User</span>
                                      </button>

                                      {u.role === 'agent' && (
                                        <button
                                          type="button"
                                          onClick={() => openAssignBooth(u)}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                        >
                                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                          <span>Assign / Change Booth</span>
                                        </button>
                                      )}
                                    </div>

                                    <div className="py-1">
                                      <button
                                        type="button"
                                        onClick={() => openResetPasscode(u)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                      >
                                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Reset Passcode</span>
                                      </button>

                                      {u.status === 'Active' ? (
                                        <button
                                          type="button"
                                          onClick={() => openStatusModal(u, 'Inactive')}
                                          className="w-full text-left px-3 py-1.5 hover:bg-amber-50 flex items-center gap-2 text-amber-800 cursor-pointer"
                                        >
                                          <UserX className="w-3.5 h-3.5 text-amber-600" />
                                          <span>Deactivate User</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => openStatusModal(u, 'Active')}
                                          className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 cursor-pointer"
                                        >
                                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Activate User</span>
                                        </button>
                                      )}
                                    </div>

                                    <div className="py-1">
                                      <button
                                        type="button"
                                        onClick={() => openDeleteModal(u)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-700 cursor-pointer font-medium"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Delete User</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : canAct ? (
                            /* Business Admin managing an Agent: NO delete button or menu item */
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openEditUser(u)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                                title="Edit User Details"
                              >
                                Edit
                              </button>

                              {/* Quick Action menu trigger for Business Admin */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenActionMenuId(openActionMenuId === u.id ? null : u.id)}
                                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                  title="More Options"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openActionMenuId === u.id && (
                                  <div
                                    ref={actionMenuRef}
                                    className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
                                  >
                                    <div className="py-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setViewTargetUser(u);
                                          setOpenActionMenuId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                      >
                                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                        <span>View Details</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => openEditUser(u)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Edit User</span>
                                      </button>

                                      {u.role === 'agent' && (
                                        <button
                                          type="button"
                                          onClick={() => openAssignBooth(u)}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                        >
                                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                          <span>Assign / Change Booth</span>
                                        </button>
                                      )}
                                    </div>

                                    <div className="py-1">
                                      <button
                                        type="button"
                                        onClick={() => openResetPasscode(u)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                      >
                                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Reset Passcode</span>
                                      </button>

                                      {u.status === 'Active' ? (
                                        <button
                                          type="button"
                                          onClick={() => openStatusModal(u, 'Inactive')}
                                          className="w-full text-left px-3 py-1.5 hover:bg-amber-50 flex items-center gap-2 text-amber-800 cursor-pointer"
                                        >
                                          <UserX className="w-3.5 h-3.5 text-amber-600" />
                                          <span>Deactivate User</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => openStatusModal(u, 'Active')}
                                          className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 cursor-pointer"
                                        >
                                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Activate User</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setViewTargetUser(u)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
                            >
                              View
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
      {/* MODAL: CREATE USER (Business Owner Only) */}
      {/* ========================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Create Staff Account</h3>
                <p className="text-xs text-slate-500">Provision a new Business Admin or Operational Agent.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mobile Number <span className="text-slate-400 font-normal">(e.g. +260 97 123 4567)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+260 97 234 5678"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="kelvin.phiri@lusakaagency.zm"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* Role Selection: Strictly Business Admin & Agent */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Assigned Organization Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: 'agent' })}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      createForm.role === 'agent'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">Agent</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Counter till operator</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: 'business_admin', storeId: '', boothId: '' })}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      createForm.role === 'business_admin'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">Business Admin</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Branch supervisor</div>
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

              {/* Station Deployment: Only for Agent; Business Admin gets All Stores & Booths notice */}
              {createForm.role === 'business_admin' ? (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-900">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Access Scope: All Stores & Booths</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Business Admins automatically receive operational access across all current and future stores and booths.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Store <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
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
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    >
                      <option value="">-- Select Store --</option>
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
                      Booth <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!createForm.storeId}
                      value={createForm.boothId}
                      onChange={(e) => setCreateForm({ ...createForm, boothId: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">-- Select Booth --</option>
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
              )}

              {/* Secure Passcode */}
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
                    className="w-full px-3 py-1.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscodeText(!showPasscodeText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Security notice: The passcode is securely encrypted with salt-hashing ($2b$12$) and will never be logged or exposed in plain text.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-2xs cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: VIEW USER DETAILS */}
      {/* ========================================== */}
      {viewTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                  {viewTargetUser.firstName?.[0]}
                  {viewTargetUser.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {viewTargetUser.firstName} {viewTargetUser.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{viewTargetUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewTargetUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Assigned Role</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {viewTargetUser.role === 'business_owner'
                    ? 'Business Owner'
                    : viewTargetUser.role === 'business_admin'
                    ? 'Business Admin'
                    : 'Agent'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Account Status</span>
                <span className="font-semibold">{viewTargetUser.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Security Status</span>
                <span>{renderSecurityStatusBadge(viewTargetUser)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Email</span>
                <span className="font-medium text-slate-900">{viewTargetUser.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Phone</span>
                <span className="font-medium font-mono text-slate-900">
                  {viewTargetUser.phone || 'None'}
                </span>
              </div>
              {viewTargetUser.role === 'business_owner' || viewTargetUser.role === 'business_admin' ? (
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Access Scope</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    All Stores & Booths
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400">Store Assignment</span>
                    <span className="font-medium text-slate-900">
                      {stores.find((s) => s.id === viewTargetUser.storeId)?.storeName || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400">Booth Assignment</span>
                    <span className="font-medium text-slate-900">
                      {booths.find((b) => b.id === viewTargetUser.boothId)?.boothName || 'Not Assigned'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewTargetUser(null)}
                className="px-4 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: EDIT USER */}
      {/* ========================================== */}
      {showEditModal && editTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit User Details</h3>
                <p className="text-xs text-slate-500 font-mono">{editTargetUser.id}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmEditUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              {/* Role Selection (Business Owner can change between Business Admin and Agent) */}
              {isBusinessOwner && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, role: 'agent' })}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        editForm.role === 'agent'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold">Agent</div>
                      <div className="text-[10px] text-slate-500">Till operator</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, role: 'business_admin', storeId: '', boothId: '' })}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        editForm.role === 'business_admin'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold">Business Admin</div>
                      <div className="text-[10px] text-slate-500">Branch supervisor</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Access Scope / Station Deployment */}
              {editForm.role === 'business_admin' ? (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-900">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Access Scope: All Stores & Booths</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    This user has business-wide access across all stores and booths.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Store *</label>
                    <select
                      required
                      value={editForm.storeId}
                      onChange={(e) => {
                        const nextStoreBooths = booths.filter(
                          (b) => b.storeId === e.target.value && b.status === 'Active'
                        );
                        setEditForm({
                          ...editForm,
                          storeId: e.target.value,
                          boothId: nextStoreBooths[0]?.id || '',
                        });
                      }}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    >
                      <option value="">-- Select Store --</option>
                      {stores
                        .filter((s) => s.status === 'Active')
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.storeName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Booth *</label>
                    <select
                      required
                      disabled={!editForm.storeId}
                      value={editForm.boothId}
                      onChange={(e) => setEditForm({ ...editForm, boothId: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">-- Select Booth --</option>
                      {booths
                        .filter((b) => b.storeId === editForm.storeId && b.status === 'Active')
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.boothName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-2xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CONFIRM ROLE CHANGE TO BUSINESS ADMIN */}
      {/* ========================================== */}
      {showRoleChangeConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Confirm Role Change</h3>
                <p className="text-xs text-slate-500">Business-wide access elevation</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Changing this user to Business Admin will remove the current booth assignment and provide access to all stores and booths. Do you want to continue?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRoleChangeConfirmModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeEditUserSave}
                className="px-4 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-2xs cursor-pointer"
              >
                Confirm Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ASSIGN / CHANGE BOOTH (Agents Only) */}
      {/* ========================================== */}
      {showAssignBoothModal && assignBoothTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Assign / Relocate Agent</h3>
                <p className="text-xs text-slate-500">
                  {assignBoothTargetUser.firstName} {assignBoothTargetUser.lastName} ({assignBoothTargetUser.id})
                </p>
              </div>
              <button
                onClick={() => setShowAssignBoothModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignBooth} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Branch Store *</label>
                <select
                  required
                  value={assignBoothForm.storeId}
                  onChange={(e) => {
                    const nextStoreBooths = booths.filter(
                      (b) => b.storeId === e.target.value && b.status === 'Active'
                    );
                    setAssignBoothForm({
                      ...assignBoothForm,
                      storeId: e.target.value,
                      boothId: nextStoreBooths[0]?.id || '',
                    });
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  <option value="">-- Select Store --</option>
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
                <label className="block text-slate-700 font-semibold mb-1">Target Service Booth *</label>
                <select
                  required
                  disabled={!assignBoothForm.storeId}
                  value={assignBoothForm.boothId}
                  onChange={(e) => setAssignBoothForm({ ...assignBoothForm, boothId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">-- Select Booth --</option>
                  {booths
                    .filter((b) => b.storeId === assignBoothForm.storeId && b.status === 'Active')
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.boothName} ({b.boothNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assignment Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Branch relief assignment"
                  value={assignBoothForm.reason}
                  onChange={(e) => setAssignBoothForm({ ...assignBoothForm, reason: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignBoothModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-2xs cursor-pointer"
                >
                  Confirm Assignment
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
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reset Security Passcode</h3>
                <p className="text-xs text-slate-500">
                  {resetTargetUser.firstName} {resetTargetUser.lastName} ({resetTargetUser.username})
                </p>
              </div>
              <button
                onClick={() => setShowResetPasscodeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResetPasscode} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  New Passcode (min 5 digits) *
                </label>
                <div className="relative">
                  <input
                    type={showResetPasscodeText ? 'text' : 'password'}
                    required
                    minLength={5}
                    placeholder="Enter new 5+ digit passcode"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className="w-full px-3 py-1.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasscodeText(!showResetPasscodeText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showResetPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Confirm New Passcode *</label>
                <input
                  type={showResetPasscodeText ? 'text' : 'password'}
                  required
                  minLength={5}
                  placeholder="Re-enter new passcode"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Reset</label>
                <input
                  type="text"
                  placeholder="e.g. Staff requested credential refresh"
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <p className="text-[10.5px] text-slate-400">
                The new passcode will be encrypted and salted immediately.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetPasscodeModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-2xs cursor-pointer"
                >
                  Reset Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: STATUS CHANGE */}
      {/* ========================================== */}
      {showStatusModal && statusTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  newStatusValue === 'Active'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                    : 'bg-rose-50 border border-rose-200 text-rose-600'
                }`}
              >
                {newStatusValue === 'Active' ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {newStatusValue === 'Active' ? 'Activate Staff Account' : 'Deactivate Staff Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {statusTargetUser.firstName} {statusTargetUser.lastName} ({statusTargetUser.username})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              {newStatusValue === 'Active'
                ? 'This user will be restored to active status and will be able to log in to assigned operations.'
                : 'Deactivating this user will immediately revoke login access.'}
            </p>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">Status Change Reason</label>
              <input
                type="text"
                placeholder="e.g. End of operational shift / temporary leave"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className={`px-4 py-1.5 text-xs text-white rounded-lg font-semibold shadow-2xs cursor-pointer ${
                  newStatusValue === 'Active'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {newStatusValue === 'Active' ? 'Confirm Activation' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ROLES & PERMISSIONS INFORMATION     */}
      {/* ========================================== */}
      {showRolesInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setShowRolesInfoModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">Roles & Permissions</h3>
                  <p className="text-xs text-slate-500">Access hierarchy & scope definition</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRolesInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Business Owner */}
              <div className="p-3 bg-purple-50/70 border border-purple-100/90 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 text-xs">Business Owner</span>
                  <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded font-semibold">
                    Root Admin
                  </span>
                </div>
                <p className="text-purple-950 leading-relaxed">
                  Full access to business operations, users, stores, booths, devices, balance adjustments and financial records.
                </p>
              </div>

              {/* Business Admin */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-100/90 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs">Business Admin</span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                    Delegated
                  </span>
                </div>
                <p className="text-emerald-950 leading-relaxed">
                  Can manage users, agents, passcodes and operational assignments across all stores and booths. A Business Admin is not assigned to a specific store or booth.
                </p>
              </div>

              {/* Agent */}
              <div className="p-3 bg-blue-50/70 border border-blue-100/90 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-xs">Agent</span>
                  <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-semibold">
                    Till Operator
                  </span>
                </div>
                <p className="text-blue-950 leading-relaxed">
                  Processes permitted customer transactions from the assigned store and booth.
                </p>
              </div>

              {/* Auditor */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Auditor</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    Future Role
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Future read-only role for reviewing business, operational and financial records without making changes.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRolesInfoModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: DELETE USER CONFIRMATION            */}
      {/* ========================================== */}
      {showDeleteModal && deleteTargetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">Delete User</h3>
                  <p className="text-xs text-slate-500">Permanent account removal</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Staff Member:</span>
                <span className="font-semibold text-slate-900">
                  {deleteTargetUser.firstName} {deleteTargetUser.lastName}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Username:</span>
                <span className="font-mono text-slate-800">{deleteTargetUser.username}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Role:</span>
                <span className="font-semibold text-slate-900">
                  {deleteTargetUser.role === 'business_admin'
                    ? 'Business Admin'
                    : deleteTargetUser.role === 'agent'
                    ? 'Agent'
                    : deleteTargetUser.role}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email:</span>
                <span className="text-slate-800">{deleteTargetUser.email}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
