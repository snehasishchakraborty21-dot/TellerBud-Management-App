import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthenticatedUser, UserRole, AuthContextType } from '../types/auth';
import { DEMO_ACCOUNTS } from '../config/appConfig';
import { businessService } from '../services/businessService';
import { organizationService } from '../services/organizationService';

const AUTH_STORAGE_KEY = 'tellerbud_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [selectedLoginRole, setSelectedLoginRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize and check persisted session on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'super_admin' && parsed?.roleLabel !== 'TellerBud Admin') {
          parsed.roleLabel = 'TellerBud Admin';
        }
        setCurrentUser(parsed);
      }
    } catch (e) {
      console.error('Failed to parse saved auth session:', e);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // Sync to sessionStorage
  useEffect(() => {
    if (isCheckingAuth) return; // Wait until initial check finishes
    try {
      if (currentUser) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist auth session:', e);
    }
  }, [currentUser, isCheckingAuth]);

  const login = async (
    email: string,
    password: string,
    portalRole: UserRole
  ): Promise<{ success: boolean; error?: string; roleMismatch?: boolean }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Smooth transition

    try {
      const normalizedEmail = email.trim().toLowerCase();
      let authenticatedAccount: AuthenticatedUser | null = null;

      // Check approved test login accounts
      const isSuperAdminTest =
        (normalizedEmail === 'test@gmail.com' && password === '12345') ||
        (normalizedEmail === 'sililo.lubinda@tellerbud.co.zm' && (password === '12345' || password === 'password123'));

      const isBusinessOwnerTest =
        (normalizedEmail === 'test1@gmail.com' && password === '12345') ||
        (normalizedEmail === 'chileshe.mwamba@lusakaagency.zm' && (password === '12345' || password === 'password123'));

      const isBusinessAdminTest =
        (normalizedEmail === 'test2@gmail.com' && password === '12345') ||
        (normalizedEmail === 'mwape.banda@lusakaagency.zm' && (password === '12345' || password === 'password123'));

      if (isSuperAdminTest) {
        if (portalRole !== 'super_admin') {
          setIsLoading(false);
          return {
            success: false,
            error: 'Invalid email, password, or selected portal.',
          };
        }
        authenticatedAccount = {
          uid: DEMO_ACCOUNTS.superAdmin.uid,
          fullName: 'Sililo Lubinda',
          email: 'sililo.lubinda@tellerbud.co.zm',
          role: 'super_admin',
          roleLabel: 'TellerBud Admin',
          initials: 'SL',
          accountStatus: 'Active',
        };
      } else if (isBusinessOwnerTest) {
        if (portalRole !== 'business_owner') {
          setIsLoading(false);
          return {
            success: false,
            error: 'Invalid email, password, or selected portal.',
          };
        }
        authenticatedAccount = {
          uid: DEMO_ACCOUNTS.businessOwner.uid,
          fullName: 'Chileshe Mwamba',
          email: 'chileshe.mwamba@lusakaagency.zm',
          role: 'business_owner',
          roleLabel: 'Business Owner',
          businessId: 'BIZ-LUS-001',
          businessName: 'Lusaka Central Express Agency',
          initials: 'CM',
          accountStatus: 'Active',
        };
      } else if (isBusinessAdminTest) {
        if (portalRole !== 'business_owner') {
          setIsLoading(false);
          return {
            success: false,
            error: 'Invalid email, password, or selected portal.',
          };
        }
        authenticatedAccount = {
          uid: DEMO_ACCOUNTS.businessAdmin.uid,
          fullName: 'Mwape Banda',
          email: 'mwape.banda@lusakaagency.zm',
          role: 'business_admin',
          roleLabel: 'Business Admin',
          businessId: 'BIZ-LUS-001',
          businessName: 'Lusaka Central Express Agency',
          initials: 'MB',
          accountStatus: 'Active',
        };
      } else if (portalRole === 'business_owner') {
        // Check dynamically registered business owners
        const registeredOwners = businessService.getRegisteredOwnerCredentials();
        const found = registeredOwners.find(
          (o) =>
            o.username.toLowerCase() === normalizedEmail ||
            o.email.toLowerCase() === normalizedEmail
        );

        if (found) {
          // Check simulated hash matching or default password
          let hash = 0;
          for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
          }
          const computedHash = `$2b$12$secure.${Math.abs(hash).toString(16).padStart(8, '0')}.tellerbud`;

          if (computedHash === found.passwordHash || password === '12345' || password === 'password123') {
            const initials = found.ownerFullName
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() || '')
              .join('') || 'BO';

            authenticatedAccount = {
              uid: found.ownerId,
              fullName: found.ownerFullName,
              email: found.email,
              role: 'business_owner',
              roleLabel: 'Business Owner',
              businessId: found.businessId,
              businessName: found.businessName,
              initials,
              accountStatus: found.status,
            };
          } else {
            setIsLoading(false);
            return {
              success: false,
              error: 'Invalid email, password, or selected portal.',
            };
          }
        } else {
          // Check organizationService users
          const orgUsers = organizationService.getAllUsers();
          const orgUser = orgUsers.find(
            (u) =>
              u.email.toLowerCase() === normalizedEmail ||
              u.username.toLowerCase() === normalizedEmail ||
              `${u.firstName} ${u.lastName}`.toLowerCase() === normalizedEmail
          );

          if (orgUser && (password === '12345' || password === 'password123' || password === 'admin123')) {
            const fullName = `${orgUser.firstName} ${orgUser.lastName}`.trim();
            const initials = `${orgUser.firstName[0] || ''}${orgUser.lastName[0] || ''}`.toUpperCase() || 'OU';

            authenticatedAccount = {
              uid: orgUser.id,
              fullName,
              email: orgUser.email,
              role: orgUser.role as UserRole,
              roleLabel: orgUser.role === 'business_owner' ? 'Business Owner' : 'Business Admin',
              businessId: orgUser.businessId,
              businessName: 'Lusaka Central Express Agency',
              initials,
              accountStatus: orgUser.status === 'Active' ? 'Active' : 'Suspended',
            };
          } else {
            setIsLoading(false);
            return {
              success: false,
              error: 'Invalid email, password, or selected portal.',
            };
          }
        }
      } else {
        setIsLoading(false);
        return {
          success: false,
          error: 'Invalid email, password, or selected portal.',
        };
      }

      setCurrentUser(authenticatedAccount);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return { success: false, error: 'Invalid email, password, or selected portal.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedLoginRole(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        selectedLoginRole,
        setSelectedLoginRole,
        login,
        logout,
        isLoading,
        isCheckingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
