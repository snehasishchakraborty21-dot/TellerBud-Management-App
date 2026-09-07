import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthenticatedUser, UserRole, AuthContextType } from '../types/auth';
import { DEMO_ACCOUNTS } from '../config/appConfig';

const AUTH_STORAGE_KEY = 'tellerbud_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'super_admin' && parsed?.roleLabel !== 'TellerBud Admin') {
          parsed.roleLabel = 'TellerBud Admin';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved auth session:', e);
    }
    return null;
  });

  const [selectedLoginRole, setSelectedLoginRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist auth session:', e);
    }
  }, [currentUser]);

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
