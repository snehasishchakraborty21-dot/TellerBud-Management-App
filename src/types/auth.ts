export type UserRole = 'super_admin' | 'business_owner';

export interface AuthenticatedUser {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  businessId?: string;
  businessName?: string;
  initials: string;
  accountStatus: 'Active' | 'Suspended' | 'Pending';
}

export interface AuthContextType {
  currentUser: AuthenticatedUser | null;
  selectedLoginRole: UserRole | null;
  setSelectedLoginRole: (role: UserRole | null) => void;
  login: (
    email: string,
    password: string,
    portalRole: UserRole
  ) => Promise<{ success: boolean; error?: string; roleMismatch?: boolean }>;
  logout: () => void;
  isLoading: boolean;
}
