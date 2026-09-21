import { AuthenticatedUser } from '../types/auth';
import {
  Store,
  Booth,
  OrgUser,
  StaffBoothAssignment,
  Device,
  DeviceAssignment,
  BalanceAdjustment,
  OrganizationAuditLog,
  StoreWithStats,
  BoothWithDetails,
  DeviceWithDetails,
  BalanceType,
  AdjustmentDirection,
  OrgUserStatus,
  DeviceStatus,
  StoreStatus,
  BoothStatus,
} from '../types/organization';
import {
  INITIAL_STORES,
  INITIAL_BOOTHS,
  INITIAL_USERS,
  INITIAL_STAFF_ASSIGNMENTS,
  INITIAL_DEVICES,
  INITIAL_DEVICE_ASSIGNMENTS,
  INITIAL_BALANCE_ADJUSTMENTS,
  INITIAL_AUDIT_LOGS,
  hashPasscode,
} from '../data/mockOrganizationData';
import { MOCK_AGENTS } from '../data/mockAgentData';

const STORAGE_KEYS = {
  STORES: 'tellerbud_org_stores_v1',
  BOOTHS: 'tellerbud_org_booths_v1',
  USERS: 'tellerbud_org_users_v1',
  STAFF_ASSIGNMENTS: 'tellerbud_org_staff_assignments_v1',
  DEVICES: 'tellerbud_org_devices_v1',
  DEVICE_ASSIGNMENTS: 'tellerbud_org_device_assignments_v1',
  ADJUSTMENTS: 'tellerbud_org_adjustments_v1',
  AUDIT_LOGS: 'tellerbud_org_audit_logs_v1',
};

class OrganizationService {
  private stores: Store[] = [];
  private booths: Booth[] = [];
  private users: OrgUser[] = [];
  private staffAssignments: StaffBoothAssignment[] = [];
  private devices: Device[] = [];
  private deviceAssignments: DeviceAssignment[] = [];
  private balanceAdjustments: BalanceAdjustment[] = [];
  private auditLogs: OrganizationAuditLog[] = [];
  private listeners: Array<() => void> = [];
  private idempotencyKeys: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const sStores = localStorage.getItem(STORAGE_KEYS.STORES);
      this.stores = sStores ? JSON.parse(sStores) : [...INITIAL_STORES];

      const sBooths = localStorage.getItem(STORAGE_KEYS.BOOTHS);
      this.booths = sBooths ? JSON.parse(sBooths) : [...INITIAL_BOOTHS];

      const sUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = sUsers ? JSON.parse(sUsers) : [...INITIAL_USERS];

      const sStaff = localStorage.getItem(STORAGE_KEYS.STAFF_ASSIGNMENTS);
      this.staffAssignments = sStaff ? JSON.parse(sStaff) : [...INITIAL_STAFF_ASSIGNMENTS];

      const sDevices = localStorage.getItem(STORAGE_KEYS.DEVICES);
      this.devices = sDevices ? JSON.parse(sDevices) : [...INITIAL_DEVICES];

      const sDevAss = localStorage.getItem(STORAGE_KEYS.DEVICE_ASSIGNMENTS);
      this.deviceAssignments = sDevAss ? JSON.parse(sDevAss) : [...INITIAL_DEVICE_ASSIGNMENTS];

      const sAdj = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
      this.balanceAdjustments = sAdj ? JSON.parse(sAdj) : [...INITIAL_BALANCE_ADJUSTMENTS];

