import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLoginRole, setSelectedLoginRole, login, isLoading } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear role on initial mount to ensure neither role is pre-selected
  useEffect(() => {
    setSelectedLoginRole(null);
    setEmail('');
    setPassword('');
    setErrorMessage(null);
  }, [setSelectedLoginRole]);

  // Validation for email or business owner username
  const isInputValid = (val: string): boolean => {
    if (selectedLoginRole === 'business_owner') {
      return val.trim().length >= 3;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const isFormValid =
    selectedLoginRole !== null &&
    isInputValid(email) &&
    password.trim().length > 0;

  const handleRoleSelect = (role: UserRole) => {
    if (selectedLoginRole !== role) {
      setEmail('');
      setPassword('');
      setErrorMessage(null);
    }
    setSelectedLoginRole(role);
  };

  const handleChangePortal = () => {
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setSelectedLoginRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !selectedLoginRole || isLoading) return;

    setErrorMessage(null);

    const result = await login(email, password, selectedLoginRole);

    if (result.success) {
      if (selectedLoginRole === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        navigate('/business-owner/dashboard', { replace: true });
      }
    } else {
      setErrorMessage('Invalid email, password, or selected portal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 select-none">
      {/* Centered Split Authentication Container */}
      <div className="w-full max-w-[1120px] min-h-[580px] md:h-[640px] bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col md:flex-row">
        
        {/* ================================================== */}
        {/* 1. LEFT BRAND PANEL (Approximately 42%)           */}
        {/* ================================================== */}
        <div className="relative w-full md:w-[42%] bg-gradient-to-br from-[#06303B] via-[#094E5D] to-[#0D93AA] p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-center overflow-hidden">
          
          {/* Restrained CSS-Only Decorative Elements (Curves, Rings, Watermark) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Concentric subtle line rings */}
            <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-cyan-300/10" />
            <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full border border-cyan-300/10" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full border border-white/5" />
            <div className="absolute left-10 -bottom-10 w-60 h-60 rounded-full border border-white/5" />
            
            {/* Subtle glow circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />
            
            {/* Oversized low-opacity TellerBud Logo Watermark */}
            <div className="absolute -right-10 bottom-4 w-72 h-72 opacity-[0.06] transform rotate-12">
              <img
                src="assets/branding/tellerbud-admin-logo.png"
                alt=""
                className="w-full h-full object-contain"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Branding Group */}
          <div className="relative z-10 flex flex-col items-start">
            {/* Large Standalone TellerBud Logo: approx 96px x 96px directly on Oceanic Blue panel */}
            <div className="w-[96px] h-[96px] flex items-center justify-center overflow-hidden mb-5">
              <img
                src="assets/branding/tellerbud-admin-logo.png"
                alt="TellerBud"
                className="w-full h-full object-contain object-center scale-[1.18] select-none"
                loading="eager"
              />
            </div>

            {/* Brand Title and Application Subtitle */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              TellerBud
            </h2>
            <p className="text-xs sm:text-sm font-bold text-cyan-200 uppercase tracking-[0.16em] sm:tracking-[0.2em] mt-2 whitespace-nowrap">
              MANAGEMENT WEB APPLICATION
            </p>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. RIGHT ROLE-SELECTION & LOGIN PANEL (Approx 58%) */}
        {/* ================================================== */}
        <div className="w-full md:w-[58%] bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            
            {/* Header: Select Portal */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#102025] tracking-tight">
                Select Portal
              </h1>
            </div>

            {/* Two Equal-Width Role Tiles (Vertical Compact) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* TellerBud Admin Tile */}
              <button
                type="button"
                onClick={() => handleRoleSelect('super_admin')}
                aria-pressed={selectedLoginRole === 'super_admin'}
                className={`group relative w-full h-[118px] p-4 sm:p-[18px] rounded-[12px] flex flex-col items-center justify-center text-center transition-all duration-150 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-2 ${
                  selectedLoginRole === 'super_admin'
                    ? 'bg-[#EBF7F9] border-2 border-[#0D93AA] shadow-sm'
                    : 'bg-[#F9FAFB] border border-gray-200 hover:border-[#0D93AA] hover:bg-[#F0F9FB] shadow-xs hover:shadow-md hover:-translate-y-[2px]'
                }`}
              >
                {/* Selected Checkmark Indicator in Upper Right */}
                {selectedLoginRole === 'super_admin' && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#0D93AA] fill-white" />
                  </div>
                )}

                {/* Role Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mb-2 sm:mb-2.5 transition-colors duration-150 ${
                    selectedLoginRole === 'super_admin'
                      ? 'bg-[#0D93AA] border border-[#0D93AA] text-white shadow-xs'
                      : 'bg-cyan-50 border border-cyan-100/70 text-[#0D93AA]'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>

                {/* Role Label */}
                <span
                  className={`font-bold text-sm sm:text-base tracking-tight whitespace-nowrap transition-colors duration-150 ${
                    selectedLoginRole === 'super_admin' ? 'text-[#06303B]' : 'text-gray-900'
                  }`}
                >
                  TellerBud Admin
                </span>
              </button>

              {/* Business Owner Tile */}
              <button
                type="button"
                onClick={() => handleRoleSelect('business_owner')}
                aria-pressed={selectedLoginRole === 'business_owner'}
                className={`group relative w-full h-[118px] p-4 sm:p-[18px] rounded-[12px] flex flex-col items-center justify-center text-center transition-all duration-150 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-2 ${
                  selectedLoginRole === 'business_owner'
                    ? 'bg-[#EBF7F9] border-2 border-[#0D93AA] shadow-sm'
                    : 'bg-[#F9FAFB] border border-gray-200 hover:border-[#0D93AA] hover:bg-[#F0F9FB] shadow-xs hover:shadow-md hover:-translate-y-[2px]'
                }`}
              >
                {/* Selected Checkmark Indicator in Upper Right */}
                {selectedLoginRole === 'business_owner' && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#0D93AA] fill-white" />
                  </div>
                )}

                {/* Role Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mb-2 sm:mb-2.5 transition-colors duration-150 ${
                    selectedLoginRole === 'business_owner'
                      ? 'bg-[#0D93AA] border border-[#0D93AA] text-white shadow-xs'
                      : 'bg-cyan-50 border border-cyan-100/70 text-[#0D93AA]'
                  }`}
                >
                  <Building2 className="w-6 h-6" />
                </div>

                {/* Role Label */}
                <span
                  className={`font-bold text-sm sm:text-base tracking-tight whitespace-nowrap transition-colors duration-150 ${
                    selectedLoginRole === 'business_owner' ? 'text-[#06303B]' : 'text-gray-900'
                  }`}
                >
                  Business Owner
                </span>
              </button>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs font-medium text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form (Revealed when a role is selected) */}
            {selectedLoginRole && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username or Email Address Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                  >
                    {selectedLoginRole === 'business_owner' ? 'Username or Email Address' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="login-email"
                      type={selectedLoginRole === 'business_owner' ? 'text' : 'email'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedLoginRole === 'business_owner' ? 'Username or email' : 'name@domain.com'}
                      required
                      autoComplete={selectedLoginRole === 'business_owner' ? 'username' : 'email'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0D93AA] focus:ring-[#0D93AA]/30 border-gray-300"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordModal(true)}
                    className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Sign In & Change Portal Actions */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full py-3 px-4 bg-[#0D93AA] hover:bg-[#0b8296] active:bg-[#096e80] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>

                  {/* Change Portal Action */}
                  <button
                    type="button"
                    onClick={handleChangePortal}
                    className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Change Portal</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0D93AA] flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#102025] mb-1">
              Reset Password
            </h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Password reset links are managed via TellerBud Identity Security. Contact the system administrator or your registered security channel.
            </p>
            <button
              type="button"
              onClick={() => setForgotPasswordModal(false)}
              className="w-full py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-xl hover:bg-[#0b8296] transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
