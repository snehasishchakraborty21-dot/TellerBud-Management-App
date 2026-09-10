import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { LoadingState } from '../common/LoadingState';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { currentUser, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return <LoadingState message="Verifying authentication..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to user's assigned dashboard
    const fallbackPath =
      currentUser.role === 'business_owner'
        ? '/business-owner/dashboard'
        : '/super-admin/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : null;
};