      const sAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = sAudit ? JSON.parse(sAudit) : [...INITIAL_AUDIT_LOGS];
    } catch (e) {
      console.error('Failed to load organization data from storage:', e);
      this.resetToDefaults();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(this.stores));
      localStorage.setItem(STORAGE_KEYS.BOOTHS, JSON.stringify(this.booths));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.STAFF_ASSIGNMENTS, JSON.stringify(this.staffAssignments));
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(this.devices));
      localStorage.setItem(STORAGE_KEYS.DEVICE_ASSIGNMENTS, JSON.stringify(this.deviceAssignments));
      localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(this.balanceAdjustments));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error('Failed to save organization data to storage:', e);
    }
    this.notify();
  }

  private resetToDefaults() {
    this.stores = [...INITIAL_STORES];
    this.booths = [...INITIAL_BOOTHS];
    this.users = [...INITIAL_USERS];
    this.staffAssignments = [...INITIAL_STAFF_ASSIGNMENTS];
    this.devices = [...INITIAL_DEVICES];
    this.deviceAssignments = [...INITIAL_DEVICE_ASSIGNMENTS];
    this.balanceAdjustments = [...INITIAL_BALANCE_ADJUSTMENTS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.saveToStorage();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Multi-tenant resolver
  private getTenantBusinessId(actor: AuthenticatedUser | null): string {
    if (!actor) throw new Error('Unauthorized: Authentication required.');
    if (actor.role === 'super_admin') {
      return actor.businessId || 'BIZ-LUS-001';
    }
    if (!actor.businessId) throw new Error('Unauthorized: No business affiliation found for user.');
    return actor.businessId;
  }

  // Audit logger
  private logAuditEvent(params: {
    businessId: string;
    eventType: string;
    entityType: OrganizationAuditLog['entityType'];
    entityId: string;
    affectedName?: string;
    previousValue?: string;
    newValue?: string;
    reason?: string;
    actor: AuthenticatedUser;
    storeId?: string;
    storeName?: string;
    boothId?: string;
    boothName?: string;
  }) {
    const auditRef = `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: OrganizationAuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      auditReference: auditRef,
      businessId: params.businessId,
      eventType: params.eventType,
      entityType: params.entityType,
      entityId: params.entityId,
      affectedName: params.affectedName,
      previousValue: params.previousValue,
      newValue: params.newValue,
      reason: params.reason,
      actorUserId: params.actor.uid,
      actorName: params.actor.fullName,
      actorRole: params.actor.roleLabel || params.actor.role,
      createdAt: new Date().toISOString(),
      storeId: params.storeId,
      storeName: params.storeName,
      boothId: params.boothId,
      boothName: params.boothName,
    };
    this.auditLogs.unshift(newEntry);
  }

  // ==========================================
  // STORES MANAGEMENT
  // ==========================================

  public getStores(actor: AuthenticatedUser | null): StoreWithStats[] {
    const businessId = this.getTenantBusinessId(actor);
    const tenantStores = this.stores.filter((s) => s.businessId === businessId);

    return tenantStores.map((store) => {
      const boothsInStore = this.booths.filter(
        (b) => b.storeId === store.id && b.status !== 'Archived'
      );
      const activeStaff = this.staffAssignments.filter(
        (sa) => sa.storeId === store.id && sa.isActive
      );
      const activeDevices = this.deviceAssignments.filter(
        (da) => da.storeId === store.id && da.isActive
      );

      return {
        ...store,
        boothCount: boothsInStore.length,
        assignedStaffCount: activeStaff.length,
        assignedDeviceCount: activeDevices.length,
      };
    });
  }

  public getStoreById(actor: AuthenticatedUser | null, storeId: string): Store | null {
    const businessId = this.getTenantBusinessId(actor);
    const store = this.stores.find((s) => s.id === storeId && s.businessId === businessId);
    return store || null;
  }

  public createStore(
    actor: AuthenticatedUser,
    data: { storeName: string; storeNumber: string; location?: string }
  ): { success: boolean; error?: string; store?: Store } {
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can create stores.' };
    }
    const businessId = this.getTenantBusinessId(actor);

    if (!data.storeName.trim()) {
      return { success: false, error: 'Store Name is required.' };
    }
    if (!data.storeNumber.trim()) {
      return { success: false, error: 'Store Number is required.' };
    }

    // Check unique storeNumber within business
    const exists = this.stores.some(
      (s) =>
        s.businessId === businessId &&
        s.storeNumber.trim().toLowerCase() === data.storeNumber.trim().toLowerCase() &&
        s.status !== 'Archived'
    );
    if (exists) {
      return { success: false, error: `Store number "${data.storeNumber}" already exists in this business.` };
    }

    const newStore: Store = {
      id: `STR-LUS-${Date.now().toString().slice(-4)}`,
      businessId,
      storeName: data.storeName.trim(),
      storeNumber: data.storeNumber.trim(),
      location: data.location?.trim() || undefined,
      status: 'Active',
      createdAt: new Date().toISOString(),
      createdBy: actor.uid,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.uid,
    };

    this.stores.push(newStore);
    this.logAuditEvent({
      businessId,
      eventType: 'Store Created',
      entityType: 'Store',
      entityId: newStore.id,
      affectedName: `${newStore.storeName} (${newStore.storeNumber})`,
      previousValue: 'None',
      newValue: `Store Name: ${newStore.storeName}, Store Number: ${newStore.storeNumber}`,
      reason: 'New store branch registered in organization',
      actor,
      storeId: newStore.id,
      storeName: newStore.storeName,
    });

    this.saveToStorage();
    return { success: true, store: newStore };
  }

  public updateStore(
    actor: AuthenticatedUser,
    storeId: string,
    data: { storeName: string; storeNumber: string; location?: string; status?: StoreStatus }
  ): { success: boolean; error?: string; store?: Store } {
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can update stores.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const index = this.stores.findIndex((s) => s.id === storeId && s.businessId === businessId);
    if (index === -1) {
      return { success: false, error: 'Store not found in your business.' };
    }

    const current = this.stores[index];

    // Check duplicate storeNumber
    const duplicate = this.stores.some(
      (s) =>
        s.id !== storeId &&
        s.businessId === businessId &&
        s.storeNumber.trim().toLowerCase() === data.storeNumber.trim().toLowerCase() &&
        s.status !== 'Archived'
    );
    if (duplicate) {
      return { success: false, error: `Store number "${data.storeNumber}" is already in use by another store.` };
    }

    const previousValue = `Name: ${current.storeName}, Number: ${current.storeNumber}, Status: ${current.status}`;
    const updatedStore: Store = {
      ...current,
      storeName: data.storeName.trim() || current.storeName,
      storeNumber: data.storeNumber.trim() || current.storeNumber,
      location: data.location !== undefined ? data.location.trim() : current.location,
      status: data.status || current.status,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.uid,
    };

    this.stores[index] = updatedStore;
    this.logAuditEvent({
      businessId,
      eventType: 'Store Updated',
      entityType: 'Store',
      entityId: updatedStore.id,
      affectedName: `${updatedStore.storeName} (${updatedStore.storeNumber})`,
      previousValue,
      newValue: `Name: ${updatedStore.storeName}, Number: ${updatedStore.storeNumber}, Status: ${updatedStore.status}`,
      reason: 'Store details updated by Business Owner',
      actor,
      storeId: updatedStore.id,
      storeName: updatedStore.storeName,
    });

    this.saveToStorage();
    return { success: true, store: updatedStore };
  }

  public archiveStore(
    actor: AuthenticatedUser,
    storeId: string,
    reason: string
  ): { success: boolean; error?: string } {
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can archive stores.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const store = this.stores.find((s) => s.id === storeId && s.businessId === businessId);
    if (!store) {
      return { success: false, error: 'Store not found.' };
    }

    // Check if active booths exist
    const activeBooths = this.booths.filter(
      (b) => b.storeId === storeId && b.status === 'Active'
    );
    if (activeBooths.length > 0) {
      return {
        success: false,
        error: `Cannot archive store with ${activeBooths.length} active booth(s). Please archive or move booths first.`,
      };
    }

    // Check if active staff assigned
    const activeStaff = this.staffAssignments.filter(
      (sa) => sa.storeId === storeId && sa.isActive
    );
    if (activeStaff.length > 0) {
      return {
        success: false,
        error: `Cannot archive store with ${activeStaff.length} assigned staff member(s). Please reassign staff first.`,
      };
    }

    store.status = 'Archived';
    store.updatedAt = new Date().toISOString();
    store.updatedBy = actor.uid;

    this.logAuditEvent({
      businessId,
      eventType: 'Store Archived',
      entityType: 'Store',
      entityId: store.id,
      affectedName: `${store.storeName} (${store.storeNumber})`,
      previousValue: 'Status: Active',
      newValue: 'Status: Archived',
      reason: reason || 'Store archived by Business Owner',
      actor,
      storeId: store.id,
      storeName: store.storeName,
    });

    this.saveToStorage();
    return { success: true };
  }

  // ==========================================
  // BOOTHS MANAGEMENT
  // ==========================================

  public getBooths(actor: AuthenticatedUser | null, storeId?: string): BoothWithDetails[] {
    const businessId = this.getTenantBusinessId(actor);
    let tenantBooths = this.booths.filter((b) => b.businessId === businessId);
    if (storeId) {
      tenantBooths = tenantBooths.filter((b) => b.storeId === storeId);
    }

    return tenantBooths.map((booth) => {
      const store = this.stores.find((s) => s.id === booth.storeId);
      const activeStaff = this.staffAssignments.filter(
        (sa) => sa.boothId === booth.id && sa.isActive
      );
      const staffMembers = activeStaff
        .map((sa) => this.users.find((u) => u.id === sa.userId))
        .filter((u): u is OrgUser => !!u);

      const activeDevices = this.deviceAssignments.filter(
        (da) => da.boothId === booth.id && da.isActive
      );
      const devices = activeDevices
        .map((da) => this.devices.find((d) => d.id === da.deviceId))
        .filter((d): d is Device => !!d);

      return {
        ...booth,
        storeName: store?.storeName || 'Unknown Store',
        assignedStaffNames: staffMembers.map((u) => `${u.firstName} ${u.lastName}`),
        assignedStaffIds: staffMembers.map((u) => u.id),
        assignedDeviceNames: devices.map((d) => d.deviceName),
        assignedDeviceIds: devices.map((d) => d.deviceId),
      };
    });
  }

  public createBooth(
    actor: AuthenticatedUser,
    data: { storeId: string; boothName: string; boothNumber: string }
  ): { success: boolean; error?: string; booth?: Booth } {
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can create booths.' };
    }
    const businessId = this.getTenantBusinessId(actor);

    if (!data.storeId) {
      return { success: false, error: 'Store must be selected.' };
    }
    if (!data.boothName.trim()) {
      return { success: false, error: 'Booth Name is required.' };
    }
    if (!data.boothNumber.trim()) {
      return { success: false, error: 'Booth Number is required.' };
    }

    const store = this.stores.find((s) => s.id === data.storeId && s.businessId === businessId);
    if (!store) {
      return { success: false, error: 'Selected Store not found.' };
    }

    // Unique boothNumber within store
    const duplicate = this.booths.some(
      (b) =>
        b.storeId === data.storeId &&
        b.boothNumber.trim().toLowerCase() === data.boothNumber.trim().toLowerCase() &&
        b.status !== 'Archived'
    );
    if (duplicate) {
      return {
        success: false,
        error: `Booth number "${data.boothNumber}" already exists in ${store.storeName}.`,
      };
    }

    const newBooth: Booth = {
      id: `BTH-LUS-${Date.now().toString().slice(-4)}`,
      businessId,
      storeId: data.storeId,
      boothName: data.boothName.trim(),
      boothNumber: data.boothNumber.trim(),
      status: 'Active',
      createdAt: new Date().toISOString(),
      createdBy: actor.uid,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.uid,
    };

    this.booths.push(newBooth);
    this.logAuditEvent({
      businessId,
      eventType: 'Booth Created',
      entityType: 'Booth',
      entityId: newBooth.id,
      affectedName: `${newBooth.boothName} (${newBooth.boothNumber})`,
      previousValue: 'None',
      newValue: `Booth: ${newBooth.boothName}, Number: ${newBooth.boothNumber} in ${store.storeName}`,
      reason: 'New service till created in store',
      actor,
      storeId: store.id,
      storeName: store.storeName,
      boothId: newBooth.id,
      boothName: newBooth.boothName,
    });

    this.saveToStorage();
    return { success: true, booth: newBooth };
  }

  public updateBooth(
    actor: AuthenticatedUser,
    boothId: string,
    data: { boothName: string; boothNumber: string; status?: BoothStatus }
  ): { success: boolean; error?: string; booth?: Booth } {
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can update booths.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const index = this.booths.findIndex((b) => b.id === boothId && b.businessId === businessId);
    if (index === -1) {
      return { success: false, error: 'Booth not found.' };
    }

    const current = this.booths[index];
    const store = this.stores.find((s) => s.id === current.storeId);

    // Check duplicate
    const duplicate = this.booths.some(
      (b) =>
        b.id !== boothId &&
        b.storeId === current.storeId &&
        b.boothNumber.trim().toLowerCase() === data.boothNumber.trim().toLowerCase() &&
        b.status !== 'Archived'
    );
    if (duplicate) {
      return { success: false, error: `Booth number "${data.boothNumber}" is already in use in this store.` };
    }

    const previousValue = `Name: ${current.boothName}, Number: ${current.boothNumber}, Status: ${current.status}`;
    const updatedBooth: Booth = {
      ...current,
      boothName: data.boothName.trim() || current.boothName,
      boothNumber: data.boothNumber.trim() || current.boothNumber,
      status: data.status || current.status,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.uid,
    };

    this.booths[index] = updatedBooth;
    this.logAuditEvent({
      businessId,
      eventType: 'Booth Updated',
      entityType: 'Booth',
      entityId: updatedBooth.id,
      affectedName: `${updatedBooth.boothName} (${updatedBooth.boothNumber})`,
      previousValue,
      newValue: `Name: ${updatedBooth.boothName}, Number: ${updatedBooth.boothNumber}, Status: ${updatedBooth.status}`,
      reason: 'Booth configuration updated',
      actor,
      storeId: store?.id,
      storeName: store?.storeName,
      boothId: updatedBooth.id,
      boothName: updatedBooth.boothName,
    });

    this.saveToStorage();
    return { success: true, booth: updatedBooth };
  }

  public archiveBooth(
    actor: AuthenticatedUser,
    boothId: string,
    reason: string
  ): { success: boolean; error?: string } {
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can archive booths.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const booth = this.booths.find((b) => b.id === boothId && b.businessId === businessId);
    if (!booth) {
      return { success: false, error: 'Booth not found.' };
    }

    // Require staff to be moved or unassigned first
    const activeStaff = this.staffAssignments.filter(
      (sa) => sa.boothId === boothId && sa.isActive
    );
    if (activeStaff.length > 0) {
      return {
        success: false,
        error: `Cannot archive booth. ${activeStaff.length} staff member(s) are currently assigned. Please move or unassign staff first.`,
      };
    }

    // Require devices to be moved or unmapped first
    const activeDevices = this.deviceAssignments.filter(
      (da) => da.boothId === boothId && da.isActive
    );
    if (activeDevices.length > 0) {
      return {
        success: false,
        error: `Cannot archive booth. ${activeDevices.length} device(s) are currently assigned. Please move or unmap devices first.`,
      };
    }

    booth.status = 'Archived';
    booth.updatedAt = new Date().toISOString();
    booth.updatedBy = actor.uid;

    const store = this.stores.find((s) => s.id === booth.storeId);

    this.logAuditEvent({
      businessId,
      eventType: 'Booth Archived',
      entityType: 'Booth',
      entityId: booth.id,
      affectedName: `${booth.boothName} (${booth.boothNumber})`,
      previousValue: 'Status: Active',
      newValue: 'Status: Archived',
      reason: reason || 'Booth archived by Business Owner',
      actor,
      storeId: store?.id,
      storeName: store?.storeName,
      boothId: booth.id,
      boothName: booth.boothName,
    });

    this.saveToStorage();
    return { success: true };
  }

  // ==========================================
  // STAFF-TO-BOOTH ASSIGNMENT
  // ==========================================

  public assignOrMoveStaff(
    actor: AuthenticatedUser,
    params: {
      userId: string;
      newStoreId?: string | null;
      newBoothId?: string | null;
      effectiveDate?: string;
      reason: string;
    }
  ): { success: boolean; error?: string } {
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can assign or move staff.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const user = this.users.find((u) => u.id === params.userId && u.businessId === businessId);
    if (!user) {
      return { success: false, error: 'Staff member not found.' };
    }

    // Close any previous active assignment
    const previousAssignment = this.staffAssignments.find(
      (sa) => sa.userId === params.userId && sa.isActive
    );

    const prevStore = previousAssignment
      ? this.stores.find((s) => s.id === previousAssignment.storeId)?.storeName
      : 'Unassigned';
    const prevBooth = previousAssignment
      ? this.booths.find((b) => b.id === previousAssignment.boothId)?.boothName
      : 'Unassigned';
    const previousValue = `${prevStore} > ${prevBooth}`;

    if (previousAssignment) {
      previousAssignment.isActive = false;
      previousAssignment.effectiveTo = new Date().toISOString();
    }

    let newValue = 'Unassigned';
    let destStoreName: string | undefined;
    let destBoothName: string | undefined;

    if (params.newStoreId && params.newBoothId) {
      const destStore = this.stores.find(
        (s) => s.id === params.newStoreId && s.businessId === businessId
      );
      const destBooth = this.booths.find(
        (b) => b.id === params.newBoothId && b.businessId === businessId
      );
      if (!destStore || !destBooth) {
        return { success: false, error: 'Destination store or booth not found.' };
      }
      destStoreName = destStore.storeName;
      destBoothName = destBooth.boothName;
      newValue = `${destStore.storeName} > ${destBooth.boothName}`;

      // Create new active assignment
      const newAssignment: StaffBoothAssignment = {
        id: `SBA-${Date.now()}`,
        businessId,
        userId: params.userId,
        storeId: params.newStoreId,
        boothId: params.newBoothId,
        effectiveFrom: params.effectiveDate || new Date().toISOString(),
        effectiveTo: null,
        isActive: true,
        reason: params.reason || 'Staff assignment updated',
        assignedBy: actor.uid,
      };
      this.staffAssignments.push(newAssignment);

      user.storeId = params.newStoreId;
      user.boothId = params.newBoothId;
    } else {
      // Unassigning
      user.storeId = undefined;
      user.boothId = undefined;
    }

    user.updatedAt = new Date().toISOString();
    user.updatedBy = actor.uid;

    const eventType = !params.newBoothId
      ? 'Staff Unassigned'
      : previousAssignment
      ? 'Staff Moved'
      : 'Staff Assigned';

    this.logAuditEvent({
      businessId,
      eventType,
      entityType: 'StaffAssignment',
      entityId: user.id,
      affectedName: `${user.firstName} ${user.lastName} (${user.id})`,
      previousValue,
      newValue,
      reason: params.reason || 'Staff booth location updated',
      actor,
      storeId: params.newStoreId || undefined,
      storeName: destStoreName,
      boothId: params.newBoothId || undefined,
      boothName: destBoothName,
    });

    this.saveToStorage();
    return { success: true };
  }

  public getStaffAssignmentHistory(actor: AuthenticatedUser | null, userId?: string) {
    const businessId = this.getTenantBusinessId(actor);
    let list = this.staffAssignments.filter((sa) => sa.businessId === businessId);
    if (userId) {
      list = list.filter((sa) => sa.userId === userId);
    }
    return list.sort(
      (a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
    );
  }

  // ==========================================
  // USERS & ROLES MANAGEMENT
  // ==========================================

  public getUsers(actor: AuthenticatedUser | null): OrgUser[] {
    const businessId = this.getTenantBusinessId(actor);
    return this.users.filter((u) => u.businessId === businessId);
  }

  public createUser(
    actor: AuthenticatedUser,
    data: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      phone?: string;
      role: 'business_admin' | 'agent';
      passcode: string;
      storeId?: string;
      boothId?: string;
      status?: OrgUserStatus;
    }
  ): { success: boolean; error?: string; user?: OrgUser } {
    // Permission checks
    if (actor.role === 'business_admin') {
      return { success: false, error: 'Forbidden: Business Admins cannot create users.' };
    }
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can create users.' };
    }
    if (data.role !== 'business_admin' && data.role !== 'agent') {
      return { success: false, error: 'Invalid role. Auditor is reserved for a future release.' };
    }

    const businessId = this.getTenantBusinessId(actor);

    if (!data.firstName.trim() || !data.lastName.trim()) {
      return { success: false, error: 'First Name and Last Name are required.' };
    }
    if (!data.username.trim()) {
      return { success: false, error: 'Username is required.' };
    }
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!data.passcode || data.passcode.length < 5) {
      return { success: false, error: 'Passcode must be at least 5 digits.' };
    }

    // Check unique username
    const usernameTaken = this.users.some(
      (u) => u.username.toLowerCase() === data.username.trim().toLowerCase()
    );
    if (usernameTaken) {
      return { success: false, error: `Username "${data.username}" is already registered.` };
    }

    // Check unique email
    const emailTaken = this.users.some(
      (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (emailTaken) {
      return { success: false, error: `Email "${data.email}" is already registered.` };
    }

    const userId =
      data.role === 'business_admin'
        ? `USR-BA-${Date.now().toString().slice(-4)}`
        : `TB-AGT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: OrgUser = {
      id: userId,
      businessId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim(),
      role: data.role,
      passcodeHash: hashPasscode(data.passcode),
      status: data.status || 'Active',
      storeId: data.storeId || undefined,
      boothId: data.boothId || undefined,
      createdAt: new Date().toISOString(),
      createdBy: actor.uid,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.uid,
    };

    this.users.push(newUser);

    // If assigned to a booth at creation
    if (data.storeId && data.boothId) {
      const assignment: StaffBoothAssignment = {
        id: `SBA-${Date.now()}`,
        businessId,
        userId: newUser.id,
        storeId: data.storeId,
        boothId: data.boothId,
        effectiveFrom: new Date().toISOString(),
        effectiveTo: null,
        isActive: true,
        reason: 'Initial assignment upon user onboarding',
        assignedBy: actor.uid,
      };
      this.staffAssignments.push(assignment);
    }

    const store = data.storeId ? this.stores.find((s) => s.id === data.storeId) : undefined;
    const booth = data.boothId ? this.booths.find((b) => b.id === data.boothId) : undefined;

    this.logAuditEvent({
      businessId,
      eventType: 'User Created',
      entityType: 'User',
      entityId: newUser.id,
      affectedName: `${newUser.firstName} ${newUser.lastName} (${newUser.username})`,
      previousValue: 'None',
      newValue: `Role: ${data.role === 'business_admin' ? 'Business Admin' : 'Agent'}, Status: ${newUser.status}`,
      reason: 'New organization user profile provisioned',
      actor,
      storeId: store?.id,
      storeName: store?.storeName,
      boothId: booth?.id,
      boothName: booth?.boothName,
    });

    this.saveToStorage();
    return { success: true, user: newUser };
  }

  public setUserStatus(
    actor: AuthenticatedUser,
    userId: string,
    newStatus: OrgUserStatus,
    reason?: string
  ): { success: boolean; error?: string; activeDevicesToUnmap?: Device[] } {
    const businessId = this.getTenantBusinessId(actor);
    const targetUser = this.users.find((u) => u.id === userId && u.businessId === businessId);
    if (!targetUser) {
      return { success: false, error: 'User not found in your business.' };
    }

    // Role enforcement
    if (actor.role === 'business_admin') {
      if (targetUser.role !== 'agent') {
        return {
          success: false,
          error: 'Forbidden: Business Admins can only activate or deactivate Agents.',
        };
      }
    } else if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Insufficient privileges to change user status.' };
    }

    const previousStatus = targetUser.status;
    targetUser.status = newStatus;
    targetUser.updatedAt = new Date().toISOString();
    targetUser.updatedBy = actor.uid;

    // If deactivating, check active devices
    let activeDevicesToUnmap: Device[] = [];
    if (newStatus !== 'Active') {
      const activeAssignments = this.deviceAssignments.filter(
        (da) => da.staffUserId === userId && da.isActive
      );
      activeDevicesToUnmap = activeAssignments
        .map((da) => this.devices.find((d) => d.id === da.deviceId))
        .filter((d): d is Device => !!d);
    }

    this.logAuditEvent({
      businessId,
      eventType: newStatus === 'Active' ? 'User Activated' : 'User Deactivated',
      entityType: 'User',
      entityId: targetUser.id,
      affectedName: `${targetUser.firstName} ${targetUser.lastName} (${targetUser.username})`,
      previousValue: `Status: ${previousStatus}`,
      newValue: `Status: ${newStatus}`,
      reason: reason || `Status set to ${newStatus} by ${actor.fullName}`,
      actor,
    });

    this.saveToStorage();
    return { success: true, activeDevicesToUnmap };
  }

  public resetPasscode(
    actor: AuthenticatedUser,
    params: {
      userId: string;
      newPasscode: string;
      reason: string;
    }
  ): { success: boolean; error?: string } {
    const businessId = this.getTenantBusinessId(actor);
    const targetUser = this.users.find((u) => u.id === params.userId && u.businessId === businessId);
    if (!targetUser) {
      return { success: false, error: 'User not found.' };
    }

    // Permission check
    if (actor.role === 'business_admin') {
      if (targetUser.role !== 'agent') {
        return {
          success: false,
          error: 'Forbidden: Business Admins can only reset passcodes for Agents.',
        };
      }
    } else if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Insufficient permissions to reset passcodes.' };
    }

    if (!params.newPasscode || params.newPasscode.length < 5) {
      return { success: false, error: 'New Passcode must be at least 5 digits.' };
    }
    if (!params.reason.trim()) {
      return { success: false, error: 'Reason for passcode reset is required.' };
    }

    // Securely hash passcode - never store plain text
    targetUser.passcodeHash = hashPasscode(params.newPasscode);
    targetUser.updatedAt = new Date().toISOString();
    targetUser.updatedBy = actor.uid;

    // Never record the actual passcode in the audit log
    this.logAuditEvent({
      businessId,
      eventType: 'Passcode Reset',
      entityType: 'Passcode',
      entityId: targetUser.id,
      affectedName: `${targetUser.firstName} ${targetUser.lastName} (${targetUser.id})`,
      previousValue: '[PROTECTED HASH]',
      newValue: '[PROTECTED HASH UPDATED]',
      reason: params.reason.trim(),
      actor,
    });

    this.saveToStorage();
    return { success: true };
  }

  // ==========================================
  // BALANCE ADJUSTMENTS (Business Owner Only)
  // ==========================================

  public getBalanceAdjustments(actor: AuthenticatedUser | null): BalanceAdjustment[] {
    const businessId = this.getTenantBusinessId(actor);
    return this.balanceAdjustments
      .filter((a) => a.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAgentCurrentBalance(
    actor: AuthenticatedUser | null,
    staffUserId: string,
    balanceType: BalanceType,
    providerId?: string | null
  ): number {
    const user = this.users.find((u) => u.id === staffUserId);
    if (!user) return 0;

    // Check mock agent data if matched
    const agent = MOCK_AGENTS.find((a) => a.id === staffUserId || a.name.includes(user.lastName));
    if (balanceType === 'Cash Balance') {
      return agent?.cashPosition ?? 12400.0;
    } else if (balanceType === 'MNO Balance') {
      if (providerId === 'MTN') return 15000.0;
      if (providerId === 'Airtel') return 9500.0;
      return 6000.0;
    } else {
      // Bank Balance
      if (providerId === 'Zanaco') return 23000.0;
      if (providerId === 'Stanbic') return 18500.0;
      return 12000.0;
    }
  }

  public createBalanceAdjustment(
    actor: AuthenticatedUser,
    params: {
      idempotencyKey?: string;
      staffUserId: string;
      balanceType: BalanceType;
      providerId?: string | null;
      direction: AdjustmentDirection;
      amount: number;
      reason: string;
      supportingReference?: string;
    }
  ): { success: boolean; error?: string; adjustment?: BalanceAdjustment } {
    // Only Business Owner can make adjustments
    if (actor.role !== 'business_owner') {
      return {
        success: false,
        error: 'Forbidden: Only the Business Owner is authorized to make balance adjustments.',
      };
    }

    const businessId = this.getTenantBusinessId(actor);

    // Idempotency check
    if (params.idempotencyKey) {
      if (this.idempotencyKeys.has(params.idempotencyKey)) {
        return { success: false, error: 'Duplicate request: This adjustment has already been processed.' };
      }
      this.idempotencyKeys.add(params.idempotencyKey);
    }

    if (params.amount <= 0 || isNaN(params.amount)) {
      return { success: false, error: 'Adjustment amount must be strictly greater than zero.' };
    }

    if (!params.reason.trim()) {
      return { success: false, error: 'Adjustment reason is mandatory.' };
    }

    if ((params.balanceType === 'MNO Balance' || params.balanceType === 'Bank Balance') && !params.providerId) {
      return { success: false, error: `Please select the applicable ${params.balanceType === 'MNO Balance' ? 'MNO Provider' : 'Bank'}.` };
    }

    const staff = this.users.find((u) => u.id === params.staffUserId && u.businessId === businessId);
    if (!staff) {
      return { success: false, error: 'Staff member not found.' };
    }

    const store = staff.storeId ? this.stores.find((s) => s.id === staff.storeId) : undefined;
    const booth = staff.boothId ? this.booths.find((b) => b.id === staff.boothId) : undefined;

    const previousBalance = this.getAgentCurrentBalance(
      actor,
      staff.id,
      params.balanceType,
      params.providerId
    );

    const delta = params.direction === 'Increase' ? params.amount : -params.amount;
    const newBalance = previousBalance + delta;

    if (newBalance < 0) {
      return {
        success: false,
        error: `Adjustment rejected: Resulting balance (ZMW ${newBalance.toFixed(
          2
        )}) cannot be negative. Current balance is ZMW ${previousBalance.toFixed(2)}.`,
      };
    }

    const adjRef = `ADJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAdjustment: BalanceAdjustment = {
      id: `ADJ-${Date.now()}`,
      adjustmentReference: adjRef,
      businessId,
      staffUserId: staff.id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      storeId: store?.id || 'UNASSIGNED',
      storeName: store?.storeName || 'Unassigned Store',
      boothId: booth?.id || 'UNASSIGNED',
      boothName: booth?.boothName || 'Unassigned Booth',
      balanceType: params.balanceType,
      providerId: params.providerId || null,
      direction: params.direction,
      amount: params.amount,
      previousBalance,
      newBalance,
      reason: params.reason.trim(),
      supportingReference: params.supportingReference?.trim() || undefined,
      status: 'Completed',
      createdAt: new Date().toISOString(),
      createdBy: actor.fullName,
    };

    // Atomic ledger entry addition
    this.balanceAdjustments.unshift(newAdjustment);

    // Update MOCK_AGENTS cashPosition if it's cash balance
    const ag = MOCK_AGENTS.find((a) => a.id === staff.id);
    if (ag && params.balanceType === 'Cash Balance') {
      ag.cashPosition = newBalance;
    }

    this.logAuditEvent({
      businessId,
      eventType: 'Balance Adjustment Created',
      entityType: 'BalanceAdjustment',
      entityId: newAdjustment.id,
      affectedName: `${staff.firstName} ${staff.lastName} (${staff.id})`,
      previousValue: `${params.balanceType}: ZMW ${previousBalance.toLocaleString('en-ZM', {
        minimumFractionDigits: 2,
      })}`,
      newValue: `${params.balanceType}: ZMW ${newBalance.toLocaleString('en-ZM', {
        minimumFractionDigits: 2,
      })} (${params.direction === 'Increase' ? '+' : '-'}ZMW ${params.amount.toLocaleString('en-ZM', {
        minimumFractionDigits: 2,
      })})`,
      reason: params.reason.trim(),
      actor,
      storeId: store?.id,
      storeName: store?.storeName,
      boothId: booth?.id,
      boothName: booth?.boothName,
    });

    this.saveToStorage();
    return { success: true, adjustment: newAdjustment };
  }

  public reverseBalanceAdjustment(
    actor: AuthenticatedUser,
    originalAdjustmentId: string,
    reversalReason: string
  ): { success: boolean; error?: string; reversalAdjustment?: BalanceAdjustment } {
    if (actor.role !== 'business_owner') {
      return { success: false, error: 'Forbidden: Only Business Owner can reverse balance adjustments.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const original = this.balanceAdjustments.find(
      (a) => a.id === originalAdjustmentId && a.businessId === businessId
    );
    if (!original) {
      return { success: false, error: 'Original adjustment record not found.' };
    }
    if (original.status === 'Reversed') {
      return { success: false, error: 'This adjustment has already been reversed.' };
    }
    if (!reversalReason.trim()) {
      return { success: false, error: 'Reversal reason is mandatory.' };
    }

    const reversedDirection: AdjustmentDirection =
      original.direction === 'Increase' ? 'Decrease' : 'Increase';

    const currentBalance = original.newBalance;
    const restoredBalance =
      reversedDirection === 'Increase'
        ? currentBalance + original.amount
        : currentBalance - original.amount;

    if (restoredBalance < 0) {
      return {
        success: false,
        error: `Cannot reverse adjustment: Resulting balance would be negative (ZMW ${restoredBalance.toFixed(
          2
        )}).`,
      };
    }

    const revRef = `REV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const reversalRecord: BalanceAdjustment = {
      id: `ADJ-${Date.now()}`,
      adjustmentReference: revRef,
      businessId,
      staffUserId: original.staffUserId,
      staffName: original.staffName,
      storeId: original.storeId,
      storeName: original.storeName,
      boothId: original.boothId,
      boothName: original.boothName,
      balanceType: original.balanceType,
      providerId: original.providerId,
      direction: reversedDirection,
      amount: original.amount,
      previousBalance: currentBalance,
      newBalance: restoredBalance,
      reason: `Reversal of ${original.adjustmentReference}: ${reversalReason.trim()}`,
      supportingReference: original.adjustmentReference,
      status: 'Completed',
      reversedAdjustmentId: original.id,
      createdAt: new Date().toISOString(),
      createdBy: actor.fullName,
    };

    original.status = 'Reversed';
    this.balanceAdjustments.unshift(reversalRecord);

    const ag = MOCK_AGENTS.find((a) => a.id === original.staffUserId);
    if (ag && original.balanceType === 'Cash Balance') {
      ag.cashPosition = restoredBalance;
    }

    this.logAuditEvent({
      businessId,
      eventType: 'Balance Adjustment Reversed',
      entityType: 'BalanceAdjustment',
      entityId: reversalRecord.id,
      affectedName: `${original.staffName} (${original.staffUserId})`,
      previousValue: `Adj Ref ${original.adjustmentReference}: ZMW ${currentBalance.toFixed(2)}`,
      newValue: `Reversal ${reversalRecord.adjustmentReference}: Restored to ZMW ${restoredBalance.toFixed(2)}`,
      reason: reversalReason.trim(),
      actor,
      storeId: original.storeId,
      storeName: original.storeName,
      boothId: original.boothId,
      boothName: original.boothName,
    });

    this.saveToStorage();
    return { success: true, reversalAdjustment: reversalRecord };
  }

  // ==========================================
  // DEVICE MANAGEMENT (Business Owner & Business Admin)
  // ==========================================

  public getDevices(actor: AuthenticatedUser | null): DeviceWithDetails[] {
    const isSuperAdmin = actor?.role === 'super_admin';
    let targetDevices = [...this.devices];

    if (!isSuperAdmin) {
      const businessId = this.getTenantBusinessId(actor);
      targetDevices = targetDevices.filter((d) => d.allocatedBusinessId === businessId);
    }

    return targetDevices.map((device) => {
      const activeAssignment = this.deviceAssignments.find(
        (da) => da.deviceId === device.id && da.isActive
      );
      const staff = activeAssignment?.staffUserId
        ? this.users.find((u) => u.id === activeAssignment.staffUserId)
        : undefined;
      const store = activeAssignment?.storeId
        ? this.stores.find((s) => s.id === activeAssignment.storeId)
        : undefined;
      const booth = activeAssignment?.boothId
        ? this.booths.find((b) => b.id === activeAssignment.boothId)
        : undefined;

      return {
        ...device,
        businessName: device.allocatedBusinessId
          ? 'Lusaka Central Express Agency'
          : 'Unallocated (Platform Inventory)',
        assignedStaffName: staff ? `${staff.firstName} ${staff.lastName}` : undefined,
        assignedStaffId: staff?.id,
        storeName: store?.storeName,
        storeId: store?.id,
        boothName: booth?.boothName,
        boothId: booth?.id,
        lastActivity: 'Today, 11:15 AM',
      };
    });
  }

  public assignDevice(
    actor: AuthenticatedUser,
    params: {
      deviceId: string;
      staffUserId: string;
      storeId: string;
      boothId: string;
      reason: string;
    }
  ): { success: boolean; error?: string } {
    if (actor.role !== 'business_owner' && actor.role !== 'business_admin') {
      return { success: false, error: 'Forbidden: Insufficient privileges to assign devices.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const device = this.devices.find(
      (d) => d.id === params.deviceId && d.allocatedBusinessId === businessId
    );
    if (!device) {
      return { success: false, error: 'Device not found or not allocated to your business.' };
    }
    if (device.status === 'Decommissioned') {
      return { success: false, error: 'Cannot assign a decommissioned device.' };
    }

    const staff = this.users.find((u) => u.id === params.staffUserId && u.businessId === businessId);
    if (!staff) {
      return { success: false, error: 'Staff member not found in your business.' };
    }

    const store = this.stores.find((s) => s.id === params.storeId && s.businessId === businessId);
    const booth = this.booths.find((b) => b.id === params.boothId && b.businessId === businessId);
    if (!store || !booth) {
      return { success: false, error: 'Store or Booth not found.' };
    }

    // Check device doesn't have active assignment already
    const prevAssignment = this.deviceAssignments.find(
      (da) => da.deviceId === device.id && da.isActive
    );
    const prevStaff = prevAssignment?.staffUserId
      ? this.users.find((u) => u.id === prevAssignment.staffUserId)
      : null;
    const previousValue = prevAssignment
      ? `Assigned to ${prevStaff?.firstName || 'Staff'} at Booth ${prevAssignment.boothId}`
      : `Status: ${device.status}`;

    if (prevAssignment) {
      prevAssignment.isActive = false;
      prevAssignment.effectiveTo = new Date().toISOString();
    }

    // Create new active device assignment
    const newAssignment: DeviceAssignment = {
      id: `DA-${Date.now()}`,
      deviceId: device.id,
      businessId,
      staffUserId: staff.id,
      storeId: store.id,
      boothId: booth.id,
      effectiveFrom: new Date().toISOString(),
      effectiveTo: null,
      isActive: true,
      reason: params.reason || 'Device mapped to staff and booth',
      assignedBy: actor.uid,
    };
    this.deviceAssignments.push(newAssignment);

    device.status = 'Assigned';

    this.logAuditEvent({
      businessId,
      eventType: prevAssignment ? 'Device Reassigned' : 'Device Assigned',
      entityType: 'DeviceAssignment',
      entityId: device.id,
      affectedName: `${device.deviceName} (${device.deviceId})`,
      previousValue,
      newValue: `Assigned to ${staff.firstName} ${staff.lastName} at ${store.storeName} > ${booth.boothName}`,
      reason: params.reason || 'Device deployment',
      actor,
      storeId: store.id,
      storeName: store.storeName,
      boothId: booth.id,
      boothName: booth.boothName,
    });

    this.saveToStorage();
    return { success: true };
  }

  public moveDevice(
    actor: AuthenticatedUser,
    params: {
      deviceId: string;
      newStoreId: string;
      newBoothId: string;
      reason: string;
    }
  ): { success: boolean; error?: string } {
    if (actor.role !== 'business_owner' && actor.role !== 'business_admin') {
      return { success: false, error: 'Forbidden: Insufficient privileges to move devices.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const device = this.devices.find(
      (d) => d.id === params.deviceId && d.allocatedBusinessId === businessId
    );
    if (!device) {
      return { success: false, error: 'Device not found.' };
    }
    if (device.status === 'Decommissioned') {
      return { success: false, error: 'Cannot move a decommissioned device.' };
    }

    const currentAssignment = this.deviceAssignments.find(
      (da) => da.deviceId === device.id && da.isActive
    );
    if (!currentAssignment) {
      return { success: false, error: 'Device is not currently assigned to any booth.' };
    }

    const destStore = this.stores.find((s) => s.id === params.newStoreId && s.businessId === businessId);
    const destBooth = this.booths.find((b) => b.id === params.newBoothId && b.businessId === businessId);
    if (!destStore || !destBooth) {
      return { success: false, error: 'Destination store or booth not found.' };
    }

    const prevStore = this.stores.find((s) => s.id === currentAssignment.storeId)?.storeName || 'Store';
    const prevBooth = this.booths.find((b) => b.id === currentAssignment.boothId)?.boothName || 'Booth';
    const previousValue = `${prevStore} > ${prevBooth}`;

    // Close old assignment
    currentAssignment.isActive = false;
    currentAssignment.effectiveTo = new Date().toISOString();

    // Create new assignment at destination booth with same staff or updated
    const newAssignment: DeviceAssignment = {
      id: `DA-${Date.now()}`,
      deviceId: device.id,
      businessId,
      staffUserId: currentAssignment.staffUserId,
      storeId: destStore.id,
      boothId: destBooth.id,
      effectiveFrom: new Date().toISOString(),
      effectiveTo: null,
      isActive: true,
      reason: params.reason || 'Device relocated between booths',
      assignedBy: actor.uid,
    };
    this.deviceAssignments.push(newAssignment);

    device.status = 'Assigned';

    this.logAuditEvent({
      businessId,
      eventType: 'Device Moved',
      entityType: 'DeviceAssignment',
      entityId: device.id,
      affectedName: `${device.deviceName} (${device.deviceId})`,
      previousValue,
      newValue: `${destStore.storeName} > ${destBooth.boothName}`,
      reason: params.reason || 'Device moved between booths',
      actor,
      storeId: destStore.id,
      storeName: destStore.storeName,
      boothId: destBooth.id,
      boothName: destBooth.boothName,
    });

    this.saveToStorage();
    return { success: true };
  }

  public unmapDevice(
    actor: AuthenticatedUser,
    deviceId: string,
    reason: string
  ): { success: boolean; error?: string } {
    if (actor.role !== 'business_owner' && actor.role !== 'business_admin') {
      return { success: false, error: 'Forbidden: Insufficient privileges to unmap devices.' };
    }
    const businessId = this.getTenantBusinessId(actor);
    const device = this.devices.find(
      (d) => d.id === deviceId && d.allocatedBusinessId === businessId
    );
    if (!device) {
      return { success: false, error: 'Device not found.' };
    }

    const currentAssignment = this.deviceAssignments.find(
      (da) => da.deviceId === device.id && da.isActive
    );
    if (currentAssignment) {
      currentAssignment.isActive = false;
      currentAssignment.effectiveTo = new Date().toISOString();
    }

    device.status = 'Unmapped';

    this.logAuditEvent({
      businessId,
      eventType: 'Device Unmapped',
      entityType: 'DeviceAssignment',
      entityId: device.id,
      affectedName: `${device.deviceName} (${device.deviceId})`,
      previousValue: 'Status: Assigned',
      newValue: 'Status: Unmapped',
      reason: reason || 'Device unmapped from station',
      actor,
    });

    this.saveToStorage();
    return { success: true };
  }

  public decommissionDevice(
    actor: AuthenticatedUser,
    deviceId: string,
    reason: string
  ): { success: boolean; error?: string } {
    if (actor.role !== 'business_owner' && actor.role !== 'business_admin' && actor.role !== 'super_admin') {
      return { success: false, error: 'Forbidden: Insufficient privileges to decommission devices.' };
    }
    if (!reason.trim()) {
      return { success: false, error: 'Decommissioning reason is required.' };
    }

    const isSuperAdmin = actor.role === 'super_admin';
    const businessId = isSuperAdmin ? undefined : this.getTenantBusinessId(actor);

    const device = this.devices.find((d) =>
      isSuperAdmin ? d.id === deviceId : d.id === deviceId && d.allocatedBusinessId === businessId
    );
    if (!device) {
      return { success: false, error: 'Device not found.' };
    }

    // Close any active assignment
    const currentAssignment = this.deviceAssignments.find(
      (da) => da.deviceId === device.id && da.isActive
    );
    if (currentAssignment) {
      currentAssignment.isActive = false;
      currentAssignment.effectiveTo = new Date().toISOString();
    }

    const previousStatus = device.status;
    device.status = 'Decommissioned';
    device.decommissionReason = reason.trim();
    device.decommissionedAt = new Date().toISOString();
    device.decommissionedBy = actor.fullName;

    this.logAuditEvent({
      businessId: device.allocatedBusinessId || 'PLATFORM',
      eventType: 'Device Decommissioned',
      entityType: 'Device',
      entityId: device.id,
      affectedName: `${device.deviceName} (${device.deviceId})`,
      previousValue: `Status: ${previousStatus}`,
      newValue: 'Status: Decommissioned',
      reason: reason.trim(),
      actor,
    });

    this.saveToStorage();
    return { success: true };
  }

  // ==========================================
  // TELLERBUD ADMIN ALLOCATION
  // ==========================================

  public registerDevice(
    actor: AuthenticatedUser,
    data: {
      deviceName: string;
      deviceType: string;
      serialNumber: string;
      allocatedBusinessId?: string | null;
    }
  ): { success: boolean; error?: string; device?: Device } {
    if (actor.role !== 'super_admin') {
      return { success: false, error: 'Forbidden: Only TellerBud Admin can register devices.' };
    }
    if (!data.deviceName.trim() || !data.serialNumber.trim() || !data.deviceType.trim()) {
      return { success: false, error: 'Device Name, Device Type and Serial Number are required.' };
    }

    const duplicateSN = this.devices.some(
      (d) => d.serialNumber.toLowerCase() === data.serialNumber.trim().toLowerCase()
    );
    if (duplicateSN) {
      return { success: false, error: `Serial Number "${data.serialNumber}" is already registered.` };
    }

    const newDevice: Device = {
      id: `DEV-${Date.now().toString().slice(-4)}`,
      deviceId: `DEV-${data.deviceType.startsWith('POS') ? 'POS' : 'TRM'}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      deviceName: data.deviceName.trim(),
      deviceType: data.deviceType.trim(),
      serialNumber: data.serialNumber.trim(),
      allocatedBusinessId: data.allocatedBusinessId || null,
      status: 'Available',
      registeredAt: new Date().toISOString(),
      registeredBy: actor.fullName,
    };

    this.devices.push(newDevice);

    this.logAuditEvent({
      businessId: newDevice.allocatedBusinessId || 'PLATFORM',
      eventType: 'Device Registered',
      entityType: 'Device',
      entityId: newDevice.id,
      affectedName: `${newDevice.deviceName} (${newDevice.deviceId})`,
      previousValue: 'None',
      newValue: `Registered serial ${newDevice.serialNumber}. Allocated to: ${
        newDevice.allocatedBusinessId || 'Platform Inventory'
      }`,
      reason: 'New hardware terminal cataloged by TellerBud Admin',
      actor,
    });

    this.saveToStorage();
    return { success: true, device: newDevice };
  }

  public allocateDeviceToBusiness(
    actor: AuthenticatedUser,
    deviceId: string,
    businessId: string | null,
    reason?: string
  ): { success: boolean; error?: string } {
    if (actor.role !== 'super_admin') {
      return { success: false, error: 'Forbidden: Only TellerBud Admin can allocate devices to businesses.' };
    }

    const device = this.devices.find((d) => d.id === deviceId);
    if (!device) {
      return { success: false, error: 'Device not found.' };
    }
    if (device.status === 'Decommissioned') {
      return { success: false, error: 'Cannot allocate a decommissioned device.' };
    }

    const prevBiz = device.allocatedBusinessId || 'Platform Inventory (Unallocated)';
    const newBiz = businessId || 'Platform Inventory (Unallocated)';

    // Close any previous booth/staff assignments
    const activeAss = this.deviceAssignments.find((da) => da.deviceId === device.id && da.isActive);
    if (activeAss) {
      activeAss.isActive = false;
      activeAss.effectiveTo = new Date().toISOString();
    }

    device.allocatedBusinessId = businessId;
    device.status = 'Available';

    this.logAuditEvent({
      businessId: businessId || 'PLATFORM',
      eventType: 'Device Allocated',
      entityType: 'Device',
      entityId: device.id,
      affectedName: `${device.deviceName} (${device.deviceId})`,
      previousValue: `Business: ${prevBiz}`,
      newValue: `Business: ${newBiz}`,
      reason: reason || 'Device allocation updated by TellerBud Admin',
      actor,
    });

    this.saveToStorage();
    return { success: true };
  }

  // ==========================================
  // ORGANIZATION AUDIT TRAIL
  // ==========================================

  public getAuditTrail(actor: AuthenticatedUser | null): OrganizationAuditLog[] {
    const isSuperAdmin = actor?.role === 'super_admin';
    if (isSuperAdmin) {
      return [...this.auditLogs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    const businessId = this.getTenantBusinessId(actor);
    return this.auditLogs
      .filter((l) => l.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAuditLogs(actor: AuthenticatedUser | null): OrganizationAuditLog[] {
    return this.getAuditTrail(actor);
  }

  public getAllUsers(): OrgUser[] {
    return [...this.users];
  }

  public getAllGlobalDevices(): Device[] {
    return [...this.devices];
  }

  public registerGlobalDevice(device: Device): void {
    this.devices.push(device);
    this.saveToStorage();
  }
}

export const organizationService = new OrganizationService();
