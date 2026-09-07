import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TellerBudLogo } from '../shared/TellerBudLogo';

interface AccessDeniedPageProps {
  customMessage?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  customMessage = 'This account does not have access to the selected portal.',
}) => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleBackToLogin = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleGoToDashboard = () => {
    if (currentUser?.role === 'super_admin') {
      navigate('/super-admin/dashboard', { replace: true });
    } else if (currentUser?.role === 'business_owner') {
      navigate('/business-owner/dashboard', { replace: true });
    } else {
      handleBackToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 select-none">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <TellerBudLogo size="md" showAdminBadge={false} />
        </div>

        {/* Access Denied Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-[#102025] tracking-tight mb-2">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {customMessage}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full py-2.5 px-4 bg-[#0D93AA] hover:bg-[#0b8296] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Go to My {currentUser.role === 'super_admin' ? 'TellerBud Admin' : 'Business Owner'} Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400">
        TellerBud Zambia Operations • Lusaka (CAT)
      </div>
    </div>
  );
};
