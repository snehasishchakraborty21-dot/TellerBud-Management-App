import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Building2,
  MapPin,
  Users,
  Smartphone,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Archive,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  X,
  Layers,
  Sparkles,
  Info,
  UserMinus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import {
  StoreWithStats,
  BoothWithDetails,
  OrgUser,
  StoreStatus,
  BoothStatus,
} from '../../types/organization';
import { CityDropdown } from '../../components/organization/CityDropdown';
import { City, formatStoreLocation } from '../../data/mockCityData';

export const StoresBoothsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const isBusinessOwner = currentUser?.role === 'business_owner';

  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [booths, setBooths] = useState<BoothWithDetails[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'booths' | 'assignments'>('hierarchy');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('All');
  const [expandedStoreIds, setExpandedStoreIds] = useState<Set<string>>(new Set());

  // Modals state
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreWithStats | null>(null);
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    storeNumber: '',
    cityId: '',
    cityName: '',
    province: '',
    physicalAddress: '',
    status: 'Active' as StoreStatus,
  });
  const [storeFormErrors, setStoreFormErrors] = useState<{
    storeName?: string;
    storeNumber?: string;
    cityId?: string;
    physicalAddress?: string;
    general?: string;
  }>({});
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);

  // Available Cities
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [cityLoadError, setCityLoadError] = useState<string | null>(null);

  // Focus refs for first invalid field
  const cityDropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const storeNameInputRef = useRef<HTMLInputElement>(null);
  const storeNumberInputRef = useRef<HTMLInputElement>(null);
  const physicalAddressInputRef = useRef<HTMLInputElement>(null);

  const [showBoothModal, setShowBoothModal] = useState(false);
  const [editingBooth, setEditingBooth] = useState<BoothWithDetails | null>(null);
  const [boothForm, setBoothForm] = useState({ storeId: '', boothName: '', boothNumber: '', status: 'Active' as BoothStatus });

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'store' | 'booth';
    id: string;
    name: string;
    storeNumber?: string;
    boothNumber?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: '',
    storeId: '',
    boothId: '',
    reason: '',
  });

  // Manage Staff Modal state
  const [showManageStaffModal, setShowManageStaffModal] = useState(false);
  const [managingBooth, setManagingBooth] = useState<BoothWithDetails | null>(null);
  const [selectedStaffToManage, setSelectedStaffToManage] = useState<string>('');
  const [manageAction, setManageAction] = useState<'move' | 'unassign'>('move');
  const [manageTargetStoreId, setManageTargetStoreId] = useState<string>('');
  const [manageTargetBoothId, setManageTargetBoothId] = useState<string>('');
  const [manageReason, setManageReason] = useState<string>('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    if (!currentUser) return;
    const s = organizationService.getStores(currentUser);
    const b = organizationService.getBooths(currentUser);
    const u = organizationService.getUsers(currentUser);
    setStores(s);
    setBooths(b);
    setUsers(u);

    // Expand first store by default if none expanded
    if (expandedStoreIds.size === 0 && s.length > 0) {
      setExpandedStoreIds(new Set([s[0].id]));
    }
  };

  const loadCities = () => {
    setIsLoadingCities(true);
    setCityLoadError(null);
    try {
      const res = organizationService.getSupportedCities(currentUser);
      if (!res.success) {
        setCityLoadError(res.error || 'Cities could not be loaded. Please refresh and try again.');
        setAvailableCities([]);
      } else {
        setAvailableCities(res.cities);
        setCityLoadError(null);
      }
    } catch {
      setCityLoadError('Cities could not be loaded. Please refresh and try again.');
      setAvailableCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  useEffect(() => {
    loadData();
    loadCities();
    const unsubscribe = organizationService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedStoreIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedStoreIds(next);
  };

  // KPIs
  const totalStores = stores.filter((s) => s.status !== 'Archived').length;
  const activeStores = stores.filter((s) => s.status === 'Active').length;
  const totalBooths = booths.filter((b) => b.status !== 'Archived').length;
  const activeBooths = booths.filter((b) => b.status === 'Active').length;
  const totalStaffAssigned = users.filter((u) => u.boothId && u.status === 'Active').length;
  const totalDevicesAssigned = booths.reduce((acc, b) => acc + b.assignedDeviceIds.length, 0);

  // Filtered stores
  const filteredStores = stores.filter((store) => {
    if (statusFilter !== 'All' && store.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchStore =
        store.storeName.toLowerCase().includes(q) ||
        store.storeNumber.toLowerCase().includes(q) ||
        (store.cityName && store.cityName.toLowerCase().includes(q)) ||
        (store.physicalAddress && store.physicalAddress.toLowerCase().includes(q)) ||
        (store.location && store.location.toLowerCase().includes(q));
      if (!matchStore) {
        // Match child booths
        const childBooths = booths.filter((b) => b.storeId === store.id);
        const matchBooth = childBooths.some(
          (b) =>
            b.boothName.toLowerCase().includes(q) ||
            b.boothNumber.toLowerCase().includes(q) ||
            b.assignedStaffNames.some((n) => n.toLowerCase().includes(q))
        );
        if (!matchBooth) return false;
      }
    }
    return true;
  });

  // Filtered booths
  const filteredBooths = booths.filter((booth) => {
    if (statusFilter !== 'All' && booth.status !== statusFilter) return false;
    if (selectedStoreFilter !== 'All' && booth.storeId !== selectedStoreFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = booth.boothName.toLowerCase().includes(q);
      const matchNum = booth.boothNumber.toLowerCase().includes(q);
      const matchStore = booth.storeName.toLowerCase().includes(q);
      const matchStaff = booth.assignedStaffNames.some((n) => n.toLowerCase().includes(q));
      if (!matchName && !matchNum && !matchStore && !matchStaff) return false;
    }
    return true;
  });

  // Handlers for Store Modal
  const openCreateStore = () => {
    setEditingStore(null);
    setStoreForm({
      storeName: '',
      storeNumber: '',
      cityId: '',
      cityName: '',
      province: '',
      physicalAddress: '',
      status: 'Active',
    });
    setStoreFormErrors({});
    setIsSubmittingStore(false);
    setShowStoreModal(true);
  };

  const openEditStore = (store: StoreWithStats) => {
    setEditingStore(store);
    let cityId = store.cityId || '';
    let cityName = store.cityName || '';
    let province = store.province || '';

    // If cityId not stored directly, resolve from location or availableCities
    if (!cityId && availableCities.length > 0 && store.location) {
      const matchCity = availableCities.find((c) =>
        store.location!.toLowerCase().includes(c.cityName.toLowerCase())
      );
      if (matchCity) {
        cityId = matchCity.cityId;
        cityName = matchCity.cityName;
        province = matchCity.province || '';
      }
    } else if (cityId && !province && availableCities.length > 0) {
      const matchCity = availableCities.find((c) => c.cityId === cityId);
      if (matchCity?.province) {
        province = matchCity.province;
      }
    }

    setStoreForm({
      storeName: store.storeName,
      storeNumber: store.storeNumber,
      cityId,
      cityName,
      province,
      physicalAddress: store.physicalAddress || store.location || '',
      status: store.status,
    });
    setStoreFormErrors({});
    setIsSubmittingStore(false);
    setShowStoreModal(true);
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFeedback(null);

    const errors: {
      cityId?: string;
      storeName?: string;
      storeNumber?: string;
      physicalAddress?: string;
      general?: string;
    } = {};

    // Validate in required field order: City, Store Name, Store Code, Physical Location
    if (!storeForm.cityId.trim()) {
      errors.cityId = 'Please select a city.';
    }
    if (!storeForm.storeName.trim()) {
      errors.storeName = 'Store name is required.';
    }
    if (!storeForm.storeNumber.trim()) {
      errors.storeNumber = 'Store code or number is required.';
    }
    if (!storeForm.physicalAddress.trim()) {
      errors.physicalAddress = 'Physical location is required.';
    }

    if (Object.keys(errors).length > 0) {
      setStoreFormErrors(errors);
      // Focus first invalid field in order
      if (errors.cityId) {
        cityDropdownTriggerRef.current?.focus();
      } else if (errors.storeName) {
        storeNameInputRef.current?.focus();
      } else if (errors.storeNumber) {
        storeNumberInputRef.current?.focus();
      } else if (errors.physicalAddress) {
        physicalAddressInputRef.current?.focus();
      }
      return;
    }

    // Check unique store code within business
    const duplicate = stores.some(
      (s) =>
        (!editingStore || s.id !== editingStore.id) &&
        s.businessId === currentUser.businessId &&
        s.storeNumber.trim().toLowerCase() === storeForm.storeNumber.trim().toLowerCase() &&
        s.status !== 'Archived'
    );
    if (duplicate) {
      setStoreFormErrors({
        storeNumber: `Store code or number "${storeForm.storeNumber}" already exists in this business.`,
      });
      storeNumberInputRef.current?.focus();
      return;
    }

    setIsSubmittingStore(true);
    setStoreFormErrors({});

    if (editingStore) {
      const res = organizationService.updateStore(currentUser, editingStore.id, {
        storeName: storeForm.storeName,
        storeNumber: storeForm.storeNumber,
        storeCode: storeForm.storeNumber,
        cityId: storeForm.cityId,
        cityName: storeForm.cityName,
        province: storeForm.province,
        physicalAddress: storeForm.physicalAddress,
        status: storeForm.status,
      });
      setIsSubmittingStore(false);
      if (!res.success) {
        setStoreFormErrors({ general: res.error || 'Failed to update store.' });
        return;
      }
      setFeedback({ type: 'success', message: 'Store updated successfully.' });
      setShowStoreModal(false);
      loadData();
    } else {
      const res = organizationService.createStore(currentUser, {
        storeName: storeForm.storeName,
        storeNumber: storeForm.storeNumber,
        storeCode: storeForm.storeNumber,
        cityId: storeForm.cityId,
        cityName: storeForm.cityName,
        province: storeForm.province,
        physicalAddress: storeForm.physicalAddress,
      });
      setIsSubmittingStore(false);
      if (!res.success) {
        setStoreFormErrors({ general: res.error || 'Failed to create store.' });
        return;
      }
      setFeedback({ type: 'success', message: 'Store created successfully.' });
      setShowStoreModal(false);
      loadData();
    }
  };

  // Handlers for Booth Modal
  const openCreateBooth = (storeId?: string) => {
    setEditingBooth(null);
    setBoothForm({
      storeId: storeId || (stores[0]?.id ?? ''),
      boothName: '',
      boothNumber: '',
      status: 'Active',
    });
    setShowBoothModal(true);
  };

  const openEditBooth = (booth: BoothWithDetails) => {
    setEditingBooth(booth);
    setBoothForm({
      storeId: booth.storeId,
      boothName: booth.boothName,
      boothNumber: booth.boothNumber,
      status: booth.status,
    });
    setShowBoothModal(true);
  };

  const handleSaveBooth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFeedback(null);

    if (editingBooth) {
      const res = organizationService.updateBooth(currentUser, editingBooth.id, {
        boothName: boothForm.boothName,
        boothNumber: boothForm.boothNumber,
        status: boothForm.status,
      });
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to update booth.' });
        return;
      }
      setFeedback({ type: 'success', message: `Booth "${boothForm.boothName}" successfully updated.` });
      loadData();
    } else {
      const res = organizationService.createBooth(currentUser, {
        storeId: boothForm.storeId,
        boothName: boothForm.boothName,
        boothNumber: boothForm.boothNumber,
      });
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to create booth.' });
        return;
      }
      setFeedback({ type: 'success', message: `Booth "${boothForm.boothName}" successfully registered.` });
      loadData();
    }
    setShowBoothModal(false);
  };

  // Delete Handlers
  const openDelete = (type: 'store' | 'booth', id: string, name: string, number?: string) => {
    setDeleteTarget({
      type,
      id,
      name,
      storeNumber: type === 'store' ? number : undefined,
      boothNumber: type === 'booth' ? number : undefined,
    });
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!currentUser || !deleteTarget || isDeleting) return;

    if (currentUser.role !== 'business_owner') {
      setDeleteError('Forbidden: Only an authorized Business Owner can delete stores and booths.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    if (deleteTarget.type === 'store') {
      const res = organizationService.deleteStore(currentUser, deleteTarget.id);
      setIsDeleting(false);
      if (!res.success) {
        setDeleteError(res.error || 'Failed to delete store.');
        return;
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadData();
      setFeedback({ type: 'success', message: 'Store deleted successfully.' });
    } else {
      const res = organizationService.deleteBooth(currentUser, deleteTarget.id);
      setIsDeleting(false);
      if (!res.success) {
        setDeleteError(res.error || 'Failed to delete booth.');
        return;
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadData();
      setFeedback({ type: 'success', message: 'Booth deleted successfully.' });
    }
  };

  // Staff Assignment Handlers
  const openAssignStaff = (preselectedUserId?: string, preStoreId?: string, preBoothId?: string) => {
    setAssignForm({
      userId: preselectedUserId || (users.find((u) => u.role === 'agent')?.id ?? ''),
      storeId: preStoreId || (stores[0]?.id ?? ''),
      boothId: preBoothId || '',
      reason: '',
    });
    setShowAssignModal(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFeedback(null);

    const res = organizationService.assignOrMoveStaff(currentUser, {
      userId: assignForm.userId,
      newStoreId: assignForm.storeId || null,
      newBoothId: assignForm.boothId || null,
      reason: assignForm.reason || 'Station assignment updated via Stores & Booths console',
    });

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to assign staff.' });
      return;
    }

    const assignedUser = users.find((u) => u.id === assignForm.userId);
    const destBooth = booths.find((b) => b.id === assignForm.boothId);
    setFeedback({
      type: 'success',
      message: `${assignedUser?.firstName || 'Staff member'} assigned to ${
        destBooth?.boothName || 'Unassigned'
      } successfully.`,
    });
    setShowAssignModal(false);
  };

  // Manage Staff Handlers
  const openManageStaff = (booth: BoothWithDetails) => {
    setManagingBooth(booth);
    const initialStaffId = booth.assignedStaffIds[0] || '';
    setSelectedStaffToManage(initialStaffId);
    setManageAction('move');
    setManageTargetStoreId(booth.storeId);
    setManageTargetBoothId('');
    setManageReason('');
    setShowManageStaffModal(true);
  };

  const handleExecuteManageStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !managingBooth || !selectedStaffToManage) return;
    setFeedback(null);

    const staffMember = users.find((u) => u.id === selectedStaffToManage);
    const staffName = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff member';

    if (manageAction === 'unassign') {
      const res = organizationService.assignOrMoveStaff(currentUser, {
        userId: selectedStaffToManage,
        newStoreId: managingBooth.storeId,
        newBoothId: null,
        reason: manageReason || `Unassigned from service booth ${managingBooth.boothName}`,
      });

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to unassign staff.' });
        return;
      }

      setFeedback({
        type: 'success',
        message: `${staffName} unassigned from ${managingBooth.boothName}.`,
      });
    } else {
      if (!manageTargetBoothId) {
        setFeedback({ type: 'error', message: 'Please select a destination service booth.' });
        return;
      }

      const destBooth = booths.find((b) => b.id === manageTargetBoothId);
      const res = organizationService.assignOrMoveStaff(currentUser, {
        userId: selectedStaffToManage,
        newStoreId: manageTargetStoreId || managingBooth.storeId,
        newBoothId: manageTargetBoothId,
        reason: manageReason || `Relocated from ${managingBooth.boothName} to ${destBooth?.boothName || 'new booth'}`,
      });

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to move staff.' });
        return;
      }

      setFeedback({
        type: 'success',
        message: `${staffName} successfully relocated to ${destBooth?.boothName || 'new station'}.`,
      });
    }

    setShowManageStaffModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 py-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Organization Management</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Physical Infrastructure</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isBusinessOwner ? (
            <>
              <button
                id="btn-assign-staff-header"
                onClick={() => openAssignStaff()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
                Assign / Move Staff
              </button>
              <button
                id="btn-add-booth-header"
                onClick={() => openCreateBooth()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                Add Booth
              </button>
              <button
                id="btn-add-store-header"
                onClick={openCreateStore}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Store
              </button>
            </>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg border border-slate-200">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Viewing as Business Admin (Read-only infrastructure)</span>
            </div>
          )}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl px-4.5 py-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 min-h-[52px]">
          <div className="flex items-center gap-2.5 whitespace-nowrap min-w-0">
            <span className="text-xs font-semibold text-slate-600">Total Stores</span>
            <span className="text-xl font-bold text-slate-900 leading-none">{totalStores}</span>
          </div>
          <Building2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
        </div>

        <div className="bg-white rounded-xl px-4.5 py-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 min-h-[52px]">
          <div className="flex items-center gap-2.5 whitespace-nowrap min-w-0">
            <span className="text-xs font-semibold text-slate-600">Active Booths</span>
            <span className="text-xl font-bold text-slate-900 leading-none">{activeBooths}</span>
          </div>
          <Layers className="w-4.5 h-4.5 text-teal-600 shrink-0" />
        </div>

        <div className="bg-white rounded-xl px-4.5 py-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 min-h-[52px]">
          <div className="flex items-center gap-2.5 whitespace-nowrap min-w-0">
            <span className="text-xs font-semibold text-slate-600">Assigned Staff</span>
            <span className="text-xl font-bold text-slate-900 leading-none">{totalStaffAssigned}</span>
          </div>
          <Users className="w-4.5 h-4.5 text-cyan-600 shrink-0" />
        </div>

        <div className="bg-white rounded-xl px-4.5 py-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 min-h-[52px]">
          <div className="flex items-center gap-2.5 whitespace-nowrap min-w-0">
            <span className="text-xs font-semibold text-slate-600">Assigned Devices</span>
            <span className="text-xl font-bold text-slate-900 leading-none">{totalDevicesAssigned}</span>
          </div>
          <Smartphone className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
        </div>
      </div>

      {/* Navigation Tabs & Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            <button
              id="tab-hierarchy"
              onClick={() => setActiveTab('hierarchy')}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'hierarchy'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Store Hierarchy
            </button>
            <button
              id="tab-booths"
              onClick={() => setActiveTab('booths')}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'booths'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              All Booths ({booths.length})
            </button>
            <button
              id="tab-assignments"
              onClick={() => setActiveTab('assignments')}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'assignments'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Staff Assignments
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-stores"
                type="text"
                placeholder="Search store, booth, staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white w-48 sm:w-64"
              />
            </div>

            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* TAB 1: STORE HIERARCHY VIEW */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-4 pt-1">
            {filteredStores.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-sm">No stores found matching your filters.</p>
              </div>
            ) : (
              filteredStores.map((store) => {
                const isExpanded = expandedStoreIds.has(store.id);
                const storeBooths = booths.filter((b) => b.storeId === store.id);

                return (
                  <div
                    key={store.id}
                    id={`store-card-${store.id}`}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    {/* Store Header Row */}
                    <div className="p-4 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleExpand(store.id)}
                          className="mt-0.5 p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                          aria-label="Expand/collapse"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-base">{store.storeName}</h3>
                            <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-slate-200 text-slate-800 rounded">
                              {store.storeNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                store.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : store.status === 'Inactive'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {store.status}
                            </span>
                          </div>

                          {(store.physicalAddress || store.cityName || store.location) && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{formatStoreLocation(store.physicalAddress || store.location, store.cityName)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Store Meta & Actions */}
                      <div className="flex items-center gap-4 text-xs text-slate-600 pl-8 md:pl-0">
                        <div className="flex items-center gap-3">
                          <span className="font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200">
                            {store.boothCount} {store.boothCount === 1 ? 'Booth' : 'Booths'}
                          </span>
                          <span className="font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200">
                            {store.assignedStaffCount} Staff
                          </span>
                          <span className="font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200">
                            {store.assignedDeviceCount} Devices
                          </span>
                        </div>

                        {isBusinessOwner && (
                          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                            <button
                              onClick={() => openCreateBooth(store.id)}
                              className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              title="Add Booth"
                              aria-label="Add Booth"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditStore(store)}
                              className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              title="Edit Store"
                              aria-label="Edit Store"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openDelete('store', store.id, store.storeName, store.storeNumber)}
                              className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                              title="Delete Store"
                              aria-label="Delete Store"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booths Under Store (Expanded) */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 divide-y divide-slate-100 bg-white">
                        {storeBooths.length === 0 ? (
                          <div className="py-6 px-8 text-center text-xs text-slate-400">
                            No active booths registered in this store yet.
                            {isBusinessOwner && (
                              <button
                                onClick={() => openCreateBooth(store.id)}
                                className="ml-2 font-semibold text-emerald-700 hover:underline"
                              >
                                + Add first booth
                              </button>
                            )}
                          </div>
                        ) : (
                          storeBooths.map((booth) => (
                            <div
                              key={booth.id}
                              id={`booth-row-${booth.id}`}
                              className="p-3.5 pl-8 sm:pl-12 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {booth.boothNumber}
                                  </span>
                                  <span className="font-semibold text-slate-900 text-sm">{booth.boothName}</span>
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                      booth.status === 'Active'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : booth.status === 'Inactive'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {booth.status}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-slate-400" />
                                    <span>
                                      {booth.assignedStaffNames.length > 0
                                        ? booth.assignedStaffNames.join(', ')
                                        : 'No staff assigned'}
                                    </span>
                                  </div>

                                  {booth.assignedDeviceNames.length > 0 && (
                                    <div className="flex items-center gap-1 text-slate-400">
                                      <span>•</span>
                                      <Smartphone className="w-3 h-3 text-indigo-500" />
                                      <span>{booth.assignedDeviceNames.join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Booth Actions */}
                              <div className="flex items-center gap-2 text-xs">
                                {isBusinessOwner && (
                                  <>
                                    {booth.assignedStaffIds.length === 0 ? (
                                      <button
                                        onClick={() => openAssignStaff(undefined, store.id, booth.id)}
                                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors border border-emerald-200"
                                      >
                                        Assign Staff
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => openManageStaff(booth)}
                                        className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors border border-teal-200"
                                      >
                                        Manage Staff
                                      </button>
                                    )}
                                    <button
                                      onClick={() => openEditBooth(booth)}
                                      className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                      title="Edit Booth"
                                      aria-label="Edit Booth"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openDelete('booth', booth.id, booth.boothName, booth.boothNumber)}
                                      className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                                      title="Delete Booth"
                                      aria-label="Delete Booth"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: ALL BOOTHS DIRECTORY TABLE */}
        {activeTab === 'booths' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Booth Details</th>
                    <th className="py-3 px-4">Store Location</th>
                    <th className="py-3 px-4">Assigned Operators</th>
                    <th className="py-3 px-4">Mapped Devices</th>
                    <th className="py-3 px-4">Status</th>
                    {isBusinessOwner && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooths.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No booths match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBooths.map((booth) => (
                      <tr key={booth.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-sm">{booth.boothName}</div>
                          <span className="text-slate-400 font-mono text-[11px]">{booth.boothNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {booth.storeName}
                        </td>
                        <td className="py-3.5 px-4">
                          {booth.assignedStaffNames.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {booth.assignedStaffNames.map((name, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {booth.assignedDeviceNames.length > 0 ? (
                            <span className="font-medium text-indigo-700">
                              {booth.assignedDeviceNames.join(', ')}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                              booth.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : booth.status === 'Inactive'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {booth.status}
                          </span>
                        </td>
                        {isBusinessOwner && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {booth.assignedStaffIds.length === 0 ? (
                                <button
                                  onClick={() => openAssignStaff(undefined, booth.storeId, booth.id)}
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200"
                                >
                                  Assign Staff
                                </button>
                              ) : (
                                <button
                                  onClick={() => openManageStaff(booth)}
                                  className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200"
                                >
                                  Manage Staff
                                </button>
                              )}
                              <button
                                onClick={() => openEditBooth(booth)}
                                className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                title="Edit Booth"
                                aria-label="Edit Booth"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openDelete('booth', booth.id, booth.boothName, booth.boothNumber)}
                                className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                                title="Delete Booth"
                                aria-label="Delete Booth"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF STATION ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Current Branch Store</th>
                    <th className="py-3 px-4">Service Booth</th>
                    <th className="py-3 px-4">Account Status</th>
                    {isBusinessOwner && <th className="py-3 px-4 text-right">Station Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const assignedStore = stores.find((s) => s.id === u.storeId);
                    const assignedBooth = booths.find((b) => b.id === u.boothId);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-sm">
                            {u.firstName} {u.lastName}
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {u.username} • {u.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              u.role === 'business_owner'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'business_admin'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {u.role === 'business_owner'
                              ? 'Owner'
                              : u.role === 'business_admin'
                              ? 'Admin'
                              : 'Agent'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {assignedStore ? assignedStore.storeName : <span className="text-slate-400 italic">Unassigned</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          {assignedBooth ? (
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              {assignedBooth.boothName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No booth</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                              u.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        {isBusinessOwner && (
                          <td className="py-3.5 px-4 text-right">
                            {u.role !== 'business_owner' && (
                              <button
                                onClick={() => openAssignStaff(u.id, u.storeId, u.boothId)}
                                className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                              >
                                {u.boothId ? 'Manage Station' : 'Assign Station'}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL: ADD / EDIT STORE */}
      {/* ========================================== */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingStore ? 'Edit Branch Store' : 'Add New Branch Store'}
              </h3>
              <button
                type="button"
                onClick={() => setShowStoreModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Submission Error Banner (if any) */}
            {storeFormErrors.general && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 animate-fadeIn shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{storeFormErrors.general}</span>
              </div>
            )}

            {/* Modal Form */}
            <form
              onSubmit={handleSaveStore}
              noValidate
              className="space-y-4 text-xs pt-4 overflow-y-auto flex-1 pr-0.5"
            >
              {/* 1. City * */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <CityDropdown
                  selectedCityId={storeForm.cityId}
                  onSelectCity={(city) => {
                    setStoreForm((prev) => ({
                      ...prev,
                      cityId: city.cityId,
                      cityName: city.cityName,
                      province: city.province || '',
                    }));
                    if (storeFormErrors.cityId) {
                      setStoreFormErrors((prev) => ({ ...prev, cityId: undefined }));
                    }
                  }}
                  disabled={isSubmittingStore}
                  error={storeFormErrors.cityId}
                  cities={availableCities}
                  isLoading={isLoadingCities}
                  loadError={cityLoadError}
                  onRefreshCities={loadCities}
                  triggerRef={cityDropdownTriggerRef}
                />
                {!storeForm.cityId && !editingStore && (
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    Please select a city first before entering remaining store information.
                  </p>
                )}
              </div>

              {/* 2. Store Name * */}
              <div>
                <label htmlFor="store-name-input" className="block text-slate-700 font-semibold mb-1">
                  Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={storeNameInputRef}
                  id="store-name-input"
                  type="text"
                  disabled={!storeForm.cityId || isSubmittingStore}
                  placeholder={storeForm.cityId ? "e.g. Cairo Road Flagship Store" : "Select city first..."}
                  value={storeForm.storeName}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, storeName: e.target.value });
                    if (storeFormErrors.storeName) {
                      setStoreFormErrors((prev) => ({ ...prev, storeName: undefined }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 min-h-[38px] text-xs transition-colors ${
                    !storeForm.cityId
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : storeFormErrors.storeName
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20 text-slate-900'
                      : 'border-slate-300 focus:ring-emerald-500 bg-white text-slate-900'
                  }`}
                />
                {storeFormErrors.storeName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{storeFormErrors.storeName}</span>
                  </p>
                )}
              </div>

              {/* 3. Store Code / Number * */}
              <div>
                <label htmlFor="store-number-input" className="block text-slate-700 font-semibold mb-1">
                  Store Code / Number <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={storeNumberInputRef}
                  id="store-number-input"
                  type="text"
                  disabled={!storeForm.cityId || isSubmittingStore}
                  placeholder={storeForm.cityId ? "e.g. STR-004" : "Select city first..."}
                  value={storeForm.storeNumber}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, storeNumber: e.target.value });
                    if (storeFormErrors.storeNumber) {
                      setStoreFormErrors((prev) => ({ ...prev, storeNumber: undefined }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 min-h-[38px] text-xs font-mono transition-colors ${
                    !storeForm.cityId
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : storeFormErrors.storeNumber
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20 text-slate-900'
                      : 'border-slate-300 focus:ring-emerald-500 bg-white text-slate-900'
                  }`}
                />
                {storeFormErrors.storeNumber ? (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{storeFormErrors.storeNumber}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Unique store identifier within your agency business.</p>
                )}
              </div>

              {/* 4. Physical Location * */}
              <div>
                <label htmlFor="store-address-input" className="block text-slate-700 font-semibold mb-1">
                  Physical Location <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={physicalAddressInputRef}
                  id="store-address-input"
                  type="text"
                  disabled={!storeForm.cityId || isSubmittingStore}
                  placeholder={storeForm.cityId ? "e.g. Plot 4821, Cairo Road, Central Business District" : "Select city first..."}
                  value={storeForm.physicalAddress}
                  onChange={(e) => {
                    setStoreForm({ ...storeForm, physicalAddress: e.target.value });
                    if (storeFormErrors.physicalAddress) {
                      setStoreFormErrors((prev) => ({ ...prev, physicalAddress: undefined }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 min-h-[38px] text-xs transition-colors ${
                    !storeForm.cityId
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : storeFormErrors.physicalAddress
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20 text-slate-900'
                      : 'border-slate-300 focus:ring-emerald-500 bg-white text-slate-900'
                  }`}
                />
                {storeFormErrors.physicalAddress ? (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{storeFormErrors.physicalAddress}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Physical street address or plot location (city is recorded separately).</p>
                )}
              </div>

              {/* Status (when editing) */}
              {editingStore && (
                <div>
                  <label htmlFor="store-status-select" className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    id="store-status-select"
                    value={storeForm.status}
                    onChange={(e) => setStoreForm({ ...storeForm, status: e.target.value as StoreStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[38px] bg-white text-slate-900 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              {/* 5. Cancel and Create/Save Store buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStoreModal(false)}
                  disabled={isSubmittingStore}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStore || !!cityLoadError}
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingStore && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {editingStore
                      ? isSubmittingStore
                        ? 'Saving Store...'
                        : 'Save Store'
                      : isSubmittingStore
                      ? 'Creating Store...'
                      : 'Create Store'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ADD / EDIT BOOTH */}
      {/* ========================================== */}
      {showBoothModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingBooth ? 'Edit Service Booth' : 'Add Service Booth'}
              </h3>
              <button
                onClick={() => setShowBoothModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooth} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Branch Store <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!!editingBooth}
                  value={boothForm.storeId}
                  onChange={(e) => setBoothForm({ ...boothForm, storeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                >
                  {stores
                    .filter((s) => s.status !== 'Archived')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.storeName} ({s.storeNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Booth Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter 1 - Cash & Float Desk"
                  value={boothForm.boothName}
                  onChange={(e) => setBoothForm({ ...boothForm, boothName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Booth Code / Till Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BTH-004"
                  value={boothForm.boothNumber}
                  onChange={(e) => setBoothForm({ ...boothForm, boothNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {editingBooth && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={boothForm.status}
                    onChange={(e) => setBoothForm({ ...boothForm, status: e.target.value as BoothStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBoothModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-xs"
                >
                  {editingBooth ? 'Save Booth' : 'Create Booth'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ASSIGN / MOVE STAFF */}
      {/* ========================================== */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-lg">Deploy / Reassign Staff</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignForm.userId}
                  onChange={(e) => {
                    const u = users.find((usr) => usr.id === e.target.value);
                    setAssignForm({
                      ...assignForm,
                      userId: e.target.value,
                      storeId: u?.storeId || stores[0]?.id || '',
                      boothId: u?.boothId || '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {users
                    .filter((u) => u.role !== 'business_owner')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.role === 'business_admin' ? 'Admin' : 'Agent'})
                        {u.boothId ? ' [Assigned]' : ' [Unassigned]'}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Branch Store</label>
                <select
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
                  <option value="">-- Unassign from store --</option>
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
                <label className="block text-slate-700 font-semibold mb-1">Target Service Booth</label>
                <select
                  value={assignForm.boothId}
                  onChange={(e) => setAssignForm({ ...assignForm, boothId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Unassign from booth --</option>
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
                  Reason for Station Assignment / Relocation
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Weekly shift rotation, opening coverage, counter workload balancing..."
                  value={assignForm.reason}
                  onChange={(e) => setAssignForm({ ...assignForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-800 text-[11px] leading-relaxed">
                Assigning staff to this booth will safely close their previous active station deployment in the organization audit trail.
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
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-xs"
                >
                  Confirm Station Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: MANAGE STAFF (MOVE / UNASSIGN) */}
      {/* ========================================== */}
      {showManageStaffModal && managingBooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Manage Stationed Staff</h3>
                  <p className="text-xs text-slate-500">{managingBooth.boothName} ({managingBooth.boothNumber})</p>
                </div>
              </div>
              <button
                onClick={() => setShowManageStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteManageStaff} className="space-y-4 text-xs">
              {/* Select Staff Member if multiple assigned */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedStaffToManage}
                  onChange={(e) => setSelectedStaffToManage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {managingBooth.assignedStaffIds.map((uid) => {
                    const usr = users.find((u) => u.id === uid);
                    return (
                      <option key={uid} value={uid}>
                        {usr ? `${usr.firstName} ${usr.lastName} (${usr.email})` : uid}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Action selection: Move vs Unassign */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManageAction('move')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      manageAction === 'move'
                        ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Move to Another Booth
                  </button>
                  <button
                    type="button"
                    onClick={() => setManageAction('unassign')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      manageAction === 'unassign'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    Unassign from Booth
                  </button>
                </div>
              </div>

              {manageAction === 'move' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Destination Branch Store</label>
                    <select
                      value={manageTargetStoreId}
                      onChange={(e) => {
                        setManageTargetStoreId(e.target.value);
                        setManageTargetBoothId('');
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
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
                      Destination Service Booth <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={manageTargetBoothId}
                      onChange={(e) => setManageTargetBoothId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">-- Choose destination booth --</option>
                      {booths
                        .filter(
                          (b) =>
                            b.storeId === manageTargetStoreId &&
                            b.id !== managingBooth.id &&
                            b.status === 'Active'
                        )
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.boothName} ({b.boothNumber})
                            {b.assignedStaffNames.length > 0 ? ` [${b.assignedStaffNames.join(', ')}]` : ' [Vacant]'}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              {manageAction === 'unassign' && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                  <strong>Unassign Notice:</strong> The staff member will be removed from this service booth and marked as unassigned. Their account remains active and available for future station deployments.
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Staff Adjustment <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Station rotation, cover relief, counter closure..."
                  value={manageReason}
                  onChange={(e) => setManageReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManageStaffModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!manageReason.trim() || (manageAction === 'move' && !manageTargetBoothId)}
                  className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg font-semibold shadow-xs"
                >
                  {manageAction === 'move' ? 'Confirm Relocation' : 'Confirm Unassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: PERMANENT DELETE CONFIRMATION */}
      {/* ========================================== */}
      {showDeleteModal && deleteTarget && (() => {
        const targetStore = deleteTarget.type === 'store' ? stores.find((s) => s.id === deleteTarget.id) : null;
        const targetBooth = deleteTarget.type === 'booth' ? booths.find((b) => b.id === deleteTarget.id) : null;

        const storeName = targetStore?.storeName || deleteTarget.name;
        const storeNumber = targetStore?.storeNumber || deleteTarget.storeNumber || '—';
        const boothName = targetBooth?.boothName || deleteTarget.name;
        const boothNumber = targetBooth?.boothNumber || deleteTarget.boothNumber || '—';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {deleteTarget.type === 'store' ? 'Delete Store?' : 'Delete Booth?'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Error Banner (if deletion blocked by dependencies or failed) */}
              {deleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{deleteError}</div>
                </div>
              )}

              {/* Store Confirmation Body */}
              {deleteTarget.type === 'store' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Store Name:</span>
                      <span className="font-bold text-slate-900">{storeName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Store Number:</span>
                      <span className="font-mono font-semibold text-slate-800">{storeNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Number of booths:</span>
                      <span className="font-semibold text-slate-800">{targetStore?.boothCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Number of assigned staff:</span>
                      <span className="font-semibold text-slate-800">{targetStore?.assignedStaffCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Number of mapped devices:</span>
                      <span className="font-semibold text-slate-800">{targetStore?.assignedDeviceCount ?? 0}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Are you sure you want to permanently delete this store? This action cannot be undone. All booths under this store will also be deleted. Assigned staff will be unassigned and mapped devices will be unmapped.
                  </p>
                </div>
              )}

              {/* Booth Confirmation Body */}
              {deleteTarget.type === 'booth' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Are you sure you want to permanently delete <strong className="text-slate-900">{boothName}</strong> ({boothNumber})? This action cannot be undone. Assigned staff will be unassigned and mapped devices will be unmapped.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{deleteTarget.type === 'store' ? 'Delete Store' : 'Delete Booth'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
