import { UserRole } from './auth';

export type StoreStatus = 'Active' | 'Inactive' | 'Archived';
export type BoothStatus = 'Active' | 'Inactive' | 'Archived';
export type OrgUserStatus = 'Active' | 'Inactive' | 'Suspended';
export type DeviceStatus = 'Available' | 'Assigned' | 'Unmapped' | 'Inactive' | 'Decommissioned';
export type DeviceType = 'POS Terminal' | 'mPOS' | 'Biometric Scanner' | 'PIN Pad' | 'Smartphone Terminal';
export type BalanceType = 'Cash Balance' | 'MNO Balance' | 'Bank Balance';
export type AdjustmentDirection = 'Increase' | 'Decrease';
export type AdjustmentStatus = 'Completed' | 'Pending';

export type OrgEntityType =
  | 'Store'
  | 'Booth'
  | 'StaffAssignment'
  | 'User'
  | 'Passcode'
  | 'BalanceAdjustment'
  | 'Device'
  | 'DeviceAssignment';

export interface Store {
  id: string;
  businessId: string;
  storeName: string;
  storeNumber: string;
  storeCode?: string;
  cityId?: string;
  cityName?: string;
  province?: string;
  physicalAddress?: string;
  location?: string;
  status: StoreStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Booth {
  id: string;
  businessId: string;
  storeId: string;
  boothName: string;
  boothNumber: string;
  status: BoothStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface OrgUser {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  passcodeHash: string;
  status: OrgUserStatus;
  storeId?: string;
  boothId?: string;
  lastActiveAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface StaffBoothAssignment {
  id: string;
  businessId: string;
  userId: string;
  storeId: string;
  boothId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  reason: string;
  assignedBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  serialNumber: string;
  allocatedBusinessId?: string | null;
  status: DeviceStatus;
  registeredAt: string;
  registeredBy: string;
  decommissionReason?: string;
  decommissionedAt?: string;
  decommissionedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DeviceAssignment {
  id: string;
  deviceId: string;
  businessId: string;
  staffUserId?: string | null;
  storeId?: string | null;
  boothId?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  reason: string;
  assignedBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface BalanceAdjustment {
  id: string;
  adjustmentReference: string;
  businessId: string;
  staffUserId: string;
  staffName?: string;
  storeId: string;
  storeName?: string;
  boothId: string;
  boothName?: string;
  balanceType: BalanceType;
  providerId?: string | null;
  direction: AdjustmentDirection;
  amount: number;
  previousBalance: number;
  newBalance: number;
  reason: string;
  supportingReference?: string;
  status: AdjustmentStatus;
  reversedAdjustmentId?: string;
  createdAt: string;
  createdBy: string;
}

export interface OrganizationAuditLog {
  id: string;
  auditReference: string;
  businessId: string;
  eventType: string;
  entityType: OrgEntityType;
  entityId: string;
  affectedName?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  actorUserId: string;
  actorName: string;
  actorRole: string;
  createdAt: string;
  storeId?: string;
  storeName?: string;
  boothId?: string;
  boothName?: string;
}

export interface StoreWithStats extends Store {
  boothCount: number;
  assignedStaffCount: number;
  assignedDeviceCount: number;
}

export interface BoothWithDetails extends Booth {
  storeName: string;
  assignedStaffNames: string[];
  assignedStaffIds: string[];
  assignedDeviceNames: string[];
  assignedDeviceIds: string[];
}

export interface DeviceWithDetails extends Device {
  businessName?: string;
  assignedStaffName?: string;
  assignedStaffId?: string;
  storeName?: string;
  storeId?: string;
  boothName?: string;
  boothId?: string;
  lastActivity?: string;
}
